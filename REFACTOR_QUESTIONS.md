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

## [src/css/components/verification-code.css]

- **問題描述**：On small touch screens (`max-width: 374px` AND `pointer: coarse`), `width: 40px` is immediately overridden by `min-width: 44px`, negating the small-screen reduction. 6 inputs at 44px + gaps may overflow on narrow phones.
- **可能的做法**：A) Remove `min-width: 44px` in the small-screen context / B) Lower `min-width` to 40px / C) Accept the 44px minimum for touch accessibility
- **目前狀態**：未處理（跳過）

## [js/dialog.js + js/action-sheet.js]

- **問題描述**：`FOCUSABLE` selector, `isVisible()`, and `trapFocus()` are duplicated verbatim across both files (~90 lines each). Any focus-trap fix must be applied in two places.
- **可能的做法**：A) Extract shared `CiderUI._focusTrap` helper (loaded first, used by both) / B) Keep duplication to preserve independent script loading
- **目前狀態**：未處理（跳過）
