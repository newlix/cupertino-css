// Toast — ciderui
function showToast(title, message, type = "success") {
  const container =
    document.getElementById("toast-container") || createToastContainer();

  const iconsSVG = {
    success:
      '<svg class="mt-0.5 size-5 shrink-0 text-success" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    error:
      '<svg class="mt-0.5 size-5 shrink-0 text-destructive" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    info: '<svg class="mt-0.5 size-5 shrink-0 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  };

  const toast = document.createElement("div");
  toast.className = "toast toast-" + type;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  // Icon
  const iconWrapper = document.createElement("template");
  iconWrapper.innerHTML = iconsSVG[type] || iconsSVG.success;
  toast.appendChild(iconWrapper.content);

  // Content
  const content = document.createElement("div");
  content.className = "flex-1";
  const titleEl = document.createElement("p");
  titleEl.className = "toast-title";
  titleEl.textContent = title;
  const messageEl = document.createElement("p");
  messageEl.className = "toast-message";
  messageEl.textContent = message;
  content.appendChild(titleEl);
  content.appendChild(messageEl);
  toast.appendChild(content);

  let dismissTimeout;
  function dismissToast() {
    if (dismissTimeout) clearTimeout(dismissTimeout);
    if (!toast.parentElement) return;
    toast.setAttribute("data-closing", "");
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 200);
  }

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "toast-close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.innerHTML = '<svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>';
  closeBtn.addEventListener("click", dismissToast);
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  // Auto-remove after 4 seconds
  dismissTimeout = setTimeout(dismissToast, 4000);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toast-container";
  container.className = "toast-container";
  document.body.appendChild(container);
  return container;
}
