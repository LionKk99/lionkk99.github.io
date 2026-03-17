(() => {
  function setupNav(nav) {
    const list = nav.querySelector(".home-nav-links");
    if (!list) return;

    // Ensure indicator exists
    let indicator = list.querySelector(".home-nav-indicator");
    if (!indicator) {
      indicator = document.createElement("span");
      indicator.className = "home-nav-indicator";
      indicator.setAttribute("aria-hidden", "true");
      list.appendChild(indicator);
    }

    const links = Array.from(list.querySelectorAll("a"));
    if (!links.length) return;

    function centerXForLink(a) {
      const aRect = a.getBoundingClientRect();
      const listRect = list.getBoundingClientRect();
      return aRect.left - listRect.left + aRect.width / 2 - indicator.offsetWidth / 2;
    }

    let active = list.querySelector("a.active") || links[0];

    function moveTo(link) {
      if (!link) return;
      const x = centerXForLink(link);
      indicator.style.transform = `translateX(${Math.round(x)}px)`;
    }

    // Initial
    requestAnimationFrame(() => moveTo(active));

    // Hover / focus
    links.forEach((a) => {
      a.addEventListener("mouseenter", () => moveTo(a));
      a.addEventListener("focus", () => moveTo(a));
    });

    // Return to active when leaving the nav list
    list.addEventListener("mouseleave", () => moveTo(active));
    list.addEventListener("focusout", (e) => {
      if (!list.contains(e.relatedTarget)) moveTo(active);
    });

    // Keep correct on resize
    window.addEventListener("resize", () => moveTo(active), { passive: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".home-nav").forEach(setupNav);
  });
})();

