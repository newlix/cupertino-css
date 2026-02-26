// Custom Select — cupertino-css
document.querySelectorAll("[data-select]").forEach((select) => {
  const trigger = select.querySelector("[data-select-trigger]");
  const content = select.querySelector("[data-select-content]");
  const valueEl = select.querySelector("[data-select-value]");
  const items = select.querySelectorAll("[data-select-item]");

  trigger.addEventListener("click", () => {
    const isOpen = !content.classList.contains("hidden");
    // Close all other selects
    document.querySelectorAll("[data-select-content]").forEach((el) => {
      el.classList.add("hidden");
    });
    if (!isOpen) {
      content.classList.remove("hidden");
    }
  });

  items.forEach((item) => {
    item.addEventListener("click", () => {
      valueEl.textContent = item.textContent;
      valueEl.removeAttribute("data-placeholder");
      content.classList.add("hidden");

      // Mark selected
      items.forEach((i) => i.removeAttribute("data-selected"));
      item.setAttribute("data-selected", "");
    });
  });
});

// Close on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-select]")) {
    document.querySelectorAll("[data-select-content]").forEach((el) => {
      el.classList.add("hidden");
    });
  }
});

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll("[data-select-content]").forEach((el) => {
      el.classList.add("hidden");
    });
  }
});
