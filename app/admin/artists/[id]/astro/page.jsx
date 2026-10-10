import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage, OK_MSG } from "../../../shell";
import { loadArtist } from "../../../../../lib/artist-data";
import { loadBrandbook } from "../../../../../lib/brandbook-data";
import { STATUS } from "../../../../../lib/steps";
import { songScope } from "../../../../../lib/song-scope";
import { browserConfig } from "../../../../../lib/env";
import { StepsTable } from "../../../../progress";
import { updateSteps } from "../../../actions";
import Editor from "../../../../brandbook/Editor";

export const metadata = { title: "Astro · Admin | Seeing Stars Agency" };
export const dynamic = "force-dynamic";

export default async function AdminAstro({ params, searchParams }) {
  const { supabase } = await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const data = await loadArtist(supabase, id);
  if (!data) notFound();
  const { artist, rows, songs } = data;
  const { artistRows } = songScope(artist, songs, rows, null);
  const book = await loadBrandbook(supabase, artist.id);
  const epk = await loadBrandbook(supabase, artist.id, "epk");
  const hasAstro = artist.monthly_member || (artist.packages || []).includes("Astro");
  const statusSelect = (r) => (
    <select name={`status_${r.id}`} defaultValue={r.status} className="select-sm" aria-label="Status">
      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.en}</option>)}
    </select>
  );

  return (
    <AdminShell>
      <a href={`/admin/artists/${artist.id}`}>← {artist.name}</a>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="kicker">Astro · Artist branding</div>
          <h1 className="h1">{artist.name}</h1>
          <p className="lead" style={{ margin: 0 }}>The brand steps, the brandbook and the EPK. The artist only sees the pages you mark as shown.</p>
        </div>
        <a href={`/dashboard/astro?artist=${artist.id}`} className="small-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>See what the artist sees</a>
      </div>
      {sp?.ok && OK_MSG[sp.ok] && <div className="alert alert--ok" role="status">{OK_MSG[sp.ok]}</div>}
      {!hasAstro && (
        <div className="alert" role="status">
          {artist.name} doesn&rsquo;t have Astro or the monthly membership yet, so their Astro page is locked. You can still prepare the brandbook: they&rsquo;ll see the shown pages once you add the package.
        </div>
      )}

      <section className="panel" id="brand">
        <h2 className="h2">Your brand</h2>
        <p style={{ margin: "0 0 14px", fontSize: 15 }}>The same steps the artist sees under &ldquo;Your brand&rdquo;. Change a status and click &ldquo;Save steps&rdquo;.</p>
        <form action={updateSteps} className="stack">
          <input type="hidden" name="artist_id" value={artist.id} />
          <input type="hidden" name="back" value="astro" />
          <StepsTable rows={artistRows} lang="en" pillars={["brand"]} renderStatus={statusSelect} />
          <button type="submit" className="btn btn--dark btn--sm" style={{ alignSelf: "flex-start" }}>Save steps</button>
        </form>
      </section>

      <section className="panel" id="brandbook" style={{ padding: 20 }}>
        <h2 className="h2" style={{ marginBottom: 4 }}>Brandbook</h2>
        <p style={{ margin: "0 0 16px", fontSize: 15 }}>Design it here like in Canva. Use &ldquo;Shown / Hidden&rdquo; on each page to decide what {artist.name} can see.</p>
        {book.missing ? (
          <div className="alert" role="alert">The brandbook table isn&rsquo;t set up in the database yet. Run the &ldquo;Brandbook&rdquo; section of supabase/schema.sql in Supabase and reload this page.</div>
        ) : (
          <Editor
            artistId={artist.id}
            artistName={artist.name}
            lang={artist.lang === "es" ? "es" : "en"}
            sb={browserConfig()}
            initialPages={book.pages}
            initialUrls={book.urls}
          />
        )}
      </section>

      <section className="panel" id="epk" style={{ padding: 20 }}>
        <h2 className="h2" style={{ marginBottom: 4 }}>EPK</h2>
        <p style={{ margin: "0 0 16px", fontSize: 15 }}>The electronic press kit. Same editor as the brandbook; use &ldquo;Shown / Hidden&rdquo; on each page to decide what {artist.name} can see.</p>
        {epk.missing ? (
          <div className="alert" role="alert">The EPK couldn&rsquo;t load. Reload the page.</div>
        ) : (
          <Editor
            book="epk"
            artistId={artist.id}
            artistName={artist.name}
            lang={artist.lang === "es" ? "es" : "en"}
            sb={browserConfig()}
            initialPages={epk.pages}
            initialUrls={epk.urls}
          />
        )}
      </section>
    </AdminShell>
  );
}
