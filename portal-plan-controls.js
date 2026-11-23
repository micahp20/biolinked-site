/* Per-client remove and restore for protocol and schedule rows.
   Synced by page slug through save_state/get_state (kind 'plan').
   localStorage is an offline cache only. Does not edit catalog data,
   invoice amounts, or dose text. Saved start and end dates are ignored
   and are not shown. */
(function () {
  'use strict';
  if (window.__blPlanControls) return;
  window.__blPlanControls = true;

  function slug() {
    if (typeof CS_SLUG === 'string' && CS_SLUG) return CS_SLUG;
    if (typeof BL_SLUG === 'string' && BL_SLUG) return BL_SLUG;
    return 'portal';
  }
  function storeKey() { return 'biolinked-planwin-' + slug(); }
  function pendingKey() { return 'bl-cs-pending:' + slug() + ':plan'; }
  function verKey() { return 'bl-cs-ver:' + slug() + ':plan'; }

  function getPending() { try { return !!localStorage.getItem(pendingKey()); } catch (e) { return false; } }
  function setPending(on) {
    try {
      if (on) localStorage.setItem(pendingKey(), String(Date.now()));
      else localStorage.removeItem(pendingKey());
    } catch (e) {}
  }
  function lastVer() { try { return parseInt(localStorage.getItem(verKey()) || '0', 10) || 0; } catch (e) { return 0; } }
  function setLastVer(v) { try { localStorage.setItem(verKey(), String(v || 0)); } catch (e) {} }

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
    if (changed) saveLocal(data);
    return data;
  }
  function saveLocal(data) {
    try { localStorage.setItem(storeKey(), JSON.stringify({ v: 1, items: data.items || {} })); } catch (e) {}
  }
  function hasLocalEdits(data) {
    data = data || load();
    return !!(data.items && Object.keys(data.items).length);
  }

  /* Reuse the page's existing RPC helper; never embed credentials here. */
  function rpc(fn, body) {
    if (typeof csRpc === 'function') return csRpc(fn, body);
    if (typeof blRpcRaw === 'function') {
      return blRpcRaw(fn, body).then(function (r) {
        return { status: r && r.ok ? 200 : (r && r.status) || 0, body: r && (r.data !== undefined ? r.data : r.err) };
      }).catch(function () { return { status: 0, body: null }; });
    }
    if (typeof CS_URL === 'string' && typeof CS_ANON === 'string') {
      try {
        return fetch(CS_URL + fn, {
          method: 'POST',
          headers: { 'apikey': CS_ANON, 'Authorization': 'Bearer ' + CS_ANON, 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }).then(function (r) {
          return r.text().then(function (t) {
            var b = null; try { b = JSON.parse(t); } catch (e) { b = t; }
            return { status: r.status, body: b };
          });
        }).catch(function () { return { status: 0, body: null }; });
      } catch (e) { return Promise.resolve({ status: 0, body: null }); }
    }
    return Promise.resolve({ status: 0, body: null });
  }

  function hookStat() {
    if (typeof csStat !== 'function' || csStat._blWait) return;
    var orig = csStat;
    csStat = function (s) {
      orig.apply(this, arguments);
      try {
        if (s === 'offline') {
          var e = document.getElementById('csstat');
          if (e) e.textContent = 'Waiting to sync';
        }
      } catch (err) {}
    };
    csStat._blWait = true;
    try { if (typeof window !== 'undefined') window.csStat = csStat; } catch (e) {}
  }
  hookStat();

  function stat(s) {
    hookStat();
    if (typeof csStat === 'function') {
      if (s === 'wait') csStat('offline');
      else csStat(s);
      return;
    }
    var el = document.getElementById('blp-sync');
    if (!el) {
      el = document.createElement('div');
      el.id = 'blp-sync';
      el.className = 'blp-note';
      var host = document.getElementById('dosenote') || document.getElementById('doses');
      if (host && host.parentNode) host.parentNode.insertBefore(el, host.nextSibling);
      else return;
    }
    var map = { saving: 'Saving\u2026', saved: 'Saved', wait: 'Waiting to sync', error: 'Save failed', '': '' };
    el.textContent = map[s] || '';
    if (s === 'saved') {
      clearTimeout(stat._t);
      stat._t = setTimeout(function () {
        var x = document.getElementById('blp-sync');
        if (x && x.textContent === 'Saved') x.textContent = '';
      }, 1800);
    }
  }

  var planVer = lastVer();
  var pushing = false;
  var wantPush = false;

  function planRow(rows) {
    var found = null;
    (Array.isArray(rows) ? rows : []).forEach(function (row) {
      if (row && row.kind === 'plan') found = row;
    });
    return found;
  }

  function applyCloud(row) {
    var items = (row && row.payload && row.payload.items && typeof row.payload.items === 'object') ? row.payload.items : {};
    var data = { v: 1, items: {} };
    Object.keys(items).forEach(function (k) {
      if (items[k] && items[k].removed) data.items[k] = { removed: true };
    });
    saveLocal(data);
    if (typeof row.version === 'number') {
      planVer = row.version;
      setLastVer(planVer);
    }
    setPending(false);
    try { refresh(); } catch (e) { try { mountAll(); } catch (e2) {} }
  }

  function push() {
    if (pushing) { wantPush = true; return; }
    var data = load();
    pushing = true;
    wantPush = false;
    stat('saving');
    rpc('save_state', {
      p_slug: slug(),
      p_kind: 'plan',
      p_payload: { v: 1, items: data.items || {} },
      p_expected_version: planVer || 0
    }).then(function (r) {
      pushing = false;
      if (r.status === 200) {
        planVer = typeof r.body === 'number' ? r.body : planVer + 1;
        setLastVer(planVer);
        setPending(false);
        stat('saved');
        if (wantPush) push();
        return;
      }
      if (r.status === 409) {
        return pull(true);
      }
      if (r.status === 0) { stat('wait'); return; }
      stat('error');
    }).catch(function () { pushing = false; stat('wait'); });
  }

  function pull(fromConflict) {
    return rpc('get_state', { p_slug: slug() }).then(function (r) {
      if (r.status === 0) { stat('wait'); return; }
      if (r.status !== 200) return;
      var row = planRow(r.body);
      var cloudVer = row && typeof row.version === 'number' ? row.version : 0;
      var pending = getPending() || (hasLocalEdits() && lastVer() === 0 && cloudVer === 0);
      if (pending && !(cloudVer > lastVer())) {
        planVer = cloudVer;
        push();
        return;
      }
      if (row) applyCloud(row);
      else if (!pending) { planVer = 0; setLastVer(0); }
      if (fromConflict) stat('');
    }).catch(function () { stat('wait'); });
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
      .replace('This is a read-only view of your schedule.', 'Remove and restore sync to your other devices.')
      .replace('Dates and removal apply to your plan on this device.', 'Remove and restore sync to your other devices.')
      .replace('Remove and restore apply to your plan on this device.', 'Remove and restore sync to your other devices.');
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
    saveLocal(data);
    setPending(true);
    push();
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
    paintRemoved();
    stripInvoice();
  }

  function paintRemoved() {
    var old = document.getElementById('blp-removed');
    if (old) old.remove();
    var host = document.getElementById('doses');
    if (!host) return;
    var data = load();
    var keys = Object.keys(data.items).filter(function (k) { return data.items[k] && data.items[k].removed; });
    if (!keys.length) return;
    var box = document.createElement('div');
    box.id = 'blp-removed';
    box.className = 'blp-ctl';
    var note = document.createElement('p');
    note.className = 'blp-note';
    note.textContent = 'Removed from your plan. Restore puts a compound back. The invoice and catalog stay as they are.';
    box.appendChild(note);
    keys.forEach(function (k) {
      var name = k.split('\u001f').slice(1).join('\u001f') || k;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'blp-btn';
      btn.setAttribute('data-blp-act', 'restore');
      btn.textContent = 'Restore ' + name;
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var parts = k.split('\u001f');
        writeRec(parts[0], parts.slice(1).join('\u001f'), false);
        refresh();
      });
      box.appendChild(btn);
    });
    host.appendChild(box);
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
    try { pull(); } catch (e) {}
  }
  function resume() {
    if (document.visibilityState && document.visibilityState !== 'visible') return;
    if (getPending()) push();
    else pull();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 0);
  try {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') resume();
    });
    window.addEventListener('online', resume);
    window.addEventListener('pageshow', function (e) { if (e.persisted) resume(); });
  } catch (e) {}

  window.BLPlan = {
    key: itemKey,
    load: load,
    removed: removedNow,
    mount: mountAll,
    pull: pull
  };
})();
