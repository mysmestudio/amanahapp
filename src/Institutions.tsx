// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, animate, useInView } from "framer-motion";
import { GOALS, goalOf, INSTITUTIONS, PRODUCTS, CONTRACTS, SECTORS, sortAZ, productsFor, contractsIn } from "./institutions";
import { Ic, GOAL_ICON, rise, SiteNav, SiteFooter, ListingModal } from "./site";

const SECTOR_TONE = { "Commercial Banking": "#13306B", "Banking Window & DFI": "#2A4FA8", "Microfinance & Finance Co.": "#1E7A4E", "Capital Markets & Funds": "#0F6E6E", "Takaful (Islamic Insurance)": "#B4472A", "Non-Interest Pensions": "#6B4FA8", "Fintech & Screening": "#B98A1F" };
const SECTOR_SHORT = { "Commercial Banking": "Banks", "Banking Window & DFI": "Windows & DFIs", "Microfinance & Finance Co.": "Microfinance", "Capital Markets & Funds": "Fund managers", "Takaful (Islamic Insurance)": "Takaful", "Non-Interest Pensions": "Pensions", "Fintech & Screening": "Fintech" };
const initials = n => n.replace(/^The\s+/i, "").replace(/\(.*?\)/g, "").split(/[\s/]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
const instById = id => INSTITUTIONS.find(i => i.id === id);
const short = n => n.replace(/\s*\((NIB Window|Fund VI|Halal Windows|Sukuk Fund|FBN Halal Fund|AltBank|TrustBanc Arthur)\)/, "").replace(/ — NIB Window$/, "");

function Count({ to }) {
  const ref = useRef(null); const on = useInView(ref, { once: true }); const [v, setV] = useState(0);
  useEffect(() => { if (!on) return; const c = animate(0, to, { duration: 1.6, ease: [.16, 1, .3, 1], onUpdate: setV }); return () => c.stop(); }, [on]);
  return <span ref={ref} className="tnum">{Math.round(v)}</span>;
}

/* ---------- sheets ---------- */
function Sheet({ onClose, children, label }) {
  useEffect(() => { const k = e => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); document.body.style.overflow = "hidden"; return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; }; }, []);
  return (
    <div className="lp-modal" role="dialog" aria-modal="true" aria-label={label} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="lp-sheet wide" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35, ease: [.16, 1, .3, 1] }}>
        <button className="lp-x" onClick={onClose} aria-label="Close"><Ic n="x" /></button>
        {children}
      </motion.div>
    </div>
  );
}
function ContractSheet({ c, onClose }) {
  return (
    <Sheet onClose={onClose} label={c.name}>
      <span className="lp-eyebrow">Islamic contract</span>
      <h3 className="lp-sheet-t">{c.name}</h3>
      <p className="lp-ctr-mean">"{c.meaning}"</p>
      <div className="lp-ctr-rows">
        <div><small>How it works</small><p>{c.how}</p></div>
        <div><small>Who carries the risk</small><p>{c.risk}</p></div>
        <div><small>Where you'll see it in Nigeria</small><p>{c.uses}</p></div>
      </div>
    </Sheet>
  );
}
function InstSheet({ inst, onClose, onContract }) {
  const tone = SECTOR_TONE[inst.sector] || "#13306B";
  const prods = PRODUCTS.filter(p => p.inst === inst.id);
  return (
    <Sheet onClose={onClose} label={inst.name}>
      <div className="lp-is-h"><span className="lp-mono lg" style={{ background: tone }}>{initials(inst.name)}</span><div><span className="lp-eyebrow" style={{ color: tone }}>{inst.kind}</span><h3 className="lp-sheet-t">{inst.name}</h3></div></div>
      <div className="lp-is-tags">
        <span className="lp-reg"><Ic n="badge" s={14} />{inst.regulator}</span>
        {inst.since && <span className="lp-tag">Since {inst.since}</span>}
        {inst.protection && <span className="lp-tag">{inst.protection}</span>}
        {inst.shariah && <span className="lp-tag">Shariah: {inst.shariah}</span>}
      </div>
      {inst.licence && <p className="lp-muted" style={{ fontSize: 14 }}>{inst.licence}</p>}
      {inst.suite && <div className="lp-is-suite"><small>What they offer</small><div className="lp-suite-chips">{inst.suite.split(/,\s*/).map(s => <span key={s}>{s}</span>)}</div></div>}
      {prods.length > 0 && <div className="lp-is-prods"><small>In the product catalogue</small>{prods.map(p => <ProductRow key={p.id} p={p} onContract={onContract} />)}</div>}
      <div className="lp-is-contact">
        {inst.hq && <span><Ic n="pin" s={16} />{inst.hq}</span>}
        {inst.contact && <span><Ic n="phonecall" s={16} />{inst.contact}</span>}
        {inst.site && <a className="btn sm" href={inst.site} target="_blank" rel="noopener noreferrer">Visit website<Ic n="ext" s={15} /></a>}
      </div>
      <p className="lp-fine" style={{ textAlign: "left" }}>Information from public sources, 2026. A listing is not a recommendation. Confirm details with the institution.</p>
    </Sheet>
  );
}
function ProductRow({ p, onContract }) {
  return (
    <div className="lp-prow">
      <b>{p.name}</b>
      <div className="lp-prow-meta"><span>{p.category}</span>{p.min && <span>Min: {p.min}</span>}{p.tenure && <span>{p.tenure}</span>}</div>
      <div className="lp-ctr-chips">{contractsIn(p.contract).map(c => <button key={c.name} onClick={() => onContract(c)}>{c.name.split(" / ")[0]}<Ic n="spark" s={12} /></button>)}{!contractsIn(p.contract).length && <span className="lp-tag">{p.contract}</span>}</div>
    </div>
  );
}

/* ---------- slim product card + details sheet ---------- */
const clip = (t, n = 26) => { if (!t) return ""; const x = String(t).split(/\s*[(;]/)[0].trim(); return x.length > n ? x.slice(0, n - 1) + "…" : x; };
function ProductCard({ p, i, onOpen }) {
  const inst = instById(p.inst); const g = goalOf(p.goal); const c = contractsIn(p.contract)[0];
  return (
    <motion.button className="sp" onClick={() => onOpen(p)} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, delay: Math.min(i, 6) * .05, ease: [.16, 1, .3, 1] }}>
      <span className="sp-top" style={{ background: g.tone }}><small>{clip(p.category, 30)}</small><b>{p.name}</b></span>
      <span className="sp-body">
        <span className="sp-by"><span className="lp-mono xs" style={{ background: SECTOR_TONE[inst?.sector] }}>{initials(p.instName)}</span><span>{short(inst?.name || p.instName)}</span><em>{inst?.regulator}</em></span>
        <span className="sp-facts">{p.min && <span><small>Start</small>{clip(p.min, 18)}</span>}{p.tenure && <span><small>Time</small>{clip(p.tenure, 18)}</span>}</span>
        <span className="sp-foot">{c ? <span className="sp-ctr">{c.name.split(" / ")[0]}</span> : <span />}<span className="sp-more">Details <Ic n="arrow" s={14} /></span></span>
      </span>
    </motion.button>
  );
}
function ProductSheet({ p, onClose, onInst, onContract }) {
  const inst = instById(p.inst); const g = goalOf(p.goal);
  return (
    <Sheet onClose={onClose} label={p.name}>
      <span className="lp-eyebrow" style={{ color: g.tone }}>{p.category}</span>
      <h3 className="lp-sheet-t">{p.name}</h3>
      <button className="lp-pcard-inst" style={{ margin: "10px 0 6px" }} onClick={() => onInst(inst)}><span className="lp-mono sm" style={{ background: SECTOR_TONE[inst?.sector] }}>{initials(p.instName)}</span><span>{short(inst?.name || p.instName)}<small>{inst?.regulator} · see the institution</small></span></button>
      {p.features && <p className="lp-muted" style={{ fontSize: 15, lineHeight: 1.55 }}>{p.features}</p>}
      <dl className="lp-pcard-dl" style={{ marginTop: 14 }}>
        {p.min && <><dt>Start with</dt><dd>{p.min}</dd></>}
        {p.tenure && <><dt>Time</dt><dd>{p.tenure}</dd></>}
        {p.pricing && <><dt>How you earn or pay</dt><dd>{p.pricing}</dd></>}
        {p.segment && <><dt>Made for</dt><dd>{p.segment}</dd></>}
      </dl>
      <div className="lp-ctr-chips" style={{ marginTop: 14 }}>{contractsIn(p.contract).map(c => <button key={c.name} onClick={() => onContract(c)}>{c.name.split(" / ")[0]}<Ic n="spark" s={12} /></button>)}</div>
      <p className="lp-fine" style={{ textAlign: "left", marginTop: 14 }}>Public information, 2026. Not a recommendation. Confirm details with the institution.</p>
    </Sheet>
  );
}

/* ---------- flip card ---------- */
function Flip({ c, i }) {
  const [f, setF] = useState(false);
  const tones = ["#13306B", "#1E7A4E", "#B4472A", "#2A4FA8", "#0F6E6E", "#6B4FA8", "#8A6512", "#2A4FA8", "#1E7A4E", "#B4472A"];
  return (
    <motion.button className={"lp-flip" + (f ? " on" : "")} onClick={() => setF(!f)} aria-pressed={f} aria-label={`${c.name}: ${f ? "showing how it works" : "tap to see how it works"}`}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .45, delay: (i % 5) * .06 }}>
      <span className="lp-flip-in">
        <span className="lp-flip-f" style={{ background: tones[i % tones.length] }}>
          <small>Contract {String(i + 1).padStart(2, "0")}</small>
          <b>{c.name.split(" / ")[0]}</b>
          <em>{c.meaning}</em>
          <span className="lp-flip-hint">Tap to decode <Ic n="spark" s={13} /></span>
        </span>
        <span className="lp-flip-b">
          <small>How it works</small>
          <span>{c.how}</span>
          <small>Risk</small>
          <span>{c.risk}</span>
        </span>
      </span>
    </motion.button>
  );
}

const TABS = [["/app/directory", "Match me", "spark", true], ["/app/directory/all", "Institutions", "building"], ["/app/directory/contracts", "Contracts", "doc"]];
const TITLES = {
  match: ["Find a halal home for your money.", "Tell us what you want your money to do."],
  all: [`All ${INSTITUTIONS.length} institutions.`, "Licensed, verified and always A to Z."],
  contracts: ["Ten words that make finance halal.", "Tap a card to see how it works and who carries the risk."]
};

export default function Institutions({ view = "match" }) {
  const [params, setParams] = useSearchParams();
  const goal = params.get("goal");
  const [q, setQ] = useState("");
  const [sector, setSector] = useState(null);
  const [listing, setListing] = useState(false);
  const [inst, setInst] = useState(null);
  const [ctr, setCtr] = useState(null);
  const [prod, setProd] = useState(null);
  const resultsRef = useRef(null);
  const pick = g => { const n = new URLSearchParams(params); g ? n.set("goal", g) : n.delete("goal"); setParams(n, { replace: true }); if (g) setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); };
  const G = goal ? goalOf(goal) : null;
  const matches = G ? productsFor(G.id) : [];
  const helpers = G ? INSTITUTIONS.filter(i => i.goals.includes(G.id)) : [];
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return INSTITUTIONS.filter(i => !sector || i.sector === sector).filter(i => view !== "all" || !G || i.goals.includes(G.id))
      .filter(i => !t || [i.name, i.kind, i.regulator, i.suite, i.hq].join(" ").toLowerCase().includes(t)).sort(sortAZ);
  }, [q, sector, goal, view]);
  const [title, sub] = TITLES[view];

  return (
    <div className="lp lp-inapp dir2">
      <header className="d2-head">
        <div className="d2-hero">
          <span className="lp-eyebrow gold">Halal directory · Nigeria 2026</span>
          <h1>{title}</h1>
          <p>{sub}</p>
          <div className="d2-stats"><span><b>{INSTITUTIONS.length}</b> institutions</span><span><b>{PRODUCTS.length}</b> products</span><span><b>{CONTRACTS.length}</b> contracts</span><span><b>4</b> regulators</span></div>
        </div>
        <nav className="d2-tabs" aria-label="Directory sections">{TABS.map(([to, l, ic, end]) => <NavLink key={to} to={to + (goal && to !== "/app/directory/contracts" ? `?goal=${goal}` : "")} end={!!end}><Ic n={ic} s={16} />{l}</NavLink>)}</nav>
      </header>

      {view === "match" && <section className="d2-sec">
        <h2 className="lp-sentence d2-sentence">I want to <span className="lp-blank" style={{ background: G ? G.tone : "var(--paper-3)", color: G ? "#FFFFFF" : "var(--ink-2)" }}><AnimatePresence mode="wait"><motion.span key={goal || "none"} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: .25 }}>{G ? G.ask : "…"}</motion.span></AnimatePresence></span></h2>
        <div className="lp-goalpick d2-goals" role="group" aria-label="What do you want your money to do?">
          {GOALS.map(g => (
            <motion.button key={g.id} className="lp-gp" aria-pressed={goal === g.id} style={{ "--t": g.tone }} onClick={() => pick(goal === g.id ? null : g.id)} whileTap={{ scale: .96 }}>
              <span className="lp-gp-ic"><Ic n={GOAL_ICON[g.id]} s={20} /></span><b>{g.label}</b>
            </motion.button>
          ))}
        </div>
        <div ref={resultsRef} className="lp-results">
          <AnimatePresence mode="wait">
            {G ? (
              <motion.div key={G.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .35 }}>
                <div className="d2-res-h">
                  <span className="lp-res-n" style={{ color: G.tone }}>{matches.length || helpers.length}</span>
                  <span><b>{matches.length ? `halal product${matches.length === 1 ? "" : "s"} to ${G.ask}` : `institution${helpers.length === 1 ? "" : "s"} that can help`}</b><small>Shown A to Z, never ranked. Tap a card for details.</small></span>
                </div>
                {matches.length > 0 && <div className="lp-rail d2-rail">{matches.map((p, i) => <ProductCard key={p.id} p={p} i={i} onOpen={setProd} />)}</div>}
                <Link to={`/app/directory/all?goal=${G.id}`} className="d2-seeall"><span className="d2-avs">{helpers.slice(0, 5).map(i => <i key={i.id} style={{ background: SECTOR_TONE[i.sector] }}>{initials(i.name)}</i>)}</span><span><b>See the {helpers.length} institutions that offer this</b><small>Compare who's licensed, what they offer and how to reach them</small></span><Ic n="arrow" s={18} /></Link>
              </motion.div>
            ) : (
              <motion.p key="hint" className="lp-res-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Pick one above to see matching products.</motion.p>
            )}
          </AnimatePresence>
        </div>
        <Link to="/app/directory/contracts" className="d2-promo"><span className="d2-promo-ic">3<em>×</em></span><span><b>New to words like Mudarabah?</b><small>Decode the 10 contracts behind every product</small></span><Ic n="arrow" s={18} /></Link>
      </section>}

      {view === "all" && <section className="d2-sec">
        <div className="d2-filters">
          <label className="lp-search wide"><Ic n="search" s={18} /><input type="search" placeholder="Search by name, product or city" value={q} onChange={e => setQ(e.target.value)} aria-label="Search institutions" /></label>
          <div className="d2-chips">
            {G && <button className="d2-chip on" style={{ "--t": G.tone }} onClick={() => pick(null)}>{G.label} <Ic n="x" s={13} /></button>}
            <button className="d2-chip" aria-pressed={!sector} onClick={() => setSector(null)}>All <em>{INSTITUTIONS.length}</em></button>
            {SECTORS.map(s => <button key={s} className="d2-chip" aria-pressed={sector === s} style={{ "--t": SECTOR_TONE[s] }} onClick={() => setSector(sector === s ? null : s)}>{SECTOR_SHORT[s]} <em>{INSTITUTIONS.filter(i => i.sector === s).length}</em></button>)}
          </div>
        </div>
        <motion.div layout className="d2-list">
          <AnimatePresence>
            {list.map(i => { const n = PRODUCTS.filter(p => p.inst === i.id).length; return (
              <motion.button layout key={i.id} className="d2-row" onClick={() => setInst(i)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}>
                <span className="lp-mono" style={{ background: SECTOR_TONE[i.sector] }}>{initials(i.name)}</span>
                <span className="d2-row-t"><b>{short(i.name)}</b><small>{i.kind}</small></span>
                <span className="d2-row-m"><span className="lp-reg sm">{i.regulator}</span>{n > 0 && <small>{n} product{n === 1 ? "" : "s"}</small>}</span>
                <Ic n="arrow" s={16} />
              </motion.button>); })}
          </AnimatePresence>
        </motion.div>
        {!list.length && <div className="lp-empty"><b>No institutions match that.</b><button className="btn ghost sm" onClick={() => { setQ(""); setSector(null); pick(null); }}>Clear filters</button></div>}
        <button className="d2-list-cta" onClick={() => setListing(true)}><Ic n="building" s={18} /><span><b>Missing an institution?</b><small>Licensed providers can request a free, verified listing</small></span><Ic n="arrow" s={16} /></button>
      </section>}

      {view === "contracts" && <section className="d2-sec">
        <div className="lp-flips d2-flips">{CONTRACTS.map((c, i) => <Flip key={c.name} c={c} i={i} />)}</div>
      </section>}

      <p className="lp-fine d2-fine">Compiled from public sources (2026). Information, not a recommendation or financial advice. Confirm details directly with each institution.</p>
      <ListingModal open={listing} onClose={() => setListing(false)} />
      {prod && <ProductSheet p={prod} onClose={() => setProd(null)} onInst={i => { setProd(null); setInst(i); }} onContract={c => { setProd(null); setCtr(c); }} />}
      {inst && <InstSheet inst={inst} onClose={() => setInst(null)} onContract={c => { setInst(null); setCtr(c); }} />}
      {ctr && <ContractSheet c={ctr} onClose={() => setCtr(null)} />}
    </div>
  );
}
