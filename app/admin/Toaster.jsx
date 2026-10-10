"use client";

import { useEffect, useState } from "react";

// A small message at the bottom of the screen after every click that does something
// ("Saved ✓", "Sent ✓", "Downloaded ✓"), so it's clear the page did its job.

const KEY = "ssa-toast";

export function showToast(text, kind = "ok") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(KEY, { detail: { text, kind } }));
}

// Turn the button that was pressed into a short "done" message.
function doneText(label) {
  const l = String(label || "").toLowerCase();
  if (/invit/.test(l)) return "Invitation sent ✓";
  if (/send|reply|enviar/.test(l)) return "Sent ✓";
  if (/save|guardar|publish/.test(l)) return "Saved ✓";
  if (/upload|subir/.test(l)) return "Uploaded ✓";
  if (/delete|borrar|remove|quitar|archive/.test(l)) return "Deleted ✓";
  if (/add|\+|create|añadir|agregar/.test(l)) return "Added ✓";
  if (/import|bring/.test(l)) return "Imported ✓";
  if (/solved|mark|paid/.test(l)) return "Updated ✓";
  return "Done ✓";
}

export default function Toaster() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timer;
    const show = (t) => {
      clearTimeout(timer);
      setToast(t);
      if (t.kind !== "busy") timer = setTimeout(() => setToast(null), t.kind === "bad" ? 6000 : 3000);
    };
    // A message saved just before the page reloaded or moved on.
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved) { sessionStorage.removeItem(KEY); show(JSON.parse(saved)); }
    } catch {}

    const onToast = (e) => show(e.detail);

    // Forms: note which button was pressed and say we're working on it.
    let pending = null;
    const onSubmit = (e) => {
      if (e.defaultPrevented) return;
      const btn = e.submitter;
      const label = btn?.getAttribute("aria-label") || btn?.textContent || "";
      pending = label;
      show({ text: "Working…", kind: "busy" });
    };

    // Server actions travel as fetch requests with a "Next-Action" header:
    // when a form's request comes back, say whether it worked.
    const origFetch = window.fetch;
    window.fetch = async (input, init) => {
      const headers = init?.headers;
      const isAction = headers && (headers instanceof Headers ? headers.has("Next-Action") : Object.keys(headers).some((k) => k.toLowerCase() === "next-action"));
      if (!isAction || pending === null) return origFetch(input, init);
      const label = pending;
      pending = null;
      try {
        const res = await origFetch(input, init);
        const t = res.ok ? { text: doneText(label), kind: "ok" } : { text: "Something went wrong. Please try again.", kind: "bad" };
        try { sessionStorage.setItem(KEY, JSON.stringify(t)); } catch {}
        show(t);
        return res;
      } catch (err) {
        show({ text: "No connection. Please try again.", kind: "bad" });
        throw err;
      }
    };

    window.addEventListener(KEY, onToast);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      clearTimeout(timer);
      window.fetch = origFetch;
      window.removeEventListener(KEY, onToast);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  if (!toast) return <div aria-live="polite" style={{ position: "fixed" }} />;
  const bad = toast.kind === "bad";
  return (
    <div aria-live="polite" role="status" style={{
      position: "fixed", left: "50%", transform: "translateX(-50%)",
      bottom: "calc(24px + env(safe-area-inset-bottom, 0px))", zIndex: 1000,
      background: bad ? "#FCE4EF" : "#1E1B2E", color: bad ? "#1E1B2E" : "#FFFDF7",
      border: "2px solid #1E1B2E", borderRadius: 999, padding: "12px 22px",
      font: "600 15px var(--body)", boxShadow: "4px 4px 0 #F2C94C", maxWidth: "calc(100vw - 32px)", textAlign: "center",
    }}>
      {toast.text}
    </div>
  );
}

// For pages that reload themselves after finishing (uploads): show the message after the reload.
export function toastAfterReload(text, kind = "ok") {
  try { sessionStorage.setItem(KEY, JSON.stringify({ text, kind })); } catch {}
}
