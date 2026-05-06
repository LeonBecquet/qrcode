import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "QR Restaurant — Commandes par QR code pour restaurants";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAF7F2",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          position: "relative",
        }}
      >
        {/* Logo mark en haut-gauche */}
        <div
          style={{
            width: 88,
            height: 88,
            background: "#1A1A18",
            borderRadius: 20,
            position: "relative",
            display: "flex",
          }}
        >
          {/* Locator top-left */}
          <div
            style={{
              position: "absolute",
              top: 13,
              left: 13,
              width: 20,
              height: 20,
              background: "#FAF7F2",
              borderRadius: 3,
              display: "flex",
            }}
          />
          {/* Locator top-right */}
          <div
            style={{
              position: "absolute",
              top: 13,
              right: 13,
              width: 20,
              height: 20,
              background: "#FAF7F2",
              borderRadius: 3,
              display: "flex",
            }}
          />
          {/* Locator bottom-left */}
          <div
            style={{
              position: "absolute",
              bottom: 13,
              left: 13,
              width: 20,
              height: 20,
              background: "#FAF7F2",
              borderRadius: 3,
              display: "flex",
            }}
          />
          {/* Dot terracotta */}
          <div
            style={{
              position: "absolute",
              bottom: 14,
              right: 14,
              width: 18,
              height: 18,
              background: "#D4633D",
              borderRadius: "50%",
              display: "flex",
            }}
          />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* Tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              color: "#1A1A18",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Vos clients commandent</span>
            <span style={{ color: "#7C766F" }}>depuis leur table.</span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#5C5750",
              marginTop: 16,
              display: "flex",
            }}
          >
            QR Restaurant — pour restaurants français
          </div>
        </div>

        {/* Accent terracotta line en bas */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "#D4633D",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
