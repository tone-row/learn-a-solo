"use client";

import { YouTubeLooper } from "@/components/YoutubeLooper";
import { useState } from "react";
import { History } from "@/components/History";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PageKey, pages } from "@/lib/constants";
import { PageWrapper } from "@/components/PageWrapper";
import { HowItWorks } from "@/components/HowItWorks";

export default function Home() {
  const params = useSearchParams();
  const [activePage, setActivePage] = useState<PageKey>("practice");
  const activePageIndex = pages.findIndex((page) => page.key === activePage);

  const v = params.get("v");
  const start = params.get("start");
  const end = params.get("end");

  return (
    <main className="h-[100dvh] grid grid-rows-[auto_minmax(0,1fr)] overflow-hidden content-start">
      <PageHeader activePage={activePage} setActivePage={setActivePage} />

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
        <PageWrapper>
          <HowItWorks />
        </PageWrapper>
      </div>
    </main>
  );
}
