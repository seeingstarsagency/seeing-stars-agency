// Apple Music public catalog (iTunes Search API): free, no account or keys.
// Used to bring in the list of songs an artist has released.

const BASE = "https://itunes.apple.com";

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Apple Music responded ${res.status}`);
  return res.json();
}

// "https://music.apple.com/us/artist/name/123456789" -> "123456789"
export function appleArtistIdFromUrl(url) {
  const m = String(url || "").match(/music\.apple\.com\/.*artist\/(?:[^/?#]+\/)?(\d+)/i);
  return m ? m[1] : null;
}

export async function searchAppleArtists(name) {
  const term = encodeURIComponent(String(name).trim().slice(0, 80));
  if (!term) return [];
  const data = await get(`/search?term=${term}&entity=musicArtist&limit=8`);
  return (data.results || []).map((a) => ({
    id: String(a.artistId),
    name: a.artistName,
    genre: a.primaryGenreName || "",
    link: a.artistLinkUrl || "",
  }));
}

// Songs by this artist (including features), newest first, one entry per title.
export async function appleArtistSongs(artistId) {
  const data = await get(`/lookup?id=${encodeURIComponent(artistId)}&entity=song&limit=200&sort=recent`);
  const byTitle = new Map();
  for (const t of data.results || []) {
    if (t.wrapperType !== "track" || t.kind !== "song") continue;
    const song = {
      source_id: `am:${t.trackId}`,
      title: t.trackName,
      release_date: t.releaseDate ? t.releaseDate.slice(0, 10) : null,
      artwork_url: t.artworkUrl100 ? t.artworkUrl100.replace("100x100bb", "300x300bb") : null,
      link: t.trackViewUrl ? t.trackViewUrl.replace(/[?&]uo=\d+/, "") : null,
    };
    // One entry per title: keep its first release (a single that later appeared on an album, etc.).
    const key = t.trackName.trim().toLowerCase();
    const prev = byTitle.get(key);
    if (!prev || (song.release_date && (!prev.release_date || song.release_date < prev.release_date))) byTitle.set(key, song);
  }
  return [...byTitle.values()].sort((a, b) => String(b.release_date).localeCompare(String(a.release_date)));
}
