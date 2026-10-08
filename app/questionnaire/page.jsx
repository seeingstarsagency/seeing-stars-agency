import { getLang, T, pick } from "../../lib/i18n";
import { SECTIONS } from "../../lib/questions";
import { AppHeader } from "../ui";
import { submitQuestionnaire } from "./actions";

export const metadata = { title: "Questionnaire | Seeing Stars Agency" };

function Field({ f, lang }) {
  const label = pick(lang, f);
  const id = `q-${f.name}`;
  if (f.type === "radio" || f.type === "checkbox") {
    return (
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <fieldset>
          <legend>{label}</legend>
          <div className="opts">
            {f.options.map((op) => (
              <label key={op.value} className="opt">
                <input type={f.type} name={f.name} value={op.value} /> {pick(lang, op)}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    );
  }
  const common = { id, name: f.name, className: "input", required: f.required || undefined };
  return (
    <div className="field" style={f.type === "textarea" ? { gridColumn: "1 / -1" } : undefined}>
      <label htmlFor={id}>{label}{f.required ? " *" : ""}</label>
      {f.type === "select" ? (
        <select {...common} defaultValue={f.name === "preferred_lang" ? lang : ""}>
          {f.name !== "preferred_lang" && <option value="">—</option>}
          {f.options.map((op) => (
            <option key={op.value} value={op.value}>{pick(lang, op)}</option>
          ))}
        </select>
      ) : f.type === "textarea" ? (
        <textarea {...common} maxLength={2000} />
      ) : (
        <input {...common} type={f.type} maxLength={300} placeholder={f.type === "url" ? "https://" : undefined} />
      )}
    </div>
  );
}

export default async function Questionnaire({ searchParams }) {
  const lang = await getLang();
  const t = T[lang];
  const sp = await searchParams;
  const error = sp?.error === "required" ? t.qRequired : sp?.error === "save" ? t.qError : null;

  return (
    <div className="app app--lined">
      <AppHeader lang={lang} path="/questionnaire" right={<a href="/login">{t.clientLogin}</a>} />
      <main className="container narrow" style={{ gap: 24 }}>
        <div>
          <div className="kicker">{t.qKicker}</div>
          <h1 className="h1">{t.qTitle}</h1>
          <p className="lead">{t.qLead}</p>
        </div>
        {error && <div className="alert" role="alert">{error}</div>}
        <form action={submitQuestionnaire} className="stack" style={{ gap: 28 }}>
          <input type="hidden" name="lang" value={lang} />
          <div className="hp" aria-hidden="true">
            <label htmlFor="q-company">Company</label>
            <input id="q-company" name="company" tabIndex={-1} autoComplete="off" />
          </div>
          {SECTIONS.map((s) => (
            <section key={s.key} className="panel stack" style={{ background: s.bg, gap: 18 }}>
              <h2 className="h2" style={{ fontSize: 28 }}>{pick(lang, s)}</h2>
              <div className="fgrid">
                {s.fields.map((f) => (
                  <Field key={f.name} f={f} lang={lang} />
                ))}
              </div>
            </section>
          ))}
          <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{t.qFoot}</p>
          <div>
            <button type="submit" className="btn btn--accent">{t.qSend}</button>
          </div>
        </form>
      </main>
    </div>
  );
}
