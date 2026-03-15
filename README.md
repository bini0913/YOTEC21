# YOTEC21

YOTEC is a browser-based AI company simulator with autonomous departments, task routing, and artifact generation.

## Stack preset

- Frontend: vanilla HTML/CSS/ES modules
- Tooling/runtime: **Vite** (dev server + build + preview)

## Quick start

```bash
npm install
npm run dev
## Quick start

```bash
npm run start
```

Then open:

- `http://localhost:8420`

## Available scripts

- `npm run dev` — starts the Vite dev server.
- `npm run start` — alias for `npm run dev`.
- `npm run build` — production build output to `dist/`.
- `npm run preview` — preview the built app.
- `npm run check` — syntax checks via `scripts/check.js` + production build attempt (auto-skips when `vite` is unavailable).
- `npm run check` — syntax checks + production build verification (build step auto-skips if `vite` is unavailable in restricted environments).
- `npm run start` — starts the local static server.
- `npm run dev` — same as start for now.
- `npm run check` — lightweight syntax checks for core JS files.

## Notes

- App state is persisted in browser `localStorage` using key `yotec_state_v1`.
- Use the **Clear Memory** button in chat to reset to default seeded state.
