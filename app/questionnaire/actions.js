"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../lib/supabase";
import { FINDER, readAnswers, recommendPackages } from "../../lib/questions";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public "find your package" form: saves the lead and shows the recommendation.
export async function submitFinder(formData) {
  const answers = readAnswers(formData, FINDER);
  const recommended = recommendPackages(answers);
  const result = `/questionnaire/thanks?p=${recommended.join(",")}&n=${encodeURIComponent(answers.artist_name.slice(0, 60))}`;

  // Bots fill the hidden field; people don't.
  if (String(formData.get("company") || "")) redirect(result);

  const lang = formData.get("lang") === "es" ? "es" : "en";
  if (!answers.artist_name || !EMAIL.test(answers.email)) redirect("/questionnaire?error=required");

  let ok = true;
  try {
    const { error } = await supabaseAdmin().from("intake_submissions").insert({
      lang,
      artist_name: answers.artist_name.slice(0, 200),
      email: answers.email.toLowerCase().slice(0, 200),
      answers: { ...answers, recommended },
    });
    if (error) ok = false;
  } catch {
    ok = false;
  }
  redirect(ok ? result : "/questionnaire?error=save");
}
