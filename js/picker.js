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
    const itemH = getItemHeight(column.closest(".picker"));
    column.scrollTo({
      top: index * itemH,
      behavior: smooth ? "smooth" : "instant",
    });
  }

  function selectIndex(column, index, picker, colIndex) {
    const items = column.children;
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    for (let i = 0; i < items.length; i++)
      items[i].removeAttribute("data-selected");
    if (items[clamped]) {
      items[clamped].setAttribute("data-selected", "");
    }
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

  function setupColumn(column, colIndex, picker) {
    const itemH = getItemHeight(picker);
    const items = column.children;

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
    selectIndex(column, initialIndex, picker, colIndex);

    // scrollend event with fallback debounce
    const supportsScrollEnd = "onscrollend" in window;

    function onScrollSettle() {
      const idx = Math.round(column.scrollTop / itemH);
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

    function onMouseDown(e) {
      if (e.button !== 0 || e.pointerType === "touch") return;
      dragging = true;
      dragY = e.clientY;
      dragScrollTop = column.scrollTop;
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
      column.style.scrollSnapType = "";
      // Snap to nearest item
      const idx = Math.round(column.scrollTop / itemH);
      scrollToIndex(column, idx, true);
    }

    column._pickerPointerDown = onMouseDown;
    column._pickerPointerMove = onMouseMove;
    column._pickerPointerUp = onMouseUp;
    column.addEventListener("pointerdown", onMouseDown);
    column.addEventListener("pointermove", onMouseMove);
    column.addEventListener("pointerup", onMouseUp);
    column.addEventListener("pointercancel", onMouseUp);
  }

  function setupPicker(picker) {
    if (picker._pickerInit) return;
    picker._pickerInit = true;
    const columns = picker.querySelectorAll(".picker-column");
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
      clearTimeout(col._pickerTimer);
      col._pickerTimer = null;
    });
    picker._pickerInit = false;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", function (evt) {
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
