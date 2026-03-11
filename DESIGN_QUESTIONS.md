# Design Questions

Items requiring user decision before changes can be made.

## 1. List separator visibility in dark mode

`list.css` uses `var(--color-separator)` for row dividers. In dark mode this resolves to `oklch(0.38 0.003 286 / 0.65)` — a semi-transparent gray over `--color-card` dark background. The resulting contrast is very low, making separators near-invisible on `.list-inset-grouped` cards.

Apple uses `opaqueSeparator` (~`#38383A`) for dark table views. Should `--color-separator` in `.dark` be made opaque or higher-opacity?

**Options:**

- A) Change to opaque: `--color-separator: oklch(0.32 0.003 286);`
- B) Increase opacity: `--color-separator: oklch(0.38 0.003 286 / 0.85);`
- C) Keep as-is (intentionally subtle)

## 2. Pagination active page distinction

`pagination.css` active page uses only `background: var(--surface-4)` — a subtle gray fill. In dark mode this is barely distinguishable from inactive items. Apple uses accent color for selected pagination/tab items.

**Options:**

- A) Use `color: var(--color-primary)` + `font-weight: 600` for active page
- B) Use `background: oklch(from var(--color-primary) l c h / 0.12)` tinted bg
- C) Keep as-is

## 3. Breadcrumb touch layout distortion

`breadcrumb.css` on coarse-pointer devices adds `min-width: 44px` + `justify-content: center` to each link. Short labels like "Home" expand beyond natural width, disrupting the chevron separator rhythm.

**Options:**

- A) Use padding expansion instead of `min-width` (enlarge touch area without affecting visual size)
- B) Accept the visual tradeoff for accessibility compliance
- C) Remove `min-width` (accept sub-44pt touch targets for breadcrumb)

## 4. Avatar small size font below 11pt

`.avatar-sm` uses `text-[11px]` (~8.25pt on 96dpi). Apple HIG minimum is 11pt. Two-character initials at this size inside a 28px circle are extremely cramped.

**Options:**

- A) Increase to `text-[13px]` for small avatars
- B) Document that `.avatar-sm` is image-only, not for monogram initials
- C) Keep as-is (11px matches the CSS spec, not pt-based HIG)

## 5. `--color-destructive-foreground` missing from `.dark` block

Currently `#fff` in `:root` only, with no explicit `.dark` override. The value happens to be correct for both modes (white on saturated red), but it's the only foreground token without a dark declaration — a structural inconsistency that could silently break if the light value changes.

**Options:**

- A) Add `--color-destructive-foreground: #fff;` to `.dark` block for parity
- B) Also add `--color-primary-foreground: #fff;` (same situation)
- C) Keep as-is (unnecessary duplication)
