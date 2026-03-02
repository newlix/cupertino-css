// Popover — ciderui
(function () {
  var FOCUSABLE_NOT_DISABLED = 'button:not([disabled]):not([aria-disabled="true"]), a:not([disabled]):not([aria-disabled="true"])';

  function init() {
    document.querySelectorAll(".popover [popover]").forEach(function (popover) {
      if (popover._popoverInit) return;
      popover._popoverInit = true;

      var wrapper = popover.closest(".popover");
      var trigger = wrapper.querySelector("button:not([popover] button), a:not([popover] a)");
      if (!trigger) return;

      trigger.popoverTargetElement = popover;
      trigger.popoverTargetAction = "toggle";

      var isMenu = wrapper.classList.contains("popover-menu");
      trigger.setAttribute("aria-haspopup", isMenu ? "menu" : "true");
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
        var rect = trigger.getBoundingClientRect();
        popover.style.margin = "0";

        var pw = popover.offsetWidth;
        var ph = popover.offsetHeight;
        var gap = 8;
        var vw = document.documentElement.clientWidth;
        var vh = window.innerHeight;

        // Horizontal: default left-aligned, flip if overflows or popover-end
        var left;
        if (wrapper.classList.contains("popover-end")) {
          left = rect.right - pw;
        } else {
          left = rect.left;
          if (left + pw > vw) left = rect.right - pw;
        }
        if (left < gap) left = gap;

        // Vertical: default below trigger, flip above if overflows or popover-top
        var top;
        var isFlippedTop = wrapper.classList.contains("popover-top") || rect.bottom + gap + ph > vh;
        if (isFlippedTop) {
          top = rect.top - ph - gap;
          if (top < gap) top = gap;
        } else {
          top = rect.bottom + gap;
        }
        popover.classList.toggle("popover-flipped-top", isFlippedTop && !wrapper.classList.contains("popover-top"));

        popover.style.top = top + "px";
        popover.style.left = left + "px";

        // Reposition arrow to point at trigger center
        var triggerCenter = rect.left + rect.width / 2;
        var arrowOffset = Math.max(16, Math.min(pw - 16, triggerCenter - left));
        popover.style.setProperty("--arrow-left", arrowOffset + "px");
      }

      popover._cleanupPositioning = function () {
        window.removeEventListener("scroll", popover._rafPositioner || positionPopover, true);
        window.removeEventListener("resize", popover._rafPositioner || positionPopover);
        popover._rafPositioner = null;
      };

      popover._toggleHandler = function (e) {
        if (e.newState === "open") {
          trigger.setAttribute("aria-expanded", "true");
          if (isMenu) {
            popover.setAttribute("role", "menu");
            popover.querySelectorAll(FOCUSABLE_NOT_DISABLED).forEach(function (item) {
              item.setAttribute("role", "menuitem");
            });
          }
          // Cleanup any stale positioning listeners before adding new ones
          popover._cleanupPositioning();
          requestAnimationFrame(positionPopover);
          var rafPending = false;
          popover._rafPositioner = function () {
            if (!rafPending) {
              rafPending = true;
              requestAnimationFrame(function () {
                rafPending = false;
                positionPopover();
              });
            }
          };
          window.addEventListener("scroll", popover._rafPositioner, true);
          window.addEventListener("resize", popover._rafPositioner);

          var first = popover.querySelector(FOCUSABLE_NOT_DISABLED + ', input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (first) first.focus();
        } else {
          trigger.setAttribute("aria-expanded", "false");
          popover._cleanupPositioning();
          if (isMenu) {
            popover.removeAttribute("role");
            popover.querySelectorAll('[role="menuitem"]').forEach(function (item) {
              item.removeAttribute("role");
            });
          }
          if (popover._escapeDismiss) {
            trigger.focus();
            popover._escapeDismiss = false;
          }
        }
      };
      popover.addEventListener("toggle", popover._toggleHandler);

      // Escape key to close popover
      if (popover._escHandler) {
        popover.removeEventListener("keydown", popover._escHandler);
      }
      popover._escHandler = function (e) {
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
        popover._focusTrapHandler = function (e) {
          if (e.key !== "Tab" || !popover.matches(":popover-open")) return;
          var focusable = Array.from(popover.querySelectorAll(FOCUSABLE_NOT_DISABLED + ', input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'));
          if (!focusable.length) return;
          var first = focusable[0];
          var last = focusable[focusable.length - 1];
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
        popover._menuClickHandler = function (e) {
          var item = e.target.closest("button, a");
          if (!item || !popover.contains(item)) return;
          if (item.disabled || item.getAttribute("aria-disabled") === "true") return;
          if (item.hasAttribute("data-no-dismiss")) return;
          if (popover.matches(":popover-open")) popover.hidePopover();
        };
        popover.addEventListener("click", popover._menuClickHandler);

        if (popover._menuKeyHandler) {
          popover.removeEventListener("keydown", popover._menuKeyHandler);
        }
        popover._menuKeyHandler = function (e) {
          var items = Array.from(popover.querySelectorAll(FOCUSABLE_NOT_DISABLED));
          if (!items.length) return;
          var idx = items.indexOf(document.activeElement);

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
            items[items.length - 1].focus();
          } else if (e.key === "Tab") {
            if (popover.matches(":popover-open")) popover.hidePopover();
          } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            // Type-ahead: focus first item starting with typed character
            var ch = e.key.toLowerCase();
            var match = items.find(function (item, j) {
              return j > idx && item.textContent.trim().toLowerCase().startsWith(ch);
            }) || items.find(function (item) {
              return item.textContent.trim().toLowerCase().startsWith(ch);
            });
            if (match) match.focus();
          }
        };
        popover.addEventListener("keydown", popover._menuKeyHandler);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);

  if (typeof window !== "undefined") {
    window.CiderUI = window.CiderUI || {};
    window.CiderUI.popover = { init: init };
  }
})();
