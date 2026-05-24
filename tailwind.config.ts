import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: "#00E6A8",
        "primary-dark": "#00BFA6",
        "bg-primary": "#020617",
        "bg-secondary": "#0B1220",
        "bg-soft": "#111827",
        "text-main": "#FFFFFF",
        "text-secondary": "#9CA3AF",
        "text-muted": "#6B7280",
        "border-soft": "rgba(255,255,255,0.08)"
      },
      borderRadius: {
        "2xl": "1rem"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0,230,168,0.16), 0 16px 40px rgba(0,230,168,0.18)",
        "glow-soft": "0 10px 30px rgba(0,230,168,0.12)",
        glass: "0 18px 55px rgba(2, 6, 23, 0.35)"
      }
    }
  }
};

export default config;
