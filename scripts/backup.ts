import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { writeFile, mkdir } from "fs/promises";
import { createAdminClient } from "@/lib/supabase/admin";

async function main() {
  if (process.env.BACKUP_ENABLED !== "true") {
    console.log("BACKUP_ENABLED is not 'true' — skipping.");
    return;
  }

  const supabase = createAdminClient();
  const date = new Date().toISOString().slice(0, 10);
  const outDir = `backups/${date}`;
  await mkdir(outDir, { recursive: true });

  const tables = ["lessons", "bookmarks", "subscribers"] as const;

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) {
      throw new Error(`Failed to back up "${table}": ${error.message}`);
    }
    await writeFile(`${outDir}/${table}.json`, JSON.stringify(data, null, 2));
    console.log(`Backed up ${data?.length ?? 0} rows from "${table}"`);
  }
}

main().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
