// Context Menu — ciderui
// Right-click triggered menu, reuses dropdown-menu styling.
document.addEventListener("contextmenu", (e) => {
  const trigger = e.target.closest(".context-menu-trigger");
  if (!trigger) return;

  e.preventDefault();

  // Close all context menus first
  document.querySelectorAll(".context-menu-content[data-open]").forEach((el) => {
    el.removeAttribute("data-open");
  });

  const menu = trigger.querySelector(".context-menu-content") ||
               trigger.nextElementSibling;
  if (!menu || !menu.classList.contains("context-menu-content")) return;

  // Position at cursor
  menu.style.left = e.clientX + "px";
  menu.style.top = e.clientY + "px";
  menu.setAttribute("data-open", "");

  // Adjust if overflowing viewport
  requestAnimationFrame(() => {
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = (e.clientX - rect.width) + "px";
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = (e.clientY - rect.height) + "px";
    }
  });
});

// Close on click anywhere
document.addEventListener("click", () => {
  document.querySelectorAll(".context-menu-content[data-open]").forEach((el) => {
    el.removeAttribute("data-open");
  });
});

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".context-menu-content[data-open]").forEach((el) => {
      el.removeAttribute("data-open");
    });
  }
});
