# HOOD//MINE

A field on Robinhood Chain. The day’s map is seeded from an anchor block on chain 4663. You drag the field and cut a block.

Live at https://mine.aibusiness.fun/.

## The footer

The street bar is loaded from `https://doghood.aibusiness.fun/floor/street.js`. Book, Floor, Dex, GM, Mine, and Seats sit on the left. Field, Days, Agent, Pass, and Vein continue in `#hood-app` after the divider. If that script is missing, the five field tabs render on their own.

## Play

Robin opens the field. Three free cuts spend nothing. A find can give one back. After the free cuts, a paid cut spends the reserve. The agent spends reserve, not the free cuts. A find can be sealed with a zero-value transaction on Robinhood Chain. The wallet confirms that seal.

The field state is kept in `localStorage` under `hoodmine-v2`.

## Run

```bash
npm install
npm run dev
```

```bash
npm run build
```

The production page is the `dist/` folder.
