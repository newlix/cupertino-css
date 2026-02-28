// Dialog — ciderui
// Uses native <dialog> element — no JS needed for basic open/close.
// This script adds backdrop-click-to-close with exit animation.
function closeDialog(dialog) {
  dialog.setAttribute("data-closing", "");
  dialog.addEventListener("animationend", () => {
    dialog.removeAttribute("data-closing");
    dialog.close();
  }, { once: true });
}

function init() {
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        closeDialog(dialog);
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
