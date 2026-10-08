import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage } from "../../../shell";
import { SECTIONS } from "../../../../../lib/questions";
import { FormSections } from "../../../../form-fields";
import { saveIntakeForArtist } from "../../../actions";

export const dynamic = "force-dynamic";

// Admin fills in (or edits) the Launchpad questionnaire for an artist, e.g. from a paper copy.
export default async function AdminIntake({ params, searchParams }) {
  const { supabase } = await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const { data: artist } = await supabase.from("artists").select("*").eq("id", id).maybeSingle();
  if (!artist) notFound();

  const values = artist.intake_answers || {
    legal_name: artist.legal_name,
    artist_name: artist.name,
    single_title: artist.single_title,
    next_release: artist.release_date,
  };

  return (
    <AdminShell>
      <a href={`/admin/artists/${artist.id}#intake`}>← Back to {artist.name}</a>
      <div>
        <div className="kicker">{artist.intake_done_at ? "edit answers" : "fill in for the artist"}</div>
        <h1 className="h1">Launchpad questionnaire · {artist.name}</h1>
        <p className="lead">
          Type in the answers from the paper copy. Nothing is required here: leave blank what they didn&apos;t answer.
          Saving sets their starting point; steps you&apos;ve already worked on together are kept.
        </p>
      </div>
      {sp?.error && <div className="alert" role="alert">{sp.error}</div>}
      <form action={saveIntakeForArtist} className="stack" style={{ gap: 28 }}>
        <input type="hidden" name="artist_id" value={artist.id} />
        <FormSections sections={SECTIONS} lang="en" values={values} optional />
        <div>
          <button type="submit" className="btn btn--dark">Save questionnaire</button>
        </div>
      </form>
    </AdminShell>
  );
}
