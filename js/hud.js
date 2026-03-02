// HUD — ciderui
(function () {
  function createHUDContainer() {
    var container = document.createElement("div");
    container.id = "hud-container";
    container.className = "cider hud-container";
    document.body.appendChild(container);
    return container;
  }

  function showHUD(label, options) {
    var opts = options || {};
    var duration = (typeof opts.duration === "number" && opts.duration > 0) ? opts.duration : 3000;

    var container =
      document.getElementById("hud-container") || createHUDContainer();

    var hud = document.createElement("div");
    hud.className = "hud";
    hud.setAttribute("role", "status");
    hud.setAttribute("aria-live", "polite");
    hud.setAttribute("aria-atomic", "true");

    // Icon — opts.icon must be a trusted SVG string, not user input
    var iconWrapper = document.createElement("template");
    var defaultIcon = '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    iconWrapper.innerHTML = opts.icon || defaultIcon;
    var svgEl = iconWrapper.content.querySelector("svg");
    if (svgEl) {
      hud.appendChild(svgEl);
    } else {
      iconWrapper.innerHTML = defaultIcon;
      hud.appendChild(iconWrapper.content);
    }

    var labelEl = document.createElement("span");
    labelEl.className = "hud-label";
    labelEl.textContent = label;
    hud.appendChild(labelEl);

    container.appendChild(hud);

    var dismissTimeout;
    var animTimer;
    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      if (dismissTimeout) clearTimeout(dismissTimeout);
      if (animTimer) clearTimeout(animTimer);
      if (!hud.parentElement) return;
      hud.setAttribute("data-closing", "");
      function removeHud() {
        if (hud.parentElement) hud.remove();
        if (animTimer) clearTimeout(animTimer);
        hud.removeEventListener("animationend", removeHud);
      }
      hud.addEventListener("animationend", removeHud, { once: true });
      animTimer = setTimeout(removeHud, 250);
    }

    dismissTimeout = setTimeout(dismiss, duration);

    return { dismiss: dismiss, element: hud };
  }

  if (typeof window !== "undefined") {
    window.showHUD = showHUD;
    window.showToast = showHUD;
  }
})();
