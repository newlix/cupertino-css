# Refactor Questions

Items that need user decision before proceeding.

## [src/css/components/dialog.css]

- **問題描述**：Bare `dialog` element selector (line 2) styles every `<dialog>` inside `.cider`, including third-party ones. `action-sheet.css` correctly uses `dialog.action-sheet` to scope.
- **可能的做法**：A) Add `.dialog` class requirement (`dialog.dialog`) — breaking change for existing users / B) Keep as-is if third-party dialogs inside `.cider` are not a real concern
- **目前狀態**：未處理（跳過）

## [js/dialog.js + js/action-sheet.js + js/sidebar.js]

- **問題描述**：Each file manages body `overflow: hidden` scroll-lock independently. If multiple are open simultaneously (e.g. Dialog + ActionSheet), the saved/restored overflow state corrupts — the last one to close restores its stale `savedOverflow`, potentially unlocking scroll while another overlay is still open.
- **可能的做法**：A) Shared `window.CiderUI._scrollLock` counter/registry used by all three / B) Accept the limitation and document it
- **目前狀態**：未處理（跳過）

## [src/css/components/disclosure-group.css + src/css/components/list.css]

- **問題描述**：These two files use raw `outline: 2px solid var(--color-primary)` for focus rings instead of the canonical `box-shadow: var(--focus-ring)` + `outline: 2px solid transparent` pattern used by all other components. The outline approach is visually heavier and doesn't adapt to dark mode opacity adjustments.
- **可能的做法**：A) Switch to `box-shadow: var(--focus-ring)` for consistency / B) Keep as-is if the solid outline is intentional for these components
- **目前狀態**：未處理（跳過）

## [src/css/components/stepper.css + src/css/components/toolbar.css]

- **問題描述**：Focus ring (`box-shadow: var(--focus-ring)`) on child buttons is clipped by parent container's `overflow: hidden`. Keyboard users may see no visible focus indicator.
- **可能的做法**：A) Use `outline` instead of `box-shadow` for focus in overflow-hidden containers / B) Remove `overflow: hidden` from parent / C) Use `outline-offset: -2px` with a visible outline color
- **目前狀態**：未處理（跳過）

## [src/css/components/verification-code.css]

- **問題描述**：On small touch screens (`max-width: 374px` AND `pointer: coarse`), `width: 40px` is immediately overridden by `min-width: 44px`, negating the small-screen reduction. 6 inputs at 44px + gaps may overflow on narrow phones.
- **可能的做法**：A) Remove `min-width: 44px` in the small-screen context / B) Lower `min-width` to 40px / C) Accept the 44px minimum for touch accessibility
- **目前狀態**：未處理（跳過）
