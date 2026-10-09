"use client";

// "Todo está conectado": the artist constellation (from the Constelación del artista design).
// Drawn on a 1600×900 canvas and scaled to fit. Animates only while on screen.
import { useEffect, useMemo, useRef, useState } from "react";

const W = 1600;
const H = 900;
const ACCENT = "#C2417F";

const N = {
  cover: [254, 153, "Cover Art", "a"], copyright: [140, 287, "Copyright", "a"], pitch: [358, 292, "Pitch", "a"],
  spotify: [544, 184, "Community", "r"], epk: [590, 72, "EPK", "r"], linktree: [1036, 120, "LinkTree", "a"], presaves: [1397, 179, "Presaves", "a"],
  pro: [1080, 294, "PRO", "r"], mlc: [708, 326, "MLC", "r"], content: [236, 378, "Content Creation", "b"],
  videos: [616, 392, "Videos", "a"], symphonic: [1429, 384, "Distributors", "l"], visualizer: [1040, 425, "Visualizer", "a"],
  youtube: [302, 536, "YouTube", "a"], dna: [651, 574, "Artist DNA", "a"], canvas: [1443, 522, "Canvas", "b"],
  tiktok: [1062, 577, "TikTok", "a"], playlists: [149, 610, "Playlists", "b"], branding: [535, 645, "Branding", "b"],
  editing: [1259, 639, "Editing", "b"], lyrics: [750, 691, "Lyrics", "r"], calendars: [237, 751, "Calendars", "b"],
  instagram: [1413, 744, "Instagram", "b"], organization: [511, 800, "Organization", "b"], photos: [931, 791, "Photos", "b"],
};
const E = [
  ["cover", "copyright"], ["cover", "pitch"], ["copyright", "content"], ["pitch", "content"], ["pitch", "spotify"], ["spotify", "epk"], ["cover", "epk"], ["spotify", "linktree"],
  ["spotify", "videos"], ["linktree", "presaves"], ["linktree", "pro"], ["presaves", "pro"], ["presaves", "symphonic"], ["pro", "mlc"],
  ["pro", "symphonic"], ["pro", "visualizer"], ["mlc", "content"], ["mlc", "videos"], ["content", "youtube"], ["content", "playlists"],
  ["videos", "dna"], ["visualizer", "dna"], ["visualizer", "canvas"], ["visualizer", "tiktok"], ["symphonic", "canvas"], ["canvas", "editing"],
  ["youtube", "playlists"], ["youtube", "branding"], ["branding", "dna"], ["dna", "lyrics"], ["lyrics", "photos"], ["lyrics", "tiktok"],
  ["lyrics", "organization"], ["tiktok", "editing"], ["tiktok", "photos"], ["editing", "instagram"], ["photos", "instagram"],
  ["playlists", "calendars"], ["calendars", "organization"],
];

const IDS = Object.keys(N);
const ADJ = Object.fromEntries(IDS.map((k) => [k, []]));
E.forEach(([a, b]) => { ADJ[a].push(b); ADJ[b].push(a); });
const DIST = (() => {
  const d = { dna: 0 }; const q = ["dna"];
  while (q.length) { const c = q.shift(); ADJ[c].forEach((n) => { if (d[n] == null) { d[n] = d[c] + 1; q.push(n); } }); }
  return d;
})();
const PHASE = Object.fromEntries(IDS.map((k, i) => [k, i * 1.7 + (i % 3) * 0.9]));

const spike = (L, S, I) => {
  let d = "";
  for (let j = 0; j < 16; j++) {
    const ang = ((j * 22.5 - 90) * Math.PI) / 180;
    const r = j % 2 ? I : j % 4 === 0 ? L : S;
    d += (j ? " L" : "M") + (50 + Math.cos(ang) * r).toFixed(1) + " " + (50 + Math.sin(ang) * r).toFixed(1);
  }
  return d + " Z";
};
const STAR8 = spike(49, 27, 7);
const STAR4 = spike(49, 15, 6);
const FILLS = ["#6F93CF", "#1E1B2E", "#C2417F", "#6F93CF"];
const TIERS = [1, 0, 2, 0, 1, 2, 0, 1, 0];

function makeDust() {
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const cols = ["#6F93CF", "#6F93CF", "#1E1B2E", "#F4A6C9", "#9CCBE0"];
  const dust = [];
  for (let i = 0; i < 230; i++) {
    const big = rnd() < 0.12;
    dust.push({ x: 10 + rnd() * 1580, y: 10 + rnd() * 860, s: big ? 5 + rnd() * 4 : 2 + rnd() * 2.6, c: cols[i % cols.length], d: rnd() * 4, dur: 2.5 + rnd() * 4 });
  }
  let tiny = "";
  for (let i = 0; i < 30; i++) {
    const x = 20 + rnd() * 1560, y = 20 + rnd() * 840, r = 5 + rnd() * 7, q = r * 0.16;
    tiny += `M${x.toFixed(1)} ${(y - r).toFixed(1)} L${(x + q).toFixed(1)} ${(y - q).toFixed(1)} L${(x + r).toFixed(1)} ${y.toFixed(1)} L${(x + q).toFixed(1)} ${(y + q).toFixed(1)} L${x.toFixed(1)} ${(y + r).toFixed(1)} L${(x - q).toFixed(1)} ${(y + q).toFixed(1)} L${(x - r).toFixed(1)} ${y.toFixed(1)} L${(x - q).toFixed(1)} ${(y - q).toFixed(1)} Z `;
  }
  return { dust, tiny };
}

const clamp = (v) => Math.max(0, Math.min(1, v));
const back = (a) => { const c = 1.7; return 1 + (c + 1) * Math.pow(a - 1, 3) + c * Math.pow(a - 1, 2); };

export default function Constellation() {
  const wrap = useRef(null);
  const [scale, setScale] = useState(0.75);
  const [t, setT] = useState(100); // 100 = fully drawn (no animation before it's seen / reduced motion)
  const [hover, setHover] = useState(null);
  const [pin, setPin] = useState(null);
  const { dust, tiny } = useMemo(makeDust, []);

  // Fit the 1600px canvas to the available width (never smaller than ~0.42 so labels stay readable).
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fit = () => setScale(Math.max(0.42, Math.min(1, el.clientWidth / W)));
    fit();
    // On narrow screens the sky scrolls sideways: start centered on "Artist DNA".
    requestAnimationFrame(() => {
      const sc = Math.max(0.42, Math.min(1, el.clientWidth / W));
      if (W * sc > el.clientWidth) el.scrollLeft = 651 * sc - el.clientWidth / 2;
    });
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Play the entrance when it scrolls into view; keep floating only while visible.
  useEffect(() => {
    let reduce = false;
    try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch {}
    if (reduce) return;
    const el = wrap.current;
    let raf = 0, start = null, offset = 0, visible = false;
    const loop = (now) => {
      if (start == null) start = now - offset * 1000;
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        visible = true;
        start = null;
        raf = requestAnimationFrame(loop);
      } else if (!entry.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(raf);
        setT((cur) => { offset = cur; return cur; });
      }
    }, { threshold: 0.2 });
    setT(0);
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const focus = hover || pin;
  const near = new Set(focus ? [focus, ...ADJ[focus]] : []);
  const tm = t;
  const STEP = 0.45;

  const P = {};
  IDS.forEach((k) => {
    const [bx, by] = N[k];
    const ph = PHASE[k];
    const amp = k === "dna" ? 4 : 9;
    P[k] = [bx + Math.sin(tm * 0.55 + ph) * amp, by + Math.cos(tm * 0.47 + ph * 1.3) * amp * 0.8];
  });

  let strongD = "", midD = "", faintD = "", hiD = "";
  E.forEach(([a0, b0], i) => {
    let a = a0, b = b0;
    if (DIST[b] < DIST[a]) { a = b0; b = a0; }
    const u = clamp((t - (0.45 + DIST[a] * STEP)) / 0.55);
    if (u <= 0) return;
    const [ax, ay] = P[a], [bx, by] = P[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    const k = (i % 2 ? 1 : -1) * Math.min(7, len * 0.025) + Math.sin(tm * 0.8 + i) * 1.5;
    const cx = (ax + bx) / 2 - (dy / len) * k, cy = (ay + by) / 2 + (dx / len) * k;
    const l1x = ax + (cx - ax) * u, l1y = ay + (cy - ay) * u;
    const l2x = cx + (bx - cx) * u, l2y = cy + (by - cy) * u;
    const ex = l1x + (l2x - l1x) * u, ey = l1y + (l2y - l1y) * u;
    const seg = `M${ax.toFixed(1)} ${ay.toFixed(1)} Q${l1x.toFixed(1)} ${l1y.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} `;
    const tier = a === "dna" || b === "dna" ? 2 : TIERS[i % TIERS.length];
    if (focus && (a === focus || b === focus)) hiD += seg;
    else if (tier === 2) strongD += seg;
    else if (tier === 1) midD += seg;
    else faintD += seg;
  });

  return (
    <div className="constel" ref={wrap}>
      <div className="constel__sizer" style={{ width: W * scale, height: H * scale }}>
      <div className="constel__canvas" style={{ width: W, height: H, transform: `scale(${scale})` }}>
        {dust.map((p, i) => (
          <div key={i} className="constel__dust" style={{ left: p.x, top: p.y, width: p.s, height: p.s, background: p.c, animationDelay: `${p.d}s`, animationDuration: `${p.dur}s` }} />
        ))}
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="constel__layer" aria-hidden="true"><path d={tiny} fill="#6F93CF" opacity="0.75" /></svg>

        <div className="constel__shoot" style={{ left: 160, top: 620, animationDelay: "1.5s" }} />
        <div className="constel__shoot" style={{ left: 700, top: 860, animationDelay: "5.5s" }} />

        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" className="constel__layer" aria-hidden="true">
          <path d={faintD || "M0 0"} stroke="#1E1B2E" strokeWidth="1" strokeLinecap="round" opacity={focus ? 0.12 : 0.32} />
          <path d={midD || "M0 0"} stroke="#1E1B2E" strokeWidth="1.5" strokeLinecap="round" opacity={focus ? 0.2 : 0.6} />
          <path d={strongD || "M0 0"} stroke="#1E1B2E" strokeWidth="2.6" strokeLinecap="round" opacity={focus ? 0.3 : 0.95} />
          <path d={hiD || "M0 0"} stroke={ACCENT} strokeWidth="3.2" strokeLinecap="round" />
        </svg>

        {IDS.map((k, i) => {
          const [, , label, pos] = N[k];
          const deg = ADJ[k].length;
          const isDna = k === "dna";
          const size = isDna ? 84 : Math.min(50, 24 + deg * 5);
          const a = clamp((t - 0.3 - DIST[k] * STEP) / 0.4);
          const on = focus === k;
          const dim = focus && !near.has(k);
          const sc = (a < 1 ? back(a) : 1) * (on ? 1.35 : 1);
          const fs = isDna ? 60 : deg >= 4 ? 42 : 38;
          const gap = size / 2 + 2;
          const rot = ((i * 37) % 7) - 3;
          const ls =
            pos === "a" ? { left: -160, width: 320, textAlign: "center", bottom: gap }
            : pos === "b" ? { left: -160, width: 320, textAlign: "center", top: gap }
            : pos === "r" ? { left: gap, top: -fs / 2 }
            : { right: gap, top: -fs / 2 };
          return (
            <div key={k} className="constel__node" style={{ left: P[k][0], top: P[k][1], opacity: a, transform: `scale(${sc})` }}>
              <div style={{ position: "absolute", left: -size / 2, top: -size / 2, width: size, height: size }}>
                <svg className="constel__tw" width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", animationDelay: `${((i * 0.37) % 3.4).toFixed(2)}s` }} aria-hidden="true">
                  <path d={isDna || i % 3 === 0 ? STAR8 : STAR4} fill={isDna ? "#F2C94C" : FILLS[i % 4]} stroke={isDna ? "#1E1B2E" : "none"} strokeWidth={(140 / size).toFixed(2)} strokeLinejoin="round" />
                </svg>
              </div>
              <div className="constel__label" style={{ ...ls, fontSize: fs, fontWeight: isDna || on ? 800 : 600, color: on ? ACCENT : "#1E1B2E", opacity: dim ? 0.3 : 1, transform: `rotate(${rot}deg)` }}>
                {label}
              </div>
              <button
                type="button"
                className="constel__hit"
                aria-label={label}
                aria-pressed={pin === k}
                onMouseEnter={() => setHover(k)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(k)}
                onBlur={() => setHover(null)}
                onClick={() => setPin(pin === k ? null : k)}
              />
            </div>
          );
        })}
      </div>
      </div>
      {scale * W > (wrap.current?.clientWidth || Infinity) && <div className="constel__hint" aria-hidden="true">← swipe to explore →</div>}
    </div>
  );
}
