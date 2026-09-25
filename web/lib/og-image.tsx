import { ImageResponse } from "next/og";

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 20% 15%, rgba(34,211,238,0.28), transparent 45%), radial-gradient(circle at 85% 85%, rgba(217,70,239,0.30), transparent 45%), #05060f",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 28,
            fontSize: 76,
            fontWeight: 800,
            background: "linear-gradient(135deg, #22d3ee, #d946ef 60%, #ec4899)",
            marginBottom: 36,
          }}
        >
          M
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 108,
            fontWeight: 800,
            letterSpacing: -3,
            backgroundImage: "linear-gradient(90deg, #22d3ee, #d946ef, #ec4899)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          MargeMax
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 44,
            color: "rgba(255,255,255,0.88)",
          }}
        >
          Calcule tes vraies marges e-commerce
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
