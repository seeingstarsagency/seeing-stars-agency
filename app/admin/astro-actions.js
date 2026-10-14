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

// Admin saves the Artist DNA: the curated source for every Astro deliverable.
export async function saveArtistDna(formData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("artist_id") || "").slice(0, 60);
  const { readDna } = await import("../../lib/artist-dna");
  // Merge: keep what lives in the DNA but isn't on this form (e.g. the bios).
  const { data: row } = await supabase.from("artists").select("artist_dna").eq("id", id).maybeSingle();
  const { error } = await supabase
    .from("artists")
    .update({ artist_dna: { ...(row?.artist_dna || {}), ...readDna(formData) }, artist_dna_updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) redirect(`/admin/artists/${id}/astro/dna?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/admin/artists/${id}/astro`);
  redirect(`/admin/artists/${id}/astro/dna?ok=saved`);
}

// Admin marks a manual Artist DNA step (and, for "vn", the voice note or live meeting details).
export async function saveAstroStep(formData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("artist_id") || "").slice(0, 60);
  const key = String(formData.get("step") || "").slice(0, 20);
  const { DNA_STEPS, STATUSES } = await import("../../lib/astro-dna-steps");
  const step = DNA_STEPS.find((s) => s.key === key && !s.auto);
  if (!step) redirect(`/admin/artists/${id}/astro#dna-steps`);
  const g = (k, max = 300) => String(formData.get(k) ?? "").trim().slice(0, max);
  const status = STATUSES[g("status", 10)] ? g("status", 10) : "pend";
  const entry = { status, updated_at: new Date().toISOString() };
  if (key === "vn") {
    entry.mode = g("mode", 10) === "live" ? "live" : "note";
    entry.link = g("link", 500);
    entry.date = /^\d{4}-\d{2}-\d{2}$/.test(g("date", 10)) ? g("date", 10) : "";
    entry.format = g("format", 20);
    entry.minutes = g("minutes", 5);
    entry.recorded = formData.get("recorded") === "on";
    entry.notes = g("notes", 4000);
    entry.quotes = g("quotes", 2000);
  } else {
    entry.note = g("note", 500);
  }
  const { data: row } = await supabase.from("artists").select("astro_steps").eq("id", id).maybeSingle();
  const steps = { ...(row?.astro_steps || {}), [key]: entry };
  const { error } = await supabase.from("artists").update({ astro_steps: steps }).eq("id", id);
  if (error) redirect(`/admin/artists/${id}/astro?step_error=${encodeURIComponent(error.message)}#dna-steps`);
  revalidatePath(`/admin/artists/${id}/astro`);
  redirect(`/admin/artists/${id}/astro?ok=saved#step-${key}`);
}

// Admin saves the bios (one line, short, long; English and Spanish) inside the Artist DNA.
export async function saveBios(formData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("artist_id") || "").slice(0, 60);
  const { BIO_KEYS } = await import("../../lib/bios");
  const bios = Object.fromEntries(BIO_KEYS.map((k) => [k, String(formData.get(k) ?? "").trim().slice(0, 4000)]));
  const { data: row } = await supabase.from("artists").select("artist_dna").eq("id", id).maybeSingle();
  const { error } = await supabase
    .from("artists")
    .update({ artist_dna: { ...(row?.artist_dna || {}), ...bios }, artist_dna_updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) redirect(`/admin/artists/${id}/astro/bios?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/admin/artists/${id}/astro`);
  redirect(`/admin/artists/${id}/astro/bios?ok=saved`);
}
