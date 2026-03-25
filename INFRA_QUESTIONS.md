# Infra Questions

## [.gitignore + dist/]

- **問題描述**：`dist/` 已 commit 進 git 但不在 `.gitignore`。CI（pages.yml）不跑 `npm run build`，所以 committed 的 `dist/` 可能與 source 不同步而無人察覺。
- **可能的做法**：A) 加 `dist/` 到 `.gitignore`，改在 release 時才 build B) 維持 commit dist/ 但在 CI 加 `npm run build` 驗證
- **目前狀態**：未處理（跳過）

## [package.json — npx serve]

- **問題描述**：`dev` script 用 `npx serve` 但 `serve` 不在 devDependencies，版本不固定。每次 `npx` 可能下載不同版本。
- **可能的做法**：A) 加 `serve` 到 devDependencies B) 用 `scripts/test-server.js` 取代（已有現成的 static server）
- **目前狀態**：未處理（跳過）
