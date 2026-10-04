import { IconSound } from "./Icons.tsx";
import { useGame, type Screen } from "../store.tsx";
import { money } from "../world.ts";

const LINKS: { id: Screen; label: string }[] = [
  { id: "mine", label: "Field" },
  { id: "map", label: "Days" },
  { id: "agent", label: "Agent" },
  { id: "passport", label: "Passport" },
  { id: "vault", label: "Vein" },
];

export function Header() {
  const { state, dispatch } = useGame();
  return (
    <header className="top">
      <button className="brand" onClick={() => dispatch({ type: "screen", screen: "mine" })}>
        HOOD<em>//</em>MINE
      </button>
      <nav className="nav" aria-label="Primary">
        {LINKS.map((link) => (
          <button
            key={link.id}
            className={state.screen === link.id ? "on" : ""}
            onClick={() => dispatch({ type: "screen", screen: link.id })}
          >
            {link.label}
          </button>
        ))}
      </nav>
      <div className="head-actions">
        <button
          className="icon-btn"
          aria-label={state.muted ? "Unmute" : "Mute"}
          onClick={() => dispatch({ type: "mute" })}
        >
          <IconSound off={state.muted} />
        </button>
        <span className="balance">
          <small>{state.freeCuts > 0 ? "Free cuts" : "Reserve"}</small>
          {state.freeCuts > 0 ? state.freeCuts : money(state.usdc)}
        </span>
      </div>
    </header>
  );
}
