"use client";

import { YouTubeLooper } from "@/components/YoutubeLooper";
import { useState, useEffect } from "react";
import { History } from "@/components/History";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const params = useSearchParams();

  const v = params.get("v");
  const start = params.get("start");
  const end = params.get("end");

  console.log(v, start, end);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <main>
      <YouTubeLooper v={v} start={start} end={end} />
      <History />
    </main>
  );
}
