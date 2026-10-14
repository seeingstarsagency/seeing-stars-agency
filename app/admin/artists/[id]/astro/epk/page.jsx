import { notFound } from "next/navigation";
import { AdminShell, requireAdminPage } from "../../../../shell";
import { loadArtist } from "../../../../../../lib/artist-data";
import { guideColors, guideFonts, splitTitle, lines } from "../../../../../../lib/brand-guide";
import { pickBio } from "../../../../../../lib/bios";
import { fmtDate } from "../../../../../ui";
import AstroHeader from "../../AstroHeader";
import GUIDE_CSS from "../brand-guide/guide-css";
import EPK_CSS from "./epk-css";

export const metadata = { title: "EPK · Astro | Seeing Stars Agency" };
export const dynamic = "force-dynamic";

const T = {
  en: { epk: "Press kit", about: "About", release: "Latest release", listen: "Listen", numbers: "By the numbers", listeners: "Spotify listeners", plays: "YouTube plays", ig: "Instagram followers", tt: "TikTok followers", asOf: "As of", highlights: "Highlights", shows: "Live", press: "Press", photos: "Press photos · hi-res download", links: "Listen and follow", contact: "Booking and press", photo: "Press photo" },
  es: { epk: "Press kit", about: "Sobre el artista", release: "Último lanzamiento", listen: "Escuchar", numbers: "En números", listeners: "oyentes en Spotify", plays: "reproducciones en YouTube", ig: "seguidores en Instagram", tt: "seguidores en TikTok", asOf: "Al", highlights: "Logros", shows: "En vivo", press: "Prensa", photos: "Fotos de prensa · descarga en alta", links: "Escuchar y seguir", contact: "Booking y prensa", photo: "Foto de prensa" },
};
const STYLES = [["diario", "Diario"], ["editorial", "Editorial"], ["nocturno", "Nocturno"]];

export default async function Epk({ params, searchParams }) {
  const { supabase } = await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const data = await loadArtist(supabase, id);
  if (!data) notFound();
  const { artist, photoUrl, songs } = data;
  const dna = artist.artist_dna || {};
  const base = `/admin/artists/${artist.id}/astro`;
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
  const Need = ({ what, href = `${base}/dna#facts` }) => <a href={href} className="bg-pending">Pending: {what}</a>;

  const line = pickBio(dna, "line", lang);
  const short = pickBio(dna, "short", lang);
  const title = String(artist.single_title || "").trim().toLowerCase();
  const song = (songs || []).find((s) => s.title?.trim().toLowerCase() === title) || (songs || []).find((s) => s.is_project) || (songs || [])[0] || null;
  const releaseTitle = song?.title || artist.single_title || "";
  const releaseDate = song?.release_date || artist.release_date || "";
  const listenUrl = song?.spotify_url || song?.link || "";
  const nums = [[dna.listeners, t.listeners], [dna.plays, t.plays], [dna.followers_ig, t.ig], [dna.followers_tt, t.tt]].filter(([v]) => v);
  const quotes = lines(dna.press_quotes).map(splitTitle);
  const ach = lines(dna.achievements);
  const shows = lines(dna.shows);
  const answers = artist.astro_answers || {};
  const intake = artist.intake_answers || {};
  const socials = (answers.socials?.length ? answers.socials : intake.socials || []).filter((s) => s.url);
  const platforms = [["Spotify", intake.spotify_url], ["Apple Music", intake.apple_url]].filter(([, u]) => u);
  const allLinks = [...platforms.map(([name, url]) => ({ name, url })), ...socials];
  const email = dna.booking_email || answers.booking_email || "";

  return (
    <AdminShell>
      <AstroHeader artist={artist} photoUrl={photoUrl} current="epk" back={{ href: base, label: `${artist.name} · Astro` }} />
      <style>{GUIDE_CSS + EPK_CSS}</style>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap" />
      {fonts.href && <link rel="stylesheet" href={fonts.href} />}

      <div className="bg-bar">
        <div>
          <div className="kicker">✦ EPK · one page · preview</div>
          <p style={{ margin: 0, fontSize: 15 }}>Built from the <a href={`${base}/bios`}>bios</a>, the facts in the <a href={`${base}/dna#facts`}>Artist DNA</a> and their songs. Only parts with real data show to the press; the dashed ones are for you.</p>
        </div>
        <div className="inline">
          <span className="muted" style={{ fontSize: 13 }}>Style</span>
          {STYLES.map(([k, l]) => <a key={k} href={link({ style: k })} className={`small-btn${style === k ? " small-btn--dark" : ""}`} style={{ textDecoration: "none" }}>{l}</a>)}
          <span className="muted" style={{ fontSize: 13, marginLeft: 8 }}>Language</span>
          {[["en", "English"], ["es", "Español"]].map(([k, l]) => <a key={k} href={link({ lang: k })} className={`small-btn${lang === k ? " small-btn--dark" : ""}`} style={{ textDecoration: "none" }}>{l}</a>)}
        </div>
      </div>

      <div className={`bg-book ${style}`} style={vars} lang={lang}>
        <section className="bg-page ep-page">
          <div className="ep-hero">
            <div className="img" style={photoUrl ? { backgroundImage: `url('${photoUrl}')` } : { background: colors.soft2 }} />
            <div className="txt">
              <span className="kick">{t.epk} · {new Date().getFullYear()}</span>
              <h1>{artist.name}</h1>
              {line ? <p className="line">{line}</p> : <Need what="one-line bio" href={`${base}/bios`} />}
              {short ? <p className="short">{short}</p> : <Need what="short bio" href={`${base}/bios`} />}
            </div>
          </div>

          <div className="bg-grid2">
            <div className="ep-card">
              <p className="bg-label">{t.release}</p>
              {releaseTitle ? (
                <div className="ep-rel">
                  {song?.artwork_url ? <img src={song.artwork_url} alt="" /> : <div className="cover"><b>{releaseTitle}</b></div>}
                  <div>
                    <h3>{releaseTitle}</h3>
                    {releaseDate && <p className="muted-t">{fmtDate(releaseDate, lang)}</p>}
                    {listenUrl ? <a href={listenUrl} target="_blank" rel="noopener noreferrer" className="ep-listen">{t.listen} →</a> : <span className="ep-listen">{t.listen} →</span>}
                  </div>
                </div>
              ) : <Need what="a song (add it in the artist's Songs)" href={`/admin/artists/${artist.id}#songs`} />}
            </div>
            <div className="ep-card">
              <p className="bg-label">{t.numbers}</p>
              {nums.length ? (
                <>
                  <div className="ep-nums">{nums.map(([v, l]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}</div>
                  {dna.measured_on ? <p className="muted-t" style={{ marginTop: 8 }}>{t.asOf} {fmtDate(dna.measured_on, lang)}</p> : <Need what="date the numbers were measured" />}
                </>
              ) : <Need what="numbers (Spotify, YouTube, followers)" />}
            </div>
          </div>

          <div className="bg-grid2">
            <div className="ep-card">
              <p className="bg-label">{t.press}</p>
              {quotes.length ? <div className="ep-quotes">{quotes.map((q, i) => <div key={i}><p>&ldquo;{q.name.replace(/^["“]|["”]$/g, "")}&rdquo;</p>{q.text && <cite>{q.text}</cite>}</div>)}</div> : <p className="muted-t">—</p>}
            </div>
            <div className="ep-card">
              {ach.length > 0 && <><p className="bg-label">{t.highlights}</p><ul className="ep-list">{ach.map((x) => <li key={x}>{x}</li>)}</ul></>}
              {shows.length > 0 && <><p className="bg-label" style={{ marginTop: ach.length ? 14 : 0 }}>{t.shows}</p><ul className="ep-list">{shows.map((x) => <li key={x}>{x}</li>)}</ul></>}
              {!ach.length && !shows.length && <Need what="achievements or shows (leave empty if there are none yet)" />}
            </div>
          </div>

          <div>
            <p className="bg-label">{t.photos}</p>
            <div className="ep-photos">
              {[0, 1, 2].map((i) => photoUrl
                ? <div key={i} className="ph" style={{ backgroundImage: `url('${photoUrl}')`, filter: i === 1 ? "grayscale(1)" : "none" }} />
                : <div key={i} className="ph empty">{t.photo}</div>)}
            </div>
            <p className="muted-t" style={{ marginTop: 6 }}>Uses the profile photo until the session photos are uploaded.</p>
          </div>

          <div className="ep-foot">
            <div>
              <p className="bg-label">{t.links}</p>
              {allLinks.length ? <div className="bg-chips">{allLinks.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="ep-chip">{s.name}</a>)}</div> : <Need what="links (from the questionnaire)" href={`${base}/questionnaire`} />}
            </div>
            <div className="ep-contact">
              <p className="bg-label">{t.contact}</p>
              {email ? <b>{email}</b> : <Need what="booking email" />}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
