// Design philosophy: a close reproduction of the reference’s single-screen landing page, rebranded to Ernest and limited to public, safe interactions.
import { ArrowRight, Bot, ExternalLink, LogIn, X } from "lucide-react";
import { useEffect, useState } from "react";

const SIGNUP_URL = "https://track.deriv.com/_2yZaBZhr48dMjdsyM5hasGNd7ZgqdRLk/1/";
const LOGIN_URL = "https://home.deriv.com/dashboard/login";

const marketItems = [
  ["↗", "Volatility 100", "+1.86%", true],
  ["↘", "Crash 500", "-0.31%", false],
  ["↗", "Step Index", "+1.12%", true],
  ["↗", "Volatility 75", "+2.48%", true],
  ["↗", "Boom 1000", "+0.74%", true],
  ["↗", "Range Break 100", "+1.17%", true],
] as const;

const activityCards = [
  { initials: "01", name: "Strategy builder", role: "Workspace module", copy: "Assemble a trading strategy without leaving your workspace." },
  { initials: "02", name: "Bot loader", role: "Workspace module", copy: "Bring an existing bot into Ernest and keep your flow focused." },
  { initials: "03", name: "Live execution", role: "Workspace status", copy: "Keep your automation tools ready when the market moves." },
];

const headlines = ["Your trusted Deriv third party", "Your trusted trading workspace", "Automation without the noise"];

export default function Home() {
  const [headline, setHeadline] = useState(headlines[0]);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeout: number | undefined;
    const next = (headlineIndex + 1) % headlines.length;
    const nextHeadline = headlines[next];

    timeout = window.setTimeout(() => {
      if (cancelled) return;
      let position = headline.length;
      const erase = window.setInterval(() => {
        position -= 1;
        setHeadline(headline.slice(0, Math.max(position, 0)));
        if (position <= 0) {
          window.clearInterval(erase);
          let nextPosition = 0;
          const type = window.setInterval(() => {
            nextPosition += 1;
            setHeadline(nextHeadline.slice(0, nextPosition));
            if (nextPosition >= nextHeadline.length) {
              window.clearInterval(type);
              setHeadlineIndex(next);
            }
          }, 45);
        }
      }, 32);
    }, 4800);

    return () => {
      cancelled = true;
      if (timeout) window.clearTimeout(timeout);
    };
  }, [headline, headlineIndex]);

  useEffect(() => {
    if (!isWorkspaceOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsWorkspaceOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isWorkspaceOpen]);

  return (
    <main className="landing-page">
      <nav className="top-nav" aria-label="Primary navigation">
        <a className="brand" href="/" aria-label="Ernest home">
          <img src="/manus-storage/ernest-mark_bbf02849.png" alt="" className="brand-mark" />
          <span>Ernest</span>
        </a>
        <div className="nav-actions">
          <a className="login-link" href={LOGIN_URL} target="_blank" rel="noreferrer">
            <LogIn size={13} strokeWidth={2.2} />
            Log in
          </a>
          <a className="signup-link" href={SIGNUP_URL} target="_blank" rel="noreferrer">
            Get started <ExternalLink size={12} strokeWidth={2.3} />
          </a>
        </div>
      </nav>

      <div className="market-strip" aria-label="Market snapshot">
        <div className="market-track">
          {[...marketItems, ...marketItems].map(([direction, name, value, positive], index) => (
            <span className="market-item" key={`${name}-${index}`}>
              <b className={positive ? "positive" : "negative"}>{direction}</b> {name} <strong className={positive ? "positive" : "negative"}>{value}</strong>
            </span>
          ))}
        </div>
      </div>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-stars" aria-hidden="true" />
        <div className="hero-copy">
          <span className="eyebrow"><i /> Free bots, automation, and trading tools</span>
          <h1 id="hero-title">{headline}<span className="typing-cursor" aria-hidden="true" /></h1>
          <p>Build, load, and run automated strategies from one focused workspace designed for everyday traders.</p>
          <div className="hero-actions">
            <button className="primary-cta" type="button" onClick={() => setIsWorkspaceOpen(true)}>
              Open workspace <ArrowRight size={14} strokeWidth={2.8} />
            </button>
            <a className="secondary-cta" href={SIGNUP_URL} target="_blank" rel="noreferrer">Create free account</a>
          </div>
          <div className="trust-row" aria-label="Product assurances">
            <span>✓ Free bot tools</span>
            <span>✓ Secure Deriv login</span>
            <span>✓ No card required</span>
          </div>
        </div>

        <div className="workspace-status" aria-hidden="true">
          <span className="status-icon"><Bot size={16} strokeWidth={2.2} /></span>
          <span><strong>Bot workspace ready</strong><em><i /> Live</em></span>
        </div>

        <div className="review-viewport" aria-label="Ernest workspace activity">
          <div className="review-track">
            {[...activityCards, ...activityCards].map((card, index) => (
              <article className="review-card" key={`${card.initials}-${index}`}>
                <div className="review-top">
                  <span className="avatar">{card.initials}</span>
                  <div className="review-identity"><strong>{card.name}</strong><em>{card.role}</em></div>
                  <small className="activity-label">READY</small>
                </div>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="page-footer"><span>Ernest</span><small>Automate with confidence.</small></footer>

      {isWorkspaceOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setIsWorkspaceOpen(false); }}>
          <section className="workspace-modal" role="dialog" aria-modal="true" aria-labelledby="workspace-title">
            <button className="modal-close" type="button" aria-label="Close workspace preview" onClick={() => setIsWorkspaceOpen(false)}><X size={18} /></button>
            <div className="modal-kicker"><span className="live-dot" /> Ernest workspace preview</div>
            <h2 id="workspace-title">Your bots, one focused workspace.</h2>
            <p>Connect your Deriv account to build, load, and run automated strategies. The live workspace opens through Deriv’s secure login.</p>
            <div className="preview-panels" aria-hidden="true"><span><b>01</b> Build strategy</span><span><b>02</b> Load bot</span><span><b>03</b> Run with confidence</span></div>
            <a className="modal-cta" href={LOGIN_URL} target="_blank" rel="noreferrer">Continue to secure login <ArrowRight size={14} /></a>
          </section>
        </div>
      )}
    </main>
  );
}
