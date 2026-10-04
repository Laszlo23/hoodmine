import { useNow } from "../hooks.ts";
import { useGame } from "../store.tsx";
import { countdown, DAYS } from "../world.ts";

export function Days() {
  const { dispatch } = useGame();
  const now = useNow();
  const left = countdown(now);
  return (
    <section className="page">
      <p className="eyebrow">Daily field</p>
      <h1 className="poster">
        The mine
        <br />
        changes
        <br />
        <em>every day.</em>
      </h1>
      <p className="lede">
        A reason to come back tomorrow. Each map is a new cut. What you found yesterday stays on your passport.
      </p>
      <ol className="day-list">
        {DAYS.map((day, index) => (
          <li key={day.id} className={day.live ? "day live" : "day"}>
            <span className="day-id">{day.id}</span>
            <div>
              <h2>{day.name}</h2>
              <p>{day.rule}</p>
            </div>
            <div className="day-side">
              <span>{day.size}</span>
              {day.live ? (
                <button onClick={() => dispatch({ type: "screen", screen: "mine" })}>
                  Enter
                </button>
              ) : (
                <span className="queued">{index === 1 ? left : "Queued"}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
