import { AdminShell, requireAdminPage } from "../shell";
import { deleteSubmission, markSubmissionWithUs } from "../actions";
import ConfirmSubmit from "../ConfirmSubmit";
import { fmtDate } from "../../ui";

export const metadata = { title: "New requests | Seeing Stars Agency" };

export const dynamic = "force-dynamic";

const OK = {
  deleted: "Request deleted.",
  checked: "Marked as already with us. It moved to the list at the bottom.",
  restored: "Moved back to new requests.",
};

export default async function Requests({ searchParams }) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const { data: subs } = await supabase
    .from("intake_submissions")
    .select("id, created_at, artist_name, email, lang, answers, status, artist_id")
    .in("status", ["new", "converted"])
    .order("created_at", { ascending: false });
  const fresh = (subs || []).filter((s) => s.status === "new");
  const withUs = (subs || []).filter((s) => s.status === "converted");

  return (
    <AdminShell>
      <a href="/admin">← Back to your artists</a>
      {OK[sp?.ok] && <div className="alert alert--ok" role="status">{OK[sp.ok]}</div>}

      <div>
        <div className="kicker">find your package</div>
        <h1 className="h1">New requests</h1>
        <p style={{ margin: "6px 0 0", fontSize: 15, maxWidth: 760 }}>
          People who used "Find your package" on the website. Open one to read the answers and create the artist&apos;s account.
          Use <strong>✓ With us</strong> when the artist already works with you, or <strong>Delete</strong> if it&apos;s spam.
        </p>
      </div>

      <section className="panel panel--yellow">
        <h2 className="h2" style={{ marginBottom: 16 }}>New · {fresh.length}</h2>
        {!fresh.length ? (
          <p style={{ margin: 0 }}>No new requests.</p>
        ) : (
          <ul className="reqlist">
            {fresh.map((s) => (
              <li key={s.id} className="req">
                <div className="req__main">
                  <div className="req__top">
                    <strong className="req__name">{s.artist_name}</strong>
                    <span className="req__date">{fmtDate(s.created_at, "en")}</span>
                  </div>
                  <div className="req__meta">{s.email} · {String(s.lang || "en").toUpperCase()}</div>
                  {s.answers?.recommended?.length > 0 && <div className="req__meta">Recommended: <strong>{s.answers.recommended.join(" + ")}</strong></div>}
                  {s.answers?.message && <div className="req__msg">"{s.answers.message.slice(0, 160)}"</div>}
                  <a href={`/admin/submissions/${s.id}`} className="req__open">View answers →</a>
                </div>
                <div className="req__actions">
                  <form action={markSubmissionWithUs}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="small-btn small-btn--dark req__btn" aria-label={`${s.artist_name} already works with us`}>✓ With us</button>
                  </form>
                  <form action={deleteSubmission}>
                    <input type="hidden" name="id" value={s.id} />
                    <ConfirmSubmit
                      className="small-btn small-btn--danger req__btn"
                      message={`Delete the request from ${s.artist_name}? This can't be undone.`}
                      label={`Delete the request from ${s.artist_name} (spam)`}
                    >
                      Delete · spam
                    </ConfirmSubmit>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {withUs.length > 0 && (
        <details className="panel reqdone">
          <summary><strong>Already with us · {withUs.length}</strong></summary>
          <ul className="reqlist" style={{ marginTop: 14 }}>
            {withUs.map((s) => (
              <li key={s.id} className="req req--done">
                <div className="req__main">
                  <div className="req__top">
                    <strong className="req__name">✓ {s.artist_name}</strong>
                    <span className="req__date">{fmtDate(s.created_at, "en")}</span>
                  </div>
                  <div className="req__meta">{s.email}</div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <a href={`/admin/submissions/${s.id}`} className="req__open">View answers →</a>
                    {s.artist_id && <a href={`/admin/artists/${s.artist_id}`} className="req__open">Open artist →</a>}
                  </div>
                </div>
                <div className="req__actions">
                  <form action={markSubmissionWithUs}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="undo" value="1" />
                    <button type="submit" className="small-btn req__btn">Move back to new</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </AdminShell>
  );
}
