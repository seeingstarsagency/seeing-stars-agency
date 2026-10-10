import { redirect } from "next/navigation";
import { getViewer } from "../../lib/supabase";
import { loadArtist } from "../../lib/artist-data";
import { getLang, T, PKG_BLURB, pick } from "../../lib/i18n";
import { recommendations, SONG_PILLARS, STEPS } from "../../lib/steps";
import { songScope } from "../../lib/song-scope";
import SongPicker from "../SongPicker";
import { browserConfig } from "../../lib/env";
import PhotoUpload from "../PhotoUpload";
import { setListenPlatform, addCalendarItem, setCalendarStatus, deleteCalendarItem } from "./actions";
import Calendar from "../Calendar";
import { Star } from "../components";
import { AppHeader, LogoutButton, fmtDate } from "../ui";
import { ProgressSummary, StepsTable } from "../progress";
import Locked from "../Locked";
import IPod from "../IPod";
import Roadmap from "../Roadmap";
import RoadmapButton from "../RoadmapButton";
import ContentCalendar from "../ContentCalendar";
import { buildRoadmap } from "../../lib/roadmap";

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

  const { artist, rows, next, notes, milestones, files, songs, photoUrl, calendar } = data;
  // First visit: the artist fills in the Launchpad questionnaire before anything else.
  if (!isAdmin && !artist.intake_done_at) redirect("/dashboard/intake");
  const { projects, current: song, songRows, artistRows, allRows } = songScope(artist, songs, rows, sp?.song);
  const recs = recommendations(allRows, artist.packages || []);

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
  // Where songs open: the artist's choice. If a song has no link there yet, open a search.
  const platform = artist.listen_platform === "apple" ? "apple" : "spotify";
  const listenUrl = (s) => {
    const q = encodeURIComponent(`${artist.name} ${s.title}`);
    const apple = s.link && s.link.includes("music.apple.com") ? s.link : null;
    return platform === "apple"
      ? apple || `https://music.apple.com/us/search?term=${q}`
      : s.spotify_url || `https://open.spotify.com/search/${q}`;
  };

  // Days until the single comes out (calendar days, Miami time).
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const songTitle = song?.title || artist.single_title;
  const songDate = song ? song.release_date : artist.release_date;
  const daysLeft = songDate ? Math.round((Date.parse(songDate) - Date.parse(today)) / 86400000) : null;
  const reportHref = (isAdmin ? `/report?artist=${artist.id}` : "/report?") + (song ? `${isAdmin ? "&" : ""}song=${song.id}` : "");

  // Release & content calendars.
  const calMonth = /^\d{4}-\d{2}$/.test(sp?.cal || "") ? sp.cal : null;
  const songTitleById = Object.fromEntries(songs.map((x) => [x.id, x.title]));
  const CAL = { release: "#F2C94C", milestone: "#9CCBE0", instagram: "#F4A6C9", tiktok: "#9CCBE0", youtube: "#F2C94C", other: "#C9B8F0" };
  const ST = { pending: t.stPending, done: t.stDone, ready: t.stReady, posted: t.stPosted };
  // Road to release day: suggested deadlines for the current song.
  const road = buildRoadmap(songDate, songRows, today);
  const releaseItems = [
    ...songs.filter((x) => x.release_date).map((x) => ({
      id: `song-${x.id}`, date: x.release_date, title: x.title, color: CAL.release, auto: true, tag: t.releaseDay,
    })),
    ...calendar.filter((c) => c.kind === "release").map((c) => ({
      id: c.id, date: c.happens_on, title: c.title, color: CAL.milestone, status: c.status,
      statusDone: c.status === "done",
      statuses: [["pending", ST.pending], ["done", ST.done]],
      sub: [c.song_id && songTitleById[c.song_id], c.created_by === "agency" && t.fromAgency].filter(Boolean).join(" · "),
      canDelete: isAdmin || c.created_by === "artist",
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const calLabels = {
    prev: t.calPrev, next: t.calNext, today: t.calToday, items: t.calItems, thisMonth: t.calThisMonth,
    showAll: t.calShowAll, empty: t.calEmpty, status: t.calStatus, remove: t.calRemove,
  };
  const calProps = { lang, labels: calLabels, today, initialMonth: calMonth, artistId: isAdmin ? artist.id : null, setStatus: setCalendarStatus, remove: deleteCalendarItem };
  const songOptions = (
    <select name="song_id" className="input" defaultValue="">
      <option value="">{t.calNoSong}</option>
      {songs.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
    </select>
  );
  const adminHidden = isAdmin ? <input type="hidden" name="artist_id" value={artist.id} /> : null;
  // A monthly membership (set by the admin) unlocks everything.
  const hasPkg = (p) => !!artist.monthly_member || (artist.packages || []).includes(p);
  const releaseLocked = !hasPkg("Launchpad");
  const contentLocked = !hasPkg("Astro");
  const brandLocked = !hasPkg("Astro");

  return (
    <div className="app">
      {header}
      {/* Shooting stars now and then, like on the home page (behind the content) */}
      <div className="dash-sky" aria-hidden="true">
        <div className="shoot" style={{ left: "-8%", top: "38%" }} />
        <div className="shoot shoot--pink" style={{ left: "20%", top: "72%" }} />
        <div className="shoot shoot--slow" style={{ left: "45%", top: "30%" }} />
        <div className="shoot shoot--pink shoot--late" style={{ left: "5%", top: "95%" }} />
      </div>
      <main className="container dash-main">
        <div className="dash-l">
          <div className="dash-l__main">
            <section className="profile">
              <PhotoUpload sb={browserConfig()} photoUrl={photoUrl} name={artist.name} label={photoUrl ? t.changePhoto : t.addPhoto} busyLabel={t.uploading} errorLabel={t.photoError} editable={!isAdmin} />
              <div className="profile__main">
                <div className="kicker">{t.welcome}</div>
                <h1 className="h1 profile__name">{artist.name}</h1>
                {(ans.legal_name || artist.legal_name) && <p className="profile__meta">{ans.legal_name || artist.legal_name}</p>}
                {((artist.packages || []).length > 0 || artist.monthly_member) && (
                  <div className="chips">
                    {(artist.packages || []).map((p) => <span key={p} className="pchip">{p}</span>)}
                    {artist.monthly_member && <span className="pchip">✦ {t.monthlyMember}</span>}
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
              {songTitle && (
                <div className="countdown-wrap">
                <Star size={56} fill="#F4A6C9" className="abs twinkle countdown-wrap__star1" />
                <Star size={38} fill="#9CCBE0" className="abs twinkle2 countdown-wrap__star2" />
                <div className="countdown float">
                  <div className="countdown__label">{t.single}</div>
                  <div className="countdown__song">{songTitle}</div>
                  {daysLeft === null ? (
                    <div className="countdown__note">{t.dateTbd}</div>
                  ) : daysLeft > 0 ? (
                    <>
                      <div className="countdown__num">{daysLeft}</div>
                      <div className="countdown__note">{daysLeft === 1 ? t.dayToRelease : t.daysToRelease}</div>
                      <div className="countdown__date">{fmtDate(songDate, lang)}</div>
                    </>
                  ) : daysLeft === 0 ? (
                    <div className="countdown__today">{t.releaseToday}</div>
                  ) : (
                    <>
                      <div className="countdown__today">{t.outNow}</div>
                      <div className="countdown__date">{fmtDate(songDate, lang)}</div>
                    </>
                  )}
                </div>
                </div>
              )}
            </section>

            {songs.length === 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -8 }}>
                <a href={reportHref} className="btn btn--sm">{t.seeReport}</a>
              </div>
            )}



            {sp?.welcome && <div className="alert alert--ok" role="status">{t.iDone}</div>}
            {isAdmin && !artist.intake_done_at && <div className="alert" role="status">Preview: this artist hasn't filled in the Launchpad questionnaire yet. They'll see it first when they log in.</div>}

            {songs.length > 0 && (
              <section className="songbar" aria-label={t.songPickerLabel}>
                <SongPicker
                  songs={[...projects, ...songs.filter((x) => !x.is_project)].map((x) => ({ id: x.id, title: x.title, open: !!x.is_project }))}
                  value={song?.id}
                  base={isAdmin ? `/dashboard?artist=${artist.id}` : "/dashboard"}
                  label={t.songPickerLabel}
                  lockedNote={t.songLocked}
                  chooseLabel={t.songChoose}
                />
                <a href={reportHref} className="btn btn--sm songbar__report">{t.seeReport}</a>
                {songs.some((x) => !x.is_project) && (
                  <p className="songbar__more">{t.songMore} <a href="/#contact">{t.songMoreLink}</a></p>
                )}
              </section>
            )}

            <ProgressSummary rows={allRows} lang={lang} />
          </div>
          <section className="panel panel--yellow dash-l__songs" id="songs">
            <div className="songs__head">
              <h2 className="h2" style={{ margin: 0 }}>{t.yourSongs}</h2>
              <form action={setListenPlatform} className="platform-toggle" aria-label={t.listenOn}>
                <span>{t.listenOn}</span>
                {[["spotify", "Spotify"], ["apple", "Apple Music"]].map(([k, name]) => (
                  <button key={k} type="submit" name="platform" value={k} className={platform === k ? "is-on" : ""} aria-pressed={platform === k} disabled={isAdmin}>
                    {name}
                  </button>
                ))}
              </form>
            </div>
            {songs.length === 0 ? (
              <p style={{ margin: 0 }}>{t.noSongs}</p>
            ) : (
              <>
                <IPod
                  songs={songs.map((s) => ({
                    id: s.id,
                    title: s.title,
                    artwork: s.artwork_url || null,
                    date: s.release_date ? fmtDate(s.release_date, lang) : "",
                    url: listenUrl(s),
                  }))}
                  labels={{ title: t.yourSongs, list: t.songList, count: t.songCount, prev: t.prevSong, next: t.nextSong, listen: t.listen, hint: t.wheelHint }}
                />
                {songs.length > 1 && <p className="ipod__hint">{t.wheelHint}</p>}
              </>
            )}
          </section>
          <div className="dstars" aria-hidden="true">
              <Star size={46} fill="#F2C94C" className="abs twinkle" style={{ left: "8%", top: "10%" }} />
              <Star size={24} fill="#F4A6C9" className="abs drift" style={{ left: "58%", top: "4%" }} />
              <Star size={30} fill="#9CCBE0" className="abs twinkle2" style={{ left: "72%", top: "30%" }} />
              <Star size={18} fill="#6F93CF" className="abs drift2" style={{ left: "30%", top: "38%" }} />
              <Star size={58} fill="#F4A6C9" className="abs twinkle" style={{ left: "18%", top: "56%" }} />
              <Star size={22} fill="#F2C94C" className="abs drift" style={{ left: "64%", top: "62%" }} />
              <Star size={36} fill="#6F93CF" className="abs twinkle2" style={{ left: "48%", top: "80%" }} />
              <Star size={16} fill="#9CCBE0" className="abs drift2" style={{ left: "6%", top: "86%" }} />
              <Star size={26} fill="#F2C94C" className="abs twinkle2" style={{ left: "80%", top: "84%" }} />
          </div>
        </div>

        <section className="panel" style={{ borderRadius: 24, padding: 30 }}>
          <h2 className="h2" style={{ fontSize: 28 }}>{t.stepByStep}</h2>
          <p style={{ margin: "0 0 18px", fontSize: 15 }}>{t.stepByStepLead}</p>
          {songRows.length ? (
            <StepsTable rows={songRows} lang={lang} pillars={SONG_PILLARS} lockedPkgs={hasPkg("Comet") ? [] : ["Comet"]} />
          ) : (
            <p style={{ margin: 0 }}>{t.noProjectSong}</p>
          )}
        </section>

        {artistRows.some((r) => ["pro", "mlc", "soundexchange", "distributor_account"].includes(r.step_key)) && (
          <section className="panel" style={{ borderRadius: 24, padding: 30 }}>
            <h2 className="h2" style={{ fontSize: 28 }}>{t.membershipTitle}</h2>
            <p style={{ margin: "0 0 18px", fontSize: 15 }}>{t.membershipLead}</p>
            <StepsTable rows={artistRows} lang={lang} pillars={["membership"]} />
          </section>
        )}

        <section className="panel" style={{ borderRadius: 24, padding: 30 }}>
          <div className="songs__head">
            <h2 className="h2" style={{ fontSize: 28, margin: 0 }}>{t.brandTitle}</h2>
            <a href={isAdmin ? `/dashboard/astro?artist=${artist.id}` : "/dashboard/astro"} className="btn btn--dark btn--sm">{t.astroOpen}</a>
          </div>
          <p style={{ margin: "0 0 18px", fontSize: 15 }}>{t.brandLead}</p>
          <Locked locked={brandLocked} pkg="Astro" text={t.lockedBrand} t={t}>
            <StepsTable
              rows={brandLocked
                ? STEPS.filter((x) => x.pillar === "brand").map((x) => artistRows.find((r) => r.step_key === x.key) || { step_key: x.key, status: "pending", start_status: "pending" })
                : artistRows}
              lang={lang}
              pillars={["brand"]}
            />
          </Locked>
        </section>

            <section className="panel road-panel road-panel--cal" id="cal-release">
              <Star size={64} fill="#F2C94C" stroke="#1E1B2E" strokeWidth={3} className="abs twinkle road-panel__s1" />
              <Star size={34} fill="#F4A6C9" className="abs twinkle2 road-panel__s2" />
              <Star size={24} fill="#9CCBE0" className="abs drift road-panel__s3" />
              <div className="songs__head">
                <h2 className="h2" style={{ fontSize: 28, margin: 0 }}>{t.releaseCalTitle}</h2>
                {!releaseLocked && (
                  <RoadmapButton label={t.roadMore} closeLabel={t.roadClose}>
                  <div className="road-panel">
                    <Star size={64} fill="#F2C94C" stroke="#1E1B2E" strokeWidth={3} className="abs twinkle road-panel__s1" />
                    <Star size={36} fill="#F4A6C9" className="abs twinkle2 road-panel__s2" />
                    <Star size={26} fill="#9CCBE0" className="abs drift road-panel__s3" />
                    <div className="kicker">{songTitle}</div>
                    <h2 className="h2 road-panel__title">{t.roadTitle}</h2>
                    <p className="road-panel__lead">{t.roadLead}</p>
                      {road.length ? (
                        <>
                          <div className="road__legend">
                            {t.roadLegend.map(([k, l]) => <span key={k}><i className={`road__dot road__dot--${k}`} />{l}</span>)}
                          </div>
                          <Roadmap
                            items={road}
                            lang={lang}
                            labels={{ here: t.roadHere, daysLeft: t.roadDaysLeft, lateBy: t.roadLateBy, dueToday: t.roadDueToday, doneTag: t.roadDone, today: t.roadToday, released: t.roadReleased, releaseDay: t.releaseDay, weeksBefore: t.roadWeeksBefore, weekAfter: t.roadWeekAfter }}
                          />
                        </>
                      ) : (
                        <p className="road-panel__empty">{t.roadNoDate}</p>
                      )}
                  </div>
                  </RoadmapButton>
                )}
              </div>
              <p style={{ margin: "0 0 18px", fontSize: 15 }}>{t.releaseCalLead}</p>
              <Locked locked={releaseLocked} pkg="Launchpad" text={t.lockedRelease} t={t}>
              <Calendar
                {...calProps}
                items={releaseItems}
                legend={[{ color: CAL.release, label: t.releaseDay }, { color: CAL.milestone, label: t.milestone }]}
              >
                {!releaseLocked && <details className="cal__add">
                  <summary>+ {t.calAdd}</summary>
                  <form action={addCalendarItem} className="cal__form">
                    <input type="hidden" name="kind" value="release" />
                    {adminHidden}
                    <label className="field"><span>{t.calDate}</span><input type="date" name="happens_on" className="input" required /></label>
                    <label className="field cal__wide"><span>{t.milestoneTitle}</span><input name="title" className="input" maxLength={160} placeholder={t.milestonePh} required /></label>
                    <label className="field"><span>{t.calSong}</span>{songOptions}</label>
                    <button type="submit" className="btn btn--dark cal__submit">{t.calSave}</button>
                  </form>
                </details>}
              </Calendar>
              </Locked>
            </section>

        <ContentCalendar artist={artist} songs={songs} calendar={calendar} isAdmin={isAdmin} lang={lang} today={today} locked={contentLocked} post={sp?.post} />

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
