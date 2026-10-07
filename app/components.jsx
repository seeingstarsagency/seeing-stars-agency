"use client";

import { useEffect, useRef } from "react";

const POINTS =
  "50,0 61,30 85,15 70,39 100,50 70,61 85,85 61,70 50,100 39,70 15,85 30,61 0,50 30,39 15,15 39,30";

export function Star({ size = 40, fill = "#F2C94C", stroke, strokeWidth = 3, className, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <polygon points={POINTS} fill={fill} stroke={stroke} strokeWidth={stroke ? strokeWidth : undefined} />
    </svg>
  );
}

// Fades children in when they scroll into view.
export function Reveal({ children, delay = 0, className = "", as: Tag = "div", ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
