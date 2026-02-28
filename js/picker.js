// Picker — ciderui
// Searchable select dropdown

function init() {
  document.querySelectorAll(".picker").forEach((picker) => {
    if (picker.dataset.initialized) return;
    picker.dataset.initialized = "true";
    const trigger = picker.querySelector("button");
    const content = picker.querySelector("[data-picker-content]");
    const input = content ? content.querySelector("header input") : null;
    const listbox = content ? content.querySelector("[role='listbox']") : null;
    const valueDisplay = trigger ? trigger.querySelector("span") : null;
    const hiddenInput = picker.querySelector("input[type='hidden']");

    if (!trigger || !content || !listbox) return;

    const options = listbox.querySelectorAll("[role='option']");
    const groups = listbox.querySelectorAll("[role='group']");

    var savedValue = null;

    function open() {
      picker.setAttribute("data-open", "");
      // Store current selection for Escape restore
      var selected = listbox.querySelector("[role='option'][data-selected]");
      savedValue = selected ? selected.dataset.value || selected.textContent.trim() : null;
      if (input) {
        input.value = "";
        input.dispatchEvent(new Event("input"));
        requestAnimationFrame(() => input.focus());
      }
    }

    function close() {
      picker.removeAttribute("data-open");
      const highlighted = listbox.querySelector("[role='option'][data-highlighted]");
      if (highlighted) highlighted.removeAttribute("data-highlighted");
      savedValue = null;
    }

    function cancelAndClose() {
      picker.removeAttribute("data-open");
      const highlighted = listbox.querySelector("[role='option'][data-highlighted]");
      if (highlighted) highlighted.removeAttribute("data-highlighted");
      // Restore display if user typed but didn't select
      if (savedValue && valueDisplay) {
        var selectedOpt = listbox.querySelector("[role='option'][data-selected]");
        if (selectedOpt) {
          valueDisplay.textContent = selectedOpt.textContent.trim();
        }
      }
      savedValue = null;
      trigger.focus();
    }

    function isOpen() {
      return picker.hasAttribute("data-open");
    }

    // Toggle on trigger click
    trigger.addEventListener("click", () => {
      // Close all other pickeres
      document.querySelectorAll(".picker[data-open]").forEach((el) => {
        if (el !== picker) el.removeAttribute("data-open");
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

        // Clear stale highlight before filtering
        const prev = listbox.querySelector("[role='option'][data-highlighted]");
        if (prev) prev.removeAttribute("data-highlighted");

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
          listbox.classList.toggle("picker-empty", !anyVisible);
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
  if (!e.target.closest(".picker")) {
    document.querySelectorAll(".picker[data-open]").forEach((el) => {
      el.removeAttribute("data-open");
    });
  }
});

// Close on Escape (cancel without selecting)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".picker[data-open]").forEach((el) => {
      // Clear search input and reset filter
      var input = el.querySelector("[data-picker-content] header input");
      if (input) {
        input.value = "";
        input.dispatchEvent(new Event("input"));
      }
      el.removeAttribute("data-open");
      var highlighted = el.querySelector("[role='option'][data-highlighted]");
      if (highlighted) highlighted.removeAttribute("data-highlighted");
      var trigger = el.querySelector("button");
      if (trigger) trigger.focus();
    });
  }
});
