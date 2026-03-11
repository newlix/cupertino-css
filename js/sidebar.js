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
      if (overlay) overlay.setAttribute("data-open", "");
      btn.setAttribute("aria-expanded", "true");
      scrollLock.lock();
      document.addEventListener("keydown", btn._sidebarEscHandler);
      // Move focus into the panel for keyboard accessibility
      const firstFocusable = panel.querySelector(
        "a[href], button:not(:disabled), [tabindex]:not([tabindex='-1'])",
      );
      if (firstFocusable) firstFocusable.focus();
    }

    function close(returnFocus) {
      if (!isOpen()) return;
      panel.removeAttribute("data-open");
      panel.removeAttribute("role");
      panel.removeAttribute("aria-modal");
      if (overlay) overlay.removeAttribute("data-open");
      btn.setAttribute("aria-expanded", "false");
      scrollLock.unlock();
      document.removeEventListener("keydown", btn._sidebarEscHandler);
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
