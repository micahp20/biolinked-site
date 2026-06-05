/*
 * BioLinked — Peptide Draw Calculator widget.
 *
 * Usage (after /peptide-data.js is loaded, if you want the preset dropdown):
 *   <div id="peptide-calc-mount"></div>
 *   <script src="/peptide-data.js"></script>
 *   <script src="/peptide-calc.js"></script>
 *   <script>window.mountPeptideCalc('peptide-calc-mount');</script>
 *
 * What it does:
 *   - Optional preset picker: pulls window.PEPTIDE_DATA (in_stock entries) and
 *     prefills vial / BAC / dose when a compound is selected.
 *   - Manual entry always allowed — type in any vial mg, BAC mL, and dose to
 *     get concentration, mL per dose, units on a U-100 syringe, and doses
 *     per vial.
 *   - Unit toggles: vial mg | mcg, dose mg | mcg. BAC is mL only.
 *   - Live recalculation on every input change. No save / no cookie / no API.
 *
 * Limits:
 *   - IU-based compounds (HGH, HCG) aren't directly convertible to mg —
 *     the calc shows "—" if the parsed vial unit isn't mg or mcg. For HGH
 *     use the dosing in the compound dropdown directly.
 *   - Blend compounds with "10mg+5mg" style vial strings prefill using the
 *     FIRST number — usually fine for the dominant component, but verify
 *     against the compound's dropdown for the exact split.
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // Inline CSS — uses the host page's --gold / --border / --text
  // CSS vars if present, with safe fallbacks.
  // ─────────────────────────────────────────────────────────
  var STYLE_ID = 'peptide-calc-styles';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = ''
      + '.bl-pc{background:#ffffff;border:1px solid var(--border,#e0dccd);border-top:2px solid var(--gold,#7A6530);border-radius:2px;padding:20px 22px;font-family:\'Montserrat\',sans-serif;color:var(--text,#1a1a1a);}'
      + '.bl-pc-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border,#e0dccd);}'
      + '.bl-pc-title{font-family:\'Cormorant Garamond\',serif;font-size:19px;font-weight:600;color:var(--text,#1a1a1a);}'
      + '.bl-pc-sub{font-size:11px;color:var(--muted,#6b6b65);letter-spacing:0.06em;font-style:italic;}'
      + '.bl-pc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px;}'
      + '.bl-pc-field{display:flex;flex-direction:column;gap:4px;}'
      + '.bl-pc-field label{font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:var(--gold,#7A6530);}'
      + '.bl-pc-input-row{display:flex;gap:6px;align-items:stretch;}'
      + '.bl-pc-input-row input,.bl-pc-input-row select,.bl-pc-field > select{flex:1;min-width:0;font-family:inherit;font-size:14px;color:var(--text,#1a1a1a);background:#fafafa;border:1px solid var(--border,#e0dccd);border-radius:2px;padding:8px 10px;}'
      + '.bl-pc-input-row select{flex:0 0 auto;width:auto;background:#fff;}'
      + '.bl-pc-input-row input:focus,.bl-pc-input-row select:focus,.bl-pc-field > select:focus{outline:none;border-color:var(--gold,#7A6530);background:#fff;}'
      + '.bl-pc-results{background:linear-gradient(135deg,#f8f5ee,#f2ede0);border:1px solid var(--gold-border,rgba(122,101,48,0.35));border-left:3px solid var(--gold,#7A6530);border-radius:2px;padding:14px 18px;}'
      + '.bl-pc-results-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:14px;}'
      + '.bl-pc-result{display:flex;flex-direction:column;gap:2px;}'
      + '.bl-pc-result-label{font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--gold,#7A6530);}'
      + '.bl-pc-result-val{font-family:\'Cormorant Garamond\',serif;font-size:22px;font-weight:700;color:var(--text,#1a1a1a);line-height:1.1;}'
      + '.bl-pc-result-val.hi{color:var(--gold,#7A6530);font-size:26px;}'
      + '.bl-pc-result-val.dim{color:var(--muted,#6b6b65);font-size:18px;font-weight:400;}'
      + '.bl-pc-foot{margin-top:12px;font-size:11px;color:var(--muted,#6b6b65);line-height:1.55;}'
      + '.bl-pc-foot strong{color:var(--gold,#7A6530);}'
      + '@media(max-width:520px){.bl-pc-results-row{grid-template-columns:repeat(2,1fr);}.bl-pc-result-val{font-size:18px;}.bl-pc-result-val.hi{font-size:22px;}}';
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────────────────
  // Number + unit parser. Handles "10 mg", "10mg", "500mcg",
  // "2 mL", "5,000 IU", "10mg+5mg" (takes first number),
  // "1.67 mg", etc.
  // Returns { value: Number, unit: 'mg'|'mcg'|'ml'|'iu'|null }.
  // ─────────────────────────────────────────────────────────
  function parseAmount(raw, fallbackUnit) {
    if (raw == null) return { value: NaN, unit: fallbackUnit || null };
    var s = String(raw).replace(/,/g, '').trim();
    var m = s.match(/([\d.]+)\s*(mg|mcg|ml|iu)?/i);
    if (!m) return { value: NaN, unit: fallbackUnit || null };
    var unit = (m[2] || fallbackUnit || '').toLowerCase() || null;
    return { value: parseFloat(m[1]), unit: unit };
  }

  function toMg(value, unit) {
    if (unit === 'mg') return value;
    if (unit === 'mcg') return value / 1000;
    return NaN;
  }

  function fmt(n, digits) {
    if (!isFinite(n)) return '—';
    return Number(n.toFixed(digits)).toString();
  }

  // ─────────────────────────────────────────────────────────
  // Mount the calculator into a container element.
  // ─────────────────────────────────────────────────────────
  function mountPeptideCalc(targetId, opts) {
    injectStyles();
    var host = (typeof targetId === 'string') ? document.getElementById(targetId) : targetId;
    if (!host) return;
    opts = opts || {};

    // Source of truth: prefer the full cheat-sheet master list (130+ peptides)
    // when /cheat-sheet-data.js is loaded; fall back to the in-stock product
    // line from /peptide-data.js if only that is available.
    var presets;
    if (window.CHEAT_SHEET_DATA && window.CHEAT_SHEET_DATA.length) {
      presets = window.CHEAT_SHEET_DATA
        .slice()
        .filter(function (p) { return p && p.name; })
        .sort(function (a, b) {
          var ca = (a.cat || '').localeCompare(b.cat || '');
          return ca !== 0 ? ca : a.name.localeCompare(b.name);
        });
    } else {
      presets = (window.PEPTIDE_DATA || [])
        .filter(function (p) { return p.in_stock && p.name !== 'Custom'; })
        .sort(function (a, b) { return a.name.localeCompare(b.name); });
    }

    var presetOptions = ['<option value="">— Manual entry —</option>']
      .concat(presets.map(function (p, i) {
        return '<option value="' + i + '">' + p.name + '</option>';
      }))
      .join('');

    host.innerHTML = ''
      + '<div class="bl-pc">'
      +   '<div class="bl-pc-head">'
      +     '<div>'
      +       '<div class="bl-pc-title">Peptide Draw Calculator</div>'
      +       '<div class="bl-pc-sub">Verify your units before you draw.</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="bl-pc-grid">'
      +     '<div class="bl-pc-field">'
      +       '<label>Compound (optional)</label>'
      +       '<select id="bl-pc-preset">' + presetOptions + '</select>'
      +     '</div>'
      +     '<div class="bl-pc-field">'
      +       '<label>Vial Size</label>'
      +       '<div class="bl-pc-input-row">'
      +         '<input type="number" id="bl-pc-vial" inputmode="decimal" min="0" step="any" value="10">'
      +         '<select id="bl-pc-vial-u"><option value="mg">mg</option><option value="mcg">mcg</option></select>'
      +       '</div>'
      +     '</div>'
      +     '<div class="bl-pc-field">'
      +       '<label>BAC Water</label>'
      +       '<div class="bl-pc-input-row">'
      +         '<input type="number" id="bl-pc-bac" inputmode="decimal" min="0" step="any" value="2">'
      +         '<select disabled><option>mL</option></select>'
      +       '</div>'
      +     '</div>'
      +     '<div class="bl-pc-field">'
      +       '<label>Desired Dose</label>'
      +       '<div class="bl-pc-input-row">'
      +         '<input type="number" id="bl-pc-dose" inputmode="decimal" min="0" step="any" value="500">'
      +         '<select id="bl-pc-dose-u"><option value="mcg">mcg</option><option value="mg">mg</option></select>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="bl-pc-results">'
      +     '<div class="bl-pc-results-row">'
      +       '<div class="bl-pc-result"><div class="bl-pc-result-label">Concentration</div><div class="bl-pc-result-val" id="bl-pc-conc">—</div></div>'
      +       '<div class="bl-pc-result"><div class="bl-pc-result-label">Volume / Dose</div><div class="bl-pc-result-val" id="bl-pc-ml">—</div></div>'
      +       '<div class="bl-pc-result"><div class="bl-pc-result-label">Syringe Units (U-100)</div><div class="bl-pc-result-val hi" id="bl-pc-units">—</div></div>'
      +       '<div class="bl-pc-result"><div class="bl-pc-result-label">Doses / Vial</div><div class="bl-pc-result-val dim" id="bl-pc-doses">—</div></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="bl-pc-foot">'
      +     '<strong>How to read it:</strong> Pull the syringe plunger to the <strong>Units</strong> line on a standard U-100 insulin syringe. That delivers the Volume/Dose listed.'
      +     ' <strong>Heads up:</strong> IU compounds (HGH, HCG) don\'t convert cleanly to mg here — use the dosing math in that compound\'s dropdown instead.'
      +   '</div>'
      + '</div>';

    // Wire up inputs
    var presetSel = host.querySelector('#bl-pc-preset');
    var vialIn    = host.querySelector('#bl-pc-vial');
    var vialU     = host.querySelector('#bl-pc-vial-u');
    var bacIn     = host.querySelector('#bl-pc-bac');
    var doseIn    = host.querySelector('#bl-pc-dose');
    var doseU     = host.querySelector('#bl-pc-dose-u');
    var outConc   = host.querySelector('#bl-pc-conc');
    var outMl     = host.querySelector('#bl-pc-ml');
    var outUnits  = host.querySelector('#bl-pc-units');
    var outDoses  = host.querySelector('#bl-pc-doses');

    function applyPreset() {
      var idx = parseInt(presetSel.value, 10);
      if (isNaN(idx)) return;
      var p = presets[idx];
      if (!p) return;
      var v = parseAmount(p.vial, 'mg');
      var b = parseAmount(p.bac, 'ml');
      var d = parseAmount(p.dose, 'mcg');
      if (isFinite(v.value) && (v.unit === 'mg' || v.unit === 'mcg')) {
        vialIn.value = v.value;
        vialU.value = v.unit;
      }
      if (isFinite(b.value)) {
        bacIn.value = b.value;
      }
      if (isFinite(d.value) && (d.unit === 'mg' || d.unit === 'mcg')) {
        doseIn.value = d.value;
        doseU.value = d.unit;
      }
      recalc();
    }

    function recalc() {
      var vialMg = toMg(parseFloat(vialIn.value), vialU.value);
      var bacMl  = parseFloat(bacIn.value);
      var doseMg = toMg(parseFloat(doseIn.value), doseU.value);
      var concMgMl = (isFinite(vialMg) && isFinite(bacMl) && bacMl > 0) ? (vialMg / bacMl) : NaN;
      var mlPerDose = (isFinite(doseMg) && isFinite(concMgMl) && concMgMl > 0) ? (doseMg / concMgMl) : NaN;
      var unitsU100 = isFinite(mlPerDose) ? (mlPerDose * 100) : NaN;
      var dosesPerVial = (isFinite(vialMg) && isFinite(doseMg) && doseMg > 0) ? (vialMg / doseMg) : NaN;

      outConc.textContent  = isFinite(concMgMl)   ? fmt(concMgMl, 2) + ' mg/mL'        : '—';
      outMl.textContent    = isFinite(mlPerDose)  ? fmt(mlPerDose, 2) + ' mL'          : '—';
      outUnits.textContent = isFinite(unitsU100)  ? fmt(unitsU100, 1) + ' u'           : '—';
      outDoses.textContent = isFinite(dosesPerVial) ? Math.floor(dosesPerVial) + ' doses' : '—';
    }

    presetSel.addEventListener('change', applyPreset);
    [vialIn, vialU, bacIn, doseIn, doseU].forEach(function (el) {
      el.addEventListener('input', recalc);
      el.addEventListener('change', recalc);
    });

    // Initial defaults: 10mg vial / 2mL BAC / 500mcg dose -> 50 units / 0.50 mL
    // Wait — at 10mg / 2mL = 5 mg/mL, 500mcg = 0.5mg, 0.5/5 = 0.10 mL = 10 units.
    // Set defaults that produce sensible numbers on load.
    recalc();

    // Optional: prefill with a specific compound by name
    if (opts.preset) {
      var idx = presets.findIndex(function (p) { return p.name === opts.preset; });
      if (idx >= 0) { presetSel.value = String(idx); applyPreset(); }
    }
  }

  window.mountPeptideCalc = mountPeptideCalc;
})();
