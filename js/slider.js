// Slider — ciderui
(function () {
  function update(el) {
    let min = el.min !== "" ? Number(el.min) : 0;
    let max = el.max !== "" ? Number(el.max) : 100;
    let val = Number(el.value);
    if (Number.isNaN(min)) min = 0;
    if (Number.isNaN(max)) max = 100;
    if (Number.isNaN(val)) val = min;
    const range = max - min;
    const pct = range > 0 ? ((val - min) / range) * 100 : 0;
    el.style.setProperty("--slider-value", `${pct}%`);
  }

  function init() {
    document.querySelectorAll(".slider").forEach((el) => {
      if (el._sliderInit) return;
      el._sliderInit = true;
      update(el);
      el._sliderInputHandler = () => { update(el); };
      el.addEventListener("input", el._sliderInputHandler);
      // Intercept .value property setter so programmatic el.value = x updates the fill
      const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
      if (desc && desc.get && desc.set) {
        Object.defineProperty(el, "value", {
          get() { return desc.get.call(this); },
          set(v) { desc.set.call(this, v); update(this); },
          configurable: true,
        });
      }
      // Sync when value/min/max attributes change via setAttribute()
      if (el._sliderObserver) el._sliderObserver.disconnect();
      const mo = new MutationObserver(() => {
        if (!el.isConnected) { mo.disconnect(); el._sliderInit = false; return; }
        update(el);
      });
      el._sliderObserver = mo;
      mo.observe(el, { attributes: true, attributeFilter: ["value", "min", "max"] });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", (evt) => {
    const el = evt.detail && evt.detail.elt;
    if (el && el.classList && el.classList.contains("slider")) destroy(el);
  });
  function destroy(el) {
    if (!el._sliderInit) return;
    if (el._sliderObserver) { el._sliderObserver.disconnect(); el._sliderObserver = null; }
    if (el._sliderInputHandler) { el.removeEventListener("input", el._sliderInputHandler); el._sliderInputHandler = null; }
    delete el.value;
    el._sliderInit = false;
  }

  window.CiderUI = window.CiderUI || {};
  window.CiderUI.slider = { init, update, destroy };
})();
