"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getViewer, supabaseAdmin } from "../../../lib/supabase";
import { SECTIONS, readAnswers } from "../../../lib/questions";
import { startingPoint } from "../../../lib/steps";

// Saves the artist's Launchpad intake and turns it into their starting point.
export async function saveIntake(formData) {
  const { user, profile } = await getViewer();
  if (!user || !profile?.artist_id) redirect("/login");
  const artistId = profile.artist_id;

  const answers = readAnswers(formData, SECTIONS);
  if (!answers.legal_name || !answers.artist_name || !answers.copyright_ack) redirect("/dashboard/intake?error=required");

  const admin = supabaseAdmin();
  const { data: artist } = await admin.from("artists").select("id, legal_name, single_title, release_date, intake_done_at").eq("id", artistId).maybeSingle();
  if (!artist) redirect("/dashboard");
  if (artist.intake_done_at) redirect("/dashboard");

  const { error } = await admin
    .from("artists")
    .update({
      intake_answers: answers,
      intake_done_at: new Date().toISOString(),
      legal_name: artist.legal_name || answers.legal_name || null,
      single_title: artist.single_title || answers.single_title || null,
      release_date: artist.release_date || answers.next_release || null,
    })
    .eq("id", artistId);
  if (error) redirect("/dashboard/intake?error=save");

  // Make sure every step exists, then mark what they already had.
  // Steps the agency has already moved forward are left alone.
  const start = startingPoint(answers);
  await admin
    .from("artist_steps")
    .upsert(start.map((r) => ({ artist_id: artistId, step_key: r.step_key, start_status: "missing", status: "pending" })), { onConflict: "artist_id,step_key", ignoreDuplicates: true });
  const had = start.filter((r) => r.start_status === "had").map((r) => r.step_key);
  if (had.length) {
    await admin.from("artist_steps").update({ start_status: "had" }).eq("artist_id", artistId).in("step_key", had);
    await admin.from("artist_steps").update({ status: "had" }).eq("artist_id", artistId).in("step_key", had).eq("status", "pending");
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?welcome=1");
}
