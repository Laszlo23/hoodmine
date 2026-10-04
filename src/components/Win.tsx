import { useEffect, useState } from "react";
import { sealFind, txUrl } from "../chain.tsx";
import { useGame } from "../store.tsx";
import { witnesses, type FindKind, type Tier } from "../world.ts";
import { EthMark, Glyph, RobinMark } from "./Icons.tsx";

const BITS = Array.from({ length: 26 }, (_, index) => ({
  id: index,
  left: (index * 37) % 100,
  delay: (index % 7) * 0.04,
  duration: 0.75 + (index % 5) * 0.12,
}));

function kicker(tier: Tier, kind: FindKind) {
  switch (tier) {
    case "jackpot":
      return "Jackpot";
    case "hit":
      return kind === "hood" ? "ETH seam" : "Found";
    case "break":
      return "Breach";
    case "soft":
      return "Empty";
    default: {
      const _never: never = tier;
      return _never;
    }
  }
}

export function WinBurst() {
  const { state, dispatch } = useGame();
  const burst = state.burst;
  const [seal, setSeal] = useState<"idle" | "wait" | "done" | "err">("idle");
  const [tx, setTx] = useState<string | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    setSeal("idle");
    setTx(null);
    setErr("");
  }, [burst?.x, burst?.y, burst?.find.title]);
  if (!burst) return null;
  const rich = burst.tier === "hit" || burst.tier === "jackpot";
  const loud = burst.tier === "jackpot";
  const crew = rich ? witnesses(burst.x, burst.y) : [];

  const onSeal = async () => {
    setSeal("wait");
    setErr("");
    try {
      const hash = await sealFind(burst.x, burst.y, burst.find.title);
      setTx(hash);
      setSeal("done");
    } catch (error) {
      setSeal("err");
      setErr(error instanceof Error ? error.message : "Wallet did not seal it.");
    }
  };

  return (
    <div className={`burst tier-${burst.tier}`} role="dialog" aria-modal="true">
      {rich ? (
        <div className="eth-rain" aria-hidden="true">
          {BITS.slice(0, loud ? 16 : 9).map((bit) => (
            <span
              key={bit.id}
              style={{
                left: `${bit.left}%`,
                animationDelay: `${bit.delay}s`,
                animationDuration: `${bit.duration}s`,
              }}
            >
              <EthMark />
            </span>
          ))}
        </div>
      ) : (
        <div className="burst-bits" aria-hidden="true">
          {BITS.slice(0, burst.tier === "soft" ? 18 : 12).map((bit) => (
            <i
              key={bit.id}
              style={{
                left: `${bit.left}%`,
                animationDelay: `${bit.delay}s`,
                animationDuration: `${bit.duration}s`,
              }}
            />
          ))}
        </div>
      )}
      {rich ? <p className="eth-sign">Ξ</p> : null}
      <p className="burst-k">{kicker(burst.tier, burst.find.kind)}</p>
      <div className={`burst-mark kind-${burst.find.kind}`}>
        <Glyph kind={burst.find.kind} factor={burst.find.factor} />
      </div>
      <h2>{burst.find.title}</h2>
      <p>{burst.find.detail}</p>
      {burst.tier === "jackpot" ? (
        <p className="robin-saw">
          <RobinMark />
          Robin saw this one.
        </p>
      ) : null}
      {crew.length > 0 ? (
        <div className="witnesses">
          <span>Live on the field</span>
          {crew.map((id) => (
            <b key={id}>#{id}</b>
          ))}
        </div>
      ) : null}
      {burst.granted ? <b className="grant">+1 free cut</b> : null}
      {burst.tier === "soft" ? (
        <span className="burn-note">That cut is gone. The rock was empty.</span>
      ) : burst.paid ? (
        <span className="burn-note">10% of that entry is burned. The rest stays in the vein.</span>
      ) : (
        <span className="burn-note">Free cut. Nothing left your reserve.</span>
      )}
      {seal === "done" && tx ? (
        <a className="seal-link" href={txUrl(tx)} target="_blank" rel="noreferrer">
          Sealed on Robinhood Chain
        </a>
      ) : null}
      {seal === "err" ? <span className="burn-note">{err}</span> : null}
      {rich ? (
        <button className="cut" disabled={seal === "wait"} onClick={() => void onSeal()}>
          {seal === "wait" ? "Waiting for your wallet" : seal === "done" ? "Sealed" : "Seal on Robinhood Chain"}
        </button>
      ) : null}
      <button className="cut ghost" onClick={() => dispatch({ type: "dismissBurst" })}>
        {burst.tier === "soft" ? "Try another block" : "Keep mining"}
      </button>
    </div>
  );
}
