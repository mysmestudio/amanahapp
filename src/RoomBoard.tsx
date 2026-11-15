// @ts-nocheck
// Live room board: every household that takes the check adds a stalk. Used on /room (full screen, dark) and inside slides (compact).
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { STAGES, PARTS, ROOM, JOIN, stageOf } from "./content";
import { api } from "./store";
import "./room.css";

const STAGE_HEX = { survive: "#B4472A", stabilise: "#1E7A4E", build: "#2A4FA8", legacy: "#D9A93A" };
const PLANT = ["Seed", "Sprout", "Stalk", "Harvest"];

function useRoom() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try { const d = await api("rpc/room_stats", { p_room: ROOM }, true); if (alive) { setS(d); setErr(false); } }
      catch { if (alive) setErr(true); }
    };
    tick(); const iv = setInterval(tick, 4000);
    return () => { alive = false; clearInterval(iv); };
  }, []);
  return [s, err];
}

/* Each household is a stalk: height = score, colour = stage. */
function Stalks({ scores }) {
  const W = 1000, H = 300, ground = 270, n = Math.max(scores.length, 1);
  const gap = W / (n + 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="rb-stalks" preserveAspectRatio="none" role="img" aria-label={`${scores.length} households, each shown as a stalk`}>
      {[34, 59, 79].map((v, i) => <g key={v}><line x1="0" x2={W} y1={ground - v * 2.4} y2={ground - v * 2.4} className="rb-band" /><text x={W - 6} y={ground - v * 2.4 - 6} textAnchor="end" className="rb-band-t">{PLANT[i + 1]}</text></g>)}
      <line x1="0" x2={W} y1={ground} y2={ground} className="rb-ground" />
      {scores.map((v, i) => {
        const x = gap * (i + 1), h = Math.max(8, v * 2.4), c = STAGE_HEX[stageOf(v).id];
        return (
          <g key={i} className="rb-stalk" style={{ "--d": `${Math.min(i, 40) * 30}ms` }}>
            <line x1={x} x2={x} y1={ground} y2={ground - h} stroke={c} strokeWidth={Math.max(2, Math.min(8, gap * .28))} strokeLinecap="round" />
            <ellipse cx={x} cy={ground - h - 6} rx={Math.max(3, Math.min(9, gap * .3))} ry={Math.max(5, Math.min(14, gap * .45))} fill={c} />
          </g>
        );
      })}
    </svg>
  );
}

function QRFull({ onClose, total }) {
  useEffect(() => {
    const k = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    try { document.documentElement.requestFullscreen?.(); } catch {}
    return () => { window.removeEventListener("keydown", k); try { document.fullscreenElement && document.exitFullscreen?.(); } catch {} };
  }, []);
  const size = typeof window !== "undefined" ? Math.round(Math.min(window.innerHeight * .62, window.innerWidth * .8)) : 520;
  return (
    <motion.div className="rb-full" role="dialog" aria-modal="true" aria-label="Scan to add your household" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <button className="rb-full-x" onClick={onClose} aria-label="Close full screen">✕ Close</button>
      <span className="rb-full-eyebrow">MSMMI Marriage Workshop 2026</span>
      <h2>Scan to add your household</h2>
      <motion.div className="rb-full-qr" initial={{ scale: .85 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 18 }} onClick={e => e.stopPropagation()}>
        <QRCodeCanvas value={JOIN} size={size} fgColor="#0A1A3F" />
      </motion.div>
      <span className="rb-full-url">{JOIN.replace(/^https?:\/\//, "")}</span>
      <span className="rb-full-count"><i />{total} household{total === 1 ? "" : "s"} so far · 4 minutes · no sign-up</span>
    </motion.div>
  );
}

export default function RoomBoard({ compact = false, dark = false }) {
  const [s, err] = useRoom();
  const [full, setFull] = useState(false);
  const total = s?.total || 0;
  const scores = (s?.scores || []).slice(-160);
  const top = s && total ? STAGES.slice().sort((a, b) => s.stages[b.id] - s.stages[a.id])[0] : null;
  const ranked = s ? Object.keys(PARTS).sort((a, b) => s.weakest[b] - s.weakest[a]) : [];
  return (
    <div className={"rb" + (dark ? " dark" : "") + (compact ? " compact" : "")}>
      <div className="rb-main">
        <div className="rb-kpis">
          <div className="rb-kpi"><b className="tnum">{total}</b><span>households checked</span></div>
          <div className="rb-kpi"><b className="tnum">{total ? s.avg : "–"}</b><span>average score</span></div>
          <div className="rb-kpi stage" style={{ "--t": top ? STAGE_HEX[top.id] : "currentColor" }}><b>{top ? top.name : "–"}</b><span>most common stage{top ? ` · ${top.plant}` : ""}</span></div>
        </div>
        <div className="rb-field">
          <div className="rb-field-h">
            <span>{total ? "Every stalk is a household. Taller means further along." : "Scan the code. Each household adds a stalk to this field."}</span>
            <span className={"rb-live" + (err ? " off" : "")}><i />{err ? "Reconnecting…" : "Live"}</span>
          </div>
          <Stalks scores={scores} />
          <div className="rb-pct">
            {STAGES.map(st => <div key={st.id} style={{ "--t": STAGE_HEX[st.id] }}><b className="tnum">{total ? Math.round(s.stages[st.id] / total * 100) : 0}%</b><span>{st.plant} · {st.name}</span></div>)}
          </div>
        </div>
      </div>
      <div className="rb-side">
        {!compact && (
          <button className="rb-join" onClick={() => setFull(true)} aria-label="Show the QR code full screen">
            <span className="rb-join-t">Add your household</span>
            <span className="rb-qr"><QRCodeCanvas value={JOIN} size={220} fgColor="#0A1A3F" /></span>
            <span className="rb-join-url">{JOIN.replace(/^https?:\/\//, "")}</span>
            <span className="rb-join-full">⤢ Show full screen</span>
          </button>
        )}
        <div className="rb-back">
          <b>What's holding the room back</b>
          {total ? <>
            {ranked.map(k => { const pc = Math.round(s.weakest[k] / total * 100); return (
              <div className="rb-part" key={k}><span>{PARTS[k].name}</span><em className="tnum">{pc}%</em><i><motion.span initial={{ width: 0 }} animate={{ width: pc + "%" }} transition={{ duration: .8 }} /></i></div>); })}
            <small>Share of households whose weakest part is each one.</small>
          </> : <small>Waiting for the first check…</small>}
        </div>
      </div>
      <AnimatePresence>{full && <QRFull total={total} onClose={() => setFull(false)} />}</AnimatePresence>
    </div>
  );
}
