# Cider UI — Vite example

Vite + Tailwind CSS v4 + tree-shakeable per-component imports.

## Run

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173.

## What's in here

- `src/app.css` — `@import "tailwindcss"` + `@import "ciderui"` (Tailwind v4 picks up the plugin automatically).
- `src/main.js` — `import "ciderui/components/toast"` pulls in only the toast JS (plus its `_shared.js` dependency). Other components don't ship.
- `index.html` — standard Vite entry with a `.cider` body class so styles apply.

## Tree-shaking

Swap the per-component import for the full bundle if you prefer one import:

```js
import "ciderui/cider.js";
```

Or keep the per-component style and add as needed:

```js
import "ciderui/components/dialog";
import "ciderui/components/popover";
import "ciderui/components/toast";
```

## Dark mode

The inline script in `index.html` matches OS preference on first paint.
Add a toggle button with:

```js
document.documentElement.classList.toggle("dark");
```
