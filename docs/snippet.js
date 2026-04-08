// Snippet — ciderui
function fallbackCopy(text) {
  const prev = document.activeElement;
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0";
  try {
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    if (!document.execCommand("copy")) throw new Error("execCommand failed");
  } finally {
    ta.remove();
    if (prev && prev !== document.body) prev.focus();
  }
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(function () {
      try {
        fallbackCopy(text);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  }
  try {
    fallbackCopy(text);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
}

if (window._ciderSnippetInit) {
  /* already initialized */
} else {
  window._ciderSnippetInit = true;

  // Set ARIA roles on snippet tab navs so aria-selected is valid
  document.querySelectorAll(".snippet > header > nav").forEach(function (nav) {
    nav.setAttribute("role", "tablist");
    nav.querySelectorAll("button[data-tab]").forEach(function (btn) {
      btn.setAttribute("role", "tab");
      btn.setAttribute(
        "aria-selected",
        btn.hasAttribute("data-active") ? "true" : "false",
      );
      btn.setAttribute(
        "tabindex",
        btn.hasAttribute("data-active") ? "0" : "-1",
      );
    });
  });

  document.addEventListener("click", function (e) {
    // Copy button — direct child button of snippet > header
    const btn = e.target.closest(".snippet > header > button");
    if (btn) {
      const snippet = btn.closest(".snippet");
      if (!snippet) return;

      const activePanel = snippet.querySelector(
        "pre[data-panel][data-active] code",
      );
      const code = activePanel || snippet.querySelector("pre code");
      if (!code) return;

      const original = btn.textContent;
      if (btn._copyTimer) clearTimeout(btn._copyTimer);
      copyText(code.textContent)
        .then(function () {
          btn.textContent = "Copied!";
          btn._copyTimer = setTimeout(function () {
            btn.textContent = original;
          }, 1500);
        })
        .catch(function (err) {
          console.error("Failed to copy code:", err);
          btn.textContent = "Failed";
          if (btn._copyTimer) clearTimeout(btn._copyTimer);
          btn._copyTimer = setTimeout(function () {
            btn.textContent = original;
          }, 1500);
        });
      return;
    }

    // Tab switching
    const tab = e.target.closest(".snippet > header > nav > button[data-tab]");
    if (tab) {
      const snippet = tab.closest(".snippet");
      if (!snippet) return;

      const target = tab.getAttribute("data-tab");

      snippet
        .querySelectorAll("header > nav > button[data-tab]")
        .forEach(function (t) {
          t.removeAttribute("data-active");
          t.setAttribute("aria-selected", "false");
          t.setAttribute("tabindex", "-1");
        });
      tab.setAttribute("data-active", "");
      tab.setAttribute("aria-selected", "true");
      tab.setAttribute("tabindex", "0");

      snippet.querySelectorAll("pre[data-panel]").forEach(function (p) {
        if (p.getAttribute("data-panel") === target) {
          p.setAttribute("data-active", "");
        } else {
          p.removeAttribute("data-active");
        }
      });
    }
  });

  // Arrow key navigation for snippet tab strips (ARIA tablist pattern)
  document.addEventListener("keydown", function (e) {
    var tab = e.target.closest(".snippet > header > nav > button[data-tab]");
    if (!tab) return;
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    var tabs = Array.from(
      tab.closest("nav").querySelectorAll("button[data-tab]"),
    );
    var idx = tabs.indexOf(tab);
    var next =
      e.key === "ArrowRight"
        ? tabs[(idx + 1) % tabs.length]
        : tabs[(idx - 1 + tabs.length) % tabs.length];
    next.click();
    next.focus();
  });
}
