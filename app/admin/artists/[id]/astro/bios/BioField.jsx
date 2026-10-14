"use client";

import { useState } from "react";

const words = (s) => String(s || "").trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

// A bio textarea with a live length check against the recipe.
export default function BioField({ name, label, defaultValue = "", limit, draft = "", rows = 5 }) {
  const [v, setV] = useState(defaultValue);
  const chars = [...v].length;
  const n = words(v);
  let note, ok;
  if (limit.chars) { ok = chars > 0 && chars <= limit.chars; note = `${chars} / ${limit.chars} characters`; }
  else { const [a, b] = limit.words; ok = n >= a && n <= b; note = `${n} words · aim for ${a}–${b}`; }
  return (
    <div className="field" style={{ gridColumn: "1 / -1" }}>
      <label htmlFor={name} style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <span>{label}</span>
        <span style={{ fontWeight: 400, fontSize: 13, color: v ? (ok ? "#1f7a4d" : "#b3261e") : "#6b6679" }}>{note}</span>
      </label>
      <textarea id={name} name={name} className="input" rows={rows} value={v} onChange={(e) => setV(e.target.value)} style={{ minHeight: rows * 24 }} />
      {draft && !v && (
        <button type="button" className="small-btn" style={{ alignSelf: "flex-start", marginTop: 6 }} onClick={() => setV(draft)}>
          Start from the DNA draft
        </button>
      )}
    </div>
  );
}
