import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PlayCircle, PauseCircle, FastForward, Rewind } from "lucide-react";
import { useYoutubePlayer } from "@/hooks/useYoutubePlayer";
import { throttle } from "lodash";
import { useHistoryStore } from "@/hooks/useHistoryStore";
import { setEndPoint, setStartPoint, useScrubber } from "@/hooks/useScrubber";

export function YouTubeLooper({
  v,
  start,
  end,
}: {
  v: string | null;
  start: string | null;
  end: string | null;
}) {
  console.log("YouTubeLooper", v, start, end);
  const [inputVideoId, setInputVideoId] = useState(v ?? "");
  const [step, setStep] = useState(0);
  const startPoint = useScrubber((state) => state.startPoint);
  const endPoint = useScrubber((state) => state.endPoint);
  const [speed, setSpeed] = useState(1);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  const {
    loadVideo,
    seekTo,
    setPlaybackRate,
    playVideo,
    pauseVideo,
    getDuration,
    isPlaying,
    getTitle,
    destroyPlayer,
    isReady,
    previewPosition,
  } = useYoutubePlayer();

  const addHistory = useHistoryStore((state) => state.addHistory);

  // Create throttled speed update function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledSpeedUpdate = useCallback(
    throttle(
      (increase: boolean) => {
        setSpeed((prevSpeed) => {
          const newSpeed = increase
            ? Math.min(prevSpeed + 0.025, 5)
            : Math.max(prevSpeed - 0.025, 0.25);
          setPlaybackRate(newSpeed);
          return newSpeed;
        });
      },
      50,
      { leading: true },
    ),
    [setPlaybackRate],
  );

  // Combined keyboard controls effect
  useEffect(() => {
    if (step !== 2) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
          e.preventDefault();
          throttledSpeedUpdate(e.key === "ArrowUp");
          break;
        case "r":
          const duration = getDuration();
          const startTime = (startPoint / 100) * duration;
          seekTo(startTime);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      throttledSpeedUpdate.cancel();
    };
  }, [step, throttledSpeedUpdate, startPoint, getDuration, seekTo]);

  // Add loop checking effect, this is how we actually force it to loop is by checking over and over and over
  // useEffect(() => {
  //   if (step !== 3 || !isPlaying()) {
  //     if (loopIntervalRef.current) {
  //       clearInterval(loopIntervalRef.current);
  //       loopIntervalRef.current = null;
  //     }
  //     return;
  //   }

  //   loopIntervalRef.current = setInterval(() => {
  //     const currentTime = getCurrentTime();
  //     const duration = getDuration();
  //     const startTime = (startPoint / 100) * duration;
  //     const endTime = (endPoint / 100) * duration;

  //     if (currentTime >= endTime) {
  //       seekTo(startTime);
  //     }
  //   }, 100);

  //   return () => {
  //     if (loopIntervalRef.current) {
  //       clearInterval(loopIntervalRef.current);
  //     }
  //   };
  // }, [
  //   step,
  //   isPlaying,
  //   startPoint,
  //   endPoint,
  //   getCurrentTime,
  //   getDuration,
  //   seekTo,
  // ]);

  // Add this effect alongside the other keyboard effects
  useEffect(() => {
    if (step !== 3) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "r") return;

      const duration = getDuration();
      const startTime = (startPoint / 100) * duration;
      seekTo(startTime);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, startPoint, getDuration, seekTo]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledPreviewPosition = useCallback(
    throttle(previewPosition, 100, { trailing: true, leading: true }),
    [previewPosition],
  );

  const handleRangeChange = useCallback(
    (values: number[]) => {
      const state = useScrubber.getState();
      if (values[0] !== state.startPoint) {
        console.log("setting start point", values[0]);
        setStartPoint(values[0]);
        throttledPreviewPosition(values[0], false);
      }
      if (values[1] !== state.endPoint) {
        console.log("setting end point", values[1]);
        setEndPoint(values[1]);
        throttledPreviewPosition(values[1], true);
      }
    },
    [throttledPreviewPosition],
  );

  // const handleThumbDragStart = useCallback(
  //   (index: number) => {
  //     // index 0 is start point, index 1 is end point
  //     const isEndPoint = index === 1;
  //     const value = isEndPoint ? endPoint : startPoint;
  //     previewPosition(value, isEndPoint);
  //   },
  //   [previewPosition, startPoint, endPoint],
  // );

  const togglePlay = useCallback(() => {
    if (isPlaying()) {
      pauseVideo();
    } else {
      playVideo();
    }
  }, [isPlaying, pauseVideo, playVideo]);

  const handleContinue = useCallback(() => {
    if (step === 1) {
      // Add to history when moving from step 1 to 2
      addHistory({
        name: getTitle() || "Untitled",
        videoId: currentVideoId || "",
        startPoint,
        endPoint,
      });
    }
    setStep((prev) => prev + 1);
  }, [step, addHistory, getTitle, currentVideoId, startPoint, endPoint]);

  const handleReset = useCallback(() => {
    if (isPlaying()) {
      pauseVideo();
    }
    destroyPlayer();
    setInputVideoId("");
    setCurrentVideoId(null);
    setStep(0);
    setStartPoint(0);
    setEndPoint(100);
    setSpeed(1);
  }, [pauseVideo, isPlaying, destroyPlayer]);

  // Add URL parameter handling effect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get("v");
    const start = params.get("start");
    const end = params.get("end");

    if (videoId && start && end) {
      // Reset any existing state
      if (isPlaying()) {
        pauseVideo();
      }
      destroyPlayer();

      // Set up new state
      setInputVideoId(videoId);
      setCurrentVideoId(videoId);
      setStartPoint(Number(start));
      setEndPoint(Number(end));
      setSpeed(1);
      setStep(2);

      // Load the video
      loadVideo(videoId);

      // Wait for player to be fully ready
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds maximum wait

      const checkPlayerReady = setInterval(() => {
        attempts++;
        if (isReady()) {
          const duration = getDuration();
          if (duration > 0) {
            const startTime = (Number(start) / 100) * duration;
            seekTo(startTime);
            setPlaybackRate(1);
            playVideo();
            clearInterval(checkPlayerReady);
            window.history.replaceState({}, "", "/");
          }
        }

        // Give up after max attempts
        if (attempts >= maxAttempts) {
          console.warn("Player failed to initialize after 5 seconds");
          clearInterval(checkPlayerReady);
        }
      }, 100);

      return () => clearInterval(checkPlayerReady);
    }
  }, [
    destroyPlayer,
    loadVideo,
    setCurrentVideoId,
    setSpeed,
    setStep,
    isPlaying,
    pauseVideo,
    isReady,
    getDuration,
    seekTo,
    setPlaybackRate,
    playVideo,
  ]); // Empty dependency array as this should only run once on mount

  // Add initialization effect for when video loads
  useEffect(() => {
    if (step === 2 && currentVideoId) {
      const duration = getDuration();
      if (duration > 0) {
        // Set initial position and speed
        const startTime = (startPoint / 100) * duration;
        seekTo(startTime);
        setPlaybackRate(1);
        playVideo();
      }
    }
  }, [
    step,
    currentVideoId,
    getDuration,
    startPoint,
    seekTo,
    setPlaybackRate,
    playVideo,
  ]);

  // If we have an initial video id, load it
  useEffect(() => {
    if (v) {
      loadVideo(v);
    }
  }, [v, loadVideo]);

  const handleLoadVideo = () => {
    loadVideo(inputVideoId, () => {
      // Reset points to full duration when video loads
      setStartPoint(0);
      setEndPoint(100);
    });
    setCurrentVideoId(inputVideoId);
    setStep(1);
  };

  return (
    <div className="py-24 grid justify-center content-center gap-2">
      {currentVideoId && getTitle() && (
        <h1 className="text-xl font-semibold text-center">{getTitle()}</h1>
      )}
      <div className="relative aspect-video bg-gray-400 rounded-lg">
        <div id="youtube-player" />
      </div>
      {step === 0 && (
        <form className="grid gap-2 w-full">
          <h2 className="text-lg font-medium">Enter YouTube Video ID</h2>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Enter YouTube Video ID"
            value={inputVideoId}
            onChange={(e) => setInputVideoId(e.target.value)}
          />
          <Button className="w-full" onClick={handleLoadVideo}>
            Load Video
          </Button>
        </form>
      )}

      {currentVideoId && (
        <>
          {step === 1 && (
            <div className="grid gap-4">
              <p className="text-lg font-medium">Set Loop Points</p>
              <Slider
                value={[startPoint, endPoint]}
                onValueChange={handleRangeChange}
                max={100}
                step={0.1}
              />
              <Button onClick={handleContinue}>Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={togglePlay}>
                  {isPlaying() ? (
                    <PauseCircle size={24} />
                  ) : (
                    <PlayCircle size={24} />
                  )}
                </Button>

                <div className="flex items-center space-x-2">
                  <Rewind size={20} />
                  <span className="text-2xl font-bold">
                    {speed.toFixed(3)}x
                  </span>
                  <FastForward size={20} />
                </div>
              </div>

              <div className="grid gap-1 text-sm text-gray-500 text-center">
                <p>Space - Play/Pause</p>
                <p>Up/Down Arrows - Adjust Speed</p>
                <p>R - Restart Loop</p>
              </div>

              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleReset}
                >
                  Reset Player
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
