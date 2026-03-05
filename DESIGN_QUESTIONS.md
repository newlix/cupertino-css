# Design Questions

Items needing user input before making changes.

## 1. `--color-primary-foreground` contrast in dark mode
White text on dark-mode blue (#0A84FF, oklch 0.624) gives ~3.5:1 contrast — below WCAG AA 4.5:1 for normal text. Apple uses this same pairing natively. Options:
- **A)** Keep as-is (matches Apple native behavior)
- **B)** Bump font-weight to 600 on filled buttons so the large-text exception (3:1) applies
- **C)** Darken the dark-mode blue slightly for better contrast

## 2. `prefers-reduced-motion` scope
The global `prefers-reduced-motion` rule in `ciderui.css` applies `animation-duration: 0.01ms !important` to `*, *::before, *::after` — affecting all elements on the page, not just `.cider` scope. This could impact third-party widgets.
- **A)** Keep global (safest, ensures nothing is missed)
- **B)** Scope to `.cider *` only (respects third-party widgets but may miss unscoped elements)

## 3. Blockquote border style
Current blockquote uses neutral gray `border-left-4` which is low-prominence in both modes. Apple Notes uses a tinted accent border.
- **A)** Keep neutral gray (matches current Apple HIG quote style)
- **B)** Use `oklch(from var(--color-primary) l c h / 0.35)` for a subtle brand tint

## 4. Focus ring on unclassed interactive elements inside `.cider`
The base `outline: 2px solid transparent` on `.cider :focus-visible` suppresses browser default focus outlines. All class-based components define their own focus rings, but a bare `<button>` or `<a>` without any `.btn-*` class inside `.cider` would lose its focus indicator.
- **A)** Add a fallback focus ring to `.cider :focus-visible` (safe but may conflict with component-specific rings)
- **B)** Keep as-is (documented that unclassed interactive elements need manual focus styling)

## 5. Tag component color-only information in forced-colors mode
`.tag-*` uses `forced-color-adjust: none` to retain Finder-tag colors, bypassing the user's high-contrast override. This means tags only communicate through color in forced-colors mode.
- **A)** Keep `forced-color-adjust: none` (preserves visual intent, tags are supplementary)
- **B)** Remove it and use border-style differentiation per color (accessible but less faithful to Finder)
