// Context Menu — ciderui
// Right-click triggered menu, reuses dropdown-menu styling.
function closeContextMenu(el) {
  el.setAttribute("data-closing", "");
  setTimeout(() => {
    el.removeAttribute("data-open");
    el.removeAttribute("data-closing");
  }, 120);
}

document.addEventListener("contextmenu", (e) => {
  const trigger = e.target.closest(".context-menu-trigger");
  if (!trigger) return;

  e.preventDefault();

  // Close all context menus first (instant close for re-open at new position)
  document.querySelectorAll(".context-menu-content[data-open]").forEach((el) => {
    el.removeAttribute("data-closing");
    el.removeAttribute("data-open");
    el.style.display = "";
  });

  const menu = trigger.querySelector(".context-menu-content") ||
               trigger.nextElementSibling;
  if (!menu || !menu.classList.contains("context-menu-content")) return;

  // Position at cursor
  menu.style.left = e.clientX + "px";
  menu.style.top = e.clientY + "px";
  menu.setAttribute("data-open", "");
  menu.setAttribute("role", "menu");

  // Focus first item
  requestAnimationFrame(() => {
    const firstItem = menu.querySelector("button, a");
    if (firstItem) firstItem.focus();
  });

  // Adjust if overflowing viewport
  requestAnimationFrame(() => {
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = Math.max(8, e.clientX - rect.width) + "px";
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = Math.max(8, e.clientY - rect.height) + "px";
    }
  });
});

// Close on click outside menu
document.addEventListener("click", (e) => {
  document.querySelectorAll(".context-menu-content[data-open]").forEach((el) => {
    if (!el.contains(e.target)) {
      closeContextMenu(el);
    }
  });
});

// Close on Escape + arrow key navigation
document.addEventListener("keydown", (e) => {
  const openMenu = document.querySelector(".context-menu-content[data-open]");
  if (!openMenu) return;

  if (e.key === "Escape") {
    closeContextMenu(openMenu);
    return;
  }

  const items = Array.from(openMenu.querySelectorAll("button, a")).filter(
    (el) => !el.disabled && el.offsetParent !== null
  );
  if (!items.length) return;
  const current = items.indexOf(document.activeElement);

  if (e.key === "ArrowDown") {
    e.preventDefault();
    const next = current < items.length - 1 ? current + 1 : 0;
    items[next].focus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const prev = current > 0 ? current - 1 : items.length - 1;
    items[prev].focus();
  }
});
