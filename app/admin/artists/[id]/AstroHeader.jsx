import PhotoUpload from "../../../PhotoUpload";
import { browserConfig } from "../../../../lib/env";

const btn = { textDecoration: "none", display: "inline-flex", alignItems: "center" };

// Top of every Astro admin page: the same artist header as the main artist page,
// marked as Astro, with the Astro shortcuts. "current" highlights the page you're on.
export default function AstroHeader({ artist, photoUrl, current = "astro", back }) {
  const base = `/admin/artists/${artist.id}/astro`;
  const on = (k) => (current === k ? { outline: "3px solid #1E1B2E", outlineOffset: 2 } : null);
  return (
    <>
      <a href={back?.href || `/admin/artists/${artist.id}`}>← {back?.label || artist.name}</a>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <PhotoUpload artistId={artist.id} sb={browserConfig()} photoUrl={photoUrl} name={artist.name} label="Change photo" busyLabel="Uploading…" errorLabel="Could not upload the photo (images up to 10 MB)." size={96} />
          <div>
            <div className="kicker">{artist.email || "No email yet"}</div>
            <h1 className="h1" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              {artist.name}
              <span style={{ background: "#F2C94C", border: "2px solid #1E1B2E", borderRadius: 999, padding: "4px 14px", fontSize: "0.42em", letterSpacing: ".12em", textTransform: "uppercase", lineHeight: 1.2, whiteSpace: "nowrap" }}>✦ Astro · Artist branding</span>
            </h1>
            <p className="lead" style={{ margin: 0 }}>{artist.user_id ? "Has an account" : "No account yet"} · Language: {(artist.lang || "en").toUpperCase()}</p>
          </div>
        </div>
        <div className="inline">
          <a href={`/dashboard?artist=${artist.id}`} className="small-btn" style={btn}>View their dashboard</a>
          <a href={`/dashboard/astro?artist=${artist.id}`} className="small-btn" style={btn}>View their Astro page</a>
          <a href={`${base}/questionnaire`} className="small-btn" style={{ ...btn, background: "#E3F1F8", ...on("questionnaire") }}>{artist.astro_done_at ? "Astro questionnaire" : "Astro questionnaire · pending"}</a>
          <a href={`${base}#astro-price`} className="small-btn" style={{ ...btn, background: "#FCE4EF" }}>$ Astro price</a>
          <a href={`${base}/report`} className="small-btn small-btn--dark" style={{ ...btn, ...on("report") }}>Astro final report</a>
        </div>
      </div>
    </>
  );
}
