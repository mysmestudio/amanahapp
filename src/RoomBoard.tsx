// @ts-nocheck
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Field from "./Field";
import { STAGES, PARTS, ROOM, JOIN, stageOf } from "./content";
import { api } from "./store";

const STAGE_HEX = { survive: "#B4472A", stabilise: "#1E7A4E", build: "#13306B", legacy: "#D9A93A" };

export default function RoomBoard({ compact = false }) {
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
  const total = s?.total || 0;
  const scores = (s?.scores || []).slice(-160);
  const top = s && total ? STAGES.slice().sort((a, b) => s.stages[b.id] - s.stages[a.id])[0] : null;
  const ranked = s ? Object.keys(PARTS).sort((a, b) => s.weakest[b] - s.weakest[a]) : [];
  return (
    <div className="board">
      <div className="stack" style={{ gap: 14, minWidth: 0 }}>
        <div className="kpis">
          <div className="kpi"><b className="tnum">{total}</b><span>households checked</span></div>
          <div className="kpi"><b className="tnum">{total ? s.avg : "–"}</b><span>average score</span></div>
          <div className="kpi"><b style={{ color: top?.color }}>{top ? top.name : "–"}</b><span>most common stage</span></div>
        </div>
        <div className="roomfield">
          <Field stalks={scores.length ? scores : [0]} colors={scores.map(v => STAGE_HEX[stageOf(v).id])} />
          <div style={{ position: "absolute", top: 12, left: 16, right: 16, display: "flex", justifyContent: "space-between" }}>
            <span className="small" style={{ fontWeight: 800, color: "#0A1A3F" }}>{total ? "Every stalk is a household. Taller means further along." : "Scan the code. Each household adds a stalk to this field."}</span>
            <span className="live">{err ? "Reconnecting…" : <><i />Live</>}</span>
          </div>
          <div className="stagepct">
            {STAGES.map(st => <div key={st.id}><b style={{ color: st.color }}>{total ? Math.round(s.stages[st.id] / total * 100) : 0}%</b><span>{st.name}</span></div>)}
          </div>
        </div>
      </div>
      <div className="stack" style={{ gap: 14, minWidth: 0 }}>
        {!compact && <div className="joinbox"><span className="small" style={{ fontWeight: 700 }}>Add your household</span><div className="qrbox"><QRCodeCanvas value={JOIN} size={170} fgColor="#0A1A3F" /></div><span className="url">{JOIN.replace(/^https?:\/\//, "")}</span></div>}
        <div className="card">
          <span className="small" style={{ fontWeight: 800 }}>What's holding the room back</span>
          {total ? <div className="parts">{ranked.map(k => { const pc = Math.round(s.weakest[k] / total * 100); return (
            <div className="part" key={k}><div className="nm">{PARTS[k].name}</div><div className="lvl tnum">{pc}%</div><div className="bar"><i style={{ width: pc + "%", background: "var(--weak)" }} /></div></div>); })}
            <p className="tiny muted">Share of households whose weakest part is each one.</p></div>
            : <p className="small muted">Waiting for the first check…</p>}
        </div>
      </div>
    </div>
  );
}
