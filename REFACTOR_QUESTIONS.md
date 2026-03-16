# Refactor Questions

Items requiring user decision before proceeding.

## [js/action-sheet.js, dialog.js, sidebar.js] `_scrollLock` 和 `FOCUSABLE` 重複

- **問題描述**：`_scrollLock` 物件和 `FOCUSABLE` selector 在三個檔案中逐字複製。修改 scroll lock 行為需更新三處。
- **可能的做法**：A) 抽到共用模組 / B) 保持現狀（專案設計哲學為每個 JS 檔案 self-contained）
- **目前狀態**：未處理（跳過）

## [src/css/components/sidebar.css] `text-overflow: ellipsis` 在 flex container 上無效

- **問題描述**：`.sidebar a` 和 `.sidebar button` 是 `display: flex` 元素，`text-overflow: ellipsis` 在 flex container 上不會產生省略號。truncation 需要套用在文字子元素上。
- **可能的做法**：A) 用 `& > span:not(.badge):not([class])` 選擇器把 truncation 套在文字子元素上 / B) 需要配合 docs 中 HTML 結構變更 / C) 保持現狀（現代瀏覽器已支援 flex container 上的 text-overflow）
- **目前狀態**：未處理（跳過）— 涉及 public API（HTML 結構）

## [js/tabs.js] 無測試覆蓋

- **問題描述**：tabs.js 是唯一沒有對應 spec 檔的 interactive JS component。包含鍵盤導航、ARIA wiring、vertical orientation、ResizeObserver indicator 等行為都未被測試。
- **可能的做法**：補寫 `tests/tabs.spec.js`
- **目前狀態**：未處理（跳過）
