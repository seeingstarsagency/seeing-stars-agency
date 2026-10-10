import { AdminShell, requireAdminPage } from "./shell";
import { summarize } from "../../lib/steps";
import { fmtDate } from "../ui";
import { Star } from "../components";

export const metadata = { title: "Admin | Seeing Stars Agency" };

export const dynamic = "force-dynamic";

export default async function Admin({ searchParams }) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const [{ data: artists }, { data: steps }, { data: subs }, { data: waiting }, { data: help }] = await Promise.all([
    supabase.from("artists").select("id, name, packages, release_date, closed_at, user_id, intake_done_at").order("created_at", { ascending: false }),
    supabase.from("artist_steps").select("artist_id, status, start_status"),
    supabase.from("intake_submissions").select("id").eq("status", "new"),
    supabase.from("next_steps").select("artist_id, owner, body").eq("done", false),
    supabase.from("help_messages").select("artist_id").eq("status", "open").eq("sender", "artist"),
  ]);

  const stepsBy = {};
  (steps || []).forEach((r) => (stepsBy[r.artist_id] ||= []).push(r));
  const waitBy = {};
  (waiting || []).forEach((n) => (waitBy[n.artist_id] ||= []).push(n));
  const active = (artists || []).filter((a) => !a.closed_at);
  const thisMonth = new Date().toISOString().slice(0, 7);

  return (
    <AdminShell>
      {sp?.error && <div className="alert">{sp.error}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="kicker">only you can see this</div>
          <h1 className="h1">Your artists</h1>
        </div>
        <a href="/admin/artists/new" className="btn btn--accent btn--sm">+ New artist</a>
      </div>

      {(help?.length || 0) > 0 && (
        <a href="/admin/help" className="alert helpalert" role="status">✦ You have {help.length} new help {help.length === 1 ? "message" : "messages"} from artists. <strong>Answer →</strong></a>
      )}
      <div className="stats">
        <a href="/admin/requests" className="stat stat--link" style={{ background: "#FFF6D6" }} aria-label={`New requests: ${subs?.length || 0}. Open the list`}><div className="stat__v">{subs?.length || 0}</div><div>New requests →</div></a>
        <div className="stat" style={{ background: "#E3F1F8" }}><div className="stat__v">{active.length}</div><div>Active artists</div></div>
        <div className="stat" style={{ background: "#FCE4EF" }}><div className="stat__v">{active.filter((a) => (waitBy[a.id] || []).some((n) => n.owner === "artist")).length}</div><div>Waiting on the artist</div></div>
        <div className="stat" style={{ background: "#E4EAF7" }}><div className="stat__v">{active.filter((a) => a.release_date?.startsWith(thisMonth)).length}</div><div>Releases this month</div></div>
      </div>


      <section className="panel artists-panel">
        <Star size={70} fill="#F2C94C" stroke="#1E1B2E" strokeWidth={3} className="abs twinkle artists-panel__star1" />
        <Star size={30} fill="#9CCBE0" stroke="#1E1B2E" strokeWidth={4} className="abs drift artists-panel__star2" />
        <Star size={22} fill="#F4A6C9" stroke="#1E1B2E" strokeWidth={5} className="abs drift2 artists-panel__star3" />
        <div className="hand" style={{ color: "var(--sky)" }}>your constellation</div>
        <h2 className="section__title artists-panel__title">Artists</h2>
        {!artists?.length ? (
          <p style={{ margin: 0 }}>No artists yet. Create one from a request or with "+ New artist".</p>
        ) : (
          <div className="tablewrap">
            <table className="table" style={{ minWidth: 760 }}>
              <thead>
                <tr><th>Artist</th><th>Package</th><th>Progress</th><th>Release</th><th>Waiting on</th><th></th></tr>
              </thead>
              <tbody>
                {artists.map((a) => {
                  const s = summarize(stepsBy[a.id] || []);
                  const pct = Math.round((s.now / s.total) * 100);
                  const w = waitBy[a.id] || [];
                  const waitArtist = w.find((n) => n.owner === "artist");
                  const waitUs = w.find((n) => n.owner === "agency");
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}><a href={`/admin/artists/${a.id}`} className="artist-link">{a.name}</a>{a.user_id && !a.intake_done_at && <span className="muted"> · questionnaire pending</span>}{a.closed_at && <span className="muted"> · closed</span>}{!a.user_id && <span className="muted"> · no account</span>}</td>
                      <td>{(a.packages || []).join(" + ") || "—"}</td>
                      <td style={{ minWidth: 160 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flexGrow: 1, height: 10, border: "1.5px solid #1E1B2E", borderRadius: 999, overflow: "hidden", background: "#fff" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "#F2C94C" }} />
                          </div>
                          <span style={{ fontSize: 13 }}>{s.now}/{s.total}</span>
                        </div>
                      </td>
                      <td>{fmtDate(a.release_date, "en")}</td>
                      <td style={{ fontSize: 14 }}>{waitArtist ? `Artist · ${waitArtist.body.slice(0, 40)}` : waitUs ? `Us · ${waitUs.body.slice(0, 40)}` : "—"}</td>
                      <td><a href={`/admin/artists/${a.id}`} style={{ fontWeight: 600 }}>Open</a></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
