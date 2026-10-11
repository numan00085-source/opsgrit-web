import { ImageResponse } from "next/og";

export const alt = "OpsGrit: AI workflows and enterprise operations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0B0F17 0%, #161D2B 100%)",
          color: "#F8E6A6",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="84" height="84" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="15" fill="#161D2B" />
            <path d="M43.49 22.36 A15 15 0 1 0 47 32" fill="none" stroke="#E2BD5C" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M47 32 H34" fill="none" stroke="#D9B04A" strokeWidth="6.5" />
            <circle cx="32" cy="32" r="4.6" fill="#D9B04A" />
          </svg>
          <div style={{ marginLeft: 24, fontSize: 64, fontWeight: 800, color: "#E2BD5C" }}>OpsGrit</div>
        </div>
        <div style={{ marginTop: 56, fontSize: 76, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.08, display: "flex" }}>
          Run operations with grit, not guesswork.
        </div>
        <div style={{ marginTop: 32, fontSize: 32, color: "#94A3B8", display: "flex" }}>
          AI workflows · Enterprise automation · Ops playbooks
        </div>
      </div>
    ),
    size,
  );
}
