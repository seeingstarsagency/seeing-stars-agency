"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../../../lib/supabase-browser";
import { getUploadTicket, registerFile } from "../../actions";

export default function UploadForm({ artistId, sb }) {
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = form.file.files[0];
    if (!file) return setMsg("Choose a file.");
    setBusy(true);
    setMsg("Uploading…");
    const ticket = await getUploadTicket(artistId, file.name);
    if (ticket.error) {
      setBusy(false);
      return setMsg("Could not prepare the upload: " + ticket.error);
    }
    const { error } = await supabaseBrowser(sb).storage.from("artist-files").uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type || undefined });
    if (error) {
      setBusy(false);
      return setMsg("Upload failed: " + error.message);
    }
    const res = await registerFile(artistId, form.name.value.trim() || file.name, ticket.path);
    setBusy(false);
    if (res.error) return setMsg("Uploaded but could not be saved: " + res.error);
    window.location.reload();
  }

  return (
    <form onSubmit={onSubmit} className="stack" style={{ gap: 10 }}>
      <div className="inline">
        <input name="file" type="file" aria-label="File" className="input" style={{ paddingTop: 10 }} />
        <input name="name" className="input" placeholder="Name the artist will see (optional)" aria-label="Display name" />
        <button type="submit" className="small-btn small-btn--dark" disabled={busy}>Upload</button>
      </div>
      {msg && <div style={{ fontSize: 14 }} role="status">{msg}</div>}
    </form>
  );
}
