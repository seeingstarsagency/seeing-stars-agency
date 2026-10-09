"use client";

import { useEffect, useRef } from "react";

// Phones: the main menu folds into a dropdown under a "Menu" paper scrap.
export default function MobileMenu({ links, contactHref }) {
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current?.open && !ref.current.contains(e.target)) ref.current.open = false;
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const shut = () => { if (ref.current) ref.current.open = false; };

  return (
    <details className="mnav" ref={ref}>
      <summary className="mnav__btn" aria-label="Menu">
        <span className="mnav__icon" aria-hidden="true"><span /><span /><span /></span>
        Menu
      </summary>
      <div className="mnav__panel nav">
        {links.map(([href, label]) => (
          <span key={href} className="nav-item"><a href={href} onClick={shut}>{label}</a></span>
        ))}
        <a href={contactHref} className="btn btn--dark btn--sm mnav__contact" onClick={shut}>Get in contact!</a>
      </div>
    </details>
  );
}
