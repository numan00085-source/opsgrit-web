import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Warm cream surfaces
        cream: {
          50: "#FFFDF8",
          100: "#FAF5E9",
          200: "#F2EAD7",
          300: "#E6DBC0",
          400: "#D6C8A4",
        },
        // Warm near-black text
        ink: {
          950: "#14130F",
          900: "#1E1C17",
          800: "#2C2A23",
          700: "#45423A",
          600: "#5F5B50",
          500: "#6E695D",
        },
        gold: {
          100: "#F8EFCF",
          200: "#F1DFA8",
          300: "#E6C873",
          400: "#D4AF4F",
          500: "#BF9531",
          600: "#9C7618",
          700: "#7A5B10",
        },
        // The original indigo, kept as a small secondary accent (links, focus)
        accent: {
          DEFAULT: "#5B63D6",
          soft: "#E8E9FC",
          deep: "#4A52C2",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "#45423A",
            "--tw-prose-headings": "#1E1C17",
            "--tw-prose-lead": "#5F5B50",
            "--tw-prose-links": "#4A52C2",
            "--tw-prose-bold": "#1E1C17",
            "--tw-prose-counters": "#9C7618",
            "--tw-prose-bullets": "#BF9531",
            "--tw-prose-hr": "#E6DBC0",
            "--tw-prose-quotes": "#2C2A23",
            "--tw-prose-quote-borders": "#D4AF4F",
            "--tw-prose-captions": "#6E695D",
            "--tw-prose-code": "#1E1C17",
            "--tw-prose-pre-code": "#F2EAD7",
            "--tw-prose-pre-bg": "#1E1C17",
            "--tw-prose-th-borders": "#D6C8A4",
            "--tw-prose-td-borders": "#E6DBC0",
            // Plain upright text everywhere (no italic "classic" quote style)
            blockquote: { fontStyle: "normal", fontWeight: "500", quotes: "none" },
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:last-of-type::after": { content: "none" },
            em: { fontStyle: "normal", fontWeight: "600" },
            "code": { backgroundColor: "#F2EAD7", borderRadius: "0.375rem", padding: "0.15rem 0.4rem", fontWeight: "500" },
            "pre code": { backgroundColor: "transparent", padding: "0" },
            "h1, h2, h3, h4": { letterSpacing: "-0.02em" },
            a: { textDecorationColor: "#D4AF4F", textUnderlineOffset: "4px" },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
