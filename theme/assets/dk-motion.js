/* DeskKart motion — scroll reveals and hero entrance. Respects prefers-reduced-motion. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function activate() {
    document.documentElement.classList.add('dk-motion-ready');

    if (reduce.matches || !('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-dk-reveal]').forEach(function (el) {
        el.classList.add('dk-in');
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-dk-delay') || '0', 10);
          setTimeout(function () {
            el.classList.add('dk-in');
          }, delay);
          io.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );

    document.querySelectorAll('[data-dk-reveal]').forEach(function (el) {
      io.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activate);
  } else {
    activate();
  }

  /* re-scan after Shopify section re-renders in the theme editor */
  document.addEventListener('shopify:section:load', function () {
    document.querySelectorAll('[data-dk-reveal]:not(.dk-in)').forEach(function (el) {
      el.classList.add('dk-in');
    });
  });
})();
