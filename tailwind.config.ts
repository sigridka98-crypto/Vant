import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: "#10B981",
        "primary-dark": "#10B981",
        "bg-primary": "#0F1115",
        "bg-secondary": "#15171C",
        "bg-soft": "#1C1F26",
        "text-main": "#F4F4F5",
        "text-secondary": "#A1A1AA",
        "text-muted": "#71717A",
        "border-soft": "#2A2E37"
      },
      borderRadius: {
        "2xl": "1rem"
      },
      boxShadow: {
        glow: "0 10px 22px rgba(0, 0, 0, 0.2)",
        "glow-soft": "0 10px 22px rgba(0, 0, 0, 0.2)",
        glass: "0 10px 22px rgba(0, 0, 0, 0.2)"
      }
    }
  }
};

export default config;
