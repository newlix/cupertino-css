// Sheet — ciderui
// Uses native <dialog> element. Adds backdrop-click-to-close.
function init() {
  document.querySelectorAll("dialog.sheet").forEach((sheet) => {
    sheet.addEventListener("click", (e) => {
      if (e.target === sheet) {
        sheet.close();
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
