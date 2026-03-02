// Slider — ciderui
(function () {
  function update(el) {
    var min = Number(el.min) || 0;
    var max = Number(el.max) || 100;
    var val = Number(el.value);
    var pct = ((val - min) / (max - min)) * 100;
    el.style.setProperty("--slider-value", pct + "%");
  }

  function init() {
    document.querySelectorAll(".slider").forEach(function (el) {
      if (el._sliderInit) return;
      el._sliderInit = true;
      update(el);
      el.addEventListener("input", function () { update(el); });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.slider = { init: init };
})();
