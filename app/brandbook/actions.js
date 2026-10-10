"use server";

import { revalidatePath } from "next/cache";
import { getViewer, supabaseAdmin } from "../../lib/supabase";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function adminOnly() {
  const v = await getViewer();
  return v.profile?.role === "admin" ? v.supabase : null;
}

// Keeps only the fields the editor uses, so nothing odd ends up in the database.
const KEEP = ["id", "type", "x", "y", "w", "h", "rotate", "opacity", "text", "font", "size", "weight", "italic", "upper", "color", "align", "lh", "ls", "shape", "fill", "stroke", "sw", "radius", "path", "fit", "name"];
function cleanElement(e, artistId) {
  if (!e || typeof e !== "object" || !["text", "shape", "image", "swatch"].includes(e.type)) return null;
  const out = {};
  for (const k of KEEP) {
    if (e[k] === undefined) continue;
    const v = e[k];
    if (typeof v === "number") out[k] = Number.isFinite(v) ? Math.round(v * 100) / 100 : 0;
    else if (typeof v === "string") out[k] = v.slice(0, k === "text" ? 4000 : 200);
    else if (typeof v === "boolean") out[k] = v;
  }
  if (out.path && !out.path.startsWith(`${artistId}/brandbook/`)) out.path = "";
  return out;
}

// Saves the whole brandbook (order, titles, which pages the artist sees, every element).
export async function saveBrandbook(artistId, pages, book = "brandbook") {
  book = book === "epk" ? "epk" : "brandbook";
  const supabase = await adminOnly();
  if (!supabase || !UUID.test(String(artistId))) return { error: "not allowed" };
  if (!Array.isArray(pages) || pages.length > 60) return { error: "too many pages" };
  const now = new Date().toISOString();
  const rows = pages.filter((p) => UUID.test(String(p?.id))).map((p, i) => ({
    id: p.id,
    artist_id: artistId,
    position: i,
    book,
    title: String(p.title || "").slice(0, 120),
    visible: !!p.visible,
    data: {
      bg: String(p.data?.bg || "#FFFFFF").slice(0, 40),
      elements: (Array.isArray(p.data?.elements) ? p.data.elements : []).slice(0, 300).map((e) => cleanElement(e, artistId)).filter(Boolean),
    },
    updated_at: now,
  }));
  if (JSON.stringify(rows).length > 3_000_000) return { error: "too big" };
  if (rows.length) {
    const { error } = await supabase.from("brandbook_pages").upsert(rows);
    if (error) return { error: error.message };
  }
  let del = supabase.from("brandbook_pages").delete().eq("artist_id", artistId).eq("book", book);
  if (rows.length) del = del.not("id", "in", `(${rows.map((r) => r.id).join(",")})`);
  const { error: delErr } = await del;
  if (delErr) return { error: delErr.message };
  revalidatePath("/dashboard/astro");
  return { ok: true, savedAt: now };
}

// A one-time upload link for an image going into the brandbook.
export async function getBrandbookImageTicket(artistId, fileName, type) {
  if (!(await adminOnly()) || !UUID.test(String(artistId))) return { error: "not allowed" };
  if (!String(type).startsWith("image/")) return { error: "image only" };
  const ext = (String(fileName).match(/\.(jpe?g|png|webp|gif|svg)$/i)?.[1] || "jpg").toLowerCase();
  const path = `${artistId}/brandbook/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await supabaseAdmin().storage.from("artist-files").createSignedUploadUrl(path);
  if (error) return { error: error.message };
  return { path, token: data.token };
}

// A viewing link for an image that was just uploaded.
export async function signBrandbookImage(artistId, path) {
  if (!(await adminOnly()) || !String(path).startsWith(`${artistId}/brandbook/`)) return { error: "not allowed" };
  const { data, error } = await supabaseAdmin().storage.from("artist-files").createSignedUrl(path, 6 * 3600);
  if (error) return { error: error.message };
  return { url: data.signedUrl };
}
