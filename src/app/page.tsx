"use client";

import { YouTubeLooper } from "@/components/YoutubeLooper";
import { useState, useEffect } from "react";
import { History } from "@/components/History";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PageKey, pages } from "@/lib/constants";
import { PageWrapper } from "@/components/PageWrapper";

export default function Home() {
  const params = useSearchParams();
  const [activePage, setActivePage] = useState<PageKey>("practice");
  const activePageIndex = pages.findIndex((page) => page.key === activePage);

  const v = params.get("v");
  const start = params.get("start");
  const end = params.get("end");

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <main className="h-[100dvh] grid grid-rows-[auto_minmax(0,1fr)]">
      <PageHeader activePage={activePage} setActivePage={setActivePage} />
      <div className="overflow-hidden">
        <div
          className="grid grid-cols-[repeat(3,100vw)] transition-transform duration-700"
          style={{
            transform: `translateX(-${activePageIndex * 100}vw)`,
          }}
        >
          <PageWrapper>
            <YouTubeLooper v={v} start={start} end={end} />
          </PageWrapper>
          <PageWrapper>
            <History />
          </PageWrapper>
          <PageWrapper>Three</PageWrapper>
        </div>
      </div>
      {/* <div>
        <YouTubeLooper v={v} start={start} end={end} />
        <div className="grid content-start overflow-auto bg-gray-50">
          <History />
        </div>
      </div> */}
    </main>
  );
}
