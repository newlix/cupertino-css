// Popover — ciderui
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-popover-trigger]");
  if (trigger) {
    const popover = trigger.closest("[data-popover]");
    const content = popover.querySelector(".popover-content");
    const isOpen = content.hasAttribute("data-open");

    // Close all other popovers
    document.querySelectorAll(".popover-content[data-open]").forEach((el) => {
      el.removeAttribute("data-open");
    });

    if (!isOpen) {
      content.setAttribute("data-open", "");
    }
    return;
  }

  // Close all popovers on outside click
  if (!e.target.closest(".popover-content")) {
    document.querySelectorAll(".popover-content[data-open]").forEach((el) => {
      el.removeAttribute("data-open");
    });
  }
});

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".popover-content[data-open]").forEach((el) => {
      el.removeAttribute("data-open");
    });
  }
});
