import PendingSubmit from "../../PendingSubmit";
import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage, OK_MSG } from "../../shell";
import { loadArtist } from "../../../../lib/artist-data";
import { PACKAGES, STATUS, SONG_PILLARS, rowsInPlan } from "../../../../lib/steps";
import { songScope } from "../../../../lib/song-scope";
import { ProgressSummary, StepsTable } from "../../../progress";
import { fmtDate } from "../../../ui";
import UploadForm from "./UploadForm";
import PriceCalculator from "./PriceCalculator";
import { startingQuote, normalizeQuote } from "../../../../lib/pricing";
import SongPicker from "../../../SongPicker";
import PhotoUpload from "../../../PhotoUpload";
import { browserConfig } from "../../../../lib/env";
import { appleArtistIdFromUrl, searchAppleArtists } from "../../../../lib/apple-music";
import { spotifyArtistIdFromUrl, searchSpotifyArtists } from "../../../../lib/spotify";
import { spotifyConfigured } from "../../../../lib/env";
import {
  updateArtist, updateSteps, addNextStep, toggleNextStep, addNote, addMilestone,
  toggleMilestone, deleteItem, resendInvite, addSong, importAppleSongs, importSpotifySongs, toggleProjectSong,
  addPayment, togglePayment,
} from "../../actions";

function Del({ artistId, table, id }) {
  return (
    <form action={deleteItem}>
      <input type="hidden" name="artist_id" value={artistId} />
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="small-btn small-btn--danger" aria-label="Delete">Delete</button>
    </form>
  );
}

export const dynamic = "force-dynamic";

export default async function ArtistAdmin({ params, searchParams }) {
  const { supabase } = await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const data = await loadArtist(supabase, id);
  if (!data) notFound();
  const { artist, rows, next, notes, milestones, files, songs, photoUrl, payments } = data;
  const money = (n) => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const owed = payments.filter((p) => p.status !== "paid").reduce((a, p) => a + Number(p.amount), 0);
  const hidden = <input type="hidden" name="artist_id" value={artist.id} />;
  // Launchpad price calculator: the saved quote, or a first version built from the checklist.
  const { data: savedQuote } = await supabase.from("artist_quotes").select("data, updated_at").eq("artist_id", id).maybeSingle();
  const { projects, current: song, songRows, artistRows, allRows } = songScope(artist, songs, rows, sp?.song);
  const statusSelect = (r) => (
    <select name={`status_${r.id}`} defaultValue={r.status} className="select-sm" aria-label="Status">
      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.en}</option>)}
    </select>
  );

  // Song import: the linked artist on each platform, or search results to pick from.
  const spOn = spotifyConfigured();
  const appleId = artist.apple_artist_id || appleArtistIdFromUrl(artist.intake_answers?.apple_url);
  const spotifyId = artist.spotify_artist_id || spotifyArtistIdFromUrl(artist.intake_answers?.spotify_url);
  const amSearch = typeof sp?.am_search === "string" ? sp.am_search.trim() : "";
  const spSearch = typeof sp?.sp_search === "string" ? sp.sp_search.trim() : "";
  let amResults = null;
  let spResults = null;
  if (amSearch) {
    try { amResults = await searchAppleArtists(amSearch); } catch { amResults = []; }
  }
  if (spSearch && spOn) {
    try { spResults = await searchSpotifyArtists(spSearch); } catch { spResults = []; }
  }
  const sources = [
    { key: "spotify", label: "Spotify", on: spOn, id: spotifyId, idField: "spotify_artist_id", searchParam: "sp_search", search: spSearch, results: spResults, action: importSpotifySongs, link: (x) => `https://open.spotify.com/artist/${x}` },
    { key: "apple", label: "Apple Music", on: true, id: appleId, idField: "apple_artist_id", searchParam: "am_search", search: amSearch, results: amResults, action: importAppleSongs, link: (x) => `https://music.apple.com/artist/${x}` },
  ];

  return (
    <AdminShell>
      <a href="/admin">← Back</a>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <PhotoUpload artistId={artist.id} sb={browserConfig()} photoUrl={photoUrl} name={artist.name} label="Change photo" busyLabel="Uploading…" errorLabel="Could not upload the photo (images up to 10 MB)." size={96} />
          <div>
          <div className="kicker">{artist.email || "No email yet"}</div>
          <h1 className="h1">{artist.name}</h1>
          <p className="lead">{artist.user_id ? "Has an account" : "No account yet"} · Language: {artist.lang.toUpperCase()}</p>
          </div>
        </div>
        <div className="inline">
          <a href={`/dashboard?artist=${artist.id}`} className="small-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>View their dashboard</a>
          <a href={`/admin/artists/${artist.id}/questionnaire`} className="small-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", background: "#E3F1F8" }}>{artist.intake_done_at ? "Questionnaire" : "Questionnaire · pending"}</a>
          <a href={`/admin/artists/${artist.id}/astro`} className="small-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", background: "#F2C94C" }}>✦ Astro · Brandbook</a>
          <a href="#pricing" className="small-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", background: "#FCE4EF" }}>$ Price</a>
          <a href={`/report?artist=${artist.id}`} className="small-btn small-btn--dark" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Final report</a>
        </div>
      </div>
      {sp?.ok && OK_MSG[sp.ok] && <div className="alert alert--ok" role="status">{OK_MSG[sp.ok]}</div>}

      <ProgressSummary
        rows={rowsInPlan(allRows, artist.packages, artist.monthly_member)}
        lang="en"
        id="progress"
        aside={projects.length > 0 && (
          <div className="stepsong">
            <SongPicker
              songs={projects.map((p) => ({ id: p.id, title: p.title, open: true }))}
              value={song?.id}
              base={`/admin/artists/${artist.id}`}
              hash="#progress"
              label="Song"
              lockedNote=""
              chooseLabel="Choose a song"
            />
          </div>
        )}
      />

      <section className="panel" id="steps">
        <div className="steps__head">
          <div>
            <h2 className="h2">Steps</h2>
            <p style={{ margin: 0, fontSize: 15 }}>Change the status and click "Save steps". Marking "Done together" saves the date for the report.</p>
          </div>
        </div>
        <form action={updateSteps} className="stack">
          {hidden}
          <input type="hidden" name="song" value={song?.id || ""} />
          <h3 className="h3" style={{ margin: "4px 0 0" }}>{song ? `Song · ${song.title}` : "Song steps"}</h3>
          {songRows.length ? (
            <StepsTable rows={songRows} lang="en" pillars={SONG_PILLARS} renderStatus={statusSelect} />
          ) : (
            <p style={{ margin: 0, fontSize: 15 }}>No agency project yet. In <a href="#songs">Songs</a>, mark a song as &ldquo;Agency project&rdquo; to give it its own steps.</p>
          )}
          <h3 className="h3" style={{ margin: "12px 0 0" }}>Once per artist · memberships and brand</h3>
          <StepsTable rows={artistRows} lang="en" pillars={["membership", "brand"]} renderStatus={statusSelect} />
          <button type="submit" className="btn btn--dark btn--sm" style={{ alignSelf: "flex-start" }}>Save steps</button>
        </form>
      </section>

      <div className="row">
        <section className="panel panel--yellow" id="next">
          <h2 className="h2">Next steps</h2>
          <ul className="checks" style={{ margin: "12px 0 16px" }}>
            {next.map((n) => (
              <li key={n.id} style={{ alignItems: "center" }}>
                <form action={toggleNextStep}>
                  {hidden}
                  <input type="hidden" name="id" value={n.id} />
                  <input type="hidden" name="done" value={String(!n.done)} />
                  <button type="submit" className="box" aria-label={n.done ? "Mark pending" : "Mark done"} style={{ cursor: "pointer", background: n.done ? "#F2C94C" : "#fff" }}>{n.done ? "✓" : ""}</button>
                </form>
                <span style={{ flexGrow: 1, textDecoration: n.done ? "line-through" : "none" }}><strong>{n.owner === "artist" ? "Artist:" : "Us:"}</strong> {n.body}</span>
                <Del artistId={artist.id} table="next_steps" id={n.id} />
              </li>
            ))}
          </ul>
          <form action={addNextStep} className="inline">
            {hidden}
            <select name="owner" className="select-sm" aria-label="Who">
              <option value="agency">Us</option>
              <option value="artist">Artist</option>
            </select>
            <input name="body" className="input" placeholder="New step…" aria-label="New step" required />
            <button type="submit" className="small-btn small-btn--dark">Add</button>
          </form>
        </section>

        <section className="panel panel--pink" id="files">
          <h2 className="h2">Files</h2>
          <ul className="filelist" style={{ margin: "12px 0 16px" }}>
            {files.map((f) => (
              <li key={f.id}>
                <a href={`/files/${f.id}`}>{f.name}</a>
                <Del artistId={artist.id} table="artist_files" id={f.id} />
              </li>
            ))}
          </ul>
          <UploadForm artistId={artist.id} sb={browserConfig()} />
        </section>
      </div>

      <section className="panel" id="pricing">
        <h2 className="h2">Launchpad price</h2>
        <p style={{ margin: "0 0 16px", fontSize: 15 }}>
          Only you see this. Untick what the artist already has (the first version already leaves out what their checklist marks as done), add their songs and save. Each artist keeps their own quote.
        </p>
        <PriceCalculator
          artistId={artist.id}
          artistName={artist.name}
          initial={normalizeQuote(savedQuote?.data, startingQuote(projects, rows))}
          savedAt={savedQuote?.updated_at || null}
          saved={!!savedQuote}
          lang={artist.lang}
        />
      </section>

      <section className="panel panel--blue" id="payments">
        <h2 className="h2">Payments</h2>
        <p style={{ margin: "0 0 12px", fontSize: 15 }}>The artist sees these under &ldquo;Your payments&rdquo;. Tick the box when a payment comes in. Still to pay: <strong>{money(owed)}</strong></p>
        <ul className="checks" style={{ margin: "0 0 16px" }}>
          {payments.map((p) => (
            <li key={p.id} style={{ alignItems: "center" }}>
              <form action={togglePayment}>
                {hidden}
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="paid" value={String(p.status !== "paid")} />
                <button type="submit" className="box" aria-label={p.status === "paid" ? "Mark as not paid" : "Mark as paid"} style={{ cursor: "pointer", background: p.status === "paid" ? "#F2C94C" : "#fff" }}>{p.status === "paid" ? "✓" : ""}</button>
              </form>
              <span style={{ flexGrow: 1 }}>
                <strong>{money(p.amount)}</strong> · {p.description}
                <span className="muted" style={{ fontSize: 13 }}>{p.due_on ? ` · due ${p.due_on}` : ""}{p.status === "paid" && p.paid_on ? ` · paid ${p.paid_on}` : ""}</span>
              </span>
              <Del artistId={artist.id} table="payments" id={p.id} />
            </li>
          ))}
        </ul>
        <form action={addPayment} className="inline">
          {hidden}
          <input name="description" className="input" placeholder="What it's for (e.g. Launchpad · 1st half)" aria-label="Description" required style={{ flex: "2 1 220px" }} />
          <input name="amount" className="input" inputMode="decimal" placeholder="Amount ($)" aria-label="Amount" required style={{ flex: "1 1 110px" }} />
          <input name="due_on" type="date" className="input" aria-label="Due date" style={{ flex: "1 1 150px" }} />
          <button type="submit" className="small-btn small-btn--dark">Add</button>
        </form>
      </section>

      <section className="panel panel--yellow" id="songs">
        <h2 className="h2">Songs</h2>
        <p style={{ margin: "0 0 12px", fontSize: 15 }}>These show on the artist&apos;s profile. The single from their questionnaire is added automatically.</p>

        {sp?.imported !== undefined && (
          <div className="alert alert--ok" role="status">Found {sp.found} songs on {sp.from === "spotify" ? "Spotify" : "Apple Music"} · {sp.imported} new added.</div>
        )}
        {sp?.import_error && <div className="alert" role="alert">Couldn&apos;t get the songs from {sp.import_error === "spotify" ? "Spotify" : "Apple Music"}. Try again in a moment.{sp.detail && <span className="muted" style={{ display: "block", fontSize: 13, marginTop: 4 }}>Detail: {String(sp.detail)}</span>}</div>}
        <p style={{ margin: "0 0 10px", fontSize: 14 }}>
          The artist listens on: <strong>{artist.listen_platform === "apple" ? "Apple Music" : "Spotify"}</strong> (they choose it in their dashboard).
        </p>
        <div className="importgrid">
          {sources.map((src) => (
            <div key={src.key} className="importbox">
              <strong>Bring songs from {src.label}</strong>
              {!src.on ? (
                <p style={{ margin: 0, fontSize: 14 }}>Not connected yet. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in Vercel (see setup notes).</p>
              ) : (
                <>
                  {src.id && !src.search && (
                    <form action={src.action} className="inline">
                      {hidden}
                      <input type="hidden" name={src.idField} value={src.id} />
                      <button type="submit" className="small-btn small-btn--dark">Bring songs</button>
                      <span className="muted" style={{ fontSize: 13 }}>
                        <a href={src.link(src.id)} target="_blank" rel="noopener noreferrer">linked artist</a>
                        {" · "}<a href={`/admin/artists/${artist.id}?${src.searchParam}=${encodeURIComponent(artist.name)}#songs`}>wrong one? search</a>
                      </span>
                    </form>
                  )}
                  {(!src.id || src.search) && (
                    <form method="get" action={`/admin/artists/${artist.id}`} className="inline">
                      <input name={src.searchParam} className="input" defaultValue={src.search || artist.name} aria-label={`Artist name on ${src.label}`} />
                      <button type="submit" className="small-btn">Search</button>
                    </form>
                  )}
                  {src.results && (src.results.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 14 }}>No artists found with that name. Try another spelling.</p>
                  ) : (
                    <ul className="checks">
                      {src.results.map((r) => (
                        <li key={r.id} style={{ alignItems: "center" }}>
                          <span style={{ flexGrow: 1, fontSize: 14 }}><strong>{r.name}</strong>{r.genre && <span className="muted"> · {r.genre}</span>} · <a href={r.link} target="_blank" rel="noopener noreferrer">check</a></span>
                          <form action={src.action}>
                            {hidden}
                            <input type="hidden" name={src.idField} value={r.id} />
                            <button type="submit" className="small-btn small-btn--dark">This is them</button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
        <ul className="checks" style={{ margin: "0 0 16px" }}>
          {songs.map((s) => (
            <li key={s.id} style={{ alignItems: "center" }}>
              {s.artwork_url && <img src={s.artwork_url} alt="" width={36} height={36} style={{ borderRadius: 6, border: "1.5px solid #1E1B2E" }} />}
              <span style={{ flexGrow: 1 }}><strong>{s.title}</strong>{s.release_date && <> · {fmtDate(s.release_date, "en")}</>}{s.spotify_url && <> · <a href={s.spotify_url} target="_blank" rel="noopener noreferrer">Spotify</a></>}{s.link && <> · <a href={s.link} target="_blank" rel="noopener noreferrer">{s.link.includes("music.apple.com") ? "Apple Music" : "link"}</a></>}</span>
              <form action={toggleProjectSong}>
                {hidden}
                <input type="hidden" name="song_id" value={s.id} />
                <input type="hidden" name="on" value={String(!s.is_project)} />
                <button type="submit" className={s.is_project ? "small-btn small-btn--dark" : "small-btn"} title="Agency projects get their own steps and show in the artist's song menu">
                  {s.is_project ? "★ Agency project" : "Make agency project"}
                </button>
              </form>
              <Del artistId={artist.id} table="songs" id={s.id} />
            </li>
          ))}
        </ul>
        <form action={addSong} className="inline">
          {hidden}
          <input name="title" className="input" placeholder="Song title" aria-label="Song title" required />
          <input name="release_date" type="date" className="input" aria-label="Release date" style={{ flex: "0 1 180px" }} />
          <input name="link" className="input" placeholder="Spotify / YouTube link (optional)" aria-label="Link" />
          <button type="submit" className="small-btn small-btn--dark">Add</button>
        </form>
      </section>

      <div className="row">
        <section className="panel panel--blue" id="timeline">
          <h2 className="h2">Timeline</h2>
          <ul className="checks" style={{ margin: "12px 0 16px" }}>
            {milestones.map((m) => (
              <li key={m.id} style={{ alignItems: "center" }}>
                <form action={toggleMilestone}>
                  {hidden}
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="done" value={String(!m.done)} />
                  <button type="submit" className="box" aria-label={m.done ? "Mark pending" : "Mark done"} style={{ cursor: "pointer", borderRadius: 999, background: m.done ? "#1E1B2E" : "#fff" }} />
                </form>
                <span style={{ flexGrow: 1 }}><strong>{fmtDate(m.happens_on, "en")}</strong> · {m.body}</span>
                <Del artistId={artist.id} table="milestones" id={m.id} />
              </li>
            ))}
          </ul>
          <form action={addMilestone} className="inline">
            {hidden}
            <input name="happens_on" type="date" className="input" aria-label="Date" required style={{ flex: "0 1 180px" }} />
            <input name="body" className="input" placeholder="Milestone…" aria-label="Milestone" required />
            <button type="submit" className="small-btn small-btn--dark">Add</button>
          </form>
        </section>

        <section className="panel" id="notes">
          <h2 className="h2">Notes for the artist</h2>
          <div className="stack" style={{ gap: 12, margin: "12px 0 16px" }}>
            {notes.map((n) => (
              <div key={n.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div className="anote" style={{ flexGrow: 1 }}><div className="muted" style={{ fontSize: 13 }}>{fmtDate(n.created_at, "en")}</div>{n.body}</div>
                <Del artistId={artist.id} table="notes" id={n.id} />
              </div>
            ))}
          </div>
          <form action={addNote} className="stack" style={{ gap: 10 }}>
            {hidden}
            <textarea name="body" className="input" placeholder="Write a note the artist will see…" aria-label="Note" required />
            <button type="submit" className="small-btn small-btn--dark" style={{ alignSelf: "flex-start" }}>Post note</button>
          </form>
        </section>
      </div>


      <section className="panel panel--lilac">
        <h2 className="h2">Artist details</h2>
        <form action={updateArtist} className="stack" style={{ gap: 16, marginTop: 12 }}>
          {hidden}
          <div className="fgrid">
            <div className="field"><label htmlFor="ar-name">Artist name</label><input id="ar-name" name="name" className="input" defaultValue={artist.name} required /></div>
            <div className="field"><label htmlFor="ar-email">Email <span className="muted" style={{ fontWeight: 400 }}>(needed for the invitation)</span></label><input id="ar-email" name="email" type="email" className="input" defaultValue={artist.email || ""} /></div>
            <div className="field">
              <label htmlFor="ar-lang">Language</label>
              <select id="ar-lang" name="lang" className="input" defaultValue={artist.lang}><option value="es">Spanish</option><option value="en">English</option></select>
            </div>
            <div className="field"><label htmlFor="ar-single">Single</label><input id="ar-single" name="single_title" className="input" defaultValue={artist.single_title || ""} /></div>
            <div className="field"><label htmlFor="ar-date">Release date</label><input id="ar-date" name="release_date" type="date" className="input" defaultValue={artist.release_date || ""} /></div>
            <div className="field"><label htmlFor="ar-closed">Package close date</label><input id="ar-closed" name="closed_at" type="date" className="input" defaultValue={artist.closed_at || ""} /></div>
          </div>
          <div className="field">
            <fieldset>
              <legend>Packages purchased</legend>
              <div className="opts">
                {PACKAGES.map((p) => (
                  <label key={p} className="opt"><input type="checkbox" name="packages" value={p} defaultChecked={(artist.packages || []).includes(p)} /> {p}</label>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="field">
            <fieldset>
              <legend>Monthly membership</legend>
              <label className="opt"><input type="checkbox" name="monthly_member" defaultChecked={!!artist.monthly_member} /> Pays a monthly membership: unlocks the release calendar, the content calendar and "Your brand"</label>
            </fieldset>
          </div>
          <button type="submit" className="btn btn--dark btn--sm" style={{ alignSelf: "flex-start" }}>Save details</button>
        </form>
        {artist.email ? (
          <form action={resendInvite} style={{ marginTop: 16 }}>
            {hidden}
            <PendingSubmit className="small-btn">{artist.user_id ? "Resend invitation" : "Send invitation"}</PendingSubmit>
          </form>
        ) : (
          <p className="muted" style={{ margin: "16px 0 0", fontSize: 14 }}>Add the artist&apos;s email above and save to be able to send them an invitation.</p>
        )}
      </section>
    </AdminShell>
  );
}
