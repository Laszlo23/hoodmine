import { useState } from "react";
import { Sheet } from "./Sheet.tsx";
import { useGame } from "../store.tsx";
import { MINES, money, type CommunityMine } from "../world.ts";

const FLOW = [
  "Players enter",
  "They cut the field",
  "Entry feeds the vein",
  "The vein funds rewards",
  "The field gets louder",
  "More players arrive",
];

const SECOND = [
  "Players open mines",
  "Communities arrive",
  "More fields exist",
  "More players return",
];

export function Economy() {
  const { state } = useGame();
  const pools = [
    { label: "Treasury", value: state.treasury, cls: "s-treasury" },
    { label: "Rewards", value: state.rewards, cls: "s-rewards" },
    { label: "Build", value: state.build, cls: "s-build" },
    { label: "Burn", value: state.burned, cls: "s-burn" },
  ];
  return (
    <section className="panel">
      <p className="whisper-k">Every entry</p>
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
      <dl className="pools">
        {pools.map((pool) => (
          <div key={pool.label}>
            <dt><i className={pool.cls} />{pool.label}</dt>
            <dd>{money(pool.value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Vault() {
  const { dispatch } = useGame();
  const [open, setOpen] = useState<CommunityMine | null>(null);
  return (
    <section className="page">
      <p className="eyebrow">Game vein</p>
      <h1 className="poster">
        Players fund
        <br />
        the vein.
        <br />
        <em>The vein pays the field.</em>
      </h1>
      <p className="lede">
        Entry does not vanish as a bet. A fixed split stays in the economy, funds rewards, keeps the build alive, and burns a slice.
      </p>
      <Economy />
      <h2 className="section-label">Flywheel</h2>
      <ol className="wheel">
        {FLOW.map((step, index) => (
          <li key={step} style={{ animationDelay: `${index * 0.8}s` }}>{step}</li>
        ))}
      </ol>
      <h2 className="section-label">Communities</h2>
      <ol className="wheel slow">
        {SECOND.map((step, index) => (
          <li key={step} style={{ animationDelay: `${index * 0.9}s` }}>{step}</li>
        ))}
      </ol>
      <h2 className="section-label">Player mines</h2>
      <div className="mine-row">
        {MINES.map((mine, index) => (
          <button key={mine.id} className="community" onClick={() => setOpen(mine)}>
            <span>0{index + 1}</span>
            <strong>{mine.name}</strong>
            <em>{mine.entry}</em>
            <small>{mine.blocks}</small>
          </button>
        ))}
      </div>
      <p className="fine">
        The live block is Robinhood Chain. Vein totals are this game. Seal a find when you want that cut written on chain.
      </p>
      <button className="text-link danger" onClick={() => dispatch({ type: "reset" })}>
        Reset this prototype
      </button>
      {open ? (
        <Sheet onClose={() => setOpen(null)}>
          <p className="sheet-k">{open.by}</p>
          <h2 className="sheet-title">{open.name}</h2>
          <p className="sheet-d">{open.note}</p>
          <ul className="brief">
            <li><span>Entry</span><b>{open.entry}</b></li>
            <li><span>Field</span><b>{open.blocks}</b></li>
            <li><span>Creator</span><b>{open.cut}</b></li>
            <li><span>Rewards</span><b>{open.rewards.join(" · ")}</b></li>
          </ul>
          <button className="cut ghost" onClick={() => setOpen(null)}>
            Close preview
          </button>
        </Sheet>
      ) : null}
    </section>
  );
}
