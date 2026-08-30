/* ======================================================================
   BioLinked site theme controller — light only.

   The dark palette and its toggle were removed. This script exists to make
   sure a visitor who tapped the old toggle before it was removed does not
   stay stuck on a half-dark page: it forces data-theme="light", clears the
   saved preference, and removes any toggle button still sitting in a cached
   copy of a page. bl-theme.css also no longer contains any dark rules, so
   even a stale attribute renders light.
   ====================================================================== */
(function(){
  var root = document.documentElement;

  function forceLight(){
    root.setAttribute('data-theme', 'light');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#fbf7ec');
    var stale = document.querySelectorAll('.bl-theme-toggle');
    for (var i = 0; i < stale.length; i++){
      if (stale[i].parentNode) stale[i].parentNode.removeChild(stale[i]);
    }
  }

  try { localStorage.removeItem('bl-theme'); } catch(e){}
  forceLight();

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', forceLight);
  }
  // nav.js injects its markup asynchronously on some pages; sweep once more
  // after it lands in case a cached page re-inserted a toggle.
  var tries = 0;
  var iv = setInterval(function(){
    forceLight();
    if (++tries > 12) clearInterval(iv);
  }, 200);
})();
