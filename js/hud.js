// HUD — ciderui
// Named "HUD" intentionally — this is the macOS HUD overlay pattern (centered, dark,
// transient, auto-dismiss), not a toast. Toasts are edge-positioned; HUDs are centered.
// macOS equivalent: NSPanel with styleMask:.hudWindow (volume/brightness/screenshot overlays).
(function () {
  function createHUDContainer() {
    const container = document.createElement("div");
    container.id = "hud-container";
    container.className = "cider hud-container";
    container.setAttribute("role", "status");
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.appendChild(container);
    return container;
  }

  function showHUD(label, options) {
    const opts = options || {};
    const duration = (typeof opts.duration === "number" && opts.duration > 0) ? opts.duration : 2000;

    const container =
      document.getElementById("hud-container") || createHUDContainer();

    // macOS shows one HUD at a time — dismiss any existing HUD immediately
    const existing = container.querySelector(".hud");
    if (existing) existing.remove();

    const hud = document.createElement("div");
    hud.className = "hud";

    // Icon — sanitise via DOMParser to prevent XSS from untrusted input
    const defaultIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    const iconSrc = opts.icon || defaultIcon;
    const parser = new DOMParser();
    const iconDoc = parser.parseFromString(iconSrc, "image/svg+xml");
    const svgEl = iconDoc.querySelector("svg");
    if (svgEl && iconDoc.documentElement.tagName === "svg") {
      const DANGEROUS_ELEMENTS = new Set(["script", "foreignobject", "iframe", "object", "embed"]);
      svgEl.querySelectorAll("*").forEach((el) => {
        if (DANGEROUS_ELEMENTS.has(el.localName.toLowerCase())) { el.remove(); return; }
      });
      [svgEl, ...svgEl.querySelectorAll("*")].forEach((el) => {
        for (const attr of Array.from(el.attributes)) {
          const name = attr.name.toLowerCase();
          if (name.startsWith("on") || name === "style") {
            el.removeAttribute(attr.name);
          } else if ((name === "href" || name === "xlink:href") &&
                     attr.value.replace(/\s/g, "").toLowerCase().startsWith("javascript:")) {
            el.removeAttribute(attr.name);
          }
        }
      });
      hud.appendChild(document.adoptNode(svgEl));
    } else {
      const fallbackDoc = parser.parseFromString(defaultIcon, "image/svg+xml");
      hud.appendChild(document.adoptNode(fallbackDoc.documentElement));
    }

    const labelEl = document.createElement("span");
    labelEl.className = "hud-label";
    labelEl.textContent = label;
    hud.appendChild(labelEl);

    container.appendChild(hud);

    let dismissTimeout;
    let animTimer;
    let dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      if (dismissTimeout) clearTimeout(dismissTimeout);
      if (animTimer) clearTimeout(animTimer);
      if (!hud.parentElement) return;
      hud.setAttribute("data-closing", "");
      let removed = false;
      function removeHud(e) {
        if (removed) return;
        if (e && (e.target !== hud || e.animationName !== "hudDismiss")) return;
        removed = true;
        clearTimeout(animTimer);
        hud.removeEventListener("animationend", removeHud);
        if (hud.parentElement) hud.remove();
      }
      hud.addEventListener("animationend", removeHud);
      const animDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 10 : 180;
      animTimer = setTimeout(removeHud, animDuration);
    }

    dismissTimeout = setTimeout(dismiss, duration);

    return { dismiss, element: hud };
  }

  if (typeof window !== "undefined") {
    window.showHUD = showHUD;
    window.CiderUI = window.CiderUI || {};
    window.CiderUI.hud = { show: showHUD };
  }
})();
