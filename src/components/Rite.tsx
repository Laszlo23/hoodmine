import { RobinMark } from "./Icons.tsx";
import { useGame } from "../store.tsx";

const STEPS = [
  {
    kicker: "Robin",
    title: "The seam is awake",
    body: "I watch this field. I do not cut it for you. Today’s map is already written on Robinhood Chain.",
    cta: "Continue",
  },
  {
    kicker: "Three free cuts",
    title: "Start with nothing owed",
    body: "The first three cuts spend nothing. A real find gives one back. Empty rock takes the cut.",
    cta: "Continue",
  },
  {
    kicker: "You choose",
    title: "Drag, then tap",
    body: "Lime marks are my guess. Ice cells were opened by someone else. The block you cut is yours.",
    cta: "Enter the field",
  },
] as const;

export function Rite() {
  const { state, dispatch } = useGame();
  const step = STEPS[state.rite];
  if (!step) return null;
  return (
    <div className="rite" role="dialog" aria-modal="true" aria-labelledby="rite-title">
      <div className="rite-card">
        <RobinMark />
        <p className="rite-k">
          {step.kicker}
          <span>
            {state.rite + 1} / {STEPS.length}
          </span>
        </p>
        <h2 id="rite-title">{step.title}</h2>
        <p>{step.body}</p>
        <button className="cut" onClick={() => dispatch({ type: "riteNext" })}>
          {step.cta}
        </button>
        <button className="rite-skip" onClick={() => dispatch({ type: "riteSkip" })}>
          I know this field
        </button>
      </div>
    </div>
  );
}
