// @ts-nocheck
import { useEffect, useState } from "react";
import Field from "./Field";
import { Brand, Html } from "./ui";
import RoomBoard from "./RoomBoard";
import { SLIDES } from "./content";
import { load, save } from "./store";

export function Present() {
  const [i, setI] = useState(() => Math.min(SLIDES.length - 1, load("slide", 0) || 0));
  const [notes, setNotes] = useState(false);
  const go = n => { const v = Math.max(0, Math.min(SLIDES.length - 1, n)); setI(v); save("slide", v); };
  useEffect(() => {
    const k = e => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(i + 1); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(i - 1); }
      if (e.key === "n" || e.key === "N") setNotes(v => !v);
    };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [i]);
  const s = SLIDES[i];
  const isTitle = s.id === "title" || s.id === "close";
  return (
    <div className="pstage">
      <div className="stage-top"><Brand /><span className="small muted">MSMMI Marriage Workshop 2026 · Day 2</span></div>
      <div className="stage-main">
        {isTitle ? (
          <div className="stage-title" key={s.id}>
            <Field shade />
            <div><span className="small" style={{ fontWeight: 700, color: "#FFE4A8" }}>{s.kick}</span><h2 className="h-lg" style={{ maxWidth: "18ch" }}>{s.title}</h2><Html html={s.body()} className="s-body" /></div>
          </div>
        ) : (
          <div className="stage-inner" key={s.id}><span className="kick">{s.kick}</span><h2>{s.title}</h2><Html html={s.body()} /></div>
        )}
      </div>
      <div className="stage-bottom">
        <button className="btn sm ghost" onClick={() => go(i - 1)} aria-label="Previous slide">Back</button>
        <div className="dots" aria-label={`Slide ${i + 1} of ${SLIDES.length}`}>{SLIDES.map((_, k) => <i key={k} className={k === i ? "on" : ""} />)}</div>
        <div className="row"><button className="btn sm ghost" onClick={() => setNotes(v => !v)}>Notes (N)</button><button className="btn sm" onClick={() => go(i + 1)} aria-label="Next slide">Next</button></div>
      </div>
      {notes && <div className="notes">{s.notes}</div>}
    </div>
  );
}

export function Room() {
  return (
    <div className="gutter" style={{ paddingBlock: "calc(22px + env(safe-area-inset-top, 0px)) 32px" }}>
      <div className="container stack" style={{ gap: 18 }}>
        <div className="row" style={{ justifyContent: "space-between" }}><Brand /><span className="small muted">MSMMI Marriage Workshop 2026</span></div>
        <h1 className="h-lg">Where this room stands, right now</h1>
        <RoomBoard />
      </div>
    </div>
  );
}
