/* DeskKart — sticky header scroll state.
   Reveals, parallax, rails and the cart drawer live in dk-plus.js. */
(function () {
  var last = null;
  function onScroll() {
    var on = window.scrollY > 24;
    if (on !== last) {
      last = on;
      document.documentElement.classList.toggle('dk-scrolled', on);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
