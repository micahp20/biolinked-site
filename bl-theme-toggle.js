/* ======================================================================
   BioLinked website theme toggle.

   The dark palette is the primary look, so an untouched visitor gets it;
   only an explicit stored 'light' switches away. The choice is kept in
   localStorage under 'bl-theme' and shared across the site's pages.

   The pre-paint snippet in each page's <head> is what actually sets the
   attribute, so there is no flash of the wrong theme. This file only adds
   the control and keeps the meta colour in step, which is why it is safe
   to defer.
   ====================================================================== */
(function(){
  var KEY='bl-theme';
  var COL={dark:'#0b0b0c', light:'#f5f5f5'};

  function current(){
    return document.documentElement.getAttribute('data-theme')==='light'?'light':'dark';
  }
  function apply(t){
    document.documentElement.setAttribute('data-theme',t);
    var m=document.querySelector('meta[name="theme-color"]');
    if(m) m.setAttribute('content',COL[t]||COL.dark);
    var b=document.querySelector('.bl-theme-toggle');
    if(b){
      b.setAttribute('aria-label', t==='dark'?'Switch to light theme':'Switch to dark theme');
      b.setAttribute('aria-pressed', t==='dark'?'true':'false');
      b.innerHTML = t==='dark' ? MOON : SUN;
    }
  }
  var MOON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>';
  var SUN='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>';

  window.blToggleTheme=function(){
    var t=current()==='dark'?'light':'dark';
    apply(t);
    try{ localStorage.setItem(KEY,t); }catch(e){}
  };

  function mount(){
    if(document.querySelector('.bl-theme-toggle')) { apply(current()); return; }
    var css=document.createElement('style');
    css.textContent=
      '.bl-theme-toggle{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));'+
      'z-index:900;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;'+
      'justify-content:center;cursor:pointer;background:var(--surface,#fff);'+
      'border:1px solid var(--border,var(--line,rgba(0,0,0,.14)));'+
      'box-shadow:0 4px 16px rgba(0,0,0,.18);color:var(--gold,var(--accent,#7A6530));'+
      'padding:0;-webkit-tap-highlight-color:transparent;transition:transform .15s}'+
      '.bl-theme-toggle:active{transform:scale(.94)}'+
      '.bl-theme-toggle svg{width:19px;height:19px;fill:none;stroke:currentColor;'+
      'stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}'+
      '@media print{.bl-theme-toggle{display:none}}';
    document.head.appendChild(css);
    var b=document.createElement('button');
    b.type='button'; b.className='bl-theme-toggle';
    b.addEventListener('click',window.blToggleTheme);
    document.body.appendChild(b);
    apply(current());
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount);
  else mount();
})();
