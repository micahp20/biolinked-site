/* ======================================================================
   BioLinked site theme controller — dark only.

   The site runs the Colorado dark palette. This script pins
   data-theme="dark" so a visitor holding a cached copy of a page, or a
   stale saved preference from the old toggle, cannot end up on a
   half-light page. It also removes any toggle button still sitting in a
   cached copy. bl-theme.css carries the dark values under
   :root[data-theme="dark"].
   ====================================================================== */
(function(){
  var root = document.documentElement;

  function forceDark(){
    root.setAttribute('data-theme', 'dark');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#0b0b0c');
    var stale = document.querySelectorAll('.bl-theme-toggle');
    for (var i = 0; i < stale.length; i++){
      if (stale[i].parentNode) stale[i].parentNode.removeChild(stale[i]);
    }
  }

  try { localStorage.removeItem('bl-theme'); } catch(e){}
  forceDark();

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', forceDark);
  }
  // nav.js injects its markup asynchronously on some pages; sweep once more
  // after it lands in case a cached page re-inserted a toggle.
  var tries = 0;
  var iv = setInterval(function(){
    forceDark();
    if (++tries > 12) clearInterval(iv);
  }, 200);
})();

/* ---------------------------------------------------------------------
   Wide tables on phones. A few pages carry tables whose content cannot
   shrink below ~560px (schedule grids, price ladders), which pushed the
   whole document sideways at 390px. Rather than forcing display:block on
   every table — which would reflow the 100+ pages whose tables already
   fit — wrap only the ones that actually overflow, in a scroll box.
   --------------------------------------------------------------------- */
(function(){
  function wrap(){
    if (!window.matchMedia || !window.matchMedia('(max-width:640px)').matches) return;
    var tables = document.querySelectorAll('table');
    for (var i = 0; i < tables.length; i++){
      var t = tables[i];
      if (!t.parentNode || t.parentNode.classList.contains('bl-scroll-x')) continue;
      var avail = t.parentNode.clientWidth;
      if (!avail || t.scrollWidth <= avail + 1) continue;
      var box = document.createElement('div');
      box.className = 'bl-scroll-x';
      t.parentNode.insertBefore(box, t);
      box.appendChild(t);
    }
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', wrap);
  } else { wrap(); }
  window.addEventListener('load', wrap);
  setTimeout(wrap, 600);
  window.addEventListener('resize', wrap);
})();
