// Sheet — ciderui
// Uses native <dialog> element. Adds backdrop-click-to-close with exit animation.
var activeSheets = new Set();

function closeSheet(sheet) {
  if (sheet.hasAttribute("data-closing")) return;
  sheet.setAttribute("data-closing", "");
  var closed = false;
  var duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 10 : 350;
  var timer = setTimeout(function () {
    if (!closed) {
      closed = true;
      sheet.removeAttribute("data-closing");
      sheet.close();
    }
  }, duration);
  if (sheet._closeAnimHandler) {
    sheet.removeEventListener("animationend", sheet._closeAnimHandler);
  }
  sheet._closeAnimHandler = function () {
    if (!closed) {
      closed = true;
      clearTimeout(timer);
      sheet.removeAttribute("data-closing");
      sheet.close();
    }
  };
  sheet.addEventListener("animationend", sheet._closeAnimHandler, { once: true });
}

function trapFocus(sheet) {
  var focusable = sheet.querySelectorAll(
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

  if (sheet._focusTrapHandler) {
    sheet.removeEventListener("keydown", sheet._focusTrapHandler);
  }
  sheet._focusTrapHandler = handler;
  sheet.addEventListener("keydown", handler);
}

function init() {
  document.querySelectorAll("dialog.sheet").forEach(function (sheet) {
    // Guard against duplicate listeners on re-init
    if (sheet._cancelHandler) {
      sheet.removeEventListener("cancel", sheet._cancelHandler);
    }
    sheet._cancelHandler = function (e) {
      e.preventDefault();
      closeSheet(sheet);
    };
    sheet.addEventListener("cancel", sheet._cancelHandler);

    if (sheet._clickHandler) {
      sheet.removeEventListener("click", sheet._clickHandler);
    }
    sheet._clickHandler = function (e) {
      if (e.target === sheet) {
        closeSheet(sheet);
      }
    };
    sheet.addEventListener("click", sheet._clickHandler);

    // Disconnect previous observer if re-initializing
    if (sheet._focusObserver) {
      sheet._focusObserver.disconnect();
    }

    // Focus trap + scroll lock on open, cleanup on close
    var observer = new MutationObserver(function () {
      if (sheet.open) {
        sheet._previousFocus = document.activeElement;
        activeSheets.add(sheet);
        document.body.style.overflow = "hidden";
        trapFocus(sheet);
      } else {
        activeSheets.delete(sheet);
        if (activeSheets.size === 0) {
          document.body.style.overflow = "";
        }
        if (sheet._focusTrapHandler) {
          sheet.removeEventListener("keydown", sheet._focusTrapHandler);
          sheet._focusTrapHandler = null;
        }
        if (sheet._previousFocus && document.contains(sheet._previousFocus)) {
          sheet._previousFocus.focus();
        }
        sheet._previousFocus = null;
      }
    });
    sheet._focusObserver = observer;
    observer.observe(sheet, { attributes: true, attributeFilter: ["open"] });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
