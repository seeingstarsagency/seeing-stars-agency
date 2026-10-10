"use client";

import { useEffect, useRef } from "react";

// Shooting stars that cross the artist's dashboard from one corner of the screen to the opposite one.
// The angle follows the screen's shape so each streak points exactly along the diagonal.
export default function DashSky() {
  const ref = useRef(null);
  useEffect(() => {
    const set = () => {
      const el = ref.current;
      if (!el) return;
      const w = el.clientWidth, h = el.clientHeight;
      el.style.setProperty("--w", `${w}px`);
      el.style.setProperty("--h", `${h}px`);
      el.style.setProperty("--ang", `${(Math.atan2(h, w) * 180) / Math.PI}deg`);
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);
  return (
    <div className="dash-sky" ref={ref} aria-hidden="true">
      <div className="dshoot dshoot--up" />
      <div className="dshoot dshoot--down dshoot--pink" />
      <div className="dshoot dshoot--up dshoot--pink dshoot--late" />
      <div className="dshoot dshoot--down dshoot--later" />
    </div>
  );
}
