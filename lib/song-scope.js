// Which agency-project song is being looked at, and the step rows that go with it.
export function songScope(artist, songs = [], rows = [], requestedId) {
  const projects = songs
    .filter((s) => s.is_project)
    .sort((a, b) => String(b.release_date || "9999").localeCompare(String(a.release_date || "9999")));
  const current =
    projects.find((s) => s.id === requestedId) ||
    projects.find((s) => s.title.trim().toLowerCase() === String(artist.single_title || "").trim().toLowerCase()) ||
    projects[0] ||
    null;
  const songRows = current ? rows.filter((r) => r.song_id === current.id) : [];
  const artistRows = rows.filter((r) => !r.song_id);
  return { projects, current, songRows, artistRows, allRows: [...songRows, ...artistRows] };
}
