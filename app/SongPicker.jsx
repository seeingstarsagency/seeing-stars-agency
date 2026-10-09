"use client";

// Dropdown above the progress: every song of the artist is listed,
// but only the ones the agency works on (activated in admin) can be opened.
export default function SongPicker({ songs, value, base, label, lockedNote, chooseLabel }) {
  return (
    <label className="songbar__picker">
      <span className="songbar__label">{label}</span>
      <select
        value={value || ""}
        onChange={(e) => { if (e.target.value) window.location.href = `${base}${base.includes("?") ? "&" : "?"}song=${e.target.value}`; }}
        aria-label={label}
      >
        {!value && <option value="" disabled>{chooseLabel}</option>}
        {songs.map((s) => (
          <option key={s.id} value={s.id} disabled={!s.open}>
            {s.open ? s.title : `${s.title} · ${lockedNote}`}
          </option>
        ))}
      </select>
    </label>
  );
}
