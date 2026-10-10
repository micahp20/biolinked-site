/* ======================================================================
   BioLinked site theme notes.

   Theme selection lives in bl-theme-toggle.js plus the pre-paint snippet
   in each page's <head>. This file no longer pins a theme: it used to
   force one, which is what stopped the light palette rendering at all.
   What remains here is the wide-table handling below.
   ====================================================================== */
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
