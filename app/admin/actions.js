"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getViewer, supabaseAdmin } from "../../lib/supabase";
import { STEPS, PACKAGES, startingPoint } from "../../lib/steps";
import { SITE_URL } from "../../lib/env";

async function requireAdmin() {
  const v = await getViewer();
  if (v.profile?.role !== "admin") redirect("/login");
  return v.supabase;
}

const str = (fd, k, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);
const siteUrl = SITE_URL;
const today = () => new Date().toISOString().slice(0, 10);

async function invite(email, lang) {
  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/account/set-password`,
    data: { lang },
  });
  if (error) return { error: error.message };
  return { userId: data.user.id };
}

// Create an artist (from a questionnaire or by hand), their checklist, and invite them.
export async function createArtist(formData) {
  const supabase = await requireAdmin();
  const admin = supabaseAdmin();
  const submissionId = str(formData, "submission_id", 60) || null;
  const email = str(formData, "email").toLowerCase();
  const name = str(formData, "name");
  if (!name || !email) redirect(`${submissionId ? `/admin/submissions/${submissionId}` : "/admin/artists/new"}?error=missing`);

  let answers = {};
  if (submissionId) {
    const { data } = await supabase.from("intake_submissions").select("answers").eq("id", submissionId).maybeSingle();
    answers = data?.answers || {};
  }

  const packages = formData.getAll("packages").map(String).filter((p) => PACKAGES.includes(p));
  const lang = formData.get("lang") === "es" ? "es" : "en";
  const { data: artist, error } = await supabase
    .from("artists")
    .insert({
      name,
      email,
      lang,
      packages,
      legal_name: str(formData, "legal_name") || answers.legal_name || null,
      single_title: str(formData, "single_title") || null,
      release_date: str(formData, "release_date", 10) || null,
      intake_id: submissionId,
    })
    .select("id")
    .single();
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  await supabase.from("artist_steps").insert(startingPoint(answers).map((r) => ({ ...r, artist_id: artist.id })));
  if (submissionId) {
    await supabase.from("intake_submissions").update({ status: "converted", artist_id: artist.id }).eq("id", submissionId);
  }

  const sendInvite = formData.get("send_invite") === "on";
  let note = "created";
  if (sendInvite) {
    const res = await invite(email, lang);
    if (res.userId) {
      await admin.from("profiles").upsert({ id: res.userId, role: "artist", artist_id: artist.id });
      await admin.from("artists").update({ user_id: res.userId }).eq("id", artist.id);
      note = "invited";
    } else {
      note = "invite_failed";
    }
  }
  revalidatePath("/admin");
  redirect(`/admin/artists/${artist.id}?ok=${note}`);
}

export async function resendInvite(formData) {
  await requireAdmin();
  const admin = supabaseAdmin();
  const id = str(formData, "artist_id", 60);
  const { data: artist } = await admin.from("artists").select("id, email, lang").eq("id", id).single();
  const res = await invite(artist.email, artist.lang);
  if (res.userId) {
    await admin.from("profiles").upsert({ id: res.userId, role: "artist", artist_id: artist.id });
    await admin.from("artists").update({ user_id: res.userId }).eq("id", artist.id);
  }
  redirect(`/admin/artists/${id}?ok=${res.userId ? "invited" : "invite_failed"}`);
}

export async function updateArtist(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  await supabase
    .from("artists")
    .update({
      name: str(formData, "name"),
      lang: formData.get("lang") === "es" ? "es" : "en",
      packages: formData.getAll("packages").map(String).filter((p) => PACKAGES.includes(p)),
      single_title: str(formData, "single_title") || null,
      release_date: str(formData, "release_date", 10) || null,
      closed_at: str(formData, "closed_at", 10) || null,
    })
    .eq("id", id);
  revalidatePath(`/admin/artists/${id}`);
  redirect(`/admin/artists/${id}?ok=saved`);
}

export async function updateSteps(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  const { data: current } = await supabase.from("artist_steps").select("step_key, status, done_on").eq("artist_id", id);
  const byKey = Object.fromEntries((current || []).map((r) => [r.step_key, r]));
  const allowed = ["had", "done", "in_progress", "pending"];
  for (const s of STEPS) {
    const status = String(formData.get(`status_${s.key}`) || "");
    if (!allowed.includes(status) || !byKey[s.key] || byKey[s.key].status === status) continue;
    const done_on = status === "done" ? byKey[s.key].done_on || today() : null;
    await supabase.from("artist_steps").update({ status, done_on, updated_at: new Date().toISOString() }).eq("artist_id", id).eq("step_key", s.key);
  }
  revalidatePath(`/admin/artists/${id}`);
  redirect(`/admin/artists/${id}?ok=saved#steps`);
}

export async function addNextStep(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  const body = str(formData, "body", 500);
  if (body) await supabase.from("next_steps").insert({ artist_id: id, owner: formData.get("owner") === "artist" ? "artist" : "agency", body });
  redirect(`/admin/artists/${id}#next`);
}

export async function toggleNextStep(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  await supabase.from("next_steps").update({ done: formData.get("done") === "true" }).eq("id", str(formData, "id", 60));
  redirect(`/admin/artists/${id}#next`);
}

export async function addNote(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  const body = str(formData, "body", 2000);
  if (body) await supabase.from("notes").insert({ artist_id: id, body });
  redirect(`/admin/artists/${id}#notes`);
}

export async function addMilestone(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  const body = str(formData, "body", 300);
  const date = str(formData, "happens_on", 10);
  if (body && date) await supabase.from("milestones").insert({ artist_id: id, body, happens_on: date });
  redirect(`/admin/artists/${id}#timeline`);
}

export async function toggleMilestone(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  await supabase.from("milestones").update({ done: formData.get("done") === "true" }).eq("id", str(formData, "id", 60));
  redirect(`/admin/artists/${id}#timeline`);
}

// Delete a row from one of the artist's lists.
export async function deleteItem(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  const table = String(formData.get("table"));
  const itemId = str(formData, "id", 60);
  if (!["next_steps", "notes", "milestones", "artist_files"].includes(table)) redirect(`/admin/artists/${id}`);
  if (table === "artist_files") {
    const { data } = await supabase.from("artist_files").select("path").eq("id", itemId).maybeSingle();
    if (data?.path) await supabaseAdmin().storage.from("artist-files").remove([data.path]);
  }
  await supabase.from(table).delete().eq("id", itemId).eq("artist_id", id);
  redirect(`/admin/artists/${id}`);
}

// Files go straight from the browser to storage (no size limit from the website server).
export async function getUploadTicket(artistId, fileName) {
  await requireAdmin();
  const safe = String(fileName).replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "file";
  const path = `${artistId}/${Date.now()}-${safe}`;
  const { data, error } = await supabaseAdmin().storage.from("artist-files").createSignedUploadUrl(path);
  if (error) return { error: error.message };
  return { path, token: data.token };
}

export async function registerFile(artistId, name, path) {
  await requireAdmin();
  if (!String(path).startsWith(`${artistId}/`)) return { error: "bad path" };
  const { error } = await supabaseAdmin().from("artist_files").insert({ artist_id: artistId, name: String(name).slice(0, 200), path });
  revalidatePath(`/admin/artists/${artistId}`);
  return error ? { error: error.message } : { ok: true };
}

export async function archiveSubmission(formData) {
  const supabase = await requireAdmin();
  await supabase.from("intake_submissions").update({ status: "archived" }).eq("id", str(formData, "id", 60));
  redirect("/admin");
}
