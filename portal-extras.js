/* Shared portal extras matching the mpauldino reference:
   1) "Keep BioLinked one tap away" Add to Home Screen nudge at the top of the
      page scroller, shown outside an installed app until dismissed.
   2) "Easy reading" card (Bigger text / High contrast) on the Nutrition tab,
      just above the research-use note, applied to Nutrition and Workout.
   Both settings live only on this device, under this client's own storage
   prefix (KP, e.g. "ejirikils-app-"), so pages never share them. */
(function(){
 var slug=(location.pathname.split('/')[1]||'portal');
 var P=(typeof KP==='string'&&KP)?KP:('bl-'+slug+'-');
 function lsGet(k){try{return localStorage.getItem(P+k);}catch(e){return null;}}
 function lsSet(k,v){try{localStorage.setItem(P+k,v);}catch(e){}}

 /* ---------- Add to Home Screen ---------- */
 function a2hs(){
  var el=document.getElementById('a2hs'), sc=document.getElementById('scroll');
  if(!el||!sc) return;
  if(el.parentNode!==sc||sc.firstElementChild!==el) sc.insertBefore(el,sc.firstChild);
  if(!el.querySelector('.a2hs-keep')){
   el.innerHTML='<div class="tx"><b>Keep BioLinked one tap away.</b> Add it to your Home Screen and your protocol opens full screen, like an app.'+
    ' <span class="a2hs-ios" id="a2hsIos" hidden>Tap <span class="a2hs-shr">&#8682;</span> Share, then &ldquo;Add to Home Screen.&rdquo;</span>'+
    ' <span class="a2hs-keep">Keep the link we texted you &mdash; it is your key, and it is how your schedule follows you to a new phone.</span></div>'+
    '<button class="x" id="a2hsX" aria-label="Dismiss">&times;</button>';
  }
  var installed=window.navigator.standalone===true||['standalone','fullscreen','minimal-ui'].some(function(m){try{return window.matchMedia('(display-mode: '+m+')').matches;}catch(e){return false;}});
  if(installed){ el.classList.remove('on'); return; }
  if(lsGet('a2hs')==='1'){ el.classList.remove('on'); return; }
  var ua=navigator.userAgent||'';
  var ios=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1&&!/Android/i.test(ua));
  if(ios){ var l=document.getElementById('a2hsIos'); if(l) l.hidden=false; }
  var x=document.getElementById('a2hsX');
  if(x&&!x._blx){ x._blx=1; x.addEventListener('click',function(){ el.classList.remove('on'); lsSet('a2hs','1'); }); }
  setTimeout(function(){ if(lsGet('a2hs')!=='1') el.classList.add('on'); },1200);
 }

 /* ---------- Easy reading ---------- */
 function prefs(){ try{ var u=JSON.parse(lsGet('easyread')||'{}'); return {big:!!u.big,hc:!!u.hc}; }catch(e){ return {big:false,hc:false}; } }
 function apply(){
  var u=prefs();
  ['v-nutr','v-work'].forEach(function(id){ var v=document.getElementById(id); if(!v) return;
   if(v.classList.contains('wk-big')!==u.big) v.classList.toggle('wk-big',u.big);
   if(v.classList.contains('wk-hc')!==u.hc) v.classList.toggle('wk-hc',u.hc); });
 }
 function card(){
  var u=prefs();
  return '<div class="n2-card" id="bl-easyread"><div class="n2-eb">Easy reading · same setting as Workout</div>'+
   '<div class="n2-tog"><span>Bigger text</span><button class="n2-sw'+(u.big?' on':'')+'" role="switch" aria-checked="'+u.big+'" aria-label="Bigger text" data-blui="big"></button></div>'+
   '<div class="n2-tog"><span>High contrast</span><button class="n2-sw'+(u.hc?' on':'')+'" role="switch" aria-checked="'+u.hc+'" aria-label="High contrast" data-blui="hc"></button></div></div>';
 }
 function inject(){
  var host=document.getElementById('n2body'); if(!host) return;
  if(host.querySelector('[data-n2ui]')) return; /* page already draws its own card */
  var old=document.getElementById('bl-easyread');
  var note=null; for(var i=0;i<host.children.length;i++){ var c=host.children[i]; if(c.classList&&c.classList.contains('n2-note')){ note=c; break; } }
  if(!note) return;
  if(old&&old.parentNode===host&&old.nextElementSibling===note) return;
  if(old) old.parentNode.removeChild(old);
  note.insertAdjacentHTML('beforebegin',card());
 }
 document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest&&e.target.closest('[data-blui]'); if(!b) return;
  e.preventDefault(); e.stopPropagation();
  var u=prefs(), k=b.getAttribute('data-blui'); u[k]=!u[k];
  lsSet('easyread',JSON.stringify(u));
  b.classList.toggle('on',u[k]); b.setAttribute('aria-checked',String(u[k]));
  apply();
 },true);
 function boot(){
  a2hs(); inject(); apply();
  var host=document.getElementById('n2body');
  if(host&&window.MutationObserver) new MutationObserver(function(){ inject(); }).observe(host,{childList:true});
  ['v-nutr','v-work'].forEach(function(id){ var v=document.getElementById(id);
   if(v&&window.MutationObserver) new MutationObserver(function(){ apply(); }).observe(v,{attributes:true,attributeFilter:['class']}); });
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* Select existing unpaid cycle quotes on the pilot portal. */
(function () {
  if (location.pathname.split('/')[1] !== 'dbarajas') return;
  function setup() {
    var hero = document.getElementById('payhero');
    if (!hero || !Array.isArray(window.INV)) return;
    var panel = document.createElement('section');
    panel.className = 'ocard';
    panel.innerHTML = '<div class="irow tot"><span class="in" aria-live="polite"></span><button type="button" class="invoice-pay-now">View cart</button></div>';
    hero.before(panel);
    var choices = document.getElementById('paylist');
    function merchandise(order) {
      return order.items.reduce(function(sum, item) {
        return /^Shipping\b/i.test(item.n) ? sum : sum + Math.round(item.amt * 100);
      }, 0);
    }
    function addControls(){
    INV.forEach(function(order, i) {
      if (!['due','quote'].includes(order.status)) return;
      var header=choices.children[i]?.querySelector('.ohd');
      if (!header || header.querySelector('.cart-add')) return;
      var label=document.createElement('label');
      label.className='cart-add';
      header.style.flexWrap='wrap';
      label.style.cssText='display:inline-flex;align-items:center;gap:5px;margin-left:auto;min-height:44px;font:600 12px Montserrat,sans-serif;white-space:nowrap;cursor:pointer';
      label.onclick=function(event){event.stopPropagation()};
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.value = i;
      input.style.accentColor = '#8b7335';
      input.setAttribute('aria-label','Add '+order.label+' to cart');
      label.append(input, document.createTextNode('Add to cart'));
      header.append(label);
    });
    }
    addControls();
    new MutationObserver(function(){addControls();refresh()}).observe(choices,{childList:true});
    function selected() {
      return Array.from(choices.querySelectorAll('input:checked'), function(input){return INV[Number(input.value)]});
    }
    function base(orders) {return orders.reduce(function(sum,o){return sum+merchandise(o)},999);}
    var button = panel.querySelector('button');
    function refresh() {
      var orders = selected();
      panel.hidden = !orders.length; panel.style.display = orders.length ? '' : 'none';
      panel.querySelector('[aria-live]').textContent = orders.length ? 'Order total '+money(base(orders)/100)+' · one shipping charge' : '';
    }
    choices.addEventListener('change', refresh);
    button.onclick = function() {
      var orders = selected();
      if (!orders.length) return;
      if (orders.length === 1) {openInv(INV.indexOf(orders[0]));return;}
      var total = base(orders)/100;
      document.getElementById('i-name').textContent = 'Selected cycles';
      document.getElementById('i-sum').textContent = '';
      document.getElementById('i-tag').textContent = 'Quoted';
      var rows = [];
      orders.forEach(function(o){
        var water = o.items.filter(function(item){return /^BAC Water\b/i.test(item.n)});
        var waterCents = water.reduce(function(sum,item){return sum+Math.round(item.amt*100)},0);
        rows.push([o.label,(merchandise(o)-waterCents)/100]);
        water.forEach(function(item){rows.push([item.n,item.amt])});
      });
      rows.push(['2-Day UPS shipping',9.99],['Order total',total]);
      var items = document.getElementById('i-items');
      items.replaceChildren();
      rows.forEach(function(row){
        var line=document.createElement('div'), name=document.createElement('span'), value=document.createElement('strong');
        line.className=row[0]==='Order total'?'irow tot':'irow'; name.className='in'; value.className='iv'; name.textContent=row[0]; value.textContent=money(row[1]); line.append(name,value); items.append(line);
      });
      var pay=document.getElementById('i-pay'), amount=total.toFixed(2);
      pay.innerHTML='<div class="cycle-pay"><a class="paybtn" target="_blank" rel="noopener">Venmo</a><a class="paybtn" target="_blank" rel="noopener">Cash App</a><button type="button" class="paybtn">Zelle</button><small role="status"></small></div>';
      var methods=pay.firstElementChild;
      var wallet=document.createElement('div');
      wallet.className='bl-applepay'; wallet.dataset.client='dbarajas';
      wallet.dataset.quote='cart-'+orders.map(function(o){return /^Cycle (\d+)/.exec(o.label)[1]}).join('-');
      wallet.dataset.label='Selected cycles'; wallet.dataset.amount=(Math.round(base(orders)*103/100)/100).toFixed(2);
      var card=document.createElement('button'); card.type='button'; card.className='paybtn'; card.textContent='Pay with card'; card.dataset.cartCard='1';
      var fee=document.createElement('small'); fee.textContent='Apple Pay and card include a 3% fee';
      methods.prepend(wallet,card,fee);
      var links=pay.querySelectorAll('a');
      links[0].href='https://venmo.com/u/'+PAY.venmo;
      links[1].href='https://cash.app/$'+PAY.cashapp+'/'+amount;
      var zelle=pay.querySelector('button:not([data-cart-card])'); zelle.dataset.amount=amount; zelle.onclick=function(){payZelle(zelle)};
      sheet('inv');
    };
    refresh();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',setup); else setup();
})();
