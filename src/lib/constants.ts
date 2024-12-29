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

export const seo = {
  appName: "Learn a Solo",
  siteTitle: "Learn a Solo: Free Tool to Learn a Guitar Solo",
  siteDescription:
    "Master any guitar solo with our free tool. Slow down videos, loop sections, and learn at your own pace. Perfect for guitarists of all skill levels.",
};
