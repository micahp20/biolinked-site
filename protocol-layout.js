/* Shared protocol view layout, matching the mpauldino reference: each group is a
   jc-cycle section of inline compound cards (description, recon, schedule,
   dose/draw, site) with the protocol notes in a closed "About this protocol"
   panel at the end. Data stays in each page (ALL, ABOUT_GROUPS, PROTOABOUT);
   this file only changes how it is drawn. Group membership follows the page's
   own rules: an explicit name list (ns), "everything not listed" (rest), or tag. */
(function(){
 if(typeof ALL==='undefined') return;
 function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function compoundCard(c){
  var sch=[c.c,c.b==='BOTH'?'AM + PM':c.b].filter(Boolean).join(' · ');
  return '<details class="jc-compound"><summary>'+esc(c.n)+'<span aria-hidden="true" class="jc-chevron"></span></summary><div class="jc-body">'+(c.about?'<div class="jc-description">'+c.about+'</div>':'')+'<dl class="jc-facts">'+
  [['Recon',c.rec],['Schedule',sch],['Dose / draw',[c.d,c.u].filter(Boolean).join(' · ')],['Site',c.site]].filter(function(r){return r[1];}).map(function(r){return '<div><dt>'+r[0]+'</dt><dd>'+r[1]+'</dd></div>';}).join('')+'</dl></div></details>';
 }
 window.renderAbout=renderAbout=function(){
  var host=document.getElementById('protoabout');if(!host)return;
  var src=ALL||[], groups=(typeof ABOUT_GROUPS!=='undefined'&&ABOUT_GROUPS)||[];
  var listed={};groups.forEach(function(g){(g.ns||[]).forEach(function(n){listed[n]=1;});});
  var seen={},html='';
  groups.forEach(function(g){
   var rows=src.filter(function(c){return g.ns?g.ns.indexOf(c.n)>=0:(g.rest?!listed[c.n]:(c.tag||'')===g.tag);});
   if(!rows.length)return;
   rows.forEach(function(c){seen[c.n]=true;});
   html+='<section class="jc-cycle"><header class="jc-cycle-head"><h2>'+esc(g.tag)+'</h2>'+(g.ns||g.rest?'<p>'+esc(rows.length+' compound'+(rows.length===1?'':'s')+(g.meta?' · '+g.meta:''))+'</p>':'')+'</header>'+rows.map(compoundCard).join('')+'</section>';
  });
  var rest=src.filter(function(c){return !seen[c.n];});
  if(rest.length)html+='<section class="jc-cycle"><header class="jc-cycle-head"><h2>Your compounds</h2></header>'+rest.map(compoundCard).join('')+'</section>';
  if(typeof PROTOABOUT!=='undefined'&&PROTOABOUT)html+='<details class="jc-notes"><summary>About this protocol</summary><h3>What it targets</h3><p>'+esc(PROTOABOUT.t)+'</p><h3>Why these together</h3><p>'+esc(PROTOABOUT.s)+'</p><h3>How the roles complement each other</h3><p>'+esc(PROTOABOUT.w)+'</p></details>';
  host.innerHTML=html||'<div class="empty"><div class="t">Your protocol is on its way</div><div class="d">Your compounds and schedule will show here as soon as they are ready.</div></div>';
  try{ if(window.BLPlan&&window.BLPlan.mount) window.BLPlan.mount(); }catch(e){}
 };
 renderAbout();
})();
