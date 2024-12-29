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
    "Learn a guitar solo easily with our free online tool. Slow down any video, loop sections, and master solos at your own pace. Perfect for beginners and advanced players looking to learn to guitar solo step-by-step.",
};
