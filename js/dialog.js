// Dialog — ciderui
// Uses native <dialog> element — no JS needed for basic open/close.
// This script adds backdrop-click-to-close with exit animation.
function closeDialog(dialog) {
  dialog.setAttribute("data-closing", "");
  dialog.addEventListener("animationend", () => {
    dialog.removeAttribute("data-closing");
    dialog.close();
  }, { once: true });
}

function trapFocus(dialog) {
  const focusable = dialog.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  first.focus();

  function handler(e) {
    if (e.key !== "Tab") return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  // Remove previous handler if any, then store new one
  if (dialog._focusTrapHandler) {
    dialog.removeEventListener("keydown", dialog._focusTrapHandler);
  }
  dialog._focusTrapHandler = handler;
  dialog.addEventListener("keydown", handler);
}

function init() {
  document.querySelectorAll("dialog").forEach((dialog) => {
    // Intercept Escape to trigger close animation instead of instant close
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeDialog(dialog);
    });

    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        closeDialog(dialog);
      }
    });

    // Focus trap on open, cleanup on close
    const observer = new MutationObserver(() => {
      if (dialog.open) {
        trapFocus(dialog);
      } else if (dialog._focusTrapHandler) {
        dialog.removeEventListener("keydown", dialog._focusTrapHandler);
        dialog._focusTrapHandler = null;
      }
    });
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
