"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getViewer, supabaseAdmin } from "../../../lib/supabase";
import { SECTIONS, readAnswers } from "../../../lib/questions";
import { applyIntake } from "../../../lib/intake";

// The artist sends their Launchpad intake (only once; after that the agency edits it).
export async function saveIntake(formData) {
  const { user, profile } = await getViewer();
  if (!user || !profile?.artist_id) redirect("/login");
  const artistId = profile.artist_id;

  const answers = readAnswers(formData, SECTIONS);
  if (!answers.legal_name || !answers.artist_name || !answers.copyright_ack) redirect("/dashboard/intake?error=required");

  const admin = supabaseAdmin();
  const { data: artist } = await admin.from("artists").select("intake_done_at").eq("id", artistId).maybeSingle();
  if (!artist || artist.intake_done_at) redirect("/dashboard");

  const res = await applyIntake(admin, artistId, answers);
  if (res.error) redirect("/dashboard/intake?error=save");

  revalidatePath("/dashboard");
  redirect("/dashboard?welcome=1");
}
