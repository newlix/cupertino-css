// Sidebar — ciderui
// Mobile off-canvas toggle. Wire up [data-sidebar-toggle]
// buttons to slide the panel in/out, with overlay dismiss and Escape key support.
(function () {
  window.CiderUI = window.CiderUI || {};
  if (!window.CiderUI._scrollLock) {
    window.CiderUI._scrollLock = {
      count: 0,
      saved: null,
      lock() {
        if (this.count++ === 0) {
          this.saved = document.body.style.overflow;
          const sw = window.innerWidth - document.documentElement.clientWidth;
          if (sw > 0) document.body.style.paddingRight = `${sw}px`;
          document.body.style.overflow = "hidden";
        }
      },
      unlock() {
        if (this.count <= 0) return;
        if (--this.count === 0) {
          document.body.style.overflow = this.saved ?? "";
          document.body.style.paddingRight = "";
          this.saved = null;
        }
      },
    };
  }
  const scrollLock = window.CiderUI._scrollLock;

  const FOCUSABLE =
    'a[href]:not([tabindex="-1"]):not([aria-disabled="true"]), button:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"]), input:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"]), select:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"]), textarea:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"]), [tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"])';

  function isVisible(el) {
    if (el.getClientRects().length === 0) return false;
    var style = getComputedStyle(el);
    return style.visibility !== "hidden" && style.visibility !== "collapse";
  }

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
      btn._sidebarPreviousFocus = document.activeElement;
      panel.setAttribute("data-open", "");
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      // Accessible name for the dialog (required by ARIA spec)
      const heading = panel.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading) {
        if (!heading.id)
          heading.id = `sidebar-title-${Math.random().toString(36).slice(2, 8)}`;
        panel.setAttribute("aria-labelledby", heading.id);
      } else if (!panel.getAttribute("aria-label")) {
        panel.setAttribute("aria-label", "Navigation");
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
        var focusable = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
          isVisible,
        );
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (focusable.indexOf(document.activeElement) === -1) {
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
      panel.removeAttribute("aria-labelledby");
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
        if (prev && document.contains(prev) && prev !== document.body) {
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
    if (!btn._sidebarInit) return;
    // Restore scroll lock if sidebar was open
    if (btn._sidebarPanel && btn._sidebarPanel.hasAttribute("data-open")) {
      btn._sidebarPanel.removeAttribute("data-open");
      btn._sidebarPanel.removeAttribute("role");
      btn._sidebarPanel.removeAttribute("aria-modal");
      btn._sidebarPanel.removeAttribute("aria-labelledby");
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

  window.CiderUI = window.CiderUI || {};
  window.CiderUI.sidebar = { init, destroy };
})();
