// Command — ciderui
// Handles search filtering in .command components

document.querySelectorAll(".command").forEach((command) => {
  const input = command.querySelector("header input");
  if (!input) return;

  const menu = command.querySelector("[role='menu'], [role='listbox']");
  if (!menu) return;

  const items = menu.querySelectorAll("[role='menuitem'], [role='option']");
  const groups = menu.querySelectorAll("[role='group']");
  const separators = menu.querySelectorAll("hr[role='separator'], hr");
  const emptyContainer = menu.hasAttribute("data-empty") ? menu : null;

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase().trim();

    let anyVisible = false;

    items.forEach((item) => {
      const text = (item.getAttribute("data-filter") || item.textContent || "").toLowerCase();
      const match = !query || text.includes(query);
      item.hidden = !match;
      if (match) anyVisible = true;
    });

    // Hide groups that have no visible items
    groups.forEach((group) => {
      const visibleItems = group.querySelectorAll("[role='menuitem']:not([hidden]), [role='option']:not([hidden])");
      const heading = group.querySelector("[role='heading']");
      if (heading) heading.hidden = visibleItems.length === 0;
      group.hidden = visibleItems.length === 0;
    });

    // Hide separators when filtering
    separators.forEach((sep) => {
      sep.hidden = !!query;
    });

    // Toggle empty message via CSS (data-empty::after shows when no items visible)
    if (emptyContainer) {
      emptyContainer.classList.toggle("command-empty", !anyVisible);
    }
  });
});

// Command dialog — keyboard shortcut (single listener for all dialogs)
document.addEventListener("keydown", (e) => {
  document.querySelectorAll(".command-dialog[data-shortcut]").forEach((dialog) => {
    const parts = dialog.dataset.shortcut.toLowerCase().split("+");
    const key = parts.pop();
    const needsMeta = parts.includes("meta") || parts.includes("cmd");
    const needsCtrl = parts.includes("ctrl");

    const metaMatch = needsMeta ? (e.metaKey || e.ctrlKey) : true;
    const ctrlMatch = needsCtrl ? e.ctrlKey : true;

    if (metaMatch && ctrlMatch && e.key.toLowerCase() === key) {
      e.preventDefault();
      if (dialog.open) {
        dialog.close();
      } else {
        dialog.showModal();
        const input = dialog.querySelector("header input");
        if (input) {
          input.value = "";
          input.dispatchEvent(new Event("input"));
          input.focus();
        }
      }
    }
  });
});

// Close command dialogs on backdrop click
document.querySelectorAll(".command-dialog").forEach((dialog) => {
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });
});
