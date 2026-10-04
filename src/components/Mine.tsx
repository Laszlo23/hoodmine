import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { blockUrl, useChain } from "../chain.tsx";
import { EthMark, Glyph, RobinMark } from "./Icons.tsx";
import { Sheet } from "./Sheet.tsx";
import { useNow, useWide } from "../hooks.ts";
import { useGame } from "../store.tsx";
import {
  clamp,
  countdown,
  crewCount,
  crewPulse,
  ENTRY,
  FIELD,
  findAt,
  money,
  originFor,
  priorMiner,
  recommend,
  sectorName,
  signalsInView,
} from "../world.ts";

export function Mine() {
  const { state, dispatch } = useGame();
  const chain = useChain();
  const wide = useWide();
  const now = useNow();
  const cols = wide ? 6 : 5;
  const rows = wide ? 6 : 5;
  const rec = recommend();
  const { ox, oy } = originFor(state.focusX, state.focusY, cols, rows);
  const here = sectorName(state.focusX, state.focusY) === rec.sector;
  const gridRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null);
  const moved = useRef(false);
  const hidden = (x: number, y: number) => !state.cuts[`${x},${y}`] && !priorMiner(x, y);
  const marked = new Set(
    signalsInView(ox, oy, cols, rows, rec.sector, hidden).map((cell) => `${cell.x},${cell.y}`),
  );
  const signalCount = marked.size;
  const signalLine =
    signalCount === 1
      ? "One signal is marked."
      : signalCount > 1
        ? `${signalCount === 3 ? "Three" : signalCount} signals are marked.`
        : "This part of the sector is already open.";
  const fresh = state.history[0];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (state.phase !== "idle") return;
      const step =
        event.key === "ArrowLeft" ? [-1, 0] :
        event.key === "ArrowRight" ? [1, 0] :
        event.key === "ArrowUp" ? [0, -1] :
        event.key === "ArrowDown" ? [0, 1] :
        null;
      if (!step) return;
      event.preventDefault();
      dispatch({
        type: "pan",
        x: clamp(state.focusX + step[0], 0, FIELD - 1),
        y: clamp(state.focusY + step[1], 0, FIELD - 1),
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, state.focusX, state.focusY, state.phase]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, fx: state.focusX, fy: state.focusY };
    moved.current = false;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) < 12) return;
    moved.current = true;
    const width = gridRef.current?.clientWidth ?? 1;
    const cell = width / cols;
    dispatch({
      type: "pan",
      x: clamp(Math.round(start.fx - dx / cell), 0, FIELD - 1),
      y: clamp(Math.round(start.fy - dy / cell), 0, FIELD - 1),
    });
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const selected = state.selected;
  const selectedKey = selected ? `${selected.x},${selected.y}` : "";
  const owned = selected ? state.cuts[selectedKey] : undefined;
  const prior = selected ? priorMiner(selected.x, selected.y) : null;
  const preview = selected && !owned ? findAt(selected.x, selected.y) : null;
  const shown = owned ?? (state.inspect === "prior" ? preview : null);
  const sheetOpen =
    !state.burst &&
    (state.phase === "arming" ||
      (state.phase === "drilling" && state.inspect !== "agent") ||
      (state.phase === "reveal" && state.inspect !== "agent" && state.inspect !== "none"));
  const free = state.freeCuts > 0;
  const crewTick = Math.floor(now / 2200);
  const crew = crewPulse(crewTick);
  const miners = crewCount(crewTick);
  const scansLeft = Math.max(0, 5 - state.scansToday);

  return (
    <section className="mine">
      <div className="eyebrow-row">
        <p className="eyebrow">
          Day 001 · Genesis · {FIELD}×{FIELD}
        </p>
        {chain.live && chain.block ? (
          <a className="eyebrow chain-link" href={blockUrl(chain.block)} target="_blank" rel="noreferrer">
            <i />
            {chain.block.toLocaleString("en-US")}
          </a>
        ) : (
          <p className="eyebrow dim">Next map {countdown(now)}</p>
        )}
      </div>

      <div className={`crew ${crew.hot ? "hot" : ""}`} key={crewTick}>
        <span className="crew-live"><i />{miners} live</span>
        <b>#{crew.id}</b>
        <span>
          {String(crew.x).padStart(2, "0")},{String(crew.y).padStart(2, "0")}
        </span>
        <em>{crew.title}</em>
        {crew.hot ? <EthMark /> : null}
      </div>

      <div className="whisper">
        <RobinMark />
        <div>
          <p className="whisper-k">I would mine</p>
          <p className="whisper-t">{rec.sector}</p>
          <p className="whisper-d">
            {here
              ? `${signalLine} You choose the block.`
              : `${rec.note} You choose the block.`}
          </p>
        </div>
        {here ? (
          <span className="whisper-go quiet">On this cut</span>
        ) : (
          <button
            className="whisper-go"
            onClick={() => dispatch({ type: "pan", x: rec.x, y: rec.y })}
          >
            Go to {rec.sector}
          </button>
        )}
      </div>

      <div className={`plate ${state.agentOn ? "agent-live" : ""}`}>
        <span className="tick tl" />
        <span className="tick tr" />
        <span className="tick bl" />
        <span className="tick br" />
        <div className="plate-meta">
          <span>Sector {sectorName(state.focusX, state.focusY)}</span>
          <span>
            X{String(state.focusX).padStart(2, "0")} Y{String(state.focusY).padStart(2, "0")}
          </span>
          <span>{state.agentOn ? "Agent cutting" : "Drag the field"}</span>
        </div>
        <div
          className="grid"
          ref={gridRef}
          style={{ "--cols": cols } as React.CSSProperties}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {Array.from({ length: rows * cols }, (_, index) => {
              const col = index % cols;
              const row = Math.floor(index / cols);
              const x = ox + col;
              const y = oy + row;
              const key = `${x},${y}`;
              const cut = state.cuts[key];
              const old = priorMiner(x, y);
              const find = cut ?? (old ? findAt(x, y) : null);
              const drilling = state.phase === "drilling" && selectedKey === key;
              const armed = state.phase === "arming" && selectedKey === key;
              const label = find
                ? `${find.title} at ${x}, ${y}`
                : `Sealed block ${x}, ${y}`;
              return (
                <button
                  key={key}
                  className={[
                    "cell",
                    find ? "open" : "",
                    cut ? "yours" : "",
                    old ? "prior" : "",
                    marked.has(key) ? "signal" : "",
                    fresh === key ? "fresh" : "",
                    fresh === key && find?.kind === "silence" ? "dead" : "",
                    fresh === key && find && find.kind !== "silence" && find.kind !== "bomb" ? "pay" : "",
                    drilling ? "drilling" : "",
                    armed ? "armed" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  data-kind={find?.kind}
                  aria-label={label}
                  onClick={() => {
                    if (moved.current) return;
                    dispatch({ type: "arm", x, y });
                  }}
                >
                  {find ? <Glyph kind={find.kind} factor={find.factor} /> : <i className="g g-seal" />}
                  {old ? <em className="miner-tag">{old}</em> : null}
                </button>
              );
            })}
        </div>
        <ul className="legend">
          <li><i className="swatch signal" /> Signal</li>
          <li><i className="swatch prior" /> Mapped</li>
          <li><i className="swatch yours" /> Yours</li>
          {state.multiplier > 1 ? <li className="mult">×{state.multiplier} armed</li> : null}
        </ul>
      </div>

      <div className="meters">
        <div>
          <span>Treasury</span>
          <b>{money(state.treasury)}</b>
        </div>
        <div>
          <span>Your HOOD</span>
          <b>{money(state.hood, 1)}</b>
        </div>
        <div>
          <span>{free ? "Free cuts" : "Entry"}</span>
          <b>{free ? state.freeCuts : money(ENTRY)}</b>
        </div>
      </div>
      {state.rite >= 3 ? (
        <p className="fine">
          {chain.live && chain.anchor
            ? `Seeded from chain block ${chain.anchor.toLocaleString("en-US")}. Free cuts spend nothing. Paid cuts burn 10%.`
            : "Chain delayed. Free cuts still work."}
        </p>
      ) : null}

      {sheetOpen && selected ? (
        <Sheet
          onClose={() => dispatch({ type: "close" })}
          kind={shown?.kind}
        >
          {state.phase === "arming" ? (
            <>
              <p className="sheet-k">Sealed block</p>
              <h2 className="sheet-title">
                X{String(selected.x).padStart(2, "0")} · Y{String(selected.y).padStart(2, "0")}
              </h2>
              <p className="sheet-d">
                {free
                  ? `This one is free. ${state.freeCuts} left, then a cut is ${money(ENTRY)} from your reserve.`
                  : "A paid cut stays in the vein. You are opening a block, not buying a prize."}
              </p>
              <div className="stack" aria-hidden="true">
                <span className="s-treasury" />
                <span className="s-rewards" />
                <span className="s-build" />
                <span className="s-burn" />
              </div>
              <ul className="split-keys">
                <li>40 treasury</li>
                <li>35 rewards</li>
                <li>15 build</li>
                <li>10 burn</li>
              </ul>
              {free || state.usdc >= ENTRY ? (
                <button className="cut" onClick={() => dispatch({ type: "drill" })}>
                  {free ? `Free cut · ${state.freeCuts} left` : `Cut block · ${money(ENTRY)}`}
                </button>
              ) : (
                <button
                  className="cut"
                  disabled={scansLeft === 0}
                  onClick={() => dispatch({ type: "scan" })}
                >
                  {scansLeft === 0 ? "Free cuts refill tomorrow" : `Scan for a free cut · ${scansLeft} left`}
                </button>
              )}
              <p className="fine center">
                {free ? "Nothing is spent on a free cut." : "Seal a find afterward to write it on Robinhood Chain."}
              </p>
            </>
          ) : null}
          {state.phase === "drilling" ? (
            <>
              <p className="sheet-k">Cutting</p>
              <h2 className="sheet-title">Opening the seam</h2>
              <div className="drill-bar" />
            </>
          ) : null}
          {state.phase === "reveal" && shown ? (
            <>
              <p className="sheet-k">
                {prior && !owned ? `Mapped by miner ${prior}` : owned && state.inspect === "own" ? "Your cut" : "Found"}
              </p>
              <div className={`sheet-mark kind-${shown.kind}`}>
                <Glyph kind={shown.kind} factor={shown.factor} />
              </div>
              <h2 className="sheet-title">{shown.title}</h2>
              <p className="sheet-d">{shown.detail}</p>
              <button className="cut ghost" onClick={() => dispatch({ type: "close" })}>
                Back to the field
              </button>
            </>
          ) : null}
        </Sheet>
      ) : null}
    </section>
  );
}
