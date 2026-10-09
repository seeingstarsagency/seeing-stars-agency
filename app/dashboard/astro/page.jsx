import { redirect } from "next/navigation";
import { getViewer } from "../../../lib/supabase";
import { loadArtist } from "../../../lib/artist-data";
import { loadBrandbook } from "../../../lib/brandbook-data";
import { brandbookTemplate, FONTS_URL } from "../../../lib/brandbook";
import { getLang, T } from "../../../lib/i18n";
import { STEPS } from "../../../lib/steps";
import { songScope } from "../../../lib/song-scope";
import { AppHeader, LogoutButton } from "../../ui";
import { StepsTable } from "../../progress";
import Locked from "../../Locked";
import BookPage from "../../brandbook/BookPage";
import Viewer from "../../brandbook/Viewer";
import PrintButton from "../../report/PrintButton";
import ContentCalendar from "../../ContentCalendar";

export const metadata = { title: "Astro | Seeing Stars Agency" };
export const dynamic = "force-dynamic";

export default async function AstroPage({ searchParams }) {
  const { user, profile, supabase } = await getViewer();
  if (!user) redirect("/login");
  const sp = await searchParams;
  const isAdmin = profile?.role === "admin";
  const artistId = isAdmin ? sp?.artist : profile?.artist_id;
  if (isAdmin && !artistId) redirect("/admin");
  const data = artistId ? await loadArtist(supabase, artistId) : null;
  if (!data) redirect("/dashboard");
  const { artist, rows, songs, calendar } = data;
  if (!isAdmin && !artist.intake_done_at) redirect("/dashboard/intake");

  const lang = await getLang(artist.lang);
  const t = T[lang];
  const path = isAdmin ? `/dashboard/astro?artist=${artist.id}` : "/dashboard/astro";
  const back = isAdmin ? `/dashboard?artist=${artist.id}` : "/dashboard";
  const { artistRows } = songScope(artist, songs, rows, null);
  const locked = !(artist.monthly_member || (artist.packages || []).includes("Astro"));

  // The admin preview shows exactly what the artist sees: visible pages only.
  const book = locked ? { pages: [], urls: {} } : await loadBrandbook(supabase, artist.id);
  const pages = book.pages.filter((p) => p.visible);
  const teaser = brandbookTemplate(artist.name, lang).slice(0, 3);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });

  return (
    <div className="app astro">
      <link rel="stylesheet" href={FONTS_URL} precedence="default" />
      <AppHeader
        lang={lang}
        path={path}
        dark
        badge={isAdmin ? "Admin preview" : null}
        right={
          <>
            <span>{artist.name}</span>
            {isAdmin && <a href={`/admin/artists/${artist.id}/astro`}>Edit brandbook</a>}
            <LogoutButton lang={lang} />
          </>
        }
      />
      <main className="container">
        <a href={back} className="no-print">{t.astroBack}</a>

        <section className="astro__hero no-print">
          <div className="kicker">{t.astroKicker}</div>
          <h1 className="h1">{t.astroTitle}</h1>
          <p className="lead" style={{ maxWidth: 640 }}>{t.astroLead}</p>
        </section>

        <section className="panel no-print" style={{ borderRadius: 24, padding: 30 }}>
          <h2 className="h2" style={{ fontSize: 28 }}>{t.brandTitle}</h2>
          <p style={{ margin: "0 0 18px", fontSize: 15 }}>{t.brandLead}</p>
          <Locked locked={locked} pkg="Astro" text={t.lockedBrand} t={t}>
            <StepsTable
              rows={locked
                ? STEPS.filter((x) => x.pillar === "brand").map((x) => artistRows.find((r) => r.step_key === x.key) || { step_key: x.key, status: "pending", start_status: "pending" })
                : artistRows}
              lang={lang}
              pillars={["brand"]}
            />
          </Locked>
        </section>

        <section className="panel panel--yellow astro__book" style={{ borderRadius: 24, padding: 30 }}>
          <div className="songs__head no-print">
            <h2 className="h2" style={{ fontSize: 28, margin: 0 }}>{t.brandbookTitle}</h2>
            {!locked && pages.length > 0 && <PrintButton label={t.bookPrint} />}
          </div>
          <p className="no-print" style={{ margin: "0 0 18px", fontSize: 15 }}>{t.brandbookLead}</p>
          {locked ? (
            <Locked locked pkg="Astro" text={t.lockedBrandbook} t={t}>
              <div className="bkview">
                {teaser.map((p) => <figure key={p.id} className="bkview__page"><BookPage page={p} urls={{}} /></figure>)}
              </div>
            </Locked>
          ) : pages.length === 0 ? (
            <div className="astro__empty">
              <span aria-hidden="true">✦</span>
              <p>{t.brandbookEmpty}</p>
            </div>
          ) : (
            <Viewer pages={pages} urls={book.urls} labels={{ open: t.bookOpen, close: t.bookClose, prev: t.bookPrev, next: t.bookNext }} />
          )}
        </section>

        <ContentCalendar artist={artist} songs={songs} calendar={calendar || []} isAdmin={isAdmin} lang={lang} today={today} locked={locked} post={sp?.post} from="astro" />
      </main>
    </div>
  );
}
