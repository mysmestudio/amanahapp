// @ts-nocheck
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PlantIcon, STAGE_TONE } from "./Row";
import { Brand, Logo } from "./ui";
import { STAGES } from "./content";
import { result, api } from "./store";
import "./landing.css";

/* ---------- small building blocks ---------- */
const ic = {
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  shield: <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />,
  ranges: <><path d="M4 12h16" /><path d="M7 8v8M17 8v8" /></>,
  phone: <><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18h2" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="M11 12l8-8M16 7l3 3" /></>,
  scale: <><path d="M12 4v16M5 20h14M6 8h12" /><path d="M6 8l-3 6a3 3 0 0 0 6 0zM18 8l-3 6a3 3 0 0 0 6 0z" /></>,
  family: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.8.8 3 2.6 3.5 5.2" /></>,
  pulse: <path d="M3 12h4l3-7 4 14 3-7h4" />,
  plan: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
  book: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 21V5" /></>,
  doc: <><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></>,
  share: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8" /></>,
  building: <><path d="M4 21V8l8-5 8 5v13" /><path d="M9 21v-6h6v6M8 11h.01M12 11h.01M16 11h.01" /></>,
  badge: <><circle cx="12" cy="9" r="6" /><path d="M9 14.5L7.5 21l4.5-2.5 4.5 2.5-1.5-6.5" /><path d="M9.5 9l1.8 1.8 3.2-3.3" /></>,
  inbox: <><path d="M3 13l3-8h12l3 8v6H3z" /><path d="M3 13h5l1.5 2.5h5L16 13h5" /></>,
  equal: <><path d="M5 9h14M5 15h14" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  chev: <path d="M6 9l6 6 6-6" />,
  x: <path d="M6 6l12 12M18 6L6 18" />
};
function Ic({ n, s = 20, w = 2 }) {
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ic[n]}</svg>;
}
const rise = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: .55, ease: [.16, 1, .3, 1] } };

function Ring({ score, size = 92, stroke = 9, tone = "#D9A93A" }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth={stroke} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeDasharray={c}
        initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - score / 100) }} transition={{ duration: 1.4, ease: [.16, 1, .3, 1], delay: .3 }} />
    </svg>
  );
}
const stageOf = s => STAGES.reduce((acc, st, i) => (s >= st.min ? i : acc), 0);

/* ---------- the product, drawn in UI (hero) ---------- */
function Phone({ score, stageIdx, family, example }) {
  const st = STAGES[stageIdx];
  const toNext = STAGES[stageIdx + 1] ? STAGES[stageIdx + 1].min - score : 0;
  return (
    <div className="lp-phone" aria-hidden="true">
      <div className="lp-screen">
        <div className="lp-ph-top"><span className="lp-ph-brand"><Logo /> Seedline</span><span className="lp-ph-av">{(family || "F").replace(/^The\s+/i, "")[0]}</span></div>
        <div className="lp-ph-hi"><span>Assalamu alaikum,</span><b>{family}</b></div>
        <div className="lp-ph-score">
          <div className="lp-ph-sl">
            <span className="lp-eyebrow gold">{example ? "Example score" : "Family wealth score"}</span>
            <b className="tnum">{score}</b>
            <span className="lp-pill gold">{st.plant} · {st.name}</span>
          </div>
          <div className="lp-ph-ring"><Ring score={score} /><span><PlantIcon stage={stageIdx} size={30} light /></span></div>
          <div className="lp-ph-track">{STAGES.map((s, i) => <i key={s.id} style={{ background: i < stageIdx ? STAGE_TONE[i] : i === stageIdx ? "#FFFFFF" : "rgba(255,255,255,.18)" }} />)}</div>
          <span className="lp-ph-next">{toNext > 0 ? `${toNext} points to ${STAGES[stageIdx + 1].plant}` : "Harvest stage: protect and pass on"}</span>
        </div>
        <div className="lp-ph-plan">
          <div className="lp-ph-row"><b>Your plan</b><span>3 of 9 done</span></div>
          <div className="lp-bar"><i style={{ width: "33%" }} /></div>
          <div className="lp-ph-next2"><span className="lp-sq"><Ic n="shield" s={16} /></span><span><small>Next step</small>Build a 3-month cushion</span></div>
        </div>
        <div className="lp-ph-tiles">
          <div style={{ background: "#B4472A" }}><small>Learning streak</small><b>12<em> days</em></b></div>
          <div style={{ background: "#2A4FA8" }}><small>Family</small><span className="lp-avs"><i>E</i><i className="g">A</i><i>Z</i><i className="add">+</i></span></div>
        </div>
      </div>
    </div>
  );
}
function Certificate({ name, score, stageIdx, compact = false }) {
  const st = STAGES[stageIdx];
  return (
    <div className={"lp-cert" + (compact ? " compact" : "")}>
      <div className="lp-cert-in">
        <div className="lp-cert-l">
          <span className="lp-eyebrow gold">Seedline · Family Wealth Check</span>
          <span className="lp-cert-sub">This certifies that</span>
          <b className="lp-cert-name">{name}</b>
          <span className="lp-cert-sub">is growing at the {st.plant} stage: {st.name.toLowerCase()}.</span>
          {!compact && <div className="lp-cert-tags"><span>Strong cushion</span><span>Money at work</span><span>Low debt</span></div>}
          <span className="lp-cert-foot">15 November 2026 · MSMMI Marriage Workshop</span>
        </div>
        <div className="lp-cert-r">
          <div className="lp-cert-score"><b className="tnum">{score}</b><span>of 100</span></div>
          <span className="lp-cert-plant"><PlantIcon stage={stageIdx} size={compact ? 22 : 28} light /></span>
        </div>
      </div>
    </div>
  );
}

/* ---------- institution listing request ---------- */
const ORG_TYPES = ["Islamic bank or window", "Fund or asset manager", "Takaful operator", "Waqf or endowment", "Cooperative or microfinance", "Other halal provider"];
function ListingModal({ open, onClose }) {
  const [f, setF] = useState({ org_name: "", org_type: ORG_TYPES[0], regulator: "", contact_name: "", email: "", phone: "", note: "" });
  const [state, setState] = useState("idle");
  useEffect(() => { if (!open) return; const k = e => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); document.body.style.overflow = "hidden"; return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; }; }, [open]);
  if (!open) return null;
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const ok = f.org_name.trim().length > 1 && f.contact_name.trim().length > 1 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim());
  async function submit(e) {
    e.preventDefault(); if (!ok) return; setState("sending");
    try { await api("institution_requests", Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim() || null]))); setState("done"); }
    catch { setState("error"); }
  }
  return (
    <div className="lp-modal" role="dialog" aria-modal="true" aria-labelledby="lm-t" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="lp-sheet" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35, ease: [.16, 1, .3, 1] }}>
        <button className="lp-x" onClick={onClose} aria-label="Close"><Ic n="x" /></button>
        {state === "done" ? (
          <div className="lp-done">
            <span className="lp-done-ic"><Ic n="check" s={30} w={2.6} /></span>
            <h3>Request received.</h3>
            <p>We'll check your licence and Shariah board, then email {f.email.trim()} with next steps. Listing is free, and every verified institution is shown equally.</p>
            <button className="btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="lp-form">
            <span className="lp-eyebrow">For institutions · free verified listing</span>
            <h3 id="lm-t">List your institution on Seedline</h3>
            <p className="lp-muted">Families looking for halal banking, investing, takaful and waqf will find you, see your licence and Shariah board, and contact you directly.</p>
            <label>Institution name<input type="text" required value={f.org_name} onChange={set("org_name")} autoComplete="organization" /></label>
            <label>What you offer<select value={f.org_type} onChange={set("org_type")}>{ORG_TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
            <label>Regulator and licence <em>optional</em><input type="text" value={f.regulator} onChange={set("regulator")} placeholder="e.g. SEC Nigeria, CBN, NAICOM" /></label>
            <div className="lp-2">
              <label>Your name<input type="text" required value={f.contact_name} onChange={set("contact_name")} autoComplete="name" /></label>
              <label>Work email<input type="email" required value={f.email} onChange={set("email")} autoComplete="email" /></label>
            </div>
            <label>Phone <em>optional</em><input type="text" value={f.phone} onChange={set("phone")} autoComplete="tel" /></label>
            <label>Anything we should know <em>optional</em><textarea rows={3} value={f.note} onChange={set("note")} /></label>
            {state === "error" && <p className="lp-err">That didn't send. Check your connection and try again.</p>}
            <button className="btn block" type="submit" disabled={!ok || state === "sending"}>{state === "sending" ? "Sending…" : "Request my free listing"}</button>
            <p className="lp-fine">No fees. No paid rankings. No "recommended" badges.</p>
          </form>
        )}
      </motion.div>
    </div>
  );
}

/* ---------- accordion ---------- */
function Acc({ q, children, dark = false }) {
  const [o, setO] = useState(false);
  return (
    <div className={"lp-acc" + (o ? " open" : "") + (dark ? " dark" : "")}>
      <button onClick={() => setO(!o)} aria-expanded={o}><span>{q}</span><Ic n="chev" /></button>
      <div className="lp-acc-b" hidden={!o}>{children}</div>
    </div>
  );
}

/* ============================ PAGE ============================ */
export default function Landing() {
  const r = result();
  const score = r ? r.score : 71;
  const sIdx = stageOf(score);
  const family = "The Durosimi Family";
  const [side, setSide] = useState("families");
  const [listing, setListing] = useState(false);
  const checkTo = r ? "/app" : "/app/check";
  const checkLabel = r ? `Open my Seedline · ${r.score}` : "Check my family · 4 min";

  return (
    <div className="lp">
      {/* nav */}
      <header className="lp-nav"><div className="lp-wrap lp-nav-in">
        <Brand />
        <nav className="lp-links" aria-label="Site">
          <a href="#families" onClick={() => setSide("families")}>For families</a><a href="#families" onClick={() => setSide("institutions")}>For institutions</a><a href="#security">Security</a><a href="#learn">Learn</a>
        </nav>
        <div className="lp-nav-cta">
          <Link to="/how-it-works" className="lp-navlink">How it works</Link>
          <Link to={checkTo} className="btn sm">{r ? "Open my Seedline" : "Start free"}</Link>
        </div>
      </div></header>

      {/* hero */}
      <section className="lp-hero"><div className="lp-wrap lp-hero-in">
        <motion.div className="lp-hero-copy" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, ease: [.16, 1, .3, 1] }}>
          <span className="lp-pill tint"><i className="lp-dot" />Your family office, online</span>
          <h1>Grow your family's wealth, <span className="lp-u">together.</span></h1>
          <p className="lp-lede">See where your family stands, follow a clear plan, learn at your own pace, and keep it all private. Built for Muslim families at home and abroad.</p>
          <div className="lp-ctas">
            <Link to={checkTo} className="btn lp-btn-lg">{checkLabel}<Ic n="arrow" s={18} /></Link>
            <button className="btn ghost lp-btn-lg" onClick={() => setListing(true)}>List your institution</button>
          </div>
          <ul className="lp-trust-row">
            <li><Ic n="lock" s={16} />Private by default</li>
            <li><Ic n="ranges" s={16} />No exact figures</li>
            <li><Ic n="equal" s={16} />No paid rankings</li>
            <li><Ic n="check" s={16} />Free for families</li>
          </ul>
        </motion.div>

        <div className="lp-stage">
          <div className="lp-stage-bg"><div className="lp-stage-rows">{[0, 1, 2, 3, 4, 5].map(i => <i key={i} />)}</div></div>
          <motion.div className="lp-stage-phone" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .1, ease: [.16, 1, .3, 1] }}>
            <Phone score={score} stageIdx={sIdx} family={family} example={!r} />
          </motion.div>
          <motion.div className="lp-float lp-float-cert" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7, delay: .45, ease: [.16, 1, .3, 1] }}>
            <Certificate name={family} score={score} stageIdx={sIdx} compact />
          </motion.div>
          <motion.div className="lp-float lp-float-toast" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .8 }}>
            <span className="lp-sq gold"><Ic n="share" s={16} /></span><span><b>Shared with family</b><small>Aisha opened your result</small></span>
          </motion.div>
          <motion.div className="lp-float lp-float-lock" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: 1 }}>
            <Ic n="lock" s={15} /> Only you can see your numbers
          </motion.div>
        </div>
      </div></section>

      {/* two sides */}
      <section className="lp-sec" id="families"><div className="lp-wrap">
        <motion.div className="lp-head center" {...rise}>
          <span className="lp-eyebrow">One place, two sides of the table</span>
          <h2>Families plan. Institutions serve.</h2>
          <div className="lp-switch" role="tablist" aria-label="Who is Seedline for">
            <button role="tab" aria-selected={side === "families"} onClick={() => setSide("families")}><Ic n="family" s={18} />For families</button>
            <button role="tab" aria-selected={side === "institutions"} onClick={() => setSide("institutions")}><Ic n="building" s={18} />For institutions</button>
          </div>
        </motion.div>

        {side === "families" ? (
          <motion.div key="f" className="lp-bento" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
            <div className="lp-tile big navy">
              <span className="lp-sq gold"><Ic n="pulse" /></span>
              <h3>Health-check your family's wealth</h3>
              <p>Thirteen questions in plain words. Get a score, your stage and the one thing holding your home back.</p>
              <div className="lp-mini-stages">{STAGES.map((s, i) => <span key={s.id} className={i === sIdx ? "on" : ""}><PlantIcon stage={i} size={26} light={i !== sIdx} color={i === sIdx ? "#231800" : undefined} />{s.plant}</span>)}</div>
              <Link to={checkTo} className="btn gold sm">{r ? "See my result" : "Start the check"}</Link>
            </div>
            <div className="lp-tile"><span className="lp-sq"><Ic n="plan" /></span><h3>A plan you make together</h3><p>Fix one thing now, grow one next, protect one for later.</p></div>
            <div className="lp-tile"><span className="lp-sq"><Ic n="book" /></span><h3>Learn at your pace</h3><p>Thirty short lessons with sources, alone or as a family.</p></div>
            <div className="lp-tile"><span className="lp-sq"><Ic n="doc" /></span><h3>Download your reports</h3><p>A certificate to celebrate, and the detail to act on.</p></div>
            <div className="lp-tile"><span className="lp-sq"><Ic n="family" /></span><h3>Bring the family along</h3><p>Invite your spouse and children to take the check too.</p></div>
          </motion.div>
        ) : (
          <motion.div key="i" className="lp-inst" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
            <div className="lp-inst-card">
              <span className="lp-eyebrow gold">Free verified listing</span>
              <h3>Be found by families ready to act.</h3>
              <p>Islamic banks, fund managers, takaful operators and waqf foundations list for free. Families who finish their plan see the halal providers that fit their next step, and contact you directly.</p>
              <button className="btn gold" onClick={() => setListing(true)}>List your institution<Ic n="arrow" s={18} /></button>
            </div>
            <div className="lp-inst-list">
              {[["badge", "Verified, not ranked", "We show your regulator licence and Shariah board. Every verified listing is shown equally."],
                ["inbox", "Families come to you", "When a family's plan calls for a cushion, an investment or takaful, they can reach you in one tap."],
                ["equal", "No paid placement", "No fees, no sponsored slots, no \"recommended\" badges. Trust is the product."],
                ["scale", "Seedline educates, you serve", "We never sell products or take deposits. Families decide; you serve them."]].map(([n, t, d]) => (
                <div key={t} className="lp-inst-row"><span className="lp-sq"><Ic n={n} /></span><span><b>{t}</b><small>{d}</small></span></div>
              ))}
            </div>
          </motion.div>
        )}
      </div></section>

      {/* income is not wealth */}
      <section className="lp-sec alt"><div className="lp-wrap lp-split">
        <motion.div className="lp-head" {...rise}>
          <span className="lp-eyebrow">The big idea</span>
          <h2>Income is not wealth.</h2>
          <p className="lp-lede">Income passes through your hands. Wealth is what stays, works and lasts. That's why your income is <b>never part of your score</b>.</p>
        </motion.div>
        <motion.div className="lp-homes" {...rise}>
          {[["Home A", 1000, 950, false], ["Home B", 700, 550, true]].map(([h, earn, spend, win]) => (
            <div key={h} className={"lp-home" + (win ? " win" : "")}>
              <div className="lp-home-h"><b>{h}</b>{win && <span className="lp-pill gold sm">Grows faster</span>}</div>
              <div className="lp-home-bars">
                <div><small>Earns</small><span className="lp-hb"><i style={{ width: `${earn / 10}%` }} /></span><em className="tnum">₦{earn}k</em></div>
                <div><small>Spends</small><span className="lp-hb sp"><i style={{ width: `${spend / 10}%` }} /></span><em className="tnum">₦{spend}k</em></div>
              </div>
              <div className="lp-home-keep"><small>Keeps each month</small><b className="tnum">₦{earn - spend}k</b></div>
            </div>
          ))}
          <p className="lp-homes-note">Home B earns 30% less and keeps three times more.</p>
        </motion.div>
      </div></section>

      {/* how it works */}
      <section className="lp-sec"><div className="lp-wrap">
        <motion.div className="lp-head center" {...rise}><span className="lp-eyebrow">How it works</span><h2>Four steps. One at a time.</h2></motion.div>
        <motion.ol className="lp-steps" {...rise}>
          {[["Check", "13 questions, ranges only. About four minutes.", "pulse"], ["See", "Your score, stage and strongest and weakest parts.", "badge"], ["Plan", "Three clear actions, picked from your answers.", "plan"], ["Grow", "Short lessons and reminders. Recheck and watch it rise.", "book"]].map(([t, d, n], i) => (
            <li key={t}><span className="lp-step-n">{i + 1}</span><span className="lp-sq"><Ic n={n} /></span><b>{t}</b><small>{d}</small></li>
          ))}
        </motion.ol>
      </div></section>

      {/* stages */}
      <section className="lp-sec alt"><div className="lp-wrap">
        <motion.div className="lp-head center" {...rise}>
          <span className="lp-eyebrow">From seed to harvest</span>
          <h2>Every family is somewhere on the line.</h2>
          <p className="lp-lede">Your score places you on one of four stages. It's a teaching guide, not a verdict, and it shows what to do next.</p>
        </motion.div>
        <motion.div className="lp-ladder" {...rise}>
          {STAGES.map((s, i) => (
            <div key={s.id} className={"lp-rung" + (r && i === sIdx ? " you" : "")} style={{ "--t": STAGE_TONE[i] }}>
              <div className="lp-rung-top"><PlantIcon stage={i} size={52} tile /><span className="tnum">{s.min}–{STAGES[i + 1] ? STAGES[i + 1].min - 1 : 100}</span></div>
              <b>{s.plant}</b><em>{s.name}</em>
              {r && i === sIdx && <span className="lp-pill gold sm">You are here</span>}
            </div>
          ))}
        </motion.div>
      </div></section>

      {/* certificate */}
      <section className="lp-sec"><div className="lp-wrap lp-split rev">
        <motion.div {...rise}><Certificate name={family} score={score} stageIdx={sIdx} /></motion.div>
        <motion.div className="lp-head" {...rise}>
          <span className="lp-eyebrow">Celebrate where you are</span>
          <h2>A result worth sharing.</h2>
          <p className="lp-lede">Get a certificate with your score, stage and strengths. Download it, keep it, or share it with family.</p>
          <ul className="lp-ticks">
            <li><Ic n="check" s={18} w={2.6} />Put your own name or your family's name on it</li>
            <li><Ic n="check" s={18} w={2.6} />Income and weak spots stay private</li>
            <li><Ic n="check" s={18} w={2.6} />A QR code invites family to take their own check</li>
          </ul>
        </motion.div>
      </div></section>

      {/* security */}
      <section className="lp-sec navy" id="security"><div className="lp-wrap">
        <motion.div className="lp-head" {...rise}>
          <span className="lp-eyebrow gold">Security and privacy</span>
          <h2>Your family's numbers stay yours.</h2>
        </motion.div>
        <motion.div className="lp-sec-grid" {...rise}>
          {[["ranges", "Ranges, never exact figures", "No account numbers, no exact salaries. The check works on ranges."],
            ["phone", "Private on your device", "Your answers are saved on your phone. Only anonymous totals leave it."],
            ["key", "Your own password", "Family accounts, protected by your password, are on the way.", "Coming soon"],
            ["shield", "No selling, no pushing", "We never sell your data or push products. Education, not advice."]].map(([n, t, d, soon]) => (
            <div key={t} className="lp-sec-card"><span className="lp-sq gold"><Ic n={n} /></span><b>{t}{soon && <em className="lp-soon">{soon}</em>}</b><small>{d}</small></div>
          ))}
        </motion.div>
        <div className="lp-sec-more">
          <Acc q="What exactly does Seedline store?" dark>
            <p>On your phone: your answers, your plan picks and your course progress. On our server: an anonymous record of your score, stage, country and which parts are strongest and weakest, with no name and no contact details, used for overall totals. If you choose email or push reminders, we store that address or device token only to send them.</p>
          </Acc>
        </div>
      </div></section>

      {/* learn */}
      <section className="lp-sec" id="learn"><div className="lp-wrap lp-split">
        <motion.div className="lp-head" {...rise}>
          <span className="lp-eyebrow">The course</span>
          <h2>Learn it as a family.</h2>
          <p className="lp-lede">Thirty short lessons in four tracks. Choose 7, 14 or 30, daily or weekly, 5 to 20 minutes. Every lesson shows its sources.</p>
          <Link to="/app/learn" className="btn ghost">Browse the lessons</Link>
        </motion.div>
        <motion.div className="lp-tracks" {...rise}>
          {[["Keep", "Know your money and keep some of it.", "#B4472A"], ["Last", "Build a cushion and tame debt.", "#2A4FA8"], ["Grow", "Put money and skills to work, halal and checked.", "#1E7A4E"], ["Pass on", "Protect what you build and hand it on well.", "#D9A93A"]].map(([t, d, c], i) => (
            <div key={t} className="lp-track" style={{ background: c, color: i === 3 ? "#231800" : "#FFFFFF" }}><small>Track {i + 1}</small><b>{t}</b><span>{d}</span></div>
          ))}
        </motion.div>
      </div></section>

      {/* faq */}
      <section className="lp-sec alt"><div className="lp-wrap lp-faq">
        <motion.div className="lp-head" {...rise}><span className="lp-eyebrow">Questions</span><h2>Good to know.</h2></motion.div>
        <div className="lp-faq-list">
          <Acc q="Is Seedline free?"><p>Yes, for families. The check, your plan, your certificate and the course are free. Institutions list for free too.</p></Acc>
          <Acc q="Is it Shariah-conscious?"><p>Every lesson is built on halal earning, careful checking and lasting benefit, with its sources shown. It's education, not a fatwa. For personal rulings, especially inheritance, speak to a qualified scholar.</p></Acc>
          <Acc q="Does Seedline give financial advice?"><p>No. Seedline teaches and helps you plan. It doesn't sell products, take deposits or recommend one provider over another. For personal decisions, speak to a licensed adviser.</p></Acc>
          <Acc q="How do institutions get listed?"><p>They request a free listing. We check their regulator licence and Shariah board before they appear. Nobody can pay to be ranked higher.</p></Acc>
          <Acc q="Who is behind Seedline?"><p>Seedline was launched by Eb'rahim Durosimi at the MSMMI Marriage Workshop 2026 in Lagos, and every lesson is reviewed before it goes live.</p></Acc>
        </div>
      </div></section>

      {/* close */}
      <section className="lp-close"><div className="lp-wrap lp-close-in">
        <div><h2>Where does your family stand today?</h2><p>Four minutes. No exact figures. A clear next step.</p></div>
        <div className="lp-ctas">
          <Link to={checkTo} className="btn gold lp-btn-lg">{checkLabel}<Ic n="arrow" s={18} /></Link>
          <button className="btn lp-btn-lg lp-btn-line" onClick={() => setListing(true)}>List your institution</button>
        </div>
      </div></section>

      <footer className="lp-foot"><div className="lp-wrap lp-foot-in">
        <div className="lp-foot-brand"><Brand /><span>Your family office, online. Launched at the MSMMI Marriage Workshop 2026, Lagos.</span></div>
        <div className="lp-foot-cols">
          <div><b>Families</b><Link to="/app/check">Take the check</Link><Link to="/app/plan">Your plan</Link><Link to="/app/learn">Lessons</Link></div>
          <div><b>Institutions</b><button onClick={() => setListing(true)}>Request a listing</button><a href="#families" onClick={() => setSide("institutions")}>How listing works</a></div>
          <div><b>Seedline</b><Link to="/how-it-works">How it works</Link><a href="#security">Security</a></div>
        </div>
        <p className="lp-disclaim">Seedline provides financial education, not financial, legal or Shariah advice. For personal decisions, speak to a licensed adviser or a qualified scholar.</p>
      </div></footer>

      <ListingModal open={listing} onClose={() => setListing(false)} />
    </div>
  );
}
