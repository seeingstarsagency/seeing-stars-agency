import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage } from "../../../../shell";
import { loadArtist } from "../../../../../../lib/artist-data";
import { loadBrandbook } from "../../../../../../lib/brandbook-data";
import { STATUS, STEPS } from "../../../../../../lib/steps";
import { songScope } from "../../../../../../lib/song-scope";
import { fmtDate } from "../../../../../ui";
import AstroHeader from "../../AstroHeader";

export const metadata = { title: "Astro final report | Seeing Stars Agency" };
export const dynamic = "force-dynamic";

// First version of the Astro final report: where each part of the package stands.
// We'll give it its final shape (and an artist-facing version) next.
export default async function AstroReport({ params }) {
  const { supabase } = await requireAdminPage();
  const { id } = await params;
  const data = await loadArtist(supabase, id);
  if (!data) notFound();
  const { artist, rows, songs, photoUrl } = data;
  const { artistRows } = songScope(artist, songs, rows, null);
  const stepInfo = (k) => STEPS.find((x) => x.key === k);
  const brandRows = artistRows.filter((r) => stepInfo(r.step_key)?.pillar === "brand");
  const book = await loadBrandbook(supabase, artist.id);
  const epk = await loadBrandbook(supabase, artist.id, "epk");
  const shown = (b) => (b.pages || []).filter((p) => p.visible).length;

  const parts = [
    { name: "Astro questionnaire", state: artist.astro_done_at ? `Saved ${fmtDate(artist.astro_done_at, "en")}` : "Pending" },
    { name: "Artist DNA", state: artist.artist_dna_updated_at ? `Saved ${fmtDate(artist.artist_dna_updated_at, "en")}` : "Pending" },
    { name: "Brandbook", state: book.missing ? "Not set up" : `${(book.pages || []).length} pages · ${shown(book)} shown to the artist` },
    { name: "EPK", state: epk.missing ? "Not set up" : `${(epk.pages || []).length} pages · ${shown(epk)} shown to the artist` },
    { name: "Astro price", state: artist.astro_quote ? `$${Number(artist.astro_quote.total || 0).toLocaleString("en-US")} · saved ${fmtDate(artist.astro_quote_updated_at, "en")}` : "Not saved yet" },
  ];

  return (
    <AdminShell>
      <AstroHeader artist={artist} photoUrl={photoUrl} current="report" back={{ href: `/admin/artists/${artist.id}/astro`, label: `${artist.name} · Astro` }} />
      <div>
        <div className="kicker">✦ Astro final report</div>
        <h2 className="h2" style={{ margin: "4px 0 6px" }}>Where {artist.name}&rsquo;s Astro stands</h2>
        <p style={{ margin: 0, fontSize: 15 }}>A first version for the agency. Next we&rsquo;ll shape the final report the artist receives.</p>
      </div>

      <section className="panel">
        <h2 className="h2">Astro parts</h2>
        <div className="tablewrap">
          <table className="table">
            <thead><tr><th>Part</th><th>Status</th></tr></thead>
            <tbody>{parts.map((p) => <tr key={p.name}><td>{p.name}</td><td>{p.state}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2 className="h2">Brand steps</h2>
        <div className="tablewrap">
          <table className="table">
            <thead><tr><th>Step</th><th>Status</th><th>Done on</th></tr></thead>
            <tbody>
              {brandRows.map((r) => (
                <tr key={r.id}>
                  <td>{stepInfo(r.step_key)?.en || r.step_key}</td>
                  <td><span style={{ background: STATUS[r.status]?.bg, borderRadius: 999, padding: "2px 10px", fontSize: 14 }}>{STATUS[r.status]?.en || r.status}</span></td>
                  <td>{r.done_on ? fmtDate(r.done_on, "en") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
