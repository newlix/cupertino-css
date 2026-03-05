# Refactor Questions

Items deferred for user decision — these are structural improvements, not bugs.

## js/popover.js
- **Problem**: `init()` is ~288 lines — the largest single function in the codebase. Contains positioning, ARIA, toggle, disconnect observer, escape, focus trap, menu click, menu keyboard, and type-ahead logic.
- **Possible approach**: Extract into 4-5 named helpers (e.g. `positionPopover`, `handleToggle`, `handleMenuKeyboard`, `setupAriaLabels`). The challenge is they share closure state (`trigger`, `wrapper`, `isMenu`, `popover`).
- **Status**: Not processed (skip)

## js/verification-code.js
- **Problem**: `init()` is ~157 lines with 3-4 levels of nesting (forEach > forEach > event handler).
- **Possible approach**: Extract per-container setup into `setupOTP(otp)`.
- **Status**: Not processed (skip)

## js/tabs.js
- **Problem**: `init()` is ~146 lines with deeply nested closures.
- **Possible approach**: Extract per-tabGroup setup into `setupTabGroup(tabGroup)`.
- **Status**: Not processed (skip)

## js/dialog.js
- **Problem**: Close-animation cleanup pattern (clear timer, remove animationend handler, remove data-closing) duplicated in 4 places.
- **Possible approach**: Extract into `clearCloseState(dialog)` helper.
- **Status**: Not processed (skip)

## js/popover.js — content popover focus trap
- **Problem**: Non-menu content popovers wrap Tab focus at first/last element (lines 222-238), creating a keyboard trap. Menu popovers correctly dismiss on Tab, but content popovers do not.
- **Possible approach**: A) Tab-out dismisses the popover (consistent with non-modal nature) / B) Keep trap (modal-like behavior is intentional)
- **Status**: Not processed (skip)

## js/dialog.js — duplicated cleanup logic
- **Problem**: Dialog cleanup is implemented in 3 separate places: `teardown()`, MutationObserver close branch, and `htmx:beforeCleanupElement` handler. The overflow-restore logic diverges between them, risking loss of custom `body { overflow }` styles.
- **Possible approach**: Extract a single `destroy(dialog)` function for all cleanup paths.
- **Status**: Not processed (skip)

## js/dialog.js — openDialog on uninitialized dialog
- **Problem**: `openDialog(dialog)` calls `init()` if `dialog._dialogInit` is falsy, but doesn't re-check after `init()`. If the dialog wasn't found by `querySelectorAll`, it proceeds to `showModal()` without handlers.
- **Possible approach**: Add guard `if (!dialog._dialogInit) return;` after `init()`.
- **Status**: Not processed (skip)

## src/css/components/popover.css
- **Problem**: `allow-discrete` keyword in `transition` shorthand (lines 26, 50) can cause the entire transition to fail in browsers that don't support it (pre-Chrome 117, pre-Firefox 129).
- **Possible approach**: A) Add fallback `transition` declaration / B) Keep as progressive enhancement
- **Status**: Not processed (skip)

## src/css/components/callout.css, list.css, and others
- **Problem**: Relative color syntax `oklch(from var(...) l c h / alpha)` requires Firefox 128+. Falls back to inherited foreground (text fully opaque instead of 82%).
- **Possible approach**: A) Add `color-mix()` fallback / B) Document minimum Firefox version / C) Keep as graceful degradation
- **Status**: Not processed (skip)

## src/css/ciderui.css — --hud-text token
- **Problem**: `--hud-text` not redefined in `.dark` block. Current light-mode value happens to be correct for dark mode too, but changing it would silently break dark mode.
- **Possible approach**: A) Explicitly set in `.dark` / B) Keep current
- **Status**: Not processed (skip)

## src/css/components/elements.css — font stack
- **Problem**: Font stack in `:scope` omits `"SF Pro"` and `"SF Pro Display"` present in body base layer.
- **Possible approach**: A) Align font stacks / B) Keep separate (body text font only — intentional)
- **Status**: Not processed (skip)

## docs/index.njk — standalone vs layout
- **Problem**: Homepage duplicates `<head>` boilerplate and theme toggle logic from `layout.njk`.
- **Possible approach**: A) Extract shared theme scripts to a partial / B) Keep as-is
- **Status**: Not processed (skip)

## src/css/components/progress.css — transition on progress value
- **Problem**: `transition: width` on `::-webkit-progress-value` is unreliable across browser versions.
- **Possible approach**: A) Add comment documenting best-effort / B) Switch to div-based progress / C) Keep current
- **Status**: Not processed (skip)
