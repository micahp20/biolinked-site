/* BioLinked shared biological-age module (Levine PhenoAge, Aging 2018).
   Usage: window.BioAge.renderCard(cfg) returns HTML for the Labs view.
   cfg = { age: <years at draw>, draw: 'Quest 11/02/2026',
           m: { albumin:{v,u,src}, creatinine, glucose, crp, lymph, mcv, rdw, alp, wbc } }
   Units expected: albumin g/dL, creatinine mg/dL, glucose mg/dL, CRP mg/L,
   lymphocytes %, MCV fL, RDW %, ALP U/L, WBC 10^3/uL. A value may carry
   bound:'<' when the lab printed "<x"; the bound is used and flagged.
   Missing markers or age render a "needs X" card instead of a number. */
(function () {
  var KEYS = ['albumin', 'creatinine', 'glucose', 'crp', 'lymph', 'mcv', 'rdw', 'alp', 'wbc'];
  var META = {
    albumin:    { n: 'Albumin', u: 'g/dL', ref: 4.5, why: 'Main blood protein made by the liver. Higher albumin is linked to better nutrition and lower risk, so it pulls the estimate younger.' },
    creatinine: { n: 'Creatinine', u: 'mg/dL', ref: 0.9, why: 'Muscle waste product the kidneys clear. Higher values push the estimate older; muscle mass and creatine use also raise it.' },
    glucose:    { n: 'Glucose (fasting)', u: 'mg/dL', ref: 85, why: 'Blood sugar at the draw. Higher fasting glucose pushes the estimate older.' },
    crp:        { n: 'CRP', miss: 'CRP (hs-CRP)', u: 'mg/L', ref: 0.5, why: 'Marker of inflammation. The formula uses its logarithm, so moving from 1 to 0.5 matters as much as 4 to 2. Lower is younger.' },
    lymph:      { n: 'Lymphocytes', miss: 'Lymphocyte %', u: '%', ref: 30, why: 'Share of white cells that are lymphocytes. A higher share pulls the estimate younger; it tends to fall with age and stress.' },
    mcv:        { n: 'MCV', u: 'fL', ref: 90, why: 'Average red-cell size. Larger cells push the estimate older; B12/folate status and alcohol can raise MCV.' },
    rdw:        { n: 'RDW', u: '%', ref: 12.5, why: 'How much red-cell size varies. It carries the largest weight in the formula; each 1% higher adds roughly 3–4 years to the estimate.' },
    alp:        { n: 'Alkaline phosphatase', u: 'U/L', ref: 70, why: 'Enzyme from liver and bone. Higher pushes the estimate older; a low value pulls it younger in the formula, even if the lab flags it low.' },
    wbc:        { n: 'White blood cells', u: 'K/uL', ref: 5.5, why: 'Total white cell count. Higher counts push the estimate older.' }
  };
  /* Levine 2018 PhenoAge. Inputs in conventional US units; converted here. */
  function phenoAge(x, age) {
    var xb = -19.907
      - 0.0336 * (x.albumin * 10)
      + 0.0095 * (x.creatinine * 88.4)
      + 0.1953 * (x.glucose / 18.016)
      + 0.0954 * Math.log(x.crp / 10)
      - 0.0120 * x.lymph
      + 0.0268 * x.mcv
      + 0.3306 * x.rdw
      + 0.00188 * x.alp
      + 0.0554 * x.wbc
      + 0.0804 * age;
    var M = 1 - Math.exp(-1.51714 * Math.exp(xb) / 0.0076927);
    return 141.50225 + Math.log(-0.00553 * Math.log(1 - M)) / 0.090165;
  }
  function missing(cfg) {
    var miss = [];
    KEYS.forEach(function (k) {
      var m = cfg && cfg.m && cfg.m[k];
      if (!m || typeof m.v !== 'number' || !(m.v > 0 || (k === 'lymph' && m.v >= 0))) miss.push(META[k].miss || META[k].n);
    });
    if (!(cfg && typeof cfg.age === 'number' && cfg.age > 0)) miss.push('age');
    return miss;
  }
  function compute(cfg) {
    var miss = missing(cfg);
    if (miss.length) return { ok: false, missing: miss, have: KEYS.filter(function (k) { return miss.indexOf(META[k].miss || META[k].n) < 0; }).map(function (k) { var m = cfg.m[k]; return (META[k].miss || META[k].n) + ' ' + bnd(m) + m.v + ' ' + (m.u || META[k].u); }) };
    var x = {};
    KEYS.forEach(function (k) { x[k] = cfg.m[k].v; });
    var pa = phenoAge(x, cfg.age);
    var contrib = KEYS.map(function (k) {
      var y = {}; KEYS.forEach(function (j) { y[j] = x[j]; });
      y[k] = META[k].ref;
      return { k: k, d: pa - phenoAge(y, cfg.age) };
    }).sort(function (a, b) { return Math.abs(b.d) - Math.abs(a.d); });
    return { ok: true, pheno: pa, diff: pa - cfg.age, contrib: contrib, x: x };
  }
  function bnd(m) { return m.bound === '<' ? '&lt;' : m.bound === '>' ? '&gt;' : ''; }
  function f1(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  function css() {
    if (document.getElementById('bage-css')) return '';
    return '<style id="bage-css">.bage .bdiff{font-size:15px;font-weight:700;color:var(--deep-ac,#d4af37);margin-top:6px}' +
      '.bage .bdiff.older{color:#f0a37a}.bage .n small{margin-left:4px}' +
      '.bage-list .lv.ok{color:var(--ok)}.bage-list .lv.hi{color:var(--warn)}' +
      '.bage-list .bbar{height:4px;border-radius:2px;background:var(--line2);margin-top:6px;position:relative;overflow:hidden}' +
      '.bage-list .bbar i{position:absolute;top:0;bottom:0;border-radius:2px}</style>';
  }
  function renderCard(cfg) {
    var r = compute(cfg), o = [css()];
    var foot = 'Estimated from 9 blood markers using the published PhenoAge formula (Levine 2018). Not a diagnosis.';
    if (!r.ok) {
      o.push('<div class="score bage"><div class="l">Biological age</div>' +
        '<div class="n" style="font-size:26px">' + (r.missing.length <= 2 ? 'Needs ' + r.missing.join(' and ') : 'Needs ' + r.missing.length + ' more') + '</div>' +
        '<div class="g">Missing: ' + r.missing.join(', ') + '</div>' +
        (r.have.length ? '<div class="c">On file: ' + r.have.join(', ') + '.</div>' : '') +
        '<div class="c">The estimate is not shown until every input is on a real lab report. Nothing is guessed. ' + foot + '</div></div>');
      return o.join('');
    }
    var younger = r.diff < 0, ad = Math.abs(r.diff);
    var flags = KEYS.filter(function (k) { return cfg.m[k].bound; }).map(function (k) {
      return META[k].n + ' was reported as ' + bnd(cfg.m[k]) + cfg.m[k].v + '; the bound was used';
    });
    o.push('<div class="score bage"><div class="l">Biological age</div>' +
      '<div class="n">' + f1(r.pheno) + '<small>years</small></div>' +
      '<div class="bdiff' + (younger ? '' : ' older') + '">' + f1(ad) + ' years ' + (younger ? 'younger' : 'older') +
      ' than real age ' + f1(cfg.age) + '</div>' +
      '<div class="c">' + (cfg.draw ? cfg.draw + '. ' : '') +
      (flags.length ? flags.join('. ') + '. ' : '') + foot + '</div></div>');
    var max = 0; r.contrib.forEach(function (c) { if (Math.abs(c.d) > max) max = Math.abs(c.d); });
    o.push('<div class="seclbl">What moves it<span class="cnt">years vs reference</span></div><div class="list bage-list">');
    r.contrib.forEach(function (c) {
      var mt = META[c.k], m = cfg.m[c.k], id = 'bage-' + c.k;
      var d = Math.round(c.d * 10) / 10, zero = d === 0;
      var cls = zero ? 'normal' : (d > 0 ? 'hi' : 'ok');
      var sign = zero ? '±0.0' : (d > 0 ? '+' : '−') + Math.abs(d).toFixed(1);
      var w = max ? Math.max(2, Math.abs(c.d) / max * 50) : 0;
      var bar = zero ? '' : '<div class="bbar"><i style="' + (d > 0 ? 'left:50%' : 'right:50%') + ';width:' + w.toFixed(1) +
        '%;background:var(--' + (d > 0 ? 'warn' : 'ok') + ')"></i></div>';
      var val = bnd(m) + m.v + ' ' + (m.u || mt.u);
      o.push('<div class="lrow" onclick="tt(\'' + id + '\')"><div class="lt"><span class="qm">?</span>' +
        '<span class="ln">' + mt.n + '</span><span class="lv ' + cls + '">' + sign + '<em> yrs</em></span></div>' +
        '<div class="lmeta"><span class="lref">' + val + ' · reference ' + mt.ref + ' ' + mt.u + '</span>' +
        '<span class="pill ' + cls + '">' + (zero ? 'Neutral' : d > 0 ? 'Adds' : 'Subtracts') + '</span></div>' + bar +
        '<div class="ltip" id="' + id + '"><strong>' + mt.n + '.</strong> ' + mt.why +
        ' Your ' + val + (m.src ? ' (' + m.src + ')' : '') + ' versus a reference of ' + mt.ref + ' ' + mt.u + ' ' +
        (zero ? 'makes no difference.' : (d > 0 ? 'adds ' : 'takes off ') + Math.abs(d).toFixed(1) + ' years.') +
        ' Computed by re-running the formula with only this marker set to the reference value. The reference is a typical healthy mid-range value, not a target or a treatment goal.</div></div>');
    });
    o.push('</div>');
    return o.join('');
  }
  /* Self-test against an independent Python computation of the same formula:
     age 50, albumin 4.2, creatinine 1.0, glucose 95, CRP 2.0 mg/L, lymph 28%,
     MCV 92, RDW 13.0, ALP 75, WBC 6.5 -> PhenoAge 46.489. */
  function selfTest() {
    var v = phenoAge({ albumin: 4.2, creatinine: 1.0, glucose: 95, crp: 2.0, lymph: 28, mcv: 92, rdw: 13.0, alp: 75, wbc: 6.5 }, 50);
    return Math.abs(v - 46.48908) < 0.001;
  }
  if (!selfTest()) throw new Error('BioAge self-test failed');
  window.BioAge = { phenoAge: phenoAge, compute: compute, renderCard: renderCard, selfTest: selfTest, META: META, KEYS: KEYS };
})();
