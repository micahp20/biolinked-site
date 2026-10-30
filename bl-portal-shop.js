/* BioLinked client portal: in-app Shop / Reorder + in-app navigation.
   One shared module loaded by every client protocol page (/<slug>/).
   - Adds a Shop view (your protocol first, then the branded cycles and the
     full product line) and a Cart / Checkout view, all inside the portal.
   - Prices and stock come from the same live catalog /product-line/ sells
     from (pl_products sale price + inventory stock), so a client never sees
     a price that differs from the store. Checkout posts to the same
     order-confirm function as /product-line/; $9.99 UPS 2-Day on every order.
   - Opens the BioLinked website pages (Home, Peptide Index, Stacks & Blends,
     BL Tools) inside the app instead of sending the client out.
   - Adds Back / Home bars to every screen, a browser-Back history, and a
     persistent Back / Home / Cart control on phones.
   It never reads or changes INV, PAID or DUE. */
(function(){
'use strict';
if(window.__blShop) return; window.__blShop=true;
if(typeof window.go!=='function' || !document.getElementById('scroll')) return;

var SB='https://bfjydzealeethhcpdfxl.supabase.co';
var ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmanlkemVhbGVldGhoY3BkZnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MjM1NTMsImV4cCI6MjA5MTA5OTU1M30.dPVJ8X7PQkq4UbG218JVoX-C96ezno5Z4lQECXxcbgQ';
var ORDER_FN=SB+'/functions/v1/order-confirm';
var SHIPPING=9.99;
var SLUG=(location.pathname.split('/').filter(Boolean)[0]||'portal');
var CKEY='bl-shop-cart-'+SLUG;
var BLOCK=['cortexin','dihexa','ipamorelin','shipping','2-day ups'];

/* The 7 branded goal cycles, as saved on /product-line/ (vial name on the live catalog, qty). */
var CYCLES=[
  {name:'The Shred Protocol',cat:'Stubborn Weight Loss',goal:"Lean out stubborn weight while protecting the muscle you’ve built.",why:["<b>Retatrutide</b> anchors the stack, researched for its triple GLP-1/GIP/glucagon action on appetite and metabolic signaling.", "<b>Tesamorelin</b> supports your natural growth-hormone rhythm, studied for its role in body composition and stubborn midsection weight.", "<b>MOTS-c</b> and <b>NAD+</b> fuel the cellular engine, so mitochondrial energy keeps pace as the metabolism shifts."],dur:'About 8–13 weeks',items:[['Retatrutide - 30mg',1],['Tesamorelin - 20mg',2],['MOTS-C - 40mg',1],['NAD+ - 1000mg',2]]},
  {name:'The Titan Stack',cat:'Muscle Building',goal:"Build lean muscle and push past training plateaus.",why:["<b>CJC-1295/Ipamorelin</b> amplifies your natural GH pulse, and <b>IGF-1 LR3</b> carries that signal into growth and recovery.", "<b>KLOW</b> backs up the tissue side, with a repair blend studied for connective tissue and the inflammation that slows recovery.", "<b>AOD-9604</b> and <b>5-Amino-1MQ</b> keep the build lean, researched for metabolic support while you add size."],dur:'About 8–13 weeks',items:[['CJC 1295/IPAm 5/5mg',2],['IGF-1 LR3',2],['KLOW - 80mg',2],['AOD-9604: 5mg',2],['5-AMINO-1MQ - 50mg',1]]},
  {name:'The Rebuild',cat:'Recovery & Healing',goal:"Repair joints, tendons and soft tissue, and get back to training sooner.",why:["<b>BPC-157 + TB-500</b> is the core repair pairing, studied for tissue regeneration and mobility.", "<b>GHK-Cu</b> and <b>Cartalax</b> support the structure, researched for collagen and cartilage renewal.", "<b>KPV</b> calms the inflammatory signaling that can stall the rebuild."],dur:'About 3–4 weeks',items:[['BPC-157 + TB-500: 10mg',2],['Cartalax 20mg',1],['KPV 10mg',2],['GHK-Cu 50mg',1]]},
  {name:'The Fountain',cat:'Longevity & Anti-Aging',goal:"Support healthy aging at the cellular level.",why:["<b>FOXO4-DRI</b> targets the cellular clean-up side, researched for clearing senescent “zombie” cells.", "<b>Glutathione</b> is the body’s master antioxidant, studied for defense against oxidative stress.", "<b>Cortagen</b> and <b>Cerebrolysin</b> round it out, with bioregulator and neurotrophic research aimed at tissue and brain resilience."],dur:'About 3–20 weeks',items:[['Cortagen: 20mg',2],['FOX04: 10mg',1],['Glutathione - 1500mg',2],['Cerebrolysin - 60mg',2]]},
  {name:'The Alpha Drive',cat:'Sexual Health & Hormonal Balance',goal:"Restore hormonal balance, drive and confidence.",why:["<b>Testosterone</b> sets the hormonal foundation that everything else builds on (men only).", "<b>Kisspeptin-10</b> works upstream, studied for supporting the body’s own hormone signaling.", "<b>PT-141</b> and <b>Oxytocin</b> add the desire and connection side, researched for arousal and bonding pathways."],dur:'12-month supply',mf:'Testosterone is for men only.',items:[['Testosterone cypionate 250mg',5],['KissPeptin - 10mg',2],['Oxytocin: 10mg',1],['PT-141: 10mg',1]]},
  {name:'The Limitless Stack',cat:'Cognitive Enhancement',goal:"Sharpen focus, memory and mental clarity under pressure.",why:["<b>N-Acetyl Semax</b> is the focus driver, studied for BDNF and cognitive performance.", "<b>N-Acetyl Selank</b> balances it, researched for calm, stress-resilient clarity without sedation.", "<b>N-Acetyl Adamax</b> extends the neurotrophic support for memory and learning."],dur:'About 2–12 weeks',items:[['N-Acetyl Semax Amidate - 30mg',1],['N-Acetyl Selank Amidate - 30mg',1],['N-Acetyl Adamax Amidate - 5mg',1]]},
  {name:'The Deep Reset',cat:'Sleep & Stress',goal:"Fall asleep faster, sleep deeper and handle stress better.",why:["<b>DSIP</b> is studied for promoting deep, restorative sleep.", "<b>Epitalon</b> and <b>Pinealon</b> support the pineal side, researched for melatonin rhythm and circadian balance.", "<b>N-Acetyl Selank</b> takes the edge off stress, so the mind can settle at night."],dur:'About 2–10 weeks',items:[['DSIP - 10mg',1],['Epitalon - 50mg',1],['Pinealon - 10mg',2],['N-Acetyl Selank Amidate - 30mg',1]]}
];

var CAT_RULES=[
  ['Metabolic & GLP Research',['retatrutide','tirzepatide','semaglutide','cagrilintide','survodutide','mazdutide','liraglutide','aod-9604','5-amino','5am','5ad','tesofensine','adipotide']],
  ['Recovery & Tissue Research',['bpc','tb-500','tb500','thymosin beta','klow','wolverine','ghk','kpv','cartalax','cardalax','ara-290','pentosan','ll-37','thymosin alpha','p21','p-21']],
  ['Growth & Endocrine',['testosterone','hcg','tesamorelin','cjc','sermorelin','ghrp','hexarelin','mk-677','igf','peg-mgf','hgh','somatropin','testagen','gonadorelin','enclomiphene']],
  ['Cognitive & Focus',['semax','selank','adamax','bromantane','modafinil','armodafinil','noopept','cerebrolysin','pinealon','epithalon','epitalon','dsip','pe-22','cortagen']],
  ['Mitochondrial & Longevity',['mots-c','ss-31','nad','slu-pp','humanin','foxo4','gdf-11','l-carnitine','glutathione','nmn','nr','vilon','vesugen']],
  ['Skin & Cosmetic Research',['melanotan','mt-2','mt-ii','snap-8','argireline','matrixyl','ahk']],
  ['Sexual & Hormonal',['pt-141','pt141','bremelanotide','kisspeptin','oxytocin']],
  ['Other Research & Supplies',['vip','thymosin','bac water','bacteriostatic','sterile water','storage','syringe','supplies','thymulin']]
];
var CAT_ORDER=CAT_RULES.map(function(r){return r[0];});
function categorize(name){var n=String(name||'').toLowerCase();for(var i=0;i<CAT_RULES.length;i++){var k=CAT_RULES[i][1];for(var j=0;j<k.length;j++){if(n.indexOf(k[j])!==-1)return CAT_RULES[i][0];}}return 'Other Research & Supplies';}
function catLbl(c){return String(c||'').replace(/fat[\s-]*loss/i,'Stubborn Weight Loss').replace(/\bfat\b/i,'Stubborn Weight');}
function isSellable(p){var s=(typeof p.sale==='string')?parseFloat(p.sale):p.sale;if(typeof s!=='number'||isNaN(s)||s<5)return false;var n=String(p.name||'').toLowerCase();for(var i=0;i<BLOCK.length;i++){if(n.indexOf(BLOCK[i])!==-1)return false;}if((n.indexOf('epitalon')!==-1||n.indexOf('epithalon')!==-1)&&n.indexOf('10mg')!==-1)return false;return true;}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function money(n){return '$'+(Math.round(n*100)/100).toFixed(2);}
function $(id){return document.getElementById(id);}
function normName(n){return String(n||'').toLowerCase().replace(/\s+/g,' ').trim();}
function isBac(n){return /\bbac\b|bacteriostatic/i.test(String(n||''));}
function needsRecon(n){n=String(n||'').toLowerCase();return !isBac(n)&&!/testosterone|cypiomax|test blend|cyp\/|tablet|tesofensine/.test(n);}

/* ---------- state ---------- */
var products=[], loaded=false, failed=false, cart={}, query='', activeCat='All', submitted=false, cur='proto';
try{var sv=JSON.parse(localStorage.getItem(CKEY)||'{}');if(sv&&typeof sv==='object')cart=sv;}catch(e){}
function saveCart(){try{localStorage.setItem(CKEY,JSON.stringify(cart));}catch(e){}}
function productById(id){for(var i=0;i<products.length;i++)if(products[i].id===id)return products[i];return null;}
function productByName(n){var k=normName(n);for(var i=0;i<products.length;i++)if(normName(products[i].name)===k)return products[i];return null;}

/* ---------- matching a protocol compound to a catalog product ---------- */
function sizeOf(s){var m=String(s||'').toLowerCase().replace(/,/g,'').match(/(\d+(?:\.\d+)?)\s*(mg|mcg|iu|ml)\b/);return m?(parseFloat(m[1])+m[2]):'';}
function baseOf(s){
  s=String(s||'').toLowerCase().replace(/\(.*?\)/g,' ');
  var i=s.search(/\d+(?:\.\d+)?\s*(?:\/\s*\d+(?:\.\d+)?\s*)?(mg|mcg|iu|ml)\b/);
  if(i>0) s=s.slice(0,i);
  s=s.replace(/\b(vials?|n-acetyl|amidate|blend|stack)\b/g,' ').replace(/[^a-z0-9]/g,'');
  return s.replace(/^the/,'');
}
function matchProduct(name){
  var b=baseOf(name), z=sizeOf(name); if(b.length<2) return null;
  var best=null, score=0;
  products.forEach(function(p){
    var pb=baseOf(p.name), pz=sizeOf(p.name), s=0;
    if(pb===b) s=3; else if(pb.length>=4&&b.length>=4&&(pb.indexOf(b)===0||b.indexOf(pb)===0)) s=2; else return;
    if(z&&pz){ if(z!==pz) return; s+=2; } else if(z||pz) s+=0.5;
    if(p.inStock) s+=0.1;
    if(s>score){score=s;best=p;}
  });
  return best;
}
function qtyFromInv(p){
  /* most recent order line that names this product: "x 3 vials", "3 vials", "3x" */
  var q=0; if(typeof INV==='undefined'||!INV||!INV.length) return 0;
  for(var i=0;i<INV.length;i++){
    var it=(INV[i]&&INV[i].items)||[];
    for(var j=0;j<it.length;j++){
      var n=String(it[j].n||''); if(!(Number(it[j].amt)>0)) continue;
      var m=matchProduct(n.replace(/[×x]\s*\d+\s*vials?.*$/i,'').replace(/·\s*\d+\s*vials?.*$/i,''));
      if(!m||m.id!==p.id) continue;
      var k=n.match(/(\d+)\s*vials?/i)||n.match(/^(\d+)\s*[×x]\s/);
      if(k) q=parseInt(k[1],10);
    }
  }
  return q;
}
function protocolList(){
  var src=(typeof CMP!=='undefined'&&CMP)?CMP:[], seen={}, out=[], miss=[];
  src.forEach(function(c){
    if(!c||c.hist||/^\s*(archived|prior|past)\b/i.test(c.tag||'')) return;
    var p=matchProduct(c.n);
    if(!p){ var nm=String(c.n||'').split(' · ')[0]; if(nm&&miss.indexOf(nm)<0) miss.push(nm); return; }
    if(seen[p.id]) return; seen[p.id]=1;
    out.push({p:p,qty:Math.max(1,qtyFromInv(p)||1),from:c.n});
  });
  return {items:out,miss:miss};
}

/* ---------- catalog ---------- */
function sbFetch(path){return fetch(SB+'/rest/v1/'+path,{headers:{apikey:ANON,Authorization:'Bearer '+ANON}}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});}
function loadCatalog(){
  Promise.all([sbFetch('pl_products?select=id,name,sale,inventory_id&order=name.asc'),sbFetch('inventory?select=id,vials,status').catch(function(){return [];})])
  .then(function(res){
    var rows=res[0]||[], inv=res[1]||[], im={};
    inv.forEach(function(r){im[String(r.id)]=r;});
    products=rows.filter(isSellable).map(function(p){var ir=p.inventory_id!=null?im[String(p.inventory_id)]:null;var v=ir?Number(ir.vials):0,st=ir?String(ir.status||'').toLowerCase():'';return {id:String(p.id),name:p.name,price:Number(p.sale),inStock:!!(ir&&!isNaN(v)&&v>0&&st!=='out'),cat:categorize(p.name)};});
    loaded=true;
    Object.keys(cart).forEach(function(id){var p=productById(id);if(!p)delete cart[id];else cart[id].price=p.price;});
    saveCart(); renderShop(); renderCart();
  }).catch(function(){failed=true;renderShop();renderCart();});
}

/* ---------- cart ---------- */
function cartList(){return Object.keys(cart).map(function(k){return cart[k];}).filter(function(i){return i&&i.qty>0;});}
function cartCount(){return cartList().reduce(function(s,i){return s+i.qty;},0);}
function subtotal(){return Math.round(cartList().reduce(function(s,i){return s+i.price*i.qty;},0)*100)/100;}
function grandTotal(){return cartList().length?Math.round((subtotal()+SHIPPING)*100)/100:0;}
function setQty(id,n){var p=productById(id);if(!p)return;if(n<=0){delete cart[id];}else if(p.inStock){cart[id]={id:id,name:p.name,price:p.price,qty:Math.min(99,n)};}sync();}
function addQty(id,d){var c=cart[id];setQty(id,(c?c.qty:0)+d);}
function sync(){saveCart();renderShop();renderCart();renderDock();}

/* ---------- views ---------- */
function ensureViews(){
  var sc=$('scroll');
  [['shop','Shop'],['cart','Cart'],['web','BioLinked']].forEach(function(v){
    if($('v-'+v[0]))return;
    var s=document.createElement('section');s.className='view bls-view';s.id='v-'+v[0];
    s.innerHTML='<div class="pad" id="bls-'+v[0]+'"></div>';
    var last=sc.querySelector('.view:last-of-type');
    if(last&&last.nextSibling) sc.insertBefore(s,last.nextSibling); else sc.appendChild(s);
  });
  $('bls-web').innerHTML='<h1 class="scrn" id="bls-webt">BioLinked</h1><div class="bls-webwrap"><iframe id="bls-frame" title="BioLinked" loading="lazy" referrerpolicy="same-origin"></iframe></div>';
}
function backBars(){
  document.querySelectorAll('#scroll > .view').forEach(function(v){
    if(v.id==='v-proto'||v.querySelector(':scope > .bls-bar'))return;
    var b=document.createElement('div');b.className='bls-bar';
    b.innerHTML='<button type="button" class="bls-btn bls-back" aria-label="Back">&#8249; Back</button><button type="button" class="bls-btn bls-home" aria-label="Home">Home</button>';
    v.insertBefore(b,v.firstChild);
  });
}
function navEntries(){
  var sn=document.querySelector('.side-nav');
  if(sn&&!sn.querySelector('[data-v="shop"]')){
    var b=document.createElement('button');b.className='snav';b.setAttribute('data-v','shop');b.setAttribute('onclick',"go('shop')");
    b.innerHTML='<svg viewBox="0 0 24 24"><path d="M3 4h2l2.4 11.2a1 1 0 001 .8h9.2a1 1 0 001-.8L20 8H6"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg><span>Shop</span>';
    var pay=sn.querySelector('[data-v="pay"]'); if(pay&&pay.nextSibling) sn.insertBefore(b,pay.nextSibling); else sn.appendChild(b);
  }
  var nm=$('navmenu');
  if(nm&&!nm.querySelector('.bls-navshop')){
    var a=document.createElement('button');a.type='button';a.className='nav-item bls-navshop';a.setAttribute('onclick',"go('shop')");
    a.innerHTML='<div><div class="nl">Shop &amp; Reorder</div><div class="nd">Reorder your protocol or add from the product line</div></div>';
    var h=nm.querySelector('.nh'); if(h&&h.nextSibling) nm.insertBefore(a,h.nextSibling); else nm.insertBefore(a,nm.firstChild);
  }
  /* Protocol hero and Invoice screen: one-tap way in */
  var hero=document.querySelector('#v-proto .lx-hero');
  if(hero&&!hero.querySelector('.bls-herocta')){
    var c=document.createElement('button');c.type='button';c.className='bls-btn bls-herocta';c.textContent='Reorder my protocol';
    c.onclick=function(){go('shop');};
    var cta=hero.querySelector('.lx-cta'); if(cta&&cta.parentNode) cta.parentNode.insertBefore(c,cta.nextSibling); else hero.appendChild(c);
  }
  var pp=document.querySelector('#v-pay > .pad');
  if(pp&&!$('bls-paycta')){
    var d=document.createElement('div');d.id='bls-paycta';d.className='bls-paycta';
    d.innerHTML='<div><b>Need more?</b><span>Reorder your protocol without leaving the app.</span></div><button type="button" class="bls-btn" onclick="go(\'shop\')">Shop &amp; Reorder</button>';
    pp.appendChild(d);
  }
}
/* Website links: open inside the app (same site, same origin) */
var WEB_TITLES={'/':'BioLinked Home','/index/':'Peptide Index','/stacks-blends':'Stacks & Blends','/bl-tools-access.html':'BL Tools Access'};
function inAppLinks(){
  document.querySelectorAll('a[href^="https://biolinkedsolutions.com"]').forEach(function(a){
    if(a.__bls)return; a.__bls=1;
    var u; try{u=new URL(a.getAttribute('href'));}catch(e){return;}
    var path=(u.pathname||'/')+(u.search||'')+(u.hash||'');
    a.removeAttribute('target'); a.setAttribute('data-inapp',path);
    var ex=a.querySelector('.ext'); if(ex) ex.innerHTML='&#8250;';
    a.addEventListener('click',function(e){e.preventDefault();try{if(typeof closeNav==='function')closeNav();}catch(x){}openWeb(path,WEB_TITLES[u.pathname]||(a.textContent||'BioLinked').trim());});
  });
}
function openWeb(path,title){ensureViews();$('bls-webt').textContent=title;var f=$('bls-frame');if(f.getAttribute('data-p')!==path){f.setAttribute('data-p',path);f.src=path;}go('web');}

/* ---------- render: shop ---------- */
function cardHTML(p){
  var inCart=cart[p.id];
  var ctl=!p.inStock?'<span class="bls-oos">Out of stock</span>':(inCart?stepper(p.id,inCart.qty):'<button type="button" class="bls-btn bls-add" data-add="'+esc(p.id)+'">+ Add</button>');
  return '<div class="bls-card"><div class="bls-cat">'+esc(catLbl(p.cat))+'</div><div class="bls-nm">'+esc(p.name)+'</div><div class="bls-ft"><span class="bls-pr">'+money(p.price)+'</span>'+ctl+'</div></div>';
}
function stepper(id,q){return '<span class="bls-stp"><button type="button" data-dec="'+esc(id)+'" aria-label="One less">&minus;</button><b>'+q+'</b><button type="button" data-inc="'+esc(id)+'" aria-label="One more">+</button></span>';}
function cycleLines(c){return c.items.map(function(it){return {want:it[0],qty:it[1],p:productByName(it[0])};});}
function renderShop(){
  var h=$('bls-shop'); if(!h) return;
  var o=['<h1 class="scrn">Shop &amp; Reorder</h1><p class="sub">Your protocol first, then the full BioLinked product line. $9.99 UPS 2-Day shipping on every order.</p>'];
  if(!loaded){h.innerHTML=o.join('')+(failed?'<div class="bls-state"><b>Couldn’t load the product line</b>Check your connection and try again.<br><button type="button" class="bls-btn" id="bls-retry">Try again</button></div>':'<div class="bls-state">Loading the product line…</div>');var r=$('bls-retry');if(r)r.onclick=function(){failed=false;renderShop();loadCatalog();};return;}
  var pl=protocolList();
  o.push('<div class="seclbl">Your protocol</div>');
  if(pl.items.length){
    var tot=0, avail=0;
    o.push('<div class="bls-list">');
    pl.items.forEach(function(x){var p=x.p;if(p.inStock){tot+=p.price*x.qty;avail++;}
      o.push('<div class="bls-row"><div class="bls-rm"><div class="bls-nm">'+esc(p.name)+'</div><div class="bls-sub">'+(p.inStock?x.qty+' × '+money(p.price)+' = '+money(p.price*x.qty):'Out of stock right now')+'</div></div>'+(p.inStock?(cart[p.id]?stepper(p.id,cart[p.id].qty):'<button type="button" class="bls-btn bls-add" data-add="'+esc(p.id)+'">+ Add</button>'):'<span class="bls-oos">Out of stock</span>')+'</div>');});
    o.push('</div>');
    if(pl.miss.length) o.push('<p class="bls-note">Not in the product line right now: '+esc(pl.miss.join(', '))+'. Message us to reorder these.</p>');
    o.push('<button type="button" class="bls-btn bls-wide" id="bls-reorder"'+(avail?'':' disabled')+'>Reorder my protocol · '+money(tot)+'</button>');
  } else {
    o.push('<div class="bls-state">'+(pl.miss.length?'Your protocol items ('+esc(pl.miss.join(', '))+') aren’t in the product line right now. Message us to reorder.':'No protocol items to reorder yet.')+'</div>');
  }
  /* branded cycles, exactly as the product line shows them */
  var cyc=CYCLES.map(function(c,ci){var L=cycleLines(c),t=0,miss=0,av=0;L.forEach(function(l){if(!l.p){miss++;return;}t+=l.p.price*l.qty;if(l.p.inStock)av++;});if(miss)return '';
    return '<div class="bls-cyc"><div class="bls-cat">'+esc(c.cat||'')+'</div><div class="bls-cnm">'+esc(c.name)+'</div><div class="bls-sub">'+esc(c.dur||'')+'</div><ul>'+L.map(function(l){return '<li><span>'+esc(l.p.name)+(l.p.inStock?'':' <i class="bls-oos">Out of stock</i>')+'</span><span>'+l.qty+' × '+money(l.p.price)+'</span></li>';}).join('')+'</ul><div class="bls-ft"><span class="bls-pr">'+money(t)+'</span><button type="button" class="bls-btn" data-cyc="'+ci+'"'+(av?'':' disabled')+'>Add cycle</button></div></div>';}).join('');
  if(cyc) o.push('<div class="seclbl">Pre-built cycles</div><div class="bls-cycs">'+cyc+'</div>');
  /* full product line */
  var counts={};products.forEach(function(p){counts[p.cat]=(counts[p.cat]||0)+1;});
  o.push('<div class="seclbl">Full product line</div><input type="search" id="bls-q" class="bls-q" placeholder="Search compounds" value="'+esc(query)+'" aria-label="Search compounds">');
  o.push('<div class="bls-chips"><button type="button" class="bls-chip'+(activeCat==='All'?' on':'')+'" data-cat="All">All</button>'+CAT_ORDER.filter(function(c){return counts[c];}).map(function(c){return '<button type="button" class="bls-chip'+(activeCat===c?' on':'')+'" data-cat="'+esc(c)+'">'+esc(catLbl(c))+'</button>';}).join('')+'</div>');
  var list=products.filter(function(p){return (activeCat==='All'||p.cat===activeCat)&&(!query||p.name.toLowerCase().indexOf(query)!==-1);});
  list.sort(function(a,b){return (b.inStock-a.inStock)||a.name.localeCompare(b.name);});
  o.push('<div class="bls-grid" id="bls-grid">'+(list.length?list.map(cardHTML).join(''):'<div class="bls-state">No matches.</div>')+'</div>');
  var keepFocus=document.activeElement&&document.activeElement.id==='bls-q', pos=keepFocus?document.activeElement.selectionStart:0;
  h.innerHTML=o.join('');
  if(keepFocus){var q=$('bls-q');q.focus();try{q.setSelectionRange(pos,pos);}catch(e){}}
  var rb=$('bls-reorder'); if(rb) rb.onclick=function(){pl.items.forEach(function(x){if(x.p.inStock){var c=cart[x.p.id];setQtyQuiet(x.p.id,Math.max(c?c.qty:0,x.qty));}});sync();go('cart');};
  $('bls-q').oninput=function(){query=this.value.trim().toLowerCase();renderShop();};
}
function setQtyQuiet(id,n){var p=productById(id);if(!p||!p.inStock)return;cart[id]={id:id,name:p.name,price:p.price,qty:Math.min(99,n)};}

/* ---------- render: cart + checkout ---------- */
function bacProduct(){var best=null;products.forEach(function(p){if(!isBac(p.name)||!p.inStock)return;var t=/10\s*ml/i.test(p.name);if(!best||(t&&!/10\s*ml/i.test(best.name)))best=p;});return best;}
function renderCart(){
  var h=$('bls-cart'); if(!h||submitted) return;
  var items=cartList(), o=['<h1 class="scrn">Your cart</h1>'];
  if(!items.length){h.innerHTML=o.join('')+'<div class="bls-state">Your cart is empty.<br><button type="button" class="bls-btn" onclick="go(\'shop\')">Go to Shop</button></div>';return;}
  o.push('<div class="bls-list">'+items.map(function(it){return '<div class="bls-row"><div class="bls-rm"><div class="bls-nm">'+esc(it.name)+'</div><div class="bls-sub">'+money(it.price)+' each · '+money(it.price*it.qty)+'</div></div>'+stepper(it.id,it.qty)+'<button type="button" class="bls-x" data-del="'+esc(it.id)+'" aria-label="Remove '+esc(it.name)+'">&times;</button></div>';}).join('')+'</div>');
  var hasBac=items.some(function(i){return isBac(i.name);}), vials=items.reduce(function(s,i){return s+(needsRecon(i.name)?i.qty:0);},0), bp=bacProduct();
  if(!hasBac&&vials&&bp){var n=Math.max(1,Math.ceil(vials/3));o.push('<div class="bls-bac"><b>Need BAC water?</b><span>We suggest '+n+' × '+esc(bp.name)+' ('+money(bp.price)+' each) for your '+vials+' vial'+(vials===1?'':'s')+'. Optional.</span><button type="button" class="bls-btn" data-bac="'+esc(bp.id)+'" data-n="'+n+'">Add '+n+' BAC · '+money(bp.price*n)+'</button></div>');}
  o.push('<div class="bls-tot"><div><span>Subtotal</span><span>'+money(subtotal())+'</span></div><div><span>Shipping — UPS 2-Day</span><span>'+money(SHIPPING)+'</span></div><div class="g"><span>Total</span><span>'+money(grandTotal())+'</span></div></div>');
  var nm=''; try{var w=document.querySelector('.who .wn');nm=w?w.textContent.trim():'';}catch(e){}
  o.push('<form id="bls-form" class="bls-form" novalidate><div class="seclbl">Your details</div>'+
    '<label class="bls-fld" id="bls-fn"><span>Name</span><input id="bls-name" autocomplete="name" value="'+esc(nm)+'"><em>Please add your name.</em></label>'+
    '<label class="bls-fld" id="bls-fc"><span>Email or phone</span><input id="bls-contact" autocomplete="email"><em>Add an email or phone so we can confirm.</em></label>'+
    '<div class="seclbl">Pay with</div><div class="bls-pays" id="bls-pays">'+['Cash App','Venmo','Zelle'].map(function(m){return '<label class="bls-pay"><input type="radio" name="bls-pay" value="'+m+'"><span>'+m+'</span></label>';}).join('')+'</div><em class="bls-err" id="bls-payerr">Choose how you’ll pay.</em>'+
    '<button type="submit" class="bls-btn bls-wide" id="bls-submit">Submit order · '+money(grandTotal())+'</button><em class="bls-err" id="bls-suberr"></em>'+
    '<p class="bls-note">You pay after you submit, with Cash App, Venmo or Zelle. Your order ships once payment is confirmed.</p></form>');
  h.innerHTML=o.join('');
  $('bls-form').onsubmit=submitOrder;
}
function submitOrder(e){
  e.preventDefault(); if(submitted) return;
  var items=cartList(); if(!items.length) return;
  var name=$('bls-name').value.trim(), contact=$('bls-contact').value.trim(), pr=document.querySelector('input[name="bls-pay"]:checked'), ok=true;
  $('bls-fn').classList.toggle('bad',!name); $('bls-fc').classList.toggle('bad',!contact); $('bls-payerr').classList.toggle('on',!pr);
  if(!name||!contact||!pr) ok=false; if(!ok) return;
  var grand=grandTotal(), btn=$('bls-submit'); btn.disabled=true; btn.textContent='Submitting…';
  var body={name:name,contact:contact,payment:{method:pr.value},items:items.map(function(i){return {name:i.name,qty:i.qty,price:i.price};})};
  fetch(ORDER_FN,{method:'POST',headers:{'Content-Type':'application/json',apikey:ANON,Authorization:'Bearer '+ANON},body:JSON.stringify(body)})
  .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
  .then(function(j){if(!j||!j.ok)throw new Error('bad');submitted=true;var st=Number(j.total);cart={};saveCart();renderDock();showConfirm((isFinite(st)&&st>=SHIPPING)?st:grand,j.client_email==='sent');})
  .catch(function(){btn.disabled=false;btn.textContent='Submit order · '+money(grand);var s=$('bls-suberr');s.textContent='Something went wrong submitting your order. Please try again, or message us directly.';s.classList.add('on');});
}
function showConfirm(grand,mailed){
  var M=money(grand), amt=grand.toFixed(2);
  $('bls-cart').innerHTML='<h1 class="scrn">Order received</h1><p class="sub">Total '+M+' (includes $9.99 UPS 2-Day shipping). One tap to pay:</p>'+
    '<a class="bls-btn bls-wide" href="https://cash.app/$micahpauldino/'+amt+'" target="_blank" rel="noopener">Pay '+M+' in Cash App</a>'+
    '<a class="bls-btn bls-wide" href="https://venmo.com/micahp20?txn=pay&amount='+amt+'&note='+encodeURIComponent('BioLinked Order')+'" target="_blank" rel="noopener">Pay '+M+' in Venmo</a>'+
    '<button type="button" class="bls-btn bls-wide" id="bls-zelle">Pay '+M+' via Zelle</button><p class="bls-note" id="bls-zs"></p>'+
    '<p class="bls-note">If a button doesn’t open, send '+M+' to Cash App $micahpauldino, Venmo @micahp20, or Zelle 720-938-0698. Your order ships once payment is confirmed.'+(mailed?' A confirmation email is on its way.':'')+'</p>'+
    '<button type="button" class="bls-btn bls-wide bls-ghost" onclick="go(\'proto\')">Back to my protocol</button>';
  $('bls-zelle').onclick=function(){var n='720-938-0698',d=function(){$('bls-zs').textContent='Send '+M+' via Zelle to 720-938-0698 (number copied).';};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(n).then(d,d);else d();};
}

/* ---------- persistent phone control ---------- */
function renderDock(){
  var d=$('bls-dock'); if(!d){d=document.createElement('div');d.id='bls-dock';d.className='bls-dock';document.body.appendChild(d);}
  var n=cartCount();
  d.innerHTML=(cur!=='proto'?'<button type="button" class="bls-btn bls-back">&#8249; Back</button><button type="button" class="bls-btn bls-home">Home</button>':'')+
    '<button type="button" class="bls-btn bls-dcart" onclick="go(\''+(n?'cart':'shop')+'\')">'+(n?'Cart · '+n:'Shop')+'</button>';
  document.body.classList.toggle('bls-has-dock',true);
}

/* ---------- navigation + history ---------- */
var origGo=window.go;
function show(v){ if(!$('v-'+v)) v='proto'; cur=v; origGo(v); if(v==='shop')renderShop(); if(v==='cart'){ if(!submitted) renderCart(); } renderDock(); }
window.go=function(v){ if(v!==cur){ try{history.pushState({blv:v},'');}catch(e){} } show(v); };
function goBack(){ if(history.state&&history.state.blv&&history.length>1&&cur!=='proto') history.back(); else window.go('proto'); }
window.addEventListener('popstate',function(e){ var v=(e.state&&e.state.blv)||'proto'; show(v); });

document.addEventListener('click',function(e){
  var t=e.target.closest&&e.target.closest('button,a'); if(!t) return;
  if(t.classList.contains('bls-back')){e.preventDefault();goBack();return;}
  if(t.classList.contains('bls-home')){e.preventDefault();window.go('proto');return;}
  var a;
  if((a=t.getAttribute('data-add'))){addQty(a,1);return;}
  if((a=t.getAttribute('data-inc'))){addQty(a,1);return;}
  if((a=t.getAttribute('data-dec'))){addQty(a,-1);return;}
  if((a=t.getAttribute('data-del'))){setQty(a,0);return;}
  if((a=t.getAttribute('data-bac'))){var c=cart[a];setQty(a,Math.max(c?c.qty:0,parseInt(t.getAttribute('data-n'),10)||1));return;}
  if((a=t.getAttribute('data-cat'))&&t.classList.contains('bls-chip')){activeCat=a;renderShop();return;}
  if(t.hasAttribute('data-cyc')){var cy=CYCLES[+t.getAttribute('data-cyc')];if(cy){cycleLines(cy).forEach(function(l){if(l.p&&l.p.inStock){var c2=cart[l.p.id];setQtyQuiet(l.p.id,(c2?c2.qty:0)+l.qty);}});sync();window.go('cart');}return;}
});
document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&cur!=='proto'&&!document.querySelector('.sheet.on,.sheet.open')) goBack(); });

function init(){
  ensureViews(); backBars(); navEntries(); inAppLinks();
  try{history.replaceState({blv:'proto'},'');}catch(e){}
  renderShop(); renderCart(); renderDock(); loadCatalog();
  window.BLShop={open:function(){window.go('shop');},cart:function(){return cartList();},products:function(){return products;},protocol:function(){return protocolList();}};
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
