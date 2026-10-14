"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getViewer } from "../../lib/supabase";
import { readAnswers } from "../../lib/questions";
import { ASTRO_SECTIONS } from "../../lib/astro-questions";

async function requireAdmin() {
  const v = await getViewer();
  if (v.profile?.role !== "admin") redirect("/login");
  return v.supabase;
}

// Admin saves (or corrects) the artist's Astro questionnaire answers.
export async function saveAstroAnswers(formData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("artist_id") || "").slice(0, 60);
  const answers = readAnswers(formData, ASTRO_SECTIONS);
  const { error } = await supabase
    .from("artists")
    .update({ astro_answers: answers, astro_done_at: new Date().toISOString() })
    .eq("id", id);
  if (error) redirect(`/admin/artists/${id}/astro/questionnaire?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/admin/artists/${id}/astro`);
  redirect(`/admin/artists/${id}/astro/questionnaire?ok=saved`);
}

// Astro price calculator: one saved quote per artist (admin only).
export async function saveAstroQuote(artistId, data, total) {
  const supabase = await requireAdmin();
  const id = String(artistId).slice(0, 60);
  const amount = Math.round(Number(total) * 100) / 100;
  if (!Number.isFinite(amount) || !data || typeof data !== "object") return { error: "Invalid quote" };
  const { error } = await supabase
    .from("artists")
    .update({ astro_quote: { ...data, total: amount }, astro_quote_updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath(`/admin/artists/${id}/astro`);
  return error ? { error: error.message } : { ok: true };
}

// Turn the Astro quote into payments the artist sees: one, or two halves.
export async function astroQuoteToPayments(artistId, total, halves, lang = "en") {
  const supabase = await requireAdmin();
  const id = String(artistId).slice(0, 60);
  const amount = Math.round(Number(total) * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Invalid amount" };
  const es = lang === "es";
  const first = Math.round((amount / 2) * 100) / 100;
  const start = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const rows = halves
    ? [
        { artist_id: id, description: es ? "Astro · 50% para comenzar" : "Astro · 50% to get started", amount: first, due_on: start },
        { artist_id: id, description: es ? "Astro · 50% al entregar la marca" : "Astro · 50% on delivery of the brand", amount: Math.round((amount - first) * 100) / 100 },
      ]
    : [{ artist_id: id, description: "Astro", amount, due_on: start }];
  const { error } = await supabase.from("payments").insert(rows);
  revalidatePath(`/admin/artists/${id}`);
  return error ? { error: error.message } : { ok: true };
}
