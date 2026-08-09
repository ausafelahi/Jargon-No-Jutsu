import { PROVIDER_CHAIN, type EmailPayload, type EmailProviderResult } from "./providers";

const PROVIDER_ENV_KEYS: Record<string, string> = {
  resend: "RESEND_API_KEY",
  brevo: "BREVO_API_KEY",
};

function isConfigured(providerName: string): boolean {
  const envKey = PROVIDER_ENV_KEYS[providerName];
  return Boolean(envKey && process.env[envKey]);
}

export async function sendEmailWithFallback(
  payload: EmailPayload
): Promise<{ success: boolean; attempts: EmailProviderResult[] }> {
  const primaryName = process.env.EMAIL_PROVIDER ?? "resend";
  const ordered = [
    ...PROVIDER_CHAIN.filter((p) => p.name === primaryName),
    ...PROVIDER_CHAIN.filter((p) => p.name !== primaryName),
  ];

  const attempts: EmailProviderResult[] = [];

  for (const provider of ordered) {
    if (!isConfigured(provider.name)) {
      attempts.push({ provider: provider.name, success: false, error: "not configured" });
      continue;
    }

    try {
      await provider.send(payload);
      attempts.push({ provider: provider.name, success: true });
      return { success: true, attempts };
    } catch (err) {
      attempts.push({
        provider: provider.name,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { success: false, attempts };
}
