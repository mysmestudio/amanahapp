// @ts-nocheck
import { useEffect, useState } from "react";
import { CFG, ROOM, compute } from "./content";

const KEY = "granary:";
const listeners = new Set<() => void>();
export const load = (k, d = null) => { try { const v = JSON.parse(localStorage.getItem(KEY + k)); return v ?? d; } catch { return d; } };
export const save = (k, v) => { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch {} listeners.forEach(f => f()); };

/* migrate from the workshop prototype once */
(function migrate(){ try { if (!localStorage.getItem(KEY + "last") && localStorage.getItem("amanahpath:last")) {
  ["last","history","picks","course","legacy"].forEach(k => { const v = localStorage.getItem("amanahpath:" + k); if (v) localStorage.setItem(KEY + k, v); });
} } catch {} })();

export function useStore<T>(k: string, d: T = null): [T, (v: T) => void] {
  const [, force] = useState(0);
  useEffect(() => { const f = () => force(n => n + 1); listeners.add(f); return () => { listeners.delete(f); }; }, []);
  return [load(k, d), (v) => save(k, v)];
}

export function result() { const last = load("last"); return last ? { ...compute(last.answers), last } : null; }

export async function api(path, body, wantJson = false) {
  const res = await fetch(CFG.url + "/rest/v1/" + path, { method: "POST", headers: { apikey: CFG.key, Authorization: "Bearer " + CFG.key, "Content-Type": "application/json", Prefer: wantJson ? "return=representation" : "return=minimal" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return wantJson ? res.json() : null;
}
export const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); }));

export function saveCheck(answers) {
  const r = compute(answers);
  const checkId = uuid();
  const last = { at: Date.now(), score: r.score, stageName: r.stage.name, answers, checkId };
  const history = [...load("history", []), { at: last.at, score: r.score }].slice(-36);
  save("history", history); save("picks", {}); save("draft", null); save("last", last);
  api("checks", { id: checkId, room: ROOM, country: answers.country || null, score: r.score, stage: r.stage.id, weakest: r.weakest, levers: r.lev }).catch(() => save("offline", true));
  return r;
}

function urlB64ToUint8(b64) { const pad = "=".repeat((4 - b64.length % 4) % 4); const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...raw].map(c => c.charCodeAt(0))); }
export async function subscribePush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) throw new Error("Push notifications aren't available in this browser. Email or calendar reminders will work instead.");
  const reg = await navigator.serviceWorker.register("/sw.js");
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Notifications were not allowed. You can turn them on later in your browser settings.");
  await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8(CFG.vapid) });
  return sub.toJSON();
}
