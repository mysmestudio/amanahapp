// @ts-nocheck
import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PlantIcon, STAGE_TONE } from "./Row";
import { Ic } from "./site";
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

/* ============================ CHECK ============================ */
/* Smart default: suggest a country from the phone's time zone (scan and adjust, not a blank choice). */
const SUGGEST_COUNTRY = (() => { try { const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; return tz.startsWith("Africa/Lagos") ? "NG" : tz === "Europe/London" ? "UK" : tz.startsWith("America/") ? "US" : null; } catch { return null; } })();
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
    <div className="app ck-busy">
      <div className="ck-grow">{[0, 1, 2, 3].map(i => <span key={i} style={{ animationDelay: i * .3 + "s" }}><PlantIcon stage={i} size={64} tile /></span>)}</div>
      <h2 className="h-md">Growing your result…</h2>
      <p className="muted">Reading your seed, season, soil and harvest.</p>
    </div>
  );

  if (step < 0) return (
    <div className="app">
      <AppTop />
      <div className="ck-hero">
        <span className="rs-eyebrow">Family wealth check</span>
        <h1>Where does your home stand today?</h1>
        <p>Thirteen quick questions about six parts of your family's money.</p>
        <ol className="ck-journey" aria-label="Your Seedline journey"><li className="done"><i><Ic n="check" s={12} w={3} /></i>Opened Seedline</li><li className="now"><i>2</i>Family check</li><li><i>3</i>Your plan</li><li><i>4</i>Grow</li></ol>
        <div className="ck-pills"><span><Ic n="pulse" s={15} />4 minutes</span><span><Ic n="ranges" s={15} />Ranges only</span><span><Ic n="lock" s={15} />Private</span></div>
        <button className="btn gold block lg" onClick={() => { if (partial) setStep(firstGap); else { setA({}); setStep(0); } }}>{partial ? "Continue my check" : r ? "Take it again" : "Start my check"}<Ic n="arrow" s={18} /></button>
      </div>
      <div className="ck-parts">{Object.entries(PARTS).map(([k, p], i) => <div key={k} style={{ "--t": ["#13306B", "#1E7A4E", "#2A4FA8", "#B4472A", "#0F6E6E", "#B98A1F"][i] }}><i>{i + 1}</i><span><b>{p.name}</b><small>{p.plain}</small></span></div>)}</div>
      {r && <Link to="/app" className="rs-door"><span className="rs-door-ic"><Ic n="badge" s={22} /></span><b>Last check: {r.score} · {r.stage.name}</b><small>{fmt(r.last.at, { day: "numeric", month: "short", year: "numeric" })}</small><Ic n="arrow" s={18} /></Link>}
    </div>
  );

  const q = Q[step];
  const opts = q.opts === "bands" ? CUR[answers.country || "NG"].bands.map((l, i) => ({ l, v: i })) : q.opts;
  const idx = Q.slice(0, step + 1).filter(x => !x.setup).length;
  const pct = Math.round((step + 1) / (Q.length + 1) * 100);
  const cur = answers[q.id];
  const advance = (next) => {
    if (step < Q.length - 1) { setStep(step + 1); window.scrollTo(0, 0); }
    else { setBusy(true); saveCheck(next); setTimeout(() => nav("/app", { state: { animate: true } }), 1600); }
  };
  return (
    <div className="app">
      <AppTop />
      <div className="ck-top"><button className="ck-back" onClick={() => setStep(step - 1)} aria-label="Back">←</button><div className="ck-track" role="progressbar" aria-label="Progress" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i className="done head" title="You started" />{Q.map((x, i) => <i key={x.id} className={i < step ? "done" : i === step ? "now" : ""} />)}</div><span className="ck-count tnum">{q.setup ? "Setup" : `${idx}/${SCORED}`}</span></div>
      <section className="ck-q" key={q.id}>
        <span className="ck-chip" style={{ "--t": q.setup ? "#4A556B" : ["#13306B", "#1E7A4E", "#2A4FA8", "#B4472A", "#0F6E6E", "#B98A1F"][Object.keys(PARTS).indexOf(q.part)] }}>{q.setup ? q.tag : `${PARTS[q.part].name} · ${idx} of ${SCORED}`}</span>
        <h2 className="qtitle" id="qh">{money(q.q, answers.country)}</h2>
        {q.help && <p className="muted">{money(q.help, answers.country)}</p>}
        <div className="opts" role="group" aria-labelledby="qh">
          {opts.map((o, i) => {
            const on = q.multi ? (cur || []).includes(o.v) : cur === o.v;
            const sug = q.id === "country" && cur == null && o.v === SUGGEST_COUNTRY;
            return <button key={i} className={"opt" + (q.multi ? " multi" : "") + (sug ? " suggest" : "")} aria-pressed={on} onClick={() => {
              if (q.multi) { const set = new Set(cur || []); set.has(o.v) ? set.delete(o.v) : set.add(o.v); setA({ ...answers, [q.id]: [...set] }); }
              else { const next = { ...answers, [q.id]: o.v }; if (q.id === "country") delete next.band; setA(next); setTimeout(() => advance(next), 220); }
            }}><i className="dot" /><span>{o.l}{o.s && <small>{money(o.s, answers.country)}</small>}</span>{sug && <em className="opt-sug">Suggested</em>}</button>;
          })}
        </div>
        {q.multi && <button className="btn block" onClick={() => { const next = { ...answers, docs: answers.docs || [] }; setA(next); advance(next); }}>{(cur || []).length ? "See my result" : "None of these yet · see my result"}</button>}
      </section>
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
      <div className="ln-hero">
        <span className="rs-eyebrow">Learn</span>
        <h1>From Surviving to Building</h1>
        <div className="ln-tracks">{Object.values(TRACKS).map((t, i) => <span key={t.name} style={{ background: ["#B4472A", "#2A4FA8", "#1E7A4E", "#D9A93A"][i], color: i === 3 ? "#231800" : "#FFFFFF" }}><small>Track {i + 1}</small><b>{t.name}</b></span>)}</div>
      </div>
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
        <div className="stack"><span className="field-label">How many lessons?</span><Seg k="length" items={[[7, "7", "Quick start"], [14, "14", "Recommended"], [30, "30", "Complete"]]} /></div>
        <div className="stack"><span className="field-label">How often?</span><Seg k="pace" items={[["daily", "Daily"], ["3x", "3× a week", "Mon, Wed, Fri"], ["weekly", "Weekly"]]} /></div>
        <div className="stack"><span className="field-label">How long each time?</span><Seg k="minutes" items={[[5, "5 min", "The essentials"], [10, "10 min", "Recommended"], [20, "20 min", "+ going deeper"]]} /></div>
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
  cushion: { name: "Cushion", icon: "shield", tone: "#2A4FA8", short: "How long could we last?", what: "Works out how long your home could pay for the basics if income stopped today.", how: "Enter the savings you can reach quickly and your essential monthly spending.", when: "Before any investing, and whenever your spending changes." },
  surplus: { name: "Surplus", icon: "coins", tone: "#1E7A4E", short: "What do we keep?", what: "Shows your seed: what's left each month after everything that goes out.", how: "Enter money in and money out for a normal month, including family support and debt payments.", when: "At the start, and each month at your money meeting." },
  invest: { name: "Investment check", icon: "badge", tone: "#B4472A", short: "Is this offer safe?", what: "Checks any investment offer against six questions plus a red-flag check, then gives a clear verdict.", how: "Answer honestly for one offer at a time. 'Not sure' is a valid answer.", when: "Every time someone brings you an opportunity, before any money moves." },
  seven: { name: "7-day test", icon: "doc", tone: "#B98A1F", short: "Could family find it all?", what: "Shows whether your family could find everything you own within seven days if something happened to you.", how: "Tick what is already true. Your ticks save on this phone.", when: "Now, then once a year or after any big life change." }
};
export function Tools() {
  const [t, setT] = useState("cushion");
  const r = result();
  const sym = CUR[r?.last.answers.country || "NG"].sym;
  const meta = TOOLS[t];
  return (
    <div className="app">
      <AppTop />
      <div className="rs-head"><span className="rs-eyebrow dark">Family money tools</span><h2>Work it out together.</h2></div>
      <div className="tl-nav" role="tablist">{Object.entries(TOOLS).map(([k, v]) => <button key={k} role="tab" aria-pressed={t === k} onClick={() => setT(k)} style={{ "--t": v.tone }}><span><Ic n={v.icon} s={22} /></span><b>{v.name}</b><small>{v.short}</small></button>)}</div>
      <details className="tl-info" key={t}><summary><Ic n="spark" s={16} />What it does and when to use it</summary><dl><dt>What it does</dt><dd>{meta.what}</dd><dt>How to use it</dt><dd>{meta.how}</dd><dt>When</dt><dd>{meta.when}</dd></dl></details>
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
      <span className="small muted" style={{ fontWeight: 700 }}>If income stopped today, you'd have to borrow in</span>
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
      <p className="small tnum" style={{ fontWeight: 700 }}>{pct}% of what comes in{s > 0 ? ` · that's ${sym}${Math.round(s * 12).toLocaleString()} a year to build with` : ""}</p>
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
    <p className="muted">{n === LEGACY_ITEMS.length ? "Your family would know where to start. Review it once a year." : `If something happened tonight, your family would still be searching for ${LEGACY_ITEMS.length - n} of these ${LEGACY_ITEMS.length} things. Start with the first unticked item.`}</p>
  </>);
}
