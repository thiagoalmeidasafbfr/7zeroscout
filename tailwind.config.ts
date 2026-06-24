import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pitch: {
          50: "#e9f7ee",
          100: "#c9ecd5",
          200: "#94d8a9",
          300: "#5dbf7e",
          400: "#34a35d",
          500: "#1f8a47",
          600: "#157038",
          700: "#0f5a2d",
          800: "#0b4424",
          900: "#072c17",
        },
        ink: {
          950: "#08100b",
          900: "#0c1610",
          800: "#121e16",
          700: "#1a2a20",
          600: "#243527",
          500: "#324533",
          400: "#4a5e4c",
          300: "#7e9082",
          200: "#b3c1b6",
          100: "#dee5e0",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Inter",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
