export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface EmailProviderResult {
  provider: string;
  success: boolean;
  error?: string;
}

type ProviderSender = (payload: EmailPayload) => Promise<void>;

const FROM_NAME = process.env.EMAIL_FROM_NAME ?? "Jargon no Jutsu";
const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS;

if (!FROM_ADDRESS) {
  console.warn(
    "EMAIL_FROM_ADDRESS is not set — email sends will fail. " +
      "Set it to a verified sender: onboarding@resend.dev for Resend's test sender, " +
      "or the email you verified as a Sender in Brevo's dashboard.",
  );
}

async function sendViaResend(payload: EmailPayload): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_ADDRESS}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });
  if (!res.ok)
    throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
}

async function sendViaBrevo(payload: EmailPayload): Promise<void> {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_ADDRESS },
      to: [{ email: payload.to }],
      subject: payload.subject,
      htmlContent: payload.html,
    }),
  });
  if (!res.ok)
    throw new Error(`Brevo failed: ${res.status} ${await res.text()}`);
}

export const PROVIDER_CHAIN: { name: string; send: ProviderSender }[] = [
  { name: "resend", send: sendViaResend },
  { name: "brevo", send: sendViaBrevo },
];
