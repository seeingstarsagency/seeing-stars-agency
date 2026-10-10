// Emails to the admin. Server-only. Uses Resend's HTTP API (no extra package).
import { RESEND_API_KEY, ADMIN_EMAIL, EMAIL_FROM, SITE_URL } from "./env";

const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export async function emailAdmin({ subject, html, text }) {
  const key = RESEND_API_KEY();
  if (!key) return { skipped: true };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: EMAIL_FROM(), to: [ADMIN_EMAIL()], subject, html, text }),
    });
    if (!res.ok) return { error: `${res.status} ${await res.text().catch(() => "")}`.slice(0, 300) };
    return { ok: true };
  } catch (e) {
    return { error: String(e?.message || e) };
  }
}

// "An artist wrote from the Help button" reminder.
export function helpEmail({ artistName, topic, body }) {
  const link = `${SITE_URL()}/admin/help`;
  const subject = `✦ New message from ${artistName} — reply in Help messages`;
  const text = `${artistName} sent you a message (${topic}):\n\n${body}\n\nReply here: ${link}`;
  const html = `
  <div style="font-family:Georgia,serif;background:#FBFAF6;padding:24px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:2px solid #1E1B2E;border-radius:18px;padding:24px">
      <div style="color:#C2417F;font-size:18px">you have a new message ✦</div>
      <h2 style="margin:6px 0 12px;font-style:italic;color:#1E1B2E">${esc(artistName)} needs your help</h2>
      <div style="font-size:13px;color:#555;margin-bottom:8px">Topic: ${esc(topic)}</div>
      <div style="white-space:pre-wrap;background:#FFF6D6;border:1.5px solid #1E1B2E;border-radius:12px;padding:12px 14px;color:#1E1B2E">${esc(body)}</div>
      <a href="${link}" style="display:inline-block;margin-top:18px;background:#1E1B2E;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold">Reply in Help messages →</a>
      <p style="font-size:12px;color:#777;margin:18px 0 0">Answer inside the website so ${esc(artistName)} sees it in their Help chat.</p>
    </div>
  </div>`;
  return { subject, html, text };
}
