import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Tradewinds — Accelerating the Acquisition of Innovation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social card with the official reversed lockup. */
export default async function OgImage() {
  const [logo, font] = await Promise.all([
    readFile(join(process.cwd(), "public/brand/tradewinds-wordmark-reversed.png")),
    readFile(join(process.cwd(), "node_modules/@fontsource/montserrat/files/montserrat-latin-800-normal.woff")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const lines = [70, 150, 235, 315, 400, 485, 565];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "linear-gradient(135deg, #011c2f 0%, #022C49 55%, #004AAD 100%)", color: "white", padding: 72, flexDirection: "column", justifyContent: "space-between" }}>
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
          {lines.map((y) => <path key={y} d={`M 420 ${y} C 700 ${y}, 820 315, 1000 315`} stroke="#7FBDF2" strokeOpacity="0.4" strokeWidth="1.5" fill="none" />)}
          <path d="M 1000 315 L 1200 315" stroke="#F9943B" strokeWidth="3" />
          <circle cx="1000" cy="315" r="14" fill="#022C49" stroke="#337DE5" strokeWidth="2" />
          <circle cx="1000" cy="315" r="5" fill="#F9943B" />
        </svg>
        <img src={logoSrc} width={372} height={60} alt="" />
        <div style={{ display: "flex", flexWrap: "wrap", fontFamily: "Montserrat", fontSize: 66, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", maxWidth: 760 }}>
          {"Accelerating the Acquisition of".split(" ").map((w) => <span key={w} style={{ marginRight: 20 }}>{w}</span>)}
          <span>Innovation</span>
          <span style={{ color: "#F9943B" }}>.</span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Montserrat", data: font, weight: 800, style: "normal" }] },
  );
}
