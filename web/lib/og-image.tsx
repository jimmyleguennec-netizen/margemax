import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function loadLogo(): Promise<string | null> {
  try {
    const file = await readFile(path.join(process.cwd(), "public", "images", "logo-icon.png"));
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch (err) {
    console.error("[og-image] logo-icon.png illisible :", err);
    return null;
  }
}

export async function renderOgImage() {
  const logo = await loadLogo();
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
        {logo ? (
          // Le PNG (1221x589) a de larges marges transparentes : on le
          // recadre sur le motif (x 265->925) a 170x150 px.
          <div
            style={{
              display: "flex",
              position: "relative",
              width: 170,
              height: 150,
              overflow: "hidden",
              marginBottom: 28,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo}
              alt=""
              width={311}
              height={150}
              style={{ position: "absolute", left: -67, top: 0 }}
            />
          </div>
        ) : null}
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
