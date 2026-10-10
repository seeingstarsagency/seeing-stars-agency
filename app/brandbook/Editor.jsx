"use client";

// Brandbook editor for the admin: pages, drag/resize/rotate, text, shapes, color swatches,
// images, layers, undo/redo, snapping guides and autosave. Pages are 1600 × 900.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { W, H, FONTS, FONTS_URL, BRAND_DEFAULTS, make, uid, brandbookTemplate, epkTemplate, blankPage } from "../../lib/brandbook";
import BookPage, { ElementView, boxStyle, textStyle } from "./BookPage";
import { saveBrandbook, getBrandbookImageTicket, signBrandbookImage } from "./actions";
import { supabaseBrowser } from "../../lib/supabase-browser";

const clone = (x) => JSON.parse(JSON.stringify(x));
// With two editors on one page (brandbook + EPK), keyboard shortcuts go to the one last clicked.
let activeEditor = null;
const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
const isTyping = (t) => t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

export default function Editor({ artistId, artistName, lang, sb, initialPages, initialUrls, book = "brandbook" }) {
  // Same editor for the brandbook and the EPK; only the template and where it saves change.
  const template = book === "epk" ? epkTemplate : brandbookTemplate;
  const [pages, setPagesState] = useState(initialPages || []);
  const [urls, setUrls] = useState(initialUrls || {});
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState(null);
  const [editing, setEditing] = useState(null);
  const [guides, setGuides] = useState(null);
  const [save, setSave] = useState("saved");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [, bump] = useState(0);

  const pagesRef = useRef(pages);
  const past = useRef([]);
  const future = useRef([]);
  const lastRec = useRef({ key: null, t: 0 });
  const canvas = useRef(null);
  const fileInput = useRef(null);
  const replaceTarget = useRef(null);
  const clip = useRef(null);
  const first = useRef(true);

  const setPages = (next) => { pagesRef.current = next; setPagesState(next); };
  const snapshot = () => {
    past.current.push(pagesRef.current);
    if (past.current.length > 100) past.current.shift();
    future.current = [];
    bump((n) => n + 1);
  };
  // record: true = new undo step, false = no step, "string" = merge quick edits of the same field.
  const apply = (next, record = true) => {
    if (typeof record === "string") {
      const now = Date.now();
      if (lastRec.current.key !== record || now - lastRec.current.t > 800) snapshot();
      lastRec.current = { key: record, t: now };
    } else if (record) {
      snapshot();
      lastRec.current = { key: null, t: 0 };
    }
    setPages(next);
  };
  const undo = () => {
    if (!past.current.length) return;
    future.current.push(pagesRef.current);
    setPages(past.current.pop());
    setEditing(null);
    bump((n) => n + 1);
  };
  const redo = () => {
    if (!future.current.length) return;
    past.current.push(pagesRef.current);
    setPages(future.current.pop());
    bump((n) => n + 1);
  };

  const pageIdx = Math.min(cur, Math.max(0, pages.length - 1));
  const page = pages[pageIdx];
  const elements = page?.data?.elements || [];
  const selected = elements.find((e) => e.id === sel) || null;

  const mapPage = (fn, record = true) => {
    const next = pagesRef.current.map((p, i) => (i === pageIdx ? fn(p) : p));
    apply(next, record);
  };
  const setEls = (fn, record = true) => mapPage((p) => ({ ...p, data: { ...p.data, elements: fn(p.data.elements || []) } }), record);
  const updEl = (id, patch, record = true) => setEls((els) => els.map((e) => (e.id === id ? { ...e, ...patch } : e)), record);
  const addEl = (e) => {
    const withId = { id: uid(), rotate: 0, opacity: 1, ...e };
    setEls((els) => [...els, withId]);
    setSel(withId.id);
    return withId.id;
  };
  const removeEl = (id) => { setEls((els) => els.filter((e) => e.id !== id)); setSel(null); setEditing(null); };
  const duplicateEl = (id) => {
    const e = elements.find((x) => x.id === id);
    if (e) addEl({ ...clone(e), id: uid(), x: e.x + 30, y: e.y + 30 });
  };
  const layer = (id, how) => setEls((els) => {
    const i = els.findIndex((e) => e.id === id);
    if (i < 0) return els;
    const arr = [...els];
    const [it] = arr.splice(i, 1);
    const to = how === "front" ? arr.length : how === "back" ? 0 : how === "up" ? Math.min(arr.length, i + 1) : Math.max(0, i - 1);
    arr.splice(to, 0, it);
    return arr;
  });

  // ---------- Pages ----------
  const goPage = (i) => { setCur(i); setSel(null); setEditing(null); };
  const insertPages = (newPages) => {
    const next = [...pagesRef.current];
    const at = pages.length ? pageIdx + 1 : 0;
    next.splice(at, 0, ...newPages);
    apply(next);
    goPage(at);
  };
  const templateNames = useMemo(() => template(artistName, lang).map((p) => p.title), [artistName, lang]);
  const addPage = (choice) => {
    if (choice === "blank") return insertPages([blankPage("New page")]);
    if (choice === "all") return insertPages(template(artistName, lang));
    const t = template(artistName, lang)[Number(choice)];
    if (t) insertPages([t]);
  };
  const movePage = (dir) => {
    const to = pageIdx + dir;
    if (to < 0 || to >= pages.length) return;
    const next = [...pagesRef.current];
    const [p] = next.splice(pageIdx, 1);
    next.splice(to, 0, p);
    apply(next);
    setCur(to);
  };
  const duplicatePage = () => {
    const p = clone(page);
    p.id = uid();
    p.title = `${p.title} (copy)`;
    p.data.elements = p.data.elements.map((e) => ({ ...e, id: uid() }));
    insertPages([p]);
  };
  const deletePage = () => {
    if (!confirm(`Delete the page "${page.title || pageIdx + 1}"?`)) return;
    apply(pagesRef.current.filter((_, i) => i !== pageIdx));
    goPage(Math.max(0, pageIdx - 1));
  };
  const toggleVisible = (i) => apply(pagesRef.current.map((p, j) => (j === i ? { ...p, visible: !p.visible } : p)));
  const setAllVisible = (v) => apply(pagesRef.current.map((p) => ({ ...p, visible: v })));

  // ---------- Saving ----------
  const saving = useRef(false);
  const again = useRef(false);
  const doSave = useCallback(async () => {
    if (saving.current) { again.current = true; return; }
    saving.current = true;
    setSave("saving");
    const snap = pagesRef.current;
    const res = await saveBrandbook(artistId, snap, book).catch(() => ({ error: "network" }));
    saving.current = false;
    if (res?.error) { setSave("error"); setMsg(`Could not save: ${res.error}`); return; }
    setMsg(null);
    if (again.current || pagesRef.current !== snap) { again.current = false; doSave(); return; }
    setSave("saved");
  }, [artistId, book]);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setSave("dirty");
    const t = setTimeout(doSave, 1200);
    return () => clearTimeout(t);
  }, [pages, doSave]);
  useEffect(() => {
    const warn = (e) => { if (save !== "saved") { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [save]);

  // ---------- Images ----------
  async function upload(file, replaceId) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 15 * 1024 * 1024) return setMsg("Images up to 15 MB.");
    setBusy(true);
    setMsg(null);
    try {
      const ticket = await getBrandbookImageTicket(artistId, file.name, file.type);
      if (ticket.error) throw new Error(ticket.error);
      const { error } = await supabaseBrowser(sb).storage.from("artist-files").uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
      if (error) throw new Error(error.message);
      const s = await signBrandbookImage(artistId, ticket.path);
      if (s.error) throw new Error(s.error);
      setUrls((u) => ({ ...u, [ticket.path]: s.url }));
      if (replaceId) {
        updEl(replaceId, { path: ticket.path });
      } else {
        const ratio = await new Promise((res) => {
          const img = new Image();
          img.onload = () => res(img.naturalWidth / img.naturalHeight || 1);
          img.onerror = () => res(1);
          img.src = URL.createObjectURL(file);
        });
        let w = 640, h = w / ratio;
        if (h > 640) { h = 640; w = h * ratio; }
        addEl({ ...make.image(), x: (W - w) / 2, y: (H - h) / 2, w, h, path: ticket.path });
      }
    } catch (err) {
      setMsg(`Could not upload the image (${err.message}).`);
    }
    setBusy(false);
  }
  const pickImage = (replaceId = null) => { replaceTarget.current = replaceId; fileInput.current?.click(); };

  // ---------- Dragging ----------
  const scale = () => (canvas.current?.getBoundingClientRect().width || W) / W;
  function drag(ev, onMove) {
    const sx = ev.clientX, sy = ev.clientY;
    const sc = scale();
    let moved = false;
    const mv = (m) => {
      const dx = (m.clientX - sx) / sc, dy = (m.clientY - sy) / sc;
      if (!moved) {
        if (Math.hypot(m.clientX - sx, m.clientY - sy) < 3) return;
        moved = true;
        snapshot();
      }
      onMove(dx, dy, m, sc);
    };
    const up = () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      setGuides(null);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
  }

  function snapMove(e, nx, ny, sc, off) {
    if (off) return { x: nx, y: ny, g: null };
    const thr = 7 / sc;
    const others = elements.filter((o) => o.id !== e.id);
    const tx = [0, W / 2, W, ...others.flatMap((o) => [o.x, o.x + o.w / 2, o.x + o.w])];
    const ty = [0, H / 2, H, ...others.flatMap((o) => [o.y, o.y + o.h / 2, o.y + o.h])];
    const best = (pos, size, targets) => {
      let r = null;
      for (const [k, edge] of [[0, pos], [size / 2, pos + size / 2], [size, pos + size]]) {
        for (const t of targets) {
          const d = Math.abs(edge - t);
          if (d < thr && (!r || d < r.d)) r = { d, v: t - k, line: t };
        }
      }
      return r;
    };
    const bx = best(nx, e.w, tx), by = best(ny, e.h, ty);
    return { x: bx ? bx.v : nx, y: by ? by.v : ny, g: { v: bx ? [bx.line] : [], h: by ? [by.line] : [] } };
  }

  function startMove(e, ev) {
    if (editing === e.id || ev.button > 0) return;
    ev.stopPropagation();
    setSel(e.id);
    if (editing) setEditing(null);
    drag(ev, (dx, dy, m, sc) => {
      const s = snapMove(e, e.x + dx, e.y + dy, sc, m.altKey);
      setGuides(s.g);
      updEl(e.id, { x: s.x, y: s.y }, false);
    });
  }

  function startResize(e, dir, ev) {
    ev.stopPropagation();
    ev.preventDefault();
    const corner = dir.length === 2;
    drag(ev, (dx, dy, m) => {
      let { x, y, w, h } = e;
      if (dir.includes("e")) w = e.w + dx;
      if (dir.includes("w")) { w = e.w - dx; x = e.x + dx; }
      if (dir.includes("s")) h = e.h + dy;
      if (dir.includes("n")) { h = e.h - dy; y = e.y + dy; }
      const keep = corner && (m.shiftKey || e.type === "image" || e.type === "text" || (e.type === "shape" && e.shape === "ellipse" && e.w === e.h));
      if (keep) {
        const r = e.w / e.h;
        h = w / r;
        if (dir.includes("n")) y = e.y + e.h - h;
      }
      if (w < 10) { w = 10; if (dir.includes("w")) x = e.x + e.w - 10; }
      if (h < 6) { h = 6; if (dir.includes("n")) y = e.y + e.h - 6; }
      const patch = { x, y, w, h };
      if (e.type === "text" && corner) patch.size = Math.max(6, Math.round(e.size * (w / e.w) * 10) / 10);
      updEl(e.id, patch, false);
    });
  }

  function startRotate(e, ev) {
    ev.stopPropagation();
    ev.preventDefault();
    const rect = canvas.current.getBoundingClientRect();
    const sc = rect.width / W;
    const cx = rect.left + (e.x + e.w / 2) * sc, cy = rect.top + (e.y + e.h / 2) * sc;
    drag(ev, (_dx, _dy, m) => {
      let a = (Math.atan2(m.clientY - cy, m.clientX - cx) * 180) / Math.PI + 90;
      if (m.shiftKey) a = Math.round(a / 15) * 15;
      else { const n = Math.round(a / 45) * 45; if (Math.abs(a - n) < 4) a = n; }
      a = ((a + 540) % 360) - 180;
      updEl(e.id, { rotate: Math.round(a * 10) / 10 }, false);
    });
  }

  // ---------- Keyboard ----------
  const keyRef = useRef();
  const myId = useRef(Symbol("editor"));
  if (activeEditor === null) activeEditor = myId.current;
  const claim = () => { activeEditor = myId.current; };
  keyRef.current = (ev) => {
    if (activeEditor !== myId.current) return;
    if (isTyping(ev.target)) return;
    const mod = ev.metaKey || ev.ctrlKey;
    if (mod && ev.key.toLowerCase() === "z") { ev.preventDefault(); return ev.shiftKey ? redo() : undo(); }
    if (mod && ev.key.toLowerCase() === "y") { ev.preventDefault(); return redo(); }
    if (mod && ev.key.toLowerCase() === "s") { ev.preventDefault(); return doSave(); }
    if (mod && ev.key.toLowerCase() === "v" && clip.current) {
      ev.preventDefault();
      const c = clip.current;
      return addEl({ ...clone(c), id: uid(), x: c.x + 30, y: c.y + 30 });
    }
    if (!selected) return;
    if (mod && ev.key.toLowerCase() === "c") { clip.current = clone(selected); return; }
    if (mod && ev.key.toLowerCase() === "d") { ev.preventDefault(); return duplicateEl(selected.id); }
    if (ev.key === "Delete" || ev.key === "Backspace") { ev.preventDefault(); return removeEl(selected.id); }
    if (ev.key === "Escape") return setSel(null);
    if (ev.key === "Enter" && selected.type === "text") { ev.preventDefault(); return setEditing(selected.id); }
    const step = ev.shiftKey ? 10 : 1;
    const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[ev.key];
    if (mv) { ev.preventDefault(); updEl(selected.id, { x: selected.x + mv[0], y: selected.y + mv[1] }, `nudge-${selected.id}`); }
  };
  useEffect(() => {
    const h = (e) => keyRef.current(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Colors already used as swatches become one-click picks.
  const palette = useMemo(() => {
    const set = new Set();
    for (const p of pages) for (const e of p.data?.elements || []) if (e.type === "swatch" && e.fill) set.add(e.fill.toUpperCase());
    for (const c of BRAND_DEFAULTS) set.add(c.toUpperCase());
    return [...set].slice(0, 16);
  }, [pages]);

  const addText = (kind) => {
    const o = {
      heading: { text: "Heading", font: "Fraunces", size: 96, weight: 900, w: 900, h: 120, lh: 1.05 },
      sub: { text: "Subheading", font: "Space Grotesk", size: 30, weight: 700, upper: true, ls: 0.15, w: 700, h: 50 },
      body: { text: "Write something here.", font: "Literata", size: 30, lh: 1.5, w: 640, h: 140 },
    }[kind];
    addEl(make.text({ ...o, x: (W - o.w) / 2, y: (H - o.h) / 2, color: isDark(page?.data?.bg) ? "#FFFFFF" : "#1E1B2E" }));
  };

  const status = { saved: "✓ Saved", dirty: "Unsaved changes", saving: "Saving…", error: "Not saved" }[save];

  // ---------- Empty state ----------
  if (!pages.length) {
    return (
      <div className="bed bed--empty">
        <link rel="stylesheet" href={FONTS_URL} precedence="default" />
        <div className="bed__start">
          <BookPage page={template(artistName, lang)[0]} urls={{}} className="bed__startprev" />
          <div>
            <h3 className="h3" style={{ margin: "0 0 6px" }}>Start {artistName}&rsquo;s {book === "epk" ? "EPK" : "brandbook"}</h3>
            <p style={{ margin: "0 0 14px", fontSize: 15 }}>{book === "epk"
              ? "The template has 8 pages: cover, bio, music, highlights, press photos, press quotes, videos and contact. Pages start hidden from the artist; you choose which ones they see."
              : "The template has 11 pages: cover, contents, essence, logo, colors, typography, photos, moodboard, voice & tone, social media and a closing page. Pages start hidden from the artist; you choose which ones they see."}</p>
            <div className="inline">
              <button type="button" className="btn btn--dark btn--sm" onClick={() => addPage("all")}>Use the {book === "epk" ? "EPK" : "brandbook"} template</button>
              <button type="button" className="small-btn" onClick={() => addPage("blank")}>Start from a blank page</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bed" onPointerDownCapture={claim} onFocusCapture={claim}>
      <link rel="stylesheet" href={FONTS_URL} precedence="default" />
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files?.[0], replaceTarget.current); e.target.value = ""; }} />

      <div className="bed__bar" role="toolbar" aria-label="Brandbook tools">
        <div className="bed__group">
          <button type="button" className="bed__tool" onClick={() => addText("heading")} title="Add a heading"><b style={{ fontFamily: "Fraunces", fontSize: 18 }}>T</b><span>Heading</span></button>
          <button type="button" className="bed__tool" onClick={() => addText("sub")} title="Add a subheading"><b style={{ fontSize: 14 }}>T</b><span>Subheading</span></button>
          <button type="button" className="bed__tool" onClick={() => addText("body")} title="Add body text"><b style={{ fontSize: 12, fontWeight: 400 }}>T</b><span>Text</span></button>
        </div>
        <div className="bed__group">
          <button type="button" className="bed__tool" onClick={() => addEl(make.rect())} title="Rectangle"><i className="bed__ic bed__ic--rect" /><span>Box</span></button>
          <button type="button" className="bed__tool" onClick={() => addEl(make.ellipse())} title="Circle"><i className="bed__ic bed__ic--circle" /><span>Circle</span></button>
          <button type="button" className="bed__tool" onClick={() => addEl(make.line())} title="Line"><i className="bed__ic bed__ic--line" /><span>Line</span></button>
          <button type="button" className="bed__tool" onClick={() => addEl(make.swatch({ fill: palette[2] || "#F2C94C" }))} title="Color swatch"><i className="bed__ic bed__ic--swatch" /><span>Color</span></button>
          <button type="button" className="bed__tool" onClick={() => pickImage()} disabled={busy} title="Upload an image"><i className="bed__ic bed__ic--img" /><span>{busy ? "Uploading…" : "Image"}</span></button>
          <button type="button" className="bed__tool" onClick={() => addEl(make.image())} title="Empty image frame"><i className="bed__ic bed__ic--frame" /><span>Frame</span></button>
        </div>
        <div className="bed__group">
          <button type="button" className="bed__tool" onClick={undo} disabled={!past.current.length} title="Undo (Ctrl/⌘ Z)"><b>↶</b><span>Undo</span></button>
          <button type="button" className="bed__tool" onClick={redo} disabled={!future.current.length} title="Redo (Ctrl/⌘ Shift Z)"><b>↷</b><span>Redo</span></button>
        </div>
        <div className="bed__save">
          <span className={`bed__status bed__status--${save}`} role="status">{status}</span>
          {save !== "saved" && <button type="button" className="small-btn small-btn--dark" onClick={doSave}>Save now</button>}
        </div>
      </div>
      {msg && <div className="alert" role="alert" style={{ margin: "0 0 12px" }}>{msg}</div>}

      <div className="bed__body">
        <aside className="bed__pages" aria-label="Pages">
          <div className="bed__pageshead">
            <strong>Pages</strong>
            <span>{pages.filter((p) => p.visible).length}/{pages.length} shown</span>
          </div>
          <ol className="bed__thumbs">
            {pages.map((p, i) => (
              <li key={p.id} className={i === pageIdx ? "is-on" : ""}>
                <button type="button" className="bed__thumb" onClick={() => goPage(i)} aria-label={`Page ${i + 1}: ${p.title}`} aria-current={i === pageIdx ? "true" : undefined}>
                  <BookPage page={p} urls={urls} />
                </button>
                <div className="bed__thumbmeta">
                  <span className="bed__num">{i + 1}</span>
                  <span className="bed__ttl">{p.title || "Untitled"}</span>
                  <button type="button" className={`bed__eye ${p.visible ? "is-on" : ""}`} onClick={() => toggleVisible(i)} title={p.visible ? "The artist sees this page. Click to hide it." : "Hidden from the artist. Click to show it."} aria-pressed={p.visible}>
                    {p.visible ? "Shown" : "Hidden"}
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <label className="bed__addpage">
            <span className="sr-only">Add a page</span>
            <select value="" onChange={(e) => { if (e.target.value) addPage(e.target.value); }} className="input">
              <option value="">+ Add a page…</option>
              <option value="blank">Blank page</option>
              <optgroup label="From the template">
                {templateNames.map((n, i) => <option key={i} value={i}>{n}</option>)}
              </optgroup>
            </select>
          </label>
        </aside>

        <div className="bed__stage" onPointerDown={(ev) => { if (ev.target === ev.currentTarget) { setSel(null); setEditing(null); } }}>
          <div className="bed__canvaswrap">
          <div
            ref={canvas}
            className="bk bk--edit"
            style={{ background: page.data.bg }}
            onPointerDown={(ev) => { if (ev.target === ev.currentTarget) { setSel(null); setEditing(null); } }}
            onDragOver={(ev) => ev.preventDefault()}
            onDrop={(ev) => {
              ev.preventDefault();
              const f = ev.dataTransfer.files?.[0];
              const hit = ev.target.closest?.("[data-el]")?.dataset.el;
              const onImg = hit && elements.find((x) => x.id === hit && x.type === "image");
              upload(f, onImg ? hit : null);
            }}
          >
            {elements.map((e) => (
              <div
                key={e.id}
                data-el={e.id}
                className={`bk__el bed__el${sel === e.id ? " is-sel" : ""}${editing === e.id ? " is-editing" : ""}`}
                style={boxStyle(e)}
                onPointerDown={(ev) => startMove(e, ev)}
                onDoubleClick={() => (e.type === "text" ? setEditing(e.id) : e.type === "image" ? pickImage(e.id) : null)}
              >
                {editing === e.id ? (
                  <TextEdit e={e} onDone={(text) => { setEditing(null); if (text !== e.text) updEl(e.id, { text }); }} />
                ) : (
                  <ElementView e={e} urls={urls} editing placeholderLabel="Image" />
                )}
              </div>
            ))}
          </div>
          <div className="bed__overlay">
            {selected && editing !== selected.id && (
              <div className="bed__frame" style={boxStyle({ ...selected, opacity: 1 })}>
                {HANDLES.map((d) => (
                  <span key={d} className={`bed__h bed__h--${d}`} onPointerDown={(ev) => startResize(selected, d, ev)} />
                ))}
                <span className="bed__rot" title="Rotate (Shift: steps of 15°)" onPointerDown={(ev) => startRotate(selected, ev)}>⟳</span>
              </div>
            )}
            {guides?.v?.map((x, i) => <span key={`v${i}`} className="bed__guide bed__guide--v" style={{ left: `${(x / W) * 100}%` }} />)}
            {guides?.h?.map((y, i) => <span key={`h${i}`} className="bed__guide bed__guide--h" style={{ top: `${(y / H) * 100}%` }} />)}
          </div>
          </div>
          <p className="bed__hint">Double-click text to write · Double-click an image to replace it · Drag images onto the page · Alt while dragging turns off snapping · Shift keeps proportions</p>
        </div>

        <aside className="bed__panel" aria-label="Properties">
          {selected ? (
            <ElementPanel
              e={selected}
              palette={palette}
              set={(patch, key) => updEl(selected.id, patch, key ? `${selected.id}-${key}` : true)}
              onDelete={() => removeEl(selected.id)}
              onDuplicate={() => duplicateEl(selected.id)}
              onLayer={(how) => layer(selected.id, how)}
              onReplace={() => pickImage(selected.id)}
              onEditText={() => setEditing(selected.id)}
              busy={busy}
            />
          ) : (
            <div className="bed__fields">
              <h3 className="bed__ph">Page {pageIdx + 1}</h3>
              <Field label="Page name">
                <input className="input" value={page.title} maxLength={120} onChange={(ev) => mapPage((p) => ({ ...p, title: ev.target.value }), `title-${page.id}`)} />
              </Field>
              <Field label="Background">
                <ColorField value={page.data.bg} palette={palette} onChange={(c) => mapPage((p) => ({ ...p, data: { ...p.data, bg: c } }), `bg-${page.id}`)} />
              </Field>
              <div className={`bed__vis ${page.visible ? "is-on" : ""}`}>
                <label className="opt">
                  <input type="checkbox" checked={!!page.visible} onChange={() => toggleVisible(pageIdx)} />
                  <span><strong>Show this page to the artist</strong><br /><small>{page.visible ? "They can see it on their Astro page." : "Only you can see it for now."}</small></span>
                </label>
              </div>
              <div className="bed__btns">
                <button type="button" className="small-btn" onClick={() => movePage(-1)} disabled={pageIdx === 0}>↑ Move up</button>
                <button type="button" className="small-btn" onClick={() => movePage(1)} disabled={pageIdx === pages.length - 1}>↓ Move down</button>
                <button type="button" className="small-btn" onClick={duplicatePage}>Duplicate page</button>
                <button type="button" className="small-btn small-btn--danger" onClick={deletePage}>Delete page</button>
              </div>
              <div className="bed__btns" style={{ borderTop: "1px solid #e8e4da", paddingTop: 14 }}>
                <button type="button" className="small-btn" onClick={() => setAllVisible(true)}>Show all pages</button>
                <button type="button" className="small-btn" onClick={() => setAllVisible(false)}>Hide all pages</button>
              </div>
              <p className="bed__tip">Click anything on the page to change it. Changes save on their own.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function isDark(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

function TextEdit({ e, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const r = document.createRange();
    r.selectNodeContents(el);
    const s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }, []);
  return (
    <div
      ref={ref}
      className="bk__text bed__textedit"
      style={textStyle(e)}
      contentEditable
      suppressContentEditableWarning
      onPointerDown={(ev) => ev.stopPropagation()}
      onBlur={(ev) => onDone(ev.currentTarget.innerText.replace(/\n$/, ""))}
      onKeyDown={(ev) => { if (ev.key === "Escape") ev.currentTarget.blur(); }}
      onPaste={(ev) => { ev.preventDefault(); document.execCommand("insertText", false, ev.clipboardData.getData("text/plain")); }}
    >
      {e.text}
    </div>
  );
}

function Field({ label, children, half }) {
  return (
    <label className={`bed__field${half ? " bed__field--half" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Num({ value, onChange, min, max, step = 1 }) {
  return (
    <input
      type="number"
      className="input"
      value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
      min={min}
      max={max}
      step={step}
      onChange={(e) => { const v = parseFloat(e.target.value); if (Number.isFinite(v)) onChange(v); }}
    />
  );
}

function ColorField({ value, onChange, palette, allowNone }) {
  const [hex, setHex] = useState(value || "");
  useEffect(() => setHex(value || ""), [value]);
  const valid = /^#[0-9a-f]{6}$/i.test(value || "");
  return (
    <div className="bed__color">
      <div className="bed__colorrow">
        <input type="color" value={valid ? value : "#ffffff"} onChange={(e) => onChange(e.target.value.toUpperCase())} aria-label="Pick a color" />
        <input
          className="input"
          value={hex}
          placeholder={allowNone ? "None" : "#000000"}
          onChange={(e) => {
            const v = e.target.value.trim();
            setHex(v);
            if (/^#?[0-9a-f]{6}$/i.test(v)) onChange((v.startsWith("#") ? v : `#${v}`).toUpperCase());
            if (allowNone && v === "") onChange("");
          }}
          aria-label="Hex color"
        />
      </div>
      <div className="bed__chips">
        {allowNone && <button type="button" className="bed__chip bed__chip--none" onClick={() => onChange("")} title="None" />}
        {palette.map((c) => (
          <button key={c} type="button" className={`bed__chip${(value || "").toUpperCase() === c ? " is-on" : ""}`} style={{ background: c }} onClick={() => onChange(c)} title={c} aria-label={c} />
        ))}
      </div>
    </div>
  );
}

function ElementPanel({ e, palette, set, onDelete, onDuplicate, onLayer, onReplace, onEditText, busy }) {
  const name = { text: "Text", shape: e.shape === "ellipse" ? "Circle" : e.shape === "line" ? "Line" : "Box", image: "Image", swatch: "Color swatch" }[e.type];
  return (
    <div className="bed__fields">
      <h3 className="bed__ph">{name}</h3>

      {e.type === "text" && (
        <>
          <Field label="Text">
            <textarea className="input" rows={3} value={e.text} onChange={(ev) => set({ text: ev.target.value }, "text")} />
          </Field>
          <Field label="Font">
            <select className="input" value={e.font} onChange={(ev) => set({ font: ev.target.value })} style={{ fontFamily: e.font }}>
              {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
          </Field>
          <div className="bed__row">
            <Field label="Size" half><Num value={e.size} min={6} max={600} onChange={(v) => set({ size: v }, "size")} /></Field>
            <Field label="Weight" half>
              <select className="input" value={e.weight} onChange={(ev) => set({ weight: Number(ev.target.value) })}>
                <option value={400}>Regular</option>
                <option value={700}>Bold</option>
                <option value={900}>Black</option>
              </select>
            </Field>
          </div>
          <div className="bed__seg" role="group" aria-label="Style and alignment">
            <button type="button" className={e.italic ? "is-on" : ""} onClick={() => set({ italic: !e.italic })} aria-pressed={e.italic}><i>I</i></button>
            <button type="button" className={e.upper ? "is-on" : ""} onClick={() => set({ upper: !e.upper })} aria-pressed={e.upper} title="Uppercase">AA</button>
            {[["left", "⇤"], ["center", "≡"], ["right", "⇥"]].map(([a, ic]) => (
              <button key={a} type="button" className={e.align === a ? "is-on" : ""} onClick={() => set({ align: a })} aria-pressed={e.align === a} title={`Align ${a}`}>{ic}</button>
            ))}
          </div>
          <div className="bed__row">
            <Field label="Line height" half><Num value={e.lh} min={0.6} max={3} step={0.05} onChange={(v) => set({ lh: v }, "lh")} /></Field>
            <Field label="Letter spacing" half><Num value={e.ls} min={-0.2} max={1} step={0.01} onChange={(v) => set({ ls: v }, "ls")} /></Field>
          </div>
          <Field label="Color"><ColorField value={e.color} palette={palette} onChange={(c) => set({ color: c }, "color")} /></Field>
          <button type="button" className="small-btn" onClick={onEditText}>Edit on the page</button>
        </>
      )}

      {e.type === "shape" && (
        <>
          <Field label={e.shape === "line" ? "Color" : "Fill"}><ColorField value={e.fill} palette={palette} allowNone={e.shape !== "line"} onChange={(c) => set({ fill: c }, "fill")} /></Field>
          {e.shape === "line" ? (
            <Field label="Thickness"><Num value={e.sw} min={1} max={80} onChange={(v) => set({ sw: v }, "sw")} /></Field>
          ) : (
            <>
              <Field label="Border color"><ColorField value={e.stroke} palette={palette} allowNone onChange={(c) => set({ stroke: c, sw: c && !e.sw ? 4 : e.sw }, "stroke")} /></Field>
              <div className="bed__row">
                <Field label="Border width" half><Num value={e.sw || 0} min={0} max={60} onChange={(v) => set({ sw: v }, "sw")} /></Field>
                {e.shape === "rect" && <Field label="Corners" half><Num value={e.radius || 0} min={0} max={450} onChange={(v) => set({ radius: v }, "radius")} /></Field>}
              </div>
            </>
          )}
        </>
      )}

      {e.type === "image" && (
        <>
          <button type="button" className="btn btn--dark btn--sm" onClick={onReplace} disabled={busy}>{busy ? "Uploading…" : e.path ? "Replace image" : "Upload image"}</button>
          <div className="bed__seg" role="group" aria-label="Fit">
            <button type="button" className={e.fit !== "contain" ? "is-on" : ""} onClick={() => set({ fit: "cover" })}>Fill frame</button>
            <button type="button" className={e.fit === "contain" ? "is-on" : ""} onClick={() => set({ fit: "contain" })}>Show whole</button>
          </div>
          <Field label="Corners"><Num value={e.radius || 0} min={0} max={450} onChange={(v) => set({ radius: v }, "radius")} /></Field>
          {e.path && <button type="button" className="small-btn" onClick={() => set({ path: "" })}>Remove image (keep frame)</button>}
        </>
      )}

      {e.type === "swatch" && (
        <>
          <Field label="Color name"><input className="input" value={e.name} maxLength={60} onChange={(ev) => set({ name: ev.target.value }, "name")} /></Field>
          <Field label="Color"><ColorField value={e.fill} palette={palette} onChange={(c) => set({ fill: c }, "fill")} /></Field>
          <Field label="Label color"><ColorField value={e.color} palette={palette} onChange={(c) => set({ color: c }, "color")} /></Field>
        </>
      )}

      <Field label={`Transparency · ${Math.round((1 - (e.opacity ?? 1)) * 100)}%`}>
        <input type="range" min={0.05} max={1} step={0.05} value={e.opacity ?? 1} onChange={(ev) => set({ opacity: Number(ev.target.value) }, "opacity")} />
      </Field>

      <details className="bed__more">
        <summary>Position and size</summary>
        <div className="bed__row">
          <Field label="X" half><Num value={e.x} onChange={(v) => set({ x: v }, "x")} /></Field>
          <Field label="Y" half><Num value={e.y} onChange={(v) => set({ y: v }, "y")} /></Field>
        </div>
        <div className="bed__row">
          <Field label="Width" half><Num value={e.w} min={10} onChange={(v) => set({ w: v }, "w")} /></Field>
          <Field label="Height" half><Num value={e.h} min={6} onChange={(v) => set({ h: v }, "h")} /></Field>
        </div>
        <div className="bed__row">
          <Field label="Rotation °" half><Num value={e.rotate || 0} min={-180} max={180} onChange={(v) => set({ rotate: v }, "rot")} /></Field>
          <div className="bed__field bed__field--half">
            <span>Center</span>
            <div className="bed__seg">
              <button type="button" onClick={() => set({ x: (W - e.w) / 2 })} title="Center horizontally">↔</button>
              <button type="button" onClick={() => set({ y: (H - e.h) / 2 })} title="Center vertically">↕</button>
            </div>
          </div>
        </div>
      </details>

      <div className="bed__layers">
        <span>Layer</span>
        <div className="bed__seg">
          <button type="button" onClick={() => onLayer("front")} title="Bring to front">⤒</button>
          <button type="button" onClick={() => onLayer("up")} title="Bring forward">↑</button>
          <button type="button" onClick={() => onLayer("down")} title="Send backward">↓</button>
          <button type="button" onClick={() => onLayer("back")} title="Send to back">⤓</button>
        </div>
      </div>
      <div className="bed__btns">
        <button type="button" className="small-btn" onClick={onDuplicate}>Duplicate</button>
        <button type="button" className="small-btn small-btn--danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
