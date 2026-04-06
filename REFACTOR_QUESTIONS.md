# Refactor Questions

## [js/cider.js] htmx:afterSettle listener accumulation
- **問題描述**：All 10 IIFEs register `document.addEventListener("htmx:afterSettle", init)` with no dedup guard. If cider.js is evaluated more than once (e.g. HTMX full-page swap re-injecting `<script>`), listeners accumulate permanently. The `_xInit` guard inside each `init()` prevents double-initialization of elements, but the leaked listeners cannot be cleaned up.
- **可能的做法**：
  A. Add a global flag per IIFE to skip re-registration (`if (!window._ciderHtmxActionSheet) { ... }`)
  B. Store listener references on `window.CiderUI` so they can be removed before re-adding
  C. Accept the current behavior — low risk since script is normally loaded once
- **目前狀態**：未處理（跳過）
