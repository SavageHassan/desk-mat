/* DeskKart — AJAX add to cart with a confirmation toast. Falls back to a normal form post. */
(function () {
  function toast(message, href) {
    var old = document.querySelector('.dk-toast');
    if (old) old.remove();
    var el = document.createElement('div');
    el.className = 'dk-toast';
    el.setAttribute('role', 'status');
    el.innerHTML =
      '<span class="dk-toast__tick" aria-hidden="true">' +
      '<svg viewBox="0 0 16 16"><path d="M2 8.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</span><span class="dk-toast__msg"></span>' +
      '<a class="dk-toast__link" href="' + href + '">View cart</a>';
    el.querySelector('.dk-toast__msg').textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('dk-toast--in'); });
    setTimeout(function () {
      el.classList.remove('dk-toast--in');
      setTimeout(function () { el.remove(); }, 400);
    }, 4200);
  }

  function refreshCount(count) {
    document.querySelectorAll('cart-icon, .cart-bubble, [class*="cart-bubble"]').forEach(function (node) {
      var bubble = node.querySelector('[class*="count"], span');
      if (bubble && /^\d*$/.test(bubble.textContent.trim())) bubble.textContent = count;
    });
  }

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form.classList || !form.classList.contains('dk-buy__form')) return;
    if (document.activeElement && document.activeElement.name === 'checkout') return; /* Buy it now */

    event.preventDefault();
    var data = new FormData(form);
    var button = form.querySelector('.dk-buy__add');
    var label = button ? button.textContent : '';
    if (button) { button.disabled = true; button.textContent = 'Adding…'; }

    fetch(window.Shopify && window.Shopify.routes ? window.Shopify.routes.root + 'cart/add.js' : '/cart/add.js', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data
    })
      .then(function (r) { if (!r.ok) throw new Error('add failed'); return r.json(); })
      .then(function (item) {
        return fetch('/cart.js', { headers: { Accept: 'application/json' } })
          .then(function (r) { return r.json(); })
          .then(function (cart) {
            refreshCount(cart.item_count);
            toast(item.quantity + ' × ' + item.product_title + ' added', '/cart');
          });
      })
      .catch(function () { form.submit(); })
      .finally(function () {
        if (button) { button.disabled = false; button.textContent = label; }
      });
  });
})();
