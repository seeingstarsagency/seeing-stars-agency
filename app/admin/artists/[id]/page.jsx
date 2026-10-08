import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage, OK_MSG } from "../../shell";
import { loadArtist } from "../../../../lib/artist-data";
import { PACKAGES, STATUS } from "../../../../lib/steps";
import { ProgressSummary, StepsTable } from "../../../progress";
import { fmtDate } from "../../../ui";
import UploadForm from "./UploadForm";
import { browserConfig } from "../../../../lib/env";
import {
  updateArtist, updateSteps, addNextStep, toggleNextStep, addNote, addMilestone,
  toggleMilestone, deleteItem, resendInvite,
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
  const { artist, rows, next, notes, milestones, files } = data;
  const hidden = <input type="hidden" name="artist_id" value={artist.id} />;

  return (
    <AdminShell>
      <a href="/admin">← Back</a>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="kicker">{artist.email}</div>
          <h1 className="h1">{artist.name}</h1>
          <p className="lead">{artist.user_id ? "Has an account" : "No account yet"} · Language: {artist.lang.toUpperCase()}</p>
        </div>
        <div className="inline">
          <a href={`/dashboard?artist=${artist.id}`} className="small-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>View their dashboard</a>
          <a href={`/report?artist=${artist.id}`} className="small-btn small-btn--dark" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Final report</a>
        </div>
      </div>
      {sp?.ok && OK_MSG[sp.ok] && <div className="alert alert--ok" role="status">{OK_MSG[sp.ok]}</div>}

      <ProgressSummary rows={rows} lang="en" />

      <section className="panel" id="steps">
        <h2 className="h2">Steps</h2>
        <p style={{ margin: "0 0 14px", fontSize: 15 }}>Change the status and click "Save steps". Marking "Done together" saves the date for the report.</p>
        <form action={updateSteps} className="stack">
          {hidden}
          <StepsTable
            rows={rows}
            lang="en"
            renderStatus={(r) => (
              <select name={`status_${r.step_key}`} defaultValue={r.status} className="select-sm" aria-label="Status">
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.en}</option>)}
              </select>
            )}
          />
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
                <div className="note" style={{ flexGrow: 1 }}><div className="muted" style={{ fontSize: 13 }}>{fmtDate(n.created_at, "en")}</div>{n.body}</div>
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
          <button type="submit" className="btn btn--dark btn--sm" style={{ alignSelf: "flex-start" }}>Save details</button>
        </form>
        <form action={resendInvite} style={{ marginTop: 16 }}>
          {hidden}
          <button type="submit" className="small-btn">{artist.user_id ? "Resend invitation" : "Send invitation"}</button>
        </form>
      </section>
    </AdminShell>
  );
}
