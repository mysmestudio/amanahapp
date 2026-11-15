// @ts-nocheck
// Draws the Seedline family certificate as a 1600×1000 PNG (download / share). No external libraries.
const NAVY = "#0A1A3F", NAVY2 = "#13306B", GOLD = "#D9A93A", GOLD_ON = "#231800", WHITE = "#FFFFFF", MUTED = "#C9D3E6";
const PLANT = [
  ["M12 8.5c0-2.2 1.2-3.8 3-4.5", "E12,14.5,5,6"],
  ["M12 21V11", "M12 13c-4 0-6-2.5-6-6 3.5 0 6 2 6 6z", "M12 11c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6z"],
  ["M12 22V4", "M12 9c-3 0-5-2-5-5 3 0 5 2 5 5z", "M12 13c3 0 5-2 5-5-3 0-5 2-5 5z", "M12 18c-3 0-5-2-5-5 3 0 5 2 5 5z"],
  ["M12 22V7", "E12,4.5,1.6,2.5", "R9.3,9,1.8,3,-28", "R14.7,9,1.8,3,28", "R9.3,14,1.8,3,-28", "R14.7,14,1.8,3,28"]
];
function plant(ctx, stage, x, y, size, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (const d of PLANT[stage] || PLANT[0]) {
    if (d[0] === "E" || d[0] === "R") {
      const [cx, cy, rx, ry, rot = 0] = d.slice(1).split(",").map(Number);
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, rot * Math.PI / 180, 0, Math.PI * 2); ctx.stroke();
    } else ctx.stroke(new Path2D(d));
  }
  ctx.restore();
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }
function fitText(ctx, text, maxW, weight, start, min = 40) {
  let s = start; ctx.font = `${weight} ${s}px Geist, Inter, system-ui, sans-serif`;
  while (ctx.measureText(text).width > maxW && s > min) { s -= 4; ctx.font = `${weight} ${s}px Geist, Inter, system-ui, sans-serif`; }
  return s;
}

export async function drawCertificate({ name, score, stageIdx, plantName, stageName, strengths = [], date, qr }) {
  try { await document.fonts.ready; } catch {}
  const W = 1600, H = 1000, c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  ctx.fillStyle = NAVY; ctx.fillRect(0, 0, W, H);
  // field rows motif
  ctx.save(); ctx.globalAlpha = .18; ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
  for (let i = 0; i < 17; i++) { ctx.beginPath(); ctx.moveTo(1180, 560); ctx.lineTo(760 + i * 60, H + 40); ctx.stroke(); }
  ctx.restore();
  // frame
  ctx.strokeStyle = GOLD; ctx.lineWidth = 3; rr(ctx, 40, 40, W - 80, H - 80, 34); ctx.stroke();
  ctx.lineWidth = 1; ctx.globalAlpha = .45; rr(ctx, 58, 58, W - 116, H - 116, 26); ctx.stroke(); ctx.globalAlpha = 1;
  // brand
  ctx.fillStyle = WHITE; rr(ctx, 110, 108, 64, 64, 18); ctx.fillStyle = NAVY2; ctx.fill();
  plant(ctx, 1, 122, 120, 40, WHITE);
  ctx.fillStyle = WHITE; ctx.font = "800 38px Geist, Inter, sans-serif"; ctx.textBaseline = "middle"; ctx.fillText("Seedline", 192, 141);
  ctx.fillStyle = GOLD; ctx.font = "700 22px Geist, Inter, sans-serif"; ctx.fillText("FAMILY WEALTH CHECK · CERTIFICATE", 110, 238);
  // name
  ctx.fillStyle = MUTED; ctx.font = "500 30px Geist, Inter, sans-serif"; ctx.fillText("This certifies that", 110, 300);
  ctx.fillStyle = WHITE; const ns = fitText(ctx, name, 880, 800, 96); ctx.fillText(name, 106, 300 + ns * .9);
  const y2 = 300 + ns * .9 + 78;
  ctx.fillStyle = MUTED; ctx.font = "500 32px Geist, Inter, sans-serif";
  ctx.fillText(`is growing at the ${plantName} stage: ${stageName.toLowerCase()}.`, 110, y2);
  // strengths
  let x = 110; const y3 = y2 + 82;
  if (strengths.length) { ctx.fillStyle = GOLD; ctx.font = "700 20px Geist, Inter, sans-serif"; ctx.fillText("STRENGTHS", 110, y3 - 4); }
  ctx.font = "600 26px Geist, Inter, sans-serif";
  strengths.slice(0, 3).forEach(t => { const w = ctx.measureText(t).width + 44; ctx.strokeStyle = WHITE; ctx.lineWidth = 2; rr(ctx, x, y3 + 22, w, 54, 27); ctx.stroke(); ctx.fillStyle = WHITE; ctx.fillText(t, x + 22, y3 + 50); x += w + 14; });
  // score disc
  ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(1270, 330, 170, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = GOLD_ON; ctx.textAlign = "center"; ctx.font = "800 150px Geist, Inter, sans-serif"; ctx.fillText(String(score), 1270, 310);
  ctx.font = "700 26px Geist, Inter, sans-serif"; ctx.fillText("OF 100", 1270, 410);
  ctx.textAlign = "left";
  // plant badge
  ctx.strokeStyle = GOLD; ctx.lineWidth = 2; rr(ctx, 1220, 540, 100, 100, 28); ctx.stroke(); plant(ctx, stageIdx, 1240, 560, 60, WHITE);
  // footer
  ctx.fillStyle = MUTED; ctx.font = "500 24px Geist, Inter, sans-serif";
  ctx.fillText(`${date} · Launched at the MSMMI Marriage Workshop 2026`, 110, 880);
  ctx.globalAlpha = .7; ctx.font = "500 20px Geist, Inter, sans-serif"; ctx.fillText("A teaching indicator from 0 to 100, not financial or Shariah advice.", 110, 918); ctx.globalAlpha = 1;
  if (qr) { ctx.fillStyle = WHITE; rr(ctx, 1330, 760, 170, 170, 18); ctx.fill(); ctx.drawImage(qr, 1345, 775, 140, 140); ctx.fillStyle = MUTED; ctx.font = "600 20px Geist, Inter, sans-serif"; ctx.textAlign = "right"; ctx.fillText("Scan to take", 1306, 830); ctx.fillText("your own check", 1306, 858); ctx.textAlign = "left"; }
  return c;
}
export const canvasBlob = c => new Promise(res => c.toBlob(res, "image/png"));
