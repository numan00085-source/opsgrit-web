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
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 20,
              background: "linear-gradient(135deg, #C9A03A, #F6E3A3)",
              color: "#1E1C17",
              fontSize: 52,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            O
          </div>
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
