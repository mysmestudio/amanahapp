// @ts-nocheck
// Home / Result: a staged, swipeable reveal. Score → Celebrate (certificate) → Six parts → Why → Next.
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, animate } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { PlantIcon, STAGE_TONE } from "./Row";
import { AppTop, Fine } from "./ui";
import { STAGES, PARTS, SEED, CUR, levelWord, roadmap, ORIGIN } from "./content";
import { load, save, useStore, result, api } from "./store";
import { partSays } from "./AppPages";
import { drawCertificate, canvasBlob } from "./cert";
import { Ic } from "./site";

const STEPS = ["Score", "Celebrate", "Six parts", "Why", "Next"];
const STRENGTH = { income: "Steady income", surplus: "Keeps money", safety: "Strong cushion", debt: "Low debt", productive: "Money at work", legacy: "Ready to pass on" };
const fmtDate = d => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const stageIdxOf = st => STAGES.findIndex(s => s.id === st.id);

function Ring({ value, size = 180, stroke = 14, tone = "#D9A93A", delay = .2 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth={stroke} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ duration: 1.6, delay, ease: [.16, 1, .3, 1] }} />
    </svg>
  );
}
function useCount(to, run = true, dur = 1.6) {
  const [v, setV] = useState(run ? 0 : to);
  useEffect(() => { if (!run) { setV(to); return; } const c = animate(0, to, { duration: dur, delay: .2, ease: [.16, 1, .3, 1], onUpdate: setV }); return () => c.stop(); }, [to]);
  return Math.round(v);
}

/* ---------- 1. score ---------- */
function ScoreStep({ r, prev, go }) {
  const st = r.stage, si = stageIdxOf(st), n = useCount(r.score);
  const toNext = STAGES[si + 1] ? STAGES[si + 1].min - r.score : 0;
  return (
    <div className="rs-stack">
      <div className="rs-hero">
        <div className="rs-hero-ring">
          <Ring value={r.score} />
          <div className="rs-hero-num"><b className="tnum">{n}</b><span>of 100</span></div>
        </div>
        <div className="rs-hero-copy">
          <span className="rs-eyebrow">Your family wealth score</span>
          <h1 className="rs-stage"><PlantIcon stage={si} size={34} tile /> {st.plant}<em> · {st.name}</em></h1>
          <p>{st.means}</p>
          {prev && <span className="rs-delta">{r.score > prev.score ? `Up ${r.score - prev.score} since last time` : r.score < prev.score ? `Down ${prev.score - r.score} since last time` : "Same as last time"}</span>}
        </div>
      </div>
      <div className="rs-line" aria-label="The four stages">
        {STAGES.map((s, i) => (
          <div key={s.id} className={"rs-line-s" + (i === si ? " on" : i < si ? " past" : "")} style={{ "--t": STAGE_TONE[i] }}>
            <PlantIcon stage={i} size={36} tile={i <= si} />
            <b>{s.plant}</b><small className="tnum">{s.min}–{STAGES[i + 1] ? STAGES[i + 1].min - 1 : 100}</small>
            {i === si && <motion.i layoutId="rs-you" className="rs-you">You</motion.i>}
          </div>
        ))}
      </div>
      {toNext > 0 && (() => { const lo = st.min, hi = STAGES[si + 1].min, pc = Math.round((r.score - lo) / (hi - lo) * 100); return (
        <div className="rs-gradient">
          <div className="rs-gradient-h"><b>You're {pc}% of the way to {STAGES[si + 1].plant}</b><span className="tnum">{toNext} points to go</span></div>
          <div className="rs-gradient-bar"><motion.i initial={{ width: 0 }} animate={{ width: pc + "%" }} transition={{ duration: 1.2, delay: .6, ease: [.16, 1, .3, 1] }} /><span style={{ left: "100%" }}><PlantIcon stage={si + 1} size={26} tile /></span></div>
        </div>); })()}
      <div className="rs-two">
        <div className="rs-tile"><small>Next goal</small><p>{st.next}</p></div>
        <div className="rs-tile gold"><small>{toNext > 0 ? `${toNext} points to ${STAGES[si + 1].plant}` : "You've reached Harvest"}</small><p>{st.focus}</p></div>
      </div>
      {r.capped && <Info title="Why your score stops at 34">Almost nothing is left each month, so there's no seed to grow yet. Wealth can't build until there's a gap between money in and money out.</Info>}
      <button className="btn block lg" onClick={() => go(1)}>Celebrate my result <Ic n="arrow" s={18} /></button>
    </div>
  );
}

/* ---------- 2. celebrate ---------- */
function CelebrateStep({ r, go }) {
  const st = r.stage, si = stageIdxOf(st);
  const [name, setName] = useStore("certName", "");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const qrRef = useRef(null);
  const strong = Object.keys(PARTS).filter(k => r.lev[k] >= 60).sort((a, b) => r.lev[b] - r.lev[a]).slice(0, 3).map(k => STRENGTH[k]);
  const strengths = strong.length ? strong : [Object.keys(PARTS).sort((a, b) => r.lev[b] - r.lev[a]).map(k => STRENGTH[k])[0]];
  const display = name.trim() || "Your Family";
  const date = fmtDate(r.last.at);
  const make = async () => drawCertificate({ name: display, score: r.score, stageIdx: si, plantName: st.plant, stageName: st.name, strengths, date, qr: qrRef.current?.querySelector("canvas") });
  const download = async () => { setBusy("dl"); try { const c = await make(); const b = await canvasBlob(c); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `Seedline-certificate-${display.replace(/\s+/g, "-")}.png`; document.body.appendChild(a); a.click(); a.remove(); setMsg("Saved. Check your downloads."); } catch { setMsg("Couldn't create the image on this browser."); } setBusy(""); };
  const share = async () => {
    setBusy("sh");
    const text = `${display} scored ${r.score}/100 on the Seedline Family Wealth Check (${st.plant} · ${st.name}). Where does your family stand? ${ORIGIN}/app/check`;
    try {
      const b = await canvasBlob(await make()); const file = new File([b], "seedline-certificate.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text });
      else window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
    } catch {}
    setBusy("");
  };
  const invite = async () => {
    const text = `Assalamu alaikum! I just took the Seedline Family Wealth Check. It takes 4 minutes and shows where our family's money stands. Take yours: ${ORIGIN}/app/check`;
    try { if (navigator.share) await navigator.share({ text, title: "Seedline" }); else window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener"); } catch {}
  };
  return (
    <div className="rs-stack">
      <div className="rs-head"><span className="rs-eyebrow dark">Celebrate where you are</span><h2>A result worth sharing.</h2></div>
      <motion.div className="rs-cert" initial={{ rotateX: 20, opacity: 0, y: 30 }} animate={{ rotateX: 0, opacity: 1, y: 0 }} transition={{ duration: .8, ease: [.16, 1, .3, 1] }}>
        <div className="rs-cert-in">
          <div className="rs-cert-l">
            <span className="rs-eyebrow">Seedline · Family Wealth Check</span>
            <small>This certifies that</small>
            <b className="rs-cert-name">{display}</b>
            <small>is growing at the {st.plant} stage: {st.name.toLowerCase()}.</small>
            <div className="rs-cert-tags">{strengths.map(t => <span key={t}>{t}</span>)}</div>
            <small className="rs-cert-date">{date}</small>
          </div>
          <div className="rs-cert-r">
            <motion.div className="rs-cert-score" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: .5, type: "spring", stiffness: 260, damping: 15 }}><b className="tnum">{r.score}</b><span>of 100</span></motion.div>
            <span className="rs-cert-plant"><PlantIcon stage={si} size={30} light /></span>
          </div>
        </div>
      </motion.div>
      <label className="rs-field"><span>Name on your certificate</span><input type="text" value={name} maxLength={40} placeholder="e.g. The Durosimi Family, or your own name" onChange={e => setName(e.target.value)} /></label>
      <div className="rs-actions">
        <button className="btn" onClick={download} disabled={!!busy}><Ic n="download" s={18} />{busy === "dl" ? "Creating…" : "Download"}</button>
        <button className="btn gold" onClick={share} disabled={!!busy}><Ic n="share" s={18} />{busy === "sh" ? "Preparing…" : "Share"}</button>
        <button className="btn ghost" onClick={invite}><Ic n="family" s={18} />Invite family</button>
      </div>
      {msg && <p className="small muted" role="status">{msg}</p>}
      <p className="rs-private"><Ic n="lock" s={15} />Your income and weak spots never appear on the certificate.</p>
      <div ref={qrRef} style={{ display: "none" }} aria-hidden="true"><QRCodeCanvas value={ORIGIN + "/app/check"} size={280} fgColor="#0A1A3F" includeMargin={false} /></div>
      <button className="btn ghost block" onClick={() => go(2)}>Next: your six parts <Ic n="arrow" s={18} /></button>
    </div>
  );
}

/* ---------- 3. six parts ---------- */
function PartsStep({ r, go }) {
  const a = r.last.answers, rm = roadmap(r, a);
  const all = [...rm.fix, ...rm.grow, ...rm.protect];
  const keys = Object.keys(PARTS).sort((x, y) => r.lev[x] - r.lev[y]);
  const [open, setOpen] = useState(keys[0]);
  return (
    <div className="rs-stack">
      <div className="rs-head"><span className="rs-eyebrow dark">Deep dive</span><h2>The six parts of your money.</h2><p className="muted">Tap any part. Weakest first, so you know where to start.</p></div>
      <div className="rs-parts">
        {keys.map((k, i) => {
          const v = r.lev[k], lw = levelWord(v), on = open === k, act = all.find(x => x.part === k), weak = k === r.weakest, strong = v >= 60;
          return (
            <motion.div key={k} layout className={"rs-part" + (on ? " on" : "")} style={{ "--c": lw.c }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }}>
              <button className="rs-part-h" onClick={() => setOpen(on ? null : k)} aria-expanded={on}>
                <span className="rs-part-t"><b>{PARTS[k].name}</b>{weak && <em className="rs-flag">Holding you back</em>}</span>
                <span className="rs-part-lv" style={{ color: lw.c }}>{lw.w}</span>
                <span className="rs-bar"><motion.i initial={{ width: 0 }} animate={{ width: v + "%" }} transition={{ duration: 1, delay: .2 + i * .06, ease: [.16, 1, .3, 1] }} style={{ background: lw.c }} /></span>
              </button>
              <AnimatePresence initial={false}>
                {on && <motion.div className="rs-part-b" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }}>
                  <div className="rs-part-in">
                    <p>{partSays(k, v, a)}</p>
                    {act && <div className="rs-next"><small>{strong ? "To get even better" : "Your best next move"}</small><b>{act.t}</b><span>{act.week}</span></div>}
                    <Link className={"btn sm" + (strong ? " ghost" : "")} to={`/app/plan?part=${k}`}>{strong ? "See it in my plan" : "Fix this in my plan"} <Ic n="arrow" s={15} /></Link>
                  </div>
                </motion.div>}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
      <button className="btn ghost block" onClick={() => go(3)}>Next: why it matters <Ic n="arrow" s={18} /></button>
    </div>
  );
}

/* ---------- 4. why (seed story) ---------- */
function Info({ title, children, dark = false }) {
  const [o, setO] = useState(false);
  return (
    <div className={"rs-info" + (dark ? " dark" : "")}>
      <button onClick={() => setO(!o)} aria-expanded={o}><Ic n="spark" s={16} /><span>{title}</span><Ic n="chev" s={18} /></button>
      <AnimatePresence initial={false}>{o && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}><p>{children}</p></motion.div>}</AnimatePresence>
    </div>
  );
}
function WhyStep({ r, go }) {
  const a = r.last.answers;
  const weakF = Object.keys(r.factors).sort((x, y) => r.factors[x] - r.factors[y])[0];
  const band = a.band != null && a.country ? CUR[a.country].bands[a.band] : null;
  const tones = { S: "#B4472A", T: "#2A4FA8", P: "#1E7A4E", G: "#B98A1F" };
  return (
    <div className="rs-stack">
      <div className="rs-head"><span className="rs-eyebrow dark">Your seed story</span><h2>Wealth multiplies.</h2><p className="muted">A field needs four things. If any one is near zero, nothing grows, however strong the others are.</p></div>
      <div className="rs-formula" aria-label="Wealth equals Surplus times Time times Productive use times Good stewardship">
        <b>W</b><span>=</span>{Object.keys(SEED).map((k, i) => <span key={k} className="rs-fx"><b style={{ color: tones[k] }} className={k === weakF ? "weak" : ""}>{k}</b>{i < 3 && <span>×</span>}</span>)}
      </div>
      <div className="rs-seed">
        {Object.entries(SEED).map(([k, s]) => { const v = r.factors[k], lw = levelWord(v); return (
          <div key={k} className={"rs-seedc" + (k === weakF ? " weak" : "")} style={{ "--t": tones[k] }}>
            <span className="rs-seedk">{k}</span>
            <b>{s.name}</b><small>{s.story}</small>
            <span className="rs-seedv" style={{ color: lw.c }}>{lw.w}{k === weakF ? " · weakest link" : ""}</span>
          </div>); })}
      </div>
      <Info title="What each letter is built from">{Object.entries(SEED).map(([k, s]) => `${k}, ${s.name}: ${s.built}.`).join(" ")}</Info>
      {band && <Info title="Where's my income in this?" dark>You told us about {band} comes in each month. That number is not in your score at all, on purpose. Income passes through your hands; wealth is what you keep, protect, put to work and pass on.</Info>}
      <button className="btn ghost block" onClick={() => go(4)}>Next: what to do now <Ic n="arrow" s={18} /></button>
    </div>
  );
}


/* Reciprocity + honest loss framing: ask for an email only after giving the result, certificate and plan. */
export function SaveCard({ r, plan = null }) {
  const [saved, setSaved] = useStore("savedEmail", null);
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  if (saved) return <div className="rs-save done"><span className="rs-save-ic"><Ic n="check" s={20} w={2.6} /></span><span><b>Saved for {saved}</b><small>We'll email your result and plan to this address, so you keep them even if this phone forgets.</small></span></div>;
  const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const submit = async e => { e.preventDefault(); if (!ok) return; setState("sending"); try { await api("followups", { check_id: r.last.checkId || null, email: email.trim(), plan: { score: r.score, stage: r.stage.name, picks: plan } }); setSaved(email.trim()); } catch { setState("error"); } };
  return (
    <form className="rs-save" onSubmit={submit}>
      <span className="rs-save-ic"><Ic n="lock" s={20} /></span>
      <span className="rs-save-t"><b>Don't lose your result</b><small>Right now it lives only on this phone. Clear your browser or change phones, and it's gone. Get a copy by email.</small></span>
      <div className="rs-save-f"><input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} aria-label="Your email" autoComplete="email" /><button className="btn" disabled={!ok || state === "sending"}>{state === "sending" ? "Saving…" : "Email me a copy"}</button></div>
      {state === "error" && <small className="rs-save-err">That didn't send. Try again in a moment.</small>}
    </form>
  );
}

/* ---------- 5. next ---------- */
function NextStep({ r, history }) {
  const [picks] = useStore("picks", {}); const [course] = useStore("course");
  const done = course ? Object.keys(course.done || {}).length : 0;
  return (
    <div className="rs-stack">
      <div className="rs-head"><span className="rs-eyebrow dark">Your next move</span><h2>Pick where to go next.</h2></div>
      <div className="rs-doors">
        <Link to="/app/plan" className="rs-door navy"><span className="rs-door-ic"><Ic n="plan" s={22} /></span><b>{picks.made ? "My 30-day plan" : "Make my plan"}</b><small>Three actions, chosen from your answers.</small><Ic n="arrow" s={18} /></Link>
        <Link to="/app/learn" className="rs-door"><span className="rs-door-ic"><Ic n="book" s={22} /></span><b>{course ? `Continue course · ${done} done` : "Start the course"}</b><small>Short lessons, alone or as a family.</small><Ic n="arrow" s={18} /></Link>
        <Link to="/app/directory" className="rs-door"><span className="rs-door-ic"><Ic n="building" s={22} /></span><b>Find halal providers</b><small>36 institutions, matched to your goal.</small><Ic n="arrow" s={18} /></Link>
        <Link to="/app/tools" className="rs-door"><span className="rs-door-ic"><Ic n="pulse" s={22} /></span><b>Family money tools</b><small>Cushion, surplus, investment check.</small><Ic n="arrow" s={18} /></Link>
      </div>
      <SaveCard r={r} />
      {history.length > 1 && <div className="rs-tile"><small>Your score over time</small><div className="history" style={{ marginTop: 22 }}>{history.slice(-8).map((h, i) => <div key={i} style={{ height: Math.max(6, h.score) + "%" }}><span className="tnum">{h.score}</span></div>)}</div></div>}
      <Link className="btn ghost block" to="/app/check">Retake the check</Link>
      <Fine>A teaching indicator, not financial or Shariah advice. {load("offline") ? "Your result couldn't reach the room, but it's saved on this phone." : ""}</Fine>
    </div>
  );
}

export function Home() {
  const loc = useLocation();
  const r = result();
  const [history] = useStore("history", []);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const go = n => { setDir(n > step ? 1 : -1); setStep(Math.max(0, Math.min(STEPS.length - 1, n))); window.scrollTo({ top: 0, behavior: "smooth" }); };
  useEffect(() => { if (loc.state?.animate) setStep(0); }, [loc.key]);

  if (!r) return (
    <div className="app">
      <AppTop />
      <div className="rs-welcome">
        <div className="rs-welcome-plants">{[0, 1, 2, 3].map(i => <motion.span key={i} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .2 + i * .12 }}><PlantIcon stage={i} size={56} tile /></motion.span>)}</div>
        <span className="rs-eyebrow">Step 1 of 4 done · you're in</span>
        <h1>{load("name") ? `${load("name")}, let's` : "Let's"} see where your family stands.</h1>
        <p>Thirteen questions, about four minutes. You'll get your score, your stage, a certificate, and the one part holding your home back.</p>
        <Link className="btn gold block lg" to="/app/check">Start the family check <Ic n="arrow" s={18} /></Link>
      </div>
      <div className="rs-two">
        <div className="rs-tile"><small>Private</small><p>Your answers stay on your phone.</p></div>
        <div className="rs-tile"><small>Simple</small><p>Ranges only, never exact figures.</p></div>
      </div>
    </div>
  );

  const prev = history.length > 1 ? history[history.length - 2] : null;
  return (
    <div className="app">
      <AppTop />
      <div className="rs-steps" role="tablist" aria-label="Result sections">
        {STEPS.map((s, i) => <button key={s} role="tab" aria-selected={step === i} className={i < step ? "past" : ""} onClick={() => go(i)}><i /><span>{s}</span></button>)}
      </div>
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div key={step} custom={dir}
          initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }} transition={{ duration: .35, ease: [.16, 1, .3, 1] }}
          drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={.12} dragDirectionLock
          onDragEnd={(_, info) => { if (info.offset.x < -90 && step < STEPS.length - 1) go(step + 1); else if (info.offset.x > 90 && step > 0) go(step - 1); }}>
          {step === 0 && <ScoreStep r={r} prev={prev} go={go} />}
          {step === 1 && <CelebrateStep r={r} go={go} />}
          {step === 2 && <PartsStep r={r} go={go} />}
          {step === 3 && <WhyStep r={r} go={go} />}
          {step === 4 && <NextStep r={r} history={history} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
