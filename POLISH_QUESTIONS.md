# Polish Questions

Items flagged during DX/Docs/a11y review that need user input before proceeding.

## [docs/installation.njk vs README.md]

- **Problem**: CDN URL in installation.njk uses `ciderui.cdn.css` (unminified), but README.md uses `ciderui.cdn.min.css` (minified). Inconsistent guidance for new users.
- **Options**: A) Standardize both to `.min.css` / B) Keep as-is (unminified for dev docs, minified in README)
- **Status**: Skipped

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
