import { redirect } from "next/navigation";
import { getViewer } from "../../lib/supabase";
import { loadArtist } from "../../lib/artist-data";
import { getLang, T, PKG_BLURB, pick } from "../../lib/i18n";
import { recommendations } from "../../lib/steps";
import { browserConfig } from "../../lib/env";
import PhotoUpload from "../PhotoUpload";
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

  const { artist, rows, next, notes, milestones, files, songs, photoUrl } = data;
  // First visit: the artist fills in the Launchpad questionnaire before anything else.
  if (!isAdmin && !artist.intake_done_at) redirect("/dashboard/intake");
  const recs = recommendations(rows, artist.packages || []);

  // Profile details from the Launchpad questionnaire.
  const ans = artist.intake_answers || {};
  const COLORS = { instagram: "#F4A6C9", tiktok: "#9CCBE0", youtube: "#F2C94C", other: "#C9B8F0", spotify: "#8FD19E", apple: "#F28C8C" };
  const links = [
    ...(Array.isArray(ans.socials) ? ans.socials.filter((x) => x.url) : []),
    ...(ans.spotify_url ? [{ key: "spotify", name: "Spotify", url: ans.spotify_url }] : []),
    ...(ans.apple_url ? [{ key: "apple", name: "Apple Music", url: ans.apple_url }] : []),
  ]
    .filter((l) => /^https?:\/\//i.test(l.url))
    .map((l) => ({ ...l, color: COLORS[l.key] || COLORS.other }));
  // Days until the single comes out (calendar days, Miami time).
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const daysLeft = artist.release_date
    ? Math.round((Date.parse(artist.release_date) - Date.parse(today)) / 86400000)
    : null;
  const reportHref = isAdmin ? `/report?artist=${artist.id}` : "/report";

  return (
    <div className="app">
      {header}
      <main className="container">
        <section className="profile">
          <PhotoUpload sb={browserConfig()} photoUrl={photoUrl} name={artist.name} label={photoUrl ? t.changePhoto : t.addPhoto} busyLabel={t.uploading} errorLabel={t.photoError} editable={!isAdmin} />
          <div className="profile__main">
            <div className="kicker">{t.welcome}</div>
            <h1 className="h1 profile__name">{artist.name}</h1>
            {(ans.legal_name || artist.legal_name) && <p className="profile__meta">{ans.legal_name || artist.legal_name}</p>}
            {(artist.packages || []).length > 0 && (
              <div className="chips">
                {artist.packages.map((p) => <span key={p} className="chip">{p}</span>)}
              </div>
            )}
            {links.length > 0 && (
              <div className="sociallinks">
                {links.map((l) => (
                  <a key={l.key + l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="sociallink">
                    <span className="sociallink__dot" style={{ background: l.color }} aria-hidden="true" />{l.name}
                  </a>
                ))}
              </div>
            )}
          </div>
          {artist.single_title && (
            <div className="countdown">
              <div className="countdown__label">{t.single}</div>
              <div className="countdown__song">{artist.single_title}</div>
              {daysLeft === null ? (
                <div className="countdown__note">{t.dateTbd}</div>
              ) : daysLeft > 0 ? (
                <>
                  <div className="countdown__num">{daysLeft}</div>
                  <div className="countdown__note">{daysLeft === 1 ? t.dayToRelease : t.daysToRelease}</div>
                  <div className="countdown__date">{fmtDate(artist.release_date, lang)}</div>
                </>
              ) : daysLeft === 0 ? (
                <div className="countdown__today">{t.releaseToday}</div>
              ) : (
                <>
                  <div className="countdown__today">{t.outNow}</div>
                  <div className="countdown__date">{fmtDate(artist.release_date, lang)}</div>
                </>
              )}
            </div>
          )}
        </section>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -8 }}>
          <a href={reportHref} className="btn btn--sm">{t.seeReport}</a>
        </div>

        <section className="panel panel--yellow" id="songs">
          <h2 className="h2" style={{ marginBottom: 14 }}>{t.yourSongs}</h2>
          {songs.length === 0 ? (
            <p style={{ margin: 0 }}>{t.noSongs}</p>
          ) : (
            <ul className="songlist">
              {songs.map((s) => (
                <li key={s.id}>
                  {s.artwork_url ? <img src={s.artwork_url} alt="" className="songlist__art" /> : <span className="songlist__icon" aria-hidden="true">♪</span>}
                  <span style={{ flexGrow: 1 }}><strong>{s.title}</strong>{s.release_date && <span className="muted"> · {fmtDate(s.release_date, lang)}</span>}</span>
                  {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>{t.listen}</a>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {sp?.welcome && <div className="alert alert--ok" role="status">{t.iDone}</div>}
        {isAdmin && !artist.intake_done_at && <div className="alert" role="status">Preview: this artist hasn't filled in the Launchpad questionnaire yet. They'll see it first when they log in.</div>}

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
                    <div key={n.id} className="anote">
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
            <a href={`mailto:seeingstarsagency@gmail.com?subject=${encodeURIComponent(recs.map((r) => r.pkg).join(" + "))}`} className="btn btn--accent" style={{ alignSelf: "flex-start", borderColor: "#F2C94C" }}>
              {t.talkAbout} {recs.map((r) => r.pkg).join(" + ")}
            </a>
          </section>
        )}
      </main>
    </div>
  );
}
