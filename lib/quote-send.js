// Sending a Launchpad quote: the snapshot the artist sees, the texts in both languages, and the emails.
import { QUOTE_AREAS, quoteGroups, computeQuote } from "./pricing";

export const QUOTE_DAYS = 30;

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const money = (v) => {
  const n = Math.round(Number(v) * 100) / 100;
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: Math.abs(n % 1) > 0.001 ? 2 : 0, maximumFractionDigits: 2 });
};
export const halves = (total) => {
  const first = Math.round((Number(total) / 2) * 100) / 100;
  return [first, Math.round((Number(total) - first) * 100) / 100];
};

export const QT = {
  en: {
    subject: "Your Launchpad quote ✦ Seeing Stars Agency",
    hi: (n) => `Hi ${n}, here's your quote!`,
    intro: "Thank you for considering Seeing Stars Agency. Below is everything included in your Launchpad, and the Service Agreement is attached. When you're ready, review it and accept online.",
    cta: "Review & accept my quote",
    expires: `This link is just for you and stays open for ${QUOTE_DAYS} days.`,
    questions: "Questions? Just reply to this email.",
    nothing: "Nothing to do on this song.",
    disc: (p) => `Includes a ${p}% discount`,
    rush: "Rush (release in less than 21 days)",
    min: "Adjustment to the minimum price",
    dash: "Includes access to your own artist dashboard, where you can manage all your information in one place.",
    fees: "Third-party fees (Copyright Office, distributor) are paid directly by the artist.",
    agreementFile: "Launchpad Service Agreement.pdf",
    kicker: "your quote",
    pageTitle: (n) => `${n}, let's launch your music`,
    pageLead: "Review your quote and the Service Agreement. Choose how you'd like to pay, then accept.",
    agreeTitle: "Service Agreement",
    agreeText: "Please read it before accepting. It explains what we do, what you keep ready, and how payments work.",
    open: "Open the agreement (PDF)",
    payTitle: "How would you like to pay?",
    two: "Pay in 2 installments",
    twoSub: (a, b) => `${a} to get started, ${b} on delivery of your final report`,
    full: "Pay in full",
    fullSub: (a) => `${a} to get started`,
    agree: "I have read and agree to the Launchpad Service Agreement.",
    name: "Type your full legal name",
    namePh: "Your full name",
    accept: "Accept quote",
    need: "Choose how to pay, tick the box and type your name to continue.",
    failed: "Something went wrong. Please try again, or reply to our email.",
    doneKicker: "you're in ✦",
    doneTitle: (n) => `Thank you, ${n}!`,
    doneLead: "Your quote is accepted. We sent a copy to your email.",
    s1: (a) => `Send your first payment of ${a}.`,
    s2: "We confirm it by email, usually within 2 business days.",
    s3: "You get an invitation to create your password and enter your artist dashboard.",
    howToPay: "How to pay",
    memo: (n) => `Please write "Launchpad · ${n}" in the payment memo.`,
    expiredTitle: "This link has expired",
    expiredText: "Quote links stay open for 30 days. Write to us and we'll send you a new one.",
    missingTitle: "We couldn't find this quote",
    missingText: "The link may be incomplete or replaced by a newer quote. Check your latest email from us, or write to us.",
    payTwoLabel: ["Launchpad · 50% to get started", "Launchpad · 50% on delivery of the final report"],
    confirmSubject: "Your Launchpad quote is accepted ✦ Seeing Stars Agency",
    confirmHi: (n) => `Thank you, ${n}!`,
    confirmIntro: (choice, first) => `You accepted your Launchpad quote and chose to ${choice === "two" ? "pay in 2 installments" : "pay in full"}. To get started, send your first payment of ${first}.`,
    total: "Total",
  },
  es: {
    subject: "Tu cotización de Launchpad ✦ Seeing Stars Agency",
    hi: (n) => `¡Hola, ${n}! Aquí está tu cotización`,
    intro: "Gracias por considerar a Seeing Stars Agency. Abajo está todo lo que incluye tu Launchpad, y adjuntamos el Contrato de Servicio. Cuando estés listo o lista, revísalo y acéptalo en línea.",
    cta: "Revisar y aceptar mi cotización",
    expires: `Este enlace es solo para ti y está abierto por ${QUOTE_DAYS} días.`,
    questions: "¿Preguntas? Responde a este correo.",
    nothing: "Nada que hacer en esta canción.",
    disc: (p) => `Incluye un descuento del ${p}%`,
    rush: "Urgencia (lanzamiento en menos de 21 días)",
    min: "Ajuste al precio mínimo",
    dash: "Incluye acceso a tu propio panel de artista, donde puedes manejar toda tu información en un solo lugar.",
    fees: "Las tarifas de terceros (Copyright Office, distribuidora) las paga el artista directamente.",
    agreementFile: "Contrato de Servicio Launchpad.pdf",
    kicker: "tu cotización",
    pageTitle: (n) => `${n}, lancemos tu música`,
    pageLead: "Revisa tu cotización y el Contrato de Servicio. Elige cómo quieres pagar y acepta.",
    agreeTitle: "Contrato de Servicio",
    agreeText: "Léelo antes de aceptar. Explica lo que hacemos, lo que tú tienes listo y cómo funcionan los pagos.",
    open: "Abrir el contrato (PDF)",
    payTitle: "¿Cómo quieres pagar?",
    two: "Pagar en 2 cuotas",
    twoSub: (a, b) => `${a} para comenzar y ${b} al entregar tu informe final`,
    full: "Pagar completo",
    fullSub: (a) => `${a} para comenzar`,
    agree: "Leí y acepto el Contrato de Servicio de Launchpad.",
    name: "Escribe tu nombre legal completo",
    namePh: "Tu nombre completo",
    accept: "Aceptar cotización",
    need: "Elige cómo pagar, marca la casilla y escribe tu nombre para continuar.",
    failed: "Algo salió mal. Inténtalo de nuevo o responde a nuestro correo.",
    doneKicker: "¡ya estás dentro! ✦",
    doneTitle: (n) => `¡Gracias, ${n}!`,
    doneLead: "Tu cotización quedó aceptada. Te enviamos una copia a tu correo.",
    s1: (a) => `Envía tu primer pago de ${a}.`,
    s2: "Lo confirmamos por correo, normalmente en un máximo de 2 días hábiles.",
    s3: "Te llega una invitación para crear tu contraseña y entrar a tu panel de artista.",
    howToPay: "Cómo pagar",
    memo: (n) => `En el concepto del pago escribe "Launchpad · ${n}".`,
    expiredTitle: "Este enlace venció",
    expiredText: "Los enlaces de cotización están abiertos por 30 días. Escríbenos y te enviamos uno nuevo.",
    missingTitle: "No encontramos esta cotización",
    missingText: "Puede que el enlace esté incompleto o que lo reemplazara una cotización más reciente. Revisa nuestro último correo o escríbenos.",
    payTwoLabel: ["Launchpad · 50% para comenzar", "Launchpad · 50% al entregar el informe final"],
    confirmSubject: "Tu cotización de Launchpad quedó aceptada ✦ Seeing Stars Agency",
    confirmHi: (n) => `¡Gracias, ${n}!`,
    confirmIntro: (choice, first) => `Aceptaste tu cotización de Launchpad y elegiste ${choice === "two" ? "pagar en 2 cuotas" : "pagar completo"}. Para comenzar, envía tu primer pago de ${first}.`,
    total: "Total",
  },
};

// What gets frozen when the quote is sent, so later edits don't change what the artist accepts.
export function quoteSnapshot(q, lang) {
  const L = lang === "es" ? "es" : "en";
  const c = computeQuote(q);
  const groups = quoteGroups(q, c).map((g) => ({
    title: g.title[L],
    amount: Math.round(g.amount * 100) / 100,
    discountPct: g.discount > 0 ? g.discountPct : 0,
    areas: g.areas.map((a) => a.key),
  }));
  const extras = [];
  if (c.rush) extras.push({ key: "rush", amount: Math.round(c.rush * 100) / 100 });
  if (c.minApplied) extras.push({ key: "min", amount: Math.round((c.min - c.sub) * 100) / 100 });
  return { lang: L, groups, extras, total: c.total };
}

export const areaLabel = (key, lang) => QUOTE_AREAS.find((a) => a.key === key)?.[lang === "es" ? "es" : "en"] || key;
const firstName = (name) => String(name || "").trim().split(/\s+/)[0] || "";

// The quote card as email-safe HTML (inline styles, tables for layout).
export function quoteCardHtml(snap, artistName) {
  const L = snap.lang;
  const t = QT[L];
  const star = `<span style="color:#9CCBE0;font-size:20px;-webkit-text-stroke:1px #1E1B2E">&#10038;</span>`;
  const rows = snap.groups
    .map(
      (g) => `
    <tr><td style="padding:10px 0 2px;font-weight:700;font-size:15px">${esc(g.title)}</td><td style="padding:10px 0 2px;font-weight:700;font-size:15px;text-align:right;white-space:nowrap">${money(g.amount)}</td></tr>
    ${g.areas.length ? g.areas.map((k) => `<tr><td colspan="2" style="font-size:14px;line-height:1.5;padding:1px 0 1px 2px">&#10003;&nbsp; ${esc(areaLabel(k, L))}</td></tr>`).join("") : `<tr><td colspan="2" style="font-size:14px;color:#6B6778">${t.nothing}</td></tr>`}
    ${g.discountPct ? `<tr><td colspan="2" style="font-size:13px;color:#C2417F">${t.disc(g.discountPct)}</td></tr>` : ""}
    <tr><td colspan="2" style="border-bottom:1px solid rgba(30,27,46,.15);padding-top:8px"></td></tr>`
    )
    .join("");
  const extras = snap.extras
    .map((x) => `<tr><td style="padding:8px 0 0;font-size:15px">${x.key === "rush" ? t.rush : t.min}</td><td style="padding:8px 0 0;font-size:15px;text-align:right">${money(x.amount)}</td></tr>`)
    .join("");
  return `
  <div style="background:#FFF6D6;border:2px solid #1E1B2E;border-radius:20px;padding:22px;color:#1E1B2E">
    <div style="font-size:22px;font-weight:900;line-height:1.2">Artist Quote - ${esc(artistName)}</div>
    <div style="font-size:15px;font-weight:700;margin:4px 0 6px">${star} Launchpad</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
      ${rows}${extras}
      <tr><td colspan="2" style="border-top:2px dashed #1E1B2E;padding-top:10px"></td></tr>
      <tr><td style="font-size:16px">${t.total}</td><td style="font-size:36px;font-weight:900;text-align:right">${money(snap.total)}</td></tr>
    </table>
    <p style="font-size:14px;line-height:1.5;margin:12px 0 6px">&#10022; ${t.dash}</p>
    <p style="font-size:13px;line-height:1.5;color:#6B6778;margin:0">${t.fees}</p>
  </div>`;
}

const shell = (inner) => `
<div style="background:#FBF8F1;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;color:#1E1B2E">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:2px solid #1E1B2E;border-radius:20px;padding:32px 28px">
    <div style="font-size:20px;font-weight:700"><span style="color:#F2C94C">&#10038;</span> <em>Seeing Stars</em> Agency</div>
    ${inner}
  </div>
  <p style="text-align:center;font-size:12px;color:#6B6778;margin:16px 0 0">Seeing Stars Agency · seeingstarsagency.com · @seeingstarsagency</p>
</div>`;

const pill = (href, label) =>
  `<a href="${href}" style="display:inline-block;background:#F2C94C;color:#1E1B2E;border:2px solid #1E1B2E;border-radius:999px;padding:14px 28px;font-weight:700;text-decoration:none;font-size:16px">${esc(label)}</a>`;

export function quoteEmail({ snap, artistName, link }) {
  const t = QT[snap.lang];
  const n = firstName(artistName);
  const html = shell(`
    <h1 style="font-size:26px;line-height:1.2;margin:24px 0 10px">${esc(t.hi(n))}</h1>
    <p style="font-size:16px;line-height:1.6;margin:0 0 20px">${t.intro}</p>
    ${quoteCardHtml(snap, artistName)}
    <div style="margin:26px 0 8px">${pill(link, t.cta)}</div>
    <p style="font-size:13px;line-height:1.6;color:#6B6778;margin:0">${t.expires}</p>
    <p style="font-size:13px;line-height:1.6;color:#6B6778;margin:20px 0 0">${t.questions}</p>`);
  const text = [
    t.hi(n), "", t.intro, "",
    `Artist Quote - ${artistName} · Launchpad`,
    ...snap.groups.flatMap((g) => [`${g.title}: ${money(g.amount)}${g.discountPct ? ` (${t.disc(g.discountPct)})` : ""}`, ...g.areas.map((k) => `  ✓ ${areaLabel(k, snap.lang)}`), ""]),
    ...snap.extras.map((x) => `${x.key === "rush" ? t.rush : t.min}: ${money(x.amount)}`),
    `${t.total}: ${money(snap.total)}`, "", `✦ ${t.dash}`, t.fees, "",
    `${t.cta}: ${link}`, t.expires,
  ].join("\n");
  return { subject: t.subject, html, text };
}

export function confirmEmail({ snap, artistName, choice, payment, link }) {
  const t = QT[snap.lang];
  const first = choice === "two" ? halves(snap.total)[0] : snap.total;
  const html = shell(`
    <h1 style="font-size:26px;line-height:1.2;margin:24px 0 10px">${esc(t.confirmHi(firstName(artistName)))}</h1>
    <p style="font-size:16px;line-height:1.6;margin:0 0 18px">${esc(t.confirmIntro(choice, money(first)))}</p>
    ${payment ? `<div style="border:1.5px solid #1E1B2E;border-radius:14px;padding:14px 16px;margin:0 0 18px"><div style="font-weight:700;margin-bottom:6px">${t.howToPay}</div><div style="white-space:pre-wrap;font-size:15px;line-height:1.6">${esc(payment)}</div><div style="font-size:14px;color:#6B6778;margin-top:8px">${esc(t.memo(artistName))}</div></div>` : ""}
    <p style="font-size:15px;line-height:1.6;margin:0 0 6px">1. ${esc(t.s1(money(first)))}</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 6px">2. ${t.s2}</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 20px">3. ${t.s3}</p>
    ${quoteCardHtml(snap, artistName)}
    <p style="font-size:13px;line-height:1.6;color:#6B6778;margin:20px 0 0"><a href="${link}" style="color:#1E1B2E">${t.kicker}</a> · ${t.questions}</p>`);
  const text = [t.confirmHi(firstName(artistName)), "", t.confirmIntro(choice, money(first)), "", payment ? `${t.howToPay}:\n${payment}\n${t.memo(artistName)}\n` : "", `1. ${t.s1(money(first))}`, `2. ${t.s2}`, `3. ${t.s3}`, "", link].join("\n");
  return { subject: t.confirmSubject, html, text };
}

export function acceptedAdminEmail({ snap, artistName, choice, signer, adminLink }) {
  const [a, b] = halves(snap.total);
  const pay = choice === "two" ? `${money(a)} to get started · ${money(b)} on delivery of the final report` : money(snap.total);
  const when = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" });
  const html = shell(`
    <div style="color:#C2417F;font-size:18px;margin-top:20px">a quote was accepted ✦</div>
    <h1 style="font-size:26px;line-height:1.2;margin:6px 0 14px;font-style:italic">${esc(artistName)} said yes!</h1>
    <p style="font-size:15px;margin:0 0 6px"><strong>Total:</strong> ${money(snap.total)} · <strong>${choice === "two" ? "Pay in 2 installments" : "Pay in full"}</strong></p>
    <p style="font-size:15px;margin:0 0 6px"><strong>Signed as:</strong> ${esc(signer)} · ${esc(when)}</p>
    <p style="font-size:15px;margin:0 0 18px"><strong>Payments created:</strong> ${esc(pay)}</p>
    ${pill(adminLink, `Open ${artistName} in admin →`)}
    <p style="font-size:12px;color:#777;margin:18px 0 0">When the first payment arrives, mark it as paid and ${esc(artistName)} gets the dashboard invitation.</p>`);
  return {
    subject: `✦ ${artistName} accepted their Launchpad quote`,
    html,
    text: `${artistName} accepted their Launchpad quote.\nTotal: ${money(snap.total)} · ${choice === "two" ? "Pay in 2 installments" : "Pay in full"}\nSigned as: ${signer} · ${when}\nPayments created: ${pay}\n${adminLink}`,
  };
}
