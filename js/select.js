// Custom Select — ciderui
function init() {
  document.querySelectorAll("[data-select]").forEach(function (select) {
    if (select.dataset.initialized) return;
    select.dataset.initialized = "true";
    var trigger = select.querySelector("[data-select-trigger]");
    var content = select.querySelector("[data-select-content]");
    var valueEl = select.querySelector("[data-select-value]");
    var items = select.querySelectorAll("[data-select-item]");

    // ARIA setup
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    content.setAttribute("role", "listbox");
    items.forEach(function (item) {
      item.setAttribute("role", "option");
    });

    function openSelect() {
      // Close all other selects
      document.querySelectorAll("[data-select-content]").forEach(function (el) {
        el.classList.add("hidden");
      });
      document.querySelectorAll("[data-select-trigger]").forEach(function (el) {
        el.setAttribute("aria-expanded", "false");
      });
      content.classList.remove("hidden");
      trigger.setAttribute("aria-expanded", "true");
      // Focus first item or selected item
      var selected = content.querySelector("[data-selected]") || items[0];
      if (selected) selected.focus();
    }

    function closeSelect() {
      content.classList.add("hidden");
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", function () {
      var isOpen = !content.classList.contains("hidden");
      if (isOpen) {
        closeSelect();
      } else {
        openSelect();
      }
    });

    // Keyboard on trigger
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        var isOpen = !content.classList.contains("hidden");
        if (!isOpen) {
          openSelect();
        }
      }
    });

    // Arrow key navigation within items
    content.addEventListener("keydown", function (e) {
      var visibleItems = Array.from(items).filter(function (i) { return !i.hidden; });
      if (!visibleItems.length) return;
      var current = visibleItems.indexOf(document.activeElement);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        var next = current < visibleItems.length - 1 ? current + 1 : 0;
        visibleItems[next].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        var prev = current > 0 ? current - 1 : visibleItems.length - 1;
        visibleItems[prev].focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (document.activeElement.hasAttribute("data-select-item")) {
          document.activeElement.click();
        }
      }
    });

    items.forEach(function (item) {
      item.setAttribute("tabindex", "-1");
      item.addEventListener("click", function () {
        valueEl.textContent = item.textContent;
        valueEl.removeAttribute("data-placeholder");
        closeSelect();
        trigger.focus();

        // Mark selected
        items.forEach(function (i) {
          i.removeAttribute("data-selected");
          i.setAttribute("aria-selected", "false");
        });
        item.setAttribute("data-selected", "");
        item.setAttribute("aria-selected", "true");

        // Dispatch change event for form integration
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Close on outside click
document.addEventListener("click", function (e) {
  if (!e.target.closest("[data-select]")) {
    document.querySelectorAll("[data-select-content]").forEach(function (el) {
      el.classList.add("hidden");
    });
    document.querySelectorAll("[data-select-trigger]").forEach(function (el) {
      el.setAttribute("aria-expanded", "false");
    });
  }
});

// Close on Escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.querySelectorAll("[data-select]").forEach(function (select) {
      var content = select.querySelector("[data-select-content]");
      var trigger = select.querySelector("[data-select-trigger]");
      if (content && !content.classList.contains("hidden")) {
        content.classList.add("hidden");
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
      }
    });
  }
});
