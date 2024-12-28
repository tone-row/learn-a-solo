import { create } from "zustand";
import { seekTo, useYouTubePlayerStore } from "./useYoutubePlayer";

interface TimingState {
  currentTime: number;
  animationFrameId: number | null;
  setCurrentTime: (time: number) => void;
  startTimeTracking: (getTimeCallback: () => number) => void;
  stopTimeTracking: () => void;
}

/**
 * This store is used to track the current time of the video,
 * but because it's high-frequency it's also responsible for
 * looping the video.
 */
export const useTimingStore = create<TimingState>()((set) => ({
  currentTime: 0,
  animationFrameId: null,
  setCurrentTime: (time) => set({ currentTime: time }),
  startTimeTracking: (getTimeCallback) => {
    const loopPoints = useYouTubePlayerStore.getState().loopPoints;

    // Clear any existing animation frame
    const state = useTimingStore.getState();
    if (state.animationFrameId) {
      cancelAnimationFrame(state.animationFrameId);
    }

    // Start new animation frame loop
    const updateTime = () => {
      const currentTime = getTimeCallback();
      set({ currentTime });
      const frameId = requestAnimationFrame(updateTime);
      set({ animationFrameId: frameId });

      // Check if we're at the end of the loop, and seek to the start if needed
      if (loopPoints && currentTime >= loopPoints.endPoint) {
        seekTo(loopPoints.startPoint);
      }
    };

    updateTime();
  },
  stopTimeTracking: () => {
    const state = useTimingStore.getState();
    if (state.animationFrameId) {
      cancelAnimationFrame(state.animationFrameId);
      set({ animationFrameId: null });
    }
  },
}));
