// @ts-nocheck
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Row from "./Row";
import { Brand } from "./ui";
import { PARTS } from "./content";

const STEPS = [
  { id: "check", t: "Take the family check", lede: "Thirteen simple questions about six parts of your money. It takes about four minutes. Couples can do it together on one phone.",
    dl: [["What you do", "Pick the answer closest to your home. Ranges only: no exact salaries, no account numbers."], ["What you get", "A score from 0 to 100 and your stage: Surviving, Stabilising, Building or Legacy."], ["Good to know", "Singles are welcome. Answer for yourself."]],
    mock: () => <><Row grow={.2} style={{ height: 120 }} /><span className="chip">What you keep · 3 of 13</span><b className="serif" style={{ fontSize: 22, lineHeight: 1.15 }}>At the end of a normal month, how much is left?</b>{["Nothing, we run out", "Almost nothing", "A little: about ₦5,000 to ₦10,000 of every ₦100,000", "A good amount: about ₦10,000 to ₦20,000"].map((o, i) => <div key={o} className="opt" style={{ minHeight: 44, padding: "9px 12px", fontSize: 13 }} aria-pressed={i === 2}><i className="dot" /><span>{o}</span></div>)}</> },
  { id: "read", t: "Read your line", lede: "Your result page explains itself, from the big picture down to the detail. Here's what each part means.",
    dl: [["Your score and stage", "Where your home is today. Your line grows from seed to sprout to stalk to harvest as the score rises."], ["In plain words", "Three lines: what's true right now, the next goal, and where to focus."], ["Six parts of your money", Object.values(PARTS).map(p => p.name).join(", ") + ". The weakest gets a 'Holding you back' tag."], ["Your seed story", "The same answers regrouped into what wealth needs to grow: seed, season, soil and harvest. Each card says what it's built from."], ["One more thing", "Your income range was never counted in your score. That's on purpose: income is not wealth."]],
    mock: () => <><Row grow={.49} style={{ height: 130 }} /><div className="row" style={{ alignItems: "baseline" }}><b className="serif" style={{ fontSize: 46, lineHeight: 1 }}>49</b><b>Stabilising</b></div><div className="card dark" style={{ padding: 12 }}><span className="tiny">Money stays, but one big hit could push you back into borrowing.</span></div><div className="part"><div className="nm small">Your cushion <span className="flag">Holding you back</span></div><div className="bar"><i style={{ width: "24%", background: "var(--weak)" }} /></div></div></> },
  { id: "plan", t: "Make your plan", lede: "Your plan is built from your answers. It starts with your weakest part and tells you why each action was chosen for you.",
    dl: [["Fix now (Stabilise)", "Stop the leaks and build a cushion, so one bad month doesn't throw you back."], ["Grow next (Build)", "Put money and skills to work, carefully and halal."], ["Protect for later (Document)", "Write things down and plan ahead, so what you build reaches your family."], ["Every action shows", "Why it matters, what to do this week, and how you'll know it's done."]],
    mock: () => <><b className="serif" style={{ fontSize: 22 }}>Built from your check</b><div className="because"><i style={{ background: "var(--weak)" }} /><span>Your cushion is your weakest part: about 12 days. So we start there.</span></div><span className="chip weak">Fix now · because your cushion is weak</span><div className="act" aria-pressed="true" style={{ padding: 10 }}><i className="dot" /><span><b className="small">Open a "not for spending" account</b><span className="tiny muted">This week: open it, move a fixed amount on payday.</span></span></div></> },
  { id: "learn", t: "Learn at your pace", lede: "The From Surviving to Building course turns your plan into habits. You decide how it fits your life.",
    dl: [["Choose your format", "7, 14 or 30 lessons. Daily, three times a week or weekly. 5, 10 or 20 minutes. Alone, with your spouse or the whole family."], ["Get reminded", "Push notification, email, your phone calendar or WhatsApp to yourself."], ["See the curriculum", "All 30 lessons in four tracks, each with its sources and approval shown."], ["Workshop notes", "Everything from the live session, to reread at home."]],
    mock: () => <><div className="trackrow">{["Keep", "Last", "Grow", "Pass on"].map((t, i) => <div key={t}><div className="tb"><i style={{ width: ["100%", "30%", "0", "0"][i], background: ["var(--seed)", "var(--season)", "var(--soil)", "var(--harvest)"][i] }} /></div><span>{t}</span></div>)}</div><b className="serif" style={{ fontSize: 21 }}>Why a cushion comes before investing</b><span className="tiny muted">Lesson 9 · 10 minutes · with your spouse</span><div className="sources"><b>Sources</b><span>Qur'an 12:47–49 (meaning)</span><span className="approved">✓ Approved by Eb'rahim Durosimi</span></div></> },
  { id: "tools", t: "Use the tools", lede: "Four practical tools for the decisions families actually face. Each one opens with what it does and how to use it.",
    dl: [["Cushion", "How many days or months could your home last if income stopped?"], ["Surplus", "How big is your seed: money in minus money out?"], ["Investment check", "Six questions plus a red-flag check before you send money anywhere. Gives a clear verdict."], ["7-day test", "Could your family find everything you own within seven days?"]],
    mock: () => <><b className="serif" style={{ fontSize: 21 }}>Before you send money anywhere</b><div className="iq" style={{ padding: "6px 0" }}><div className="l"><b>I</b><span className="small">Do you know exactly who runs it?</span></div><div className="yn"><button>Yes</button><button>Not sure</button><button aria-pressed="true">No</button></div></div><div className="verdict" style={{ background: "color-mix(in srgb, var(--weak) 15%, transparent)" }}><b style={{ color: "var(--weak)" }}>Walk away</b><span className="tiny">Unknown operator and a guaranteed return.</span></div></> },
  { id: "grow", t: "Recheck and watch it grow", lede: "Come back after 30 days, retake the check and compare. Your field, your history and your next plan all update.",
    dl: [["Your history", "Every check is saved on your phone, so you can see your score move over months."], ["Your next season", "A fresh plan built from your new weakest part."]],
    mock: () => <><Row grow={.72} style={{ height: 150 }} /><b className="small">Your history</b><div className="history" style={{ height: 80, marginTop: 14 }}>{[41, 46, 49, 58].map((v, i) => <div key={i} style={{ height: v + "%" }}><span>{v}</span></div>)}</div></> }
];

export default function Guide() {
  const [on, setOn] = useState("check");
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setOn(e.target.id)), { rootMargin: "-40% 0px -55% 0px" });
    STEPS.forEach(s => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    window.scrollTo(0, 0);
    return () => io.disconnect();
  }, []);
  return (
    <>
      <header className="gutter" style={{ paddingTop: "calc(18px + env(safe-area-inset-top, 0px))" }}><div className="container row" style={{ justifyContent: "space-between" }}><Brand /><Link className="btn sm" to="/app/check">Start the check</Link></div></header>
      <section className="gutter" style={{ paddingBlock: "56px 24px" }}><div className="container stack" style={{ gap: 16, maxWidth: 820 }}>
        <span className="kicker">How Seedline works</span>
        <h1 className="h-lg">From a four-minute check to a family that keeps growing.</h1>
        <p className="lede muted">Seedline walks your family through six simple steps. You can stop and come back at any point; everything saves on your phone.</p>
      </div></section>
      <section className="gutter" style={{ paddingBottom: 80 }}><div className="container guide">
        <nav className="guide-nav" aria-label="Steps">{STEPS.map((s, i) => <a key={s.id} href={"#" + s.id} className={on === s.id ? "on" : ""}><span>{i + 1}</span>{s.t}</a>)}</nav>
        <div>{STEPS.map((s, i) => (
          <article className="gstep" id={s.id} key={s.id}>
            <div className="txt">
              <span className="kicker">Step {i + 1}</span>
              <h2 className="h-md">{s.t}</h2>
              <p className="lede muted">{s.lede}</p>
              <dl>{s.dl.map(([a, b]) => <Fragment key={a}><dt>{a}</dt><dd>{b}</dd></Fragment>)}</dl>
            </div>
            <div className="mock"><div className="scr">{s.mock()}</div></div>
          </article>
        ))}
          <div className="card" style={{ marginTop: 24, alignItems: "flex-start" }}><h3 className="h-md">Ready when you are.</h3><p className="muted">Four minutes, no exact figures, and a clear next step for your home.</p><Link className="btn gold" to="/app/check">Plant your first seed</Link></div>
        </div>
      </div></section>
    </>
  );
}
