// @ts-nocheck
// Shared shell for the public site: nav, footer, icons, accordion and the institution listing form.
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Brand } from "./ui";
import { result, api, load } from "./store";
import "./landing.css";

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
  x: <path d="M6 6l12 12M18 6L6 18" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  ext: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  coins: <><ellipse cx="9" cy="7" rx="6" ry="2.5" /><path d="M3 7v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V7" /><path d="M9 16.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V12c0-1.4-2.7-2.5-6-2.5" /></>,
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  trend: <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  sun: <><circle cx="12" cy="13" r="4" /><path d="M12 3v3M4.2 6.2l2 2M19.8 6.2l-2 2M2 13h3M19 13h3M3 20h18" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></>,
  spark: <path d="M12 3l2.2 6.3L20 12l-5.8 2.7L12 21l-2.2-6.3L4 12l5.8-2.7z" />,
  phonecall: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  pin: <><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
  download: <><path d="M12 4v11M7 10l5 5 5-5" /><path d="M5 20h14" /></>
};
export function Ic({ n, s = 20, w = 2 }) {
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ic[n]}</svg>;
}
export const GOAL_ICON = { save: "coins", grow: "trend", protect: "shield", home: "home", retire: "sun", business: "briefcase", give: "heart" };
export const rise = { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: .6, ease: [.16, 1, .3, 1] } };

/* ₦ amounts given in thousands: 1000 → ₦1m, 950 → ₦950k */
export function naira(k) { return k >= 1000 ? `₦${+(k / 1000).toFixed(2)}m` : `₦${Math.round(k)}k`; }

export function Acc({ q, children, dark = false }) {
  const [o, setO] = useState(false);
  return (
    <div className={"lp-acc" + (o ? " open" : "") + (dark ? " dark" : "")}>
      <button onClick={() => setO(!o)} aria-expanded={o}><span>{q}</span><Ic n="chev" /></button>
      {o && <motion.div className="lp-acc-b" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}>{children}</motion.div>}
    </div>
  );
}

export function SiteNav({ dark = false }) {
  const r = result(); const named = !!load("onboarded");
  return (
    <header className={"lp-nav" + (dark ? " dark" : "")}><div className="lp-wrap lp-nav-in">
      <Brand light={dark} sub />
      <nav className="lp-links" aria-label="Site">
        <NavLink to="/how-it-works">How it works</NavLink>
        <a href="/#institutions">For institutions</a>
        <NavLink to="/trust">Trust &amp; privacy</NavLink>
      </nav>
      <div className="lp-nav-cta">
        <Link to="/start" className={"btn sm" + (dark ? " gold" : "")}>{r || named ? "Open my SeedLine" : "Start free"}</Link>
      </div>
    </div></header>
  );
}

export function SiteFooter({ onList }) {
  return (
    <footer className="lp-foot"><div className="lp-wrap lp-foot-in">
      <div className="lp-foot-brand"><Brand sub /><span>Your family office, online. A product of the MSMMI Marriage Workshop 2026, Lagos.</span></div>
      <div className="lp-foot-cols">
        <div><b>Families</b><Link to="/start">Get started</Link><Link to="/how-it-works">How it works</Link></div>
        <div><b>Institutions</b>{onList ? <button onClick={onList}>Request a free listing</button> : <a href="/#institutions">Request a free listing</a>}</div>
        <div><b>Workshop</b><Link to="/room">Live room board</Link><Link to="/present">Session slides</Link></div>
        <div><b>SeedLine</b><Link to="/how-it-works">How it works</Link><Link to="/trust">Trust &amp; privacy</Link></div>
      </div>
      <p className="lp-disclaim">SeedLine provides financial education, not financial, legal or Shariah advice. A listing is not a recommendation. For personal decisions, speak to a licensed adviser or a qualified scholar.</p>
    </div></footer>
  );
}

const ORG_TYPES = ["Islamic bank or window", "Fund or asset manager", "Takaful operator", "Waqf or endowment", "Cooperative or microfinance", "Other halal provider"];
export function ListingModal({ open, onClose }) {
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
            <h3 id="lm-t">List your institution on SeedLine</h3>
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
