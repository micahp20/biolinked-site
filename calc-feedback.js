/*
 * Calculator add actions — visible result or a clear reason.
 *
 * Client protocol pages copy the same calculator. "Add to My List" and
 * "Add to my schedule" / "Add compound" do run, but the new row or the
 * error is rendered above or below the button, often outside the phone
 * viewport, and there is no toast. The schedule confirm button is also
 * disabled until a weekday is picked, so that tap never fires. A capture
 * listener cancels "Add to my schedule" when the draw is incomplete and
 * only fills a warning the member cannot see.
 *
 * This file is loaded from <head> so its click listener is registered
 * before those capture guards. It does not change doses, weekday
 * overrides, invoices, or saved lists. It only reveals what the existing
 * handlers already did, and it lets a disabled confirm button report why
 * it cannot save.
 */
(function(){
  'use strict';
  var SEL = '#pc-addbtn,#pc-schbtn,#pc-schedbtn,#ed-addbtn,#gkAddBtn,#sa-confirm,#ma-confirm,[data-x="save"],[data-eda="save"]';
  var style = document.createElement('style');
  style.id = 'bl-calc-feedback-css';
  style.textContent = ''
    + '#bl-calc-toast{position:fixed;left:50%;bottom:calc(88px + env(safe-area-inset-bottom));'
    + 'transform:translate(-50%,12px);z-index:400;max-width:min(92vw,420px);'
    + 'background:#1b1d20;color:#fff;border:1px solid #CFB87C;border-radius:14px;'
    + 'padding:12px 16px;font:600 15px/1.4 Montserrat,Outfit,system-ui,sans-serif;'
    + 'text-align:center;box-shadow:0 10px 28px rgba(0,0,0,.35);opacity:0;pointer-events:none;'
    + 'transition:opacity .18s ease,transform .18s ease}'
    + '#bl-calc-toast.on{opacity:1;transform:translate(-50%,0)}'
    + '#sa-pan [data-x="save"][data-bl-need="1"],#ed-addpan [data-eda="save"][data-bl-need="1"]{opacity:.55}'
    + '#a2hs{position:relative!important;inset:auto!important;left:auto!important;right:auto!important;bottom:auto!important;z-index:auto!important;width:auto!important;max-width:none!important;margin:12px 16px!important;transform:none!important}'
    + '#s-calc .pc-wrap{padding-bottom:140px}'
    + '@media (prefers-reduced-motion:reduce){#bl-calc-toast{transition:none}}';
  (document.head || document.documentElement).appendChild(style);

  function $(id){ return document.getElementById(id); }
  function text(id){ var e=$(id); return e ? (e.innerText || '') : ''; }
  function reduce(){
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch(e){ return false; }
  }
  function reveal(el){
    if(!el || !el.scrollIntoView) return;
    try { el.scrollIntoView({block:'center', inline:'nearest', behavior: reduce() ? 'auto' : 'smooth'}); }
    catch(e){ try { el.scrollIntoView(); } catch(err){} }
  }
  function toast(msg){
    msg = String(msg || '').replace(/\s+/g, ' ').trim();
    if(!msg) return;
    var el = $('bl-calc-toast');
    if(!el){
      el = document.createElement('div');
      el.id = 'bl-calc-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      (document.body || document.documentElement).appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(function(){ el.classList.remove('on'); }, 4600);
  }
  function num(id){
    var e = $(id);
    var n = parseFloat(e && e.value);
    return isFinite(n) ? n : NaN;
  }
  function itemCount(){ return document.querySelectorAll('#pc-list .pc-item').length; }
  function notice(){
    var parts = [];
    var cs = document.querySelector('.cs-toast.on');
    if(cs && (cs.textContent || '').trim()) parts.push(cs.textContent.trim());
    var gk = document.getElementById('gkToast');
    if(gk && gk.classList.contains('show') && (gk.textContent || '').trim()) parts.push(gk.textContent.trim());
    return parts.join(' ');
  }
  function warn(){
    var w = $('pc-warn');
    if(!w || w.hidden) return '';
    return (w.textContent || '').replace(/\s+/g, ' ').trim();
  }
  function snap(){
    var pan = $('sa-pan'), ed = $('ed-addpan'), sched = $('s-sched-add'), man = $('s-man-add');
    return {
      items: itemCount(),
      list: text('pc-list'),
      warn: warn(),
      panHidden: !pan || pan.hidden,
      pan: pan ? (pan.innerText || '') : '',
      edHidden: !ed || ed.hidden,
      schedOn: !!(sched && sched.classList.contains('on')),
      manOn: !!(man && man.classList.contains('on')),
      doses: text('doses') + '\n' + text('gkList'),
      notice: notice()
    };
  }
  function addedName(){
    var n = document.querySelector('#pc-list .pc-item-name');
    return n ? n.textContent.trim() : 'that compound';
  }
  function checkedDays(box){
    return box ? box.querySelectorAll('input[type="checkbox"]:checked').length : 0;
  }
  function report(btn, before){
    var items = itemCount();
    var list = text('pc-list');
    if(items > before.items || (list && list !== before.list && items)){
      var saving = /save/i.test(btn.textContent || '');
      toast((saving ? 'Saved ' : 'Added ') + addedName() + (saving ? ' on your list.' : ' to your list.'));
      reveal(document.querySelector('#pc-list .pc-item'));
      return;
    }
    var note = notice();
    if(note && note !== before.notice){
      toast(note);
      reveal(document.querySelector('.cs-toast.on, #gkToast.show, #doses .sa-own, #gkList .drow'));
      return;
    }
    var message = warn();
    if(message && message !== before.warn){
      toast(message);
      reveal($('pc-warn'));
      return;
    }
    var pan = $('sa-pan');
    if(pan && !pan.hidden && (before.panHidden || (pan.innerText || '') !== before.pan)){
      reveal(pan);
      if(!pan.querySelector('[data-d], [data-edn2d]')){
        toast((pan.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 180) || 'Enter the vial size, BAC water, and dose first.');
        return;
      }
      toast(checkedDays(pan)
        ? 'Confirm the days, then add it to the schedule.'
        : 'Choose at least one day, then confirm to add it to the schedule.');
      return;
    }
    var ed = $('ed-addpan');
    if(ed && !ed.hidden && before.edHidden){
      reveal(ed);
      toast('Choose the compound and at least one day, then tap Add to schedule.');
      return;
    }
    var sched = $('s-sched-add'), man = $('s-man-add');
    if(sched && sched.classList.contains('on') && !before.schedOn){
      toast('Pick the days, then confirm to add it to the schedule.');
      reveal(sched.querySelector('#sa-err, #sa-days, h1') || sched);
      return;
    }
    if(man && man.classList.contains('on') && !before.manOn){
      toast('Enter a name, dose, and at least one day, then confirm.');
      reveal(man.querySelector('#ma-err, #ma-name, h1') || man);
      return;
    }
    var doses = text('doses') + '\n' + text('gkList');
    if(doses !== before.doses){
      if(!document.querySelector('.cs-toast.on')) toast('Added to the schedule.');
      reveal(document.querySelector('#doses .sa-own, #gkList .pe-card, #gkList .drow'));
      return;
    }
    if(message){
      toast(message);
      reveal($('pc-warn'));
      return;
    }
    var err = document.querySelector('#sa-err:not([hidden]), #ma-err:not([hidden]), .pe-error:not([hidden])');
    if(err && (err.textContent || '').trim()){
      toast(err.textContent.trim());
      reveal(err);
      return;
    }
    if(!(num('pc-vial') > 0 && num('pc-bac') > 0 && num('pc-dose') > 0)){
      toast('Enter a vial size, BAC water, and dose greater than zero.');
      reveal($('pc-vial') || btn);
      return;
    }
    var compound = $('pc-compound');
    var name = $('pc-name');
    if(compound && compound.value === '__custom__' && name && !name.value.trim()){
      toast('Enter a compound name before adding it.');
      reveal(name);
      return;
    }
    if(btn.matches('[data-x="save"], [data-eda="save"], #sa-confirm, #ma-confirm')){
      toast('Choose at least one day before adding to the schedule.');
      reveal(btn);
      return;
    }
    toast('Nothing was added. Check the entries and try again.');
    reveal(btn);
  }

  var serial = 0;
  document.addEventListener('click', function(e){
    var btn = e.target && e.target.closest && e.target.closest(SEL);
    if(!btn) return;
    var before = snap();
    var id = ++serial;
    setTimeout(function(){ if(id === serial) report(btn, before); }, 60);
  }, true);

  /* A disabled confirm control never receives a click, so the member sees
     nothing. Keep it focusable and let the existing save handler refuse an
     incomplete day selection; the listener above explains why. */
  function relax(btn){
    if(!btn || btn.dataset.blRelaxing === '1') return;
    if(!btn.disabled && !btn.hasAttribute('disabled')){
      if(btn.getAttribute('data-bl-need') === '1'){
        var box = btn.closest('#sa-pan, #ed-addpan');
        if(box && checkedDays(box)) btn.removeAttribute('data-bl-need');
      }
      return;
    }
    btn.dataset.blRelaxing = '1';
    btn.disabled = false;
    btn.removeAttribute('disabled');
    btn.setAttribute('data-bl-need', '1');
    setTimeout(function(){ delete btn.dataset.blRelaxing; }, 0);
  }
  function relaxAll(){
    var nodes = document.querySelectorAll('#sa-pan [data-x="save"], #ed-addpan [data-eda="save"]');
    for(var i = 0; i < nodes.length; i++) relax(nodes[i]);
  }
  function parkBanner(){
    var banner = document.getElementById('a2hs');
    var scroll = document.getElementById('scroll');
    if(banner && scroll && banner.parentElement !== scroll) scroll.insertBefore(banner, scroll.firstChild);
  }
  function boot(){
    parkBanner();
    relaxAll();
    if(!window.MutationObserver) return;
    new MutationObserver(relaxAll).observe(document.documentElement, {
      subtree: true, childList: true, attributes: true, attributeFilter: ['disabled', 'hidden']
    });
    document.addEventListener('change', relaxAll, true);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
