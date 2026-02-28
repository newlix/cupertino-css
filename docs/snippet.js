// Snippet — ciderui
function fallbackCopy(text) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0";
  try {
    document.body.appendChild(ta);
    ta.select();
    var ok = document.execCommand("copy");
    if (!ok) throw new Error("execCommand failed");
  } finally {
    document.body.removeChild(ta);
  }
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(function () {
      fallbackCopy(text);
    });
  }
  fallbackCopy(text);
  return Promise.resolve();
}

if (window._ciderSnippetInit) { /* already initialized */ } else {
window._ciderSnippetInit = true;
document.addEventListener("click", function (e) {
  // Copy button — direct child button of snippet > header
  var btn = e.target.closest(".snippet > header > button");
  if (btn) {
    var snippet = btn.closest(".snippet");
    if (!snippet) return;

    var activePanel = snippet.querySelector(
      "pre[data-panel][data-active] code"
    );
    var code = activePanel || snippet.querySelector("pre code");
    if (!code) return;

    var original = btn.textContent;
    if (btn._copyTimer) clearTimeout(btn._copyTimer);
    copyText(code.textContent).then(function () {
      btn.textContent = "Copied!";
      btn._copyTimer = setTimeout(function () { btn.textContent = original; }, 1500);
    }).catch(function () {
      btn.textContent = "Failed";
      if (btn._copyTimer) clearTimeout(btn._copyTimer);
      btn._copyTimer = setTimeout(function () { btn.textContent = original; }, 1500);
    });
    return;
  }

  // Tab switching
  var tab = e.target.closest(".snippet > header > nav > button[data-tab]");
  if (tab) {
    var snippet = tab.closest(".snippet");
    if (!snippet) return;

    var target = tab.getAttribute("data-tab");

    snippet.querySelectorAll("header > nav > button[data-tab]").forEach(function (t) {
      t.removeAttribute("data-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.setAttribute("data-active", "");
    tab.setAttribute("aria-selected", "true");

    snippet.querySelectorAll("pre[data-panel]").forEach(function (p) {
      if (p.getAttribute("data-panel") === target) {
        p.setAttribute("data-active", "");
      } else {
        p.removeAttribute("data-active");
      }
    });
  }
});
}
