import { STEPS } from "./steps";
import { supabaseAdmin } from "./supabase";

// Loads everything about one artist using the visitor's own permissions.
export async function loadArtist(supabase, artistId) {
  const [artist, steps, next, notes, milestones, files, songs] = await Promise.all([
    supabase.from("artists").select("*").eq("id", artistId).maybeSingle(),
    supabase.from("artist_steps").select("*").eq("artist_id", artistId),
    supabase.from("next_steps").select("*").eq("artist_id", artistId).order("created_at"),
    supabase.from("notes").select("*").eq("artist_id", artistId).order("created_at", { ascending: false }),
    supabase.from("milestones").select("*").eq("artist_id", artistId).order("happens_on"),
    supabase.from("artist_files").select("*").eq("artist_id", artistId).order("created_at", { ascending: false }),
    supabase.from("songs").select("*").eq("artist_id", artistId).order("release_date", { ascending: false, nullsFirst: true }),
  ]);
  if (!artist.data) return null;
  const order = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));
  const rows = (steps.data || []).sort((a, b) => (order[a.step_key] ?? 99) - (order[b.step_key] ?? 99));
  // The photo lives in a private bucket: hand out a short-lived link.
  let photoUrl = null;
  if (artist.data.photo_path) {
    const { data } = await supabaseAdmin().storage.from("artist-files").createSignedUrl(artist.data.photo_path, 3600);
    photoUrl = data?.signedUrl || null;
  }
  return {
    artist: artist.data,
    photoUrl,
    songs: songs.data || [],
    rows,
    next: next.data || [],
    notes: notes.data || [],
    milestones: milestones.data || [],
    files: files.data || [],
  };
}
