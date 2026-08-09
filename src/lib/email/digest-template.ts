import type { Lesson } from "@/types/database";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function buildDigestEmail(lesson: Lesson): {
  subject: string;
  html: string;
} {
  const subject = `Daily Jutsu: ${lesson.concept} (via ${lesson.character_name})`;

  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#0f0f1f;font-family:ui-monospace,SFMono-Regular,monospace;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1f;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#17172b;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid #2a2a44;">
                <span style="color:#2DD4BF;font-weight:bold;font-size:18px;">Jargon</span>
                <span style="color:#8888a0;font-size:18px;"> no </span>
                <span style="color:#F75C82;font-weight:bold;font-size:18px;">Jutsu</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <span style="display:inline-block;border:1px solid #2DD4BF;color:#2DD4BF;font-size:12px;padding:4px 10px;border-radius:4px;letter-spacing:1px;">
                  DAILY LESSON
                </span>
                <h1 style="color:#c4b8f5;font-size:32px;margin:16px 0 24px;border-left:3px solid #c4b8f5;padding-left:16px;">
                  ${escapeHtml(lesson.concept)}
                </h1>

                <p style="color:#F75C82;font-weight:bold;font-size:18px;margin:0 0 4px;">
                  ${escapeHtml(lesson.character_name)}
                </p>
                <p style="color:#8888a0;font-size:14px;margin:0 0 20px;">
                  ${escapeHtml(lesson.anime_name)}
                </p>

                <p style="color:#d0d0e0;font-size:15px;line-height:1.6;white-space:pre-line;">
                  ${escapeHtml(lesson.lesson)}
                </p>

                <div style="margin-top:24px;padding:16px;background-color:#0f0f1f;border-left:2px solid #F75C82;border-radius:4px;">
                  <p style="color:#8888a0;font-size:12px;letter-spacing:1px;margin:0 0 8px;">CAREER ADVICE</p>
                  <p style="color:#d0d0e0;font-size:14px;line-height:1.5;margin:0;">
                    ${escapeHtml(lesson.career_advice)}
                  </p>
                </div>

                <a href="${SITE_URL}/lessons/${lesson.id}"
                   style="display:inline-block;margin-top:28px;background-color:#2DD4BF;color:#0f0f1f;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:4px;text-decoration:none;">
                  READ FULL LESSON
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #2a2a44;color:#8888a0;font-size:12px;">
                Engineered for Shinobi. You're receiving this because you subscribed at Jargon no Jutsu.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();

  return { subject, html };
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
