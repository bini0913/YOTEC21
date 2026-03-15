# YOTEC21

YOTEC is a browser-based AI company simulator with autonomous departments, task routing, and artifact generation.

## Quick start

```bash
npm run start
```

Then open:

- `http://localhost:8420`

## Available scripts

- `npm run start` — starts the local static server.
- `npm run dev` — same as start for now.
- `npm run check` — lightweight syntax checks for core JS files.

## Notes

- App state is persisted in browser `localStorage` using key `yotec_state_v1`.
- Use the **Clear Memory** button in chat to reset to default seeded state.
