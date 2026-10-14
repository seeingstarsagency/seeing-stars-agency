// One-page EPK, on top of the Brand Guide styles.
const EPK_CSS = `
.ep-page { gap: 28px; }
.ep-hero { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); margin: calc(-1 * clamp(24px, 5vw, 58px)); margin-bottom: 0; }
.ep-hero .img { background: center 20% / cover; min-height: 420px; }
.ep-hero .txt { background: var(--sec); color: #fff; padding: clamp(24px, 4vw, 48px); display: flex; flex-direction: column; justify-content: center; gap: 14px; }
.ep-hero .kick { font-size: 12px; letter-spacing: .2em; text-transform: uppercase; opacity: .85; }
.ep-hero h1 { font-family: var(--display); font-weight: 400; font-size: clamp(40px, 7vw, 76px); line-height: 1.05; margin: 0; }
.ep-hero .line { font-size: 17px; }
.ep-hero .short { font-size: 15px; line-height: 1.65; opacity: .95; }
.ep-hero .bg-pending { color: #fff; border-color: #fff; }
.ep-card { background: color-mix(in srgb, #fff 50%, transparent); border-radius: 6px; padding: 18px; display: grid; gap: 8px; min-width: 0; align-content: start; }
.ep-rel { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 16px; align-items: center; }
.ep-rel img, .ep-rel .cover { width: 100%; aspect-ratio: 1; object-fit: cover; box-shadow: 0 4px 14px rgba(0,0,0,.18); }
.ep-rel .cover { background: var(--soft); display: flex; align-items: flex-end; padding: 8px; font-family: var(--display); color: var(--ink); }
.ep-rel h3 { font-family: var(--display); font-weight: 400; font-size: 24px; color: var(--sec); margin: 0 0 4px; line-height: 1.2; }
.ep-listen { font-weight: 600; color: var(--acc); text-decoration: none; display: inline-block; margin-top: 6px; }
.muted-t { font-size: 13px; color: var(--muted); }
.ep-nums { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 12px; }
.ep-nums b { display: block; font-size: clamp(26px, 3.6vw, 36px); line-height: 1; color: var(--sec); font-variant-numeric: tabular-nums; }
.ep-nums span { font-size: 13px; color: var(--muted); }
.ep-quotes { display: grid; gap: 14px; }
.ep-quotes p { font-style: italic; font-size: 15px; line-height: 1.55; }
.ep-quotes cite { font-style: normal; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; font-weight: 700; color: var(--acc); }
.ep-list { margin: 0; padding-left: 18px; display: grid; gap: 6px; font-size: 14.5px; }
.ep-photos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.ep-photos .ph { aspect-ratio: 4 / 5; background: center / cover; border-radius: 3px; }
.ep-photos .ph.empty { background: var(--soft2); display: grid; place-items: center; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink); }
.ep-foot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; border-top: 1px solid var(--rule); padding-top: 16px; }
.ep-chip { border: 1px solid var(--rule); border-radius: 999px; padding: 4px 12px; font-size: 13.5px; color: inherit; text-decoration: none; }
.ep-contact b { font-size: 16px; }
.bg-book.editorial .ep-card { background: var(--paper); }
.bg-book.nocturno .ep-card { background: rgba(255,255,255,.06); }
.bg-book.nocturno .ep-rel h3, .bg-book.nocturno .ep-nums b { color: var(--soft2); }
@media (max-width: 760px) {
  .ep-hero { grid-template-columns: minmax(0, 1fr); }
  .ep-hero .img { min-height: 300px; }
  .ep-rel { grid-template-columns: 84px minmax(0, 1fr); }
  .ep-photos { gap: 6px; }
}
`;
export default EPK_CSS;
