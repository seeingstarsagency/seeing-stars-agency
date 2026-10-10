"use client";

import { useRef, useState, useTransition } from "react";

// "Help" in the dashboard header: the artist writes a message; it lands in the admin's Help inbox.
export default function HelpButton({ labels, send }) {
  const dlg = useRef(null);
  const [state, setState] = useState("idle"); // idle | sent | error
  const [pending, start] = useTransition();
  const open = () => { setState("idle"); dlg.current?.showModal(); };
  const close = () => dlg.current?.close();

  const onSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await send(fd).catch(() => ({ error: true }));
      setState(res?.ok ? "sent" : "error");
      if (res?.ok) e.target.reset?.();
    });
  };

  return (
    <>
      <button type="button" className="help-btn" onClick={open}>
        <span aria-hidden="true">?</span> {labels.button}
      </button>
      <dialog ref={dlg} className="help-modal" onClick={(e) => { if (e.target === dlg.current) close(); }}>
        <button type="button" className="road-modal__close help-modal__close" onClick={close} aria-label={labels.close}>×</button>
        {state === "sent" ? (
          <div className="help-modal__done">
            <div className="help-modal__star" aria-hidden="true">✦</div>
            <h2 className="h2">{labels.sentTitle}</h2>
            <p>{labels.sentText}</p>
            <button type="button" className="btn btn--dark btn--sm" onClick={close}>{labels.close}</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="stack" style={{ gap: 14 }}>
            <div className="kicker">{labels.kicker}</div>
            <h2 className="h2" style={{ margin: 0 }}>{labels.title}</h2>
            <p style={{ margin: 0, fontSize: 15 }}>{labels.lead}</p>
            <label className="field"><span>{labels.topic}</span>
              <select name="topic" className="input" defaultValue="question">
                {labels.topics.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </label>
            <label className="field"><span>{labels.message}</span>
              <textarea name="body" className="input" rows={6} maxLength={4000} required placeholder={labels.placeholder} />
            </label>
            {state === "error" && <div className="alert" role="alert">{labels.error}</div>}
            <button type="submit" className="btn btn--dark" disabled={pending} style={{ alignSelf: "flex-start" }}>
              {pending ? labels.sending : labels.send}
            </button>
          </form>
        )}
      </dialog>
    </>
  );
}
