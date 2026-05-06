import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1A1A18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7,
          position: "relative",
        }}
      >
        {/* Locator top-left */}
        <div
          style={{
            position: "absolute",
            top: 5,
            left: 5,
            width: 8,
            height: 8,
            background: "#FAF7F2",
            borderRadius: 1.5,
            display: "flex",
          }}
        />
        {/* Locator top-right */}
        <div
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            width: 8,
            height: 8,
            background: "#FAF7F2",
            borderRadius: 1.5,
            display: "flex",
          }}
        />
        {/* Locator bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: 5,
            left: 5,
            width: 8,
            height: 8,
            background: "#FAF7F2",
            borderRadius: 1.5,
            display: "flex",
          }}
        />
        {/* Dot terracotta signature */}
        <div
          style={{
            position: "absolute",
            bottom: 5,
            right: 5,
            width: 8,
            height: 8,
            background: "#D4633D",
            borderRadius: "50%",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
