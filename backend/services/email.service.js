const DEFAULT_FROM = "NutriSmart Coach <info@nutrismartcoach.com>";
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendEmail({ to, subject, text, html, from } = {}) {
  const recipients = normalizeRecipients(to);
  const safeSubject = String(subject || "").trim();
  const safeText = String(text || "").trim();
  const safeHtml = String(html || "").trim();
  const sender = String(from || process.env.MAIL_FROM || DEFAULT_FROM).trim();
  const resendApiKey = String(process.env.RESEND_API_KEY || "").trim();

  if (!recipients.length || !safeSubject || (!safeText && !safeHtml)) {
    throw new Error("Email incompleto.");
  }

  if (!resendApiKey) {
    console.info(
      JSON.stringify({
        event: "email.skipped",
        reason: "missing_resend_api_key",
        to: recipients,
        subject: safeSubject,
      })
    );

    return {
      provider: "resend",
      skipped: true,
      reason: "missing_resend_api_key",
    };
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: sender,
      to: recipients,
      subject: safeSubject,
      text: safeText || undefined,
      html: safeHtml || undefined,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => "");
    throw new Error(
      `No se pudo enviar el email (${response.status}): ${responseText}`
    );
  }

  return response.json().catch(() => ({ ok: true }));
}

function normalizeRecipients(value) {
  return (Array.isArray(value) ? value : [value])
    .map((recipient) => String(recipient || "").trim())
    .filter(Boolean);
}
