import { STEPS } from "./steps";

// Loads everything about one artist using the visitor's own permissions.
export async function loadArtist(supabase, artistId) {
  const [artist, steps, next, notes, milestones, files] = await Promise.all([
    supabase.from("artists").select("*").eq("id", artistId).maybeSingle(),
    supabase.from("artist_steps").select("*").eq("artist_id", artistId),
    supabase.from("next_steps").select("*").eq("artist_id", artistId).order("created_at"),
    supabase.from("notes").select("*").eq("artist_id", artistId).order("created_at", { ascending: false }),
    supabase.from("milestones").select("*").eq("artist_id", artistId).order("happens_on"),
    supabase.from("artist_files").select("*").eq("artist_id", artistId).order("created_at", { ascending: false }),
  ]);
  if (!artist.data) return null;
  const order = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));
  const rows = (steps.data || []).sort((a, b) => (order[a.step_key] ?? 99) - (order[b.step_key] ?? 99));
  return {
    artist: artist.data,
    rows,
    next: next.data || [],
    notes: notes.data || [],
    milestones: milestones.data || [],
    files: files.data || [],
  };
}
