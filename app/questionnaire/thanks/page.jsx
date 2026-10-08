import { getLang, T } from "../../../lib/i18n";
import { AppHeader, StarIcon } from "../../ui";

export default async function Thanks() {
  const lang = await getLang();
  const t = T[lang];
  return (
    <div className="app app--lined">
      <AppHeader lang={lang} path="/questionnaire/thanks" />
      <main className="container narrow" style={{ alignItems: "center", textAlign: "center", paddingTop: 96 }}>
        <StarIcon size={80} />
        <h1 className="h1">{t.qThanksTitle}</h1>
        <p className="lead" style={{ maxWidth: 560 }}>{t.qThanksText}</p>
        <a href="/" className="btn">{t.backHome}</a>
      </main>
    </div>
  );
}
