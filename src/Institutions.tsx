// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

/* ---------- product card (match results) ---------- */
function ProductCard({ p, i, onInst, onContract }) {
  const inst = instById(p.inst); const g = goalOf(p.goal);
  return (
    <motion.article className="lp-pcard" initial={{ opacity: 0, y: 30, rotate: i % 2 ? 1.5 : -1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: .5, delay: Math.min(i, 6) * .06, ease: [.16, 1, .3, 1] }}>
      <div className="lp-pcard-top" style={{ background: g.tone }}>
        <span className="lp-pcard-cat">{p.category}</span>
        <b>{p.name}</b>
      </div>
      <div className="lp-pcard-body">
        <button className="lp-pcard-inst" onClick={() => onInst(inst)}><span className="lp-mono sm" style={{ background: SECTOR_TONE[inst?.sector] }}>{initials(p.instName)}</span><span>{short(inst?.name || p.instName)}<small>{inst?.regulator} · tap for details</small></span></button>
        <p>{p.features}</p>
        <dl className="lp-pcard-dl">
          {p.min && <><dt>Start with</dt><dd>{p.min}</dd></>}
          {p.tenure && <><dt>Time</dt><dd>{p.tenure}</dd></>}
          {p.pricing && <><dt>How you earn or pay</dt><dd>{p.pricing}</dd></>}
        </dl>
        <div className="lp-ctr-chips">{contractsIn(p.contract).map(c => <button key={c.name} onClick={() => onContract(c)}>{c.name.split(" / ")[0]}<Ic n="spark" s={12} /></button>)}</div>
      </div>
    </motion.article>
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

export default function Institutions() {
  const [params, setParams] = useSearchParams();
  const goal = params.get("goal");
  const [q, setQ] = useState("");
  const [sector, setSector] = useState(null);
  const [listing, setListing] = useState(false);
  const [inst, setInst] = useState(null);
  const [ctr, setCtr] = useState(null);
  const resultsRef = useRef(null);
  useEffect(() => { if (location.hash === "#list") setListing(true); }, []);
  const pick = g => { const n = new URLSearchParams(params); g ? n.set("goal", g) : n.delete("goal"); setParams(n, { replace: true }); setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); };
  const G = goal ? goalOf(goal) : null;
  const matches = G ? productsFor(G.id) : [];
  const helpers = G ? INSTITUTIONS.filter(i => i.goals.includes(G.id)).sort(sortAZ) : [];
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return INSTITUTIONS.filter(i => !sector || i.sector === sector).filter(i => !t || [i.name, i.kind, i.regulator, i.suite, i.hq].join(" ").toLowerCase().includes(t)).sort(sortAZ);
  }, [q, sector]);

  return (
    <div className="lp">
      <SiteNav />

      {/* hero */}
      <section className="lp-phero dir"><div className="lp-wrap lp-phero-in">
        <span className="lp-eyebrow gold">The halal finance directory · Nigeria 2026</span>
        <h1>Find a halal home for your money.</h1>
        <p className="lp-lede">Every licensed non-interest bank, takaful operator, halal fund, pension and fintech we could find, in one place. Tell us what you want your money to do, and we'll show you who can help.</p>
        <div className="lp-stats">
          <div><b><Count to={INSTITUTIONS.length} /></b><small>institutions</small></div>
          <div><b><Count to={PRODUCTS.length} /></b><small>products</small></div>
          <div><b><Count to={CONTRACTS.length} /></b><small>Islamic contracts</small></div>
          <div><b><Count to={4} /></b><small>regulators</small></div>
        </div>
      </div>
        <div className="lp-orbit" aria-hidden="true">{SECTORS.map((s, k) => <span key={s} style={{ "--k": k, background: SECTOR_TONE[s] }}>{SECTOR_SHORT[s]}</span>)}</div>
      </section>

      {/* matcher */}
      <section className="lp-sec lp-match"><div className="lp-wrap">
        <motion.div className="lp-head center" {...rise}>
          <span className="lp-eyebrow">Match me</span>
          <h2 className="lp-sentence">I want to <span className="lp-blank" style={{ background: G ? G.tone : "var(--paper-3)", color: G ? "#FFFFFF" : "var(--ink-2)" }}><AnimatePresence mode="wait"><motion.span key={goal || "none"} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: .25 }}>{G ? G.ask : "…"}</motion.span></AnimatePresence></span></h2>
        </motion.div>
        <div className="lp-goalpick" role="group" aria-label="What do you want your money to do?">
          {GOALS.map((g, k) => (
            <motion.button key={g.id} className="lp-gp" aria-pressed={goal === g.id} style={{ "--t": g.tone }} onClick={() => pick(goal === g.id ? null : g.id)}
              initial={{ opacity: 0, scale: .9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: k * .05 }} whileTap={{ scale: .96 }}>
              <span className="lp-gp-ic"><Ic n={GOAL_ICON[g.id]} s={22} /></span><b>{g.label}</b>
            </motion.button>
          ))}
        </div>

        <div ref={resultsRef} className="lp-results">
          <AnimatePresence mode="wait">
            {G ? (
              <motion.div key={G.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .4 }}>
                <div className="lp-res-h">
                  <div><span className="lp-res-n" style={{ color: G.tone }}>{matches.length || helpers.length}</span><span><b>{matches.length ? `halal product${matches.length === 1 ? "" : "s"} to ${G.ask}` : `institution${helpers.length === 1 ? "" : "s"} that can help you ${G.ask}`}</b><small>{G.line} Shown A to Z, never ranked.</small></span></div>
                  <div className="lp-helpers">{helpers.slice(0, 8).map(i => <button key={i.id} title={i.name} onClick={() => setInst(i)} className="lp-mono sm" style={{ background: SECTOR_TONE[i.sector] }}>{initials(i.name)}</button>)}{helpers.length > 8 && <span className="lp-more">+{helpers.length - 8}</span>}</div>
                </div>
                {matches.length > 0 && <div className="lp-rail">{matches.map((p, i) => <ProductCard key={p.id} p={p} i={i} onInst={setInst} onContract={setCtr} />)}</div>}
                <div className="lp-helper-list">
                  <small>Institutions offering this</small>
                  <div>{helpers.map(i => <button key={i.id} onClick={() => setInst(i)}><span className="lp-mono xs" style={{ background: SECTOR_TONE[i.sector] }}>{initials(i.name)}</span>{short(i.name)}</button>)}</div>
                </div>
              </motion.div>
            ) : (
              <motion.p key="hint" className="lp-res-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Pick one above. We'll match you with real products and the institutions behind them.</motion.p>
            )}
          </AnimatePresence>
        </div>
      </div></section>

      {/* contract decoder */}
      <section className="lp-sec navy"><div className="lp-wrap">
        <motion.div className="lp-head" {...rise}>
          <span className="lp-eyebrow gold">Decode the contracts</span>
          <h2>Ten words that make finance halal.</h2>
          <p className="lp-lede" style={{ color: "#C9D3E6" }}>Every product here runs on a classical Islamic contract. Tap a card to see how it works and who carries the risk.</p>
        </motion.div>
        <div className="lp-flips">{CONTRACTS.map((c, i) => <Flip key={c.name} c={c} i={i} />)}</div>
      </div></section>

      {/* ecosystem */}
      <section className="lp-sec"><div className="lp-wrap">
        <motion.div className="lp-head" {...rise}>
          <span className="lp-eyebrow">The whole ecosystem</span>
          <h2>All {INSTITUTIONS.length} institutions, A to Z.</h2>
        </motion.div>
        <div className="lp-sectors">
          <button className="lp-sector" aria-pressed={!sector} onClick={() => setSector(null)} style={{ "--t": "#0B1530" }}><b>{INSTITUTIONS.length}</b><span>Everyone</span></button>
          {SECTORS.map(s => <button key={s} className="lp-sector" aria-pressed={sector === s} onClick={() => setSector(sector === s ? null : s)} style={{ "--t": SECTOR_TONE[s] }}><b>{INSTITUTIONS.filter(i => i.sector === s).length}</b><span>{SECTOR_SHORT[s]}</span></button>)}
        </div>
        <label className="lp-search wide"><Ic n="search" s={18} /><input type="search" placeholder="Search by name, product or city" value={q} onChange={e => setQ(e.target.value)} aria-label="Search institutions" /></label>
        <motion.div layout className="lp-instgrid">
          <AnimatePresence>
            {list.map(i => (
              <motion.button layout key={i.id} className="lp-icard" onClick={() => setInst(i)} initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .95 }} transition={{ duration: .2 }}>
                <span className="lp-mono" style={{ background: SECTOR_TONE[i.sector] }}>{initials(i.name)}</span>
                <span className="lp-icard-t"><b>{short(i.name)}</b><small>{i.kind}</small></span>
                <span className="lp-icard-f"><span className="lp-reg sm">{i.regulator}</span><span className="lp-icard-goals">{i.goals.slice(0, 4).map(g => <i key={g} title={goalOf(g).label} style={{ background: goalOf(g).tone }}><Ic n={GOAL_ICON[g]} s={12} /></i>)}</span></span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
        {!list.length && <div className="lp-empty"><b>No institutions match that.</b><button className="btn ghost sm" onClick={() => { setQ(""); setSector(null); }}>Clear</button></div>}

        <div className="lp-listband" id="list">
          <div><h3>Missing from the list?</h3><p>Licensed Islamic institutions can request a free, verified listing. Shown equally, never ranked.</p></div>
          <button className="btn" onClick={() => setListing(true)}>Request a free listing<Ic n="arrow" s={18} /></button>
        </div>
        <p className="lp-fine" style={{ marginTop: 20, textAlign: "left" }}>Compiled from public sources (2026). Information, not a recommendation or financial advice; confirm details directly with each institution. Not sure where you stand yet? <Link to="/app/check">Take the family check</Link> first.</p>
      </div></section>

      <SiteFooter onList={() => setListing(true)} />
      <ListingModal open={listing} onClose={() => setListing(false)} />
      {inst && <InstSheet inst={inst} onClose={() => setInst(null)} onContract={c => { setInst(null); setCtr(c); }} />}
      {ctr && <ContractSheet c={ctr} onClose={() => setCtr(null)} />}
    </div>
  );
}
