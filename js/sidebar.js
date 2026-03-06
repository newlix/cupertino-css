// Sidebar — ciderui
// Mobile off-canvas toggle for .sidebar-panel. Wire up [data-sidebar-toggle]
// buttons to slide the panel in/out, with overlay dismiss and Escape key support.
(function () {
  function setupToggle(btn) {
    if (btn._sidebarInit) return;
    btn._sidebarInit = true;

    var targetId = btn.getAttribute("aria-controls");
    var panel = targetId ? document.getElementById(targetId) : null;
    if (!panel) return;

    var overlay = panel.parentElement && panel.parentElement.querySelector(".sidebar-overlay");

    function isOpen() {
      return panel.hasAttribute("data-open");
    }

    function open() {
      panel.setAttribute("data-open", "");
      if (overlay) overlay.setAttribute("data-open", "");
      btn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      // Move focus into the panel for keyboard accessibility
      var firstFocusable = panel.querySelector("a[href], button:not(:disabled), [tabindex]:not([tabindex='-1'])");
      if (firstFocusable) firstFocusable.focus();
    }

    function close() {
      panel.removeAttribute("data-open");
      if (overlay) overlay.removeAttribute("data-open");
      btn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    btn.addEventListener("click", function () {
      isOpen() ? close() : open();
    });

    if (overlay) {
      overlay.addEventListener("click", close);
    }

    // Close when a link inside the sidebar is clicked
    panel.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a[href]") && isOpen()) {
        close();
      }
    });

    // Escape key closes the sidebar
    btn._sidebarEscHandler = function (e) {
      if (e.key === "Escape" && isOpen()) {
        close();
        btn.focus();
      }
    };
    document.addEventListener("keydown", btn._sidebarEscHandler);
  }

  function init() {
    document.querySelectorAll("[data-sidebar-toggle]").forEach(setupToggle);
  }

  function destroy(btn) {
    if (!btn._sidebarInit) return;
    if (btn._sidebarEscHandler) {
      document.removeEventListener("keydown", btn._sidebarEscHandler);
      btn._sidebarEscHandler = null;
    }
    btn._sidebarInit = false;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", function (evt) {
    var el = evt.detail && evt.detail.elt;
    if (!el) return;
    if (el.hasAttribute && el.hasAttribute("data-sidebar-toggle")) {
      destroy(el);
      return;
    }
    var toggles = el.querySelectorAll ? el.querySelectorAll("[data-sidebar-toggle]") : [];
    toggles.forEach(destroy);
  });

  window.CiderUI = window.CiderUI || {};
  window.CiderUI.sidebar = { init, destroy };
})();
