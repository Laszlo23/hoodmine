import { useGame } from "../store.tsx";
import {
  BOARD,
  CAREER_BLOCKS,
  CAREER_BOMBS,
  CAREER_LEGENDARY,
  efficiency,
  rankFor,
  type Find,
} from "../world.ts";

function tally(cuts: Record<string, Find>) {
  let useful = 0;
  let legendary = 0;
  let bombs = 0;
  const keys: string[] = [];
  const nfts: string[] = [];
  const loot: string[] = [];
  for (const find of Object.values(cuts)) {
    if (find.kind !== "silence" && find.kind !== "bomb") useful += 1;
    if (find.rarity === "legendary") legendary += 1;
    if (find.kind === "bomb") bombs += 1;
    switch (find.kind) {
      case "key":
        keys.push(find.title);
        break;
      case "nft":
        nfts.push(find.title);
        break;
      case "loot":
        loot.push(find.title);
        break;
      case "silence":
      case "hood":
      case "multiplier":
      case "bomb":
      case "event":
        break;
      default: {
        const _never: never = find.kind;
        return _never;
      }
    }
  }
  return { useful, legendary, bombs, keys, nfts, loot };
}

export function Passport({ variant }: { variant: "page" | "rail" }) {
  const { state, dispatch } = useGame();
  const session = state.history.length;
  const stats = tally(state.cuts);
  const blocks = CAREER_BLOCKS + session;
  const legendary = CAREER_LEGENDARY + stats.legendary;
  const bombs = CAREER_BOMBS + stats.bombs;
  const eff = efficiency(session, stats.useful);
  const rank = rankFor(session);
  const board = BOARD.map((row) =>
    row.you ? { ...row, blocks } : row,
  ).sort((a, b) => b.blocks - a.blocks);

  const badge = (
    <div className="badge">
      <p className="whisper-k">Mining passport</p>
      <h2 className="who">Laszlo</h2>
      <p className="miner-id">Miner #004921</p>
      <dl className="stats">
        <div><dt>Blocks</dt><dd>{blocks.toLocaleString("en-US")}</dd></div>
        <div><dt>Legendary</dt><dd>{legendary}</dd></div>
        <div><dt>Bombs</dt><dd>{bombs}</dd></div>
        <div><dt>Rank</dt><dd>#{rank}</dd></div>
      </dl>
      <div className="eff">
        <span>Efficiency {eff}%</span>
        <i><b style={{ width: `${eff}%` }} /></i>
      </div>
    </div>
  );

  if (variant === "rail") {
    return (
      <section>
        {badge}
        <button className="text-link" onClick={() => dispatch({ type: "screen", screen: "passport" })}>
          Open passport
        </button>
      </section>
    );
  }

  return (
    <section className="page">
      <p className="eyebrow">Social layer</p>
      {badge}
      <p className="lede tight">
        Day 001 is a fresh field. Career numbers stay. Today’s cuts climb the board.
      </p>
      <h2 className="section-label">Pack</h2>
      <ul className="pack">
        {stats.nfts.map((item) => <li key={item} data-kind="nft">{item}</li>)}
        {stats.keys.map((item) => <li key={item} data-kind="key">{item}</li>)}
        {stats.loot.map((item) => <li key={item} data-kind="loot">{item}</li>)}
        {stats.nfts.length + stats.keys.length + stats.loot.length === 0 ? (
          <li className="empty">The pack is empty. The field is still mostly shut.</li>
        ) : null}
      </ul>
      <h2 className="section-label">Season board · sample field</h2>
      <ol className="board">
        {board.map((row, index) => (
          <li key={row.name} className={row.you ? "you" : ""}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <b>{row.name}</b>
            <em>{row.blocks.toLocaleString("en-US")}</em>
          </li>
        ))}
      </ol>
    </section>
  );
}
