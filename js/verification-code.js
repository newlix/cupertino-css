// Verification Code — ciderui
// Auto-advance, backspace, paste for verification code inputs.
(function () {
  function init() {
    document.querySelectorAll(".verification-code").forEach((otp) => {
      if (otp._vcInit) return;
      otp._vcInit = true;
      const inputs = otp.querySelectorAll('input:not([type="hidden"])');
      if (!inputs.length) return;
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

      let hidden = otp.querySelector("input[type=hidden]");
      if (!hidden) {
        hidden = document.createElement("input");
        hidden.type = "hidden";
        hidden.name = otp.dataset.name || "code";
        otp.appendChild(hidden);
      }

      function sync() {
        const newVal = Array.from(inputs).map((inp) => inp.value).join("");
        if (hidden.value !== newVal) {
          hidden.value = newVal;
          hidden.dispatchEvent(new Event("input", { bubbles: true }));
          hidden.dispatchEvent(new Event("change", { bubbles: true }));
          if (newVal.length === inputs.length) {
            otp.dispatchEvent(new CustomEvent("complete", { detail: { code: newVal }, bubbles: true }));
          }
        }
      }

      let pasting = false;

      inputs.forEach((input, i) => {
        input.addEventListener("beforeinput", (e) => {
          if (e.inputType === "insertText" && e.data && /\D/.test(e.data)) {
            e.preventDefault();
          }
        });
        input.addEventListener("input", () => {
          if (otp.hasAttribute("data-error")) {
            otp.removeAttribute("data-error");
          }
          const v = input.value.replace(/\D/g, "");
          input.value = v.slice(-1);
          if (!pasting) {
            sync();
            if (v && i < inputs.length - 1) inputs[i + 1].focus();
          }
        });

        input.addEventListener("keydown", (e) => {
          if (e.key === "Backspace" && otp.hasAttribute("data-error")) {
            otp.removeAttribute("data-error");
          }
          if (e.key === "Backspace" && !input.value && i > 0) {
            e.preventDefault();
            inputs[i - 1].value = "";
            inputs[i - 1].focus();
            sync();
          }
          if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); inputs[i - 1].focus(); }
          if (e.key === "ArrowRight" && i < inputs.length - 1) { e.preventDefault(); inputs[i + 1].focus(); }
        });

        input.addEventListener("paste", (e) => {
          e.preventDefault();
          const text = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
          if (!text) return;
          pasting = true;
          try {
            // Always fill from the first input when a full code is pasted
            const startIdx = text.length >= inputs.length ? 0 : i;
            if (startIdx === 0) {
              inputs.forEach((inp) => { inp.value = ""; });
            }
            for (let j = 0; j < text.length && startIdx + j < inputs.length; j++) {
              inputs[startIdx + j].value = text[j];
            }
          } finally {
            pasting = false;
          }
          sync();
          const firstEmpty = Array.from(inputs).findIndex((inp) => !inp.value);
          inputs[firstEmpty >= 0 ? firstEmpty : inputs.length - 1].focus();
        });

        input.addEventListener("focus", () => input.select());
      });

      otp.addEventListener("click", (e) => {
        if (e.target.closest('input:not([type="hidden"])')) return;
        if (inputs[0].disabled) return;
        const firstEmpty = Array.from(inputs).findIndex((inp) => !inp.value);
        inputs[firstEmpty >= 0 ? firstEmpty : inputs.length - 1].focus();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.verificationCode = { init };
})();
