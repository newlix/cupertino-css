// TokenField — ciderui
(function () {
  function createToken(text, tokenClass) {
    const span = document.createElement("span");
    span.className = "token" + (tokenClass ? " " + tokenClass : "");
    span.dataset.value = text;
    span.textContent = text;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Remove " + text);
    btn.innerHTML =
      '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 9l6-6M9 9L3 3"/></svg>';
    span.appendChild(btn);
    return span;
  }

  function getTokens(field) {
    return Array.from(field.querySelectorAll(".token")).map(function (t) {
      return (
        t.dataset.value ?? (t.firstChild ? t.firstChild.textContent.trim() : "")
      );
    });
  }

  function fireChange(field) {
    field.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        detail: { tokens: getTokens(field) },
      }),
    );
  }

  function addToken(field, input, text, tokenClass) {
    var trimmed = text.trim();
    if (!trimmed) return;
    // Prevent duplicates
    var existing = getTokens(field);
    if (existing.indexOf(trimmed) !== -1) return;
    var token = createToken(trimmed, tokenClass);
    field.insertBefore(token, input);
    input.value = "";
    fireChange(field);
  }

  function setup(field) {
    if (field._tokenFieldInit) return;
    field._tokenFieldInit = true;

    var input = field.querySelector("input");
    if (!input) return;
    field._tokenFieldInput = input;

    var tokenClass = field.getAttribute("data-token-class") || "";

    // ARIA
    field.setAttribute("role", "listbox");
    field.setAttribute("aria-orientation", "horizontal");
    field.querySelectorAll(".token").forEach(function (t) {
      t.setAttribute("role", "option");
      if (!t.dataset.value)
        t.dataset.value = t.firstChild ? t.firstChild.textContent.trim() : "";
    });

    // Click container to focus input
    field._tokenFieldClick = function (e) {
      if (e.target === field) input.focus();
    };
    field.addEventListener("click", field._tokenFieldClick);

    // Keyboard: Enter/comma to add, Backspace to remove last
    field._tokenFieldKeydown = function (e) {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addToken(field, input, input.value, tokenClass);
      } else if (
        e.key === "Backspace" &&
        input.value === "" &&
        input.selectionStart === 0
      ) {
        var tokens = field.querySelectorAll(".token");
        if (tokens.length) {
          tokens[tokens.length - 1].remove();
          fireChange(field);
        }
      }
    };
    input.addEventListener("keydown", field._tokenFieldKeydown);

    // Remove token on × click (event delegation)
    field._tokenFieldRemove = function (e) {
      var btn = e.target.closest(".token button");
      if (!btn) return;
      btn.closest(".token").remove();
      input.focus();
      fireChange(field);
    };
    field.addEventListener("click", field._tokenFieldRemove);
  }

  function destroy(field) {
    if (!field._tokenFieldInit) return;
    var input = field._tokenFieldInput;
    if (field._tokenFieldClick)
      field.removeEventListener("click", field._tokenFieldClick);
    if (input && field._tokenFieldKeydown)
      input.removeEventListener("keydown", field._tokenFieldKeydown);
    if (field._tokenFieldRemove)
      field.removeEventListener("click", field._tokenFieldRemove);
    field._tokenFieldClick = null;
    field._tokenFieldKeydown = null;
    field._tokenFieldRemove = null;
    field._tokenFieldInput = null;
    field._tokenFieldInit = false;
  }

  function init() {
    document.querySelectorAll("[data-token-field]").forEach(setup);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("htmx:afterSettle", init);
  document.addEventListener("htmx:beforeCleanupElement", function (evt) {
    var el = evt.detail?.elt;
    if (!el) return;
    if (el.hasAttribute?.("data-token-field")) {
      destroy(el);
      return;
    }
    (el.querySelectorAll?.("[data-token-field]") || []).forEach(destroy);
  });

  window.CiderUI = window.CiderUI || {};
  window.CiderUI.tokenField = { init, destroy };
})();
