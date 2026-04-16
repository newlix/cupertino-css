# Contributing

## Setup

```bash
pnpm install
```

This wires up the local `core.hooksPath` so the pre-commit hook runs
prettier on staged files and regenerates `js/cider.js` when any
component source changes.

## Dev loop

```bash
pnpm dev            # build docs + serve on :8000 with live rebuild
pnpm test           # Playwright across Chromium/WebKit/Firefox
pnpm test:ui        # Playwright UI mode
pnpm test:types     # tsc --noEmit on ciderui.d.ts + types/*.ts
pnpm build          # regenerate js/cider.js + dist/ciderui.cdn{,.min}.css
```

## Repo layout

```
src/css/
  ciderui.css              # entry — CSS vars, theme tokens, @layer base, @scope(.cider)
  ciderui.cdn.css          # CDN bundle — Tailwind + ciderui.css
  components/              # one component per file
    elements/              # classless element styles (typography, forms, table, ...)

js/
  cider.js                 # generated bundle (do not edit; run `pnpm build:js`)
  cider.d.ts               # TypeScript types for window.CiderUI.* API
  components/              # source of truth — one IIFE per file
    _shared.js             # scrollLock, focus trap, isVisible helpers

docs/
  components/*.njk         # Nunjucks sources for the docs site
  _includes/               # layout + macros
  _data/nav.json           # sidebar nav (alphabetical!)

tests/                     # Playwright specs (*.spec.js)
types/                     # compile-only type assertions
scripts/                   # build-docs, test-server, build-cider-js, checks
```

## Adding a new component

1. **CSS** — `src/css/components/<name>.css`. Place inside
   `@scope (.cider) to (.cider-reset)` (handled automatically by
   `ciderui.css`). Register a new `@import` line in `ciderui.css`.
2. **JS** (if interactive) — `js/components/<name>.js` as a naked IIFE.
   If it reads `window.CiderUI._scrollLock` / `_FOCUSABLE` /
   `_isVisible`, add `import "./_shared.js";` near the top.
   Register in `scripts/build-cider-js.js` `order` array.
3. **Types** — add the component's public API to `js/cider.d.ts` on
   `CiderUIGlobal`.
4. **Docs** — `docs/components/<name>.njk` (copy an existing file as a
   template).
5. **Nav** — add to `docs/_data/nav.json` (alphabetically sorted within
   the Components section).
6. **Tests** — `tests/<name>.spec.js`. For overlay or positioned
   components, add a case under `tests/ua-override.spec.js` that checks
   `getBoundingClientRect()` — browser UA sheets silently override
   semantic elements (`dialog:modal { inset: 0 }`, etc.).

## Component conventions

- **Classless vs explicit class.** Native HTML that only needs visual
  polish (`<h1>`, `<input>`, `<table>`, `<blockquote>`) is styled by
  element selector in `components/elements/`. Adding a utility class
  to it must not break base styling. Full interactive components
  (`dialog`, `action-sheet`, `tabs`, `card`) require an explicit class.
- **Dual-purpose elements** (`<details>`, `<fieldset>`, `<ul>`, `<ol>`)
  use `:where(:not([class]))` so component classes can fully override.
- **Never use utility classes in component markup** — Tailwind utilities
  are for consumer customisation only.
- **Follow web conventions over HIG names when they collide** — Tooltip
  (not Help Tag), Select (not Pop-Up Button).
- **Prefer structural selectors over class proliferation** —
  `.picker-column > div` rather than adding `.picker-item`.

## Commits

Lowercase type prefix, short subject, body explains the _why_ when
non-obvious:

```
refactor: extract generic [data-tooltip] out of button.css
fix(tree-shake): import _shared.js from components that need it
test: enable button.card test + stabilise runner under parallel load
```

Pre-commit hook runs prettier automatically — don't fight it.

## Publishing

```bash
# 1. Bump version in package.json
# 2. Update CHANGELOG.md (promote [Unreleased] → [vX.Y.Z])
# 3. Commit + tag
git commit -am "release: vX.Y.Z"
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin main vX.Y.Z
gh release create vX.Y.Z --generate-notes
```

The package is distributed via GitHub Releases, not the npm registry.
Consumers install via `npm install ciderui@github:newlix/ciderui#vX.Y.Z`.
