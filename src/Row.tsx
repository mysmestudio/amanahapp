// @ts-nocheck
import { useEffect, useRef } from "react";
import { SKIES, currentSky } from "./Field";

/* The Seedline signature: planted rows running to the horizon. The centre row is the family line.
   grow (0..1) is how far the family has come: seed, sprout, stalk, harvest. */
const SOIL = {
  dawn: ["#C99A6A", "#6E4A2A"], day: ["#C9A36A", "#74522A"], golden: ["#C99A5E", "#6E4A24"],
  dusk: ["#9A6A5A", "#4A2E2A"], night: ["#3A3A52", "#191A2A"]
};

function plant(x, s, stage, sway, night) {
  if (stage < 0.6) { x.fillStyle = night ? "rgba(150,140,170,.9)" : "rgba(160,110,50,.95)"; x.beginPath(); x.ellipse(0, -1.5 * s, 2.6 * s, 1.8 * s, 0, 0, 6.28); x.fill(); return; }
  const k = Math.min(1, (stage - .6) / 2.4);
  const H = (6 + 46 * k) * s, tx = sway * k * s;
  const r = Math.round(110 + 80 * Math.max(0, k - .55) / .45), g = Math.round(150 - 10 * Math.max(0, k - .55) / .45);
  x.strokeStyle = night ? "rgba(150,170,200,.9)" : k < .55 ? "rgba(95,150,70,.95)" : `rgba(${r},${g},62,.95)`;
  x.lineWidth = Math.max(.8, 1.4 * s);
  x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(tx * .2, -H * .5, tx, -H); x.stroke();
  if (k < .7) {
    x.fillStyle = night ? "rgba(140,170,190,.9)" : "rgba(125,179,90,.95)"; const ly = -Math.min(H, 9 * s), L = (4 + 4 * k) * s;
    x.beginPath(); x.ellipse(-L * .7 + tx * .3, ly, L, L * .45, -.6, 0, 6.28); x.fill();
    x.beginPath(); x.ellipse(L * .7 + tx * .3, ly, L, L * .45, .6, 0, 6.28); x.fill();
  }
  if (k > .5) {
    const ripe = Math.min(1, (k - .5) / .5), m = .6 + ripe * .5;
    x.fillStyle = night ? "rgba(200,205,230,.95)" : `rgba(${Math.round(200 + 30 * ripe)},${Math.round(194 - 14 * ripe)},${Math.round(106 - 30 * ripe)},.98)`;
    for (let i = 0; i < 4; i++) { const ky = -H + i * 2.6 * s * m; x.beginPath(); x.ellipse(tx - 1.4 * s, ky, 1.1 * s * m, 2.2 * s * m, -.5, 0, 6.28); x.fill(); x.beginPath(); x.ellipse(tx + 1.4 * s, ky, 1.1 * s * m, 2.2 * s * m, .5, 0, 6.28); x.fill(); }
    x.beginPath(); x.ellipse(tx, -H - 2.6 * s, s, 2.4 * s, 0, 0, 6.28); x.fill();
  }
}

type Props = { grow?: number; hero?: boolean; shade?: boolean; sky?: string; className?: string; style?: React.CSSProperties };
export default function Row({ grow = .8, hero = false, shade = false, sky, className, style }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const growRef = useRef(grow); growRef.current = grow;
  useEffect(() => {
    const c = ref.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const key = sky || currentSky(), S = SKIES[key], soil = SOIL[key], night = key === "night";
    let x, w = 0, h = 0, raf = 0;
    const t0 = performance.now();
    const stars = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random() * .45, r: Math.random() * 1.2 + .3, p: Math.random() * 6.28 }));
    const build = () => { const r = c.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); w = r.width; h = r.height; c.width = Math.max(1, w * d); c.height = Math.max(1, h * d); x = c.getContext("2d"); x.setTransform(d, 0, 0, d, 0, 0); };
    build(); const ro = new ResizeObserver(build); ro.observe(c);
    const draw = (t) => {
      const grow = growRef.current;
      const vx = w * (hero ? .64 : .5), vy = h * (hero ? .5 : .42);
      const sk = x.createLinearGradient(0, 0, 0, vy); sk.addColorStop(0, S.stops[0]); sk.addColorStop(1, S.stops[1]); x.fillStyle = sk; x.fillRect(0, 0, w, vy + 1);
      if (night) for (const s of stars) { x.fillStyle = `rgba(235,240,255,${.35 + .45 * Math.abs(Math.sin(t / 1400 + s.p))})`; x.beginPath(); x.arc(s.x * w, s.y * h, s.r, 0, 6.28); x.fill(); }
      const sun = x.createRadialGradient(vx, vy - h * .06, 0, vx, vy - h * .06, Math.max(h, w * .4) * .55);
      sun.addColorStop(0, `rgba(${S.sun},.95)`); sun.addColorStop(.12, `rgba(${S.sun},.72)`); sun.addColorStop(1, `rgba(${S.sun},0)`); x.fillStyle = sun; x.fillRect(0, 0, w, h);
      const sl = x.createLinearGradient(0, vy, 0, h); sl.addColorStop(0, soil[0]); sl.addColorStop(1, soil[1]); x.fillStyle = sl; x.fillRect(0, vy, w, h - vy);
      for (let i = 0; i < w; i += 3) { x.fillStyle = night ? "rgba(170,180,210,.35)" : "rgba(224,176,72,.55)"; x.fillRect(i, vy - 4 - Math.sin(i * .3 + t / 900) * 1.2, 2, 6); }
      const rows = hero ? 13 : 9, depth = hero ? 26 : 16;
      x.strokeStyle = "rgba(60,36,14,.32)"; x.lineWidth = 1;
      for (let r = 0; r < rows; r++) { const off = (r - (rows - 1) / 2) / ((rows - 1) / 2); x.beginPath(); x.moveTo(vx, vy); x.lineTo(vx + off * w * 1.4, h); x.stroke(); }
      const elapsed = reduce ? 1e9 : t - t0;
      const items = [];
      for (let r = 0; r < rows; r++) {
        const off = (r - (rows - 1) / 2) / ((rows - 1) / 2), center = r === (rows - 1) / 2;
        for (let i = 0; i < depth; i++) {
          const sc = 1 / (1 + i * .55), py = vy + (h - vy) * sc * .98, px = vx + off * w * 1.4 * sc * .98;
          if (px < -20 || px > w + 20) continue;
          const along = 1 - i / depth;
          const target = center ? grow * 3 - (1 - along) * 3 * grow * .25 : grow * 3 * (.55 + .45 * along) - .25;
          const wave = Math.min(1, Math.max(0, elapsed / 1400 - (1 - along) * 1.2));
          items.push({ px, py, s: sc * (hero ? 2.2 : 1.6) * (center ? 1.25 : 1), st: Math.max(0, target) * wave, ph: r * 1.7 + i * .9 });
        }
      }
      items.sort((a, b) => a.py - b.py);
      const wind = Math.sin(t / 1800) * .6 + Math.sin(t / 700) * .25;
      for (const p of items) { x.save(); x.translate(p.px, p.py); plant(x, p.s, p.st, reduce ? 0 : (wind + Math.sin(t / 950 + p.ph) * .4) * 5, night); x.restore(); }
      const gl = x.createLinearGradient(vx, vy, vx, h); gl.addColorStop(0, "rgba(255,236,180,0)"); gl.addColorStop(1, night ? "rgba(200,210,255,.12)" : "rgba(255,236,180,.2)");
      x.fillStyle = gl; x.beginPath(); x.moveTo(vx - 2, vy); x.lineTo(vx - w * .09, h); x.lineTo(vx + w * .09, h); x.lineTo(vx + 2, vy); x.fill();
      if (shade) {
        const sh = x.createLinearGradient(0, 0, w * .85, 0); sh.addColorStop(0, `rgba(${S.shade},.62)`); sh.addColorStop(1, `rgba(${S.shade},0)`); x.fillStyle = sh; x.fillRect(0, 0, w, h);
        const bt = x.createLinearGradient(0, h * .55, 0, h); bt.addColorStop(0, `rgba(${S.shade},0)`); bt.addColorStop(1, `rgba(${S.shade},.3)`); x.fillStyle = bt; x.fillRect(0, 0, w, h);
      }
      if (!reduce || elapsed < 3000) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [hero, shade, sky]);
  return <canvas ref={ref} className={className} style={style} aria-hidden="true" />;
}

/* Small plant icons for the four stages. */
export function PlantIcon({ stage = 0, size = 40, light = false }) {
  const soil = light ? "#E8C277" : "#8A6A3A";
  return (
    <svg viewBox="0 0 40 34" width={size} height={size * .85} aria-hidden="true">
      <path d="M0 30h40" stroke={soil} strokeWidth="2" />
      {stage === 0 && <ellipse cx="20" cy="27" rx="4" ry="3" fill="#B98A2E" />}
      {stage === 1 && <><path d="M20 30V20" stroke="#7DB35A" strokeWidth="2" /><path d="M20 22c-5 0-8-4-8-8 5 0 8 4 8 8zM20 22c5 0 8-4 8-8-5 0-8 4-8 8z" fill="#8FC46A" /></>}
      {stage === 2 && <><path d="M20 30V8" stroke="#6E8F3A" strokeWidth="2" /><path d="M20 20c-6-1-9-5-9-9 5 1 9 4 9 9zM20 15c6-1 9-5 9-9-5 1-9 4-9 9z" fill="#8DB25A" /><ellipse cx="20" cy="7" rx="2.5" ry="5" fill="#C9C26A" /></>}
      {stage === 3 && <><path d="M20 30V7" stroke="#B88A3A" strokeWidth="2" /><g fill="#E0B048"><ellipse cx="17" cy="12" rx="2.4" ry="4" transform="rotate(-28 17 12)" /><ellipse cx="23" cy="12" rx="2.4" ry="4" transform="rotate(28 23 12)" /><ellipse cx="17" cy="19" rx="2.4" ry="4" transform="rotate(-28 17 19)" /><ellipse cx="23" cy="19" rx="2.4" ry="4" transform="rotate(28 23 19)" /><ellipse cx="20" cy="6" rx="2" ry="3.4" /></g></>}
    </svg>
  );
}
