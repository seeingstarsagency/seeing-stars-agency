// Visual Direction additions on top of the Brand Guide styles.
const VISUAL_CSS = `
.vd-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.vd-sw { border-radius: 6px; overflow: hidden; display: flex; flex-direction: column; min-width: 0; }
.vd-sw .info { padding: 10px 12px; background: color-mix(in srgb, #fff 55%, transparent); display: grid; gap: 2px; }
.vd-sw .info b { font-family: var(--script); font-weight: 600; font-size: 20px; color: var(--sec); line-height: 1.2; }
.vd-sw .info span { font-size: 12.5px; font-variant-numeric: tabular-nums; color: var(--muted); }
.vd-ratio { display: flex; height: 18px; border-radius: 999px; overflow: hidden; }
.vd-face { background: color-mix(in srgb, #fff 50%, transparent); border-radius: 6px; padding: 20px; display: grid; gap: 10px; min-width: 0; align-content: start; }
.vd-face .aa { font-size: 72px; line-height: 1.2; color: var(--sec); }
.vd-face .fn { font-size: 18px; font-weight: 600; }
.vd-face .use { font-size: 13.5px; color: var(--muted); }
.vd-face p { overflow-wrap: anywhere; }
.vd-hier { display: grid; gap: 12px; border-top: 1px solid var(--rule); padding-top: 16px; }
.vd-hier > div { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 14px; align-items: baseline; }
.vd-hier span { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
.vd-res { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.vd-rs { display: grid; gap: 8px; min-width: 0; align-content: start; }
.vd-rs .vis { height: 150px; border-radius: 6px; display: grid; place-items: center; font-size: 46px; color: var(--acc); }
.vd-rs b { font-family: var(--script); font-weight: 600; font-size: 22px; color: var(--sec); line-height: 1.2; }
.vd-rs p { font-size: 13.5px; color: var(--muted); }
.vd-board-h { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 14px; margin-bottom: 10px; }
.vd-board-h h3 { font-family: var(--script); font-weight: 600; font-size: 28px; color: var(--sec); margin: 0; line-height: 1.2; }
.vd-board-h p { font-size: 14px; color: var(--muted); }
.vd-board { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); grid-auto-rows: 88px; gap: 8px; }
.vd-board .it { border-radius: 3px; overflow: hidden; background: center/cover; display: grid; place-items: center; text-align: center; font-size: 12px; color: var(--ink); padding: 8px; }
.vd-board .it.dot { border-radius: 50%; aspect-ratio: 1; width: 100%; max-width: 88px; justify-self: center; align-self: center; }
.vd-board .it.note { background: #fbf8f0; color: var(--sec); font-family: var(--script); font-size: 20px; transform: rotate(-2deg); box-shadow: 0 3px 10px rgba(0,0,0,.12); }
.vd-dirs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 28px; }
.vd-dir b { display: block; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--acc); font-weight: 700; margin-bottom: 4px; }
.vd-dir p { font-size: 15px; line-height: 1.6; }
.vd-dd { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px 16px; }
.vd-pair { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; min-width: 0; }
.vd-pair .lab { grid-column: 1 / -1; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; font-weight: 700; color: var(--muted); }
.vd-cell { display: grid; gap: 6px; min-width: 0; }
.vd-cell small { font-size: 12px; color: var(--muted); line-height: 1.35; }
.vd-cell.ok small { color: #1f7a4d; } .vd-cell.bad small { color: #b3261e; }
.vd-tile { aspect-ratio: 1; border-radius: 4px; overflow: hidden; display: flex; align-items: center; justify-content: center; text-align: center; padding: 6px; position: relative; }
.vd-tile.photo { background-size: cover; background-position: center; }
.vd-tile.grid6 { display: grid; grid-template-columns: repeat(3, 1fr); padding: 0; }
.vd-tile.grid6 i { display: block; }
.vd-tile .nm-small { position: absolute; top: 8px; left: 10px; font-family: var(--display); font-size: 13px; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,.4); }
.vd-tile .nm-big { font-family: var(--display); font-size: 34px; line-height: 1; color: #fff; text-shadow: 3px 3px 0 #e0004d, 0 0 12px #000; transform: scaleX(1.3); }
.bg-book.editorial .vd-face { background: var(--paper); }
.bg-book.editorial .vd-sw .info b, .bg-book.editorial .vd-rs b, .bg-book.editorial .vd-board-h h3 { font-family: var(--display); font-weight: 400; }
.bg-book.nocturno .vd-face, .bg-book.nocturno .vd-sw .info { background: rgba(255,255,255,.06); }
.bg-book.nocturno .vd-sw .info b, .bg-book.nocturno .vd-rs b, .bg-book.nocturno .vd-board-h h3, .bg-book.nocturno .vd-face .aa { color: var(--soft2); }
.bg-book.nocturno .vd-dir b { color: var(--soft2); }
@media (max-width: 760px) {
  .vd-row { gap: 8px; }
  .vd-dirs, .vd-dd { grid-template-columns: minmax(0, 1fr); }
  .vd-hier > div { grid-template-columns: minmax(0, 1fr); gap: 2px; }
  .vd-board { grid-template-columns: repeat(3, minmax(0, 1fr)); grid-auto-rows: 80px; }
}
`;
export default VISUAL_CSS;
