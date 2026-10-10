// Sends an email through Resend's HTTP API. Server-only.
import { RESEND_API_KEY, EMAIL_FROM } from "./env";

export async function sendEmail({ to, bcc, replyTo, subject, html, text, attachments }) {
  const key = RESEND_API_KEY();
  if (!key) return { error: "Email is not set up (RESEND_API_KEY is missing in Vercel)." };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: EMAIL_FROM(),
        to: Array.isArray(to) ? to : [to],
        ...(bcc ? { bcc: Array.isArray(bcc) ? bcc : [bcc] } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        html,
        text,
        ...(attachments?.length ? { attachments } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (/verify a domain|testing emails|own email address/i.test(body)) {
        return { error: "Resend can only send to artists once seeingstarsagency.com is verified in Resend (right now it only sends to your own address)." };
      }
      return { error: `Email failed (${res.status}). ${body}`.slice(0, 300) };
    }
    return { ok: true };
  } catch (e) {
    return { error: String(e?.message || e) };
  }
}
