/* Protocol view uses the shared inline compound-card layout; personal data stays authoritative. */
(function(){
 function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function compoundCard(c){
 var sch=[c.c,c.b==='BOTH'?'AM + PM':c.b].filter(Boolean).join(' · ');
 return '<details class="jc-compound"><summary>'+esc(c.n)+'<span aria-hidden="true" class="jc-chevron"></span></summary><div class="jc-body">'+(c.about?'<div class="jc-description">'+c.about+'</div>':'')+'<dl class="jc-facts">'+
 [['Recon',c.rec],['Schedule',sch],['Dose / draw',[c.d,c.u].filter(Boolean).join(' · ')],['Site',c.site]].filter(function(r){return r[1];}).map(function(r){return '<div><dt>'+r[0]+'</dt><dd>'+r[1]+'</dd></div>';}).join('')+'</dl></div></details>';
}
 renderAbout=function(){
  var host=document.getElementById('protoabout');if(!host)return;
  var seen={},html='';
  (ABOUT_GROUPS||[]).forEach(function(group){var rows=ALL.filter(function(c){return c.tag===group.tag;});if(!rows.length)return;rows.forEach(function(c){seen[c.n]=true;});html+='<section class="jc-cycle"><header class="jc-cycle-head"><h2>'+esc(group.tag)+'</h2></header>'+rows.map(compoundCard).join('')+'</section>';});
  var rest=ALL.filter(function(c){return !seen[c.n];});if(rest.length)html+='<section class="jc-cycle"><header class="jc-cycle-head"><h2>Your compounds</h2></header>'+rest.map(compoundCard).join('')+'</section>';
  if(PROTOABOUT)html+='<details class="jc-notes"><summary>About this protocol</summary><h3>What it targets</h3><p>'+esc(PROTOABOUT.t)+'</p><h3>Why these together</h3><p>'+esc(PROTOABOUT.s)+'</p><h3>How the roles complement each other</h3><p>'+esc(PROTOABOUT.w)+'</p></details>';
  host.innerHTML=html;
 };
 renderAbout();
})();
