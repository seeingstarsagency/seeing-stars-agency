"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../../lib/supabase-browser";

const TXT = {
  en: { title: "Choose your password", save: "Save password", short: "Use at least 8 characters.", err: "Could not save. Please open the link from your email again." },
  es: { title: "Elige tu contraseña", save: "Guardar contraseña", short: "Usa al menos 8 caracteres.", err: "No se pudo guardar. Abre de nuevo el enlace de tu correo." },
};

export default function SetPasswordForm({ lang, sb }) {
  const t = TXT[lang];
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    if (pw.length < 8) return setMsg(t.short);
    setBusy(true);
    const { error } = await supabaseBrowser(sb).auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg(t.err);
    window.location.href = "/auth/redirect";
  }

  return (
    <div className="app app--lined" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
      <form onSubmit={save} className="panel stack" style={{ width: "100%", maxWidth: 440, borderRadius: 24, padding: "40px 36px", boxShadow: "10px 10px 0 #F2C94C", gap: 18 }}>
        <h1 className="h1 it" style={{ fontSize: 36 }}>{t.title}</h1>
        {msg && <div className="alert" role="alert">{msg}</div>}
        <div className="field">
          <label htmlFor="pw">{lang === "es" ? "Nueva contraseña" : "New password"}</label>
          <input id="pw" className="input" type="password" autoComplete="new-password" minLength={8} required value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <button type="submit" className="btn btn--dark" disabled={busy}>{t.save}</button>
      </form>
    </div>
  );
}
