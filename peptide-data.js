/*
 * BioLinked — single source of truth for peptide product line + cheat-sheet dosing.
 *
 *   - Loaded by /protocol.html (filters in_stock:true to build the compound dropdown
 *     and PRESETS lookup; auto-fills vial/dose/BAC/units/schedule/timing on selection).
 *   - Add/remove/edit a peptide here and it shows up correctly in the protocol builder.
 *   - Future: /cheat-sheet.html and /peptide-index.html will also read from this file
 *     once we refactor them.
 *
 * Fields:
 *   name      — display name in the dropdown
 *   cat       — category key (fatloss / healing / muscle / gh / cognition / energy / etc.)
 *   vial      — vial size (e.g. "10mg", "30mg", "5000 IU")
 *   bac       — bacteriostatic water for reconstitution (e.g. "2mL")
 *   dose      — per-dose amount (e.g. "1mg", "250mcg")
 *   units     — syringe draw on a U-100 insulin syringe (e.g. "10", "20")
 *   schedule  — dosing frequency (e.g. "Mon/Wed/Fri", "5 days on / 2 off", "Daily")
 *   timing    — when in the day (e.g. "AM", "PM", "AM fasted")
 *   price     — $/vial Friends-and-Family default (used by protocol pricing calc)
 *   in_stock  — true to show in the protocol.html dropdown; false to hide (data preserved)
 *
 * Dosing/BAC/units/schedule/timing values are pulled from cheat-sheet.html so the
 * builder auto-fills with the same numbers the cheat sheet shows.
 * Prices are the current Friends-and-Family rates from the prior PRESETS object
 * in protocol.html — adjust as your invoice prices shift.
 *
 * NB: keep this file in browser-friendly plain JS (no ES modules). Loaded via
 *     <script src="/peptide-data.js"></script> before the page's inline scripts.
 */

window.PEPTIDE_DATA = [

  // ───── FAT LOSS / GLP-1 family ─────
  { name:'Tirzepatide (10mg)',         cat:'fatloss', vial:'10mg', bac:'2mL', dose:'0.5mg', units:'10', schedule:'3x per week',       timing:'AM',                 price:60,  in_stock:true },
  { name:'Tirzepatide (15mg)',         cat:'fatloss', vial:'15mg', bac:'2mL', dose:'0.5mg', units:'7',  schedule:'3x per week',       timing:'AM',                 price:80,  in_stock:true },
  { name:'Tirzepatide (20mg)',         cat:'fatloss', vial:'20mg', bac:'2mL', dose:'1mg',   units:'10', schedule:'2x per week',       timing:'AM',                 price:90,  in_stock:true },
  { name:'Tirzepatide (30mg)',         cat:'fatloss', vial:'30mg', bac:'3mL', dose:'1mg',   units:'10', schedule:'2x per week',       timing:'AM',                 price:130, in_stock:true },
  { name:'Tirzepatide (60mg)',         cat:'fatloss', vial:'60mg', bac:'3mL', dose:'1mg',   units:'5',  schedule:'2x per week',       timing:'AM',                 price:240, in_stock:true },
  { name:'Retatrutide (10mg)',         cat:'fatloss', vial:'10mg', bac:'2mL', dose:'0.5mg', units:'10', schedule:'3-4x per week',    timing:'AM',                 price:45,  in_stock:true },
  { name:'Retatrutide (20mg)',         cat:'fatloss', vial:'20mg', bac:'2mL', dose:'1mg',   units:'10', schedule:'3-4x per week',    timing:'AM',                 price:90,  in_stock:true },
  { name:'Retatrutide (30mg)',         cat:'fatloss', vial:'30mg', bac:'3mL', dose:'1mg',   units:'10', schedule:'3-4x per week',    timing:'AM',                 price:150, in_stock:true },
  { name:'Semaglutide (3mg)',          cat:'fatloss', vial:'3mg',  bac:'2mL', dose:'250mcg',units:'17', schedule:'Once per week',     timing:'AM',                 price:65,  in_stock:true },
  { name:'Semaglutide (5mg)',          cat:'fatloss', vial:'5mg',  bac:'2mL', dose:'250mcg',units:'10', schedule:'Once per week',     timing:'Bedtime',            price:85,  in_stock:true },
  { name:'Semaglutide (10mg)',         cat:'fatloss', vial:'10mg', bac:'2mL', dose:'500mcg',units:'10', schedule:'Once per week',     timing:'Bedtime',            price:130, in_stock:true },
  { name:'Semaglutide (15mg)',         cat:'fatloss', vial:'15mg', bac:'2mL', dose:'500mcg',units:'7',  schedule:'Once per week',     timing:'Bedtime',            price:180, in_stock:true },
  { name:'Cagrilintide',               cat:'fatloss', vial:'10mg', bac:'2mL', dose:'250mcg',units:'5',  schedule:'Once per week',     timing:'AM',                 price:115, in_stock:true },
  { name:'AOD-9604',                   cat:'fatloss', vial:'5mg',  bac:'2mL', dose:'300mcg',units:'12', schedule:'5 days on / 2 off', timing:'AM fasted',          price:45,  in_stock:true },
  { name:'HGH Fragment 176-191',       cat:'fatloss', vial:'5mg',  bac:'2mL', dose:'500mcg',units:'20', schedule:'2x daily',          timing:'AM fasted / pre-bed', price:50, in_stock:true },

  // ───── GH AXIS ─────
  { name:'Tesamorelin (10mg)',         cat:'gh',      vial:'10mg', bac:'2mL', dose:'1mg',   units:'20', schedule:'5 days on / 2 off', timing:'AM/PM',              price:55,  in_stock:true },
  { name:'Tesamorelin (20mg)',         cat:'gh',      vial:'20mg', bac:'2mL', dose:'1mg',   units:'10', schedule:'5 days on / 2 off', timing:'AM/PM',              price:100, in_stock:true },
  { name:'Ipamorelin',                 cat:'gh',      vial:'10mg', bac:'3mL', dose:'300mcg',units:'9',  schedule:'5 days on / 2 off', timing:'AM/PM',              price:40,  in_stock:true },
  { name:'CJC-1295 No DAC (5mg)',      cat:'gh',      vial:'5mg',  bac:'2mL', dose:'100mcg',units:'4',  schedule:'5 days on / 2 off', timing:'AM/PM',              price:45,  in_stock:true },
  { name:'CJC-1295 No DAC (10mg)',     cat:'gh',      vial:'10mg', bac:'3mL', dose:'200mcg',units:'6',  schedule:'5 days on / 2 off', timing:'PM',                 price:90,  in_stock:true },
  { name:'CJC-1295 with DAC',          cat:'gh',      vial:'5mg',  bac:'2mL', dose:'1mg',   units:'40', schedule:'2x per week',       timing:'AM',                 price:50,  in_stock:true },
  { name:'CJC + Ipamorelin Blend',     cat:'gh',      vial:'5mg+5mg', bac:'2mL', dose:'250mcg ea', units:'10', schedule:'5 days on / 2 off', timing:'AM/PM fasted', price:45, in_stock:true },
  { name:'Sermorelin (5mg)',           cat:'gh',      vial:'5mg',  bac:'2mL', dose:'200-300mcg', units:'4-6', schedule:'Nightly',     timing:'Pre-sleep',          price:55,  in_stock:true },
  { name:'Sermorelin (10mg)',          cat:'gh',      vial:'10mg', bac:'2mL', dose:'200-300mcg', units:'4-6', schedule:'Nightly',     timing:'Pre-sleep',          price:80,  in_stock:true },
  { name:'Hexarelin',                  cat:'gh',      vial:'5mg',  bac:'2mL', dose:'200mcg',units:'8',  schedule:'5 days on / 2 off', timing:'AM fasted / pre-sleep', price:40, in_stock:true },
  { name:'HGH 10 IU',                  cat:'gh',      vial:'10 IU',bac:'1mL', dose:'1-4 IU',units:'10-40', schedule:'Daily',          timing:'AM or pre-bed',      price:150, in_stock:true },
  { name:'HGH 15 IU',                  cat:'gh',      vial:'15 IU',bac:'1.5mL', dose:'1-4 IU', units:'10-40', schedule:'Daily',       timing:'AM or pre-bed',      price:200, in_stock:true },

  // ───── HEALING / RECOVERY ─────
  { name:'BPC-157 (5mg)',              cat:'healing', vial:'5mg',  bac:'2mL', dose:'250mcg',units:'10', schedule:'Every day',         timing:'AM/PM',              price:20,  in_stock:true },
  { name:'BPC-157 (10mg)',             cat:'healing', vial:'10mg', bac:'2mL', dose:'500mcg',units:'10', schedule:'Every day',         timing:'AM/PM',              price:25,  in_stock:true },
  { name:'BPC-157 (20mg)',             cat:'healing', vial:'20mg', bac:'2mL', dose:'1mg',   units:'10', schedule:'Every day',         timing:'AM/PM',              price:50,  in_stock:true },
  { name:'TB-500',                     cat:'healing', vial:'10mg', bac:'2mL', dose:'500mcg',units:'10', schedule:'Every day',         timing:'AM',                 price:30,  in_stock:true },
  { name:'Wolverine Blend (BPC+TB 5/5)', cat:'healing', vial:'5mg+5mg', bac:'2mL', dose:'250mcg ea', units:'10', schedule:'Every day', timing:'AM/PM',              price:50,  in_stock:true },
  { name:'Wolverine Blend (BPC+TB 30/30)', cat:'healing', vial:'30mg+30mg', bac:'2mL', dose:'500mcg ea', units:'3', schedule:'Every day', timing:'AM/PM',          price:150, in_stock:true },
  { name:'KPV',                        cat:'healing', vial:'10mg', bac:'2mL', dose:'500mcg',units:'10', schedule:'5 days on / 2 off', timing:'AM',                 price:50,  in_stock:true },
  { name:'GHK-Cu (50mg)',              cat:'healing', vial:'50mg', bac:'3mL', dose:'1.7mg', units:'10', schedule:'Every day',         timing:'AM',                 price:55,  in_stock:true },
  { name:'GHK-Cu (100mg)',             cat:'healing', vial:'100mg',bac:'5mL', dose:'1.7mg', units:'9',  schedule:'Every day',         timing:'AM',                 price:90,  in_stock:true },
  { name:'SS-31 (10mg)',               cat:'healing', vial:'10mg', bac:'2mL', dose:'500mcg',units:'10', schedule:'5 days on / 2 off', timing:'AM',                 price:45,  in_stock:true },
  { name:'SS-31 (30mg)',               cat:'healing', vial:'30mg', bac:'2mL', dose:'1mg',   units:'7',  schedule:'5 days on / 2 off', timing:'AM',                 price:90,  in_stock:true },
  { name:'SS-31 (50mg)',               cat:'healing', vial:'50mg', bac:'3mL', dose:'1.67mg',units:'10', schedule:'5 days on / 2 off', timing:'AM',                 price:125, in_stock:true },
  { name:'LL-37',                      cat:'healing', vial:'5mg',  bac:'2mL', dose:'125mcg',units:'5',  schedule:'Every day',         timing:'AM',                 price:50,  in_stock:true },
  { name:'ARA-290',                    cat:'healing', vial:'15mg', bac:'1mL', dose:'1.5mg', units:'10', schedule:'5 days on / 2 off', timing:'AM',                 price:55,  in_stock:true },

  // ───── MUSCLE / IGF ─────
  { name:'IGF-1 LR3',                  cat:'muscle',  vial:'1mg',  bac:'1mL', dose:'50mcg', units:'5',  schedule:'10 days in a row',  timing:'AM or post-workout', price:50,  in_stock:true },
  { name:'IGF-1 DES',                  cat:'muscle',  vial:'1mg',  bac:'1mL', dose:'50mcg', units:'5',  schedule:'Training days',     timing:'Post-workout near target', price:55, in_stock:true },
  { name:'Follistatin 344',            cat:'muscle',  vial:'1mg',  bac:'2mL', dose:'50mcg', units:'10', schedule:'Training days',     timing:'30 min pre-workout (IM)', price:70, in_stock:true },
  { name:'MGF',                        cat:'muscle',  vial:'2mg',  bac:'2mL', dose:'200mcg',units:'20', schedule:'Post-workout 2-3x/wk', timing:'Immediately post-workout', price:60, in_stock:true },
  { name:'PEG-MGF',                    cat:'muscle',  vial:'2mg',  bac:'2mL', dose:'200mcg',units:'20', schedule:'2x per week',       timing:'Any time SQ',        price:65,  in_stock:true },

  // ───── ENERGY / METABOLIC ─────
  { name:'MOTS-C (10mg)',              cat:'energy',  vial:'10mg', bac:'2mL', dose:'1mg',   units:'20', schedule:'5 days on / 2 off', timing:'AM',                 price:35,  in_stock:true },
  { name:'MOTS-C (20mg)',              cat:'energy',  vial:'20mg', bac:'2mL', dose:'1mg',   units:'10', schedule:'5 days on / 2 off', timing:'AM fasted',          price:60,  in_stock:true },
  { name:'MOTS-C (40mg)',              cat:'energy',  vial:'40mg', bac:'3mL', dose:'2mg',   units:'15', schedule:'5 days on / 2 off', timing:'AM fasted',          price:140, in_stock:true },
  { name:'5-Amino-1MQ (10mg)',         cat:'energy',  vial:'10mg', bac:'2mL', dose:'1mg',   units:'20', schedule:'5 days on / 2 off', timing:'AM',                 price:25,  in_stock:true },
  { name:'5-Amino-1MQ (50mg)',         cat:'energy',  vial:'50mg', bac:'3mL', dose:'1.67mg',units:'10', schedule:'5 days on / 2 off', timing:'AM',                 price:100, in_stock:true },
  { name:'SLU-PP-332 (10mg)',          cat:'energy',  vial:'10mg', bac:'2mL', dose:'5mg',   units:'10', schedule:'Daily',             timing:'AM',                 price:60,  in_stock:true },
  { name:'SLU-PP-332 (30mg)',          cat:'energy',  vial:'30mg', bac:'2mL', dose:'5mg',   units:'3',  schedule:'Daily',             timing:'AM',                 price:120, in_stock:true },
  { name:'NAD+ (250mg)',               cat:'energy',  vial:'250mg',bac:'5mL', dose:'100mg', units:'20', schedule:'2-3 days per week', timing:'AM fasted',          price:45,  in_stock:true },
  { name:'NAD+ (500mg)',               cat:'energy',  vial:'500mg',bac:'5mL', dose:'100mg', units:'10', schedule:'2-3 days per week', timing:'AM fasted',          price:65,  in_stock:true },
  { name:'NAD+ (1000mg)',              cat:'energy',  vial:'1000mg', bac:'10mL', dose:'200mg', units:'20', schedule:'2-3 days per week', timing:'AM fasted',        price:110, in_stock:true },
  { name:'Glutathione (600mg)',        cat:'energy',  vial:'600mg',bac:'3mL', dose:'600mg', units:'—',  schedule:'Weekly',            timing:'AM',                 price:28,  in_stock:true },
  { name:'Glutathione (1500mg)',       cat:'energy',  vial:'1500mg', bac:'10mL', dose:'600-1500mg', units:'—', schedule:'Weekly',     timing:'AM',                 price:40,  in_stock:true },
  { name:'Humanin',                    cat:'energy',  vial:'5mg',  bac:'2mL', dose:'2mg',   units:'20', schedule:'2-3x per week',     timing:'Any time SQ',        price:60,  in_stock:true },
  { name:'L-Carnitine',                cat:'energy',  vial:'600mg/mL 20mL', bac:'—', dose:'200-600mg', units:'33-100', schedule:'Every day', timing:'AM',          price:35,  in_stock:true },

  // ───── COGNITION ─────
  { name:'Semax',                      cat:'cognition', vial:'30mg', bac:'3mL', dose:'1mg',  units:'10', schedule:'Mon / Wed / Fri',  timing:'AM',                 price:45,  in_stock:true },
  { name:'Selank',                     cat:'cognition', vial:'30mg', bac:'3mL', dose:'1mg',  units:'10', schedule:'As needed',        timing:'Afternoon',          price:45,  in_stock:true },
  { name:'PE-22-28',                   cat:'cognition', vial:'10mg', bac:'2mL', dose:'500mcg', units:'10', schedule:'5 days on / 2 off', timing:'AM',              price:50,  in_stock:true },
  { name:'Dihexa',                     cat:'cognition', vial:'5mg',  bac:'2mL', dose:'1mg',  units:'40', schedule:'Once weekly',      timing:'AM',                 price:75,  in_stock:true },
  { name:'P21',                        cat:'cognition', vial:'5mg',  bac:'2mL', dose:'500mcg-1mg', units:'10-20', schedule:'Daily',   timing:'AM',                 price:65,  in_stock:true },
  { name:'Cerebrolysin',               cat:'cognition', vial:'10-30 mL', bac:'—', dose:'10-30 mL', units:'—', schedule:'Daily during course', timing:'AM IM or IV', price:30, in_stock:true },
  { name:'Pinealon',                   cat:'cognition', vial:'20mg', bac:'2mL', dose:'2mg',  units:'20', schedule:'Daily × 20 days',  timing:'AM',                 price:25,  in_stock:true },

  // ───── SLEEP ─────
  { name:'DSIP',                       cat:'sleep',   vial:'5mg',  bac:'2mL', dose:'250mcg',units:'10', schedule:'5 days on / 2 off', timing:'1-3 hrs before bed', price:30, in_stock:true },

  // ───── LONGEVITY ─────
  { name:'Epitalon',                   cat:'longevity', vial:'20mg', bac:'2mL', dose:'2mg',  units:'20', schedule:'Daily × 20 days',  timing:'PM',                 price:25,  in_stock:true },
  { name:'FOXO4-DRI (10mg)',           cat:'longevity', vial:'10mg', bac:'2mL', dose:'3-4mg',units:'60-80', schedule:'Day 1, 3, 5',  timing:'AM',                 price:80,  in_stock:true },
  { name:'Thymalin / Thymogen',        cat:'longevity', vial:'20mg', bac:'2mL', dose:'2mg',  units:'20', schedule:'Daily × 20 days',  timing:'PM',                 price:30,  in_stock:true },

  // ───── IMMUNE ─────
  { name:'Thymosin Alpha-1',           cat:'immunity', vial:'10mg', bac:'2mL', dose:'1.5mg', units:'30', schedule:'5 days on / 2 off', timing:'AM',                price:65,  in_stock:true },
  { name:'VIP',                        cat:'immunity', vial:'5mg',  bac:'5mL', dose:'50mcg', units:'5',  schedule:'Every day',         timing:'AM/PM',              price:55,  in_stock:true },

  // ───── HORMONES / SEXUAL HEALTH ─────
  { name:'HCG (5000 IU)',              cat:'hormones', vial:'5000 IU',  bac:'2mL', dose:'500 IU',units:'20', schedule:'2-3x per week', timing:'AM',                price:154, in_stock:true },
  { name:'HCG (10000 IU)',             cat:'hormones', vial:'10000 IU', bac:'3mL', dose:'500 IU',units:'15', schedule:'2-3x per week', timing:'AM',                price:220, in_stock:true },
  { name:'Gonadorelin',                cat:'hormones', vial:'2mg',  bac:'2mL', dose:'200mcg',units:'20', schedule:'2-3x per week',     timing:'Morning SQ',         price:60,  in_stock:true },
  { name:'Kisspeptin-10',              cat:'hormones', vial:'5mg',  bac:'2mL', dose:'125mcg',units:'5',  schedule:'Every day',         timing:'1hr before bed',     price:55,  in_stock:true },
  { name:'PT-141',                     cat:'sexual', vial:'10mg', bac:'2mL', dose:'500mcg',units:'10', schedule:'As needed',         timing:'30 min before',      price:55,  in_stock:true },
  { name:'Melanotan 1',                cat:'sexual', vial:'10mg', bac:'2mL', dose:'250mcg',units:'5',  schedule:'2 days per week',   timing:'AM',                 price:25,  in_stock:true },
  { name:'Melanotan II',               cat:'sexual', vial:'10mg', bac:'2mL', dose:'250mcg',units:'5',  schedule:'Daily loading → maint', timing:'PM',             price:45,  in_stock:true },
  { name:'Oxytocin',                   cat:'sexual', vial:'10mg', bac:'10mL', dose:'50mcg',units:'5',  schedule:'As needed',         timing:'AM',                 price:50,  in_stock:true },
  { name:'Tadalafil (Cialis)',         cat:'sexual', vial:'30 × 20mg tabs', bac:'—', dose:'10-20mg', units:'—', schedule:'As needed / daily 5mg', timing:'30-60 min before', price:35, in_stock:true },
  { name:'Testosterone Cypionate',     cat:'hormones', vial:'200mg/mL 10mL', bac:'—', dose:'100mg', units:'50', schedule:'2x per week', timing:'AM',                price:85,  in_stock:true },
  { name:'Testosterone Enanthate',     cat:'hormones', vial:'200mg/mL 10mL', bac:'—', dose:'100mg', units:'50', schedule:'2x per week', timing:'AM',                price:85,  in_stock:true },
  { name:'Testosterone Propionate',    cat:'hormones', vial:'100mg/mL 10mL', bac:'—', dose:'50mg', units:'50', schedule:'3x per week',  timing:'AM',                price:75,  in_stock:true },

  // ───── BIOREGULATORS ─────
  { name:'Cartalax',                   cat:'bioregulator', vial:'20mg', bac:'2mL', dose:'1mg', units:'10', schedule:'Daily × 20-30 days', timing:'PM',             price:25,  in_stock:true },
  { name:'Livagen',                    cat:'bioregulator', vial:'20mg', bac:'2mL', dose:'2mg', units:'20', schedule:'Daily × 30 days',    timing:'AM/PM',          price:30,  in_stock:true },

  // ───── BLENDS ─────
  { name:'GLOW Blend (GHK+BPC+TB)',    cat:'blend', vial:'50/10/10mg', bac:'2mL', dose:'2.5/0.5/0.5mg', units:'10', schedule:'5 days on / 2 off', timing:'AM or PM', price:70, in_stock:true },
  { name:'KLOW Blend (GHK+BPC+TB+KPV)', cat:'blend', vial:'50/10/10/10mg', bac:'2mL', dose:'2.5/0.5/0.5/0.5mg', units:'10', schedule:'5 days on / 2 off', timing:'AM or PM', price:80, in_stock:true },
  { name:'Triple Threat (NAD+MOTS+5A)', cat:'blend', vial:'100/10/10mg', bac:'2mL', dose:'10/1/1mg', units:'20', schedule:'3-4 days per week', timing:'AM',         price:90,  in_stock:true },
  { name:'Tesa / Ipa Blend',           cat:'blend', vial:'6mg+2mg', bac:'2mL', dose:'300mcg/100mcg', units:'10', schedule:'5 days on / 2 off', timing:'AM/PM',     price:60,  in_stock:true },

  // ───── CUSTOM (catch-all) ─────
  { name:'Custom',                     cat:'',      vial:'',     bac:'',    dose:'',      units:'',   schedule:'',                   timing:'',                   price:0,   in_stock:true },
];

// Convenience helper for the protocol page: returns a name -> {vial, dose, bac, units, schedule, timing, price} map
// built from PEPTIDE_DATA, filtered to in_stock items only. Mimics the legacy PRESETS shape so existing code keeps working.
window.buildPresetsFromPeptideData = function() {
  var out = {};
  window.PEPTIDE_DATA.forEach(function(p) {
    if (!p.in_stock) return;
    out[p.name] = {
      vial:     p.vial,
      dose:     p.dose,
      bac:      p.bac,
      units:    p.units,
      schedule: p.schedule,
      timing:   p.timing,
      price:    p.price
    };
  });
  return out;
};
