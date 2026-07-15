import type { Metadata } from "next";

import { LocalModeBanner } from "@/components/layout/local-mode-banner";
import { SiteHeader } from "@/components/layout/site-header";

import "./globals.css";

const themeInitScript = `
  (() => {
    try {
      const savedTheme = localStorage.getItem("vant-theme");
      const theme = savedTheme === "light" ? "light" : "dark";
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.style.colorScheme = "dark";
    }
  })();
`;

export const metadata: Metadata = {
  title: "GetUpdated",
  description: "An awareness platform that teaches users how to recognize online update patterns."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <SiteHeader />
        <LocalModeBanner />
        {children}
      </body>
    </html>
  );
}
