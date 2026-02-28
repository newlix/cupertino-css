// Dropdown Menu — ciderui
function closeDropdown(el) {
  if (el.hasAttribute("data-closing")) return;
  el.setAttribute("data-closing", "");
  setTimeout(() => {
    el.removeAttribute("data-open");
    el.removeAttribute("data-closing");
  }, 120);
}

document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-dropdown-trigger]");
  if (trigger) {
    const dropdown = trigger.closest("[data-dropdown]");
    const content = dropdown.querySelector("[data-dropdown-content]");
    const isOpen = content.hasAttribute("data-open");

    // Close all other dropdowns
    document.querySelectorAll("[data-dropdown-content][data-open]").forEach((el) => {
      closeDropdown(el);
    });

    if (!isOpen) {
      content.setAttribute("data-open", "");
    }
    return;
  }

  // Close if clicking an item inside the dropdown
  if (e.target.closest("[data-dropdown-content] button")) {
    closeDropdown(e.target.closest("[data-dropdown-content]"));
    return;
  }

  // Close all dropdowns on outside click
  document.querySelectorAll("[data-dropdown-content][data-open]").forEach((el) => {
    closeDropdown(el);
  });
});

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll("[data-dropdown-content][data-open]").forEach((el) => {
      closeDropdown(el);
    });
  }
});
