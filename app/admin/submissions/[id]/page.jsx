import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage } from "../../shell";
import { NewArtistFields } from "../../artist-form";
import { createArtist, archiveSubmission } from "../../actions";
import { FINDER, answerLabel, recommendPackages } from "../../../../lib/questions";
import { AnswersList } from "../../../form-fields";
import { PKG_WHY } from "../../../../lib/i18n";
import { fmtDate } from "../../../ui";

export const dynamic = "force-dynamic";

export default async function Submission({ params, searchParams }) {
  const { supabase } = await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const { data: sub } = await supabase.from("intake_submissions").select("*").eq("id", id).maybeSingle();
  if (!sub) notFound();
  const a = sub.answers || {};
  const wanted = Array.isArray(a.recommended) && a.recommended.length ? a.recommended : recommendPackages(a);

  return (
    <AdminShell>
      <a href="/admin/requests">← Back to new requests</a>
      <div>
        <div className="kicker">questionnaire · {fmtDate(sub.created_at, "en")} · {sub.lang.toUpperCase()}</div>
        <h1 className="h1">{sub.artist_name}</h1>
        <p className="lead">{sub.email}</p>
      </div>
      {sp?.error && <div className="alert">Name or email is missing.</div>}

      <div className="row">
        <section className="panel" style={{ flexBasis: 520 }}>
          <h2 className="h2" style={{ marginBottom: 16 }}>Answers</h2>
          <AnswersList sections={FINDER} answers={a} lang="en" answerLabel={answerLabel} />
        </section>

        <div className="stack" style={{ gap: 28 }}>
          <section className="panel panel--blue">
            <h2 className="h2">Recommended</h2>
            <p style={{ margin: "0 0 12px", fontSize: 15 }}>What the website recommended from their answers:</p>
            <ul className="checks">
              {wanted.map((p) => (
                <li key={p}>
                  <span className="box" style={{ background: "#F2C94C" }}>✓</span>
                  <span><strong>{p}</strong> · {PKG_WHY[p]?.en}</span>
                </li>
              ))}
            </ul>
            <p style={{ margin: "12px 0 0", fontSize: 14 }}>Once you create their account, they'll fill in the full Launchpad questionnaire inside their dashboard.</p>
          </section>

          <section className="panel panel--yellow">
            <h2 className="h2">Create account</h2>
            <form action={createArtist} className="stack" style={{ gap: 16, marginTop: 12 }}>
              <input type="hidden" name="submission_id" value={sub.id} />
              <NewArtistFields
                defaults={{
                  name: sub.artist_name,
                  email: sub.email,
                  lang: sub.lang,
                  packages: wanted,
                }}
              />
              <button type="submit" className="btn btn--dark" style={{ alignSelf: "flex-start" }}>Create artist</button>
            </form>
          </section>

          <form action={archiveSubmission}>
            <input type="hidden" name="id" value={sub.id} />
            <button type="submit" className="small-btn small-btn--danger">Archive without creating an account</button>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
