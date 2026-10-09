import { SONG_STEPS, ARTIST_STEPS } from "./steps";

// Rows for one scope: the artist's own steps (songId null) or one song's steps.
function scoped(query, artistId, songId) {
  query = query.eq("artist_id", artistId);
  return songId ? query.eq("song_id", songId) : query.is("song_id", null);
}

// Make sure every step of that scope has a row. `start` = { key: "had" | "missing" }.
export async function ensureSteps(db, artistId, songId = null, start = {}) {
  const steps = songId ? SONG_STEPS : ARTIST_STEPS;
  const { data } = await scoped(db.from("artist_steps").select("step_key"), artistId, songId);
  const have = new Set((data || []).map((r) => r.step_key));
  const missing = steps
    .filter((s) => !have.has(s.key))
    .map((s) => {
      const had = start[s.key] === "had";
      return { artist_id: artistId, song_id: songId, step_key: s.key, start_status: had ? "had" : "missing", status: had ? "had" : "pending" };
    });
  if (missing.length) await db.from("artist_steps").insert(missing);
}

// Re-apply a starting point to existing rows. Work already done together is kept:
// only "pending" <-> "had" follow the answers.
export async function applyStart(db, artistId, songId, start) {
  const keys = (songId ? SONG_STEPS : ARTIST_STEPS).map((s) => s.key);
  const had = keys.filter((k) => start[k] === "had");
  const missing = keys.filter((k) => start[k] !== "had");
  if (had.length) {
    await scoped(db.from("artist_steps").update({ start_status: "had" }), artistId, songId).in("step_key", had);
    await scoped(db.from("artist_steps").update({ status: "had" }), artistId, songId).in("step_key", had).eq("status", "pending");
  }
  if (missing.length) {
    await scoped(db.from("artist_steps").update({ start_status: "missing" }), artistId, songId).in("step_key", missing);
    await scoped(db.from("artist_steps").update({ status: "pending" }), artistId, songId).in("step_key", missing).eq("status", "had");
  }
}

// Find (or create) the song by title and make it an agency project with its own steps.
export async function makeProjectSong(db, artistId, title, releaseDate = null, start = {}) {
  const clean = String(title || "").trim();
  if (!clean) return null;
  const { data: songs } = await db.from("songs").select("id, title, release_date").eq("artist_id", artistId);
  let song = (songs || []).find((s) => s.title.trim().toLowerCase() === clean.toLowerCase());
  if (song) {
    await db.from("songs").update({ is_project: true, ...(releaseDate && !song.release_date ? { release_date: releaseDate } : {}) }).eq("id", song.id);
  } else {
    const { data } = await db.from("songs").insert({ artist_id: artistId, title: clean.slice(0, 200), release_date: releaseDate || null, is_project: true }).select("id").single();
    song = data;
  }
  if (!song) return null;
  await ensureSteps(db, artistId, song.id, start);
  return song.id;
}
