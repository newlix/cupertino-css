// Input OTP — ciderui
// Manages hidden input, auto-advance, backspace, paste for OTP slots.
function init() {
  document.querySelectorAll(".input-otp").forEach((otp) => {
    const slots = otp.querySelectorAll(".input-otp-slot");
    if (!slots.length) return;

    // Create hidden input for the full value
    let hidden = otp.querySelector("input[type=hidden]");
    if (!hidden) {
      hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = otp.dataset.name || "otp";
      otp.appendChild(hidden);
    }

    function syncValue() {
      hidden.value = Array.from(slots).map((s) => s.textContent.trim()).join("");
      // Update active state
      slots.forEach((s) => s.removeAttribute("data-active"));
    }

    function focusSlot(index) {
      if (index >= 0 && index < slots.length) {
        slots[index].focus();
        slots.forEach((s) => s.removeAttribute("data-active"));
        slots[index].setAttribute("data-active", "");
      }
    }

    slots.forEach((slot, i) => {
      slot.setAttribute("tabindex", "0");
      slot.setAttribute("role", "textbox");
      slot.setAttribute("aria-label", `Digit ${i + 1}`);

      slot.addEventListener("focus", () => {
        slots.forEach((s) => s.removeAttribute("data-active"));
        slot.setAttribute("data-active", "");
      });

      slot.addEventListener("blur", () => {
        slot.removeAttribute("data-active");
      });

      slot.addEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
          e.preventDefault();
          if (slot.textContent.trim()) {
            slot.textContent = "";
            syncValue();
          } else if (i > 0) {
            slots[i - 1].textContent = "";
            focusSlot(i - 1);
            syncValue();
          }
          return;
        }
        if (e.key === "ArrowLeft") { e.preventDefault(); focusSlot(i - 1); return; }
        if (e.key === "ArrowRight") { e.preventDefault(); focusSlot(i + 1); return; }
        if (e.key.length === 1 && /\d/.test(e.key)) {
          e.preventDefault();
          slot.textContent = e.key;
          syncValue();
          focusSlot(i + 1);
        }
      });

      slot.addEventListener("paste", (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
        for (let j = 0; j < text.length && i + j < slots.length; j++) {
          slots[i + j].textContent = text[j];
        }
        syncValue();
        focusSlot(Math.min(i + text.length, slots.length - 1));
      });
    });

    // Click the container focuses the first empty slot
    otp.addEventListener("click", (e) => {
      if (e.target.closest(".input-otp-slot")) return;
      const firstEmpty = Array.from(slots).findIndex((s) => !s.textContent.trim());
      focusSlot(firstEmpty >= 0 ? firstEmpty : slots.length - 1);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
