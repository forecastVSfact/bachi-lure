import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const runtime = "edge";
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(160deg, #020810 0%, #0d2035 55%, #061220 100%)",
          color: "#e8dfc0"
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: "0.35em", color: "#4a9aba", marginBottom: 24 }}>SEABASS BACHI LURE</div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, marginBottom: 20 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 30, color: "#ef9f27" }}>シーバス・バチ抜け特化ルアーデータベース</div>
        <div style={{ marginTop: 48, fontSize: 24, color: "#8a8070" }}>{SITE_URL.replace("https://", "")}</div>
      </div>
    ),
    { ...size }
  );
}
