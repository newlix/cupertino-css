// Popover — ciderui
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

    // Store and clean up toggle handler to prevent listener leaks on re-init
    if (popover._toggleHandler) {
      popover.removeEventListener("toggle", popover._toggleHandler);
    }
    popover._toggleHandler = function (e) {
      if (e.newState === "open") {
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
        if (left < 0) left = 0;

        // Vertical: default below trigger, flip above if overflows or popover-top
        var top;
        if (wrapper.classList.contains("popover-top") || rect.bottom + gap + ph > vh) {
          top = rect.top - ph - gap;
        } else {
          top = rect.bottom + gap;
        }

        popover.style.top = (top + window.scrollY) + "px";
        popover.style.left = (left + window.scrollX) + "px";

        var first = popover.querySelector("button:not([disabled]), a:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])");
        if (first) first.focus();
      } else {
        trigger.focus();
      }
    };
    popover.addEventListener("toggle", popover._toggleHandler);

    // Escape key to close popover
    if (popover._escHandler) {
      popover.removeEventListener("keydown", popover._escHandler);
    }
    popover._escHandler = function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        popover.hidePopover();
      }
    };
    popover.addEventListener("keydown", popover._escHandler);

    if (isMenu) {
      if (popover._menuClickHandler) {
        popover.removeEventListener("click", popover._menuClickHandler);
      }
      popover._menuClickHandler = function (e) {
        var item = e.target.closest("button, a");
        if (!item || !popover.contains(item)) return;
        popover.hidePopover();
      };
      popover.addEventListener("click", popover._menuClickHandler);

      if (popover._menuKeyHandler) {
        popover.removeEventListener("keydown", popover._menuKeyHandler);
      }
      popover._menuKeyHandler = function (e) {
        var items = Array.from(popover.querySelectorAll("button:not([disabled]), a:not([disabled])"));
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
        } else if (e.key === "Tab") {
          // Close popover on Tab to prevent focus escaping
          popover.hidePopover();
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
