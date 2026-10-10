// Progress numbers, bar and step-by-step table. Used by the dashboard and the admin view.
import { PILLARS, STEPS, STATUS, summarize } from "../lib/steps";
import { T, pick } from "../lib/i18n";

export function ProgressSummary({ rows, lang, aside, id }) {
  const t = T[lang];
  const s = summarize(rows);
  const pct = (n) => `${((n / s.total) * 100).toFixed(1)}%`;
  const label = `${s.had} ${STATUS.had[lang]}, ${s.done} ${STATUS.done[lang]}, ${s.inProgress} ${STATUS.in_progress[lang]}, ${s.pending} ${STATUS.pending[lang]}`;
  return (
    <section className="panel stack" id={id} style={{ borderRadius: 24, padding: 30, gap: 22 }}>
      <div className="steps__head" style={{ marginBottom: 0 }}>
        <div>
          <h2 className="h2" style={{ fontSize: 28 }}>{t.progressTitle}</h2>
          <p style={{ margin: 0, fontSize: 15 }}>{t.progressLead}<br />{t.progressLead2}</p>
        </div>
        {aside}
      </div>
      <div className="stats">
        <div className="stat" style={{ background: "#F1EFEA" }}>
          <div className="stat__k">{t.atStart}</div>
          <div className="stat__v">{s.startHad}<small> / {s.total}</small></div>
          <div style={{ fontSize: 14 }}>{t.atStartSub}</div>
        </div>
        <div className="stat" style={{ background: "#FCE4EF" }}>
          <div className="stat__k">{t.today}</div>
          <div className="stat__v">{s.now}<small> / {s.total}</small></div>
          <div style={{ fontSize: 14 }}>{t.todaySub}</div>
        </div>
        <div className="stat" style={{ background: "#F2C94C" }}>
          <div className="stat__k">{t.withUs}</div>
          <div className="stat__v">+{s.done}</div>
          <div style={{ fontSize: 14 }}>{t.withUsSub}</div>
        </div>
      </div>
      <div>
        <div className="bar" role="img" aria-label={label}>
          {s.had > 0 && <span style={{ width: pct(s.had), background: STATUS.had.bg }} />}
          {s.done > 0 && <span style={{ width: pct(s.done), background: STATUS.done.bg }} />}
          {s.inProgress > 0 && <span style={{ width: pct(s.inProgress), background: STATUS.in_progress.bg }} />}
          {s.pending > 0 && <span style={{ width: pct(s.pending), background: STATUS.pending.bg }} />}
        </div>
        <div className="legend">
          {["had", "done", "in_progress", "pending"].map((k) => (
            <span key={k}>
              <span className="sw" style={{ background: STATUS[k].bg }} />
              {STATUS[k][lang]} ({k === "had" ? s.had : k === "done" ? s.done : k === "in_progress" ? s.inProgress : s.pending})
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// `lockedPkgs`: packages the artist doesn't have; their steps show blurred with an unlock tag.
export function StepsTable({ rows, lang, renderStatus, pillars, lockedPkgs = [] }) {
  const t = T[lang];
  const byKey = Object.fromEntries(rows.map((r) => [r.step_key, r]));
  return (
    <div className="tablewrap">
      <table className="table table--steps">
        <thead>
          <tr>
            <th>{t.colStep}</th>
            <th>{t.colStart}</th>
            <th>{t.colToday}</th>
            <th>{t.colPkg}</th>
          </tr>
        </thead>
        <tbody>
          {PILLARS.filter((p) => !pillars || pillars.includes(p.key)).map((p) => (
            <PillarRows key={p.key} pillar={p} byKey={byKey} lang={lang} t={t} renderStatus={renderStatus} lockedPkgs={lockedPkgs} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PillarRows({ pillar, byKey, lang, t, renderStatus, lockedPkgs }) {
  const steps = STEPS.filter((s) => s.pillar === pillar.key && byKey[s.key]);
  if (!steps.length) return null;
  return (
    <>
      <tr className={`group group--${pillar.key}`}><td colSpan={4}><span className="group__dot" aria-hidden="true" />{pick(lang, pillar)}</td></tr>
      {steps.map((s) => {
        const r = byKey[s.key];
        const locked = lockedPkgs.includes(s.pkg);
        if (locked) {
          return (
            <tr key={s.key} className={`steps__row steps__row--${pillar.key} steps__row--locked`}>
              <td className="steps__name">
                <span className="steps__blur" aria-hidden="true"><StepName text={pick(lang, s)} /></span>
                <a href="/#contact" className="steps__unlock">✦ {t.lockedCta.replace("{pkg}", s.pkg)}</a>
              </td>
              <td className="muted" data-label={t.colStart}><span className="steps__blur" aria-hidden="true">{t.no}</span></td>
              <td data-label={t.colToday}><span className="steps__blur chip" aria-hidden="true" style={{ background: STATUS.pending.bg }}>{STATUS.pending[lang]}</span></td>
              <td className="muted" data-label={t.colPkg}>{s.pkg}</td>
            </tr>
          );
        }
        return (
          <tr key={s.key} className={`steps__row steps__row--${pillar.key}`}>
            <td className="steps__name">
              <StepName text={pick(lang, s)} />
              {s.info && (
                <span className="tip" tabIndex={0} role="note" aria-label={s.info[lang] || s.info.en}>
                  <span className="tip__i" aria-hidden="true">i</span>
                  <span className="tip__box" aria-hidden="true">{s.info[lang] || s.info.en}</span>
                </span>
              )}
            </td>
            <td className="muted" data-label={t.colStart}>{r.start_status === "had" ? t.yes : t.no}</td>
            <td data-label={t.colToday}>{renderStatus ? renderStatus(r) : <span className="chip" style={{ background: STATUS[r.status].bg }}>{STATUS[r.status][lang]}</span>}</td>
            <td className="muted" data-label={t.colPkg}>{r.start_status === "had" && !["rights", "release", "membership"].includes(s.pillar) ? "—" : s.pkg}</td>
          </tr>
        );
      })}
    </>
  );
}

// "PRO - Release Registration" → the part after " - " in italics.
function StepName({ text }) {
  const i = text.indexOf(" - ");
  if (i < 0) return text;
  return <>{text.slice(0, i)} - <em>{text.slice(i + 3)}</em></>;
}
