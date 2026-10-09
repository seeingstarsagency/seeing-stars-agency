"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getViewer, supabaseAdmin } from "../../lib/supabase";

// The artist picks where their songs open: Spotify or Apple Music.
export async function setListenPlatform(formData) {
  const { user, profile } = await getViewer();
  if (!user || !profile?.artist_id) redirect("/login");
  const value = formData.get("platform") === "apple" ? "apple" : "spotify";
  await supabaseAdmin().from("artists").update({ listen_platform: value }).eq("id", profile.artist_id);
  revalidatePath("/dashboard");
  redirect("/dashboard#songs");
}

// ---------- Release & content calendars ----------
// The artist edits their own; an admin edits any artist's (from the dashboard preview).
async function calendarViewer(formData) {
  const { user, profile } = await getViewer();
  if (!user) redirect("/login");
  const isAdmin = profile?.role === "admin";
  const artistId = isAdmin ? String(formData.get("artist_id") || "") : profile?.artist_id;
  if (!artistId) redirect("/login");
  const back = isAdmin ? `/dashboard?artist=${artistId}` : "/dashboard";
  return { isAdmin, artistId, back };
}

const KINDS = ["release", "content"];
const STATUSES = { release: ["pending", "done"], content: ["pending", "ready", "posted"] };
const clean = (v, max = 160) => String(v || "").trim().slice(0, max);

export async function addCalendarItem(formData) {
  const { isAdmin, artistId, back } = await calendarViewer(formData);
  const kind = KINDS.includes(formData.get("kind")) ? formData.get("kind") : "release";
  const date = String(formData.get("happens_on") || "");
  const title = clean(formData.get("title"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !title) redirect(`${back}#cal-${kind}`);
  const db = supabaseAdmin();
  let songId = String(formData.get("song_id") || "") || null;
  if (songId) {
    const { data } = await db.from("songs").select("id").eq("id", songId).eq("artist_id", artistId).maybeSingle();
    if (!data) songId = null;
  }
  const status = STATUSES[kind].includes(formData.get("status")) ? formData.get("status") : "pending";
  await db.from("calendar_items").insert({
    artist_id: artistId,
    kind,
    happens_on: date,
    title,
    song_id: songId,
    platform: kind === "content" ? clean(formData.get("platform"), 40) || null : null,
    format: kind === "content" ? clean(formData.get("format"), 40) || null : null,
    status,
    created_by: isAdmin ? "agency" : "artist",
  });
  revalidatePath("/dashboard");
  redirect(`${back}${back.includes("?") ? "&" : "?"}cal=${date.slice(0, 7)}#cal-${kind}`);
}

export async function setCalendarStatus(formData) {
  const { artistId, back } = await calendarViewer(formData);
  const id = String(formData.get("id") || "");
  const db = supabaseAdmin();
  const { data: item } = await db.from("calendar_items").select("id, kind").eq("id", id).eq("artist_id", artistId).maybeSingle();
  if (item && STATUSES[item.kind].includes(formData.get("status"))) {
    await db.from("calendar_items").update({ status: formData.get("status") }).eq("id", id);
  }
  revalidatePath("/dashboard");
  redirect(`${back}#cal-${item?.kind || "release"}`);
}

export async function deleteCalendarItem(formData) {
  const { isAdmin, artistId, back } = await calendarViewer(formData);
  const id = String(formData.get("id") || "");
  const db = supabaseAdmin();
  const { data: item } = await db.from("calendar_items").select("id, kind, created_by").eq("id", id).eq("artist_id", artistId).maybeSingle();
  // Artists can remove what they added; the agency's dates stay unless an admin removes them.
  if (item && (isAdmin || item.created_by === "artist")) await db.from("calendar_items").delete().eq("id", id);
  revalidatePath("/dashboard");
  redirect(`${back}#cal-${item?.kind || "release"}`);
}
