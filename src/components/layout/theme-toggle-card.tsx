"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem("vant-theme", theme);
}

export function ThemeToggleCard() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("vant-theme");
    const nextTheme = savedTheme === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  return (
    <section className="vant-card rounded-[32px] p-8">
      <div className="flex items-center gap-3">
        <span className="vant-glass rounded-2xl p-3 text-primary">
          <Monitor className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-text-main">Theme</p>
          <p className="text-xs text-text-secondary">
            Switch between the clean light view and the darker nighttime view.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setTheme("light");
            applyTheme("light");
          }}
          className={`rounded-[24px] border px-5 py-5 text-left transition ${
            theme === "light"
              ? "border-primary/30 bg-primary/10 shadow-[0_20px_50px_rgba(0,230,168,0.12)]"
              : "vant-card-hover border-border-soft bg-transparent"
          }`}
        >
          <Sun className="h-5 w-5 text-primary" />
          <p className="mt-4 text-lg font-semibold text-text-main">Light mode</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Bright, white-first surfaces for daytime reading and a softer public-facing look.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setTheme("dark");
            applyTheme("dark");
          }}
          className={`rounded-[24px] border px-5 py-5 text-left transition ${
            theme === "dark"
              ? "border-primary/30 bg-primary/10 shadow-[0_20px_50px_rgba(0,230,168,0.12)]"
              : "vant-card-hover border-border-soft bg-transparent"
          }`}
        >
          <Moon className="h-5 w-5 text-primary" />
          <p className="mt-4 text-lg font-semibold text-text-main">Dark mode</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            A darker workspace for focused browsing when you prefer lower brightness.
          </p>
        </button>
      </div>
    </section>
  );
}
