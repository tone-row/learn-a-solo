import { create } from "zustand";

export const useScrubber = create<{
  startPoint: number;
  endPoint: number;
}>(() => ({
  startPoint: 0,
  endPoint: 100,
}));

export function setStartPoint(value: number) {
  useScrubber.setState({ startPoint: value });
}

export function setEndPoint(value: number) {
  useScrubber.setState({ endPoint: value });
}

export function resetScrubber() {
  useScrubber.setState({ startPoint: 0, endPoint: 100 });
}
