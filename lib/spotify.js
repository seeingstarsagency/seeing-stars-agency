// Spotify Web API (catalog only, app credentials; no artist login needed).
// Needs SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET from a Spotify developer app.
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "./env";

let cached = { token: null, until: 0 };

async function token() {
  if (cached.token && Date.now() < cached.until) return cached.token;
  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID()}:${SPOTIFY_CLIENT_SECRET()}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify login failed (${res.status})`);
  const data = await res.json();
  cached = { token: data.access_token, until: Date.now() + (data.expires_in - 60) * 1000 };
  return cached.token;
}

async function api(path) {
  const res = await fetch(`https://api.spotify.com/v1${path}`, { headers: { Authorization: `Bearer ${await token()}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`Spotify responded ${res.status}`);
  return res.json();
}

// "https://open.spotify.com/intl-es/artist/ABC123?si=..." -> "ABC123"
export function spotifyArtistIdFromUrl(url) {
  const m = String(url || "").match(/open\.spotify\.com\/(?:[a-z-]+\/)?artist\/([A-Za-z0-9]{10,})/i);
  return m ? m[1] : null;
}

export async function searchSpotifyArtists(name) {
  const q = encodeURIComponent(String(name).trim().slice(0, 80));
  if (!q) return [];
  const data = await api(`/search?type=artist&limit=10&q=${q}`);
  return (data.artists?.items || []).map((a) => ({
    id: a.id,
    name: a.name,
    genre: (a.genres || [])[0] || "",
    link: a.external_urls?.spotify || `https://open.spotify.com/artist/${a.id}`,
  }));
}

// Songs from the artist's albums and singles, newest first, one per title.
export async function spotifyArtistSongs(artistId) {
  const albums = [];
  let next = `/artists/${encodeURIComponent(artistId)}/albums?include_groups=album,single&limit=50`;
  while (next && albums.length < 100) {
    const page = await api(next);
    albums.push(...(page.items || []));
    next = page.next ? page.next.replace("https://api.spotify.com/v1", "") : null;
  }
  const byTitle = new Map();
  for (const al of albums.slice(0, 60)) {
    const tracks = await api(`/albums/${al.id}/tracks?limit=50`);
    const date = normalizeDate(al.release_date);
    const art = (al.images || []).sort((a, b) => Math.abs((a.width || 0) - 300) - Math.abs((b.width || 0) - 300))[0]?.url || null;
    for (const t of tracks.items || []) {
      if (!(t.artists || []).some((a) => a.id === artistId)) continue;
      const song = { source_id: `sp:${t.id}`, title: t.name, release_date: date, artwork_url: art, spotify_url: t.external_urls?.spotify || null };
      const key = t.name.trim().toLowerCase();
      const prev = byTitle.get(key);
      if (!prev || (date && (!prev.release_date || date < prev.release_date))) byTitle.set(key, song);
    }
  }
  return [...byTitle.values()].sort((a, b) => String(b.release_date).localeCompare(String(a.release_date)));
}

// Spotify gives "2024", "2024-05" or "2024-05-17".
function normalizeDate(d) {
  if (!d) return null;
  if (/^\d{4}$/.test(d)) return `${d}-01-01`;
  if (/^\d{4}-\d{2}$/.test(d)) return `${d}-01`;
  return d.slice(0, 10);
}
