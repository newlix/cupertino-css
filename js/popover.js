// Popover — ciderui
function closePopover(el) {
  el.setAttribute("data-closing", "");
  setTimeout(() => {
    el.removeAttribute("data-open");
    el.removeAttribute("data-closing");
  }, 200);
}

document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-popover-trigger]");
  if (trigger) {
    const popover = trigger.closest("[data-popover]");
    const content = popover.querySelector(".popover-content");
    const isOpen = content.hasAttribute("data-open");

    // Close all other popovers
    document.querySelectorAll(".popover-content[data-open]").forEach((el) => {
      closePopover(el);
    });

    if (!isOpen) {
      content.setAttribute("data-open", "");
    }
    return;
  }

  // Close all popovers on outside click
  if (!e.target.closest(".popover-content")) {
    document.querySelectorAll(".popover-content[data-open]").forEach((el) => {
      closePopover(el);
    });
  }
});

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".popover-content[data-open]").forEach((el) => {
      closePopover(el);
    });
  }
});
