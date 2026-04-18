// ── Toast ──
// Toast — ciderui
// Edge-positioned notification stack. Distinct from HUD (centered,
// one-at-a-time, transient): toasts stack at a page corner and persist
// until dismissed or duration expires.
import "./_shared.js";
(function () {
  const DEFAULT_DURATION = 4000;

  function ensureContainer() {
    let c = document.getElementById("toast-container");
    if (c) return c;
    c = document.createElement("div");
    c.id = "toast-container";
    c.className = "cider toast-container";
    c.setAttribute("role", "region");
    c.setAttribute("aria-label", "Notifications");
    c.setAttribute("aria-live", "polite");
    c.setAttribute("aria-atomic", "false");
    document.body.appendChild(c);
    return c;
  }

  function dismiss(toast) {
    if (toast._toastDismissed) return;
    toast._toastDismissed = true;
    clearTimeout(toast._toastTimer);
    toast.setAttribute("data-closing", "");
    const done = () => {
      toast.remove();
      toast.removeEventListener("animationend", done);
    };
    toast.addEventListener("animationend", done, { once: true });
    // Fallback if animation doesn't fire (e.g. reduced motion)
    setTimeout(done, 500);
  }

  function showToast(input) {
    const opts = typeof input === "string" ? { title: input } : input || {};
    const container = ensureContainer();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", opts.variant === "error" ? "alert" : "status");

    if (opts.variant) toast.setAttribute("data-variant", opts.variant);

    // Icon — the hud sanitiser is overkill for internal icons, but we
    // do skip anything that contains "<" inside the title/message
    // to avoid accidental HTML injection via user strings.
    const defaultIcon = {
      success:
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
      error:
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 3.01.01-.011M12 21a9 9 0 100-18 9 9 0 000 18z"/></svg>',
      info: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 100-18 9 9 0 000 18z"/></svg>',
    }[opts.variant || "info"];

    if (defaultIcon) {
      const iconWrap = document.createElement("span");
      iconWrap.innerHTML = defaultIcon;
      const svg = iconWrap.firstElementChild;
      if (svg) toast.appendChild(svg);
    }

    const body = document.createElement("div");
    body.className = "toast-body";
    if (opts.title) {
      const t = document.createElement("span");
      t.className = "toast-title";
      t.textContent = String(opts.title);
      body.appendChild(t);
    }
    if (opts.message) {
      const m = document.createElement("span");
      m.className = "toast-message";
      m.textContent = String(opts.message);
      body.appendChild(m);
    }
    toast.appendChild(body);

    const btn = document.createElement("button");
    btn.className = "toast-dismiss";
    btn.type = "button";
    btn.setAttribute("aria-label", "Dismiss notification");
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>';
    btn.addEventListener("click", () => dismiss(toast));
    toast.appendChild(btn);

    container.appendChild(toast);

    const duration =
      typeof opts.duration === "number" ? opts.duration : DEFAULT_DURATION;
    if (duration > 0) {
      toast._toastTimer = setTimeout(() => dismiss(toast), duration);
    }

    return { dismiss: () => dismiss(toast), element: toast };
  }

  window.showToast = showToast;
  window.CiderUI = window.CiderUI || {};
  window.CiderUI.toast = {
    init() {
      /* no-op — toasts are created imperatively */
    },
    show: showToast,
    destroy() {
      const c = document.getElementById("toast-container");
      if (c) {
        c.querySelectorAll(".toast").forEach(dismiss);
        c.remove();
      }
    },
  };
})();
