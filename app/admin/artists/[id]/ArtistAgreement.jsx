"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../../../lib/supabase-browser";
import { getArtistAgreementTicket, registerArtistAgreement, removeArtistAgreement } from "../../actions";

// This artist's own Service Agreement (their name, song and price). Sent with their quote instead of the general one.
export default function ArtistAgreement({ artistId, artistName, current, saved, accepted, sb }) {
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") return setMsg({ bad: true, text: "Please choose a PDF file." });
    setBusy(true);
    setMsg({ text: "Uploading…" });
    const ticket = await getArtistAgreementTicket(artistId);
    if (ticket.error) { setBusy(false); return setMsg({ bad: true, text: ticket.error }); }
    const { error } = await supabaseBrowser(sb).storage.from("artist-files").uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: "application/pdf" });
    if (error) { setBusy(false); return setMsg({ bad: true, text: "Upload failed: " + error.message }); }
    const res = await registerArtistAgreement(artistId, ticket.path);
    setBusy(false);
    if (res.error) return setMsg({ bad: true, text: "Uploaded, but could not save it: " + res.error });
    window.location.reload();
  }

  async function useGeneral() {
    setBusy(true);
    const res = await removeArtistAgreement(artistId);
    setBusy(false);
    if (res.error) return setMsg({ bad: true, text: res.error });
    window.location.reload();
  }

  return (
    <div className="stack" style={{ gap: 10, marginTop: 20, border: "1.5px dashed #1E1B2E", borderRadius: 14, padding: 16 }}>
      <div>
        <strong>{artistName}&apos;s Service Agreement</strong>
        <div style={{ fontSize: 14 }}>
          {accepted
            ? <>Accepted with the quote. <a href={`/admin/artists/${artistId}/agreement`} target="_blank" rel="noopener noreferrer">Open the agreement they accepted</a></>
            : current
              ? <>Their own agreement is attached to the quote email and linked on their quote page. <a href={`/admin/artists/${artistId}/agreement`} target="_blank" rel="noopener noreferrer">Open the PDF</a></>
              : <span className="muted">None uploaded: the quote goes out with the general agreement from Settings.</span>}
        </div>
      </div>
      {!accepted && (saved ? (
        <div className="inline" style={{ gap: 10, alignItems: "center" }}>
          <label htmlFor="artist-agreement" className="sr-only">Upload this artist&apos;s agreement (PDF)</label>
          <input id="artist-agreement" type="file" accept="application/pdf" className="input" style={{ paddingTop: 10, maxWidth: 360 }} onChange={onChange} disabled={busy} />
          {current && <button type="button" className="small-btn" onClick={useGeneral} disabled={busy}>Use the general one instead</button>}
        </div>
      ) : <div className="muted" style={{ fontSize: 13 }}>Save the quote first, then upload their agreement.</div>)}
      {!accepted && current && <div className="muted" style={{ fontSize: 13 }}>Upload it before sending the quote. If you change it after sending, send the quote again.</div>}
      {msg && <div className={msg.bad ? "alert" : "alert alert--ok"} role="status" style={{ fontSize: 14 }}>{msg.text}</div>}
    </div>
  );
}
