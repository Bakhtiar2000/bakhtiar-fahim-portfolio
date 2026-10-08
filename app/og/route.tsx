import { ImageResponse } from "next/og";
import { plainText } from "@/components/site/highlight";
import { getSiteContent } from "@/lib/content";

/** Default Open Graph image (used when no custom OG image is uploaded in admin). */
export async function GET() {
  const { profile } = await getSiteContent();
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#0A0B0F",
        backgroundImage:
          "radial-gradient(circle at 85% 10%, rgba(99,102,241,0.35), transparent 45%), radial-gradient(circle at 10% 100%, rgba(34,211,238,0.22), transparent 45%)",
        color: "#F4F4F5",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "linear-gradient(135deg, #6366F1, #22D3EE)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {profile.name
            .split(" ")
            .slice(-2)
            .map((w) => w[0])
            .join("")}
        </div>
        <div style={{ fontSize: 28, color: "#A1A1AA" }}>{profile.title}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>{plainText(profile.headline)}</div>
        <div style={{ fontSize: 34, color: "#A5B4FC" }}>{profile.name}</div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
