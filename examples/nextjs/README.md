# Cider UI — Next.js example

Next.js 15 (App Router) + Tailwind CSS v4 + Cider UI.

## Run

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## What's in here

- `app/layout.jsx` — sets `className="cider cider-fixed"` on `<body>` so
  styles apply to the whole app. Inline script matches OS
  dark-mode preference before hydration to avoid a theme flash.
- `app/globals.css` — two-line Tailwind v4 setup that pulls in Cider UI.
- `app/page.jsx` — a client component that lazy-loads ciderui JS with
  `import("ciderui/components/...")`. Server components work too — the
  CSS alone styles your markup.
- `postcss.config.js` — Tailwind v4 PostCSS plugin.

## Server vs client components

- **CSS is SSR-safe**: `body className="cider"` styles render on the
  server with zero JavaScript.
- **Interactive JS must load client-side**: use `"use client"` and
  `import("ciderui/components/...")` in a `useEffect`. `window.CiderUI.*`
  APIs (showToast, openDialog) aren't defined during SSR.

## TypeScript

Cider UI ships its own types. In `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["ciderui"]
  }
}
```

Then `window.showToast`, `window.openDialog`, etc. are fully typed.
