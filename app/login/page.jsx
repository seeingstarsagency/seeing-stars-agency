import { getLang, T } from "../../lib/i18n";
import { AppHeader, StarIcon } from "../ui";
import LoginForm from "./LoginForm";
import { browserConfig } from "../../lib/env";

export const metadata = { title: "Login | Seeing Stars Agency" };

export default async function Login() {
  const lang = await getLang();
  const t = T[lang];
  return (
    <div className="app app--lined" style={{ display: "flex", flexDirection: "column" }}>
      <AppHeader lang={lang} path="/login" />
      <main style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "48px 24px", position: "relative" }}>
        <StarIcon size={90} fill="#F4A6C9" style={{ position: "absolute", left: "16%", top: 40 }} />
        <StarIcon size={56} fill="#9CCBE0" style={{ position: "absolute", right: "18%", bottom: 40 }} />
        <div className="panel" style={{ position: "relative", width: "100%", maxWidth: 440, borderRadius: 24, padding: "40px 36px", boxShadow: "10px 10px 0 #F2C94C" }}>
          <div className="kicker">{t.lKicker}</div>
          <h1 className="h1 it" style={{ fontSize: 40 }}>{t.lTitle}</h1>
          <p style={{ margin: "0 0 28px", fontSize: 16, lineHeight: 1.55 }}>{t.lLead}</p>
          <LoginForm t={{ email: t.email, password: t.password, login: t.login, lBad: t.lBad, lSent: t.lSent, lForgot: t.lForgot, lMagic: t.lMagic }} sb={browserConfig()} />
          <p style={{ margin: "24px 0 0", paddingTop: 18, borderTop: "1.5px dashed #1E1B2E", fontSize: 14, lineHeight: 1.55 }}>
            {t.lNotClient} <a href="/questionnaire">{t.lStart}</a>. {t.lAccounts}
          </p>
        </div>
      </main>
    </div>
  );
}
