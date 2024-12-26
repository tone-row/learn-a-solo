import { create } from "zustand";
import { persist } from "zustand/middleware";

type HistoryStore = {
  history: {
    name: string;
    videoId: string;
    startPoint: number;
    endPoint: number;
  }[];
  addHistory: (history: HistoryStore["history"][number]) => void;
};

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (newHistory) => {
        set((state) => {
          const existingIndex = state.history.findIndex(
            (h) => h.videoId === newHistory.videoId,
          );

          if (existingIndex === -1) {
            // Add new history item if video doesn't exist
            return { history: [newHistory, ...state.history] };
          }

          // Remove existing entry and create updated history array
          const updatedHistory = [...state.history];
          updatedHistory.splice(existingIndex, 1);

          return { history: [newHistory, ...updatedHistory] };
        });
      },
    }),
    {
      name: "solotube-history",
    },
  ),
);
