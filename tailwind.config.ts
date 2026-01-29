import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#286F3E", // Deep forest green
          dark: "#1e5230",
          light: "#3a8f54",
        },
        accent: {
          DEFAULT: "#FBC02D", // Vibrant yellow/gold
          dark: "#d4a025",
          light: "#fdd65a",
        },
        secondary: {
          DEFAULT: "#7FB6BF", // Muted teal/light blue
          dark: "#5a8a93",
          light: "#a4d2d9",
        },
      },
    },
  },
  plugins: [],
};
export default config;
