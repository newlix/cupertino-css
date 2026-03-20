// Picker — ciderui
(function () {
  function getItemHeight(picker) {
    return (
      parseFloat(
        getComputedStyle(picker).getPropertyValue("--picker-item-h"),
      ) || 40
    );
  }

  function scrollToIndex(column, index, smooth) {
    const pickerEl = column.closest(".picker");
    if (!pickerEl) return;
    const itemH = getItemHeight(pickerEl);
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    column.scrollTo({
      top: index * itemH,
      behavior: smooth && !prefersReduced ? "smooth" : "instant",
    });
  }

  function selectIndex(column, index, picker, colIndex, silent) {
    const items = column.children;
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    for (let i = 0; i < items.length; i++) {
      items[i].removeAttribute("data-selected");
      items[i].setAttribute("aria-selected", "false");
    }
    if (items[clamped]) {
      items[clamped].setAttribute("data-selected", "");
      items[clamped].setAttribute("aria-selected", "true");
      if (!items[clamped].id) {
        items[clamped].id = `picker-opt-${colIndex}-${clamped}`;
      }
      column.setAttribute("aria-activedescendant", items[clamped].id);
    }
    if (!silent) {
      picker.dispatchEvent(
        new CustomEvent("change", {
          bubbles: true,
          detail: {
            column: colIndex,
            value: items[clamped] ? items[clamped].textContent : "",
            index: clamped,
          },
        }),
      );
    }
  }

  function setupColumn(column, colIndex, picker) {
    const itemH = getItemHeight(picker);
    const items = column.children;

    // ARIA: make column keyboard-focusable with listbox semantics
    if (!column.hasAttribute("tabindex")) column.setAttribute("tabindex", "0");
    column.setAttribute("role", "listbox");
    if (!column.getAttribute("aria-label"))
      column.setAttribute("aria-label", `Column ${colIndex + 1}`);
    for (let i = 0; i < items.length; i++)
      items[i].setAttribute("role", "option");

    // Determine initial value from data-value on the column
    const initialValue = column.getAttribute("data-value");
    let initialIndex = 0;
    if (initialValue) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].textContent.trim() === initialValue.trim()) {
          initialIndex = i;
          break;
        }
      }
    }

    // Scroll to initial position without animation
    scrollToIndex(column, initialIndex, false);
    selectIndex(column, initialIndex, picker, colIndex, true);

    // scrollend event with fallback debounce
    const supportsScrollEnd = "onscrollend" in window;

    function onScrollSettle() {
      const idx = Math.round(column.scrollTop / getItemHeight(picker));
      scrollToIndex(column, idx, false);
      selectIndex(column, idx, picker, colIndex);
    }

    if (supportsScrollEnd) {
      column._pickerScrollEnd = onScrollSettle;
      column.addEventListener("scrollend", onScrollSettle);
    }

    column._pickerScroll = function () {
      if (!supportsScrollEnd) {
        clearTimeout(column._pickerTimer);
        column._pickerTimer = setTimeout(onScrollSettle, 100);
      }
    };
    column.addEventListener("scroll", column._pickerScroll, { passive: true });

    // Mouse drag-to-scroll (desktop: emulate touch drag behaviour)
    let dragY = 0;
    let dragScrollTop = 0;
    let dragging = false;
    let activePointerId = null;

    function onMouseDown(e) {
      if (e.button !== 0 || e.pointerType !== "mouse") return;
      dragging = true;
      dragY = e.clientY;
      dragScrollTop = column.scrollTop;
      activePointerId = e.pointerId;
      column.setPointerCapture(e.pointerId);
      column.style.scrollSnapType = "none";
    }

    function onMouseMove(e) {
      if (!dragging) return;
      column.scrollTop = dragScrollTop - (e.clientY - dragY);
    }

    function onMouseUp() {
      if (!dragging) return;
      dragging = false;
      if (activePointerId !== null) {
        try {
          column.releasePointerCapture(activePointerId);
        } catch {}
        activePointerId = null;
      }
      column.style.scrollSnapType = "";
      // Snap to nearest item and update selection
      const idx = Math.round(column.scrollTop / getItemHeight(picker));
      scrollToIndex(column, idx, true);
      selectIndex(column, idx, picker, colIndex);
    }

    column._pickerPointerDown = onMouseDown;
    column._pickerPointerMove = onMouseMove;
    column._pickerPointerUp = onMouseUp;
    column.addEventListener("pointerdown", onMouseDown);
    column.addEventListener("pointermove", onMouseMove);
    column.addEventListener("pointerup", onMouseUp);
    column.addEventListener("pointercancel", onMouseUp);

    // Keyboard navigation
    function onKeyDown(e) {
      const currentIdx = Math.round(column.scrollTop / getItemHeight(picker));
      let newIdx = currentIdx;
      if (e.key === "ArrowDown") {
        newIdx = Math.min(currentIdx + 1, items.length - 1);
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        newIdx = Math.max(currentIdx - 1, 0);
        e.preventDefault();
      } else if (e.key === "Home") {
        newIdx = 0;
        e.preventDefault();
      } else if (e.key === "End") {
        newIdx = items.length - 1;
        e.preventDefault();
      } else {
        return;
      }
      scrollToIndex(column, newIdx, false); // instant: avoids scrollend race with rapid keypress
      selectIndex(column, newIdx, picker, colIndex);
    }
    column._pickerKeyDown = onKeyDown;
    column.addEventListener("keydown", onKeyDown);
  }

  function setupPicker(picker) {
    if (picker._pickerInit) return;
    const columns = picker.querySelectorAll(".picker-column");
    if (!columns.length) return;
    picker._pickerInit = true;
    columns.forEach(function (col, i) {
      setupColumn(col, i, picker);
    });
  }

  function init() {
    document.querySelectorAll("[data-picker]").forEach(setupPicker);
  }

  function destroy(picker) {
    if (!picker._pickerInit) return;
    picker.querySelectorAll(".picker-column").forEach(function (col) {
      if (col._pickerScrollEnd) {
        col.removeEventListener("scrollend", col._pickerScrollEnd);
        col._pickerScrollEnd = null;
      }
      if (col._pickerScroll) {
        col.removeEventListener("scroll", col._pickerScroll);
        col._pickerScroll = null;
      }
      if (col._pickerPointerDown) {
        col.removeEventListener("pointerdown", col._pickerPointerDown);
        col.removeEventListener("pointermove", col._pickerPointerMove);
        col.removeEventListener("pointerup", col._pickerPointerUp);
        col.removeEventListener("pointercancel", col._pickerPointerUp);
        col._pickerPointerDown = null;
        col._pickerPointerMove = null;
        col._pickerPointerUp = null;
      }
      if (col._pickerKeyDown) {
        col.removeEventListener("keydown", col._pickerKeyDown);
        col._pickerKeyDown = null;
      }
      clearTimeout(col._pickerTimer);
      col._pickerTimer = null;
      col.removeAttribute("role");
      col.removeAttribute("tabindex");
      col.removeAttribute("aria-label");
      col.removeAttribute("aria-activedescendant");
      Array.from(col.children).forEach((item) => {
        item.removeAttribute("role");
        item.removeAttribute("aria-selected");
        item.removeAttribute("data-selected");
        if (item.id && item.id.startsWith("picker-opt-")) {
          item.removeAttribute("id");
        }
      });
    });
    picker._pickerInit = false;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", (evt) => {
    const el = evt.detail?.elt;
    if (!el) return;
    if (el.hasAttribute?.("data-picker")) {
      destroy(el);
      return;
    }
    (el.querySelectorAll?.("[data-picker]") || []).forEach(destroy);
  });

  window.CiderUI = window.CiderUI || {};
  window.CiderUI.picker = { init, destroy };
})();
