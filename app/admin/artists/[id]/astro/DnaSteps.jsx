import { SOURCES, STATUSES, UNLOCKS, dnaSteps, isOk } from "../../../../../lib/astro-dna-steps";
import { saveAstroStep } from "../../../astro-actions";
import { fmtDate } from "../../../../ui";

const ink = "#1E1B2E";
const pill = { border: `2px solid ${ink}`, borderRadius: 999, padding: "5px 12px", fontWeight: 600, fontSize: 13, display: "inline-block", whiteSpace: "nowrap" };
const bar = (pct) => (
  <div style={{ height: 14, border: `2px solid ${ink}`, borderRadius: 999, overflow: "hidden", background: "#fff" }}>
    <div style={{ width: `${pct}%`, height: "100%", background: "#F2C94C" }} />
  </div>
);

function StatusSelect({ value }) {
  return (
    <select name="status" defaultValue={value} className="select-sm" aria-label="Status">
      {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.en}</option>)}
    </select>
  );
}

function VoiceForm({ artistId, step, voiceLink }) {
  const v = step.saved;
  const mode = v.mode || "note";
  return (
    <form action={saveAstroStep} className="stack" style={{ gap: 12, marginTop: 10 }}>
      <input type="hidden" name="artist_id" value={artistId} />
      <input type="hidden" name="step" value="vn" />
      <div className="opts" role="radiogroup" aria-label="How we hear them">
        <label className="opt"><input type="radio" name="mode" value="note" defaultChecked={mode === "note"} /> Voice note</label>
        <label className="opt"><input type="radio" name="mode" value="live" defaultChecked={mode === "live"} /> Live meeting</label>
      </div>
      <div className="fgrid">
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="vn-link">Voice note link {voiceLink ? <span className="muted" style={{ fontWeight: 400 }}>· the artist shared: <a href={voiceLink} target="_blank" rel="noopener noreferrer">open</a></span> : null}</label>
          <input id="vn-link" name="link" className="input" defaultValue={v.link || voiceLink || ""} placeholder="https://" />
        </div>
        <div className="field"><label htmlFor="vn-date">Meeting date</label><input id="vn-date" name="date" type="date" className="input" defaultValue={v.date || ""} /></div>
        <div className="field">
          <label htmlFor="vn-format">Meeting format</label>
          <select id="vn-format" name="format" className="input" defaultValue={v.format || "video"}>
            <option value="video">Video call</option>
            <option value="in_person">In person</option>
            <option value="phone">Phone call</option>
          </select>
        </div>
        <div className="field"><label htmlFor="vn-min">Length (minutes)</label><input id="vn-min" name="minutes" inputMode="numeric" className="input" defaultValue={v.minutes || ""} /></div>
        <div className="field" style={{ alignSelf: "end" }}>
          <label className="opt"><input type="checkbox" name="recorded" defaultChecked={!!v.recorded} /> Recorded with their permission</label>
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="vn-notes">Notes from the voice note or meeting</label>
          <textarea id="vn-notes" name="notes" className="input" defaultValue={v.notes || ""} placeholder="How they started, who the song is for, what they want fans to feel…" />
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="vn-quotes">In their own words (exact quotes, one per line)</label>
          <textarea id="vn-quotes" name="quotes" className="input" defaultValue={v.quotes || ""} placeholder="&ldquo;I write the letters I was too scared to send.&rdquo;" />
        </div>
      </div>
      <div className="inline">
        <StatusSelect value={step.state} />
        <button type="submit" className="small-btn small-btn--dark">Save</button>
      </div>
    </form>
  );
}

// The Artist DNA steps: what has fed the DNA so far and what each deliverable still waits for.
export default function DnaSteps({ artist }) {
  const base = `/admin/artists/${artist.id}/astro`;
  const steps = dnaSteps(artist);
  const byKey = Object.fromEntries(steps.map((s) => [s.key, s]));
  const done = steps.filter((s) => isOk(s.state)).length;
  const voiceLink = artist.astro_answers?.voice_note || "";

  return (
    <section className="panel" id="dna-steps">
      <h2 className="h2" style={{ marginBottom: 4 }}>Artist DNA · how it fills up</h2>
      <p style={{ margin: "0 0 14px", fontSize: 15, maxWidth: "72ch" }}>
        The Artist DNA is our curated source for every Astro deliverable. It fills up from three sides: the artist, the agency and the creative team.
        Steps marked <strong>auto</strong> update themselves when the data is in; mark the others here.
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
        <span>Overall</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{done} of {steps.length} steps</span>
      </div>
      {bar(Math.round((done / steps.length) * 100))}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, margin: "16px 0 6px" }}>
        {SOURCES.map((src) => {
          const list = steps.filter((s) => s.src === src.key);
          const d = list.filter((s) => isOk(s.state)).length;
          return (
            <div key={src.key} style={{ border: `2px solid ${ink}`, borderRadius: 14, padding: 14, background: src.bg, display: "grid", gap: 6 }}>
              <strong className="disp" style={{ fontSize: 19 }}>{src.name}</strong>
              <span className="muted" style={{ fontSize: 14 }}>{src.desc}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{d} of {list.length} done</span>
              {bar(Math.round((d / list.length) * 100))}
            </div>
          );
        })}
      </div>

      {SOURCES.map((src) => (
        <div key={src.key} className="stack" style={{ gap: 10, marginTop: 16 }}>
          <h3 className="h3" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: 999, border: `2px solid ${ink}`, background: src.color, display: "inline-block" }} />
            {src.name}
          </h3>
          {steps.filter((s) => s.src === src.key).map((s) => (
            <div key={s.key} id={`step-${s.key}`} style={{ border: `1.5px solid ${ink}`, borderRadius: 14, padding: "12px 14px", background: "#fff", display: "grid", gap: 6 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <span style={{ ...pill, background: STATUSES[s.state].bg, textDecoration: s.state === "na" ? "line-through" : "none" }}>{STATUSES[s.state].en}</span>
                <strong style={{ flex: "1 1 240px" }}>{s.title}{s.auto && <span style={{ marginLeft: 8, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#C2417F" }}>auto</span>}</strong>
                {s.href && <a href={s.href(base, artist.id)} className="small-btn" style={{ textDecoration: "none" }}>{s.action} →</a>}
              </div>
              <div className="muted" style={{ fontSize: 14 }}>{s.desc}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {s.fills.map((f) => <span key={f} style={{ fontSize: 12, border: "1px solid #8a8598", borderRadius: 999, padding: "1px 8px", color: "#5f5a70" }}>Fills: {f}</span>)}
              </div>
              {s.key === "vn" && s.saved.status && (
                <div style={{ fontSize: 14, borderLeft: "3px solid #9CCBE0", paddingLeft: 12 }}>
                  {s.saved.mode === "live"
                    ? <>Live meeting{s.saved.date ? ` · ${fmtDate(s.saved.date, "en")}` : ""}{s.saved.format ? ` · ${{ video: "Video call", in_person: "In person", phone: "Phone call" }[s.saved.format] || s.saved.format}` : ""}{s.saved.minutes ? ` · ${s.saved.minutes} min` : ""}{s.saved.recorded ? " · recorded" : ""}</>
                    : <>Voice note{s.saved.link ? <> · <a href={s.saved.link} target="_blank" rel="noopener noreferrer">open</a></> : ""}</>}
                  {s.saved.quotes && <div style={{ marginTop: 4, whiteSpace: "pre-line" }}><em>{s.saved.quotes}</em></div>}
                </div>
              )}
              {!s.auto && s.key !== "vn" && s.saved.note && <div style={{ fontSize: 14 }}>Note: {s.saved.note}</div>}
              {!s.auto && (
                <details>
                  <summary style={{ cursor: "pointer", fontSize: 14, fontWeight: 600 }}>{s.key === "vn" ? "Add voice note or meeting notes" : "Update"}</summary>
                  {s.key === "vn" ? (
                    <VoiceForm artistId={artist.id} step={s} voiceLink={voiceLink} />
                  ) : (
                    <form action={saveAstroStep} className="inline" style={{ marginTop: 10 }}>
                      <input type="hidden" name="artist_id" value={artist.id} />
                      <input type="hidden" name="step" value={s.key} />
                      <StatusSelect value={s.state} />
                      <input name="note" className="input" defaultValue={s.saved.note || ""} placeholder="Note (optional)" aria-label="Note" />
                      <button type="submit" className="small-btn small-btn--dark">Save</button>
                    </form>
                  )}
                </details>
              )}
            </div>
          ))}
        </div>
      ))}

      <h3 className="h3" style={{ margin: "22px 0 4px" }}>What the DNA unlocks</h3>
      <p style={{ margin: "0 0 10px", fontSize: 14 }}>A deliverable turns yellow when the steps it needs are done or not needed.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
        {UNLOCKS.map((u) => {
          const miss = u.needs.filter((k) => !isOk(byKey[k].state));
          return (
            <div key={u.name} style={{ border: `2px solid ${ink}`, borderRadius: 14, padding: 12, background: miss.length ? "#fff" : "#F2C94C", display: "grid", gap: 4, alignContent: "start" }}>
              <strong className="disp" style={{ fontSize: 17 }}>{u.name}</strong>
              <span style={{ fontSize: 13 }}>{u.sub}</span>
              <span style={{ fontSize: 13 }} className={miss.length ? "muted" : undefined}>
                {miss.length ? `Waiting for: ${miss.map((k) => byKey[k].title.toLowerCase()).join(", ")}` : "✓ Ready to build"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
