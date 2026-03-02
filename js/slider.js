// Slider — ciderui
(function () {
  function update(el) {
    var min = el.min !== "" ? Number(el.min) : 0;
    var max = el.max !== "" ? Number(el.max) : 100;
    var val = Number(el.value);
    if (Number.isNaN(min)) min = 0;
    if (Number.isNaN(max)) max = 100;
    if (Number.isNaN(val)) val = min;
    var range = max - min;
    var pct = range > 0 ? ((val - min) / range) * 100 : 0;
    el.style.setProperty("--slider-value", pct + "%");
  }

  function init() {
    document.querySelectorAll(".slider").forEach(function (el) {
      if (el._sliderInit) return;
      el._sliderInit = true;
      update(el);
      el.addEventListener("input", function () { update(el); });
      el.addEventListener("change", function () { update(el); });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.slider = { init: init, update: update };
})();
