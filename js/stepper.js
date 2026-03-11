// Stepper — ciderui
(function () {
  function setup(stepper) {
    if (stepper._stepperInit) return;
    stepper._stepperInit = true;

    let min = Number(stepper.getAttribute("data-min") ?? 0);
    if (Number.isNaN(min)) min = 0;
    let max = Number(stepper.getAttribute("data-max") ?? 100);
    if (Number.isNaN(max)) max = 100;
    let step = Number(stepper.getAttribute("data-step") ?? 1);
    if (Number.isNaN(step)) step = 1;
    let value = Number(stepper.getAttribute("data-value") ?? min);
    if (Number.isNaN(value)) value = min;

    const decBtn = stepper.querySelector("[data-stepper-decrement]");
    const incBtn = stepper.querySelector("[data-stepper-increment]");
    const display =
      stepper.querySelector("[data-stepper-value]") ||
      stepper.querySelector("output");
    const forId = stepper.getAttribute("data-for");
    const linked = forId ? document.getElementById(forId) : null;

    // Sync initial value from linked input if present
    if (linked && linked.value !== "") {
      const n = Number(linked.value);
      if (!Number.isNaN(n)) value = n;
    }

    // ARIA attributes for assistive technology
    if (!stepper.getAttribute("role")) stepper.setAttribute("role", "group");
    // aria-value* belong on spinbutton (display), not the group container
    if (display) {
      display.setAttribute("role", "spinbutton");
      display.setAttribute("aria-valuemin", min);
      display.setAttribute("aria-valuemax", max);
    }
    if (decBtn && !decBtn.getAttribute("aria-label"))
      decBtn.setAttribute("aria-label", "Decrease value");
    if (incBtn && !incBtn.getAttribute("aria-label"))
      incBtn.setAttribute("aria-label", "Increase value");

    function clamp(v) {
      return Math.min(max, Math.max(min, v));
    }

    function updateUI() {
      value = clamp(value);
      if (display) {
        display.setAttribute("aria-valuenow", value);
        display.textContent = value;
      }
      if (linked) linked.value = value;
      stepper.setAttribute("data-value", value);

      if (decBtn) decBtn.disabled = value <= min;
      if (incBtn) incBtn.disabled = value >= max;
    }

    function fireChange() {
      stepper.dispatchEvent(
        new CustomEvent("change", { detail: { value }, bubbles: true }),
      );
    }

    stepper._stepperDecHandler = function () {
      value = clamp(value - step);
      updateUI();
      fireChange();
    };

    stepper._stepperIncHandler = function () {
      value = clamp(value + step);
      updateUI();
      fireChange();
    };

    if (decBtn) decBtn.addEventListener("click", stepper._stepperDecHandler);
    if (incBtn) incBtn.addEventListener("click", stepper._stepperIncHandler);

    // Listen for external changes on the linked input
    if (linked) {
      stepper._stepperLinkedHandler = function () {
        const n = Number(linked.value);
        value = clamp(Number.isNaN(n) ? min : n);
        updateUI();
      };
      linked.addEventListener("input", stepper._stepperLinkedHandler);
      stepper._stepperLinkedEl = linked;
    }

    updateUI();
  }

  function destroy(stepper) {
    if (!stepper._stepperInit) return;
    const display =
      stepper.querySelector("[data-stepper-value]") ||
      stepper.querySelector("output");
    if (display) {
      display.removeAttribute("role");
      display.removeAttribute("aria-valuemin");
      display.removeAttribute("aria-valuemax");
      display.removeAttribute("aria-valuenow");
    }
    const decBtn = stepper.querySelector("[data-stepper-decrement]");
    const incBtn = stepper.querySelector("[data-stepper-increment]");
    if (decBtn && stepper._stepperDecHandler)
      decBtn.removeEventListener("click", stepper._stepperDecHandler);
    if (incBtn && stepper._stepperIncHandler)
      incBtn.removeEventListener("click", stepper._stepperIncHandler);
    if (stepper._stepperLinkedEl && stepper._stepperLinkedHandler) {
      stepper._stepperLinkedEl.removeEventListener(
        "input",
        stepper._stepperLinkedHandler,
      );
    }
    stepper._stepperDecHandler = null;
    stepper._stepperIncHandler = null;
    stepper._stepperLinkedHandler = null;
    stepper._stepperLinkedEl = null;
    stepper._stepperInit = false;
  }

  function init() {
    document.querySelectorAll("[data-stepper]").forEach(setup);
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
    if (el.hasAttribute?.("data-stepper")) {
      destroy(el);
      return;
    }
    (el.querySelectorAll?.("[data-stepper]") || []).forEach(destroy);
  });

  window.CiderUI = window.CiderUI || {};
  window.CiderUI.stepper = { init, destroy };
})();
