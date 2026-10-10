"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getViewer, supabaseAdmin } from "../../lib/supabase";
import { PACKAGES } from "../../lib/steps";
import { ensureSteps, makeProjectSong } from "../../lib/steps-db";
import { SITE_URL, spotifyConfigured } from "../../lib/env";
import { SECTIONS, readAnswers, cleanUrl } from "../../lib/questions";
import { applyIntake } from "../../lib/intake";
import { appleArtistSongs } from "../../lib/apple-music";
import { spotifyArtistSongs } from "../../lib/spotify";

async function requireAdmin() {
  const v = await getViewer();
  if (v.profile?.role !== "admin") redirect("/login");
  return v.supabase;
}

const str = (fd, k, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);
const siteUrl = SITE_URL;
const today = () => new Date().toISOString().slice(0, 10);

// name and packages fill in the "for {name}" and "{package}" parts of the invitation email template.
async function invite(email, lang, name, packages) {
  const admin = supabaseAdmin();
  const pkg = (packages || []).join(" + ");
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/account/set-password`,
    data: { lang, ...(name ? { artist_name: name } : {}), ...(pkg ? { package: pkg } : {}) },
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

  await ensureSteps(supabase, artist.id, null);
  const single = str(formData, "single_title");
  if (single) await makeProjectSong(supabase, artist.id, single, str(formData, "release_date", 10) || null);
  if (submissionId) {
    await supabase.from("intake_submissions").update({ status: "converted", artist_id: artist.id }).eq("id", submissionId);
  }

  const sendInvite = formData.get("send_invite") === "on";
  let note = "created";
  if (sendInvite) {
    const res = await invite(email, lang, name, packages);
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
  const { data: artist } = await admin.from("artists").select("id, email, lang, name, packages").eq("id", id).single();
  const res = await invite(artist.email, artist.lang, artist.name, artist.packages);
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
      monthly_member: formData.get("monthly_member") === "on",
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
  const song = str(formData, "song", 60);
  const { data: current } = await supabase.from("artist_steps").select("id, status, done_on").eq("artist_id", id);
  const byId = Object.fromEntries((current || []).map((r) => [r.id, r]));
  const allowed = ["had", "done", "in_progress", "pending"];
  for (const [name, value] of formData.entries()) {
    if (!name.startsWith("status_")) continue;
    const row = byId[name.slice(7)];
    const status = String(value);
    if (!row || !allowed.includes(status) || row.status === status) continue;
    const done_on = status === "done" ? row.done_on || today() : null;
    await supabase.from("artist_steps").update({ status, done_on, updated_at: new Date().toISOString() }).eq("id", row.id).eq("artist_id", id);
  }
  revalidatePath(`/admin/artists/${id}`);
  revalidatePath("/dashboard/astro");
  if (str(formData, "back", 20) === "astro") redirect(`/admin/artists/${id}/astro?ok=saved#brand`);
  redirect(`/admin/artists/${id}?ok=saved${song ? `&song=${song}` : ""}#steps`);
}

// Turn a song into an agency project (it gets its own step list) or back.
export async function toggleProjectSong(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  const songId = str(formData, "song_id", 60);
  const on = formData.get("on") === "true";
  await supabase.from("songs").update({ is_project: on }).eq("id", songId).eq("artist_id", id);
  if (on) await ensureSteps(supabase, id, songId);
  revalidatePath(`/admin/artists/${id}`);
  revalidatePath("/dashboard");
  redirect(`/admin/artists/${id}${on ? `?song=${songId}` : ""}#songs`);
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

export async function addSong(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  const title = str(formData, "title", 200);
  if (title) {
    await supabase.from("songs").insert({ artist_id: id, title, release_date: str(formData, "release_date", 10) || null, link: cleanUrl(formData.get("link")) || null });
  }
  redirect(`/admin/artists/${id}#songs`);
}

export async function toggleMilestone(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  await supabase.from("milestones").update({ done: formData.get("done") === "true" }).eq("id", str(formData, "id", 60));
  redirect(`/admin/artists/${id}#timeline`);
}

// ---------- Payments (the artist sees them under "Your payments") ----------
export async function addPayment(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  const description = str(formData, "description", 200);
  const amount = Math.round(Number(String(formData.get("amount") || "").replace(/[^0-9.]/g, "")) * 100) / 100;
  const due = str(formData, "due_on", 10);
  if (description && Number.isFinite(amount)) {
    await supabase.from("payments").insert({ artist_id: id, description, amount, due_on: /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null });
  }
  redirect(`/admin/artists/${id}#payments`);
}

export async function togglePayment(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  const paid = formData.get("paid") === "true";
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  await supabase.from("payments").update({ status: paid ? "paid" : "pending", paid_on: paid ? today : null }).eq("id", str(formData, "id", 60)).eq("artist_id", id);
  revalidatePath("/dashboard");
  redirect(`/admin/artists/${id}#payments`);
}

// Delete a row from one of the artist's lists.
export async function deleteItem(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  const table = String(formData.get("table"));
  const itemId = str(formData, "id", 60);
  if (!["next_steps", "notes", "milestones", "artist_files", "songs", "payments"].includes(table)) redirect(`/admin/artists/${id}`);
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
  redirect("/admin/requests");
}

// The admin types in (or corrects) an artist's Launchpad questionnaire, e.g. from a paper copy.
export async function saveIntakeForArtist(formData) {
  await requireAdmin();
  const artistId = str(formData, "artist_id", 60);
  const answers = readAnswers(formData, SECTIONS);
  const res = await applyIntake(supabaseAdmin(), artistId, answers);
  if (res.error) redirect(`/admin/artists/${artistId}/intake?error=${encodeURIComponent(res.error)}`);
  revalidatePath(`/admin/artists/${artistId}`);
  redirect(`/admin/artists/${artistId}/questionnaire?ok=intake`);
}

// Add imported songs without duplicates: a song already on the list (same title)
// just gets the missing details (other platform's link, artwork, date).
async function mergeSongs(supabase, artistId, songs) {
  const { data: existing } = await supabase.from("songs").select("*").eq("artist_id", artistId);
  const byTitle = new Map((existing || []).map((s) => [s.title.trim().toLowerCase(), s]));
  let added = 0;
  for (const s of songs) {
    const prev = byTitle.get(s.title.trim().toLowerCase());
    if (prev) {
      const patch = {};
      for (const k of ["link", "spotify_url", "artwork_url", "release_date"]) if (s[k] && !prev[k]) patch[k] = s[k];
      if (!prev.source_id) patch.source_id = s.source_id;
      if (Object.keys(patch).length) await supabase.from("songs").update(patch).eq("id", prev.id);
      continue;
    }
    const { error } = await supabase.from("songs").insert({ artist_id: artistId, ...s });
    if (error) console.error("song insert failed", error.message);
    if (!error) {
      added++;
      byTitle.set(s.title.trim().toLowerCase(), s);
    }
  }
  return added;
}

// Bring the artist's released songs from Apple Music's public catalog.
export async function importAppleSongs(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  const appleId = str(formData, "apple_artist_id", 20).replace(/\D/g, "");
  if (!appleId) redirect(`/admin/artists/${id}?import_error=apple#songs`);
  let songs;
  try {
    songs = await appleArtistSongs(appleId);
  } catch (e) {
    redirect(`/admin/artists/${id}?import_error=apple&detail=${encodeURIComponent(String(e?.message || e).slice(0, 160))}#songs`);
  }
  await supabase.from("artists").update({ apple_artist_id: appleId }).eq("id", id);
  const added = await mergeSongs(supabase, id, songs);
  revalidatePath(`/admin/artists/${id}`);
  revalidatePath("/dashboard");
  redirect(`/admin/artists/${id}?imported=${added}&found=${songs.length}&from=apple#songs`);
}

// Same, from Spotify (needs the Spotify app keys in Vercel).
export async function importSpotifySongs(formData) {
  const supabase = await requireAdmin();
  const id = str(formData, "artist_id", 60);
  const spId = str(formData, "spotify_artist_id", 40).replace(/[^A-Za-z0-9]/g, "");
  if (!spId || !spotifyConfigured()) redirect(`/admin/artists/${id}?import_error=spotify#songs`);
  let songs;
  try {
    songs = await spotifyArtistSongs(spId);
  } catch (e) {
    redirect(`/admin/artists/${id}?import_error=spotify&detail=${encodeURIComponent(String(e?.message || e).slice(0, 160))}#songs`);
  }
  await supabase.from("artists").update({ spotify_artist_id: spId }).eq("id", id);
  const added = await mergeSongs(supabase, id, songs);
  revalidatePath(`/admin/artists/${id}`);
  revalidatePath("/dashboard");
  redirect(`/admin/artists/${id}?imported=${added}&found=${songs.length}&from=spotify#songs`);
}

// ---------- New requests ("Find your package") ----------
// Spam: removed for good.
export async function deleteSubmission(formData) {
  const supabase = await requireAdmin();
  await supabase.from("intake_submissions").delete().eq("id", str(formData, "id", 60));
  revalidatePath("/admin");
  revalidatePath("/admin/requests");
  redirect("/admin/requests?ok=deleted");
}

// Already working with us: leaves the "new" list but stays on record (and can be undone).
export async function markSubmissionWithUs(formData) {
  const supabase = await requireAdmin();
  const undo = formData.get("undo") === "1";
  await supabase.from("intake_submissions").update({ status: undo ? "new" : "converted" }).eq("id", str(formData, "id", 60));
  revalidatePath("/admin");
  revalidatePath("/admin/requests");
  redirect(`/admin/requests?ok=${undo ? "restored" : "checked"}`);
}

// Help inbox: mark an artist's open messages as solved.
export async function setHelpStatus(formData) {
  const supabase = await requireAdmin();
  const artistId = str(formData, "artist_id", 60);
  await supabase.from("help_messages").update({ status: "resolved" }).eq("artist_id", artistId).eq("sender", "artist").eq("status", "open");
  revalidatePath("/admin");
  redirect(`/admin/help#t-${artistId}`);
}

// Help inbox: answer an artist inside the website. Their open messages count as answered.
export async function replyHelp(formData) {
  const supabase = await requireAdmin();
  const artistId = str(formData, "artist_id", 60);
  const body = String(formData.get("body") || "").trim().slice(0, 4000);
  if (body) {
    await supabaseAdmin().from("help_messages").insert({ artist_id: artistId, sender: "agency", body, status: "resolved", seen_by_artist: false });
    await supabase.from("help_messages").update({ status: "resolved" }).eq("artist_id", artistId).eq("sender", "artist").eq("status", "open");
  }
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect(`/admin/help?ok=sent#t-${artistId}`);
}
