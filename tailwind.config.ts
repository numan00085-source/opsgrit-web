import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0F17",
          900: "#111827",
          800: "#161D2B",
          700: "#1E2738",
          600: "#2A3447",
        },
        accent: {
          DEFAULT: "#7C83F5",
          soft: "#A5ABFA",
          deep: "#5B63D6",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      typography: {
        invert: {
          css: {
            "--tw-prose-body": "#CBD5E1",
            "--tw-prose-headings": "#F1F5F9",
            "--tw-prose-links": "#A5ABFA",
            "--tw-prose-bold": "#F8FAFC",
            "--tw-prose-quotes": "#E2E8F0",
            "--tw-prose-code": "#E2E8F0",
            "--tw-prose-hr": "#1E2738",
            "--tw-prose-th-borders": "#2A3447",
            "--tw-prose-td-borders": "#1E2738",
            "--tw-prose-bullets": "#64748B",
            "--tw-prose-counters": "#94A3B8",
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
