import { redirect } from "next/navigation";
import { getViewer } from "../../lib/supabase";
import { loadArtist } from "../../lib/artist-data";
import { getLang, T, pick, PKG_BLURB } from "../../lib/i18n";
import { STEPS, summarize, recommendations } from "../../lib/steps";
import { songScope } from "../../lib/song-scope";
import { AppHeader, StarIcon, fmtDate } from "../ui";
import PrintButton from "./PrintButton";

export const metadata = { title: "Report | Seeing Stars Agency" };

export const dynamic = "force-dynamic";

export default async function Report({ searchParams }) {
  const { user, profile, supabase } = await getViewer();
  if (!user) redirect("/login");
  const sp = await searchParams;
  const isAdmin = profile?.role === "admin";
  const artistId = isAdmin ? sp?.artist : profile?.artist_id;
  if (!artistId) redirect(isAdmin ? "/admin" : "/dashboard");
  const data = await loadArtist(supabase, artistId);
  if (!data) redirect("/dashboard");

  const { artist, milestones, songs } = data;
  const { current: song, allRows: rows } = songScope(artist, songs, data.rows, sp?.song);
  const lang = await getLang(artist.lang);
  const t = T[lang];
  const s = summarize(rows);
  const byKey = Object.fromEntries(STEPS.map((x) => [x.key, x]));
  const packages = artist.packages || [];
  const done = rows.filter((r) => r.status === "done").sort((a, b) => String(a.done_on).localeCompare(String(b.done_on)));
  const open = rows.filter((r) => r.status === "in_progress" || r.status === "pending");
  const recs = recommendations(rows, packages);
  const path = (isAdmin ? `/report?artist=${artist.id}` : "/report?") + (song ? `${isAdmin ? "&" : ""}song=${song.id}` : "");
  const back = isAdmin ? `/admin/artists/${artist.id}` : "/dashboard";
  const doneMilestones = milestones.filter((m) => m.done);

  return (
    <div className="app" style={{ background: "#ECE9E2", padding: "0 0 80px" }}>
      <AppHeader lang={lang} path={path} />
      <div className="no-print" style={{ maxWidth: 860, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <a href={back}>{t.backToDashboard}</a>
        <PrintButton label={t.reportPrint} />
      </div>

      <div style={{ padding: "0 24px" }}>
        <article className="report">
          <StarIcon size={120} style={{ position: "absolute", right: -20, top: -20 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <StarIcon size={26} fill="#1E1B2E" />
            <span className="disp" style={{ fontSize: 18, fontWeight: 900 }}><span className="it">Seeing Stars</span> Agency</span>
          </div>

          <div className="tag">{t.reportKicker} · {packages.join(" + ") || "—"}</div>
          <h1 className="h1" style={{ fontSize: 44, marginTop: 8 }}>
            {artist.name}{(song?.title || artist.single_title) && <> · <span className="it" style={{ fontWeight: 500 }}>{song?.title || artist.single_title}</span></>}
          </h1>
          <p className="muted" style={{ margin: "0 0 8px", fontSize: 15 }}>
            {fmtDate(artist.created_at, lang)} – {fmtDate(artist.closed_at || new Date().toISOString(), lang)}
          </p>

          <h2>{t.reportSummary}</h2>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65 }}>{t.summaryText(s, artist.name)}</p>

          <div className="stats" style={{ marginTop: 20 }}>
            <div className="stat" style={{ background: "#F1EFEA", padding: 16 }}><div className="stat__k">{t.atStart}</div><div className="stat__v" style={{ fontSize: 40 }}>{s.startHad}/{s.total}</div></div>
            <div className="stat" style={{ background: "#FFF6D6", padding: 16 }}><div className="stat__k">{t.atClose}</div><div className="stat__v" style={{ fontSize: 40 }}>{s.now}/{s.total}</div></div>
            <div className="stat" style={{ background: "#E3F1F8", padding: 16 }}><div className="stat__k">{t.withUs}</div><div className="stat__v" style={{ fontSize: 40 }}>+{s.done}</div></div>
          </div>

          <h2>{t.reportDone}</h2>
          {done.length === 0 && doneMilestones.length === 0 ? (
            <p className="muted">—</p>
          ) : (
            <table className="table">
              <tbody>
                {done.map((r) => (
                  <tr key={r.step_key}>
                    <td className="muted" style={{ width: 120 }}>{fmtDate(r.done_on, lang)}</td>
                    <td>{pick(lang, byKey[r.step_key])}</td>
                  </tr>
                ))}
                {doneMilestones.map((m) => (
                  <tr key={m.id}>
                    <td className="muted" style={{ width: 120 }}>{fmtDate(m.happens_on, lang)}</td>
                    <td>{m.body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h2>{t.reportPending}</h2>
          {open.length === 0 ? (
            <p className="muted">—</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, lineHeight: 1.8 }}>
              {open.map((r) => {
                const st = byKey[r.step_key];
                const outside = r.status === "pending" && !packages.includes(st.pkg);
                return (
                  <li key={r.step_key}>
                    <strong>{pick(lang, st)}:</strong>{" "}
                    {r.status === "in_progress" ? t.inProgressLong : outside ? `${t.notInPackage} (${st.pkg})` : STATUS_LABEL[lang]}
                  </li>
                );
              })}
            </ul>
          )}

          {recs.length > 0 && (
            <section className="panel panel--dark" style={{ marginTop: 32, borderRadius: 18, padding: 30 }}>
              <div className="tag" style={{ color: "#F2C94C" }}>{t.reportRec}</div>
              <h2 style={{ margin: "8px 0 10px", fontSize: 30, fontStyle: "italic", fontWeight: 900 }}>{recs.map((r) => r.pkg).join(" + ")}</h2>
              <p style={{ margin: "0 0 12px", fontSize: 16, lineHeight: 1.6 }}>{t.recText(recs.map((r) => r.pkg).join(" + "))}</p>
              <ul style={{ margin: "0 0 20px", paddingLeft: 20, fontSize: 15, lineHeight: 1.7 }}>
                {recs.map((r) => (
                  <li key={r.pkg}><strong>{r.pkg}</strong> · {pick(lang, PKG_BLURB[r.pkg])} {t.solves}: {r.steps.map((x) => pick(lang, x)).join(", ")}.</li>
                ))}
              </ul>
              <a href={`mailto:seeingstarsagency@gmail.com?subject=${encodeURIComponent(recs.map((r) => r.pkg).join(" + ") + " · " + artist.name)}`} className="btn btn--accent btn--sm" style={{ borderColor: "#F2C94C" }}>
                {t.reportBook}
              </a>
            </section>
          )}

          <p className="muted" style={{ margin: "28px 0 0", fontSize: 13 }}>seeingstarsagency@gmail.com · @seeingstarsagency · seeingstarsagency.com</p>
        </article>
      </div>
    </div>
  );
}

const STATUS_LABEL = { en: "pending", es: "pendiente" };
