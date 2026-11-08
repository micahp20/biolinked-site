/* Client plan window: start/end dates and remove/restore.
   Stored on this device under the page slug. Does not edit catalog data,
   invoice amounts, or the dose text. */
(function () {
  'use strict';
  if (window.__blPlanControls) return;
  window.__blPlanControls = true;

  function slug() {
    return (typeof CS_SLUG === 'string' && CS_SLUG) ? CS_SLUG : 'portal';
  }
  function storeKey() { return 'biolinked-planwin-' + slug(); }
  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(storeKey()) || 'null');
      if (raw && raw.items && typeof raw.items === 'object') return raw;
    } catch (e) {}
    return { v: 1, items: {} };
  }
  function save(data) {
    try { localStorage.setItem(storeKey(), JSON.stringify(data)); } catch (e) {}
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function validDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s || ''); }
  function itemKey(cycle, name) { return String(cycle || 'plan') + '\u001f' + String(name || ''); }
  function recOf(cycle, name) { return load().items[itemKey(cycle, name)] || null; }
  function hiddenNow(rec) {
    if (!rec) return false;
    if (rec.removed) return true;
    var t = todayStr();
    if (rec.start && t < rec.start) return true;
    if (rec.end && t > rec.end) return true;
    return false;
  }
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
        if (hiddenNow(recOf(cycle, c.n))) return false;
      }
      return dueOrig.apply(this, arguments);
    };
    due._blPlan = true;
  }

  function paintNote() {
    var n = document.getElementById('dosenote');
    if (!n) return;
    n.textContent = n.textContent.replace(
      'This is a read-only view of your schedule.',
      'Dates and removal apply to your plan on this device.'
    );
  }

  function field(label, cls, value) {
    return '<label class="blp-lab">' + label +
      '<input class="blp-date ' + cls + '" type="date" value="' + (value || '') + '"></label>';
  }
  function controlHTML(rec, draft) {
    var d = draft || rec || {};
    return '<div class="blp-ctl" data-blp="1">' +
      '<div class="blp-row">' + field('Start', 'blp-start', d.start) + field('End', 'blp-end', d.end) + '</div>' +
      '<p class="blp-err" hidden>End date must be on or after the start date.</p>' +
      '<div class="blp-actions">' +
        '<button type="button" class="blp-btn" data-blp-act="save">Save dates</button>' +
        '<button type="button" class="blp-btn" data-blp-act="cancel">Cancel</button>' +
        '<button type="button" class="blp-btn" data-blp-act="clear">Clear</button>' +
      '</div>' +
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

  function readDraft(box) {
    return {
      start: (box.querySelector('.blp-start') || {}).value || '',
      end: (box.querySelector('.blp-end') || {}).value || ''
    };
  }
  function showErr(box, on) {
    var e = box.querySelector('.blp-err');
    if (e) e.hidden = !on;
  }
  function writeRec(cycle, name, rec) {
    var data = load();
    var k = itemKey(cycle, name);
    if (!rec || (!rec.start && !rec.end && !rec.removed)) delete data.items[k];
    else data.items[k] = rec;
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
      var saved = recOf(cycle, name) || {};
      if (act === 'ask') { box.querySelector('.blp-confirm').hidden = false; return; }
      if (act === 'abort') { box.querySelector('.blp-confirm').hidden = true; return; }
      if (act === 'cancel') {
        var parent = box.parentNode;
        var holder = document.createElement('div');
        holder.innerHTML = controlHTML(saved);
        var next = holder.firstChild;
        next.setAttribute('data-blp-key', itemKey(cycle, name));
        parent.replaceChild(next, box);
        bind(next, cycle, name);
        return;
      }
      if (act === 'clear') {
        var start = box.querySelector('.blp-start');
        var end = box.querySelector('.blp-end');
        if (start) start.value = '';
        if (end) end.value = '';
        showErr(box, false);
        writeRec(cycle, name, saved.removed ? { removed: true } : null);
        refresh();
        return;
      }
      if (act === 'save') {
        var draft = readDraft(box);
        if (draft.start && !validDate(draft.start)) return;
        if (draft.end && !validDate(draft.end)) return;
        if (draft.start && draft.end && draft.end < draft.start) { showErr(box, true); return; }
        showErr(box, false);
        writeRec(cycle, name, { start: draft.start, end: draft.end, removed: !!saved.removed });
        refresh();
        return;
      }
      if (act === 'confirm') {
        writeRec(cycle, name, { start: saved.start || '', end: saved.end || '', removed: true });
        refresh();
        return;
      }
      if (act === 'restore') {
        writeRec(cycle, name, (saved.start || saved.end) ? { start: saved.start || '', end: saved.end || '', removed: false } : null);
        refresh();
      }
    });
  }

  function place(host, cycle, name) {
    if (!host || !name) return;
    var key = itemKey(cycle, name);
    var existing = host.querySelector('.blp-ctl');
    if (existing && existing.contains(document.activeElement)) {
      var wantRemoved = (recOf(cycle, name) && recOf(cycle, name).removed) ? '1' : '0';
      if (existing.getAttribute('data-blp-removed') === wantRemoved) return;
    }
    if (existing) existing.remove();
    var wrap = document.createElement('div');
    wrap.innerHTML = controlHTML(recOf(cycle, name));
    var box = wrap.firstChild;
    box.setAttribute('data-blp-key', key);
    box.setAttribute('data-blp-removed', (recOf(cycle, name) && recOf(cycle, name).removed) ? '1' : '0');
    host.appendChild(box);
    bind(box, cycle, name);
    var card = host.closest('.jc-compound, .drow, .dx-pan');
    var rec = recOf(cycle, name);
    if (card && card.classList) card.classList.toggle('blp-off', !!(rec && rec.removed));
  }

  function mountAll() {
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
    document.querySelectorAll('#doses .drow').forEach(function (row) {
      var name = row.getAttribute('data-dx') || ((row.querySelector('.nm') || {}).textContent || '').replace(/\s+/g, ' ').trim();
      if (!name) return;
      var compound = findCompound(name);
      var cycle = (compound && compound.cy && compound.cy[0]) || cycleForName(name, null);
      if (!hiddenNow(recOf(cycle, name))) return;
      var next = row.nextElementSibling;
      if (next && (next.classList.contains('dx-pan') || next.classList.contains('blp-sched'))) next.remove();
      row.remove();
    });
    document.querySelectorAll('#doses .dx-pan').forEach(function (pan) {
      var row = pan.previousElementSibling;
      var name = row && row.getAttribute('data-dx');
      if (!name) return;
      place(pan, cycleForName(name, null), name);
    });
    document.querySelectorAll('#doses .drow').forEach(function (row) {
      var next = row.nextElementSibling;
      if (next && (next.classList.contains('dx-pan') || next.classList.contains('blp-sched'))) return;
      var nameEl = row.querySelector('.nm');
      var name = nameEl ? nameEl.textContent.replace(/\s+/g, ' ').trim() : '';
      if (!name) return;
      var det = document.createElement('details');
      det.className = 'blp-sched';
      det.innerHTML = '<summary>Plan dates</summary><div class="blp-sched-body"></div>';
      row.insertAdjacentElement('afterend', det);
      place(det.querySelector('.blp-sched-body'), cycleForName(name, null), name);
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
    today: todayStr,
    hidden: hiddenNow,
    mount: mountAll
  };
})();
