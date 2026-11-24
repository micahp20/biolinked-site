/* BioLinked fresh-on-return (shared by every client portal).
   A phone keeps an open Safari tab or Home Screen app in memory and simply
   shows it again when the client comes back, without asking the server for
   the page. So a protocol published while the page sat in the background
   stayed hidden until a manual refresh. On every return this asks the server
   (a tiny HEAD request, never cached) whether this page changed since it was
   loaded; if it did, the page reloads itself onto the new version.
   Client data is safe: saved edits live in localStorage/Supabase, and an edit
   still waiting to sync is flushed first (its pending marker also survives a
   reload and is pushed on boot). It never reloads while the client is typing. */
(function(){
  if(window.__blFresh || !window.fetch) return; window.__blFresh = 1;
  var url = location.pathname, base = null, last = 0, waits = 0;
  function sig(r){ return r && r.ok ? (r.headers.get('etag') || r.headers.get('last-modified') || '') : ''; }
  function probe(){
    return fetch(url, { method: 'HEAD', cache: 'no-store', credentials: 'same-origin' })
      .then(sig).catch(function(){ return ''; });
  }
  function pending(){
    try{
      for(var i = 0; i < localStorage.length; i++){
        var k = localStorage.key(i) || '';
        if(/pending/.test(k) && localStorage.getItem(k)) return true;
      }
    }catch(e){}
    return false;
  }
  function typing(){
    var a = document.activeElement;
    return !!(a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable));
  }
  function reloadWhenSafe(){
    if(typing()) return;                       /* try again on the next return */
    if(pending() && waits < 6){                /* let a queued save reach the cloud first */
      waits++;
      try{ if(typeof csFlushAll === 'function') csFlushAll(); }catch(e){}
      setTimeout(reloadWhenSafe, 700);
      return;
    }
    location.reload();
  }
  function check(){
    var now = Date.now();
    if(now - last < 10000) return; last = now;
    try{
      if(navigator.serviceWorker && navigator.serviceWorker.getRegistration){
        navigator.serviceWorker.getRegistration().then(function(r){ if(r && r.update) r.update().catch(function(){}); }).catch(function(){});
      }
    }catch(e){}
    probe().then(function(s){
      if(!s) return;                           /* offline or no validator: keep what is on screen */
      if(base === null){ base = s; return; }
      if(s !== base){ waits = 0; reloadWhenSafe(); }
    });
  }
  probe().then(function(s){ if(s && base === null) base = s; });
  document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'visible') check(); });
  window.addEventListener('pageshow', function(e){ if(e.persisted){ last = 0; check(); } });
  window.addEventListener('focus', check);
  window.addEventListener('online', function(){ last = 0; check(); });
})();
