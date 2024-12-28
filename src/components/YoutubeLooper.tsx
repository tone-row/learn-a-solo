import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PlayCircle, PauseCircle, FastForward, Rewind } from "lucide-react";
import {
  getDuration,
  getTitle,
  isPlaying,
  loadVideo,
  pauseVideo,
  playVideo,
  previewPosition,
  resetPlayerState,
  seekTo,
  setLoopPoints,
  setPlaybackRate,
  useYoutubePlayer,
  useYouTubePlayerStore,
} from "@/hooks/useYoutubePlayer";
import { throttle } from "lodash";
import { useHistoryStore } from "@/hooks/useHistoryStore";
import { setEndPoint, setStartPoint, useScrubber } from "@/hooks/useScrubber";
import { useRouter } from "next/navigation";
import getYoutubeId from "get-youtube-id";
import { Timer } from "./Timer";

type AppState = "no-video" | "no-looppoints" | "from-url" | "ready";

export function YouTubeLooper({
  v,
  start,
  end,
}: {
  v: string | null;
  start: string | null;
  end: string | null;
}) {
  const fromUrl = v && start && end;
  const [inputVideoId, setInputVideoId] = useState("");
  const [step, setStep] = useState<AppState>(fromUrl ? "from-url" : "no-video");
  const startPoint = useScrubber((state) => state.startPoint);
  const endPoint = useScrubber((state) => state.endPoint);
  const [speed, setSpeed] = useState(1);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const isVideoPlaying = useYouTubePlayerStore((state) => state.isPlaying);

  const addHistory = useHistoryStore((state) => state.addHistory);

  // We need the two effects that this hook runs
  useYoutubePlayer();

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
    [],
  );

  // Combined keyboard controls effect
  useEffect(() => {
    if (step !== "ready") return;

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
  }, [startPoint, step, throttledSpeedUpdate]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledPreviewPosition = useCallback(
    throttle(previewPosition, 100, { trailing: true, leading: true }),
    [],
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

  const togglePlay = useCallback(() => {
    if (isPlaying()) {
      pauseVideo();
    } else {
      playVideo();
    }
  }, []);

  const afterSettingLooppoints = useCallback(() => {
    if (step !== "no-looppoints") return;
    const duration = getDuration();
    // Convert percentages to seconds
    const startTime = (startPoint / 100) * duration;
    const endTime = (endPoint / 100) * duration;

    setLoopPoints(startTime, endTime);

    addHistory({
      name: getTitle() || "Untitled",
      videoId: currentVideoId || "",
      startPoint: startTime,
      endPoint: endTime,
    });

    setStep("ready");
  }, [addHistory, currentVideoId, endPoint, startPoint, step]);

  const router = useRouter();

  const handleReset = useCallback(() => {
    if (isPlaying()) {
      pauseVideo();
    }
    resetPlayerState();
    setInputVideoId("");
    setCurrentVideoId(null);
    setStep("no-video");
    setStartPoint(0);
    setEndPoint(100);
    setSpeed(1);
    router.push("/");
  }, [router]);

  const afterLoadFromUrl = useCallback(() => {
    // start and end are already in seconds from the URL
    setLoopPoints(Number(start), Number(end));
    seekTo(Number(start));
    setPlaybackRate(1);
    playVideo();
    setStep("ready");
  }, [start, end]);

  // If we have an initial video id, load it and play it
  const loadedFromUrl = useRef("");
  useEffect(() => {
    if (v && start && end && loadedFromUrl.current !== v) {
      loadedFromUrl.current = v;
      setStartPoint(Number(start));
      setEndPoint(Number(end));
      loadVideo(v);
    }
  }, [v, start, end]);

  const handleLoadVideo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = getYoutubeId(inputVideoId);
    if (!id) return;
    loadVideo(id, () => {
      // Reset points to full duration when video loads
      setStartPoint(0);
      setEndPoint(100);
    });
    setCurrentVideoId(id);
    setStep("no-looppoints");
  };

  return (
    <div className="grid grid-rows-[auto_minmax(0,1fr)]">
      <header className="flex gap-2 p-4 justify-between w-full items-center">
        <h1 className="text-xl font-bold">YouTube Soloist</h1>
        <div className="flex gap-2">
          <span>Looper</span>
          <span>About</span>
          <span>History</span>
        </div>
        <Button variant="outline" onClick={handleReset}>
          Select New Video
        </Button>
      </header>
      <div className="py-12 grid justify-center content-center gap-2">
        {currentVideoId && getTitle() && (
          <h1 className="text-xl font-semibold text-center">{getTitle()}</h1>
        )}
        <div className="relative aspect-video bg-gray-400 rounded-lg">
          <div id="youtube-player" />
        </div>
        {step === "no-video" && (
          <form className="grid gap-2 w-full" onSubmit={handleLoadVideo}>
            <h2 className="text-lg font-medium">
              Copy and paste a YouTube URL
            </h2>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter YouTube Video ID"
              value={inputVideoId}
              onChange={(e) => setInputVideoId(e.target.value)}
            />
            <Button className="w-full" type="submit">
              Load Video
            </Button>
          </form>
        )}

        {step === "no-looppoints" && (
          <div className="grid gap-4">
            <p className="text-lg font-medium">Set Loop Points</p>
            <Slider
              value={[startPoint, endPoint]}
              onValueChange={handleRangeChange}
              max={100}
              step={0.1}
            />
            <Button onClick={afterSettingLooppoints}>Continue</Button>
          </div>
        )}

        {step === "ready" && (
          <div className="grid gap-4" key={currentVideoId}>
            <div className="flex items-center justify-between">
              <button
                className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200"
                onClick={togglePlay}
              >
                {isVideoPlaying ? (
                  <PauseCircle size={24} />
                ) : (
                  <PlayCircle size={24} />
                )}
              </button>

              <div className="flex items-center space-x-2">
                <Rewind size={20} />
                <span className="text-2xl font-bold">{speed.toFixed(3)}x</span>
                <FastForward size={20} />
              </div>
            </div>

            <div className="grid gap-1 text-sm text-gray-500 text-center">
              <p>Space - Play/Pause</p>
              <p>Up/Down Arrows - Adjust Speed</p>
              <p>R - Restart Loop</p>
            </div>
            <Timer />
          </div>
        )}

        {step === "from-url" && (
          <div className="grid gap-4">
            <Button onClick={afterLoadFromUrl}>Start Looping</Button>
          </div>
        )}
      </div>
    </div>
  );
}
