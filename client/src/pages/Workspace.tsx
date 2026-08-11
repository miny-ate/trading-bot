/* Ernest reproduction style contract: this authenticated surface follows Blueman’s observed D-Bot shell—compact midnight panels, electric-cyan controls, block-editor hierarchy, persistent run panel, and explicit review gates—while never inventing an unobserved bot graph or silently submitting an order. */
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity, AlertTriangle, BarChart3, Bot, Boxes, ChartNoAxesCombined, Check, ChevronDown, CircleDollarSign,
  Clock3, Copy, FileText, Gauge, Gift, GitCompare, LayoutDashboard, LineChart, ListChecks, Loader2,
  LockKeyhole, LogOut, Plus, Radio, RefreshCw, Search, Settings2, ShieldCheck, SlidersHorizontal,
  Sparkles, Target, Timer, TrendingUp, Trophy, UploadCloud, WandSparkles, Workflow, X, Zap,
} from "lucide-react";
import { DerivAccount, fetchDerivAccounts } from "@/lib/derivAccounts";
import { buyBot, previewBot, type BotRunProfile } from "@/lib/derivBot";

type SectionKey = "dashboard" | "bots" | "free-bots" | "strategies" | "analysis" | "dtrader" | "auto" | "bulk" | "signals" | "matches" | "speedbot" | "charts" | "copy";
type Quote = { symbol: string; name: string; market: string; quote: number | null; previous: number | null; history: number[] };
type BlockItem = { kind: "print" | "set" | "condition"; label: string; value?: string };
type BotProfile = {
  name: string;
  detail: string;
  color: string;
  icon: LucideIcon;
  market: string;
  executionContractType: string;
  tradeType: string;
  contractScope: string;
  candle: string;
  stake: number;
  martingale?: number;
  barrier?: string;
  runOnce: BlockItem[];
  restartCondition?: string;
  captured: boolean;
  invalidImport?: boolean;
};

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

const botProfiles: BotProfile[] = [
  {
    name: "1. Updated Bandwagon Bot (without Entry)", detail: "Observed Volatility 25 digit over/under graph", color: "coral", icon: Bot,
    market: "Volatility 25 (1s) Index", executionContractType: "DIGITOVER", tradeType: "Digits > Over/Under", contractScope: "Both", candle: "1 minute", stake: 20,
    runOnce: [{ kind: "print", label: "Updated Bandwagon Bot (Without Entry)" }, { kind: "set", label: "Stake", value: "20" }], captured: true,
  },
  {
    name: "10. Over 3 Under 6 Recovery Bot.", detail: "Recovery catalog entry; exact graph not yet captured", color: "mint", icon: RefreshCw,
    market: "Not captured", executionContractType: "DIGITOVER", tradeType: "Not captured", contractScope: "Not captured", candle: "Not captured", stake: 20,
    runOnce: [{ kind: "set", label: "Stake", value: "20" }], captured: false,
  },
  {
    name: "11. Over under switcher Bot.", detail: "Over/under switcher catalog entry; exact graph not yet captured", color: "violet", icon: Workflow,
    market: "Not captured", executionContractType: "DIGITOVER", tradeType: "Not captured", contractScope: "Not captured", candle: "Not captured", stake: 20,
    runOnce: [{ kind: "set", label: "Stake", value: "20" }], captured: false,
  },
  {
    name: "2. Updated Bandwagon Bot (With Entry Point).", detail: "Entry-point catalog entry; exact graph not yet captured", color: "coral", icon: Target,
    market: "Not captured", executionContractType: "CALL", tradeType: "Not captured", contractScope: "Not captured", candle: "Not captured", stake: 20,
    runOnce: [{ kind: "set", label: "Stake", value: "20" }], captured: false,
  },
  {
    name: "4. Recover Under Bandwagon Bot", detail: "Under-recovery catalog entry; exact graph not yet captured", color: "mint", icon: RefreshCw,
    market: "Not captured", executionContractType: "DIGITUNDER", tradeType: "Not captured", contractScope: "Not captured", candle: "Not captured", stake: 20,
    runOnce: [{ kind: "set", label: "Stake", value: "20" }], captured: false,
  },
  {
    name: "7. Over 1 Under 8 Bot.", detail: "Observed Volatility 15 graph with martingale restart condition", color: "violet", icon: Gauge,
    market: "Volatility 15 (1s) Index", executionContractType: "DIGITOVER", tradeType: "Digits > Over/Under", contractScope: "Both", candle: "1 minute", stake: 20, martingale: 2,
    runOnce: [{ kind: "set", label: "Stake", value: "20" }, { kind: "set", label: "Martingale", value: "2" }], restartCondition: "if (Total profit/loss ≥ Target)", captured: true,
  },
  {
    name: "8. Over 1 Under 8 Recovery Over 4.", detail: "Recovery catalog entry; exact graph not yet captured", color: "coral", icon: TrendingUp,
    market: "Not captured", executionContractType: "DIGITOVER", tradeType: "Not captured", contractScope: "Not captured", candle: "Not captured", stake: 20,
    runOnce: [{ kind: "set", label: "Stake", value: "20" }], captured: false,
  },
  {
    name: "Auto Bot by Osam💯", detail: "Osam automation catalog entry; exact graph not yet captured", color: "mint", icon: Timer,
    market: "Not captured", executionContractType: "CALL", tradeType: "Not captured", contractScope: "Not captured", candle: "Not captured", stake: 20,
    runOnce: [{ kind: "set", label: "Stake", value: "20" }], captured: false,
  },
  {
    name: "Digit Switcher 1 8", detail: "Observed Volatility 75 digit-switcher graph", color: "violet", icon: GitCompare,
    market: "Volatility 75 (1s) Index", executionContractType: "DIGITDIFF", tradeType: "Digits > Over/Under", contractScope: "Both", candle: "1 minute", stake: 20,
    runOnce: [{ kind: "print", label: "About To Milk The Market" }, { kind: "set", label: "Stake", value: "20" }], captured: true,
  },
  {
    name: "EXPERT SPEED MATCH BOT", detail: "Observed invalid import state on Load Bot", color: "coral", icon: Gauge,
    market: "Not loaded", executionContractType: "DIGITMATCH", tradeType: "Not loaded", contractScope: "Not loaded", candle: "Not loaded", stake: 20,
    runOnce: [], captured: false, invalidImport: true,
  },
  {
    name: "Osam.HnR", detail: "Osam catalog entry; exact graph not yet captured", color: "mint", icon: Activity,
    market: "Not captured", executionContractType: "CALL", tradeType: "Not captured", contractScope: "Not captured", candle: "Not captured", stake: 20,
    runOnce: [{ kind: "set", label: "Stake", value: "20" }], captured: false,
  },
  {
    name: "Over-Destroyer💀", detail: "Over-direction catalog entry; exact graph not yet captured", color: "violet", icon: Zap,
    market: "Not captured", executionContractType: "DIGITOVER", tradeType: "Not captured", contractScope: "Not captured", candle: "Not captured", stake: 20,
    runOnce: [{ kind: "set", label: "Stake", value: "20" }], captured: false,
  },
  {
    name: "Over-Pro Bot💫", detail: "Over-direction catalog entry; exact graph not yet captured", color: "coral", icon: Sparkles,
    market: "Not captured", executionContractType: "DIGITOVER", tradeType: "Not captured", contractScope: "Not captured", candle: "Not captured", stake: 20,
    runOnce: [{ kind: "set", label: "Stake", value: "20" }], captured: false,
  },
  {
    name: "Under-Destroyer💀", detail: "Under-direction catalog entry; exact graph not yet captured", color: "mint", icon: Target,
    market: "Not captured", executionContractType: "DIGITUNDER", tradeType: "Not captured", contractScope: "Not captured", candle: "Not captured", stake: 20,
    runOnce: [{ kind: "set", label: "Stake", value: "20" }], captured: false,
  },
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

const blockGroups = ["Analysis Logics 🔥", "Trade parameters", "Purchase conditions", "Sell conditions (optional)", "Restart trading conditions", "Analysis", "Utility", "Virtual Hook Switcher", "Custom Notification", "Binarytools", "Contract modifiers", "Barrier Settings"];

function BlockMenu({ activeTool, onSelect }: { activeTool: string; onSelect: (tool: string) => void }) {
  const [query, setQuery] = useState("");
  const visible = blockGroups.filter((group) => group.toLowerCase().includes(query.toLowerCase()));
  return <Panel className="block-menu-panel"><div className="panel-heading"><div><span className="panel-kicker"><Boxes size={12} /> Blocks menu</span><h2>Build with blocks</h2></div><Search size={17} className="panel-art" /></div><label className="block-search"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" /></label><div className="block-groups">{visible.map((group) => <button className={activeTool === group ? "is-selected" : ""} key={group} onClick={() => onSelect(group)}><span><Plus size={12} /></span>{group}<ChevronDown size={12} /></button>)}</div></Panel>;
}

type RunState = {
  running: boolean;
  status: string;
  runs: number;
  totalStake: number;
  totalPayout: number;
  won: number;
  lost: number;
  transactions: string[];
  journal: string[];
};

const initialRunState: RunState = {
  running: false, status: "When you’re ready to trade, hit Run.", runs: 0, totalStake: 0, totalPayout: 0, won: 0, lost: 0, transactions: [], journal: [],
};

function RunPanel({ state, botName, onRun, onReset }: { state: RunState; botName?: string; onRun: () => void; onReset: () => void }) {
  const [tab, setTab] = useState<"summary" | "transactions" | "journal">("summary");
  const download = () => {
    const payload = JSON.stringify({ bot: botName || "", ...state }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "ernest-run-report.json"; link.click(); URL.revokeObjectURL(url);
  };
  const metrics = tab === "summary" ? [["Total stake", `${state.totalStake.toFixed(2)} USD`], ["Total payout", `${state.totalPayout.toFixed(2)} USD`], ["No. of runs", String(state.runs)], ["Contracts lost", String(state.lost)], ["Contracts won", String(state.won)], ["Total profit/loss", `${(state.totalPayout - state.totalStake).toFixed(2)} USD`]] : tab === "transactions" ? [["Transactions", state.transactions.length ? String(state.transactions.length) : "No transactions"], ["Status", state.running ? "Running" : "Ready"], ["Export", "JSON"]] : [["Journal", state.journal.length ? `${state.journal.length} events` : "No notes yet"], ["Last event", state.journal[0] || "Workspace opened"], ["Mode", "Safe mode"]];
  return <Panel className="run-panel"><div className="run-panel-title"><span><Activity size={13} /> Run panel</span><small>{botName || "No bot loaded"}</small></div><div className="run-panel-tabs">{(["summary", "transactions", "journal"] as const).map((item) => <button className={tab === item ? "is-active" : ""} key={item} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>{tab === "summary" && <div className="run-panel-empty"><Activity size={19} /><p>{state.status}<br />{botName ? <><b>{botName}</b> is ready for review.</> : "Load a Free Bot to populate this panel."}</p></div>}{tab !== "summary" && <div className="run-event-list">{(tab === "transactions" ? state.transactions : state.journal).length ? (tab === "transactions" ? state.transactions : state.journal).map((item, index) => <div key={`${item}-${index}`}><span>{index + 1}</span><p>{item}</p></div>) : <p className="run-event-empty">{tab === "transactions" ? "No transactions" : "No notes yet"}</p>}</div>}<div className="run-panel-heading"><span>Download</span><button onClick={download}><UploadCloud size={12} /> Download</button><button onClick={onReset}><RefreshCw size={12} /> Reset</button></div><div className="run-metrics">{metrics.map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div><div className="run-panel-actions"><button disabled={!botName || state.running} onClick={onRun}><Zap size={13} /> {state.running ? "Running…" : "Run"}</button><span><ShieldCheck size={12} /> No silent orders</span></div></Panel>;
}

function DashboardView({ accounts, quotes, activeSymbols, onNavigate, onSync }: { accounts: DerivAccount[]; quotes: Record<string, Quote>; activeSymbols: Quote[]; onNavigate: (key: SectionKey) => void; onSync: () => void }) {
  const selected = accounts[0];
  return <>
    <div className="workspace-hero-copy"><span className="workspace-hero-kicker"><Sparkles size={13} /> Deriv automation workspace</span><h1>Trade smarter, <em>not harder</em><span className="workspace-caret" /></h1><p>One focused place to inspect live markets, shape strategies, and keep every execution decision visible.</p></div>
    <div className="quick-actions"><button className="quick-action quick-action--coral" onClick={() => onNavigate("bots")}><span><UploadCloud size={21} /></span><b>My computer</b><small>Access local files and workspace.</small><ChevronDown size={17} /></button><button className="quick-action quick-action--mint" onClick={() => onNavigate("free-bots")}><span><Gift size={21} /></span><b>Free bots</b><small>Explore safe strategy templates.</small><ChevronDown size={17} /></button><button className="quick-action quick-action--violet" onClick={() => onNavigate("bots")}><span><WandSparkles size={21} /></span><b>Bot editor</b><small>Create, customize, and optimize bots.</small><ChevronDown size={17} /></button></div>
    <div className="metric-grid"><Panel><span className="metric-label">Connected accounts</span><strong>{accounts.length}</strong><small><ShieldCheck size={12} /> OAuth session active</small></Panel><Panel><span className="metric-label">Selected balance</span><strong>{formatMoney(selected?.balance ?? null, selected?.currency)}</strong><small><CircleDollarSign size={12} /> Live Deriv account data</small></Panel><Panel><span className="metric-label">Markets streaming</span><strong>{activeSymbols.length || "—"}</strong><small><Activity size={12} /> Public market feed</small></Panel></div>
    <div className="workspace-columns"><Panel className="market-panel"><div className="panel-heading"><div><span className="panel-kicker"><Activity size={12} /> Live market feed</span><h2>Market snapshot</h2></div><button className="ghost-button" onClick={onSync}><RefreshCw size={13} /> Sync</button></div><div className="market-table">{activeSymbols.length ? activeSymbols.map((symbol) => { const quote = quotes[symbol.symbol]; const delta = quote?.quote !== null && quote?.previous !== null ? (quote?.quote ?? 0) - (quote?.previous ?? 0) : null; return <div className="market-row" key={symbol.symbol}><span><b>{symbol.name}</b><small>{symbol.market || "Derived"}</small></span><strong>{quote?.quote === null || quote?.quote === undefined ? "Waiting…" : quote.quote.toFixed(4)}</strong><em className={delta !== null && delta >= 0 ? "positive" : "negative"}>{delta === null ? "—" : `${delta >= 0 ? "+" : ""}${delta.toFixed(4)}`}</em></div>; }) : <div className="empty-state"><Loader2 size={18} className="spin" /><span>Connecting to public market data…</span></div>}</div></Panel><Panel className="report-panel"><div className="panel-heading"><div><span className="panel-kicker"><FileText size={12} /> Workspace reports</span><h2>Keep your decisions visible</h2></div><FileText size={22} className="panel-art" /></div><p>Use strategies, trades, and account history as separate review surfaces instead of mixing execution with analysis.</p><div className="report-links"><button onClick={() => onNavigate("strategies")}><ListChecks size={14} /> Strategy library <ChevronDown size={13} /></button><button onClick={() => onNavigate("analysis")}><Search size={14} /> Analysis tools <ChevronDown size={13} /></button><button onClick={() => onNavigate("charts")}><BarChart3 size={14} /> Charts <ChevronDown size={13} /></button></div></Panel></div>
    <div className="risk-strip"><AlertTriangle size={15} /><span><b>Risk disclosure</b> Ernest shows live Deriv data and prepares actions. Review every contract, stake, duration, and account before any real-money execution.</span><button onClick={() => onNavigate("dtrader")}>Review safeguards <ChevronDown size={13} /></button></div>
  </>;
}

function symbolForMarket(market: string) {
  if (market.includes("25")) return "1HZ25V";
  if (market.includes("15")) return "1HZ15V";
  if (market.includes("75")) return "1HZ75V";
  if (market.includes("100")) return "1HZ100V";
  return "1HZ100V";
}

function toExecutionProfile(profile: BotProfile, account: DerivAccount): BotRunProfile {
  return { name: profile.name, contractType: profile.executionContractType, underlyingSymbol: symbolForMarket(profile.market), currency: account.currency, amount: profile.stake, duration: 1, durationUnit: "t", barrier: profile.barrier, multiplier: profile.martingale };
}

function DbotCanvas({ profile, activeTool, onSelectTool }: { profile?: BotProfile; activeTool: string; onSelectTool: (tool: string) => void }) {
  return <Panel className="dbot-canvas-panel"><div className="dbot-toolbar"><button title="Reset"><RefreshCw size={15} /></button><button title="Import"><UploadCloud size={15} /></button><button title="Save"><Check size={15} /></button><button title="Sort"><ListChecks size={15} /></button><button title="Charts"><BarChart3 size={15} /></button><button title="TradingView"><TrendingUp size={15} /></button><button title="Analysis tool"><LineChart size={15} /></button><button title="Undo"><RefreshCw size={15} /></button><button title="Redo"><RefreshCw size={15} /></button><button title="Zoom in"><Plus size={15} /></button><button title="Zoom out"><ChevronDown size={15} /></button></div><div className="dbot-canvas-scroll"><div className="editor-block editor-block--parameters"><div className="editor-block-heading"><span>1. Trade parameters</span><small>{profile?.captured ? "Loaded from Free Bots" : "Draft editor"}</small></div><div className="parameter-line"><b>Market:</b><span>Deriv</span><span>Continuous Indices</span><strong>{profile?.market || "Live market"}</strong></div><div className="parameter-line parameter-line--muted">Alternate markets (Continuous Indices) only: <b>every</b> 1 <b>run(s)</b></div><div className="parameter-line parameter-line--muted">Scan all volatility markets simultaneously: <b>□</b></div><div className="parameter-line"><b>Virtual Hook:</b> <span>◉</span> <small>Virtual Hook Settings</small></div><div className="parameter-line"><b>Trade Type:</b><strong>{profile?.tradeType || "Digits > Over/Under"}</strong></div><div className="parameter-line"><b>Contract Type:</b><strong>{profile?.contractScope || "Both"}</strong></div><div className="parameter-line"><b>Default Candle Interval:</b><strong>{profile?.candle || "1 minute"}</strong></div><label className="parameter-check">Restart buy/sell on error: <input type="checkbox" /></label><label className="parameter-check">Restart last trade on error: <input type="checkbox" defaultChecked /></label></div>{profile?.captured ? <div className="editor-block editor-block--run-once"><div className="editor-block-heading"><span>Run once at start:</span><small>sequence</small></div>{profile.runOnce.map((item, index) => <div className={`mini-block mini-block--${item.kind}`} key={`${item.label}-${index}`}><span>{item.kind === "print" ? "print" : item.kind === "set" ? "set" : "if"}</span><b>{item.label}</b>{item.value && <em>{item.value}</em>}</div>)}</div> : <div className="editor-block editor-block--unobserved"><AlertTriangle size={16} /><b>This bot’s exact block graph is not captured yet.</b><p>Load behavior is preserved, but Ernest will not invent parameters or enable a real-money run until the authenticated reference graph is observed.</p></div>}{profile?.restartCondition && <div className="editor-block editor-block--condition"><div className="editor-block-heading"><span>4. Restart trading conditions</span><small>condition</small></div><div className="mini-block mini-block--condition"><span>if</span><b>{profile.restartCondition}</b></div></div>}</div><div className="canvas-trash"><span>⌑</span> Drop blocks here to delete</div><div className="active-block-note"><Settings2 size={13} /> Selected block family: <b>{activeTool}</b></div></Panel>;
}

function BotBuilderView({ loadedBotName, runState, onRun, onReset }: { loadedBotName: string; runState: RunState; onRun: () => void; onReset: () => void }) {
  const loadedProfile = botProfiles.find((profile) => profile.name === loadedBotName);
  const [botName, setBotName] = useState(loadedProfile?.name || localStorage.getItem("ernest_selected_bot") || "My first strategy");
  const [symbol, setSymbol] = useState(loadedProfile?.market || "Live market");
  const [activeTool, setActiveTool] = useState("Trade parameters");
  const [saved, setSaved] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("ernest_bots") || "[]"); } catch { return []; } });
  useEffect(() => { if (loadedProfile) { setBotName(loadedProfile.name); setSymbol(loadedProfile.market); } }, [loadedProfile]);
  const saveBot = () => { const next = Array.from(new Set([...saved, botName])); setSaved(next); localStorage.setItem("ernest_bots", JSON.stringify(next)); };
  return <><ModuleHeading icon={Bot} eyebrow="Bot Builder" title={loadedProfile ? loadedProfile.name : "Build a bot you can explain"} description={loadedProfile ? "This D-Bot graph was loaded from the authenticated Free Bots catalog. Modify blocks, then use Run only after reviewing the selected account and proposal." : "Create a transparent strategy template first. Ernest keeps execution separate until you deliberately connect a trading account."} />{loadedProfile && <div className={`loaded-bot-banner ${loadedProfile.captured ? "is-captured" : "is-unobserved"}`}><span><Bot size={15} /> Loaded bot</span><b>{loadedProfile.name}</b><small>{loadedProfile.captured ? "Observed block graph reproduced" : "Catalog entry loaded; exact graph still requires authenticated inspection"}</small></div>}<div className="builder-grid"><Panel className="builder-draft-panel"><div className="panel-heading"><div><span className="panel-kicker"><WandSparkles size={12} /> Visual builder</span><h2>Strategy blocks</h2></div><span className="builder-status"><i /> {loadedProfile ? "Loaded" : "Draft"}</span></div><label className="field-label">Bot name<input value={botName} onChange={(event) => setBotName(event.target.value)} /></label><label className="field-label">Market source<select value={symbol} onChange={(event) => setSymbol(event.target.value)}><option>{loadedProfile?.market || "Live market"}</option><option>Selected account</option><option>Watchlist</option></select></label><div className="builder-blocks"><div><span>01</span><b>When market moves</b><small>Choose a live trigger condition.</small></div><div><span>02</span><b>Check strategy rule</b><small>Define the threshold before action.</small></div><div><span>03</span><b>Prepare an outcome</b><small>Review before any execution.</small></div></div><button className="primary-button" onClick={saveBot}><Check size={14} /> Save bot draft</button></Panel><Panel><div className="panel-heading"><div><span className="panel-kicker"><ListChecks size={12} /> Saved workspace</span><h2>Your bot drafts</h2></div></div>{saved.length ? <div className="saved-list">{saved.map((name) => <div key={name}><Bot size={14} /><span>{name}</span><small>Draft</small></div>)}</div> : <div className="empty-state"><Bot size={19} /><span>No bot drafts yet. Save the builder to create one.</span></div>}<div className="safe-note"><LockKeyhole size={14} /><span>Bot drafts are local workspace configuration until you connect an authenticated execution channel.</span></div></Panel></div><div className="dbot-parity-grid"><BlockMenu activeTool={activeTool} onSelect={setActiveTool} /><DbotCanvas profile={loadedProfile} activeTool={activeTool} onSelectTool={setActiveTool} /><RunPanel state={runState} botName={loadedProfile?.name} onRun={onRun} onReset={onReset} /></div></>;
}

function FreeBotsView({ onLoad, runState, onRun, onReset }: { onLoad: (profile: BotProfile) => void; runState: RunState; onRun: () => void; onReset: () => void }) {
  const [importError, setImportError] = useState<string | null>(null);
  const load = (profile: BotProfile) => { if (profile.invalidImport) { setImportError("Your import failed due to an invalid file. Upload a complete strategy file."); return; } setImportError(null); onLoad(profile); };
  return <><ModuleHeading icon={Gift} eyebrow="Free Bots" title="Free Bots" description="Choose a template from the authenticated catalog. Blueman loads the selected bot into the shared D-Bot block editor rather than opening a stake form." /><div className="free-bots-layout"><div className="template-grid">{botProfiles.map((profile) => { const Icon = profile.icon; return <Panel className={`template-card template-card--${profile.color}`} key={profile.name}><span className="template-icon"><Icon size={21} /></span><h2>{profile.name}</h2><p>{profile.detail}</p><div className="template-meta"><span><ShieldCheck size={12} /> Load into editor</span><button onClick={() => load(profile)}>Load Bot <ChevronDown size={12} /></button></div></Panel>; })}</div><RunPanel state={runState} onRun={onRun} onReset={onReset} /></div>{importError && <div className="import-validation"><span><AlertTriangle size={18} /></span><div><b>Invalid!!!</b><p>{importError}</p></div><button onClick={() => setImportError(null)}>Close</button></div>}<div className="provider-note"><ShieldCheck size={15} /><span>Free Bot cards only select a graph. Execution happens from the shared D-Bot Run control after a visible review and an explicit proposal confirmation.</span></div></>;
}

function StrategiesView() {
  const [strategies, setStrategies] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("ernest_strategies") || "[]"); } catch { return []; } });
  const [name, setName] = useState(""); const [openGuide, setOpenGuide] = useState<string | null>(null);
  const guides = [{ name: "A Beginners Guide by Trader Mike 1.pdf", pages: 5 }, { name: "Understanding Deriv's Trade Types.pdf", pages: 4 }];
  const add = () => { if (!name.trim()) return; const next = [...strategies, name.trim()]; setStrategies(next); localStorage.setItem("ernest_strategies", JSON.stringify(next)); setName(""); };
  return <><ModuleHeading icon={Workflow} eyebrow="Strategies" title="A library for your thinking" description="Keep strategy definitions, notes, and review status together before wiring them to an account." /><Panel><div className="panel-heading"><div><span className="panel-kicker"><Plus size={12} /> New strategy</span><h2>Strategy library</h2></div><span className="builder-status"><i /> Local workspace</span></div><div className="inline-form"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Range breakout review" /><button className="primary-button" onClick={add}><Plus size={14} /> Add strategy</button></div>{strategies.length ? <div className="strategy-list">{strategies.map((strategy, index) => <div key={`${strategy}-${index}`}><span className="strategy-number">{String(index + 1).padStart(2, "0")}</span><b>{strategy}</b><small>Review required</small><ChevronDown size={14} /></div>)}</div> : <div className="empty-state"><Workflow size={18} /><span>Your strategy library is empty.</span></div>}<div className="guide-grid">{guides.map((guide) => <button className="guide-card" key={guide.name} onClick={() => setOpenGuide(guide.name)}><FileText size={18} /><span><b>{guide.name}</b><small>{guide.pages} pages · Ernest guide viewer</small></span><ChevronDown size={14} /></button>)}</div>{openGuide && <div className="guide-viewer"><div className="guide-viewer-top"><span><FileText size={14} /> {openGuide}</span><button onClick={() => setOpenGuide(null)} aria-label="Close guide"><X size={15} /></button></div><div className="guide-pages">{Array.from({ length: guides.find((guide) => guide.name === openGuide)?.pages || 4 }, (_, index) => <span key={index}>{index + 1}</span>)}</div><div className="guide-page"><FileText size={28} /><b>Strategy guide preview</b><small>Page 1 · View, download, print, and review this guide before using a strategy.</small></div><div className="guide-tools"><button><Search size={13} /> Zoom</button><button><RefreshCw size={13} /> Rotate</button><button><UploadCloud size={13} /> Download</button><button><FileText size={13} /> Print</button></div></div>}</Panel></>;
}

function AnalysisView({ activeSymbols, quotes }: { activeSymbols: Quote[]; quotes: Record<string, Quote> }) {
  return <><ModuleHeading icon={LineChart} eyebrow="Analysis Tools" title="Read the market before you act" description="Live quotes come from Deriv’s public market feed. This surface describes movement; it does not make investment recommendations." /><div className="analysis-grid">{activeSymbols.length ? activeSymbols.map((symbol) => { const quote = quotes[symbol.symbol]; const history = quote?.history || []; const max = Math.max(...history, 1); return <Panel className="analysis-card" key={symbol.symbol}><div className="panel-heading"><div><span className="panel-kicker"><Activity size={12} /> {symbol.market || "Market"}</span><h2>{symbol.name}</h2></div><strong className="analysis-quote">{quote?.quote?.toFixed(4) || "—"}</strong></div><div className="mini-chart">{history.slice(-24).map((point, index) => <i key={`${point}-${index}`} style={{ height: `${Math.max(8, (point / max) * 100)}%` }} />)}</div><small className="data-source">Live tick stream · {symbol.symbol}</small></Panel>; }) : <Panel><div className="empty-state"><Loader2 size={18} className="spin" /><span>Waiting for active symbols…</span></div></Panel>}</div></>;
}

function DTraderView({ activeSymbols }: { activeSymbols: Quote[] }) {
  const [stake, setStake] = useState("10"); const [duration, setDuration] = useState("60"); const [growthRate, setGrowthRate] = useState("1%"); const [takeProfit, setTakeProfit] = useState("6000"); const [chartType, setChartType] = useState("Area"); const [preview, setPreview] = useState(false);
  return <><ModuleHeading icon={Zap} eyebrow="D-Trader" title="Shape a contract preview" description="Plan the trade. Let the price come to you. Ernest validates the inputs and keeps execution behind an explicit review gate." /><Panel className="trader-panel"><div className="panel-heading"><div><span className="panel-kicker"><SlidersHorizontal size={12} /> Contract setup</span><h2>Options preview</h2></div><span className="builder-status"><i /> Execution locked</span></div><div className="trade-fields"><label className="field-label">Underlying market<select><option>{activeSymbols[0]?.name || "Waiting for market data"}</option>{activeSymbols.slice(1).map((symbol) => <option key={symbol.symbol}>{symbol.name}</option>)}</select></label><label className="field-label">Chart type<select value={chartType} onChange={(event) => setChartType(event.target.value)}><option>Area</option><option>Candles</option><option>Line</option></select></label><label className="field-label">Contract type<select><option>Accumulators</option><option>Rise / Fall</option><option>Higher / Lower</option><option>Touch / No Touch</option></select></label><label className="field-label">Growth rate<select value={growthRate} onChange={(event) => setGrowthRate(event.target.value)}><option>1%</option><option>2%</option><option>3%</option><option>4%</option><option>5%</option></select></label><label className="field-label">Stake<input value={stake} onChange={(event) => setStake(event.target.value)} inputMode="decimal" /></label><label className="field-label">Take profit<input value={takeProfit} onChange={(event) => setTakeProfit(event.target.value)} inputMode="decimal" /></label><label className="field-label">Duration (seconds)<input value={duration} onChange={(event) => setDuration(event.target.value)} inputMode="numeric" /></label></div><div className="trade-preview"><span><small>Stake</small><b>{stake || "—"} USD</b></span><span><small>Growth rate</small><b>{growthRate}</b></span><span><small>Take profit</small><b>{takeProfit || "—"} USD</b></span><span><small>Chart</small><b>{chartType}</b></span></div><button className="primary-button" onClick={() => setPreview(true)}><Search size={14} /> Preview contract</button>{preview && <div className="execution-warning"><AlertTriangle size={16} /><div><b>Preview only</b><p>Ernest has not sent a proposal or trade. Live execution will require an authenticated Options WebSocket and your explicit confirmation of the account, stake, duration, and contract.</p></div><button onClick={() => setPreview(false)} aria-label="Close preview"><X size={15} /></button></div>}</Panel></>;
}

function SimpleModuleView({ section }: { section: SectionKey }) {
  const details: Record<string, { icon: LucideIcon; description: string; items: string[] }> = { auto: { icon: Timer, description: "Sequence a reviewed strategy with visible timing and pause controls.", items: ["Session window", "Pause on error", "Manual review gate"] }, bulk: { icon: Boxes, description: "Prepare a batch of reviewed actions without silently submitting them.", items: ["Batch size", "Account scope", "Review queue"] }, signals: { icon: Radio, description: "Compare live market movement and build your own watchlist signals.", items: ["Movement filters", "Watchlist", "Signal notes"] }, matches: { icon: GitCompare, description: "Compare live symbols by market, movement, and available contract surface.", items: ["Market pair", "Movement delta", "Contract coverage"] }, speedbot: { icon: Gauge, description: "A compact quick-start surface for a reviewed bot template.", items: ["Quick template", "Stake guard", "Pause control"] }, copy: { icon: Copy, description: "Copy Trading is provider-dependent and is not simulated by Ernest.", items: ["Provider connection required", "Source account review", "Risk disclosure"] } };
  const detail = details[section] || details.auto; const Icon = detail.icon;
  return <><ModuleHeading icon={Icon} eyebrow={displaySection(section)} title={displaySection(section)} description={detail.description} /><Panel><div className="module-feature-list">{detail.items.map((item) => <div key={item}><span><Icon size={15} /></span><b>{item}</b><small>{section === "copy" ? "Provider integration required before this can be activated." : "Available in the Ernest workspace shell."}</small><LockKeyhole size={14} /></div>)}</div><div className="provider-note"><AlertTriangle size={15} /><span>This module is visible and safely scoped, but Ernest will not fabricate provider data or silently submit trades.</span></div></Panel></>;
}

export default function Workspace() {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("ernest_deriv_access_token") : null;
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");
  const [accounts, setAccounts] = useState<DerivAccount[]>([]); const [selectedAccountId, setSelectedAccountId] = useState(""); const [accountLoading, setAccountLoading] = useState(Boolean(token)); const [accountError, setAccountError] = useState("");
  const [quotes, setQuotes] = useState<Record<string, Quote>>({}); const [activeSymbols, setActiveSymbols] = useState<Quote[]>([]); const socketRef = useRef<WebSocket | null>(null);
  const [loadedBotName, setLoadedBotName] = useState(() => localStorage.getItem("ernest_selected_bot") || "");
  const [runState, setRunState] = useState<RunState>(initialRunState);

  const loadAccounts = () => { if (!token) return; setAccountLoading(true); setAccountError(""); void fetchDerivAccounts(token).then((next) => { setAccounts(next); setSelectedAccountId((current) => current || next[0]?.id || ""); }).catch((error: Error) => setAccountError(error.message || "Unable to load accounts.")).finally(() => setAccountLoading(false)); };
  useEffect(() => { loadAccounts(); const socket = new WebSocket("wss://api.derivws.com/trading/v1/options/ws/public"); socketRef.current = socket; socket.onopen = () => socket.send(JSON.stringify({ active_symbols: "brief", req_id: 1 })); socket.onmessage = (event) => { try { const data = JSON.parse(event.data); if (data.msg_type === "active_symbols" && Array.isArray(data.active_symbols)) { const rawSymbols = data.active_symbols as Array<Record<string, unknown>>; const next: Quote[] = rawSymbols.filter((item) => item.symbol && item.display_name).slice(0, 8).map((item) => ({ symbol: String(item.symbol), name: String(item.display_name), market: String(item.market ?? ""), quote: null, previous: null, history: [] })); setActiveSymbols(next); next.slice(0, 8).forEach((item: Quote, index: number) => socket.send(JSON.stringify({ ticks: item.symbol, subscribe: 1, req_id: 100 + index }))); } if (data.msg_type === "tick" && data.tick?.symbol) { const symbol = String(data.tick.symbol); const quote = Number(data.tick.quote); setQuotes((current) => { const previous = current[symbol]?.quote ?? null; return { ...current, [symbol]: { ...(current[symbol] || { symbol, name: symbol, market: "", history: [] }), quote, previous, history: [...(current[symbol]?.history || []), quote].slice(-40) } }; }); } } catch { /* Keep the public stream alive when a message is malformed. */ } }; return () => { socket.close(); socketRef.current = null; }; }, []);
  const selectedAccount = useMemo(() => accounts.find((account) => account.id === selectedAccountId) || accounts[0], [accounts, selectedAccountId]);
  const loadedProfile = botProfiles.find((profile) => profile.name === loadedBotName);
  const navigate = (key: SectionKey) => setActiveSection(key);
  const handleLoad = (profile: BotProfile) => { setLoadedBotName(profile.name); localStorage.setItem("ernest_selected_bot", profile.name); setActiveSection("bots"); setRunState((current) => ({ ...current, status: `${profile.name} loaded into the D-Bot editor.` })); };
  const resetRun = () => setRunState(initialRunState);
  const prepend = (items: string[], item: string) => [item, ...items].slice(0, 8);
  const runLoadedBot = async () => {
    if (!loadedProfile) { setActiveSection("free-bots"); setRunState((current) => ({ ...current, status: "Load a Free Bot before pressing Run." })); return; }
    if (!loadedProfile.captured) { setRunState((current) => ({ ...current, status: "Run blocked: this bot’s exact authenticated block graph has not been captured." })); return; }
    if (!token || !selectedAccount) { setRunState((current) => ({ ...current, status: "Connect and select a Deriv account before pressing Run." })); return; }
    const profile = toExecutionProfile(loadedProfile, selectedAccount);
    const confirmedStart = window.confirm(`Review ${loadedProfile.name} on ${selectedAccount.label} before requesting a proposal. Stake: ${profile.amount.toFixed(2)} ${profile.currency}. Market: ${loadedProfile.market}. Continue?`);
    if (!confirmedStart) { setRunState((current) => ({ ...current, status: "Run cancelled before any Deriv request." })); return; }
    setActiveSection("bots"); setRunState((current) => ({ ...current, running: true, status: "Requesting a live proposal…", journal: prepend(current.journal, `Proposal requested for ${loadedProfile.name}.`) }));
    try {
      const proposal = await previewBot(token, selectedAccount.id, profile);
      setRunState((current) => ({ ...current, status: `Proposal ready: ${proposal.askPrice.toFixed(2)} ${profile.currency}. Review before buy.`, journal: prepend(current.journal, `Proposal ready for ${loadedProfile.name}: ${proposal.askPrice.toFixed(2)} ${profile.currency}.`) }));
      const confirmedBuy = window.confirm(`Proposal ready for ${loadedProfile.name}. Ask price: ${proposal.askPrice.toFixed(2)} ${profile.currency}. Payout: ${proposal.payout.toFixed(2)} ${profile.currency}. Submit this order to ${selectedAccount.isDemo ? "demo" : "live"} account ${selectedAccount.label}?`);
      if (!confirmedBuy) { setRunState((current) => ({ ...current, running: false, status: "Proposal reviewed; order not submitted.", journal: prepend(current.journal, "Proposal reviewed; order not submitted.") })); return; }
      setRunState((current) => ({ ...current, status: "Submitting the confirmed contract…", journal: prepend(current.journal, "Second confirmation received; submitting contract.") }));
      const result = await buyBot(token, selectedAccount.id, profile, proposal.id, proposal.askPrice);
      setRunState((current) => ({ ...current, running: false, status: `Submitted contract ${result.contractId || result.transactionId || "created"}. Awaiting outcome.`, runs: current.runs + 1, totalStake: current.totalStake + result.buyPrice, totalPayout: current.totalPayout + proposal.payout, transactions: prepend(current.transactions, `${loadedProfile.name} · ${result.contractId || result.transactionId || "submitted"}`), journal: prepend(current.journal, `Contract submitted on ${selectedAccount.label}.`) }));
    } catch (error) { setRunState((current) => ({ ...current, running: false, status: error instanceof Error ? error.message : "Deriv rejected the bot request.", journal: prepend(current.journal, error instanceof Error ? error.message : "Deriv rejected the bot request.") })); }
  };
  if (!token) return <main className="workspace-auth"><div><LockKeyhole size={28} /><h1>Connect Ernest to Deriv</h1><p>Your authenticated workspace opens after a successful Deriv OAuth connection.</p><button className="primary-button" onClick={() => { window.location.assign("/"); }}>Return to login</button></div></main>;
  const activeNav = navItems.find((item) => item.key === activeSection) || navItems[0]; const ActiveNavIcon = activeNav.icon;
  return <main className="workspace-app"><header className="workspace-topbar"><a className="workspace-brand" href="/"><span className="workspace-brand-mark">E</span><span><b>Ernest</b><small>powered by Deriv</small></span></a><div className="workspace-report-link"><FileText size={15} /> Reports</div><div className="workspace-account-control"><span>{selectedAccount?.currency || "USD"}</span><select value={selectedAccountId} onChange={(event) => setSelectedAccountId(event.target.value)} disabled={accountLoading || !accounts.length}>{accounts.length ? accounts.map((account) => <option value={account.id} key={account.id}>{account.label} · {formatMoney(account.balance, account.currency)}</option>) : <option>{accountLoading ? "Syncing…" : "No accounts"}</option>}</select><button onClick={loadAccounts} aria-label="Refresh accounts"><RefreshCw size={15} /></button><button onClick={() => { sessionStorage.removeItem("ernest_deriv_access_token"); window.location.assign("/"); }} aria-label="Sign out"><LogOut size={15} /></button></div></header><nav className="workspace-nav" aria-label="Ernest workspace modules">{navItems.map((item) => { const Icon = item.icon; return <button className={item.key === activeSection ? "is-active" : ""} key={item.key} onClick={() => navigate(item.key)}><Icon size={15} />{item.label}</button>; })}</nav><div className="workspace-content"><div className="workspace-location"><span><ActiveNavIcon size={14} /> {activeNav.label}</span>{accountError && <em><AlertTriangle size={12} /> {accountError}</em>}</div>{activeSection === "dashboard" && <DashboardView accounts={accounts} quotes={quotes} activeSymbols={activeSymbols} onNavigate={navigate} onSync={loadAccounts} />}{activeSection === "bots" && <BotBuilderView loadedBotName={loadedBotName} runState={runState} onRun={runLoadedBot} onReset={resetRun} />}{activeSection === "free-bots" && <FreeBotsView onLoad={handleLoad} runState={runState} onRun={runLoadedBot} onReset={resetRun} />}{activeSection === "strategies" && <StrategiesView />}{activeSection === "analysis" && <AnalysisView activeSymbols={activeSymbols} quotes={quotes} />}{activeSection === "dtrader" && <DTraderView activeSymbols={activeSymbols} />}{["auto", "bulk", "signals", "matches", "speedbot", "copy"].includes(activeSection) && <SimpleModuleView section={activeSection} />}</div><div className="workspace-execution-bar"><button className="execution-run" onClick={runLoadedBot}><Zap size={17} /> {loadedBotName ? "Run" : "Review trade"}</button><div><span>Execution</span><b>{runState.running ? "RUNNING" : "SAFE MODE"}</b></div><span className="execution-dot"><i /> {selectedAccount ? `${selectedAccount.isDemo ? "Demo" : "Live"} account selected` : "Select an account"}</span><span className="execution-clock"><ShieldCheck size={13} /> Review every action</span></div><div className="workspace-risk-badge"><AlertTriangle size={12} /> Risk disclosure</div></main>;
}
