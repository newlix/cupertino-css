// Tabs — ciderui
function init() {
  document.querySelectorAll("[data-tabs]").forEach((tabGroup) => {
    const buttons = tabGroup.querySelectorAll("[data-tab]");
    const panels = tabGroup.querySelectorAll("[data-tab-panel]");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");

        // Deactivate all
        buttons.forEach((b) => b.removeAttribute("data-active"));

        // Activate clicked
        btn.setAttribute("data-active", "");

        // Show/hide panels
        panels.forEach((p) => {
          if (p.getAttribute("data-tab-panel") === target) {
            p.setAttribute("data-active", "");
          } else {
            p.removeAttribute("data-active");
          }
        });
      });
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
