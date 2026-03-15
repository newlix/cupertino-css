# Refactor Questions

## [src/css/components/progress.css]

- **問題描述**：`progress-indeterminate` `::after` pseudo-element uses `width: 100%` but the keyframe sweeps `translateX(-100%)` to `translateX(100%)`, producing a visual gap at the loop seam. The `prefers-reduced-motion` fallback uses a static 40% width bar, suggesting the animated bar should also be narrower.
- **可能的做法**：A) Change `::after` to `width: 40%` and adjust keyframe range to cover the full track / B) Keep current width but adjust keyframe timing to eliminate the gap / C) Intentional design — leave as-is
- **目前狀態**：未處理（跳過）
