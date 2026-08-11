// Design philosophy: a close reproduction of the reference’s single-screen landing page, rebranded to Ernest and limited to public, safe interactions.
import { ArrowRight, Bot, ExternalLink, LogIn, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { beginDerivOAuth, clearOAuthRequest, DERIV_CLIENT_ID, DERIV_REDIRECT_URI, getStoredOAuthRequest } from "@/lib/derivOAuth";
import { DerivAccount, fetchDerivAccounts } from "@/lib/derivAccounts";

const TOKEN_STORAGE_KEY = "ernest_deriv_access_token";
type OAuthStatus = "idle" | "starting" | "processing" | "success" | "error";
type AccountStatus = "idle" | "loading" | "success" | "error";

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
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus>("idle");
  const [oauthMessage, setOauthMessage] = useState("");
  const [accounts, setAccounts] = useState<DerivAccount[]>([]);
  const [accountStatus, setAccountStatus] = useState<AccountStatus>("idle");
  const [accountMessage, setAccountMessage] = useState("");
  const callbackHandledRef = useRef(false);

  const syncAccounts = (accessToken: string) => {
    setAccountStatus("loading"); setAccountMessage("Syncing your Deriv accounts…");
    void fetchDerivAccounts(accessToken).then((nextAccounts) => { setAccounts(nextAccounts); setAccountStatus("success"); setAccountMessage(nextAccounts.length ? "Live account data synced from Deriv." : "No Options accounts were returned for this connection."); }).catch((error: Error) => { setAccounts([]); setAccountStatus("error"); setAccountMessage(error.message || "Unable to sync Deriv accounts."); });
  };

  const startOAuth = (signup = false) => {
    setOauthStatus("starting");
    setOauthMessage(signup ? "Preparing secure account creation…" : "Preparing secure Deriv sign-in…");
    void beginDerivOAuth({ signup }).catch((error: Error) => { setOauthStatus("error"); setOauthMessage(error.message || "Unable to start secure sign-in."); });
  };

  useEffect(() => {
    if (callbackHandledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const returnedState = params.get("state");
    const providerError = params.get("error");
    if (!code && !providerError) return;
    callbackHandledRef.current = true;
    window.history.replaceState({}, document.title, "/");
    if (providerError) { clearOAuthRequest(); setOauthStatus("error"); setOauthMessage(params.get("error_description") || "Deriv sign-in was cancelled."); return; }
    const storedRequest = getStoredOAuthRequest();
    if (!code || !returnedState || !storedRequest || returnedState !== storedRequest.state) { clearOAuthRequest(); setOauthStatus("error"); setOauthMessage("The OAuth security check failed. Please start sign-in again."); return; }
    setOauthStatus("processing"); setOauthMessage("Finishing your secure Deriv connection…");
    fetch("/api/oauth/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, code_verifier: storedRequest.codeVerifier, redirect_uri: DERIV_REDIRECT_URI, client_id: DERIV_CLIENT_ID }) })
      .then(async (response) => { const data = await response.json().catch(() => ({})); if (!response.ok || !data.access_token) throw new Error(data.error || "Deriv token exchange failed."); sessionStorage.setItem(TOKEN_STORAGE_KEY, data.access_token); if (data.expires_in) sessionStorage.setItem("ernest_deriv_token_expires_at", String(Date.now() + data.expires_in * 1000)); clearOAuthRequest(); setOauthStatus("success"); setOauthMessage("Your Deriv account is connected. Ernest is ready for your workspace."); syncAccounts(data.access_token); window.location.assign("/workspace"); })
      .catch((error: Error) => { clearOAuthRequest(); setOauthStatus("error"); setOauthMessage(error.message || "Unable to complete Deriv sign-in."); });
  }, []);

  useEffect(() => { const existingToken = sessionStorage.getItem(TOKEN_STORAGE_KEY); if (existingToken && window.location.pathname === "/") { window.location.assign("/workspace"); return; } if (existingToken) syncAccounts(existingToken); }, []);

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
          <img src="/assets/ernest-mark.webp" alt="" className="brand-mark" />
          <span>Ernest</span>
        </a>
        <div className="nav-actions">
          <button className="login-link" type="button" onClick={() => startOAuth(false)}>
            <LogIn size={13} strokeWidth={2.2} />
            Log in
          </button>
          <button className="signup-link" type="button" onClick={() => startOAuth(true)}>
            Get started <ExternalLink size={12} strokeWidth={2.3} />
          </button>
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
            <button className="secondary-cta" type="button" onClick={() => startOAuth(true)}>Create free account</button>
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
            <button className="modal-cta" type="button" onClick={() => startOAuth(false)}>Continue to secure login <ArrowRight size={14} /></button>
          </section>
        </div>
      )}

      {accountStatus !== "idle" && (
        <section className={`account-sync-panel account-sync-panel--${accountStatus}`} aria-live="polite" aria-label="Deriv account synchronization">
          <div className="account-sync-heading"><div><span className="account-sync-kicker"><i /> Ernest account sync</span><h2>{accountStatus === "loading" ? "Syncing your trading accounts" : accountStatus === "error" ? "Account sync needs attention" : "Your Deriv accounts"}</h2></div><button type="button" onClick={() => { const token = sessionStorage.getItem(TOKEN_STORAGE_KEY); if (token) syncAccounts(token); }} aria-label="Refresh Deriv accounts"><span>↻</span> Refresh</button></div>
          <p className="account-sync-message">{accountMessage}</p>
          {accountStatus === "loading" && <div className="account-sync-skeletons"><span /><span /><span /></div>}
          {accountStatus === "error" && <p className="account-sync-help">Check that the Ernest Deriv app includes the <strong>trade</strong> scope, then reconnect your account.</p>}
          {accountStatus === "success" && accounts.length > 0 && <div className="account-sync-grid">{accounts.map((account) => <article className="account-card" key={account.id}><div><span className={`account-type-dot ${account.isDemo ? "account-type-dot--demo" : ""}`} /><strong>{account.label}</strong></div><small>{account.isDemo ? "Demo" : "Live"} · {account.accountType}</small><b>{account.balance === null ? "—" : new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(account.balance)} <em>{account.currency}</em></b></article>)}</div>}
        </section>
      )}

      {oauthStatus !== "idle" && oauthStatus !== "starting" && (
        <div className={`oauth-status oauth-status--${oauthStatus}`} role="status" aria-live="polite">
          <span className="oauth-status-dot" />
          <div><strong>{oauthStatus === "processing" ? "Connecting Deriv" : oauthStatus === "success" ? "Connection complete" : "Sign-in needs attention"}</strong><p>{oauthMessage}</p></div>
          {oauthStatus !== "processing" && <button type="button" onClick={() => setOauthStatus("idle")} aria-label="Dismiss sign-in message"><X size={15} /></button>}
        </div>
      )}
    </main>
  );
}
