export const pages = [
  {
    key: "practice",
    label: "Practice",
  },
  {
    key: "history",
    label: "Your History",
  },
  {
    key: "how-it-works",
    label: "How it Works",
  },
];

export type PageKey = (typeof pages)[number]["key"];
