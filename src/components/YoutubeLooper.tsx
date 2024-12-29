import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Undo2, Pause, Play, Gauge } from "lucide-react";
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
          const loopPoints = useYouTubePlayerStore.getState().loopPoints;
          if (loopPoints) {
            seekTo(loopPoints.startPoint);
          }
          break;
        case "0":
          setSpeed(1);
          setPlaybackRate(1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      throttledSpeedUpdate.cancel();
    };
  }, [startPoint, step, throttledSpeedUpdate]);

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
    <div className="grid p-6 max-w-[1460px] mx-auto md:p-10">
      <div className="flex justify-between items-start">
        <p className="text-balance text-lg max-w-lg">
          Use <strong>Learn a Solo</strong> to practice any solo you find on
          youtube with easy looping and speed controls.
        </p>
        <Button onClick={handleReset}>
          <Undo2 size={20} />
          Enter a Video URL
        </Button>
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
          "relative bg-gray-400 rounded-lg my-12 mx-auto pointer-events-none",
          {
            "aspect-video max-w-[640px]": step !== "no-video",
          },
        )}
      >
        <div id="youtube-player" />
      </div>

      {step === "ready" && (
        <ReadyToLoop speed={speed} isVideoPlaying={isVideoPlaying} />
      )}

      {step === "from-url" && <FromURL afterLoadFromUrl={afterLoadFromUrl} />}
    </div>
  );
}

function BigInstruction({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl text-balance text-center leading-tight">
      {children}
    </h2>
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
}: {
  speed: number;
  isVideoPlaying: boolean;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4 max-w-xl w-full mx-auto">
        <div className="flex items-center space-x-2">
          <Gauge size={20} />
          <span className="text-2xl font-bold tabular-nums">
            {(speed * 100).toFixed(1).padStart(5, "0")}
          </span>
        </div>
        <Timer />
      </div>

      <div className="grid gap-1 justify-center">
        <h4 className="uppercase opacity-50">Keyboard Shortcuts</h4>
        <div className="flex gap-2 flex-wrap items-center justify-center">
          <BigButton icon={<KeyboardKey>Space</KeyboardKey>}>
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
          <BigButton icon={<KeyboardKey>↑/↓</KeyboardKey>}>
            Adjust Speed
          </BigButton>
          <BigButton icon={<KeyboardKey>0</KeyboardKey>}>Reset Speed</BigButton>
          <BigButton icon={<KeyboardKey>R</KeyboardKey>}>
            Restart Loop
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
    <form
      className="grid gap-6 w-full max-w-xl mx-auto mt-12"
      onSubmit={handleLoadVideo}
    >
      <BigInstruction>Paste a video URL in the box below</BigInstruction>
      <Input
        type="text"
        placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        value={inputVideoId}
        onChange={(e) => setInputVideoId(e.target.value)}
        className="w-full bg-neutral-100 border-2 border-dashed border-black p-4"
      />
      <Button className="w-full" type="submit">
        Load Video
      </Button>
    </form>
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
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button className="border-2 border-black rounded-xl flex items-center p-4 text-2xl font-semibold text-black gap-2">
      {icon}
      {children}
    </button>
  );
}

function KeyboardKey({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded-md bg-neutral-100 px-2 py-1">{children}</kbd>;
}
