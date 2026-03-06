// ActionSheet — ciderui
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

  function isVisible(el) {
    if (el.getClientRects().length === 0) return false;
    const style = getComputedStyle(el);
    return style.visibility !== "hidden" && style.visibility !== "collapse";
  }

  function clearCloseAnim(dialog) {
    if (dialog._asCloseTimer) {
      clearTimeout(dialog._asCloseTimer);
      dialog._asCloseTimer = null;
    }
    if (dialog._asCloseAnimHandler) {
      dialog.removeEventListener("animationend", dialog._asCloseAnimHandler);
      dialog._asCloseAnimHandler = null;
    }
  }

  function closeActionSheet(dialog) {
    if (!dialog || dialog.hasAttribute("data-closing")) return;
    clearCloseAnim(dialog);
    let closed = false;
    function finish() {
      if (closed) return;
      closed = true;
      clearCloseAnim(dialog);
      dialog.removeAttribute("data-closing");
      dialog.close();
    }
    dialog._asCloseAnimHandler = (e) => {
      if (e.target !== dialog || e.animationName !== "actionSheetHide") return;
      finish();
    };
    dialog.addEventListener("animationend", dialog._asCloseAnimHandler);
    dialog.setAttribute("data-closing", "");
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 10
      : 300;
    dialog._asCloseTimer = setTimeout(finish, duration);
  }

  function trapFocus(dialog) {
    const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(
      isVisible,
    );
    if (focusable.length) {
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

    if (dialog._asFocusTrapHandler) {
      dialog.removeEventListener("keydown", dialog._asFocusTrapHandler);
    }
    dialog._asFocusTrapHandler = handler;
    dialog.addEventListener("keydown", handler);
  }

  function init() {
    document.querySelectorAll("dialog.action-sheet").forEach((dialog) => {
      if (dialog._asInit) return;
      dialog._asInit = true;

      dialog._asCancelHandler = (e) => {
        e.preventDefault();
        closeActionSheet(dialog);
      };
      dialog.addEventListener("cancel", dialog._asCancelHandler);

      dialog._asMousedownHandler = (e) => {
        dialog._asMousedownTarget = e.target;
      };
      dialog.addEventListener("mousedown", dialog._asMousedownHandler);

      dialog._asClickHandler = (e) => {
        // Backdrop click — mousedown and click both on the dialog element itself
        if (e.target === dialog && dialog._asMousedownTarget === dialog) {
          closeActionSheet(dialog);
        }
        dialog._asMousedownTarget = null;

        // Auto-close on button/link click inside action-sheet-group
        const btn = e.target.closest(
          ".action-sheet-group > button, .action-sheet-group > a",
        );
        if (
          btn &&
          !btn.hasAttribute("data-no-dismiss") &&
          dialog.contains(btn)
        ) {
          closeActionSheet(dialog);
        }
      };
      dialog.addEventListener("click", dialog._asClickHandler);

      function teardown() {
        restoreScrollLock(dialog);
        if (dialog._asFocusTrapHandler) {
          dialog.removeEventListener("keydown", dialog._asFocusTrapHandler);
          dialog._asFocusTrapHandler = null;
        }
      }

      const observer = new MutationObserver(() => {
        if (!dialog.isConnected) {
          teardown();
          dialog._asPreviousFocus = null;
          observer.disconnect();
          return;
        }
        if (dialog.open) {
          const isModal = dialog.matches(":modal");
          if (isModal && !activeDialogs.has(dialog)) {
            if (!dialog._asPreviousFocus) {
              const candidate = document.activeElement;
              dialog._asPreviousFocus = dialog.contains(candidate)
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
            trapFocus(dialog);
          }
        } else {
          clearCloseAnim(dialog);
          dialog.removeAttribute("data-closing");
          teardown();
          const prev = dialog._asPreviousFocus;
          dialog._asPreviousFocus = null;
          if (
            prev &&
            document.contains(prev) &&
            (prev === document.body || isVisible(prev))
          ) {
            prev.focus();
          }
        }
      });
      dialog._asObserver = observer;
      observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    });
  }

  function openActionSheet(dialog) {
    if (!dialog || !dialog.isConnected) return;
    if (!dialog._asInit) init();
    if (!dialog._asInit) return;
    if (dialog.hasAttribute("data-closing")) {
      if (dialog._asOpenWaitObs) return;
      const obs = new MutationObserver(() => {
        if (!dialog.isConnected) {
          obs.disconnect();
          clearTimeout(dialog._asOpenWaitTimer);
          dialog._asOpenWaitObs = null;
          dialog._asOpenWaitTimer = null;
          return;
        }
        if (!dialog.hasAttribute("data-closing") && !dialog.open) {
          obs.disconnect();
          clearTimeout(dialog._asOpenWaitTimer);
          dialog._asOpenWaitObs = null;
          dialog._asOpenWaitTimer = null;
          openActionSheet(dialog);
        }
      });
      dialog._asOpenWaitObs = obs;
      obs.observe(dialog, {
        attributes: true,
        attributeFilter: ["data-closing", "open"],
      });
      dialog._asOpenWaitTimer = setTimeout(() => {
        obs.disconnect();
        dialog._asOpenWaitObs = null;
        dialog._asOpenWaitTimer = null;
        if (dialog.isConnected && !dialog.open) openActionSheet(dialog);
      }, 400);
      return;
    }
    if (dialog.open) return;
    dialog._asPreviousFocus = document.activeElement;
    try {
      dialog.showModal();
    } catch {
      /* dialog may have been removed or is already modal */
    }
  }

  function destroy(dialog) {
    if (!dialog || !dialog._asInit) return;
    if (dialog._asCancelHandler) {
      dialog.removeEventListener("cancel", dialog._asCancelHandler);
      dialog._asCancelHandler = null;
    }
    if (dialog._asMousedownHandler) {
      dialog.removeEventListener("mousedown", dialog._asMousedownHandler);
      dialog._asMousedownHandler = null;
    }
    if (dialog._asClickHandler) {
      dialog.removeEventListener("click", dialog._asClickHandler);
      dialog._asClickHandler = null;
    }
    if (dialog._asObserver) {
      dialog._asObserver.disconnect();
      dialog._asObserver = null;
    }
    if (dialog._asFocusTrapHandler) {
      dialog.removeEventListener("keydown", dialog._asFocusTrapHandler);
      dialog._asFocusTrapHandler = null;
    }
    clearCloseAnim(dialog);
    if (dialog._asOpenWaitObs) {
      dialog._asOpenWaitObs.disconnect();
      dialog._asOpenWaitObs = null;
    }
    if (dialog._asOpenWaitTimer) {
      clearTimeout(dialog._asOpenWaitTimer);
      dialog._asOpenWaitTimer = null;
    }
    restoreScrollLock(dialog);
    dialog._asPreviousFocus = null;
    dialog._asInit = false;
  }

  window.openActionSheet = openActionSheet;
  window.closeActionSheet = closeActionSheet;
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.actionSheet = {
    init,
    destroy,
    open: openActionSheet,
    close: closeActionSheet,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", (evt) => {
    const el = evt.detail?.elt;
    if (!el) return;
    const sheets =
      el.tagName === "DIALOG" && el.classList.contains("action-sheet")
        ? [el]
        : Array.from(el.querySelectorAll?.("dialog.action-sheet") || []);
    sheets.forEach(destroy);
  });
})();
