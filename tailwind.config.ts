import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: "#37C585",
        "primary-dark": "#1F8F63",
        "bg-primary": "#06110C",
        "bg-secondary": "#0B1812",
        "bg-soft": "#102119",
        "text-main": "#F5FBF7",
        "text-secondary": "#A9BEB2",
        "text-muted": "#759184",
        "border-soft": "rgba(171,209,188,0.14)"
      },
      borderRadius: {
        "2xl": "1rem"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(55,197,133,0.2), 0 16px 40px rgba(10,74,49,0.34)",
        "glow-soft": "0 10px 30px rgba(55,197,133,0.14)",
        glass: "0 18px 55px rgba(0, 0, 0, 0.28)"
      }
    }
  }
};

export default config;
