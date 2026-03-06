// Sidebar — ciderui
// Mobile off-canvas toggle. Wire up [data-sidebar-toggle]
// buttons to slide the panel in/out, with overlay dismiss and Escape key support.
(function () {
  let openCount = 0;
  let savedOverflow = "";

  function setupToggle(btn) {
    if (btn._sidebarInit) return;

    const targetId = btn.getAttribute("aria-controls");
    const panel = targetId ? document.getElementById(targetId) : null;
    if (!panel) return;

    btn._sidebarInit = true;

    const overlay =
      panel.parentElement &&
      panel.parentElement.querySelector("[data-sidebar-overlay]");

    function isOpen() {
      return panel.hasAttribute("data-open");
    }

    function open() {
      panel.setAttribute("data-open", "");
      if (overlay) overlay.setAttribute("data-open", "");
      btn.setAttribute("aria-expanded", "true");
      if (openCount === 0) savedOverflow = document.body.style.overflow;
      openCount++;
      document.body.style.overflow = "hidden";
      // Move focus into the panel for keyboard accessibility
      const firstFocusable = panel.querySelector(
        "a[href], button:not(:disabled), [tabindex]:not([tabindex='-1'])",
      );
      if (firstFocusable) firstFocusable.focus();
    }

    function close(returnFocus) {
      if (!isOpen()) return;
      panel.removeAttribute("data-open");
      if (overlay) overlay.removeAttribute("data-open");
      btn.setAttribute("aria-expanded", "false");
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) document.body.style.overflow = savedOverflow;
      if (returnFocus !== false) btn.focus();
    }

    btn._sidebarPanel = panel;
    btn._sidebarOverlay = overlay;

    btn._sidebarClickHandler = function () {
      isOpen() ? close() : open();
    };
    btn.addEventListener("click", btn._sidebarClickHandler);

    if (overlay) {
      btn._sidebarOverlayClickHandler = close;
      overlay.addEventListener("click", btn._sidebarOverlayClickHandler);
    }

    // Close when a link inside the sidebar is clicked
    btn._sidebarPanelClickHandler = function (e) {
      if (e.target.closest && e.target.closest("a[href]") && isOpen()) {
        close(false);
      }
    };
    panel.addEventListener("click", btn._sidebarPanelClickHandler);

    // Escape key closes the sidebar
    btn._sidebarEscHandler = function (e) {
      if (e.key === "Escape" && isOpen()) {
        close();
      }
    };
    document.addEventListener("keydown", btn._sidebarEscHandler);
  }

  function init() {
    document.querySelectorAll("[data-sidebar-toggle]").forEach(setupToggle);
  }

  function destroy(btn) {
    if (!btn._sidebarInit) return;
    // Restore scroll lock if sidebar was open
    if (btn._sidebarPanel && btn._sidebarPanel.hasAttribute("data-open")) {
      btn._sidebarPanel.removeAttribute("data-open");
      if (btn._sidebarOverlay) btn._sidebarOverlay.removeAttribute("data-open");
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) document.body.style.overflow = savedOverflow;
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
  document.addEventListener("htmx:beforeCleanupElement", function (evt) {
    const el = evt.detail && evt.detail.elt;
    if (!el) return;
    if (el.hasAttribute && el.hasAttribute("data-sidebar-toggle")) {
      destroy(el);
      return;
    }
    const toggles = el.querySelectorAll
      ? el.querySelectorAll("[data-sidebar-toggle]")
      : [];
    toggles.forEach(destroy);
  });

  window.CiderUI = window.CiderUI || {};
  window.CiderUI.sidebar = { init, destroy };
})();
