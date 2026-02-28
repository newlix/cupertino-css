// Combobox — ciderui
// Searchable select dropdown

function init() {
  document.querySelectorAll(".combobox").forEach((combobox) => {
    if (combobox.dataset.initialized) return;
    combobox.dataset.initialized = "true";
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

    // Keyboard navigation
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const visibleOptions = Array.from(listbox.querySelectorAll("[role='option']:not([hidden])"));
          if (!visibleOptions.length) return;
          const focused = listbox.querySelector("[role='option'][data-highlighted]");
          let idx = focused ? visibleOptions.indexOf(focused) : -1;
          if (e.key === "ArrowDown") idx = Math.min(idx + 1, visibleOptions.length - 1);
          else idx = Math.max(idx - 1, 0);
          visibleOptions.forEach((o) => o.removeAttribute("data-highlighted"));
          visibleOptions[idx].setAttribute("data-highlighted", "");
          visibleOptions[idx].scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter") {
          e.preventDefault();
          const highlighted = listbox.querySelector("[role='option'][data-highlighted]");
          if (highlighted) highlighted.click();
        }
      });
    }

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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

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
