/*
 * BioLinked — peptide catalog view.
 *
 * Renders one card per /cheat-sheet-data.js entry over the shared catalog skin
 * in /catalog.css. No compound data is duplicated here: dosing comes from
 * CHEAT_SHEET_DATA and the sell price comes from PRODUCT_PRICES via priceFor(),
 * so both stay editable in exactly one place each.
 *
 * Expects on the page, in this order:
 *   <script src="/cheat-sheet-data.js">   window.CHEAT_SHEET_DATA
 *   <script src="/product-prices.js">     window.PRODUCT_PRICES + priceFor/priceLabel
 *   <script src="/catalog.js">
 * and these element ids: grid, chips, search, search-clear, search-wrap,
 * empty, result-line.
 */
(function () {
  'use strict';

  var DATA = window.CHEAT_SHEET_DATA || [];

  var CAT_META = {
    fatloss:      'Fat Loss',
    muscle:       'Muscle',
    gh:           'Growth Hormone',
    healing:      'Healing',
    longevity:    'Longevity',
    cognition:    'Cognition',
    sleep:        'Sleep',
    energy:       'Energy / NAD+',
    immunity:     'Immunity',
    sexual:       'Sexual Health',
    hormones:     'Hormones',
    skin:         'Skin & Cosmetic',
    blend:        'Blend',
    bioregulator: 'Bioregulator'
  };

  var grid     = document.getElementById('grid');
  var chipsEl  = document.getElementById('chips');
  var searchEl = document.getElementById('search');
  var clearEl  = document.getElementById('search-clear');
  var wrapEl   = document.getElementById('search-wrap');
  var emptyEl  = document.getElementById('empty');
  var resultEl = document.getElementById('result-line');

  var activeCat = 'all';
  var query = '';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function catLabel(c) { return CAT_META[c] || c || 'Other'; }

  /* Price record for a cheat-sheet entry, or null when BioLinked doesn't
     currently sell that compound. Never invents a price. */
  function priceRec(d) {
    return (typeof window.priceFor === 'function') ? window.priceFor(d.name) : null;
  }

  /* one-line collapsed summary: the dose, and how it's taken */
  function doseLine(d) {
    var bits = [];
    if (d.dose) bits.push('<b>' + esc(d.dose) + '</b>');
    if (d.freq) bits.push(esc(d.freq));
    return bits.join(' &middot; ');
  }

  var BOOK_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>' +
    '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>' +
    '</svg>';

  function cell(label, value, cls) {
    return '<div class="edu-cell' + (cls ? ' ' + cls : '') + '">' +
             '<div class="edu-l">' + esc(label) + '</div>' +
             '<div class="edu-v">' + esc(value || '—') + '</div>' +
           '</div>';
  }

  /* Price pill for the collapsed card header. */
  function pricePill(rec) {
    if (!rec) return '';
    var label = window.priceLabel ? window.priceLabel(rec) : rec.price;
    if (!label) return '';
    var m = /^from (\$.+)$/.exec(label);
    var inner = m ? '<span class="from">from</span>' + esc(m[1]) : esc(label);
    return '<div class="pep-price">' + inner + '</div>' +
           (rec.stock ? '' : '<div class="pep-oos">Out of stock</div>');
  }

  /* Price cell inside the Educational Information grid — carries the size
     breakdown when a compound is sold in more than one vial size. */
  function priceCell(rec) {
    if (!rec) {
      return '<div class="edu-cell price full">' +
               '<div class="edu-l">Price</div>' +
               '<div class="edu-v">Not currently stocked</div>' +
             '</div>';
    }
    var label = (window.priceLabel ? window.priceLabel(rec) : rec.price) || '—';
    var html = '<div class="edu-cell price full">' +
                 '<div class="edu-l">Price' + (rec.sku ? ' &middot; SKU ' + esc(rec.sku) : '') + '</div>' +
                 '<div class="edu-v">' + esc(label) +
                   (rec.size ? ' <span style="font-size:12px;font-weight:500;color:var(--muted)">' + esc(rec.size) + '</span>' : '') +
                 '</div>';
    if (rec.variants && rec.variants.length) {
      html += '<div class="edu-sizes">' + rec.variants.map(function (v) {
        return '<span class="edu-size">' + esc(v.size) + '<b>' + esc(v.price) + '</b></span>';
      }).join('') + '</div>';
    }
    if (!rec.stock) html += '<div class="edu-flag">Out of stock &mdash; ask about restock</div>';
    html += '</div>';
    return html;
  }

  function cardHTML(d) {
    var rec = priceRec(d);
    return '<details class="pep" data-cat="' + esc(d.cat) + '">' +
      '<summary>' +
        '<div class="pep-main">' +
          '<div class="pep-cat">' + esc(d.purpose || catLabel(d.cat)) + '</div>' +
          '<div class="pep-name">' + esc(d.name) + '</div>' +
          '<div class="pep-dose">' + doseLine(d) + '</div>' +
        '</div>' +
        '<div class="pep-right">' +
          '<div class="pep-chev" aria-hidden="true">+</div>' +
          pricePill(rec) +
        '</div>' +
      '</summary>' +
      '<div class="edu">' +
        '<div class="edu-head">' + BOOK_SVG + '<span>Educational Information</span></div>' +
        '<div class="edu-grid">' +
          cell('Amount in Vial', d.vial) +
          cell('BAC Water', d.bac) +
          cell('Dosage', d.dose, 'dose') +
          cell('Syringe Units', d.units) +
          cell('Timing', d.timing) +
          cell('Frequency', d.freq) +
          cell('Duration', d.dur, 'full') +
          priceCell(rec) +
        '</div>' +
      '</div>' +
    '</details>';
  }

  function matches(d) {
    if (activeCat !== 'all' && d.cat !== activeCat) return false;
    if (!query) return true;
    var rec = priceRec(d);
    var hay = (d.name + ' ' + (d.purpose || '') + ' ' + catLabel(d.cat) + ' ' +
               (d.timing || '') + ' ' + (d.freq || '') + ' ' +
               (rec ? (rec.name + ' ' + (rec.keywords || '')) : '')).toLowerCase();
    return query.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function render() {
    var list = DATA.filter(matches);
    grid.innerHTML = list.map(cardHTML).join('');
    emptyEl.classList.toggle('on', list.length === 0);
    grid.style.display = list.length === 0 ? 'none' : '';
    var scope = activeCat === 'all' ? 'the full library' : catLabel(activeCat);
    resultEl.innerHTML = '<b>' + list.length + '</b> ' +
      (list.length === 1 ? 'compound' : 'compounds') + ' &middot; ' + esc(scope);
  }

  function buildChips() {
    var counts = {};
    DATA.forEach(function (d) { counts[d.cat] = (counts[d.cat] || 0) + 1; });

    var keys = ['all'].concat(Object.keys(CAT_META).filter(function (k) { return counts[k]; }));
    // any category present in the data but missing from CAT_META still gets a chip
    Object.keys(counts).forEach(function (k) {
      if (keys.indexOf(k) === -1) keys.push(k);
    });

    chipsEl.innerHTML = keys.map(function (k) {
      var label = k === 'all' ? 'All' : catLabel(k);
      var n = k === 'all' ? DATA.length : counts[k];
      return '<button class="chip' + (k === 'all' ? ' active' : '') + '" type="button" ' +
             'data-cat="' + esc(k) + '" role="tab" aria-selected="' + (k === 'all') + '">' +
             esc(label) + '<span class="n">' + n + '</span></button>';
    }).join('');
  }

  chipsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.chip');
    if (!btn) return;
    activeCat = btn.getAttribute('data-cat');
    Array.prototype.forEach.call(chipsEl.querySelectorAll('.chip'), function (c) {
      var on = c === btn;
      c.classList.toggle('active', on);
      c.setAttribute('aria-selected', String(on));
    });
    render();
  });

  searchEl.addEventListener('input', function () {
    query = searchEl.value.trim().toLowerCase();
    wrapEl.classList.toggle('has-value', searchEl.value.length > 0);
    render();
  });

  clearEl.addEventListener('click', function () {
    searchEl.value = '';
    query = '';
    wrapEl.classList.remove('has-value');
    searchEl.focus();
    render();
  });

  buildChips();
  render();
})();
