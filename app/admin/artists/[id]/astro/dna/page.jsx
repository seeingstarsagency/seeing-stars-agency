import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage } from "../../../../shell";
import { loadArtist } from "../../../../../../lib/artist-data";
import { DNA_SECTIONS, astroAnswerText } from "../../../../../../lib/artist-dna";
import { fmtDate } from "../../../../../ui";
import { saveArtistDna } from "../../../../astro-actions";
import AstroHeader from "../../AstroHeader";

export const metadata = { title: "Artist DNA | Seeing Stars Agency" };
export const dynamic = "force-dynamic";

const SOURCE = {
  agency: "The agency looks this up (Spotify for Artists, YouTube, socials).",
  team: "Comes from the creative team (designer and photographer).",
};

// What the artist answered for the questionnaire fields that feed this DNA field.
function FromArtist({ from, answers }) {
  const items = [];
  for (const k of from) {
    if (SOURCE[k]) { items.push(<li key={k} style={{ listStyle: "none" }}><em>{SOURCE[k]}</em></li>); continue; }
    const a = astroAnswerText(k, answers);
    if (a) items.push(<li key={k}><span className="muted">{a.q}</span><br />{a.text}</li>);
  }
  if (!items.length) return from.length ? <p className="muted" style={{ margin: "6px 0 0", fontSize: 13 }}>No answer from the artist yet for this.</p> : null;
  return (
    <details style={{ marginTop: 6, fontSize: 13.5 }} open>
      <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 13 }}>From the artist</summary>
      <ul style={{ margin: "6px 0 0", paddingLeft: 18, display: "grid", gap: 6, whiteSpace: "pre-line" }}>{items}</ul>
    </details>
  );
}

function Input({ f, value }) {
  const id = `dna-${f.name}`;
  if (f.type === "textarea") return <textarea id={id} name={f.name} className="input" defaultValue={value ?? ""} style={{ minHeight: 90 }} />;
  if (f.type === "range") return <input id={id} name={f.name} type="number" min="0" max="100" className="input" defaultValue={value ?? 50} style={{ maxWidth: 140 }} />;
  if (f.type === "date") return <input id={id} name={f.name} type="date" className="input" defaultValue={value ?? ""} style={{ maxWidth: 220 }} />;
  if (f.type === "select") return (
    <select id={id} name={f.name} className="input" defaultValue={value ?? f.options[0][0]} style={{ maxWidth: 240 }}>
      {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
  return <input id={id} name={f.name} className="input" defaultValue={value ?? ""} />;
}

// The Artist DNA: the agency's internal, editable form. Every Astro deliverable reads from it.
export default async function ArtistDna({ params, searchParams }) {
  const { supabase } = await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const data = await loadArtist(supabase, id);
  if (!data) notFound();
  const { artist, photoUrl } = data;
  const dna = artist.artist_dna || {};
  const answers = artist.astro_answers || {};

  return (
    <AdminShell>
      <AstroHeader artist={artist} photoUrl={photoUrl} current="dna" back={{ href: `/admin/artists/${artist.id}/astro`, label: `${artist.name} · Astro` }} />
      <div>
        <div className="kicker">✦ Artist DNA · internal</div>
        <h2 className="h2" style={{ margin: "4px 0 6px" }}>{artist.name}&rsquo;s Artist DNA</h2>
        <p style={{ margin: 0, fontSize: 15, maxWidth: "70ch" }}>
          Only the agency sees this. Write the curated version of each field using the artist&rsquo;s answers shown under it.
          This is the single source for the Brand Guide, Voice Guide, Visual Direction, bios and EPK: change something once here and it changes everywhere.
          {artist.artist_dna_updated_at ? ` Last saved on ${fmtDate(artist.artist_dna_updated_at, "en")}.` : ""}
        </p>
        {!artist.astro_done_at && (
          <p style={{ margin: "8px 0 0", fontSize: 15 }}>
            The <a href={`/admin/artists/${artist.id}/astro/questionnaire`}>Astro questionnaire</a> isn&rsquo;t filled in yet, so there are no answers to show next to each field.
          </p>
        )}
      </div>
      {sp?.ok === "saved" && <div className="alert alert--ok" role="status">Artist DNA saved.</div>}
      {sp?.error && <div className="alert" role="alert">Could not save: {sp.error}</div>}

      <form action={saveArtistDna} className="stack" style={{ gap: 28 }}>
        <input type="hidden" name="artist_id" value={artist.id} />
        {DNA_SECTIONS.map((s) => (
          <section key={s.key} id={s.key} className="panel" style={{ background: s.bg }}>
            <h2 className="h2" style={{ marginBottom: 2 }}>{s.en}</h2>
            <p className="muted" style={{ margin: "0 0 16px", fontSize: 14 }}>Feeds: {s.feeds}</p>
            <div className="fgrid">
              {s.fields.map((f) => (
                <div key={f.name} className="field" style={f.type === "textarea" || f.wide ? { gridColumn: "1 / -1" } : undefined}>
                  <label htmlFor={`dna-${f.name}`}>{f.en}{f.type === "range" ? " (0 to 100)" : ""}</label>
                  <Input f={f} value={dna[f.name]} />
                  <FromArtist from={f.from} answers={answers} />
                </div>
              ))}
            </div>
          </section>
        ))}
        <div>
          <button type="submit" className="btn btn--dark">Save Artist DNA</button>
        </div>
      </form>
    </AdminShell>
  );
}
