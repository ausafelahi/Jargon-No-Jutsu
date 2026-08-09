import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { createAdminClient } from "@/lib/supabase/admin";

interface CheckResult {
  name: string;
  ok: boolean;
  detail?: string;
}

async function checkDatabase(): Promise<CheckResult> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("lessons").select("id").limit(1);
    if (error) throw new Error(error.message);
    return { name: "Supabase Database", ok: true };
  } catch (err) {
    return { name: "Supabase Database", ok: false, detail: String(err) };
  }
}

async function checkAniList(): Promise<CheckResult> {
  try {
    const res = await fetch(
      process.env.ANILIST_API_URL ?? "https://graphql.anilist.co",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "{ Character(id: 1) { id } }" }),
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { name: "AniList API", ok: true };
  } catch (err) {
    return { name: "AniList API", ok: false, detail: String(err) };
  }
}

async function checkOpenRouter(): Promise<CheckResult> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { name: "OpenRouter API", ok: true };
  } catch (err) {
    return { name: "OpenRouter API", ok: false, detail: String(err) };
  }
}

async function checkEmailProvider(): Promise<CheckResult> {
  const provider = process.env.EMAIL_PROVIDER ?? "resend";
  try {
    if (provider === "resend") {
      const res = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } else {
      const res = await fetch("https://api.brevo.com/v3/account", {
        headers: { "api-key": process.env.BREVO_API_KEY ?? "" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }
    return { name: `Email provider (${provider})`, ok: true };
  } catch (err) {
    return {
      name: `Email provider (${provider})`,
      ok: false,
      detail: String(err),
    };
  }
}

async function main() {
  const results = await Promise.all([
    checkDatabase(),
    checkAniList(),
    checkOpenRouter(),
    checkEmailProvider(),
  ]);

  let allOk = true;
  for (const r of results) {
    console.log(
      `${r.ok ? "✅" : "❌"} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`,
    );
    if (!r.ok) allOk = false;
  }

  if (!allOk) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Health check crashed:", err);
  process.exit(1);
});
