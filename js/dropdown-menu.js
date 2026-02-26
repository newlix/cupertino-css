// Dropdown Menu — cupertino-css
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-dropdown-trigger]");
  if (trigger) {
    const dropdown = trigger.closest("[data-dropdown]");
    const content = dropdown.querySelector("[data-dropdown-content]");
    const isOpen = !content.classList.contains("hidden");

    // Close all other dropdowns
    document.querySelectorAll("[data-dropdown-content]").forEach((el) => {
      el.classList.add("hidden");
    });

    if (!isOpen) {
      content.classList.remove("hidden");
    }
    return;
  }

  // Close if clicking an item inside the dropdown
  if (e.target.closest("[data-dropdown-content] button")) {
    e.target.closest("[data-dropdown-content]").classList.add("hidden");
    return;
  }

  // Close all dropdowns on outside click
  document.querySelectorAll("[data-dropdown-content]").forEach((el) => {
    el.classList.add("hidden");
  });
});

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll("[data-dropdown-content]").forEach((el) => {
      el.classList.add("hidden");
    });
  }
});
