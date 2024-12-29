"use client";

import { PageKey, pages } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function PageHeader({
  activePage,
  setActivePage,
}: {
  activePage: PageKey;
  setActivePage: (page: PageKey) => void;
}) {
  const indicatorRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!indicatorRef.current) return;
    const page = document.querySelector(
      `[data-page="${activePage}"]`,
    ) as HTMLElement;
    if (!page) return;
    indicatorRef.current.style.left = `${page.offsetLeft}px`;
    indicatorRef.current.style.width = `${page.offsetWidth}px`;
  }, [activePage]);
  return (
    <header className="flex gap-8 p-4 justify-between items-center bg-yellow-400 relative w-screen">
      <div className="flex justify-start gap-8">
        <h1 className="text-xl font-semibold" id="main-heading">
          Learn a Solo
        </h1>
        {pages.map((page) => (
          <button
            key={page.key}
            className={cn("text-xl transition-all duration-300", {
              "text-red-700": activePage === page.key,
            })}
            onClick={() => setActivePage(page.key)}
            data-active={activePage === page.key}
            data-page={page.key}
          >
            {page.label}
          </button>
        ))}
        <span
          ref={indicatorRef}
          className="absolute left-0 bottom-0 h-2 bg-red-500 transition-all duration-300"
        />
      </div>
      <div className="flex justify-end gap-8">
        <Link
          href="https://github.com/tone-row/learn-a-solo"
          className="text-sm font-semibold"
        >
          tone-row/learn-a-solo
        </Link>
        <Link href="https://buymeacoffee.com/lsm7ph8ty9">
          <Image
            src="/bmc-full-logo-no-background.png"
            alt="Buy Me a Coffee"
            width={120}
            height={100}
          />
        </Link>
      </div>
    </header>
  );
}
