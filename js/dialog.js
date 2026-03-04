// Dialog — ciderui
// Uses native <dialog> element. Adds backdrop-click-to-close with exit animation,
// focus trapping, scroll lock, and focus restoration.
(function () {
  const activeDialogs = new Set();
  let savedOverflow = null;
  const FOCUSABLE = 'a[href]:not([aria-disabled="true"]), button:not([disabled]):not([aria-disabled="true"]), input:not([disabled]):not([aria-disabled="true"]), select:not([disabled]):not([aria-disabled="true"]), textarea:not([disabled]):not([aria-disabled="true"]), [tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"])';

  function closeDialog(dialog) {
    if (dialog.hasAttribute("data-closing")) return;
    if (dialog._closeAnimHandler) {
      dialog.removeEventListener("animationend", dialog._closeAnimHandler);
      dialog._closeAnimHandler = null;
    }
    if (dialog._closeTimer) {
      clearTimeout(dialog._closeTimer);
      dialog._closeTimer = null;
    }
    let closed = false;
    function finish() {
      if (closed) return;
      closed = true;
      if (dialog._closeTimer) clearTimeout(dialog._closeTimer);
      dialog._closeTimer = null;
      dialog.removeAttribute("data-closing");
      if (dialog._closeAnimHandler) {
        dialog.removeEventListener("animationend", dialog._closeAnimHandler);
        dialog._closeAnimHandler = null;
      }
      dialog.close();
    }
    dialog._closeAnimHandler = (e) => {
      if (e.target !== dialog) return;
      finish();
    };
    dialog.addEventListener("animationend", dialog._closeAnimHandler);
    dialog.setAttribute("data-closing", "");
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 10 : 180;
    dialog._closeTimer = setTimeout(finish, duration);
  }

  function isVisible(el) {
    return el.offsetParent !== null || el.getClientRects().length > 0;
  }

  function trapFocus(dialog) {
    const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(isVisible);
    const autofocus = dialog.querySelector("[autofocus]");
    const defaultBtn = dialog.querySelector("footer .btn-filled, footer button[type='submit']");
    if (autofocus) { autofocus.focus(); }
    else if (defaultBtn) { defaultBtn.focus(); }
    else if (focusable.length) { focusable[0].focus(); }

    function handler(e) {
      if (e.key !== "Tab") return;
      const current = Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(isVisible);
      if (!current.length) return;
      const first = current[0];
      const last = current[current.length - 1];
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

  function wireAria(dialog) {
    const heading = dialog.querySelector("header :is(h1, h2, h3, h4, h5, h6)");
    const desc = dialog.querySelector("header p");
    if (heading && !dialog.getAttribute("aria-labelledby")) {
      if (!heading.id) heading.id = `dlg-title-${Math.random().toString(36).slice(2, 8)}`;
      dialog.setAttribute("aria-labelledby", heading.id);
    }
    if (desc && !dialog.getAttribute("aria-describedby")) {
      if (!desc.id) desc.id = `dlg-desc-${Math.random().toString(36).slice(2, 8)}`;
      dialog.setAttribute("aria-describedby", desc.id);
    }
  }

  function init() {
    document.querySelectorAll("dialog").forEach((dialog) => {
      if (dialog._dialogInit) return;
      dialog._dialogInit = true;
      wireAria(dialog);
      if (dialog._cancelHandler) {
        dialog.removeEventListener("cancel", dialog._cancelHandler);
      }
      dialog._cancelHandler = (e) => {
        e.preventDefault();
        if (!dialog.hasAttribute("data-modal")) closeDialog(dialog);
      };
      dialog.addEventListener("cancel", dialog._cancelHandler);

      if (dialog._mousedownHandler) {
        dialog.removeEventListener("mousedown", dialog._mousedownHandler);
      }
      dialog._mousedownHandler = (e) => { dialog._mousedownTarget = e.target; };
      dialog.addEventListener("mousedown", dialog._mousedownHandler);

      if (dialog._clickHandler) {
        dialog.removeEventListener("click", dialog._clickHandler);
      }
      dialog._clickHandler = (e) => {
        if (e.target === dialog && dialog._mousedownTarget === dialog && !dialog.hasAttribute("data-modal")) {
          closeDialog(dialog);
        }
        dialog._mousedownTarget = null;
      };
      dialog.addEventListener("click", dialog._clickHandler);

      if (dialog._focusObserver) {
        dialog._focusObserver.disconnect();
      }

      function teardown() {
        const wasActive = activeDialogs.delete(dialog);
        if (wasActive && activeDialogs.size === 0) {
          document.body.style.overflow = savedOverflow ?? "";
          savedOverflow = null;
        }
        if (dialog._focusTrapHandler) {
          dialog.removeEventListener("keydown", dialog._focusTrapHandler);
          dialog._focusTrapHandler = null;
        }
      }

      const observer = new MutationObserver(() => {
        if (!dialog.isConnected) {
          teardown();
          observer.disconnect();
          return;
        }
        if (dialog.open) {
          const isModal = dialog.matches(":modal");
          if (isModal && !activeDialogs.has(dialog)) {
            if (!dialog._previousFocus) {
              const candidate = document.activeElement;
              dialog._previousFocus = dialog.contains(candidate) ? document.body : candidate;
            }
            if (activeDialogs.size === 0) {
              savedOverflow = document.body.style.overflow;
            }
            activeDialogs.add(dialog);
            document.body.style.overflow = "hidden";
            wireAria(dialog);
            dialog.setAttribute("aria-modal", "true");
            trapFocus(dialog);
          }
        } else {
          if (dialog._closeTimer) { clearTimeout(dialog._closeTimer); dialog._closeTimer = null; }
          if (dialog._closeAnimHandler) {
            dialog.removeEventListener("animationend", dialog._closeAnimHandler);
            dialog._closeAnimHandler = null;
          }
          dialog.removeAttribute("data-closing");
          dialog.removeAttribute("aria-modal");
          teardown();
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
    if (!dialog || !dialog.isConnected) return;
    if (dialog.hasAttribute("data-closing")) {
      const obs = new MutationObserver(() => {
        if (!dialog.isConnected) { obs.disconnect(); clearTimeout(safetyTimer); return; }
        if (!dialog.hasAttribute("data-closing") && !dialog.open) {
          obs.disconnect();
          clearTimeout(safetyTimer);
          openDialog(dialog);
        }
      });
      obs.observe(dialog, { attributes: true, attributeFilter: ["data-closing", "open"] });
      const safetyTimer = setTimeout(() => {
        obs.disconnect();
        if (dialog.isConnected && !dialog.open) openDialog(dialog);
      }, 300);
      return;
    }
    if (dialog.open) return;
    dialog._previousFocus = document.activeElement;
    dialog.showModal();
  }

  window.closeDialog = closeDialog;
  window.openDialog = openDialog;
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.dialog = { init, close: closeDialog, open: openDialog };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", (evt) => {
    const el = evt.detail?.elt;
    if (!el) return;
    const dialogs = el.tagName === "DIALOG" ? [el] : Array.from(el.querySelectorAll?.("dialog") || []);
    dialogs.forEach((dialog) => {
      if (!dialog._dialogInit) return;
      if (dialog._cancelHandler) { dialog.removeEventListener("cancel", dialog._cancelHandler); dialog._cancelHandler = null; }
      if (dialog._mousedownHandler) { dialog.removeEventListener("mousedown", dialog._mousedownHandler); dialog._mousedownHandler = null; }
      if (dialog._clickHandler) { dialog.removeEventListener("click", dialog._clickHandler); dialog._clickHandler = null; }
      if (dialog._focusObserver) { dialog._focusObserver.disconnect(); dialog._focusObserver = null; }
      if (dialog._focusTrapHandler) { dialog.removeEventListener("keydown", dialog._focusTrapHandler); dialog._focusTrapHandler = null; }
      if (dialog._closeTimer) { clearTimeout(dialog._closeTimer); dialog._closeTimer = null; }
      if (dialog._closeAnimHandler) { dialog.removeEventListener("animationend", dialog._closeAnimHandler); dialog._closeAnimHandler = null; }
      activeDialogs.delete(dialog);
      if (activeDialogs.size === 0 && savedOverflow !== null) {
        document.body.style.overflow = savedOverflow ?? "";
        savedOverflow = null;
      }
      dialog._dialogInit = false;
    });
  });
})();
