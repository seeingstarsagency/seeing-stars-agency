import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage } from "../../../../shell";
import { loadArtist } from "../../../../../../lib/artist-data";
import { ASTRO_SECTIONS, astroStartingValues } from "../../../../../../lib/astro-questions";
import { FormSections } from "../../../../../form-fields";
import { fmtDate } from "../../../../../ui";
import { saveAstroAnswers } from "../../../../astro-actions";
import AstroHeader from "../../AstroHeader";

export const metadata = { title: "Astro questionnaire | Seeing Stars Agency" };
export const dynamic = "force-dynamic";

// The artist's Astro questionnaire, already filled in and editable by the agency.
export default async function AstroQuestionnaire({ params, searchParams }) {
  const { supabase } = await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const data = await loadArtist(supabase, id);
  if (!data) notFound();
  const { artist, photoUrl } = data;
  const values = astroStartingValues(artist);

  return (
    <AdminShell>
      <AstroHeader artist={artist} photoUrl={photoUrl} current="questionnaire" back={{ href: `/admin/artists/${artist.id}/astro`, label: `${artist.name} · Astro` }} />
      <div>
        <div className="kicker">✦ Astro questionnaire</div>
        <h2 className="h2" style={{ margin: "4px 0 6px" }}>What we need to build {artist.name}&rsquo;s brand</h2>
        <p style={{ margin: 0, fontSize: 15 }}>
          {artist.astro_done_at
            ? `Last saved on ${fmtDate(artist.astro_done_at, "en")}. Edit any answer and save: these answers feed the Brand Guide, Voice Guide, Visual Direction, bios and EPK.`
            : "Not filled in yet. You can type in the artist's answers here (for example from an email or a call). Section 0 comes from their Launchpad questionnaire when they have one."}
        </p>
      </div>
      {sp?.ok === "saved" && <div className="alert alert--ok" role="status">Astro questionnaire saved.</div>}
      {sp?.error && <div className="alert" role="alert">Could not save: {sp.error}</div>}
      <form action={saveAstroAnswers} className="stack" style={{ gap: 28 }}>
        <input type="hidden" name="artist_id" value={artist.id} />
        <FormSections sections={ASTRO_SECTIONS} lang="en" values={values} optional />
        <div>
          <button type="submit" className="btn btn--dark">Save Astro questionnaire</button>
        </div>
      </form>
    </AdminShell>
  );
}
