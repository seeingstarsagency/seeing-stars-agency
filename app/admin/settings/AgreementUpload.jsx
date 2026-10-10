"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../../lib/supabase-browser";
import { getAgreementTicket, registerAgreement } from "../actions";
import { toastAfterReload } from "../Toaster";

export default function AgreementUpload({ lang, label, current, sb }) {
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") return setMsg({ bad: true, text: "Please choose a PDF file." });
    setBusy(true);
    setMsg({ text: "Uploading…" });
    const ticket = await getAgreementTicket(lang);
    if (ticket.error) { setBusy(false); return setMsg({ bad: true, text: "Could not prepare the upload: " + ticket.error }); }
    const { error } = await supabaseBrowser(sb).storage.from("artist-files").uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: "application/pdf" });
    if (error) { setBusy(false); return setMsg({ bad: true, text: "Upload failed: " + error.message }); }
    const res = await registerAgreement(lang, ticket.path);
    setBusy(false);
    if (res.error) return setMsg({ bad: true, text: "Uploaded, but could not save it: " + res.error });
    toastAfterReload(`${lang === "es" ? "Spanish" : "English"} Service Agreement uploaded ✓`);
    window.location.reload();
  }

  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="field">
        <label htmlFor={`agr-${lang}`}>{label}</label>
        <input id={`agr-${lang}`} type="file" accept="application/pdf" className="input" style={{ paddingTop: 10 }} onChange={onChange} disabled={busy} />
      </div>
      <div style={{ fontSize: 14 }}>{current ? <>Current file: <a href={`/admin/settings/agreement/${lang}`} target="_blank" rel="noopener noreferrer">open the PDF</a></> : <span className="muted">No file yet.</span>}</div>
      {msg && <div className={msg.bad ? "alert" : "alert alert--ok"} role="status" style={{ fontSize: 14 }}>{msg.text}</div>}
    </div>
  );
}
