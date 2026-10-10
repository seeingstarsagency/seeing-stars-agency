import { loadQuoteByToken } from "../load";
import { QT, money, halves } from "../../../lib/quote-send";
import { StarIcon } from "../../ui";
import QuoteCard from "./QuoteCard";
import AcceptForm from "./AcceptForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your quote | Seeing Stars Agency", robots: { index: false, follow: false } };

function Head() {
  return (
    <header className="apphead">
      <div className="apphead__inner">
        <a href="/" className="apphead__logo"><StarIcon size={28} /><span className="disp"><span className="it">Seeing Stars</span> Agency</span></a>
      </div>
    </header>
  );
}

export default async function QuotePage({ params }) {
  const { token } = await params;
  const r = await loadQuoteByToken(token);
  const L = r.lang || "en";
  const t = QT[L];
  const first = (n) => String(n || "").trim().split(/\s+/)[0];

  if (r.state === "missing" || r.state === "expired") {
    return (
      <div className="app app--lined">
        <Head />
        <main className="container narrow" style={{ alignItems: "center", textAlign: "center", paddingTop: 72 }}>
          <StarIcon size={64} fill="#F4A6C9" />
          <h1 className="h1">{r.state === "expired" ? t.expiredTitle : t.missingTitle}</h1>
          <p className="lead" style={{ maxWidth: 520 }}>{r.state === "expired" ? t.expiredText : t.missingText}</p>
          <p style={{ margin: 0 }}>seeingstarsagency@gmail.com</p>
        </main>
      </div>
    );
  }

  const { snap, artist, quote, payment } = r;
  const [a, b] = halves(snap.total);

  if (r.state === "accepted") {
    const firstPay = quote.accepted_choice === "two" ? a : snap.total;
    return (
      <div className="app app--lined">
        <Head />
        <main className="container narrow" style={{ alignItems: "center", textAlign: "center", gap: 20 }}>
          <StarIcon size={72} />
          <div>
            <div className="kicker">{t.doneKicker}</div>
            <h1 className="h1">{t.doneTitle(first(artist.name))}</h1>
            <p className="lead">{t.doneLead}</p>
          </div>
          <ol className="stack" style={{ listStyle: "none", margin: 0, padding: 0, gap: 12, width: "100%", textAlign: "left" }}>
            {[
              <div key="1" style={{ minWidth: 0 }}>
                <strong>{t.s1(money(firstPay))}</strong>
                {payment && <div style={{ whiteSpace: "pre-wrap", fontSize: 15, marginTop: 8 }}>{payment}</div>}
                <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>{t.memo(artist.name)}</div>
              </div>,
              <div key="2">{t.s2}</div>,
              <div key="3">{t.s3}</div>,
            ].map((body, i) => (
              <li key={i} className="panel" style={{ flexDirection: "row", gap: 12, alignItems: "flex-start", padding: 14, display: "flex" }}>
                <span style={{ flex: "0 0 auto", width: 30, height: 30, borderRadius: "50%", background: "#F2C94C", border: "2px solid #1E1B2E", display: "grid", placeItems: "center", fontWeight: 700 }}>{i + 1}</span>
                {body}
              </li>
            ))}
          </ol>
          <div style={{ width: "100%", textAlign: "left" }}><QuoteCard snap={snap} artistName={artist.name} /></div>
        </main>
      </div>
    );
  }

  return (
    <div className="app app--lined">
      <Head />
      <main className="container" style={{ gap: 24 }}>
        <div>
          <div className="kicker">{t.kicker}</div>
          <h1 className="h1">{t.pageTitle(first(artist.name))}</h1>
          <p className="lead" style={{ maxWidth: 620 }}>{t.pageLead}</p>
        </div>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <QuoteCard snap={snap} artistName={artist.name} />
          <div className="stack" style={{ gap: 18 }}>
            <section className="panel stack" style={{ gap: 10 }}>
              <h2 className="h2" style={{ fontSize: 22, margin: 0 }}>{t.agreeTitle}</h2>
              <p style={{ margin: 0, fontSize: 15 }}>{t.agreeText}</p>
              <a href={`/quote/${token}/agreement`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 12, alignItems: "center", border: "1.5px solid #1E1B2E", borderRadius: 12, padding: "10px 14px", textDecoration: "none", color: "inherit", background: "#fff" }}>
                <span style={{ flex: "0 0 auto", width: 38, height: 46, border: "1.5px solid #1E1B2E", borderRadius: 6, background: "#F4A6C9", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11 }}>PDF</span>
                <span style={{ minWidth: 0 }}><strong style={{ display: "block" }}>{t.agreementFile}</strong><span style={{ fontSize: 14, textDecoration: "underline" }}>{t.open}</span></span>
              </a>
            </section>
            <AcceptForm token={token} t={{ ...pickTexts(t), twoSub: t.twoSub(money(a), money(b)), fullSub: t.fullSub(money(snap.total)) }} />
          </div>
        </div>
      </main>
    </div>
  );
}

// Only plain strings can go to the client form.
function pickTexts(t) {
  const keys = ["payTitle", "two", "full", "agree", "name", "namePh", "accept", "need", "failed"];
  return Object.fromEntries(keys.map((k) => [k, t[k]]));
}
