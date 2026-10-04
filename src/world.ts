export const FIELD = 100;
export const ENTRY = 0.25;
export const AGENT_LOCK = 10;
export const DAY = 1;
export const CAREER_BLOCKS = 1842;
export const CAREER_LEGENDARY = 17;
export const CAREER_BOMBS = 3;
export const CAREER_RANK = 82;
export const CAREER_EFFICIENCY = 91;

export type FindKind =
  | "silence"
  | "hood"
  | "nft"
  | "multiplier"
  | "loot"
  | "bomb"
  | "event"
  | "key";

export interface Find {
  kind: FindKind;
  title: string;
  detail: string;
  hood: number;
  factor: number;
  rarity: "rare" | "legendary" | null;
}

export interface Recommendation {
  x: number;
  y: number;
  sector: string;
  note: string;
}

export interface DayCard {
  id: string;
  name: string;
  size: string;
  rule: string;
  live: boolean;
}

export interface CommunityMine {
  id: string;
  name: string;
  by: string;
  entry: string;
  blocks: string;
  rewards: string[];
  cut: string;
  note: string;
}

export const DAYS: DayCard[] = [
  {
    id: "001",
    name: "Genesis",
    size: "100×100",
    rule: "Full signal. Cut a block and the seam tells you what it held.",
    live: true,
  },
  {
    id: "002",
    name: "Robin",
    size: "150×150",
    rule: "A wider field. Same entry. More room to be wrong.",
    live: false,
  },
  {
    id: "003",
    name: "The Heist",
    size: "100×100",
    rule: "Treasure zones are marked. The marks are not the treasure.",
    live: false,
  },
  {
    id: "004",
    name: "Blackout",
    size: "100×100",
    rule: "Coordinates stay. Hints go dark. The agent speaks less.",
    live: false,
  },
  {
    id: "005",
    name: "Whale Hunt",
    size: "80×80",
    rule: "One heavy cache, unmarked. Everything else is quieter.",
    live: false,
  },
];

export const MINES: CommunityMine[] = [
  {
    id: "laszlo",
    name: "Laszlo's Mine",
    by: "Laszlo",
    entry: "0.25 USDC",
    blocks: "1,000 blocks",
    rewards: ["50 USDC", "10,000 HOOD", "3 NFTs"],
    cut: "4% creator",
    note: "A personal field. Entry still splits into the shared vein.",
  },
  {
    id: "robin",
    name: "Robin DAO",
    by: "Robin",
    entry: "0.50 USDC",
    blocks: "400 blocks",
    rewards: ["200 USDC", "1 gate key"],
    cut: "3% creator",
    note: "A tighter cut for a smaller circle. Keys open the next map.",
  },
  {
    id: "void",
    name: "Void Club",
    by: "Void",
    entry: "0.10 USDC",
    blocks: "2,500 blocks",
    rewards: ["Salvage", "1 legendary"],
    cut: "5% creator",
    note: "Cheap entry, long field. Built for a community, not a drop.",
  },
];

export const BOARD: { name: string; blocks: number; you?: boolean }[] = [
  { name: "Kite", blocks: 2401 },
  { name: "North", blocks: 2210 },
  { name: "Sable", blocks: 2094 },
  { name: "Juno", blocks: 1966 },
  { name: "Moth", blocks: 1902 },
  { name: "Laszlo", blocks: CAREER_BLOCKS, you: true },
  { name: "Ivo", blocks: 1710 },
  { name: "Rue", blocks: 1664 },
  { name: "Poe", blocks: 1502 },
  { name: "Nox", blocks: 1420 },
];

const LOOT = ["Seam shard", "Coolant coil", "Signal plate", "Glass fuse"];
const EVENTS = [
  {
    title: "Aftershock",
    detail: "The sector shifts. No payout — the field itself changed.",
  },
  {
    title: "Blackout flicker",
    detail: "A strip goes quiet. Blocks already mapped stay mapped.",
  },
  {
    title: "Vein chorus",
    detail: "Several cuts land on the same line. The treasury notices.",
  },
];
const KEYS = ["Elite vein", "Robin gate", "Heist lock"];
const NFTS: { title: string; rarity: "rare" | "legendary" }[] = [
  { title: "Genesis core", rarity: "legendary" },
  { title: "Hood shard", rarity: "rare" },
  { title: "Night cut", rarity: "rare" },
];
const NOTES = [
  "Reward density clusters on this cut.",
  "Earlier days echo along this line.",
  "Traffic thins here. Seams stay shut longer.",
  "Short sessions keep leaving this edge.",
];

function mix(n: number) {
  let x = n >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

let fieldSeed = 1;
let cached: Recommendation | null = null;

export function setFieldSeed(seed: number) {
  fieldSeed = seed >>> 0 || 1;
  cached = null;
}

export function cellRoll(x: number, y: number, salt = 0) {
  const n =
    Math.imul(x + 1, 0x9e3779b1) ^
    Math.imul(y + 1, 0x85ebca6b) ^
    Math.imul(fieldSeed + salt * 13, 0xc2b2ae35) ^
    Math.imul(DAY, 0x27d4eb2f);
  return mix(n);
}

export type Tier = "soft" | "hit" | "jackpot" | "break";

export function tierOf(find: Find): Tier {
  switch (find.kind) {
    case "silence":
      return "soft";
    case "bomb":
      return "break";
    case "nft":
      return find.rarity === "legendary" ? "jackpot" : "hit";
    case "key":
      return "jackpot";
    case "hood":
      return find.hood >= 28 ? "jackpot" : "hit";
    case "multiplier":
      return find.factor >= 3 ? "jackpot" : "hit";
    case "loot":
    case "event":
      return "hit";
    default: {
      const _never: never = find.kind;
      return _never;
    }
  }
}

export function grantsFreeCut(find: Find) {
  const tier = tierOf(find);
  if (tier === "jackpot" || find.kind === "bomb") return true;
  if (find.kind === "hood" && find.hood >= 18) return true;
  return false;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function sectorName(x: number, y: number) {
  const col = "ABCDEFGHIJ"[clamp(Math.floor(x / 10), 0, 9)] ?? "A";
  const row = clamp(Math.floor(y / 10) + 1, 1, 10);
  return `${row}${col}`;
}

export function findAt(x: number, y: number): Find {
  const roll = cellRoll(x, y, 1);
  const slant = cellRoll(x, y, 2);
  if (roll < 0.46) {
    return {
      kind: "silence",
      title: "Nothing",
      detail: "Dead rock. The seam paid nothing.",
      hood: 0,
      factor: 1,
      rarity: null,
    };
  }
  if (roll < 0.68) {
    const hood = 8 + Math.floor(slant * 33);
    return {
      kind: "hood",
      title: `${hood} HOOD`,
      detail: "Raw seam metal. Spend it on tools, elite cuts, or your agent.",
      hood,
      factor: 1,
      rarity: null,
    };
  }
  if (roll < 0.78) {
    const name = LOOT[Math.floor(slant * LOOT.length)] ?? LOOT[0];
    return {
      kind: "loot",
      title: name,
      detail: "Field salvage. It sits in your pack until a later map needs it.",
      hood: 0,
      factor: 1,
      rarity: null,
    };
  }
  if (roll < 0.86) {
    const factor = slant > 0.72 ? 3 : 2;
    return {
      kind: "multiplier",
      title: `×${factor} next metal`,
      detail: "The next HOOD seam pays multiplied. One use. It does not stack.",
      hood: 0,
      factor,
      rarity: null,
    };
  }
  if (roll < 0.91) {
    const event = EVENTS[Math.floor(slant * EVENTS.length)] ?? EVENTS[0];
    return {
      kind: "event",
      title: event.title,
      detail: event.detail,
      hood: 0,
      factor: 1,
      rarity: null,
    };
  }
  if (roll < 0.95) {
    const area = KEYS[Math.floor(slant * KEYS.length)] ?? KEYS[0];
    return {
      kind: "key",
      title: `Key · ${area}`,
      detail: "Access, not a prize. This name opens on a later day.",
      hood: 0,
      factor: 1,
      rarity: null,
    };
  }
  if (roll < 0.98) {
    const nft = NFTS[Math.floor(slant * NFTS.length)] ?? NFTS[0];
    return {
      kind: "nft",
      title: nft.title,
      detail: `${nft.rarity === "legendary" ? "Legendary" : "Rare"} find. Bound to your passport. HOOD can upgrade it later.`,
      hood: 0,
      factor: 1,
      rarity: nft.rarity,
    };
  }
  return {
    kind: "bomb",
    title: "Vent breach",
    detail: "The seam collapsed. You keep what you already hold. The entry stays in the treasury.",
    hood: 0,
    factor: 1,
    rarity: null,
  };
}

export function present(find: Find, multiplier: number): Find {
  if (find.kind !== "hood" || multiplier <= 1) return find;
  const hood = find.hood * multiplier;
  return {
    ...find,
    hood,
    title: `${hood} HOOD`,
    detail: `Seam metal. The ×${multiplier} you were holding is spent.`,
  };
}

function baseScore(find: Find) {
  switch (find.kind) {
    case "nft":
      return 1;
    case "key":
      return 0.84;
    case "hood":
      return 0.55 + find.hood / 90;
    case "multiplier":
      return 0.66;
    case "event":
      return 0.5;
    case "loot":
      return 0.4;
    case "bomb":
      return 0.08;
    case "silence":
      return 0.16;
    default: {
      const _never: never = find.kind;
      return _never;
    }
  }
}

export function signalScore(x: number, y: number) {
  const noise = cellRoll(y, x, 4);
  return baseScore(findAt(x, y)) * 0.72 + noise * 0.28;
}

export function recommend(): Recommendation {
  if (cached) return cached;
  let bestX = 54;
  let bestY = 66;
  let best = -1;
  for (let y = 2; y < FIELD - 2; y += 4) {
    for (let x = 2; x < FIELD - 2; x += 4) {
      const score = signalScore(x, y);
      if (score > best) {
        best = score;
        bestX = x;
        bestY = y;
      }
    }
  }
  for (let y = bestY - 4; y <= bestY + 4; y += 1) {
    for (let x = bestX - 4; x <= bestX + 4; x += 1) {
      if (x < 0 || y < 0 || x >= FIELD || y >= FIELD) continue;
      const score = signalScore(x, y);
      if (score > best) {
        best = score;
        bestX = x;
        bestY = y;
      }
    }
  }
  const note = NOTES[Math.floor(cellRoll(bestX, bestY, 3) * NOTES.length)] ?? NOTES[0];
  cached = { x: bestX, y: bestY, sector: sectorName(bestX, bestY), note };
  return cached;
}

export function priorMiner(x: number, y: number) {
  const roll = cellRoll(x, y, 8);
  if (roll > 0.12) return null;
  const n = 1000 + Math.floor(cellRoll(x, y, 9) * 8000);
  return `#${String(n).padStart(4, "0")}`;
}

export interface CrewHit {
  id: string;
  x: number;
  y: number;
  title: string;
  kind: FindKind;
  hot: boolean;
}

function hotKind(kind: FindKind) {
  switch (kind) {
    case "hood":
    case "nft":
    case "key":
    case "multiplier":
      return true;
    case "loot":
    case "event":
    case "bomb":
    case "silence":
      return false;
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

export function crewPulse(tick: number): CrewHit {
  let x = 0;
  let y = 0;
  let find = findAt(0, 0);
  for (let step = 0; step < 8; step += 1) {
    x = Math.floor(cellRoll(tick, step, 11) * FIELD);
    y = Math.floor(cellRoll(step, tick, 12) * FIELD);
    find = findAt(x, y);
    if (find.kind !== "silence" && find.kind !== "bomb") break;
  }
  const n = 1000 + Math.floor(cellRoll(x, y, 9) * 8000);
  return {
    id: String(n).padStart(4, "0"),
    x,
    y,
    title: find.title,
    kind: find.kind,
    hot: hotKind(find.kind),
  };
}

export function crewCount(tick: number) {
  return 9 + Math.floor(cellRoll(tick, 2, 15) * 18);
}

export function witnesses(x: number, y: number) {
  return [0, 1, 2].map((i) => {
    const n = 1000 + Math.floor(cellRoll(x + i * 3, y + i, 21 + i) * 8000);
    return String(n).padStart(4, "0");
  });
}

export function originFor(focusX: number, focusY: number, cols: number, rows: number) {
  const ox = clamp(focusX - Math.floor((cols - 1) / 2), 0, FIELD - cols);
  const oy = clamp(focusY - Math.floor((rows - 1) / 2), 0, FIELD - rows);
  return { ox, oy };
}

export function signalsInView(
  ox: number,
  oy: number,
  cols: number,
  rows: number,
  sector: string,
  hidden: (x: number, y: number) => boolean,
) {
  const scored: { x: number; y: number; s: number }[] = [];
  for (let y = oy; y < oy + rows; y += 1) {
    for (let x = ox; x < ox + cols; x += 1) {
      if (sectorName(x, y) !== sector || !hidden(x, y)) continue;
      scored.push({ x, y, s: signalScore(x, y) });
    }
  }
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, 3);
}

export function bestHidden(
  rec: Recommendation,
  hidden: (x: number, y: number) => boolean,
) {
  const sx = Math.floor(rec.x / 10) * 10;
  const sy = Math.floor(rec.y / 10) * 10;
  let best: { x: number; y: number; s: number } | null = null;
  for (let y = sy; y < sy + 10; y += 1) {
    for (let x = sx; x < sx + 10; x += 1) {
      if (!hidden(x, y)) continue;
      const s = signalScore(x, y);
      if (!best || s > best.s) best = { x, y, s };
    }
  }
  return best ? { x: best.x, y: best.y } : null;
}

export function nextMultiplier(current: number, find: Find) {
  switch (find.kind) {
    case "multiplier":
      return find.factor;
    case "hood":
    case "bomb":
      return 1;
    case "silence":
    case "nft":
    case "loot":
    case "event":
    case "key":
      return current;
    default: {
      const _never: never = find.kind;
      return _never;
    }
  }
}

export function efficiency(sessionCuts: number, useful: number) {
  if (sessionCuts === 0) return CAREER_EFFICIENCY;
  const session = Math.round((useful / sessionCuts) * 100);
  return Math.round(
    (CAREER_EFFICIENCY * CAREER_BLOCKS + session * sessionCuts) /
      (CAREER_BLOCKS + sessionCuts),
  );
}

export function rankFor(sessionCuts: number) {
  return Math.max(9, CAREER_RANK - sessionCuts);
}

export function money(n: number, digits = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function countdown(now: number) {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const ms = Math.max(0, next.getTime() - now);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}
