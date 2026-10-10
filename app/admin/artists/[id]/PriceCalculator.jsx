"use client";

import { useMemo, useState } from "react";
import { FIXED_ITEMS, ARTIST_ITEMS, SONG_ITEMS, computeQuote, quoteGroups, quoteText } from "../../../../lib/pricing";
import { saveQuote, quoteToPayments } from "../../actions";
import { Star } from "../../../components";
import { PACKAGES as PKG_INFO } from "../../../content";

const LAUNCHPAD_COLOR = PKG_INFO.find((p) => p.name === "Launchpad")?.color || "#9CCBE0";

const money = (v) => "$" + (Math.round(v * 100) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
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

export default function PriceCalculator({ artistId, artistName = "", initial, savedAt, saved, lang = "en" }) {
  const [q, setQ] = useState(initial);
  const [msg, setMsg] = useState(null);
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
    setMsg({ text: "Quote saved for this artist." });
  }

  async function toPayments(halves) {
    setBusy(true);
    const res = await quoteToPayments(artistId, c.total, halves, lang);
    setBusy(false);
    if (res.error) return setMsg({ bad: true, text: "Could not add the payments: " + res.error });
    window.location.hash = "payments";
    window.location.reload();
  }

  const groups = quoteGroups(q, c);
  const extras = [
    ...(c.rush ? [["Rush fee", c.rush]] : []),
    ...(c.minApplied ? [["Adjustment to the minimum", c.min - c.sub]] : []),
  ];
  const [copied, setCopied] = useState(false);
  async function copyText() {
    const text = quoteText(q, c, lang);
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { setMsg({ bad: true, text: "Could not copy. Select the text below instead." }); setShowText(true); }
  }
  const [showText, setShowText] = useState(false);

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

        <aside className="panel stack" style={{ background: "#FFF6D6", gap: 10, flexBasis: 280, position: "sticky", top: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <strong className="disp" style={{ fontSize: 22, lineHeight: 1.15 }}>Artist Quote - {artistName}</strong>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600 }}>
              <Star size={22} fill={LAUNCHPAD_COLOR} stroke="#1E1B2E" strokeWidth={4} />
              Launchpad
            </span>
          </div>
          {groups.map((g, j) => (
            <div key={j} style={{ display: "flex", flexDirection: "column", gap: 3, paddingBottom: 8, borderBottom: "1px solid rgba(30,27,46,.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontWeight: 600, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
                <span>{g.title.en}</span><span>{money(g.amount)}</span>
              </div>
              {g.areas.length ? g.areas.map((a) => (
                <div key={a.key} style={{ fontSize: 14, paddingLeft: 16, position: "relative" }}><span style={{ position: "absolute", left: 0 }}>✓</span>{a.en}</div>
              )) : <div className="muted" style={{ fontSize: 14 }}>Nothing to do on this song.</div>}
              {g.discount > 0 && <div style={{ fontSize: 13, color: "#C2457E" }}>Includes a {g.discountPct}% discount</div>}
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
          <div style={{ fontSize: 14, display: "flex", gap: 8 }}><span aria-hidden="true">✦</span><span>Includes access to your own artist dashboard, where you can manage all your information in one place.</span></div>
          <div className="muted" style={{ fontSize: 13 }}>Full Launchpad for these songs: {money(c.full)}. Third-party fees (Copyright Office, distributor) are paid by the artist.</div>
          <button type="button" className="small-btn small-btn--dark" onClick={save} disabled={busy || !dirty}>{dirty ? "Save quote" : "Saved"}</button>
          <button type="button" className="small-btn" onClick={copyText}>{copied ? "Copied ✓" : `Copy for email (${lang === "es" ? "Spanish" : "English"})`}</button>
          {showText && <textarea readOnly className="input" aria-label="Quote text" style={{ minHeight: 180, fontSize: 13 }} value={quoteText(q, c, lang)} onFocus={(e) => e.target.select()} />}
          <div className="inline" style={{ gap: 8 }}>
            <button type="button" className="small-btn" onClick={() => toPayments(true)} disabled={busy || dirty}>Pay in 2 installments</button>
            <button type="button" className="small-btn" onClick={() => toPayments(false)} disabled={busy || dirty}>Pay in full</button>
          </div>
          {dirty && <div className="muted" style={{ fontSize: 13 }}>Save the quote before adding it to payments.</div>}
          {savedAt && !dirty && <div className="muted" style={{ fontSize: 13 }}>Last saved {new Date(savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>}
          {msg && <div className={msg.bad ? "alert" : "alert alert--ok"} role="status" style={{ fontSize: 14 }}>{msg.text}</div>}
        </aside>
      </div>
    </div>
  );
}
