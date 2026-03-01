// Tabs — ciderui
function init() {
  document.querySelectorAll("[data-tabs]").forEach((tabGroup) => {
    if (tabGroup._tabsInit) return;
    tabGroup._tabsInit = true;

    const buttons = tabGroup.querySelectorAll("[data-tab]");
    const panels = tabGroup.querySelectorAll("[data-tab-panel]");

    // Set ARIA attributes
    const list = buttons[0] && buttons[0].parentElement;
    if (list) list.setAttribute("role", "tablist");

    buttons.forEach((btn) => {
      if (!btn.id) btn.id = "tab-" + Math.random().toString(36).substr(2, 9);
      btn.setAttribute("role", "tab");
      const isActive = btn.hasAttribute("data-active");
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
      btn.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    panels.forEach((panel) => {
      panel.setAttribute("role", "tabpanel");
      const panelTarget = panel.getAttribute("data-tab-panel");
      const matchingBtn = Array.from(buttons).find((b) => b.getAttribute("data-tab") === panelTarget);
      if (matchingBtn) panel.setAttribute("aria-labelledby", matchingBtn.id);
    });

    function activate(btn) {
      if (btn.disabled) return;
      const target = btn.getAttribute("data-tab");

      // Deactivate all
      buttons.forEach((b) => {
        b.removeAttribute("data-active");
        b.setAttribute("aria-selected", "false");
        b.setAttribute("tabindex", "-1");
      });

      // Activate clicked
      btn.setAttribute("data-active", "");
      btn.setAttribute("aria-selected", "true");
      btn.setAttribute("tabindex", "0");

      // Show/hide panels
      panels.forEach((p) => {
        if (p.getAttribute("data-tab-panel") === target) {
          p.setAttribute("data-active", "");
        } else {
          p.removeAttribute("data-active");
        }
      });
    }

    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => activate(btn));

      // Keyboard navigation
      btn.addEventListener("keydown", (e) => {
        let targetBtn = null;
        const isRTL = document.documentElement.dir === "rtl";
        const nextKey = isRTL ? "ArrowLeft" : "ArrowRight";
        const prevKey = isRTL ? "ArrowRight" : "ArrowLeft";
        if (e.key === nextKey || e.key === "ArrowDown") {
          e.preventDefault();
          var idx = (i + 1) % buttons.length;
          while (idx !== i && buttons[idx].disabled) idx = (idx + 1) % buttons.length;
          targetBtn = buttons[idx];
        } else if (e.key === prevKey || e.key === "ArrowUp") {
          e.preventDefault();
          var idx = (i - 1 + buttons.length) % buttons.length;
          while (idx !== i && buttons[idx].disabled) idx = (idx - 1 + buttons.length) % buttons.length;
          targetBtn = buttons[idx];
        } else if (e.key === "Home") {
          e.preventDefault();
          targetBtn = Array.from(buttons).find(function(b) { return !b.disabled; });
        } else if (e.key === "End") {
          e.preventDefault();
          targetBtn = Array.from(buttons).reverse().find(function(b) { return !b.disabled; });
        }

        if (targetBtn && !targetBtn.disabled) {
          targetBtn.focus();
          activate(targetBtn);
        }
      });
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
