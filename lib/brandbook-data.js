import { supabaseAdmin } from "./supabase";
import { imagePaths } from "./brandbook";

// Brandbook pages with viewing links for their images.
// Uses the visitor's permissions: artists only get pages the agency marked visible.
// `book` = "brandbook" or "epk" (same table, same editor).
export async function loadBrandbook(supabase, artistId, book = "brandbook") {
  const { data, error } = await supabase
    .from("brandbook_pages")
    .select("id, title, visible, data, position")
    .eq("artist_id", artistId)
    .eq("book", book)
    .order("position");
  if (error) return { pages: [], urls: {}, missing: true };
  const pages = (data || []).map(({ position, ...p }) => p);
  const paths = imagePaths(pages).filter((p) => p.startsWith(`${artistId}/brandbook/`));
  const urls = {};
  if (paths.length) {
    const { data: signed } = await supabaseAdmin().storage.from("artist-files").createSignedUrls(paths, 6 * 3600);
    for (const s of signed || []) if (s.signedUrl) urls[s.path] = s.signedUrl;
  }
  return { pages, urls, missing: false };
}
