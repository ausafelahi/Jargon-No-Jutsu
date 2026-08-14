import type { Lesson } from "@/types/database";

export function buildDigestEmail(lesson: Lesson): {
  subject: string;
  html: string;
} {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const subject = `${lesson.concept}: today's lesson`;

  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:15px; line-height:1.6;">
                <p>Hey,</p>

                <p>Today's lesson is <strong>${escapeHtml(lesson.concept)}</strong>, taught through ${escapeHtml(lesson.character_name)} from ${escapeHtml(lesson.anime_name)}.</p>

                <p style="white-space:pre-line;">${escapeHtml(lesson.lesson)}</p>

                <p><strong>Career advice:</strong> ${escapeHtml(lesson.career_advice)}</p>

                <p>Full lesson here: <a href="${siteUrl}/lessons/${lesson.id}" style="color:#1a56db;">${siteUrl}/lessons/${lesson.id}</a></p>

                <p style="color:#666; font-size:13px; margin-top:32px;">
                  Jargon no Jutsu<br>
                  You're getting this because you subscribed.
                </p>
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
