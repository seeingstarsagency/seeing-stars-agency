"use client";

import { useRef } from "react";

// A button that opens the "Road to release day" timeline in a popup.
export default function RoadmapButton({ label, closeLabel, children }) {
  const ref = useRef(null);
  const close = () => ref.current?.close();
  return (
    <>
      <button type="button" className="btn btn--sm road-btn" onClick={() => ref.current?.showModal()}>
        <span aria-hidden="true">✦</span> {label}
      </button>
      <dialog
        ref={ref}
        className="road-modal"
        onClick={(e) => { if (e.target === ref.current) close(); }}
      >
        <button type="button" className="road-modal__close" onClick={close} aria-label={closeLabel}>×</button>
        {children}
      </dialog>
    </>
  );
}
