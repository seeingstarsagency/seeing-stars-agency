"use client";

import { useState } from "react";
import { acceptQuote } from "./actions";

export default function AcceptForm({ token, t, amounts }) {
  const [choice, setChoice] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!choice || !agreed || name.trim().length < 3) return setErr(t.need);
    setBusy(true);
    setErr(null);
    try {
      const res = await acceptQuote(token, choice, name, agreed);
      if (res?.ok || res?.state) return window.location.reload();
      setErr(res?.error === "incomplete" ? t.need : t.failed);
    } catch {
      setErr(t.failed);
    }
    setBusy(false);
  }

  const opt = (value, title, sub) => (
    <label className="opt" style={{ borderRadius: 14, alignItems: "flex-start", padding: "12px 14px", background: choice === value ? "#FFF6D6" : "#fff", width: "100%" }}>
      <input type="radio" name="pay" value={value} checked={choice === value} onChange={() => setChoice(value)} style={{ marginTop: 4 }} />
      <span style={{ display: "flex", flexDirection: "column" }}><strong>{title}</strong><span className="muted" style={{ fontSize: 14 }}>{sub}</span></span>
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="panel stack" style={{ gap: 14 }} noValidate>
      <h2 className="h2" style={{ fontSize: 22, margin: 0 }}>{t.payTitle}</h2>
      <div role="radiogroup" aria-label={t.payTitle} className="stack" style={{ gap: 10 }}>
        {opt("two", t.two, t.twoSub)}
        {opt("full", t.full, t.fullSub)}
      </div>
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15, cursor: "pointer" }}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: 20, height: 20, marginTop: 2, accentColor: "#1E1B2E", flex: "0 0 auto" }} />
        <span>{t.agree}</span>
      </label>
      <div className="field">
        <label htmlFor="signer">{t.name}</label>
        <input id="signer" className="input" autoComplete="name" placeholder={t.namePh} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      {err && <div className="alert" role="alert">{err}</div>}
      <button type="submit" className="btn btn--dark" disabled={busy} style={{ alignSelf: "flex-start" }}>{t.accept}</button>
    </form>
  );
}
