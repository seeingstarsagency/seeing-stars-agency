"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../../lib/supabase-browser";

const TXT = {
  en: {
    kicker: (n) => (n ? `hey, ${n}!` : "hey, star!"),
    title: "Create your password",
    lead: "One last step and you're in. Next up: your questionnaire, then your dashboard.",
    email: "Your email",
    pw: "Choose a password",
    pw2: "Type it again",
    save: "Save and continue",
    saving: "Saving…",
    short: "Use at least 8 characters.",
    mismatch: "The two passwords don't match.",
    err: "We couldn't save it. Please open the link from your email again.",
  },
  es: {
    kicker: (n) => (n ? `¡hola, ${n}!` : "¡hola, estrella!"),
    title: "Crea tu contraseña",
    lead: "Un último paso y ya estás dentro. Después: tu cuestionario y luego tu panel.",
    email: "Tu correo",
    pw: "Elige una contraseña",
    pw2: "Escríbela otra vez",
    save: "Guardar y continuar",
    saving: "Guardando…",
    short: "Usa al menos 8 caracteres.",
    mismatch: "Las dos contraseñas no coinciden.",
    err: "No se pudo guardar. Abre de nuevo el enlace de tu correo.",
  },
};

export default function SetPasswordForm({ lang, sb, email, name }) {
  const t = TXT[lang] || TXT.en;
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    if (pw.length < 8) return setMsg(t.short);
    if (pw !== pw2) return setMsg(t.mismatch);
    setBusy(true);
    const { error } = await supabaseBrowser(sb).auth.updateUser({ password: pw });
    if (error) {
      setBusy(false);
      return setMsg(t.err);
    }
    // /auth/redirect sends artists to /dashboard, which opens the questionnaire first if it isn't done.
    window.location.href = "/auth/redirect";
  }

  return (
    <div className="app app--lined" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 24, minHeight: "100vh" }}>
      <form onSubmit={save} className="panel stack" style={{ width: "100%", maxWidth: 440, borderRadius: 24, padding: "40px 36px", boxShadow: "10px 10px 0 #F2C94C", gap: 18 }}>
        <div>
          <div className="kicker">{t.kicker(name)}</div>
          <h1 className="h1 it" style={{ fontSize: 38, margin: "4px 0 10px" }}>{t.title}</h1>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55 }}>{t.lead}</p>
        </div>
        {msg && <div className="alert" role="alert">{msg}</div>}
        <div className="field">
          <label htmlFor="em">{t.email}</label>
          <input id="em" className="input" type="email" value={email || ""} readOnly autoComplete="username" style={{ background: "#F4F2EE", color: "#5B5770" }} />
        </div>
        <div className="field">
          <label htmlFor="pw">{t.pw}</label>
          <input id="pw" className="input" type="password" autoComplete="new-password" minLength={8} required autoFocus value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="pw2">{t.pw2}</label>
          <input id="pw2" className="input" type="password" autoComplete="new-password" minLength={8} required value={pw2} onChange={(e) => setPw2(e.target.value)} />
        </div>
        <button type="submit" className="btn btn--dark" disabled={busy}>{busy ? t.saving : t.save}</button>
      </form>
    </div>
  );
}
