/* Presentation only: existing renderers, sort handlers and data writes stay authoritative. */
(function(){
 'use strict';
 function decorate(table){
  if(table.id==='table-profit-flow') return;
  table.classList.add('pl-cards');
  var headers=Array.from(table.querySelectorAll('thead th'));
  table.querySelectorAll('tbody tr').forEach(function(row){
   Array.from(row.children).forEach(function(cell,i){
    var label=headers[i]?headers[i].textContent.replace(/[▲▼]/g,'').trim():'';
    if(cell.getAttribute('data-label')!==label) cell.setAttribute('data-label',label);
    cell.classList.toggle('pl-actions',!label&&!!cell.querySelector('button'));
   });
  });
  var sortable=headers.filter(function(h){return h.dataset.sort;});
  if(!sortable.length) return;
  var id=table.id+'-sort', select=document.getElementById(id);
  if(!select){
   var label=document.createElement('label');label.className='pl-mobile-sort';label.htmlFor=id;label.appendChild(document.createTextNode('Sort by'));
   select=document.createElement('select');select.id=id;label.appendChild(select);
   table.closest('.table-wrap').insertAdjacentElement('beforebegin',label);
   select.addEventListener('change',function(){
    var parts=select.value.split(':');var h=table.querySelector('th[data-sort="'+parts[0]+'"]');if(!h)return;
    h.click();
    var current=table.querySelector('th[data-sort="'+parts[0]+'"]');
    if(current&&!current.textContent.includes(parts[1]==='asc'?'▲':'▼')) current.click();
   });
  }
  var options=[];sortable.forEach(function(h){var n=h.textContent.replace(/[▲▼]/g,'').trim();['asc','desc'].forEach(function(dir){options.push({value:h.dataset.sort+':'+dir,text:n+(dir==='asc'?' ↑':' ↓')});});});
  var signature=JSON.stringify(options);
  if(select.dataset.options!==signature){select.replaceChildren();options.forEach(function(o){var option=document.createElement('option');option.value=o.value;option.textContent=o.text;select.appendChild(option);});select.dataset.options=signature;}
  var active=sortable.find(function(h){return /[▲▼]/.test(h.textContent);});if(active)select.value=active.dataset.sort+':'+(active.textContent.includes('▲')?'asc':'desc');
 }
 function start(){
  document.querySelectorAll('table.data').forEach(function(table){decorate(table);new MutationObserver(function(){decorate(table);}).observe(table,{childList:true,subtree:true});});
  document.querySelectorAll('.tabs-inner .tab').forEach(function(tab){tab.setAttribute('aria-pressed',tab.classList.contains('active'));tab.addEventListener('click',function(){document.querySelectorAll('.tabs-inner .tab').forEach(function(t){t.setAttribute('aria-pressed',t.classList.contains('active'));});window.scrollTo({top:0,behavior:'instant'});});});
  document.querySelectorAll('.chip').forEach(function(chip){chip.setAttribute('role','button');chip.tabIndex=0;chip.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();chip.click();}});});
  var modal=document.getElementById('modal');if(!modal)return;
  modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','modal-title');
  var previous=null;
  new MutationObserver(function(){if(modal.classList.contains('show')){previous=document.activeElement;var first=modal.querySelector('button,input,select,textarea');if(first)first.focus();}else if(previous&&previous.isConnected){previous.focus();}}).observe(modal,{attributes:true,attributeFilter:['class']});
  document.addEventListener('keydown',function(e){if(!modal.classList.contains('show'))return;if(e.key==='Escape'){closeModal();return;}if(e.key!=='Tab')return;var items=Array.from(modal.querySelectorAll('button,input,select,textarea,a[href]')).filter(function(el){return !el.disabled&&el.getClientRects().length;});if(!items.length)return;var first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
