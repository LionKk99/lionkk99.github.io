(() => {
  function setNavVars() {
    const nav = document.querySelector(".home-nav");
    if (!nav) return;

    // Use offsetHeight (includes wrapping) to avoid overlap at any zoom level.
    const h = Math.ceil(nav.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--nav-h", `${h}px`);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setNavVars, { once: true });
  } else {
    setNavVars();
  }

  window.addEventListener("resize", setNavVars, { passive: true });

  // React to dynamic layout changes (font loading, nav wrapping).
  if (typeof ResizeObserver !== "undefined") {
    const nav = document.querySelector(".home-nav");
    if (nav) {
      const ro = new ResizeObserver(() => setNavVars());
      ro.observe(nav);
    }
  }
})();

