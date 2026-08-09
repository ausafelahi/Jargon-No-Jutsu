import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { error: "Missing query param 'q'" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const pattern = `%${q}%`;
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .or(
      `character_name.ilike.${pattern},anime_name.ilike.${pattern},concept.ilike.${pattern}`,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lessons: data, query: q });
}
