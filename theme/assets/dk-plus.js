/* ==========================================================================
   DeskKart — interaction layer
   Split-text headings, parallax, stagger, horizontal rails, cart drawer,
   sticky buy bar. All of it no-ops cleanly under prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------------------------------------------------------------- money */
  var moneyFormat = '{{amount}}';
  function money(cents) {
    var fmt = (window.Shopify && window.Shopify.money_format) || moneyFormat;
    var value = (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (/\{\{\s*amount_no_decimals\s*\}\}/.test(fmt)) {
      value = Math.round(cents / 100).toLocaleString('en-US');
    }
    return fmt.replace(/\{\{\s*amount(_no_decimals)?(_with_comma_separator)?\s*\}\}/, value);
  }

  /* ================================================================ 1. split
     Wrap each word of a heading so it can rise out of a mask. */
  function splitHeadings() {
    if (reduce) return;
    $$('[data-dk-split]').forEach(function (el) {
      if (el.dataset.dkSplitDone) return;
      el.dataset.dkSplitDone = '1';
      var words = (el.textContent || '').trim().split(/\s+/);
      el.textContent = '';
      el.classList.add('dk-split');
      words.forEach(function (word, i) {
        var outer = document.createElement('span');
        outer.className = 'dk-word';
        var inner = document.createElement('span');
        inner.textContent = word;
        inner.style.transitionDelay = i * 55 + 'ms';
        outer.appendChild(inner);
        el.appendChild(outer);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
    });
  }

  /* ============================================================= 2. reveals
     One observer for reveals, staggers and split headings. */
  function observeReveals() {
    var targets = $$('[data-dk-reveal], [data-dk-stagger], [data-dk-split]');
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('dk-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-dk-delay') || '0', 10);
        if (delay) { setTimeout(function () { el.classList.add('dk-in'); }, delay); }
        else { el.classList.add('dk-in'); }
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ============================================================ 3. parallax */
  function parallax() {
    if (reduce) return;
    var nodes = $$('[data-dk-parallax]');
    if (!nodes.length) return;
    var ticking = false;
    function frame() {
      ticking = false;
      var vh = window.innerHeight;
      nodes.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var depth = parseFloat(el.getAttribute('data-dk-parallax')) || 12;
        /* -1 at the top of the viewport, +1 at the bottom */
        var progress = (r.top + r.height / 2 - vh / 2) / (vh / 2);
        el.style.setProperty('--dk-par', (progress * depth).toFixed(2) + 'px');
      });
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    frame();
  }

  /* ================================================================ 4. rails
     Horizontal scrollers with arrow buttons and a progress bar. */
  function rails() {
    $$('[data-dk-rail]').forEach(function (rail) {
      var track = $('[data-dk-rail-track]', rail);
      if (!track) return;
      var prev = $('[data-dk-rail-prev]', rail);
      var next = $('[data-dk-rail-next]', rail);
      var bar = $('[data-dk-rail-bar]', rail);

      function step() {
        var first = track.firstElementChild;
        return first ? first.getBoundingClientRect().width + 18 : track.clientWidth * 0.8;
      }
      function sync() {
        var max = track.scrollWidth - track.clientWidth;
        var ratio = max > 2 ? track.scrollLeft / max : 0;
        if (prev) prev.disabled = track.scrollLeft < 4;
        if (next) next.disabled = track.scrollLeft >= max - 4;
        if (bar) {
          var visible = track.clientWidth / track.scrollWidth;
          bar.style.width = Math.max(12, visible * 100) + '%';
          bar.style.transform = 'translateX(' + (ratio * (100 / Math.max(visible, 0.12) - 100)) + '%)';
        }
        rail.classList.toggle('dk-rail--static', max <= 2);
      }
      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
      track.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      sync();
    });
  }

  /* ========================================================== 5. cart drawer */
  var drawer = {
    el: null,
    lastFocus: null,

    mount: function () {
      if (this.el) return this.el;
      var el = document.createElement('div');
      el.className = 'dk-cd';
      el.setAttribute('data-dk-cart-drawer', '');
      el.innerHTML =
        '<div class="dk-cd__scrim" data-dk-cd-close></div>' +
        '<aside class="dk-cd__panel" role="dialog" aria-modal="true" aria-label="Shopping cart">' +
          '<div class="dk-cd__top">' +
            '<h2 class="dk-cd__title">Your cart</h2>' +
            '<button type="button" class="dk-cd__close" data-dk-cd-close aria-label="Close cart">' +
              '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="dk-cd__body" data-dk-cd-body></div>' +
          '<div class="dk-cd__foot" data-dk-cd-foot hidden></div>' +
        '</aside>';
      document.body.appendChild(el);
      this.el = el;

      el.addEventListener('click', function (e) {
        if (e.target.closest('[data-dk-cd-close]')) drawer.close();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawer.el && drawer.el.classList.contains('is-open')) drawer.close();
      });

      /* quantity + remove, delegated */
      el.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-dk-line]');
        if (!btn) return;
        var line = btn.getAttribute('data-dk-line');
        var qty = btn.getAttribute('data-dk-qty');
        drawer.change(line, qty);
      });
      return el;
    },

    open: function () {
      this.mount();
      this.lastFocus = document.activeElement;
      this.el.classList.add('is-open');
      document.body.classList.add('dk-locked');
      var close = $('.dk-cd__close', this.el);
      if (close) setTimeout(function () { close.focus(); }, 60);
    },

    close: function () {
      if (!this.el) return;
      this.el.classList.remove('is-open');
      document.body.classList.remove('dk-locked');
      if (this.lastFocus && this.lastFocus.focus) this.lastFocus.focus();
    },

    change: function (line, quantity) {
      var el = this.mount();
      el.classList.add('is-busy');
      fetch(root + 'cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line: Number(line), quantity: Number(quantity) })
      })
        .then(function (r) { return r.json(); })
        .then(function (cart) { drawer.render(cart); updateCount(cart.item_count); })
        .catch(function () { window.location.href = root + 'cart'; })
        .finally(function () { el.classList.remove('is-busy'); });
    },

    load: function () {
      var self = this;
      return fetch(root + 'cart.js', { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (cart) { self.render(cart); updateCount(cart.item_count); return cart; });
    },

    render: function (cart) {
      var el = this.mount();
      var body = $('[data-dk-cd-body]', el);
      var foot = $('[data-dk-cd-foot]', el);

      if (!cart.items || !cart.items.length) {
        body.innerHTML =
          '<div class="dk-cd__empty">' +
            '<p>Your cart is empty.</p>' +
            '<a class="dk-btn" href="' + root + 'collections/all">Shop desk mats</a>' +
          '</div>';
        foot.hidden = true;
        return;
      }

      var rows = cart.items.map(function (item, i) {
        var img = item.image ? item.image.replace(/(\.[a-z]+)(\?|$)/i, '_160x160$1$2') : '';
        var variant = item.variant_title && item.variant_title !== 'Default Title' ? item.variant_title : '';
        return '' +
          '<li class="dk-cd__item" style="animation-delay:' + i * 50 + 'ms">' +
            (img ? '<img class="dk-cd__thumb" src="' + img + '" alt="" width="74" height="74" loading="lazy">' : '<span class="dk-cd__thumb"></span>') +
            '<div>' +
              '<p class="dk-cd__name"><a href="' + item.url + '"></a></p>' +
              (variant ? '<p class="dk-cd__var"></p>' : '') +
              '<div class="dk-cd__row">' +
                '<span class="dk-cd__qty">' +
                  '<button type="button" data-dk-line="' + (i + 1) + '" data-dk-qty="' + (item.quantity - 1) + '" aria-label="Decrease quantity">&minus;</button>' +
                  '<span>' + item.quantity + '</span>' +
                  '<button type="button" data-dk-line="' + (i + 1) + '" data-dk-qty="' + (item.quantity + 1) + '" aria-label="Increase quantity">+</button>' +
                '</span>' +
                '<span class="dk-cd__price">' + money(item.final_line_price) + '</span>' +
              '</div>' +
              '<button type="button" class="dk-cd__drop" data-dk-line="' + (i + 1) + '" data-dk-qty="0">Remove</button>' +
            '</div>' +
          '</li>';
      }).join('');

      body.innerHTML = '<ul class="dk-cd__list">' + rows + '</ul>';

      /* titles set as text, never as HTML */
      $$('.dk-cd__item', body).forEach(function (node, i) {
        var item = cart.items[i];
        var link = $('.dk-cd__name a', node);
        if (link) link.textContent = item.product_title;
        var varEl = $('.dk-cd__var', node);
        if (varEl) varEl.textContent = item.variant_title;
      });

      foot.hidden = false;
      foot.innerHTML =
        '<p class="dk-cd__sub"><span>Subtotal</span><span>' + money(cart.total_price) + '</span></p>' +
        '<p class="dk-cd__note">Shipping and taxes calculated at checkout.</p>' +
        '<a class="dk-btn" href="' + root + 'checkout">Checkout</a>' +
        '<button type="button" class="dk-cd__cont" data-dk-cd-close>Continue shopping</button>';
    }
  };
  window.dkCartDrawer = drawer;

  /* ------------------------------------------------- header count + pop */
  function updateCount(count) {
    $$('[data-dk-cart-count]').forEach(function (node) {
      node.textContent = count;
      node.classList.toggle('is-empty', count === 0);
      node.classList.remove('dk-pop');
      void node.offsetWidth;
      if (!reduce) node.classList.add('dk-pop');
    });
  }
  window.dkUpdateCartCount = updateCount;

  /* open the drawer from the header cart link instead of navigating */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-dk-cart-open], .dk-head__cart');
    if (!trigger) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    drawer.open();
    drawer.load();
  });

  /* ======================================================= 6. sticky buy bar */
  function stickyBuy() {
    var bar = $('[data-dk-stickybuy]');
    var anchor = $('[data-dk-buy-anchor]');
    if (!bar || !anchor || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bar.classList.toggle('is-on', !entry.isIntersecting && entry.boundingClientRect.top < 0);
      });
    }, { threshold: 0 });
    io.observe(anchor);
  }

  /* ================================================================== boot */
  function boot() {
    document.documentElement.classList.add('dk-motion-ready');
    splitHeadings();
    observeReveals();
    parallax();
    rails();
    stickyBuy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* theme editor re-renders a section: re-wire it, show everything at once */
  document.addEventListener('shopify:section:load', function () {
    splitHeadings();
    rails();
    stickyBuy();
    $$('[data-dk-reveal]:not(.dk-in), [data-dk-stagger]:not(.dk-in), [data-dk-split]:not(.dk-in)')
      .forEach(function (el) { el.classList.add('dk-in'); });
  });
})();
