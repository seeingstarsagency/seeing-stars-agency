// Turns the Artist DNA into what the Brand Guide pages show: colors, fonts and parsed text.

const HEX = /#?([0-9a-fA-F]{6})\b/;

// "Midnight Ink #0A2130" -> { name: "Midnight Ink", hex: "#0A2130" }
export function parseColor(s) {
  const m = String(s || "").match(HEX);
  if (!m) return null;
  return { hex: `#${m[1].toUpperCase()}`, name: String(s).replace(m[0], "").replace(/[·|,–—-]\s*$/, "").trim() };
}

// Artist colors mapped to the template tokens; Seeing Stars defaults fill the gaps.
export function guideColors(dna = {}) {
  const pick = (k, fallback) => parseColor(dna[k])?.hex || fallback;
  return {
    ink: pick("color_main1", "#1E1B2E"),
    sec: pick("color_main2", "#546883"),
    acc: pick("color_main3", "#C2417F"),
    soft: pick("color_sup1", "#F4A6C9"),
    soft2: pick("color_sup2", "#9CCBE0"),
    paper: pick("color_sup3", "#F6F1E6"),
  };
}

const cleanFont = (s) => String(s || "").replace(/[^A-Za-z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);

// Google Fonts names typed in the DNA, with safe fallbacks.
export function guideFonts(dna = {}) {
  const title = cleanFont(dna.font_title);
  const text = cleanFont(dna.font_text);
  const families = [title, text].filter(Boolean);
  return {
    title: title ? `"${title}", "Fraunces", Georgia, serif` : `"Fraunces", Georgia, serif`,
    text: text ? `"${text}", "Literata", Georgia, serif` : `"Literata", Georgia, serif`,
    href: families.length
      ? `https://fonts.googleapis.com/css2?${families.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}`).join("&")}&display=swap`
      : null,
  };
}

// "The Underdog — overlooked but rises" -> { name, text }
export function splitTitle(s) {
  const v = String(s || "").trim();
  if (!v) return null;
  const m = v.match(/^(.+?)\s*(?:—|–| - |:|\|)\s*(.+)$/);
  return m ? { name: m[1].trim(), text: m[2].trim() } : { name: v, text: "" };
}

// "Honesty | yes: shares it all | no: pretends" -> { name, yes, no }
export function parseValue(s) {
  const v = String(s || "").trim();
  if (!v) return null;
  const parts = v.split("|").map((x) => x.trim());
  const find = (re) => (parts.find((p) => re.test(p)) || "").replace(re, "").trim();
  return { name: parts[0], yes: find(/^(yes|sí|si)\s*:\s*/i), no: find(/^no\s*:\s*/i) };
}

export const lines = (s) => String(s || "").split("\n").map((x) => x.trim()).filter(Boolean);
export const list = (s) => String(s || "").split(/[,·;]|\n/).map((x) => x.trim()).filter(Boolean);
