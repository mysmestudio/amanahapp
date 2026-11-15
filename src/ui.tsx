// @ts-nocheck
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Link, NavLink, Outlet } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { JOIN } from "./content";
import RoomBoard from "./RoomBoard";
import "./app.css";

export function Logo({ tone = "#13306B", mark = "#FFFFFF" }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill={tone} />
      <g fill="none" stroke={mark} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 26V14" /><path d="M16 17c-5 0-7.5-3-7.5-7.5 4.5 0 7.5 2.5 7.5 7.5z" /><path d="M16 14.5c0-4.5 3-7.5 7.5-7.5 0 4.5-3 7.5-7.5 7.5z" />
      </g>
      <circle cx="16" cy="27" r="1.6" fill="#D9A93A" />
    </svg>
  );
}
export function Brand({ to = "/", light = false }) {
  return <Link to={to} className="brand" style={light ? { color: "#FFFFFF" } : undefined}><Logo tone={light ? "#FFFFFF" : "#13306B"} mark={light ? "#13306B" : "#FFFFFF"} /><span>Seedline</span></Link>;
}

const I = {
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  check: <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 12l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /></>,
  plan: <path d="M5 4h14v16H5z M9 9h6 M9 13h6 M9 17h3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  learn: <path d="M12 21V11 M12 11c0-4 3-6 7-6 0 4-3 6-7 6z M12 14c0-3-2-5-6-5 0 3 2 5 6 5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  dir: <path d="M4 21V8l8-5 8 5v13M9 21v-6h6v6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  tools: <><rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>
};
const TABS = [["/app", "Home", "home", true], ["/app/check", "Check", "check"], ["/app/plan", "Plan", "plan"], ["/app/directory", "Halal", "dir"], ["/app/learn", "Learn", "learn"], ["/app/tools", "Tools", "tools"]];

export function AppShell() {
  const last = (() => { try { return JSON.parse(localStorage.getItem("seedline:last")); } catch { return null; } })();
  return (
    <div className="ashell">
      <aside className="aside" aria-label="Seedline">
        <Brand to="/" light />
        <nav aria-label="App sections">
          {TABS.map(([to, label, ic, end]) => (
            <NavLink key={to} to={to} end={!!end} className={({ isActive }) => isActive ? "active" : ""}>
              <svg viewBox="0 0 24 24" aria-hidden="true">{I[ic]}</svg>{label}
            </NavLink>
          ))}
        </nav>
        {last && <Link to="/app" className="aside-score"><span>Your score</span><b className="tnum">{last.score}</b><small>{last.stageName}</small></Link>}
        <span className="aside-foot">Launched at the MSMMI Marriage Workshop 2026</span>
      </aside>
      <main className="amain"><div className="gutter"><Outlet /></div></main>
      <div className="tabbar"><nav aria-label="App sections">
        {TABS.map(([to, label, ic, end]) => (
          <NavLink key={to} to={to} end={!!end} className={({ isActive }) => isActive ? "active" : ""}>
            <svg viewBox="0 0 24 24" aria-hidden="true">{I[ic]}</svg>{label}
          </NavLink>
        ))}
      </nav></div>
    </div>
  );
}
export function AppTop({ title = null }) {
  const name = (() => { try { return JSON.parse(localStorage.getItem("seedline:name")) || ""; } catch { return ""; } })();
  return <header className="apptop"><Brand to="/" />{title ? <span className="apptop-t">{title}</span> : <div className="co">{name ? <>Assalamu alaikum,<br /><b>{name}</b></> : <>Your family<br />office, online</>}</div>}</header>;
}

/* Renders trusted slide HTML from content.ts, then mounts live pieces (QR codes, room board). */
export function Html({ html, className = "s-body" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const roots = [];
    el.querySelectorAll("[data-qr]").forEach(n => { const r = createRoot(n); r.render(<QRCodeCanvas value={JOIN} size={200} fgColor="#0A1A3F" />); roots.push(r); });
    el.querySelectorAll("[data-room]").forEach(n => { const r = createRoot(n); r.render(<RoomBoard compact />); roots.push(r); });
    return () => roots.forEach(r => setTimeout(() => r.unmount()));
  }, [html]);
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Fine({ children }) {
  return <p className="tiny muted" style={{ textAlign: "center", maxWidth: "56ch", margin: "6px auto 0" }}>{children}</p>;
}
