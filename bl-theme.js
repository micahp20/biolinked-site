/* ======================================================================
   BioLinked site theme controller.
   Light is the default. A saved choice wins; otherwise light, regardless of
   the OS setting — the site is a light-first brand and dark is opt-in.
   Pair with the pre-paint snippet injected in <head> (see bl-theme-head).
   ====================================================================== */
(function(){
  var KEY = 'bl-theme';
  var COLORS = { light:'#fbf7ec', dark:'#0e110e' };
  var root = document.documentElement;

  function current(){ return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }

  function apply(t){
    root.setAttribute('data-theme', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', COLORS[t]);
    var btns = document.querySelectorAll('.bl-theme-toggle');
    for (var i = 0; i < btns.length; i++){
      btns[i].setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
    }
  }

  function build(){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bl-theme-toggle';
    b.setAttribute('aria-label', 'Switch between light and dark theme');
    b.innerHTML = '<span class="bl-toggle-icon" aria-hidden="true">◑</span>'
                + '<span class="bl-toggle-to-dark">Dark</span>'
                + '<span class="bl-toggle-to-light">Light</span>';
    b.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var next = current() === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch(err){}
    });
    return b;
  }

  function mount(){
    if (document.querySelector('.bl-theme-toggle')) return;
    var btn = build();
    // Prefer the shared site nav, then a protocol page's tab bar, else float it.
    var host = document.querySelector('.bl-nav-inner');
    if (host){ host.appendChild(btn); }
    else {
      btn.classList.add('bl-theme-floating');
      document.body.appendChild(btn);
    }
    apply(current());
  }

  apply(current());
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
  // nav.js injects its markup asynchronously on some pages; re-home the button
  // into the nav once it appears.
  var tries = 0;
  var iv = setInterval(function(){
    tries++;
    var nav = document.querySelector('.bl-nav-inner');
    var btn = document.querySelector('.bl-theme-toggle');
    if (nav && btn && !nav.contains(btn)){
      btn.classList.remove('bl-theme-floating');
      nav.appendChild(btn);
    }
    if ((nav && btn && nav.contains(btn)) || tries > 20) clearInterval(iv);
  }, 150);
})();
