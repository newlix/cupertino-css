// Tabs — ciderui
(function () {
  function init() {
    document.querySelectorAll("[data-tabs]").forEach((tabGroup) => {
      if (tabGroup._tabsInit) return;
      tabGroup._tabsInit = true;

      const TAB_SEL = ":scope > [data-tab], :scope > * > [data-tab]";
      const PANEL_SEL = ":scope > [data-tab-panel], :scope > * > [data-tab-panel]";
      function getButtons() { return tabGroup.querySelectorAll(TAB_SEL); }
      function getPanels() { return tabGroup.querySelectorAll(PANEL_SEL); }
      const buttons = getButtons();
      const panels = getPanels();

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
        indicator.style.width = `${btn.offsetWidth}px`;
        indicator.style.transform = `translateX(${btn.offsetLeft}px)`;
        indicator.style.opacity = "1";
      }

      // Reposition indicator on resize
      if (indicator && list) {
        if (tabGroup._tabsResizeObserver) tabGroup._tabsResizeObserver.disconnect();
        const ro = new ResizeObserver(() => {
          if (!list.isConnected) { ro.disconnect(); tabGroup._tabsResizeObserver = null; return; }
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
        panel.setAttribute("tabindex", panel.hasAttribute("data-active") ? "0" : "-1");
        const panelTarget = panel.getAttribute("data-tab-panel");
        const matchingBtn = Array.from(buttons).find((b) => b.getAttribute("data-tab") === panelTarget);
        if (matchingBtn) {
          panel.setAttribute("aria-labelledby", matchingBtn.id);
          matchingBtn.setAttribute("aria-controls", panel.id);
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
        let idx = (from + step + currentButtons.length) % currentButtons.length;
        let guard = currentButtons.length;
        while (idx !== from && isDisabled(currentButtons[idx]) && --guard > 0) {
          idx = (idx + step + currentButtons.length) % currentButtons.length;
        }
        return idx !== from && !isDisabled(currentButtons[idx]) ? currentButtons[idx] : null;
      }

      buttons.forEach((btn) => {
        btn._tabClickHandler = () => { activate(btn); };
        btn.addEventListener("click", btn._tabClickHandler);

        btn._tabKeyHandler = (e) => {
          let targetBtn = null;
          const currentButtons = getButtons();
          const currentIdx = Array.from(currentButtons).indexOf(btn);
          if (currentIdx < 0) return;

          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate(btn);
            return;
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            targetBtn = findTab(currentIdx, 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            targetBtn = findTab(currentIdx, -1);
          } else if (e.key === "Home") {
            e.preventDefault();
            targetBtn = Array.from(currentButtons).find((b) => !isDisabled(b));
          } else if (e.key === "End") {
            e.preventDefault();
            const enabled = Array.from(currentButtons).filter((b) => !isDisabled(b));
            targetBtn = enabled.length ? enabled[enabled.length - 1] : null;
          }

          if (targetBtn) {
            targetBtn.focus();
            activate(targetBtn);
          }
        };
        btn.addEventListener("keydown", btn._tabKeyHandler);
      });
    });
  }

  function destroy(tabGroup) {
    if (!tabGroup._tabsInit) return;
    if (tabGroup._tabsResizeObserver) { tabGroup._tabsResizeObserver.disconnect(); tabGroup._tabsResizeObserver = null; }
    const TAB_SEL = ":scope > [data-tab], :scope > * > [data-tab]";
    tabGroup.querySelectorAll(TAB_SEL).forEach((btn) => {
      if (btn._tabClickHandler) { btn.removeEventListener("click", btn._tabClickHandler); btn._tabClickHandler = null; }
      if (btn._tabKeyHandler) { btn.removeEventListener("keydown", btn._tabKeyHandler); btn._tabKeyHandler = null; }
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
    const el = evt.detail && evt.detail.elt;
    if (el && el.hasAttribute && el.hasAttribute("data-tabs")) destroy(el);
  });
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.tabs = { init, destroy };
})();
