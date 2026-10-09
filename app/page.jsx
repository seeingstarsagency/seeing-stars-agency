import { Star, Reveal } from "./components";
import {
  CONTACT,
  COLORS,
  MARQUEE,
  PILLARS,
  PACKAGES,
  BUNDLES,
} from "./content";

const markColors = [COLORS.yellow, COLORS.pink, COLORS.blue];

const PKG_COLOR = Object.fromEntries(PACKAGES.map((p) => [p.name, p.color]));

export default function Home() {
  const marquee = [...MARQUEE, ...MARQUEE];

  return (
    <div className="page">
      <header className="wrap header">
        <a href="#top" className="logo">
          <Star size={34} fill={COLORS.yellow} />
          <span>
            <span className="it">Seeing Stars</span> Agency
          </span>
        </a>
        <nav className="nav" aria-label="Main">
          <span className="nav-item"><a href="#services">Services</a></span>
          <span className="nav-item"><a href="#packages">Packages</a></span>
          <span className="nav-item"><a href="#bundles">Bundles</a></span>
          <span className="nav-item"><a href="/login">Client login</a></span>
        </nav>
        <a href="#contact" className="btn btn--dark btn--sm">
          Get in contact!
        </a>
      </header>

      <main>
        {/* Hero */}
        <section id="top" className="wrap hero">
          <div className="shoot" style={{ left: -120, top: 420 }} />
          <div className="shoot shoot--pink" style={{ left: 180, top: 560 }} />
          <Star size={22} fill={COLORS.yellow} className="abs drift" style={{ left: "46%", top: 60 }} />
          <Star size={16} fill={COLORS.navy} className="abs drift2" style={{ left: "8%", top: 30 }} />
          <Star size={18} fill={COLORS.pink} className="abs drift" style={{ left: "40%", bottom: 70 }} />
          <Star size={26} fill={COLORS.yellow} className="abs drift2" style={{ right: "4%", bottom: 40 }} />

          <div className="hero__text">
            <div className="hand hero__kicker rise d1">
              <span>for emerging artists</span>
            </div>
            <h1 className="hero__title">
              <span className="it rise d2">Seeing Stars</span>
              <br />
              <span className="rise d3" style={{ fontWeight: 400 }}>
                Agency
              </span>
            </h1>
            <p className="hero__lead rise d4">
              We help emerging artists build their identity, <span className="hl">make sense of the industry</span>,
              and get ready for what&apos;s next.
            </p>
            <div className="hero__ctas rise d5">
              <a href="/questionnaire" className="btn btn--accent">
                Find your package
              </a>
              <a href="#packages" className="btn">
                See packages
              </a>
            </div>
          </div>

          <div className="hero__art">
            <Star size={110} fill={COLORS.pink} className="abs twinkle" style={{ top: -10, right: 10 }} />
            <Star size={70} fill={COLORS.blue} className="abs twinkle2" style={{ bottom: 0, left: 10 }} />
            <div className="note-wrap pop">
              <div className="note float wobble">
                <p>
                  <b>Artists helping artists</b> find their way.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="band" aria-hidden="true">
          <div className="marquee">
            {marquee.map((t, i) => (
              <span key={i} style={{ display: "contents" }}>
                <span>{t}</span>
                <span style={{ color: markColors[i % 3] }}>✶</span>
              </span>
            ))}
          </div>
        </div>

        {/* Services */}
        <section id="services" className="wrap section">
          <Reveal>
            <h2 className="section__title">
              Four things every artist needs.
              <br />
              <span className="soft soft--sub">Let&apos;s put the pieces together.</span>
            </h2>
            <p className="section__lead">
              From the creative vision to the business details, we help you build a solid foundation for your
              music career.
            </p>
          </Reveal>
          <div className="grid">
            {PILLARS.map((p, i) => (
              <Reveal key={p.key} delay={i * 100} className="card lift" style={{ background: p.bg }}>
                <Star size={44} fill={p.star} stroke="#1E1B2E" />
                <h3 style={{ marginTop: 18 }}>{p.title}</h3>
                <p>{p.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Packages */}
        <section id="packages" className="wrap section">
          <Star
            size={160}
            fill="none"
            stroke={COLORS.yellow}
            strokeWidth={2.5}
            className="abs spin"
            style={{ right: 24, top: 70, opacity: 0.9 }}
          />
          <Reveal>
            <div className="hand" style={{ color: "var(--rose)" }}>Your music is the starting point.</div>
            <h2 className="section__title">
              Packages.
              <br />
              <span className="soft soft--sub">Let&apos;s build what comes next.</span>
            </h2>
            <p className="section__lead section__lead--small">
              Every artist&apos;s starting point looks different. Let&apos;s find what makes sense for yours. Reach
              out for details on packages and pricing.
            </p>
          </Reveal>
          <div className="grid">
            {PACKAGES.map((p, i) => (
              <Reveal
                key={p.name}
                delay={i * 100}
                className="pkg lift"
                style={{ boxShadow: `8px 8px 0 ${p.color}` }}
              >
                <div className="pkg__head">
                  <h3 className="pkg__name">{p.name}</h3>
                  <Star size={38} fill={p.color} />
                </div>
                <div className="pkg__label">{p.label}</div>
                <p className="pkg__tagline">{p.tagline}</p>
                <p className="pkg__desc">{p.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <a href="#contact" className="price-link">Contact us for pricing →</a>
                  {p.note && <span className="small">{p.note}</span>}
                </div>
                <ul className="list">
                  {p.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
                {p.footnote && <div className="pkg__foot">{p.footnote}</div>}
              </Reveal>
            ))}
          </div>
        </section>

        {/* Bundles */}
        <section id="bundles" className="wrap section">
          <Reveal>
            <div className="hand" style={{ color: "var(--sky)" }}>better together</div>
            <h2 className="section__title">
              Bundles
              <br />
              <span className="soft soft--sub">Build your constellation.</span>
            </h2>
            <p className="section__lead section__lead--small">
              A little creative direction, a little industry guidance, all working together.
            </p>
          </Reveal>
          <div className="grid grid--bundles">
            {BUNDLES.map((b, i) => (
              <Reveal key={b.combo} delay={i * 100} className="bundle lift" style={{ background: b.bg }}>
                <div className="bundle__combo">
                  {b.combo.split(" + ").map((name, j) => (
                    <span key={name} className="bundle__name">
                      {j > 0 && <span className="bundle__plus">+</span>}
                      {name}
                      <Star size={30} fill={PKG_COLOR[name] || COLORS.yellow} stroke="#1E1B2E" strokeWidth={2} className="bundle__star" />
                    </span>
                  ))}
                </div>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
                <a href="#contact" className="price-link">Contact us for pricing →</a>
              </Reveal>
            ))}
          </div>

          <Reveal className="star-treatment">
            <Star size={90} fill={COLORS.yellow} className="abs twinkle" style={{ right: -22, top: -26, opacity: 0.9 }} />
            <div style={{ flex: "999 1 420px", minWidth: 0 }}>
              <div className="tag">The full experience</div>
              <h3>Star Treatment</h3>
              <p>
                Everything, start to finish: Launchpad, Astro, a full Comet campaign and three months of
                Orbit.
              </p>
            </div>
            <div style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <a href="#contact" className="btn btn--accent" style={{ minHeight: 48, borderColor: "var(--accent)", textAlign: "center", lineHeight: 1.25, flexDirection: "column", justifyContent: "center" }}>
                <span>I want the</span>
                <span>Star Treatment</span>
              </a>
              <div style={{ fontSize: 16 }}>Contact us for pricing</div>
            </div>
          </Reveal>

        </section>

        {/* Contact */}
        <section id="contact" className="wrap contact">
          <Reveal className="pinknote-wrap">
            <Star size={86} fill={COLORS.yellow} stroke="#1E1B2E" strokeWidth={2.5} className="abs twinkle" style={{ top: -40, right: -18, zIndex: 2 }} />
            <Star size={64} fill={COLORS.blue} className="abs twinkle2" style={{ bottom: -26, left: -22, zIndex: 0 }} />
            <div className="pinknote">
              <h2>
                Ready to <span className="it">see stars?</span>
              </h2>
              <p>
                New music? Big ideas? No clue where to start?
                <br />
                Let&apos;s figure it out together!
              </p>
              <div className="contact__ctas">
                <a href="/questionnaire" className="btn btn--accent">
                  Find your package
                </a>
                <a href={`mailto:${CONTACT.email}`} className="btn btn--dark">
                  Email us
                </a>
                <a href={CONTACT.instagramUrl} className="btn" target="_blank" rel="noopener noreferrer">
                  {CONTACT.instagramHandle}
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="footer">
        <span className="disp" style={{ fontWeight: 900, fontStyle: "italic" }}>Seeing Stars Agency</span>
        {" · "}Brand and business support for emerging artists · © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
