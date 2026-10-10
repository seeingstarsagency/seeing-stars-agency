"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// "Help" in the dashboard header: a little chat with the agency, right inside the website.
// The artist writes; the admin answers from the Help inbox; answers show up here.
export default function HelpButton({ labels, messages = [], unread = 0, send, markSeen, lang }) {
  const dlg = useRef(null);
  const listRef = useRef(null);
  const router = useRouter();
  const [thread, setThread] = useState(messages);
  const [badge, setBadge] = useState(unread);
  const [error, setError] = useState(false);
  const [pending, start] = useTransition();
  useEffect(() => setThread(messages), [messages]);
  useEffect(() => setBadge(unread), [unread]);

  const scrollDown = () => requestAnimationFrame(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; });
  const open = () => {
    setError(false);
    dlg.current?.showModal();
    scrollDown();
    if (badge > 0) { setBadge(0); markSeen?.().catch(() => {}); }
  };
  const close = () => dlg.current?.close();
  const locale = lang === "es" ? "es-US" : "en-US";
  const when = (d) => new Date(d).toLocaleString(locale, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = String(fd.get("body") || "").trim();
    if (!body) return;
    start(async () => {
      const res = await send(fd).catch(() => ({ error: true }));
      if (res?.ok) {
        setThread((t) => [...t, { id: `tmp-${Date.now()}`, sender: "artist", body, created_at: new Date().toISOString() }]);
        form.reset();
        setError(false);
        scrollDown();
        router.refresh();
      } else setError(true);
    });
  };

  return (
    <>
      <button type="button" className="help-btn" onClick={open}>
        <span aria-hidden="true">?</span> {labels.button}
        {badge > 0 && <b className="help-btn__badge" aria-label={labels.newReplies}>{badge}</b>}
      </button>
      <dialog ref={dlg} className="help-modal" onClick={(e) => { if (e.target === dlg.current) close(); }}>
        <button type="button" className="road-modal__close help-modal__close" onClick={close} aria-label={labels.close}>×</button>
        <div className="kicker">{labels.kicker}</div>
        <h2 className="h2" style={{ margin: "0 0 4px" }}>{labels.title}</h2>
        <p style={{ margin: "0 0 12px", fontSize: 15 }}>{labels.lead}</p>

        <div className="chat" ref={listRef} aria-live="polite">
          {thread.length === 0 ? (
            <p className="chat__empty">{labels.empty}</p>
          ) : (
            thread.map((m) => (
              <div key={m.id} className={`chat__msg chat__msg--${m.sender === "agency" ? "them" : "me"}`}>
                <div className="chat__bubble">{m.body}</div>
                <div className="chat__meta">{m.sender === "agency" ? "Seeing Stars Agency" : labels.you} · {when(m.created_at)}</div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={onSubmit} className="chat__form">
          <input type="hidden" name="topic" value="other" />
          <textarea
            name="body"
            className="input"
            rows={3}
            maxLength={4000}
            required
            placeholder={labels.placeholder}
            aria-label={labels.message}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form.requestSubmit(); }}
          />
          {error && <div className="alert" role="alert">{labels.error}</div>}
          <button type="submit" className="btn btn--dark btn--sm" disabled={pending}>{pending ? labels.sending : labels.send}</button>
        </form>
      </dialog>
    </>
  );
}
