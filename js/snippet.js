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
    copyText(code.textContent).then(function () {
      btn.textContent = "Copied!";
      setTimeout(function () { btn.textContent = original; }, 1500);
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
    });
    tab.setAttribute("data-active", "");

    snippet.querySelectorAll("pre[data-panel]").forEach(function (p) {
      if (p.getAttribute("data-panel") === target) {
        p.setAttribute("data-active", "");
      } else {
        p.removeAttribute("data-active");
      }
    });
  }
});
