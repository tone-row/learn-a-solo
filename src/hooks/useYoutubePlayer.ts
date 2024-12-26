import { useEffect } from "react";

import { useCallback } from "react";

import { useRef } from "react";

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

export function useYoutubePlayer() {
  const playerState = useRef<YouTubePlayerState>({
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
  });

  const initializePlayer = useCallback((videoId: string) => {
    console.log("Initializing player with video:", videoId);
    if (!window.YT) {
      console.log("YT not available yet");
      return;
    }

    playerState.current.videoId = videoId;
    playerState.current.player = new window.YT.Player("youtube-player", {
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
          playerState.current.duration = event.target.getDuration();
          playerState.current.isReady = true;
          playerState.current.isPlaying = false;
          playerState.current.title = videoData.title;
          playerState.current.author = videoData.author;
          playerState.current.videoQuality = event.target.getPlaybackQuality();
          playerState.current.videoUrl = event.target.getVideoUrl();

          // Call the callback if one is set
          playerState.current.onReadyCallback?.();
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          console.log("Player state changed:", event.data);
          playerState.current.isPlaying = event.data === YT.PlayerState.PLAYING;
        },
      },
    });
  }, []);

  const loadVideo = useCallback(
    (videoId: string, onReady?: () => void) => {
      // Store callback before destroying player
      playerState.current.onReadyCallback = () => {
        // Get duration immediately after player is ready
        const duration = playerState.current.player?.getDuration() || 0;
        if (duration > 0) {
          onReady?.();
        }
      };

      if (playerState.current.player) {
        playerState.current.player.destroy();
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
    },
    [initializePlayer],
  );

  // Load YouTube IFrame API only once
  useEffect(() => {
    if (window.YT) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerState.current.isReady = true;
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  const getCurrentTime = useCallback(() => {
    return playerState.current.player?.getCurrentTime() || 0;
  }, []);

  const isReady = useCallback(() => {
    // Check both that the player exists AND that onReady has fired
    return (
      playerState.current.isReady &&
      playerState.current.player !== null &&
      typeof playerState.current.player.getDuration === "function"
    );
  }, []);

  const getDuration = useCallback(() => {
    if (!isReady()) return 0;
    try {
      return playerState.current.player?.getDuration() || 0;
    } catch (e) {
      console.warn("Failed to get duration:", e);
      return 0;
    }
  }, [isReady]);

  const seekTo = useCallback(
    (time: number) => {
      console.log("Attempting seekTo:", time, "isReady:", isReady());
      if (!isReady()) return;
      playerState.current.player?.seekTo(time, true);
    },
    [isReady],
  );

  const setPlaybackRate = useCallback(
    (rate: number) => {
      if (!isReady()) return;
      playerState.current.player?.setPlaybackRate(rate);
    },
    [isReady],
  );

  const playVideo = useCallback(() => {
    console.log("Attempting playVideo, isReady:", isReady());
    if (!isReady()) return;
    playerState.current.player?.playVideo();
  }, [isReady]);

  const pauseVideo = useCallback(() => {
    playerState.current.player?.pauseVideo();
  }, []);

  // Add space bar handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playerState.current.player || e.code !== "Space") return;

      // Prevent page scroll
      e.preventDefault();

      if (playerState.current.isPlaying) {
        pauseVideo();
        playerState.current.isPlaying = false;
      } else {
        playVideo();
        playerState.current.isPlaying = true;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pauseVideo, playVideo]);

  const destroyPlayer = useCallback(() => {
    if (playerState.current.player) {
      playerState.current.player.destroy();
      playerState.current.player = null;

      // Recreate the original div
      const container = document.getElementById("youtube-player");
      if (container) {
        container.innerHTML = "";
      }
    }
  }, []);

  const previewPosition = useCallback(
    (timePercent: number, isEndPoint: boolean) => {
      if (!isReady()) return;

      const duration = getDuration();
      const time = (timePercent / 100) * duration;

      // Clear any existing preview timeout
      if (playerState.current.previewTimeoutId) {
        clearTimeout(playerState.current.previewTimeoutId);
      }

      // For end points, start slightly before the selected point
      const previewTime = isEndPoint ? Math.max(time - 1, 0) : time;
      seekTo(previewTime);
      playVideo();

      // Pause after a short preview
      playerState.current.previewTimeoutId = window.setTimeout(() => {
        pauseVideo();
      }, 1000);
    },
    [isReady, getDuration, seekTo, playVideo, pauseVideo],
  );

  return {
    loadVideo,
    player: playerState.current.player,
    seekTo,
    setPlaybackRate,
    playVideo,
    pauseVideo,
    getDuration,
    getCurrentTime,
    isPlaying: () => playerState.current.isPlaying,
    getTitle: () => playerState.current.title,
    getAuthor: () => playerState.current.author,
    getQuality: () => playerState.current.videoQuality,
    getVideoUrl: () => playerState.current.videoUrl,
    destroyPlayer,
    isReady,
    previewPosition,
  };
}
