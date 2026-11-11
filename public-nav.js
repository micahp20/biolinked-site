/* Shared navigation for the explicitly opted-in BioLinked public pages. */
(function(){
 'use strict';
 if(!document.body.classList.contains('bl-public-gold'))return;
 const items=[['/','Home'],['/index/','Peptide Index'],['/stacks-blends.html','Stacks & Blends'],['/peptide-tracker.html','Tracker'],['/biomarker-landing.html','Bloodwork']];
 const path=location.pathname.replace(/\.html$/,'').replace(/\/$/,'');
 const link=([href,label])=>'<a href="'+href+'"'+(path===href.replace(/\.html$/,'').replace(/\/$/,'')?' aria-current="page"':'')+'>'+label+'</a>';
 const desktop=items;
 const old=document.querySelector('.bl-nav');
 const nav=document.createElement('nav');nav.className='bl-nav';nav.id='bl-nav';nav.setAttribute('aria-label','Main navigation');
 nav.innerHTML='<div class="bl-nav-inner"><a class="bl-nav-logo" href="/" aria-label="BioLinked home"><svg class="bl-nav-mark" viewBox="0 0 512 512" aria-hidden="true"><polygon points="256,82 404,169 404,343 256,430 108,343 108,169"/><circle cx="256" cy="82" r="16"/><circle cx="404" cy="169" r="16"/><circle cx="404" cy="343" r="16"/><circle cx="256" cy="430" r="16"/><circle cx="108" cy="343" r="16"/><circle cx="108" cy="169" r="16"/><text x="256" y="266">BL</text></svg><span class="bl-nav-logo-copy"><span class="bl-nav-logo-main">BIO LINKED</span><span class="bl-nav-logo-sub">PEPTIDE SOLUTIONS</span></span></a><div class="gold-nav-links">'+desktop.map(link).join('')+'</div><button class="gold-menu-button" type="button" aria-controls="gold-mobile-menu" aria-expanded="false">Menu</button></div><div class="gold-mobile-menu" id="gold-mobile-menu">'+items.map(link).join('')+'</div>';
 // Preserve a cart button if the page mounted one before this script ran.
 const cart=document.getElementById('navCartBtn');if(cart)nav.querySelector('.bl-nav-inner').appendChild(cart);
 if(old)old.replaceWith(nav);else document.body.prepend(nav);
 const skip=document.createElement('a');skip.href='#gold-page-content';skip.className='gold-skip';skip.textContent='Skip to content';document.body.prepend(skip);
 const content=document.querySelector('main,.app,.page-body,.form-wrap,.hero,.bls-hero,header.page');if(content){const anchor=document.createElement('span');anchor.id='gold-page-content';anchor.tabIndex=-1;content.before(anchor);}
 const button=nav.querySelector('button'),menu=nav.querySelector('.gold-mobile-menu');
 function close(){menu.classList.remove('open');button.setAttribute('aria-expanded','false');button.textContent='Menu';}
 button.addEventListener('click',()=>{const open=menu.classList.toggle('open');button.setAttribute('aria-expanded',String(open));button.textContent=open?'Close':'Menu';});
 menu.addEventListener('click',e=>{if(e.target.closest('a'))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open')){close();button.focus();}});
 document.querySelectorAll('footer,.site-footer,.page-foot,.footer').forEach(el=>{if(!el.closest('.drawer,.modal,.modalbox,.panel'))el.remove();});
 const footer=document.createElement('footer');footer.className='gold-footer';footer.innerHTML='<div class="gold-footer-inner"><div><strong>BIO LINKED</strong></div><p>For research use only. Not medical advice.</p></div>';document.body.appendChild(footer);
})();
