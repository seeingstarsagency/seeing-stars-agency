// The content calendar (the camera + "Add to calendar"). Shown on the dashboard and on the Astro page;
// both read and write the same calendar_items rows, so they always show the same thing.
// `from` tells the server actions which page to come back to.
import { T } from "../lib/i18n";
import Locked from "./Locked";
import ContentCamera from "./ContentCamera";
import { addCalendarItem, setCalendarStatus, deleteCalendarItem, saveContentScript } from "./dashboard/actions";

const COLOR = { instagram: "#F4A6C9", tiktok: "#9CCBE0", youtube: "#F2C94C", other: "#C9B8F0" };

export default function ContentCalendar({ artist, songs, calendar, isAdmin, lang, today, locked, post, from = "dashboard" }) {
  const t = T[lang];
  const PLATFORMS = [["instagram", "Instagram"], ["tiktok", "TikTok"], ["youtube", "YouTube"], ["other", lang === "es" ? "Otra" : "Other"]];
  const FORMATS = lang === "es"
    ? ["Reel", "Post", "Carrusel", "Story", "Video corto", "En vivo", "Otro"]
    : ["Reel", "Post", "Carousel", "Story", "Short video", "Live", "Other"];
  const ST = { pending: t.stPending, ready: t.stReady, posted: t.stPosted };
  const platformName = Object.fromEntries(PLATFORMS);
  const songTitleById = Object.fromEntries(songs.map((x) => [x.id, x.title]));
  const items = calendar.filter((c) => c.kind === "content").map((c) => ({
    id: c.id, date: c.happens_on, title: c.title, color: COLOR[c.platform] || COLOR.other, status: c.status,
    statusDone: c.status === "posted",
    statuses: [["pending", ST.pending], ["ready", ST.ready], ["posted", ST.posted]],
    canDelete: isAdmin || c.created_by === "artist",
    platform: platformName[c.platform] || c.platform, format: c.format, song: c.song_id ? songTitleById[c.song_id] : null,
    description: c.description || "", script: c.script || "",
  }));
  const hidden = (
    <>
      {isAdmin && <input type="hidden" name="artist_id" value={artist.id} />}
      <input type="hidden" name="from" value={from} />
    </>
  );

  return (
    <section className="panel no-print" id="cal-content" style={{ borderRadius: 24, padding: 30 }}>
      <div className="kicker">{t.camKicker}</div>
      <h2 className="h2" style={{ fontSize: 28 }}>{t.contentCalTitle}</h2>
      <p style={{ margin: "0 0 18px", fontSize: 15 }}>{t.contentCalLead}</p>
      <Locked locked={locked} pkg="Astro" text={t.lockedContent} t={t}>
        <ContentCamera
          items={items}
          lang={lang}
          today={today}
          artistId={isAdmin ? artist.id : null}
          from={from}
          setStatus={setCalendarStatus}
          remove={deleteCalendarItem}
          saveScript={saveContentScript}
          initialId={post || null}
          labels={{ title: t.contentCalTitle, script: t.camScript, scriptTitle: t.camScriptTitle, scriptLead: t.camScriptLead, description: t.contentDesc, descriptionPh: t.contentDescPh, scriptLabel: t.camScriptLabel, scriptPh: t.camScriptPh, save: t.camSave, close: t.roadClose, noScript: t.camNoScript, status: t.calStatus, remove: t.calRemove, empty: t.calEmpty, noImages: t.camNoImages, prevMonth: t.calPrev, nextMonth: t.calNext, prev: t.camPrev, next: t.camNext, menu: t.camMenu, disp: t.camDisp, ok: t.camOk, hint: t.camHint }}
        />
        {!locked && (
          <details className="cal__add">
            <summary>+ {t.calAdd}</summary>
            <form action={addCalendarItem} className="cal__form">
              <input type="hidden" name="kind" value="content" />
              {hidden}
              <label className="field"><span>{t.calDate}</span><input type="date" name="happens_on" className="input" required /></label>
              <label className="field"><span>{t.contentPlatform}</span>
                <select name="platform" className="input" defaultValue="instagram">
                  {PLATFORMS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
                </select>
              </label>
              <label className="field"><span>{t.contentFormat}</span>
                <select name="format" className="input" defaultValue={FORMATS[0]}>
                  {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>
              <label className="field cal__wide"><span>{t.contentIdea}</span><input name="title" className="input" maxLength={160} placeholder={t.contentIdeaPh} required /></label>
              <label className="field cal__wide"><span>{t.contentDesc}</span><textarea name="description" className="input" rows={3} maxLength={2000} placeholder={t.contentDescPh} /></label>
              <label className="field"><span>{t.calSong}</span>
                <select name="song_id" className="input" defaultValue="">
                  <option value="">{t.calNoSong}</option>
                  {songs.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
                </select>
              </label>
              <label className="field"><span>{t.calStatus}</span>
                <select name="status" className="input" defaultValue="pending">
                  <option value="pending">{ST.pending}</option>
                  <option value="ready">{ST.ready}</option>
                  <option value="posted">{ST.posted}</option>
                </select>
              </label>
              <button type="submit" className="btn btn--dark cal__submit">{t.calSave}</button>
            </form>
          </details>
        )}
      </Locked>
    </section>
  );
}
