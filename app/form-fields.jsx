import { pick } from "../lib/i18n";

// One question, in the artist's language. `value` pre-fills it.
export function Field({ f: field, lang, value, optional = false }) {
  const f = optional ? { ...field, required: false } : field;
  const label = pick(lang, f);
  const id = `q-${f.name}`;
  if (f.type === "links") {
    const saved = Object.fromEntries((Array.isArray(value) ? value : []).map((x) => [x.key, x]));
    return (
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <fieldset>
          <legend>{label}</legend>
          <div className="linkrows">
            {f.items.map((it) => {
              const v = saved[it.key];
              const base = `${f.name}__${it.key}`;
              return (
                <div key={it.key} className="linkrow">
                  <label className="opt linkrow__check">
                    <input type="checkbox" name={base} defaultChecked={Boolean(v)} /> {pick(lang, it)}
                  </label>
                  {it.custom && (
                    <input name={`${base}_name`} className="input linkrow__name" defaultValue={v?.name && v.name !== it.en ? v.name : undefined} placeholder={lang === "es" ? "¿Cuál? (ej. Threads, X)" : "Which one? (e.g. Threads, X)"} aria-label={lang === "es" ? "Nombre de la red social" : "Network name"} maxLength={60} />
                  )}
                  <input name={`${base}_url`} type="text" inputMode="url" className="input linkrow__url" defaultValue={v?.url || undefined} placeholder={lang === "es" ? `Enlace de ${pick(lang, it)}` : `${pick(lang, it)} link`} aria-label={lang === "es" ? `Enlace de ${pick(lang, it)}` : `${pick(lang, it)} link`} maxLength={300} />
                </div>
              );
            })}
          </div>
        </fieldset>
      </div>
    );
  }
  if (f.type === "radio" || f.type === "checkbox") {
    const chosen = Array.isArray(value) ? value : value ? [value] : [];
    return (
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <fieldset>
          <legend>{label}{f.required ? " *" : ""}</legend>
          {f.note && <p className="qnote">{pick(lang, f.note)}</p>}
          <div className="opts">
            {f.options.map((op) => (
              <label key={op.value} className="opt">
                <input type={f.type} name={f.name} value={op.value} defaultChecked={chosen.includes(op.value)} required={(f.type === "radio" && f.required) || undefined} /> {pick(lang, op)}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    );
  }
  const common = { id, name: f.name, className: "input", required: f.required || undefined, defaultValue: value || undefined };
  return (
    <div className="field" style={f.type === "textarea" || f.wide ? { gridColumn: "1 / -1" } : undefined}>
      <label htmlFor={id}>{label}{f.required ? " *" : ""}</label>
      {f.type === "select" ? (
        <select {...common} defaultValue={value || ""}>
          <option value="">—</option>
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

// All sections of a questionnaire as colored cards.
export function FormSections({ sections, lang, values = {}, optional = false }) {
  return sections.map((s) => (
    <section key={s.key} className="panel stack" style={{ background: s.bg, gap: 18 }}>
      <h2 className="h2" style={{ fontSize: 28 }}>{pick(lang, s)}</h2>
      <div className="fgrid">
        {s.fields.map((f) => (
          <Field key={f.name} f={f} lang={lang} value={values[f.name]} optional={optional} />
        ))}
      </div>
    </section>
  ));
}

// Read-only answers list (admin view).
export function AnswersList({ sections, answers = {}, lang, answerLabel }) {
  return sections.map((s) => (
    <div key={s.key} style={{ marginBottom: 20 }}>
      <div className="tag" style={{ marginBottom: 8 }}>{pick(lang, s)}</div>
      <dl className="kv">
        {s.fields.map((f) => (
          <div key={f.name} style={{ display: "contents" }}>
            <dt>{pick(lang, f)}</dt>
            <dd>{answerLabel(f, answers[f.name], lang)}</dd>
          </div>
        ))}
      </dl>
    </div>
  ));
}
