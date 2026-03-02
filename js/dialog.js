// Dialog — ciderui
// Uses native <dialog> element. Adds backdrop-click-to-close with exit animation,
// focus trapping, scroll lock, and focus restoration.
(function () {
  var activeDialogs = new Set();
  var FOCUSABLE = 'a[href], button:not([disabled]):not([aria-disabled="true"]), input:not([disabled]):not([aria-disabled="true"]), select:not([disabled]):not([aria-disabled="true"]), textarea:not([disabled]):not([aria-disabled="true"]), [tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"])';

  function closeDialog(dialog) {
    if (dialog.hasAttribute("data-closing")) return;
    dialog.setAttribute("data-closing", "");
    var closed = false;
    var duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 10 : 200;
    var timer = setTimeout(function () {
      if (!closed) {
        closed = true;
        dialog.removeAttribute("data-closing");
        dialog.close();
      }
    }, duration);
    if (dialog._closeAnimHandler) {
      dialog.removeEventListener("animationend", dialog._closeAnimHandler);
    }
    dialog._closeAnimHandler = function (e) {
      if (e.target !== dialog) return;
      if (!closed) {
        closed = true;
        clearTimeout(timer);
        dialog.removeAttribute("data-closing");
        dialog.close();
      }
    };
    dialog.addEventListener("animationend", dialog._closeAnimHandler);
  }

  function trapFocus(dialog) {
    var focusable = dialog.querySelectorAll(FOCUSABLE);
    var autofocus = dialog.querySelector("[autofocus]");
    if (autofocus) { autofocus.focus(); }
    else if (focusable.length) { focusable[0].focus(); }

    function handler(e) {
      if (e.key !== "Tab") return;
      var current = dialog.querySelectorAll(FOCUSABLE);
      if (!current.length) return;
      var first = current[0];
      var last = current[current.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    if (dialog._focusTrapHandler) {
      dialog.removeEventListener("keydown", dialog._focusTrapHandler);
    }
    dialog._focusTrapHandler = handler;
    dialog.addEventListener("keydown", handler);
  }

  function init() {
    document.querySelectorAll("dialog").forEach(function (dialog) {
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

      if (dialog._focusObserver) {
        dialog._focusObserver.disconnect();
      }

      var observer = new MutationObserver(function () {
        if (!dialog.isConnected) {
          activeDialogs.delete(dialog);
          if (activeDialogs.size === 0) {
            document.body.style.overflow = document.body._savedOverflow || "";
            delete document.body._savedOverflow;
          }
          if (dialog._focusTrapHandler) {
            dialog.removeEventListener("keydown", dialog._focusTrapHandler);
            dialog._focusTrapHandler = null;
          }
          observer.disconnect();
          return;
        }
        if (dialog.open) {
          if (!dialog._previousFocus) {
            dialog._previousFocus = document.activeElement;
          }
          activeDialogs.add(dialog);
          if (activeDialogs.size === 1) {
            document.body._savedOverflow = document.body.style.overflow;
          }
          document.body.style.overflow = "hidden";
          trapFocus(dialog);
        } else {
          activeDialogs.delete(dialog);
          if (activeDialogs.size === 0) {
            document.body.style.overflow = document.body._savedOverflow || "";
            delete document.body._savedOverflow;
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

  function openDialog(dialog) {
    if (dialog.open || dialog.hasAttribute("data-closing")) return;
    dialog._previousFocus = document.activeElement;
    dialog.showModal();
  }

  window.closeDialog = closeDialog;
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.dialog = { init: init, close: closeDialog, open: openDialog };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
})();
