// Carousel — ciderui
// Prev/next navigation + indicators for scroll-snap carousels.
function init() {
  document.querySelectorAll(".carousel").forEach(function (carousel) {
    var content = carousel.querySelector(".carousel-content");
    var prevBtn = carousel.querySelector(".carousel-prev");
    var nextBtn = carousel.querySelector(".carousel-next");
    var indicators = carousel.querySelector(".carousel-indicators");
    if (!content) return;

    // ARIA setup
    carousel.setAttribute("role", "region");
    carousel.setAttribute("aria-roledescription", "carousel");
    if (!carousel.getAttribute("aria-label")) {
      carousel.setAttribute("aria-label", "Carousel");
    }

    function getItems() {
      return content.querySelectorAll(".carousel-item, .carousel-item-half, .carousel-item-third");
    }

    function getCurrentIndex() {
      var items = getItems();
      var viewCenter = content.scrollLeft + content.clientWidth / 2;
      var closest = 0;
      var minDist = Infinity;
      items.forEach(function (item, i) {
        var itemCenter = item.offsetLeft + item.offsetWidth / 2;
        var dist = Math.abs(itemCenter - viewCenter);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      return closest;
    }

    function scrollToIndex(index) {
      var items = getItems();
      if (index < 0 || index >= items.length) return;
      content.scrollTo({ left: items[index].offsetLeft, behavior: "smooth" });
    }

    function updateState() {
      var items = getItems();
      var current = getCurrentIndex();

      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current >= items.length - 1;

      if (indicators) {
        indicators.querySelectorAll(".carousel-indicator").forEach(function (dot, i) {
          var isActive = i === current;
          if (isActive) dot.setAttribute("data-active", "");
          else dot.removeAttribute("data-active");
          dot.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
      }
    }

    // Build indicators if container exists but is empty
    if (indicators && !indicators.children.length) {
      var items = getItems();
      items.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.className = "carousel-indicator";
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.setAttribute("aria-pressed", i === 0 ? "true" : "false");
        if (i === 0) dot.setAttribute("data-active", "");
        dot.addEventListener("click", function () { scrollToIndex(i); });
        indicators.appendChild(dot);
      });
    }

    // Clear previous scroll timer if re-initializing
    if (carousel._scrollTimer) clearTimeout(carousel._scrollTimer);
    function navTo(index) {
      scrollToIndex(index);
    }
    if (prevBtn) prevBtn.addEventListener("click", function () { navTo(getCurrentIndex() - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { navTo(getCurrentIndex() + 1); });

    content.addEventListener("scroll", function () {
      clearTimeout(carousel._scrollTimer);
      carousel._scrollTimer = setTimeout(updateState, 50);
    });

    // Keyboard navigation
    carousel.setAttribute("tabindex", "0");
    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navTo(getCurrentIndex() - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navTo(getCurrentIndex() + 1);
      }
    });

    updateState();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
