import { create } from "zustand";

interface TimingState {
  currentTime: number;
  animationFrameId: number | null;
  setCurrentTime: (time: number) => void;
  startTimeTracking: (getTimeCallback: () => number) => void;
  stopTimeTracking: () => void;
}

export const useTimingStore = create<TimingState>()((set) => ({
  currentTime: 0,
  animationFrameId: null,
  setCurrentTime: (time) => set({ currentTime: time }),
  startTimeTracking: (getTimeCallback) => {
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
