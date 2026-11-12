/* Shared schedule engine for BioLinked client portals.
   The page must define GK_STORAGE, GK_PROTOCOL_REV, and gkSeed before this file.
   Storage keys and compound seeds are per-member and must not be reused across pages. */
var GK_DAY = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var GK_SHORT = ["S","M","T","W","T","F","S"];
function gkApplyProtocol(st){
  if(!st) return st;
  if(st.protocolRev===GK_PROTOCOL_REV) return st;
  var byId={}; (gkSeed.compounds||[]).forEach(function(c){ byId[c.id]=c; });
  (st.compounds||[]).forEach(function(c){
    var s=byId[c.id]; if(!s) return;
    c.dose=s.dose; c.unit=s.unit; c.draw=s.draw; c.days=s.days.slice();
    c.block=s.block; if(typeof s.recon==="string") c.recon=s.recon;
    if(typeof s.vial==="string") c.vial=s.vial;
  });
  st.protocolRev=GK_PROTOCOL_REV;
  return st;
}
function gkLoad(){
  var st;
  try{ st = JSON.parse(localStorage.getItem(GK_STORAGE)) || JSON.parse(JSON.stringify(gkSeed)); }
  catch(e){ st = JSON.parse(JSON.stringify(gkSeed)); }
  /* Backfill draws: earlier saved state carried placeholder "\u2014" for some
     injectables. Adopt the seed's real draw for any compound still blank so the
     units show; a draw the user actually set is a real value and is kept. */
  try{
    var sd={}; gkSeed.compounds.forEach(function(c){ sd[c.id]=c.draw; });
    (st.compounds||[]).forEach(function(c){
      if((!c.draw || c.draw==='\u2014') && sd[c.id] && sd[c.id]!=='\u2014') c.draw=sd[c.id];
    });
  }catch(e){}
  return gkApplyProtocol(st);
}
/* Local write is the offline cache and happens immediately so the UI never
   waits. The server write is debounced and authoritative: if it refuses, we
   roll the page back to the last state the server accepted rather than leaving
   the screen showing an edit that was never stored. */
var gkPushT=null, gkLastGood=null;
function gkCacheLocal(){ try{ localStorage.setItem(GK_STORAGE, JSON.stringify(gkState)); }catch(e){} }
/* edit=true means the member actually changed something. Everything else is
   navigation and must not reach the server: a brand-new member who opens their
   link and taps around has written nothing, and an existing member on a slow
   connection cannot clobber their own saved row before it has even arrived. */
function gkSave(edit){
  if(edit && typeof BL_DIRTY!=="undefined") BL_DIRTY=true;
  gkCacheLocal();
  if(typeof blRpc!=="function") return;
  if(typeof BL_KEY==="undefined" || !BL_KEY) return;
  if(typeof BL_KEYBAD!=="undefined" && BL_KEYBAD) return;
  if(typeof BL_DIRTY!=="undefined" && !BL_DIRTY) return;
  if((typeof BL_READY!=="undefined" && !BL_READY) || (typeof BL_SEEN!=="undefined" && !BL_SEEN)){
    if(typeof BL_PENDING!=="undefined") BL_PENDING=true;
    return;
  }
  clearTimeout(gkPushT);
  gkPushT=setTimeout(gkPush, 350);
}
function gkPayload(){
  return {
    compounds: gkState.compounds.map(function(c){
      var o={ id:c.id, dose:c.dose, days:c.days, block:c.block, draw:c.draw, unit:c.unit, step:c.step,
              active:!!c.active, archivedOn:c.archivedOn||null };
      if(c.runWeeks!==undefined) o.runWeeks=c.runWeeks;
      if(typeof c.recon==='string') o.recon=c.recon;
      /* Compounds added from the Calculator are not in the page's seed, so the
         full definition travels with the payload or another device never sees it. */
      if(/^(calc|man)-/.test(c.id)){ o.name=c.name; o.vial=c.vial; o.unit=c.unit;
        o.draw=c.draw; o.step=c.step; o.foundation=!!c.foundation; }
      return o;
    }),
    meds: (function(){
      gkEnsureMeds();
      return (gkState.meds||[]).map(function(m){
        var o={ id:m.id, active:m.active!==false };
        /* user-added meds are not in the page's MEDS seed, so the full def
           travels with the payload or another device never sees them. */
        if(gkMedIsCustom(m.id) && m.def){
          o.def={ name:m.def.name, dose:m.def.dose, group:m.def.group, info:m.def.info||'' };
        }
        return o;
      });
    })(),
    selected: gkState.selected,
    view: gkState.view,
    protocolRev: gkState.protocolRev||GK_PROTOCOL_REV
  };
}
function gkPush(){
  if(typeof blRpc!=="function") return;
  if(typeof BL_KEY==="undefined" || !BL_KEY) return;
  if(typeof BL_KEYBAD!=="undefined" && BL_KEYBAD) return;
  if(typeof BL_DIRTY!=="undefined" && !BL_DIRTY) return;
  if(typeof GK_VIEWONLY!=='undefined'&&GK_VIEWONLY) return;
  /* If the boot read failed we still do not know what is on the server, so read
     before writing rather than overwriting blind. The member's edit wins once
     the read succeeds -- it is an explicit action on their own device. */
  if(!BL_SEEN){
    blRpc('get_member_state',{p_slug:BL_SLUG,p_key:BL_KEY}).then(function(r){
      if(r.ok){ BL_SEEN=true; BL_ONLINE=true; BL_VER=blUnwrap(r.data).versions||{}; gkPushNow(); }
      else if(r.status===401){ BL_KEYBAD=true; blForgetKey(); gkToast(blMessage(r));  }
    }).catch(function(){ BL_ONLINE=false; });
    return;
  }
  gkPushNow();
}
function gkPushNow(){
  var attempt=JSON.stringify(gkState);
  blRpc('save_member_state',{p_slug:BL_SLUG,p_key:BL_KEY,p_kind:'schedule',
                             p_payload:gkPayload(), p_expected_version:BL_VER.schedule})
    .then(function(r){
      if(r.ok){
        BL_ONLINE=true; gkLastGood=attempt;
        if(r.data && typeof r.data.version==='number') BL_VER.schedule=r.data.version;
        return;
      }
      if(r.status===401){ BL_KEYBAD=true; blForgetKey(); gkToast(blMessage(r)); gkRollback(); return; }
      if(blIsConflict(r)){ blResync(); return; }
      gkToast(blMessage(r));
      gkRollback();
    })
    .catch(function(){ BL_ONLINE=false; });   /* offline: cache holds, retry on next edit */
}
/* The server refused because someone else wrote since we last read. The other
   side's change is the newer one, so we take it rather than insisting -- this
   edit is lost, which is the honest outcome and better than reverting a change
   the member made somewhere else. */
function blIsConflict(r){
  if(!r) return false;
  if(r.status===409) return true;                       /* PT409 from the server */
  return !!(r.err && /version_conflict/.test(r.err.message||''));
}
var blResyncing=false;
function blResync(){
  if(blResyncing) return; blResyncing=true;
  blRpc('get_member_state',{p_slug:BL_SLUG,p_key:BL_KEY})
    .then(function(r){
      blResyncing=false;
      if(!r.ok) return;
      var u=blUnwrap(r.data);
      BL_VER=u.versions||{};
      gkHydrate(u.state.schedule);
      if(u.state.nutrition){ try{
        if(u.state.nutrition.targets) localStorage.setItem(nKey(NUT_CFG.STORE_TARGETS), JSON.stringify(u.state.nutrition.targets));
        if(u.state.nutrition.plan)    localStorage.setItem(nKey(NUT_CFG.STORE_PLAN),    JSON.stringify(u.state.nutrition.plan));
      }catch(e){} }
      gkCacheLocal();
      gkLastGood=JSON.stringify(gkState);
      gkRender();
      gkToast("Updated from your other device.");
    })
    .catch(function(){ blResyncing=false; });
}
function gkRollback(){
  if(!gkLastGood) return;
  try{ gkState=JSON.parse(gkLastGood); }catch(e){ return; }
  gkCacheLocal();
  gkRender();
}
/* Server state is an overlay on the page's own compound list, not a
   replacement for it: names, units and the stepper rails always come from the
   page, so editing the protocol here never gets erased by an older saved row,
   and a compound the member no longer has simply does not match. */
function gkHydrate(p){
  if(!p || !p.compounds) return;
  var byId={};
  p.compounds.forEach(function(x){ if(x && x.id) byId[x.id]=x; });
  gkState.compounds.forEach(function(c){
    var v=byId[c.id]; if(!v) return;
    if(typeof v.dose==='number')     c.dose=v.dose;
    if(Array.isArray(v.days) && v.days.length) c.days=v.days.slice();
    if(v.block==='AM'||v.block==='PM') c.block=v.block;
    if(typeof v.active==='boolean')  c.active=v.active;
    if(v.runWeeks!==undefined)       c.runWeeks=v.runWeeks;
    if(typeof v.draw==='string' && v.draw && v.draw!=='—') c.draw=v.draw;
    if(typeof v.recon==='string') c.recon=v.recon;
    if(typeof v.unit==='string' && v.unit) c.unit=v.unit;
    if(typeof v.step==='number' && v.step>0) c.step=v.step;
    c.archivedOn = v.archivedOn || null;
  });
  /* The saved/synced state is the source of truth: any seed compound the
     server does NOT list is one the user removed - never force it back on
     from the page default. (This is what caused compounds to re-appear.) */
  gkState.compounds.forEach(function(c){ if(!byId[c.id]) c.active=false; });
  /* Calculator-added compounds are not in the seed, so adopt any the server has
     that this device does not already carry -- their full definition rides along
     in the payload. */
  var have={}; gkState.compounds.forEach(function(c){ have[c.id]=true; });
  p.compounds.forEach(function(v){
    if(!v || !v.id || have[v.id] || !/^(calc|man)-/.test(v.id) || !v.name) return;
    gkState.compounds.push({
      id:v.id, name:v.name, vial:v.vial||"Custom",
      dose:typeof v.dose==='number'?v.dose:0, step:typeof v.step==='number'?v.step:0.25,
      unit:v.unit||"mg", draw:v.draw||"—", recon:typeof v.recon==='string'?v.recon:'', block:(v.block==='PM'?'PM':'AM'),
      days:(Array.isArray(v.days)&&v.days.length)?v.days.slice():[],
      foundation:!!v.foundation, active:v.active!==false,
      runWeeks:(v.runWeeks===undefined?null:v.runWeeks)
    });
  });
  /* Meds overlay: set active flags on seeded meds and adopt any user-added
     (med-, non-seed) meds the server carries that this device lacks. */
  if(Array.isArray(p.meds)){
    gkEnsureMeds();
    var mById={}; gkState.meds.forEach(function(m){ if(m&&m.id) mById[m.id]=m; });
    p.meds.forEach(function(v){
      if(!v||!v.id) return;
      if(mById[v.id]){
        if(typeof v.active==='boolean') mById[v.id].active=v.active;
        if(gkMedIsCustom(v.id) && v.def) mById[v.id].def=v.def;
      } else if(gkMedIsCustom(v.id) && v.def){
        var nm={ id:v.id, active:v.active!==false, def:v.def };
        gkState.meds.push(nm); mById[v.id]=nm;
      }
    });
  }
  if(typeof p.selected==='number') gkState.selected=p.selected;
  if(p.view) gkState.view=p.view;
  if(typeof p.protocolRev==='number') gkState.protocolRev=p.protocolRev;
  gkApplyProtocol(gkState);
}
var gkState = gkLoad();
gkState.view = gkState.view || "schedule";
function gkWeek(){ var st=new Date(gkState.cycleStart+"T00:00:00"), n=new Date(); n.setHours(0,0,0,0);
  return Math.min(gkState.cycleWeeks, Math.max(1, Math.floor((n-st)/86400000/7)+1)); }
function gkDaysInto(){ var st=new Date(gkState.cycleStart+"T00:00:00"), n=new Date(); n.setHours(0,0,0,0);
  return Math.max(0, Math.floor((n-st)/86400000)); }
function gkCycleDone(){ return gkDaysInto() >= gkState.cycleWeeks*7; }
/* Fires on page open, so a client who does not open the page is not swept.
   Good enough while this is local-only; a scheduled job would do it properly. */
/* Archiving has been removed: the schedule now lists every compound on its due
   days. Kept as a no-op so existing callers stay valid. */
function gkArchiveIfDue(){ return; }
function gkToast(msg){ var el=document.getElementById("gkToast"); if(!el) return;
  el.textContent=msg; el.classList.add("show"); clearTimeout(gkToast._t);
  gkToast._t=setTimeout(function(){ el.classList.remove("show"); },2400); }
function gkFmt(n){ if(n==null||n==="") return ""; n=Number(n); if(!Number.isFinite(n)) return ""; return Number.isInteger(n)?String(n):String(Math.round(n*100)/100); }
function gkDayText(days){ if(days.length===7) return "Daily";
  return [1,2,3,4,5,6,0].filter(function(d){return days.indexOf(d)>=0;}).map(function(d){return GK_DAY[d];}).join(" / "); }
function gkRound(n){ return Math.round(n*100)/100; }
/* gkSeed is generated from the page's own ALL list, in order, one entry per
   non-archived row (a BOTH row gives an AM and a PM entry), across EVERY cycle.
   A cycle-based protocol lists the same compound once per cycle, so showing
   every seed entry repeated HGH six times on a six-cycle plan. The schedule
   shows what the pre-migration day view showed: rows of the current cycle plus
   rows that run in every cycle (the page's own cycCurrent/cycHas), each compound
   once per dose slot. Saved device or server state is filtered the same way, so
   an existing visitor's phone corrects itself on the next load and a later cycle
   change still finds its compounds. Member-added (calc-/man-) entries always show. */
function gkPlanIds(){
  try{
    if(typeof ALL==="undefined"||!Array.isArray(ALL)||!gkSeed||!Array.isArray(gkSeed.compounds)) return null;
    var cur=(typeof cycCurrent==="function")?cycCurrent():null;
    var seed=gkSeed.compounds, p=0, ok={}, seen={};
    for(var i=0;i<ALL.length;i++){
      var r=ALL[i], took=[];
      if(p<seed.length && seed[p].name===r.n){
        took.push(seed[p++]);
        if(r.b==="BOTH" && p<seed.length && seed[p].name===r.n && seed[p].block!==took[0].block) took.push(seed[p++]);
      }
      if(!took.length) continue;
      if(cur && typeof cycHas==="function" && !cycHas(r,cur)) continue;
      took.forEach(function(s){
        var k=[s.name,s.block,(s.days||[]).slice().sort().join(","),s.dose,s.unit].join("|");
        if(seen[k]) return; seen[k]=1; ok[s.id]=1;
      });
    }
    return p===seed.length ? ok : null;
  }catch(e){ return null; }
}
function gkPlanFilter(list){
  var ok=gkPlanIds(), seen={};
  return (list||[]).filter(function(c){
    if(/^(calc|man)-/.test(c.id||"")) return true;
    if(ok) return !!ok[c.id];
    /* Unrecognised seed shape: never show the same compound twice in one slot. */
    var k=c.name+"|"+c.block; if(seen[k]) return false; seen[k]=1; return true;
  });
}
/* PRE-MIGRATION CHOICES. Before 14aa605 the day view was
     schRows().filter(due(c,day) && cycHas(c, cycCurrent()))  split by inBlock(c,'AM'/'PM')
   where schRows() carries the client's own saved on/off choices (device key
   SCHKEY, replaced by the server copy from get_state when there is one, else the
   paid-invoice default), their self-added compounds, dose overrides, and due()
   carries their own weekday picks. All of that code still runs on every page, so
   the schedule reads it again here and only the card UI is new. Editor actions
   write back to the same stores (and so to the same server sync). */
function gkLegacyOK(){
  return typeof schRows==="function" && typeof due==="function" && typeof schGet==="function" &&
         typeof schSave==="function" && typeof ALL!=="undefined" && Array.isArray(ALL);
}
function gkLegacyCur(){ return (typeof cycCurrent==="function")?cycCurrent():null; }
function gkLegacyIn(c,cur){ return !cur || (typeof cycHas==="function" ? cycHas(c,cur) : true); }
function gkLegacyBlocks(c){
  return ["AM","PM"].filter(function(g){
    return (typeof inBlock==="function") ? inBlock(c,g) : (c.b===g || c.b==="BOTH");
  });
}
function gkLegacyDays(c){ var o=[]; for(var i=0;i<7;i++){ if(due(c,i)) o.push(i); } return o; }
function gkLegacyLink(name,block,ok){
  var best=null;
  gkState.compounds.forEach(function(x){
    if(x.name!==name || /^(calc|man)-/.test(x.id||"")) return;
    if(ok && !ok[x.id]) return;
    if(!best || (x.block===block && best.block!==block)) best=x;
  });
  return best;
}
function gkLegacyCard(r,g,ok){
  var link=r.sa?null:gkLegacyLink(r.n,g,ok), days=gkLegacyDays(r);
  if(link){ link.days=days.slice(); }   /* editor panel opens on the days actually shown */
  return { id:link?link.id:("sa-"+String(r.sa||r.n)), legacy:true, name:r.n, vial:link?link.vial:"",
           dose:"", unit:String(r.d||""), draw:String(r.u||""), recon:r.rec||"", days:days, block:g,
           foundation:false, active:true };
}
function gkLegacyView(d){
  var cur=gkLegacyCur(), ok=gkPlanIds(), on=schRows(), cards=[];
  on.filter(function(c){ return due(c,d) && gkLegacyIn(c,cur); }).forEach(function(r){
    gkLegacyBlocks(r).forEach(function(g){ cards.push(gkLegacyCard(r,g,ok)); });
  });
  /* Compounds the member added with the new editor since the migration. */
  gkState.compounds.forEach(function(c){
    if(/^(calc|man)-/.test(c.id||"") && c.active!==false && (c.days||[]).indexOf(d)>=0) cards.push(c);
  });
  var onN={}, seen={}, off=[];
  on.forEach(function(c){ onN[c.n]=1; });
  ALL.forEach(function(r){
    if(onN[r.n] || seen[r.n]) return;
    if(typeof cmpArch==="function" && cmpArch(r)) return;
    if(!gkLegacyIn(r,cur)) return;
    var l=gkLegacyLink(r.n,r.b,ok); if(!l) return;
    seen[r.n]=1; off.push(l);
  });
  gkState.compounds.forEach(function(c){ if(/^(calc|man)-/.test(c.id||"") && c.active===false) off.push(c); });
  return {due:cards, off:off};
}
function gkLegacySetOn(name,on){
  if(!gkLegacyOK()) return;
  var known=ALL.some(function(r){ return r.n===name; }); if(!known) return;
  var st=schGet(); if(on) st[name]=1; else delete st[name];
  schSave();
}
function gkLegacyEdit(c){
  if(!gkLegacyOK() || !c || /^(calc|man)-/.test(c.id||"")) return;
  var cur=gkLegacyCur(), row=null;
  ALL.forEach(function(r){ if(!row && r.n===c.name && gkLegacyIn(r,cur)) row=r; });
  if(!row) return;
  var seed=(gkSeed.compounds||[]).filter(function(x){ return x.id===c.id; })[0]||{};
  try{
    if(typeof dpSet==="function"){
      var proto=(typeof dpProto==="function"?dpProto(row):[]).join(), mine=(c.days||[]).slice().sort().join();
      var own=(typeof dpOwn==="function")?dpOwn(row.n):null;
      if(mine && mine!==proto) dpSet(row.n,c.days); else if(own) dpSet(row.n,null);
    }
    if(typeof schBlkGet==="function"){
      var b=schBlkGet();
      if(c.block && c.block!==seed.block) b[row.n]=c.block; else if(b[row.n]) delete b[row.n];
      schSave();
    }
    if(typeof ovSet==="function"){
      var changed=c.dose!==seed.dose || c.unit!==seed.unit || (c.draw||"")!==(seed.draw||"") || (c.recon||"")!==(seed.recon||"");
      if(changed) ovSet(row.n,{d:gkFmt(c.dose)+" "+(String(c.unit).toLowerCase()==="iu"?"IU":c.unit), u:c.draw||"", rec:c.recon||""});
      else if(typeof ovOwn==="function" && ovOwn(row.n)) ovSet(row.n,null);
    }
  }catch(e){}
}
function gkRender(){
  if(!document.getElementById("gkList")) return;
  gkArchiveIfDue();
  gkEnsureMeds();
  /* No lock/unlock badge: schedule controls are always available. */
  var h=new Date().getHours();
  document.getElementById("gkGreet").textContent=(h<12?"Good morning":h<17?"Good afternoon":"Good evening")+", "+gkSeed.member;
  var strip=document.getElementById("gkDayStrip");
  strip.innerHTML=GK_DAY.map(function(label,i){
    /* Days only -- a client rarely starts on the date shown, so a real date
       reads as a promise the schedule is not making. */
    return '<button class="day'+(gkState.selected===i?" on":"")+'" data-gkday="'+i+'"><b>'+label.toUpperCase()+'</b></button>';
  }).join("");
  /* Only the current plan reaches the screen (see gkPlanFilter). */
  var dueNow, off;
  if(gkLegacyOK()){
    var lv=gkLegacyView(gkState.selected); dueNow=lv.due; off=lv.off;
  }else{
    var all=gkPlanFilter(gkState.compounds);
    dueNow=all.filter(function(c){return c.active!==false && c.days.indexOf(gkState.selected)>=0;});
    off=all.filter(function(c){return c.active===false;});
  }
  document.getElementById("gkSummary").textContent=dueNow.length+" due "+GK_DAY[gkState.selected]+" · off-days are hidden";
  var offHtml=off.length?(
    '<button type="button" class="gk-offtog" id="gkOffTog" onclick="gkToggleOff()">Not on schedule ('+off.length+')<span class="gk-offcv">›</span></button>'+
    '<div class="gk-offwrap" id="gkOffWrap" hidden>'+gkArchiveView(off)+'</div>'
  ):"";
  document.getElementById("gkList").innerHTML=gkDayView(dueNow)+offHtml;
}
/* The inactive/removed compounds sit collapsed behind the foot-of-schedule
   toggle; this just opens or closes that list (add-back buttons live inside). */
function gkToggleOff(){
  var w=document.getElementById("gkOffWrap"), b=document.getElementById("gkOffTog");
  if(!w) return;
  w.hidden=!w.hidden;
  if(b) b.classList.toggle("on", !w.hidden);
}
/* The client can move any compound between the Morning (AM) and Night (PM)
   blocks from its edit panel. The choice lives on the compound's own block
   field, so it saves and syncs with everything else (local + cloud). */
function gkEnsureMeds(){ if(!gkState.meds) gkState.meds=[]; }
function gkMedIsCustom(id){ return /^med-/.test(id||"") && !/^med-seed-/.test(id||""); }
function gkMedDef(){ return null; }
function gkMedsSection(){ return ""; }
function gkMedArchiveView(){ return ""; }
function gkToggleMedOff(){}
function openMedId(){}
function gkSetMedGroup(){}
function openMedAdd(){}
function gkMedAddErr(){}
function confirmMedAdd(){}
function gkDayView(dueNow){
  var am=dueNow.filter(function(c){return schBlk(c)==="AM";});
  var pm=dueNow.filter(function(c){return schBlk(c)==="PM";});
  function head(block,n){ return '<div class="block-head"><h3>'+(block==="AM"?"MORNING":"NIGHT")+'</h3><em>'+n+' DUE</em></div>'; }
  function cards(items,block){ return items.map(gkCard).join("")||'<div class="gk-empty">Nothing scheduled '+(block==="AM"?"this morning":"tonight")+'.</div>'; }
  /* Injections first (filtered by the selected day), then the grouped meds &
     supplements section beneath them. Order: MORNING -> NIGHT -> MEDS. */
  return head("AM",am.length)+cards(am,"AM")+
    head("PM",pm.length)+cards(pm,"PM")+
    gkMedsSection();
}
function gkRunNote(c){
  if(c.runWeeks===undefined || c.runWeeks===null && c.foundation) return "";
  if(c.runWeeks===null) return " · ongoing";
  return " · runs "+c.runWeeks+" wk"+(c.runWeeks===1?"":"s");
}
function gkCard(c){
  var open=gkState.open===c.id;
  return '<article class="gk-card"><div class="gk-row">'+
    '<div class="dose-mark">'+gkFmt(c.dose)+'<small>'+c.unit+'</small>'+(function(){var d=(c.draw&&c.draw!=='\u2014')?String(c.draw).trim():'';if(!d)return '';var lbl=/u$/.test(d)?('pull '+d):d;return '<span class="dose-pull">'+lbl+'</span>';})()+'</div>'+
    '<div><div class="gk-name">'+c.name+'</div><div class="gk-meta">'+c.vial+' · '+gkDayText(c.days)+(c.foundation?" · year-round":"")+gkRunNote(c)+'</div></div>'+
    '<button class="edit'+(open?" on":"")+'" data-gkedit="'+c.id+'">'+(open?"Done":"Edit")+'</button>'+
    '</div>'+(open?gkPanel(c):"")+'</article>';
}
function gkPanel(c){
  /* Dose has a +/- stepper on this (owner) page; it writes to the compound
     and syncs like everything else. Days ARE the client's: they pick which days
     they take it, and that choice syncs. Remove takes it off the schedule. */
  return '<div class="panel"><div class="gk-label">DOSE</div>'+
    '<div class="gk-row"><div class="dose-adj"><button type="button" class="blkb dstep" data-gkdose="'+c.id+'" data-gkdir="-1">&minus;</button><div class="fixed-dose">'+gkFmt(c.dose)+'<small>'+c.unit.toUpperCase()+'</small></div><button type="button" class="blkb dstep" data-gkdose="'+c.id+'" data-gkdir="1">+</button></div>'+
    '<div class="range">'+c.draw+' draw</div></div>'+
    '<div class="gk-label" style="margin-top:14px">DRAW</div>'+
    '<div class="gk-row"><input class="draw-in" type="text" value="'+(c.draw&&c.draw!=='\u2014'?c.draw:'')+'" data-gkdrawid="'+c.id+'" placeholder="units to pull \u2014 e.g. 40u (leave blank for tablets)"></div>'+
    '<div class="gk-label" style="margin-top:14px">DAYS</div>'+
    '<div class="days-edit">'+GK_SHORT.map(function(l,i){
      return '<button class="chip'+(c.days.indexOf(i)>=0?" on":"")+'" data-gktoggle="'+c.id+'" data-gkd="'+i+'">'+l+'</button>';}).join("")+'</div>'+
    '<div class="gk-label" style="margin-top:14px">TIMING</div>'+
    '<div class="days-edit"><button type="button" class="blkb'+((c.block||'AM')==='AM'?' on':'')+'" data-gkblock="'+c.id+'" data-gkb="AM">AM</button>'+
      '<button type="button" class="blkb'+((c.block||'AM')==='PM'?' on':'')+'" data-gkblock="'+c.id+'" data-gkb="PM">PM</button></div>'+
    '<div class="actions"><button class="ghost" data-gkremove="'+c.id+'">Remove</button></div></div>';
}
function gkArchiveView(items){
  if(!items.length) return '<div class="gk-empty">Archive is empty. Archiving a compound removes it from every day. Add back returns it with the same dose and days.</div>';
  return items.map(function(c){
    return '<article class="gk-card"><div class="gk-row"><div><div class="gk-name">'+c.name+'</div>'+
      '<div class="gk-meta">'+gkFmt(c.dose)+' '+c.unit+' · '+gkDayText(c.days)+(c.archivedOn?" · archived "+c.archivedOn:"")+'</div></div>'+
      '<button class="edit" data-gkrestore="'+c.id+'">Add back</button></div></article>';}).join("");
}
document.addEventListener("click",function(e){
  var t=e.target.closest&&e.target.closest("button"); if(!t) return;
  if(t.dataset.gkday!=null){ gkState.selected=Number(t.dataset.gkday); gkState.open=null; gkSave(); gkRender(); return; }
  if(t.dataset.gkblock!=null){
    var blkC=gkState.compounds.filter(function(x){return x.id===t.dataset.gkblock;})[0];
    if(blkC){ blkC.block=t.dataset.gkb; gkSave(true); gkRender(); }
    return;
  }
  if(t.dataset.gkdose!=null){
    var cd=gkState.compounds.filter(function(x){return x.id===t.dataset.gkdose;})[0]; if(!cd) return;
    var stp=(typeof cd.step==='number'&&cd.step>0)?cd.step:0.25;
    cd.dose=Math.max(0, gkRound(cd.dose + Number(t.dataset.gkdir)*stp));
    gkSave(true); gkRender(); return;
  }
  if(t.dataset.gkrestore!=null){
    var cr=gkState.compounds.filter(function(x){return x.id===t.dataset.gkrestore;})[0]; if(!cr) return;
    cr.active=true; cr.archivedOn=null; gkState.open=null; gkLegacySetOn(cr.name,true); gkSave(true); gkRender(); gkToast(cr.name+" added back to your schedule."); return;
  }
  if(t.dataset.gkmedremove!=null){
    var mr=null; (gkState.meds||[]).forEach(function(x){ if(x.id===t.dataset.gkmedremove) mr=x; });
    if(mr){ var dn=gkMedDef(mr); mr.active=false; gkSave(true); gkRender();
      gkToast(((dn&&dn.name)||'Medication')+" removed — add it back anytime."); }
    return;
  }
  if(t.dataset.gkmedrestore!=null){
    var ma=null; (gkState.meds||[]).forEach(function(x){ if(x.id===t.dataset.gkmedrestore) ma=x; });
    if(ma){ var dr=gkMedDef(ma); ma.active=true; gkSave(true); gkRender();
      gkToast(((dr&&dr.name)||'Medication')+" added back to your meds."); }
    return;
  }
  var id=t.dataset.gkedit||t.dataset.gktoggle||t.dataset.gkremove;
  if(!id) return;
  /* gkedit only opens or closes the panel -- navigation, not an edit. */
  var mutates = !!(t.dataset.gktoggle||t.dataset.gkremove);
  var c=gkState.compounds.filter(function(x){return x.id===id;})[0]; if(!c) return;
  if(t.dataset.gkedit) gkState.open = gkState.open===id ? null : id;
  if(t.dataset.gktoggle){ var d=Number(t.dataset.gkd);
    c.days = c.days.indexOf(d)>=0 ? c.days.filter(function(x){return x!==d;}) : c.days.concat([d]);
    if(!c.days.length){ c.days=[d]; gkToast("Leave one day on, or remove it."); } }
  if(t.dataset.gkremove){
    c.active=false; gkState.open=null; gkLegacySetOn(c.name,false); gkToast(c.name+" moved to All compounds \u2014 add it back anytime.");
  }
  gkSave(mutates); gkRender();
});
document.addEventListener("change",function(e){
  var inp=e.target.closest&&e.target.closest("input[data-gkdrawid]"); if(!inp) return;
  var c=gkState.compounds.filter(function(x){return x.id===inp.dataset.gkdrawid;})[0]; if(!c) return;
  var v=inp.value.trim(); c.draw = v || "\u2014"; gkSave(true); gkRender();
});

var gkState = gkLoad();
/* The legacy sync (csApply, the day/override/add merges) still calls
   renderDoses() when the server copy arrives; route that to this schedule. */
if(typeof renderDoses==="function"){
  var gkRenderDosesOld=renderDoses;
  renderDoses=function(){ try{ gkRenderDosesOld.apply(this,arguments); }catch(e){} try{ gkRender(); }catch(e){} };
}
if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded", function(){ try{ gkRender(); }catch(e){ console.error(e); } });
}else{
  try{ gkRender(); }catch(e){ console.error(e); }
}
