import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit/check";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const { allowed } = await checkRateLimit(ip, {
    name: "lessons",
    limit: 60,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);

  const sort = searchParams.get("sort") === "oldest" ? "oldest" : "newest";
  const anime = searchParams.get("anime");
  const character = searchParams.get("character");
  const concept = searchParams.get("concept");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const supabase = await createClient();

  let query = supabase.from("lessons").select("*", { count: "exact" });

  if (anime) query = query.eq("anime_name", anime);
  if (character) query = query.eq("character_name", character);
  if (concept) query = query.eq("concept", concept);

  query = query.order("created_at", { ascending: sort === "oldest" });

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    lessons: data,
    page,
    pageSize: PAGE_SIZE,
    total: count ?? 0,
  });
}
