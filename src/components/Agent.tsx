import { useGame } from "../store.tsx";
import { AGENT_LOCK, money, recommend } from "../world.ts";

export function Agent({ variant }: { variant: "page" | "rail" }) {
  const { state, dispatch } = useGame();
  const rec = recommend();
  const locked = state.hood >= AGENT_LOCK;

  const control = (
    <div className="lock">
      <div>
        <p className="whisper-k">Agent mode</p>
        <p className="lock-t">
          {state.agentOn ? "Cutting inside your rules." : `Lock ${AGENT_LOCK} HOOD. It only cuts while the lock is on.`}
        </p>
      </div>
      <button
        className={state.agentOn ? "switch on" : "switch"}
        aria-pressed={state.agentOn}
        disabled={!state.agentOn && !locked}
        onClick={() => dispatch({ type: "agent" })}
      >
        <i />
        {state.agentOn ? "Pull lock" : "Mine for me"}
      </button>
      {!locked && !state.agentOn ? <p className="fine">Need {AGENT_LOCK} HOOD in the pack.</p> : null}
    </div>
  );

  const log = (
    <ol className="log">
      {state.log.length === 0 ? <li className="empty">No cuts yet this map.</li> : null}
      {state.log.slice(0, variant === "rail" ? 3 : 8).map((line, index) => (
        <li key={`${line}-${index}`}>{line}</li>
      ))}
    </ol>
  );

  if (variant === "rail") {
    return (
      <section className="panel">
        {control}
        {log}
        <button className="text-link" onClick={() => dispatch({ type: "screen", screen: "agent" })}>
          Open the brief
        </button>
      </section>
    );
  }

  return (
    <section className="page">
      <p className="eyebrow">AI mining agent</p>
      <h1 className="poster">
        It recommends.
        <br />
        <em>You mine.</em>
      </h1>
      <p className="lede">
        The agent reads old maps, density, traffic, and wallet rhythm. It can hold a lock and cut for you. The field still answers to you.
      </p>
      <p className="quote">“I would mine sector {rec.sector}.”</p>
      <ul className="brief">
        <li><span>Past maps</span><b>5 days on file</b></li>
        <li><span>Density</span><b>Sector {rec.sector}</b></li>
        <li><span>Activity</span><b>Edges cooling</b></li>
        <li><span>Wallets</span><b>Short sessions</b></li>
        <li><span>Read</span><b>{rec.note}</b></li>
        <li><span>Pack</span><b>{money(state.hood, 1)} HOOD</b></li>
      </ul>
      {control}
      <h2 className="section-label">Cut log</h2>
      {log}
    </section>
  );
}
