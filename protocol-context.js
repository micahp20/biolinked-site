/* Completes plain-language explanations on current and legacy protocol layouts.
   Does not edit ALL/CMP, schedules, invoices, dose fields or inventory. */
(function(){
 'use strict';
 var copy=window.BLProtocolCopy;if(!copy||window.__blProtocolContext)return;
 window.__blProtocolContext=true;
 function text(node){return node?node.textContent.replace(/\s+/g,' ').trim():'';}
 function rationale(rows,label){var why=copy.rationale(rows);if(!why)return null;var d=document.createElement('details');d.className='jc-notes bl-plan-rationale';var summary=document.createElement('summary');summary.textContent=label||'About this plan';d.appendChild(summary);[['Why these together',why.s],['How the roles complement each other',why.w]].forEach(function(x){var h=document.createElement('h3');h.textContent=x[0];var p=document.createElement('p');p.textContent=x[1];d.appendChild(h);d.appendChild(p);});return d;}
 function addOverview(){
  var host=document.getElementById('protoabout');
  if(host&&typeof ALL!=='undefined'&&ALL.length&&!host.querySelector('.jc-notes,.bl-plan-rationale,.abt-l')){
   var rows=ALL.filter(function(c){return !c.hist&&!/^\s*(past|prior|archived|completed)\b/i.test(c.tag||'');});
   var d=rationale(rows);if(d)host.appendChild(d);
  }
 }
 if(typeof renderAbout==='function'){var original=renderAbout;renderAbout=function(){var result=original.apply(this,arguments);addOverview();return result;};}
 function legacy(){
  document.querySelectorAll('.cmp-row').forEach(function(row){if(row.getAttribute('data-bl-defined'))return;var head=row.querySelector('.cmp-summary-label,.cmp-row-name');var name=text(head),def=copy.find(name);if(!def)return;var body=row.querySelector('.cmp-about-body');if(body){if(!body.querySelector('.bl-compound-definition'))body.innerHTML=copy.description(name,body.innerHTML);}else{var box=document.createElement('div');box.className='bl-legacy-definition';box.innerHTML=copy.description(name,'');var fields=row.querySelector('.cmp-fields');if(fields)row.insertBefore(box,fields);else row.appendChild(box);}row.setAttribute('data-bl-defined','1');});
  document.querySelectorAll('details.li-row').forEach(function(row){if(row.getAttribute('data-bl-defined'))return;var summary=row.querySelector('summary'),head=row.querySelector('.li-summary-name');if(!summary||!head)return;var name=text(head);if(!copy.find(name))return;var box=document.createElement('div');box.className='bl-legacy-definition';box.innerHTML=copy.description(name,'');summary.insertAdjacentElement('afterend',box);row.setAttribute('data-bl-defined','1');});
  document.querySelectorAll('.peptide-card').forEach(function(card){if(card.getAttribute('data-bl-defined'))return;var name=text(card.querySelector('.peptide-name')).replace(/^\d+\s*[·.]\s*/,'');if(!copy.find(name))return;var body=card.querySelector('.peptide-body');if(!body)return;var old=body.querySelector('.peptide-text');if(old){old.innerHTML=copy.description(name,old.innerHTML);var label=old.parentNode.querySelector('.peptide-section-label');if(label)label.textContent='What it is and its role';}else{var box=document.createElement('div');box.className='bl-legacy-definition';box.innerHTML=copy.description(name,'');body.insertBefore(box,body.firstChild);}card.setAttribute('data-bl-defined','1');});
  document.querySelectorAll('.peptide-grid,.cmp-list').forEach(function(grid){if(grid.getAttribute('data-bl-rationale'))return;var heads=grid.querySelectorAll('.peptide-name,.cmp-summary-label,.cmp-row-name'),rows=[];heads.forEach(function(h){var name=text(h).replace(/^\d+\s*[·.]\s*/,'');if(copy.find(name))rows.push({n:name});});if(!rows.length)return;var d=rationale(rows,'About these compounds');if(d)grid.insertAdjacentElement('afterend',d);grid.setAttribute('data-bl-rationale','1');});
 }
 addOverview();legacy();
})();
