# Design Questions

Items flagged during automated HIG review that need human decision.

## Font Size: 10px on tab-bar and gauge-sm

**Components:** `tab-bar.css:25`, `gauge.css:33`
**Issue:** 10px is below HIG's 11pt (~14.67px) minimum. However, Apple's own iOS UITabBar uses 10px labels, and a 40px gauge physically can't fit larger text well.
**Decision needed:** Keep 10px to match native iOS fidelity, or bump to 11px for web accessibility?

## Font Size: 13px on small, legend, th

**Components:** `elements.css` — `small` (line 737), `fieldset > legend` (line 727), `th` (line 625)
**Issue:** 13px (~9.75pt) is below HIG's 11pt minimum. These are secondary/supporting text elements. 13px is a common web convention for helper text and table headers.
**Decision needed:** Keep 13px for design density, or increase to 15px for strict HIG compliance?

## Dark mode pattern: `.dark &` vs CSS variables

**Components:** `sidebar.css:83-94`, `page-control.css:21-54`
**Issue:** These components use `.dark &` nesting for dark mode overrides instead of CSS variables defined in `:root`/`.dark` blocks (the pattern used by most other components). Both approaches work correctly; this is a consistency concern.
**Decision needed:** Extract to CSS variables for consistency, or keep `.dark &` for locality?

## Avatar group ring on non-background surfaces

**Component:** `avatar.css:75-76`
**Issue:** `--avatar-group-ring` defaults to `--color-background`. When avatar groups sit on cards (darker in dark mode), the ring creates a visible halo. Users can override via `--avatar-group-ring: var(--color-card)`.
**Decision needed:** Change default to a more adaptive value, or document the override pattern?
