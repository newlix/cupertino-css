// Dialog — ciderui
// Uses native <dialog> element — no JS needed for basic open/close.
// This script adds backdrop-click-to-close behavior.
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });
});
