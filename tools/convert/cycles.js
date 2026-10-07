/* ---------- CYCLES ----------
   Some clients run their protocol as a sequence of cycles rather than one
   standing schedule. Cycles are derived from the tag a compound already
   carries ("Cycle 2 · future"), so no page needs new data: a page with
   fewer than two Cycle N tags has no selector and behaves exactly as before. */
function cycName(c){return String(c.tag||'').split('\u00b7')[0].trim();}
function cycIsFuture(c){return /future|upcoming|planned/i.test(c.tag||'');}
function cycIsPast(c){return /\u00b7\s*past\b|\bprior\b|\bcompleted?\b/i.test(c.tag||'');}
function cycList(){
  var seen={}, out=[];
  ALL.forEach(function(c){
    var n=cycName(c);
    if(!/^Cycle\s*\d+/i.test(n)) return;
    if(seen[n]) return;
    seen[n]=1;
    out.push({n:n, future:cycIsFuture(c), arch:cycIsPast(c)||cmpArch(c)});
  });
  out.sort(function(a,b){
    return parseInt(a.n.replace(/\D+/g,''),10)-parseInt(b.n.replace(/\D+/g,''),10);
  });
  return out.length>1 ? out : [];
}
var CYCS=[], cycSel=null;
function cycCurrent(){
  for(var i=0;i<CYCS.length;i++){ if(!CYCS[i].future && !CYCS[i].arch) return CYCS[i].n; }
  return CYCS.length?CYCS[0].n:null;
}
/* Compounds driving the day strip. With no cycles this is CMP, untouched. */
function cycRows(){
  if(!CYCS.length) return CMP;
  if(cycSel===cycCurrent()) return CMP;
  return ALL.filter(function(c){return cycName(c)===cycSel && !cmpArch(c)});
}
function pickCyc(n){ cycSel=n; renderCyc(); renderDoses(); renderAll(); renderSubline(); }
function renderCyc(){
  var host=document.getElementById('cycbar');
  if(!host) return;
  if(!CYCS.length){ host.innerHTML=''; return; }
  host.innerHTML='<div class="cycrow">'+CYCS.map(function(c){
    var lbl=c.n+(c.n===cycCurrent()?' \u00b7 Current':(c.future?' \u00b7 Upcoming':(c.arch?' \u00b7 Past':'')));
    return '<button type="button" class="cyc'+(c.n===cycSel?' on':'')+
      '" onclick="pickCyc(\''+c.n.replace(/'/g,"\\'")+'\')">'+lbl+'</button>';
  }).join('')+'</div>'+
  (cycSel!==cycCurrent()
    ? '<div class="banner" style="margin-top:8px"><span class="d"></span>This is '+cycSel+
      ', not your current schedule. '+(function(){for(var i=0;i<CYCS.length;i++){if(CYCS[i].n===cycSel)return CYCS[i].future?'It starts when the cycle before it finishes.':'It has already run.';}return '';})()+'</div>'
    : '');
}
function renderSubline(){
  var e=document.getElementById('subline'); if(!e) return;
  var n=cycRows().length;
  e.textContent=n+' active compound'+(n===1?'':'s')+' \u00b7 AM and PM blocks'+
    (CYCS.length&&cycSel!==cycCurrent()?' \u00b7 '+cycSel:'');
}
