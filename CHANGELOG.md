# Changelog

All notable changes to Cider UI are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Ship TypeScript types for the interactive-component API
  (`window.CiderUI.*` + global helpers `openDialog`, `showHUD`, etc.)
  via `js/cider.d.ts`. Wired through `exports` for both `ciderui/cider.js`
  and `ciderui/components/*` subpaths.
- Per-component ESM subpaths: `import "ciderui/components/dialog"` and
  friends are now tree-shakeable. `js/components/*.js` is the new source
  of truth; `js/cider.js` is generated via `pnpm build:js`.
- Generic `[data-tooltip]` utility moved to its own
  `components/tooltip.css`; no behavioural change.
- CI workflow (`.github/workflows/test.yml`) runs prettier, type check,
  bundle-drift check, and Playwright across Chromium/WebKit/Firefox on
  every PR.
- Pre-commit hook (`.githooks/pre-commit`) runs prettier on staged files
  and regenerates `js/cider.js` when any `js/components/*.js` changes.
  Activated automatically by `pnpm install`.

### Changed

- `tailwindcss ^4.2.0` declared as `peerDependency` so install-time
  version mismatches are surfaced by the package manager.
- Playwright worker cap (4 locally, 2 in CI) to prevent
  `page.goto` flakes under parallel load.
- `elements.css` split into `components/elements/{layout,typography,forms,
table,misc,forced-colors}.css` for maintainability.

### Fixed

- `button.card`/`a.card` now has a focus-visible regression test (it
  previously pointed at an example that didn't exist in the docs).
- `.envrc` auto-builds the Nix `playwright-driver.browsers` derivation
  when it's missing from the local store (was previously a silent
  failure for fresh clones).
- Tree-shake crash: `actionSheet`, `dialog`, and `sidebar` now `import
"./_shared.js"` so consumers loading them individually don't hit an
  undefined `window.CiderUI._scrollLock`. A CI check
  (`pnpm test:shared-imports`) prevents regression.

## [0.5.1] — 2026-04-09

- Remove stale `POLISH_QUESTIONS.md`; build-safety guard logic fix;
  homepage skip link; test-reliability pass.

## [0.5.0] — 2026-04-06

- Switch to pnpm, rebuild CDN bundle.
- 9 new component suites, 4 expanded; popover flakiness eliminated.
- JS component fixes: aria guards, popover RAF, menu cleanup,
  test-server tidy.
- Safari colour compatibility, forced-colors mode, reduced-motion, and
  touch-target fixes.

## [0.4.0] — 2026-03-26

- Customisable ARIA labels via `data-*` attributes.
- Full cross-browser Playwright matrix (Chromium + WebKit + Firefox).
- Heading margins use `:where()` so component classes and utilities can
  override without `!important`.

## [0.3.0] — 2026-03-07

Initial public-ish release — see git log for details.

## [0.2.0] — 2026-03-07

Pre-release.
