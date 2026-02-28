// Tabs — ciderui
function init() {
  document.querySelectorAll("[data-tabs]").forEach((tabGroup) => {
    const buttons = tabGroup.querySelectorAll("[data-tab]");
    const panels = tabGroup.querySelectorAll("[data-tab-panel]");

    // Set ARIA attributes
    const list = buttons[0] && buttons[0].parentElement;
    if (list) list.setAttribute("role", "tablist");

    buttons.forEach((btn) => {
      btn.setAttribute("role", "tab");
      const isActive = btn.hasAttribute("data-active");
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
      btn.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    panels.forEach((panel) => {
      panel.setAttribute("role", "tabpanel");
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
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          targetBtn = buttons[(i + 1) % buttons.length];
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          targetBtn = buttons[(i - 1 + buttons.length) % buttons.length];
        } else if (e.key === "Home") {
          e.preventDefault();
          targetBtn = buttons[0];
        } else if (e.key === "End") {
          e.preventDefault();
          targetBtn = buttons[buttons.length - 1];
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
