# YOTEC21

YOTEC is a browser-based AI company simulator with autonomous departments, task routing, and artifact generation.

## Stack preset

- Frontend: vanilla HTML/CSS/ES modules
- Tooling/runtime: **Vite** (dev server + build + preview)

## Quick start

```bash
npm install
npm run dev
```

Then open:

- `http://localhost:8420`

## Available scripts

- `npm run dev` — starts the Vite dev server.
- `npm run start` — alias for `npm run dev`.
- `npm run build` — production build output to `dist/`.
- `npm run preview` — preview the built app.
- `npm run check` — syntax checks + production build verification (build step auto-skips if `vite` is unavailable in restricted environments).

## Notes

- App state is persisted in browser `localStorage` using key `yotec_state_v1`.
- Use the **Clear Memory** button in chat to reset to default seeded state.
