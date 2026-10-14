import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage } from "../../../../shell";
import { loadArtist } from "../../../../../../lib/artist-data";
import { guideColors, guideFonts, splitTitle, list, lines } from "../../../../../../lib/brand-guide";
import AstroHeader from "../../AstroHeader";
import GUIDE_CSS from "../brand-guide/guide-css";
import VOICE_CSS from "./voice-css";

export const metadata = { title: "Voice Guide · Astro | Seeing Stars Agency" };
export const dynamic = "force-dynamic";

const T = {
  en: { guide: "Voice Guide", ch1: "Your message", ch2: "Your tone", ch3: "Your language", ch4: "In practice", oneLine: "Your voice in one line", messages: "Your 3 messages", msgUse: "Everything you post carries at least one of these three.", tone: "How you sound", soundsLike: "You sound like", notLike: "You don't sound like", metaphors: "Your metaphors", useIn: "Use it for", sig: "Your signature line", device: "Your device", words: "Your words", yes: "You say", no: "You don't say", rules: "Format rules", lang: "Language", case: "Capitals", emoji: "Emojis", punct: "Punctuation", tags: "Hashtags", posts: "How you write", ok: "Like this", bad: "Not like this", kinds: ["Release", "Reply to a fan", "Process"], scales: [["Formal", "Casual"], ["Serious", "Playful"], ["Reserved", "Open"], ["Poetic", "Direct"]], photo: "Session photo" },
  es: { guide: "Voice Guide", ch1: "Tu mensaje", ch2: "Tu tono", ch3: "Tu lenguaje", ch4: "En la práctica", oneLine: "Tu voz en una frase", messages: "Tus 3 mensajes", msgUse: "Todo lo que publicas lleva al menos uno de estos tres.", tone: "Cómo suenas", soundsLike: "Suenas como", notLike: "No suenas como", metaphors: "Tus metáforas", useIn: "Úsala en", sig: "Tu frase firma", device: "Tu recurso", words: "Tus palabras", yes: "Sí dices", no: "No dices", rules: "Reglas de forma", lang: "Idioma", case: "Mayúsculas", emoji: "Emojis", punct: "Puntuación", tags: "Hashtags", posts: "Así escribes", ok: "Así sí", bad: "Así no", kinds: ["Lanzamiento", "Respuesta a un fan", "Proceso"], scales: [["Formal", "Casual"], ["Serio", "Divertido"], ["Reservado", "Abierto"], ["Poético", "Directo"]], photo: "Foto de la sesión" },
};
const STYLES = [["diario", "Diario"], ["editorial", "Editorial"], ["nocturno", "Nocturno"]];

export default async function VoiceGuide({ params, searchParams }) {
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

  const Need = ({ what }) => <a href={`${dnaHref}#voice`} className="bg-pending">Pending in the Artist DNA: {what}</a>;
  const Photo = () => photoUrl
    ? <figure className="bg-ph framed"><img src={photoUrl} alt="" /></figure>
    : <figure className="bg-ph empty"><span>{t.photo}</span></figure>;
  const meta = (n, ch) => <div className="bg-meta"><span><b>{n}</b> · {ch}</span><span>{artist.name}</span></div>;

  const msgs = [dna.msg1, dna.msg2, dna.msg3];
  const scales = [dna.tone_casual, dna.tone_playful, dna.tone_open, dna.tone_direct].map((v) => (v === undefined || v === "" ? null : Number(v)));
  const metaphors = lines(dna.metaphors).map(splitTitle);
  const yesW = list(dna.words_yes);
  const noW = list(dna.words_no);
  const rules = [["lang", dna.rule_lang], ["case", dna.rule_case], ["emoji", dna.rule_emoji], ["punct", dna.rule_punct], ["tags", dna.rule_tags]];
  const posts = [["launch", 0], ["reply", 1], ["process", 2]].map(([k, i]) => ({ kind: t.kinds[i], yes: dna[`post_${k}_yes`], no: dna[`post_${k}_no`] }));
  const handle = artist.name;
  const avatar = photoUrl
    ? <span className="vg-av" style={{ backgroundImage: `url('${photoUrl}')` }} />
    : <span className="vg-av">{artist.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>;
  const Post = ({ text, ok }) => (
    <div className={`vg-post ${ok ? "ok" : "bad"}`}>
      <div className="vg-who">{avatar}<span>{handle}</span></div>
      {text ? <p>{text}</p> : <Need what={`post example (${ok ? "like this" : "not like this"})`} />}
      <span className="vg-v">{ok ? `✓ ${t.ok}` : `✕ ${t.bad}`}</span>
    </div>
  );

  return (
    <AdminShell>
      <AstroHeader artist={artist} photoUrl={photoUrl} current="voice-guide" back={{ href: `/admin/artists/${artist.id}/astro`, label: `${artist.name} · Astro` }} />
      <style>{GUIDE_CSS + VOICE_CSS}</style>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap" />
      {fonts.href && <link rel="stylesheet" href={fonts.href} />}

      <div className="bg-bar">
        <div>
          <div className="kicker">✦ Voice Guide · preview</div>
          <p style={{ margin: 0, fontSize: 15 }}>Built from the voice section of the <a href={`${dnaHref}#voice`}>Artist DNA</a>: edit it there and this page updates. Only the agency sees it for now.</p>
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
          <div className="bg-cols">
            <Photo />
            <div className="bg-stack">
              <p className="bg-label">{t.oneLine}</p>
              {dna.voice_line ? <p className="bg-lead">{dna.voice_line}</p> : <Need what="their voice in one line" />}
              <h2 className="bg-title" style={{ marginTop: 8 }}>{t.messages}</h2>
              <div className="vg-msgs">
                {msgs.map((m, i) => (
                  <div key={i} className="vg-msg"><span className="n">{i + 1}</span>{m ? <p>{m}</p> : <Need what={`key message ${i + 1}`} />}</div>
                ))}
              </div>
              <p style={{ fontSize: 14, color: "var(--muted)" }}>{t.msgUse}</p>
            </div>
          </div>
          <span className="bg-star" style={{ top: 22, right: 28 }}>★</span>
        </section>

        <section className="bg-page">
          {meta("02", t.ch2)}
          <h2 className="bg-title">{t.tone}</h2>
          <div className="bg-cols" style={{ alignItems: "start" }}>
            <div className="vg-scales">
              {t.scales.map(([l, r], i) => (
                <div key={l}>
                  <div className="vg-ends"><span>{l}</span><span>{r}</span></div>
                  {scales[i] === null ? <Need what={`tone · ${l.toLowerCase()} → ${r.toLowerCase()}`} /> : (
                    <div className="vg-track" role="img" aria-label={`${l} to ${r}: ${scales[i]} of 100`}><i style={{ left: `${Math.max(0, Math.min(100, scales[i]))}%` }} /></div>
                  )}
                </div>
              ))}
            </div>
            <div className="bg-grid2">
              <div className="vg-box"><b>{t.soundsLike}</b>{dna.sounds_like ? <p>{dna.sounds_like}</p> : <Need what="sounds like" />}</div>
              <div className="vg-box"><b>{t.notLike}</b>{dna.not_like ? <p>{dna.not_like}</p> : <Need what="doesn't sound like" />}</div>
            </div>
          </div>
        </section>

        <section className="bg-page">
          {meta("02", t.ch2)}
          <h2 className="bg-title">{t.metaphors}</h2>
          {metaphors.length ? (
            <div className="bg-grid2">
              {metaphors.map((m, i) => <div key={i} className="vg-mt"><h3>{m.name}</h3>{m.text && <p>{t.useIn}: {m.text}</p>}</div>)}
            </div>
          ) : <Need what="metaphors" />}
          <div className="vg-sig">
            <p className="bg-label">{t.sig}</p>
            {dna.signature ? <div className="big">{dna.signature}</div> : <Need what="signature line" />}
            <p className="bg-label" style={{ marginTop: 10 }}>{t.device}</p>
            {dna.device ? <p>{dna.device}</p> : <Need what="their device" />}
          </div>
          <span className="bg-star" style={{ bottom: 24, left: 30 }}>✦</span>
        </section>

        <section className="bg-page">
          {meta("03", t.ch3)}
          <h2 className="bg-title">{t.words}</h2>
          <div className="bg-grid2">
            <div className="vg-words yes"><p className="bg-label">{t.yes}</p>{yesW.length ? <div className="bg-chips">{yesW.map((w) => <span key={w}>{w}</span>)}</div> : <Need what="words they use" />}</div>
            <div className="vg-words no"><p className="bg-label">{t.no}</p>{noW.length ? <div className="bg-chips">{noW.map((w) => <span key={w}>{w}</span>)}</div> : <Need what="words they don't use" />}</div>
          </div>
          <div>
            <p className="bg-label">{t.rules}</p>
            <div className="vg-rules">
              {rules.map(([k, v]) => <div key={k} className="vg-box"><b>{t[k]}</b>{v ? <p>{v}</p> : <Need what={`rule · ${t[k].toLowerCase()}`} />}</div>)}
            </div>
          </div>
        </section>

        <section className="bg-page">
          {meta("04", t.ch4)}
          <h2 className="bg-title">{t.posts}</h2>
          <div className="vg-pairs">
            {posts.map((p) => (
              <div key={p.kind} className="vg-pair"><b>{p.kind}</b><Post text={p.yes} ok /><Post text={p.no} /></div>
            ))}
          </div>
        </section>

        <section className="bg-page bg-closing">
          {photoUrl ? <figure className="bg-ph"><img src={photoUrl} alt="" /></figure> : <figure className="bg-ph empty"><span>{t.photo}</span></figure>}
          <div className="bg-cl">
            {dna.signature ? <p className="sig">{dna.signature}</p> : <Need what="signature line" />}
            <p className="nm">{artist.name}</p>
            <p className="bg-label">{t.guide} · {new Date().getFullYear()}</p>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
