"use client";

import { useMemo, useRef, useState } from "react";
import { ASTRO_ITEMS, ASTRO_ADDONS, ASTRO_ALL, ASTRO_AREAS, computeAstroQuote, astroQuoteText } from "../../../../lib/astro-pricing";
import { saveAstroQuote, astroQuoteToPayments } from "../../astro-actions";
import { showToast, toastAfterReload } from "../../Toaster";
import { Star } from "../../../components";
import { PACKAGES as PKG_INFO } from "../../../content";

const ASTRO_COLOR = PKG_INFO.find((p) => p.name === "Astro")?.color || "#F2C94C";

const money = (v) => {
  const n = Math.round(v * 100) / 100;
  const cents = Math.abs(n % 1) > 0.001;
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });
};
const cell = { padding: "8px 6px", borderBottom: "1px solid var(--line)", verticalAlign: "middle" };
const num = { ...cell, textAlign: "center", fontVariantNumeric: "tabular-nums" };
const priceInput = { width: 64, minHeight: 34, padding: "4px 6px", border: "1.5px solid #1E1B2E", borderRadius: 8, font: "14px var(--body)", textAlign: "right" };
const box = { width: 20, height: 20, accentColor: "#1E1B2E", cursor: "pointer" };

export default function AstroPriceCalculator({ artistId, artistName = "", initial, savedAt, saved, lang = "en" }) {
  const [q, setQ] = useState(initial);
  const [msg, setMsgRaw] = useState(null);
  const setMsg = (m) => { setMsgRaw(m); if (m) showToast(m.text, m.bad ? "bad" : "ok"); };
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(!saved);
  const c = useMemo(() => computeAstroQuote(q), [q]);
  const L = lang === "es" ? "es" : "en";

  const update = (fn) => { setQ((prev) => { const next = structuredClone(prev); fn(next); return next; }); setDirty(true); setMsg(null); };
  const row = (i) => (
    <tr key={i.key}>
      <td style={cell}>{i.name}{i.note && <span className="muted" style={{ display: "block", fontSize: 13 }}>{i.note}</span>}</td>
      <td style={num}>$<input type="number" min="0" aria-label={`Price: ${i.name}`} value={q.prices[i.key]} style={priceInput}
        onChange={(e) => { const v = e.target.value; update((n) => { n.prices[i.key] = v === "" ? "" : Math.max(0, Number(v)); }); }} /></td>
      <td style={num}><input type="checkbox" style={box} checked={!!q.on[i.key]} aria-label={`Include ${i.name}`} onChange={(e) => update((n) => { n.on[i.key] = e.target.checked; })} /></td>
    </tr>
  );

  async function save() {
    setBusy(true);
    const res = await saveAstroQuote(artistId, q, c.total);
    setBusy(false);
    if (res.error) return setMsg({ bad: true, text: "Could not save: " + res.error });
    setDirty(false);
    setMsg({ text: "Astro quote saved ✓" });
  }

  async function toPayments(halves) {
    setBusy(true);
    const res = await astroQuoteToPayments(artistId, c.total, halves, lang);
    setBusy(false);
    if (res.error) return setMsg({ bad: true, text: "Could not add the payments: " + res.error });
    toastAfterReload(halves ? "2 Astro installments added to Payments ✓" : "Astro payment added ✓");
    window.location.href = `/admin/artists/${artistId}#payments`;
  }

  const [copied, setCopied] = useState(false);
  const [showText, setShowText] = useState(false);
  async function copyText() {
    const text = astroQuoteText(q, c, lang);
    try { await navigator.clipboard.writeText(text); setCopied(true); showToast("Copied ✓ Paste it into your email"); setTimeout(() => setCopied(false), 2500); }
    catch { setMsg({ bad: true, text: "Could not copy. Select the text below instead." }); setShowText(true); }
  }

  const boxRef = useRef(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  async function downloadPdf() {
    if (!boxRef.current) return;
    setPdfBusy(true);
    try {
      const [{ toPng }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
      if (document.fonts?.ready) await document.fonts.ready;
      const png = await toPng(boxRef.current, { pixelRatio: 3, cacheBust: true, style: { position: "static", top: "auto" } });
      const img = new Image();
      img.src = png;
      await img.decode();
      const pdf = new jsPDF({ unit: "pt", format: "letter" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 54;
      let w = Math.min(420, pageW - margin * 2);
      let h = (img.height / img.width) * w;
      if (h > pageH - margin * 2) { h = pageH - margin * 2; w = (img.width / img.height) * h; }
      pdf.addImage(png, "PNG", (pageW - w) / 2, margin, w, h);
      const safe = String(artistName || "artist").replace(/[^\p{L}\p{N}\- ]+/gu, "").trim() || "artist";
      pdf.save(`Astro Quote - ${safe}.pdf`);
      showToast("PDF downloaded ✓");
    } catch {
      setMsg({ bad: true, text: "Could not create the PDF. Try again, or take a screenshot of the box." });
    }
    setPdfBusy(false);
  }

  const p = (k) => Math.max(0, Number(q.prices[k]) || 0);
  const groups = ASTRO_AREAS.map((a) => {
    const on = ASTRO_ALL.filter((i) => i.area === a.key && q.on[i.key]);
    return { ...a, amount: on.reduce((s, i) => s + p(i.key), 0), count: on.length };
  }).filter((g) => g.count);
  const TX = {
    en: { disc: "Discount", rush: "Rush", dash: "Everything is delivered in your artist dashboard, in English and Spanish.", none: "Choose at least one deliverable." },
    es: { disc: "Descuento", rush: "Urgencia", dash: "Todo se entrega en tu panel de artista, en español e inglés.", none: "Elige al menos un entregable." },
  }[L];

  return (
    <div className="row" style={{ alignItems: "flex-start" }}>
      <div className="stack" style={{ gap: 22, flexBasis: 520 }}>
        <div className="tablewrap">
          <table className="table" style={{ minWidth: 460 }}>
            <thead><tr><th>Astro deliverables</th><th style={{ textAlign: "center" }}>Price</th><th style={{ textAlign: "center" }}>Include</th></tr></thead>
            <tbody>{ASTRO_ITEMS.map(row)}</tbody>
          </table>
        </div>
        <div className="tablewrap">
          <table className="table" style={{ minWidth: 460 }}>
            <thead><tr><th>Add-ons</th><th style={{ textAlign: "center" }}>Price</th><th style={{ textAlign: "center" }}>Include</th></tr></thead>
            <tbody>{ASTRO_ADDONS.map(row)}</tbody>
          </table>
        </div>
        <div className="stack" style={{ gap: 10, fontSize: 15 }}>
          <strong>Rules</strong>
          <div className="inline">
            Discount <input type="number" min="0" max="100" aria-label="Discount %" value={q.rules.discount} style={{ ...priceInput, width: 52 }} onChange={(e) => { const v = e.target.value; update((n) => { n.rules.discount = v; }); }} />%
            · Round to $<input type="number" min="1" aria-label="Round to" value={q.rules.round} style={{ ...priceInput, width: 52 }} onChange={(e) => { const v = e.target.value; update((n) => { n.rules.round = v; }); }} />
          </div>
          <label className="opt" style={{ alignSelf: "flex-start", borderRadius: 12 }}>
            <input type="checkbox" checked={!!q.rules.rush} onChange={(e) => update((n) => { n.rules.rush = e.target.checked; })} />
            Rush: needed in less than 3 weeks (+
            <input type="number" min="0" aria-label="Rush fee %" value={q.rules.rushPct} style={{ ...priceInput, width: 52 }} onChange={(e) => { const v = e.target.value; update((n) => { n.rules.rushPct = v; }); }} />%)
          </label>
          <div className="field">
            <label htmlFor="astro-quote-note">Notes for this artist (internal)</label>
            <textarea id="astro-quote-note" className="input" style={{ minHeight: 70 }} value={q.note} placeholder="e.g. already has photos, only needs the logo refreshed" onChange={(e) => { const v = e.target.value; update((n) => { n.note = v; }); }} />
          </div>
        </div>
      </div>

      <div className="stack" style={{ gap: 14, flexBasis: 340, position: "sticky", top: 16 }}>
        <aside ref={boxRef} className="panel stack" aria-label="Astro quote" style={{ background: "#FFF6D6", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <strong className="disp" style={{ fontSize: 22, lineHeight: 1.15 }}>Artist Quote - {artistName}</strong>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600 }}>
              <Star size={22} fill={ASTRO_COLOR} stroke="#1E1B2E" strokeWidth={4} />
              Astro · Artist branding
            </span>
          </div>
          {groups.length ? groups.map((g) => (
            <div key={g.key} style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: 15, lineHeight: 1.35, paddingBottom: 8, borderBottom: "1px solid rgba(30,27,46,.15)", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ flex: "1 1 auto", minWidth: 0 }}>✓ {g[L]}</span>
              <span style={{ flex: "0 0 auto", fontWeight: 600 }}>{money(g.amount)}</span>
            </div>
          )) : <div className="muted" style={{ fontSize: 14 }}>{TX.none}</div>}
          {c.discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}><span>{TX.disc}</span><span>−{money(c.discount)}</span></div>}
          {c.rush > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}><span>{TX.rush}</span><span>{money(c.rush)}</span></div>}
          <div style={{ borderTop: "2px dashed #1E1B2E", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span>Total</span>
            <span className="disp" style={{ fontSize: 40, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{money(c.total)}</span>
          </div>
          <div style={{ fontSize: 14, display: "flex", gap: 8 }}><span aria-hidden="true">✦</span><span>{TX.dash}</span></div>
        </aside>

        <div className="stack" style={{ gap: 8, padding: "4px 2px" }}>
          <button type="button" className="small-btn small-btn--dark" onClick={save} disabled={busy || !dirty}>{dirty ? "Save Astro quote" : "Saved"}</button>
          <button type="button" className="small-btn small-btn--dark" onClick={downloadPdf} disabled={pdfBusy}>{pdfBusy ? "Creating PDF…" : "Download PDF"}</button>
          <button type="button" className="small-btn" onClick={copyText}>{copied ? "Copied ✓" : `Copy for email (${L === "es" ? "Spanish" : "English"})`}</button>
          {showText && <textarea readOnly className="input" aria-label="Quote text" style={{ minHeight: 160, fontSize: 13 }} value={astroQuoteText(q, c, lang)} onFocus={(e) => e.target.select()} />}
          <div className="inline" style={{ gap: 8 }}>
            <button type="button" className="small-btn" onClick={() => toPayments(true)} disabled={busy || dirty || c.total <= 0}>Pay in 2 installments</button>
            <button type="button" className="small-btn" onClick={() => toPayments(false)} disabled={busy || dirty || c.total <= 0}>Pay in full</button>
          </div>
          {dirty && <div className="muted" style={{ fontSize: 13 }}>Save the quote before adding it to payments.</div>}
          {savedAt && !dirty && <div className="muted" style={{ fontSize: 13 }}>Last saved {new Date(savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>}
          <div className="muted" style={{ fontSize: 13 }}>Sending the Astro quote and its agreement by email comes next.</div>
          {msg && <div className={msg.bad ? "alert" : "alert alert--ok"} role="status" style={{ fontSize: 14 }}>{msg.text}</div>}
        </div>
      </div>
    </div>
  );
}
