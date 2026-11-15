// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GOALS, INSTITUTIONS } from "./institutions";
import { Ic, GOAL_ICON, SiteNav, SiteFooter, ListingModal } from "./site";

const tone = id => (GOALS.find(g => g.id === id) || GOALS[0]).tone;
const initials = n => n.replace(/^The\s+/i, "").split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();

export default function Institutions() {
  const [params, setParams] = useSearchParams();
  const goal = params.get("goal");
  const [q, setQ] = useState("");
  const [listing, setListing] = useState(false);
  useEffect(() => { if (location.hash === "#list") setListing(true); }, []);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return INSTITUTIONS
      .filter(i => !goal || i.products.some(p => p.goal === goal))
      .filter(i => !t || [i.name, i.kind, i.regulator, i.about, ...i.products.map(p => p.name)].join(" ").toLowerCase().includes(t))
      .sort((a, b) => a.name.replace(/^The /, "").localeCompare(b.name.replace(/^The /, "")));
  }, [goal, q]);
  const setGoal = g => { const n = new URLSearchParams(params); g ? n.set("goal", g) : n.delete("goal"); setParams(n, { replace: true }); };
  const g = GOALS.find(x => x.id === goal);
  const anySample = shown.some(i => i.sample);

  return (
    <div className="lp">
      <SiteNav />
      <section className="lp-phero"><div className="lp-wrap lp-phero-in">
        <span className="lp-eyebrow gold">Halal providers directory</span>
        <h1>Find a halal home for your money.</h1>
        <p className="lp-lede">Licensed Islamic banks, takaful operators, funds and sukuk in Nigeria, side by side. Alphabetical, verified, and never ranked.</p>
        <div className="lp-phero-deco" aria-hidden="true">
          {GOALS.map((x, k) => <motion.span key={x.id} className="lp-sq" style={{ width: 64, height: 64, borderRadius: 20, background: x.tone, color: "#FFFFFF" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: k % 2 ? 18 : -18 }} transition={{ delay: .2 + k * .08, duration: .6 }}><Ic n={GOAL_ICON[x.id]} s={28} /></motion.span>)}
        </div>
      </div></section>

      <div className="lp-dir-bar"><div className="lp-wrap lp-dir-bar-in">
        <div className="lp-chips" role="group" aria-label="What do you want to do?">
          <button className="lp-chip" aria-pressed={!goal} onClick={() => setGoal(null)}>Everything</button>
          {GOALS.map(x => <button key={x.id} className="lp-chip" style={{ "--t": x.tone }} aria-pressed={goal === x.id} onClick={() => setGoal(goal === x.id ? null : x.id)}><Ic n={GOAL_ICON[x.id]} s={16} />{x.label}</button>)}
        </div>
        <label className="lp-search"><Ic n="search" s={18} /><input type="search" placeholder="Search providers or products" value={q} onChange={e => setQ(e.target.value)} aria-label="Search providers or products" /></label>
      </div></div>

      <section className="lp-dir"><div className="lp-wrap">
        <div className="lp-dir-meta">
          <span>{g ? <><b style={{ color: "var(--ink)" }}>{g.label}:</b> {g.line} </> : null}{shown.length} provider{shown.length === 1 ? "" : "s"}, A to Z</span>
          {anySample && <span className="lp-sample"><Ic n="doc" s={16} />Sample entries. The full verified directory is being added.</span>}
        </div>

        {shown.length ? (
          <motion.div layout className="lp-cards">
            <AnimatePresence>
              {shown.map(i => (
                <motion.article layout key={i.id} className="lp-card" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .96 }} transition={{ duration: .25 }}>
                  <div className="lp-card-h"><span className="lp-mono">{initials(i.name)}</span><span><b>{i.name}</b><small>{i.kind}</small></span></div>
                  <span className="lp-reg"><Ic n="badge" s={14} />Licensed by {i.regulator}</span>
                  <p>{i.about}</p>
                  <ul className="lp-prods">
                    {i.products.map(p => <li key={p.name} style={{ opacity: goal && p.goal !== goal ? .45 : 1 }}><i style={{ background: tone(p.goal) }}><Ic n={GOAL_ICON[p.goal]} s={14} /></i>{p.name}</li>)}
                  </ul>
                  <div className="lp-card-f">
                    {i.site ? <a className="lp-textlink" href={i.site} target="_blank" rel="noopener noreferrer">Visit website <Ic n="ext" s={15} /></a> : <span className="lp-muted" style={{ fontSize: 13 }}>Contact details coming with verification</span>}
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="lp-empty"><Ic n="search" s={28} /><b>No providers match that yet.</b><button className="btn ghost sm" onClick={() => { setQ(""); setGoal(null); }}>Clear filters</button></div>
        )}

        <div className="lp-howlist">
          <div><span className="lp-sq"><Ic n="badge" /></span><b>Verified before listed</b><small>We check each provider's regulator licence and Shariah board before it appears.</small></div>
          <div><span className="lp-sq"><Ic n="equal" /></span><b>Never ranked</b><small>Always A to Z. Nobody can pay to be higher, and there are no "recommended" badges.</small></div>
          <div><span className="lp-sq"><Ic n="scale" /></span><b>You decide</b><small>Seedline educates; providers serve. Check any product with the six questions from your lessons.</small></div>
        </div>

        <div className="lp-listband" id="list">
          <div><h3>Run an Islamic financial institution?</h3><p>List for free. Families who finish their plan will find you, see your licence, and contact you directly.</p></div>
          <button className="btn" onClick={() => setListing(true)}>Request a free listing<Ic n="arrow" s={18} /></button>
        </div>
        <p className="lp-fine" style={{ marginTop: 20, textAlign: "left" }}>A listing is information, not a recommendation or financial advice. Not sure where you stand yet? <Link to="/app/check">Take the family check</Link> first.</p>
      </div></section>

      <SiteFooter onList={() => setListing(true)} />
      <ListingModal open={listing} onClose={() => setListing(false)} />
    </div>
  );
}
