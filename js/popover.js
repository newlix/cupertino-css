// Popover — cupertino-css
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-popover-trigger]");
  if (trigger) {
    const popover = trigger.closest("[data-popover]");
    const content = popover.querySelector(".popover-content");
    const isOpen = content.classList.contains("popover-open");

    // Close all other popovers
    document.querySelectorAll(".popover-content.popover-open").forEach((el) => {
      el.classList.remove("popover-open");
    });

    if (!isOpen) {
      content.classList.add("popover-open");
    }
    return;
  }

  // Close all popovers on outside click
  if (!e.target.closest(".popover-content")) {
    document.querySelectorAll(".popover-content.popover-open").forEach((el) => {
      el.classList.remove("popover-open");
    });
  }
});

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".popover-content.popover-open").forEach((el) => {
      el.classList.remove("popover-open");
    });
  }
});
