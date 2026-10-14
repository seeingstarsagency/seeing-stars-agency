// Styles for the Brand Guide preview. Every color and font comes from the artist
// (CSS variables set on .bg-book); the style class changes the treatment.
const GUIDE_CSS = `
.bg-bar { display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center; justify-content: space-between; }
.bg-book { --pg: var(--paper); --fg: var(--ink); --muted: color-mix(in srgb, var(--ink) 66%, transparent); --rule: color-mix(in srgb, var(--ink) 18%, transparent);
  display: flex; flex-direction: column; gap: 22px; font-family: var(--text); }
.bg-page { position: relative; overflow: hidden; background: var(--pg); color: var(--fg); border-radius: 6px; border: 1.5px solid #1E1B2E;
  padding: clamp(24px, 5vw, 58px); min-height: 540px; display: flex; flex-direction: column; gap: 24px; }
.bg-meta { display: flex; justify-content: space-between; gap: 12px; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); }
.bg-meta b { color: var(--acc); }
.bg-title { font-family: var(--display); font-weight: 400; font-size: clamp(32px, 5vw, 54px); line-height: 1.15; margin: 0; color: var(--sec); text-wrap: balance; }
.bg-label { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; font-weight: 600; color: var(--muted); margin: 0 0 10px; }
.bg-book p { margin: 0; }
.bg-cols { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(22px, 4vw, 50px); align-items: center; flex: 1; }
.bg-cols.rev { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); }
.bg-stack { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
.bg-lead { font-size: clamp(19px, 2.3vw, 24px); line-height: 1.4; font-weight: 500; }
.bg-body { font-size: 15.5px; line-height: 1.7; max-width: 60ch; display: grid; gap: 12px; }
.bg-ph { margin: 0; max-width: 100%; }
.bg-ph img { display: block; width: 100%; aspect-ratio: 4 / 5; object-fit: cover; }
.bg-ph.empty { aspect-ratio: 4 / 5; background: var(--soft2); display: grid; place-items: center; color: var(--ink); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
.bg-pending { display: block; border: 1.5px dashed var(--acc); color: var(--acc); border-radius: 6px; padding: 8px 12px; font-family: "Literata", Georgia, serif; font-size: 13px; text-decoration: none; }
.bg-cover { padding: 0; min-height: 600px; }
.bg-bgimg { position: absolute; inset: 0; }
.bg-bgimg img { width: 100%; height: 100%; object-fit: cover; object-position: center 30%; }
.bg-bgimg.empty { background: var(--sec); }
.bg-cv { position: relative; padding: clamp(24px, 5vw, 58px); display: flex; flex-direction: column; gap: 6px; color: #fff; }
.bg-cv h1 { font-family: var(--display); font-weight: 400; font-size: clamp(44px, 9vw, 100px); line-height: 1.1; margin: 0; text-shadow: 0 2px 18px rgba(0,0,0,.3); }
.bg-cv span { font-size: 15px; letter-spacing: .32em; text-transform: uppercase; font-weight: 600; text-shadow: 0 1px 10px rgba(0,0,0,.4); }
.bg-timeline { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 2px solid var(--sec); }
.bg-step { padding: 16px 18px 0 0; position: relative; min-width: 0; display: grid; gap: 6px; align-content: start; }
.bg-step::before { content: ""; position: absolute; top: -8px; left: 0; width: 14px; height: 14px; border-radius: 50%; background: var(--acc); }
.bg-step b { font-family: var(--script); font-weight: 600; font-size: 24px; color: var(--sec); line-height: 1.2; }
.bg-callout { border-left: 3px solid var(--acc); padding: 4px 0 4px 18px; font-size: clamp(18px, 2.1vw, 22px); line-height: 1.4; font-weight: 500; }
.bg-grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(16px, 3vw, 32px); }
.bg-grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(16px, 3vw, 32px); }
.bg-names { font-size: 16px; font-weight: 500; letter-spacing: .04em; text-transform: uppercase; }
.bg-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.bg-chip { font-size: 14px; padding: 4px 13px; border-radius: 999px; background: var(--soft); color: var(--ink); }
.bg-arche { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(18px, 3.4vw, 40px); flex: 1; align-items: start; }
.bg-arc { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.bg-arc .n { font-family: var(--display); font-size: 54px; line-height: 1; color: var(--soft); }
.bg-arc h3 { font-family: var(--script); font-weight: 600; font-size: clamp(26px, 3vw, 34px); line-height: 1.2; color: var(--sec); margin: 0; }
.bg-arc p { font-size: 15.5px; line-height: 1.65; }
.bg-values { display: grid; gap: 14px; }
.bg-value { border-top: 1px solid var(--rule); padding-top: 12px; display: grid; gap: 4px; }
.bg-value h3 { font-family: var(--script); font-weight: 600; font-size: 26px; color: var(--sec); margin: 0; line-height: 1.2; }
.bg-value p { font-size: 14.5px; }
.bg-value .y b { color: var(--sec); } .bg-value .no b { color: var(--acc); }
.bg-isnot { display: grid; gap: 6px; font-size: 15px; }
.bg-people { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.bg-person { background: color-mix(in srgb, #fff 45%, transparent); border-radius: 6px; padding: 20px; display: grid; gap: 10px; min-width: 0; align-content: start; }
.bg-person .t { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
.bg-person h3 { font-family: var(--script); font-weight: 600; font-size: 26px; color: var(--sec); margin: 0; line-height: 1.2; }
.bg-person dl { margin: 0; display: grid; gap: 8px; }
.bg-person dt { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
.bg-person dd { margin: 2px 0 0; font-size: 14.5px; }
.bg-closing { padding: 0; min-height: 480px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.bg-closing .bg-ph img, .bg-closing .bg-ph.empty { height: 100%; min-height: 340px; aspect-ratio: auto; }
.bg-cl { padding: clamp(24px, 5vw, 58px); display: flex; flex-direction: column; justify-content: center; gap: 16px; }
.bg-cl .sig { font-family: var(--script); font-size: clamp(30px, 4vw, 46px); line-height: 1.3; color: var(--acc); }
.bg-cl .nm { font-family: var(--display); font-size: clamp(26px, 3.4vw, 40px); color: var(--sec); line-height: 1.2; }
.bg-star { position: absolute; font-size: 40px; line-height: 1; color: var(--sec); opacity: .85; pointer-events: none; }

.bg-book.diario .bg-ph.framed { background: #fff; padding: 10px 10px 34px; box-shadow: 0 6px 18px rgba(0,0,0,.18); transform: rotate(-2deg); }
.bg-book.diario .bg-ph.framed.r { transform: rotate(2.2deg); }
.bg-book.editorial .bg-page { background: #fff; }
.bg-book.editorial .bg-arc h3, .bg-book.editorial .bg-value h3, .bg-book.editorial .bg-person h3, .bg-book.editorial .bg-step b, .bg-book.editorial .bg-cl .sig { font-family: var(--display); font-weight: 400; }
.bg-book.editorial .bg-person { background: var(--paper); }
.bg-book.editorial .bg-star { display: none; }
.bg-book.nocturno { --pg: var(--ink); --fg: var(--paper); --muted: rgba(255,255,255,.62); --rule: rgba(255,255,255,.2); }
.bg-book.nocturno .bg-title, .bg-book.nocturno .bg-arc h3, .bg-book.nocturno .bg-value h3, .bg-book.nocturno .bg-person h3, .bg-book.nocturno .bg-step b, .bg-book.nocturno .bg-cl .nm { color: var(--soft2); }
.bg-book.nocturno .bg-person { background: rgba(255,255,255,.06); }
.bg-book.nocturno .bg-star { color: var(--acc); }

@media (max-width: 760px) {
  .bg-page { min-height: 0; }
  .bg-cols, .bg-cols.rev, .bg-grid3, .bg-grid2, .bg-arche, .bg-people, .bg-closing { grid-template-columns: minmax(0, 1fr); }
  .bg-timeline { grid-template-columns: minmax(0, 1fr); border-top: 0; border-left: 2px solid var(--sec); gap: 14px; }
  .bg-step { padding: 0 0 0 18px; }
  .bg-step::before { top: 6px; left: -8px; }
  .bg-cover { min-height: 480px; }
}
`;
export default GUIDE_CSS;
