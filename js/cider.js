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
// ── Action Sheet ──
// ActionSheet — ciderui
(function () {
  const activeDialogs = new Set();
  const scrollLock = window.CiderUI._scrollLock;
  const FOCUSABLE = window.CiderUI._FOCUSABLE;
  const isVisible = window.CiderUI._isVisible;

  function restoreScrollLock(dialog) {
    if (activeDialogs.delete(dialog)) {
      scrollLock.unlock();
    }
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
      : 200;
    dialog._asCloseTimer = setTimeout(finish, duration);
  }

  function wireAria(dialog) {
    const title = dialog.querySelector(".action-sheet-title");
    const message = dialog.querySelector(".action-sheet-message");
    if (title && !dialog.getAttribute("aria-labelledby")) {
      if (!title.id)
        title.id = `as-title-${Math.random().toString(36).slice(2, 8)}`;
      dialog.setAttribute("aria-labelledby", title.id);
      dialog._asSetAriaLabelledBy = true;
    }
    if (message && !dialog.getAttribute("aria-describedby")) {
      if (!message.id)
        message.id = `as-desc-${Math.random().toString(36).slice(2, 8)}`;
      dialog.setAttribute("aria-describedby", message.id);
      dialog._asSetAriaDescribedBy = true;
    }
    // Fallback: ensure dialog always has an accessible name
    if (
      !dialog.getAttribute("aria-labelledby") &&
      !dialog.getAttribute("aria-label")
    ) {
      dialog.setAttribute("aria-label", "Action Sheet");
      dialog._asSetAriaLabel = true;
    }
  }

  function trapFocus(dialog) {
    const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(
      isVisible,
    );
    // Prefer cancel button for initial focus (safe default action per HIG)
    const cancelBtn = dialog.querySelector(".action-sheet-cancel");
    if (cancelBtn && isVisible(cancelBtn)) {
      cancelBtn.focus();
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
            activeDialogs.add(dialog);
            scrollLock.lock();
            wireAria(dialog);
            dialog.setAttribute("aria-modal", "true");
            trapFocus(dialog);
          }
        } else {
          clearCloseAnim(dialog);
          dialog.removeAttribute("data-closing");
          dialog.removeAttribute("aria-modal");
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
      dialog._asPreviousFocus =
        dialog._asPreviousFocus || document.activeElement;
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
      }, 300);
      return;
    }
    if (dialog.open) return;
    dialog._asPreviousFocus = dialog._asPreviousFocus || document.activeElement;
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
    dialog.removeAttribute("data-closing");
    dialog.removeAttribute("aria-modal");
    if (dialog._asSetAriaLabelledBy) {
      dialog.removeAttribute("aria-labelledby");
      dialog._asSetAriaLabelledBy = false;
    }
    if (dialog._asSetAriaDescribedBy) {
      dialog.removeAttribute("aria-describedby");
      dialog._asSetAriaDescribedBy = false;
    }
    if (dialog._asSetAriaLabel) {
      dialog.removeAttribute("aria-label");
      dialog._asSetAriaLabel = false;
    }
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
// ── Dialog ──
// Dialog — ciderui
// Uses native <dialog> element. Adds backdrop-click-to-close with exit animation,
// focus trapping, scroll lock, and focus restoration.
(function () {
  const activeDialogs = new Set();
  const scrollLock = window.CiderUI._scrollLock;
  const FOCUSABLE = window.CiderUI._FOCUSABLE;

  function restoreScrollLock(dialog) {
    if (activeDialogs.delete(dialog)) {
      scrollLock.unlock();
    }
  }

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

  const isVisible = window.CiderUI._isVisible;

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
      dialog._dlgSetAriaLabelledBy = true;
    }
    if (desc && !dialog.getAttribute("aria-describedby")) {
      if (!desc.id)
        desc.id = `dlg-desc-${Math.random().toString(36).slice(2, 8)}`;
      dialog.setAttribute("aria-describedby", desc.id);
      dialog._dlgSetAriaDescribedBy = true;
    }
    // Fallback: ensure dialog always has an accessible name
    if (
      !dialog.getAttribute("aria-labelledby") &&
      !dialog.getAttribute("aria-label")
    ) {
      dialog.setAttribute("aria-label", "Dialog");
      dialog._dlgSetAriaLabel = true;
    }
    dialog.querySelectorAll(".dialog-close").forEach((btn) => {
      if (
        !btn.getAttribute("aria-label") &&
        !btn.getAttribute("aria-labelledby")
      ) {
        btn.setAttribute("aria-label", "Close");
        btn._dlgSetAriaLabel = true;
      }
    });
  }

  function init() {
    document.querySelectorAll("dialog.dialog").forEach((dialog) => {
      if (dialog._dialogInit) return;
      dialog._dialogInit = true;
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
            activeDialogs.add(dialog);
            scrollLock.lock();
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
      dialog._previousFocus = dialog._previousFocus || document.activeElement;
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
    dialog._previousFocus = dialog._previousFocus || document.activeElement;
    try {
      dialog.showModal();
    } catch {
      /* dialog may have been removed or is already modal */
    }
  }

  function destroy(dialog) {
    if (!dialog || !dialog._dialogInit) return;
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
    dialog.removeAttribute("data-closing");
    dialog.removeAttribute("aria-modal");
    if (dialog._dlgSetAriaLabelledBy) {
      dialog.removeAttribute("aria-labelledby");
      dialog._dlgSetAriaLabelledBy = false;
    }
    if (dialog._dlgSetAriaDescribedBy) {
      dialog.removeAttribute("aria-describedby");
      dialog._dlgSetAriaDescribedBy = false;
    }
    if (dialog._dlgSetAriaLabel) {
      dialog.removeAttribute("aria-label");
      dialog._dlgSetAriaLabel = false;
    }
    dialog.querySelectorAll(".dialog-close").forEach((btn) => {
      if (btn._dlgSetAriaLabel) {
        btn.removeAttribute("aria-label");
        btn._dlgSetAriaLabel = false;
      }
    });
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
  }

  window.closeDialog = closeDialog;
  window.openDialog = openDialog;
  window.CiderUI.dialog = {
    init,
    destroy,
    close: closeDialog,
    open: openDialog,
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
    const dialogs =
      el.tagName === "DIALOG" && el.classList.contains("dialog")
        ? [el]
        : Array.from(el.querySelectorAll?.("dialog.dialog") || []);
    dialogs.forEach(destroy);
  });
})();
// ── Hud ──
// HUD — ciderui
// Named "HUD" intentionally — this is the macOS HUD overlay pattern (centered, dark,
// transient, auto-dismiss), not a toast. Toasts are edge-positioned; HUDs are centered.
// macOS equivalent: NSPanel with styleMask:.hudWindow (volume/brightness/screenshot overlays).
(function () {
  const DANGEROUS_ELEMENTS = new Set([
    "script",
    "style",
    "foreignobject",
    "iframe",
    "object",
    "embed",
    "use",
    "image",
    "feimage",
    "set",
    "animate",
    "animatetransform",
    "animatemotion",
    "link",
    "meta",
    "a",
    "mpath",
  ]);

  function createHUDContainer() {
    const container = document.createElement("div");
    container.id = "hud-container";
    container.className = "cider hud-container";
    container.setAttribute("role", "status");
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.appendChild(container);
    return container;
  }

  function showHUD(label, options) {
    const opts = options || {};
    const duration =
      typeof opts.duration === "number" && opts.duration > 0
        ? opts.duration
        : 1500;

    const container =
      document.getElementById("hud-container") || createHUDContainer();

    // macOS shows one HUD at a time — remove existing immediately (no exit animation)
    container.querySelectorAll(".hud").forEach((existing) => existing.remove());

    const hud = document.createElement("div");
    hud.className = "hud";

    // Icon — sanitise via DOMParser to prevent XSS from untrusted input
    const defaultIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    let iconSrc = opts.icon || defaultIcon;
    // DOMParser with image/svg+xml requires xmlns for correct namespace —
    // without it, adoptNode produces elements the browser won't render as SVG.
    if (iconSrc.includes("<svg") && !iconSrc.includes("xmlns")) {
      iconSrc = iconSrc.replace(
        "<svg",
        '<svg xmlns="http://www.w3.org/2000/svg"',
      );
    }
    const parser = new DOMParser();
    const iconDoc = parser.parseFromString(iconSrc, "image/svg+xml");
    const svgEl = iconDoc.querySelector("svg");
    if (svgEl && iconDoc.documentElement.tagName === "svg") {
      svgEl.querySelectorAll("*").forEach((el) => {
        if (DANGEROUS_ELEMENTS.has(el.localName.toLowerCase())) {
          el.remove();
          return;
        }
      });
      [svgEl, ...svgEl.querySelectorAll("*")].forEach((el) => {
        for (const attr of Array.from(el.attributes)) {
          const name = attr.name.toLowerCase();
          if (name.startsWith("on") || name === "style") {
            el.removeAttribute(attr.name);
          } else if (name === "href" || name === "xlink:href") {
            /* All elements that use href (<a>, <use>, <image>) are already
               in DANGEROUS_ELEMENTS — remaining elements don't need href. */
            el.removeAttribute(attr.name);
          }
        }
      });
      svgEl.setAttribute("aria-hidden", "true");
      hud.appendChild(document.adoptNode(svgEl));
    } else {
      const fallbackDoc = parser.parseFromString(defaultIcon, "image/svg+xml");
      fallbackDoc.documentElement.setAttribute("aria-hidden", "true");
      hud.appendChild(document.adoptNode(fallbackDoc.documentElement));
    }

    const labelEl = document.createElement("span");
    labelEl.className = "hud-label";
    labelEl.textContent = label != null ? String(label) : "";
    hud.appendChild(labelEl);

    let dismissTimeout;
    let animTimer;
    let dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      if (dismissTimeout) clearTimeout(dismissTimeout);
      if (animTimer) clearTimeout(animTimer);
      if (!hud.parentElement) return;
      hud.setAttribute("data-closing", "");
      let removed = false;
      function removeHud(e) {
        if (removed) return;
        if (e && (e.target !== hud || e.animationName !== "hudDismiss")) return;
        removed = true;
        clearTimeout(animTimer);
        hud.removeEventListener("animationend", removeHud);
        if (hud.parentElement) hud.remove();
      }
      hud.addEventListener("animationend", removeHud);
      const animDuration = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? 10
        : 150;
      animTimer = setTimeout(removeHud, animDuration);
    }

    hud._ciderDismiss = dismiss;
    container.appendChild(hud);
    dismissTimeout = setTimeout(dismiss, duration);

    return { dismiss, element: hud };
  }

  window.showHUD = showHUD;
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.hud = {
    init() {}, // no-op — HUD is created imperatively via showHUD()
    show: showHUD,
    destroy() {
      const c = document.getElementById("hud-container");
      if (c) {
        c.querySelectorAll(".hud").forEach((h) => {
          if (h._ciderDismiss) h._ciderDismiss();
        });
        c.remove();
      }
    },
  };
})();
// ── Picker ──
// Picker — ciderui
(function () {
  function getItemHeight(picker) {
    return (
      parseFloat(
        getComputedStyle(picker).getPropertyValue("--picker-item-h"),
      ) || 40
    );
  }

  function scrollToIndex(column, index, smooth) {
    const pickerEl = column.closest(".picker");
    if (!pickerEl) return;
    const itemH = getItemHeight(pickerEl);
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    column.scrollTo({
      top: index * itemH,
      behavior: smooth && !prefersReduced ? "smooth" : "instant",
    });
  }

  function selectIndex(column, index, picker, colIndex, silent) {
    const items = column.children;
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    for (let i = 0; i < items.length; i++) {
      items[i].removeAttribute("data-selected");
      items[i].setAttribute("aria-selected", "false");
    }
    if (items[clamped]) {
      items[clamped].setAttribute("data-selected", "");
      items[clamped].setAttribute("aria-selected", "true");
      if (!items[clamped].id) {
        // Include the picker's own id / a randomised suffix so multiple
        // picker instances on one page don't collide on e.g.
        // picker-opt-0-2 — was a real duplicate-ID bug.
        if (!picker._pickerUid) {
          picker._pickerUid =
            picker.id || `p${Math.random().toString(36).slice(2, 8)}`;
        }
        items[clamped].id =
          `picker-opt-${picker._pickerUid}-${colIndex}-${clamped}`;
      }
      column.setAttribute("aria-activedescendant", items[clamped].id);
    }
    if (!silent) {
      picker.dispatchEvent(
        new CustomEvent("change", {
          bubbles: true,
          detail: {
            column: colIndex,
            value: items[clamped] ? items[clamped].textContent : "",
            index: clamped,
          },
        }),
      );
    }
  }

  function setupColumn(column, colIndex, picker) {
    const items = column.children;

    // ARIA: make column keyboard-focusable with listbox semantics
    if (!column.hasAttribute("tabindex")) column.setAttribute("tabindex", "0");
    column.setAttribute("role", "listbox");
    if (!column.getAttribute("aria-label")) {
      column.setAttribute("aria-label", `Column ${colIndex + 1}`);
      column._pickerSetAriaLabel = true;
    }
    for (let i = 0; i < items.length; i++)
      items[i].setAttribute("role", "option");

    // Determine initial value from data-value on the column
    const initialValue = column.getAttribute("data-value");
    let initialIndex = 0;
    if (initialValue) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].textContent.trim() === initialValue.trim()) {
          initialIndex = i;
          break;
        }
      }
    }

    // Scroll to initial position without animation
    scrollToIndex(column, initialIndex, false);
    selectIndex(column, initialIndex, picker, colIndex, true);

    // scrollend event with fallback debounce
    const supportsScrollEnd = "onscrollend" in window;

    function onScrollSettle() {
      const idx = Math.round(column.scrollTop / getItemHeight(picker));
      scrollToIndex(column, idx, false);
      selectIndex(column, idx, picker, colIndex);
    }

    if (supportsScrollEnd) {
      column._pickerScrollEnd = onScrollSettle;
      column.addEventListener("scrollend", onScrollSettle);
    }

    if (!supportsScrollEnd) {
      column._pickerScroll = function () {
        clearTimeout(column._pickerTimer);
        column._pickerTimer = setTimeout(onScrollSettle, 100);
      };
      column.addEventListener("scroll", column._pickerScroll, {
        passive: true,
      });
    }

    // Mouse drag-to-scroll (desktop: emulate touch drag behaviour)
    let dragY = 0;
    let dragScrollTop = 0;
    let dragging = false;
    let activePointerId = null;

    function onMouseDown(e) {
      if (e.button !== 0 || e.pointerType !== "mouse") return;
      dragging = true;
      dragY = e.clientY;
      dragScrollTop = column.scrollTop;
      activePointerId = e.pointerId;
      column.setPointerCapture(e.pointerId);
      column.style.scrollSnapType = "none";
    }

    function onMouseMove(e) {
      if (!dragging) return;
      column.scrollTop = dragScrollTop - (e.clientY - dragY);
    }

    function onMouseUp() {
      if (!dragging) return;
      dragging = false;
      if (activePointerId !== null) {
        try {
          column.releasePointerCapture(activePointerId);
        } catch {}
        activePointerId = null;
      }
      column.style.scrollSnapType = "";
      // Snap to nearest item and update selection
      const idx = Math.round(column.scrollTop / getItemHeight(picker));
      scrollToIndex(column, idx, true);
      selectIndex(column, idx, picker, colIndex);
    }

    column._pickerPointerDown = onMouseDown;
    column._pickerPointerMove = onMouseMove;
    column._pickerPointerUp = onMouseUp;
    column.addEventListener("pointerdown", onMouseDown);
    column.addEventListener("pointermove", onMouseMove);
    column.addEventListener("pointerup", onMouseUp);
    column.addEventListener("pointercancel", onMouseUp);

    // Keyboard navigation
    function onKeyDown(e) {
      const currentIdx = Math.round(column.scrollTop / getItemHeight(picker));
      let newIdx = currentIdx;
      if (e.key === "ArrowDown") {
        newIdx = Math.min(currentIdx + 1, items.length - 1);
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        newIdx = Math.max(currentIdx - 1, 0);
        e.preventDefault();
      } else if (e.key === "Home") {
        newIdx = 0;
        e.preventDefault();
      } else if (e.key === "End") {
        newIdx = items.length - 1;
        e.preventDefault();
      } else {
        return;
      }
      scrollToIndex(column, newIdx, false); // instant: avoids scrollend race with rapid keypress
      selectIndex(column, newIdx, picker, colIndex);
    }
    column._pickerKeyDown = onKeyDown;
    column.addEventListener("keydown", onKeyDown);
  }

  function setupPicker(picker) {
    if (picker._pickerInit) return;
    const columns = picker.querySelectorAll(".picker-column");
    if (!columns.length) return;
    picker._pickerInit = true;
    columns.forEach(function (col, i) {
      setupColumn(col, i, picker);
    });
  }

  function init() {
    document.querySelectorAll("[data-picker]").forEach(setupPicker);
  }

  function destroy(picker) {
    if (!picker || !picker._pickerInit) return;
    picker.querySelectorAll(".picker-column").forEach(function (col) {
      if (col._pickerScrollEnd) {
        col.removeEventListener("scrollend", col._pickerScrollEnd);
        col._pickerScrollEnd = null;
      }
      if (col._pickerScroll) {
        col.removeEventListener("scroll", col._pickerScroll);
        col._pickerScroll = null;
      }
      if (col._pickerPointerDown) {
        col.removeEventListener("pointerdown", col._pickerPointerDown);
        col.removeEventListener("pointermove", col._pickerPointerMove);
        col.removeEventListener("pointerup", col._pickerPointerUp);
        col.removeEventListener("pointercancel", col._pickerPointerUp);
        col._pickerPointerDown = null;
        col._pickerPointerMove = null;
        col._pickerPointerUp = null;
      }
      if (col._pickerKeyDown) {
        col.removeEventListener("keydown", col._pickerKeyDown);
        col._pickerKeyDown = null;
      }
      clearTimeout(col._pickerTimer);
      col._pickerTimer = null;
      col.removeAttribute("role");
      col.removeAttribute("tabindex");
      if (col._pickerSetAriaLabel) {
        col.removeAttribute("aria-label");
        col._pickerSetAriaLabel = false;
      }
      col.removeAttribute("aria-activedescendant");
      Array.from(col.children).forEach((item) => {
        item.removeAttribute("role");
        item.removeAttribute("aria-selected");
        item.removeAttribute("data-selected");
        if (item.id && item.id.startsWith("picker-opt-")) {
          // Matches both legacy (picker-opt-0-2) and suffixed
          // (picker-opt-<uid>-0-2) formats.
          item.removeAttribute("id");
        }
      });
    });
    picker._pickerInit = false;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", (evt) => {
    const el = evt.detail?.elt;
    if (!el) return;
    if (el.hasAttribute?.("data-picker")) {
      destroy(el);
      return;
    }
    (el.querySelectorAll?.("[data-picker]") || []).forEach(destroy);
  });

  window.CiderUI = window.CiderUI || {};
  window.CiderUI.picker = { init, destroy };
})();
// ── Popover ──
// Popover — ciderui
(function () {
  const FOCUSABLE_NOT_DISABLED =
    'button:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"]), a[href]:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"])';
  const FOCUSABLE_ALL =
    FOCUSABLE_NOT_DISABLED +
    ', input:not([tabindex="-1"]):not([disabled]), select:not([tabindex="-1"]):not([disabled]), textarea:not([tabindex="-1"]):not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';

  function setupPopover(popover) {
    if (popover._popoverInit) return;

    const wrapper = popover.closest(".popover");
    if (!wrapper) return;
    const trigger = wrapper.querySelector(
      "button:not([popover] button), a:not([popover] a)",
    );
    if (!trigger) return;

    popover._popoverInit = true;

    trigger.popoverTargetElement = popover;
    trigger.popoverTargetAction = "toggle";

    const isMenu = wrapper.classList.contains("popover-menu");
    trigger.setAttribute("aria-haspopup", isMenu ? "menu" : "dialog");
    trigger.setAttribute("aria-expanded", "false");
    if (!popover.id)
      popover.id = `popover-panel-${Math.random().toString(36).slice(2, 8)}`;
    trigger.setAttribute("aria-controls", popover.id);

    // Store and clean up toggle handler to prevent listener leaks on re-init
    if (popover._toggleHandler) {
      popover.removeEventListener("toggle", popover._toggleHandler);
    }
    function positionPopover() {
      if (!document.contains(popover) || !document.contains(trigger)) {
        popover._cleanupPositioning?.();
        return;
      }
      const rect = trigger.getBoundingClientRect();
      popover.style.margin = "0";

      const pw = popover.offsetWidth;
      const ph = popover.offsetHeight;
      const gap = 8;
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;

      // Horizontal: default left-aligned, flip if overflows or popover-end
      let left;
      if (wrapper.classList.contains("popover-end")) {
        left = rect.right - pw;
      } else {
        left = rect.left;
        if (left + pw > vw) left = rect.right - pw;
      }
      if (left < gap) left = gap;

      // Vertical: default below trigger, flip above if overflows or popover-top
      let top;
      const isFlippedTop =
        wrapper.classList.contains("popover-top") ||
        rect.bottom + gap + ph > vh;
      if (isFlippedTop) {
        top = rect.top - ph - gap;
        if (top < gap) top = gap;
      } else {
        top = rect.bottom + gap;
      }
      popover.classList.toggle(
        "popover-flipped-top",
        isFlippedTop && !wrapper.classList.contains("popover-top"),
      );

      const vOrigin = isFlippedTop ? "bottom" : "top";
      const hOrigin = wrapper.classList.contains("popover-end")
        ? "right"
        : "left";
      popover.style.setProperty("--popover-origin", `${vOrigin} ${hOrigin}`);

      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;

      // Reposition arrow to point at trigger center
      const triggerCenter = rect.left + rect.width / 2;
      const arrowOffset = Math.max(16, Math.min(pw - 16, triggerCenter - left));
      popover.style.setProperty("--arrow-left", `${arrowOffset}px`);
    }

    popover._cleanupPositioning = () => {
      popover._rafPending = false;
      if (popover._rafPositioner) {
        window.removeEventListener("scroll", popover._rafPositioner, true);
        window.removeEventListener("resize", popover._rafPositioner);
        popover._rafPositioner = null;
      }
    };

    function setAriaLabelledBy() {
      if (
        !popover.getAttribute("aria-label") &&
        !popover.getAttribute("aria-labelledby")
      ) {
        // Prefer a heading inside the popover as the accessible name source
        const heading = popover.querySelector("h1, h2, h3, h4, h5, h6");
        if (heading) {
          if (!heading.id)
            heading.id = `popover-title-${Math.random().toString(36).slice(2, 8)}`;
          popover.setAttribute("aria-labelledby", heading.id);
        } else {
          if (!trigger.id)
            trigger.id = `popover-trigger-${Math.random().toString(36).slice(2, 8)}`;
          popover.setAttribute("aria-labelledby", trigger.id);
        }
        popover._ciderAriaLabelledBy = true;
      }
    }

    function clearAriaLabelledBy() {
      if (popover._ciderAriaLabelledBy) {
        popover.removeAttribute("aria-labelledby");
        popover._ciderAriaLabelledBy = false;
      }
    }

    popover._toggleHandler = (e) => {
      if (e.newState === "open") {
        trigger.setAttribute("aria-expanded", "true");
        if (isMenu) {
          popover.setAttribute("role", "menu");
          setAriaLabelledBy();
          popover._ciderMenuItems = [];
          popover._ciderMenuSeparators = [];
          popover.querySelectorAll(FOCUSABLE_NOT_DISABLED).forEach((item) => {
            item.setAttribute("role", "menuitem");
            item.setAttribute("data-ciderui-menuitem", "");
            // Remove from natural tab order (APG menu pattern requires arrow-key nav only)
            if (!item.hasAttribute("data-ciderui-prev-tabindex")) {
              const prev = item.getAttribute("tabindex");
              item.setAttribute(
                "data-ciderui-prev-tabindex",
                prev != null ? prev : "",
              );
            }
            item.setAttribute("tabindex", "-1");
            popover._ciderMenuItems.push(item);
          });
          popover.querySelectorAll("hr").forEach((hr) => {
            hr.setAttribute("role", "separator");
            hr.setAttribute("data-ciderui-separator", "");
            popover._ciderMenuSeparators.push(hr);
          });
        } else {
          popover.setAttribute("role", "dialog");
          setAriaLabelledBy();
        }
        // Cleanup any stale positioning listeners before adding new ones
        popover._cleanupPositioning();
        // Set initial transform-origin (updated by positionPopover on flip)
        const isEnd = wrapper.classList.contains("popover-end");
        const isTop = wrapper.classList.contains("popover-top");
        popover.style.setProperty(
          "--popover-origin",
          `${isTop ? "bottom" : "top"} ${isEnd ? "right" : "left"}`,
        );
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (popover.matches(":popover-open")) positionPopover();
          }),
        );
        popover._rafPending = false;
        popover._rafPositioner = () => {
          if (!popover._rafPending) {
            popover._rafPending = true;
            requestAnimationFrame(() => {
              popover._rafPending = false;
              if (popover.matches(":popover-open")) positionPopover();
            });
          }
        };
        window.addEventListener("scroll", popover._rafPositioner, true);
        window.addEventListener("resize", popover._rafPositioner);
        // Observe DOM removal only while open
        if (wrapper.parentNode)
          popover._disconnectObserver.observe(wrapper.parentNode, {
            childList: true,
            subtree: true,
          });

        const first = isMenu
          ? popover.querySelector(
              '[data-ciderui-menuitem]:not([disabled]):not([aria-disabled="true"])',
            )
          : popover.querySelector(FOCUSABLE_ALL);
        if (first) first.focus();
      } else {
        trigger.setAttribute("aria-expanded", "false");
        popover._cleanupPositioning();
        popover.style.top = "";
        popover.style.left = "";
        popover.style.margin = "";
        popover.style.removeProperty("--popover-origin");
        popover.style.removeProperty("--arrow-left");
        popover.classList.remove("popover-flipped-top");
        clearTimeout(popover._typeAheadTimer);
        popover._typeAheadTimer = null;
        popover._typeAheadBuffer = "";
        if (popover._disconnectObserver)
          popover._disconnectObserver.disconnect();
        popover.removeAttribute("role");
        clearAriaLabelledBy();
        if (isMenu) {
          (popover._ciderMenuItems || []).forEach((item) => {
            item.removeAttribute("role");
            item.removeAttribute("data-ciderui-menuitem");
            const prev = item.getAttribute("data-ciderui-prev-tabindex");
            if (prev != null) {
              if (prev === "") item.removeAttribute("tabindex");
              else item.setAttribute("tabindex", prev);
              item.removeAttribute("data-ciderui-prev-tabindex");
            }
          });
          (popover._ciderMenuSeparators || []).forEach((hr) => {
            hr.removeAttribute("role");
            hr.removeAttribute("data-ciderui-separator");
          });
          popover._ciderMenuItems = null;
          popover._ciderMenuSeparators = null;
        }
        if (
          !popover._tabDismiss &&
          (popover._escapeDismiss || popover.contains(document.activeElement))
        ) {
          if (
            !trigger.disabled &&
            trigger.getAttribute("aria-disabled") !== "true"
          ) {
            trigger.focus();
          }
        }
        popover._escapeDismiss = false;
        popover._tabDismiss = false;
      }
    };
    // Detect DOM removal while open to clean up scroll/resize listeners and event handlers.
    // Created before registering the toggle handler because the handler references it on open.
    if (popover._disconnectObserver) popover._disconnectObserver.disconnect();
    popover._disconnectObserver = new MutationObserver(() => {
      if (!popover.isConnected) {
        popover._cleanupPositioning();
        trigger.setAttribute("aria-expanded", "false");
        popover._disconnectObserver.disconnect();
        // Clean up event listeners on DOM removal
        if (popover._toggleHandler)
          popover.removeEventListener("toggle", popover._toggleHandler);
        if (popover._escHandler)
          popover.removeEventListener("keydown", popover._escHandler);
        if (popover._focusTrapHandler)
          popover.removeEventListener("keydown", popover._focusTrapHandler);
        if (popover._menuClickHandler)
          popover.removeEventListener("click", popover._menuClickHandler);
        if (popover._menuKeyHandler)
          popover.removeEventListener("keydown", popover._menuKeyHandler);
        clearTimeout(popover._typeAheadTimer);
        popover._typeAheadTimer = null;
        popover._typeAheadBuffer = "";
        popover._escapeDismiss = false;
        popover._tabDismiss = false;
        popover._popoverInit = false;
      }
    });

    popover.addEventListener("toggle", popover._toggleHandler);

    // Escape key to close popover
    if (popover._escHandler) {
      popover.removeEventListener("keydown", popover._escHandler);
    }
    popover._escHandler = (e) => {
      if (e.key === "Escape" && popover.matches(":popover-open")) {
        popover._escapeDismiss = true;
        e.preventDefault();
        e.stopPropagation();
        popover.hidePopover();
      }
    };
    popover.addEventListener("keydown", popover._escHandler);

    // Tab dismisses content (non-menu) popovers — consistent with non-modal nature
    if (!isMenu) {
      if (popover._focusTrapHandler) {
        popover.removeEventListener("keydown", popover._focusTrapHandler);
      }
      popover._focusTrapHandler = (e) => {
        if (e.key !== "Tab" || !popover.matches(":popover-open")) return;
        popover._tabDismiss = true;
        popover.hidePopover();
      };
      popover.addEventListener("keydown", popover._focusTrapHandler);
    }

    if (isMenu) {
      if (popover._menuClickHandler) {
        popover.removeEventListener("click", popover._menuClickHandler);
      }
      popover._menuClickHandler = (e) => {
        const item = e.target.closest("button, a");
        if (!item || !popover.contains(item)) return;
        if (item.disabled || item.getAttribute("aria-disabled") === "true")
          return;
        if (item.hasAttribute("data-no-dismiss")) return;
        if (popover.matches(":popover-open")) popover.hidePopover();
      };
      popover.addEventListener("click", popover._menuClickHandler);

      if (popover._menuKeyHandler) {
        popover.removeEventListener("keydown", popover._menuKeyHandler);
      }
      popover._menuKeyHandler = (e) => {
        const items = Array.from(
          popover.querySelectorAll(
            '[data-ciderui-menuitem]:not([disabled]):not([aria-disabled="true"])',
          ),
        );
        if (!items.length) return;
        let idx = items.indexOf(document.activeElement);

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          if (idx < 0) idx = -1;
          if (e.key === "ArrowDown") {
            items[idx < items.length - 1 ? idx + 1 : 0].focus();
          } else {
            items[idx > 0 ? idx - 1 : items.length - 1].focus();
          }
        } else if (e.key === "Home") {
          e.preventDefault();
          items[0].focus();
        } else if (e.key === "End") {
          e.preventDefault();
          items.at(-1).focus();
        } else if (e.key === "Tab") {
          // Let Tab propagate naturally so focus advances to next/previous element
          popover._tabDismiss = true;
          if (popover.matches(":popover-open")) popover.hidePopover();
        } else if (
          e.key.length === 1 &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey
        ) {
          // Type-ahead: accumulate characters within 500ms window
          if (!popover._typeAheadTimer) popover._typeAheadBuffer = "";
          clearTimeout(popover._typeAheadTimer);
          popover._typeAheadBuffer += e.key.toLowerCase();
          popover._typeAheadTimer = setTimeout(() => {
            popover._typeAheadBuffer = "";
            popover._typeAheadTimer = null;
          }, 500);
          const buf = popover._typeAheadBuffer;
          const match =
            items.find(
              (item, j) =>
                j > idx &&
                item.textContent.trim().toLowerCase().startsWith(buf),
            ) ||
            items.find((item) =>
              item.textContent.trim().toLowerCase().startsWith(buf),
            );
          if (match) match.focus();
        }
      };
      popover.addEventListener("keydown", popover._menuKeyHandler);
    }
  }

  function init() {
    document.querySelectorAll(".popover [popover]").forEach(setupPopover);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);

  function destroyPopover(popover) {
    if (!popover._popoverInit) return;
    // Hide if currently open so the browser dismisses it cleanly
    try {
      if (popover.matches(":popover-open")) popover.hidePopover();
    } catch {}
    // Reset trigger attributes to prevent stale native popover wiring
    const wrapper = popover.closest?.(".popover");
    const trigger = wrapper?.querySelector(
      "button:not([popover] button), a:not([popover] a)",
    );
    if (trigger) {
      trigger.popoverTargetElement = null;
      trigger.popoverTargetAction = "";
      trigger.removeAttribute("aria-expanded");
      trigger.removeAttribute("aria-haspopup");
      trigger.removeAttribute("aria-controls");
    }
    if (popover._disconnectObserver) {
      popover._disconnectObserver.disconnect();
      popover._disconnectObserver = null;
    }
    popover._cleanupPositioning?.();
    popover.style.top = "";
    popover.style.left = "";
    popover.style.margin = "";
    popover.style.removeProperty("--popover-origin");
    popover.style.removeProperty("--arrow-left");
    popover.classList.remove("popover-flipped-top");
    clearTimeout(popover._typeAheadTimer);
    popover._typeAheadTimer = null;
    popover._typeAheadBuffer = "";
    if (popover._toggleHandler) {
      popover.removeEventListener("toggle", popover._toggleHandler);
      popover._toggleHandler = null;
    }
    if (popover._escHandler) {
      popover.removeEventListener("keydown", popover._escHandler);
      popover._escHandler = null;
    }
    if (popover._focusTrapHandler) {
      popover.removeEventListener("keydown", popover._focusTrapHandler);
      popover._focusTrapHandler = null;
    }
    if (popover._menuClickHandler) {
      popover.removeEventListener("click", popover._menuClickHandler);
      popover._menuClickHandler = null;
    }
    if (popover._menuKeyHandler) {
      popover.removeEventListener("keydown", popover._menuKeyHandler);
      popover._menuKeyHandler = null;
    }
    popover._popoverInit = false;
  }

  document.addEventListener("htmx:beforeCleanupElement", (evt) => {
    const el = evt.detail?.elt;
    if (!el) return;
    const popovers = el.hasAttribute?.("popover")
      ? [el]
      : Array.from(el.querySelectorAll?.("[popover]") || []);
    popovers.forEach(destroyPopover);
  });

  window.CiderUI = window.CiderUI || {};
  window.CiderUI.popover = { init, destroy: destroyPopover };
})();
// ── Sidebar ──
// Sidebar — ciderui
// Mobile off-canvas toggle. Wire up [data-sidebar-toggle]
// buttons to slide the panel in/out, with overlay dismiss and Escape key support.
(function () {
  const scrollLock = window.CiderUI._scrollLock;
  const FOCUSABLE = window.CiderUI._FOCUSABLE;
  const isVisible = window.CiderUI._isVisible;

  function setupToggle(btn) {
    if (btn._sidebarInit) return;

    const targetId = btn.getAttribute("aria-controls");
    const panel = targetId ? document.getElementById(targetId) : null;
    if (!panel) return;

    btn._sidebarInit = true;

    const overlay = panel.parentElement?.querySelector(
      "[data-sidebar-overlay]",
    );

    function isOpen() {
      return panel.hasAttribute("data-open");
    }

    function open() {
      if (isOpen()) return;
      btn._sidebarPreviousFocus = document.activeElement;
      panel.setAttribute("data-open", "");
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      // Accessible name for the dialog (required by ARIA spec)
      const heading = panel.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading) {
        if (!heading.id) {
          heading.id = `sidebar-title-${Math.random().toString(36).slice(2, 8)}`;
          btn._sidebarHeadingIdInjected = heading;
        }
        if (!panel.getAttribute("aria-labelledby")) {
          panel.setAttribute("aria-labelledby", heading.id);
          btn._sidebarSetAriaLabelledBy = true;
        }
      } else if (!panel.getAttribute("aria-label")) {
        panel.setAttribute("aria-label", "Navigation");
        btn._sidebarSetAriaLabel = true;
      }
      if (overlay) overlay.setAttribute("data-open", "");
      btn.setAttribute("aria-expanded", "true");
      scrollLock.lock();
      document.addEventListener("keydown", btn._sidebarEscHandler);
      // Move focus into the panel for keyboard accessibility
      const focusableInPanel = Array.from(
        panel.querySelectorAll(FOCUSABLE),
      ).filter(isVisible);
      if (focusableInPanel.length) focusableInPanel[0].focus();
      // Focus trap — mirror dialog.js pattern
      btn._sidebarFocusTrap = function (e) {
        if (e.key !== "Tab") return;
        const focusable = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
          isVisible,
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!focusable.includes(document.activeElement)) {
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
      };
      panel.addEventListener("keydown", btn._sidebarFocusTrap);
    }

    function close(returnFocus) {
      if (!isOpen()) return;
      panel.removeAttribute("data-open");
      panel.removeAttribute("role");
      panel.removeAttribute("aria-modal");
      if (btn._sidebarSetAriaLabelledBy) {
        panel.removeAttribute("aria-labelledby");
        btn._sidebarSetAriaLabelledBy = false;
      }
      if (btn._sidebarHeadingIdInjected) {
        btn._sidebarHeadingIdInjected.removeAttribute("id");
        btn._sidebarHeadingIdInjected = null;
      }
      if (btn._sidebarSetAriaLabel) {
        panel.removeAttribute("aria-label");
        btn._sidebarSetAriaLabel = false;
      }
      if (overlay) overlay.removeAttribute("data-open");
      btn.setAttribute("aria-expanded", "false");
      scrollLock.unlock();
      document.removeEventListener("keydown", btn._sidebarEscHandler);
      if (btn._sidebarFocusTrap) {
        panel.removeEventListener("keydown", btn._sidebarFocusTrap);
        btn._sidebarFocusTrap = null;
      }
      if (returnFocus !== false) {
        const prev = btn._sidebarPreviousFocus;
        btn._sidebarPreviousFocus = null;
        if (
          prev &&
          document.contains(prev) &&
          prev !== document.body &&
          isVisible(prev)
        ) {
          prev.focus();
        } else {
          btn.focus();
        }
      } else {
        btn._sidebarPreviousFocus = null;
      }
    }

    btn._sidebarPanel = panel;
    btn._sidebarOverlay = overlay;

    btn._sidebarClickHandler = function () {
      isOpen() ? close() : open();
    };
    btn.addEventListener("click", btn._sidebarClickHandler);

    if (overlay) {
      btn._sidebarOverlayClickHandler = () => close();
      overlay.addEventListener("click", btn._sidebarOverlayClickHandler);
    }

    // Close when a link inside the sidebar is clicked
    btn._sidebarPanelClickHandler = function (e) {
      if (e.target.closest && e.target.closest("a[href]") && isOpen()) {
        close(false);
      }
    };
    panel.addEventListener("click", btn._sidebarPanelClickHandler);

    // Escape key closes the sidebar (listener added/removed on open/close)
    btn._sidebarEscHandler = function (e) {
      if (e.key === "Escape" && isOpen()) {
        close();
      }
    };
  }

  function init() {
    document.querySelectorAll("[data-sidebar-toggle]").forEach(setupToggle);
  }

  function destroy(btn) {
    if (!btn || !btn._sidebarInit) return;
    // Restore scroll lock if sidebar was open
    if (btn._sidebarPanel && btn._sidebarPanel.hasAttribute("data-open")) {
      btn._sidebarPanel.removeAttribute("data-open");
      btn._sidebarPanel.removeAttribute("role");
      btn._sidebarPanel.removeAttribute("aria-modal");
      if (btn._sidebarSetAriaLabelledBy) {
        btn._sidebarPanel.removeAttribute("aria-labelledby");
        btn._sidebarSetAriaLabelledBy = false;
      }
      if (btn._sidebarHeadingIdInjected) {
        btn._sidebarHeadingIdInjected.removeAttribute("id");
        btn._sidebarHeadingIdInjected = null;
      }
      if (btn._sidebarSetAriaLabel) {
        btn._sidebarPanel.removeAttribute("aria-label");
        btn._sidebarSetAriaLabel = false;
      }
      if (btn._sidebarOverlay) btn._sidebarOverlay.removeAttribute("data-open");
      btn.setAttribute("aria-expanded", "false");
      scrollLock.unlock();
    }
    if (btn._sidebarEscHandler) {
      document.removeEventListener("keydown", btn._sidebarEscHandler);
      btn._sidebarEscHandler = null;
    }
    if (btn._sidebarClickHandler) {
      btn.removeEventListener("click", btn._sidebarClickHandler);
      btn._sidebarClickHandler = null;
    }
    if (btn._sidebarOverlayClickHandler && btn._sidebarOverlay) {
      btn._sidebarOverlay.removeEventListener(
        "click",
        btn._sidebarOverlayClickHandler,
      );
      btn._sidebarOverlayClickHandler = null;
    }
    if (btn._sidebarPanelClickHandler && btn._sidebarPanel) {
      btn._sidebarPanel.removeEventListener(
        "click",
        btn._sidebarPanelClickHandler,
      );
      btn._sidebarPanelClickHandler = null;
    }
    if (btn._sidebarFocusTrap && btn._sidebarPanel) {
      btn._sidebarPanel.removeEventListener("keydown", btn._sidebarFocusTrap);
      btn._sidebarFocusTrap = null;
    }
    btn._sidebarPreviousFocus = null;
    btn._sidebarPanel = null;
    btn._sidebarOverlay = null;
    btn._sidebarInit = false;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", (evt) => {
    const el = evt.detail?.elt;
    if (!el) return;
    if (el.hasAttribute?.("data-sidebar-toggle")) {
      destroy(el);
      return;
    }
    (el.querySelectorAll?.("[data-sidebar-toggle]") || []).forEach(destroy);
  });

  window.CiderUI.sidebar = { init, destroy };
})();
// ── Slider ──
// Slider — ciderui
(function () {
  function update(el) {
    let min = el.min !== "" ? Number(el.min) : 0;
    let max = el.max !== "" ? Number(el.max) : 100;
    let val = Number(el.value);
    if (Number.isNaN(min)) min = 0;
    if (Number.isNaN(max)) max = 100;
    if (Number.isNaN(val)) val = min;
    const range = max - min;
    const pct = range > 0 ? ((val - min) / range) * 100 : 0;
    el.style.setProperty("--slider-value", `${pct}%`);
  }

  function destroy(el) {
    if (!el._sliderInit) return;
    if (el._sliderObserver) {
      el._sliderObserver.disconnect();
      el._sliderObserver = null;
    }
    if (el._sliderInputHandler) {
      el.removeEventListener("input", el._sliderInputHandler);
      el._sliderInputHandler = null;
    }
    delete el.value;
    delete el.min;
    delete el.max;
    el.style.removeProperty("--slider-value");
    el._sliderInit = false;
  }

  function init() {
    document.querySelectorAll(".slider").forEach((el) => {
      if (el._sliderInit) return;
      el._sliderInit = true;
      update(el);
      el._sliderInputHandler = () => {
        update(el);
      };
      el.addEventListener("input", el._sliderInputHandler);
      // Intercept .value/.min/.max property setters so programmatic changes update the fill
      for (const prop of ["value", "min", "max"]) {
        const desc = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          prop,
        );
        if (desc && desc.get && desc.set) {
          Object.defineProperty(el, prop, {
            get() {
              return desc.get.call(this);
            },
            set(v) {
              desc.set.call(this, v);
              this._sliderFromSetter = true;
              try {
                update(this);
              } finally {
                this._sliderFromSetter = false;
              }
            },
            configurable: true,
          });
        }
      }
      // Sync when value/min/max attributes change via setAttribute()
      const mo = new MutationObserver(() => {
        if (!el.isConnected) {
          destroy(el);
          return;
        }
        if (!el._sliderFromSetter) update(el);
      });
      el._sliderObserver = mo;
      mo.observe(el, {
        attributes: true,
        attributeFilter: ["value", "min", "max"],
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", (evt) => {
    const el = evt.detail?.elt;
    if (!el) return;
    if (el.classList?.contains("slider")) {
      destroy(el);
      return;
    }
    (el.querySelectorAll?.(".slider") || []).forEach(destroy);
  });

  window.CiderUI = window.CiderUI || {};
  window.CiderUI.slider = { init, update, destroy };
})();
// ── Stepper ──
// Stepper — ciderui
(function () {
  function setup(stepper) {
    if (stepper._stepperInit) return;
    stepper._stepperInit = true;

    let min = Number(stepper.getAttribute("data-min") || 0);
    if (Number.isNaN(min)) min = 0;
    let max = Number(stepper.getAttribute("data-max") || 100);
    if (Number.isNaN(max)) max = 100;
    let step = Number(stepper.getAttribute("data-step") || 1);
    if (Number.isNaN(step) || step <= 0) step = 1;
    let value = Number(stepper.getAttribute("data-value") || min);
    if (Number.isNaN(value)) value = min;

    const decBtn = stepper.querySelector("[data-stepper-decrement]");
    const incBtn = stepper.querySelector("[data-stepper-increment]");
    const display =
      stepper.querySelector("[data-stepper-value]") ||
      stepper.querySelector("output");
    const forId = stepper.getAttribute("data-for");
    const linked = forId ? document.getElementById(forId) : null;

    // Sync initial value from linked input if present
    if (linked && linked.value !== "") {
      const n = Number(linked.value);
      if (!Number.isNaN(n)) value = n;
    }

    // ARIA attributes for assistive technology
    if (!stepper.getAttribute("role")) {
      stepper.setAttribute("role", "group");
      stepper._stepperSetRole = true;
    }
    // aria-value* belong on spinbutton (display), not the group container
    if (display) {
      display.setAttribute("role", "spinbutton");
      display.setAttribute("tabindex", "0");
      display.setAttribute("aria-valuemin", min);
      display.setAttribute("aria-valuemax", max);
      if (
        !display.getAttribute("aria-label") &&
        !display.getAttribute("aria-labelledby")
      ) {
        const lbl =
          stepper.getAttribute("aria-label") ||
          stepper.getAttribute("data-label");
        if (lbl) {
          display.setAttribute("aria-label", lbl);
          stepper._stepperSetDisplayAriaLabel = true;
        }
      }
    }
    if (decBtn && !decBtn.getAttribute("aria-label")) {
      decBtn.setAttribute(
        "aria-label",
        stepper.dataset.labelDecrease || "Decrease value",
      );
      stepper._stepperSetDecAriaLabel = true;
    }
    if (incBtn && !incBtn.getAttribute("aria-label")) {
      incBtn.setAttribute(
        "aria-label",
        stepper.dataset.labelIncrease || "Increase value",
      );
      stepper._stepperSetIncAriaLabel = true;
    }

    // Decimal places from step to avoid floating-point accumulation (e.g. 0.1+0.1+0.1)
    const stepDecimals = (function () {
      const s = String(step);
      const dot = s.indexOf(".");
      return dot === -1 ? 0 : s.length - dot - 1;
    })();

    function clamp(v) {
      const clamped = Math.min(max, Math.max(min, v));
      return stepDecimals > 0
        ? parseFloat(clamped.toFixed(stepDecimals))
        : clamped;
    }

    function updateUI() {
      value = clamp(value);
      if (display) {
        display.setAttribute("aria-valuenow", value);
        display.textContent = value;
      }
      if (linked) linked.value = value;
      stepper.setAttribute("data-value", value);

      if (decBtn) decBtn.disabled = value <= min;
      if (incBtn) incBtn.disabled = value >= max;
    }

    function fireChange() {
      stepper.dispatchEvent(
        new CustomEvent("change", { detail: { value }, bubbles: true }),
      );
    }

    stepper._stepperDecHandler = function () {
      value = clamp(value - step);
      updateUI();
      fireChange();
    };

    stepper._stepperIncHandler = function () {
      value = clamp(value + step);
      updateUI();
      fireChange();
    };

    stepper._stepperDecBtn = decBtn;
    stepper._stepperIncBtn = incBtn;
    stepper._stepperDisplay = display;

    if (decBtn) decBtn.addEventListener("click", stepper._stepperDecHandler);
    if (incBtn) incBtn.addEventListener("click", stepper._stepperIncHandler);

    // Spinbutton keyboard interaction (WAI-ARIA APG spinbutton pattern)
    if (display) {
      stepper._stepperKeyHandler = function (e) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          stepper._stepperIncHandler();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          stepper._stepperDecHandler();
        } else if (e.key === "Home") {
          e.preventDefault();
          value = min;
          updateUI();
          fireChange();
        } else if (e.key === "End") {
          e.preventDefault();
          value = max;
          updateUI();
          fireChange();
        }
      };
      display.addEventListener("keydown", stepper._stepperKeyHandler);
    }

    // Listen for external changes on the linked input
    if (linked) {
      stepper._stepperLinkedHandler = function () {
        const n = Number(linked.value);
        value = clamp(Number.isNaN(n) ? min : n);
        updateUI();
      };
      linked.addEventListener("input", stepper._stepperLinkedHandler);
      stepper._stepperLinkedEl = linked;
    }

    updateUI();
  }

  function destroy(stepper) {
    if (!stepper._stepperInit) return;
    const display = stepper._stepperDisplay;
    if (display) {
      display.removeAttribute("role");
      display.removeAttribute("tabindex");
      display.removeAttribute("aria-valuemin");
      display.removeAttribute("aria-valuemax");
      display.removeAttribute("aria-valuenow");
      if (stepper._stepperSetDisplayAriaLabel) {
        display.removeAttribute("aria-label");
        stepper._stepperSetDisplayAriaLabel = false;
      }
      if (stepper._stepperKeyHandler)
        display.removeEventListener("keydown", stepper._stepperKeyHandler);
    }
    const decBtn = stepper._stepperDecBtn;
    const incBtn = stepper._stepperIncBtn;
    if (decBtn) {
      if (stepper._stepperDecHandler)
        decBtn.removeEventListener("click", stepper._stepperDecHandler);
      if (stepper._stepperSetDecAriaLabel) {
        decBtn.removeAttribute("aria-label");
        stepper._stepperSetDecAriaLabel = false;
      }
      decBtn.disabled = false;
    }
    if (incBtn) {
      if (stepper._stepperIncHandler)
        incBtn.removeEventListener("click", stepper._stepperIncHandler);
      if (stepper._stepperSetIncAriaLabel) {
        incBtn.removeAttribute("aria-label");
        stepper._stepperSetIncAriaLabel = false;
      }
      incBtn.disabled = false;
    }
    if (stepper._stepperSetRole) {
      stepper.removeAttribute("role");
      stepper._stepperSetRole = false;
    }
    if (stepper._stepperLinkedEl && stepper._stepperLinkedHandler) {
      stepper._stepperLinkedEl.removeEventListener(
        "input",
        stepper._stepperLinkedHandler,
      );
    }
    stepper._stepperDecHandler = null;
    stepper._stepperIncHandler = null;
    stepper._stepperLinkedHandler = null;
    stepper._stepperLinkedEl = null;
    stepper._stepperKeyHandler = null;
    stepper._stepperDecBtn = null;
    stepper._stepperIncBtn = null;
    stepper._stepperDisplay = null;
    stepper._stepperInit = false;
  }

  function init() {
    document.querySelectorAll("[data-stepper]").forEach(setup);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", (evt) => {
    const el = evt.detail?.elt;
    if (!el) return;
    if (el.hasAttribute?.("data-stepper")) {
      destroy(el);
      return;
    }
    (el.querySelectorAll?.("[data-stepper]") || []).forEach(destroy);
  });

  window.CiderUI = window.CiderUI || {};
  window.CiderUI.stepper = { init, destroy };
})();
// ── Tabs ──
// Tabs — ciderui
(function () {
  const TAB_SEL = ":scope > [data-tab], :scope > * > [data-tab]";
  const PANEL_SEL = ":scope > [data-tab-panel], :scope > * > [data-tab-panel]";

  function setupTabGroup(tabGroup) {
    if (tabGroup._tabsInit) return;
    tabGroup._tabsInit = true;
    function getButtons() {
      return tabGroup.querySelectorAll(TAB_SEL);
    }
    function getPanels() {
      return tabGroup.querySelectorAll(PANEL_SEL);
    }
    function isDisabled(btn) {
      return btn.disabled || btn.getAttribute("aria-disabled") === "true";
    }

    // Set ARIA attributes
    const list =
      tabGroup.querySelector("[data-tab-list]") ||
      getButtons()[0]?.parentElement;
    if (list) {
      list.setAttribute("role", "tablist");
      const orientation = list.getAttribute("data-orientation") || "horizontal";
      list.setAttribute("aria-orientation", orientation);
    }
    tabGroup._tabsList = list;

    // Create sliding indicator for segmented controls
    const indicator = list?.querySelector("[data-tab-indicator]");
    function positionIndicator(btn) {
      if (!indicator || !btn) return;
      const listRect = list.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      indicator.style.width = `${btnRect.width}px`;
      indicator.style.transform = `translateX(${btnRect.left - listRect.left}px)`;
      indicator.style.opacity = "1";
    }

    // Reposition indicator on resize
    if (indicator && list) {
      if (tabGroup._tabsResizeObserver)
        tabGroup._tabsResizeObserver.disconnect();
      const ro = new ResizeObserver(() => {
        if (!list.isConnected) {
          ro.disconnect();
          tabGroup._tabsResizeObserver = null;
          return;
        }
        const activeBtn = tabGroup.querySelector("[data-tab][data-active]");
        if (activeBtn) positionIndicator(activeBtn);
      });
      ro.observe(list);
      tabGroup._tabsResizeObserver = ro;
    }

    getButtons().forEach((btn) => {
      if (!btn.id) {
        btn.id = `tab-${Math.random().toString(36).slice(2, 8)}`;
        btn._tabInjectedId = true;
      }
      btn.setAttribute("role", "tab");
      const isActive = btn.hasAttribute("data-active");
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
      btn.setAttribute("tabindex", isActive ? "0" : "-1");
      if (isActive && indicator) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => positionIndicator(btn)),
        );
      }
    });

    // Ensure at least one tab is keyboard-reachable when none is active
    const initButtons = getButtons();
    if (
      !Array.from(initButtons).some((b) => b.getAttribute("tabindex") === "0")
    ) {
      const first = Array.from(initButtons).find((b) => !isDisabled(b));
      if (first) first.setAttribute("tabindex", "0");
    }

    getPanels().forEach((panel) => {
      if (!panel.id) {
        panel.id = `tabpanel-${Math.random().toString(36).slice(2, 8)}`;
        panel._tabInjectedId = true;
      }
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute(
        "tabindex",
        panel.hasAttribute("data-active") ? "0" : "-1",
      );
      // Mirror the click-handler behaviour on initial setup so inactive
      // panels hide from first paint, not just after a user click.
      if (panel.hasAttribute("data-active")) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      const panelTarget = panel.getAttribute("data-tab-panel");
      const matchingBtn = Array.from(getButtons()).find(
        (b) => b.getAttribute("data-tab") === panelTarget,
      );
      if (matchingBtn) {
        panel.setAttribute("aria-labelledby", matchingBtn.id);
        panel._tabInjectedAriaLabelledBy = true;
        matchingBtn.setAttribute("aria-controls", panel.id);
        matchingBtn._tabInjectedAriaControls = true;
      }
    });

    function activate(btn) {
      if (!btn.isConnected || isDisabled(btn)) return;
      const target = btn.getAttribute("data-tab");
      const currentButtons = getButtons();
      const currentPanels = getPanels();

      currentButtons.forEach((b) => {
        b.removeAttribute("data-active");
        b.setAttribute("aria-selected", "false");
        b.setAttribute("tabindex", "-1");
      });

      btn.setAttribute("data-active", "");
      btn.setAttribute("aria-selected", "true");
      btn.setAttribute("tabindex", "0");

      positionIndicator(btn);

      currentPanels.forEach((p) => {
        if (p.getAttribute("data-tab-panel") === target) {
          p.setAttribute("data-active", "");
          p.setAttribute("tabindex", "0");
        } else {
          p.removeAttribute("data-active");
          p.setAttribute("tabindex", "-1");
        }
      });
    }

    function findTab(from, step) {
      const currentButtons = getButtons();
      if (!currentButtons.length) return null;
      let idx = (from + step + currentButtons.length) % currentButtons.length;
      let guard = currentButtons.length;
      while (idx !== from && isDisabled(currentButtons[idx]) && --guard > 0) {
        idx = (idx + step + currentButtons.length) % currentButtons.length;
      }
      return idx !== from && guard > 0 && !isDisabled(currentButtons[idx])
        ? currentButtons[idx]
        : null;
    }

    getButtons().forEach((btn) => {
      btn._tabClickHandler = () => {
        activate(btn);
      };
      btn.addEventListener("click", btn._tabClickHandler);

      btn._tabKeyHandler = (e) => {
        let targetBtn = null;
        const currentButtons = getButtons();
        const currentIdx = Array.from(currentButtons).indexOf(btn);
        if (currentIdx < 0) return;

        if (e.key === "Enter" || e.key === " ") {
          if (!isDisabled(btn)) {
            e.preventDefault();
            activate(btn);
          }
          return;
        } else if (
          e.key ===
          (list?.getAttribute("aria-orientation") === "vertical"
            ? "ArrowDown"
            : "ArrowRight")
        ) {
          e.preventDefault();
          targetBtn = findTab(currentIdx, 1);
        } else if (
          e.key ===
          (list?.getAttribute("aria-orientation") === "vertical"
            ? "ArrowUp"
            : "ArrowLeft")
        ) {
          e.preventDefault();
          targetBtn = findTab(currentIdx, -1);
        } else if (e.key === "Home") {
          e.preventDefault();
          targetBtn = Array.from(currentButtons).find((b) => !isDisabled(b));
        } else if (e.key === "End") {
          e.preventDefault();
          targetBtn =
            Array.from(currentButtons)
              .filter((b) => !isDisabled(b))
              .at(-1) ?? null;
        }

        if (targetBtn) {
          targetBtn.focus();
          activate(targetBtn);
        }
      };
      btn.addEventListener("keydown", btn._tabKeyHandler);
    });
  }

  function init() {
    document.querySelectorAll("[data-tabs]").forEach(setupTabGroup);
  }

  function destroy(tabGroup) {
    if (!tabGroup._tabsInit) return;
    if (tabGroup._tabsResizeObserver) {
      tabGroup._tabsResizeObserver.disconnect();
      tabGroup._tabsResizeObserver = null;
    }
    const list = tabGroup._tabsList;
    if (list) {
      list.removeAttribute("role");
      list.removeAttribute("aria-orientation");
    }
    tabGroup._tabsList = null;
    tabGroup.querySelectorAll(TAB_SEL).forEach((btn) => {
      if (btn._tabClickHandler) {
        btn.removeEventListener("click", btn._tabClickHandler);
        btn._tabClickHandler = null;
      }
      if (btn._tabKeyHandler) {
        btn.removeEventListener("keydown", btn._tabKeyHandler);
        btn._tabKeyHandler = null;
      }
      btn.removeAttribute("role");
      btn.removeAttribute("aria-selected");
      btn.removeAttribute("tabindex");
      if (btn._tabInjectedAriaControls) {
        btn.removeAttribute("aria-controls");
        btn._tabInjectedAriaControls = false;
      }
      if (btn._tabInjectedId) {
        btn.removeAttribute("id");
        btn._tabInjectedId = false;
      }
    });
    const indicator = tabGroup.querySelector("[data-tab-indicator]");
    if (indicator) {
      indicator.style.opacity = "";
      indicator.style.width = "";
      indicator.style.transform = "";
    }
    tabGroup.querySelectorAll(PANEL_SEL).forEach((panel) => {
      panel.removeAttribute("role");
      panel.removeAttribute("tabindex");
      if (panel._tabInjectedAriaLabelledBy) {
        panel.removeAttribute("aria-labelledby");
        panel._tabInjectedAriaLabelledBy = false;
      }
      if (panel._tabInjectedId) {
        panel.removeAttribute("id");
        panel._tabInjectedId = false;
      }
    });
    tabGroup._tabsInit = false;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", (evt) => {
    const el = evt.detail?.elt;
    if (!el) return;
    if (el.hasAttribute?.("data-tabs")) {
      destroy(el);
      return;
    }
    // Only destroy if the element being cleaned up contains tab buttons (not panel content swaps)
    const parent = el.closest?.("[data-tabs]");
    if (
      parent?._tabsInit &&
      (el.matches?.("[data-tab], [data-tab-list], [data-tab-panel]") ||
        el.querySelector?.("[data-tab], [data-tab-panel]"))
    ) {
      destroy(parent);
    }
  });
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.tabs = { init, destroy };
})();
// ── Toast ──
// Toast — ciderui
// Edge-positioned notification stack. Distinct from HUD (centered,
// one-at-a-time, transient): toasts stack at a page corner and persist
// until dismissed or duration expires.
(function () {
  const DEFAULT_DURATION = 4000;

  function ensureContainer() {
    let c = document.getElementById("toast-container");
    if (c) return c;
    c = document.createElement("div");
    c.id = "toast-container";
    c.className = "cider toast-container";
    c.setAttribute("role", "region");
    c.setAttribute("aria-label", "Notifications");
    c.setAttribute("aria-live", "polite");
    c.setAttribute("aria-atomic", "false");
    document.body.appendChild(c);
    return c;
  }

  function dismiss(toast) {
    if (toast._toastDismissed) return;
    toast._toastDismissed = true;
    clearTimeout(toast._toastTimer);
    toast.setAttribute("data-closing", "");
    const done = () => {
      toast.remove();
      toast.removeEventListener("animationend", done);
    };
    toast.addEventListener("animationend", done, { once: true });
    // Fallback if animation doesn't fire (e.g. reduced motion)
    setTimeout(done, 500);
  }

  function showToast(input) {
    const opts = typeof input === "string" ? { title: input } : input || {};
    const container = ensureContainer();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", opts.variant === "error" ? "alert" : "status");

    if (opts.variant) toast.setAttribute("data-variant", opts.variant);

    // Icon — the hud sanitiser is overkill for internal icons, but we
    // do skip anything that contains "<" inside the title/message
    // to avoid accidental HTML injection via user strings.
    const defaultIcon = {
      success:
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
      error:
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 3.01.01-.011M12 21a9 9 0 100-18 9 9 0 000 18z"/></svg>',
      info: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 100-18 9 9 0 000 18z"/></svg>',
    }[opts.variant || "info"];

    if (defaultIcon) {
      const iconWrap = document.createElement("span");
      iconWrap.innerHTML = defaultIcon;
      const svg = iconWrap.firstElementChild;
      if (svg) toast.appendChild(svg);
    }

    const body = document.createElement("div");
    body.className = "toast-body";
    if (opts.title) {
      const t = document.createElement("span");
      t.className = "toast-title";
      t.textContent = String(opts.title);
      body.appendChild(t);
    }
    if (opts.message) {
      const m = document.createElement("span");
      m.className = "toast-message";
      m.textContent = String(opts.message);
      body.appendChild(m);
    }
    toast.appendChild(body);

    const btn = document.createElement("button");
    btn.className = "toast-dismiss";
    btn.type = "button";
    btn.setAttribute("aria-label", "Dismiss notification");
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>';
    btn.addEventListener("click", () => dismiss(toast));
    toast.appendChild(btn);

    container.appendChild(toast);

    const duration =
      typeof opts.duration === "number" ? opts.duration : DEFAULT_DURATION;
    if (duration > 0) {
      toast._toastTimer = setTimeout(() => dismiss(toast), duration);
    }

    return { dismiss: () => dismiss(toast), element: toast };
  }

  window.showToast = showToast;
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.toast = {
    init() {
      /* no-op — toasts are created imperatively */
    },
    show: showToast,
    destroy() {
      const c = document.getElementById("toast-container");
      if (c) {
        c.querySelectorAll(".toast").forEach(dismiss);
        c.remove();
      }
    },
  };
})();
// ── Token Field ──
// TokenField — ciderui
(function () {
  function createToken(text, tokenClass, field) {
    const span = document.createElement("span");
    span.className = "token" + (tokenClass ? " " + tokenClass : "");
    span.dataset.value = text;
    span.textContent = text;
    const btn = document.createElement("button");
    btn.type = "button";
    const removeTpl = (field && field.dataset.labelRemove) || "Remove {token}";
    btn.setAttribute("aria-label", removeTpl.replace("{token}", text));
    btn.innerHTML =
      '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 9l6-6M9 9L3 3"/></svg>';
    span.appendChild(btn);
    return span;
  }

  function getTokens(field) {
    return Array.from(field.querySelectorAll(".token")).map(function (t) {
      return (
        t.dataset.value ?? (t.firstChild ? t.firstChild.textContent.trim() : "")
      );
    });
  }

  function fireChange(field) {
    field.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        detail: { tokens: getTokens(field) },
      }),
    );
  }

  function addToken(field, input, text, tokenClass) {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Prevent duplicates
    const existing = getTokens(field);
    if (existing.indexOf(trimmed) !== -1) return;
    const token = createToken(trimmed, tokenClass, field);
    field.insertBefore(token, input);
    input.value = "";
    fireChange(field);
  }

  function setup(field) {
    if (field._tokenFieldInit) return;

    const input = field.querySelector("input");
    if (!input) return;
    field._tokenFieldInit = true;
    field._tokenFieldInput = input;

    const tokenClass = field.getAttribute("data-token-class") || "";

    // ARIA — role="group" (not listbox — tokens are created items, not selectable options)
    if (!field.hasAttribute("role")) {
      field.setAttribute("role", "group");
      field._tokenFieldSetRole = true;
    }
    field.querySelectorAll(".token").forEach(function (t) {
      if (!t.dataset.value)
        t.dataset.value = t.firstChild ? t.firstChild.textContent.trim() : "";
    });

    // Click container to focus input
    field._tokenFieldClick = function (e) {
      if (e.target === field) input.focus();
    };
    field.addEventListener("click", field._tokenFieldClick);

    // Keyboard: Enter/comma to add, Backspace to remove last
    field._tokenFieldKeydown = function (e) {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addToken(field, input, input.value, tokenClass);
      } else if (e.key === "Backspace" && input.value === "") {
        const tokens = field.querySelectorAll(".token");
        if (tokens.length) {
          tokens[tokens.length - 1].remove();
          fireChange(field);
        }
      }
    };
    input.addEventListener("keydown", field._tokenFieldKeydown);

    // Remove token on × click (event delegation)
    field._tokenFieldRemove = function (e) {
      const btn = e.target.closest(".token button");
      if (!btn) return;
      const token = btn.closest(".token");
      const next = token.nextElementSibling;
      const prev = token.previousElementSibling;
      token.remove();
      // Move focus to adjacent token's remove button (keyboard nav), else input
      const nextBtn =
        (next &&
          next.classList.contains("token") &&
          next.querySelector("button")) ||
        (prev &&
          prev.classList.contains("token") &&
          prev.querySelector("button"));
      if (nextBtn) nextBtn.focus();
      else input.focus();
      fireChange(field);
    };
    field.addEventListener("click", field._tokenFieldRemove);
  }

  function destroy(field) {
    if (!field._tokenFieldInit) return;
    const input = field._tokenFieldInput;
    if (field._tokenFieldClick)
      field.removeEventListener("click", field._tokenFieldClick);
    if (input && field._tokenFieldKeydown)
      input.removeEventListener("keydown", field._tokenFieldKeydown);
    if (field._tokenFieldRemove)
      field.removeEventListener("click", field._tokenFieldRemove);
    field._tokenFieldClick = null;
    field._tokenFieldKeydown = null;
    field._tokenFieldRemove = null;
    field._tokenFieldInput = null;
    if (field._tokenFieldSetRole) {
      field.removeAttribute("role");
      field._tokenFieldSetRole = false;
    }
    field._tokenFieldInit = false;
  }

  function init() {
    document.querySelectorAll("[data-token-field]").forEach(setup);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", function (evt) {
    const el = evt.detail?.elt;
    if (!el) return;
    if (el.hasAttribute?.("data-token-field")) {
      destroy(el);
      return;
    }
    (el.querySelectorAll?.("[data-token-field]") || []).forEach(destroy);
  });

  window.CiderUI = window.CiderUI || {};
  window.CiderUI.tokenField = { init, destroy };
})();
// ── Verification Code ──
// Verification Code — ciderui
// Auto-advance, backspace, paste for verification code inputs.
(function () {
  function setupOTP(otp) {
    if (otp._vcInit) return;
    const inputs = otp.querySelectorAll('input:not([type="hidden"])');
    if (!inputs.length) return;
    otp._vcInit = true;
    inputs.forEach((input, idx) => {
      input.maxLength = 1;
      input.setAttribute("inputmode", "numeric");
      input.setAttribute("pattern", "[0-9]*");
      if (!input.getAttribute("autocomplete")) {
        input.setAttribute("autocomplete", idx === 0 ? "one-time-code" : "off");
      }
      if (!input.getAttribute("aria-label")) {
        const tpl = otp.dataset.labelDigit || "Digit {n} of {total}";
        input.setAttribute(
          "aria-label",
          tpl.replace("{n}", idx + 1).replace("{total}", inputs.length),
        );
        input._vcSetAriaLabel = true;
      }
    });
    if (!otp.getAttribute("role")) {
      otp.setAttribute("role", "group");
      otp._vcSetRole = true;
    }
    if (!otp.getAttribute("aria-label")) {
      otp.setAttribute(
        "aria-label",
        otp.dataset.labelGroup || "Verification code",
      );
      otp._vcSetAriaLabel = true;
    }
    const describedBy = otp.getAttribute("aria-describedby");
    if (describedBy) {
      const errorEl = document.getElementById(describedBy);
      if (errorEl && !errorEl.getAttribute("aria-live")) {
        errorEl.setAttribute("aria-live", "polite");
        otp._vcSetAriaLive = errorEl;
      }
    }

    let hidden = otp.querySelector("input[type=hidden]");
    if (!hidden) {
      hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = otp.dataset.name || "code";
      otp.appendChild(hidden);
      otp._vcCreatedHidden = true;
    }

    function clearError() {
      if (otp.hasAttribute("data-error")) {
        otp.removeAttribute("data-error");
        inputs.forEach((inp) => inp.removeAttribute("aria-invalid"));
      }
    }

    function fillFrom(startIdx, chars) {
      const clean = String(chars).replace(/\D/g, "");
      for (let k = startIdx; k < inputs.length; k++) inputs[k].value = "";
      for (let j = 0; j < clean.length && startIdx + j < inputs.length; j++) {
        inputs[startIdx + j].value = clean[j];
      }
    }

    function sync(silent) {
      const newVal = Array.from(inputs)
        .map((inp) => inp.value)
        .join("");
      if (hidden.value !== newVal) {
        hidden.value = newVal;
        hidden.dispatchEvent(new Event("input", { bubbles: true }));
        if (!silent) {
          hidden.dispatchEvent(new Event("change", { bubbles: true }));
          if (newVal.length === inputs.length) {
            otp.dispatchEvent(
              new CustomEvent("complete", {
                detail: { code: newVal },
                bubbles: true,
              }),
            );
          }
        }
      }
    }

    let pasting = false;
    const ac = new AbortController();
    otp._vcAbort = ac;

    const sig = { signal: ac.signal };
    inputs.forEach((input, i) => {
      input.addEventListener(
        "beforeinput",
        (e) => {
          if (e.inputType === "insertText" && e.data && /\D/.test(e.data)) {
            e.preventDefault();
          }
        },
        sig,
      );
      input.addEventListener(
        "input",
        () => {
          clearError();
          const v = input.value.replace(/\D/g, "");
          // Handle browser autofill distributing multiple characters into a single input
          if (v.length > 1 && !pasting) {
            pasting = true;
            try {
              fillFrom(i, v);
              sync();
              const nextIdx = Math.min(i + v.length, inputs.length - 1);
              inputs[nextIdx].focus();
            } finally {
              pasting = false;
            }
            return;
          }
          input.value = v.slice(-1);
          if (!pasting) {
            sync();
            if (v && i < inputs.length - 1) inputs[i + 1].focus();
          }
        },
        sig,
      );

      input.addEventListener(
        "keydown",
        (e) => {
          if (e.key === "Backspace") clearError();
          if (e.key === "Backspace" && !input.value && i > 0) {
            e.preventDefault();
            inputs[i - 1].value = "";
            inputs[i - 1].focus();
            sync(true);
          }
          if (e.key === "ArrowLeft" && i > 0) {
            e.preventDefault();
            inputs[i - 1].focus();
          }
          if (e.key === "ArrowRight" && i < inputs.length - 1) {
            e.preventDefault();
            inputs[i + 1].focus();
          }
          if (e.key === "Home") {
            e.preventDefault();
            inputs[0].focus();
          }
          if (e.key === "End") {
            e.preventDefault();
            inputs[inputs.length - 1].focus();
          }
        },
        sig,
      );

      input.addEventListener(
        "paste",
        (e) => {
          e.preventDefault();
          const text = (e.clipboardData?.getData("text") || "").replace(
            /\D/g,
            "",
          );
          if (!text) return;
          pasting = true;
          const startIdx = text.length >= inputs.length ? 0 : i;
          try {
            fillFrom(startIdx, text);
          } finally {
            pasting = false;
          }
          sync();
          const nextIdx = startIdx + text.length;
          const firstEmpty = Array.from(inputs).findIndex(
            (inp, idx) => idx >= startIdx && !inp.value,
          );
          inputs[
            firstEmpty >= 0 ? firstEmpty : Math.min(nextIdx, inputs.length - 1)
          ].focus();
        },
        sig,
      );

      input.addEventListener(
        "focus",
        () => {
          requestAnimationFrame(() => {
            if (document.activeElement === input) input.select();
          });
        },
        sig,
      );
    });

    // Sync aria-invalid with data-error attribute
    if (otp.hasAttribute("data-error")) {
      inputs.forEach((inp) => inp.setAttribute("aria-invalid", "true"));
    }
    const errorObserver = new MutationObserver(() => {
      if (!otp.isConnected) {
        errorObserver.disconnect();
        return;
      }
      const hasError = otp.hasAttribute("data-error");
      inputs.forEach((inp) => {
        if (hasError) inp.setAttribute("aria-invalid", "true");
        else inp.removeAttribute("aria-invalid");
      });
    });
    errorObserver.observe(otp, {
      attributes: true,
      attributeFilter: ["data-error"],
    });
    otp._errorObserver = errorObserver;

    otp.addEventListener(
      "click",
      (e) => {
        if (e.target.closest('input:not([type="hidden"])')) return;
        if (
          inputs[0].disabled ||
          inputs[0].getAttribute("aria-disabled") === "true"
        )
          return;
        const firstEmpty = Array.from(inputs).findIndex((inp) => !inp.value);
        inputs[firstEmpty >= 0 ? firstEmpty : inputs.length - 1].focus();
      },
      sig,
    );
  }

  function init() {
    document.querySelectorAll(".verification-code").forEach(setupOTP);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  function destroy(otp) {
    if (!otp._vcInit) return;
    if (otp._vcAbort) {
      otp._vcAbort.abort();
      otp._vcAbort = null;
    }
    if (otp._errorObserver) {
      otp._errorObserver.disconnect();
      otp._errorObserver = null;
    }
    if (otp._vcCreatedHidden) {
      const hidden = otp.querySelector("input[type=hidden]");
      if (hidden) hidden.remove();
      otp._vcCreatedHidden = false;
    }
    otp.querySelectorAll('input:not([type="hidden"])').forEach((input) => {
      input.removeAttribute("inputmode");
      input.removeAttribute("pattern");
      input.removeAttribute("autocomplete");
      if (input._vcSetAriaLabel) {
        input.removeAttribute("aria-label");
        input._vcSetAriaLabel = false;
      }
      input.removeAttribute("aria-invalid");
      input.removeAttribute("maxlength");
    });
    if (otp._vcSetRole) {
      otp.removeAttribute("role");
      otp._vcSetRole = false;
    }
    if (otp._vcSetAriaLabel) {
      otp.removeAttribute("aria-label");
      otp._vcSetAriaLabel = false;
    }
    if (otp._vcSetAriaLive) {
      otp._vcSetAriaLive.removeAttribute("aria-live");
      otp._vcSetAriaLive = null;
    }
    otp._vcInit = false;
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", (evt) => {
    const el = evt.detail?.elt;
    if (!el) return;
    if (el.classList?.contains("verification-code")) {
      destroy(el);
    } else {
      (el.querySelectorAll?.(".verification-code") || []).forEach(destroy);
    }
  });
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.verificationCode = { init, destroy };
})();
