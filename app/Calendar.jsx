"use client";

import { useState } from "react";

// A month grid with colored dots, plus the list of that month's dates underneath.
// Dates are plain "YYYY-MM-DD" strings so nothing shifts with time zones.
const pad = (n) => String(n).padStart(2, "0");
const ym = (y, m) => `${y}-${pad(m + 1)}`;

export default function Calendar({ items, lang, labels, today, initialMonth, legend, artistId, setStatus, remove, children }) {
  const start = initialMonth || today.slice(0, 7);
  const [month, setMonth] = useState(start);
  const [day, setDay] = useState(null);
  const y = Number(month.slice(0, 4));
  const m = Number(month.slice(5, 7)) - 1;
  const locale = lang === "es" ? "es-US" : "en-US";

  const go = (delta) => {
    const d = new Date(Date.UTC(y, m + delta, 1));
    setMonth(ym(d.getUTCFullYear(), d.getUTCMonth()));
    setDay(null);
  };

  const monthName = new Date(Date.UTC(y, m, 1)).toLocaleDateString(locale, { month: "long", year: "numeric", timeZone: "UTC" });
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(Date.UTC(2023, 0, 1 + i)).toLocaleDateString(locale, { weekday: "narrow", timeZone: "UTC" })
  );
  const firstDow = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const daysIn = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const inMonth = items.filter((it) => it.date.startsWith(month));
  const byDay = {};
  inMonth.forEach((it) => { (byDay[it.date] ||= []).push(it); });
  const shown = day ? byDay[day] || [] : inMonth;
  const fmtDay = (d) => {
    const dt = new Date(`${d}T12:00:00Z`);
    return {
      num: dt.getUTCDate(),
      wd: dt.toLocaleDateString(locale, { weekday: "short", timeZone: "UTC" }),
    };
  };

  return (
    <div className="cal">
      <div className="cal__top">
        <div className="cal__nav">
          <button type="button" className="cal__arrow" onClick={() => go(-1)} aria-label={labels.prev}>‹</button>
          <div className="cal__month" aria-live="polite">{monthName}</div>
          <button type="button" className="cal__arrow" onClick={() => go(1)} aria-label={labels.next}>›</button>
        </div>
        {month !== today.slice(0, 7) && (
          <button type="button" className="cal__today" onClick={() => { setMonth(today.slice(0, 7)); setDay(null); }}>{labels.today}</button>
        )}
      </div>

      <div className="cal__body">
        <div className="cal__grid" role="grid" aria-label={monthName}>
          {weekdays.map((w, i) => <div key={`w${i}`} className="cal__wd" aria-hidden="true">{w}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={`e${i}`} className="cal__cell cal__cell--empty" />;
            const key = `${month}-${pad(d)}`;
            const its = byDay[key] || [];
            const cls = ["cal__cell", key === today && "is-today", day === key && "is-picked", its.length && "has-items"].filter(Boolean).join(" ");
            return (
              <button
                type="button"
                key={key}
                className={cls}
                onClick={() => setDay(day === key ? null : key)}
                aria-pressed={day === key}
                aria-label={`${d}${its.length ? ` · ${its.length} ${labels.items}` : ""}`}
              >
                <span className="cal__num">{d}</span>
                {its.length > 0 && (
                  <span className="cal__dots" aria-hidden="true">
                    {its.slice(0, 3).map((it) => <span key={it.id} style={{ background: it.color }} />)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="cal__side">
          {legend?.length > 0 && (
            <div className="cal__legend">
              {legend.map((l) => <span key={l.label}><span className="cal__sw" style={{ background: l.color }} />{l.label}</span>)}
            </div>
          )}
          <div className="cal__listhead">
            <strong>{day ? `${fmtDay(day).wd} ${fmtDay(day).num}` : labels.thisMonth}</strong>
            {day && <button type="button" className="cal__clear" onClick={() => setDay(null)}>{labels.showAll}</button>}
          </div>
          {shown.length === 0 ? (
            <p className="cal__empty">{labels.empty}</p>
          ) : (
            <ul className="cal__list">
              {shown.map((it) => {
                const f = fmtDay(it.date);
                return (
                  <li key={it.id} className={`cal__item${it.statusDone ? " is-done" : ""}`}>
                    <div className="cal__date" style={{ borderColor: it.color }}>
                      <span>{f.wd}</span><strong>{f.num}</strong>
                    </div>
                    <div className="cal__info">
                      <div className="cal__title">{it.title}</div>
                      {it.sub && <div className="cal__sub">{it.sub}</div>}
                      {it.auto ? (
                        <span className="cal__tag" style={{ background: it.color }}>{it.tag}</span>
                      ) : (
                        <div className="cal__actions">
                          <form action={setStatus}>
                            <input type="hidden" name="id" value={it.id} />
                            {artistId && <input type="hidden" name="artist_id" value={artistId} />}
                            <select
                              name="status"
                              defaultValue={it.status}
                              className="cal__status"
                              aria-label={labels.status}
                              onChange={(e) => e.target.form.requestSubmit()}
                            >
                              {it.statuses.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                            </select>
                          </form>
                          {it.canDelete && (
                            <form action={remove}>
                              <input type="hidden" name="id" value={it.id} />
                              {artistId && <input type="hidden" name="artist_id" value={artistId} />}
                              <button type="submit" className="cal__del" aria-label={`${labels.remove}: ${it.title}`}>{labels.remove}</button>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
