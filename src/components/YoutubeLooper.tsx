import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Undo2, Pause, Play, Gauge, Share2 } from "lucide-react";
import Image from "next/image";
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
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import Link from "next/link";

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
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);

  const addHistory = useHistoryStore((state) => state.addHistory);

  // We need the two effects that this hook runs
  useYoutubePlayer();

  const handlePlayPause = useCallback(() => {
    if (isPlaying()) {
      pauseVideo();
    } else {
      playVideo();
    }
  }, []);

  const handleSpeedChange = useCallback((increase: boolean) => {
    setSpeed((prevSpeed) => {
      const newSpeed = increase
        ? Math.min(prevSpeed + 0.01, 5)
        : Math.max(prevSpeed - 0.01, 0.25);
      setPlaybackRate(newSpeed);
      return newSpeed;
    });
  }, []);

  const handleRestart = useCallback(() => {
    const loopPoints = useYouTubePlayerStore.getState().loopPoints;
    if (loopPoints) {
      seekTo(loopPoints.startPoint);
    }
  }, []);

  const handleResetSpeed = useCallback(() => {
    setSpeed(1);
    setPlaybackRate(1);
  }, []);

  // Combined keyboard controls effect
  useEffect(() => {
    if (step !== "ready") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
          e.preventDefault();
          handleSpeedChange(e.key === "ArrowUp");
          break;
        case "r":
          handleRestart();
          break;
        case "0":
          handleResetSpeed();
          break;
        // case " ":
        //   e.preventDefault();
        //   handlePlayPause();
        //   break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    step,
    handleSpeedChange,
    handleRestart,
    handleResetSpeed,
    handlePlayPause,
  ]);

  const isVideoPlaying = useYouTubePlayerStore((state) => state.isPlaying);

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
    <div
      className={cn("grid p-6 max-w-[1460px] mx-auto md:p-10", {
        "h-full grid-rows-[auto_minmax(0,1fr)_0px] content-start":
          step === "no-video",
      })}
    >
      <div className="grid gap-6 sm:gap-2 sm:flex sm:justify-between sm:items-start">
        <div className="grid gap-2">
          <h2 className="text-balance text-lg max-w-lg">
            Use <strong>Learn a Solo</strong> to practice any solo you find on
            youtube with easy looping and speed controls.
          </h2>
          <div className="flex justify-start gap-6 items-center">
            <Link
              href="https://github.com/tone-row/learn-a-solo"
              className="text-xs opacity-50 hover:opacity-100 transition-opacity duration-300"
            >
              Feedback? <span className="font-mono">tone-row/learn-a-solo</span>
            </Link>
            <Link href="https://buymeacoffee.com/lsm7ph8ty9">
              <Image
                src="/bmc-full-logo-no-background.png"
                alt="Buy Me a Coffee"
                width={120}
                height={26.25}
                className="bg-white rounded-md p-1"
              />
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleReset}
            disabled={step !== "ready"}
            className="disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <Undo2 size={20} />
            Reset Video
          </Button>
          <Button
            onClick={() => {
              const url = new URL(window.location.href);
              const loopPoints = useYouTubePlayerStore.getState().loopPoints;
              if (loopPoints) {
                const id = getYoutubeId(
                  useYouTubePlayerStore.getState().videoUrl ?? "",
                );
                if (!id) return;
                url.searchParams.set("v", id);
                url.searchParams.set("start", loopPoints.startPoint.toString());
                url.searchParams.set("end", loopPoints.endPoint.toString());
                navigator.clipboard.writeText(url.toString()).then(() => {
                  const button = document.getElementById("share-button");
                  if (button) {
                    const icon = button.querySelector("svg");
                    if (icon) {
                      icon.classList.add("text-green-500");
                      setTimeout(() => {
                        icon.classList.remove("text-green-500");
                      }, 2000);
                    }
                  }
                });
              }
            }}
            disabled={step !== "ready"}
            id="share-button"
            className="disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <Share2 size={20} className="transition-colors duration-200" />
            Share Loop
          </Button>
        </div>
      </div>

      {/* {currentVideoId && getTitle() && (
        <h1 className="text-xl font-semibold text-center">{getTitle()}</h1>
      )} */}

      {step === "no-video" && (
        <NoVideo
          handleLoadVideo={handleLoadVideo}
          inputVideoId={inputVideoId}
          setInputVideoId={setInputVideoId}
        />
      )}

      {step === "no-looppoints" && (
        <NoLoopPoints afterSettingLooppoints={afterSettingLooppoints} />
      )}

      <div
        className={cn(
          "relative bg-gray-400 rounded-lg my-12 mx-auto pointer-events-none w-full",
          {
            "aspect-video max-w-[640px]": step !== "no-video",
          },
        )}
      >
        <div id="youtube-player" className="w-full h-full" />
      </div>

      {step === "ready" && (
        <ReadyToLoop
          speed={speed}
          isVideoPlaying={isVideoPlaying}
          onPlayPause={handlePlayPause}
          onSpeedChange={handleSpeedChange}
          onRestart={handleRestart}
          onResetSpeed={handleResetSpeed}
        />
      )}

      {step === "from-url" && <FromURL afterLoadFromUrl={afterLoadFromUrl} />}
    </div>
  );
}

function BigInstruction({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xl sm:text-3xl text-balance text-center leading-tight">
      {children}
    </h3>
  );
}

function NoLoopPoints({
  afterSettingLooppoints,
}: {
  afterSettingLooppoints: () => void;
}) {
  const startPoint = useScrubber((state) => state.startPoint);
  const endPoint = useScrubber((state) => state.endPoint);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledPreviewPosition = useCallback(
    throttle(previewPosition, 100, { trailing: true, leading: true }),
    [],
  );
  const handleRangeChange = useCallback(
    (values: number[]) => {
      const state = useScrubber.getState();
      if (values[0] !== state.startPoint) {
        setStartPoint(values[0]);
        throttledPreviewPosition(values[0], false);
      }
      if (values[1] !== state.endPoint) {
        setEndPoint(values[1]);
        throttledPreviewPosition(values[1], true);
      }
    },
    [throttledPreviewPosition],
  );
  return (
    <div className="grid gap-6 w-full max-w-2xl mx-auto mt-12">
      <BigInstruction>
        Drag the slider to set the start and end points of the loop you want to
        practice. Then click continue.
      </BigInstruction>
      <Slider
        value={[startPoint, endPoint]}
        onValueChange={handleRangeChange}
        max={100}
        step={0.1}
      />
      <Button onClick={afterSettingLooppoints}>Continue</Button>
    </div>
  );
}

function ReadyToLoop({
  speed,
  isVideoPlaying,
  onPlayPause,
  onSpeedChange,
  onRestart,
  onResetSpeed,
}: {
  speed: number;
  isVideoPlaying: boolean;
  onPlayPause: () => void;
  onSpeedChange: (increase: boolean) => void;
  onRestart: () => void;
  onResetSpeed: () => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4 max-w-xl w-full mx-auto bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-900/80 p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Gauge size={20} className="text-neutral-500 dark:text-neutral-400" />
          <span className="text-2xl font-bold tabular-nums tracking-tight bg-gradient-to-br from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            {(speed * 100).toFixed(0).padStart(3, "0")}
            <span className="ml-0.5">%</span>
          </span>
        </div>
        <Timer />
      </div>

      <div className="grid gap-3 justify-center">
        <h4 className="uppercase text-sm font-medium text-neutral-500 dark:text-neutral-400 tracking-wider text-center">
          Keyboard Shortcuts
        </h4>
        <div className="flex gap-2 flex-wrap items-center justify-center">
          <BigButton
            icon={<KeyboardKey>Space</KeyboardKey>}
            onClick={onPlayPause}
          >
            {isVideoPlaying ? (
              <>
                <Pause size={24} />
                Pause
              </>
            ) : (
              <>
                <Play size={24} />
                Play
              </>
            )}
          </BigButton>
          <BigButton icon={<KeyboardKey>R</KeyboardKey>} onClick={onRestart}>
            Restart Loop
          </BigButton>
        </div>
        <div className="flex gap-2 flex-wrap items-center justify-center">
          <BigButton
            icon={<KeyboardKey>↑</KeyboardKey>}
            onClick={() => onSpeedChange(true)}
          >
            Speed Up
          </BigButton>
          <BigButton
            icon={<KeyboardKey>↓</KeyboardKey>}
            onClick={() => onSpeedChange(false)}
          >
            Slow Down
          </BigButton>
          <BigButton icon={<KeyboardKey>0</KeyboardKey>} onClick={onResetSpeed}>
            Reset Speed
          </BigButton>
        </div>
      </div>
    </div>
  );
}

function NoVideo({
  handleLoadVideo,
  inputVideoId,
  setInputVideoId,
}: {
  handleLoadVideo: (e: React.FormEvent<HTMLFormElement>) => void;
  inputVideoId: string;
  setInputVideoId: (value: string) => void;
}) {
  return (
    <div className="grid place-items-center pb-24">
      <form
        className="grid gap-6 w-full max-w-xl mx-auto"
        onSubmit={handleLoadVideo}
      >
        <BigInstruction>Paste a video URL in the box below</BigInstruction>
        <Input
          type="text"
          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          value={inputVideoId}
          onChange={(e) => setInputVideoId(e.target.value)}
          className="w-full bg-neutral-100 dark:bg-neutral-900 border-2 border-dashed border-black dark:border-neutral-600 p-4 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
        />
        <Button className="w-full" type="submit">
          Load Video
        </Button>
      </form>
    </div>
  );
}

function FromURL({ afterLoadFromUrl }: { afterLoadFromUrl: () => void }) {
  return (
    <div className="grid gap-4">
      <Button onClick={afterLoadFromUrl}>Start Looping</Button>
    </div>
  );
}

function BigButton({
  children,
  icon,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="border border-neutral-200 dark:border-neutral-700 rounded-xl flex items-center p-4 text-2xl font-semibold text-neutral-800 dark:text-white gap-2 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      {icon}
      {children}
    </button>
  );
}

function KeyboardKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 px-2.5 py-1.5 text-sm font-mono text-neutral-600 dark:text-neutral-300 shadow-sm ring-1 ring-neutral-200/50 dark:ring-neutral-700/50">
      {children}
    </kbd>
  );
}
