import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface OgImageProps {
  params: Promise<{ id: string }>;
}

export default async function OgImage({ params }: OgImageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  const concept = lesson?.concept ?? "Jargon no Jutsu";
  const characterName = lesson?.character_name ?? "";
  const animeName = lesson?.anime_name ?? "";
  const tier = lesson?.tier ?? "";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px",
        backgroundColor: "#0d0d18",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #2DD4BF, #F75C82)",
            display: "flex",
          }}
        />
        <span style={{ color: "#8888a0", fontSize: "28px", fontWeight: 700 }}>
          Jargon no Jutsu
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            color: "#2DD4BF",
            fontSize: "24px",
            letterSpacing: "2px",
            marginBottom: "16px",
          }}
        >
          DAILY LESSON
        </div>
        <div
          style={{
            display: "flex",
            color: "#c4b8f5",
            fontSize: "72px",
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: "900px",
          }}
        >
          {concept}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: "#F75C82",
              fontSize: "36px",
              fontWeight: 700,
            }}
          >
            {characterName}
          </div>
          <div style={{ display: "flex", color: "#8888a0", fontSize: "24px" }}>
            {animeName}
          </div>
        </div>
        {tier && (
          <div
            style={{
              display: "flex",
              backgroundColor: "#F75C82",
              color: "#0d0d18",
              fontSize: "20px",
              fontWeight: 700,
              padding: "10px 24px",
              borderRadius: "6px",
              letterSpacing: "1px",
            }}
          >
            {tier}
          </div>
        )}
      </div>
    </div>,
    { ...size },
  );
}
