// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useInView, useReducedMotion, animate } from "framer-motion";
import { PlantIcon, STAGE_TONE } from "./Row";
import { STAGES } from "./content";
import { result } from "./store";
import { GOALS, countByGoal, INSTITUTIONS } from "./institutions";
import { Ic, GOAL_ICON, rise, naira, SiteNav, SiteFooter, ListingModal } from "./site";

/* ---------- motion helpers ---------- */
function useSmooth(target, k = .14) {
  const [v, setV] = useState(target);
  const ref = useRef(target);
  useEffect(() => {
    let raf;
    const step = () => { const d = target - ref.current; if (Math.abs(d) < .01) { ref.current = target; setV(target); return; } ref.current += d * k; setV(ref.current); raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}
function CountUp({ to, fmt = x => Math.round(x), dur = 1.4, start }) {
  const [v, setV] = useState(0);
  useEffect(() => { if (!start) return; const c = animate(0, to, { duration: dur, ease: [.16, 1, .3, 1], onUpdate: setV }); return () => c.stop(); }, [start, to]);
  return <>{fmt(v)}</>;
}

/* ---------- the living field (hero) ---------- */
const kept2stage = k => (k < 5 ? 0 : k < 12 ? 1 : k < 25 ? 2 : 3);
function Plant({ x, y, s, g, gold }) {
  const h = (10 + 62 * g) * s, stroke = gold ? "#D9A93A" : "rgba(255,255,255,.6)", w = Math.max(.9, 2.6 * s);
  const leaf = g > .12, grain = g > .72;
  return (
    <g transform={`translate(${x} ${y})`} stroke={stroke} strokeWidth={w} strokeLinecap="round" fill="none">
      {g < .06 ? <ellipse cx="0" cy={-3 * s} rx={3.2 * s} ry={2.4 * s} fill={stroke} stroke="none" /> : <path d={`M0 0V${-h}`} />}
      {leaf && <><path d={`M0 ${-h * .35}c${-10 * s * g} 0 ${-15 * s * g} ${-4 * s} ${-15 * s * g} ${-14 * s * g}c${8 * s * g} 0 ${15 * s * g} ${4 * s} ${15 * s * g} ${10 * s * g}z`} fill={stroke} fillOpacity=".25" />
        <path d={`M0 ${-h * .55}c${10 * s * g} 0 ${15 * s * g} ${-4 * s} ${15 * s * g} ${-10 * s * g}c${-6 * s * g} 0 ${-15 * s * g} ${4 * s} ${-15 * s * g} ${10 * s * g}z`} fill={stroke} fillOpacity=".25" /></>}
      {grain && <g fill={gold ? "#D9A93A" : "rgba(255,255,255,.7)"} stroke="none">
        <ellipse cx="0" cy={-h - 3 * s} rx={2.2 * s} ry={4.4 * s} />
        <ellipse cx={-3 * s} cy={-h + 4 * s} rx={2 * s} ry={3.8 * s} transform={`rotate(-28 ${-3 * s} ${-h + 4 * s})`} />
        <ellipse cx={3 * s} cy={-h + 4 * s} rx={2 * s} ry={3.8 * s} transform={`rotate(28 ${3 * s} ${-h + 4 * s})`} />
      </g>}
    </g>
  );
}
function Field({ g }) {
  const W = 460, H = 300, vx = 230, vy = 118, rows = 13;
  const plants = [];
  for (let i = 0; i < rows; i++) {
    const bx = -260 + (i * (W + 520)) / (rows - 1);
    [.28, .52, .8].forEach(t => plants.push({ x: vx + (bx - vx) * t, y: vy + (H + 20 - vy) * t, s: t, gold: i === (rows - 1) / 2, key: i + "-" + t }));
  }
  const sunY = 128 - 46 * g;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="lp-field" role="img" aria-label="A field of plants that grows taller as more money stays">
      <rect width={W} height={H} fill="#0A1A3F" />
      {[[40, 30], [96, 62], [150, 22], [300, 40], [372, 70], [420, 26], [250, 18], [60, 86]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.3" fill="#FFFFFF" opacity={.5 - g * .35} />)}
      <circle cx={vx} cy={sunY} r="34" fill="#D9A93A" opacity={.25 + g * .75} />
      <rect y={vy} width={W} height={H - vy} fill="#0A1A3F" />
      <rect y={vy} width={W} height={H - vy} fill="#13306B" opacity={.55} />
      {Array.from({ length: rows }).map((_, i) => { const bx = -260 + (i * (W + 520)) / (rows - 1); return <line key={i} x1={vx} y1={vy} x2={bx} y2={H + 20} stroke={i === (rows - 1) / 2 ? "#D9A93A" : "#FFFFFF"} strokeOpacity={i === (rows - 1) / 2 ? .55 : .1} strokeWidth="1" />; })}
      <line x1="0" y1={vy} x2={W} y2={vy} stroke="#FFFFFF" strokeOpacity=".18" />
      {plants.sort((a, b) => a.s - b.s).map(p => <Plant key={p.key} {...p} g={Math.max(0, Math.min(1, g * (1.05 - (1 - p.s) * .15)))} />)}
    </svg>
  );
}
function GrowCard() {
  const reduce = useReducedMotion();
  const [kept, setKept] = useState(reduce ? 18 : 0);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (reduce || touched) return;
    const c = animate(0, 18, { duration: 2.6, delay: .6, ease: [.45, 0, .2, 1], onUpdate: v => setKept(Math.round(v)) });
    return () => c.stop();
  }, [touched]);
  const g = useSmooth(Math.min(1, kept / 30));
  const st = kept2stage(kept);
  return (
    <div className="lp-grow">
      <div className="lp-grow-field"><Field g={g} /></div>
      <div className="lp-grow-panel">
        <div className="lp-grow-q">Of every <b>₦100,000</b> your family earns, how much stays?</div>
        <div className="lp-grow-read">
          <span className="lp-grow-amt tnum">₦{(kept * 1000).toLocaleString("en-NG")}</span>
          <AnimatePresence mode="wait">
            <motion.span key={st} className="lp-grow-stage" style={{ background: STAGE_TONE[st], color: st === 3 ? "#231800" : "#FFFFFF" }}
              initial={{ opacity: 0, y: 8, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .9 }} transition={{ duration: .3 }}>
              <PlantIcon stage={st} size={18} light={st !== 3} color={st === 3 ? "#231800" : undefined} />{STAGES[st].plant}
            </motion.span>
          </AnimatePresence>
        </div>
        <input type="range" min="0" max="40" step="1" value={kept} aria-label="Amount that stays from every ₦100,000"
          onChange={e => { setTouched(true); setKept(+e.target.value); }} className="lp-range" style={{ "--p": `${(kept / 40) * 100}%` }} />
        <div className="lp-grow-foot"><span>A taste only. The real check looks at six parts of your money.</span><Link to="/app/check">Full check <Ic n="arrow" s={15} /></Link></div>
      </div>
    </div>
  );
}

const WORDS = ["together.", "the halal way.", "seed by seed.", "for good."];
function Rotator() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => { if (reduce) return; const t = setInterval(() => setI(n => (n + 1) % WORDS.length), 2600); return () => clearInterval(t); }, []);
  return (
    <span className="lp-rot" aria-live="off">
      <AnimatePresence mode="wait">
        <motion.span key={i} className="lp-rot-w" initial={{ y: "70%", opacity: 0 }} animate={{ y: "0%", opacity: 1 }} exit={{ y: "-70%", opacity: 0 }} transition={{ duration: .45, ease: [.16, 1, .3, 1] }}>{WORDS[i]}</motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ---------- income is not wealth ---------- */
function Homes() {
  const ref = useRef(null);
  const on = useInView(ref, { once: true, margin: "-120px" });
  const homes = [["Home A", 1000, 950, false], ["Home B", 700, 550, true]];
  return (
    <div className="lp-homes" ref={ref}>
      {homes.map(([h, earn, spend, win], idx) => (
        <motion.div key={h} className={"lp-home" + (win ? " win" : "")} initial={{ opacity: 0, y: 24 }} animate={on ? { opacity: 1, y: 0 } : {}} transition={{ duration: .6, delay: idx * .15 }}>
          <div className="lp-home-h"><b>{h}</b>{win && <motion.span className="lp-pill gold sm" initial={{ scale: 0 }} animate={on ? { scale: 1 } : {}} transition={{ delay: 1.5, type: "spring", stiffness: 300, damping: 14 }}>Keeps 3× more</motion.span>}</div>
          <div className="lp-home-bars">
            <div><small>Earns</small><span className="lp-hb"><motion.i initial={{ width: 0 }} animate={on ? { width: `${earn / 10}%` } : {}} transition={{ duration: 1, delay: .2 + idx * .15, ease: [.16, 1, .3, 1] }} /></span><em className="tnum">{naira(earn)}</em></div>
            <div><small>Spends</small><span className="lp-hb sp"><motion.i initial={{ width: 0 }} animate={on ? { width: `${spend / 10}%` } : {}} transition={{ duration: 1, delay: .45 + idx * .15, ease: [.16, 1, .3, 1] }} /></span><em className="tnum">{naira(spend)}</em></div>
          </div>
          <div className="lp-home-keep"><small>Keeps each month</small><b className="tnum"><CountUp to={earn - spend} start={on} fmt={naira} dur={1.6} /></b></div>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- seed to harvest: pinned scroll story ---------- */
const STORY = [
  { feels: "Money runs out before the month does.", next: "Make a small gap between money in and money out." },
  { feels: "Steadier now, but one shock could set you back.", next: "Build a three-month cushion and tame debt." },
  { feels: "Money stays, and some of it is working.", next: "Put more to work: halal, and checked first." },
  { feels: "Your wealth works, is written down and is ready to pass on.", next: "Protect it, give from it, and hand it on well." }
];
function Story() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [i, setI] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", p => setI(Math.min(3, Math.max(0, Math.floor(p * 4.0001)))));
  const st = STAGES[i], dark = i !== 3;
  const range = `${st.min}–${STAGES[i + 1] ? STAGES[i + 1].min - 1 : 100}`;
  return (
    <section className="lp-story" ref={ref} aria-label="The four stages, from seed to harvest">
      <motion.div className="lp-story-pin" animate={{ backgroundColor: STAGE_TONE[i], color: dark ? "#FFFFFF" : "#231800" }} transition={{ duration: .6, ease: "easeInOut" }}>
        <div className="lp-wrap lp-story-in">
          <div className="lp-story-top">
            <span className="lp-eyebrow" style={{ color: "inherit", opacity: .8 }}>From seed to harvest · every family is somewhere on the line</span>
            <ol className="lp-story-rail">{STAGES.map((s, k) => <li key={s.id} className={k <= i ? "on" : ""}><i /><span>{s.plant}</span></li>)}</ol>
          </div>
          <div className="lp-story-main">
            <AnimatePresence mode="wait">
              <motion.div key={i} className="lp-story-plant" initial={{ opacity: 0, scale: .6, rotate: -12 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: .8, rotate: 8 }} transition={{ duration: .5, ease: [.16, 1, .3, 1] }}>
                <PlantIcon stage={i} size={150} color={STAGE_TONE[i]} />
              </motion.div>
            </AnimatePresence>
            <div className="lp-story-copy">
              <AnimatePresence mode="wait">
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: .45, ease: [.16, 1, .3, 1] }}>
                  <span className="lp-story-range tnum">Score {range}</span>
                  <h2 className="lp-story-name">{st.plant}<em> · {st.name}</em></h2>
                  <div className="lp-story-lines">
                    <p><small>What it feels like</small>{STORY[i].feels}</p>
                    <p><small>Your next move</small>{STORY[i].next}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="lp-story-foot">
            <Link to="/app/check" className={"btn " + (dark ? "light" : "")}>Find your stage · 4 min<Ic n="arrow" s={18} /></Link>
            <span className="lp-story-hint">{i < 3 ? "Keep scrolling to grow" : "That's the whole line."}</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------- page ---------- */
const MARQUEE = ["Non-interest savings", "Emergency cushion", "Takaful", "Sovereign sukuk", "Halal funds", "Home finance", "Zakat", "Wasiyyah", "Waqf", "Family money talks", "Records that last", "Sadaqah"];

export default function Landing() {
  const r = result();
  const [listing, setListing] = useState(false);
  const checkTo = r ? "/app" : "/app/check";
  const checkLabel = r ? `Open my Seedline · ${r.score}` : "Check my family · 4 min";
  return (
    <div className="lp">
      <SiteNav />

      {/* hero */}
      <section className="lp-hero"><div className="lp-wrap lp-hero-in">
        <motion.div className="lp-hero-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease: [.16, 1, .3, 1] }}>
          <span className="lp-pill tint"><i className="lp-dot" />Your family office, online</span>
          <h1>Grow your family's wealth <Rotator /></h1>
          <p className="lp-lede">One private place to see where your family stands, make a plan together, and find halal places to grow your money.</p>
          <div className="lp-ctas">
            <Link to={checkTo} className="btn lp-btn-lg">{checkLabel}<Ic n="arrow" s={18} /></Link>
            <Link to="/institutions" className="btn ghost lp-btn-lg">Find halal providers</Link>
          </div>
          <div className="lp-hero-note"><span className="lp-live" />Launched live at the MSMMI Marriage Workshop 2026 · Free for families</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30, rotate: 1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: .9, delay: .15, ease: [.16, 1, .3, 1] }}>
          <GrowCard />
        </motion.div>
      </div></section>

      {/* marquee */}
      <div className="lp-marquee" aria-hidden="true"><div className="lp-marquee-track">
        {[...MARQUEE, ...MARQUEE].map((t, i) => <span key={i}><i />{t}</span>)}
      </div></div>

      {/* income is not wealth */}
      <section className="lp-sec"><div className="lp-wrap lp-split">
        <motion.div className="lp-head" {...rise}>
          <span className="lp-eyebrow">The big idea</span>
          <h2>Income is <span className="lp-not">not<svg viewBox="0 0 120 16" preserveAspectRatio="none" aria-hidden="true"><motion.path d="M3 11C30 4 70 3 117 8" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: .8, delay: .4 }} /></svg></span> wealth.</h2>
          <p className="lp-lede">Income passes through your hands. Wealth is what stays, works and lasts. That's why your income is <b>never part of your score</b>.</p>
        </motion.div>
        <Homes />
      </div></section>

      {/* pinned story */}
      <Story />

      {/* two doors */}
      <section className="lp-sec"><div className="lp-wrap">
        <motion.div className="lp-head center" {...rise}>
          <span className="lp-eyebrow">Two sides of the table</span>
          <h2>Families plan. Institutions serve.</h2>
        </motion.div>
        <div className="lp-doors">
          <motion.div className="lp-door fam" {...rise} whileHover={{ y: -6 }}>
            <span className="lp-eyebrow gold">For families</span>
            <h3>Your family office, in your pocket.</h3>
            <ul>
              <li><Ic n="pulse" s={18} />A health-check in four minutes</li>
              <li><Ic n="plan" s={18} />A plan you make together</li>
              <li><Ic n="doc" s={18} />A certificate worth sharing</li>
              <li><Ic n="book" s={18} />Thirty short lessons, with sources</li>
            </ul>
            <Link to={checkTo} className="btn gold">{r ? "Open my Seedline" : "Start the check"}<Ic n="arrow" s={18} /></Link>
            <div className="lp-door-cert" aria-hidden="true">
              <span className="lp-eyebrow gold">Family Wealth Check</span>
              <b>The ___ Family</b>
              <span className="lp-door-score">{r ? r.score : 71}</span>
            </div>
          </motion.div>
          <motion.div className="lp-door inst" {...rise} whileHover={{ y: -6 }}>
            <span className="lp-eyebrow">For Islamic institutions</span>
            <h3>Be found by families ready to act.</h3>
            <ul>
              <li><Ic n="badge" s={18} />Free, verified listing</li>
              <li><Ic n="equal" s={18} />Shown equally, never ranked</li>
              <li><Ic n="inbox" s={18} />Families contact you directly</li>
            </ul>
            <div className="lp-ctas">
              <button className="btn" onClick={() => setListing(true)}>List your institution</button>
              <Link to="/institutions" className="lp-textlink">See the directory <Ic n="arrow" s={16} /></Link>
            </div>
            <div className="lp-door-stack" aria-hidden="true">{["Bank", "Takaful", "Sukuk"].map((t, k) => <span key={t} style={{ "--k": k }}>{t}</span>)}</div>
          </motion.div>
        </div>
      </div></section>

      {/* directory teaser */}
      <section className="lp-sec alt"><div className="lp-wrap">
        <motion.div className="lp-head" {...rise}>
          <span className="lp-eyebrow">The directory</span>
          <h2>Find a halal home for your money.</h2>
          <p className="lp-lede">36 licensed institutions and 38 halal products across Nigeria. Start with what you want your money to do. Never ranked, never paid.</p>
        </motion.div>
        <div className="lp-goals">
          {GOALS.map((g, k) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5, delay: k * .07 }}>
              <Link to={`/institutions?goal=${g.id}`} className="lp-goal" style={{ "--t": g.tone }}>
                <span className="lp-goal-ic"><Ic n={GOAL_ICON[g.id]} s={22} /></span>
                <b>{g.label}</b>
                <small>{g.line}</small>
                <span className="lp-goal-n">{countByGoal(g.id)} institution{countByGoal(g.id) === 1 ? "" : "s"} <Ic n="arrow" s={15} /></span>
              </Link>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5, delay: .5 }}>
            <Link to="/institutions" className="lp-goal all">
              <span className="lp-goal-ic"><Ic n="search" s={22} /></span>
              <b>See all {INSTITUTIONS.length} institutions</b>
              <small>Banks, takaful, funds, pensions and fintechs across Nigeria.</small>
              <span className="lp-goal-n">Open the directory <Ic n="arrow" s={15} /></span>
            </Link>
          </motion.div>
        </div>
      </div></section>

      {/* trust strip */}
      <section className="lp-trustbar"><div className="lp-wrap lp-trustbar-in">
        {[["lock", "Private by default", "Your answers stay on your phone."], ["ranges", "Ranges, not figures", "No account numbers. No exact salaries."], ["equal", "No paid rankings", "We educate. Institutions serve."]].map(([n, t, d]) => (
          <div key={t}><span className="lp-sq"><Ic n={n} /></span><span><b>{t}</b><small>{d}</small></span></div>
        ))}
        <Link to="/trust" className="lp-textlink">How we protect your family <Ic n="arrow" s={16} /></Link>
      </div></section>

      {/* close */}
      <section className="lp-close">
        <div className="lp-close-field" aria-hidden="true">{Array.from({ length: 28 }).map((_, k) => <i key={k} style={{ "--k": k, "--h": `${30 + ((k * 37) % 60)}%` }} />)}</div>
        <div className="lp-wrap lp-close-in">
          <div><h2>Where does your family stand today?</h2><p>Four minutes. No exact figures. A clear next step.</p></div>
          <div className="lp-ctas">
            <Link to={checkTo} className="btn gold lp-btn-lg">{checkLabel}<Ic n="arrow" s={18} /></Link>
          </div>
        </div>
      </section>

      <SiteFooter onList={() => setListing(true)} />
      <ListingModal open={listing} onClose={() => setListing(false)} />
    </div>
  );
}
