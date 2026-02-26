// Carousel — cupertino
// Prev/next navigation + indicators for scroll-snap carousels.
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
    const scrollLeft = content.scrollLeft;
    let closest = 0;
    let minDist = Infinity;
    items.forEach((item, i) => {
      const dist = Math.abs(item.offsetLeft - scrollLeft);
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

  if (prevBtn) prevBtn.addEventListener("click", () => scrollToIndex(getCurrentIndex() - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => scrollToIndex(getCurrentIndex() + 1));

  content.addEventListener("scroll", () => {
    clearTimeout(content._scrollTimer);
    content._scrollTimer = setTimeout(updateState, 50);
  });

  updateState();
});
