/* Schedule pilot. Loaded only by /arasche/, after the existing portal editor.
   Uses the existing versioned schedule sync; never changes protocol or billing data. */
(function(){
  'use strict';
  if(window.__schedulePilot || typeof ALL==='undefined' || typeof schRows!=='function') return;
  window.__schedulePilot=true;
  var KEY=SCHKEY+'-plan-pilot-v1', state=null, preview=null, picker=false, manager=false, year=false;
  var CLOSE='Close', DONE='Completed', expanded={}, baseNames={};
  var cycles=(cycList()||[]).map(function(c){return c.n;});
  /* Ongoing foundation is explicit for this annual pilot, not inferred from purchases. */
  ALL.forEach(function(c){if(/^HGH\s*·|^Retatrutide\s*·/.test(c.n)) baseNames[c.n]=true;});
  var names=cycles.length?cycles.concat([CLOSE]):['My plan'];
  function copy(x){return JSON.parse(JSON.stringify(x));}
  function esc(x){return saEsc(x==null?'':x);}
  function stamp(){return new Date().toISOString();}
  function initial(){return {v:1,active:names[0],completed:[],pausedAdded:{},updated_at:null,undo:null};}
  function valid(x){
    return x&&x.v===1&&(names.indexOf(x.active)>=0||x.active===DONE)&&Array.isArray(x.completed);
  }
  function get(){
    if(state) return state;
    try{state=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){}
    if(!valid(state)) state=initial();
    if(!state.pausedAdded) state.pausedAdded={};
    return state;
  }
  function write(){try{localStorage.setItem(KEY,JSON.stringify(get()));}catch(e){}}
  function title(n){return n===CLOSE?'Foundation only':n===DONE?'Plan completed':n;}
  function short(n){return String(n).split(' · ')[0];}
  function unique(rows){var seen={};return rows.filter(function(c){if(seen[c.n]) return false;seen[c.n]=1;return true;});}
  function protocolFor(n){
    if(n===DONE) return [];
    return unique(ALL.filter(function(c){
      if(cmpArch(c)) return false;
      if(baseNames[c.n] || cycIsBase(c)) return true;
      return n!==CLOSE&&cycNames(c).indexOf(n)>=0;
    }));
  }
  function next(){var i=names.indexOf(get().active);return i>=0&&i<names.length-1?names[i+1]:DONE;}
  var oldHas=cycHas;
  cycHas=function(c,n){return !!(c&&(c.sa||baseNames[c.n]))||oldHas(c,n);};
  cycCurrent=function(){return get().active;};
  /* An explicitly empty schedule must stay empty. The old fallback restored it. */
  schEff=function(){return schGet()||{};};
  var oldRows=schRows;
  schRows=function(){
    var active=get().active;
    return unique(oldRows.apply(this,arguments).filter(function(c){
      if(c.sa) return !get().pausedAdded[c.sa];
      return active!==DONE&&cycHas(c,active)&&!cmpArch(c);
    }));
  };
  function snapshot(){var s=copy(get());delete s.undo;return {state:s,on:copy(schGet()||{})};}
  function save(label){
    get().updated_at=stamp();write();schSave();refresh();
    if(label) csToast(label);
  }
  function start(n,finish){
    if(names.indexOf(n)<0&&n!==DONE) return;
    if(n===get().active) return;
    var before=snapshot(), old=get().active;
    if(finish&&old!==DONE&&!get().completed.some(function(x){return x.n===old;})) get().completed.push({n:old,at:stamp()});
    var current=protocolFor(old).map(function(c){return c.n;});
    /* Foundation and personally added compounds keep their existing settings.
       New-cycle compounds turn on, while paused continuing compounds stay paused. */
    protocolFor(n).forEach(function(c){if(!baseNames[c.n]&&current.indexOf(c.n)<0) schGet()[c.n]=1;});
    get().active=n;get().undo={before:before,label:finish?'Cycle change':'Plan change'};
    preview=null;picker=false;expanded={};edOpen={};
    save(title(n)+' is now your current plan');
    focusHeading();
  }
  function undo(){
    var u=get().undo;if(!u||!u.before) return;
    state=copy(u.before.state);state.undo=null;schState=copy(u.before.on);
    preview=null;save('Last schedule change undone');focusHeading();
  }
  function pauseProtocol(n){
    var before=snapshot(), on=!!schGet()[n];
    if(on) delete schGet()[n];else schGet()[n]=1;
    get().undo={before:before,label:on?'Compound paused':'Compound restored'};
    delete edOpen[n];save(on?'Paused. You can restore it in Manage my schedule.':'Restored to your schedule');
  }
  function pauseAdded(id){
    var before=snapshot(), on=!get().pausedAdded[id];
    if(on) get().pausedAdded[id]=true;else delete get().pausedAdded[id];
    get().undo={before:before,label:on?'Added compound paused':'Added compound restored'};
    save(on?'Removed from today. You can restore it in Manage my schedule.':'Restored to your schedule');
  }
  function focusHeading(){var e=document.getElementById('pp-heading');if(e) e.focus({preventScroll:true});}
  function dayHint(c){return [c.d,c.u,saDaysTxt(c.days||[]),schBlk(c)==='PM'?'Night':'Morning'].filter(Boolean).join(' · ');}
  function planMeta(n){
    var info=CYCABOUT[n];
    return n===CLOSE?'Weeks 49–52 · Your ongoing compounds continue.':n===DONE?'Your completed plan is kept below.':info?info.t:'Your current compounds and weekly schedule.';
  }
  function diffHTML(n){
    var from=protocolFor(get().active), to=protocolFor(n), st=schGet();
    var a=from.map(function(c){return c.n;}),b=to.map(function(c){return c.n;});
    var keep=to.filter(function(c){return a.indexOf(c.n)>=0&&st[c.n];});
    var stop=from.filter(function(c){return b.indexOf(c.n)<0&&st[c.n];});
    var add=to.filter(function(c){return a.indexOf(c.n)<0;});
    var paused=to.filter(function(c){return a.indexOf(c.n)>=0&&!st[c.n];});
    return [['Continue',keep],['Leave this schedule',stop],['Start',add],['Stay paused',paused]].filter(function(g){return g[1].length;}).map(function(g){
      return '<div class="pp-change"><b>'+g[0]+'</b>'+g[1].map(function(c){return esc(short(c.n));}).join(' · ')+'</div>';
    }).join('')+'<p class="pp-notice">Your personal additions, timing and dose edits stay saved. This changes your current schedule only. It does not change your invoice or inventory.</p>';
  }
  function editHTML(c,key,on){
    var body=on?edPanel(c).replace('class="ed-pan"','class="ed-pan open"').replace(/Remove from schedule/g,'Pause compound'):
      '<p class="pp-notice">Paused. Restore this compound to put it back on your schedule.</p><button type="button" data-pp="resume" data-name="'+esc(c.n)+'"'+(c.sa?' data-added="'+esc(c.sa)+'"':'')+'>Restore compound</button>';
    return '<details class="pp-edit" data-pp-expand="'+esc(key)+'"'+(expanded[key]?' open':'')+'><summary><span>'+esc(c.n)+'<span class="pp-meta" style="display:block">'+esc(dayHint(c))+'</span></span><span class="pp-active">'+(on?'Edit ›':'Paused')+'</span></summary>'+body+'</details>';
  }
  function managerHTML(){
    var live=schRows(), additions=saLive();
    var rows=protocolFor(get().active).map(function(c){return live.find(function(r){return !r.sa&&r.n===c.n;})||c;});
    var h='<div class="pp-panel"><h3>Manage my schedule</h3><p class="pp-notice">Tap a compound to edit its days, timing or dose. Pause it when you want a break; restore it here at any time.</p>';
    h+=rows.map(function(c){return editHTML(c,c.n,!!schGet()[c.n]);}).join('');
    if(additions.length){h+='<h3 style="margin-top:16px">Added by you</h3>';h+=additions.map(function(it){return editHTML(saRow(it),it.id,!get().pausedAdded[it.id]);}).join('');}
    if(!rows.length&&!additions.length) h+='<p class="pp-notice">Nothing is active. Choose a plan or add a compound below.</p>';
    h+='<button type="button" data-pp="add" class="pp-restore">+ Add compound</button></div>';
    return h;
  }
  function render(){
    var host=document.getElementById('pilot-plan');
    if(!host){var anchor=document.getElementById('daystrip');if(!anchor) return;host=document.createElement('div');host.id='pilot-plan';anchor.parentNode.insertBefore(host,anchor);}
    var s=get(), current=s.active, rows=schRows(), base=rows.filter(function(c){return baseNames[c.n];}), target=next();
    var h='<div class="pp-card"><div class="pp-top"><div class="pp-eyebrow">My current '+(cycles.length?'cycle':'plan')+'</div><h2 id="pp-heading" tabindex="-1">'+esc(title(current))+'</h2><p class="pp-meta">'+esc(planMeta(current))+'</p>';
    if(base.length)h+='<p class="pp-base"><strong>Year-round:</strong> '+base.map(function(c){return esc(short(c.n));}).join(' + ')+' continue between cycles.</p>';
    h+='<div class="pp-actions">';
    if(current!==DONE)h+='<button type="button" class="pp-primary" data-pp="next">'+(target===CLOSE?'Finish Cycle 6 & start foundation':target===DONE?'Finish '+(current===CLOSE?'year':'plan'):'Finish cycle & start next')+'</button>';
    h+='<button type="button" data-pp="change" aria-expanded="'+picker+'">Change '+(cycles.length?'cycle':'plan')+'</button><button type="button" data-pp="year" aria-expanded="'+year+'">View '+(cycles.length?'year plan':'plan history')+'</button></div></div>';
    if(picker){h+='<div class="pp-panel"><label class="pp-picker">Choose your next plan<select id="pp-cycle">'+names.map(function(n){return '<option value="'+esc(n)+'"'+(n===current?' selected':'')+'>'+esc(title(n))+'</option>';}).join('')+'</select></label><button type="button" data-pp="preview" style="margin-top:10px">Preview change</button></div>';}
    if(preview){h+='<div class="pp-panel" id="pp-preview" tabindex="-1"><h3>'+(preview.n===DONE?'Finish your plan':'Switch to '+esc(title(preview.n)))+'</h3>'+diffHTML(preview.n)+'<div class="pp-actions"><button type="button" class="pp-primary" data-pp="confirm">'+(preview.n===DONE?'Finish plan':'Start '+esc(title(preview.n)))+'</button><button type="button" data-pp="cancel">Keep '+esc(title(current))+'</button></div></div>';}
    if(year){h+='<div class="pp-panel"><h3>Your year plan</h3><p class="pp-notice">Cycles change only when you choose. Each planned cycle is eight weeks.</p><ul class="pp-list">';names.forEach(function(n){var completed=s.completed.some(function(c){return c.n===n;});h+='<li class="pp-planrow"><div><b>'+esc(title(n))+'</b><small>'+esc(planMeta(n))+'</small></div>'+(n===current?'<span class="pp-active">Current</span>':'<button type="button" data-pp="plan-preview" data-cycle="'+esc(n)+'">'+(completed?'Completed · revisit':'Preview')+'</button>')+'</li>';});h+='</ul><h3 style="margin-top:16px">Completed history</h3>'+(s.completed.length?s.completed.map(function(c){return '<p class="pp-history">'+esc(title(c.n))+' · completed '+esc(new Date(c.at).toLocaleDateString())+'</p>';}).join(''):'<p class="pp-history">Completed cycles will appear here.</p>')+'</div>';}
    h+='</div><div class="pp-tools"><button type="button" data-pp="manage" aria-expanded="'+manager+'">'+(manager?'Close schedule controls':'Manage my schedule')+'</button></div>';
    if(s.undo)h+='<div class="pp-undo" role="status"><span>'+esc(s.undo.label)+'.</span><button type="button" data-pp="undo">Undo</button></div>';
    if(manager)h+='<div class="pp-card">'+managerHTML()+'</div>';
    host.innerHTML=h;
    var sub=document.getElementById('subline');if(sub)sub.textContent=rows.length+' compound'+(rows.length===1?'':'s')+' in your current plan · Tap a row to edit';
    var note=document.getElementById('dosenote');if(note)note.textContent=note.textContent.replace('This is a read-only view of your schedule.','Tap a compound to edit or pause it.');
    document.querySelectorAll('#doses .drow.ed-row').forEach(function(r){r.tabIndex=0;r.setAttribute('role','button');r.setAttribute('aria-expanded',r.classList.contains('exp')?'true':'false');});
  }
  function refresh(){renderDoses();renderSubline();if(typeof renderAll==='function')renderAll();render();}
  var oldRead=csRead;
  csRead=function(k){var p=oldRead.apply(this,arguments);if(k==='schedule'&&p)p.planPilot=copy(get());return p;};
  var oldApply=csApply;
  csApply=function(k,p){
    if(k==='schedule'&&p&&valid(p.planPilot)){state=copy(p.planPilot);if(!state.pausedAdded)state.pausedAdded={};write();}
    oldApply.apply(this,arguments);
    if(k==='schedule')refresh();
  };
  var oldSub=renderSubline;renderSubline=function(){oldSub.apply(this,arguments);render();};
  var oldRender=renderDoses;renderDoses=function(){oldRender.apply(this,arguments);render();};
  /* The client can manage their own schedule on the normal link. */
  BLEDIT=true;document.documentElement.classList.add('bl-edit');
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-pp]');if(!t)return;
    var a=t.getAttribute('data-pp');e.preventDefault();
    if(a==='next')preview={n:next(),finish:true};
    else if(a==='change'){picker=!picker;preview=null;}
    else if(a==='preview'){var sel=document.getElementById('pp-cycle');if(sel&&sel.value!==get().active)preview={n:sel.value,finish:false};}
    else if(a==='plan-preview')preview={n:t.getAttribute('data-cycle'),finish:false};
    else if(a==='cancel')preview=null;
    else if(a==='confirm'){if(preview)start(preview.n,preview.finish);return;}
    else if(a==='manage')manager=!manager;
    else if(a==='year')year=!year;
    else if(a==='undo'){undo();return;}
    else if(a==='resume'){var id=t.getAttribute('data-added');if(id)pauseAdded(id);else pauseProtocol(t.getAttribute('data-name'));return;}
    else if(a==='add'){edAddMount();edAddOpen();var pan=document.getElementById('ed-addpan');if(pan){pan.scrollIntoView({block:'nearest'});var input=pan.querySelector('select,input');if(input)input.focus({preventScroll:true});}return;}
    render();if(preview){var box=document.getElementById('pp-preview');if(box){box.focus({preventScroll:true});box.scrollIntoView({block:'nearest'});}}
  });
  /* Capture pause/remove before legacy listeners: keep an easy restore path,
     and do not let removing the last item reactivate the entire default plan. */
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-edx="prm"],[data-edx="sarm"],.sa-rm');
    if(!b)return;e.preventDefault();e.stopImmediatePropagation();
    var id=b.getAttribute('data-sa');if(id)pauseAdded(id);else pauseProtocol(b.getAttribute('data-edn'));
  },true);
  document.addEventListener('toggle',function(e){var t=e.target;if(t&&t.hasAttribute&&t.hasAttribute('data-pp-expand'))expanded[t.getAttribute('data-pp-expand')]=t.open;},true);
  document.addEventListener('click',function(e){var r=e.target.closest&&e.target.closest('#doses .drow.ed-row');if(r)r.setAttribute('aria-expanded',r.classList.contains('exp')?'true':'false');});
  document.addEventListener('keydown',function(e){var r=e.target.closest&&e.target.closest('#doses .drow.ed-row');if(r&&(e.key==='Enter'||e.key===' ')){e.preventDefault();r.click();r.setAttribute('aria-expanded',r.classList.contains('exp')?'true':'false');}});
  refresh();
  /* A cloud request may have finished before this late-loaded pilot attached.
     Pull through the new bridge so cycle state restores across devices. */
  csPull();
})();
