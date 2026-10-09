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
