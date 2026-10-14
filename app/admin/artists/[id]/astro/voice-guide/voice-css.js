// Voice Guide additions on top of the Brand Guide styles.
const VOICE_CSS = `
.vg-msgs { display: grid; gap: 16px; }
.vg-msg { display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 12px; align-items: baseline; border-top: 1px solid var(--rule); padding-top: 12px; }
.vg-msg .n { font-family: var(--display); font-size: 42px; line-height: 1; color: var(--soft); }
.vg-msg p { font-family: var(--display); font-size: clamp(21px, 2.6vw, 28px); line-height: 1.35; }
.vg-scales { display: grid; gap: 22px; }
.vg-ends { display: flex; justify-content: space-between; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; font-weight: 600; color: var(--muted); margin-bottom: 8px; }
.vg-track { height: 6px; border-radius: 999px; background: var(--rule); position: relative; }
.vg-track i { position: absolute; top: 50%; width: 22px; height: 22px; border-radius: 50%; background: var(--acc); border: 3px solid var(--pg); transform: translate(-50%, -50%); }
.vg-box { background: color-mix(in srgb, #fff 45%, transparent); border-radius: 6px; padding: 16px 18px; display: grid; gap: 6px; min-width: 0; align-content: start; }
.vg-box b { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
.vg-box p { font-size: 15px; }
.vg-mt h3 { font-family: var(--script); font-weight: 600; font-size: clamp(24px, 2.6vw, 30px); color: var(--sec); margin: 0 0 6px; line-height: 1.25; }
.vg-mt p { font-size: 14.5px; color: var(--muted); }
.vg-sig { text-align: center; display: grid; gap: 8px; padding-top: 18px; border-top: 1px solid var(--rule); }
.vg-sig .big { font-family: var(--script); font-size: clamp(32px, 5vw, 56px); line-height: 1.3; color: var(--acc); }
.vg-sig p { max-width: 56ch; margin: 0 auto; }
.vg-words .bg-chips span { padding: 4px 12px; border-radius: 999px; font-size: 14px; }
.vg-words.yes .bg-chips span { background: var(--soft2); color: var(--ink); }
.vg-words.no .bg-chips span { border: 1px solid var(--rule); text-decoration: line-through; text-decoration-color: var(--acc); }
.vg-rules { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
.vg-pairs { display: grid; gap: 18px; }
.vg-pair { display: grid; grid-template-columns: 150px minmax(0, 1fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.vg-pair > b { font-family: var(--script); font-weight: 600; font-size: 23px; color: var(--sec); line-height: 1.3; padding-top: 10px; }
.vg-post { background: color-mix(in srgb, #fff 55%, transparent); border-radius: 8px; padding: 14px 16px; display: grid; gap: 10px; min-width: 0; }
.vg-who { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; }
.vg-av { width: 28px; height: 28px; border-radius: 50%; background: var(--sec) center/cover no-repeat; color: #fff; display: grid; place-items: center; font-size: 11px; flex: 0 0 auto; }
.vg-post p { white-space: pre-line; font-size: 14.5px; line-height: 1.55; }
.vg-v { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; font-weight: 700; }
.vg-post.ok .vg-v { color: #1f7a4d; } .vg-post.bad .vg-v { color: #b3261e; }
.vg-post.bad p { opacity: .7; }
.bg-book.editorial .vg-box, .bg-book.editorial .vg-post { background: var(--paper); }
.bg-book.editorial .vg-mt h3, .bg-book.editorial .vg-pair > b { font-family: var(--display); font-weight: 400; }
.bg-book.nocturno .vg-box, .bg-book.nocturno .vg-post { background: rgba(255,255,255,.06); }
.bg-book.nocturno .vg-mt h3, .bg-book.nocturno .vg-pair > b { color: var(--soft2); }
.bg-book.nocturno .vg-post.ok .vg-v { color: #6fd6a1; } .bg-book.nocturno .vg-post.bad .vg-v { color: #ff8a80; }
@media (max-width: 760px) {
  .vg-pair { grid-template-columns: minmax(0, 1fr); gap: 8px; }
  .vg-pair > b { padding-top: 0; }
  .vg-msg { grid-template-columns: 40px minmax(0, 1fr); }
}
`;
export default VOICE_CSS;
