import { useEffect } from "react";
import { create } from "zustand";

interface YouTubePlayerState {
  videoId: string | null;
  player: YT.Player | null;
  duration: number;
  isReady: boolean;
  isPlaying: boolean;
  title: string | null;
  author: string | null;
  videoQuality: string | null;
  videoUrl: string | null;
  previewTimeoutId: number | null;
  onReadyCallback?: () => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: (() => void) | null;
    YT: typeof YT;
  }
}

const initialState: YouTubePlayerState = {
  videoId: null,
  player: null,
  duration: 0,
  isReady: false,
  isPlaying: false,
  title: null,
  author: null,
  videoQuality: null,
  videoUrl: null,
  previewTimeoutId: null,
  onReadyCallback: undefined,
};

export const useYouTubePlayerStore = create<YouTubePlayerState>()(
  () => initialState,
);

export function resetPlayerState() {
  destroyPlayer();
  useYouTubePlayerStore.setState(initialState, true);
}

function initializePlayer(videoId: string) {
  console.log("Initializing player with video:", videoId);
  if (!window.YT) {
    console.log("YT not available yet");
    return;
  }

  const player = new window.YT.Player("youtube-player", {
    height: "360",
    width: "640",
    videoId,
    playerVars: {
      controls: 0,
      disablekb: 1,
      rel: 0,
      modestbranding: 1,
    },
    events: {
      onReady: (event: YT.PlayerEvent) => {
        console.log("Player ready event fired");
        // @ts-expect-error YT types are incomplete
        const videoData = event.target.getVideoData();
        useYouTubePlayerStore.setState({
          duration: event.target.getDuration(),
          isReady: true,
          isPlaying: false,
          title: videoData.title,
          author: videoData.author,
          videoQuality: event.target.getPlaybackQuality(),
          videoUrl: event.target.getVideoUrl(),
        });

        // Call the callback if one is set
        useYouTubePlayerStore.getState().onReadyCallback?.();
      },
      onStateChange: (event: YT.OnStateChangeEvent) => {
        console.log("Player state changed:", event.data);
        useYouTubePlayerStore.setState({
          isPlaying: event.data === YT.PlayerState.PLAYING,
        });
      },
    },
  });

  useYouTubePlayerStore.setState({ player });
}

export function getCurrentTime() {
  return useYouTubePlayerStore.getState().player?.getCurrentTime() || 0;
}

export function loadVideo(videoId: string, onReady?: () => void) {
  const playerStore = useYouTubePlayerStore.getState();
  // Store callback before destroying player
  playerStore.onReadyCallback = () => {
    // Get duration immediately after player is ready
    const duration = playerStore.player?.getDuration() || 0;
    if (duration > 0) {
      onReady?.();
    }
  };

  if (playerStore.player) {
    playerStore.player.destroy();
  }

  // If YT isn't ready yet, wait for it
  if (!window.YT) {
    const checkYT = setInterval(() => {
      if (window.YT) {
        clearInterval(checkYT);
        initializePlayer(videoId);
      }
    }, 100);
    return;
  }

  initializePlayer(videoId);
}

export function isReady() {
  const playerStore = useYouTubePlayerStore.getState();
  // Check both that the player exists AND that onReady has fired
  return (
    playerStore.isReady &&
    playerStore.player !== null &&
    typeof playerStore.player.getDuration === "function"
  );
}

export function getDuration() {
  if (!isReady()) return 0;
  try {
    return useYouTubePlayerStore.getState().player?.getDuration() || 0;
  } catch (e) {
    console.warn("Failed to get duration:", e);
    return 0;
  }
}

export function seekTo(time: number) {
  const ready = isReady();
  console.log("Attempting seekTo:", time, "isReady:", ready);
  if (!ready) return;
  useYouTubePlayerStore.getState().player?.seekTo(time, true);
}

export function setPlaybackRate(rate: number) {
  const ready = isReady();
  console.log("Attempting setPlaybackRate:", rate, "isReady:", ready);
  if (!ready) return;
  useYouTubePlayerStore.getState().player?.setPlaybackRate(rate);
}

export function playVideo() {
  const ready = isReady();
  console.log("Attempting playVideo, isReady:", ready);
  if (!ready) return;
  useYouTubePlayerStore.getState().player?.playVideo();
}

export function pauseVideo() {
  const ready = isReady();
  console.log("Attempting pauseVideo, isReady:", ready);
  if (!ready) return;
  useYouTubePlayerStore.getState().player?.pauseVideo();
}

export function destroyPlayer() {
  const playerStore = useYouTubePlayerStore.getState();
  if (playerStore.player) {
    playerStore.player.destroy();
    useYouTubePlayerStore.setState({ player: null });

    // Recreate the original div
    const container = document.getElementById("youtube-player");
    if (container) {
      container.innerHTML = "";
    }
  }
}

/**
 * Previews a specific position in the video by playing a short 1-second clip
 * Used for previewing timestamps when setting clip start/end points
 * @param timePercent - The position to preview as a percentage (0-100) of total video duration
 * @param isEndPoint - If true, starts playback slightly before the selected point for better context
 */
export function previewPosition(timePercent: number, isEndPoint: boolean) {
  if (!isReady()) return;

  const duration = getDuration();
  const time = (timePercent / 100) * duration;

  const playerStore = useYouTubePlayerStore.getState();

  // Clear any existing preview timeout
  if (playerStore.previewTimeoutId) {
    clearTimeout(playerStore.previewTimeoutId);
  }

  // For end points, start slightly before the selected point
  const previewTime = isEndPoint ? Math.max(time - 1, 0) : time;
  seekTo(previewTime);
  playVideo();

  // Only pause after preview if we're previewing an end point
  // if (isEndPoint) {
  //   playerState.current.previewTimeoutId = window.setTimeout(() => {
  //     pauseVideo();
  //   }, 1000);
  // }
}

export function isPlaying() {
  return useYouTubePlayerStore.getState().isPlaying;
}

export function getTitle() {
  return useYouTubePlayerStore.getState().title;
}

export function useYoutubePlayer() {
  // Load YouTube IFrame API only once
  useEffect(() => {
    if (window.YT) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      useYouTubePlayerStore.setState({ isReady: true });
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  // Add space bar handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const playerStore = useYouTubePlayerStore.getState();
      if (!playerStore.player || e.code !== "Space") return;

      // Prevent page scroll
      e.preventDefault();

      if (playerStore.isPlaying) {
        pauseVideo();
        playerStore.isPlaying = false;
      } else {
        playVideo();
        playerStore.isPlaying = true;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    loadVideo,
    seekTo,
    setPlaybackRate,
    playVideo,
    pauseVideo,
    getDuration,
    getCurrentTime,
    destroyPlayer,
    isReady,
    previewPosition,
  };
}
