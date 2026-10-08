import { redirect } from "next/navigation";
import { getViewer } from "../../lib/supabase";
import { loadArtist } from "../../lib/artist-data";
import { getLang, T, PKG_BLURB, pick } from "../../lib/i18n";
import { recommendations } from "../../lib/steps";
import { AppHeader, LogoutButton, fmtDate } from "../ui";
import { ProgressSummary, StepsTable } from "../progress";

export const metadata = { title: "Dashboard | Seeing Stars Agency" };

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }) {
  const { user, profile, supabase } = await getViewer();
  if (!user) redirect("/login");
  const sp = await searchParams;
  const isAdmin = profile?.role === "admin";
  const artistId = isAdmin ? sp?.artist : profile?.artist_id;
  if (isAdmin && !artistId) redirect("/admin");

  const data = artistId ? await loadArtist(supabase, artistId) : null;
  const lang = await getLang(data?.artist?.lang);
  const t = T[lang];
  const path = isAdmin ? `/dashboard?artist=${artistId}` : "/dashboard";

  const header = (
    <AppHeader
      lang={lang}
      path={path}
      dark
      badge={isAdmin ? "Admin preview" : null}
      right={
        <>
          {data && <span>{data.artist.name}</span>}
          {isAdmin && <a href={`/admin/artists/${artistId}`}>Admin</a>}
          <LogoutButton lang={lang} />
        </>
      }
    />
  );

  if (!data) {
    return (
      <div className="app">
        {header}
        <main className="container narrow"><div className="alert">{t.noAccount}</div></main>
      </div>
    );
  }

  const { artist, rows, next, notes, milestones, files } = data;
  const recs = recommendations(rows, artist.packages || []);
  const reportHref = isAdmin ? `/report?artist=${artist.id}` : "/report";

  return (
    <div className="app">
      {header}
      <main className="container">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div className="kicker">{t.hi}, {artist.name.split(" ")[0]}</div>
            <h1 className="h1">{t.yourDashboard}</h1>
            <p className="lead">
              {t.package}: <strong>{(artist.packages || []).join(" + ") || "—"}</strong>
              {artist.single_title && <> · {t.single}: <em>{artist.single_title}</em></>}
              {artist.release_date && <> · {t.releaseDate}: <strong>{fmtDate(artist.release_date, lang)}</strong></>}
            </p>
          </div>
          <a href={reportHref} className="btn btn--sm">{t.seeReport}</a>
        </div>

        <ProgressSummary rows={rows} lang={lang} />

        <section className="panel" style={{ borderRadius: 24, padding: 30 }}>
          <h2 className="h2" style={{ fontSize: 28 }}>{t.stepByStep}</h2>
          <p style={{ margin: "0 0 18px", fontSize: 15 }}>{t.stepByStepLead}</p>
          <StepsTable rows={rows} lang={lang} />
        </section>

        <div className="row">
          <section className="panel panel--yellow">
            <h2 className="h2" style={{ marginBottom: 14 }}>{t.nextSteps}</h2>
            {next.filter((n) => !n.done).length === 0 ? (
              <p style={{ margin: 0 }}>{t.nothingNext}</p>
            ) : (
              <ul className="checks">
                {next.filter((n) => !n.done).map((n) => (
                  <li key={n.id}>
                    <span className="box" style={{ background: n.owner === "artist" ? "#F4A6C9" : "#fff" }}>{n.owner === "artist" ? "!" : ""}</span>
                    <span><strong>{n.owner === "artist" ? t.you : t.us}</strong> {n.body}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel panel--pink">
            <h2 className="h2" style={{ marginBottom: 14 }}>{t.files}</h2>
            {files.length === 0 ? (
              <p style={{ margin: 0 }}>{t.noFiles}</p>
            ) : (
              <ul className="filelist">
                {files.map((f) => (
                  <li key={f.id}><span>{f.name}</span><a href={`/files/${f.id}`} style={{ fontWeight: 600 }}>{t.download}</a></li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {(milestones.length > 0 || notes.length > 0) && (
          <div className="row">
            {milestones.length > 0 && (
              <section className="panel panel--blue">
                <h2 className="h2" style={{ marginBottom: 14 }}>{t.timeline}</h2>
                <ul className="checks">
                  {milestones.map((m) => (
                    <li key={m.id}>
                      <span className="box" style={{ borderRadius: 999, background: m.done ? "#1E1B2E" : "#fff" }} />
                      <span><strong>{fmtDate(m.happens_on, lang)}</strong> · {m.body}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {notes.length > 0 && (
              <section className="panel">
                <h2 className="h2" style={{ marginBottom: 14 }}>{t.notesTitle}</h2>
                <div className="stack" style={{ gap: 14 }}>
                  {notes.slice(0, 6).map((n) => (
                    <div key={n.id} className="note">
                      <div className="muted" style={{ fontSize: 13 }}>{fmtDate(n.created_at, lang)}</div>
                      {n.body}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {recs.length > 0 && (
          <section className="panel panel--dark stack" style={{ borderRadius: 24, padding: 30, gap: 18 }}>
            <div>
              <div className="tag" style={{ color: "#F2C94C" }}>{t.upsellKicker}</div>
              <h2 className="h2" style={{ fontSize: 30, marginTop: 6 }}>{t.upsellTitle}</h2>
            </div>
            <div className="cards">
              {recs.map((r) => (
                <div key={r.pkg} className="upcard">
                  <div className="disp it" style={{ fontSize: 22, fontWeight: 800 }}>{r.pkg}</div>
                  <p style={{ margin: "4px 0 8px", fontSize: 15 }}>{pick(lang, PKG_BLURB[r.pkg])}</p>
                  <p style={{ margin: 0, fontSize: 15 }}>{t.solves}: <strong>{r.steps.map((s) => pick(lang, s)).join(", ")}</strong></p>
                </div>
              ))}
            </div>
            <a href={`mailto:hello@seeingstarsagency.com?subject=${encodeURIComponent(recs.map((r) => r.pkg).join(" + "))}`} className="btn btn--accent" style={{ alignSelf: "flex-start", borderColor: "#F2C94C" }}>
              {t.talkAbout} {recs.map((r) => r.pkg).join(" + ")}
            </a>
          </section>
        )}
      </main>
    </div>
  );
}
