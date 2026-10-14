import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage } from "../../../../shell";
import { loadArtist } from "../../../../../../lib/artist-data";
import { guideColors, guideFonts, parseColor, splitTitle, lines } from "../../../../../../lib/brand-guide";
import AstroHeader from "../../AstroHeader";
import GUIDE_CSS from "../brand-guide/guide-css";
import VISUAL_CSS from "./visual-css";

export const metadata = { title: "Visual Direction · Astro | Seeing Stars Agency" };
export const dynamic = "force-dynamic";

const T = {
  en: { guide: "Visual Direction", ch1: "Color", ch2: "Type", ch3: "Graphics", ch4: "Moodboards", ch5: "Photography", ch6: "Do and don't", palette: "Your palette", main: "Main", support: "Support", ratio: "How much of each", typeT: "Your typefaces", titles: "Titles", text: "Text", levels: ["Title", "Subtitle", "Body"], titleUse: "Titles, covers, signatures and short lines.", textUse: "Bios, lyrics, credits and anything longer than a line.", sub: "New single · out now", resT: "Your graphic elements", useIn: "Use it for", boardsT: "Your moodboards", photoT: "How we shoot you", dirs: [["photo_light", "Light"], ["photo_place", "Places"], ["photo_pose", "Poses"], ["photo_wardrobe", "Wardrobe"], ["photo_frame", "Framing"]], ddT: "Do and don't", dd: [["Color", "Colors from your palette", "Colors outside the palette"], ["Type", "Your two typefaces", "Mixing many fonts"], ["Light", "Your light", "Direct flash, white backdrop"], ["Filters", "True color", "Filters that shift colors"], ["Your name", "Small name with space", "Giant name over the photo"], ["Graphics", "One or two elements", "Every element at once"]], photo: "Session photo" },
  es: { guide: "Visual Direction", ch1: "Color", ch2: "Tipografía", ch3: "Recursos", ch4: "Moodboards", ch5: "Fotografía", ch6: "Así sí, así no", palette: "Tu paleta", main: "Principales", support: "De apoyo", ratio: "Cuánto de cada uno", typeT: "Tus tipografías", titles: "Títulos", text: "Textos", levels: ["Título", "Subtítulo", "Texto"], titleUse: "Títulos, portadas, firmas y frases cortas.", textUse: "Bios, letras, créditos y todo texto de más de una línea.", sub: "Nuevo sencillo · ya disponible", resT: "Tus recursos gráficos", useIn: "Úsalo en", boardsT: "Tus moodboards", photoT: "Cómo te fotografiamos", dirs: [["photo_light", "Luz"], ["photo_place", "Lugares"], ["photo_pose", "Poses"], ["photo_wardrobe", "Vestuario"], ["photo_frame", "Encuadre"]], ddT: "Así sí, así no", dd: [["Color", "Colores de tu paleta", "Colores fuera de la paleta"], ["Letras", "Tus dos tipografías", "Mezclar varias letras"], ["Luz", "Tu luz", "Flash directo y fondo blanco"], ["Filtros", "Color fiel", "Filtros que cambian los colores"], ["Tu nombre", "Nombre chico y con aire", "Nombre gigante sobre la foto"], ["Recursos", "Uno o dos recursos", "Todos los recursos a la vez"]], photo: "Foto de la sesión" },
};
const STYLES = [["diario", "Diario"], ["editorial", "Editorial"], ["nocturno", "Nocturno"]];
const RATIO = [40, 25, 10, 10, 5, 10];
const NEON = ["#FF00B8", "#00E5FF", "#C6FF00", "#FF6A00", "#7A00FF", "#FFE600"];

const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return `${n >> 16}, ${(n >> 8) & 255}, ${n & 255}`; };

export default async function VisualDirection({ params, searchParams }) {
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
  const Need = ({ what }) => <a href={`${dnaHref}#visual`} className="bg-pending">Pending in the Artist DNA: {what}</a>;
  const meta = (n, ch) => <div className="bg-meta"><span><b>{n}</b> · {ch}</span><span>{artist.name}</span></div>;

  const keys = ["color_main1", "color_main2", "color_main3", "color_sup1", "color_sup2", "color_sup3"];
  const palette = keys.map((k) => parseColor(dna[k]));
  const have = palette.filter(Boolean);
  const Swatch = ({ c, k, small }) => c ? (
    <div className="vd-sw">
      <div className="chip" style={{ background: c.hex, height: small ? 70 : 120 }} />
      <div className="info"><b>{c.name || c.hex}</b><span>{c.hex} · RGB {rgb(c.hex)}</span></div>
    </div>
  ) : <div className="vd-sw"><Need what={k.replace("color_", "").replace("main", "main color ").replace("sup", "support color ")} /></div>;

  const resources = lines(dna.resources).map(splitTitle);
  const boards = lines(dna.moodboards).map(splitTitle);
  const titleName = String(dna.font_title || "").trim();
  const textName = String(dna.font_text || "").trim();
  const photoBg = photoUrl ? { backgroundImage: `url('${photoUrl}')` } : { background: colors.soft2 };

  const ddTiles = [
    [<div key="y" className="vd-tile grid6">{(have.length ? have : palette.map(() => null)).map((c, i) => <i key={i} style={{ background: c?.hex || colors.soft }} />)}</div>,
     <div key="n" className="vd-tile grid6">{NEON.map((c) => <i key={c} style={{ background: c }} />)}</div>],
    [<div key="y" className="vd-tile" style={{ background: "var(--paper)", color: "var(--sec)" }}><span style={{ fontFamily: "var(--display)", fontSize: 24 }}>{artist.name}</span></div>,
     <div key="n" className="vd-tile" style={{ background: "#fff", color: "#111", flexDirection: "column" }}><span style={{ fontFamily: "Impact, sans-serif", fontSize: 20, color: "#e0004d" }}>NEW</span><span style={{ fontFamily: "'Courier New', monospace", fontSize: 14 }}>{artist.name}</span><span style={{ fontFamily: "'Comic Sans MS', cursive", fontSize: 13, color: "#007a5e" }}>out now!!!</span></div>],
    [<div key="y" className="vd-tile photo" style={photoBg} />,
     <div key="n" className="vd-tile photo" style={{ ...photoBg, filter: "brightness(1.45) contrast(1.35) saturate(.35)" }} />],
    [<div key="y" className="vd-tile photo" style={photoBg} />,
     <div key="n" className="vd-tile photo" style={{ ...photoBg, filter: "hue-rotate(150deg) saturate(3)" }} />],
    [<div key="y" className="vd-tile photo" style={photoBg}><span className="nm-small">{artist.name}</span></div>,
     <div key="n" className="vd-tile photo" style={photoBg}><span className="nm-big">{artist.name}</span></div>],
    [<div key="y" className="vd-tile" style={{ background: "var(--paper)" }}><span style={{ fontSize: 34, color: "var(--acc)" }}>★</span></div>,
     <div key="n" className="vd-tile" style={{ background: "var(--paper)", position: "relative" }}>{Array.from({ length: 16 }, (_, i) => <span key={i} style={{ position: "absolute", left: `${(i * 37) % 86}%`, top: `${(i * 53) % 80}%`, fontSize: 14 + (i % 4) * 8, color: ["#540404", "#546883", "#e0004d", "#00a3a3"][i % 4] }}>{["★", "✦", "♥", "✿"][i % 4]}</span>)}</div>],
  ];

  return (
    <AdminShell>
      <AstroHeader artist={artist} photoUrl={photoUrl} current="visual-direction" back={{ href: `/admin/artists/${artist.id}/astro`, label: `${artist.name} · Astro` }} />
      <style>{GUIDE_CSS + VISUAL_CSS}</style>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap" />
      {fonts.href && <link rel="stylesheet" href={fonts.href} />}

      <div className="bg-bar">
        <div>
          <div className="kicker">✦ Visual Direction · preview</div>
          <p style={{ margin: 0, fontSize: 15 }}>Built from the visual section of the <a href={`${dnaHref}#visual`}>Artist DNA</a>: edit it there and this page updates. Only the agency sees it for now.</p>
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
          {meta("01", t.ch1)}
          <h2 className="bg-title">{t.palette}</h2>
          <div><p className="bg-label">{t.main}</p><div className="vd-row">{[0, 1, 2].map((i) => <Swatch key={i} c={palette[i]} k={keys[i]} />)}</div></div>
          <div><p className="bg-label">{t.support}</p><div className="vd-row">{[3, 4, 5].map((i) => <Swatch key={i} c={palette[i]} k={keys[i]} small />)}</div></div>
          {have.length > 0 && (
            <div><p className="bg-label">{t.ratio}</p>
              <div className="vd-ratio">{palette.map((c, i) => c && <i key={i} style={{ background: c.hex, width: `${RATIO[i]}%` }} />)}</div>
            </div>
          )}
        </section>

        <section className="bg-page">
          {meta("02", t.ch2)}
          <h2 className="bg-title">{t.typeT}</h2>
          <div className="bg-grid2">
            <div className="vd-face"><p className="bg-label" style={{ margin: 0 }}>{t.titles}</p><div className="aa" style={{ fontFamily: "var(--display)" }}>Aa</div>{titleName ? <div className="fn">{titleName}</div> : <Need what="typeface for titles" />}<p className="use">{t.titleUse}</p><p style={{ fontFamily: "var(--display)", fontSize: 18 }}>abcdefghijklmnñopqrstuvwxyz</p></div>
            <div className="vd-face"><p className="bg-label" style={{ margin: 0 }}>{t.text}</p><div className="aa" style={{ fontFamily: "var(--text)" }}>Aa</div>{textName ? <div className="fn">{textName}</div> : <Need what="typeface for text" />}<p className="use">{t.textUse}</p><p style={{ fontFamily: "var(--text)", fontSize: 16 }}>ABCDEFGHIJKLMNÑOPQRSTUVWXYZ<br />abcdefghijklmnñopqrstuvwxyz 0123456789</p></div>
          </div>
          <div className="vd-hier">
            <div><span>{t.levels[0]}</span><div style={{ fontFamily: "var(--display)", fontSize: "clamp(28px,4vw,40px)", lineHeight: 1.25, color: "var(--sec)" }}>{dna.signature || artist.name}</div></div>
            <div><span>{t.levels[1]}</span><div style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase" }}>{t.sub}</div></div>
            <div><span>{t.levels[2]}</span><div style={{ fontSize: 16 }}>{dna.essence || artist.name}</div></div>
          </div>
        </section>

        <section className="bg-page">
          {meta("03", t.ch3)}
          <h2 className="bg-title">{t.resT}</h2>
          {resources.length ? (
            <div className="vd-res">
              {resources.map((r, i) => (
                <div key={i} className="vd-rs">
                  <div className="vis" style={{ background: [colors.soft, colors.soft2, colors.paper][i % 3] }}><span>{["★", "✎", "✦", "✉", "◐"][i % 5]}</span></div>
                  <b>{r.name}</b>{r.text && <p>{t.useIn}: {r.text}</p>}
                </div>
              ))}
            </div>
          ) : <Need what="graphic elements" />}
        </section>

        <section className="bg-page">
          {meta("04", t.ch4)}
          <h2 className="bg-title">{t.boardsT}</h2>
          {boards.length ? boards.map((b, i) => (
            <div key={i}>
              <div className="vd-board-h"><h3>{b.name}</h3>{b.text && <p>{b.text}</p>}</div>
              <div className="vd-board">
                <div className="it" style={{ gridColumn: "span 2", gridRow: "span 3", ...(photoUrl ? { backgroundImage: `url('${photoUrl}')`, filter: i % 2 ? "grayscale(1)" : "none" } : { background: colors.soft2 }) }} />
                <div className="it note" style={{ gridColumn: "span 2", gridRow: "span 1" }}>{dna.signature || b.name}</div>
                {palette.map((c, j) => c && <div key={j} className="it dot" style={{ background: c.hex }} />)}
                <div className="it" style={{ gridColumn: "span 2", gridRow: "span 2", background: colors.soft }}><span>{b.text || b.name}</span></div>
              </div>
            </div>
          )) : <Need what="moodboards" />}
          <p style={{ fontSize: 13, color: "var(--muted)" }}>The session photos will fill these boards once the creative team uploads them.</p>
        </section>

        <section className="bg-page">
          {meta("05", t.ch5)}
          <h2 className="bg-title">{t.photoT}</h2>
          <div className="vd-dirs">
            {t.dirs.map(([k, label]) => <div key={k} className="vd-dir"><b>{label}</b>{dna[k] ? <p>{dna[k]}</p> : <Need what={label.toLowerCase()} />}</div>)}
          </div>
        </section>

        <section className="bg-page">
          {meta("06", t.ch6)}
          <h2 className="bg-title">{t.ddT}</h2>
          <div className="vd-dd">
            {t.dd.map(([lab, y, n], i) => (
              <div key={lab} className="vd-pair">
                <span className="lab">{lab}</span>
                <div className="vd-cell ok">{ddTiles[i][0]}<small>✓ {y}</small></div>
                <div className="vd-cell bad">{ddTiles[i][1]}<small>✕ {n}</small></div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-page bg-closing">
          {photoUrl ? <figure className="bg-ph"><img src={photoUrl} alt="" /></figure> : <figure className="bg-ph empty"><span>{t.photo}</span></figure>}
          <div className="bg-cl">
            {dna.signature && <p className="sig">{dna.signature}</p>}
            <p className="nm">{artist.name}</p>
            <p className="bg-label">{t.guide} · {new Date().getFullYear()}</p>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
