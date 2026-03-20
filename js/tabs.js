// Tabs — ciderui
(function () {
  const TAB_SEL = ":scope > [data-tab], :scope > * > [data-tab]";
  const PANEL_SEL = ":scope > [data-tab-panel], :scope > * > [data-tab-panel]";

  function setupTabGroup(tabGroup) {
    if (tabGroup._tabsInit) return;
    tabGroup._tabsInit = true;
    function getButtons() {
      return tabGroup.querySelectorAll(TAB_SEL);
    }
    function getPanels() {
      return tabGroup.querySelectorAll(PANEL_SEL);
    }
    function isDisabled(btn) {
      return btn.disabled || btn.getAttribute("aria-disabled") === "true";
    }

    // Set ARIA attributes
    const list =
      tabGroup.querySelector("[data-tab-list]") ||
      getButtons()[0]?.parentElement;
    if (list) {
      list.setAttribute("role", "tablist");
      const orientation = list.getAttribute("data-orientation") || "horizontal";
      list.setAttribute("aria-orientation", orientation);
    }
    tabGroup._tabsList = list;

    // Create sliding indicator for segmented controls
    const indicator = list?.querySelector("[data-tab-indicator]");
    function positionIndicator(btn) {
      if (!indicator || !btn) return;
      const listRect = list.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      indicator.style.width = `${btnRect.width}px`;
      indicator.style.transform = `translateX(${btnRect.left - listRect.left}px)`;
      indicator.style.opacity = "1";
    }

    // Reposition indicator on resize
    if (indicator && list) {
      if (tabGroup._tabsResizeObserver)
        tabGroup._tabsResizeObserver.disconnect();
      const ro = new ResizeObserver(() => {
        if (!list.isConnected) {
          ro.disconnect();
          tabGroup._tabsResizeObserver = null;
          return;
        }
        const activeBtn = tabGroup.querySelector("[data-tab][data-active]");
        if (activeBtn) positionIndicator(activeBtn);
      });
      ro.observe(list);
      tabGroup._tabsResizeObserver = ro;
    }

    getButtons().forEach((btn) => {
      if (!btn.id) {
        btn.id = `tab-${Math.random().toString(36).substring(2, 11)}`;
        btn._tabInjectedId = true;
      }
      btn.setAttribute("role", "tab");
      const isActive = btn.hasAttribute("data-active");
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
      btn.setAttribute("tabindex", isActive ? "0" : "-1");
      if (isActive && indicator) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => positionIndicator(btn)),
        );
      }
    });

    // Ensure at least one tab is keyboard-reachable when none is active
    const initButtons = getButtons();
    if (
      !Array.from(initButtons).some((b) => b.getAttribute("tabindex") === "0")
    ) {
      const first = Array.from(initButtons).find((b) => !isDisabled(b));
      if (first) first.setAttribute("tabindex", "0");
    }

    getPanels().forEach((panel) => {
      if (!panel.id) {
        panel.id = `tabpanel-${Math.random().toString(36).substring(2, 11)}`;
        panel._tabInjectedId = true;
      }
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute(
        "tabindex",
        panel.hasAttribute("data-active") ? "0" : "-1",
      );
      const panelTarget = panel.getAttribute("data-tab-panel");
      const matchingBtn = Array.from(getButtons()).find(
        (b) => b.getAttribute("data-tab") === panelTarget,
      );
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
      if (!currentButtons.length) return null;
      let idx = (from + step + currentButtons.length) % currentButtons.length;
      let guard = currentButtons.length;
      while (idx !== from && isDisabled(currentButtons[idx]) && --guard > 0) {
        idx = (idx + step + currentButtons.length) % currentButtons.length;
      }
      return idx !== from && guard > 0 && !isDisabled(currentButtons[idx])
        ? currentButtons[idx]
        : null;
    }

    getButtons().forEach((btn) => {
      btn._tabClickHandler = () => {
        activate(btn);
      };
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
        } else if (
          e.key ===
          (list?.getAttribute("aria-orientation") === "vertical"
            ? "ArrowDown"
            : "ArrowRight")
        ) {
          e.preventDefault();
          targetBtn = findTab(currentIdx, 1);
        } else if (
          e.key ===
          (list?.getAttribute("aria-orientation") === "vertical"
            ? "ArrowUp"
            : "ArrowLeft")
        ) {
          e.preventDefault();
          targetBtn = findTab(currentIdx, -1);
        } else if (e.key === "Home") {
          e.preventDefault();
          targetBtn = Array.from(currentButtons).find((b) => !isDisabled(b));
        } else if (e.key === "End") {
          e.preventDefault();
          targetBtn =
            Array.from(currentButtons)
              .filter((b) => !isDisabled(b))
              .at(-1) ?? null;
        }

        if (targetBtn) {
          targetBtn.focus();
          activate(targetBtn);
        }
      };
      btn.addEventListener("keydown", btn._tabKeyHandler);
    });
  }

  function init() {
    document.querySelectorAll("[data-tabs]").forEach(setupTabGroup);
  }

  function destroy(tabGroup) {
    if (!tabGroup._tabsInit) return;
    if (tabGroup._tabsResizeObserver) {
      tabGroup._tabsResizeObserver.disconnect();
      tabGroup._tabsResizeObserver = null;
    }
    const list = tabGroup._tabsList;
    if (list) {
      list.removeAttribute("role");
      list.removeAttribute("aria-orientation");
    }
    tabGroup._tabsList = null;
    tabGroup.querySelectorAll(TAB_SEL).forEach((btn) => {
      if (btn._tabClickHandler) {
        btn.removeEventListener("click", btn._tabClickHandler);
        btn._tabClickHandler = null;
      }
      if (btn._tabKeyHandler) {
        btn.removeEventListener("keydown", btn._tabKeyHandler);
        btn._tabKeyHandler = null;
      }
      btn.removeAttribute("role");
      btn.removeAttribute("aria-selected");
      btn.removeAttribute("tabindex");
      btn.removeAttribute("aria-controls");
      if (btn._tabInjectedId) {
        btn.removeAttribute("id");
        btn._tabInjectedId = false;
      }
    });
    const indicator = tabGroup.querySelector("[data-tab-indicator]");
    if (indicator) {
      indicator.style.opacity = "";
      indicator.style.width = "";
      indicator.style.transform = "";
    }
    tabGroup.querySelectorAll(PANEL_SEL).forEach((panel) => {
      panel.removeAttribute("role");
      panel.removeAttribute("tabindex");
      panel.removeAttribute("aria-labelledby");
      if (panel._tabInjectedId) {
        panel.removeAttribute("id");
        panel._tabInjectedId = false;
      }
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
    const el = evt.detail?.elt;
    if (!el) return;
    if (el.hasAttribute?.("data-tabs")) {
      destroy(el);
      return;
    }
    // Only destroy if the element being cleaned up contains tab buttons (not panel content swaps)
    const parent = el.closest?.("[data-tabs]");
    if (
      parent?._tabsInit &&
      (el.matches?.("[data-tab], [data-tab-list], [data-tab-panel]") ||
        el.querySelector?.("[data-tab], [data-tab-panel]"))
    ) {
      destroy(parent);
    }
  });
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.tabs = { init, destroy };
})();
