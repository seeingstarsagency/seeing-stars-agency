import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage } from "../../../../shell";
import { loadArtist } from "../../../../../../lib/artist-data";
import { BIO_KINDS, BIO_LANGS, bioDrafts } from "../../../../../../lib/bios";
import { saveBios } from "../../../../astro-actions";
import AstroHeader from "../../AstroHeader";
import BioField from "./BioField";

export const metadata = { title: "Bios · Astro | Seeing Stars Agency" };
export const dynamic = "force-dynamic";

// The three bios in English and Spanish. The agency writes them; "Start from the DNA draft"
// fills an empty field with the recipe assembled from the Artist DNA.
export default async function Bios({ params, searchParams }) {
  const { supabase } = await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const data = await loadArtist(supabase, id);
  if (!data) notFound();
  const { artist, photoUrl } = data;
  const dna = artist.artist_dna || {};
  const drafts = bioDrafts(dna, artist.astro_steps || {});

  return (
    <AdminShell>
      <AstroHeader artist={artist} photoUrl={photoUrl} current="bios" back={{ href: `/admin/artists/${artist.id}/astro`, label: `${artist.name} · Astro` }} />
      <div>
        <div className="kicker">✦ Bios</div>
        <h2 className="h2" style={{ margin: "4px 0 6px" }}>{artist.name}&rsquo;s bios</h2>
        <p style={{ margin: 0, fontSize: 15, maxWidth: "72ch" }}>
          Three versions of the same story, in English and Spanish. The short and long bios go in third person. Only real facts: if there are no achievements yet,
          talk about the release and what&rsquo;s next. The EPK uses these bios. Empty fields can start from a draft built from the <a href={`/admin/artists/${artist.id}/astro/dna`}>Artist DNA</a>; rewrite it, don&rsquo;t paste it as is.
        </p>
      </div>
      {sp?.ok === "saved" && <div className="alert alert--ok" role="status">Bios saved.</div>}
      {sp?.error && <div className="alert" role="alert">Could not save: {sp.error}</div>}

      <form action={saveBios} className="stack" style={{ gap: 24 }}>
        <input type="hidden" name="artist_id" value={artist.id} />
        {BIO_KINDS.map((k) => (
          <section key={k.key} className="panel" style={{ background: k.key === "line" ? "#FFF6D6" : k.key === "short" ? "#E3F1F8" : "#FCE4EF" }}>
            <h2 className="h2" style={{ marginBottom: 2 }}>{k.en}</h2>
            <p className="muted" style={{ margin: "0 0 14px", fontSize: 14 }}>For: {k.use}</p>
            <div className="fgrid">
              {BIO_LANGS.map(([l, label]) => (
                <BioField
                  key={l}
                  name={`bio_${k.key}_${l}`}
                  label={label}
                  defaultValue={dna[`bio_${k.key}_${l}`] || ""}
                  limit={k.limit}
                  draft={drafts[k.key]}
                  rows={k.key === "line" ? 2 : k.key === "short" ? 5 : 12}
                />
              ))}
            </div>
          </section>
        ))}
        <div className="inline">
          <button type="submit" className="btn btn--dark">Save bios</button>
          <a href={`/admin/artists/${artist.id}/astro/epk`} className="small-btn" style={{ textDecoration: "none" }}>See them in the EPK →</a>
        </div>
      </form>
    </AdminShell>
  );
}
