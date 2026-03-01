// HUD — ciderui
function showHUD(label, options) {
  var opts = options || {};
  var duration = opts.duration || 3000;

  var container =
    document.getElementById("hud-container") || createHUDContainer();

  var hud = document.createElement("div");
  hud.className = "hud";
  hud.setAttribute("role", "status");
  hud.setAttribute("aria-live", "polite");
  hud.setAttribute("aria-atomic", "true");

  // Icon
  var iconWrapper = document.createElement("template");
  iconWrapper.innerHTML = opts.icon ||
    '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
  hud.appendChild(iconWrapper.content);

  var labelEl = document.createElement("span");
  labelEl.className = "hud-label";
  labelEl.textContent = label;
  hud.appendChild(labelEl);

  container.appendChild(hud);

  var dismissTimeout;
  var animTimer;
  function dismiss() {
    if (dismissTimeout) clearTimeout(dismissTimeout);
    if (animTimer) clearTimeout(animTimer);
    if (!hud.parentElement) return;
    hud.setAttribute("data-closing", "");
    animTimer = setTimeout(function () {
      if (hud.parentElement) hud.remove();
    }, 200);
  }

  dismissTimeout = setTimeout(dismiss, duration);

  return { dismiss: dismiss, element: hud };
}

// Backward compat alias
var showToast = showHUD;

if (typeof window !== "undefined") {
  window.showHUD = showHUD;
  window.showToast = showToast;
}

function createHUDContainer() {
  var container = document.createElement("div");
  container.id = "hud-container";
  container.className = "cider hud-container";
  document.body.appendChild(container);
  return container;
}
