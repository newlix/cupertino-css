# Refactor Questions

Items that need user decision before proceeding.

## [src/css/components/disclosure-group.css, list.css, navbar.css, hud.css, gauge.css]

- **問題描述**：`@media (forced-colors: active)` blocks are at the top level of these component files instead of nested inside the component selector (using `&`). Other files like `dialog.css`, `picker.css`, `pagination.css` correctly nest them. While the `@scope` import context still applies, the inconsistency makes the architecture fragile — any future refactor moving files outside the `@scope` wrapper would cause forced-colors styles to leak globally.
- **可能的做法**：A) Move all top-level forced-colors blocks into their parent component selector using `&` nesting (matches dialog/picker pattern) / B) Leave as-is since `@scope` import handles it correctly today
- **目前狀態**：未處理（跳過）

## [src/css/components/progress.css]

- **問題描述**：`progress-indeterminate` `::after` pseudo-element uses `width: 100%` but the keyframe sweeps `translateX(-100%)` to `translateX(100%)`, producing a visual gap at the loop seam. The `prefers-reduced-motion` fallback uses a static 40% width bar, suggesting the animated bar should also be narrower.
- **可能的做法**：A) Change `::after` to `width: 40%` and adjust keyframe range to cover the full track / B) Keep current width but adjust keyframe timing to eliminate the gap / C) Intentional design — leave as-is
- **目前狀態**：未處理（跳過）

## [src/css/components/slider.css]

- **問題描述**：`slider.css` is the only component that defines dark-mode custom property overrides locally with `.dark &` instead of using the global `:root`/`.dark` token system in `ciderui.css`. This creates an architectural inconsistency — `--slider-thumb-shadow*` tokens could be promoted to the global system.
- **可能的做法**：A) Move `--slider-thumb-shadow`, `--slider-thumb-shadow-hover`, `--slider-thumb` to global `:root`/`.dark` blocks in `ciderui.css` / B) Leave as local tokens since they're slider-specific
- **目前狀態**：未處理（跳過）

## [js/popover.js — double-rAF on initial show]

- **問題描述**：`positionPopover` reads `offsetWidth`/`offsetHeight` in its first `requestAnimationFrame` call after `showPopover()`. For top-layer elements, the first rAF may run before the browser has completed layout, potentially returning 0×0 dimensions and causing incorrect initial positioning (popover flashes at wrong position).
- **可能的做法**：A) Use double-rAF (`requestAnimationFrame(() => requestAnimationFrame(positionPopover))`) for the initial call only / B) Leave as single rAF if no visual issues have been observed
- **目前狀態**：未處理（跳過）

## [js/popover.js — `popover-flipped-top` class logic]

- **問題描述**：`popover-flipped-top` is only toggled when auto-flipping (`isFlippedTop && !wrapper.classList.contains("popover-top")`). When the user explicitly sets `popover-top`, the class is NOT applied. If `popover-flipped-top` drives any CSS (arrow direction, animation origin), it would be absent for explicit top placement.
- **可能的做法**：A) Apply `popover-flipped-top` unconditionally when `isFlippedTop` is true / B) Intentional — explicit `popover-top` uses different CSS than auto-flipped top
- **目前狀態**：未處理（跳過）

## [js/hud.js — SVG sanitiser href allowlist]

- **問題描述**：The href sanitiser regex `!/^(https?:|#|\/[^/])/.test(val)` allows single-slash relative paths, which could in theory match constructed values like `/\x00javascript:...`. The risk is extremely low in practice (browser SVG href context does not execute JS), but the sanitiser's intent is an allowlist.
- **可能的做法**：A) Tighten to strict allowlist (`/^(https?:\/\/|#|data:image\/)/.test(val)`) / B) Strip all href/xlink:href unconditionally since cider icons don't need them / C) Leave as-is given negligible real-world risk
- **目前狀態**：未處理（跳過）

## [src/css/components/gauge.css]

- **問題描述**：`.gauge-sm` and `.gauge-lg` size modifiers are standalone selectors that set `width`/`height` but silently depend on `.gauge`'s `display: inline-flex` to render correctly. A user applying `.gauge-sm` without `.gauge` would get no visual effect.
- **可能的做法**：A) Nest size variants under `.gauge` as `&.gauge-sm` / B) Add a comment documenting the dependency / C) Leave as-is — matches the project's modifier class convention
- **目前狀態**：未處理（跳過）

## [src/css/components/dialog.css]

- **問題描述**：`.dialog-close:hover` has no forced-colors outline, inconsistent with all other interactive hover states that receive `outline: 1px solid ButtonText` in HCM. The hover state is invisible in Windows High Contrast Mode.
- **可能的做法**：A) Add `outline: 1px solid ButtonText; outline-offset: -1px` for `.dialog-close:hover` in the forced-colors block / B) Leave as-is since the close button is still visible via its icon
- **目前狀態**：未處理（跳過）

## [src/css/components/picker.css]

- **問題描述**：`.picker-column` applies `mask-image` which creates a stacking context, while `.picker::after` (selection indicator) uses `z-index: 1`. The z-index layering between the masked column and the `::after` indicator is browser-dependent.
- **可能的做法**：A) Add `isolation: isolate` to `.picker` to explicitly contain the stacking context / B) Leave as-is if current rendering is acceptable across target browsers
- **目前狀態**：未處理（跳過）
