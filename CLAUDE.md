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
  _includes/            # Nunjucks templates (layout.njk, macros.njk)
  _data/nav.json        # Sidebar navigation data
  docs.css              # Tailwind + ciderui + docs-specific styles
  components/*.njk      # Component doc pages (Nunjucks source)
  examples/*.njk        # Showcase pages
  demos/*.html          # HTML fragments lazy-loaded on homepage
scripts/
  build-docs.js         # SSG build: .njk → site/*.html + CSS + assets
site/                   # Build output (gitignored)
tests/                  # Playwright test files
```

## Commands

```bash
npm run dev              # Build docs site + serve on :3000
npm run build            # Build CDN bundle to dist/
npm run build:docs       # Build docs site to site/
npm test                 # Run Playwright tests (builds docs + starts server)
npm run test:ui          # Playwright UI mode
```

## Architecture

- **No framework** — plain HTML, CSS, JS. No build step for components.
- **Tailwind CSS v4 plugin** — users `@import "ciderui"` alongside `@import "tailwindcss"`.
- **CDN variant** — `ciderui.cdn.css` bundles Tailwind + all components via `source(none)`.
- **Component CSS** — each component in `src/css/components/*.css`, imported by `ciderui.css` inside `@layer components`.
- **Component JS** — vanilla JS, no dependencies. Each file is self-contained (IIFE or top-level).
- **Dark mode** — class-based (`.dark` on `<html>`). All CSS variables swap in `.dark {}` block.
- **Docs site** — Nunjucks SSG. Pages are `.njk` source files compiled to static HTML in `site/` via `scripts/build-docs.js`. Syntax highlighting baked in at build time (highlight.js).

## Testing

- Tests live in `tests/*.spec.js`, helpers in `tests/helpers.js`.
- Playwright config builds docs then starts a server on :3000.
- Test targets: built docs pages in `site/components/`.
- Tests cover rendering, dark mode, CSS states, focus-visible, and interactive JS behavior.

## Conventions

- CSS class names are semantic: `btn`, `card`, `dialog`, `tabs`, `badge`, etc.
- No utility classes in component markup — Tailwind utilities are for user customization only.
- JS files have a `// ComponentName — ciderui` header comment on line 1.
- Doc/preview HTML `<title>` format: `ComponentName — Cider UI`.
