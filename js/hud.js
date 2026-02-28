// HUD — ciderui
function showHUD(label, optionsOrMessage, legacyType) {
  // Backward compat: showHUD(title, message, type) — old 3-arg API
  if (typeof optionsOrMessage === "string") {
    return showHUD(label, { message: optionsOrMessage, type: legacyType || "success" });
  }

  var opts = optionsOrMessage || {};
  var type = opts.type || "default";
  var message = opts.message || null;
  var isNotification = !!message;
  var isDestructive = type === "error" || type === "destructive";
  var duration = opts.duration || (isNotification ? 4000 : 3000);

  var container =
    document.getElementById("hud-container") || createHUDContainer();

  var iconsSVG = {
    default:
      '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    error:
      '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  };

  var hud = document.createElement("div");
  hud.className = isNotification ? "hud " + (isDestructive ? "hud-destructive " : "") + "hud-notification" : "hud";
  hud.setAttribute("role", "status");
  hud.setAttribute("aria-live", "polite");

  // Icon
  var iconWrapper = document.createElement("template");
  iconWrapper.innerHTML = isDestructive ? iconsSVG.error : iconsSVG.default;
  hud.appendChild(iconWrapper.content);

  if (isNotification) {
    // Notification mode: title + message
    var titleEl = document.createElement("p");
    titleEl.className = "hud-title";
    titleEl.textContent = label;
    hud.appendChild(titleEl);

    var messageEl = document.createElement("p");
    messageEl.className = "hud-message";
    messageEl.textContent = message;
    hud.appendChild(messageEl);
  } else {
    // HUD mode: single label
    var labelEl = document.createElement("span");
    labelEl.className = "hud-label";
    labelEl.textContent = label;
    hud.appendChild(labelEl);
  }

  container.appendChild(hud);

  var dismissTimeout;
  function dismiss() {
    if (dismissTimeout) clearTimeout(dismissTimeout);
    if (!hud.parentElement) return;
    hud.setAttribute("data-closing", "");
    setTimeout(function () {
      if (hud.parentElement) hud.remove();
    }, 200);
  }

  dismissTimeout = setTimeout(dismiss, duration);

  return { dismiss: dismiss, element: hud };
}

// Backward compat alias
var showToast = showHUD;

function createHUDContainer() {
  var container = document.createElement("div");
  container.id = "hud-container";
  container.className = "hud-container";
  document.body.appendChild(container);
  return container;
}
