/* DeskKart — product page: gallery, quantity, variant selection. */
(function () {
  'use strict';

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  function money(cents) {
    var fmt = (window.Shopify && window.Shopify.money_format) || '{{amount}}';
    var value = (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (/amount_no_decimals/.test(fmt)) value = Math.round(cents / 100).toLocaleString('en-US');
    return fmt.replace(/\{\{\s*amount(_no_decimals)?(_with_comma_separator)?\s*\}\}/, value);
  }

  function init(scope) {
    var pdp = $('[data-dk-pdp]', scope || document);
    if (!pdp || pdp.dataset.dkReady) return;
    pdp.dataset.dkReady = '1';

    /* ---------------------------------------------------------- gallery */
    var shots = $$('[data-dk-shot]', pdp);
    var thumbs = $$('[data-dk-thumb]', pdp);
    function show(i) {
      shots.forEach(function (s) { s.classList.toggle('is-active', s.getAttribute('data-dk-shot') === String(i)); });
      thumbs.forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('data-dk-thumb') === String(i)); });
    }
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () { show(t.getAttribute('data-dk-thumb')); });
    });

    /* --------------------------------------------------------- quantity */
    $$('[data-dk-qty]', pdp).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = $('.dk-qty__input', btn.parentNode);
        if (!input) return;
        var next = (parseInt(input.value, 10) || 1) + parseInt(btn.getAttribute('data-dk-qty'), 10);
        input.value = Math.max(1, next);
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    /* --------------------------------------------------------- variants */
    var dataEl = $('[data-dk-variants]', pdp);
    if (!dataEl) return;
    var variants;
    try { variants = JSON.parse(dataEl.textContent); } catch (e) { return; }
    if (!variants || !variants.length) return;

    var idField = $('[data-dk-variant-id]', pdp);
    var addBtn = $('[data-dk-add]', pdp);
    var stock = $('[data-dk-stock]', pdp);
    var stockText = $('[data-dk-stock-text]', pdp);
    var compare = $('[data-dk-compare]', pdp);
    var inputs = $$('[data-dk-opt-input]', pdp);
    if (!inputs.length) return;

    function selected() {
      var out = [];
      inputs.forEach(function (input) {
        if (!input.checked) return;
        out[Number(input.getAttribute('data-dk-opt-input'))] = input.value;
      });
      return out;
    }

    function match(choice) {
      for (var i = 0; i < variants.length; i++) {
        var v = variants[i];
        var ok = true;
        for (var j = 0; j < choice.length; j++) {
          if (choice[j] !== undefined && v.options[j] !== choice[j]) { ok = false; break; }
        }
        if (ok) return v;
      }
      return null;
    }

    /* grey out option values that cannot be reached from the current choice */
    function markUnavailable(choice) {
      inputs.forEach(function (input) {
        var idx = Number(input.getAttribute('data-dk-opt-input'));
        var probe = choice.slice();
        probe[idx] = input.value;
        var found = match(probe);
        var pill = input.closest('.dk-opt__pill');
        if (pill) pill.classList.toggle('is-off', !found || !found.available);
      });
    }

    function apply() {
      var choice = selected();

      inputs.forEach(function (input) {
        var pill = input.closest('.dk-opt__pill');
        if (pill) pill.classList.toggle('is-on', input.checked);
      });
      $$('[data-dk-opt-value]', pdp).forEach(function (label) {
        var idx = Number(label.getAttribute('data-dk-opt-value'));
        if (choice[idx] !== undefined) label.textContent = choice[idx];
      });

      markUnavailable(choice);

      var variant = match(choice);
      if (!variant) {
        if (addBtn) { addBtn.disabled = true; addBtn.textContent = 'Unavailable'; }
        return;
      }

      if (idField) idField.value = variant.id;

      $$('[data-dk-price]', document).forEach(function (el) { el.textContent = money(variant.price); });
      if (compare) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          compare.textContent = money(variant.compare_at_price);
          compare.hidden = false;
        } else {
          compare.hidden = true;
        }
      }

      if (stock) stock.classList.toggle('is-out', !variant.available);
      if (stockText) stockText.textContent = variant.available ? 'In stock, ready to dispatch' : 'Currently unavailable';

      if (addBtn) {
        addBtn.disabled = !variant.available;
        addBtn.textContent = variant.available ? 'Add to cart' : 'Sold out';
      }
      $$('.dk-stickybuy .dk-btn').forEach(function (b) {
        b.disabled = !variant.available;
        b.textContent = variant.available ? 'Add to cart' : 'Sold out';
      });

      /* keep the URL shareable without reloading */
      if (window.history && window.history.replaceState) {
        var url = pdp.getAttribute('data-dk-product-url') + '?variant=' + variant.id;
        window.history.replaceState({}, '', url);
      }

      /* jump the gallery to this variant's own image, if it has one */
      if (variant.featured_media && typeof variant.featured_media.position === 'number') {
        show(variant.featured_media.position - 1);
      }
    }

    inputs.forEach(function (input) { input.addEventListener('change', apply); });
    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }
  document.addEventListener('shopify:section:load', function (e) { init(e.target); });
})();
