// A section the artist can see but not use until they have the package.
export default function Locked({ locked, pkg, text, t, children }) {
  if (!locked) return children;
  return (
    <div className="locked">
      <div className="locked__inner" inert aria-hidden="true">{children}</div>
      <div className="locked__card">
        <span className="locked__tag">✦ {t.lockedTag.replace("{pkg}", pkg)}</span>
        <p>{text}</p>
        <p className="locked__or">{t.lockedOr}</p>
        <a href="/#contact" className="btn btn--accent btn--sm">{t.lockedCta.replace("{pkg}", pkg)}</a>
      </div>
    </div>
  );
}

