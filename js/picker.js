// Picker — ciderui
(function () {
  function getItemHeight(picker) {
    return parseFloat(getComputedStyle(picker).getPropertyValue("--picker-item-h")) || 40;
  }

  function scrollToIndex(column, index, smooth) {
    var itemH = getItemHeight(column.closest(".picker"));
    column.scrollTo({ top: index * itemH, behavior: smooth ? "smooth" : "instant" });
  }

  function selectIndex(column, index, picker, colIndex) {
    var items = column.querySelectorAll(".picker-item");
    var clamped = Math.max(0, Math.min(index, items.length - 1));
    items.forEach(function (item) { item.removeAttribute("data-selected"); });
    if (items[clamped]) {
      items[clamped].setAttribute("data-selected", "");
    }
    picker.dispatchEvent(new CustomEvent("change", {
      bubbles: true,
      detail: {
        column: colIndex,
        value: items[clamped] ? items[clamped].textContent : "",
        index: clamped
      }
    }));
  }

  function setupColumn(column, colIndex, picker) {
    var itemH = getItemHeight(picker);
    var items = column.querySelectorAll(".picker-item");

    // Determine initial value from data-value on the column
    var initialValue = column.getAttribute("data-value");
    var initialIndex = 0;
    if (initialValue) {
      for (var i = 0; i < items.length; i++) {
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
    var scrollTimer = null;
    var supportsScrollEnd = "onscrollend" in window;

    function onScrollSettle() {
      var idx = Math.round(column.scrollTop / itemH);
      selectIndex(column, idx, picker, colIndex);
    }

    if (supportsScrollEnd) {
      column._pickerScrollEnd = onScrollSettle;
      column.addEventListener("scrollend", onScrollSettle);
    }

    column._pickerScroll = function () {
      if (!supportsScrollEnd) {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(onScrollSettle, 100);
      }
    };
    column.addEventListener("scroll", column._pickerScroll, { passive: true });

    column._pickerScrollTimer = function () { return scrollTimer; };
    column._pickerClearTimer = function () { clearTimeout(scrollTimer); };
  }

  function setupPicker(picker) {
    if (picker._pickerInit) return;
    picker._pickerInit = true;
    var columns = picker.querySelectorAll(".picker-column");
    columns.forEach(function (col, i) {
      setupColumn(col, i, picker);
    });
  }

  function init() {
    document.querySelectorAll("[data-picker]").forEach(setupPicker);
  }

  function destroy(picker) {
    if (!picker._pickerInit) return;
    var columns = picker.querySelectorAll(".picker-column");
    columns.forEach(function (col) {
      if (col._pickerScrollEnd) {
        col.removeEventListener("scrollend", col._pickerScrollEnd);
        col._pickerScrollEnd = null;
      }
      if (col._pickerScroll) {
        col.removeEventListener("scroll", col._pickerScroll);
        col._pickerScroll = null;
      }
      if (col._pickerClearTimer) {
        col._pickerClearTimer();
        col._pickerClearTimer = null;
        col._pickerScrollTimer = null;
      }
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
    var el = evt.detail?.elt;
    if (!el) return;
    if (el.hasAttribute?.("data-picker")) { destroy(el); return; }
    (el.querySelectorAll?.("[data-picker]") || []).forEach(destroy);
  });

  window.CiderUI = window.CiderUI || {};
  window.CiderUI.picker = { init: init, destroy: destroy };
})();
