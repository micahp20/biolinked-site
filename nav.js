(function(){
  const path = window.location.pathname;
  const isActive = (href) => {
    const clean = href.replace('.html','');
    if(clean === '/index') return path === '/' || path === '/index.html' || path === '/index';
    return path.includes(clean.replace('/',''));
  };

  const links = [
    {href:'/index.html', label:'Home'},
    {href:'/peptide-index.html', label:'Index'},
    {href:'/cheat-sheet.html', label:'Cheat Sheet'},
    {href:'/stacks-blends.html', label:'Stacks & Blends'},
  ];

  const tools = [
    {href:'/peptide-tracker.html', label:'Peptide Tracker'},
    {href:'/stack-analyzer.html', label:'Stack Analyzer'},
  ];

  const navHTML = `
<nav class="bl-nav" id="bl-nav">
  <div class="bl-nav-inner">
    <a href="/index.html" class="bl-nav-logo">
      <span class="bl-nav-logo-main">BIO LINKED</span>
      <span class="bl-nav-logo-sub">Peptide Solutions</span>
    </a>
    <div class="bl-nav-links">
      ${links.map(l=>`<a href="${l.href}" class="bl-nav-link${isActive(l.href)?' active':''}">${l.label}</a>`).join('')}
      <div class="bl-nav-dropdown" id="bl-dropdown">
        <button class="bl-nav-link bl-dropdown-btn">Tools ▾</button>
        <div class="bl-nav-dropdown-menu" id="bl-dropdown-menu">
          ${tools.map(t=>`<a href="${t.href}" class="bl-nav-dropdown-item${isActive(t.href)?' active':''}">${t.label}</a>`).join('')}
        </div>
      </div>
    </div>
    <button class="bl-nav-mobile-btn" id="bl-mobile-btn">☰</button>
  </div>
  <div class="bl-nav-mobile-menu" id="bl-mobile-menu">
    ${links.map(l=>`<a href="${l.href}" class="bl-nav-mobile-link">${l.label}</a>`).join('')}
    <div class="bl-nav-mobile-section">Tools</div>
    ${tools.map(t=>`<a href="${t.href}" class="bl-nav-mobile-link bl-nav-mobile-sub">${t.label}</a>`).join('')}
  </div>
</nav>`;

  const navCSS = `<style>
.bl-nav{background:#fff;border-bottom:1px solid #eaeaea;position:sticky;top:0;z-index:600;font-family:'Outfit',sans-serif}
.bl-nav-inner{max-width:1200px;margin:0 auto;padding:0 32px;display:flex;align-items:center;justify-content:space-between;height:56px}
.bl-nav-logo{text-decoration:none;display:flex;flex-direction:column;line-height:1}
.bl-nav-logo-main{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:600;color:#1a1a1a;letter-spacing:0.1em}
.bl-nav-logo-sub{font-size:8px;color:#777;letter-spacing:0.18em;text-transform:uppercase;margin-top:2px}
.bl-nav-links{display:flex;align-items:center;gap:2px}
.bl-nav-link{font-size:11.5px;color:#444;text-decoration:none;padding:7px 11px;border-radius:3px;transition:all .18s;background:none;border:none;cursor:pointer;font-family:'Outfit',sans-serif;white-space:nowrap}
.bl-nav-link:hover,.bl-nav-link.active{color:#9A7B2F;background:rgba(154,123,47,0.07)}
.bl-nav-dropdown{position:relative}
.bl-nav-dropdown-menu{display:none;position:absolute;top:calc(100% - 1px);right:0;background:#fff;border:1px solid #eaeaea;border-radius:0 0 6px 6px;box-shadow:0 8px 24px rgba(0,0,0,0.08);min-width:190px;z-index:700;padding:4px 0}
.bl-nav-dropdown:hover .bl-nav-dropdown-menu,.bl-nav-dropdown-menu:hover{display:block}
.bl-nav-dropdown-btn{border-bottom-left-radius:0;border-bottom-right-radius:0}
.bl-nav-dropdown:hover .bl-dropdown-btn{color:#9A7B2F;background:rgba(154,123,47,0.07)}
.bl-nav-dropdown-item{display:block;padding:10px 16px;font-size:11.5px;color:#444;text-decoration:none;transition:all .15s;font-family:'Outfit',sans-serif;white-space:nowrap}
.bl-nav-dropdown-item:hover,.bl-nav-dropdown-item.active{background:#f8f8f8;color:#9A7B2F;padding-left:20px}
.bl-nav-mobile-btn{display:none;background:none;border:none;font-size:20px;cursor:pointer;color:#1a1a1a;padding:8px}
.bl-nav-mobile-menu{display:none;border-top:1px solid #eaeaea;background:#fff;padding:12px 20px 20px}
.bl-nav-mobile-menu.open{display:block}
.bl-nav-mobile-link{display:block;padding:10px 0;font-size:13px;color:#444;text-decoration:none;border-bottom:1px solid #eaeaea;font-family:'Outfit',sans-serif}
.bl-nav-mobile-link:last-child{border-bottom:none}
.bl-nav-mobile-sub{padding-left:16px;font-size:12px;color:#777}
.bl-nav-mobile-section{padding:10px 0 4px;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#9A7B2F;font-family:'Outfit',sans-serif;font-weight:600;border-bottom:1px solid #eaeaea}
@media(max-width:768px){.bl-nav-links{display:none}.bl-nav-mobile-btn{display:block}.bl-nav-inner{padding:0 16px}}
</style>`;

  document.head.insertAdjacentHTML('beforeend', navCSS);
  document.body.insertAdjacentHTML('afterbegin', navHTML);

  // Mobile toggle
  document.getElementById('bl-mobile-btn').addEventListener('click', function(){
    const menu = document.getElementById('bl-mobile-menu');
    menu.classList.toggle('open');
    this.textContent = menu.classList.contains('open') ? '✕' : '☰';
  });

  // Fix dropdown - keep open when moving mouse between button and menu
  const dropdown = document.getElementById('bl-dropdown');
  const menu = document.getElementById('bl-dropdown-menu');
  let closeTimer;
  dropdown.addEventListener('mouseenter', () => { clearTimeout(closeTimer); menu.style.display='block'; });
  dropdown.addEventListener('mouseleave', () => { closeTimer = setTimeout(() => { menu.style.display=''; }, 150); });
  menu.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  menu.addEventListener('mouseleave', () => { closeTimer = setTimeout(() => { menu.style.display=''; }, 150); });

})();
