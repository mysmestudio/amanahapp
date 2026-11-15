// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useInView, useReducedMotion, animate } from "framer-motion";
import { PlantIcon, STAGE_TONE } from "./Row";
import { STAGES } from "./content";
import { result, load } from "./store";
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

/* ---------- hero: one seed, growing (calm, looping) ---------- */
const GROW = [
  { label: "Seed", paths: [], ellipses: [[12, 15, 4.2, 5.2, 0]], extra: ["M12 9.8c0-2 1.1-3.5 2.8-4.2"] },
  { label: "Sprout", paths: ["M12 21V11.5", "M12 14c-4 0-6-2.5-6-6 3.5 0 6 2 6 6z", "M12 12c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6z"], ellipses: [], extra: [] },
  { label: "Stalk", paths: ["M12 22V4", "M12 9c-3 0-5-2-5-5 3 0 5 2 5 5z", "M12 13c3 0 5-2 5-5-3 0-5 2-5 5z", "M12 18c-3 0-5-2-5-5 3 0 5 2 5 5z"], ellipses: [], extra: [] },
  { label: "Harvest", paths: ["M12 22V7"], ellipses: [[12, 4.5, 1.6, 2.5, 0], [9.3, 9, 1.8, 3, -28], [14.7, 9, 1.8, 3, 28], [9.3, 14, 1.8, 3, -28], [14.7, 14, 1.8, 3, 28]], extra: [] }
];
function HeroSeed() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(reduce ? 3 : 0);
  useEffect(() => { if (reduce) return; const t = setInterval(() => setI(n => (n + 1) % 4), 2800); return () => clearInterval(t); }, []);
  const g = GROW[i];
  const draw = k => ({ initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { pathLength: { duration: 1.3, delay: .15 + k * .22, ease: [.45, 0, .2, 1] }, opacity: { duration: .2, delay: .15 + k * .22 } } });
  return (
    <div className="hs" aria-label={`A seed growing: now at the ${g.label} stage`} role="img">
      <div className="hs-rings" aria-hidden="true"><i /><i /><i /></div>
      <motion.div className="hs-disc" animate={{ scale: [1, 1.025, 1] }} transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}>
        <AnimatePresence mode="wait">
          <motion.svg key={i} viewBox="0 0 24 24" className="hs-plant" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            exit={{ opacity: 0, scale: .92, transition: { duration: .35 } }}>
            {g.ellipses.map((e, k) => <motion.ellipse key={"e" + k} fill={i === 0 || i === 3 ? "currentColor" : "none"} cx={e[0]} cy={e[1]} rx={e[2]} ry={e[3]} transform={e[4] ? `rotate(${e[4]} ${e[0]} ${e[1]})` : undefined} {...draw(g.paths.length + k)} />)}
            {[...g.paths, ...g.extra].map((d, k) => <motion.path key={k} d={d} {...draw(k)} />)}
          </motion.svg>
        </AnimatePresence>
        <span className="hs-soil" aria-hidden="true" />
      </motion.div>
      <ol className="hs-steps" aria-hidden="true">{GROW.map((s, k) => <li key={s.label} className={k === i ? "on" : k < i ? "past" : ""}><i />{s.label}</li>)}</ol>
    </div>
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
  const [k, setK] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", p => setK(Math.min(5, Math.max(0, Math.floor(p * 6.0001)))));
  const idea = k === 0, end = k === 5, i = Math.min(3, Math.max(0, k - 1)), st = STAGES[i];
  const bg = idea ? "#2A4FA8" : end ? "#5B3B9E" : STAGE_TONE[i], dark = idea || end || i !== 3;
  const range = `${st.min}–${STAGES[i + 1] ? STAGES[i + 1].min - 1 : 100}`;
  const RAIL = ["The idea", ...STAGES.map(s => s.plant), "You"];
  return (
    <section className="lp-story" ref={ref} aria-label="The big idea, then the four stages from seed to harvest">
      <motion.div className="lp-story-pin" animate={{ backgroundColor: bg, color: dark ? "#FFFFFF" : "#231800" }} transition={{ duration: .35, ease: "easeInOut" }}>
        <div className="lp-wrap lp-story-in">
          <div className="lp-story-top">
            <span className="lp-eyebrow" style={{ color: "inherit", opacity: .8 }}>{idea ? "The big idea" : end ? "Your turn" : "From seed to harvest · every family is somewhere on the line"}</span>
            <ol className="lp-story-rail">{RAIL.map((s, n) => <li key={s} className={n <= k ? "on" : ""}><i /><span>{s}</span></li>)}</ol>
          </div>
          <div className="lp-story-main">
            <AnimatePresence mode="wait">
              <motion.div key={k} className="lp-story-plant" initial={{ opacity: 0, scale: .7, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: .85, rotate: 6 }} transition={{ duration: .3, ease: [.16, 1, .3, 1] }}>
                {idea ? <span className="lp-story-x">3<em>×</em></span> : end ? <span className="lp-story-q">?</span> : <PlantIcon stage={i} size={150} color={STAGE_TONE[i]} />}
              </motion.div>
            </AnimatePresence>
            <div className="lp-story-copy">
              <AnimatePresence mode="wait">
                <motion.div key={k} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: .3, ease: [.16, 1, .3, 1] }}>
                  {end ? <>
                    <span className="lp-story-range">Seed, sprout, stalk or harvest?</span>
                    <h2 className="lp-story-name idea end">Where does your family stand <span>today?</span></h2>
                    <p className="lp-story-end">Four minutes. No exact figures. A clear next step.</p>
                    <Link to="/start" className="btn gold hx-btn">Start free<Ic n="arrow" s={20} /></Link>
                  </> : idea ? <>
                    <span className="lp-story-range">Why your income isn't in your score</span>
                    <h2 className="lp-story-name idea">Income is <span>not</span> wealth.</h2>
                    <div className="lp-story-lines">
                      <p><small>Home A</small>Earns ₦1m, spends ₦950k. Keeps ₦50k a month.</p>
                      <p><small>Home B</small>Earns ₦700k, spends ₦550k. Keeps ₦150k: three times more.</p>
                    </div>
                  </> : <>
                    <span className="lp-story-range tnum">Score {range}</span>
                    <h2 className="lp-story-name">{st.plant}<em> · {st.name}</em></h2>
                    <div className="lp-story-lines">
                      <p><small>What it feels like</small>{STORY[i].feels}</p>
                      <p><small>Your next move</small>{STORY[i].next}</p>
                    </div>
                  </>}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="lp-story-foot">
            {!end ? <Link to="/start" className={"btn " + (dark ? "light" : "")}>Find your stage · 4 min<Ic n="arrow" s={18} /></Link> : <span />}
            <span className="lp-story-hint">{end ? "Free for families · No sign-up" : "Keep scrolling"}</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------- page ---------- */

export default function Landing() {
  const r = result();
  const [listing, setListing] = useState(false);
  const named = !!load("onboarded");
  const checkTo = "/start";
  const checkLabel = r ? `Open my SeedLine · ${r.score}` : named ? "Open my SeedLine" : "Start free";
  return (
    <div className="lp">
      <SiteNav dark />

      {/* hero: bold, solid, calm */}
      <section className="hx"><div className="lp-wrap hx-in">
        <motion.div className="hx-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: [.16, 1, .3, 1] }}>
          <span className="hx-eyebrow">Your family office, online</span>
          <h1>Grow your family's <span>wealth.</span></h1>
          <p>See where your family stands. Grow from there, together.</p>
          <span className="hx-made"><i />Developed for the MSMMI Marriage Workshop 2026</span>
          <div className="hx-cta">
            <Link to={checkTo} className="btn gold hx-btn">{checkLabel}<Ic n="arrow" s={20} /></Link>
            <span className="hx-note">Free for families · No sign-up · 4 minutes</span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: .2, ease: [.16, 1, .3, 1] }}>
          <HeroSeed />
        </motion.div>
      </div></section>

      {/* pinned story */}
      <Story />

      {/* trust strip */}
      <section className="lp-trustbar"><div className="lp-wrap lp-trustbar-in">
        {[["lock", "Private by default", "Your answers stay on your phone."], ["ranges", "Ranges, not figures", "No account numbers. No exact salaries."], ["equal", "No paid rankings", "We educate. Institutions serve."]].map(([n, t, d]) => (
          <div key={t}><span className="lp-sq"><Ic n={n} /></span><span><b>{t}</b><small>{d}</small></span></div>
        ))}
        <Link to="/trust" className="lp-textlink">How we protect your family <Ic n="arrow" s={16} /></Link>
      </div></section>

      <SiteFooter onList={() => setListing(true)} />
      <ListingModal open={listing} onClose={() => setListing(false)} />
    </div>
  );
}
