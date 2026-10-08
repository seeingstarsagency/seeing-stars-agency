"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../lib/supabase-browser";

export default function LoginForm({ t }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function onLogin(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setMsg({ bad: true, text: t.lBad });
    window.location.href = "/auth/redirect";
  }

  async function sendLink(kind) {
    if (!email) return setMsg({ bad: true, text: t.email + "?" });
    setBusy(true);
    setMsg(null);
    const sb = supabaseBrowser().auth;
    const { error } =
      kind === "reset"
        ? await sb.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/confirm?next=/account/set-password` })
        : await sb.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: `${origin}/auth/confirm?next=/auth/redirect` } });
    setBusy(false);
    // Same message either way, so nobody can test which emails have accounts.
    setMsg({ bad: false, text: t.lSent });
    if (error) console.warn(error.message);
  }

  return (
    <form onSubmit={onLogin} className="stack" style={{ gap: 18 }}>
      {msg && <div className={msg.bad ? "alert" : "alert alert--ok"} role="status">{msg.text}</div>}
      <div className="field">
        <label htmlFor="lg-email">{t.email}</label>
        <input id="lg-email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="lg-pass">{t.password}</label>
        <input id="lg-pass" className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button type="submit" className="btn btn--dark" disabled={busy}>{t.login}</button>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: 14 }}>
        <button type="button" className="linkbtn" onClick={() => sendLink("reset")} disabled={busy}>{t.lForgot}</button>
        <button type="button" className="linkbtn" onClick={() => sendLink("magic")} disabled={busy}>{t.lMagic}</button>
      </div>
    </form>
  );
}
