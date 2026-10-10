import { Star } from "../../components";
import { QT, money, areaLabel } from "../../../lib/quote-send";

// The quote as sent, same look as the admin quote box.
export default function QuoteCard({ snap, artistName }) {
  const L = snap.lang === "es" ? "es" : "en";
  const t = QT[L];
  return (
    <section className="panel stack" aria-label="Artist quote" style={{ background: "#FFF6D6", gap: 10, minWidth: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <strong className="disp" style={{ fontSize: 22, lineHeight: 1.15 }}>Artist Quote - {artistName}</strong>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600 }}>
          <Star size={22} fill="#9CCBE0" stroke="#1E1B2E" strokeWidth={4} />
          Launchpad
        </span>
      </div>
      {snap.groups.map((g, j) => (
        <div key={j} style={{ display: "flex", flexDirection: "column", gap: 3, paddingBottom: 8, borderBottom: "1px solid rgba(30,27,46,.15)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, fontWeight: 600, fontSize: 15, lineHeight: 1.35, fontVariantNumeric: "tabular-nums" }}>
            <span style={{ flex: "1 1 auto", minWidth: 0, overflowWrap: "anywhere" }}>{g.title}</span>
            <span style={{ flex: "0 0 auto", whiteSpace: "nowrap" }}>{money(g.amount)}</span>
          </div>
          {g.areas.length ? g.areas.map((k) => (
            <div key={k} style={{ fontSize: 14, lineHeight: 1.4, paddingLeft: 18, position: "relative" }}><span style={{ position: "absolute", left: 0 }}>✓</span>{areaLabel(k, L)}</div>
          )) : <div className="muted" style={{ fontSize: 14 }}>{t.nothing}</div>}
          {g.discountPct > 0 && <div style={{ fontSize: 13, color: "#C2457E" }}>{t.disc(g.discountPct)}</div>}
        </div>
      ))}
      {snap.extras.map((x) => (
        <div key={x.key} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
          <span>{x.key === "rush" ? t.rush : t.min}</span><span>{money(x.amount)}</span>
        </div>
      ))}
      <div style={{ borderTop: "2px dashed #1E1B2E", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span>{t.total}</span>
        <span className="disp" style={{ fontSize: 40, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{money(snap.total)}</span>
      </div>
      <div style={{ fontSize: 14, display: "flex", gap: 8 }}><span aria-hidden="true">✦</span><span>{t.dash}</span></div>
      <div className="muted" style={{ fontSize: 13 }}>{t.fees}</div>
    </section>
  );
}
