// @ts-nocheck
import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Row, { PlantIcon } from "./Row";
import { AppTop, Html, Fine } from "./ui";
import { STAGES, PARTS, SEED, CUR, Q, SCORED, compute, levelWord, BUCKETS, roadmap, TRACKS, LESSONS, SITTINGS, SLIDES, REFS, APPROVAL, ROOM, ORIGIN, money } from "./content";
import { load, save, useStore, result, saveCheck, api, subscribePush, uuid } from "./store";

const fmt = (d, o) => new Date(d).toLocaleDateString(undefined, o || { weekday: "short", day: "numeric", month: "short" });

export function partSays(k, v, a) {
  const strong = v >= 80, weak = v < 35;
  switch (k) {
    case "income": return weak ? "Your home leans on one fragile or unpredictable income. If it stops, everything stops." : strong ? "Several steady streams. Your home doesn't depend on one source." : "Some protection, but one income still carries most of the weight.";
    case "surplus": return a.left === 0 ? "You run out before month end. Creating a small gap between money in and out comes first." : weak ? "Almost nothing stays, and savings only happen if something is left." : strong ? "A healthy share stays every month, and you save on purpose." : "Something stays, but saving isn't yet automatic.";
    case "safety": return weak ? "One emergency would force you to borrow or sell. Your cushion is the first thing to build." : strong ? "You could live for months without income. That's real resilience." : "You could manage a short shock, but not a long one.";
    case "debt": return weak ? "A big share of your money is already promised away, and borrowing covers normal costs." : strong ? "Little or no debt. Your income is yours to use." : "Debt is manageable, but it's slowing you down.";
    case "productive": return a.check === 5 ? "Trusting the person instead of checking the opportunity is how many families lose savings." : weak ? "Your money is mostly sleeping, losing value as prices rise." : strong ? "Your money and skills are working for you." : "Some of your money is working. More of it could be.";
    case "legacy": return weak ? "If something happened tonight, your family could struggle to find and share what you own." : strong ? "Your home is well documented, talks about money and gives regularly." : "Some things are in place. Key documents are still missing.";
  }
  return "";
}
const RUNWAY_WORDS = { 0: "less than two weeks", 30: "about a month", 60: "one to three months", 85: "three to six months", 100: "more than six months" };

/* ============================ HOME ============================ */
export function Home() {
  const loc = useLocation();
  const r = result();
  const [history] = useStore("history", []);
  const [course] = useStore("course");
  const [picks] = useStore("picks", {});
  const animate = !!loc.state?.animate;
  const [shown, setShown] = useState(animate ? 0 : 1);
  useEffect(() => { if (animate) { const t0 = performance.now(); let raf; const f = t => { const p = Math.min(1, (t - t0) / 1400); setShown(1 - Math.pow(1 - p, 3)); if (p < 1) raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf); } }, [animate]);

  if (!r) return (
    <div className="app">
      <AppTop />
      <div className="fieldhead"><Row grow={.08} /><div className="over"><span className="stage">Your seed is waiting</span></div></div>
      <h1 className="h-md">Let's see where your family stands.</h1>
      <p className="lede muted">Thirteen questions, about four minutes. You'll get your score, your stage, and the one part of your money holding your home back.</p>
      <Link className="btn gold block" to="/app/check">Start the family check</Link>
      <Link className="btn ghost block" to="/how-it-works">How Seedline works</Link>
      <Fine>Your answers stay on your phone. Only anonymous totals are shared.</Fine>
    </div>
  );

  const a = r.last.answers, st = r.stage;
  const weakF = Object.keys(r.factors).sort((x, y) => r.factors[x] - r.factors[y])[0];
  const band = a.band != null && a.country ? CUR[a.country].bands[a.band] : null;
  const prev = history.length > 1 ? history[history.length - 2] : null;
  const done = course ? Object.keys(course.done || {}).length : 0;
  return (
    <div className="app">
      <AppTop />
      <div className="fieldhead">
        <Row grow={Math.max(.06, r.score / 100)} shade />
        <div className="over"><div><div className="score tnum">{Math.round(r.score * shown)}</div><div className="stage">{st.plant} · {st.name}</div></div>
          {prev && <span className="chip" style={{ background: "rgba(255,255,255,.92)", color: "#0A1A3F" }}>{r.score > prev.score ? `Up ${r.score - prev.score}` : r.score < prev.score ? `Down ${prev.score - r.score}` : "No change"}</span>}</div>
      </div>
      <p className="explain">This is your <strong>Seedline score</strong>: a teaching indicator from 0 to 100, not a verdict. As your score rises, your line grows from seed to sprout to stalk to harvest.</p>
      <div className="plantstrip">{STAGES.map((s, i) => <div key={s.id} className={s.id === st.id ? "on" : ""}><PlantIcon stage={i} size={44} light={s.id === st.id} /><b>{s.plant}</b><span>{s.name}</span></div>)}</div>

      <section className="card">
        <span className="kicker">What {r.score} · {st.name} means, in plain words</span>
        <div className="meaning">
          <div><b>Right now</b><p>{st.means}</p></div>
          <div><b>Next goal</b><p>{st.next}</p></div>
          <div><b>Your focus</b><p><strong>{st.focus}</strong></p></div>
        </div>
        {r.capped && <p className="small muted"><strong>Why your score stops at 34:</strong> almost nothing is left each month, so there's no seed to grow. Wealth can't build until there's a gap between money in and money out.</p>}
      </section>

      <section className="card raised">
        <span className="kicker">The six parts of your family's money</span>
        <p className="explain">Your score is made of these six parts. Each is rated from Weak to Strong based on your answers. The weakest one is tagged <strong>Holding you back</strong>: that's where your plan starts.</p>
        <div className="parts">{Object.keys(PARTS).map(k => { const lw = levelWord(r.lev[k]); return (
          <div className="part" key={k}>
            <div className="nm">{PARTS[k].name}{k === r.weakest && <span className="flag">Holding you back</span>}</div>
            <div className="lvl" style={{ color: lw.c }}>{lw.w}</div>
            <div className="bar"><i style={{ width: r.lev[k] * shown + "%", background: lw.c }} /></div>
            <p>{partSays(k, r.lev[k], a)}</p>
          </div>); })}</div>
      </section>

      <section className="card raised">
        <span className="kicker">Your seed story</span>
        <p className="explain">The six parts tell you <strong>what's wrong</strong>. The seed story tells you <strong>why it stops your wealth growing</strong>. It regroups the same answers into the four things a crop needs. Income is left out on purpose: it's the rain, helpful but not the point. What matters is the seed you keep.</p>
        <div className="seedgrid">{Object.entries(SEED).map(([k, s]) => { const v = r.factors[k], lw = levelWord(v); return (
          <div key={k} className={"seedcard" + (k === weakF ? " weak" : "")} style={{ "--c": s.color }}>
            <div className="k"><b>{k}</b><span>{s.story}</span></div>
            <h4>{s.name}</h4><p>{s.plain}</p><p className="built"><b>Built from:</b> {s.built}</p>
            <div className="st" style={{ color: lw.c }}>{lw.w}{k === weakF ? " · your weakest link" : ""}</div>
          </div>); })}</div>
        <div className="formula" aria-label="W equals S times T times P times G" style={{ fontSize: 34 }}><b>W</b><span className="op">=</span><b style={{ color: "var(--seed)" }}>S</b><span className="op">×</span><b style={{ color: "var(--season)" }}>T</b><span className="op">×</span><b style={{ color: "var(--soil)" }}>P</b><span className="op">×</span><b style={{ color: "var(--harvest)" }}>G</b></div>
        <p className="small muted">Wealth = Surplus × Time × Productive use × Good stewardship. It multiplies: if any one is near zero, the whole field stays small, however strong the others are.</p>
      </section>

      {band && <section className="card dark">
        <span className="kicker" style={{ color: "#D9A93A" }}>One more thing</span>
        <p>At the start, you told us about <strong>{band}</strong> comes in each month. <strong>That number is not in your score at all.</strong></p>
        <p style={{ color: "#C9D3E6" }}>That's deliberate. Income is money passing through your hands; wealth is what you keep, protect, put to work and pass on. A high earner who keeps nothing can score lower than a modest earner who saves.</p>
      </section>}

      {history.length > 1 && <section className="card">
        <span className="kicker">Your history</span>
        <div className="history" style={{ marginTop: 18 }}>{history.slice(-8).map((h, i) => <div key={i} style={{ height: Math.max(6, h.score) + "%" }}><span className="tnum">{h.score}</span></div>)}</div>
        <div className="row tiny muted" style={{ justifyContent: "space-between" }}><span>{fmt(history.slice(-8)[0].at, { day: "numeric", month: "short" })}</span><span>{fmt(history[history.length - 1].at, { day: "numeric", month: "short" })}</span></div>
      </section>}

      <section className="stack">
        <Link className="btn gold block" to="/app/plan">{picks.made ? "See my 30-day plan" : "Make my plan"}</Link>
        <Link className="btn ghost block" to="/app/learn">{course ? `Continue my course · ${done} done` : "Start the Surviving to Building course"}</Link>
        <Link className="btn ghost block" to="/app/check">Retake the check</Link>
      </section>
      <Fine>A teaching indicator, not financial or Shariah advice. {load("offline") ? "Your result couldn't reach the room, but it's saved on this phone." : ""}</Fine>
    </div>
  );
}

/* ============================ CHECK ============================ */
export function Check() {
  const nav = useNavigate();
  const r = result();
  const [answers, setAnswers] = useState(() => load("draft", {}) || {});
  const firstGap = Q.findIndex(q => answers[q.id] == null);
  const partial = answers.country && firstGap > 0;
  const [step, setStep] = useState(-1);
  const [busy, setBusy] = useState(false);
  const setA = (next) => { setAnswers(next); save("draft", next); };

  if (busy) return (
    <div className="app" style={{ minHeight: "70vh", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div className="fieldhead" style={{ width: "100%" }}><Row grow={.5} /></div>
      <p className="lede muted">Reading your seed, season, soil and harvest…</p>
    </div>
  );

  if (step < 0) return (
    <div className="app">
      <AppTop />
      <span className="kicker">Family check</span>
      <h1 className="h-md">Where does your home stand today?</h1>
      <p className="lede muted">Thirteen simple questions about six parts of your family's money. You'll get a score from 0 to 100, your stage, and the one part holding you back most.</p>
      <div className="row"><span className="chip">About 4 minutes</span><span className="chip">Ranges, not exact figures</span><span className="chip">Anonymous</span><span className="chip">Singles welcome</span></div>
      <section className="card"><span className="kicker">What we look at</span>
        {Object.values(PARTS).map(p => <p key={p.name}><strong>{p.name}.</strong> <span className="muted">{p.plain}</span></p>)}
      </section>
      {r && <section className="card"><span className="small muted">Your last check · {fmt(r.last.at, { day: "numeric", month: "short", year: "numeric" })}</span><div className="row" style={{ justifyContent: "space-between" }}><b className="h-md tnum">{r.score} · {r.stage.name}</b><Link className="btn sm ghost" to="/app">See result</Link></div></section>}
      <button className="btn gold block" onClick={() => { if (partial) setStep(firstGap); else { setA({}); setStep(0); } }}>{partial ? "Continue my check" : r ? "Take it again" : "Start my check"}</button>
    </div>
  );

  const q = Q[step];
  const opts = q.opts === "bands" ? CUR[answers.country || "NG"].bands.map((l, i) => ({ l, v: i })) : q.opts;
  const idx = Q.slice(0, step + 1).filter(x => !x.setup).length;
  const pct = Math.round(step / Q.length * 100);
  const cur = answers[q.id];
  const advance = (next) => {
    if (step < Q.length - 1) { setStep(step + 1); window.scrollTo(0, 0); }
    else { setBusy(true); saveCheck(next); setTimeout(() => nav("/app", { state: { animate: true } }), 1600); }
  };
  return (
    <div className="app">
      <AppTop />
      <div className="progress"><button className="linkbtn" onClick={() => setStep(step - 1)}>← Back</button><div className="track" role="progressbar" aria-label="Progress" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: pct + "%" }} /></div></div>
      <section className="stack" key={q.id} style={{ gap: 16, animation: "rise .5s cubic-bezier(.16,1,.3,1) both" }}>
        <span className="chip">{q.setup ? q.tag : `${PARTS[q.part].name} · ${idx} of ${SCORED}`}</span>
        <h2 className="qtitle" id="qh">{money(q.q, answers.country)}</h2>
        {q.help && <p className="muted">{money(q.help, answers.country)}</p>}
        <div className="opts" role="group" aria-labelledby="qh">
          {opts.map((o, i) => {
            const on = q.multi ? (cur || []).includes(o.v) : cur === o.v;
            return <button key={i} className={"opt" + (q.multi ? " multi" : "")} aria-pressed={on} onClick={() => {
              if (q.multi) { const set = new Set(cur || []); set.has(o.v) ? set.delete(o.v) : set.add(o.v); setA({ ...answers, [q.id]: [...set] }); }
              else { const next = { ...answers, [q.id]: o.v }; if (q.id === "country") delete next.band; setA(next); setTimeout(() => advance(next), 220); }
            }}><i className="dot" /><span>{o.l}{o.s && <small>{money(o.s, answers.country)}</small>}</span></button>;
          })}
        </div>
        {q.multi && <button className="btn block" onClick={() => { const next = { ...answers, docs: answers.docs || [] }; setA(next); advance(next); }}>{(cur || []).length ? "See my result" : "None of these yet · see my result"}</button>}
      </section>
    </div>
  );
}

/* ============================ PLAN ============================ */
export function Plan() {
  const r = result();
  const [picks, setPicks] = useStore("picks", {});
  const [copied, setCopied] = useState(false);
  if (!r) return (<div className="app"><AppTop /><section className="card"><span className="kicker">Your plan</span><h2 className="h-md">Take the check first</h2><p className="muted">Your plan is built from your answers, so it starts with what's weakest for your home.</p><Link className="btn gold" to="/app/check">Take the check</Link></section></div>);
  const a = r.last.answers;
  const rm = roadmap(r, a);
  const p = { ...picks }; BUCKETS.forEach(b => { if (p[b.id] == null || p[b.id] >= rm[b.id].length) p[b.id] = 0; });
  const weakL = levelWord(r.lev[r.weakest]);
  const runway = RUNWAY_WORDS[a.runway];
  const reason = (b) => { const part = rm[b.id][0]?.part; if (!part) return ""; const lw = levelWord(r.lev[part]); return `because ${PARTS[part].name.toLowerCase()} is ${lw.w.toLowerCase()}`; };
  const start = new Date(picks.made || Date.now()), end = new Date(start.getTime() + 30 * 864e5);
  const lines = BUCKETS.map(b => `${b.name}: ${rm[b.id][p[b.id]].t}`);
  const text = `My 30-day family wealth plan (Seedline)\nScore: ${r.score}/100 · ${r.stage.name}\n${fmt(start, { day: "numeric", month: "short" })} to ${fmt(end, { day: "numeric", month: "short" })}\n\n${lines.join("\n")}\n\nRecheck on ${fmt(end, { day: "numeric", month: "short" })}.\n${ORIGIN}/app`;
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setCopied(false); } };
  return (
    <div className="app">
      <AppTop />
      <span className="kicker">Your family roadmap</span>
      <h1 className="h-md">Built from your check</h1>
      <div className="stack" style={{ gap: 8 }}>
        <div className="because"><i style={{ background: "var(--weak)" }} /><span>Your weakest part is <strong>{PARTS[r.weakest].name}</strong> ({weakL.w.toLowerCase()}). {partSays(r.weakest, r.lev[r.weakest], a)}</span></div>
        {runway && <div className="because"><i style={{ background: "var(--season)" }} /><span>If income stopped, your home could last <strong>{runway}</strong>.</span></div>}
        <div className="because"><i style={{ background: "var(--gold)" }} /><span>You're <strong>{r.stage.name}</strong> at {r.score}. {r.stage.focus}</span></div>
      </div>
      <p className="explain">Pick one action in each group below. They're ordered by what's weakest for you, so the first one is usually the best place to start. Each one says why it matters, what to do this week, and how you'll know it's done.</p>
      {BUCKETS.map(b => (
        <section className="card raised" key={b.id}>
          <div className="stack" style={{ gap: 4 }}>
            <h2 className="h-md">{b.name} <span className="small muted" style={{ fontFamily: "var(--body)" }}>· {b.org}</span></h2>
            <p className="muted small"><strong>{b.verb[0].toUpperCase() + b.verb.slice(1)}.</strong> {b.sub}</p>
            <span className={"chip" + (b.id === "fix" && r.lev[rm[b.id][0]?.part] < 35 ? " weak" : "")} style={{ marginTop: 4 }}>{b.name} · {reason(b)}</span>
          </div>
          {rm[b.id].map((x, i) => (
            <button className="act" key={i} aria-pressed={p[b.id] === i} onClick={() => setPicks({ ...p, made: picks.made, [b.id]: i })}>
              <i className="dot" /><span>
                {i === 0 && <span className="chip" style={{ fontSize: 11 }}>Best place to start</span>}
                <b>{x.t}</b>
                <span className="tiny muted">Linked to: {PARTS[x.part].name} ({levelWord(r.lev[x.part]).w.toLowerCase()})</span>
                <dl><dt>Why</dt><dd>{x.why}</dd><dt>This week</dt><dd>{x.week}</dd><dt>Done when</dt><dd>{x.done}</dd></dl>
              </span>
            </button>
          ))}
        </section>
      ))}
      {!picks.made ? <button className="btn gold block" onClick={() => setPicks({ ...p, made: Date.now() })}>Make my 30-day plan</button> : (
        <section className="planout">
          <span className="small" style={{ color: "#C9D3E6", fontWeight: 700 }}>My 30-day family wealth plan</span>
          <h2 className="h-md">{r.score} · {r.stage.name}</h2>
          <span className="small tnum" style={{ color: "#C9D3E6" }}>{fmt(start, { day: "numeric", month: "short" })} → recheck on {fmt(end, { day: "numeric", month: "short" })}</span>
          <ol>{BUCKETS.map(b => <li key={b.id}><b>{b.name}</b><span>{rm[b.id][p[b.id]].t}</span></li>)}</ol>
          <div className="row"><button className="btn sm" onClick={copy}>{copied ? "Copied" : "Copy plan"}</button><a className="btn sm ghost" target="_blank" rel="noopener" href={"https://wa.me/?text=" + encodeURIComponent(text)}>Send on WhatsApp</a></div>
        </section>
      )}
      {picks.made && <section className="card"><span className="kicker">Next step</span><h3 className="h-sm">Turn your plan into habits</h3><p className="muted">The Surviving to Building course gives you short lessons at your own pace, with reminders.</p><Link className="btn gold" to="/app/learn">Set up my course</Link></section>}
    </div>
  );
}

/* ============================ LEARN ============================ */
export function Learn() {
  const [tab, setTab] = useState(() => load("learnTab", "course"));
  const go = t => { setTab(t); save("learnTab", t); };
  return (
    <div className="app">
      <AppTop />
      <span className="kicker">Learn</span>
      <h1 className="h-md">From Surviving to Building</h1>
      <div className="segtabs" role="tablist">
        {[["course", "My course"], ["curriculum", "Curriculum"], ["workshop", "Workshop notes"]].map(([id, l]) => <button key={id} role="tab" aria-pressed={tab === id} onClick={() => go(id)}>{l}</button>)}
      </div>
      {tab === "course" && <Course />}
      {tab === "curriculum" && <Curriculum />}
      {tab === "workshop" && <Workshop />}
    </div>
  );
}
function courseLessons(c) { return LESSONS.filter(l => c.length === 30 || (c.length === 14 ? l.c <= 14 : l.c <= 7)); }
function lessonDate(c, i) {
  const d = new Date(c.startedAt); d.setHours(0, 0, 0, 0);
  if (c.pace === "daily") return new Date(d.getTime() + i * 864e5);
  if (c.pace === "weekly") return new Date(d.getTime() + i * 7 * 864e5);
  let k = -1; while (true) { if ([1, 3, 5].includes(d.getDay())) { k++; if (k === i) return new Date(d); } d.setDate(d.getDate() + 1); }
}
const pad2 = n => String(n).padStart(2, "0");
const icsLocal = d => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;
const rrule = (c, n) => c.pace === "daily" ? `FREQ=DAILY;COUNT=${n}` : c.pace === "weekly" ? `FREQ=WEEKLY;COUNT=${n}` : `FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=${n}`;
function firstReminder(c) { const [h, m] = (c.time || "20:00").split(":").map(Number); const d = lessonDate(c, 0); d.setHours(h, m, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 1); return d; }

function Course() {
  const [course, setCourse] = useStore("course");
  const [edit, setEdit] = useState(false);
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(null);
  if (!course || edit) return <CourseSetup initial={course} onCancel={course ? () => setEdit(false) : null} onDone={(c, n) => { setCourse(c); setNote(n); setEdit(false); }} />;
  const c = course, ls = courseLessons(c), done = c.done || {};
  const doneCount = ls.filter(l => done[l.n]).length, next = ls.find(l => !done[l.n]);
  const pct = Math.round(doneCount / ls.length * 100);
  const paceW = { daily: "every day", "3x": "Mon, Wed and Fri", weekly: "once a week" }[c.pace];
  const whoW = { alone: "just you", spouse: "you and your spouse", family: "the whole family" }[c.who];
  const toggle = n => { const d = { ...(c.done || {}) }; d[n] ? delete d[n] : d[n] = Date.now(); setCourse({ ...c, done: d }); };
  const gcal = () => { const n = ls.length, d = firstReminder(c), e = new Date(d.getTime() + c.minutes * 60000); return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent("Seedline lesson") + "&dates=" + icsLocal(d) + "/" + icsLocal(e) + "&details=" + encodeURIComponent("Your next lesson: " + ORIGIN + "/app/learn") + "&recur=" + encodeURIComponent("RRULE:" + rrule(c, n)) + (c.tz ? "&ctz=" + encodeURIComponent(c.tz) : ""); };
  const ics = () => { const d = firstReminder(c), e = new Date(d.getTime() + c.minutes * 60000); const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Seedline//Course//EN", "BEGIN:VEVENT", "UID:" + uuid() + "@seedline", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z", "DTSTART:" + icsLocal(d), "DTEND:" + icsLocal(e), "RRULE:" + rrule(c, ls.length), "SUMMARY:Seedline lesson", "DESCRIPTION:Your next lesson: " + ORIGIN + "/app/learn", "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", "DESCRIPTION:Seedline lesson", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" })); a.download = "seedline-course.ics"; document.body.appendChild(a); a.click(); a.remove(); };
  let lastTrack = null;
  const items = [];
  ls.forEach((l, i) => {
    if (l.tr !== lastTrack) {
      if (lastTrack && c.who !== "alone") items.push(<Sitting key={"s" + lastTrack} tr={lastTrack} />);
      const t = TRACKS[l.tr];
      items.push(<div key={"t" + l.tr}><div className="trackh"><i style={{ background: t.color }} /><b>{t.name}: {t.story}</b></div><p className="small muted">{t.sub}</p></div>);
      lastTrack = l.tr;
    }
    const isNext = next && l.n === next.n, isDone = !!done[l.n], isOpen = open === l.n || (open == null && isNext);
    items.push(
      <div key={l.n} className={"lesson" + (isDone ? " done" : "") + (isNext ? " next" : "")}>
        <button aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : l.n)}><span className="tick">{isDone ? "✓" : i + 1}</span><span><b>{l.t}</b><br /><span className="meta">{fmt(lessonDate(c, i))}{isNext ? " · up next" : ""}</span></span><span aria-hidden="true">{isOpen ? "–" : "+"}</span></button>
        {isOpen && <div className="body">
          <p>{l.idea}</p>
          <div className="doit"><h5>Do this</h5><p>{l.do}</p></div>
          {c.minutes >= 10 && c.who !== "alone" && <div><h5>{c.who === "family" ? "With your family" : "With your spouse"}</h5><p className="muted">{l.fam}</p></div>}
          {c.minutes >= 20 && <div><h5>Going deeper</h5><p className="muted">{l.deep}</p></div>}
          <div className="sources"><b>Sources</b><ul>{(REFS[l.n] || []).map(s => <li key={s}>{s}</li>)}</ul><span className="approved">✓ Reviewed and approved by {APPROVAL.by}</span></div>
          <button className={"btn sm" + (isDone ? " ghost" : "")} onClick={() => toggle(l.n)}>{isDone ? "Mark as not done" : "Mark lesson as done"}</button>
        </div>}
      </div>);
  });
  if (lastTrack && c.who !== "alone") items.push(<Sitting key={"s" + lastTrack} tr={lastTrack} />);
  return (
    <>
      <section className="card raised">
        <div className="row" style={{ flexWrap: "nowrap", gap: 16 }}>
          <div style={{ position: "relative", width: 86, height: 86, flex: "none" }}>
            <svg viewBox="0 0 96 96" width="86" height="86" aria-hidden="true"><circle cx="48" cy="48" r="40" fill="none" stroke="var(--paper-3)" strokeWidth="10" /><circle cx="48" cy="48" r="40" fill="none" stroke="var(--gold)" strokeWidth="10" strokeLinecap="round" strokeDasharray={251.3} strokeDashoffset={251.3 * (1 - pct / 100)} transform="rotate(-90 48 48)" /></svg>
            <b className="serif tnum" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 22 }}>{pct}%</b>
          </div>
          <div className="stack" style={{ gap: 4, minWidth: 0 }}>
            <b>{doneCount} of {ls.length} lessons done</b>
            <span className="small muted">{c.minutes} minutes, {paceW}, for {whoW}. Reminders at {c.time}{c.remind?.length ? " by " + c.remind.map(x => ({ push: "push", email: "email", calendar: "calendar", whatsapp: "WhatsApp" })[x]).join(", ") : ""}.</span>
            <button className="btn sm ghost" style={{ alignSelf: "flex-start" }} onClick={() => setEdit(true)}>Change settings</button>
          </div>
        </div>
        {note && <p className="small muted">{note}</p>}
        {c.remind?.includes("calendar") && <div className="row"><button className="btn sm" onClick={ics}>Add to phone calendar</button><a className="btn sm ghost" target="_blank" rel="noopener" href={gcal()}>Google Calendar</a></div>}
        {c.remind?.includes("whatsapp") && <a className="btn sm ghost" style={{ alignSelf: "flex-start" }} target="_blank" rel="noopener" href={"https://wa.me/?text=" + encodeURIComponent(`My Seedline course: ${ls.length} lessons, ${paceW} at ${c.time}. ${ORIGIN}/app/learn`)}>WhatsApp the schedule to myself</a>}
      </section>
      <div className="trackrow">{Object.entries(TRACKS).map(([k, t]) => { const tl = ls.filter(l => l.tr === k), dn = tl.filter(l => done[l.n]).length; return <div key={k}><div className="tb"><i style={{ width: (tl.length ? dn / tl.length * 100 : 0) + "%", background: t.color }} /></div><span>{t.name}</span></div>; })}</div>
      {items}
      <section className="card"><span className="kicker">Measure your progress</span><p className="muted">Retake the family check at the end of your course and watch your line grow.</p><Link className="btn ghost" to="/app/check">Retake the check</Link></section>
    </>
  );
}
function Sitting({ tr }) {
  const s = SITTINGS.find(x => x.after === tr);
  return <div className="sitting"><b>{s.t}</b><span className="small muted">20 minutes together. Talk through these four questions:</span><ol>{s.qs.map(q => <li key={q}>{q}</li>)}</ol></div>;
}
function CourseSetup({ initial, onCancel, onDone }) {
  const [st, setSt] = useState(() => ({ length: 14, pace: "daily", minutes: 10, who: "spouse", remind: ["push"], time: "20:00", email: "", ...(initial || {}) }));
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const pushOK = "serviceWorker" in navigator && "PushManager" in window;
  const Seg = ({ k, items }) => <div className="seg" style={{ "--n": items.length }}>{items.map(([v, b, s]) => <button key={v} aria-pressed={st[k] === v} onClick={() => setSt({ ...st, [k]: v })}><b>{b}</b>{s && <small>{s}</small>}</button>)}</div>;
  const toggleR = v => { const set = new Set(st.remind); set.has(v) ? set.delete(v) : set.add(v); setSt({ ...st, remind: [...set] }); };
  const start = async () => {
    if (st.remind.includes("email") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(st.email || "")) { setMsg("Add a complete email address, or untick Email."); return; }
    setBusy(true);
    const c = { ...(initial || {}), ...st, startedAt: initial?.startedAt || Date.now(), done: initial?.done || {}, tz: Intl.DateTimeFormat().resolvedOptions().timeZone || null };
    let pushSub = null, note = "";
    if (st.remind.includes("push")) { try { pushSub = await subscribePush(); note = "Push reminders are on for this phone."; } catch (e) { note = e.message || "Push isn't available here."; } }
    if (pushSub || st.remind.includes("email")) {
      try { await api("subscribers", { check_id: load("last")?.checkId || null, email: st.remind.includes("email") ? st.email : null, push_sub: pushSub, timezone: c.tz, prefs: { length: c.length, pace: c.pace, minutes: c.minutes, who: c.who, time: c.time, startedAt: new Date(c.startedAt).toISOString(), remind: c.remind, room: ROOM } }); c.subscribed = true; if (st.remind.includes("email")) note += " You're signed up for email lessons."; }
      catch { note += " We couldn't save your reminder settings right now. Your course still works on this phone."; }
    }
    setBusy(false); onDone(c, note.trim());
  };
  return (
    <>
      <p className="muted">Thirty short lessons in four tracks: Keep, Last, Grow and Pass on. Set it up to fit your life. You can change this any time.</p>
      <section className="card raised" style={{ gap: 18 }}>
        <div className="stack"><span className="field-label">How many lessons?</span><Seg k="length" items={[[7, "7", "Quick start"], [14, "14", "Core"], [30, "30", "Complete"]]} /></div>
        <div className="stack"><span className="field-label">How often?</span><Seg k="pace" items={[["daily", "Daily"], ["3x", "3× a week", "Mon, Wed, Fri"], ["weekly", "Weekly"]]} /></div>
        <div className="stack"><span className="field-label">How long each time?</span><Seg k="minutes" items={[[5, "5 min", "The essentials"], [10, "10 min", "+ family task"], [20, "20 min", "+ going deeper"]]} /></div>
        <div className="stack"><span className="field-label">Who's learning?</span><Seg k="who" items={[["alone", "Just me"], ["spouse", "With my spouse"], ["family", "Whole family", "With children"]]} /></div>
      </section>
      <section className="card raised" style={{ gap: 14 }}>
        <span className="field-label">How should we remind you?</span>
        <p className="small muted" style={{ marginTop: -8 }}>Pick any, even more than one.</p>
        {[["push", "Push notification on this phone", pushOK ? "Android and computers. On iPhone, first tap Share, then Add to Home Screen, and open Seedline from there." : "Not available in this browser. On iPhone, add Seedline to your Home Screen first."],
          ["email", "Email", "Each lesson in your inbox."],
          ["calendar", "Phone calendar", "A repeating reminder in your own calendar app."],
          ["whatsapp", "WhatsApp to myself", "Send yourself the schedule and link."]].map(([v, l, s]) => (
          <button key={v} className="opt multi" aria-pressed={st.remind.includes(v)} onClick={() => toggleR(v)}><i className="dot" /><span>{l}<small>{s}</small></span></button>
        ))}
        {st.remind.includes("email") && <div className="stack"><label className="field-label" htmlFor="cEmail">Your email</label><input id="cEmail" type="email" autoComplete="email" placeholder="you@example.com" value={st.email} onChange={e => setSt({ ...st, email: e.target.value.trim() })} /></div>}
        <div className="stack"><label className="field-label" htmlFor="cTime">Reminder time</label><input id="cTime" type="time" value={st.time} onChange={e => setSt({ ...st, time: e.target.value || "20:00" })} /></div>
      </section>
      {msg && <p className="small" style={{ color: "var(--weak)", fontWeight: 700 }} role="status">{msg}</p>}
      <button className="btn gold block" disabled={busy} onClick={start}>{busy ? "Setting up…" : initial ? "Save my settings" : "Start my course"}</button>
      {onCancel && <button className="btn ghost block" onClick={onCancel}>Cancel</button>}
    </>
  );
}
function Curriculum() {
  return (
    <>
      <section className="card dark">
        <span className="kicker" style={{ color: "#D9A93A" }}>About this curriculum</span>
        <p>30 lessons in four tracks, written for Nigerian Muslim families at home and abroad. Every lesson lists its sources.</p>
        <p style={{ color: "#D9A93A", fontWeight: 700 }}>✓ Reviewed and approved by {APPROVAL.by}, {APPROVAL.date}</p>
        <p className="small" style={{ color: "#C9D3E6" }}>{APPROVAL.note}</p>
      </section>
      {Object.entries(TRACKS).map(([k, t], ti) => (
        <section className="stack" key={k}>
          <div className="trackh"><i style={{ background: t.color }} /><b>Track {ti + 1} · {t.name}: {t.story}</b></div>
          <p className="small muted">{t.sub}</p>
          {LESSONS.filter(l => l.tr === k).map(l => (
            <details className="lesson" key={l.n}>
              <summary style={{ listStyle: "none", cursor: "pointer", display: "grid", gridTemplateColumns: "30px 1fr auto", gap: 12, alignItems: "center", padding: "13px 15px" }}>
                <span className="tick tnum">{l.n}</span><span><b>{l.t}</b><br /><span className="meta">{l.c <= 7 ? "In 7, 14 and 30-lesson courses" : l.c <= 14 ? "In 14 and 30-lesson courses" : "In the 30-lesson course"}</span></span><span aria-hidden="true">+</span>
              </summary>
              <div className="body">
                <p>{l.idea}</p>
                <div className="doit"><h5>Do this</h5><p>{l.do}</p></div>
                <div className="sources"><b>Sources</b><ul>{(REFS[l.n] || []).map(s => <li key={s}>{s}</li>)}</ul></div>
              </div>
            </details>
          ))}
        </section>
      ))}
    </>
  );
}
function Workshop() {
  return (
    <>
      <p className="muted">Everything from the live session at the MSMMI Marriage Workshop, to read again with your family.</p>
      {SLIDES.filter(s => !s.presenter).map(s => (
        <article className="slidecard" key={s.id}><span className="kick">{s.kick}</span><h2>{s.title}</h2><Html html={s.body()} /></article>
      ))}
    </>
  );
}

/* ============================ TOOLS ============================ */
const INVEST = [
  ["I", "Integrity", "Do you know exactly who runs it, and could you find them yourself, not just through the person who invited you?"],
  ["N", "Need", "Does it fit a goal your family already has, not just 'making money fast'?"],
  ["V", "Verify", "Have you checked yourself that it is registered with the regulator where you live (for example SEC Nigeria)?"],
  ["E", "Exposure", "Could your family cope if you lost every naira you put in?"],
  ["S", "Shariah", "Is the business halal, and does profit come from real activity, not fixed interest? Has a credible scholar or Shariah board approved it?"],
  ["T", "Terms", "Do you know the fees, how long your money is locked, and exactly how to get it out?"]
];
const LEGACY_ITEMS = ["A written list of everything we own", "A written list of everything we owe", "A trusted person knows where our documents are kept", "Next of kin is current on bank and pension accounts", "Beneficiaries named on takaful or insurance", "A wasiyyah (Islamic will) is written", "A guardian for our children is named", "Key contacts are written down: employer HR, bank, pension, lawyer"];
const TOOLS = {
  cushion: { name: "Cushion", what: "Works out how long your home could pay for the basics if income stopped today.", how: "Enter the savings you can reach quickly and your essential monthly spending.", when: "Before any investing, and whenever your spending changes." },
  surplus: { name: "Surplus", what: "Shows your seed: what's left each month after everything that goes out.", how: "Enter money in and money out for a normal month, including family support and debt payments.", when: "At the start, and each month at your money meeting." },
  invest: { name: "Investment check", what: "Checks any investment offer against six questions plus a red-flag check, then gives a clear verdict.", how: "Answer honestly for one offer at a time. 'Not sure' is a valid answer.", when: "Every time someone brings you an opportunity, before any money moves." },
  seven: { name: "7-day test", what: "Shows whether your family could find everything you own within seven days if something happened to you.", how: "Tick what is already true. Your ticks save on this phone.", when: "Now, then once a year or after any big life change." }
};
export function Tools() {
  const [t, setT] = useState("cushion");
  const r = result();
  const sym = CUR[r?.last.answers.country || "NG"].sym;
  const meta = TOOLS[t];
  return (
    <div className="app">
      <AppTop />
      <span className="kicker">Family money tools</span>
      <h1 className="h-md">Work it out together</h1>
      <p className="muted">Four practical tools for decisions families actually face. Pick one; each explains what it does first.</p>
      <div className="toolnav" role="tablist">{Object.entries(TOOLS).map(([k, v]) => <button key={k} role="tab" aria-pressed={t === k} onClick={() => setT(k)}>{v.name}</button>)}</div>
      <div className="toolhead"><b>What it does</b><span>{meta.what}</span><b>How to use it</b><span>{meta.how}</span><b>When to use it</b><span>{meta.when}</span></div>
      <section className="card raised">
        {t === "cushion" && <Cushion sym={sym} />}
        {t === "surplus" && <Surplus sym={sym} />}
        {t === "invest" && <Invest />}
        {t === "seven" && <Seven />}
      </section>
    </div>
  );
}
function Cushion({ sym }) {
  const [s, setS] = useState(""), [e, setE] = useState("");
  const S = +s, E = +e, months = E > 0 ? S / E : null;
  const lw = months == null ? null : months < 1 ? levelWord(10) : months < 3 ? levelWord(45) : months < 6 ? levelWord(70) : levelWord(90);
  return (<>
    <h2 className="h-sm">How long could your home last?</h2>
    <div className="stack"><label className="field-label" htmlFor="cs">Savings you can reach quickly ({sym})</label><input id="cs" type="number" inputMode="decimal" min="0" placeholder="250000" value={s} onChange={x => setS(x.target.value)} /></div>
    <div className="stack"><label className="field-label" htmlFor="ce">Essential spending each month ({sym})</label><input id="ce" type="number" inputMode="decimal" min="0" placeholder="610000" value={e} onChange={x => setE(x.target.value)} /></div>
    {months == null ? <p className="small muted">Example: the Bakare family has {sym}250,000 saved and spends {sym}610,000 a month on basics, so they could last about 12 days.</p> : <>
      <div className="bigout tnum" style={{ color: lw.c }}>{months < 1 ? Math.round(months * 30) + " days" : months.toFixed(1) + " months"}</div>
      <p className="muted">{months < 1 ? `Less than a month. One emergency would force you to borrow. Your first target is one full month of basics: ${sym}${Math.round(E).toLocaleString()}.` : months < 3 ? `A start. Your next target is three months: ${sym}${Math.round(E * 3).toLocaleString()}.` : months < 6 ? `Good resilience. Six months, ${sym}${Math.round(E * 6).toLocaleString()}, makes your home very hard to knock down.` : "Strong. Your cushion lets your other money grow without being dug up."}</p></>}
  </>);
}
function Surplus({ sym }) {
  const [i, setI] = useState(""), [o, setO] = useState("");
  const I = +i, O = +o, s = I - O, pct = I > 0 ? Math.round(s / I * 100) : null;
  const lw = pct == null ? null : pct <= 0 ? levelWord(0) : pct < 10 ? levelWord(45) : pct < 20 ? levelWord(70) : levelWord(90);
  return (<>
    <h2 className="h-sm">Find your seed</h2>
    <div className="stack"><label className="field-label" htmlFor="si">Money in each month ({sym})</label><input id="si" type="number" inputMode="decimal" min="0" placeholder="850000" value={i} onChange={x => setI(x.target.value)} /></div>
    <div className="stack"><label className="field-label" htmlFor="so">Money out each month ({sym})</label><input id="so" type="number" inputMode="decimal" min="0" placeholder="750000" value={o} onChange={x => setO(x.target.value)} /></div>
    {pct == null ? <p className="small muted">Surplus = money in − money out. It's what you have to build with.</p> : <>
      <div className="bigout tnum" style={{ color: lw.c }}>{s < 0 ? "−" : ""}{sym}{Math.abs(Math.round(s)).toLocaleString()}</div>
      <p className="small tnum" style={{ fontWeight: 700 }}>{pct}% of what comes in</p>
      <p className="muted">{pct <= 0 ? "More goes out than comes in. Before anything else, find one cut and one way to earn a little more. For many homes, earning more is the real fix." : pct < 10 ? "A small seed. Protect it: move it out on payday before it disappears, and aim for 1 in every 10." : pct < 20 ? "A healthy seed. Make sure it moves automatically, and build your cushion with it first." : "A strong seed. Once your cushion is ready, this is what can grow into real wealth."}</p></>}
  </>);
}
function Invest() {
  const [ans, setAns] = useState({});
  const vals = INVEST.map(x => ans[x[0]]);
  const complete = vals.every(Boolean) && ans.flag;
  let verdict = null;
  if (complete) {
    const walk = ans.flag === "yes" || ans.I === "no" || ans.V === "no" || ans.S === "no" || ans.E === "no";
    const pause = vals.includes("unsure") || vals.includes("no") || ans.flag === "unsure";
    verdict = walk ? ["Walk away", "One or more serious warning signs. Don't send money.", "var(--weak)"] : pause ? ["Pause and verify", "There are gaps you can't answer yet. Get answers in writing, check the regulator yourself, and ask a scholar before deciding.", "var(--stabilise)"] : ["Passes the basic checks", "A good start, not a guarantee. Start small, and only put in what your family could afford to lose. This is not financial advice.", "var(--harvest)"];
  }
  const YN = ({ k }) => <div className="yn">{["yes", "unsure", "no"].map(v => <button key={v} aria-pressed={ans[k] === v} onClick={() => setAns({ ...ans, [k]: v })}>{v === "unsure" ? "Not sure" : v[0].toUpperCase() + v.slice(1)}</button>)}</div>;
  return (<>
    <h2 className="h-sm">Before you send money anywhere</h2>
    {INVEST.map(([k, n, q]) => <div className="iq" key={k}><div className="l"><b>{k}</b><span><strong>{n}.</strong> {q}</span></div><YN k={k} /></div>)}
    <div className="iq"><div className="l"><b style={{ color: "var(--weak)" }}>!</b><span><strong>Red flag.</strong> Does it promise guaranteed or very high returns, or pressure you to decide fast or bring in others?</span></div><YN k="flag" /></div>
    {verdict ? <div className="verdict" style={{ background: `color-mix(in srgb, ${verdict[2]} 16%, transparent)` }}><b style={{ color: verdict[2] }}>{verdict[0]}</b><p className="small">{verdict[1]}</p></div> : <p className="small muted">Answer all seven to see a verdict.</p>}
    <p className="small muted">Three separate questions: May I? (is it halal) · Should I? (does it suit my family) · Can I trust it? (is it credible). Something can pass one and fail another.</p>
    <button className="btn sm ghost" style={{ alignSelf: "flex-start" }} onClick={() => setAns({})}>Check another offer</button>
  </>);
}
function Seven() {
  const [lg, setLg] = useStore("legacy", {});
  const n = LEGACY_ITEMS.filter((_, i) => lg[i]).length, lw = levelWord(n / LEGACY_ITEMS.length * 100);
  return (<>
    <h2 className="h-sm">Could your family find everything within 7 days?</h2>
    <div>{LEGACY_ITEMS.map((t, i) => <button key={i} className="checkrow" aria-pressed={!!lg[i]} onClick={() => setLg({ ...lg, [i]: !lg[i] })}><span className="box">{lg[i] ? "✓" : ""}</span><span>{t}</span></button>)}</div>
    <div className="row" style={{ justifyContent: "space-between" }}><span className="bigout tnum" style={{ color: lw.c }}>{n} of {LEGACY_ITEMS.length}</span><b style={{ color: lw.c }}>{n === LEGACY_ITEMS.length ? "Ready" : n >= 5 ? "Nearly there" : "Not ready yet"}</b></div>
    <p className="muted">{n === LEGACY_ITEMS.length ? "Your family would know where to start. Review it once a year." : "Start with the first unticked item. Each one saves your family weeks of searching and stress."}</p>
  </>);
}
