import type { Metadata } from "next";
import "./globals.css";
import { Pathway_Extreme } from "next/font/google";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { seo } from "@/lib/constants";
import { GoogleAnalytics } from "@next/third-parties/google";

const pathwayExtreme = Pathway_Extreme({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-sans",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: seo.siteTitle,
  description: seo.siteDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(pathwayExtreme.variable, "antialiased")}>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <body>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
      <GoogleAnalytics gaId="G-EL1P5WMP4R" />
    </html>
  );
}
