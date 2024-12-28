import type { Metadata } from "next";
import "./globals.css";
import { Pathway_Extreme } from "next/font/google";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

const pathwayExtreme = Pathway_Extreme({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-sans",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(pathwayExtreme.variable, "antialiased")}>
      <body>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  );
}
