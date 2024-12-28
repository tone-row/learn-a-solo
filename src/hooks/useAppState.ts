import { create } from "zustand";

type AppState = "no-video" | "no-looppoints" | "from-url" | "ready";

export const useAppState = create<{
  state: AppState;
  setState: (state: AppState) => void;
}>((set) => ({
  state: "no-video",
  setState: (state) => set({ state }),
}));
