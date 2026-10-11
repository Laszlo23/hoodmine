import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [slot, setSlot] = useState<HTMLElement | null>(() =>
    typeof document === "undefined" ? null : document.getElementById("hood-app"),
  );

  useEffect(() => {
    const find = () => document.getElementById("hood-app");
    const existing = find();
    if (existing) {
      setSlot(existing);
      return;
    }
    const observer = new MutationObserver(() => {
      const node = find();
      if (!node) return;
      setSlot(node);
      observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const tabs = ITEMS.map((item) => {
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        type="button"
        className={state.screen === item.id ? "hood-tab on" : "hood-tab"}
        onClick={() => dispatch({ type: "screen", screen: item.id })}
      >
        <Icon />
        <span>{item.label}</span>
      </button>
    );
  });

  if (slot) return createPortal(tabs, slot);
  return (
    <nav className="dock" aria-label="This app">
      {tabs}
    </nav>
  );
}
