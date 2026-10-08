"use server";

import { revalidatePath } from "next/cache";
import { getViewer, supabaseAdmin } from "../lib/supabase";

// Whose photo this person may change: their own, or any artist's if admin.
async function target(artistId) {
  const { user, profile } = await getViewer();
  if (!user) return null;
  if (profile?.role === "admin") return artistId || null;
  return profile?.artist_id || null;
}

export async function getPhotoTicket(artistId, fileName, type) {
  const id = await target(artistId);
  if (!id) return { error: "not allowed" };
  if (!String(type).startsWith("image/")) return { error: "image only" };
  const ext = (String(fileName).match(/\.(jpe?g|png|webp|gif|heic)$/i)?.[1] || "jpg").toLowerCase();
  const path = `${id}/photo-${Date.now()}.${ext}`;
  const { data, error } = await supabaseAdmin().storage.from("artist-files").createSignedUploadUrl(path);
  if (error) return { error: error.message };
  return { path, token: data.token };
}

export async function savePhoto(artistId, path) {
  const id = await target(artistId);
  if (!id || !String(path).startsWith(`${id}/photo-`)) return { error: "not allowed" };
  const admin = supabaseAdmin();
  const { data: old } = await admin.from("artists").select("photo_path").eq("id", id).maybeSingle();
  const { error } = await admin.from("artists").update({ photo_path: path }).eq("id", id);
  if (error) return { error: error.message };
  if (old?.photo_path && old.photo_path !== path) await admin.storage.from("artist-files").remove([old.photo_path]);
  revalidatePath("/dashboard");
  revalidatePath(`/admin/artists/${id}`);
  return { ok: true };
}
