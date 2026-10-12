// Emails to the admin. Server-only. Uses Resend's HTTP API (no extra package).
import { RESEND_API_KEY, ADMIN_EMAIL, EMAIL_FROM, SITE_URL } from "./env";

const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Until seeingstarsagency.com is verified in Resend, Resend only delivers to the address that owns the
// Resend account. If it refuses the admin address for that reason, the email goes there instead.
const RESEND_OWNER = "seeingstarsagency@gmail.com";

async function post(key, to, { subject, html, text }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: EMAIL_FROM(), to: [to], subject, html, text }),
  });
  return res.ok ? { ok: true } : { error: `${res.status} ${await res.text().catch(() => "")}`.slice(0, 300) };
}

export async function emailAdmin(mail) {
  const key = RESEND_API_KEY();
  if (!key) return { skipped: true };
  try {
    const to = ADMIN_EMAIL();
    const res = await post(key, to, mail);
    if (res.error && to !== RESEND_OWNER && /verify a domain|testing emails|own email address/i.test(res.error)) {
      return post(key, RESEND_OWNER, mail);
    }
    if (res.error) console.error("emailAdmin:", res.error);
    return res;
  } catch (e) {
    return { error: String(e?.message || e) };
  }
}

// "Someone used Find your package" alert.
export function finderEmail({ artistName, email, lang, recommended }) {
  const link = `${SITE_URL()}/admin/requests`;
  const pk = (recommended || []).join(", ") || "—";
  const subject = `✦ New request from ${artistName} — Find your package`;
  const text = `${artistName} (${email}) used Find your package.\nRecommended: ${pk}\nLanguage: ${lang === "es" ? "Spanish" : "English"}\n\nSee their answers: ${link}`;
  const html = `
  <div style="font-family:Georgia,serif;background:#FBFAF6;padding:24px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:2px solid #1E1B2E;border-radius:18px;padding:24px">
      <div style="color:#C2417F;font-size:18px">a new artist found you ✦</div>
      <h2 style="margin:6px 0 12px;font-style:italic;color:#1E1B2E">${esc(artistName)} used Find your package</h2>
      <p style="margin:0 0 6px;color:#1E1B2E"><strong>Email:</strong> ${esc(email)}</p>
      <p style="margin:0 0 6px;color:#1E1B2E"><strong>Recommended:</strong> ${esc(pk)}</p>
      <p style="margin:0 0 6px;color:#1E1B2E"><strong>Language:</strong> ${lang === "es" ? "Spanish" : "English"}</p>
      <a href="${link}" style="display:inline-block;margin-top:14px;background:#1E1B2E;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold">See their answers →</a>
    </div>
  </div>`;
  return { subject, html, text };
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
