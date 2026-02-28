// Command — ciderui
// Handles search filtering in .command components

function init() {
  document.querySelectorAll(".command").forEach(function (command) {
    if (command.dataset.initialized) return;
    command.dataset.initialized = "true";
    var input = command.querySelector("header input");
    if (!input) return;

    var menu = command.querySelector("[role='menu'], [role='listbox']");
    if (!menu) return;

    var items = menu.querySelectorAll("[role='menuitem'], [role='option']");
    var groups = menu.querySelectorAll("[role='group']");
    var separators = menu.querySelectorAll("hr[role='separator'], hr");
    var emptyContainer = menu.hasAttribute("data-empty") ? menu : null;

    input.addEventListener("input", function () {
      var query = input.value.toLowerCase().trim();
      var anyVisible = false;

      // Clear stale highlight
      var prev = menu.querySelector("[data-highlighted]");
      if (prev) prev.removeAttribute("data-highlighted");

      items.forEach(function (item) {
        var text = (item.getAttribute("data-filter") || item.textContent || "").toLowerCase();
        var match = !query || text.includes(query);
        item.hidden = !match;
        if (match) anyVisible = true;
      });

      // Hide groups that have no visible items
      groups.forEach(function (group) {
        var visibleItems = group.querySelectorAll("[role='menuitem']:not([hidden]), [role='option']:not([hidden])");
        var heading = group.querySelector("[role='heading']");
        if (heading) heading.hidden = visibleItems.length === 0;
        group.hidden = visibleItems.length === 0;
      });

      // Hide separators when filtering
      separators.forEach(function (sep) {
        sep.hidden = !!query;
      });

      // Toggle empty message
      if (emptyContainer) {
        emptyContainer.classList.toggle("command-empty", !anyVisible);
      }
    });

    // Arrow key navigation
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        var visibleItems = Array.from(menu.querySelectorAll("[role='menuitem']:not([hidden]), [role='option']:not([hidden])"));
        if (!visibleItems.length) return;
        var highlighted = menu.querySelector("[data-highlighted]");
        var idx = highlighted ? visibleItems.indexOf(highlighted) : -1;
        if (e.key === "ArrowDown") idx = Math.min(idx + 1, visibleItems.length - 1);
        else idx = Math.max(idx - 1, 0);
        visibleItems.forEach(function (o) { o.removeAttribute("data-highlighted"); });
        visibleItems[idx].setAttribute("data-highlighted", "");
        visibleItems[idx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        e.preventDefault();
        var highlighted = menu.querySelector("[data-highlighted]");
        if (highlighted) highlighted.click();
      }
    });
  });

  // Close command dialogs on backdrop click (with animation)
  document.querySelectorAll(".command-dialog").forEach(function (dialog) {
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) {
        dialog.setAttribute("data-closing", "");
        setTimeout(function () {
          dialog.removeAttribute("data-closing");
          dialog.close();
        }, 120);
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Command dialog — keyboard shortcut (single listener for all dialogs)
document.addEventListener("keydown", function (e) {
  document.querySelectorAll(".command-dialog[data-shortcut]").forEach(function (dialog) {
    var parts = dialog.dataset.shortcut.toLowerCase().split("+");
    var key = parts.pop();
    var needsMeta = parts.includes("meta") || parts.includes("cmd");
    var needsCtrl = parts.includes("ctrl");
    var needsShift = parts.includes("shift");

    var metaMatch = needsMeta ? (e.metaKey || e.ctrlKey) : true;
    var ctrlMatch = needsCtrl ? e.ctrlKey : true;
    var shiftMatch = needsShift ? e.shiftKey : !e.shiftKey;

    if (metaMatch && ctrlMatch && shiftMatch && e.key.toLowerCase() === key) {
      e.preventDefault();
      if (dialog.open) {
        dialog.close();
      } else {
        dialog._previousFocus = document.activeElement;
        dialog.showModal();
        var input = dialog.querySelector("header input");
        if (input) {
          input.value = "";
          input.dispatchEvent(new Event("input"));
          input.focus();
        }
      }
    }
  });

  // Escape with animation
  if (e.key === "Escape") {
    document.querySelectorAll(".command-dialog[open]").forEach(function (dialog) {
      e.preventDefault();
      dialog.setAttribute("data-closing", "");
      setTimeout(function () {
        dialog.removeAttribute("data-closing");
        dialog.close();
        if (dialog._previousFocus) {
          dialog._previousFocus.focus();
          dialog._previousFocus = null;
        }
      }, 120);
    });
  }
});
