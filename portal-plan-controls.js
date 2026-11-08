/* Per-client remove and restore for protocol and schedule rows.
   Stored on this device. Does not edit catalog data, invoice amounts,
   or dose text. Saved start and end dates are ignored and are not shown. */
(function () {
  'use strict';
  if (window.__blPlanControls) return;
  window.__blPlanControls = true;

  function slug() {
    return (typeof CS_SLUG === 'string' && CS_SLUG) ? CS_SLUG : 'portal';
  }
  function storeKey() { return 'biolinked-planwin-' + slug(); }
  function load() {
    var data = { v: 1, items: {} };
    try {
      var raw = JSON.parse(localStorage.getItem(storeKey()) || 'null');
      if (raw && raw.items && typeof raw.items === 'object') data.items = raw.items;
    } catch (e) {}
    var changed = false;
    Object.keys(data.items).forEach(function (k) {
      var rec = data.items[k];
      if (!rec || !rec.removed) { delete data.items[k]; changed = true; return; }
      if (rec.start || rec.end || Object.keys(rec).length !== 1) {
        data.items[k] = { removed: true };
        changed = true;
      }
    });
    if (changed) save(data);
    return data;
  }
  function save(data) {
    try { localStorage.setItem(storeKey(), JSON.stringify(data)); } catch (e) {}
  }
  function itemKey(cycle, name) { return String(cycle || 'plan') + '\u001f' + String(name || ''); }
  function recOf(cycle, name) { return load().items[itemKey(cycle, name)] || null; }
  function removedNow(rec) { return !!(rec && rec.removed); }
  function findCompound(name) {
    var lists = [];
    if (typeof ALL !== 'undefined' && ALL) lists.push(ALL);
    if (typeof CMP !== 'undefined' && CMP && CMP !== ALL) lists.push(CMP);
    for (var L = 0; L < lists.length; L++) {
      for (var i = 0; i < lists[L].length; i++) {
        if (lists[L][i] && lists[L][i].n === name) return lists[L][i];
      }
    }
    return null;
  }
  function cycleForName(name, el) {
    var sec = el && el.closest && el.closest('.jc-cycle');
    var h = sec && sec.querySelector('.jc-cycle-head h2, h2');
    if (h && h.textContent.trim()) return h.textContent.trim();
    var c = findCompound(name);
    if (c && c.cy && c.cy.length) return c.cy[0];
    if (typeof cycCurrent === 'function') {
      try { var cur = cycCurrent(); if (cur) return cur; } catch (e) {}
    }
    return 'plan';
  }

  if (typeof due === 'function' && !due._blPlan) {
    var dueOrig = due;
    due = function (c, day) {
      if (c && typeof c === 'object' && c.n) {
        var cycle = (c.cy && c.cy[0]) || (typeof cycCurrent === 'function' ? cycCurrent() : '') || 'plan';
        if (removedNow(recOf(cycle, c.n))) return false;
      }
      return dueOrig.apply(this, arguments);
    };
    due._blPlan = true;
  }

  function paintNote() {
    var n = document.getElementById('dosenote');
    if (!n) return;
    n.textContent = n.textContent
      .replace('This is a read-only view of your schedule.', 'Remove and restore apply to your plan on this device.')
      .replace('Dates and removal apply to your plan on this device.', 'Remove and restore apply to your plan on this device.');
  }

  function controlHTML(rec) {
    return '<div class="blp-ctl" data-blp="1">' +
      '<div class="blp-actions">' +
        (rec && rec.removed
          ? '<button type="button" class="blp-btn" data-blp-act="restore">Restore to my plan</button>'
          : '<button type="button" class="blp-btn blp-remove" data-blp-act="ask">Remove from my plan</button>') +
      '</div>' +
      '<div class="blp-confirm" hidden>' +
        '<p>Remove this from your plan? The invoice and catalog stay as they are.</p>' +
        '<div class="blp-actions">' +
          '<button type="button" class="blp-btn" data-blp-act="confirm">Remove</button>' +
          '<button type="button" class="blp-btn" data-blp-act="abort">Cancel</button>' +
        '</div></div>' +
      (rec && rec.removed ? '<p class="blp-note">Removed from your plan. Restore puts it back.</p>' : '') +
      '</div>';
  }

  function writeRec(cycle, name, removed) {
    var data = load();
    var k = itemKey(cycle, name);
    if (removed) data.items[k] = { removed: true };
    else delete data.items[k];
    save(data);
  }
  function refresh() {
    try { if (typeof renderDoses === 'function') renderDoses(); } catch (e) {}
    mountAll();
  }

  function bind(box, cycle, name) {
    if (box.getAttribute('data-blp-bound')) return;
    box.setAttribute('data-blp-bound', '1');
    box.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-blp-act]');
      if (!btn || !box.contains(btn)) return;
      ev.preventDefault();
      ev.stopPropagation();
      var act = btn.getAttribute('data-blp-act');
      if (act === 'ask') { box.querySelector('.blp-confirm').hidden = false; return; }
      if (act === 'abort') { box.querySelector('.blp-confirm').hidden = true; return; }
      if (act === 'confirm') { writeRec(cycle, name, true); refresh(); return; }
      if (act === 'restore') { writeRec(cycle, name, false); refresh(); }
    });
  }

  function place(host, cycle, name) {
    if (!host || !name) return;
    var key = itemKey(cycle, name);
    var existing = host.querySelector(':scope > .blp-ctl');
    if (!existing) existing = host.querySelector('.blp-ctl');
    if (existing && existing.contains(document.activeElement)) {
      var wantRemoved = removedNow(recOf(cycle, name)) ? '1' : '0';
      if (existing.getAttribute('data-blp-removed') === wantRemoved) return;
    }
    if (existing) existing.remove();
    var wrap = document.createElement('div');
    wrap.innerHTML = controlHTML(recOf(cycle, name));
    var box = wrap.firstChild;
    box.setAttribute('data-blp-key', key);
    box.setAttribute('data-blp-removed', removedNow(recOf(cycle, name)) ? '1' : '0');
    host.appendChild(box);
    bind(box, cycle, name);
    var card = host.closest('.jc-compound, .drow, .dx-pan, .cx');
    if (card && card.classList) card.classList.toggle('blp-off', removedNow(recOf(cycle, name)));
  }

  function repairExpanders() {
    document.querySelectorAll('#doses .blp-sched').forEach(function (n) { n.remove(); });
    document.querySelectorAll('#doses .drow').forEach(function (row) {
      var sib = row.nextElementSibling;
      if (sib && (sib.classList.contains('dx-pan') || sib.classList.contains('ed-pan'))) return;
      var pan = sib;
      while (pan && !pan.classList.contains('drow')) {
        if (pan.classList.contains('dx-pan') || pan.classList.contains('ed-pan')) {
          row.insertAdjacentElement('afterend', pan);
          return;
        }
        pan = pan.nextElementSibling;
      }
    });
  }

  function mountAll() {
    repairExpanders();
    document.querySelectorAll('#protoabout .jc-compound').forEach(function (card) {
      var body = card.querySelector('.jc-body') || card;
      var nameEl = card.querySelector('summary');
      var name = nameEl ? nameEl.childNodes[0] && nameEl.childNodes[0].textContent.trim() : '';
      if (!name && nameEl) name = nameEl.textContent.trim();
      place(body, cycleForName(name, card), name);
    });
    document.querySelectorAll('.cx-bd').forEach(function (body) {
      var card = body.closest('.cx');
      var nameEl = card && card.querySelector('.cx-n');
      var name = nameEl ? nameEl.textContent.replace(/\s+/g, ' ').trim() : '';
      place(body, cycleForName(name, card), name);
    });
    document.querySelectorAll('#doses .dx-pan, #doses .ed-pan').forEach(function (pan) {
      var row = pan.previousElementSibling;
      var name = row && (row.getAttribute('data-dx') || row.getAttribute('data-ed') || ((row.querySelector('.nm') || {}).textContent || '').replace(/\s+/g, ' ').trim());
      if (!name) return;
      place(pan, cycleForName(name, null), name);
    });
    document.querySelectorAll('#doses .drow').forEach(function (row) {
      var next = row.nextElementSibling;
      if (next && (next.classList.contains('dx-pan') || next.classList.contains('ed-pan'))) return;
      if (row.querySelector('.blp-ctl')) return;
      var name = row.getAttribute('data-dx') || ((row.querySelector('.nm') || {}).textContent || '').replace(/\s+/g, ' ').trim();
      if (!name) return;
      place(row, cycleForName(name, null), name);
    });
    paintNote();
    stripInvoice();
  }

  function stripInvoice() {
    var hero = document.getElementById('payhero');
    if (hero) hero.querySelectorAll('.bal').forEach(function (n) { n.remove(); });
    document.querySelectorAll('#paylist .os').forEach(function (n) { n.remove(); });
    var sum = document.getElementById('i-sum');
    if (sum) sum.textContent = '';
  }

  if (typeof renderDoses === 'function' && !renderDoses._blPlan) {
    var rd = renderDoses;
    renderDoses = function () { var r = rd.apply(this, arguments); try { mountAll(); } catch (e) {} return r; };
    renderDoses._blPlan = true;
  }
  if (typeof renderAbout === 'function' && !renderAbout._blPlan) {
    var ra = renderAbout;
    renderAbout = function () { var r = ra.apply(this, arguments); try { mountAll(); } catch (e) {} return r; };
    renderAbout._blPlan = true;
  }
  if (typeof renderPay === 'function' && !renderPay._blPlan) {
    var rp = renderPay;
    renderPay = function () { var r = rp.apply(this, arguments); try { stripInvoice(); } catch (e) {} return r; };
    renderPay._blPlan = true;
  }
  if (typeof openInv === 'function' && !openInv._blPlan) {
    var oi = openInv;
    openInv = function () { var r = oi.apply(this, arguments); try { stripInvoice(); } catch (e) {} return r; };
    openInv._blPlan = true;
  }

  function boot() {
    try { if (typeof renderDoses === 'function') renderDoses(); } catch (e) {}
    try { mountAll(); stripInvoice(); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 0);

  window.BLPlan = {
    key: itemKey,
    load: load,
    removed: removedNow,
    mount: mountAll
  };
})();
