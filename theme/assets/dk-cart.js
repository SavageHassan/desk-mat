/* DeskKart — AJAX add to cart. Opens the cart drawer on success and falls
   back to a normal form post if anything goes wrong. */
(function () {
  'use strict';
  var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';

  function flash(button, text) {
    if (!button) return;
    button.classList.add('dk-added');
    var original = button.dataset.dkLabel || button.textContent;
    button.dataset.dkLabel = original;
    button.textContent = text;
    setTimeout(function () {
      button.textContent = button.dataset.dkLabel;
      button.classList.remove('dk-added');
    }, 1600);
  }

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form.classList || !form.classList.contains('dk-buy__form')) return;
    /* "Buy it now" must go straight to checkout */
    if (document.activeElement && document.activeElement.name === 'checkout') return;

    event.preventDefault();
    var data = new FormData(form);
    var button = form.querySelector('.dk-buy__add') || form.querySelector('button[type="submit"]');
    var label = button ? button.textContent : '';
    if (button) { button.disabled = true; button.textContent = 'Adding…'; }

    fetch(root + 'cart/add.js', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data
    })
      .then(function (r) {
        if (!r.ok) throw new Error('add failed');
        return r.json();
      })
      .then(function () {
        if (button) { button.disabled = false; button.textContent = label; }
        flash(button, 'Added');
        if (window.dkCartDrawer) {
          window.dkCartDrawer.open();
          return window.dkCartDrawer.load();
        }
        window.location.href = root + 'cart';
      })
      .catch(function () {
        if (button) { button.disabled = false; button.textContent = label; }
        form.submit();
      });
  });
})();
