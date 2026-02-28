// Carousel — ciderui
// Prev/next navigation + indicators for scroll-snap carousels.
function init() {
  document.querySelectorAll(".carousel").forEach((carousel) => {
    const content = carousel.querySelector(".carousel-content");
    const prevBtn = carousel.querySelector(".carousel-prev");
    const nextBtn = carousel.querySelector(".carousel-next");
    const indicators = carousel.querySelector(".carousel-indicators");
    if (!content) return;

    function getItems() {
      return content.querySelectorAll(".carousel-item, .carousel-item-half, .carousel-item-third");
    }

    function getCurrentIndex() {
      const items = getItems();
      const viewCenter = content.scrollLeft + content.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      items.forEach((item, i) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const dist = Math.abs(itemCenter - viewCenter);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      return closest;
    }

    function scrollToIndex(index) {
      const items = getItems();
      if (index < 0 || index >= items.length) return;
      content.scrollTo({ left: items[index].offsetLeft, behavior: "smooth" });
    }

    function updateState() {
      const items = getItems();
      const current = getCurrentIndex();

      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current >= items.length - 1;

      if (indicators) {
        indicators.querySelectorAll(".carousel-indicator").forEach((dot, i) => {
          if (i === current) dot.setAttribute("data-active", "");
          else dot.removeAttribute("data-active");
        });
      }
    }

    // Build indicators if container exists but is empty
    if (indicators && !indicators.children.length) {
      const items = getItems();
      items.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.className = "carousel-indicator";
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        if (i === 0) dot.setAttribute("data-active", "");
        dot.addEventListener("click", () => scrollToIndex(i));
        indicators.appendChild(dot);
      });
    }

    let scrolling = false;
    function navTo(index) {
      if (scrolling) return;
      scrolling = true;
      scrollToIndex(index);
      setTimeout(() => { scrolling = false; }, 350);
    }
    if (prevBtn) prevBtn.addEventListener("click", () => navTo(getCurrentIndex() - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => navTo(getCurrentIndex() + 1));

    content.addEventListener("scroll", () => {
      clearTimeout(content._scrollTimer);
      content._scrollTimer = setTimeout(updateState, 50);
    });

    updateState();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
