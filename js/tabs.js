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
      const list = tabGroup.querySelector("[data-tab-list]") || buttons[0]?.parentElement;
      if (list) {
        list.setAttribute("role", "tablist");
        list.setAttribute("aria-orientation", "horizontal");
      }

      // Create sliding indicator for segmented controls
      const indicator = list?.querySelector("[data-tab-indicator]");
      function positionIndicator(btn) {
        if (!indicator || !btn) return;
        const listRect = list.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        indicator.style.width = `${btnRect.width}px`;
        indicator.style.transform = `translateX(${btnRect.left - listRect.left}px)`;
      }

      // Reposition indicator on resize
      if (indicator && list) {
        if (tabGroup._tabsResizeObserver) tabGroup._tabsResizeObserver.disconnect();
        const ro = new ResizeObserver(() => {
          if (!list.isConnected) { ro.disconnect(); return; }
          const activeBtn = tabGroup.querySelector("[data-tab][data-active]");
          if (activeBtn) positionIndicator(activeBtn);
        });
        ro.observe(list);
        tabGroup._tabsResizeObserver = ro;
      }

      buttons.forEach((btn) => {
        if (!btn.id) btn.id = `tab-${Math.random().toString(36).substring(2, 11)}`;
        btn.setAttribute("role", "tab");
        const isActive = btn.hasAttribute("data-active");
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
        btn.setAttribute("tabindex", isActive ? "0" : "-1");
        if (isActive && indicator) {
          requestAnimationFrame(() => requestAnimationFrame(() => positionIndicator(btn)));
        }
      });

      panels.forEach((panel) => {
        if (!panel.id) panel.id = `tabpanel-${Math.random().toString(36).substring(2, 11)}`;
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("tabindex", "-1");
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

        buttons.forEach((b) => {
          b.removeAttribute("data-active");
          b.setAttribute("aria-selected", "false");
          b.setAttribute("tabindex", "-1");
        });

        btn.setAttribute("data-active", "");
        btn.setAttribute("aria-selected", "true");
        btn.setAttribute("tabindex", "0");

        positionIndicator(btn);

        panels.forEach((p) => {
          if (p.getAttribute("data-tab-panel") === target) {
            p.setAttribute("data-active", "");
          } else {
            p.removeAttribute("data-active");
          }
        });
      }

      function findTab(from, step) {
        let idx = (from + step + buttons.length) % buttons.length;
        let guard = buttons.length;
        while (idx !== from && isDisabled(buttons[idx]) && --guard > 0) {
          idx = (idx + step + buttons.length) % buttons.length;
        }
        return idx !== from && !isDisabled(buttons[idx]) ? buttons[idx] : null;
      }

      buttons.forEach((btn, i) => {
        btn.addEventListener("click", () => { activate(btn); });

        btn.addEventListener("keydown", (e) => {
          let targetBtn = null;
          const isRTL = document.documentElement.dir === "rtl";
          const nextKey = isRTL ? "ArrowLeft" : "ArrowRight";
          const prevKey = isRTL ? "ArrowRight" : "ArrowLeft";
          if (e.key === nextKey) {
            e.preventDefault();
            targetBtn = findTab(i, 1);
          } else if (e.key === prevKey) {
            e.preventDefault();
            targetBtn = findTab(i, -1);
          } else if (e.key === "Home") {
            e.preventDefault();
            targetBtn = Array.from(buttons).find((b) => !isDisabled(b));
          } else if (e.key === "End") {
            e.preventDefault();
            targetBtn = Array.from(buttons).findLast((b) => !isDisabled(b));
          }

          if (targetBtn) {
            targetBtn.focus();
            activate(targetBtn);
          }
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.tabs = { init };
})();
