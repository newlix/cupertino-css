// Popover — ciderui
(function () {
  const FOCUSABLE_NOT_DISABLED =
    'button:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"]), a[href]:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"])';
  const FOCUSABLE_ALL =
    FOCUSABLE_NOT_DISABLED +
    ', input:not([tabindex="-1"]):not([disabled]), select:not([tabindex="-1"]):not([disabled]), textarea:not([tabindex="-1"]):not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';

  function setupPopover(popover) {
    if (popover._popoverInit) return;

    const wrapper = popover.closest(".popover");
    if (!wrapper) return;
    const trigger = wrapper.querySelector(
      "button:not([popover] button), a:not([popover] a)",
    );
    if (!trigger) return;

    popover._popoverInit = true;

    trigger.popoverTargetElement = popover;
    trigger.popoverTargetAction = "toggle";

    const isMenu = wrapper.classList.contains("popover-menu");
    trigger.setAttribute("aria-haspopup", isMenu ? "menu" : "dialog");
    trigger.setAttribute("aria-expanded", "false");
    if (!popover.id)
      popover.id = `popover-panel-${Math.random().toString(36).slice(2, 8)}`;
    trigger.setAttribute("aria-controls", popover.id);

    // Store and clean up toggle handler to prevent listener leaks on re-init
    if (popover._toggleHandler) {
      popover.removeEventListener("toggle", popover._toggleHandler);
    }
    function positionPopover() {
      if (!document.contains(popover) || !document.contains(trigger)) {
        popover._cleanupPositioning?.();
        return;
      }
      const rect = trigger.getBoundingClientRect();
      popover.style.margin = "0";

      const pw = popover.offsetWidth;
      const ph = popover.offsetHeight;
      const gap = 8;
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;

      // Horizontal: default left-aligned, flip if overflows or popover-end
      let left;
      if (wrapper.classList.contains("popover-end")) {
        left = rect.right - pw;
      } else {
        left = rect.left;
        if (left + pw > vw) left = rect.right - pw;
      }
      if (left < gap) left = gap;

      // Vertical: default below trigger, flip above if overflows or popover-top
      let top;
      const isFlippedTop =
        wrapper.classList.contains("popover-top") ||
        rect.bottom + gap + ph > vh;
      if (isFlippedTop) {
        top = rect.top - ph - gap;
        if (top < gap) top = gap;
      } else {
        top = rect.bottom + gap;
      }
      popover.classList.toggle(
        "popover-flipped-top",
        isFlippedTop && !wrapper.classList.contains("popover-top"),
      );

      const vOrigin = isFlippedTop ? "bottom" : "top";
      const hOrigin = wrapper.classList.contains("popover-end")
        ? "right"
        : "left";
      popover.style.setProperty("--popover-origin", `${vOrigin} ${hOrigin}`);

      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;

      // Reposition arrow to point at trigger center
      const triggerCenter = rect.left + rect.width / 2;
      const arrowOffset = Math.max(16, Math.min(pw - 16, triggerCenter - left));
      popover.style.setProperty("--arrow-left", `${arrowOffset}px`);
    }

    popover._cleanupPositioning = () => {
      if (popover._rafPositioner) {
        window.removeEventListener("scroll", popover._rafPositioner, true);
        window.removeEventListener("resize", popover._rafPositioner);
        popover._rafPositioner = null;
      }
    };

    function setAriaLabelledBy() {
      if (
        !popover.getAttribute("aria-label") &&
        !popover.getAttribute("aria-labelledby")
      ) {
        // Prefer a heading inside the popover as the accessible name source
        const heading = popover.querySelector("h1, h2, h3, h4, h5, h6");
        if (heading) {
          if (!heading.id)
            heading.id = `popover-title-${Math.random().toString(36).slice(2, 8)}`;
          popover.setAttribute("aria-labelledby", heading.id);
        } else {
          if (!trigger.id)
            trigger.id = `popover-trigger-${Math.random().toString(36).slice(2, 8)}`;
          popover.setAttribute("aria-labelledby", trigger.id);
        }
        popover._ciderAriaLabelledBy = true;
      }
    }

    function clearAriaLabelledBy() {
      if (popover._ciderAriaLabelledBy) {
        popover.removeAttribute("aria-labelledby");
        popover._ciderAriaLabelledBy = false;
      }
    }

    popover._toggleHandler = (e) => {
      if (e.newState === "open") {
        trigger.setAttribute("aria-expanded", "true");
        if (isMenu) {
          popover.setAttribute("role", "menu");
          setAriaLabelledBy();
          popover.querySelectorAll(FOCUSABLE_NOT_DISABLED).forEach((item) => {
            item.setAttribute("role", "menuitem");
            item.setAttribute("data-ciderui-menuitem", "");
            // Remove from natural tab order (APG menu pattern requires arrow-key nav only)
            if (!item.hasAttribute("data-ciderui-prev-tabindex")) {
              const prev = item.getAttribute("tabindex");
              item.setAttribute(
                "data-ciderui-prev-tabindex",
                prev != null ? prev : "",
              );
            }
            item.setAttribute("tabindex", "-1");
          });
          popover.querySelectorAll("hr").forEach((hr) => {
            hr.setAttribute("role", "separator");
            hr.setAttribute("data-ciderui-separator", "");
          });
        } else {
          popover.setAttribute("role", "dialog");
          setAriaLabelledBy();
        }
        // Cleanup any stale positioning listeners before adding new ones
        popover._cleanupPositioning();
        // Set initial transform-origin (updated by positionPopover on flip)
        const isEnd = wrapper.classList.contains("popover-end");
        const isTop = wrapper.classList.contains("popover-top");
        popover.style.setProperty(
          "--popover-origin",
          `${isTop ? "bottom" : "top"} ${isEnd ? "right" : "left"}`,
        );
        requestAnimationFrame(positionPopover);
        let rafPending = false;
        popover._rafPositioner = () => {
          if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(() => {
              rafPending = false;
              positionPopover();
            });
          }
        };
        window.addEventListener("scroll", popover._rafPositioner, true);
        window.addEventListener("resize", popover._rafPositioner);
        // Observe DOM removal only while open
        if (wrapper.parentNode)
          popover._disconnectObserver.observe(wrapper.parentNode, {
            childList: true,
            subtree: true,
          });

        const first = isMenu
          ? popover.querySelector(
              '[data-ciderui-menuitem]:not([disabled]):not([aria-disabled="true"])',
            )
          : popover.querySelector(FOCUSABLE_ALL);
        if (first) first.focus();
      } else {
        trigger.setAttribute("aria-expanded", "false");
        popover._cleanupPositioning();
        popover.style.top = "";
        popover.style.left = "";
        popover.style.margin = "";
        popover.style.removeProperty("--popover-origin");
        popover.style.removeProperty("--arrow-left");
        popover.classList.remove("popover-flipped-top");
        clearTimeout(popover._typeAheadTimer);
        popover._typeAheadTimer = null;
        popover._typeAheadBuffer = "";
        if (popover._disconnectObserver)
          popover._disconnectObserver.disconnect();
        popover.removeAttribute("role");
        clearAriaLabelledBy();
        if (isMenu) {
          popover
            .querySelectorAll("[data-ciderui-menuitem]")
            .forEach((item) => {
              item.removeAttribute("role");
              item.removeAttribute("data-ciderui-menuitem");
              // Restore original tabindex
              const prev = item.getAttribute("data-ciderui-prev-tabindex");
              if (prev != null) {
                if (prev === "") item.removeAttribute("tabindex");
                else item.setAttribute("tabindex", prev);
                item.removeAttribute("data-ciderui-prev-tabindex");
              }
            });
          popover.querySelectorAll("[data-ciderui-separator]").forEach((hr) => {
            hr.removeAttribute("role");
            hr.removeAttribute("data-ciderui-separator");
          });
        }
        if (
          !popover._tabDismiss &&
          (popover._escapeDismiss || popover.contains(document.activeElement))
        ) {
          if (
            !trigger.disabled &&
            trigger.getAttribute("aria-disabled") !== "true"
          ) {
            trigger.focus();
          }
        }
        popover._escapeDismiss = false;
        popover._tabDismiss = false;
      }
    };
    // Detect DOM removal while open to clean up scroll/resize listeners and event handlers.
    // Created before registering the toggle handler because the handler references it on open.
    if (popover._disconnectObserver) popover._disconnectObserver.disconnect();
    popover._disconnectObserver = new MutationObserver(() => {
      if (!popover.isConnected) {
        popover._cleanupPositioning();
        trigger.setAttribute("aria-expanded", "false");
        popover._disconnectObserver.disconnect();
        // Clean up event listeners on DOM removal
        if (popover._toggleHandler)
          popover.removeEventListener("toggle", popover._toggleHandler);
        if (popover._escHandler)
          popover.removeEventListener("keydown", popover._escHandler);
        if (popover._focusTrapHandler)
          popover.removeEventListener("keydown", popover._focusTrapHandler);
        if (popover._menuClickHandler)
          popover.removeEventListener("click", popover._menuClickHandler);
        if (popover._menuKeyHandler)
          popover.removeEventListener("keydown", popover._menuKeyHandler);
        clearTimeout(popover._typeAheadTimer);
        popover._typeAheadTimer = null;
        popover._typeAheadBuffer = "";
        popover._escapeDismiss = false;
        popover._tabDismiss = false;
        popover._popoverInit = false;
      }
    });

    popover.addEventListener("toggle", popover._toggleHandler);

    // Escape key to close popover
    if (popover._escHandler) {
      popover.removeEventListener("keydown", popover._escHandler);
    }
    popover._escHandler = (e) => {
      if (e.key === "Escape" && popover.matches(":popover-open")) {
        popover._escapeDismiss = true;
        e.preventDefault();
        e.stopPropagation();
        popover.hidePopover();
      }
    };
    popover.addEventListener("keydown", popover._escHandler);

    // Tab dismisses content (non-menu) popovers — consistent with non-modal nature
    if (!isMenu) {
      if (popover._focusTrapHandler) {
        popover.removeEventListener("keydown", popover._focusTrapHandler);
      }
      popover._focusTrapHandler = (e) => {
        if (e.key !== "Tab" || !popover.matches(":popover-open")) return;
        popover._tabDismiss = true;
        popover.hidePopover();
      };
      popover.addEventListener("keydown", popover._focusTrapHandler);
    }

    if (isMenu) {
      if (popover._menuClickHandler) {
        popover.removeEventListener("click", popover._menuClickHandler);
      }
      popover._menuClickHandler = (e) => {
        const item = e.target.closest("button, a");
        if (!item || !popover.contains(item)) return;
        if (item.disabled || item.getAttribute("aria-disabled") === "true")
          return;
        if (item.hasAttribute("data-no-dismiss")) return;
        if (popover.matches(":popover-open")) popover.hidePopover();
      };
      popover.addEventListener("click", popover._menuClickHandler);

      if (popover._menuKeyHandler) {
        popover.removeEventListener("keydown", popover._menuKeyHandler);
      }
      popover._menuKeyHandler = (e) => {
        const items = Array.from(
          popover.querySelectorAll(
            '[data-ciderui-menuitem]:not([disabled]):not([aria-disabled="true"])',
          ),
        );
        if (!items.length) return;
        let idx = items.indexOf(document.activeElement);

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          if (idx < 0) idx = -1;
          if (e.key === "ArrowDown") {
            items[idx < items.length - 1 ? idx + 1 : 0].focus();
          } else {
            items[idx > 0 ? idx - 1 : items.length - 1].focus();
          }
        } else if (e.key === "Home") {
          e.preventDefault();
          items[0].focus();
        } else if (e.key === "End") {
          e.preventDefault();
          items.at(-1).focus();
        } else if (e.key === "Tab") {
          // Let Tab propagate naturally so focus advances to next/previous element
          popover._tabDismiss = true;
          if (popover.matches(":popover-open")) popover.hidePopover();
        } else if (
          e.key.length === 1 &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey
        ) {
          // Type-ahead: accumulate characters within 500ms window
          if (!popover._typeAheadTimer) popover._typeAheadBuffer = "";
          clearTimeout(popover._typeAheadTimer);
          popover._typeAheadBuffer += e.key.toLowerCase();
          popover._typeAheadTimer = setTimeout(() => {
            popover._typeAheadBuffer = "";
            popover._typeAheadTimer = null;
          }, 500);
          const buf = popover._typeAheadBuffer;
          const match =
            items.find(
              (item, j) =>
                j > idx &&
                item.textContent.trim().toLowerCase().startsWith(buf),
            ) ||
            items.find((item) =>
              item.textContent.trim().toLowerCase().startsWith(buf),
            );
          if (match) match.focus();
        }
      };
      popover.addEventListener("keydown", popover._menuKeyHandler);
    }
  }

  function init() {
    document.querySelectorAll(".popover [popover]").forEach(setupPopover);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);

  function destroyPopover(popover) {
    if (!popover._popoverInit) return;
    // Reset trigger attributes to prevent stale native popover wiring
    const wrapper = popover.closest?.(".popover");
    const trigger = wrapper?.querySelector(
      "button:not([popover] button), a:not([popover] a)",
    );
    if (trigger) {
      trigger.popoverTargetElement = null;
      trigger.removeAttribute("aria-expanded");
      trigger.removeAttribute("aria-haspopup");
      trigger.removeAttribute("aria-controls");
    }
    if (popover._disconnectObserver) {
      popover._disconnectObserver.disconnect();
      popover._disconnectObserver = null;
    }
    popover._cleanupPositioning?.();
    popover.style.top = "";
    popover.style.left = "";
    popover.style.margin = "";
    popover.style.removeProperty("--popover-origin");
    popover.style.removeProperty("--arrow-left");
    popover.classList.remove("popover-flipped-top");
    clearTimeout(popover._typeAheadTimer);
    popover._typeAheadTimer = null;
    popover._typeAheadBuffer = "";
    if (popover._toggleHandler) {
      popover.removeEventListener("toggle", popover._toggleHandler);
      popover._toggleHandler = null;
    }
    if (popover._escHandler) {
      popover.removeEventListener("keydown", popover._escHandler);
      popover._escHandler = null;
    }
    if (popover._focusTrapHandler) {
      popover.removeEventListener("keydown", popover._focusTrapHandler);
      popover._focusTrapHandler = null;
    }
    if (popover._menuClickHandler) {
      popover.removeEventListener("click", popover._menuClickHandler);
      popover._menuClickHandler = null;
    }
    if (popover._menuKeyHandler) {
      popover.removeEventListener("keydown", popover._menuKeyHandler);
      popover._menuKeyHandler = null;
    }
    popover._popoverInit = false;
  }

  document.addEventListener("htmx:beforeCleanupElement", (evt) => {
    const el = evt.detail?.elt;
    if (!el) return;
    const popovers = el.hasAttribute?.("popover")
      ? [el]
      : Array.from(el.querySelectorAll?.("[popover]") || []);
    popovers.forEach(destroyPopover);
  });

  window.CiderUI = window.CiderUI || {};
  window.CiderUI.popover = { init, destroy: destroyPopover };
})();
