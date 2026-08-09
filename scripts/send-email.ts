import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { sendDailyDigest } from "@/lib/email/send-daily-digest";

async function main() {
  if (process.env.EMAIL_DELIVERY_ENABLED !== "true") {
    console.log("EMAIL_DELIVERY_ENABLED is not 'true' — skipping.");
    return;
  }

  const result = await sendDailyDigest();
  console.log(
    `Digest sent: ${result.sent}/${result.totalSubscribers} succeeded for lesson ${result.lessonId}`,
  );

  if (result.failed.length > 0) {
    console.warn("Failed recipients:");
    for (const f of result.failed) {
      console.warn(`  ${f.email}: ${f.error}`);
    }
  }
}

main().catch((err) => {
  console.error("Digest send failed:", err);
  process.exit(1);
});
