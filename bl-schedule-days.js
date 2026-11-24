/* Master-sheet schedule defaults for every protocol page (loaded last).
   - Weekday defaults come from the Master Dosing sheet's Timing / Schedule
     cell (via /bl-dosing.js). No usable cell -> Mon-Fri, the protocol default.
   - Picking a compound in the calculator keeps its vial in the name
     ("Retatrutide · 30 mg"), so what lands on the schedule says which vial.
   - "+ Add to My List" now goes straight on to the day picker, so a
     calculator entry can be put on the schedule with the days the client
     picks. Cancel keeps it in My List only.
   Client choices are a personal override; the protocol is never changed. */
(function(){
 'use strict';
 var MF=[1,2,3,4,5];
 function cat(){ return window.BL_DOSING||[]; }
 function daysFrom(f){
  f=String(f||'').replace(/[–—]/g,'-');
  if(/every other day|alternate/i.test(f)) return [1,3,5];
  if(/\bdaily\b|every day|run straight/i.test(f)) return [0,1,2,3,4,5,6];
  if(/\bm\s*\/\s*w\s*\/\s*f\b|mon\w*\W+wed\w*\W+fri/i.test(f)) return [1,3,5];
  if(/mon\w*\s*(\+|&|and|\/|,)\s*thu/i.test(f)) return [1,4];
  if(/\bm\s*-\s*f\b|mon\w*\s*-\s*fri/i.test(f)) return MF.slice();
  return MF.slice();
 }
 function split(name){ var p=String(name||'').split(' · '); return {n:p[0].split(' \u2014 ')[0].trim().toLowerCase(), v:(p[1]||'').trim().toLowerCase()}; }
 function guide(name){
  var s=split(name), hit=null;
  cat().forEach(function(g){ if(String(g.name).toLowerCase()!==s.n) return;
   if(!hit || (s.v && String(g.vial).toLowerCase()===s.v)) hit=g; });
  return hit;
 }
 function block(g){ return /\bpm\b|night|bed|evening/i.test(g&&(g.timing||g.freq)||'')?'PM':'AM'; }
 window.blSheetDays=daysFrom;
 window.blSheetGuide=guide;
 window.blSheetDaysFor=function(name){ var g=guide(name); return daysFrom(g&&g.freq); };
 window.blSheetBlockFor=function(name){ return block(guide(name)); };
 /* the page's own helpers resolve these by global name at call time */
 window.saGuideDays=function(f){ return daysFrom(f); };
 window.saGuide=function(name){ return guide(name); };

 /* calculator: keep the vial with the compound name */
 var sel=document.getElementById('pc-compound'), nameEl=document.getElementById('pc-name');
 function withVial(){
  if(!sel||!nameEl||sel.value==='__custom__') return;
  var g=cat()[+sel.value]; if(!g||!g.vial) return;
  var opt=sel.options[sel.selectedIndex]; if(!opt||String(opt.text).split(' \u2014 ')[0].trim()!==String(g.name).trim()) return;
  var want=g.name+' · '+g.vial; if(nameEl.value===want) return;
  if(String(nameEl.value).trim()!==String(g.name).trim()) return;   /* never overwrite a typed name */
  nameEl.value=want; nameEl.dispatchEvent(new Event('input',{bubbles:true}));
 }
 if(sel){ sel.addEventListener('change',function(){ setTimeout(withVial,0); }); }

 /* Engine-only schedule variants must not add calculator rows to the legacy
    SA store: their visible schedule reads gkState, not schRows(). */
 document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest&&e.target.closest('#pc-schbtn');
  if(!b||typeof window.BLAddCalculatorSchedule!=='function'||typeof window.gkSyncAdded==='function')return;
  if(typeof window.GK_VIEWONLY!=='undefined'&&window.GK_VIEWONLY)return;
  function val(id){var x=document.getElementById(id);return x?x.value:'';}
  var dose=Number(val('pc-dose')), vialN=Number(val('pc-vial')), bacN=Number(val('pc-bac'));
  if(!(dose>0&&vialN>0&&bacN>0))return;
  e.preventDefault();e.stopImmediatePropagation();withVial();
  var name=val('pc-name').trim(), g=sel&&sel.value!=='__custom__'?cat()[+sel.value]:null;
  var unit=val('pc-doseunit')||'mg';
  var rawVial=g&&g.vial||vialN+' '+(unit==='iu'?'IU':'mg');
  var draw=(document.getElementById('pc-units')||{}).textContent||'';
  draw=draw.replace(/\s+/g,'').replace(/u?$/,'u');
  if(!name)return;
  window.BLAddCalculatorSchedule({name:name,vial:rawVial,dose:dose,unit:unit,draw:draw,recon:bacN+' mL',days:daysFrom(g&&g.freq),block:block(g)});
 },true);

 /* calculator: "+ Add to My List" continues to the day picker */
 function listCount(){ return document.querySelectorAll('#pc-list .pc-item').length; }
 function picker(){
  var b=document.getElementById('pc-schbtn')||document.getElementById('pc-schedbtn');
  return b&&b.offsetParent!==null?b:null;
 }
 document.addEventListener('click',function(e){
  var add=e.target&&e.target.closest&&e.target.closest('#pc-addbtn'); if(!add) return;
  withVial();
  var before=listCount(), editing=/save/i.test(add.textContent||'');
  setTimeout(function(){
   if(editing||listCount()<=before) return;
   var b=picker(); if(!b) return;
   var pan=document.getElementById('sa-pan'); if(pan&&!pan.hidden) pan.hidden=true;
   b.click();
   if(pan&&!pan.hidden){ var p=document.createElement('p'); p.className='sa-s sa-fromlist'; p.textContent='Saved to My List. Pick your days to add it to your schedule too, or tap Cancel.'; pan.insertBefore(p,pan.firstChild); }
  },0);
 },true);

 /* calculator day picker: say where the preselected days came from */
 document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest&&e.target.closest('#pc-schbtn'); if(!b) return;
  setTimeout(function(){
   var pan=document.getElementById('sa-pan'); if(!pan||pan.hidden) return;
   [].forEach.call(pan.querySelectorAll('.sa-s'),function(p){
    if(/No schedule on file in the dosing guide/.test(p.textContent)) p.textContent=p.textContent.replace('No schedule on file in the dosing guide. Pick your days.','No schedule on the master sheet, so Mon–Fri is selected. Change the days to suit you.');
   });
  },0);
 });
})();
