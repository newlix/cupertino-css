// Tabs — ciderui
(function () {
  function init() {
    document.querySelectorAll("[data-tabs]").forEach((tabGroup) => {
      if (tabGroup._tabsInit) return;
      tabGroup._tabsInit = true;

      const buttons = tabGroup.querySelectorAll(":scope > [data-tab], :scope > * > [data-tab]");
      const panels = tabGroup.querySelectorAll(":scope > [data-tab-panel]");

      function isDisabled(btn) {
        return btn.disabled || btn.getAttribute("aria-disabled") === "true";
      }

      // Set ARIA attributes
      const list = buttons[0] && buttons[0].parentElement;
      if (list) {
        list.setAttribute("role", "tablist");
        list.setAttribute("aria-orientation", "horizontal");
      }

      // Create sliding indicator for segmented controls
      var indicator = list ? list.querySelector("[data-tab-indicator]") : null;
      function positionIndicator(btn) {
        if (!indicator || !btn) return;
        var listRect = list.getBoundingClientRect();
        var btnRect = btn.getBoundingClientRect();
        indicator.style.width = btnRect.width + "px";
        indicator.style.transform = "translateX(" + (btnRect.left - listRect.left - parseFloat(getComputedStyle(list).paddingLeft)) + "px)";
      }

      // Reposition indicator on resize
      if (indicator && list) {
        var ro = new ResizeObserver(function () {
          var activeBtn = tabGroup.querySelector("[data-tab][data-active]");
          if (activeBtn) positionIndicator(activeBtn);
        });
        ro.observe(list);
      }

      buttons.forEach((btn) => {
        if (!btn.id) btn.id = "tab-" + Math.random().toString(36).substr(2, 9);
        btn.setAttribute("role", "tab");
        const isActive = btn.hasAttribute("data-active");
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
        btn.setAttribute("tabindex", isActive ? "0" : "-1");
        if (isActive && indicator) {
          requestAnimationFrame(() => positionIndicator(btn));
        }
      });

      panels.forEach((panel) => {
        if (!panel.id) panel.id = "tabpanel-" + Math.random().toString(36).substr(2, 9);
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("tabindex", "0");
        const panelTarget = panel.getAttribute("data-tab-panel");
        const matchingBtn = Array.from(buttons).find((b) => b.getAttribute("data-tab") === panelTarget);
        if (matchingBtn) {
          panel.setAttribute("aria-labelledby", matchingBtn.id);
          matchingBtn.setAttribute("aria-controls", panel.id);
        }
      });

      function activate(btn) {
        if (isDisabled(btn)) return;
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

        // Slide indicator
        positionIndicator(btn);

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
        btn.addEventListener("click", () => { activate(btn); btn.focus(); });

        // Keyboard navigation
        btn.addEventListener("keydown", (e) => {
          let targetBtn = null;
          const isRTL = document.documentElement.dir === "rtl";
          const nextKey = isRTL ? "ArrowLeft" : "ArrowRight";
          const prevKey = isRTL ? "ArrowRight" : "ArrowLeft";
          if (e.key === nextKey) {
            e.preventDefault();
            var idx = (i + 1) % buttons.length;
            while (idx !== i && isDisabled(buttons[idx])) idx = (idx + 1) % buttons.length;
            if (idx !== i) targetBtn = buttons[idx];
          } else if (e.key === prevKey) {
            e.preventDefault();
            var idx = (i - 1 + buttons.length) % buttons.length;
            while (idx !== i && isDisabled(buttons[idx])) idx = (idx - 1 + buttons.length) % buttons.length;
            if (idx !== i) targetBtn = buttons[idx];
          } else if (e.key === "Home") {
            e.preventDefault();
            targetBtn = Array.from(buttons).find((b) => !isDisabled(b));
          } else if (e.key === "End") {
            e.preventDefault();
            targetBtn = Array.from(buttons).reverse().find((b) => !isDisabled(b));
          }

          if (targetBtn && !isDisabled(targetBtn)) {
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

  document.addEventListener("htmx:afterSettle", init);
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.tabs = { init: init };
})();
