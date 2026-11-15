// @ts-nocheck
// Plan: a staged flow. Start → Fix now → Grow next → Protect later → My 30-day plan. One decision per screen.
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppTop } from "./ui";
import { PARTS, BUCKETS, levelWord, roadmap, ORIGIN } from "./content";
import { useStore, result } from "./store";
import { Ic } from "./site";
import { SaveCard } from "./Result";

const fmt = (d, o) => new Date(d).toLocaleDateString(undefined, o || { day: "numeric", month: "short" });
const RUNWAY = { 0: "less than two weeks", 30: "about a month", 60: "one to three months", 85: "three to six months", 100: "more than six months" };
const BTONE = { fix: "#B4472A", grow: "#13306B", protect: "#B98A1F" };
const BICON = { fix: "shield", grow: "trend", protect: "doc" };
const STEP_NAMES = ["Start", "Fix now", "Grow next", "Protect", "My plan"];

function ActionCard({ x, i, on, onPick, r, tone }) {
  const [open, setOpen] = useState(false);
  const lw = levelWord(r.lev[x.part]);
  return (
    <motion.div className={"pl-card" + (on ? " on" : "")} style={{ "--t": tone }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }}>
      <div className="pl-card-top">
        {i === 0 ? <span className="pl-best">Best place to start</span> : <span className="pl-opt">Option {i + 1}</span>}
        <span className="pl-link">For your {PARTS[x.part].name.toLowerCase()} · <b style={{ color: lw.c }}>{lw.w}</b></span>
      </div>
      <b className="pl-title">{x.t}</b>
      <p className="pl-why">{x.why}</p>
      <button className="pl-more" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Hide the steps" : "How to do it"}<Ic n="chev" s={16} /></button>
      <AnimatePresence initial={false}>
        {open && <motion.dl className="pl-dl" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
          <div><dt>This week</dt><dd>{x.week}</dd></div>
          <div><dt>Done when</dt><dd>{x.done}</dd></div>
        </motion.dl>}
      </AnimatePresence>
      <button className={"btn block" + (on ? "" : " ghost")} onClick={onPick}>{on ? <><Ic n="check" s={18} w={2.6} />Chosen</> : "Choose this"}</button>
    </motion.div>
  );
}

export function Plan() {
  const r = result();
  const [params] = useSearchParams();
  const [picks, setPicks] = useStore("picks", {});
  const [step, setStep] = useState(() => (picks.made ? 4 : 0));
  const [copied, setCopied] = useState(false);
  const [certName] = useStore("certName", "");
  useEffect(() => { const part = params.get("part"); if (part && r) { const rm = roadmap(r, r.last.answers); const bi = BUCKETS.findIndex(b => rm[b.id].some(x => x.part === part)); if (bi >= 0 && !picks.made) setStep(bi + 1); } }, []);
  if (!r) return (
    <div className="app"><AppTop />
      <div className="rs-welcome"><span className="rs-eyebrow">Your plan</span><h1>Take the check first.</h1><p>Your plan is built from your answers, so it starts with what's weakest for your home.</p><Link className="btn gold block lg" to="/app/check">Take the check <Ic n="arrow" s={18} /></Link></div>
    </div>
  );
  const a = r.last.answers, rm = roadmap(r, a);
  const p = { ...picks }; BUCKETS.forEach(b => { if (p[b.id] == null || p[b.id] >= rm[b.id].length) p[b.id] = 0; });
  const weakL = levelWord(r.lev[r.weakest]);
  const go = n => { setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const start = new Date(picks.made || Date.now()), end = new Date(start.getTime() + 30 * 864e5);
  const lines = BUCKETS.map(b => `${b.name}: ${rm[b.id][p[b.id]].t}`);
  const text = `My 30-day family wealth plan (Seedline)\nScore: ${r.score}/100 · ${r.stage.name}\n${fmt(start)} to ${fmt(end)}\n\n${lines.join("\n")}\n\nRecheck on ${fmt(end)}.\n${ORIGIN}/app`;
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} };

  return (
    <div className="app">
      <AppTop />
      <div className="pl-stepper" role="tablist" aria-label="Plan steps">
        {STEP_NAMES.map((s, i) => <button key={s} role="tab" aria-selected={step === i} className={i < step ? "past" : ""} onClick={() => (i < 4 || picks.made) && go(i)} disabled={i === 4 && !picks.made}><span className="pl-num">{i < step ? <Ic n="check" s={14} w={3} /> : i + 1}</span><span className="pl-lab">{s}</span></button>)}
        <motion.i className="pl-fill" animate={{ width: `${(step / 4) * 100}%` }} transition={{ duration: .5, ease: [.16, 1, .3, 1] }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: .3, ease: [.16, 1, .3, 1] }}>
          {step === 0 && (
            <div className="rs-stack">
              <div className="rs-head"><span className="rs-eyebrow dark">Your family roadmap</span><h2>Three moves. One at a time.</h2><p className="muted">You'll pick one action to fix now, one to grow next and one to protect for later. Each is chosen from your answers.</p></div>
              <div className="pl-facts">
                <div style={{ "--t": "#B4472A" }}><small>Holding you back</small><b>{PARTS[r.weakest].name}</b><span style={{ color: weakL.c }}>{weakL.w}</span></div>
                {RUNWAY[a.runway] && <div style={{ "--t": "#2A4FA8" }}><small>If income stopped</small><b>{RUNWAY[a.runway]}</b><span>of cushion</span></div>}
                <div style={{ "--t": "#13306B" }}><small>Your stage</small><b>{r.stage.plant} · {r.score}</b><span>{r.stage.name}</span></div>
              </div>
              <div className="pl-preview">{BUCKETS.map((b, i) => <div key={b.id} style={{ "--t": BTONE[b.id] }}><span className="pl-pi"><Ic n={BICON[b.id]} s={18} /></span><span><b>{b.name}</b><small>{b.sub}</small></span></div>)}</div>
              <div className="pl-choose">
                <button className="btn block lg" onClick={() => { setPicks({ ...p, made: Date.now() }); go(4); }}><Ic n="spark" s={18} />Use my recommended plan</button>
                <button className="btn ghost block" onClick={() => go(1)}>Choose each step myself</button>
                <small>Your recommended plan picks the best place to start in each step. You can change any of it later.</small>
              </div>
            </div>
          )}

          {[1, 2, 3].includes(step) && (() => { const b = BUCKETS[step - 1], tone = BTONE[b.id]; return (
            <div className="rs-stack">
              <div className="pl-bhead" style={{ "--t": tone }}>
                <span className="pl-bicon"><Ic n={BICON[b.id]} s={24} /></span>
                <div><span className="rs-eyebrow">Step {step} of 3 · {b.verb}</span><h2>{b.name}</h2><p>{b.sub}</p></div>
              </div>
              <div className="pl-cards">
                {rm[b.id].map((x, i) => <ActionCard key={i} x={x} i={i} r={r} tone={tone} on={p[b.id] === i} onPick={() => { const made = step === 3 ? (picks.made || Date.now()) : picks.made; setPicks({ ...p, made, [b.id]: i }); setTimeout(() => go(step < 3 ? step + 1 : 4), 380); }} />)}
              </div>
              <div className="pl-nav"><button className="btn ghost" onClick={() => go(step - 1)}>Back</button><button className="btn" onClick={() => { if (step === 3 && !picks.made) setPicks({ ...p, made: Date.now() }); go(step < 3 ? step + 1 : 4); }}>{step < 3 ? "Next" : "Make my plan"}<Ic n="arrow" s={18} /></button></div>
            </div>
          ); })()}

          {step === 4 && (
            <div className="rs-stack">
              <motion.div className="pl-out" initial={{ scale: .96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .5, ease: [.16, 1, .3, 1] }}>
                <span className="rs-eyebrow">{certName.trim() ? `${certName.trim()}'s` : "Our"} 30-day plan · built by you</span>
                <h2>{r.stage.plant} · {r.score}</h2>
                <span className="pl-dates tnum">{fmt(start)} → recheck on {fmt(end)}</span>
                <ol>{BUCKETS.map((b, i) => <motion.li key={b.id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .2 + i * .12 }} style={{ "--t": BTONE[b.id] }}><span className="pl-pi"><Ic n={BICON[b.id]} s={18} /></span><span><small>{b.name}</small><b>{rm[b.id][p[b.id]].t}</b><em>{rm[b.id][p[b.id]].week}</em></span><button className="pl-edit" onClick={() => go(i + 1)} aria-label={`Change ${b.name}`}>Change</button></motion.li>)}</ol>
                <div className="pl-out-act"><button className="btn light sm" onClick={copy}>{copied ? "Copied" : "Copy plan"}</button><a className="btn sm pl-wa" target="_blank" rel="noopener" href={"https://wa.me/?text=" + encodeURIComponent(text)}>Send on WhatsApp</a></div>
              </motion.div>
              <SaveCard r={r} plan={lines} />
              <div className="rs-doors">
                <Link to="/app/learn" className="rs-door navy"><span className="rs-door-ic"><Ic n="book" s={22} /></span><b>Turn it into habits</b><small>Short lessons with reminders that fit your week.</small><Ic n="arrow" s={18} /></Link>
                <Link to={rm.grow[p.grow]?.part === "productive" ? "/institutions?goal=grow" : "/institutions?goal=save"} className="rs-door"><span className="rs-door-ic"><Ic n="building" s={22} /></span><b>Find a halal provider</b><small>Matched to your plan.</small><Ic n="arrow" s={18} /></Link>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
