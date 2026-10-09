"use client";

// The artist's brandbook: pages one after another, with a full-screen presenter.
import { useEffect, useState } from "react";
import BookPage from "./BookPage";

export default function Viewer({ pages, urls, labels }) {
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (open === null) return;
    const h = (e) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => Math.min(pages.length - 1, i + 1));
      if (e.key === "ArrowLeft") setOpen((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [open, pages.length]);

  return (
    <>
      <div className="bkview">
        {pages.map((p, i) => (
          <figure key={p.id} className="bkview__page">
            <button type="button" className="bkview__open" onClick={() => setOpen(i)} aria-label={`${labels.open}: ${p.title}`}>
              <BookPage page={p} urls={urls} />
            </button>
            <figcaption><span>{String(i + 1).padStart(2, "0")}</span> {p.title}</figcaption>
          </figure>
        ))}
      </div>
      {open !== null && pages[open] && (
        <div className="bkshow" role="dialog" aria-modal="true" aria-label={pages[open].title}>
          <div className="bkshow__top">
            <span>{open + 1} / {pages.length} · {pages[open].title}</span>
            <button type="button" onClick={() => setOpen(null)} className="bkshow__close">{labels.close} ✕</button>
          </div>
          <div className="bkshow__stage">
            <BookPage page={pages[open]} urls={urls} />
          </div>
          <div className="bkshow__nav">
            <button type="button" onClick={() => setOpen(open - 1)} disabled={open === 0}>← {labels.prev}</button>
            <button type="button" onClick={() => setOpen(open + 1)} disabled={open === pages.length - 1}>{labels.next} →</button>
          </div>
        </div>
      )}
    </>
  );
}
