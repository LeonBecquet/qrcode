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
          background: "#FFF6E0",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          position: "relative",
        }}
      >
        {/* Decorative gradient blobs */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(238, 128, 51, 0.25)",
            filter: "blur(80px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -200,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(31, 79, 31, 0.25)",
            filter: "blur(80px)",
            display: "flex",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: 88,
            height: 88,
            background: "#1F4F1F",
            borderRadius: 20,
            position: "relative",
            display: "flex",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 13,
              left: 13,
              width: 20,
              height: 20,
              background: "#FFF6E0",
              borderRadius: 3,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 13,
              right: 13,
              width: 20,
              height: 20,
              background: "#F5C342",
              borderRadius: 3,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 13,
              left: 13,
              width: 20,
              height: 20,
              background: "#FFF6E0",
              borderRadius: 3,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 14,
              right: 14,
              width: 18,
              height: 18,
              background: "#EE8033",
              borderRadius: "50%",
              display: "flex",
            }}
          />
        </div>

        <div style={{ flex: 1, display: "flex" }} />

        {/* Tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              color: "#2A1F0E",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Vos clients commandent</span>
            <span style={{ color: "#1F4F1F" }}>depuis leur table.</span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#5C5750",
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                background: "#EE8033",
                color: "white",
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 600,
                display: "flex",
              }}
            >
              0% commission
            </span>
            <span style={{ display: "flex" }}>QR Restaurant — pour restaurants français</span>
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
            background: "linear-gradient(90deg, #1F4F1F 0%, #EE8033 50%, #F5C342 100%)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
