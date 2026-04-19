// Tree-shake: pull in only the interactive components you use.
// (For the full bundle, `import "ciderui/cider.js"` works too.)
import "ciderui/components/toast";

document.getElementById("toast-btn")?.addEventListener("click", () => {
  window.showToast({
    title: "Hello from Vite",
    message: "Toast component loaded via per-component subpath.",
    variant: "success",
  });
});
