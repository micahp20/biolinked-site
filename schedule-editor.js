/* Personal schedule pilot. Uses the existing member state, permissions and save path. */
(function(){
 'use strict';
 var drafts={}, addDraft=null;
 var units=['mg','mcg','iu','g','tab','cap','mL'];
 var days=[1,2,3,4,5,6,0], dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function editable(){return true;}
 document.documentElement.classList.remove('gk-viewonly');
 function find(id){return gkState.compounds.find(function(c){return c.id===id;});}
 function focusRow(id){var b=Array.from(document.querySelectorAll('[data-pe-open]')).find(function(el){return el.getAttribute('data-pe-open')===id;});if(b){b.focus();b.scrollIntoView({block:'nearest'});}}
 function fields(c){return {dose:c.dose,unit:c.unit,draw:c.draw||'',recon:c.recon||'',runWeeks:c.runWeeks==null?'':c.runWeeks,days:(c.days||[]).slice(),block:c.block==='PM'?'PM':'AM'};}
 function draft(c){if(!drafts[c.id]){drafts[c.id]=fields(c);drafts[c.id].base=JSON.stringify(fields(c));}return drafts[c.id];}
 function definition(c){var e=window.BLProtocolCopy&&BLProtocolCopy.find(c.name);if(e)return '<strong>'+esc(e.label)+'.</strong> '+esc(e.definition);var g=guideFor(c);return g&&g.purpose?esc(g.purpose):'No description is available for this personal entry.';}
 function guideFor(c){var name=String(c.name||'').split('·')[0].trim().toLowerCase();return (window.BL_DOSING||[]).find(function(g){return String(g.name).toLowerCase()===name;});}
 function control(label,field,value,type){return '<label class="pe-field"><span>'+label+'</span><input data-pe-field="'+field+'" type="'+(type||'text')+'"'+(type==='number'?' inputmode="decimal" min="0" step="any"':'')+' value="'+esc(value)+'"></label>';}
 function form(d){return '<div class="pe-grid">'+control('Dose','dose',d.dose,'number')+'<label class="pe-field"><span>Dose unit</span><select data-pe-field="unit">'+units.map(function(u){return '<option value="'+u+'"'+(d.unit===u?' selected':'')+'>'+esc(u==='iu'?'IU':u)+'</option>';}).join('')+'</select></label>'+control('Draw / tablets','draw',d.draw)+'</div>'+control('Reconstitution (if applicable)','recon',d.recon)+control('Planned weeks (optional)','runWeeks',d.runWeeks==null?'':d.runWeeks,'number')+'<p class="pe-help">Planned weeks are a reference. The compound stays scheduled until you remove it.</p>'+
 '<p class="pe-help">Dose and draw must match your vial. A new draw is calculated only when the vial strength and reconstitution are known.</p>'+
 '<fieldset class="pe-days"><legend>Your days</legend><div>'+days.map(function(i){return '<label><input type="checkbox" data-pe-day="'+i+'"'+(d.days.indexOf(i)>=0?' checked':'')+'><span>'+dayNames[i]+'</span></label>';}).join('')+'</div></fieldset>'+
 '<fieldset class="pe-time"><legend>Timing</legend><div>'+['AM','PM'].map(function(b){return '<button type="button" data-pe-time="'+b+'" aria-pressed="'+(d.block===b)+'">'+(b==='AM'?'Morning':'Night')+'</button>';}).join('')+'</div></fieldset>';
 }
 gkArchiveView=function(items){return items.map(function(c){return '<article class="gk-card"><div class="gk-row"><div><div class="gk-name">'+esc(c.name)+'</div><div class="gk-meta">'+esc(gkFmt(c.dose)+' '+c.unit+' · '+gkDayText(c.days))+'</div></div><button class="edit" data-gkrestore="'+esc(c.id)+'">Add back</button></div></article>';}).join('');};
 function panel(c){var d=draft(c);return '<div class="ed-pan open pe-panel" id="pe-panel-'+esc(c.id)+'" data-pe-id="'+esc(c.id)+'"><div class="pe-about"><div class="pe-label">What this compound is</div><p>'+definition(c)+'</p></div>'+
 form(d)+'<p class="pe-error" role="alert" hidden></p><div class="pe-actions"><button type="button" class="pe-save" data-pe-action="save">Save changes</button><button type="button" data-pe-action="cancel">Cancel</button></div><button type="button" class="pe-remove" data-pe-action="remove">Remove from schedule</button>'+'</div>';}
 gkCard=function(c){var open=gkState.open===c.id, name=c.name;
  if(/^\s*\d/.test(c.vial||'')&&name.toLowerCase().indexOf(String(c.vial).toLowerCase())<0)name+=' · '+c.vial;
  var real=find(c.id);
  return '<div class="pe-item"><button type="button" class="drow pe-head'+(c.block==='PM'?' pm':'')+'" data-nm="'+esc(c.name)+'" data-pe-open="'+esc(c.id)+'" aria-expanded="'+open+'" aria-controls="pe-panel-'+esc(c.id)+'"><span class="uu">'+esc(c.draw&&c.draw!=='—'?c.draw:gkFmt(c.dose)+' '+c.unit)+'</span><span class="pe-title"><span class="nm">'+esc(name)+'</span><span class="mt">'+esc([(gkFmt(c.dose)+' '+c.unit).trim(),gkDayText(c.days)].filter(Boolean).join(' · '))+'</span></span>'+(real?'<span class="pe-chevron" aria-hidden="true">⌄</span>':'')+'</button>'+(open&&real?panel(real):'')+'</div>';
 };
 gkDayView=function(rows){var html='';['AM','PM'].forEach(function(block){var list=rows.filter(function(c){return c.block===block;});html+='<div class="seclbl">'+(block==='AM'?'Morning':'Night')+'<span class="cnt">'+list.length+' COMPOUND'+(list.length===1?'':'S')+'</span></div><div class="dgrp">'+(list.length?list.map(gkCard).join(''):'<p class="pe-no-doses">Nothing scheduled '+(block==='AM'?'this morning':'tonight')+'.</p>')+'</div>';});return html+gkMedsSection();};

 function drawFrom(d,c){
  var m=String(c.vial||'').match(/^\s*(\d+(?:\.\d+)?)\s*(mg|mcg|iu)\s*\/\s*m[lL]/i), concentration, vu;
  if(m){concentration=Number(m[1]);vu=m[2].toLowerCase();}
  else{m=String(c.vial||'').match(/^\s*(\d+(?:\.\d+)?)\s*(mg|mcg|iu)\s*$/i);var r=String(d.recon||'').match(/^\s*(\d+(?:\.\d+)?)\s*m[lL]\b/);if(!m||!r||!(Number(r[1])>0))return null;concentration=Number(m[1])/Number(r[1]);vu=m[2].toLowerCase();}
  var du=String(d.unit).toLowerCase(), dose=Number(d.dose);if(!(dose>0&&concentration>0))return null;
  if(vu==='iu'||du==='iu'){if(vu!==du)return null;}
  else{var scale={g:1000,mg:1,mcg:0.001};if(!scale[vu]||!scale[du])return null;dose=dose*scale[du]/scale[vu];}
  return Math.round(dose/concentration*100*100)/100;
 }
 function autoDraw(d,c,host){var n=drawFrom(d,c);if(n!=null){d.draw=n+'u';var input=host.querySelector('[data-pe-field="draw"]');if(input)input.value=d.draw;}}
 function error(host,message){var el=host.querySelector('.pe-error');el.textContent=message;el.hidden=false;}
 function valid(d,c,host){
  if(!Number.isFinite(Number(d.dose))||!(Number(d.dose)>0)){error(host,'Enter a dose greater than zero.');return false;}
  if(!d.days.length){error(host,'Choose at least one day, or remove this compound.');return false;}
  var vialType=String(c.vial||'').match(/\b(mg|mcg|iu)\b/i), expectedUnit=vialType?vialType[1].toLowerCase():c.unit;
  if((expectedUnit==='iu'&&d.unit!=='iu')||(expectedUnit!=='iu'&&vialType&&d.unit==='iu')){error(host,'IU cannot be converted to a mass dose. Use the unit type on your vial.');return false;}
  var volume=String(d.recon||'').match(/(-?\d+(?:\.\d+)?)\s*m[lL]\b/);if(volume&&!(Number(volume[1])>0)){error(host,'Enter a reconstitution volume greater than zero.');return false;}
  if(d.runWeeks!==''&&d.runWeeks!=null&&(!Number.isInteger(Number(d.runWeeks))||Number(d.runWeeks)<1)){error(host,'Enter a whole number of weeks, or leave it blank.');return false;}
  if(units.indexOf(d.unit)<0){error(host,'Choose a dose unit.');return false;}
  if(!String(d.draw||'').trim()&&c.draw&&c.draw!=='—'){error(host,'Enter the draw or tablet quantity for this dose.');return false;}
  var expected=drawFrom(d,c), actual=String(d.draw||'').match(/^\s*~?\s*(\d+(?:\.\d+)?)\s*u\s*$/i);
  if(actual&&!(Number(actual[1])>0)){error(host,'Enter a syringe draw greater than zero.');return false;}
  if(expected!=null&&actual&&Math.abs(Number(actual[1])-expected)>0.11){error(host,'Dose and draw do not match this vial and reconstitution. Expected draw: '+expected+'u. Check your entries.');return false;}
  if(expected==null&&/u\s*$/i.test(c.draw||'')&&(Number(d.dose)!==Number(c.dose)||d.unit!==c.unit)&&d.draw===c.draw){error(host,'Update the syringe draw to match your new dose. Use the Calculator if you need to check it.');return false;}
  return true;
 }
 function sourceDays(freq){var f=String(freq||'');if(/every other|alternate/i.test(f))return [];if(/mon\s*[–-]\s*fri/i.test(f))return [1,2,3,4,5];if(/mon.*wed.*fri/i.test(f))return [1,3,5];if(/mon.*thu/i.test(f))return [1,4];if(/daily|every day/i.test(f))return [0,1,2,3,4,5,6];return [];}
 var addSheet=document.createElement('div');addSheet.className='sheet';addSheet.id='s-pe-add';addSheet.innerHTML='<div class="stop"><button type="button" class="bk" data-pe-action="close-add">‹ Schedule</button><div class="ttl">Add compound</div></div><div class="pad"><h1 class="scrn">Add compound</h1><div id="pe-add-host"></div></div>';document.querySelector('.device').appendChild(addSheet);
 function addView(){
  var d=addDraft, host=document.getElementById('pe-add-host');
  host.innerHTML='<div class="pe-add-mode"><button type="button" data-pe-mode="master" aria-pressed="'+(d.mode==='master')+'">From master list</button><button type="button" data-pe-mode="manual" aria-pressed="'+(d.mode==='manual')+'">Add manually</button></div>'+
   (d.mode==='master'?'<label class="pe-field"><span>Compound and vial strength</span><select id="pe-master"><option value="">Choose a compound…</option>'+(window.BL_DOSING||[]).map(function(g,i){return {g:g,i:i};}).sort(function(a,b){return (a.g.name+' '+a.g.vial).localeCompare(b.g.name+' '+b.g.vial);}).map(function(x){return '<option value="'+x.i+'"'+(d.guide===x.i?' selected':'')+'>'+esc(x.g.name+' · '+x.g.vial)+'</option>';}).join('')+'</select></label>':control('Compound name','name',d.name)+control('Vial strength / form','vial',d.vial))+
   (d.mode==='master'&&d.guide==null?'':(d.mode==='master'?'<div class="pe-about"><p>'+definition(d)+'</p><p class="pe-help">Master guide: '+esc(d.guideText)+'. Review the fields and choose your days before adding.</p></div>':'')+form(d)+'<p class="pe-error" role="alert" hidden></p><div class="pe-actions"><button type="button" class="pe-save" data-pe-action="add">Add to schedule</button><button type="button" data-pe-action="close-add">Cancel</button></div>');
 }
 function openAdd(){addDraft={mode:'master',guide:null,name:'',vial:'',dose:'',unit:'mg',draw:'',recon:'',runWeeks:'',days:[],block:'AM'};addView();sheet('pe-add');}
 document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('#gkAddBtn')){e.preventDefault();e.stopImmediatePropagation();openAdd();}},true);
 document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-pe-open')){var id=b.getAttribute('data-pe-open');if(!find(id))return;if(gkState.open===id){delete drafts[id];gkState.open=null;}else{if(gkState.open)delete drafts[gkState.open];gkState.open=id;draft(find(id));}gkCacheLocal();gkRender();focusRow(id);return;}
  if(b.hasAttribute('data-pe-mode')){if(!editable()||!addDraft)return;addDraft.mode=b.getAttribute('data-pe-mode');addView();return;}
  var host=b.closest('[data-pe-id]')||b.closest('#pe-add-host'), d=host?(host.id==='pe-add-host'?addDraft:drafts[host.getAttribute('data-pe-id')]):null;
  if(b.hasAttribute('data-pe-time')&&d&&editable()){d.block=b.getAttribute('data-pe-time');host.querySelectorAll('[data-pe-time]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});return;}
  var action=b.getAttribute('data-pe-action');if(!action)return;
  if(action==='close-add'){addDraft=null;closeSheet();return;}
  if(!host||!d||!editable())return;
  var c=host.id==='pe-add-host'?null:find(host.getAttribute('data-pe-id'));
  if(action==='cancel'){delete drafts[c.id];gkState.open=null;gkRender();focusRow(c.id);return;}
  if(action==='remove'){c.active=false;if(typeof gkLegacySetOn==='function')gkLegacySetOn(c.name,false);delete drafts[c.id];gkState.open=null;gkSave(true);gkRender();gkToast('Removed from schedule. Use Add back to restore it.');return;}
  if(action==='save'){
   if(JSON.stringify(fields(c))!==d.base){error(host,'This entry changed while you were editing. Close and reopen it to use the latest values.');return;}
   if(!valid(d,c,host))return;
   Object.assign(c,{dose:Number(d.dose),unit:d.unit,draw:String(d.draw||'').trim()||'—',recon:String(d.recon||'').trim(),days:d.days.slice().sort(),block:d.block,runWeeks:d.runWeeks===''||d.runWeeks==null?null:Number(d.runWeeks)});
   if(c.days.indexOf(gkState.selected)<0)gkState.selected=c.days[0];
   if(typeof gkLegacyEdit==='function')gkLegacyEdit(c);
   delete drafts[c.id];gkState.open=null;gkSave(true);gkRender();focusRow(c.id);gkToast('Schedule changes saved.');return;
  }
  if(action==='add'){
   if(!String(d.name||'').trim()){error(host,'Enter a compound name.');return;}
   if(!valid(d,d,host))return;
   var added={id:'man-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),name:String(d.name).trim(),vial:String(d.vial||'Custom').trim(),dose:Number(d.dose),unit:d.unit,draw:String(d.draw||'').trim()||'—',recon:String(d.recon||'').trim(),days:d.days.slice().sort(),block:d.block,step:0.25,foundation:false,active:true,runWeeks:d.runWeeks===''||d.runWeeks==null?null:Number(d.runWeeks)};
   gkState.compounds.push(added);gkState.selected=added.days[0];gkState.open=null;gkSave(true);addDraft=null;closeSheet();go('sched');gkRender();focusRow(added.id);gkToast('Compound added. Tap its row to edit it.');
  }
 });
 document.addEventListener('change',function(e){
  var t=e.target;if(t.id==='pe-master'&&addDraft){if(t.value===''){addDraft.guide=null;addView();return;}var index=Number(t.value),g=(window.BL_DOSING||[])[index];if(!g)return;var m=String(g.dose||'').match(/^\s*(\d+(?:\.\d+)?)\s*(mcg|mg|iu|g|tab|cap|ml)\b/i);var u=String(g.units||'').match(/^\s*(\d+(?:\.\d+)?)\s*u?\s*$/i);Object.assign(addDraft,{guide:index,name:g.name,vial:g.vial||'',dose:m?Number(m[1]):'',unit:m?(m[2].toLowerCase()==='ml'?'mL':m[2].toLowerCase()):'mg',draw:u?u[1]+'u':'',recon:g.bac||'',days:sourceDays(g.freq),block:/pm|night|bed|evening/i.test(g.timing||'')?'PM':'AM',runWeeks:(String(g.dur||'').match(/^\s*(\d+)\s*(?:weeks?|wks?)\b/i)||[])[1]||'',guideText:[g.dose,g.freq,g.timing,g.dur].filter(Boolean).join(' · ')});addView();autoDraw(addDraft,addDraft,document.getElementById('pe-add-host'));return;}
  var host=t.closest&& (t.closest('[data-pe-id]')||t.closest('#pe-add-host'));if(!host||!editable())return;var d=host.id==='pe-add-host'?addDraft:drafts[host.getAttribute('data-pe-id')];if(!d)return;
  if(t.hasAttribute('data-pe-day')){var day=Number(t.getAttribute('data-pe-day'));d.days=t.checked?Array.from(new Set(d.days.concat(day))):d.days.filter(function(v){return v!==day;});}
  if(t.hasAttribute('data-pe-field')){var key=t.getAttribute('data-pe-field');d[key]=t.value;if(['dose','unit','recon'].indexOf(key)>=0)autoDraw(d,host.id==='pe-add-host'?d:find(host.getAttribute('data-pe-id')),host);}
 });
 document.addEventListener('input',function(e){if(e.target.hasAttribute&&e.target.hasAttribute('data-pe-field'))e.target.dispatchEvent(new Event('change',{bubbles:true}));});
 gkRender();
})();

