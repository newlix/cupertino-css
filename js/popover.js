// Popover — ciderui
function closePopover(el) {
  if (el.hasAttribute("data-closing")) return;
  el.setAttribute("data-closing", "");
  el.removeAttribute("role");
  setTimeout(() => {
    el.removeAttribute("data-open");
    el.removeAttribute("data-closing");
  }, 200);
}

document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-popover-trigger]");
  if (trigger) {
    const popover = trigger.closest("[data-popover]");
    if (!popover) return;
    const content = popover.querySelector(".popover-content");
    if (!content) return;
    const isOpen = content.hasAttribute("data-open");

    // Close all other popovers
    document.querySelectorAll(".popover-content[data-open]").forEach((el) => {
      closePopover(el);
    });

    if (!isOpen) {
      content.setAttribute("data-open", "");
      content.setAttribute("role", "dialog");
      requestAnimationFrame(() => {
        const firstFocusable = content.querySelector("button, a, input, [tabindex]:not([tabindex='-1'])");
        if (firstFocusable) firstFocusable.focus();
      });
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
