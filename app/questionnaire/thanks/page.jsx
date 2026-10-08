import { getLang, T, PKG_BLURB, PKG_WHY, pick } from "../../../lib/i18n";
import { PACKAGES } from "../../../lib/steps";
import { CONTACT } from "../../content";
import { AppHeader, StarIcon } from "../../ui";

export const metadata = { title: "Your package | Seeing Stars Agency" };

const BG = { Launchpad: "#E3F1F8", Liftoff: "#FFF6D6", Spark: "#E4EAF7", Orbit: "#FCE4EF" };

export default async function Result({ searchParams }) {
  const lang = await getLang();
  const t = T[lang];
  const sp = await searchParams;
  const recs = String(sp?.p || "").split(",").filter((p) => PACKAGES.includes(p));
  const name = String(sp?.n || "").slice(0, 60);
  const [main, ...more] = recs.length ? recs : ["Launchpad"];

  const subject = `${main}${name ? ` · ${name}` : ""}`;
  const body = t.fMailBody(name, [main, ...more]);
  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="app app--lined">
      <AppHeader lang={lang} path={`/questionnaire/thanks?p=${recs.join(",")}&n=${encodeURIComponent(name)}`} />
      <main className="container narrow" style={{ gap: 24, paddingTop: 56 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><StarIcon size={64} /></div>
          <div className="kicker" style={{ marginTop: 12 }}>{name ? `${t.fThanks}, ${name}` : t.fThanks}</div>
          <h1 className="h1">{t.fResultTitle}</h1>
        </div>

        <section className="panel stack" style={{ background: BG[main], gap: 12, borderRadius: 24, padding: 32, boxShadow: "10px 10px 0 #F2C94C" }}>
          <div className="tag">{t.fBestFit}</div>
          <div className="disp it" style={{ fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{main}</div>
          <p style={{ margin: 0, fontSize: 19, fontWeight: 600 }}>{pick(lang, PKG_BLURB[main])}</p>
          <p style={{ margin: 0, fontSize: 16 }}>{pick(lang, PKG_WHY[main])}</p>
        </section>

        {more.length > 0 && (
          <section className="panel stack" style={{ gap: 14 }}>
            <h2 className="h2" style={{ fontSize: 24 }}>{t.fAlso}</h2>
            <div className="cards">
              {more.map((p) => (
                <div key={p} className="panel stack" style={{ background: BG[p], padding: 18, borderWidth: 1.5, gap: 6 }}>
                  <div className="disp it" style={{ fontSize: 24, fontWeight: 800 }}>{p}</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{pick(lang, PKG_BLURB[p])}</div>
                  <div style={{ fontSize: 14 }}>{pick(lang, PKG_WHY[p])}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="panel panel--dark stack" style={{ gap: 14, borderRadius: 24, padding: 30 }}>
          <h2 className="h2" style={{ fontSize: 28 }}>{t.fNextTitle}</h2>
          <p style={{ margin: 0, fontSize: 16 }}>{t.fNextText}</p>
          <div className="inline">
            <a href={mailto} className="btn btn--accent" style={{ borderColor: "#F2C94C" }}>{t.fEmailUs}</a>
            <a href="/#packages" className="btn">{t.fSeeIncluded}</a>
          </div>
          <p style={{ margin: 0, fontSize: 14 }}>{CONTACT.email} · <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#F2C94C" }}>{CONTACT.instagramHandle}</a></p>
        </section>
      </main>
    </div>
  );
}
