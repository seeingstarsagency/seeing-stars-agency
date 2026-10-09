"use client";

// Dropdown to switch between the artist's agency projects (one song at a time).
export default function SongPicker({ songs, value, base, label }) {
  return (
    <label className="songpicker">
      <span className="songpicker__label">{label}</span>
      <select
        value={value}
        onChange={(e) => { window.location.href = `${base}${base.includes("?") ? "&" : "?"}song=${e.target.value}`; }}
        aria-label={label}
      >
        {songs.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
      </select>
    </label>
  );
}
