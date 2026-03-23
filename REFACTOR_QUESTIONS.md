# Refactor Questions

## [js/action-sheet.js, js/dialog.js, js/sidebar.js]

- **問題描述**：`FOCUSABLE` selector 字串與 `isVisible()` 函式在三個檔案中完全重複。`popover.js` 有自己的變體（`FOCUSABLE_ALL` / `FOCUSABLE_NOT_DISABLED`），排除條件略有不同。
- **可能的做法**：A) 透過 `window.CiderUI._focusable` 共享（類似已有的 `_scrollLock`）B) 保持各自 IIFE 獨立，接受重複以換取零耦合
- **目前狀態**：未處理（跳過）

## [js/tabs.js]

- **問題描述**：`destroy()` 無條件移除 `aria-controls` 與 `aria-labelledby`，但沒有追蹤這些屬性是否由元件自己設定。若使用者預先手動設定了 `aria-controls`，`destroy()` 會誤刪。`stepper.js` 有追蹤機制（`_stepperSetRole` 等 flag），`tabs.js` 沒有。
- **可能的做法**：A) 仿照 stepper 追蹤 flag B) 接受現狀，因為使用者不太可能在 tab 元件上手動設定 `aria-controls`
- **目前狀態**：未處理（跳過）

## [docs/snippet.js]

- **問題描述**：`snippet.js` 沒有用 IIFE 包裝、不註冊 `CiderUI` namespace、不支援 htmx 重載。`aria-selected` 設在沒有 `role="tab"` 的按鈕上，不符合 ARIA 規範。
- **可能的做法**：A) 改為標準 IIFE + CiderUI namespace 模式 B) 維持現狀，因為這只是 docs 內部工具
- **目前狀態**：未處理（跳過）
