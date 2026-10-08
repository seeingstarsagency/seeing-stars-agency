import { getLang, T } from "../../lib/i18n";
import { FINDER } from "../../lib/questions";
import { AppHeader } from "../ui";
import { FormSections } from "../form-fields";
import { submitFinder } from "./actions";

export const metadata = { title: "Find your package | Seeing Stars Agency" };

export default async function Finder({ searchParams }) {
  const lang = await getLang();
  const t = T[lang];
  const sp = await searchParams;
  const error = sp?.error === "required" ? t.fRequired : sp?.error === "save" ? t.qError : null;

  return (
    <div className="app app--lined">
      <AppHeader lang={lang} path="/questionnaire" right={<a href="/login">{t.clientLogin}</a>} />
      <main className="container narrow" style={{ gap: 24 }}>
        <div>
          <div className="kicker">{t.fKicker}</div>
          <h1 className="h1">{t.fTitle}</h1>
          <p className="lead">{t.fLead}</p>
        </div>
        {error && <div className="alert" role="alert">{error}</div>}
        <form action={submitFinder} className="stack" style={{ gap: 28 }}>
          <input type="hidden" name="lang" value={lang} />
          <div className="hp" aria-hidden="true">
            <label htmlFor="q-company">Company</label>
            <input id="q-company" name="company" tabIndex={-1} autoComplete="off" />
          </div>
          <FormSections sections={FINDER} lang={lang} />
          <div>
            <button type="submit" className="btn btn--accent">{t.fSend}</button>
          </div>
        </form>
      </main>
    </div>
  );
}
