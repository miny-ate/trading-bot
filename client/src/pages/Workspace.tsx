// Design philosophy: translate the Blueman post-login screenshot into Ernest’s midnight workspace — electric cobalt navigation, warm atmospheric depth, compact data cards, and clear safety boundaries around execution.
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity, AlertTriangle, BarChart3, Bot, Boxes, ChartNoAxesCombined, Check, ChevronDown, CircleDollarSign,
  Clock3, Copy, FileText, Gauge, Gift, GitCompare, LayoutDashboard, LineChart, ListChecks, Loader2,
  LockKeyhole, LogOut, Plus, Radio, RefreshCw, Search, Settings2, ShieldCheck, SlidersHorizontal,
  Sparkles, Target, Timer, TrendingUp, Trophy, UploadCloud, WandSparkles, Workflow, X, Zap,
} from "lucide-react";
import { DerivAccount, fetchDerivAccounts } from "@/lib/derivAccounts";

type SectionKey = "dashboard" | "bots" | "free-bots" | "strategies" | "analysis" | "dtrader" | "auto" | "bulk" | "signals" | "matches" | "speedbot" | "charts" | "copy";
type Quote = { symbol: string; name: string; market: string; quote: number | null; previous: number | null; history: number[] };

const navItems: Array<{ key: SectionKey; label: string; icon: LucideIcon }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "bots", label: "Bot Builder", icon: Bot },
  { key: "free-bots", label: "Free Bots", icon: Gift },
  { key: "strategies", label: "Strategies", icon: Workflow },
  { key: "analysis", label: "Analysis tools", icon: LineChart },
  { key: "dtrader", label: "D-Trader", icon: Zap },
  { key: "auto", label: "Auto Trader", icon: Timer },
  { key: "bulk", label: "Bulk Trader", icon: Boxes },
  { key: "signals", label: "Signals", icon: Radio },
  { key: "matches", label: "Matches", icon: GitCompare },
  { key: "speedbot", label: "Speedbot", icon: Gauge },
  { key: "charts", label: "Charts", icon: ChartNoAxesCombined },
  { key: "copy", label: "Copy Trading", icon: Copy },
];

const templates = [
  { name: "Range watcher", detail: "Monitor range-bound symbols", color: "coral", icon: Target },
  { name: "Momentum frame", detail: "Surface live directional movement", color: "mint", icon: TrendingUp },
  { name: "Risk timer", detail: "Keep a strategy inside a session window", color: "violet", icon: Clock3 },
];

function formatMoney(value: number | null, currency = "USD") {
  if (value === null) return "—";
  return `${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ${currency}`;
}

function displaySection(section: SectionKey) {
  return navItems.find((item) => item.key === section)?.label ?? "Dashboard";
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`workspace-panel ${className}`}>{children}</section>;
}

function ModuleHeading({ icon: Icon, eyebrow, title, description }: { icon: LucideIcon; eyebrow: string; title: string; description: string }) {
  return <div className="module-heading"><span className="module-eyebrow"><Icon size={13} /> {eyebrow}</span><h1>{title}</h1><p>{description}</p></div>;
}

function DashboardView({ accounts, quotes, activeSymbols, onNavigate, onSync }: { accounts: DerivAccount[]; quotes: Record<string, Quote>; activeSymbols: Quote[]; onNavigate: (key: SectionKey) => void; onSync: () => void }) {
  const selected = accounts[0];
  return <>
    <div className="workspace-hero-copy"><span className="workspace-hero-kicker"><Sparkles size={13} /> Deriv automation workspace</span><h1>Trade smarter, <em>not harder</em><span className="workspace-caret" /></h1><p>One focused place to inspect live markets, shape strategies, and keep every execution decision visible.</p></div>
    <div className="quick-actions">
      <button className="quick-action quick-action--coral" onClick={() => onNavigate("bots")}><span><UploadCloud size={21} /></span><b>My computer</b><small>Access local files and workspace.</small><ChevronDown size={17} /></button>
      <button className="quick-action quick-action--mint" onClick={() => onNavigate("free-bots")}><span><Gift size={21} /></span><b>Free bots</b><small>Explore safe strategy templates.</small><ChevronDown size={17} /></button>
      <button className="quick-action quick-action--violet" onClick={() => onNavigate("bots")}><span><WandSparkles size={21} /></span><b>Bot editor</b><small>Create, customize, and optimize bots.</small><ChevronDown size={17} /></button>
    </div>
    <div className="metric-grid">
      <Panel><span className="metric-label">Connected accounts</span><strong>{accounts.length}</strong><small><ShieldCheck size={12} /> OAuth session active</small></Panel>
      <Panel><span className="metric-label">Selected balance</span><strong>{formatMoney(selected?.balance ?? null, selected?.currency)}</strong><small><CircleDollarSign size={12} /> Live Deriv account data</small></Panel>
      <Panel><span className="metric-label">Markets streaming</span><strong>{activeSymbols.length || "—"}</strong><small><Activity size={12} /> Public market feed</small></Panel>
    </div>
    <div className="workspace-columns">
      <Panel className="market-panel"><div className="panel-heading"><div><span className="panel-kicker"><Activity size={12} /> Live market feed</span><h2>Market snapshot</h2></div><button className="ghost-button" onClick={onSync}><RefreshCw size={13} /> Sync</button></div><div className="market-table">{activeSymbols.length ? activeSymbols.map((symbol) => { const quote = quotes[symbol.symbol]; const delta = quote?.quote !== null && quote?.previous !== null ? (quote?.quote ?? 0) - (quote?.previous ?? 0) : null; return <div className="market-row" key={symbol.symbol}><span><b>{symbol.name}</b><small>{symbol.market || "Derived"}</small></span><strong>{quote?.quote === null || quote?.quote === undefined ? "Waiting…" : quote.quote.toFixed(4)}</strong><em className={delta !== null && delta >= 0 ? "positive" : "negative"}>{delta === null ? "—" : `${delta >= 0 ? "+" : ""}${delta.toFixed(4)}`}</em></div>; }) : <div className="empty-state"><Loader2 size={18} className="spin" /><span>Connecting to public market data…</span></div>}</div></Panel>
      <Panel className="report-panel"><div className="panel-heading"><div><span className="panel-kicker"><FileText size={12} /> Workspace reports</span><h2>Keep your decisions visible</h2></div><FileText size={22} className="panel-art" /></div><p>Use strategies, trades, and account history as separate review surfaces instead of mixing execution with analysis.</p><div className="report-links"><button onClick={() => onNavigate("strategies")}><ListChecks size={14} /> Strategy library <ChevronDown size={13} /></button><button onClick={() => onNavigate("analysis")}><Search size={14} /> Analysis tools <ChevronDown size={13} /></button><button onClick={() => onNavigate("charts")}><BarChart3 size={14} /> Charts <ChevronDown size={13} /></button></div></Panel>
    </div>
    <div className="risk-strip"><AlertTriangle size={15} /><span><b>Risk disclosure</b> Ernest shows live Deriv data and prepares actions. Review every contract, stake, duration, and account before any real-money execution.</span><button onClick={() => onNavigate("dtrader")}>Review safeguards <ChevronDown size={13} /></button></div>
  </>;
}

function BotBuilderView() {
  const [botName, setBotName] = useState("My first strategy");
  const [symbol, setSymbol] = useState("Live market");
  const [saved, setSaved] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("ernest_bots") || "[]"); } catch { return []; } });
  const saveBot = () => { const next = Array.from(new Set([...saved, botName])); setSaved(next); localStorage.setItem("ernest_bots", JSON.stringify(next)); };
  return <><ModuleHeading icon={Bot} eyebrow="Bot Builder" title="Build a bot you can explain" description="Create a transparent strategy template first. Ernest keeps execution separate until you deliberately connect a trading account." /><div className="builder-grid"><Panel><div className="panel-heading"><div><span className="panel-kicker"><WandSparkles size={12} /> Visual builder</span><h2>Strategy blocks</h2></div><span className="builder-status"><i /> Draft</span></div><label className="field-label">Bot name<input value={botName} onChange={(event) => setBotName(event.target.value)} /></label><label className="field-label">Market source<select value={symbol} onChange={(event) => setSymbol(event.target.value)}><option>Live market</option><option>Selected account</option><option>Watchlist</option></select></label><div className="builder-blocks"><div><span>01</span><b>When market moves</b><small>Choose a live trigger condition.</small></div><div><span>02</span><b>Check strategy rule</b><small>Define the threshold before action.</small></div><div><span>03</span><b>Prepare an outcome</b><small>Review before any execution.</small></div></div><button className="primary-button" onClick={saveBot}><Check size={14} /> Save bot draft</button></Panel><Panel><div className="panel-heading"><div><span className="panel-kicker"><ListChecks size={12} /> Saved workspace</span><h2>Your bot drafts</h2></div></div>{saved.length ? <div className="saved-list">{saved.map((name) => <div key={name}><Bot size={14} /><span>{name}</span><small>Draft</small></div>)}</div> : <div className="empty-state"><Bot size={19} /><span>No bot drafts yet. Save the builder to create one.</span></div>}<div className="safe-note"><LockKeyhole size={14} /><span>Bot drafts are local workspace configuration until you connect an authenticated execution channel.</span></div></Panel></div></>;
}

function FreeBotsView({ onLoad }: { onLoad: (name: string) => void }) {
  return <><ModuleHeading icon={Gift} eyebrow="Free Bots" title="Start with a safe template" description="These are Ernest product templates, not performance promises. Load one into Bot Builder and inspect every rule before use." /><div className="template-grid">{templates.map((template) => { const Icon = template.icon; return <Panel className={`template-card template-card--${template.color}`} key={template.name}><span className="template-icon"><Icon size={21} /></span><h2>{template.name}</h2><p>{template.detail}</p><div className="template-meta"><span><ShieldCheck size={12} /> Reviewable</span><button onClick={() => onLoad(template.name)}>Load template <ChevronDown size={12} /></button></div></Panel>; })}</div><div className="provider-note"><ShieldCheck size={15} /><span>Templates do not claim returns or guarantee outcomes. They are starting points for your own review.</span></div></>;
}

function StrategiesView() {
  const [strategies, setStrategies] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("ernest_strategies") || "[]"); } catch { return []; } });
  const [name, setName] = useState("");
  const add = () => { if (!name.trim()) return; const next = [...strategies, name.trim()]; setStrategies(next); localStorage.setItem("ernest_strategies", JSON.stringify(next)); setName(""); };
  return <><ModuleHeading icon={Workflow} eyebrow="Strategies" title="A library for your thinking" description="Keep strategy definitions, notes, and review status together before wiring them to an account." /><Panel><div className="panel-heading"><div><span className="panel-kicker"><Plus size={12} /> New strategy</span><h2>Strategy library</h2></div><span className="builder-status"><i /> Local workspace</span></div><div className="inline-form"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Range breakout review" /><button className="primary-button" onClick={add}><Plus size={14} /> Add strategy</button></div>{strategies.length ? <div className="strategy-list">{strategies.map((strategy, index) => <div key={`${strategy}-${index}`}><span className="strategy-number">{String(index + 1).padStart(2, "0")}</span><b>{strategy}</b><small>Review required</small><ChevronDown size={14} /></div>)}</div> : <div className="empty-state"><Workflow size={18} /><span>Your strategy library is empty.</span></div>}</Panel></>;
}

function AnalysisView({ activeSymbols, quotes }: { activeSymbols: Quote[]; quotes: Record<string, Quote> }) {
  return <><ModuleHeading icon={LineChart} eyebrow="Analysis Tools" title="Read the market before you act" description="Live quotes come from Deriv’s public market feed. This surface describes movement; it does not make investment recommendations." /><div className="analysis-grid">{activeSymbols.length ? activeSymbols.map((symbol) => { const quote = quotes[symbol.symbol]; const history = quote?.history || []; const max = Math.max(...history, 1); return <Panel className="analysis-card" key={symbol.symbol}><div className="panel-heading"><div><span className="panel-kicker"><Activity size={12} /> {symbol.market || "Market"}</span><h2>{symbol.name}</h2></div><strong className="analysis-quote">{quote?.quote?.toFixed(4) || "—"}</strong></div><div className="mini-chart">{history.slice(-24).map((point, index) => <i key={`${point}-${index}`} style={{ height: `${Math.max(8, (point / max) * 100)}%` }} />)}</div><small className="data-source">Live tick stream · {symbol.symbol}</small></Panel>; }) : <Panel><div className="empty-state"><Loader2 size={18} className="spin" /><span>Waiting for active symbols…</span></div></Panel>}</div></>;
}

function DTraderView({ activeSymbols }: { activeSymbols: Quote[] }) {
  const [stake, setStake] = useState("10");
  const [duration, setDuration] = useState("60");
  const [preview, setPreview] = useState(false);
  return <><ModuleHeading icon={Zap} eyebrow="D-Trader" title="Shape a contract preview" description="This first Ernest slice validates your inputs and market selection. It does not place a trade without a separate, explicit execution confirmation." /><Panel className="trader-panel"><div className="panel-heading"><div><span className="panel-kicker"><SlidersHorizontal size={12} /> Contract setup</span><h2>Options preview</h2></div><span className="builder-status"><i /> Execution locked</span></div><div className="trade-fields"><label className="field-label">Underlying market<select><option>{activeSymbols[0]?.name || "Waiting for market data"}</option>{activeSymbols.slice(1).map((symbol) => <option key={symbol.symbol}>{symbol.name}</option>)}</select></label><label className="field-label">Contract type<select><option>Rise / Fall</option><option>Higher / Lower</option><option>Touch / No Touch</option></select></label><label className="field-label">Stake<input value={stake} onChange={(event) => setStake(event.target.value)} inputMode="decimal" /></label><label className="field-label">Duration (seconds)<input value={duration} onChange={(event) => setDuration(event.target.value)} inputMode="numeric" /></label></div><div className="trade-preview"><span><small>Stake</small><b>{stake || "—"} USD</b></span><span><small>Duration</small><b>{duration || "—"} sec</b></span><span><small>Next step</small><b>Review proposal</b></span></div><button className="primary-button" onClick={() => setPreview(true)}><Search size={14} /> Preview contract</button>{preview && <div className="execution-warning"><AlertTriangle size={16} /><div><b>Preview only</b><p>Ernest has not sent a proposal or trade. Live execution will require an authenticated Options WebSocket and your explicit confirmation of the account, stake, duration, and contract.</p></div><button onClick={() => setPreview(false)} aria-label="Close preview"><X size={15} /></button></div>}</Panel></>;
}

function SimpleModuleView({ section }: { section: SectionKey }) {
  const details: Record<string, { icon: LucideIcon; description: string; items: string[] }> = {
    auto: { icon: Timer, description: "Sequence a reviewed strategy with visible timing and pause controls.", items: ["Session window", "Pause on error", "Manual review gate"] },
    bulk: { icon: Boxes, description: "Prepare a batch of reviewed actions without silently submitting them.", items: ["Batch size", "Account scope", "Review queue"] },
    signals: { icon: Radio, description: "Compare live market movement and build your own watchlist signals.", items: ["Movement filters", "Watchlist", "Signal notes"] },
    matches: { icon: GitCompare, description: "Compare live symbols by market, movement, and available contract surface.", items: ["Market pair", "Movement delta", "Contract coverage"] },
    speedbot: { icon: Gauge, description: "A compact quick-start surface for a reviewed bot template.", items: ["Quick template", "Stake guard", "Pause control"] },
    copy: { icon: Copy, description: "Copy Trading is provider-dependent and is not simulated by Ernest.", items: ["Provider connection required", "Source account review", "Risk disclosure"] },
  };
  const detail = details[section] || details.auto; const Icon = detail.icon;
  return <><ModuleHeading icon={Icon} eyebrow={displaySection(section)} title={displaySection(section)} description={detail.description} /><Panel><div className="module-feature-list">{detail.items.map((item) => <div key={item}><span><Icon size={15} /></span><b>{item}</b><small>{section === "copy" ? "Provider integration required before this can be activated." : "Available in the Ernest workspace shell."}</small><LockKeyhole size={14} /></div>)}</div><div className="provider-note"><AlertTriangle size={15} /><span>This module is visible and safely scoped, but Ernest will not fabricate provider data or silently submit trades.</span></div></Panel></>;
}

export default function Workspace() {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("ernest_deriv_access_token") : null;
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");
  const [accounts, setAccounts] = useState<DerivAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [accountLoading, setAccountLoading] = useState(Boolean(token));
  const [accountError, setAccountError] = useState("");
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [activeSymbols, setActiveSymbols] = useState<Quote[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const loadAccounts = () => {
    if (!token) return;
    setAccountLoading(true); setAccountError("");
    void fetchDerivAccounts(token).then((next) => { setAccounts(next); setSelectedAccountId((current) => current || next[0]?.id || ""); }).catch((error: Error) => setAccountError(error.message || "Unable to load accounts.")).finally(() => setAccountLoading(false));
  };

  useEffect(() => { loadAccounts(); const socket = new WebSocket("wss://api.derivws.com/trading/v1/options/ws/public"); socketRef.current = socket; socket.onopen = () => socket.send(JSON.stringify({ active_symbols: "brief", req_id: 1 })); socket.onmessage = (event) => { try { const data = JSON.parse(event.data); if (data.msg_type === "active_symbols" && Array.isArray(data.active_symbols)) { const rawSymbols = data.active_symbols as Array<Record<string, unknown>>; const next: Quote[] = rawSymbols.filter((item) => item.symbol && item.display_name).slice(0, 8).map((item) => ({ symbol: String(item.symbol), name: String(item.display_name), market: String(item.market ?? ""), quote: null, previous: null, history: [] })); setActiveSymbols(next); next.slice(0, 8).forEach((item: Quote, index: number) => socket.send(JSON.stringify({ ticks: item.symbol, subscribe: 1, req_id: 100 + index }))); } if (data.msg_type === "tick" && data.tick?.symbol) { const symbol = String(data.tick.symbol); const quote = Number(data.tick.quote); setQuotes((current) => { const previous = current[symbol]?.quote ?? null; return { ...current, [symbol]: { ...(current[symbol] || { symbol, name: symbol, market: "", history: [] }), quote, previous, history: [...(current[symbol]?.history || []), quote].slice(-40) } }; }); } } catch { /* Ignore malformed market messages and keep the stream alive. */ } }; return () => { socket.close(); socketRef.current = null; }; }, []);

  const selectedAccount = useMemo(() => accounts.find((account) => account.id === selectedAccountId) || accounts[0], [accounts, selectedAccountId]);
  const navigate = (key: SectionKey) => setActiveSection(key);
  if (!token) return <main className="workspace-auth"><div><LockKeyhole size={28} /><h1>Connect Ernest to Deriv</h1><p>Your authenticated workspace opens after a successful Deriv OAuth connection.</p><button className="primary-button" onClick={() => { window.location.assign("/"); }}>Return to login</button></div></main>;
  const activeNav = navItems.find((item) => item.key === activeSection) || navItems[0];
  const ActiveNavIcon = activeNav.icon;
  return <main className="workspace-app"><header className="workspace-topbar"><a className="workspace-brand" href="/"><span className="workspace-brand-mark">E</span><span><b>Ernest</b><small>powered by Deriv</small></span></a><div className="workspace-report-link"><FileText size={15} /> Reports</div><div className="workspace-account-control"><span>{selectedAccount?.currency || "USD"}</span><select value={selectedAccountId} onChange={(event) => setSelectedAccountId(event.target.value)} disabled={accountLoading || !accounts.length}>{accounts.length ? accounts.map((account) => <option value={account.id} key={account.id}>{account.label} · {formatMoney(account.balance, account.currency)}</option>) : <option>{accountLoading ? "Syncing…" : "No accounts"}</option>}</select><button onClick={loadAccounts} aria-label="Refresh accounts"><RefreshCw size={15} /></button><button onClick={() => { sessionStorage.removeItem("ernest_deriv_access_token"); window.location.assign("/"); }} aria-label="Sign out"><LogOut size={15} /></button></div></header><nav className="workspace-nav" aria-label="Ernest workspace modules">{navItems.map((item) => { const Icon = item.icon; return <button className={item.key === activeSection ? "is-active" : ""} key={item.key} onClick={() => navigate(item.key)}><Icon size={15} />{item.label}</button>; })}</nav><div className="workspace-content"><div className="workspace-location"><span><ActiveNavIcon size={14} /> {activeNav.label}</span>{accountError && <em><AlertTriangle size={12} /> {accountError}</em>}</div>{activeSection === "dashboard" && <DashboardView accounts={accounts} quotes={quotes} activeSymbols={activeSymbols} onNavigate={navigate} onSync={loadAccounts} />}{activeSection === "bots" && <BotBuilderView />}{activeSection === "free-bots" && <FreeBotsView onLoad={() => navigate("bots")} />}{activeSection === "strategies" && <StrategiesView />}{activeSection === "analysis" && <AnalysisView activeSymbols={activeSymbols} quotes={quotes} />}{activeSection === "dtrader" && <DTraderView activeSymbols={activeSymbols} />}{["auto", "bulk", "signals", "matches", "speedbot", "copy"].includes(activeSection) && <SimpleModuleView section={activeSection} />}</div><div className="workspace-execution-bar"><button className="execution-run" onClick={() => navigate("dtrader")}><Zap size={17} /> Review trade</button><div><span>Execution</span><b>SAFE MODE</b></div><span className="execution-dot"><i /> {selectedAccount ? `${selectedAccount.isDemo ? "Demo" : "Live"} account selected` : "Select an account"}</span><span className="execution-clock"><ShieldCheck size={13} /> Review every action</span></div><div className="workspace-risk-badge"><AlertTriangle size={12} /> Risk disclosure</div></main>;
}
