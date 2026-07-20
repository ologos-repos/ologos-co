import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import HeroField from "./HeroField.jsx";

if (typeof document !== "undefined") {
  const existing = document.getElementById("ologos-fonts");
  if (!existing) {
    const link = document.createElement("link");
    link.id = "ologos-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=IBM+Plex+Sans:wght@300;400;500&display=swap";
    document.head.appendChild(link);
  }
  // Force the iframe body itself dark
  document.body.style.background = "#1a1a1a";
  document.body.style.margin = "0";
  document.body.style.padding = "0";
}

const BG     = "#1a1a1a";
const BG2    = "#222222";
const BGlight= "#f0ede6";
const FG     = "#f0ede6";
const FGDIM  = "rgba(240,237,230,0.7)";
const FGMID  = "rgba(240,237,230,0.5)";
const FGBORDER = "rgba(240,237,230,0.2)";
const DARK   = "#1a1a1a";
const DARKDIM = "rgba(26,26,26,0.6)";

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #1a1a1a !important; }

  .site-root {
    background: #1a1a1a;
    color: #f0ede6;
    min-height: 100vh;
    font-family: 'IBM Plex Sans', Georgia, serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.5rem 2.5rem;
    transition: background 0.3s, border-color 0.3s;
    border-bottom: 1px solid transparent;
  }
  .nav.scrolled {
    background: rgba(26,26,26,0.97);
    border-color: rgba(240,237,230,0.15);
    backdrop-filter: blur(10px);
  }
  .nav-logo {
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 700; font-size: 1.2rem;
    color: #f0ede6; cursor: pointer; letter-spacing: 0.01em;
    display: flex; align-items: center; gap: 0.6rem;
  }
  .nav-mark { height: 1.75rem; width: auto; display: block; }
  .nav-links { display: flex; gap: 2.5rem; list-style: none; align-items: center; }
  .nav-links a {
    font-size: 0.78rem; font-weight: 400;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: rgba(240,237,230,0.8); text-decoration: none;
    cursor: pointer; transition: color 0.2s;
  }
  .nav-links a:hover { color: #f0ede6; }
  .nav-cta {
    color: #f0ede6 !important;
    border-bottom: 1px solid rgba(240,237,230,0.5);
    padding-bottom: 1px;
  }

  /* HERO */
  .hero {
    position: relative;
    z-index: 0; /* establishes a stacking context so .hero-field's z-index: -1 stays scoped to the hero, instead of escaping behind the whole page */
    min-height: 100vh;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 7rem 2.5rem 5rem;
    border-bottom: 1px solid rgba(240,237,230,0.15);
  }
  .hero-field {
    position: absolute; inset: 0; z-index: -1;
    pointer-events: none;
  }
  .hero-field canvas { display: block; }
  @media (prefers-reduced-motion: reduce) {
    .hero-field { opacity: 0.6; }
  }
  .hero h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2.8rem, 7vw, 7.5rem);
    font-weight: 400; line-height: 1.0;
    letter-spacing: -0.02em; max-width: 1050px;
    margin-bottom: 3rem; color: #f0ede6;
  }
  .hero h1 em { font-style: italic; color: rgba(240,237,230,0.72); }
  .hero-meta {
    display: flex; justify-content: space-between; align-items: flex-end;
    border-top: 1px solid rgba(240,237,230,0.2);
    padding-top: 2rem; flex-wrap: wrap; gap: 2rem;
  }
  .hero-desc {
    font-size: 1rem; font-weight: 300; line-height: 1.75;
    color: rgba(240,237,230,0.8); max-width: 460px;
  }
  .hero-actions { display: flex; gap: 1rem; flex-shrink: 0; }

  /* tasteful "Explore our ventures" / "Explore our thought leadership" links under the headline */
  .hero-explore-group {
    display: flex; flex-direction: column; align-items: flex-start; gap: 0.6rem;
    margin: -1.5rem 0 2rem;
  }
  .hero-explore {
    display: inline-block;
    width: fit-content;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.9rem; font-weight: 400;
    letter-spacing: 0.04em;
    color: #f0ede6; text-decoration: none; cursor: pointer;
    border-bottom: 1px solid rgba(240,237,230,0.4);
    padding-bottom: 2px;
    transition: color 0.2s, border-color 0.2s;
  }
  .hero-explore:hover { color: #c8956a; border-color: #c8956a; }
  .hero-explore .arrow { transition: transform 0.2s; display: inline-block; }
  .hero-explore:hover .arrow { transform: translateX(3px); }

  /* BUTTONS */
  .btn-ghost {
    background: transparent; color: #f0ede6;
    padding: 0.7rem 1.5rem;
    border: 1px solid rgba(240,237,230,0.45);
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.78rem; font-weight: 400;
    letter-spacing: 0.07em; text-transform: uppercase;
    cursor: pointer; transition: border-color 0.2s, background 0.2s;
  }
  .btn-ghost:hover { border-color: #f0ede6; background: rgba(240,237,230,0.06); }
  .btn-solid {
    background: #f0ede6; color: #1a1a1a;
    padding: 0.7rem 1.5rem;
    border: 1px solid #f0ede6;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.78rem; font-weight: 500;
    letter-spacing: 0.07em; text-transform: uppercase;
    cursor: pointer; transition: opacity 0.2s;
  }
  .btn-solid:hover { opacity: 0.88; }

  /* SECTIONS */
  .section { padding: 6rem 2.5rem; border-bottom: 1px solid rgba(240,237,230,0.12); }
  .section-mid { background: #222222; }
  .section-light { background: #f0ede6; color: #1a1a1a; }

  /* TYPOGRAPHY */
  .label {
    font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase;
    font-weight: 400; color: rgba(240,237,230,0.6); margin-bottom: 0.75rem;
  }
  .label-dark { color: rgba(26,26,26,0.5); }

  .heading {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2rem, 4vw, 3.5rem);
    font-weight: 400; line-height: 1.1;
    letter-spacing: -0.01em; color: #f0ede6;
  }
  .heading em { font-style: italic; color: rgba(240,237,230,0.7); }
  .heading-dark { color: #1a1a1a; }

  .body-text {
    font-size: 1rem; font-weight: 300; line-height: 1.8;
    color: rgba(240,237,230,0.82);
  }
  .body-text-dark { color: rgba(26,26,26,0.7); }

  /* LAYOUT */
  .two-col {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 5rem; max-width: 1200px; align-items: start;
  }
  .three-col { display: grid; grid-template-columns: repeat(3, 1fr); }

  /* RULE ITEMS */
  .rule-item {
    padding: 2rem 0;
    border-top: 1px solid rgba(240,237,230,0.15);
    display: grid; grid-template-columns: 3rem 1fr; gap: 1.5rem;
  }
  .rule-item > div { min-width: 0; }
  .rule-item-light { border-color: rgba(26,26,26,0.12); }
  .rule-num {
    font-size: 0.72rem; letter-spacing: 0.06em;
    color: rgba(240,237,230,0.5); padding-top: 0.15rem;
  }
  .rule-num-dark { color: rgba(26,26,26,0.4); }
  .rule-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.1rem; font-weight: 400;
    color: #f0ede6; margin-bottom: 0.4rem;
  }
  .rule-title-dark { color: #1a1a1a; }
  .rule-body {
    font-size: 0.875rem; font-weight: 300; line-height: 1.65;
    color: rgba(240,237,230,0.72);
  }
  .rule-body-dark { color: rgba(26,26,26,0.6); }

  /* compact citation list — Thought Leadership page */
  .paper-item {
    padding: 0.6rem 0;
    border-bottom: 1px solid rgba(240,237,230,0.08);
    display: flex; justify-content: space-between; align-items: baseline;
    gap: 1.5rem; flex-wrap: wrap;
  }
  .paper-item:last-child { border-bottom: none; }
  .paper-title {
    font-size: 0.9rem; font-weight: 300; line-height: 1.5;
    color: rgba(240,237,230,0.85); text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: color 0.2s, border-color 0.2s;
  }
  .paper-title:hover { color: #c8956a; border-color: rgba(200,149,106,0.5); }
  .paper-note {
    font-size: 0.72rem; letter-spacing: 0.04em; color: rgba(240,237,230,0.4);
    white-space: nowrap; flex-shrink: 0;
  }

  /* PROCESS */
  .process-col {
    padding: 3rem 2.5rem;
    border-left: 1px solid rgba(240,237,230,0.12);
  }
  .process-col:first-child { border-left: none; }
  .process-num {
    font-size: 0.72rem; letter-spacing: 0.1em;
    color: rgba(240,237,230,0.55); margin-bottom: 2rem; display: block;
  }
  .process-col h3 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.35rem; font-weight: 400; color: #f0ede6;
    margin-bottom: 0.85rem; line-height: 1.25;
  }
  .process-col p {
    font-size: 0.875rem; font-weight: 300; line-height: 1.7;
    color: rgba(240,237,230,0.72);
  }

  /* STATEMENT */
  .statement {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.6rem, 3.5vw, 3rem);
    font-weight: 400; line-height: 1.3;
    letter-spacing: -0.01em; max-width: 900px;
    color: #f0ede6;
  }
  .statement em { font-style: italic; color: rgba(240,237,230,0.65); }

  /* TEAM */
  .team-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid rgba(26,26,26,0.12);
  }
  .team-card {
    padding: 2.5rem 1.75rem;
    border-right: 1px solid rgba(26,26,26,0.1);
  }
  .team-card:last-child { border-right: none; }
  .team-card:nth-child(4n) { border-right: none; }
  .team-card:nth-child(n+5) { border-top: 1px solid rgba(26,26,26,0.1); }
  .team-init {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.8rem; font-weight: 400;
    color: rgba(26,26,26,0.2); margin-bottom: 1.5rem;
  }
  .team-name {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1rem; font-weight: 700;
    color: #1a1a1a; margin-bottom: 0.3rem;
  }
  .team-role {
    font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase;
    color: rgba(26,26,26,0.5); margin-bottom: 1.1rem;
  }
  .team-bio {
    font-size: 0.82rem; font-weight: 300;
    color: rgba(26,26,26,0.65); line-height: 1.65;
  }

  /* CONTACT FORM */
  .field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.25rem; }
  .field label {
    font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(240,237,230,0.55);
  }
  .field input, .field textarea, .field select {
    background: transparent;
    border: none; border-bottom: 1px solid rgba(240,237,230,0.25);
    padding: 0.6rem 0;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.9rem; font-weight: 300; color: #f0ede6;
    outline: none; transition: border-color 0.2s;
    -webkit-appearance: none;
  }
  .field input::placeholder, .field textarea::placeholder { color: rgba(240,237,230,0.3); }
  .field input:focus, .field textarea:focus, .field select:focus {
    border-color: rgba(240,237,230,0.7);
  }
  .field textarea { resize: none; min-height: 100px; }
  .field select option { background: #1a1a1a; }

  /* FOOTER */
  .footer {
    background: #1a1a1a;
    padding: 2.5rem 2.5rem;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 1.5rem;
    border-top: 1px solid rgba(240,237,230,0.12);
  }
  .footer-logo {
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 700; font-size: 1rem; color: #f0ede6;
    display: flex; align-items: center; gap: 0.55rem;
  }
  .footer-mark { height: 1.5rem; width: auto; display: block; }
  .footer-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem 2rem; list-style: none; }
  .footer-links a {
    font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase;
    color: rgba(240,237,230,0.45); text-decoration: none; cursor: pointer;
    transition: color 0.2s;
  }
  .footer-links a:hover { color: #f0ede6; }
  .footer-copy { font-size: 0.72rem; color: rgba(240,237,230,0.3); }

  .page { animation: fadeUp 0.3s ease; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; } }

  @media (max-width: 900px) {
    .two-col { grid-template-columns: 1fr; gap: 3rem; }
    .three-col { grid-template-columns: 1fr; }
    .team-grid { grid-template-columns: 1fr 1fr; }
    .team-card { border-bottom: 1px solid rgba(26,26,26,0.1); }
    .process-col { border-left: none; border-top: 1px solid rgba(240,237,230,0.12); }
    .nav-links { display: none; }
  }
  @media (max-width: 600px) {
    .section { padding: 4rem 1.5rem; }
    .nav { padding: 1.25rem 1.5rem; }
    .hero { padding: 6rem 1.5rem 3.5rem; }
    .team-grid { grid-template-columns: 1fr; }
    .footer { flex-direction: column; }
    .footer-links { gap: 0.75rem 1.25rem; }
  }
`;

const PAGE_PATHS = {
  home: "/",
  ventures: "/ventures",
  research: "/thought-leadership",
  about: "/about",
  philosophy: "/philosophy",
  team: "/team",
  contact: "/contact",
};
const PATH_TO_PAGE = Object.fromEntries(Object.entries(PAGE_PATHS).map(([k, v]) => [v, k]));

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const go = (p) => { navigate(PAGE_PATHS[p] ?? "/"); window.scrollTo(0,0); };
  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="nav-logo" onClick={() => go("home")}>
        <img src={`${import.meta.env.BASE_URL}ologos-mark.png`} alt="Ologos" className="nav-mark" />
        <span>Ologos</span>
      </div>
      <ul className="nav-links">
        {[["ventures","Ventures"],["research","Thought Leadership"],["about","About"],["philosophy","Philosophy"],["team","Team"]].map(([p,label]) => (
          <li key={p}><a onClick={() => go(p)}>{label}</a></li>
        ))}
        <li><a className="nav-cta" onClick={() => go("contact")}>Contact</a></li>
      </ul>
    </nav>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const go = (p) => { navigate(PAGE_PATHS[p] ?? "/"); window.scrollTo(0,0); };
  return (
    <div className="page">
      <section className="hero">
        <HeroField />
        <h1>
          An innovation factory<br />
          <em>building systems</em><br />
          ready for what's next.
        </h1>
        <div className="hero-explore-group">
          <a className="hero-explore" onClick={() => go("ventures")}>Explore our ventures <span className="arrow">→</span></a>
          <a className="hero-explore" onClick={() => go("research")}>Explore our thought leadership <span className="arrow">→</span></a>
        </div>
        <div className="hero-meta">
          <p className="hero-desc">
            Ologos is a think tank and innovation factory. We incubate high-conviction ideas under rigorous systems discipline, then spin each one off as an independent venture, structured, mature, and ready for the next phase.
          </p>
          <div className="hero-actions">
            <button className="btn-ghost" onClick={() => go("about")}>How We Work</button>
            <button className="btn-solid" onClick={() => go("contact")}>Partner With Us →</button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="two-col">
          <div>
            <p className="label">The Model</p>
            <h2 className="heading" style={{marginBottom:"2rem"}}>
              Think tank.<br /><em>Innovation factory.</em><br />Venture engine.
            </h2>
          </div>
          <div>
            <p className="body-text" style={{marginBottom:"1.25rem"}}>
              Ologos is the engine that produces investment-ready ventures. When an idea reaches maturity, we spin it off as an independent company with its own cap table, assigned IP, and governance structure.
            </p>
            <p className="body-text">
              The acquirer buys the venture. Ologos walks away capitalized and ready to build the next one.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-mid" style={{padding:"0"}}>
        <div style={{padding:"4rem 2.5rem 0"}}>
          <p className="label">The Process</p>
        </div>
        <div className="three-col" style={{marginTop:"2rem"}}>
          {[
            ["01","Thesis Formation","Every initiative begins with a written, falsifiable thesis: the structural gap, the differentiated approach, the exit path. No thesis, no build."],
            ["02","Collaborative Incubation","Cross-functional teams work iteratively -- combining domain expertise, agentic AI tooling, and Enterprise-grade systems architecture methodology."],
            ["03","Venture Spin-off","Mature ideas become independent companies. Clean cap tables, assigned IP, and documented governance, structured for diligence from day one."],
          ].map(([n,t,b]) => (
            <div className="process-col" key={n}>
              <span className="process-num">{n}</span>
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
        <div style={{height:"4rem"}} />
      </section>

      <section className="section">
        <p className="statement">
          We bring enterprise systems architecture, agentic AI, and applied philosophy of technology to bear on every venture we build. <em>Every venture carries that fingerprint.</em>
        </p>
      </section>

      <section className="section" style={{paddingTop:"0",borderTop:"1px solid rgba(240,237,230,0.12)"}}>
        <div style={{maxWidth:1100}}>
          <p className="label" style={{marginBottom:"2rem"}}>Who We Work With</p>
          {[
            ["Investors","Accredited investors and family offices evaluating exposure to emerging AI and defense-tech ventures before they reach institutional scale."],
            ["Enterprise Clients","Government and commercial enterprises seeking AI-enabled capabilities, enterprise architecture consultation, or pilot partnerships with novel technology."],
            ["Strategic Acquirers","Platform companies and integrators seeking mature, mission-specific products with clean IP, proven teams, and minimal diligence risk."],
          ].map(([t,b],i) => (
            <div className="rule-item" key={t}>
              <span className="rule-num">0{i+1}</span>
              <div>
                <div className="rule-title">{t}</div>
                <div className="rule-body">{b}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="page">
      <section className="section" style={{paddingTop:"8rem",borderBottom:"1px solid rgba(240,237,230,0.12)"}}>
        <p className="label">About Ologos</p>
        <h1 className="heading" style={{fontSize:"clamp(2.5rem,5vw,5rem)",maxWidth:800,marginTop:"1rem"}}>
          Not a startup studio.<br />Not a consulting firm.<br /><em>Something more deliberate.</em>
        </h1>
      </section>

      <section className="section">
        <div className="two-col">
          <div>
            {["Ologos is a think tank and innovation factory, the capital-efficient incubation engine that produces investment-ready ventures.",
              "When an idea matures, we spin it off as an independent company: its own cap table, its own IP assignments, its own governance. The venture is structured for investor diligence, government procurement, or strategic acquisition.",
              "The model is deliberate. Ologos absorbs the early-stage uncertainty so each venture can enter the market clean."
            ].map((t,i) => <p key={i} className="body-text" style={{marginBottom:"1.25rem"}}>{t}</p>)}
          </div>
          <div>
            <p className="label" style={{marginBottom:"1.5rem"}}>What Sets Us Apart</p>
            {[
              ["Thesis-driven","No initiative advances without a documented, falsifiable thesis."],
              ["Enterprise-grade systems rigor","Architecture methodology (UAF/TOGAF) borrowed from large-scale systems engineering, applied to commercial ventures."],
              ["Agentic AI-native","Every venture is built with agentic AI tooling from day one -- not retrofitted."],
              ["Exit-clean by design","Cap tables, IP, and governance are structured for diligence before the first commit."],
            ].map(([t,b]) => (
              <div className="rule-item" key={t}>
                <span />
                <div>
                  <div className="rule-title" style={{fontSize:"0.95rem"}}>{t}</div>
                  <div className="rule-body">{b}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function PhilosophyPage() {
  return (
    <div className="page">
      <section className="section" style={{paddingTop:"8rem",borderBottom:"1px solid rgba(240,237,230,0.12)"}}>
        <p className="label">Philosophy</p>
        <h1 className="heading" style={{fontSize:"clamp(2.5rem,5vw,5rem)",maxWidth:800,marginTop:"1rem"}}>
          The name is<br /><em>the thesis.</em>
        </h1>
      </section>

      <section className="section">
        <div className="two-col">
          <div>
            {[
              <><em style={{fontStyle:"italic",color:"#f0ede6"}}>Logos</em> -- the Greek for word, reason, rational principle -- is not a brand flourish. It is the organizing conviction of the enterprise.</>,
              "AI systems, however sophisticated, are approximations of rational structure that precedes computation. That distinction shapes how we build. Systems designed without a theory of their own limits tend to exceed them in the wrong direction: overconfident, misaligned, brittle at the boundary conditions that matter most.",
              "Human judgment is not a bottleneck to be engineered away. It is the calibration mechanism that makes AI capability trustworthy. Every Ologos venture reflects this posture: agentic AI as amplification, not replacement.",
            ].map((t,i) => <p key={i} className="body-text" style={{marginBottom:"1.25rem"}}>{t}</p>)}
          </div>
          <div style={{borderLeft:"1px solid rgba(240,237,230,0.18)",paddingLeft:"2.5rem"}}>
            <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"1.35rem",fontWeight:400,lineHeight:1.45,color:"rgba(240,237,230,0.9)",marginBottom:"1.5rem",fontStyle:"italic"}}>
              "Intelligence is not a product of complexity. It is a participation in order that precedes it."
            </p>
            <p style={{fontSize:"0.72rem",letterSpacing:"0.08em",textTransform:"uppercase",color:"rgba(240,237,230,0.4)"}}>
              The founding thesis of Ologos
            </p>
          </div>
        </div>
      </section>

      <section className="section section-mid">
        <div style={{maxWidth:1100}}>
          <p className="label" style={{marginBottom:"2rem"}}>Operating Principles</p>
          {[
            ["Thesis before build","No initiative advances without a written, falsifiable thesis."],
            ["Systems over components","Enterprise systems engineering methodology applied to commercial ventures. We model before we code."],
            ["Honesty over confidence","Internal culture that rewards identifying failure modes early. Overconfidence is a design flaw."],
            ["Exit-clean from day one","IP assigned, governance documented, cap table intentional -- before the first commit."],
            ["Human-curated AI","Agentic AI as a force multiplier for human expertise, never a substitute for judgment."],
            ["Logos as ground","AI cannot transcend the rational order it approximates. We build from that constraint."],
          ].map(([t,b],i) => (
            <div className="rule-item" key={t}>
              <span className="rule-num">0{i+1}</span>
              <div>
                <div className="rule-title">{t}</div>
                <div className="rule-body">{b}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TeamPage() {
  const team = [
    {init:"ML",name:"Micah Longmire",role:"CEO / CTO",bio:"Sr. Systems and AI Architect with a track record of delivering AI capability across classified, multi-cloud federal environments. Micah leads product development from concept through deployment -- building enterprise GenAI platforms, agentic orchestration frameworks, and RAG-based systems that meet the compliance rigor of regulated settings. His hands-on work spans AWS GovCloud and Bedrock, FedRAMP and NIST 800-53, and original tooling including CrewPort, an MCP-native AI agent marketplace. His orientation is consistent: moving AI from abstract promise into usable, governed, mission-relevant capability."},
    {init:"JL",name:"Jay Longmire",role:"CFO / COO",bio:"Technology consultant and CEO of Peak TSP with two decades of experience bridging executive objectives and real-world technical execution. Jay's work spans software implementation, custom development, IT consulting, and business-process improvement -- with an MBA and hands-on technical depth that lets him operate fluently across both boardroom and infrastructure. His military background as an automation officer with the Mississippi Army National Guard, including deployments to Iraq, brings a disciplined, mission-focused approach to operational leadership and execution."},
    {init:"JK",name:"Justin Kuiper, CISSP",role:"CISO",bio:"Cybersecurity and space systems architect with two decades of experience across aerospace, defense, high-performance computing, AI, and hybrid cloud infrastructure. Justin currently serves as Director of Architecture & Engineering at an award-winning aerospace and defense value-added reseller, where he leads secure cloud and infrastructure solutions for complex, multi-tenant environments supporting AI/ML workloads, defense missions, and critical infrastructure. His approach is secure-by-design from the ground up -- connecting technical rigor directly to operational outcomes."},
    {init:"JDL",name:"James D. Longmire",role:"CIO / CMO",bio:"James D. (JD) Longmire is an award-winning technology strategist, aerospace and defense fellow, and Senior Systems Architect with more than 30 years in enterprise and mission IT. He specializes in designing and governing federated digital ecosystems for regulated, mission-critical environments, spanning AI-enabled enterprise platforms, agentic systems, digital thread strategy, architecture governance, and large-scale infrastructure modernization. In parallel, he conducts independent research on the capabilities and limits of generative AI and the architectural requirements for trustworthy, accountable systems. His guiding principle is consistent: architecture must be technically rigorous, operationally effective, governable at scale, and aligned with human responsibility."},
    {init:"CAS",name:"C A Schlecht, JD, PhD",role:"CLO",bio:"Patent attorney and IP strategist with a PhD in chemistry and 15+ years of protecting innovation across life sciences, pharmaceuticals, mechanical engineering, CS/AI, and medtech. As founder of Midtown Intellectual Property, PC, C A leads patent preparation and prosecution, trademark and copyright registration, portfolio management, enforcement, and corporate structuring for startups and established companies. He brings that same rigor to Ologos, having served as Chief Legal Officer for a clinical-stage device company. His orientation is consistent: intellectual property should move ideas from the benchtop to market, cleanly protected and ready for diligence."},
  ];
  return (
    <div className="page">
      <section className="section" style={{paddingTop:"8rem",borderBottom:"1px solid rgba(240,237,230,0.12)"}}>
        <p className="label">The Team</p>
        <h1 className="heading" style={{fontSize:"clamp(2.5rem,5vw,5rem)",maxWidth:700,marginTop:"1rem"}}>
          Operators with<br /><em>conviction.</em>
        </h1>
      </section>

      <section className="section section-light">
        <div style={{maxWidth:1200}}>
          <p className="label label-dark" style={{marginBottom:"1rem"}}>Leadership</p>
          <p className="body-text body-text-dark" style={{maxWidth:560,marginBottom:"3rem"}}>
            The Ologos leadership team combines enterprise systems architecture, AI engineering, financial governance, and cybersecurity -- applied with the discipline of defense industry and the velocity of a lean venture operation.
          </p>
          <div className="team-grid">
            {team.map(m => (
              <div className="team-card" key={m.name}>
                <div className="team-init">{m.init}</div>
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                <div className="team-bio">
                  {(Array.isArray(m.bio) ? m.bio : [m.bio]).map((para, i) => (
                    <p key={i} style={i > 0 ? {marginTop:"0.7rem"} : undefined}>{para}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="two-col">
          <div>
            <p className="label">Collaborate</p>
            <h2 className="heading" style={{marginBottom:"1.5rem"}}>
              We work with<br /><em>builders who think first.</em>
            </h2>
          </div>
          <div style={{paddingTop:"0.5rem"}}>
            <p className="body-text" style={{marginBottom:"1.5rem"}}>
              Ologos engages technical collaborators, research partners, and domain experts on a venture-by-venture basis. If your discipline intersects with AI, enterprise systems, or applied philosophy of technology, we want to hear from you.
            </p>
            <p style={{fontSize:"0.75rem",letterSpacing:"0.06em",textTransform:"uppercase",color:"rgba(240,237,230,0.45)"}}>
              NDA available for prospective collaborators.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function VenturesPage() {
  const Venture = ({ n, name, tag, stage, what, sowhat, link }) => (
    <div className="rule-item">
      <span className="rule-num">{n}</span>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:"1rem",flexWrap:"wrap"}}>
          <div className="rule-title" style={{fontSize:"1.2rem"}}>
            {name}
            {tag && <em style={{fontStyle:"normal",color:"#c8956a",fontSize:"0.68rem",marginLeft:"0.65rem",textTransform:"uppercase",letterSpacing:"0.1em"}}>{tag}</em>}
          </div>
          {stage && <span style={{fontSize:"0.7rem",textTransform:"uppercase",letterSpacing:"0.08em",color:"rgba(240,237,230,0.4)"}}>{stage}</span>}
        </div>
        <div className="rule-body" style={{marginTop:"0.45rem"}}>{what}</div>
        <div className="rule-body" style={{marginTop:"0.5rem"}}>
          <span style={{color:"#c8956a",fontWeight:500}}>So what.</span> {sowhat}
        </div>
        {link && (
          <a href={link} target="_blank" rel="noopener" style={{display:"inline-block",marginTop:"0.75rem",fontSize:"0.82rem",color:"#c8956a",textDecoration:"none",borderBottom:"1px solid rgba(200,149,106,0.4)",paddingBottom:"1px"}}>
            {link.replace(/^https?:\/\//,"")} →
          </a>
        )}
      </div>
    </div>
  );
  return (
    <div className="page">
      <section className="section" style={{paddingTop:"8rem",borderBottom:"1px solid rgba(240,237,230,0.12)"}}>
        <p className="label">Ventures</p>
        <h1 className="heading" style={{fontSize:"clamp(2.5rem,5vw,5rem)",maxWidth:820,marginTop:"1rem"}}>
          The portfolio,<br /><em>in flight.</em>
        </h1>
        <p className="body-text" style={{maxWidth:660,marginTop:"1.75rem"}}>
          Ologos is not one bet. It is a venture engine, and every project here shares one fingerprint: governed, auditable, sovereign AI. The breadth is the proof, a coherent portfolio attacking the agent economy from the standard down to the product, with live systems already running.
        </p>
      </section>

      <section className="section">
        <p className="label" style={{marginBottom:"1.5rem"}}>Flagship &amp; Products</p>
        <Venture n="01" name="CrewPort" tag="flagship" stage="Live" link="https://crewport.ai"
          what="Marketplace for AI agent crews, with contract enforcement as a service."
          sowhat="The agent economy is exploding, but there is no trusted layer to hire, compose, and hold accountable teams of AI agents. CrewPort is that marketplace, with enforceable contracts as the trust mechanism. The toll road for multi-agent work." />
        <Venture n="02" name="AIOC" tag="enterprise AI operations" stage="Proof of concept · enterprise engagement" link="https://ologos.co/aioc/"
          what="Enterprise AI Operations Center: a governed AI operations layer, proven out for enterprise customers, that sits above commercial AI platforms without ever depending on one."
          sowhat="Enterprises are choosing between vendor lock-in and rebuilding everything themselves. AIOC proves a third path: your own governed control plane, commercial models where they fit, sovereign self-hosted models where they don't, already demonstrated in a working proof of concept for a highly regulated enterprise customer, with the sovereign self-hosted path architected and requirement-accepted for that customer's air-gapped environment." />
        <Venture n="03" name="OlogosOffice" stage="Live · demo on request"
          what="Ologos' own gated, self-hosted, AI-native collaboration and productivity suite: mail, files, office, chat, meet, git and CI, search, and an AI copilot."
          sowhat="Regulated, defense, and sovereignty-bound orgs cannot put their work on hyperscaler clouds, and the agent economy is dragging everything toward those clouds. OlogosOffice is the stack they can own, AI built in. Ologos runs its own operations on it, so the dogfood is the proof." />
        <Venture n="04" name="SKIPJACK" stage="In development"
          what="A zero-trust, edge-first agentic platform for disconnected and contested environments. One governed substrate that carries identity, memory, assurance, just-in-time privilege, and behavioral observability for fleets of AI agents, built to run where the network is degraded, intermittent, or absent."
          sowhat="Every agent-security tool on the market assumes the cloud is reachable. Agent identity is the problem nobody has solved, and only one percent of organizations have adopted just-in-time privileged access. SKIPJACK is built for exactly that gap: privilege that exists only while it is observed and fails closed when visibility is lost, a custody and freshness layer that stamps the age of every piece of data, and observation of agents from beneath the runtime rather than from their own self-reports. The hyperscalers are structurally weakest here because they are built for connectivity and scale. That is the wedge." />
        <Venture n="05" name="DEXter" tag="the user console" stage="Live"
          what="Governed, OAuth-gated GUI agent console and artifact engine for the Ologos ecosystem."
          sowhat="The usable front door to governed agents, the copilot UX that makes the platform sellable to non-engineers. Half of the human control layer." />
        <Venture n="06" name="Ologos Operator" tag="the control plane" stage="Live"
          what="Super-admin operator console for a governed agent fleet: a gated web UI to launch, authenticate, stream, persist, and audit agent sessions across the org."
          sowhat="Every enterprise that deploys AI agents at scale needs one governed pane of glass to run and control them, not a pile of terminals. The control plane is where the recurring enterprise license lives, the surface that turns having agents into governing agents." />
      </section>

      <section className="section section-mid">
        <p className="label" style={{marginBottom:"1.5rem"}}>Foundational IP &amp; Standards</p>
        <Venture n="07" name="AIDE" stage="Public corpus + platform"
          what="The governed, auditable, model-agnostic AI reference architecture and its canonical standards (DEA, OrdSA, MxM, OAgents, AEON, AIDEX)."
          sowhat="Every product here is an instance of this. Owning the standard for governed enterprise AI is the durable asset; the ventures are its proof points." />
        <Venture n="08" name="AHES" tag="AI Harness Engineering Standard" stage="Draft standard v0.1 · public" link="https://github.com/ologos-repos/ai-harness-engineering"
          what="A normative engineering standard for the AI harness itself -- the control environment surrounding one or more AI models -- across sixteen harness domains, from model gateways to evidence capture."
          sowhat="Harness engineering is the discipline every AIOC engagement runs on. AHES formalizes it into numbered, checkable requirements instead of an essay -- draft v0.1, not yet released for conformance use, developed openly rather than kept as an internal trade secret." />
        <Venture n="09" name="AICP" stage="Protocol"
          what="Agent Identity Card Protocol: platform-mediated agent identity, tool injection, and work-lifecycle management."
          sowhat="Enterprises will not hand tools and data to agents they cannot identify. Foundational protocol IP for the trust layer of the agent economy." />
        <Venture n="10" name="Nous" stage="Library"
          what="Persistent agent memory architecture: three-tier, PostgreSQL plus SQLite plus embedded vector retrieval, with multi-agent isolation."
          sowhat="Memory is the unsolved hard part of reliable agents. A reusable, productizable layer that stands on its own." />
        <Venture n="11" name="Eidolon + Ordinal" stage="Spec + reference impl"
          what="A domain-agnostic PLM engine (phase gates, requirements tracing, ABAC) and a visual modeling language for AI-driven systems engineering."
          sowhat="The systems-engineering rigor that is the Ologos fingerprint, packaged as sellable tooling for regulated product orgs." />
      </section>

      <section className="section" style={{paddingTop:"0",borderTop:"1px solid rgba(240,237,230,0.12)"}}>
        <p style={{fontSize:"0.82rem",fontStyle:"italic",color:"rgba(240,237,230,0.4)",maxWidth:660}}>
          A snapshot, not a prospectus. Most projects are pre-revenue and in-flight; the viability story is breadth, coherence, live systems, and velocity.
        </p>
      </section>
    </div>
  );
}

function ThoughtLeadershipPage() {
  const Paper = ({ title, doi, note }) => (
    <div className="paper-item">
      <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener" className="paper-title">{title}</a>
      {note && <span className="paper-note">{note}</span>}
    </div>
  );
  const Tier = ({ label, children }) => (
    <div style={{marginBottom:"2.25rem"}}>
      <p className="label" style={{marginBottom:"0.85rem",color:"rgba(240,237,230,0.45)"}}>{label}</p>
      {children}
    </div>
  );

  return (
    <div className="page">
      <section className="section" style={{paddingTop:"8rem",borderBottom:"1px solid rgba(240,237,230,0.12)"}}>
        <p className="label">Thought Leadership</p>
        <h1 className="heading" style={{fontSize:"clamp(2.5rem,5vw,5rem)",maxWidth:820,marginTop:"1rem"}}>
          Published research,<br /><em>not marketing copy.</em>
        </h1>
        <p className="body-text" style={{maxWidth:700,marginTop:"1.75rem"}}>
          The architecture and governance research behind Ologos's ventures is published openly, DOI-registered, and independently citable — not confined to internal decks. This is the corpus itself, curated to what's professionally relevant here; the fuller personal bodies of work (including research outside AI) are linked via ORCID for anyone who wants them.
        </p>
      </section>

      <section className="section">
        <p className="label" style={{marginBottom:"0.5rem"}}>AIDE Canon &middot; JD Longmire &amp; Micah Longmire</p>
        <p className="body-text" style={{maxWidth:700,marginBottom:"2rem"}}>
          The AI-centric Digital Ecosystem (AIDE) reference architecture and its constituent standards, foundation through enterprise-platform tiers. Canonical home: <a href="https://github.com/ologos-repos/aide-canon" target="_blank" rel="noopener" style={{color:"#c8956a"}}>aide-canon</a>. Full corpora: <a href="https://orcid.org/0009-0009-1383-7698" target="_blank" rel="noopener" style={{color:"#c8956a"}}>JD Longmire (ORCID)</a> &middot; <a href="https://orcid.org/0009-0006-7608-9322" target="_blank" rel="noopener" style={{color:"#c8956a"}}>Micah Longmire (ORCID)</a>.
        </p>

        <Tier label="Foundation">
          <Paper title="Human-Curated, AI-Enabled (HCAE): A Framework for Reliable AI Deployment" doi="10.5281/zenodo.18368697" />
          <Paper title="AI Dunning-Kruger (AIDK): A Framework for Understanding Structural Epistemic Limitations" doi="10.5281/zenodo.18316059" />
        </Tier>
        <Tier label="Constructs">
          <Paper title="Digital Ecosystems Architecture (DEA): A Three-Baseline Framework for Coherent Digital Realization" doi="10.5281/zenodo.20349598" />
          <Paper title="Ordinal Systems Architecture (OrdSA): A Control Grammar for Enterprise AI Authority" doi="10.5281/zenodo.20334233" />
          <Paper title="Mx-Modes: A Meta-Harness Framework for Multi-Mode AI Operation" doi="10.5281/zenodo.20419449" />
          <Paper title="OAgents: A Behavioral Envelope Standard for Trustworthy AI Agent Operations" doi="10.5281/zenodo.19425021" />
          <Paper title="OAgents: A Pre-Standardization Draft Profile for Operational AI Agent Trustworthiness" doi="10.5281/zenodo.19427785" />
        </Tier>
        <Tier label="Enterprise platforms">
          <Paper title="AEON: An Enterprise Control Plane Architecture for the Agentic Era" doi="10.5281/zenodo.20349596" />
          <Paper title="AIDEX: An Architecture for Human-Curated, AI-Enabled Knowledge Work" doi="10.5281/zenodo.20349597" />
          <Paper title="The Next Shape of the IT Business Capability Model: From Vendor Substrate to Owned Agentic Platforms (OAAD)" doi="10.5281/zenodo.20349601" />
        </Tier>
        <Tier label="Related">
          <Paper title="The Theseus Agent Thesis: Identity and Memory as the Permanents of AI Agency" doi="10.5281/zenodo.20327458" note="Micah Longmire, sole author" />
          <Paper title="Portable Agent Harness Architecture (PAHA): A Capability-Centric Framework for Governed AI Ecosystems in Sovereignty-Bounded Enterprises" doi="10.5281/zenodo.20112632" />
          <Paper title="Modus Primus: Engineering Specification for AI Architecture (PAHA Companion)" doi="10.5281/zenodo.20113785" />
          <Paper title="Zero Trust for Fallible Agents: Why AI Belongs Inside the ZTA Control Model" doi="10.5281/zenodo.20472686" />
        </Tier>
      </section>

      <section className="section section-mid">
        <div className="inner section">
        <p className="label" style={{marginBottom:"0.5rem"}}>HGC&sup3;AE&sup2; &amp; Managing Agentics Ops &middot; Justin Kuiper</p>
        <p className="body-text" style={{maxWidth:700,marginBottom:"2rem"}}>
          A parallel, independently developed research program on edge/tactical AI governance, agentic operations discipline, and zero-trust agent execution — published as Non Sequitur Publishing. Full corpus: <a href="https://orcid.org/0009-0008-7099-3286" target="_blank" rel="noopener" style={{color:"#c8956a"}}>Justin Kuiper (ORCID)</a>.
        </p>

        <Tier label="HGC³AE² reference architecture">
          <Paper title="Mitigating Confident Misalignment (HGC³AE²)" doi="10.5281/zenodo.19869285" />
          <Paper title="Epistemic Constraints and Semantic Compression" doi="10.5281/zenodo.19869287" />
          <Paper title="The HGC³AE² Reference Architecture" doi="10.5281/zenodo.20180191" />
          <Paper title="Confident Misalignment as Adversarial Attack Surface" doi="10.5281/zenodo.20180223" />
          <Paper title="HGC³AE² at the Degraded Edge" doi="10.5281/zenodo.19991170" />
          <Paper title="Persona Drift and Hallucination" doi="10.5281/zenodo.20006864" />
        </Tier>
        <Tier label="Skipjack Protocol &amp; agentic ops discipline">
          <Paper title="Agile Scrum, Agentics, and the Skipjack Protocol" doi="10.5281/zenodo.19869293" />
          <Paper title="Operating Model for Agentic Teams" doi="10.5281/zenodo.19869313" />
          <Paper title="Sprint Discipline for AI-Augmented Work (Skipjack)" doi="10.5281/zenodo.20006990" />
          <Paper title="The QA Lookback Loop" doi="10.5281/zenodo.20006960" />
          <Paper title="RF Skip Jack" doi="10.5281/zenodo.20755047" />
        </Tier>
        <Tier label="The Problem Series &mdash; tactical edge operations">
          <Paper title="The Classification Problem" doi="10.5281/zenodo.19964128" />
          <Paper title="The Accreditation Problem" doi="10.5281/zenodo.19964133" />
          <Paper title="The Interoperability Problem" doi="10.5281/zenodo.19964139" />
          <Paper title="The Deployment Problem (Series Capstone)" doi="10.5281/zenodo.19964143" />
          <Paper title="The State Coherence Problem" doi="10.5281/zenodo.19986911" />
          <Paper title="The Orchestration Problem" doi="10.5281/zenodo.19986915" />
          <Paper title="The Protocol Selection Problem" doi="10.5281/zenodo.19986917" />
          <Paper title="The Workload Class Problem" doi="10.5281/zenodo.19986920" />
          <Paper title="When the Link Is the Variable" doi="10.5281/zenodo.19986907" />
          <Paper title="The Tactical Substrate (survey)" doi="10.5281/zenodo.19991166" />
        </Tier>
        <Tier label="Managing Agentics Ops &mdash; zero-trust governance">
          <Paper title="The Robo Stack in Production (Managing Agentics Ops)" doi="10.5281/zenodo.20180179" />
          <Paper title="Governance-Gated Execution (Agentic Zero-Trust)" doi="10.5281/zenodo.20180231" />
          <Paper title="Context Integrity Failure as Agentic Cache-Poisoning Analog" doi="10.5281/zenodo.20180225" />
          <Paper title="Silent Fallback as a Denial-of-Validation Attack" doi="10.5281/zenodo.20180229" />
          <Paper title="Reconciliation Checkpoints as SOC Hunt-Cycle Doctrine" doi="10.5281/zenodo.20180233" />
          <Paper title="Tool Orchestration as Confused-Deputy Surface" doi="10.5281/zenodo.20180235" />
          <Paper title="Human Authority Boundary as Chain-of-Custody" doi="10.5281/zenodo.20180239" />
          <Paper title="Intent Integrity" doi="10.5281/zenodo.20180140" />
          <Paper title="Epistemic Weather" doi="10.5281/zenodo.20180142" />
          <Paper title="The Comprehension Instrument for Agentic Systems" doi="10.5281/zenodo.20180181" />
          <Paper title="Operational Plan: Heterogeneous Federation" doi="10.5281/zenodo.20180187" />
        </Tier>
        <Tier label="Compute, cost &amp; provenance">
          <Paper title="Capacity Sourcing" doi="10.5281/zenodo.20180195" />
          <Paper title="Heterogeneous Compute Routing" doi="10.5281/zenodo.20180201" />
          <Paper title="The Capex/Opex Inflection" doi="10.5281/zenodo.20180203" />
          <Paper title="Cost Guardrails for Self-Hosted Inference" doi="10.5281/zenodo.20180205" />
          <Paper title="Cross-Account Harness Coordination" doi="10.5281/zenodo.20180209" />
          <Paper title="Security and Provenance for Self-Hosted Agentic Systems" doi="10.5281/zenodo.20180211" />
        </Tier>
        <Tier label="Edge AI doctrine">
          <Paper title="Edge AI Doctrine" doi="10.5281/zenodo.19869289" />
          <Paper title="Agentic Substrate" doi="10.5281/zenodo.19869291" />
          <Paper title="Alistair Prime in a Box" doi="10.5281/zenodo.19869307" />
        </Tier>
        <Tier label="Cyber governance in emergent stacks">
          <Paper title="Cyber Governance in Emergent Stacks" doi="10.5281/zenodo.20755101" />
          <Paper title="The Autonomy Problem" doi="10.5281/zenodo.20755103" />
          <Paper title="The Intent Preservation Problem" doi="10.5281/zenodo.20755105" />
          <Paper title="The Semantic-Integrity Problem" doi="10.5281/zenodo.20755107" />
        </Tier>
        </div>
      </section>
    </div>
  );
}

const CONTACT_ENDPOINT = "https://forms.ologos.co/contact";

function ContactPage() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      name: `${(fd.get("firstName") || "").trim()} ${(fd.get("lastName") || "").trim()}`.trim(),
      email: (fd.get("email") || "").trim(),
      organization: (fd.get("organization") || "").trim(),
      inquiry_type: (fd.get("inquiry_type") || "").trim(),
      message: (fd.get("message") || "").trim(),
      website: fd.get("website") || "", // honeypot
    };
    setStatus("sending");
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      setStatus(res.ok && data.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="page">
      <section className="section" style={{paddingTop:"8rem",borderBottom:"1px solid rgba(240,237,230,0.12)"}}>
        <p className="label">Contact</p>
        <h1 className="heading" style={{fontSize:"clamp(2.5rem,5vw,5rem)",maxWidth:700,marginTop:"1rem"}}>
          Let's build something<br /><em>worth building.</em>
        </h1>
      </section>

      <section className="section">
        <div className="two-col" style={{maxWidth:1100}}>
          <div>
            <p className="body-text" style={{marginBottom:"2.5rem"}}>
              Whether you're an investor evaluating our ventures, an enterprise client seeking AI-enabled capabilities, or a strategic acquirer exploring a portfolio fit -- we want to hear from you.
            </p>
            {[["Email","ologos-ai@ologos.co"],["Location","Fayetteville, Tennessee"]].map(([l,v]) => (
              <div key={l} style={{display:"flex",gap:"1.5rem",marginBottom:"1rem"}}>
                <span style={{fontSize:"0.68rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(240,237,230,0.45)",paddingTop:"0.1rem",width:"70px",flexShrink:0}}>{l}</span>
                <span style={{fontSize:"0.875rem",fontWeight:300,color:"rgba(240,237,230,0.82)"}}>{v}</span>
              </div>
            ))}
          </div>
          <div>
            {status === "sent" ? (
              <div style={{borderTop:"1px solid rgba(240,237,230,0.2)",paddingTop:"2rem"}}>
                <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"1.2rem",color:"#f0ede6",marginBottom:"0.5rem"}}>Message received.</div>
                <div style={{fontSize:"0.875rem",fontWeight:300,color:"rgba(240,237,230,0.6)"}}>We'll be in touch within two business days.</div>
              </div>
            ) : (
              <form onSubmit={submit}>
                {/* honeypot — hidden from humans; bots fill it and the submission is silently dropped */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  style={{position:"absolute",left:"-9999px",width:"1px",height:"1px",opacity:0}} />
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 2rem"}}>
                  <div className="field"><label>First Name</label><input name="firstName" type="text" placeholder="James" required /></div>
                  <div className="field"><label>Last Name</label><input name="lastName" type="text" placeholder="Longmire" /></div>
                </div>
                <div className="field"><label>Organization</label><input name="organization" type="text" placeholder="Company or Agency" /></div>
                <div className="field"><label>Email</label><input name="email" type="email" placeholder="you@domain.com" required /></div>
                <div className="field">
                  <label>I am reaching out as a</label>
                  <select name="inquiry_type" defaultValue="">
                    <option value="" disabled>Select</option>
                    <option>Investor / LP</option>
                    <option>Enterprise Client</option>
                    <option>Strategic Acquirer</option>
                    <option>Potential Collaborator</option>
                    <option>Press / Media</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field"><label>Message</label><textarea name="message" placeholder="What are you exploring?" required /></div>
                {status === "error" && (
                  <p style={{fontSize:"0.8rem",fontWeight:300,color:"#F06B35",marginBottom:"1rem"}}>
                    Something went wrong sending your message — please email ologos-ai@ologos.co directly.
                  </p>
                )}
                <button type="submit" className="btn-solid" disabled={status === "sending"}
                  style={{width:"100%",justifyContent:"center",opacity:status === "sending" ? 0.6 : 1,cursor:status === "sending" ? "default" : "pointer"}}>
                  {status === "sending" ? "Sending…" : "Send Message →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const PAGE_META = {
  home: { title: "Ologos — Innovation Factory", description: "Ologos is a think tank and innovation factory. We incubate high-conviction ideas under rigorous systems discipline, then spin each one off as an independent venture." },
  ventures: { title: "Ventures — Ologos", description: "The Ologos portfolio: a venture engine attacking the agent economy from the standard down to the product, every project sharing one fingerprint -- governed, auditable, sovereign AI." },
  research: { title: "Thought Leadership — Ologos", description: "Published, DOI-registered AI research from the Ologos partners: the AIDE canon (AEON, AIDEX, OAgents, and related standards) and the HGC³AE² / Managing Agentics Ops corpus." },
  about: { title: "About — Ologos", description: "Ologos is a think tank and innovation factory, the capital-efficient incubation engine that produces investment-ready ventures -- structured for investor diligence, government procurement, or strategic acquisition from day one." },
  philosophy: { title: "Philosophy — Ologos", description: "Logos -- the Greek for word, reason, rational principle -- is the organizing conviction of the enterprise: agentic AI as amplification of human judgment, not replacement of it." },
  team: { title: "Team — Ologos", description: "The Ologos Corp leadership team: systems and AI architects, technology operators, and an IP strategist, with deep experience in regulated federal and defense environments." },
  contact: { title: "Contact — Ologos", description: "Get in touch with Ologos -- for investors evaluating our ventures, enterprise clients seeking AI-enabled capabilities, or strategic acquirers exploring a portfolio fit." },
};

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const go = (p) => { navigate(PAGE_PATHS[p] ?? "/"); window.scrollTo(0,0); };

  useEffect(() => {
    const page = PATH_TO_PAGE[location.pathname] || "home";
    const meta = PAGE_META[page] || PAGE_META.home;
    document.title = meta.title;
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute("content", meta.description);
  }, [location.pathname]);

  return (
    <div className="site-root">
      <style>{css}</style>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ventures" element={<VenturesPage />} />
        <Route path="/thought-leadership" element={<ThoughtLeadershipPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/philosophy" element={<PhilosophyPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="footer">
        <div className="footer-logo">
          <img src={`${import.meta.env.BASE_URL}ologos-mark.png`} alt="Ologos" className="footer-mark" />
          <span>Ologos</span>
        </div>
        <ul className="footer-links">
          {[["ventures","Ventures"],["research","Thought Leadership"],["about","About"],["philosophy","Philosophy"],["team","Team"],["contact","Contact"]].map(([p,label])=>(
            <li key={p}><a onClick={()=>go(p)}>{label}</a></li>
          ))}
        </ul>
        <div className="footer-copy">© {new Date().getFullYear()} Ologos</div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
