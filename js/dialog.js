// Dialog — ciderui
// Uses native <dialog> element. Adds backdrop-click-to-close with exit animation,
// focus trapping, scroll lock, and focus restoration.
(function () {
  const activeDialogs = new Set();
  let savedOverflow = null;

  function restoreScrollLock(dialog) {
    const wasActive = activeDialogs.delete(dialog);
    if (wasActive && activeDialogs.size === 0 && savedOverflow !== null) {
      document.body.style.overflow = savedOverflow ?? "";
      document.body.style.paddingRight = "";
      savedOverflow = null;
    }
  }

  const FOCUSABLE =
    'a[href]:not([tabindex="-1"]):not([aria-disabled="true"]), button:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"]), input:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"]), select:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"]), textarea:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"]), [tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"])';

  function clearCloseAnim(dialog) {
    if (dialog._closeTimer) {
      clearTimeout(dialog._closeTimer);
      dialog._closeTimer = null;
    }
    if (dialog._closeAnimHandler) {
      dialog.removeEventListener("animationend", dialog._closeAnimHandler);
      dialog._closeAnimHandler = null;
    }
  }

  function closeDialog(dialog) {
    if (dialog.hasAttribute("data-closing")) return;
    clearCloseAnim(dialog);
    let closed = false;
    function finish() {
      if (closed) return;
      closed = true;
      clearCloseAnim(dialog);
      dialog.removeAttribute("data-closing");
      dialog.close();
    }
    dialog._closeAnimHandler = (e) => {
      if (e.target !== dialog || e.animationName !== "scaleOut") return;
      finish();
    };
    dialog.addEventListener("animationend", dialog._closeAnimHandler);
    dialog.setAttribute("data-closing", "");
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 10
      : 180;
    dialog._closeTimer = setTimeout(finish, duration);
  }

  function isVisible(el) {
    if (el.getClientRects().length === 0) return false;
    const style = getComputedStyle(el);
    return style.visibility !== "hidden" && style.visibility !== "collapse";
  }

  function trapFocus(dialog) {
    const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(
      isVisible,
    );
    const autofocus = dialog.querySelector("[autofocus]");
    const defaultBtn = dialog.querySelector(
      "footer .btn-filled:not(.btn-destructive), footer button[type='submit']:not(.btn-destructive)",
    );
    if (autofocus && isVisible(autofocus)) {
      autofocus.focus();
    } else if (defaultBtn && isVisible(defaultBtn)) {
      defaultBtn.focus();
    } else if (focusable.length) {
      focusable[0].focus();
    }

    function handler(e) {
      if (e.key !== "Tab") return;
      const current = Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(
        isVisible,
      );
      if (!current.length) return;
      const first = current[0];
      const last = current.at(-1);
      if (!current.includes(document.activeElement)) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
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
      if (!heading.id)
        heading.id = `dlg-title-${Math.random().toString(36).slice(2, 8)}`;
      dialog.setAttribute("aria-labelledby", heading.id);
    }
    if (desc && !dialog.getAttribute("aria-describedby")) {
      if (!desc.id)
        desc.id = `dlg-desc-${Math.random().toString(36).slice(2, 8)}`;
      dialog.setAttribute("aria-describedby", desc.id);
    }
    dialog.querySelectorAll(".dialog-close").forEach((btn) => {
      if (
        !btn.getAttribute("aria-label") &&
        !btn.getAttribute("aria-labelledby")
      ) {
        btn.setAttribute("aria-label", "Close");
      }
    });
  }

  function init() {
    document.querySelectorAll("dialog.dialog").forEach((dialog) => {
      if (dialog._dialogInit) return;
      dialog._dialogInit = true;
      wireAria(dialog);
      dialog._cancelHandler = (e) => {
        e.preventDefault();
        if (!dialog.hasAttribute("data-modal")) closeDialog(dialog);
      };
      dialog.addEventListener("cancel", dialog._cancelHandler);

      dialog._mousedownHandler = (e) => {
        dialog._mousedownTarget = e.target;
      };
      dialog.addEventListener("mousedown", dialog._mousedownHandler);

      dialog._clickHandler = (e) => {
        if (
          e.target === dialog &&
          dialog._mousedownTarget === dialog &&
          !dialog.hasAttribute("data-modal")
        ) {
          closeDialog(dialog);
        }
        dialog._mousedownTarget = null;
      };
      dialog.addEventListener("click", dialog._clickHandler);

      function teardown() {
        restoreScrollLock(dialog);
        if (dialog._focusTrapHandler) {
          dialog.removeEventListener("keydown", dialog._focusTrapHandler);
          dialog._focusTrapHandler = null;
        }
      }

      const observer = new MutationObserver(() => {
        if (!dialog.isConnected) {
          teardown();
          dialog._previousFocus = null;
          observer.disconnect();
          return;
        }
        if (dialog.open) {
          const isModal = dialog.matches(":modal");
          if (isModal && !activeDialogs.has(dialog)) {
            if (!dialog._previousFocus) {
              const candidate = document.activeElement;
              dialog._previousFocus = dialog.contains(candidate)
                ? document.body
                : candidate;
            }
            if (activeDialogs.size === 0) {
              savedOverflow = document.body.style.overflow;
              const scrollbarWidth =
                window.innerWidth - document.documentElement.clientWidth;
              if (scrollbarWidth > 0)
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }
            activeDialogs.add(dialog);
            document.body.style.overflow = "hidden";
            wireAria(dialog);
            dialog.setAttribute("aria-modal", "true");
            trapFocus(dialog);
          }
        } else {
          clearCloseAnim(dialog);
          dialog.removeAttribute("data-closing");
          dialog.removeAttribute("aria-modal");
          teardown();
          const prev = dialog._previousFocus;
          dialog._previousFocus = null;
          if (
            prev &&
            document.contains(prev) &&
            (prev === document.body || isVisible(prev))
          ) {
            prev.focus();
          }
        }
      });
      dialog._focusObserver = observer;
      observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    });
  }

  function openDialog(dialog) {
    if (!dialog || !dialog.isConnected) return;
    if (!dialog._dialogInit) init();
    if (!dialog._dialogInit) return;
    if (dialog.hasAttribute("data-closing")) {
      if (dialog._openWaitObs) return;
      const obs = new MutationObserver(() => {
        if (!dialog.isConnected) {
          obs.disconnect();
          clearTimeout(dialog._openWaitTimer);
          dialog._openWaitObs = null;
          dialog._openWaitTimer = null;
          return;
        }
        if (!dialog.hasAttribute("data-closing") && !dialog.open) {
          obs.disconnect();
          clearTimeout(dialog._openWaitTimer);
          dialog._openWaitObs = null;
          dialog._openWaitTimer = null;
          openDialog(dialog);
        }
      });
      dialog._openWaitObs = obs;
      obs.observe(dialog, {
        attributes: true,
        attributeFilter: ["data-closing", "open"],
      });
      dialog._openWaitTimer = setTimeout(() => {
        obs.disconnect();
        dialog._openWaitObs = null;
        dialog._openWaitTimer = null;
        if (dialog.isConnected && !dialog.open) openDialog(dialog);
      }, 300);
      return;
    }
    if (dialog.open) return;
    dialog._previousFocus = document.activeElement;
    try {
      dialog.showModal();
    } catch {
      /* dialog may have been removed or is already modal */
    }
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
    const dialogs =
      el.tagName === "DIALOG" && el.classList.contains("dialog")
        ? [el]
        : Array.from(el.querySelectorAll?.("dialog.dialog") || []);
    dialogs.forEach((dialog) => {
      if (!dialog._dialogInit) return;
      if (dialog._cancelHandler) {
        dialog.removeEventListener("cancel", dialog._cancelHandler);
        dialog._cancelHandler = null;
      }
      if (dialog._mousedownHandler) {
        dialog.removeEventListener("mousedown", dialog._mousedownHandler);
        dialog._mousedownHandler = null;
      }
      if (dialog._clickHandler) {
        dialog.removeEventListener("click", dialog._clickHandler);
        dialog._clickHandler = null;
      }
      if (dialog._focusObserver) {
        dialog._focusObserver.disconnect();
        dialog._focusObserver = null;
      }
      if (dialog._focusTrapHandler) {
        dialog.removeEventListener("keydown", dialog._focusTrapHandler);
        dialog._focusTrapHandler = null;
      }
      clearCloseAnim(dialog);
      if (dialog._openWaitObs) {
        dialog._openWaitObs.disconnect();
        dialog._openWaitObs = null;
      }
      if (dialog._openWaitTimer) {
        clearTimeout(dialog._openWaitTimer);
        dialog._openWaitTimer = null;
      }
      restoreScrollLock(dialog);
      dialog._previousFocus = null;
      dialog._dialogInit = false;
    });
  });
})();
