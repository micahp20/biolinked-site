/* ============================================================
   BioLinked · Data-driven Bloodwork Tab renderer
   ------------------------------------------------------------
   Turns a JSON bloodwork object into the BioLinked bloodwork tab
   (overall score + biological age + lab sections with flags + tooltips).

   USAGE (in any profile page):
     <div id="bw-mount"></div>
     <script type="application/json" id="bw-data"> { ...JSON... } </script>
     <script src="/tools/bloodwork.js"></script>
     <script>BLBloodwork.render('#bw-data', '#bw-mount');</script>

   render(dataOrSelector, mountSelector):
     - dataOrSelector: a JS object, OR a selector of a <script type="application/json"> block.
     - mountSelector: selector of the element to render into.

   SCHEMA (all string fields may contain simple inline HTML: <strong>, <br>, &mdash;):
   {
     "reportTitle": "Bloodwork Report",
     "meta": "Latest draw 05/06/2026 · 7 panels · summary line",
     "bioAge": { "value": 41, "chronological": 47, "note": "why it's younger/older" },   // optional
     "score": {
       "overall": 92,
       "grade": "A · Elite",
       "context": "Top 5–8% of men your age",
       "foot": "Composite score — weighted by outcome impact.",
       "categories": [ { "score": 98, "name": "Inflammation", "note": "tooltip text" } ]
     },
     "sections": [
       { "title": "Hormone Panel", "sub": "marker · marker · marker",
         "rows": [
           { "name":"Total Testosterone", "value":"1073", "unit":"ng/dL",
             "ref":"250–1100", "status":"Optimal", "flag":"ok",
             "info":"definition text", "trend":"01/25 328 → 05/26 1073" }
         ] }
     ]
   }
   flag: "ok" | "hi" | "lo" | "normal"   (drives value color + status pill color)
   ============================================================ */
(function (global) {
  'use strict';

  var STYLE_ID = 'bl-bloodwork-styles';
  var FLAGS = { ok: 'ok', hi: 'hi', lo: 'lo', normal: 'normal' };

  var CSS = [
    '.bw-wrap{--_gold:var(--gold,#7A6530);--_goldb:var(--gold-border,rgba(122,101,48,0.35));--_golddim:var(--gold-dim,rgba(122,101,48,0.10));--_text:var(--text,#000);--_muted:var(--muted,#4a4a44);font-family:\'Montserrat\',sans-serif;}',
    /* header */
    '.bw-wrap .lab-header{padding-bottom:14px;margin-bottom:18px;border-bottom:2px solid var(--_gold);}',
    '.bw-wrap .lab-header-title{font-family:\'Cormorant Garamond\',serif;font-size:24px;font-weight:600;color:var(--_text);line-height:1.1;}',
    '.bw-wrap .lab-header-meta{font-size:12px;color:var(--_muted);margin-top:5px;line-height:1.55;}',
    /* biological age */
    '.bw-wrap .lab-bioage{display:flex;align-items:center;gap:18px;flex-wrap:wrap;background:linear-gradient(135deg,#f6f8f4,#eef3ea);border:1px solid rgba(58,122,90,0.30);border-left:3px solid #3a7a5a;border-radius:3px;padding:16px 22px;margin-bottom:16px;}',
    '.bw-wrap .lab-bioage-num{font-family:\'Cormorant Garamond\',serif;font-size:52px;font-weight:700;color:#2f7a4a;line-height:0.95;}',
    '.bw-wrap .lab-bioage-num small{font-size:16px;color:var(--_muted);font-weight:500;}',
    '.bw-wrap .lab-bioage-body{flex:1;min-width:200px;}',
    '.bw-wrap .lab-bioage-eyebrow{font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#2f7a4a;margin-bottom:3px;}',
    '.bw-wrap .lab-bioage-delta{display:inline-block;font-size:11px;font-weight:700;letter-spacing:0.04em;padding:3px 10px;border-radius:99px;margin-bottom:6px;}',
    '.bw-wrap .lab-bioage-delta.younger{background:rgba(58,122,90,0.14);color:#2f7a4a;}',
    '.bw-wrap .lab-bioage-delta.older{background:rgba(194,85,85,0.14);color:#8a3c3c;}',
    '.bw-wrap .lab-bioage-note{font-size:12px;color:#254a36;line-height:1.55;}',
    /* overall score */
    '.bw-wrap .lab-score{background:linear-gradient(135deg,#fbf8ee,#f5efde);border:1px solid var(--_goldb);border-left:3px solid var(--_gold);border-radius:3px;padding:18px 22px;margin-bottom:22px;}',
    '.bw-wrap .lab-score-eyebrow{font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:var(--_gold);margin-bottom:12px;}',
    '.bw-wrap .lab-score-main{display:flex;align-items:flex-end;gap:18px;flex-wrap:wrap;margin-bottom:14px;padding-bottom:14px;border-bottom:1px dashed var(--_goldb);}',
    '.bw-wrap .lab-score-number{font-family:\'Cormorant Garamond\',serif;font-size:64px;font-weight:700;color:var(--_gold);line-height:0.95;}',
    '.bw-wrap .lab-score-denom{font-size:24px;color:var(--_muted);font-weight:500;margin-left:2px;}',
    '.bw-wrap .lab-score-meta{flex:1;min-width:200px;}',
    '.bw-wrap .lab-score-grade{font-family:\'Cormorant Garamond\',serif;font-size:22px;font-weight:600;color:var(--_text);line-height:1.1;margin-bottom:4px;letter-spacing:0.02em;}',
    '.bw-wrap .lab-score-context{font-size:12px;color:#3d2f10;line-height:1.55;}',
    '.bw-wrap .lab-score-breakdown{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px 18px;}',
    '.bw-wrap .lab-score-item{font-size:12px;color:var(--_text);display:flex;align-items:baseline;gap:8px;padding:4px 0;}',
    '.bw-wrap .lab-score-num{font-family:\'Cormorant Garamond\',serif;font-size:17px;font-weight:700;color:var(--_gold);min-width:28px;text-align:right;}',
    '.bw-wrap .lab-score-item .info-tip{margin-left:auto;}',
    '.bw-wrap .lab-score-foot{font-size:10.5px;color:var(--_muted);margin-top:10px;font-style:italic;}',
    /* sections + rows */
    '.bw-wrap .lab-section{margin-bottom:22px;}',
    '.bw-wrap .lab-section-head{padding:8px 0 4px;margin-bottom:2px;border-bottom:1px solid var(--_goldb);}',
    '.bw-wrap .lab-section-title{font-family:\'Cormorant Garamond\',serif;font-size:17px;font-weight:600;color:var(--_gold);letter-spacing:0.04em;text-transform:uppercase;}',
    '.bw-wrap .lab-section-sub{font-size:10px;font-weight:500;color:var(--_muted);margin-top:1px;letter-spacing:0.04em;}',
    '.bw-wrap .lab-row{position:relative;display:grid;grid-template-columns:1.7fr 1fr auto auto;gap:10px 14px;align-items:baseline;padding:7px 4px;border-bottom:1px dotted #ebe5cf;font-size:13px;}',
    '.bw-wrap .lab-row:last-child{border-bottom:none;}',
    '.bw-wrap .lab-name{font-weight:500;color:var(--_text);min-width:0;}',
    '.bw-wrap .lab-val{font-family:\'Cormorant Garamond\',serif;font-size:17px;font-weight:700;color:var(--_text);white-space:nowrap;text-align:right;}',
    '.bw-wrap .lab-val.hi{color:#c25555;}',
    '.bw-wrap .lab-val.lo{color:#4278a8;}',
    '.bw-wrap .lab-val.ok{color:#5a8a5a;}',
    '.bw-wrap .lab-val em{font-family:\'Montserrat\',sans-serif;font-style:normal;font-size:10px;color:var(--_muted);margin-left:4px;font-weight:400;letter-spacing:0.02em;}',
    '.bw-wrap .lab-ref{font-size:11px;color:var(--_muted);white-space:nowrap;letter-spacing:0.02em;text-align:right;}',
    '.bw-wrap .lab-status{font-size:8.5px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;padding:2px 8px;border-radius:99px;white-space:nowrap;text-align:center;min-width:62px;}',
    '.bw-wrap .lab-status.ok{background:rgba(90,138,90,0.12);color:#3a6b3a;}',
    '.bw-wrap .lab-status.hi{background:rgba(194,85,85,0.14);color:#8a3c3c;}',
    '.bw-wrap .lab-status.lo{background:rgba(66,120,168,0.14);color:#2a5780;}',
    '.bw-wrap .lab-status.normal{background:rgba(120,120,120,0.08);color:var(--_muted);}',
    /* info tip */
    '.bw-wrap .info-tip{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;background:var(--_golddim);border:1px solid var(--_goldb);color:var(--_gold);font-size:9px;font-weight:700;cursor:help;position:relative;margin-left:6px;letter-spacing:0;line-height:1;outline:none;flex-shrink:0;vertical-align:middle;}',
    '.bw-wrap .info-tip:hover,.bw-wrap .info-tip:focus,.bw-wrap .info-tip.is-open{background:var(--_gold);color:#fff;}',
    '.bw-wrap .info-tip-text{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:10px 13px;border-radius:4px;font-size:11.5px;font-weight:400;line-height:1.55;letter-spacing:0.01em;text-transform:none;width:260px;text-align:left;opacity:0;pointer-events:none;transition:opacity 0.18s;z-index:200;box-shadow:0 4px 18px rgba(0,0,0,0.25);}',
    '.bw-wrap .lab-row .info-tip-text{width:240px;}',
    '.bw-wrap .info-tip-text strong{color:#e9c66c;font-weight:600;}',
    '.bw-wrap .info-tip-text::after{content:\'\';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#1a1a1a;}',
    '.bw-wrap .info-tip:hover .info-tip-text,.bw-wrap .info-tip:focus .info-tip-text,.bw-wrap .info-tip.is-open .info-tip-text{opacity:1;pointer-events:auto;}',
    /* mobile */
    '@media(max-width:640px){',
    '.bw-wrap .lab-header-title{font-size:20px;}',
    '.bw-wrap .lab-score{padding:14px 16px;}.bw-wrap .lab-score-number{font-size:48px;}.bw-wrap .lab-score-denom{font-size:18px;}',
    '.bw-wrap .lab-score-grade{font-size:18px;}.bw-wrap .lab-score-breakdown{grid-template-columns:repeat(2,1fr);gap:3px 12px;}',
    '.bw-wrap .lab-bioage-num{font-size:42px;}',
    '.bw-wrap .lab-section-title{font-size:14px;}',
    '.bw-wrap .lab-row{grid-template-columns:1fr auto;grid-template-areas:\'name val\' \'ref status\';gap:2px 10px;padding:9px 4px;}',
    '.bw-wrap .lab-name{grid-area:name;font-size:13px;}.bw-wrap .lab-val{grid-area:val;font-size:15px;}',
    '.bw-wrap .lab-ref{grid-area:ref;font-size:10.5px;text-align:left;}.bw-wrap .lab-status{grid-area:status;justify-self:end;}',
    '.bw-wrap .info-tip-text{position:fixed;left:12px;right:12px;bottom:auto;width:auto;max-width:none;transform:none;}',
    '.bw-wrap .info-tip-text::after{display:none;}',
    '}'
  ].join('\n');

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function esc(s) { return String(s == null ? '' : s); }

  // info tip: '?' bubble with rich HTML text
  function tip(html) {
    if (!html) return '';
    return '<span class="info-tip" tabindex="0">?<span class="info-tip-text">' + html + '</span></span>';
  }

  function flagClass(f) { return FLAGS[f] || 'normal'; }

  function renderBioAge(b) {
    if (!b || b.value == null) return '';
    var delta = (b.chronological != null) ? (b.chronological - b.value) : null;
    var deltaHtml = '';
    if (delta != null && !isNaN(delta)) {
      if (delta > 0) deltaHtml = '<span class="lab-bioage-delta younger">' + delta + ' yr' + (delta === 1 ? '' : 's') + ' younger than calendar age</span>';
      else if (delta < 0) deltaHtml = '<span class="lab-bioage-delta older">' + Math.abs(delta) + ' yr' + (delta === -1 ? '' : 's') + ' older than calendar age</span>';
      else deltaHtml = '<span class="lab-bioage-delta younger">matches your calendar age</span>';
    }
    return '<div class="lab-bioage">' +
      '<div class="lab-bioage-num">' + esc(b.value) + '<small> yrs</small></div>' +
      '<div class="lab-bioage-body">' +
        '<div class="lab-bioage-eyebrow">Biological Age' + (b.chronological != null ? ' &middot; Chronological ' + esc(b.chronological) : '') + '</div>' +
        deltaHtml +
        (b.note ? '<div class="lab-bioage-note">' + b.note + '</div>' : '') +
      '</div></div>';
  }

  function renderScore(sc) {
    if (!sc) return '';
    var cats = (sc.categories || []).map(function (c) {
      return '<div class="lab-score-item"><span class="lab-score-num">' + esc(c.score) + '</span> ' + esc(c.name) + tip(c.note) + '</div>';
    }).join('');
    return '<div class="lab-score">' +
      '<div class="lab-score-eyebrow">Overall Health Score</div>' +
      '<div class="lab-score-main">' +
        '<div class="lab-score-number">' + esc(sc.overall) + '<span class="lab-score-denom">/100</span></div>' +
        '<div class="lab-score-meta">' +
          (sc.grade ? '<div class="lab-score-grade">' + sc.grade + '</div>' : '') +
          (sc.context ? '<div class="lab-score-context">' + sc.context + '</div>' : '') +
        '</div>' +
      '</div>' +
      (cats ? '<div class="lab-score-breakdown">' + cats + '</div>' : '') +
      (sc.foot ? '<div class="lab-score-foot">' + sc.foot + '</div>' : '') +
    '</div>';
  }

  function renderRow(r) {
    var fc = flagClass(r.flag);
    var name = '<span class="lab-name">' + esc(r.name) +
      tip(rowTip(r)) + '</span>';
    var val = '<span class="lab-val ' + fc + '">' + esc(r.value) + (r.unit ? '<em>' + esc(r.unit) + '</em>' : '') + '</span>';
    var ref = '<span class="lab-ref">' + (r.ref ? 'ref ' + esc(r.ref) : '') + '</span>';
    var status = '<span class="lab-status ' + fc + '">' + esc(r.status || '') + '</span>';
    return '<div class="lab-row">' + name + val + ref + status + '</div>';
  }

  // build the tooltip HTML from info + trend
  function rowTip(r) {
    if (!r.info && !r.trend) return '';
    var html = '';
    if (r.info) html += '<strong>' + esc(r.name) + '.</strong> ' + r.info;
    if (r.trend) html += (html ? '<br><br>' : '') + '<strong>Trend:</strong> ' + r.trend;
    return html;
  }

  function renderSection(s) {
    var rows = (s.rows || []).map(renderRow).join('');
    return '<div class="lab-section">' +
      '<div class="lab-section-head">' +
        '<div class="lab-section-title">' + esc(s.title) + '</div>' +
        (s.sub ? '<div class="lab-section-sub">' + s.sub + '</div>' : '') +
      '</div>' + rows + '</div>';
  }

  // mobile tap-to-toggle for info tips
  function wireTips(root) {
    root.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('.info-tip') : null;
      if (!t) {
        root.querySelectorAll('.info-tip.is-open').forEach(function (o) { o.classList.remove('is-open'); });
        return;
      }
      e.preventDefault();
      var wasOpen = t.classList.contains('is-open');
      root.querySelectorAll('.info-tip.is-open').forEach(function (o) { o.classList.remove('is-open'); });
      if (!wasOpen) t.classList.add('is-open');
    });
  }

  function resolveData(d) {
    if (d && typeof d === 'object') return d;
    var el = document.querySelector(d);
    if (!el) throw new Error('BLBloodwork: data element not found: ' + d);
    return JSON.parse(el.textContent);
  }

  function render(dataOrSelector, mountSelector) {
    injectCSS();
    var data = resolveData(dataOrSelector);
    var mount = document.querySelector(mountSelector);
    if (!mount) throw new Error('BLBloodwork: mount not found: ' + mountSelector);

    var html = '<div class="bw-wrap">';
    html += '<div class="lab-header">' +
      '<div class="lab-header-title">' + esc(data.reportTitle || 'Bloodwork Report') + '</div>' +
      (data.meta ? '<div class="lab-header-meta">' + data.meta + '</div>' : '') +
    '</div>';
    html += renderBioAge(data.bioAge);
    html += renderScore(data.score);
    (data.sections || []).forEach(function (s) { html += renderSection(s); });
    html += '</div>';

    mount.innerHTML = html;
    wireTips(mount);
    return data;
  }

  global.BLBloodwork = { render: render, version: '1.0' };
})(window);
