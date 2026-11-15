import { useEffect, useRef } from "react";

/* The Granary field: grain that sways under a sky that follows the time of day.
   grow (0..1) sets how tall the field stands. stalks (scores 0..100) draws one stalk per household instead. */
type Sky = "dawn" | "day" | "golden" | "dusk" | "night";
const SKIES: Record<Sky, { stops: [string, string, string]; sun: string; grain: [number, number, number]; stem: [number, number, number]; shade: string }> = {
  dawn:   { stops: ["#E9946A", "#F6CFA0", "#FFF0DA"], sun: "255,240,215", grain: [236, 186, 110], stem: [196, 150, 84], shade: "70,38,6" },
  day:    { stops: ["#7DB6DE", "#CBE4F1", "#FFF2D6"], sun: "255,252,235", grain: [226, 182, 96],  stem: [186, 146, 70], shade: "40,40,20" },
  golden: { stops: ["#E3913A", "#F5C46A", "#FFF1D2"], sun: "255,248,225", grain: [240, 190, 100], stem: [200, 150, 70], shade: "70,38,6" },
  dusk:   { stops: ["#5B4472", "#D9806A", "#F3BE88"], sun: "255,220,180", grain: [214, 160, 104], stem: [170, 118, 80], shade: "40,20,40" },
  night:  { stops: ["#0C1430", "#1C2850", "#34406E"], sun: "225,230,255", grain: [176, 186, 214], stem: [120, 130, 168], shade: "6,10,30" }
};
export function currentSky(): Sky {
  const q = new URLSearchParams(location.search).get("sky") as Sky | null;
  if (q && SKIES[q]) return q;
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  if (h >= 5 && h < 7) return "dawn";
  if (h >= 7 && h < 15.5) return "day";
  if (h >= 15.5 && h < 18.5) return "golden";
  if (h >= 18.5 && h < 20) return "dusk";
  return "night";
}

type Props = { grow?: number; stalks?: number[]; colors?: string[]; sky?: Sky; shade?: boolean; density?: number; className?: string; style?: React.CSSProperties };

export default function Field({ grow = 1, stalks, colors, sky, shade = false, density = 1, className, style }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const growRef = useRef(grow);
  growRef.current = grow;
  const dataRef = useRef({ stalks, colors });
  dataRef.current = { stalks, colors };

  useEffect(() => {
    const c = ref.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const S = SKIES[sky || currentSky()];
    let w = 0, h = 0, x: CanvasRenderingContext2D;
    let field: { x: number; d: number; h: number; p: number; col?: string }[] = [];
    let stars: { x: number; y: number; r: number; p: number }[] = [];
    let shown = reduce ? 1 : 0;
    let raf = 0, last = "";
    const build = () => {
      const r = c.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      w = r.width; h = r.height; c.width = Math.max(1, w * dpr); c.height = Math.max(1, h * dpr);
      x = c.getContext("2d")!; x.setTransform(dpr, 0, 0, dpr, 0, 0);
      field = [];
      const { stalks: st, colors: cols } = dataRef.current;
      if (st && st.length) {
        const n = st.length, gap = w / (n + 1);
        st.forEach((v, i) => field.push({ x: gap * (i + 1) + (Math.random() - .5) * gap * .5, d: .55 + Math.random() * .45, h: (0.12 + v / 100 * 0.78) * h, p: Math.random() * 6.28, col: cols?.[i] }));
        for (let i = 0; i < Math.floor(w / 6); i++) field.push({ x: Math.random() * w, d: Math.random() * .3, h: (0.06 + Math.random() * .08) * h, p: Math.random() * 6.28 });
        field.sort((a, b) => a.d - b.d);
      } else {
        const n = Math.floor((w / 2.4) * density);
        for (let i = 0; i < n; i++) { const d = Math.random(); field.push({ x: Math.random() * w, d, h: (0.3 + 0.5 * d + Math.random() * .15) * h * .62, p: Math.random() * 6.28 }); }
        field.sort((a, b) => a.d - b.d);
      }
      stars = Array.from({ length: Math.floor(w * h / 5000) }, () => ({ x: Math.random() * w, y: Math.random() * h * .6, r: Math.random() * 1.2 + .3, p: Math.random() * 6.28 }));
      last = JSON.stringify(dataRef.current.stalks || []);
    };
    build();
    const ro = new ResizeObserver(build); ro.observe(c);
    const draw = (t: number) => {
      if (JSON.stringify(dataRef.current.stalks || []) !== last) build();
      if (!reduce) shown = Math.min(1, shown + 0.012);
      const g = (growRef.current) * (1 - Math.pow(1 - shown, 3));
      const sk = x.createLinearGradient(0, 0, 0, h);
      sk.addColorStop(0, S.stops[0]); sk.addColorStop(.58, S.stops[1]); sk.addColorStop(1, S.stops[2]);
      x.fillStyle = sk; x.fillRect(0, 0, w, h);
      if (sky === "night" || (!sky && S === SKIES.night)) {
        for (const s of stars) { x.fillStyle = `rgba(235,240,255,${.35 + .45 * Math.abs(Math.sin(t / 1400 + s.p))})`; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.28); x.fill(); }
      }
      const sx = w * .74, sy = h * .34, R = Math.max(h, w * .4) * .55;
      const sun = x.createRadialGradient(sx, sy, 0, sx, sy, R);
      sun.addColorStop(0, `rgba(${S.sun},.95)`); sun.addColorStop(.1, `rgba(${S.sun},.75)`); sun.addColorStop(1, `rgba(${S.sun},0)`);
      x.fillStyle = sun; x.fillRect(0, 0, w, h);
      const wind = Math.sin(t / 1800) * .6 + Math.sin(t / 700) * .25;
      for (const s of field) {
        const H = s.col ? s.h * (0.2 + 0.8 * (1 - Math.pow(1 - shown, 3))) : s.h * g;
        if (H < 2) continue;
        const sway = (reduce ? 0 : (wind + Math.sin(t / 950 + s.p) * .4)) * (5 + s.d * 11);
        const tx = s.x + sway, ty = h - H;
        const [gr, gg, gb] = S.grain, [sr, sg, sb] = S.stem, k = .55 + s.d * .45;
        x.strokeStyle = s.col || `rgba(${sr},${sg},${sb},${k})`;
        x.lineWidth = .7 + s.d * (s.col ? 2.2 : 1.4);
        x.beginPath(); x.moveTo(s.x, h); x.quadraticCurveTo(s.x + sway * .2, h - H * .5, tx, ty); x.stroke();
        x.fillStyle = s.col || `rgba(${gr},${gg},${gb},${.6 + s.d * .4})`;
        const kernels = s.col ? 6 : 4, sz = s.col ? 1.6 : 1;
        for (let i = 0; i < kernels; i++) {
          const ky = ty + i * (2.3 + s.d * 2.3) * sz;
          x.beginPath(); x.ellipse(tx - (1.2 + s.d) * sz, ky, (1 + s.d) * sz, (2 + s.d * 1.9) * sz, -.5, 0, 6.28); x.fill();
          x.beginPath(); x.ellipse(tx + (1.2 + s.d) * sz, ky, (1 + s.d) * sz, (2 + s.d * 1.9) * sz, .5, 0, 6.28); x.fill();
        }
        x.beginPath(); x.ellipse(tx, ty - 3 * sz, .9 * sz, 2.4 * sz, 0, 0, 6.28); x.fill();
      }
      if (shade) {
        const sh = x.createLinearGradient(0, 0, w * .85, 0);
        sh.addColorStop(0, `rgba(${S.shade},.6)`); sh.addColorStop(1, `rgba(${S.shade},0)`);
        x.fillStyle = sh; x.fillRect(0, 0, w, h);
        const bt = x.createLinearGradient(0, h * .55, 0, h);
        bt.addColorStop(0, `rgba(${S.shade},0)`); bt.addColorStop(1, `rgba(${S.shade},.28)`);
        x.fillStyle = bt; x.fillRect(0, 0, w, h);
      }
      if (!reduce || shown < 1) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [sky, shade, density]);

  return <canvas ref={ref} className={className} style={style} aria-hidden="true" />;
}
