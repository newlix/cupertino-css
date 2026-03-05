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
