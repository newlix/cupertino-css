// Verification Code — ciderui
// Auto-advance, backspace, paste for verification code inputs.
(function () {
  function init() {
    document.querySelectorAll(".verification-code").forEach((otp) => {
      if (otp._vcInit) return;
      const inputs = otp.querySelectorAll('input:not([type="hidden"])');
      if (!inputs.length) return;
      otp._vcInit = true;
      inputs.forEach((input, idx) => {
        input.maxLength = 1;
        input.setAttribute("inputmode", "numeric");
        input.setAttribute("pattern", "[0-9]*");
        if (!input.getAttribute("autocomplete")) {
          input.setAttribute("autocomplete", idx === 0 ? "one-time-code" : "off");
        }
        if (!input.getAttribute("aria-label")) {
          input.setAttribute("aria-label", `Digit ${idx + 1} of ${inputs.length}`);
        }
      });
      if (!otp.getAttribute("role")) otp.setAttribute("role", "group");
      if (!otp.getAttribute("aria-label")) otp.setAttribute("aria-label", "Verification code");
      const describedBy = otp.getAttribute("aria-describedby");
      if (describedBy) {
        const errorEl = document.getElementById(describedBy);
        if (errorEl && !errorEl.getAttribute("aria-live")) {
          errorEl.setAttribute("aria-live", "polite");
        }
      }

      let hidden = otp.querySelector("input[type=hidden]");
      if (!hidden) {
        hidden = document.createElement("input");
        hidden.type = "hidden";
        hidden.name = otp.dataset.name || "code";
        otp.appendChild(hidden);
        otp._vcCreatedHidden = true;
      }

      function clearError() {
        if (otp.hasAttribute("data-error")) {
          otp.removeAttribute("data-error");
          inputs.forEach((inp) => inp.removeAttribute("aria-invalid"));
        }
      }

      function fillFrom(startIdx, chars) {
        const clean = String(chars).replace(/\D/g, "");
        for (let k = startIdx; k < inputs.length; k++) inputs[k].value = "";
        for (let j = 0; j < clean.length && startIdx + j < inputs.length; j++) {
          inputs[startIdx + j].value = clean[j];
        }
      }

      function sync(silent) {
        const newVal = Array.from(inputs).map((inp) => inp.value).join("");
        if (hidden.value !== newVal) {
          hidden.value = newVal;
          hidden.dispatchEvent(new Event("input", { bubbles: true }));
          if (!silent) {
            hidden.dispatchEvent(new Event("change", { bubbles: true }));
            if (newVal.length === inputs.length) {
              otp.dispatchEvent(new CustomEvent("complete", { detail: { code: newVal }, bubbles: true }));
            }
          }
        }
      }

      let pasting = false;
      const ac = new AbortController();
      otp._vcAbort = ac;

      const sig = { signal: ac.signal };
      inputs.forEach((input, i) => {
        input.addEventListener("beforeinput", (e) => {
          if (e.inputType === "insertText" && e.data && /\D/.test(e.data)) {
            e.preventDefault();
          }
        }, sig);
        input.addEventListener("input", () => {
          clearError();
          const v = input.value.replace(/\D/g, "");
          // Handle browser autofill distributing multiple characters into a single input
          if (v.length > 1 && !pasting) {
            pasting = true;
            try {
              fillFrom(i, v);
            } finally {
              pasting = false;
            }
            sync();
            const nextIdx = Math.min(i + v.length, inputs.length - 1);
            inputs[nextIdx].focus();
            return;
          }
          input.value = v.slice(-1);
          if (!pasting) {
            sync();
            if (v && i < inputs.length - 1) inputs[i + 1].focus();
          }
        }, sig);

        input.addEventListener("keydown", (e) => {
          if (e.key === "Backspace") clearError();
          if (e.key === "Backspace" && !input.value && i > 0) {
            e.preventDefault();
            inputs[i - 1].value = "";
            inputs[i - 1].focus();
            sync(true);
          }
          if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); inputs[i - 1].focus(); }
          if (e.key === "ArrowRight" && i < inputs.length - 1) { e.preventDefault(); inputs[i + 1].focus(); }
          if (e.key === "Home") { e.preventDefault(); inputs[0].focus(); }
          if (e.key === "End") { e.preventDefault(); inputs[inputs.length - 1].focus(); }
        }, sig);

        input.addEventListener("paste", (e) => {
          e.preventDefault();
          const text = (e.clipboardData?.getData("text") || "").replace(/\D/g, "");
          if (!text) return;
          pasting = true;
          const startIdx = text.length >= inputs.length ? 0 : i;
          try {
            fillFrom(startIdx, text);
          } finally {
            pasting = false;
          }
          sync();
          const nextIdx = startIdx + text.length;
          const firstEmpty = Array.from(inputs).findIndex((inp, idx) => idx >= startIdx && !inp.value);
          inputs[firstEmpty >= 0 ? firstEmpty : Math.min(nextIdx, inputs.length - 1)].focus();
        }, sig);

        input.addEventListener("focus", () => {
          requestAnimationFrame(() => {
            if (document.activeElement === input) input.select();
          });
        }, sig);
      });

      // Sync aria-invalid with data-error attribute
      if (otp.hasAttribute("data-error")) {
        inputs.forEach((inp) => inp.setAttribute("aria-invalid", "true"));
      }
      const errorObserver = new MutationObserver(() => {
        if (!otp.isConnected) { errorObserver.disconnect(); return; }
        const hasError = otp.hasAttribute("data-error");
        inputs.forEach((inp) => {
          if (hasError) inp.setAttribute("aria-invalid", "true");
          else inp.removeAttribute("aria-invalid");
        });
      });
      errorObserver.observe(otp, { attributes: true, attributeFilter: ["data-error"] });
      otp._errorObserver = errorObserver;

      otp.addEventListener("click", (e) => {
        if (e.target.closest('input:not([type="hidden"])')) return;
        if (inputs[0].disabled || inputs[0].getAttribute("aria-disabled") === "true") return;
        const firstEmpty = Array.from(inputs).findIndex((inp) => !inp.value);
        inputs[firstEmpty >= 0 ? firstEmpty : inputs.length - 1].focus();
      }, sig);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  function destroy(otp) {
    if (!otp._vcInit) return;
    if (otp._vcAbort) { otp._vcAbort.abort(); otp._vcAbort = null; }
    if (otp._errorObserver) { otp._errorObserver.disconnect(); otp._errorObserver = null; }
    if (otp._vcCreatedHidden) {
      const hidden = otp.querySelector("input[type=hidden]");
      if (hidden) hidden.remove();
      otp._vcCreatedHidden = false;
    }
    otp._vcInit = false;
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", (evt) => {
    const el = evt.detail?.elt;
    if (!el) return;
    if (el.classList?.contains("verification-code")) {
      destroy(el);
    } else {
      (el.querySelectorAll?.(".verification-code") || []).forEach(destroy);
    }
  });
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.verificationCode = { init, destroy };
})();
