# Design Questions

## [src/css/components/avatar.css]

- **Problem**: `.avatar-sm` (28px) interactive touch expansion (`min-width: 44px; min-height: 44px`) on `pointer:coarse` breaks the circular shape — the element becomes an oval/rectangle instead of a circle.
- **Options**: A) Use `::before`/`::after` pseudo-element for invisible touch target expansion (keeps visual 28px circle) / B) Accept the shape distortion on touch / C) Don't expand small avatars (violates 44pt minimum)
- **Status**: Not addressed (skipped)

## [src/css/components/search-field.css]

- **Problem**: The search input height is 36px, below the 44pt HIG minimum on touch devices. The clear button has pseudo-element touch expansion but the input itself does not grow.
- **Options**: A) Increase input height to 44px on `pointer:coarse` / B) Keep 36px (compact design choice)
- **Status**: Not addressed (skipped)

## [js/token-field.js]

- **Problem**: Uses `role="listbox"` + `role="option"` for tokens, but token fields are not selection lists — they're created items. `aria-selected` is never set on options, violating ARIA spec. The correct semantics may be `role="group"` + no child role, or keep listbox and add `aria-selected="true"`.
- **Options**: A) Switch to `role="group"` (simpler, semantically correct) / B) Keep `role="listbox"` and add `aria-selected="true"` to each token
- **Status**: Not addressed (skipped) — changes accessible behavior

## [dialog.css, action-sheet.css, hud.css]

- **Problem**: Under `prefers-reduced-motion`, the global rule collapses animations to 0.01ms. Overlays pop in/out instantly with zero visual feedback. Best practice (W3C WCAG C39) recommends replacing directional/scale animations with opacity-only fades, not eliminating all feedback.
- **Options**: A) Add per-component `@media (prefers-reduced-motion)` blocks with `fadeIn`/`fadeOut` fallbacks / B) Keep current instant-appear behavior (rely on global rule)
- **Status**: Not addressed (skipped) — architectural decision about global vs per-component reduced-motion handling
