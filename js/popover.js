// Popover — ciderui
(function () {
  const FOCUSABLE_NOT_DISABLED = 'button:not([disabled]):not([aria-disabled="true"]), a[href]:not([disabled]):not([aria-disabled="true"])';

  function init() {
    document.querySelectorAll(".popover [popover]").forEach((popover) => {
      if (popover._popoverInit) return;
      popover._popoverInit = true;

      const wrapper = popover.closest(".popover");
      const trigger = wrapper.querySelector("button:not([popover] button), a:not([popover] a)");
      if (!trigger) return;

      trigger.popoverTargetElement = popover;
      trigger.popoverTargetAction = "toggle";

      const isMenu = wrapper.classList.contains("popover-menu");
      trigger.setAttribute("aria-haspopup", isMenu ? "menu" : "dialog");
      trigger.setAttribute("aria-expanded", "false");

      // Store and clean up toggle handler to prevent listener leaks on re-init
      if (popover._toggleHandler) {
        popover.removeEventListener("toggle", popover._toggleHandler);
      }
      function positionPopover() {
        if (!document.contains(popover) || !document.contains(trigger)) {
          popover._cleanupPositioning();
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
        const isFlippedTop = wrapper.classList.contains("popover-top") || rect.bottom + gap + ph > vh;
        if (isFlippedTop) {
          top = rect.top - ph - gap;
          if (top < gap) top = gap;
        } else {
          top = rect.bottom + gap;
        }
        popover.classList.toggle("popover-flipped-top", isFlippedTop && !wrapper.classList.contains("popover-top"));

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

      popover._toggleHandler = (e) => {
        if (e.newState === "open") {
          trigger.setAttribute("aria-expanded", "true");
          if (isMenu) {
            popover.setAttribute("role", "menu");
            if (!popover.getAttribute("aria-label") && !popover.getAttribute("aria-labelledby")) {
              if (!trigger.id) trigger.id = `popover-trigger-${Math.random().toString(36).slice(2, 8)}`;
              popover.setAttribute("aria-labelledby", trigger.id);
            }
            popover.querySelectorAll(FOCUSABLE_NOT_DISABLED).forEach((item) => {
              item.setAttribute("role", "menuitem");
              item.setAttribute("data-ciderui-menuitem", "");
            });
          } else {
            popover.setAttribute("role", "dialog");
          }
          // Cleanup any stale positioning listeners before adding new ones
          popover._cleanupPositioning();
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

          const first = popover.querySelector(FOCUSABLE_NOT_DISABLED + ', input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])');
          if (first) first.focus();
        } else {
          trigger.setAttribute("aria-expanded", "false");
          popover._cleanupPositioning();
          if (isMenu) {
            popover.removeAttribute("role");
            popover.removeAttribute("aria-labelledby");
            popover.querySelectorAll("[data-ciderui-menuitem]").forEach((item) => {
              item.removeAttribute("role");
              item.removeAttribute("data-ciderui-menuitem");
            });
          } else {
            popover.removeAttribute("role");
          }
          if (
            popover._escapeDismiss ||
            document.activeElement === document.body ||
            popover.contains(document.activeElement)
          ) {
            trigger.focus();
          }
          popover._escapeDismiss = false;
        }
      };
      popover.addEventListener("toggle", popover._toggleHandler);

      // Detect DOM removal while open to clean up scroll/resize listeners
      if (popover._disconnectObserver) popover._disconnectObserver.disconnect();
      popover._disconnectObserver = new MutationObserver(() => {
        if (!popover.isConnected) {
          popover._cleanupPositioning();
          trigger.setAttribute("aria-expanded", "false");
          popover._disconnectObserver.disconnect();
        }
      });
      popover._disconnectObserver.observe(popover.parentNode || document.body, { childList: true, subtree: true });

      // Escape key to close popover
      if (popover._escHandler) {
        popover.removeEventListener("keydown", popover._escHandler);
      }
      popover._escHandler = (e) => {
        if (e.key === "Escape" && popover.matches(":popover-open")) {
          e.preventDefault();
          popover._escapeDismiss = true;
          popover.hidePopover();
        }
      };
      popover.addEventListener("keydown", popover._escHandler);

      // Focus trap for content (non-menu) popovers
      if (!isMenu) {
        if (popover._focusTrapHandler) {
          popover.removeEventListener("keydown", popover._focusTrapHandler);
        }
        popover._focusTrapHandler = (e) => {
          if (e.key !== "Tab" || !popover.matches(":popover-open")) return;
          const focusable = Array.from(popover.querySelectorAll(FOCUSABLE_NOT_DISABLED + ', input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'));
          if (!focusable.length) return;
          const first = focusable[0];
          const last = focusable.at(-1);
          if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
          } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
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
          if (item.disabled || item.getAttribute("aria-disabled") === "true") return;
          if (item.hasAttribute("data-no-dismiss")) return;
          if (popover.matches(":popover-open")) popover.hidePopover();
        };
        popover.addEventListener("click", popover._menuClickHandler);

        if (popover._menuKeyHandler) {
          popover.removeEventListener("keydown", popover._menuKeyHandler);
        }
        popover._menuKeyHandler = (e) => {
          const items = Array.from(popover.querySelectorAll(FOCUSABLE_NOT_DISABLED));
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
            e.preventDefault();
            popover._escapeDismiss = true;
            if (popover.matches(":popover-open")) popover.hidePopover();
          } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            // Type-ahead: focus first item starting with typed character
            const ch = e.key.toLowerCase();
            const match = items.find((item, j) => j > idx && item.textContent.trim().toLowerCase().startsWith(ch))
              || items.find((item) => item.textContent.trim().toLowerCase().startsWith(ch));
            if (match) match.focus();
          }
        };
        popover.addEventListener("keydown", popover._menuKeyHandler);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);

  if (typeof window !== "undefined") {
    window.CiderUI = window.CiderUI || {};
    window.CiderUI.popover = { init };
  }
})();
