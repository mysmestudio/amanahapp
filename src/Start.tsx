// @ts-nocheck
// Opening screens (like ScrollQuran): a splash, then "What should we call you?", then into the app.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Logo } from "./ui";
import { load, save } from "./store";
import { Ic } from "./site";
import "./start.css";

const WORDS = ["step", "seed", "plan", "lesson"];
const ROW1 = [["Family check", "#13306B"], ["Your score", "#2A4FA8"], ["Certificate", "#B98A1F"], ["30-day plan", "#B4472A"], ["30 lessons", "#1E7A4E"], ["Halal directory", "#0F6E6E"], ["Money tools", "#6B4FA8"], ["Contract decoder", "#13306B"]];
const ROW2 = ["Coming soon · Family accounts", "Coming soon · Email reminders", "Coming soon · Asset register", "Coming soon · Invite your spouse"];

function Sprout() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <motion.path d="M12 21V11" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .8, delay: .3 }} />
      <motion.path d="M12 13c-4 0-6-2.5-6-6 3.5 0 6 2 6 6z" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .8, delay: .9 }} />
      <motion.path d="M12 11c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6z" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .8, delay: 1.3 }} />
    </svg>
  );
}

export default function Start() {
  const nav = useNavigate();
  const reduce = useReducedMotion();
  const [screen, setScreen] = useState(0);
  const [w, setW] = useState(0);
  const [name, setName] = useState(() => load("name", "") || "");
  useEffect(() => { if (reduce || screen) return; const t = setInterval(() => setW(n => (n + 1) % WORDS.length), 1700); return () => clearInterval(t); }, [screen]);
  const begin = e => {
    e?.preventDefault();
    const n = name.trim().slice(0, 40);
    save("name", n); save("onboarded", Date.now());
    if (n && !load("certName")) save("certName", n);
    nav("/app", { replace: true });
  };
  return (
    <AnimatePresence mode="wait">
      {screen === 0 ? (
        <motion.main key="splash" className="st-splash" onClick={() => setScreen(1)} exit={{ opacity: 0 }} transition={{ duration: .4 }}
          drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={.15} onDragEnd={(_, i) => Math.abs(i.offset.y) > 60 && setScreen(1)}>
          <button className="st-next" onClick={e => { e.stopPropagation(); setScreen(1); }}>Next <Ic n="arrow" s={14} /></button>
          <div className="st-center">
            <div className="st-mark">
              <span className="st-ring r1" /><span className="st-ring r2" /><span className="st-ring r3" />
              <motion.span className="st-logo" initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}><Logo /></motion.span>
              <motion.span className="st-badge" initial={{ rotate: -20, scale: 0 }} animate={{ rotate: 8, scale: 1 }} transition={{ delay: .6, type: "spring" }}>Your family<br />office</motion.span>
            </div>
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}>Seed<span>line</span></motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5 }}>
              Grow your family's wealth, one{" "}
              <span className="st-word"><AnimatePresence mode="wait"><motion.b key={w} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: .3 }}>{WORDS[w]}</motion.b></AnimatePresence></span>{" "}
              at a time.
            </motion.p>
          </div>
          <div className="st-bottom">
            <span className="st-inside">Inside the app</span>
            <div className="st-row"><div className="st-track">{[...ROW1, ...ROW1].map(([t, c], i) => <span key={i} style={{ background: c }}>{t}</span>)}</div></div>
            <div className="st-row"><div className="st-track rev">{[...ROW2, ...ROW2, ...ROW2].map((t, i) => <span key={i} className="ghost">{t}</span>)}</div></div>
            <span className="st-tap"><i />Tap or swipe to begin</span>
          </div>
        </motion.main>
      ) : (
        <motion.main key="welcome" className="st-welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .4 }}>
          <div className="st-dots" aria-hidden="true">{Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ "--i": i }} />)}</div>
          <motion.form className="st-arch" onSubmit={begin} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .7, ease: [.16, 1, .3, 1] }}>
            <span className="st-lamp"><Sprout /></span>
            <span className="st-salam">Assalamu alaikum</span>
            <h1>Welcome to Seedline</h1>
            <p>A calm place to see where your family's money stands, and grow from there.</p>
            <div className="st-fill" />
            <label htmlFor="st-name">What should we call you?</label>
            <input id="st-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name or family name (optional)" autoComplete="name" maxLength={40} autoFocus />
            <button className="btn gold block st-go" type="submit">Bismillah, let's begin <Ic n="arrow" s={18} /></button>
            <small>No account needed. Your answers stay on this phone.</small>
          </motion.form>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
