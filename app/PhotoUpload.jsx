"use client";

import { useRef, useState } from "react";
import { supabaseBrowser } from "../lib/supabase-browser";
import { getPhotoTicket, savePhoto } from "./photo-actions";

// Round profile photo with a "change photo" button.
export default function PhotoUpload({ artistId, sb, photoUrl, name, label, busyLabel, errorLabel, size = 132, editable = true }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const initials = String(name || "?").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  async function onPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return setErr(errorLabel);
    setBusy(true);
    setErr(null);
    const ticket = await getPhotoTicket(artistId || null, file.name, file.type);
    if (ticket.error) { setBusy(false); return setErr(errorLabel); }
    const { error } = await supabaseBrowser(sb).storage.from("artist-files").uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
    if (error) { setBusy(false); return setErr(errorLabel); }
    const res = await savePhoto(artistId || null, ticket.path);
    setBusy(false);
    if (res.error) return setErr(errorLabel);
    window.location.reload();
  }

  return (
    <div className="avatar-wrap">
      <div className="avatar" style={{ width: size, height: size }}>
        {photoUrl ? <img src={photoUrl} alt={name} /> : <span className="avatar__initials" style={{ fontSize: size / 2.6 }}>{initials}</span>}
      </div>
      {editable && (
        <>
          <button type="button" className="small-btn" onClick={() => input.current?.click()} disabled={busy}>{busy ? busyLabel : label}</button>
          <input ref={input} type="file" accept="image/*" hidden onChange={onPick} />
          {err && <div className="avatar__err" role="alert">{err}</div>}
        </>
      )}
    </div>
  );
}
