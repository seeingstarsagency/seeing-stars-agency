import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage } from "../../shell";
import { NewArtistFields } from "../../artist-form";
import { createArtist, archiveSubmission } from "../../actions";
import { SECTIONS, answerLabel } from "../../../../lib/questions";
import { startingPoint, STEPS } from "../../../../lib/steps";
import { fmtDate } from "../../../ui";

export const dynamic = "force-dynamic";

export default async function Submission({ params, searchParams }) {
  const { supabase } = await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const { data: sub } = await supabase.from("intake_submissions").select("*").eq("id", id).maybeSingle();
  if (!sub) notFound();
  const a = sub.answers || {};
  const start = startingPoint(a);
  const had = start.filter((r) => r.start_status === "had").length;
  const wanted = (a.help_with || []).filter((p) => p !== "unsure");

  return (
    <AdminShell>
      <a href="/admin">← Volver</a>
      <div>
        <div className="kicker">cuestionario · {fmtDate(sub.created_at, "es")} · {sub.lang.toUpperCase()}</div>
        <h1 className="h1">{sub.artist_name}</h1>
        <p className="lead">{sub.email}</p>
      </div>
      {sp?.error && <div className="alert">Falta el nombre o el correo.</div>}

      <div className="row">
        <section className="panel" style={{ flexBasis: 520 }}>
          <h2 className="h2" style={{ marginBottom: 16 }}>Respuestas</h2>
          {SECTIONS.map((s) => (
            <div key={s.key} style={{ marginBottom: 20 }}>
              <div className="tag" style={{ marginBottom: 8 }}>{s.es}</div>
              <dl className="kv">
                {s.fields.map((f) => (
                  <div key={f.name} style={{ display: "contents" }}>
                    <dt>{f.es}</dt>
                    <dd>{answerLabel(f, a[f.name], "es")}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </section>

        <div className="stack" style={{ gap: 28 }}>
          <section className="panel panel--blue">
            <h2 className="h2">Punto de partida</h2>
            <p style={{ margin: "0 0 12px", fontSize: 15 }}>Según sus respuestas, ya tiene <strong>{had} de {STEPS.length}</strong> pasos.</p>
            <ul className="checks">
              {start.map((r) => {
                const s = STEPS.find((x) => x.key === r.step_key);
                return (
                  <li key={r.step_key}>
                    <span className="box" style={{ background: r.start_status === "had" ? "#9A96A8" : "#fff" }}>{r.start_status === "had" ? "✓" : ""}</span>
                    <span>{s.es}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="panel panel--yellow">
            <h2 className="h2">Crear cuenta</h2>
            <form action={createArtist} className="stack" style={{ gap: 16, marginTop: 12 }}>
              <input type="hidden" name="submission_id" value={sub.id} />
              <NewArtistFields
                defaults={{
                  name: sub.artist_name,
                  email: sub.email,
                  legal_name: a.legal_name,
                  lang: a.preferred_lang || sub.lang,
                  single_title: a.single_title,
                  release_date: a.next_release,
                  packages: wanted,
                }}
              />
              <button type="submit" className="btn btn--dark" style={{ alignSelf: "flex-start" }}>Crear artista</button>
            </form>
          </section>

          <form action={archiveSubmission}>
            <input type="hidden" name="id" value={sub.id} />
            <button type="submit" className="small-btn small-btn--danger">Archivar sin crear cuenta</button>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
