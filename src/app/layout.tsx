import type { Metadata } from "next";

import { LocalModeBanner } from "@/components/layout/local-mode-banner";
import { SiteHeader } from "@/components/layout/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: "GetUpdated",
  description: "An awareness platform that teaches users how to recognize online update patterns."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <SiteHeader />
        <LocalModeBanner />
        {children}
      </body>
    </html>
  );
}
