import { Star, Reveal } from "./components";
import {
  CONTACT,
  COLORS,
  MARQUEE,
  PILLARS,
  PACKAGES,
  BUNDLES,
  STEPS,
  TERMS,
} from "./content";

const markColors = [COLORS.yellow, COLORS.pink, COLORS.blue];

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
          <a href="#services">Services</a>
          <a href="#packages">Packages</a>
          <a href="#bundles">Bundles</a>
          <a href="#how">How it works</a>
          <a href="/login">Client login</a>
        </nav>
        <a href="#contact" className="btn btn--dark btn--sm">
          Book a free call
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
              We help emerging artists build a brand people remember, and we handle{" "}
              <span className="hl">the business behind the music</span>, so every play pays.
            </p>
            <div className="hero__ctas rise d5">
              <a href="/questionnaire" className="btn btn--accent">
                Start here
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
                  <b>Your music deserves</b> to be heard, credited and paid. We take care of all three.
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
            <div className="hand" style={{ color: "var(--sky)" }}>what we do</div>
            <h2 className="section__title">
              Four things every artist needs.
              <br />
              <span className="soft">We do all of them.</span>
            </h2>
            <p className="section__lead">
              Most agencies do brand or paperwork. We do both, so your music looks the part and earns what it
              should.
            </p>
          </Reveal>
          <div className="grid">
            {PILLARS.map((p, i) => (
              <Reveal key={p.tag} delay={i * 100} className="card lift" style={{ background: p.bg }}>
                <Star size={44} fill={p.star} stroke="#1E1B2E" />
                <div className="tag" style={{ marginTop: 16 }}>{p.tag}</div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
                <ul className="list">
                  {p.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
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
            <div className="hand" style={{ color: "var(--rose)" }}>pick your star</div>
            <h2 className="section__title">Packages</h2>
            <p className="section__lead">
              Start with what you need most. Every package comes with clear deliverables and a timeline in
              writing. Contact us for pricing.
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
                <p className="pkg__tagline">{p.tagline}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <a href="#contact" className="price-link">Contact us for pricing →</a>
                  {p.note && <span className="small">{p.note}</span>}
                </div>
                <ul className="list">
                  {p.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
                <div className="pkg__foot">{p.footnote}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Bundles */}
        <section id="bundles" className="wrap section">
          <Reveal>
            <div className="hand" style={{ color: "var(--sky)" }}>better together</div>
            <h2 className="section__title" style={{ marginBottom: 48 }}>Bundles</h2>
          </Reveal>
          <div className="grid" style={{ gap: 24 }}>
            {BUNDLES.map((b, i) => (
              <Reveal key={b.combo} delay={i * 100} className="bundle lift" style={{ background: b.bg }}>
                <div className="tag">{b.combo}</div>
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
                Everything, start to finish: Launchpad, Liftoff, a full Spark campaign and three months of
                Orbit. Payable in installments.
              </p>
            </div>
            <div style={{ flex: "1 1 220px" }}>
              <div style={{ fontSize: 16 }}>Contact us for pricing</div>
              <a href="#contact" className="btn btn--accent" style={{ marginTop: 14, minHeight: 48, borderColor: "var(--accent)" }}>
                I want the Star Treatment
              </a>
            </div>
          </Reveal>

          <p style={{ margin: "24px 0 0", fontSize: 16 }}>
            <strong>Already worked with us?</strong> Ask about our returning-artist rate for Orbit.
          </p>
        </section>

        {/* Promise */}
        <section className="wrap" style={{ paddingTop: 96, position: "relative", zIndex: 1 }}>
          <Reveal className="promise">
            <Star size={70} fill="#C2417F" style={{ flexShrink: 0 }} />
            <div style={{ flex: "999 1 400px", minWidth: 0 }}>
              <h3>Real listeners, no shortcuts.</h3>
              <p>
                We pitch your music to the right playlists and curators. We never buy placements or streams,
                and no one can honestly guarantee them. Platforms penalize fake plays; your music deserves fans
                who come back.
              </p>
            </div>
          </Reveal>
        </section>

        {/* How it works */}
        <section id="how" className="wrap section" style={{ paddingTop: 96 }}>
          <Reveal>
            <div className="hand" style={{ color: "var(--rose)" }}>simple and in writing</div>
            <h2 className="section__title" style={{ marginBottom: 48 }}>How it works</h2>
          </Reveal>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 120}>
                <div className="step__num" style={{ color: s.color }}>{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </ol>
          <div className="terms">
            {TERMS.map(([b, t]) => (
              <div key={b}>
                <strong>{b}</strong> {t}
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="wrap contact">
          <Star size={80} fill={COLORS.yellow} stroke="#1E1B2E" strokeWidth={2.5} className="twinkle" style={{ margin: "0 auto 12px" }} />
          <Reveal>
            <h2>
              Ready to <span className="it">see stars?</span>
            </h2>
            <p>
              Tell us about your music. The first call is free, and you'll leave with at least one thing you can
              fix today.
            </p>
            <div className="contact__ctas">
              <a href="/questionnaire" className="btn btn--accent">
                Start with the questionnaire
              </a>
              <a href={`mailto:${CONTACT.email}`} className="btn btn--dark">
                Book a free call
              </a>
              <a href={CONTACT.instagramUrl} className="btn" target="_blank" rel="noopener noreferrer">
                {CONTACT.instagramHandle}
              </a>
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
