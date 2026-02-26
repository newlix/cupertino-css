// Toast — cupertino-css
function showToast(title, message, type = "success") {
  const container =
    document.getElementById("toast-container") || createToastContainer();

  const icons = {
    success:
      '<svg class="mt-0.5 size-5 shrink-0 text-success" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    error:
      '<svg class="mt-0.5 size-5 shrink-0 text-destructive" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    info: '<svg class="mt-0.5 size-5 shrink-0 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  };

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    ${icons[type] || icons.success}
    <div class="flex-1">
      <p class="toast-title">${title}</p>
      <p class="toast-message">${message}</p>
    </div>
    <button onclick="this.parentElement.remove()" class="toast-close">
      <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  `;

  container.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = "slideDown 0.2s ease-in forwards";
    setTimeout(() => toast.remove(), 200);
  }, 4000);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toast-container";
  container.className = "toast-container";
  document.body.appendChild(container);
  return container;
}
