// Dialog — ciderui
// Uses native <dialog> element — no JS needed for basic open/close.
// This script adds backdrop-click-to-close with exit animation.
var activeDialogs = new Set();

function closeDialog(dialog) {
  dialog.setAttribute("data-closing", "");
  var closed = false;
  var duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 10 : 250;
  var timer = setTimeout(function () {
    if (!closed) {
      closed = true;
      dialog.removeAttribute("data-closing");
      dialog.close();
    }
  }, duration);
  dialog.addEventListener("animationend", function () {
    if (!closed) {
      closed = true;
      clearTimeout(timer);
      dialog.removeAttribute("data-closing");
      dialog.close();
    }
  }, { once: true });
}

function trapFocus(dialog) {
  var focusable = dialog.querySelectorAll(
    'a[href], button:not([disabled]):not([aria-disabled="true"]), input:not([disabled]):not([aria-disabled="true"]), select:not([disabled]):not([aria-disabled="true"]), textarea:not([disabled]):not([aria-disabled="true"]), [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  var first = focusable[0];
  var last = focusable[focusable.length - 1];
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
  document.querySelectorAll("dialog").forEach(function (dialog) {
    // Skip sheets/drawers (handled by sheet.js)
    if (dialog.classList.contains("sheet") || dialog.classList.contains("sheet-left") ||
        dialog.classList.contains("sheet-bottom") || dialog.classList.contains("sheet-top")) return;

    // Guard against duplicate listeners on re-init
    if (dialog._cancelHandler) {
      dialog.removeEventListener("cancel", dialog._cancelHandler);
    }
    dialog._cancelHandler = function (e) {
      e.preventDefault();
      closeDialog(dialog);
    };
    dialog.addEventListener("cancel", dialog._cancelHandler);

    if (dialog._clickHandler) {
      dialog.removeEventListener("click", dialog._clickHandler);
    }
    dialog._clickHandler = function (e) {
      if (e.target === dialog) {
        closeDialog(dialog);
      }
    };
    dialog.addEventListener("click", dialog._clickHandler);

    // Disconnect previous observer if re-initializing
    if (dialog._focusObserver) {
      dialog._focusObserver.disconnect();
    }

    // Focus trap + scroll lock on open, cleanup on close
    var observer = new MutationObserver(function () {
      if (dialog.open) {
        dialog._previousFocus = document.activeElement;
        activeDialogs.add(dialog);
        document.body.style.overflow = "hidden";
        trapFocus(dialog);
      } else {
        activeDialogs.delete(dialog);
        if (activeDialogs.size === 0) {
          document.body.style.overflow = "";
        }
        if (dialog._focusTrapHandler) {
          dialog.removeEventListener("keydown", dialog._focusTrapHandler);
          dialog._focusTrapHandler = null;
        }
        if (dialog._previousFocus && document.contains(dialog._previousFocus)) {
          dialog._previousFocus.focus();
        }
        dialog._previousFocus = null;
      }
    });
    dialog._focusObserver = observer;
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
