// Directory of Islamic / non-interest finance providers in Nigeria.
// SAMPLE DATA (15 Nov 2026): a handful of publicly licensed providers, products shown by category only.
// To be replaced with Eb'rahim's full directory. Listing order is alphabetical: Seedline never ranks.

export type Goal = "save" | "grow" | "protect" | "home" | "give";
export const GOALS: { id: Goal; label: string; line: string; tone: string }[] = [
  { id: "save", label: "Save safely", line: "Somewhere halal for your cushion and day-to-day money.", tone: "#1E7A4E" },
  { id: "grow", label: "Grow wealth", line: "Halal funds, sukuk and investments that put money to work.", tone: "#13306B" },
  { id: "protect", label: "Protect family", line: "Takaful cover for health, life and property.", tone: "#B4472A" },
  { id: "home", label: "Own a home or asset", line: "Home, car and asset finance without interest.", tone: "#2A4FA8" },
  { id: "give", label: "Give lasting charity", line: "Waqf and endowments that keep giving.", tone: "#B98A1F" }
];

export type Product = { name: string; goal: Goal };
export type Institution = {
  id: string; name: string; kind: string; regulator: string; region?: string;
  about: string; products: Product[]; site?: string; sample?: boolean;
};

export const INSTITUTIONS: Institution[] = [
  { id: "alternative-bank", name: "The Alternative Bank", kind: "Non-interest bank", regulator: "CBN", sample: true,
    about: "Full non-interest commercial bank.",
    products: [{ name: "Non-interest current and savings accounts", goal: "save" }, { name: "Asset and home finance", goal: "home" }] },
  { id: "jaiz-bank", name: "Jaiz Bank", kind: "Non-interest bank", regulator: "CBN", sample: true,
    about: "Nigeria's first full-fledged non-interest bank.",
    products: [{ name: "Non-interest current and savings accounts", goal: "save" }, { name: "Home and asset finance (Murabaha, Ijarah)", goal: "home" }, { name: "Investment deposit accounts", goal: "grow" }] },
  { id: "jaiz-takaful", name: "Jaiz Takaful", kind: "Takaful operator", regulator: "NAICOM", sample: true,
    about: "Islamic insurance built on mutual help.",
    products: [{ name: "Family and general takaful", goal: "protect" }] },
  { id: "lotus-bank", name: "Lotus Bank", kind: "Non-interest bank", regulator: "CBN", sample: true,
    about: "Non-interest commercial bank.",
    products: [{ name: "Non-interest current and savings accounts", goal: "save" }, { name: "Asset finance", goal: "home" }] },
  { id: "noor-takaful", name: "Noor Takaful", kind: "Takaful operator", regulator: "NAICOM", sample: true,
    about: "Takaful operator licensed in 2019.",
    products: [{ name: "Family and general takaful", goal: "protect" }] },
  { id: "summit-bank", name: "Summit Bank", kind: "Non-interest bank (regional)", regulator: "CBN", region: "Regional licence", sample: true,
    about: "Regional non-interest bank, licensed in 2025.",
    products: [{ name: "Non-interest accounts", goal: "save" }, { name: "Asset finance", goal: "home" }] },
  { id: "taj-bank", name: "TAJBank", kind: "Non-interest bank", regulator: "CBN", sample: true,
    about: "Non-interest commercial bank.",
    products: [{ name: "Non-interest current and savings accounts", goal: "save" }, { name: "Home and asset finance", goal: "home" }, { name: "Investment accounts", goal: "grow" }] },
  { id: "fgn-sukuk", name: "FGN Sovereign Sukuk", kind: "Government sukuk", regulator: "DMO", sample: true,
    about: "Federal Government Ijarah sukuk, issued through the Debt Management Office.",
    products: [{ name: "Sovereign sukuk (through a stockbroker or bank)", goal: "grow" }] }
];

export const KINDS = Array.from(new Set(INSTITUTIONS.map(i => i.kind.replace(/ \(.*\)$/, ""))));
export const countByGoal = (g: Goal) => INSTITUTIONS.filter(i => i.products.some(p => p.goal === g)).length;
