import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage, OK_MSG } from "../../../shell";
import { SECTIONS, answerLabel } from "../../../../../lib/questions";
import { AnswersList } from "../../../../form-fields";
import { fmtDate } from "../../../../ui";

export const metadata = { title: "Questionnaire | Seeing Stars Agency" };

export const dynamic = "force-dynamic";

// The artist's Launchpad questionnaire answers, on their own page.
export default async function ArtistQuestionnaire({ params, searchParams }) {
  const { supabase } = await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const { data: artist } = await supabase.from("artists").select("id, name, intake_done_at, intake_answers").eq("id", id).maybeSingle();
  if (!artist) notFound();

  return (
    <AdminShell>
      <a href={`/admin/artists/${artist.id}`}>← Back to {artist.name}</a>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="kicker">{artist.name}</div>
          <h1 className="h1">Launchpad questionnaire</h1>
          <p style={{ margin: 0, fontSize: 15 }}>
            {artist.intake_done_at
              ? `Filled in on ${fmtDate(artist.intake_done_at, "en")}. Their answers set the "Already had it" steps.`
              : "Not filled in yet. The artist will see it first when they log in to their dashboard."}
          </p>
        </div>
        <a href={`/admin/artists/${artist.id}/intake`} className="btn btn--dark btn--sm">
          {artist.intake_done_at ? "Edit answers" : "Fill in for the artist"}
        </a>
      </div>
      {sp?.ok && OK_MSG[sp.ok] && <div className="alert alert--ok" role="status">{OK_MSG[sp.ok]}</div>}
      <section className="panel">
        {artist.intake_done_at ? (
          <AnswersList sections={SECTIONS} answers={artist.intake_answers || {}} lang="en" answerLabel={answerLabel} />
        ) : (
          <p style={{ margin: 0, fontSize: 15 }}>If they filled it in on paper, use &ldquo;Fill in for the artist&rdquo;.</p>
        )}
      </section>
    </AdminShell>
  );
}
