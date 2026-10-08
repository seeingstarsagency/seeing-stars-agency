import { startingPoint } from "./steps";

// Saves Launchpad intake answers for an artist and sets their starting point.
// Used when the artist fills it in, and when the admin types in a paper copy.
// `admin` must be the service-role client.
export async function applyIntake(admin, artistId, answers) {
  const { data: artist } = await admin.from("artists").select("id, legal_name, single_title, release_date, intake_done_at").eq("id", artistId).maybeSingle();
  if (!artist) return { error: "Artist not found" };

  const { error } = await admin
    .from("artists")
    .update({
      intake_answers: answers,
      intake_done_at: artist.intake_done_at || new Date().toISOString(),
      legal_name: artist.legal_name || answers.legal_name || null,
      single_title: artist.single_title || answers.single_title || null,
      release_date: artist.release_date || answers.next_release || null,
    })
    .eq("id", artistId);
  if (error) return { error: error.message };

  // Make sure every step exists.
  const start = startingPoint(answers);
  await admin
    .from("artist_steps")
    .upsert(start.map((r) => ({ artist_id: artistId, step_key: r.step_key, start_status: "missing", status: "pending" })), { onConflict: "artist_id,step_key", ignoreDuplicates: true });

  const had = start.filter((r) => r.start_status === "had").map((r) => r.step_key);
  const missing = start.filter((r) => r.start_status !== "had").map((r) => r.step_key);
  // Starting point follows the answers. Current status only changes where it
  // still reflects the starting point (pending <-> had); work done together is kept.
  if (had.length) {
    await admin.from("artist_steps").update({ start_status: "had" }).eq("artist_id", artistId).in("step_key", had);
    await admin.from("artist_steps").update({ status: "had" }).eq("artist_id", artistId).in("step_key", had).eq("status", "pending");
  }
  if (missing.length) {
    await admin.from("artist_steps").update({ start_status: "missing" }).eq("artist_id", artistId).in("step_key", missing);
    await admin.from("artist_steps").update({ status: "pending" }).eq("artist_id", artistId).in("step_key", missing).eq("status", "had");
  }
  // First song on their profile: the single from the questionnaire.
  if (answers.single_title) {
    const { count } = await admin.from("songs").select("id", { count: "exact", head: true }).eq("artist_id", artistId);
    if (!count) await admin.from("songs").insert({ artist_id: artistId, title: answers.single_title.slice(0, 200), release_date: answers.next_release || null });
  }
  return { ok: true };
}
