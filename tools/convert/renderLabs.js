/* ---------- LABS (shared, data-driven) ----------
   One renderer for every page. LABS is null on a client with no bloodwork,
   in which case the static empty state already in the markup is left alone. */
function renderLabs(){
  var host=document.getElementById('labsbody');
  if(!host||typeof LABS==='undefined'||!LABS) return;
  var o=[];
  o.push('<h1 class="scrn">Labs</h1>');
  o.push('<p class="sub">'+LABS.sub+'</p>');
  if(LABS.score){
    o.push('<div class="score">');
    if(LABS.l!=null) o.push('<div class="l">'+LABS.l+'</div>');
    o.push('<div class="n">'+LABS.score+'<small>'+LABS.outof+'</small></div>');
    if(LABS.g!=null) o.push('<div class="g">'+LABS.g+'</div>');
    if(LABS.c!=null) o.push('<div class="c">'+LABS.c+'</div>');
    if(LABS.domains!=null) o.push('<div class="dgrid">'+LABS.domains.map(function(d){
      return '<div class="dchip"><b>'+d.v+'</b>'+d.n+'</div>'}).join('')+'</div>');
    o.push('</div>');
  }
  o.push('<div class="banner"'+(LABS.bannerattr||'')+'><span class="d"></span>'+LABS.banner+'</div>');
  LABS.secs.forEach(function(s){
    o.push('<div class="seclbl">'+s.t+'</div>');
    o.push('<div class="list">');
    s.rows.forEach(function(r){
      var em=(r.u!=null)?'<em>'+r.u+'</em>':'';
      var pill=(r.p!=null)?'<span class="pill'+(r.pc?' '+r.pc:'')+'">'+r.p+'</span>':'';
      var ref=(r.ref!=null)?'<span class="lref">'+r.ref+'</span>':'';
      o.push('<div class="lrow" onclick="tt(\''+r.id+'\')"><div class="lt">'+
        '<span class="qm">?</span><span class="ln">'+r.n+'</span>'+
        '<span class="lv'+(r.vc?' '+r.vc:'')+'">'+r.v+em+'</span></div>'+
        '<div class="lmeta">'+ref+pill+'</div>'+
        '<div class="ltip" id="'+r.id+'">'+r.tip+'</div></div>');
    });
    o.push('</div>');
  });
  if(LABS.note!=null) o.push('<p class="note">'+LABS.note+'</p>');
  host.innerHTML=o.join('\n');
}
