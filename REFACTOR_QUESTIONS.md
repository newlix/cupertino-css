# REFACTOR_QUESTIONS.md

## [js/dialog.js, js/action-sheet.js, js/sidebar.js]

- **Problem**: `_scrollLock` object is copy-pasted verbatim across all three files (~20 lines each). Any bug fix must be manually applied to all three copies.
- **Possible approaches**: A) Extract to a shared `js/scroll-lock.js` loaded before the others. B) Keep as-is since the project has a "no build step" philosophy and the duplication is small.
- **Status**: Unresolved (skipped)

## [src/css/components/button.css, src/css/components/popover.css]

- **Problem**: Tooltip z-index (z-40) is below popover z-index (z-50). A tooltip on a button adjacent to an open popover will be visually buried. Z-index hierarchy across overlay components is implicit and undocumented.
- **Possible approaches**: A) Raise tooltip to z-[60] so it always appears above popovers. B) Add CSS custom properties `--z-tooltip`, `--z-popover`, `--z-hud` for a documented, overridable hierarchy. C) Keep current values if tooltips-inside-popovers is the only supported pattern.
- **Status**: Unresolved (skipped)

## [docs/index.njk, docs/_includes/layout.njk]

- **Problem**: Theme-toggle JavaScript is duplicated (~10 lines each) with different element selectors (`#theme-toggle` vs `.docs-theme-toggle`). Highlight.js CDN URLs also appear in 3 places.
- **Possible approaches**: A) Extract toggle logic into `snippet.js` (already shared). B) Keep separate since index.njk is a standalone page with different structure.
- **Status**: Unresolved (skipped)

## [docs/_data/nav.json]

- **Problem**: No "Tabs" component doc page despite `tabs.js` being a global interactive JS file. Segmented Control page partially covers the `[data-tab]` pattern but doesn't document `tabs.js` explicitly.
- **Possible approaches**: A) Add a `docs/components/tabs.njk` page. B) Add a JS/Usage section to `segmented-control.njk` documenting `tabs.js`.
- **Status**: Unresolved (skipped)

## [js/picker.js]

- **Problem**: `itemH` is captured once at setup time via `getItemHeight()` and closed over by `onScrollSettle` and keyboard handlers. If `--picker-item-h` CSS property changes after init (responsive breakpoint, theme switch), scroll-to-index calculations use stale height.
- **Possible approaches**: A) Call `getItemHeight()` fresh in `onScrollSettle` and `onKeyDown` instead of using the closed-over value. B) Keep as-is if CSS property changes after init are not a supported use case.
- **Status**: Unresolved (skipped)

## [src/css/components/progress.css]

- **Problem**: Indeterminate progress bar uses hardcoded `cubic-bezier(0.65, 0, 0.35, 1)` instead of a shared easing token. This is intentionally different from `--apple-ease`/`--apple-spring` (symmetric ease-in-out suits looping animations) but lacks a comment explaining the choice.
- **Possible approaches**: A) Add a comment explaining why. B) Extract to a `--apple-loop` token for overridability.
- **Status**: Unresolved (skipped)

## [tests/helpers.js]

- **Problem**: `cssToRgb` canvas sentinel may fail for `oklch()` color values returned by `getComputedStyle` in Chromium. Canvas 2D `fillStyle` doesn't accept oklch, causing all such colors to be flagged as "unparseable". Tailwind CSS v4 uses oklch by default.
- **Possible approaches**: A) Resolve colors via a DOM element's `getComputedStyle` (which canonicalizes oklch to rgb) before passing to the canvas. B) Keep as-is if current Playwright Chromium version still returns hex/rgb from getComputedStyle.
- **Status**: Unresolved (needs investigation)
