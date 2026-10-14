import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage } from "../../../../shell";
import { loadArtist } from "../../../../../../lib/artist-data";
import { guideColors, guideFonts, splitTitle, parseValue, list } from "../../../../../../lib/brand-guide";
import AstroHeader from "../../AstroHeader";
import GUIDE_CSS from "./guide-css";

export const metadata = { title: "Brand Guide · Astro | Seeing Stars Agency" };
export const dynamic = "force-dynamic";

const T = {
  en: { guide: "Brand Guide", story: "Your story", values: "Your values", audience: "Your audience", brief: "Artist brief", scene: "Your sound", represent: "How you show up", defend: "What you stand for", people: "Who listens to you", steps: ["Before", "The moment", "Today"], diff: "What sets you apart", genre: "Genre and language", refs: "Sounds close to", themes: "You sing about", yes: "Yes", no: "No", personality: "Your personality", is: "You are", isnt: "You are not", why: "Why they connect with you", where: "Where they live", main: "Main listener", second: "Second listener", who: "Who they are", day: "Their moment", listens: "What they listen to", feels: "How you make them feel", photo: "Session photo" },
  es: { guide: "Brand Guide", story: "Tu historia", values: "Tus valores", audience: "Tu audiencia", brief: "Artist brief", scene: "Tu sonido", represent: "Cómo te representas", defend: "Lo que defiendes", people: "Quién te escucha", steps: ["Antes", "El momento", "Hoy"], diff: "Tu diferencia", genre: "Género e idioma", refs: "Suenas cerca de", themes: "Cantas sobre", yes: "Sí", no: "No", personality: "Tu personalidad", is: "Eres", isnt: "No eres", why: "Por qué conectan contigo", where: "Dónde viven", main: "Oyente principal", second: "Oyente secundario", who: "Quién es", day: "Su momento", listens: "Qué escucha", feels: "Qué siente contigo", photo: "Foto de la sesión" },
};
const STYLES = [["diario", "Diario"], ["editorial", "Editorial"], ["nocturno", "Nocturno"]];

export default async function BrandGuide({ params, searchParams }) {
  const { supabase } = await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const data = await loadArtist(supabase, id);
  if (!data) notFound();
  const { artist, photoUrl } = data;
  const dna = artist.artist_dna || {};
  const dnaHref = `/admin/artists/${artist.id}/astro/dna`;
  const lang = sp?.lang === "es" || sp?.lang === "en" ? sp.lang : artist.lang === "es" ? "es" : "en";
  const style = STYLES.some(([k]) => k === sp?.style) ? sp.style : STYLES.some(([k]) => k === dna.style) ? dna.style : "diario";
  const t = T[lang];
  const colors = guideColors(dna);
  const fonts = guideFonts(dna);
  const vars = {
    "--paper": colors.paper, "--ink": colors.ink, "--sec": colors.sec, "--acc": colors.acc, "--soft": colors.soft, "--soft2": colors.soft2,
    "--display": fonts.title, "--text": fonts.text, "--script": `"Caveat", cursive`,
  };
  const link = (q) => `?${new URLSearchParams({ style, lang, ...q })}`;

  // Something the DNA doesn't have yet: a dashed note with a link to fill it in.
  const Need = ({ what, at }) => <a href={`${dnaHref}#${at}`} className="bg-pending">Pending in the Artist DNA: {what}</a>;
  const Text = ({ v, what, at, as: Tag = "p", className }) => (v ? <Tag className={className}>{v}</Tag> : <Need what={what} at={at} />);
  const Photo = ({ cls = "" }) => photoUrl
    ? <figure className={`bg-ph framed ${cls}`}><img src={photoUrl} alt="" /></figure>
    : <figure className="bg-ph empty"><span>{t.photo}</span></figure>;

  const arch = [dna.arch1, dna.arch2, dna.arch3].map(splitTitle);
  const values = [dna.value1, dna.value2, dna.value3].map(parseValue);
  const traits = list(dna.traits);
  const themes = list(dna.themes);
  const where = list(dna.where);
  const people = [1, 2].map((n) => ({
    name: dna[`aud${n}_name`], who: dna[`aud${n}_who`], day: dna[`aud${n}_moment`], listens: dna[`aud${n}_listens`], feels: dna[`aud${n}_feels`],
  }));
  const steps = [dna.story_before, dna.story_moment, dna.story_today];
  const meta = (n, ch) => <div className="bg-meta"><span><b>{n}</b> · {ch}</span><span>{artist.name}</span></div>;

  return (
    <AdminShell>
      <AstroHeader artist={artist} photoUrl={photoUrl} current="brand-guide" back={{ href: `/admin/artists/${artist.id}/astro`, label: `${artist.name} · Astro` }} />
      <style>{GUIDE_CSS}</style>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap" />
      {fonts.href && <link rel="stylesheet" href={fonts.href} />}

      <div className="bg-bar">
        <div>
          <div className="kicker">✦ Brand Guide · preview</div>
          <p style={{ margin: 0, fontSize: 15 }}>Built from the <a href={dnaHref}>Artist DNA</a>: edit it there and this page updates. Only the agency sees it for now.</p>
        </div>
        <div className="inline">
          <span className="muted" style={{ fontSize: 13 }}>Style</span>
          {STYLES.map(([k, l]) => <a key={k} href={link({ style: k })} className={`small-btn${style === k ? " small-btn--dark" : ""}`} style={{ textDecoration: "none" }}>{l}</a>)}
          <span className="muted" style={{ fontSize: 13, marginLeft: 8 }}>Language</span>
          {[["en", "English"], ["es", "Español"]].map(([k, l]) => <a key={k} href={link({ lang: k })} className={`small-btn${lang === k ? " small-btn--dark" : ""}`} style={{ textDecoration: "none" }}>{l}</a>)}
        </div>
      </div>

      <div className={`bg-book ${style}`} style={vars} lang={lang}>
        <section className="bg-page bg-cover">
          {photoUrl ? <div className="bg-bgimg"><img src={photoUrl} alt="" /></div> : <div className="bg-bgimg empty" />}
          <div className="bg-cv"><h1>{artist.name}</h1><span>{t.guide}</span></div>
        </section>

        <section className="bg-page">
          {meta("01", t.story)}
          <div className="bg-cols">
            <Photo />
            <div className="bg-stack">
              <h2 className="bg-title">{t.brief}</h2>
              <Text v={dna.essence} what="essence" at="story" className="bg-lead" />
              <div className="bg-body">
                {steps.some(Boolean) ? steps.filter(Boolean).map((s, i) => <p key={i}>{s}</p>) : <Need what="story (before, the moment, today)" at="story" />}
              </div>
            </div>
          </div>
          <span className="bg-star" style={{ top: 22, right: 28 }}>★</span>
        </section>

        <section className="bg-page">
          {meta("01", t.story)}
          <h2 className="bg-title">{t.scene}</h2>
          <div className="bg-timeline">
            {steps.map((s, i) => <div key={i} className="bg-step"><b>{t.steps[i]}</b>{s ? <p>{s}</p> : <Need what={t.steps[i].toLowerCase()} at="story" />}</div>)}
          </div>
          {dna.difference ? <div className="bg-callout">{dna.difference}</div> : <Need what="what sets them apart" at="story" />}
          <div className="bg-grid3">
            <div><p className="bg-label">{t.genre}</p><Text v={dna.genre_lang} what="genre and language" at="story" /></div>
            <div><p className="bg-label">{t.refs}</p><Text v={dna.references} what="references" at="story" className="bg-names" /></div>
            <div><p className="bg-label">{t.themes}</p>{themes.length ? <div className="bg-chips">{themes.map((x) => <span key={x} className="bg-chip">{x}</span>)}</div> : <Need what="themes" at="story" />}</div>
          </div>
        </section>

        <section className="bg-page">
          {meta("02", t.values)}
          <h2 className="bg-title">{t.represent}</h2>
          <div className="bg-arche">
            {arch.map((a, i) => (
              <div key={i} className="bg-arc">
                <span className="n">0{i + 1}</span>
                {a ? <><h3>{a.name}</h3>{a.text && <p>{a.text}</p>}</> : <Need what={`archetype ${i + 1}`} at="values" />}
              </div>
            ))}
          </div>
          <span className="bg-star" style={{ bottom: 26, right: 34 }}>✦</span>
        </section>

        <section className="bg-page">
          {meta("02", t.values)}
          <div className="bg-cols rev">
            <div className="bg-stack">
              <h2 className="bg-title">{t.defend}</h2>
              <div className="bg-values">
                {values.map((v, i) => v ? (
                  <div key={i} className="bg-value"><h3>{v.name}</h3>{v.yes && <p className="y"><b>{t.yes}:</b> {v.yes}</p>}{v.no && <p className="no"><b>{t.no}:</b> {v.no}</p>}</div>
                ) : <Need key={i} what={`value ${i + 1}`} at="values" />)}
              </div>
              <div>
                <p className="bg-label">{t.personality}</p>
                {traits.length ? <div className="bg-chips" style={{ marginBottom: 10 }}>{traits.map((x) => <span key={x} className="bg-chip">{x}</span>)}</div> : <Need what="3 traits" at="values" />}
                <div className="bg-isnot">
                  {dna.is && <div><b>{t.is}</b> {dna.is}</div>}
                  {dna.isnt && <div><b>{t.isnt}</b> {dna.isnt}</div>}
                </div>
              </div>
            </div>
            <Photo cls="r" />
          </div>
        </section>

        <section className="bg-page">
          {meta("03", t.audience)}
          <h2 className="bg-title">{t.people}</h2>
          <div className="bg-people">
            {people.map((p, i) => (
              <div key={i} className="bg-person">
                <div className="t">{i ? t.second : t.main}</div>
                {p.name ? <h3>{p.name}</h3> : <Need what={`${i ? "second" : "main"} listener`} at="audience" />}
                <dl>
                  {p.who && <div><dt>{t.who}</dt><dd>{p.who}</dd></div>}
                  {p.day && <div><dt>{t.day}</dt><dd>{p.day}</dd></div>}
                  {p.listens && <div><dt>{t.listens}</dt><dd>{p.listens}</dd></div>}
                  {p.feels && <div><dt>{t.feels}</dt><dd>{p.feels}</dd></div>}
                </dl>
              </div>
            ))}
          </div>
          <div className="bg-grid2">
            <div><p className="bg-label">{t.why}</p><Text v={dna.why_connect} what="why they connect" at="audience" className="bg-body" /></div>
            <div><p className="bg-label">{t.where}</p>{where.length ? <div className="bg-chips">{where.map((x) => <span key={x} className="bg-chip">{x}</span>)}</div> : <Need what="where they live" at="audience" />}</div>
          </div>
        </section>

        <section className="bg-page bg-closing">
          {photoUrl ? <figure className="bg-ph"><img src={photoUrl} alt="" /></figure> : <figure className="bg-ph empty"><span>{t.photo}</span></figure>}
          <div className="bg-cl">
            {dna.signature ? <p className="sig">{dna.signature}</p> : <Need what="signature line" at="story" />}
            <p className="nm">{artist.name}</p>
            <p className="bg-label">{t.guide} · {new Date().getFullYear()}</p>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
