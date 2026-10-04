import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { miss, sting } from "./audio.ts";
import {
  AGENT_LOCK,
  bestHidden,
  ENTRY,
  findAt,
  grantsFreeCut,
  nextMultiplier,
  present,
  priorMiner,
  recommend,
  tierOf,
  type Find,
  type Tier,
} from "./world.ts";

export type Screen = "mine" | "map" | "agent" | "passport" | "vault";
export type Phase = "idle" | "arming" | "drilling" | "reveal";
export type Inspect = "none" | "own" | "prior" | "fresh" | "agent";

export interface Burst {
  find: Find;
  tier: Tier;
  granted: boolean;
  paid: boolean;
  x: number;
  y: number;
}

export interface State {
  screen: Screen;
  focusX: number;
  focusY: number;
  usdc: number;
  hood: number;
  freeCuts: number;
  scansToday: number;
  scanDay: string;
  coach: number;
  rite: number;
  treasury: number;
  rewards: number;
  build: number;
  burned: number;
  cuts: Record<string, Find>;
  history: string[];
  multiplier: number;
  agentOn: boolean;
  muted: boolean;
  selected: { x: number; y: number } | null;
  phase: Phase;
  inspect: Inspect;
  toast: string | null;
  log: string[];
  burst: Burst | null;
  scanning: boolean;
}

type Action =
  | { type: "screen"; screen: Screen }
  | { type: "pan"; x: number; y: number }
  | { type: "arm"; x: number; y: number }
  | { type: "close" }
  | { type: "drill" }
  | { type: "resolve" }
  | { type: "agent" }
  | { type: "agentCut" }
  | { type: "mute" }
  | { type: "toast"; text: string | null }
  | { type: "reset" }
  | { type: "dismissBurst" }
  | { type: "scan" }
  | { type: "scanDone" }
  | { type: "coachDismiss" }
  | { type: "riteNext" }
  | { type: "riteSkip" };

const KEY = "hoodmine-v2";
const SCANS_PER_DAY = 5;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function canAfford(state: State) {
  return state.freeCuts > 0 || state.usdc >= ENTRY - 1e-9;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const round1 = (n: number) => Math.round(n * 10) / 10;

function fresh(): State {
  const rec = recommend();
  return {
    screen: "mine",
    focusX: rec.x,
    focusY: rec.y,
    usdc: 1,
    hood: 0,
    freeCuts: 3,
    scansToday: 0,
    scanDay: todayKey(),
    coach: 0,
    rite: 0,
    treasury: 18420.5,
    rewards: 6400,
    build: 2110,
    burned: 860,
    cuts: {},
    history: [],
    multiplier: 1,
    agentOn: false,
    muted: false,
    selected: null,
    phase: "idle",
    inspect: "none",
    toast: null,
    log: [],
    burst: null,
    scanning: false,
  };
}

function isOpen(state: State, x: number, y: number) {
  return Boolean(state.cuts[`${x},${y}`] || priorMiner(x, y));
}

function lineFor(x: number, y: number, find: Find) {
  return `${String(x).padStart(2, "0")},${String(y).padStart(2, "0")} · ${find.title}`;
}

function applyCut(state: State, x: number, y: number, inspect: Inspect): State {
  if (!canAfford(state)) {
    return {
      ...state,
      phase: "idle",
      selected: null,
      inspect: "none",
      agentOn: false,
      toast: state.scansToday >= SCANS_PER_DAY ? "Free cuts refill tomorrow." : "Scan the seam for a free cut.",
    };
  }
  const key = `${x},${y}`;
  if (state.cuts[key] || priorMiner(x, y)) {
    return { ...state, phase: "reveal", inspect: state.cuts[key] ? "own" : "prior" };
  }
  const shown = present(findAt(x, y), state.multiplier);
  const paid = state.freeCuts <= 0;
  const tier = tierOf(shown);
  const granted = grantsFreeCut(shown);
  const logLine = lineFor(x, y, shown);
  const player = inspect !== "agent";
  const showBurst = player || tier === "jackpot" || tier === "break";
  const burst: Burst | null = showBurst ? { find: shown, tier, granted, paid, x, y } : null;
  return {
    ...state,
    usdc: paid ? round2(state.usdc - ENTRY) : state.usdc,
    freeCuts: Math.max(0, state.freeCuts - (paid ? 0 : 1)) + (granted ? 1 : 0),
    treasury: paid ? round2(state.treasury + ENTRY * 0.4) : state.treasury,
    rewards: paid ? round2(state.rewards + ENTRY * 0.35) : state.rewards,
    build: paid ? round2(state.build + ENTRY * 0.15) : state.build,
    burned: paid ? round2(state.burned + ENTRY * 0.1) : state.burned,
    hood: shown.kind === "hood" ? round1(state.hood + shown.hood) : state.hood,
    multiplier: nextMultiplier(state.multiplier, shown),
    cuts: { ...state.cuts, [key]: shown },
    history: [key, ...state.history],
    phase: burst ? "idle" : "reveal",
    inspect: burst ? "none" : inspect,
    selected: burst ? null : { x, y },
    coach: state.coach < 2 ? 2 : state.coach,
    toast:
      burst ? null : inspect === "agent" ? `Agent cut ${logLine}${granted ? " · +1 free cut" : ""}` : null,
    log: [logLine, ...state.log].slice(0, 8),
    burst,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "screen":
      return {
        ...state,
        screen: action.screen,
        phase: "idle",
        inspect: "none",
        selected: null,
      };
    case "pan":
      return {
        ...state,
        focusX: action.x,
        focusY: action.y,
        coach: state.coach === 0 ? 1 : state.coach,
      };
    case "arm": {
      if (state.phase === "drilling") return state;
      const key = `${action.x},${action.y}`;
      const owned = state.cuts[key];
      const prior = priorMiner(action.x, action.y);
      if (owned || prior) {
        return {
          ...state,
          selected: { x: action.x, y: action.y },
          phase: "reveal",
          inspect: owned ? "own" : "prior",
        };
      }
      return {
        ...state,
        selected: { x: action.x, y: action.y },
        phase: "arming",
        inspect: "none",
      };
    }
    case "close":
      return { ...state, phase: "idle", inspect: "none", selected: null };
    case "drill": {
      if (state.phase !== "arming" || !state.selected || state.scanning) return state;
      if (!canAfford(state)) {
        return {
          ...state,
          toast: state.scansToday >= SCANS_PER_DAY ? "Free cuts refill tomorrow." : "Scan the seam for a free cut.",
        };
      }
      return { ...state, phase: "drilling", inspect: "fresh" };
    }
    case "resolve": {
      if (state.phase !== "drilling" || !state.selected) return state;
      return applyCut(state, state.selected.x, state.selected.y, state.inspect === "agent" ? "agent" : "fresh");
    }
    case "agent": {
      if (state.agentOn) return { ...state, agentOn: false, toast: "Agent lock released." };
      if (state.hood < AGENT_LOCK) {
        return { ...state, toast: "Need 10 HOOD in the pack." };
      }
      if (state.usdc < ENTRY) {
        return { ...state, toast: "The agent spends reserve, not your free cuts." };
      }
      return { ...state, agentOn: true, toast: "Agent is cutting. Pull the lock anytime." };
    }
    case "agentCut": {
      if (!state.agentOn || state.phase !== "idle") return state;
      if (state.usdc < ENTRY) {
        return { ...state, agentOn: false, toast: "Reserve empty. Free cuts are still yours." };
      }
      const cell = bestHidden(recommend(), (x, y) => !isOpen(state, x, y));
      if (!cell) return { ...state, agentOn: false, toast: "Sector is fully mapped." };
      return {
        ...state,
        focusX: cell.x,
        focusY: cell.y,
        selected: cell,
        phase: "drilling",
        inspect: "agent",
      };
    }
    case "mute":
      return { ...state, muted: !state.muted };
    case "toast":
      return { ...state, toast: action.text };
    case "dismissBurst":
      return { ...state, burst: null };
    case "scan": {
      if (state.scanning || state.freeCuts > 0) return state;
      const scansToday = state.scanDay === todayKey() ? state.scansToday : 0;
      if (scansToday >= SCANS_PER_DAY) {
        return { ...state, scansToday, scanDay: todayKey(), toast: "Five scans used. They refill tomorrow." };
      }
      return { ...state, scanning: true, scansToday, scanDay: todayKey(), phase: "idle", selected: null, inspect: "none" };
    }
    case "scanDone":
      if (!state.scanning) return state;
      return {
        ...state,
        scanning: false,
        freeCuts: state.freeCuts + 1,
        scansToday: state.scansToday + 1,
        toast: "Free cut ready. Tap a sealed block.",
      };
    case "coachDismiss":
      return { ...state, coach: 3 };
    case "riteNext":
      if (state.rite >= 2) return { ...state, rite: 3, coach: 3 };
      return { ...state, rite: state.rite + 1 };
    case "riteSkip":
      return { ...state, rite: 3, coach: 3 };
    case "reset":
      return fresh();
    default: {
      const _never: never = action;
      return _never;
    }
  }
}

interface Save {
  v: 2;
  focusX: number;
  focusY: number;
  usdc: number;
  hood: number;
  freeCuts: number;
  scansToday: number;
  scanDay: string;
  coach: number;
  rite?: number;
  treasury: number;
  rewards: number;
  build: number;
  burned: number;
  cuts: Record<string, Find>;
  history: string[];
  multiplier: number;
  agentOn: boolean;
  muted: boolean;
  log: string[];
}

function load(): State {
  const base = fresh();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Partial<Save>;
    if (saved.v !== 2 || !saved.cuts || !saved.history) return base;
    const scanDay = saved.scanDay ?? todayKey();
    const sameDay = scanDay === todayKey();
    const played = saved.history.length > 0;
    return {
      ...base,
      focusX: saved.focusX ?? base.focusX,
      focusY: saved.focusY ?? base.focusY,
      usdc: saved.usdc ?? base.usdc,
      hood: saved.hood ?? base.hood,
      freeCuts: saved.freeCuts ?? base.freeCuts,
      scansToday: sameDay ? (saved.scansToday ?? 0) : 0,
      scanDay: todayKey(),
      coach: played ? 3 : (saved.coach ?? 0),
      rite: played ? 3 : (saved.rite ?? 0),
      treasury: saved.treasury ?? base.treasury,
      rewards: saved.rewards ?? base.rewards,
      build: saved.build ?? base.build,
      burned: saved.burned ?? base.burned,
      cuts: saved.cuts,
      history: saved.history,
      multiplier: saved.multiplier ?? 1,
      agentOn: Boolean(saved.agentOn) && (saved.usdc ?? 0) >= ENTRY,
      muted: Boolean(saved.muted),
      log: saved.log ?? [],
    };
  } catch {
    return base;
  }
}

interface Game {
  state: State;
  dispatch: (action: Action) => void;
}

const GameContext = createContext<Game | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const mutedRef = useRef(state.muted);
  const heard = useRef(state.history[0]);

  useEffect(() => {
    const save: Save = {
      v: 2,
      focusX: state.focusX,
      focusY: state.focusY,
      usdc: state.usdc,
      hood: state.hood,
      freeCuts: state.freeCuts,
      scansToday: state.scansToday,
      scanDay: state.scanDay,
      coach: state.coach,
      rite: state.rite,
      treasury: state.treasury,
      rewards: state.rewards,
      build: state.build,
      burned: state.burned,
      cuts: state.cuts,
      history: state.history,
      multiplier: state.multiplier,
      agentOn: state.agentOn,
      muted: state.muted,
      log: state.log,
    };
    localStorage.setItem(KEY, JSON.stringify(save));
  }, [state]);

  useEffect(() => {
    if (state.phase !== "drilling") return;
    const id = window.setTimeout(() => dispatch({ type: "resolve" }), 720);
    return () => window.clearTimeout(id);
  }, [state.phase, state.selected]);

  useEffect(() => {
    if (!state.agentOn) return;
    const id = window.setInterval(() => dispatch({ type: "agentCut" }), 2800);
    return () => window.clearInterval(id);
  }, [state.agentOn]);

  useEffect(() => {
    if (!state.toast) return;
    const id = window.setTimeout(() => dispatch({ type: "toast", text: null }), 2600);
    return () => window.clearTimeout(id);
  }, [state.toast]);

  useEffect(() => {
    if (state.phase === "reveal" && state.inspect === "agent") {
      const id = window.setTimeout(() => dispatch({ type: "close" }), 640);
      return () => window.clearTimeout(id);
    }
    return;
  }, [state.phase, state.inspect, state.history]);

  const latest = state.history[0];
  const latestFind = latest ? state.cuts[latest] : undefined;
  useEffect(() => {
    mutedRef.current = state.muted;
  }, [state.muted]);
  useEffect(() => {
    if (heard.current === latest) return;
    heard.current = latest;
    if (!latestFind || mutedRef.current) return;
    const tier = tierOf(latestFind);
    if (tier === "soft" && state.burst?.tier === "soft") miss();
    else sting(tier);
  }, [latest, latestFind, state.burst]);

  useEffect(() => {
    if (!state.scanning) return;
    const id = window.setTimeout(() => dispatch({ type: "scanDone" }), 1700);
    return () => window.clearTimeout(id);
  }, [state.scanning]);

  useEffect(() => {
    const sheet =
      Boolean(state.burst) ||
      state.scanning ||
      state.phase === "arming" ||
      (state.phase === "reveal" && state.inspect !== "agent") ||
      (state.phase === "drilling" && state.inspect !== "agent");
    document.body.classList.toggle("sheet-open", sheet);
    document.body.classList.toggle("rite-open", state.rite < 3);
  }, [state.phase, state.inspect, state.burst, state.scanning, state.rite]);

  return <GameContext value={{ state, dispatch }}>{children}</GameContext>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame outside provider");
  return ctx;
}
