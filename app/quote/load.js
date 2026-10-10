import { supabaseAdmin } from "../../lib/supabase";

// Finds a sent quote by its private link. Server-only (uses the service key; the link is the permission).
export async function loadQuoteByToken(token) {
  if (!token || typeof token !== "string" || token.length < 20 || token.length > 80) return { state: "missing" };
  const admin = supabaseAdmin();
  const { data: q } = await admin.from("artist_quotes").select("artist_id, sent_data, sent_lang, expires_at, accepted_at, accepted_name, accepted_choice, sent_agreement").eq("token", token).maybeSingle();
  if (!q?.sent_data) return { state: "missing" };
  const { data: artist } = await admin.from("artists").select("id, name, email, lang").eq("id", q.artist_id).maybeSingle();
  if (!artist) return { state: "missing" };
  const lang = q.sent_lang === "es" ? "es" : "en";
  const { data: pay } = await admin.from("agency_settings").select("value").eq("key", `payment_${lang}`).maybeSingle();
  const state = q.accepted_at ? "accepted" : new Date(q.expires_at) < new Date() ? "expired" : "open";
  return { state, quote: q, artist, lang, snap: q.sent_data, payment: pay?.value || "" };
}
