// Brandbook (Astro): pages are 1600 × 900 canvases with positioned elements.
// Shared by the admin editor, the artist view and the server. No server-only imports here.

export const W = 1600;
export const H = 900;

// Fonts offered in the editor. Fraunces, Literata and Caveat are already loaded by the site.
export const FONTS = [
  "Fraunces", "Literata", "Playfair Display", "DM Serif Display", "Cormorant Garamond", "Abril Fatface",
  "Montserrat", "Inter", "Space Grotesk", "Syne", "Bebas Neue", "Archivo Black", "Caveat", "Permanent Marker",
];
export const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700" +
  "&family=DM+Serif+Display:ital@0;1&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=Abril+Fatface" +
  "&family=Montserrat:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@400;700;900&family=Space+Grotesk:wght@400;700" +
  "&family=Syne:wght@400;700&family=Bebas+Neue&family=Archivo+Black&family=Permanent+Marker&display=swap";

export const BRAND_DEFAULTS = ["#1E1B2E", "#FBFAF6", "#F2C94C", "#F4A6C9", "#9CCBE0", "#6F93CF", "#C2417F", "#FFFFFF"];

export const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g, () => ((Math.random() * 16) | 0).toString(16));

// Element factories (page units).
export const make = {
  text: (o = {}) => ({ type: "text", x: 120, y: 120, w: 700, h: 120, text: "Text", font: "Literata", size: 40, weight: 400, italic: false, upper: false, color: "#1E1B2E", align: "left", lh: 1.25, ls: 0, ...o }),
  rect: (o = {}) => ({ type: "shape", shape: "rect", x: 600, y: 300, w: 400, h: 300, fill: "#F2C94C", stroke: "", sw: 0, radius: 0, ...o }),
  ellipse: (o = {}) => ({ type: "shape", shape: "ellipse", x: 650, y: 300, w: 300, h: 300, fill: "#F4A6C9", stroke: "", sw: 0, ...o }),
  line: (o = {}) => ({ type: "shape", shape: "line", x: 500, y: 445, w: 600, h: 10, fill: "#1E1B2E", sw: 6, ...o }),
  image: (o = {}) => ({ type: "image", x: 500, y: 200, w: 600, h: 500, path: "", fit: "cover", radius: 0, ...o }),
  swatch: (o = {}) => ({ type: "swatch", x: 600, y: 250, w: 250, h: 400, fill: "#F2C94C", name: "Color", color: "#1E1B2E", ...o }),
};

const el = (kind, o) => ({ id: uid(), rotate: 0, opacity: 1, ...make[kind](o) });

// The starting brandbook for an artist, in their language.
export function brandbookTemplate(artistName = "Artist", lang = "en") {
  const es = lang === "es";
  const L = (en, sp) => (es ? sp : en);
  const year = new Date().getFullYear();
  const INK = "#1E1B2E", PAPER = "#FBFAF6", Y = "#F2C94C", P = "#F4A6C9", B = "#9CCBE0";
  const kicker = (txt, color = INK) => el("text", { x: 120, y: 90, w: 900, h: 50, text: txt, font: "Space Grotesk", size: 24, weight: 700, ls: 0.18, upper: true, color });
  const title = (txt, color = INK) => el("text", { x: 120, y: 140, w: 1200, h: 130, text: txt, font: "Fraunces", size: 96, weight: 900, lh: 1.05, color });
  const body = (o) => el("text", { font: "Literata", size: 30, lh: 1.5, color: INK, ...o });
  const ph = (o) => el("image", o);
  const page = (t, bg, elements) => ({ id: uid(), title: t, visible: false, data: { bg, elements } });

  return [
    page(L("Cover", "Portada"), INK, [
      el("ellipse", { x: 1180, y: -170, w: 560, h: 560, fill: Y }),
      el("ellipse", { x: 1420, y: 640, w: 260, h: 260, fill: P }),
      el("text", { x: 120, y: 150, w: 800, h: 50, text: "Brandbook", font: "Space Grotesk", size: 26, weight: 700, ls: 0.25, upper: true, color: Y }),
      el("text", { x: 120, y: 320, w: 1300, h: 240, text: artistName, font: "Fraunces", size: 180, weight: 900, lh: 1, color: "#FFFFFF" }),
      el("rect", { x: 120, y: 610, w: 220, h: 8, fill: Y }),
      el("text", { x: 120, y: 650, w: 1000, h: 60, text: L(`Brand identity · ${year}`, `Identidad de marca · ${year}`), font: "Literata", size: 34, italic: true, color: "#FFFFFF", opacity: 0.85 }),
      el("text", { x: 120, y: 800, w: 800, h: 40, text: "Seeing Stars Agency", font: "Space Grotesk", size: 20, weight: 700, ls: 0.12, upper: true, color: "#FFFFFF", opacity: 0.6 }),
    ]),
    page(L("Contents", "Contenido"), PAPER, [
      el("text", { x: 120, y: 110, w: 700, h: 120, text: L("Contents", "Contenido"), font: "Fraunces", size: 96, weight: 900, color: INK }),
      body({ x: 120, y: 280, w: 680, h: 560, size: 34, lh: 1.85, text: L(
        "01  Essence\n02  Logo\n03  Color palette\n04  Typography\n05  Photography\n06  Moodboard\n07  Voice & tone\n08  Applications",
        "01  Esencia\n02  Logo\n03  Paleta de color\n04  Tipografía\n05  Fotografía\n06  Moodboard\n07  Voz y tono\n08  Aplicaciones") }),
      ph({ x: 900, y: 0, w: 700, h: 900 }),
    ]),
    page(L("Essence", "Esencia"), PAPER, [
      kicker(L("01 · Essence", "01 · Esencia")),
      title(L("Who I am", "Quién soy")),
      body({ x: 120, y: 320, w: 680, h: 420, text: L(
        "Write the artist's story here: where they come from, what moves them and what they want people to feel when they hear their music.",
        "Escribe aquí la historia del artista: de dónde viene, qué le mueve y qué quiere que la gente sienta al escuchar su música.") }),
      el("text", { x: 900, y: 300, w: 580, h: 50, text: L("Three words", "Tres palabras"), font: "Space Grotesk", size: 22, weight: 700, ls: 0.15, upper: true, color: INK }),
      ...[Y, P, B].flatMap((c, i) => [
        el("rect", { x: 900, y: 370 + i * 150, w: 580, h: 120, radius: 60, fill: c }),
        el("text", { x: 900, y: 400 + i * 150, w: 580, h: 64, text: L(`Word ${i + 1}`, `Palabra ${i + 1}`), font: "Fraunces", size: 46, italic: true, weight: 700, align: "center", color: INK }),
      ]),
    ]),
    page("Logo", PAPER, [
      kicker("02 · Logo"),
      title("Logo"),
      el("rect", { x: 120, y: 300, w: 860, h: 500, fill: "#F1EFEA", radius: 24 }),
      ph({ x: 270, y: 380, w: 560, h: 340, fit: "contain" }),
      body({ x: 1060, y: 300, w: 420, h: 220, size: 26, text: L(
        "Main version, negative version and clear space. Minimum size: 120 px on screen.",
        "Versión principal, versión en negativo y espacio de respeto. Tamaño mínimo: 120 px en pantalla.") }),
      el("rect", { x: 1060, y: 560, w: 420, h: 240, fill: INK, radius: 24 }),
      ph({ x: 1140, y: 610, w: 260, h: 140, fit: "contain" }),
    ]),
    page(L("Color palette", "Paleta de color"), PAPER, [
      kicker(L("03 · Palette", "03 · Paleta")),
      title(L("Color palette", "Paleta de color")),
      ...[[INK, L("Main", "Principal")], [Y, L("Accent", "Acento")], [P, L("Support", "Apoyo")], [B, L("Support 2", "Apoyo 2")], ["#F1EFEA", L("Background", "Fondo")]]
        .map(([c, n], i) => el("swatch", { x: 120 + i * 280, y: 320, w: 240, h: 470, fill: c, name: n })),
    ]),
    page(L("Typography", "Tipografía"), PAPER, [
      kicker(L("04 · Typography", "04 · Tipografía")),
      title(L("Typography", "Tipografía")),
      el("text", { x: 120, y: 310, w: 600, h: 40, text: L("Headings", "Títulos"), font: "Space Grotesk", size: 22, weight: 700, ls: 0.15, upper: true }),
      el("text", { x: 110, y: 340, w: 600, h: 260, text: "Aa", font: "Fraunces", size: 230, weight: 900 }),
      el("text", { x: 120, y: 610, w: 600, h: 60, text: "Fraunces", font: "Fraunces", size: 44, italic: true }),
      el("text", { x: 860, y: 310, w: 600, h: 40, text: L("Body", "Texto"), font: "Space Grotesk", size: 22, weight: 700, ls: 0.15, upper: true }),
      el("text", { x: 850, y: 340, w: 600, h: 260, text: "Aa", font: "Literata", size: 230 }),
      el("text", { x: 860, y: 610, w: 600, h: 60, text: "Literata", font: "Literata", size: 44 }),
      el("rect", { x: 120, y: 710, w: 1360, h: 3, fill: INK }),
      body({ x: 120, y: 740, w: 1360, h: 80, size: 28, italic: true, text: L("Every song has a story. This is how we tell it.", "Cada canción tiene una historia. Así la contamos.") }),
    ]),
    page(L("Photography", "Fotografía"), PAPER, [
      kicker(L("05 · Photography", "05 · Fotografía")),
      title(L("Photography", "Fotografía")),
      ph({ x: 120, y: 300, w: 430, h: 520, radius: 16 }),
      ph({ x: 580, y: 300, w: 430, h: 520, radius: 16 }),
      ph({ x: 1040, y: 300, w: 440, h: 250, radius: 16 }),
      body({ x: 1040, y: 580, w: 440, h: 240, size: 24, text: L(
        "Natural light, warm colors, eyes to camera. Avoid busy backgrounds.",
        "Luz natural, colores cálidos, mirada a cámara. Evitar fondos recargados.") }),
    ]),
    page("Moodboard", PAPER, [
      kicker("06 · Moodboard"),
      title("Moodboard"),
      ph({ x: 120, y: 290, w: 520, h: 540 }),
      ph({ x: 660, y: 290, w: 400, h: 260 }),
      ph({ x: 1080, y: 290, w: 400, h: 260 }),
      ph({ x: 660, y: 570, w: 260, h: 260 }),
      ph({ x: 940, y: 570, w: 540, h: 260 }),
    ]),
    page(L("Voice & tone", "Voz y tono"), PAPER, [
      kicker(L("07 · Voice & tone", "07 · Voz y tono")),
      title(L("Voice & tone", "Voz y tono")),
      el("rect", { x: 120, y: 300, w: 660, h: 520, fill: "#E3F1F8", radius: 24 }),
      el("text", { x: 170, y: 340, w: 560, h: 60, text: L("How we talk", "Así hablamos"), font: "Fraunces", size: 44, weight: 900 }),
      body({ x: 170, y: 420, w: 560, h: 360, size: 28, lh: 1.7, text: L("✓ Close and honest\n✓ With humor\n✓ In the first person", "✓ Cercano y honesto\n✓ Con humor\n✓ En primera persona") }),
      el("rect", { x: 820, y: 300, w: 660, h: 520, fill: "#FCE4EF", radius: 24 }),
      el("text", { x: 870, y: 340, w: 560, h: 60, text: L("How we don't", "Así no"), font: "Fraunces", size: 44, weight: 900 }),
      body({ x: 870, y: 420, w: 560, h: 360, size: 28, lh: 1.7, text: L("✗ Corporate\n✗ Too many hashtags\n✗ Promising what we can't deliver", "✗ Corporativo\n✗ Demasiados hashtags\n✗ Prometer lo que no cumplimos") }),
    ]),
    page(L("Applications", "Aplicaciones"), PAPER, [
      kicker(L("08 · Applications", "08 · Aplicaciones")),
      title(L("On social media", "En redes sociales")),
      ...[L("Profile", "Perfil"), "Post", "Story"].flatMap((n, i) => [
        ph({ x: 200 + i * 440, y: 280, w: 320, h: 500, radius: 28 }),
        el("text", { x: 200 + i * 440, y: 800, w: 320, h: 50, text: n, font: "Space Grotesk", size: 24, weight: 700, ls: 0.12, upper: true, align: "center" }),
      ]),
    ]),
    page(L("Thank you", "Gracias"), INK, [
      el("ellipse", { x: -160, y: 560, w: 520, h: 520, fill: P }),
      el("text", { x: 200, y: 280, w: 1200, h: 200, text: L("Thank you", "Gracias"), font: "Fraunces", size: 170, weight: 900, italic: true, align: "center", color: Y }),
      el("text", { x: 200, y: 500, w: 1200, h: 60, text: artistName, font: "Literata", size: 40, align: "center", color: "#FFFFFF" }),
      el("text", { x: 200, y: 760, w: 1200, h: 40, text: "Seeing Stars Agency · seeingstarsagency@gmail.com", font: "Space Grotesk", size: 22, weight: 700, ls: 0.1, align: "center", color: "#FFFFFF", opacity: 0.6 }),
    ]),
  ];
}

export const blankPage = (title = "") => ({ id: uid(), title, visible: false, data: { bg: "#FBFAF6", elements: [] } });

// Every stored image path on a set of pages.
export function imagePaths(pages) {
  const out = new Set();
  for (const p of pages || []) for (const e of p.data?.elements || []) if (e.type === "image" && e.path) out.add(e.path);
  return [...out];
}
