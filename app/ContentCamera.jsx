"use client";

import { useMemo, useRef, useState } from "react";

// The content calendar inside a digital camera.
// Screen modes: "play" (one post, like a photo), "menu" (all posts of the month), "disp" (month grid).
// W/T change month · ◀ ▶ browse posts · MENU / DISP switch the screen · trash deletes the post.
const pad = (n) => String(n).padStart(2, "0");
const ym = (y, m) => `${y}-${pad(m + 1)}`;

export default function ContentCamera({ items, lang, labels, today, artistId, setStatus, remove, saveScript, initialId }) {
  const locale = lang === "es" ? "es-US" : "en-US";
  const sorted = useMemo(() => [...items].sort((a, b) => a.date.localeCompare(b.date)), [items]);
  // Start on the next post coming up (or today's month).
  const first = sorted.find((it) => it.id === initialId) || sorted.find((it) => it.date >= today);
  const dlg = useRef(null);
  const [month, setMonth] = useState((first?.date || today).slice(0, 7));
  const [mode, setMode] = useState(initialId ? "play" : "disp");
  const inMonth = sorted.filter((it) => it.date.startsWith(month));
  const [idx, setIdx] = useState(() => Math.max(0, inMonth.findIndex((it) => it.id === first?.id)));
  const cur = inMonth[Math.min(idx, inMonth.length - 1)] || null;

  const y = Number(month.slice(0, 4));
  const m = Number(month.slice(5, 7)) - 1;
  const monthName = new Date(Date.UTC(y, m, 1)).toLocaleDateString(locale, { month: "long", year: "numeric", timeZone: "UTC" });
  const goMonth = (delta) => {
    const d = new Date(Date.UTC(y, m + delta, 1));
    setMonth(ym(d.getUTCFullYear(), d.getUTCMonth()));
    setIdx(0);
  };
  const step = (delta) => {
    if (mode !== "play") setMode("play");
    if (!inMonth.length) return;
    setIdx((i) => (Math.min(i, inMonth.length - 1) + delta + inMonth.length) % inMonth.length);
  };
  const playItem = (it) => { setIdx(inMonth.findIndex((x) => x.id === it.id)); setMode("play"); };
  const toggle = (md) => setMode((cur) => (cur === md ? "play" : md));

  const stamp = (d) => `'${d.slice(2, 4)} ${d.slice(5, 7)} ${d.slice(8, 10)}`;
  const weekday = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString(locale, { weekday: "long", timeZone: "UTC" });

  // Month grid for DISP
  const firstDow = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const daysIn = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(Date.UTC(2023, 0, 1 + i)).toLocaleDateString(locale, { weekday: "narrow", timeZone: "UTC" }));
  const byDay = {};
  inMonth.forEach((it) => { (byDay[it.date] ||= []).push(it); });

  const onKey = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  };

  return (
    <div className="cam-wrap">
      <div className="cam" role="group" aria-label={labels.title}>
        <div className="cam__top" aria-hidden="true">
          <span className="cam__dial" />
          <span className="cam__shutter" />
        </div>

        <div className="cam__bezel">
          <div className="cam__screen" tabIndex={0} onKeyDown={onKey} aria-live="polite">
            <div className="cam__hud">
              <span><i className="cam__rec" />{mode === "play" ? "▶" : mode === "menu" ? "▦" : "▤"} <span className="cam__month">{monthName}</span></span>
              <span className="cam__hudr">
                {mode === "play" && inMonth.length > 0 && <span>{Math.min(idx, inMonth.length - 1) + 1}/{inMonth.length}</span>}
                <span className="cam__battery"><span /></span>
              </span>
            </div>

            {mode === "play" && (
              cur ? (
                <div className={`cam__shot${cur.statusDone ? " is-done" : ""}`} style={{ "--pc": cur.color }}>
                  <div className="cam__platform">{cur.platform}{cur.format ? ` · ${cur.format}` : ""}</div>
                  <div className="cam__title">{cur.title}</div>
                  {cur.song && <div className="cam__song">♪ {cur.song}</div>}
                  {cur.description && <div className="cam__desc">{cur.description}</div>}
                  <div className="cam__bottom">
                    <form action={setStatus} className="cam__statusform">
                      <input type="hidden" name="id" value={cur.id} />
                      {artistId && <input type="hidden" name="artist_id" value={artistId} />}
                      <select
                        key={cur.id}
                        name="status"
                        defaultValue={cur.status}
                        className="cam__status"
                        aria-label={labels.status}
                        onChange={(e) => e.target.form.requestSubmit()}
                      >
                        {cur.statuses.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </form>
                    <div className="cam__stamp" title={weekday(cur.date)}>{stamp(cur.date)}</div>
                  </div>
                </div>
              ) : (
                <div className="cam__empty">
                  <strong>{labels.noImages}</strong>
                  <span>{labels.empty}</span>
                </div>
              )
            )}

            {mode === "menu" && (
              inMonth.length ? (
                <div className="cam__index">
                  {inMonth.map((it) => (
                    <button type="button" key={it.id} className={`cam__thumb${it.statusDone ? " is-done" : ""}`} style={{ "--pc": it.color }} onClick={() => playItem(it)} aria-label={`${it.date} ${it.title}`}>
                      <strong>{Number(it.date.slice(8, 10))}</strong>
                      <span>{it.format || it.platform}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="cam__empty"><strong>{labels.noImages}</strong><span>{labels.empty}</span></div>
              )
            )}

            {mode === "disp" && (
              <div className="cam__grid">
                {weekdays.map((w, i) => <span key={`w${i}`} className="cam__wd">{w}</span>)}
                {cells.map((d, i) => {
                  if (!d) return <span key={`e${i}`} />;
                  const key = `${month}-${pad(d)}`;
                  const its = byDay[key] || [];
                  return (
                    <button
                      type="button"
                      key={key}
                      className={`cam__day${key === today ? " is-today" : ""}${its.length ? " has" : ""}`}
                      onClick={() => its.length && playItem(its[0])}
                      disabled={!its.length}
                      aria-label={`${d}${its.length ? ` · ${its.length}` : ""}`}
                    >
                      {d}
                      {its.length > 0 && <i>{its.slice(0, 3).map((it) => <b key={it.id} style={{ background: it.color }} />)}</i>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="cam__controls">
          <div className="cam__zoom">
            <button type="button" onClick={() => goMonth(-1)} aria-label={labels.prevMonth} title={labels.prevMonth}>W</button>
            <button type="button" onClick={() => goMonth(1)} aria-label={labels.nextMonth} title={labels.nextMonth}>T</button>
          </div>
          <div className="cam__speaker" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <span key={i} />)}</div>
          <div className="cam__pad">
            <button type="button" className="cam__padbtn cam__padbtn--up" onClick={() => toggle("disp")} aria-label={labels.disp} title={labels.disp}>▦</button>
            <button type="button" className="cam__padbtn cam__padbtn--left" onClick={() => step(-1)} aria-label={labels.prev} title={labels.prev}>◀</button>
            <button type="button" className="cam__padbtn cam__padbtn--right" onClick={() => step(1)} aria-label={labels.next} title={labels.next}>▶</button>
            <button type="button" className="cam__padbtn cam__padbtn--down" onClick={() => toggle("menu")} aria-label={labels.menu} title={labels.menu}>☰</button>
            <button type="button" className="cam__ok" onClick={() => setMode("play")} aria-label={labels.ok}>OK</button>
          </div>
          <div className="cam__keys">
            <button type="button" className={mode === "menu" ? "is-on" : ""} onClick={() => toggle("menu")} aria-pressed={mode === "menu"}>MENU</button>
            <button type="button" className={mode === "disp" ? "is-on" : ""} onClick={() => toggle("disp")} aria-pressed={mode === "disp"}>DISP.</button>
          </div>
          {cur?.canDelete && mode === "play" ? (
            <form
              action={remove}
              onSubmit={(e) => { if (!window.confirm(`${labels.remove}: ${cur.title}?`)) e.preventDefault(); }}
            >
              <input type="hidden" name="id" value={cur.id} />
              {artistId && <input type="hidden" name="artist_id" value={artistId} />}
              <button type="submit" className="cam__trash" aria-label={`${labels.remove}: ${cur.title}`} title={labels.remove}>🗑</button>
            </form>
          ) : (
            <span className="cam__trash cam__trash--off" aria-hidden="true">🗑</span>
          )}
        </div>
      </div>
      <div className="cam__below">
        <button type="button" className="btn btn--sm road-btn" onClick={() => dlg.current?.showModal()} disabled={!cur}>
          <span aria-hidden="true">✎</span> {labels.script}{cur?.script ? " ✓" : ""}
        </button>
        <p className="cam__hint">{labels.hint}</p>
      </div>

      <dialog ref={dlg} className="road-modal" onClick={(e) => { if (e.target === dlg.current) dlg.current.close(); }}>
        <button type="button" className="road-modal__close" onClick={() => dlg.current?.close()} aria-label={labels.close}>×</button>
        {cur ? (
          <form action={saveScript} className="script-page" key={cur.id}>
            <input type="hidden" name="id" value={cur.id} />
            {artistId && <input type="hidden" name="artist_id" value={artistId} />}
            <div className="script-page__meta" style={{ "--pc": cur.color }}>
              <span>{cur.platform}{cur.format ? ` · ${cur.format}` : ""}</span>
              <span className="cam__stamp">{stamp(cur.date)}</span>
            </div>
            <div className="kicker">{labels.scriptTitle}</div>
            <h2 className="h2 script-page__title">{cur.title}</h2>
            {cur.song && <p className="script-page__song">♪ {cur.song}</p>}
            <p className="script-page__lead">{labels.scriptLead}</p>
            <label className="field"><span>{labels.description}</span>
              <textarea name="description" className="input" rows={3} maxLength={2000} defaultValue={cur.description} placeholder={labels.descriptionPh} />
            </label>
            <label className="field"><span>{labels.scriptLabel}</span>
              <textarea name="script" className="input script-page__script" rows={14} maxLength={20000} defaultValue={cur.script} placeholder={labels.scriptPh} />
            </label>
            <button type="submit" className="btn btn--dark">{labels.save}</button>
          </form>
        ) : (
          <div className="script-page"><p>{labels.noScript}</p></div>
        )}
      </dialog>
    </div>
  );
}
