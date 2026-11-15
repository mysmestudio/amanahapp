// @ts-nocheck
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Link, NavLink, Outlet } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { JOIN } from "./content";
import RoomBoard from "./RoomBoard";

export function Logo({ color = "currentColor", grain = "#E8C277" }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 30V10" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <g fill={grain}>
        <ellipse cx="12.4" cy="14" rx="2.5" ry="4.5" transform="rotate(-28 12.4 14)" />
        <ellipse cx="19.6" cy="14" rx="2.5" ry="4.5" transform="rotate(28 19.6 14)" />
        <ellipse cx="12.4" cy="21" rx="2.5" ry="4.5" transform="rotate(-28 12.4 21)" />
        <ellipse cx="19.6" cy="21" rx="2.5" ry="4.5" transform="rotate(28 19.6 21)" />
        <ellipse cx="16" cy="7" rx="2.3" ry="4.2" />
      </g>
    </svg>
  );
}
export function Brand({ to = "/", light = false }) {
  return <Link to={to} className="brand" style={light ? { color: "#FFF8EC" } : undefined}><Logo color={light ? "#FFF8EC" : "currentColor"} /><span>Seedline</span></Link>;
}

const I = {
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  check: <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 12l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /></>,
  plan: <path d="M5 4h14v16H5z M9 9h6 M9 13h6 M9 17h3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  learn: <path d="M12 21V11 M12 11c0-4 3-6 7-6 0 4-3 6-7 6z M12 14c0-3-2-5-6-5 0 3 2 5 6 5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  tools: <><rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>
};
const TABS = [["/app", "Home", "home", true], ["/app/check", "Check", "check"], ["/app/plan", "Plan", "plan"], ["/app/learn", "Learn", "learn"], ["/app/tools", "Tools", "tools"]];

export function AppShell() {
  return (
    <>
      <div className="gutter"><Outlet /></div>
      <div className="tabbar"><nav aria-label="App sections">
        {TABS.map(([to, label, ic, end]) => (
          <NavLink key={to} to={to} end={!!end} className={({ isActive }) => isActive ? "active" : ""}>
            <svg viewBox="0 0 24 24" aria-hidden="true">{I[ic]}</svg>{label}
          </NavLink>
        ))}
      </nav></div>
    </>
  );
}
export function AppTop() {
  return <header className="apptop"><Brand to="/" /><div className="co">Launched at<br />MSMMI Workshop 2026</div></header>;
}

/* Renders trusted slide HTML from content.ts, then mounts live pieces (QR codes, room board). */
export function Html({ html, className = "s-body" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const roots = [];
    el.querySelectorAll("[data-qr]").forEach(n => { const r = createRoot(n); r.render(<QRCodeCanvas value={JOIN} size={200} fgColor="#3B2A12" />); roots.push(r); });
    el.querySelectorAll("[data-room]").forEach(n => { const r = createRoot(n); r.render(<RoomBoard compact />); roots.push(r); });
    return () => roots.forEach(r => setTimeout(() => r.unmount()));
  }, [html]);
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Fine({ children }) {
  return <p className="tiny muted" style={{ textAlign: "center", maxWidth: "56ch", margin: "6px auto 0" }}>{children}</p>;
}
