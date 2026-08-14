import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { generateTheoryArticle } from "@/lib/theory/generate-theory-article";

async function main() {
  const result = await generateTheoryArticle();

  if (!result.article) {
    console.log(result.skipped ?? "No article generated.");
    return;
  }

  console.log(
    `Generated theory article: "${result.article.title}" (${result.article.concept})`,
  );
}

main().catch((err) => {
  console.error("Theory generation failed:", err);
  process.exit(1);
});
