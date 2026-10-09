"use client";

import { useRef, useState } from "react";

// "Your songs" as a classic iPod with Cover Flow: one song in front, the rest
// tilted to the sides. Browse with the click wheel (spin it), the ⏮ ⏭ buttons,
// a swipe on the screen, the arrow keys, or by tapping a side cover.
// MENU opens a song list; the center button (or ▶❚❚) opens the song.
export default function IPod({ songs, labels }) {
  const [i, setI] = useState(0);
  const [menu, setMenu] = useState(false);
  const [pick, setPick] = useState(0);
  const wheel = useRef(null);
  const drag = useRef(null);
  const swipe = useRef(null);

  const n = songs.length;
  const song = songs[i];
  const go = (k) => setI((c) => Math.max(0, Math.min(n - 1, c + k)));
  const step = (k) => (menu ? setPick((c) => Math.max(0, Math.min(n - 1, c + k))) : go(k));
  const open = (s) => { if (s?.url) window.open(s.url, "_blank", "noopener,noreferrer"); };
  const select = () => {
    if (menu) { setI(pick); setMenu(false); } else open(song);
  };
  const toggleMenu = () => { setPick(i); setMenu((m) => !m); };

  // Click wheel: every ~30° of rotation moves one song.
  const angle = (e) => {
    const r = wheel.current.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  const onWheelDown = (e) => {
    if (e.target.closest(".ipod__center")) return;
    drag.current = { last: angle(e), acc: 0, moved: false };
  };
  const onWheelMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const a = angle(e);
    let delta = a - d.last;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    d.last = a;
    d.acc += delta;
    if (!d.moved && Math.abs(d.acc) > 8) {
      d.moved = true;
      // Only grab the pointer once it's a real spin, so plain taps still reach the buttons.
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    }
    while (d.acc >= 30) { step(1); d.acc -= 30; }
    while (d.acc <= -30) { step(-1); d.acc += 30; }
  };
  const onWheelUp = () => { setTimeout(() => { drag.current = null; }, 0); };
  // A spin shouldn't also count as a press on the button under the finger.
  const swallowClickAfterSpin = (e) => { if (drag.current?.moved) { e.preventDefault(); e.stopPropagation(); } };

  const onKey = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
    else if (e.key === "Enter") { e.preventDefault(); select(); }
    else if (e.key === "Escape" && menu) { e.preventDefault(); setMenu(false); }
  };

  const onScreenDown = (e) => { swipe.current = e.clientX; };
  const onScreenUp = (e) => {
    if (swipe.current == null || menu) return;
    const dx = e.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 30) go(dx < 0 ? 1 : -1);
  };

  const cover = (d) => {
    const a = Math.abs(d);
    if (d === 0) return { transform: "translateX(-50%) translateZ(30px)", zIndex: 20, opacity: 1 };
    const s = Math.sign(d);
    const x = s * (54 + (a - 1) * 20);
    return {
      transform: `translateX(calc(-50% + ${x}px)) rotateY(${-s * 68}deg) scale(.86)`,
      zIndex: 20 - a,
      opacity: a > 3 ? 0 : 1,
    };
  };

  return (
    <div className="ipod" role="group" aria-roledescription="iPod" aria-label={labels.title}>
      <div className="ipod__screen" tabIndex={0} onKeyDown={onKey} onPointerDown={onScreenDown} onPointerUp={onScreenUp} aria-label={labels.hint}>
        <div className="ipod__bar">
          <span>{menu ? labels.list : labels.title}</span>
          <span className="ipod__status">
            <span>{labels.count.replace("{n}", (menu ? pick : i) + 1).replace("{total}", n)}</span>
            <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z" fill="#2d7fd3" /></svg>
            <span className="ipod__battery" aria-hidden="true"><span /></span>
          </span>
        </div>

        {menu ? (
          <ul className="ipod__menu" role="listbox" aria-label={labels.list} aria-activedescendant={`ipod-song-${pick}`}>
            {songs.map((s, k) => (
              <li key={s.id} id={`ipod-song-${k}`} role="option" aria-selected={k === pick} className={k === pick ? "is-on" : ""}
                onClick={() => { setI(k); setMenu(false); }}>
                <span>{s.title}</span><span aria-hidden="true">›</span>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <div className="ipod__flow" aria-live="polite">
              {songs.map((s, k) => (
                <button key={s.id} type="button" className="ipod__cover" style={cover(k - i)} tabIndex={-1}
                  aria-hidden={k !== i} onClick={() => (k === i ? open(s) : setI(k))}>
                  {s.artwork ? <img src={s.artwork} alt="" draggable="false" /> : <span className="ipod__ph">♪</span>}
                </button>
              ))}
            </div>
            <div className="ipod__info">
              <div className="ipod__title">{song.title}</div>
              <div className="ipod__date">{song.date || " "}</div>
            </div>
          </>
        )}
      </div>

      <div className="ipod__wheel" ref={wheel} onPointerDown={onWheelDown} onPointerMove={onWheelMove}
        onPointerUp={onWheelUp} onPointerCancel={onWheelUp} onClickCapture={swallowClickAfterSpin}>
        <button type="button" className="ipod__key ipod__key--menu" onClick={toggleMenu} aria-pressed={menu} aria-label={labels.list}>MENU</button>
        <button type="button" className="ipod__key ipod__key--prev" onClick={() => step(-1)} aria-label={labels.prev}>
          <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true"><path d="M1 0v10M8 0L2 5l6 5zM15 0L9 5l6 5z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" /></svg>
        </button>
        <button type="button" className="ipod__key ipod__key--next" onClick={() => step(1)} aria-label={labels.next}>
          <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true"><path d="M15 0v10M8 0l6 5-6 5zM1 0l6 5-6 5z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" /></svg>
        </button>
        <button type="button" className="ipod__key ipod__key--play" onClick={() => open(menu ? songs[pick] : song)} aria-label={`${labels.listen}: ${(menu ? songs[pick] : song).title}`}>
          <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true"><path d="M1 0l7 5-7 5zM11 0h2.4v10H11zM15.4 0h2.4v10h-2.4z" fill="currentColor" /></svg>
        </button>
        <button type="button" className="ipod__center" onClick={select} aria-label={menu ? (songs[pick]?.title || "") : `${labels.listen}: ${song.title}`} />
      </div>
    </div>
  );
}
