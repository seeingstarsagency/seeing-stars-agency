// Shared pieces for the app pages (questionnaire, login, dashboard, admin, report).
import { T } from "../lib/i18n";

const POINTS =
  "50,0 61,30 85,15 70,39 100,50 70,61 85,85 61,70 50,100 39,70 15,85 30,61 0,50 30,39 15,15 39,30";

export function StarIcon({ size = 28, fill = "#F2C94C", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={style}>
      <polygon points={POINTS} fill={fill} />
    </svg>
  );
}

export function LangToggle({ lang, path, dark }) {
  const base = dark ? "lang lang--dark" : "lang";
  return (
    <div className={base} role="group" aria-label={lang === "es" ? "Idioma" : "Language"}>
      <a href={`/lang?to=en&next=${encodeURIComponent(path)}`} aria-current={lang === "en" ? "true" : undefined}>EN</a>
      <a href={`/lang?to=es&next=${encodeURIComponent(path)}`} aria-current={lang === "es" ? "true" : undefined}>ES</a>
    </div>
  );
}

export function AppHeader({ lang, path, dark = false, right = null, badge = null }) {
  return (
    <header className={dark ? "apphead apphead--dark" : "apphead"}>
      <div className="apphead__inner">
        <a href="/" className="apphead__logo">
          <StarIcon size={28} />
          <span className="disp"><span className="it">Seeing Stars</span> Agency</span>
          {badge && <span className="badge">{badge}</span>}
        </a>
        <div className="apphead__right">
          <LangToggle lang={lang} path={path} dark={dark} />
          {right}
        </div>
      </div>
    </header>
  );
}

export function LogoutButton({ lang }) {
  return (
    <form action="/auth/logout" method="post">
      <button type="submit" className="linkbtn">{T[lang].logout}</button>
    </form>
  );
}

export function fmtDate(d, lang) {
  if (!d) return "—";
  const date = new Date(d.length === 10 ? d + "T12:00:00" : d);
  return date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { day: "numeric", month: "short", year: "numeric" });
}
