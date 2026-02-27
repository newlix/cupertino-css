// Snippet — ciderui
function fallbackCopy(text) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
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

document.addEventListener("click", function (e) {
  // Copy button
  var copyBtn = e.target.closest(".snippet-copy");
  if (copyBtn) {
    var snippet = copyBtn.closest("[data-snippet]");
    if (!snippet) return;

    var activePanel = snippet.querySelector(
      "pre[data-snippet-panel][data-active] code"
    );
    var code = activePanel || snippet.querySelector("pre code");
    if (!code) return;

    var original = copyBtn.textContent;
    copyText(code.textContent).then(function () {
      copyBtn.textContent = "Copied!";
      setTimeout(function () { copyBtn.textContent = original; }, 1500);
    });
    return;
  }

  // Tab switching
  var tab = e.target.closest("[data-snippet-tab]");
  if (tab) {
    var snippet = tab.closest("[data-snippet]");
    if (!snippet) return;

    var target = tab.getAttribute("data-snippet-tab");

    snippet.querySelectorAll("[data-snippet-tab]").forEach(function (t) {
      t.removeAttribute("data-active");
    });
    tab.setAttribute("data-active", "");

    snippet.querySelectorAll("[data-snippet-panel]").forEach(function (p) {
      if (p.getAttribute("data-snippet-panel") === target) {
        p.setAttribute("data-active", "");
      } else {
        p.removeAttribute("data-active");
      }
    });
  }
});
