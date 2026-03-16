# Refactor Questions

Items requiring user decision before proceeding.

## [src/css/components/*.css] `.dark &` vs `@custom-variant dark`

- **問題描述**：多個 component CSS 檔案（button.css、avatar.css、card.css、callout.css、list.css、slider.css、elements.css 等）使用原始 `.dark &` nesting 而非 `ciderui.css` 定義的 `@custom-variant dark`。兩者功能等效，但若 dark variant 定義日後改為支援 `prefers-color-scheme`，散落的 `.dark &` 不會跟著更新。
- **可能的做法**：A) 統一改用 `@variant dark { }` / B) 保持現狀（`.dark &` 在 `@scope` 內功能正確）
- **目前狀態**：未處理（跳過）

## [js/stepper.js] 動態屬性變更不會反映

- **問題描述**：`data-min`、`data-max`、`data-step`、`data-value` 在 init 時讀取一次後 close-over。若 HTMX partial swap 更新屬性但不替換元素，stepper 會繼續使用舊值。`slider.js` 已有 MutationObserver 處理此情況。
- **可能的做法**：A) 加 MutationObserver 監聽 data-\* 屬性變化（與 slider.js 一致）/ B) 保持現狀（HTMX swap 通常替換整個元素）
- **目前狀態**：未處理（跳過）

## [js/action-sheet.js, dialog.js, sidebar.js] `_scrollLock` 和 `FOCUSABLE` 重複

- **問題描述**：`_scrollLock` 物件和 `FOCUSABLE` selector 在三個檔案中逐字複製。修改 scroll lock 行為需更新三處。
- **可能的做法**：A) 抽到共用模組 / B) 保持現狀（專案設計哲學為每個 JS 檔案 self-contained）
- **目前狀態**：未處理（跳過）

## [src/css/components/sidebar.css] `text-overflow: ellipsis` 在 flex container 上無效

- **問題描述**：`.sidebar a` 和 `.sidebar button` 是 `display: flex` 元素，`text-overflow: ellipsis` 在 flex container 上不會產生省略號。truncation 需要套用在文字子元素上。
- **可能的做法**：A) 用 `& > span:not(.badge):not([class])` 選擇器把 truncation 套在文字子元素上 / B) 需要配合 docs 中 HTML 結構變更
- **目前狀態**：未處理（跳過）— 涉及 public API（HTML 結構）

## [js/sidebar.js] `close(false)` 跳過 focus restore 但元素有 `aria-modal="true"`

- **問題描述**：點擊 sidebar 內連結時呼叫 `close(false)` 跳過 focus restore，但 panel 宣告了 `role="dialog" aria-modal="true"`。ARIA spec 要求 modal dialog 關閉時必須將焦點移回。
- **可能的做法**：A) 連結情境下也做 focus restore / B) 保持現狀（SPA navigation 後 focus 由瀏覽器處理）
- **目前狀態**：未處理（跳過）

## [src/css/ciderui.css] `--tooltip-text: var(--hud-text)` alias chain

- **問題描述**：dark mode 中 `--tooltip-text` 透過 `var(--hud-text)` 取值而非直接宣告。語意上 tooltip 和 HUD 文字顏色是獨立的，但被連結在一起。
- **可能的做法**：A) `--tooltip-text` 直接宣告值 / B) 保持 alias（目前值正確）
- **目前狀態**：未處理（跳過）

## [src/css/components/popover.css] `@starting-style` 在 reduced-motion 下仍觸發

- **問題描述**：`prefers-reduced-motion: reduce` 時全域規則將 `transition-duration` 設為 `0.01ms`，但 `@starting-style` 仍宣告 `opacity: 0; transform: scale(0.96)`，會造成單幀閃爍。
- **可能的做法**：A) 在 reduced-motion 下覆寫 `@starting-style` / B) 保持現狀（0.01ms 已經足夠快，肉眼不可見）
- **目前狀態**：未處理（跳過）

## [src/css/components/tag.css] focus ring 在 card 表面上的 halo

- **問題描述**：interactive tag 的 focus ring 使用 `var(--color-background)` 作為內圈顏色。放在 card 上時會出現與表面不匹配的色環。
- **可能的做法**：A) 改用 `var(--color-card)` / B) 保持現狀（tag 主要用在背景色表面）
- **目前狀態**：未處理（跳過）

## [js/tabs.js] 無測試覆蓋

- **問題描述**：tabs.js 是唯一沒有對應 spec 檔的 interactive JS component。包含鍵盤導航、ARIA wiring、vertical orientation、ResizeObserver indicator 等行為都未被測試。
- **可能的做法**：補寫 `tests/tabs.spec.js`
- **目前狀態**：未處理（跳過）
