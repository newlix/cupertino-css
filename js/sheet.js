// Sheet — ciderui
// Uses native <dialog> element. Adds backdrop-click-to-close with exit animation.
function closeSheet(sheet) {
  sheet.setAttribute("data-closing", "");
  sheet.addEventListener("animationend", () => {
    sheet.removeAttribute("data-closing");
    sheet.close();
  }, { once: true });
}

function init() {
  document.querySelectorAll("dialog.sheet, dialog.sheet-bottom, dialog.sheet-top").forEach((sheet) => {
    // Intercept Escape to trigger close animation instead of instant close
    sheet.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeSheet(sheet);
    });

    sheet.addEventListener("click", (e) => {
      if (e.target === sheet) {
        closeSheet(sheet);
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
