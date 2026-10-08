"use client";

export default function PrintButton({ label }) {
  return (
    <button type="button" className="small-btn small-btn--dark" onClick={() => window.print()}>
      {label}
    </button>
  );
}
