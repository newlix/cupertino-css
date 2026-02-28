// Dropdown Menu — ciderui
function closeDropdown(el) {
  if (el._closeTimer) clearTimeout(el._closeTimer);
  el.setAttribute("data-closing", "");
  el._closeTimer = setTimeout(function () {
    el.removeAttribute("data-open");
    el.removeAttribute("data-closing");
  }, 120);
}

document.addEventListener("click", function (e) {
  var trigger = e.target.closest("[data-dropdown-trigger]");
  if (trigger) {
    var dropdown = trigger.closest("[data-dropdown]");
    var content = dropdown.querySelector("[data-dropdown-content]");
    var isOpen = content.hasAttribute("data-open");

    // Close all other dropdowns
    document.querySelectorAll("[data-dropdown-content][data-open]").forEach(function (el) {
      closeDropdown(el);
    });

    if (!isOpen) {
      content.setAttribute("data-open", "");
      trigger.setAttribute("aria-expanded", "true");
      content.setAttribute("role", "menu");

      // Focus first item
      requestAnimationFrame(function () {
        var firstItem = content.querySelector("button, a");
        if (firstItem) firstItem.focus();
      });
    } else {
      trigger.setAttribute("aria-expanded", "false");
    }
    return;
  }

  // Close if clicking an item inside the dropdown
  if (e.target.closest("[data-dropdown-content] button")) {
    var content = e.target.closest("[data-dropdown-content]");
    closeDropdown(content);
    // Restore focus to trigger
    var dropdown = content.closest("[data-dropdown]");
    var trigger = dropdown ? dropdown.querySelector("[data-dropdown-trigger]") : null;
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
    }
    return;
  }

  // Close all dropdowns on outside click
  document.querySelectorAll("[data-dropdown-content][data-open]").forEach(function (el) {
    closeDropdown(el);
    var dropdown = el.closest("[data-dropdown]");
    var trigger = dropdown ? dropdown.querySelector("[data-dropdown-trigger]") : null;
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }
  });
});

// ARIA setup on init
(function () {
  document.querySelectorAll("[data-dropdown-trigger]").forEach(function (trigger) {
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
  });
})();

// Close on Escape + arrow key navigation
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.querySelectorAll("[data-dropdown-content][data-open]").forEach(function (el) {
      closeDropdown(el);
      var dropdown = el.closest("[data-dropdown]");
      var trigger = dropdown ? dropdown.querySelector("[data-dropdown-trigger]") : null;
      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
      }
    });
    return;
  }

  // Arrow key navigation within open menus
  var openMenu = document.querySelector("[data-dropdown-content][data-open]");
  if (!openMenu) return;

  var menuItems = Array.from(openMenu.querySelectorAll("button, a")).filter(function (el) {
    return !el.disabled && el.offsetParent !== null;
  });
  if (!menuItems.length) return;
  var current = menuItems.indexOf(document.activeElement);

  if (e.key === "ArrowDown") {
    e.preventDefault();
    var next = current < menuItems.length - 1 ? current + 1 : 0;
    menuItems[next].focus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    var prev = current > 0 ? current - 1 : menuItems.length - 1;
    menuItems[prev].focus();
  }
});
