import { startingPoint } from "./steps";
import { ensureSteps, applyStart, makeProjectSong } from "./steps-db";

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

  const start = startingPoint(answers);
  // Once-per-artist steps (memberships, brand).
  await ensureSteps(admin, artistId, null, start);
  await applyStart(admin, artistId, null, start);
  // The song from the questionnaire becomes the first agency project.
  const songId = await makeProjectSong(admin, artistId, artist.single_title || answers.single_title, artist.release_date || answers.next_release || null, start);
  if (songId) await applyStart(admin, artistId, songId, start);
  return { ok: true };
}
