import type { Metadata } from "next";

import { LocalModeBanner } from "@/components/layout/local-mode-banner";
import { SiteHeader } from "@/components/layout/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: "ScamShield Library",
  description: "A scam-awareness platform that teaches users how to recognize online scam patterns."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <LocalModeBanner />
        {children}
      </body>
    </html>
  );
}
