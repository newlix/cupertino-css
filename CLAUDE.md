# CLAUDE.md — Cider UI

Apple-aesthetic UI components as a Tailwind CSS v4 plugin. Pure CSS with optional JS for interactive components.

## Project Structure

```
src/css/
  ciderui.css          # Main entry — CSS variables, theme tokens, base, @import components
  ciderui.cdn.css      # CDN bundle — includes Tailwind + ciderui.css via source(none)
  components/           # 48 component CSS files (button, card, dialog, …)
js/                     # 13 JS files for interactive components (dialog, tabs, toast, …)
docs/
  index.html            # Homepage (standalone, no docs.js layout)
  introduction.html     # Docs pages use docs.js to inject sidebar layout
  installation.html
  docs.js               # Layout injector — sidebar nav, theme toggle, code highlighting
  docs.css              # Tailwind + ciderui + docs-specific styles
  components/           # 52 component doc pages
components/             # Standalone component preview HTML files (used by Playwright tests)
tests/                  # 28 Playwright test files (99 tests)
preview.html            # All-components preview page
preview.css             # Tailwind + ciderui (used by preview.html and some component previews)
```

## Commands

```bash
npm run dev              # Watch CSS + serve on :3000
npm run build            # Build CDN bundle to dist/
npm test                 # Run Playwright tests (starts dev server automatically)
npm run test:ui          # Playwright UI mode
```

## Architecture

- **No framework** — plain HTML, CSS, JS. No build step for components.
- **Tailwind CSS v4 plugin** — users `@import "ciderui"` alongside `@import "tailwindcss"`.
- **CDN variant** — `ciderui.cdn.css` bundles Tailwind + all components via `source(none)`.
- **Component CSS** — each component in `src/css/components/*.css`, imported by `ciderui.css` inside `@layer components`.
- **Component JS** — vanilla JS, no dependencies. Each file is self-contained (IIFE or top-level).
- **Dark mode** — class-based (`.dark` on `<html>`). All CSS variables swap in `.dark {}` block.
- **Docs site** — `docs.js` injects sidebar layout at runtime. Each page is a standalone HTML file with `<main data-title="..." data-description="...">`.

## Testing

- Tests live in `tests/*.spec.js`, helpers in `tests/helpers.js`.
- Playwright config starts a dev server (`serve` on :3000 + Tailwind watch).
- Component preview pages in `components/` and `docs/components/` are the test targets.
- Tests cover rendering, dark mode, CSS states, focus-visible, and interactive JS behavior.

## Conventions

- CSS class names are semantic: `btn`, `card`, `dialog`, `tabs`, `badge`, etc.
- No utility classes in component markup — Tailwind utilities are for user customization only.
- JS files have a `// ComponentName — ciderui` header comment on line 1.
- Doc/preview HTML `<title>` format: `ComponentName — Cider UI`.
- Component previews reference `../src/css/ciderui.cdn.css` or `../preview.css`.
