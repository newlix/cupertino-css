// Menu — ciderui
document.querySelectorAll(".menu [popover]").forEach(function (popover) {
  var menu = popover.closest(".menu");
  var trigger = menu ? menu.querySelector("button:not([popover] button)") : null;
  if (!trigger) return;

  trigger.popoverTargetElement = popover;
  trigger.popoverTargetAction = "toggle";

  popover.addEventListener("beforetoggle", function (e) {
    if (e.newState === "open") {
      var rect = trigger.getBoundingClientRect();
      popover.style.top = rect.bottom + window.scrollY + "px";
      popover.style.left = rect.left + window.scrollX + "px";
    }
  });

  popover.addEventListener("toggle", function (e) {
    if (e.newState === "open") {
      var first = popover.querySelector("button:not([disabled]), a:not([disabled])");
      if (first) first.focus();
    } else {
      trigger.focus();
    }
  });

  popover.addEventListener("click", function (e) {
    var item = e.target.closest("button, a");
    if (!item || !popover.contains(item)) return;
    popover.hidePopover();
  });

  popover.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    var items = Array.from(popover.querySelectorAll("button:not([disabled]), a:not([disabled])"));
    if (!items.length) return;
    var idx = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      items[idx < items.length - 1 ? idx + 1 : 0].focus();
    } else {
      items[idx > 0 ? idx - 1 : items.length - 1].focus();
    }
  });
});
