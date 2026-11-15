// Nigeria Shariah-compliant financial services directory (2026), loaded from Eb'rahim's master spreadsheet
// (Nigeria_Islamic_Financial_Institutions_Directory_2026.xlsx → src/directory.json).
// Seedline never ranks: institutions are always shown A to Z.
import data from "./directory.json";

export type Goal = "save" | "grow" | "protect" | "home" | "retire" | "business" | "give";
export const GOALS: { id: Goal; label: string; line: string; tone: string; ask: string }[] = [
  { id: "save", label: "Save safely", ask: "keep my cushion safe", line: "Non-interest accounts and deposits for your cushion and daily money.", tone: "#1E7A4E" },
  { id: "grow", label: "Grow wealth", ask: "grow my money", line: "Halal mutual funds, sukuk, ETFs and robo-advice.", tone: "#13306B" },
  { id: "protect", label: "Protect family", ask: "protect my family", line: "Takaful cover for health, life, property and business.", tone: "#B4472A" },
  { id: "home", label: "Own a home or car", ask: "own a home or car", line: "Home, car and asset finance without interest.", tone: "#2A4FA8" },
  { id: "retire", label: "Retire well", ask: "retire well", line: "Non-interest pensions (RSA Fund VI) through your PFA.", tone: "#6B4FA8" },
  { id: "business", label: "Finance my business", ask: "grow my business", line: "Trade, SME and project finance on Islamic contracts.", tone: "#0F6E6E" },
  { id: "give", label: "Give lasting charity", ask: "give lasting charity", line: "Waqf and endowment funds that keep giving.", tone: "#B98A1F" }
];
export const goalOf = (id: string) => GOALS.find(g => g.id === id) || GOALS[0];

export type Product = { id: string; inst: string; instName: string; sector: string; name: string; contract: string; category: string; segment: string; min: string; tenure: string; pricing: string; features: string; goal: Goal };
export type Institution = { id: string; name: string; sector: string; kind: string; regulator: string; licence: string; since?: string; hq?: string; site?: string; contact?: string; protection?: string; shariah?: string; suite?: string; goals: Goal[]; products: string[] };
export type Contract = { name: string; meaning: string; how: string; risk: string; uses: string };

export const INSTITUTIONS: Institution[] = (data as any).institutions;
export const PRODUCTS: Product[] = (data as any).products;
export const CONTRACTS: Contract[] = (data as any).contracts;
export const SECTORS = Array.from(new Set(INSTITUTIONS.map(i => i.sector)));
export const REGULATORS = ["CBN", "SEC", "NAICOM", "PenCom"];
export const sortAZ = (a: { name: string }, b: { name: string }) => a.name.replace(/^The /, "").localeCompare(b.name.replace(/^The /, ""));
export const countByGoal = (g: Goal) => INSTITUTIONS.filter(i => i.goals.includes(g)).length;
export const productsFor = (g: Goal) => PRODUCTS.filter(p => p.goal === g).sort((a, b) => a.instName.localeCompare(b.instName));
/* Find the contract card for a product's contract string, e.g. "Diminishing Musharakah / Ijarah" → Musharakah */
export function contractsIn(s: string) {
  const t = (s || "").toLowerCase();
  return CONTRACTS.filter(c => c.name.toLowerCase().split(/[\s/()]+/).filter(w => w.length > 3 && !["hassan"].includes(w)).some(w => t.includes(w.slice(0, Math.max(5, w.length - 1)))));
}
