"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "../../lib/supabase";
import { readAnswers } from "../../lib/questions";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitQuestionnaire(formData) {
  // Bots fill the hidden field; people don't.
  if (String(formData.get("company") || "")) redirect("/questionnaire/thanks");

  const lang = formData.get("lang") === "es" ? "es" : "en";
  const answers = readAnswers(formData);
  if (!answers.artist_name || !answers.legal_name || !EMAIL.test(answers.email)) redirect("/questionnaire?error=required");

  let ok = true;
  try {
    const { error } = await supabaseAdmin().from("intake_submissions").insert({
      lang,
      artist_name: answers.artist_name.slice(0, 200),
      email: answers.email.toLowerCase().slice(0, 200),
      answers,
    });
    if (error) ok = false;
  } catch {
    ok = false;
  }
  redirect(ok ? "/questionnaire/thanks" : "/questionnaire?error=save");
}
