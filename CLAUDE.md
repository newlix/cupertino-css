# CLAUDE.md — Cider UI

Apple-aesthetic UI components as a Tailwind CSS v4 plugin. Pure CSS with optional JS for interactive components.

## Project Structure

```
src/css/
  ciderui.css          # Main entry — CSS variables, theme tokens, base, @import components
  ciderui.cdn.css      # CDN bundle — includes Tailwind + ciderui.css via source(none)
  components/           # 32 component CSS files (button, card, dialog, tooltip, …)
    elements/           # classless element styles (typography, forms, table, …)
js/
  cider.js              # Generated CDN/classic-script bundle (do not edit directly)
  cider.d.ts            # TypeScript types for window.CiderUI.* API
  components/           # Source of truth — one IIFE per file; _shared.js has utilities
docs/
  _includes/            # Nunjucks templates (layout.njk, macros.njk)
  _data/nav.json        # Sidebar navigation data (alphabetical within sections)
  docs.css              # Tailwind + ciderui + docs-specific styles
  components/*.njk      # Component doc pages (Nunjucks source)
scripts/
  build-docs.js         # SSG build: .njk → site/*.html + CSS + assets
  build-cider-js.js     # Concat js/components/*.js → js/cider.js
  check-shared-imports.js  # CI gate: components using _shared globals must import it
  test-server.js        # Lightweight HTTP server for Playwright tests (:3000)
types/                  # Compile-only type assertions (tsc --noEmit smoke test)
site/                   # Build output (gitignored)
tests/                  # Playwright test files
.githooks/pre-commit    # Auto-prettier staged files; rebuild cider.js / dist/ on source change
```

## Commands

```bash
pnpm dev                  # Build docs site + serve on :8000
pnpm build                # Regenerate js/cider.js + dist/ciderui.cdn{,.min}.css
pnpm build:js             # Regenerate only js/cider.js
pnpm build:docs           # Build docs site to site/
pnpm test                 # Run Playwright tests (builds docs + starts server)
pnpm test:ui              # Playwright UI mode
pnpm test:types           # tsc --noEmit on ciderui.d.ts + types/*.ts
pnpm test:shared-imports  # Verify components using _shared globals import it
```

## Architecture

- **No framework** — plain HTML, CSS, JS. No build step for components.
- **Tailwind CSS v4 plugin** — users `@import "ciderui"` alongside `@import "tailwindcss"`.
- **CDN variant** — `ciderui.cdn.css` bundles Tailwind + all components via `source(none)`.
- **`.cider` scope** — all component CSS (classless elements AND class-based components) lives inside `@scope(.cider) to (.cider-reset)`. Users must add `.cider` to an ancestor element for any styles to take effect. `.cider-reset` creates escape boundaries.
- **Component CSS** — each component in `src/css/components/*.css`, imported by `ciderui.css` inside `@layer components` within the `@scope(.cider)` block.
- **Component JS** — vanilla JS, no dependencies. Source of truth: `js/components/*.js` (one IIFE per file, `_shared.js` sets up `window.CiderUI` utilities). `js/cider.js` is a generated CDN/classic-script bundle — run `pnpm build:js` after editing a component file to regenerate it. Also exposed as tree-shakeable subpaths via `ciderui/components/{name}`.
- **Dark mode** — class-based (`.dark` on `<html>`). All CSS variables swap in `.dark {}` block.
- **Docs site** — Nunjucks SSG. Pages are `.njk` source files compiled to static HTML in `site/` via `scripts/build-docs.js`. Syntax highlighting baked in at build time (highlight.js).

## Testing

- Tests live in `tests/*.spec.js`, helpers in `tests/helpers.js`.
- Playwright config builds docs then starts a server on :3000.
- Test targets: built docs pages in `site/components/`.
- Tests cover rendering, dark mode, CSS states, focus-visible, and interactive JS behavior.
- **UA override tests** (`tests/ua-override.spec.js`) — when adding overlay/positioned components that use semantic HTML (`<dialog>`, `[popover]`, etc.), add a test to verify the component's `getBoundingClientRect()` matches the intended layout. Browser UA stylesheets (e.g. `dialog:modal { inset: 0 }`) can silently override component positioning. Wait for animations to finish before measuring (use `el.getAnimations()`).

## Formatting

- **Prettier** — run `pnpm prettier --write .` before every commit.

## Design Philosophy: Classless vs Explicit

Two-tier approach within the `.cider` scope:

- **Classless = styling** — Elements that just need visual treatment (`<h1>`, `<input>`, `<select>`, `<table>`, `<blockquote>`, etc.) are styled by element selector. Adding a Tailwind utility class should not break their base styling.
- **Explicit class = component behavior** — Elements that represent full interactive components with layout, animations, positioning, or JS behavior require an explicit class (`.dialog`, `.action-sheet`, `.tabs`, `.card`, etc.).
- **Dual-purpose elements** (`<details>`, `<fieldset>`, `<ul>`, `<ol>`) use `:where(:not([class]))` guard — classless styling applies only when no class is present, so component classes (`.disclosure-group`, `.token-field`) can fully override without specificity fights.

The boundary: if a bare HTML element only needs typography/form styling, keep it classless. If it becomes a full component (backdrop, animations, scroll lock, focus trap), require an explicit class.

## Conventions

- CSS class names are semantic: `btn`, `card`, `dialog`, `tabs`, `badge`, etc.
- No utility classes in component markup — Tailwind utilities are for user customization only.
- Each component IIFE in `js/cider.js` starts with a `// ComponentName — ciderui` header comment.
- Doc/preview HTML `<title>` format: `ComponentName — Cider UI`.
- Prefer classless children over extra class names — use structural selectors (e.g. `.picker-column > div` not `.picker-item`).
- Component names follow web conventions over Apple HIG when they conflict (e.g. Tooltip not Help Tag, Select not Pop-Up Button).

## Publishing

- Registry: **GitHub Releases** (not npm registry)
- Workflow: bump `version` in package.json → `git tag -a vX.Y.Z` → `git push origin vX.Y.Z` → `gh release create`
