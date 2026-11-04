/* Theme controls for the opted-in public pages. Shared nav has already mounted. */
(function(){
 'use strict';
 if(!document.body.classList.contains('bl-consistent'))return;
 const root=document.documentElement,nav=document.querySelector('.bl-nav-inner');
 const existing=document.getElementById('ixThemeSwitch');
 if(existing)existing.remove();
 const meta=document.querySelector('meta[name="theme-color"]');
 function preferred(){try{return localStorage.getItem('bl-theme')==='dark'?'dark':'light';}catch(_){return 'light';}}
 let button=null;
 function apply(theme){
  const dark=theme==='dark';root.setAttribute('data-theme',dark?'dark':'light');
  if(meta)meta.content=dark?'#0b0b0c':'#eeeeec';
  if(button){button.setAttribute('aria-pressed',String(dark));button.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');button.title=dark?'Switch to light mode':'Switch to dark mode';button.innerHTML='<span aria-hidden="true">'+(dark?'☀':'☾')+'</span><span class="site-theme-label">'+(dark?'Light':'Dark')+'</span>';}
 }
 if(nav&&!nav.querySelector('.site-theme-button')){
  button=document.createElement('button');button.type='button';button.className='site-theme-button';
  nav.appendChild(button);button.addEventListener('click',function(){const next=root.getAttribute('data-theme')==='dark'?'light':'dark';apply(next);try{localStorage.setItem('bl-theme',next);}catch(_){}});
 }
 apply(preferred());
 window.addEventListener('storage',function(e){if(e.key==='bl-theme'||e.key===null)apply(preferred());});
})();
