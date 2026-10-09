// Draws one brandbook page. Sizes are in page units (1600 × 900) and scale with the
// page's width through container query units, so the same page works at any size.
import { W, H } from "../../lib/brandbook";

const pct = (v, of) => `${(v / of) * 100}%`;
export const cq = (v) => `calc(${v} * 100cqw / ${W})`;

export function boxStyle(e) {
  return {
    left: pct(e.x, W),
    top: pct(e.y, H),
    width: pct(e.w, W),
    height: pct(e.h, H),
    transform: e.rotate ? `rotate(${e.rotate}deg)` : undefined,
    opacity: e.opacity ?? 1,
  };
}

export function textStyle(e) {
  return {
    fontFamily: `"${e.font}", Georgia, serif`,
    fontSize: cq(e.size),
    fontWeight: e.weight,
    fontStyle: e.italic ? "italic" : "normal",
    textTransform: e.upper ? "uppercase" : "none",
    color: e.color,
    textAlign: e.align,
    lineHeight: e.lh,
    letterSpacing: `${e.ls || 0}em`,
  };
}

export function ElementView({ e, urls, editing = false, placeholderLabel = "Image" }) {
  if (e.type === "text") {
    return <div className="bk__text" style={textStyle(e)}>{e.text}</div>;
  }
  if (e.type === "shape") {
    if (e.shape === "line") {
      return <div className="bk__fill" style={{ display: "flex", alignItems: "center" }}><div style={{ width: "100%", height: cq(e.sw || 4), background: e.fill, borderRadius: 999 }} /></div>;
    }
    return (
      <div
        className="bk__fill"
        style={{
          background: e.fill || "transparent",
          border: e.stroke && e.sw ? `${cq(e.sw)} solid ${e.stroke}` : undefined,
          borderRadius: e.shape === "ellipse" ? "50%" : cq(e.radius || 0),
        }}
      />
    );
  }
  if (e.type === "image") {
    const src = e.path && urls?.[e.path];
    if (!src) {
      return (
        <div className="bk__fill bk__ph" style={{ borderRadius: cq(e.radius || 0) }}>
          <span style={{ fontSize: cq(26) }}>{editing ? `＋ ${placeholderLabel}` : ""}</span>
        </div>
      );
    }
    return <img src={src} alt="" className="bk__fill" draggable={false} style={{ objectFit: e.fit || "cover", borderRadius: cq(e.radius || 0) }} />;
  }
  if (e.type === "swatch") {
    return (
      <div className="bk__fill bk__swatch" style={{ color: e.color }}>
        <div style={{ flex: 1, background: e.fill, borderRadius: cq(18), boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)" }} />
        <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700, fontSize: cq(30), marginTop: cq(16), lineHeight: 1.1 }}>{e.name}</div>
        <div style={{ fontFamily: '"Space Grotesk", monospace', fontSize: cq(22), marginTop: cq(6), opacity: 0.75, letterSpacing: ".06em" }}>{String(e.fill || "").toUpperCase()}</div>
      </div>
    );
  }
  return null;
}

// Read-only page.
export default function BookPage({ page, urls, className = "", label }) {
  const d = page?.data || {};
  return (
    <div className={`bk ${className}`} style={{ background: d.bg || "#fff" }} role="img" aria-label={label || page?.title || "Brandbook page"}>
      {(d.elements || []).map((e) => (
        <div key={e.id} className="bk__el" style={boxStyle(e)}>
          <ElementView e={e} urls={urls} />
        </div>
      ))}
    </div>
  );
}
