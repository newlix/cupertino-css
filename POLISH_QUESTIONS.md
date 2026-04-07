# Polish Questions

Items flagged during DX/Docs/a11y review that need user input before proceeding.

## [docs/_includes/macros.njk — figure without figcaption]

- **Problem**: `example()` macro wraps preview in `<figure>` but the label `<h3>` is outside — no `<figcaption>`, screen reader announces unnamed figure
- **Options**: A) Move h3 inside figure as figcaption / B) Replace `<figure>` with `<div>` (simpler but breaks ~40 test selectors using `.snippet-preview > figure`)
- **Status**: Skipped — needs coordinated test selector update

## [JS components — hardcoded ARIA label strings]

- **Problem**: Several JS files have hardcoded English strings in ARIA labels that screen readers announce: `"Decrease value"` / `"Increase value"` (stepper.js), `"Digit N of M"` (verification-code.js), `"Remove {text}"` (token-field.js), `"Verification code"` (verification-code.js), `"Navigation"` (sidebar.js).
- **Options**: A) Add `data-*` attribute overrides so users can customize labels / B) Document that users should set `aria-label` in HTML before JS init / C) Leave as-is (English-only library)
- **Status**: Skipped

## [CSS components — forced-colors (Windows High Contrast) disabled state]

- **Problem**: Many components use `opacity: 0.38` for disabled state, which is ignored in forced-colors mode. `elements.css` handles this correctly but `button.css`, `action-sheet.css`, `card.css`, `dialog.css`, `disclosure-group.css`, `list.css` lack forced-colors overrides for disabled opacity.
- **Options**: A) Add `@media (forced-colors: active)` overrides to all components / B) Add a global forced-colors disabled rule
- **Status**: Skipped

## [Active state selector inconsistency across navigation components]

- **Problem**: Tab Bar supports `[data-active]`, `[aria-selected="true"]`, and `[aria-current="page"]`. Segmented Control only supports `[data-active]` and `[aria-selected="true"]`. Pagination uses `[data-active]` and `[aria-current="page"]`. Inconsistent for developers.
- **Options**: A) Standardize all navigation components to support all three selectors / B) Document which selector is canonical for each use case
- **Status**: Skipped
