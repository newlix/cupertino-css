// Sheet — cupertino
// Uses native <dialog> element. Adds backdrop-click-to-close.
document.querySelectorAll("dialog.sheet").forEach((sheet) => {
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) {
      sheet.close();
    }
  });
});
