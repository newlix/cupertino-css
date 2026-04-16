// CiderUI — Interactive components
// All component JS bundled into a single file for easy inclusion.
// Each component is wrapped in its own IIFE for encapsulation.
//
// Public API (window.CiderUI.*):
//   actionSheet        { init, destroy, open, close }
//   dialog             { init, destroy, open, close }
//   hud                { init, show, destroy }
//   picker             { init, destroy }
//   popover            { init, destroy }
//   sidebar            { init, destroy }
//   slider             { init, update, destroy }
//   stepper            { init, destroy }
//   tabs               { init, destroy }
//   tokenField         { init, destroy }
//   verificationCode   { init, destroy }
//
// Window globals:
//   openDialog(el) / closeDialog(el)
//   openActionSheet(el) / closeActionSheet(el)
//   showHUD(label, opts?) → { dismiss, element }

// ── Shared Utilities ──
// Used by ActionSheet, Dialog, and Sidebar for scroll locking, focus trapping,
// and element visibility checks. Defined once to avoid 3× duplication.
window.CiderUI = window.CiderUI || {};

window.CiderUI._scrollLock = window.CiderUI._scrollLock || {
  count: 0,
  savedOverflow: null,
  savedPaddingRight: null,
  lock() {
    if (this.count++ === 0) {
      this.savedOverflow = document.body.style.overflow;
      this.savedPaddingRight = document.body.style.paddingRight;
      const sw = window.innerWidth - document.documentElement.clientWidth;
      if (sw > 0) document.body.style.paddingRight = `${sw}px`;
      document.body.style.overflow = "hidden";
    }
  },
  unlock() {
    if (this.count <= 0) return;
    if (--this.count === 0) {
      document.body.style.overflow = this.savedOverflow ?? "";
      document.body.style.paddingRight = this.savedPaddingRight ?? "";
      this.savedOverflow = null;
      this.savedPaddingRight = null;
    }
  },
};

window.CiderUI._FOCUSABLE =
  'a[href]:not([tabindex="-1"]):not([aria-disabled="true"]), button:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"]), input:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"]), select:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"]), textarea:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"]), [tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"])';

window.CiderUI._isVisible = function (el) {
  if (el.getClientRects().length === 0) return false;
  const style = getComputedStyle(el);
  return style.visibility !== "hidden" && style.visibility !== "collapse";
};
