// Stepper — ciderui
(function () {
  function setup(stepper) {
    if (stepper._stepperInit) return;
    stepper._stepperInit = true;

    let min = Number(stepper.getAttribute("data-min") || 0);
    if (Number.isNaN(min)) min = 0;
    let max = Number(stepper.getAttribute("data-max") || 100);
    if (Number.isNaN(max)) max = 100;
    let step = Number(stepper.getAttribute("data-step") || 1);
    if (Number.isNaN(step) || step <= 0) step = 1;
    let value = Number(stepper.getAttribute("data-value") || min);
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
    if (!stepper.getAttribute("role")) {
      stepper.setAttribute("role", "group");
      stepper._stepperSetRole = true;
    }
    // aria-value* belong on spinbutton (display), not the group container
    if (display) {
      display.setAttribute("role", "spinbutton");
      display.setAttribute("tabindex", "0");
      display.setAttribute("aria-valuemin", min);
      display.setAttribute("aria-valuemax", max);
      if (
        !display.getAttribute("aria-label") &&
        !display.getAttribute("aria-labelledby")
      ) {
        const lbl =
          stepper.getAttribute("aria-label") ||
          stepper.getAttribute("data-label");
        if (lbl) {
          display.setAttribute("aria-label", lbl);
          stepper._stepperSetDisplayAriaLabel = true;
        }
      }
    }
    if (decBtn && !decBtn.getAttribute("aria-label")) {
      decBtn.setAttribute("aria-label", "Decrease value");
      stepper._stepperSetDecAriaLabel = true;
    }
    if (incBtn && !incBtn.getAttribute("aria-label")) {
      incBtn.setAttribute("aria-label", "Increase value");
      stepper._stepperSetIncAriaLabel = true;
    }

    // Decimal places from step to avoid floating-point accumulation (e.g. 0.1+0.1+0.1)
    const stepDecimals = (function () {
      const s = String(step);
      const dot = s.indexOf(".");
      return dot === -1 ? 0 : s.length - dot - 1;
    })();

    function clamp(v) {
      const clamped = Math.min(max, Math.max(min, v));
      return stepDecimals > 0
        ? parseFloat(clamped.toFixed(stepDecimals))
        : clamped;
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

    stepper._stepperDecBtn = decBtn;
    stepper._stepperIncBtn = incBtn;
    stepper._stepperDisplay = display;

    if (decBtn) decBtn.addEventListener("click", stepper._stepperDecHandler);
    if (incBtn) incBtn.addEventListener("click", stepper._stepperIncHandler);

    // Spinbutton keyboard interaction (WAI-ARIA APG spinbutton pattern)
    if (display) {
      stepper._stepperKeyHandler = function (e) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          stepper._stepperIncHandler();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          stepper._stepperDecHandler();
        } else if (e.key === "Home") {
          e.preventDefault();
          value = min;
          updateUI();
          fireChange();
        } else if (e.key === "End") {
          e.preventDefault();
          value = max;
          updateUI();
          fireChange();
        }
      };
      display.addEventListener("keydown", stepper._stepperKeyHandler);
    }

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
    const display = stepper._stepperDisplay;
    if (display) {
      display.removeAttribute("role");
      display.removeAttribute("tabindex");
      display.removeAttribute("aria-valuemin");
      display.removeAttribute("aria-valuemax");
      display.removeAttribute("aria-valuenow");
      if (stepper._stepperSetDisplayAriaLabel) {
        display.removeAttribute("aria-label");
        stepper._stepperSetDisplayAriaLabel = false;
      }
      if (stepper._stepperKeyHandler)
        display.removeEventListener("keydown", stepper._stepperKeyHandler);
    }
    const decBtn = stepper._stepperDecBtn;
    const incBtn = stepper._stepperIncBtn;
    if (decBtn) {
      if (stepper._stepperDecHandler)
        decBtn.removeEventListener("click", stepper._stepperDecHandler);
      if (stepper._stepperSetDecAriaLabel) {
        decBtn.removeAttribute("aria-label");
        stepper._stepperSetDecAriaLabel = false;
      }
      decBtn.disabled = false;
    }
    if (incBtn) {
      if (stepper._stepperIncHandler)
        incBtn.removeEventListener("click", stepper._stepperIncHandler);
      if (stepper._stepperSetIncAriaLabel) {
        incBtn.removeAttribute("aria-label");
        stepper._stepperSetIncAriaLabel = false;
      }
      incBtn.disabled = false;
    }
    if (stepper._stepperSetRole) {
      stepper.removeAttribute("role");
      stepper._stepperSetRole = false;
    }
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
    stepper._stepperKeyHandler = null;
    stepper._stepperDecBtn = null;
    stepper._stepperIncBtn = null;
    stepper._stepperDisplay = null;
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
