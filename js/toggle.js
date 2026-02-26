// Toggle — cupertino-css
document.addEventListener("click", (e) => {
  const toggle = e.target.closest(".toggle");
  if (!toggle || toggle.disabled) return;

  // If inside a toggle-group, handle single-select
  const group = toggle.closest(".toggle-group");
  if (group && !group.hasAttribute("data-multiple")) {
    group.querySelectorAll(".toggle").forEach((t) => {
      t.removeAttribute("data-active");
      t.setAttribute("aria-pressed", "false");
    });
    toggle.setAttribute("data-active", "");
    toggle.setAttribute("aria-pressed", "true");
  } else {
    // Standalone toggle or multi-select group
    const isActive = toggle.hasAttribute("data-active");
    if (isActive) {
      toggle.removeAttribute("data-active");
      toggle.setAttribute("aria-pressed", "false");
    } else {
      toggle.setAttribute("data-active", "");
      toggle.setAttribute("aria-pressed", "true");
    }
  }
});
