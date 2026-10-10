"use server";

import { supabaseAdmin } from "../../../lib/supabase";
import { loadQuoteByToken } from "../load";
import { QT, halves, confirmEmail, acceptedAdminEmail } from "../../../lib/quote-send";
import { sendEmail } from "../../../lib/mail";
import { ADMIN_EMAIL, SITE_URL } from "../../../lib/env";

export async function acceptQuote(token, choice, name, agreed) {
  const r = await loadQuoteByToken(token);
  if (r.state !== "open") return { state: r.state };
  const signer = String(name || "").trim().slice(0, 200);
  if (!["two", "full"].includes(choice) || !agreed || signer.length < 3) return { error: "incomplete" };

  const admin = supabaseAdmin();
  const now = new Date().toISOString();
  // Only the first acceptance counts (guards against double clicks).
  const { data: updated, error } = await admin
    .from("artist_quotes")
    .update({ accepted_at: now, accepted_name: signer, accepted_choice: choice })
    .eq("token", token)
    .is("accepted_at", null)
    .select("artist_id");
  if (error) return { error: "save" };
  if (!updated?.length) return { state: "accepted" };

  const t = QT[r.lang];
  const total = Number(r.snap.total);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const [a, b] = halves(total);
  const rows = choice === "two"
    ? [
        { artist_id: r.artist.id, description: t.payTwoLabel[0], amount: a, due_on: today },
        { artist_id: r.artist.id, description: t.payTwoLabel[1], amount: b },
      ]
    : [{ artist_id: r.artist.id, description: "Launchpad", amount: total, due_on: today }];
  await admin.from("payments").insert(rows);
  // Accepting the quote means they hired Launchpad.
  const { data: a2 } = await admin.from("artists").select("packages").eq("id", r.artist.id).maybeSingle();
  const pk = a2?.packages || [];
  if (!pk.includes("Launchpad")) await admin.from("artists").update({ packages: [...pk, "Launchpad"] }).eq("id", r.artist.id);

  const link = `${SITE_URL()}/quote/${token}`;
  const adminLink = `${SITE_URL()}/admin/artists/${r.artist.id}#pricing`;
  await Promise.all([
    sendEmail({ to: ADMIN_EMAIL(), ...acceptedAdminEmail({ snap: r.snap, artistName: r.artist.name, choice, signer, adminLink }) }),
    r.artist.email
      ? sendEmail({ to: r.artist.email, replyTo: ADMIN_EMAIL(), ...confirmEmail({ snap: r.snap, artistName: r.artist.name, choice, payment: r.payment, link }) })
      : Promise.resolve(),
  ]);
  return { ok: true };
}
