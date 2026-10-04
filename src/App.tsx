import { useEffect } from "react";
import { ChainProvider, useChain } from "./chain.tsx";
import { Agent } from "./components/Agent.tsx";
import { Dock } from "./components/Dock.tsx";
import { Header } from "./components/Header.tsx";
import { Mine } from "./components/Mine.tsx";
import { Days } from "./components/Days.tsx";
import { Passport } from "./components/Passport.tsx";
import { Economy, Vault } from "./components/Vault.tsx";
import { RobinMark } from "./components/Icons.tsx";
import { Rite } from "./components/Rite.tsx";
import { WinBurst } from "./components/Win.tsx";
import { useWide } from "./hooks.ts";
import { GameProvider, useGame } from "./store.tsx";

function Shell() {
  const { state } = useGame();
  const wide = useWide();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.screen]);
  const deck = wide && state.screen === "mine";
  return (
    <div className={`app screen-${state.screen}`}>
      <Header />
      {deck ? (
        <aside className="rail">
          <Passport variant="rail" />
        </aside>
      ) : null}
      <main className="core">
        {state.screen === "mine" ? <Mine /> : null}
        {state.screen === "map" ? <Days /> : null}
        {state.screen === "agent" ? <Agent variant="page" /> : null}
        {state.screen === "passport" ? <Passport variant="page" /> : null}
        {state.screen === "vault" ? <Vault /> : null}
      </main>
      {deck ? (
        <aside className="side">
          <Economy />
          <Agent variant="rail" />
        </aside>
      ) : null}
      <Dock />
      {state.toast ? <p className="toast">{state.toast}</p> : null}
      {state.scanning ? (
        <div className="scan-film" role="status">
          <p>Scanning the seam</p>
          <i />
        </div>
      ) : null}
      <WinBurst />
      <Rite />
    </div>
  );
}

function Boot() {
  const chain = useChain();
  return (
    <div className="boot">
      <RobinMark />
      <p className="boot-mark">
        HOOD<em>//</em>MINE
      </p>
      <p>{chain.block ? "Anchoring today's field" : "Reading Robinhood Chain"}</p>
      <b>{chain.block ? `#${chain.block.toLocaleString("en-US")}` : "···"}</b>
      <i className="boot-bar" />
    </div>
  );
}

function Gate() {
  const chain = useChain();
  if (!chain.ready) return <Boot />;
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  );
}

export default function App() {
  return (
    <ChainProvider>
      <Gate />
    </ChainProvider>
  );
}
