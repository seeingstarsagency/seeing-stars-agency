"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../../../lib/supabase-browser";
import { getUploadTicket, registerFile } from "../../actions";

export default function UploadForm({ artistId }) {
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = form.file.files[0];
    if (!file) return setMsg("Elige un archivo.");
    setBusy(true);
    setMsg("Subiendo…");
    const ticket = await getUploadTicket(artistId, file.name);
    if (ticket.error) {
      setBusy(false);
      return setMsg("No se pudo preparar la subida: " + ticket.error);
    }
    const { error } = await supabaseBrowser().storage.from("artist-files").uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type || undefined });
    if (error) {
      setBusy(false);
      return setMsg("Falló la subida: " + error.message);
    }
    const res = await registerFile(artistId, form.name.value.trim() || file.name, ticket.path);
    setBusy(false);
    if (res.error) return setMsg("Se subió pero no se pudo registrar: " + res.error);
    window.location.reload();
  }

  return (
    <form onSubmit={onSubmit} className="stack" style={{ gap: 10 }}>
      <div className="inline">
        <input name="file" type="file" aria-label="Archivo" className="input" style={{ paddingTop: 10 }} />
        <input name="name" className="input" placeholder="Nombre que verá el artista (opcional)" aria-label="Nombre visible" />
        <button type="submit" className="small-btn small-btn--dark" disabled={busy}>Subir</button>
      </div>
      {msg && <div style={{ fontSize: 14 }} role="status">{msg}</div>}
    </form>
  );
}
