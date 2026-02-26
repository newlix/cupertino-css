// Combobox — cupertino
// Searchable select dropdown

document.querySelectorAll(".combobox").forEach((combobox) => {
  const trigger = combobox.querySelector("button");
  const content = combobox.querySelector("[data-combobox-content]");
  const input = content ? content.querySelector("header input") : null;
  const listbox = content ? content.querySelector("[role='listbox']") : null;
  const valueDisplay = trigger ? trigger.querySelector("span") : null;
  const hiddenInput = combobox.querySelector("input[type='hidden']");

  if (!trigger || !content || !listbox) return;

  const options = listbox.querySelectorAll("[role='option']");
  const groups = listbox.querySelectorAll("[role='group']");

  function open() {
    combobox.setAttribute("data-open", "");
    if (input) {
      input.value = "";
      input.dispatchEvent(new Event("input"));
      requestAnimationFrame(() => input.focus());
    }
  }

  function close() {
    combobox.removeAttribute("data-open");
  }

  function isOpen() {
    return combobox.hasAttribute("data-open");
  }

  // Toggle on trigger click
  trigger.addEventListener("click", () => {
    // Close all other comboboxes
    document.querySelectorAll(".combobox[data-open]").forEach((el) => {
      if (el !== combobox) el.removeAttribute("data-open");
    });
    if (isOpen()) {
      close();
    } else {
      open();
    }
  });

  // Select an option
  options.forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.dataset.value || option.textContent.trim();
      const text = option.textContent.trim();

      // Update display
      if (valueDisplay) {
        valueDisplay.textContent = text;
        valueDisplay.removeAttribute("data-placeholder");
      }

      // Update hidden input
      if (hiddenInput) {
        hiddenInput.value = value;
      }

      // Mark selected
      options.forEach((o) => o.removeAttribute("data-selected"));
      option.setAttribute("data-selected", "");

      close();
    });
  });

  // Search filtering
  if (input) {
    input.addEventListener("input", () => {
      const query = input.value.toLowerCase().trim();
      let anyVisible = false;

      options.forEach((option) => {
        const text = (option.dataset.value || option.textContent || "").toLowerCase();
        const match = !query || text.includes(query);
        option.hidden = !match;
        if (match) anyVisible = true;
      });

      // Hide empty groups
      groups.forEach((group) => {
        const visibleOptions = group.querySelectorAll("[role='option']:not([hidden])");
        const heading = group.querySelector("[role='heading']");
        if (heading) heading.hidden = visibleOptions.length === 0;
        group.hidden = visibleOptions.length === 0;
      });

      // Toggle empty state
      if (listbox.hasAttribute("data-empty")) {
        listbox.classList.toggle("combobox-empty", !anyVisible);
      }
    });
  }
});

// Close on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest(".combobox")) {
    document.querySelectorAll(".combobox[data-open]").forEach((el) => {
      el.removeAttribute("data-open");
    });
  }
});

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".combobox[data-open]").forEach((el) => {
      el.removeAttribute("data-open");
    });
  }
});
