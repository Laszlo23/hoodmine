import { IconAgent, IconMap, IconMine, IconPass, IconVault } from "./Icons.tsx";
import { useGame, type Screen } from "../store.tsx";

const ITEMS: { id: Screen; label: string; icon: typeof IconMine }[] = [
  { id: "mine", label: "Field", icon: IconMine },
  { id: "map", label: "Days", icon: IconMap },
  { id: "agent", label: "Agent", icon: IconAgent },
  { id: "passport", label: "Pass", icon: IconPass },
  { id: "vault", label: "Vein", icon: IconVault },
];

export function Dock() {
  const { state, dispatch } = useGame();
  return (
    <nav className="dock" aria-label="Primary">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={state.screen === item.id ? "on" : ""}
            onClick={() => dispatch({ type: "screen", screen: item.id })}
          >
            <Icon />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
