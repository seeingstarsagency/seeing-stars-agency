// "Road to release day": a colorful starry timeline of suggested deadlines for the current song.
import { Fragment } from "react";
import { Star } from "./components";

const STAR = { done: "#F2C94C", in_progress: "#9CCBE0", soon: "#F4A6C9", late: "#F28C8C", upcoming: "#FFFFFF" };

export default function Roadmap({ items, lang, labels }) {
  const locale = lang === "es" ? "es-US" : "en-US";
  const fmt = (d, o) => new Date(`${d}T12:00:00Z`).toLocaleDateString(locale, { ...o, timeZone: "UTC" });
  const pick = (o) => (lang === "es" ? o.es : o.en);
  const when = (m) => {
    if (m.release) return m.left === 0 ? labels.today : m.left > 0 ? labels.daysLeft(m.left) : labels.released;
    if (m.status === "done") return labels.doneTag;
    if (m.left < 0) return labels.lateBy(-m.left);
    if (m.left === 0) return labels.dueToday;
    return labels.daysLeft(m.left);
  };
  const rel = (d) => (d === 0 ? labels.releaseDay : d < 0 ? labels.weeksBefore(-d) : labels.weekAfter(d));
  // Where "You are here" goes: before the first milestone that is still ahead.
  const hereAt = items.findIndex((m) => m.left >= 0);

  return (
    <ol className="road">
      {items.map((m, i) => (
        <Fragment key={m.key}>
        {i === hereAt && <li className="road__here"><span>{labels.here}</span></li>}
        <li className={`road__item road__item--${m.status}${m.release ? " road__item--release" : ""}`}>
          <div className="road__date">
            <strong>{fmt(m.date, { month: "short", day: "numeric" })}</strong>
            <em>{fmt(m.date, { weekday: "long" })}</em>
            <span>{rel(m.days)}</span>
          </div>
          <div className="road__node" aria-hidden="true">
            <Star size={m.release ? 46 : 30} fill={m.release ? "#F2C94C" : STAR[m.status]} stroke="#1E1B2E" strokeWidth={m.release ? 4 : 5} className={m.status === "soon" || m.release ? "twinkle" : ""} />
          </div>
          <div className="road__card">
            <div className="road__title">{pick(m)}</div>
            <div className="road__tip">{pick(m.tip)}</div>
            <span className={`road__when road__when--${m.release ? "release" : m.status}`}>{when(m)}</span>
          </div>
        </li>
        </Fragment>
      ))}
    </ol>
  );
}
