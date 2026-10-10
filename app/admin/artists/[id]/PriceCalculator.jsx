"use client";

import { useMemo, useRef, useState } from "react";
import { FIXED_ITEMS, ARTIST_ITEMS, SONG_ITEMS, computeQuote, quoteGroups, quoteText } from "../../../../lib/pricing";
import { saveQuote, quoteToPayments, sendQuote } from "../../actions";
import { showToast, toastAfterReload } from "../../Toaster";
import { Star } from "../../../components";
import { PACKAGES as PKG_INFO } from "../../../content";

const LAUNCHPAD_COLOR = PKG_INFO.find((p) => p.name === "Launchpad")?.color || "#9CCBE0";

const money = (v) => {
  const n = Math.round(v * 100) / 100;
  const cents = Math.abs(n % 1) > 0.001;
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });
};
const cell = { padding: "8px 6px", borderBottom: "1px solid var(--line)", verticalAlign: "middle" };
const num = { ...cell, textAlign: "center", fontVariantNumeric: "tabular-nums" };
const priceInput = { width: 64, minHeight: 34, padding: "4px 6px", border: "1.5px solid #1E1B2E", borderRadius: 8, font: "14px var(--body)", textAlign: "right" };
const box = { width: 20, height: 20, accentColor: "#1E1B2E", cursor: "pointer" };

function Name({ i }) {
  return (
    <td style={cell}>
      {i.name}
      {i.note && <span className="muted" style={{ display: "block", fontSize: 13 }}>{i.note}</span>}
    </td>
  );
}

export default function PriceCalculator({ artistId, artistName = "", hasEmail = false, sent = null, initial, savedAt, saved, lang = "en" }) {
  const [q, setQ] = useState(initial);
  const [msg, setMsgRaw] = useState(null);
  // Every result also shows as a message at the bottom of the screen.
  const setMsg = (m) => { setMsgRaw(m); if (m) showToast(m.text, m.bad ? "bad" : "ok"); };
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(!saved);
  const c = useMemo(() => computeQuote(q), [q]);

  const update = (fn) => { setQ((prev) => { const next = structuredClone(prev); fn(next); return next; }); setDirty(true); setMsg(null); };
  const price = (k, label) => (
    <td style={num}>
      $<input type="number" min="0" aria-label={`Price: ${label}`} value={q.prices[k]} style={priceInput}
        onChange={(e) => { const v = e.target.value; update((n) => { n.prices[k] = v === "" ? "" : Math.max(0, Number(v)); }); }} />
    </td>
  );

  async function save() {
    setBusy(true);
    const res = await saveQuote(artistId, q, c.total);
    setBusy(false);
    if (res.error) return setMsg({ bad: true, text: "Could not save: " + res.error });
    setDirty(false);
    setMsg({ text: "Quote saved ✓" });
  }

  async function toPayments(halves) {
    setBusy(true);
    const res = await quoteToPayments(artistId, c.total, halves, lang);
    setBusy(false);
    if (res.error) return setMsg({ bad: true, text: "Could not add the payments: " + res.error });
    toastAfterReload(halves ? "2 installments added to Payments ✓" : "Payment added ✓");
    window.location.hash = "payments";
    window.location.reload();
  }

  const groups = quoteGroups(q, c);
  const L = lang === "es" ? "es" : "en";
  const TX = {
    en: { nothing: "Nothing to do on this song.", disc: "Includes a {p}% discount", rush: "Rush (release in less than 21 days)", min: "Adjustment to the minimum price",
      dash: "Includes access to your own artist dashboard, where you can manage all your information in one place.",
      fees: "Third-party fees (Copyright Office, distributor) are paid directly by the artist." },
    es: { nothing: "Nada que hacer en esta canción.", disc: "Incluye un descuento del {p}%", rush: "Urgencia (lanzamiento en menos de 21 días)", min: "Ajuste al precio mínimo",
      dash: "Incluye acceso a tu propio panel de artista, donde puedes manejar toda tu información en un solo lugar.",
      fees: "Las tarifas de terceros (Copyright Office, distribuidora) las paga el artista directamente." },
  }[L];
  const extras = [
    ...(c.rush ? [[TX.rush, c.rush]] : []),
    ...(c.minApplied ? [[TX.min, c.min - c.sub]] : []),
  ];
  const [copied, setCopied] = useState(false);
  async function copyText() {
    const text = quoteText(q, c, lang);
    try { await navigator.clipboard.writeText(text); setCopied(true); showToast("Copied ✓ Paste it into your email"); setTimeout(() => setCopied(false), 2500); }
    catch { setMsg({ bad: true, text: "Could not copy. Select the text below instead." }); setShowText(true); }
  }
  const [showText, setShowText] = useState(false);

  const [sentInfo, setSentInfo] = useState(sent);
  const [sending, setSending] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const accepted = !!sentInfo?.acceptedAt;
  const fmtDay = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  async function send() {
    setSending(true);
    setMsg(null);
    const res = await sendQuote(artistId);
    setSending(false);
    setConfirmSend(false);
    if (res.error) return setMsg({ bad: true, text: res.error });
    setSentInfo({ sentAt: res.sentAt });
    setMsg({ text: `Quote sent to ${artistName} ✓ A copy went to your inbox.` });
  }

  // Download the quote box as a PDF that looks exactly like it does here.
  const boxRef = useRef(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  async function downloadPdf() {
    if (!boxRef.current) return;
    setPdfBusy(true);
    setMsg(null);
    try {
      const [{ toPng }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
      if (document.fonts?.ready) await document.fonts.ready;
      const node = boxRef.current;
      const png = await toPng(node, { pixelRatio: 3, cacheBust: true, style: { position: "static", top: "auto" } });
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
      pdf.save(`Artist Quote - ${safe}.pdf`);
      showToast("PDF downloaded ✓");
    } catch (e) {
      setMsg({ bad: true, text: "Could not create the PDF. Try again, or take a screenshot of the box." });
    }
    setPdfBusy(false);
  }

  return (
    <div className="stack" style={{ gap: 22 }}>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <div className="stack" style={{ gap: 22, flexBasis: 520 }}>
          <div className="tablewrap">
            <table className="table" style={{ minWidth: 420 }}>
              <thead><tr><th>Always included</th><th style={{ textAlign: "center" }}>Price</th></tr></thead>
              <tbody>{FIXED_ITEMS.map((i) => <tr key={i.key}><Name i={i} />{price(i.key, i.name)}</tr>)}</tbody>
            </table>
          </div>

          <div className="tablewrap">
            <table className="table" style={{ minWidth: 460 }}>
              <thead><tr><th>Once per artist</th><th style={{ textAlign: "center" }}>Price</th><th style={{ textAlign: "center" }}>Include</th></tr></thead>
              <tbody>
                {ARTIST_ITEMS.map((i) => (
                  <tr key={i.key}>
                    <Name i={i} />
                    {price(i.key, i.name)}
                    <td style={num}><input type="checkbox" style={box} checked={!!q.artist[i.key]} aria-label={`Include ${i.name}`} onChange={(e) => update((n) => { n.artist[i.key] = e.target.checked; })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="stack" style={{ gap: 10 }}>
            <div className="inline">
              <strong>Each song</strong>
              <button type="button" className="small-btn" onClick={() => update((n) => { n.songs.push({ title: `Song ${n.songs.length + 1}`, items: Object.fromEntries(SONG_ITEMS.map((i) => [i.key, true])) }); })} disabled={q.songs.length >= 12}>+ Add song</button>
              {q.songs.length > 1 && <button type="button" className="small-btn small-btn--danger" onClick={() => update((n) => { n.songs.pop(); })}>− Remove last</button>}
            </div>
            <div className="tablewrap">
              <table className="table" style={{ minWidth: 380 + q.songs.length * 110 }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ textAlign: "center" }}>Price</th>
                    {q.songs.map((s, j) => (
                      <th key={j} style={{ textAlign: "center" }}>
                        <input value={s.title} aria-label={`Song ${j + 1} name`} onChange={(e) => { const v = e.target.value; update((n) => { n.songs[j].title = v; }); }}
                          style={{ width: 100, minHeight: 32, padding: "4px 6px", border: "1.5px solid #1E1B2E", borderRadius: 8, font: "600 13px var(--body)", textAlign: "center" }} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SONG_ITEMS.map((i) => (
                    <tr key={i.key}>
                      <Name i={i} />
                      {price(i.key, i.name)}
                      {q.songs.map((s, j) => (
                        <td key={j} style={num}><input type="checkbox" style={box} checked={!!s.items[i.key]} aria-label={`${i.name}, ${s.title}`} onChange={(e) => update((n) => { n.songs[j].items[i.key] = e.target.checked; })} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="stack" style={{ gap: 10, fontSize: 15 }}>
            <strong>Rules</strong>
            <label className="opt" style={{ alignSelf: "flex-start", borderRadius: 12 }}>
              <input type="checkbox" checked={!!q.rules.rush} onChange={(e) => update((n) => { n.rules.rush = e.target.checked; })} />
              Rush: release in less than 21 days (+
              <input type="number" min="0" aria-label="Rush fee %" value={q.rules.rushPct} style={{ ...priceInput, width: 52 }} onChange={(e) => { const v = e.target.value; update((n) => { n.rules.rushPct = v; }); }} />%)
            </label>
            <div className="inline">
              Discount from the 2nd song <input type="number" min="0" max="100" aria-label="Discount from the 2nd song %" value={q.rules.d2} style={{ ...priceInput, width: 52 }} onChange={(e) => { const v = e.target.value; update((n) => { n.rules.d2 = v; }); }} />%
              · from the 5th <input type="number" min="0" max="100" aria-label="Discount from the 5th song %" value={q.rules.d5} style={{ ...priceInput, width: 52 }} onChange={(e) => { const v = e.target.value; update((n) => { n.rules.d5 = v; }); }} />%
            </div>
            <div className="inline">
              Minimum $<input type="number" min="0" aria-label="Minimum price" value={q.rules.minFee} style={priceInput} onChange={(e) => { const v = e.target.value; update((n) => { n.rules.minFee = v; }); }} />
              · Round to $<input type="number" min="1" aria-label="Round to" value={q.rules.round} style={{ ...priceInput, width: 52 }} onChange={(e) => { const v = e.target.value; update((n) => { n.rules.round = v; }); }} />
            </div>
            <div className="field">
              <label htmlFor="quote-note">Notes for this artist (internal)</label>
              <textarea id="quote-note" className="input" style={{ minHeight: 70 }} value={q.note} placeholder="e.g. EP of 3 songs, only one Spotify pitch" onChange={(e) => { const v = e.target.value; update((n) => { n.note = v; }); }} />
            </div>
          </div>
        </div>

        <div className="stack" style={{ gap: 14, flexBasis: 340, position: "sticky", top: 16 }}>
          {/* The quote box: only what the artist should see, in their language, ready to send. */}
          <aside ref={boxRef} className="panel stack" aria-label="Artist quote" style={{ background: "#FFF6D6", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <strong className="disp" style={{ fontSize: 22, lineHeight: 1.15 }}>Artist Quote - {artistName}</strong>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600 }}>
                <Star size={22} fill={LAUNCHPAD_COLOR} stroke="#1E1B2E" strokeWidth={4} />
                Launchpad
              </span>
            </div>
            {groups.map((g, j) => (
              <div key={j} style={{ display: "flex", flexDirection: "column", gap: 3, paddingBottom: 8, borderBottom: "1px solid rgba(30,27,46,.15)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, fontWeight: 600, fontSize: 15, lineHeight: 1.35, fontVariantNumeric: "tabular-nums" }}>
                  <span style={{ flex: "1 1 auto", minWidth: 0, overflowWrap: "anywhere" }}>{g.title[L]}</span>
                  <span style={{ flex: "0 0 auto", whiteSpace: "nowrap" }}>{money(g.amount)}</span>
                </div>
                {g.areas.length ? g.areas.map((a) => (
                  <div key={a.key} style={{ fontSize: 14, lineHeight: 1.4, paddingLeft: 18, position: "relative" }}><span style={{ position: "absolute", left: 0 }}>✓</span>{a[L]}</div>
                )) : <div className="muted" style={{ fontSize: 14 }}>{TX.nothing}</div>}
                {g.discount > 0 && <div style={{ fontSize: 13, color: "#C2457E" }}>{TX.disc.replace("{p}", g.discountPct)}</div>}
              </div>
            ))}
            {extras.map(([t, v]) => (
              <div key={t} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
                <span>{t}</span><span>{v < 0 ? "−" : ""}{money(Math.abs(v))}</span>
              </div>
            ))}
            <div style={{ borderTop: "2px dashed #1E1B2E", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span>Total</span>
              <span className="disp" style={{ fontSize: 40, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{money(c.total)}</span>
            </div>
            <div style={{ fontSize: 14, display: "flex", gap: 8 }}><span aria-hidden="true">✦</span><span>{TX.dash}</span></div>
            <div className="muted" style={{ fontSize: 13 }}>{TX.fees}</div>
          </aside>

          {/* Internal tools: not part of what the artist sees. */}
          <div className="stack" style={{ gap: 8, padding: "4px 2px" }}>
            <div className="muted" style={{ fontSize: 13 }}>Full Launchpad for these songs: {money(c.full)}</div>

            {/* Sending the quote to the artist */}
            {accepted ? (
              <div className="alert alert--ok" role="status" style={{ fontSize: 14 }}>
                <strong>Accepted</strong> by {sentInfo.acceptedName} on {fmtDay(sentInfo.acceptedAt)} · {sentInfo.acceptedChoice === "two" ? "Pay in 2 installments" : "Pay in full"}. Their payments were created below.
                {sentInfo.link && <> <a href={sentInfo.link} target="_blank" rel="noopener noreferrer">See what they accepted</a></>}
              </div>
            ) : confirmSend ? (
              <div className="stack" style={{ gap: 8, border: "1.5px solid #1E1B2E", borderRadius: 12, padding: 12, background: "#fff" }}>
                <div style={{ fontSize: 14 }}>Send this quote to {artistName} by email, with the Service Agreement attached{sentInfo?.sentAt ? ". The link from the earlier email will stop working" : ""}?</div>
                <div className="inline" style={{ gap: 8 }}>
                  <button type="button" className="small-btn small-btn--dark" onClick={send} disabled={sending}>{sending ? "Sending…" : "Yes, send it"}</button>
                  <button type="button" className="small-btn" onClick={() => setConfirmSend(false)} disabled={sending}>Cancel</button>
                </div>
              </div>
            ) : (
              <button type="button" className="small-btn small-btn--dark" style={{ background: "#F2C94C", color: "#1E1B2E" }} onClick={() => setConfirmSend(true)} disabled={busy || dirty || !hasEmail}>
                {sentInfo?.sentAt ? "Send quote again" : "Send quote to artist"}
              </button>
            )}
            {!accepted && !confirmSend && dirty && hasEmail && <div className="muted" style={{ fontSize: 13 }}>Save the quote first to send it.</div>}
            {!accepted && !hasEmail && <div className="muted" style={{ fontSize: 13 }}>Add the artist&apos;s email in Artist details to send the quote.</div>}
            {!accepted && sentInfo?.sentAt && <div className="muted" style={{ fontSize: 13 }}>Sent {fmtDay(sentInfo.sentAt)}{sentInfo.expiresAt ? ` · link open until ${fmtDay(sentInfo.expiresAt)}` : ""}{sentInfo.link ? <> · <a href={sentInfo.link} target="_blank" rel="noopener noreferrer">open their page</a></> : ""}</div>}
            <button type="button" className="small-btn small-btn--dark" onClick={save} disabled={busy || !dirty}>{dirty ? "Save quote" : "Saved"}</button>
            <button type="button" className="small-btn small-btn--dark" onClick={downloadPdf} disabled={pdfBusy}>{pdfBusy ? "Creating PDF…" : "Download PDF"}</button>
            <button type="button" className="small-btn" onClick={copyText}>{copied ? "Copied ✓" : `Copy for email (${lang === "es" ? "Spanish" : "English"})`}</button>
            {showText && <textarea readOnly className="input" aria-label="Quote text" style={{ minHeight: 180, fontSize: 13 }} value={quoteText(q, c, lang)} onFocus={(e) => e.target.select()} />}
            <div className="inline" style={{ gap: 8 }}>
              <button type="button" className="small-btn" onClick={() => toPayments(true)} disabled={busy || dirty || accepted}>Pay in 2 installments</button>
              <button type="button" className="small-btn" onClick={() => toPayments(false)} disabled={busy || dirty || accepted}>Pay in full</button>
            </div>
            {dirty && <div className="muted" style={{ fontSize: 13 }}>Save the quote before adding it to payments.</div>}
            {savedAt && !dirty && <div className="muted" style={{ fontSize: 13 }}>Last saved {new Date(savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>}
            {msg && <div className={msg.bad ? "alert" : "alert alert--ok"} role="status" style={{ fontSize: 14 }}>{msg.text}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
