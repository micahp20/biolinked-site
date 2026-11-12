/* Quest panel for this portal, plus earlier draws that are now scored too.
   Nov 2026 panel collected 11/02/2026 08:49, reported 11/05/2026 17:14. No time
   zone was printed. Markers carried over from earlier draws name their draw in
   their own note, so the scored set deliberately mixes timepoints.
   Custom wellness score, not a diagnosis: 4 optimal on a printed cutoff or a
   functional window inside the reference range, 3 inside the reference range
   but at an edge of it or short of a printed optimal cutoff,
   1 outside the reference range.
   54×4 + 6×3 + 3×1 = 237. 237 / (63×4) × 100 = 94.05, rounded to 94.
   Not scored: the unreported BUN/creatinine ratio and the duplicate albumin
   from the testosterone panel. */
(function () {
  function prior(text) {
    return '<br>Earlier value already stored on this page. It is not part of this score and is not a trend: ' + text + '.';
  }
  function row(id, name, value, unit, ref, pc, pill, vc, pts, tip) {
    return { id: id, n: name, v: value, u: unit, ref: ref, pc: pc, p: pill, vc: vc, pts: pts, plain: true, tip: tip };
  }
  function opt(id, name, value, unit, ref, why, earlier) {
    return row(id, name, value, unit, ref, 'ok', 'Optimal', 'ok', 4,
      '<strong>' + name + '.</strong> ' + value + ' ' + unit + '. ' + why + ' Scored 4.' + (earlier ? prior(earlier) : ''));
  }
  function mid(id, name, value, unit, ref, why, earlier) {
    return row(id, name, value, unit, ref, 'normal', 'In range', 'normal', 3,
      '<strong>' + name + '.</strong> ' + value + ' ' + unit + '. ' + why + ' Scored 3.' + (earlier ? prior(earlier) : ''));
  }
  function out(id, name, value, unit, ref, pc, pill, vc, why) {
    return row(id, name, value, unit, ref, pc, pill, vc, 1,
      '<strong>' + name + '.</strong> ' + value + ' ' + unit + '. ' + why + ' Scored 1.');
  }
  function skip(id, name, value, unit, ref, why) {
    return row(id, name, value, unit, ref, 'normal', 'Not scored', 'normal', null,
      '<strong>' + name + '.</strong> ' + why);
  }

  var metabolic = [
    opt('n2-glu', 'Glucose', '80', 'mg/dL', '65–99 fasting',
      'Fasting laboratory interval 65–99 mg/dL. This page already treated a fasting result inside that interval, below 100, as optimal. Favorable on this report. Not a diabetes diagnosis.',
      '03/26 86 mg/dL, reference 65–99'),
    opt('n2-a1c', 'Hemoglobin A1c', '4.8', '%', '<5.7',
      'Printed screening cutoff is under 5.7%. The report describes that range as consistent with a decreased risk of diabetes. This page already scored a result under 5.7 as optimal. Not a diagnosis.',
      '05/26 4.6%'),
    opt('n2-eag', 'eAG', '91', 'mg/dL', 'optimal <114',
      'Average glucose calculated from the 11/02/2026 hemoglobin A1c of 4.8%, and also reported as 5.0 mmol/L. Sits in the optimal window: 91 mg/dL is well under 114 mg/dL, the average glucose that corresponds to the 5.7% A1c screening cutoff. The mmol/L form is the same result and is not scored a second time.')
  ];
  var lipids = [
    opt('n2-tc', 'Cholesterol, total', '154', 'mg/dL', '<200',
      'Printed reference is under 200 mg/dL. This page already scored a result under 200 as optimal. Favorable on this report. Not a heart-risk calculation.',
      '03/26 178 mg/dL'),
    opt('n2-hdl', 'HDL cholesterol', '76', 'mg/dL', '≥40',
      'Printed reference is at or above 40 mg/dL. This page already used above 60 as its optimal band. 76 meets both. Favorable on this report.',
      '03/26 78 mg/dL'),
    opt('n2-tg', 'Triglycerides', '40', 'mg/dL', '<150',
      'Printed reference is under 150 mg/dL. This page already scored a result under 150 as optimal. Favorable on this report.',
      '03/26 79 mg/dL'),
    opt('n2-ldl', 'LDL cholesterol', '67', 'mg/dL', '<100',
      'Calculated on this report by the Martin-Hopkins method. Printed reference and desirable range are under 100 mg/dL. This page already scored a result under 100 as optimal. Favorable on this report.',
      '03/26 83 mg/dL'),
    opt('n2-ratio', 'Cholesterol / HDL ratio', '2.0', '', '<5.0',
      'Printed reference is under 5.0. This page already used under 3.5 as its optimal band. 2.0 meets both.',
      '03/26 2.3'),
    opt('n2-non', 'Non-HDL cholesterol', '78', 'mg/dL', '<130',
      'Printed reference is under 130 mg/dL. This page already scored a result under 130 as optimal. A lower goal printed for some diabetes cases is not applied.',
      '03/26 100 mg/dL'),
    opt('n2-apob', 'Apolipoprotein B', '63', 'mg/dL', 'optimal <90',
      'This report labels under 90 mg/dL optimal. 63 meets that printed cutoff. Favorable on this report. Not a heart-risk calculation.',
      '03/26 67 mg/dL'),
    opt('hx-tgh', 'Triglyceride / HDL ratio', '1.0', '', 'optimal <2',
      'Drawn 03/2026, not on the 11/02/2026 panel, which did not print this ratio. Sits in the optimal window: 1.0 is well under 2. The triglycerides of 40 and HDL of 76 mg/dL on the 11/02/2026 panel would give a lower ratio still, but that figure is not printed on the report and is not substituted here.')
  ];
  var kidney = [
    opt('n2-bun', 'Urea nitrogen (BUN)', '16', 'mg/dL', '7–25',
      'Sits in the optimal window. 16 mg/dL is mid-range on 7–25, the functional band for kidney clearance on adequate protein intake.', '03/26 12 mg/dL, reference 7–25'),
    opt('n2-cr', 'Creatinine', '0.97', 'mg/dL', '0.60–1.29',
      'Sits in the optimal window. 0.97 mg/dL is mid-range on 0.60–1.29 and consistent with the eGFR of 98 on this report.', '03/26 1.07 mg/dL'),
    opt('n2-egfr', 'eGFR', '98', 'mL/min/1.73m2', '≥60',
      'Printed reference is at or above 60. This page already called above 90 excellent. 98 meets that existing threshold. Not a kidney diagnosis.',
      '03/26 88'),
    opt('n2-na', 'Sodium', '140', 'mmol/L', '135–146',
      'Sits in the optimal window. 140 mmol/L is the middle of 135–146, the functional target for sodium balance.', '03/26 138 mmol/L'),
    opt('n2-k', 'Potassium', '4.7', 'mmol/L', '3.5–5.3',
      'Sits in the optimal window. 4.7 mmol/L is in the upper-middle of 3.5–5.3, the functional band for potassium.', '03/26 4.2 mmol/L'),
    opt('n2-cl', 'Chloride', '105', 'mmol/L', '98–110',
      'Sits in the optimal window. 105 mmol/L is mid-range on 98–110.', null),
    mid('n2-co2', 'Carbon dioxide', '30', 'mmol/L', '18–30',
      '30 mmol/L is the top number of the printed range 18–30 and is still inside it. Not one of the two laboratory flags.', null),
    opt('n2-ca', 'Calcium', '9.1', 'mg/dL', '8.6–10.3',
      'Sits in the optimal window. 9.1 mg/dL is mid-range on 8.6–10.3.', null),
    opt('n2-tp', 'Protein, total', '6.7', 'g/dL', '6.1–8.1',
      'Sits in the optimal window. 6.7 g/dL is mid-range on 6.1–8.1.', null),
    opt('n2-alb', 'Albumin', '4.5', 'g/dL', '3.6–5.1',
      'Sits in the optimal window. 4.5 g/dL is in the upper half of 3.6–5.1, the functional target for albumin. The testosterone panel also reported albumin 4.6 g/dL; that duplicate is shown below and is not scored.',
      '05/26 4.6 g/dL'),
    opt('n2-glob', 'Globulin', '2.2', 'g/dL', '1.9–3.7',
      'Sits in the optimal window. Calculated result, 2.2 g/dL in the lower-middle of 1.9–3.7.', null),
    opt('n2-ag', 'Albumin / globulin ratio', '2.0', '', '1.0–2.5',
      'Sits in the optimal window. Calculated result, 2.0 in the upper half of 1.0–2.5, which is the favorable direction for this ratio.', null),
    opt('n2-bili', 'Bilirubin, total', '1.0', 'mg/dL', '0.2–1.2',
      'Sits in the optimal window. 1.0 mg/dL is inside 0.2–1.2; a higher-normal total bilirubin is commonly read as favorable on functional ranges.', '03/26 0.7 mg/dL'),
    out('n2-alp', 'Alkaline phosphatase', '30', 'U/L', '36–130', 'lo', 'Low', 'lo',
      'Laboratory flag: 30 U/L is below the printed range 36–130. AST and ALT on this report are inside their ranges, so this is not a statement that every liver marker is normal. No urgent or critical result is apparent from this report alone. Discuss a repeat ALP with a clinician to confirm whether it persists. An isolated low ALP is a recognized reason to repeat the test; see the Newcastle Hospitals low-ALP guidance linked under the panel. This is not a diagnosis and not a treatment recommendation.' + prior('03/26 32 U/L, reference 36–130; 01/25 36 U/L')),
    opt('n2-ast', 'AST', '25', 'U/L', '10–40',
      'Sits in the optimal window. 25 U/L is mid-range on 10–40, the band functional ranges treat as optimal for liver enzymes.', '03/26 26 U/L'),
    opt('n2-alt', 'ALT', '23', 'U/L', '9–46',
      'Sits in the optimal window. 23 U/L is in the lower half of 9–46, the functional target for ALT.', '03/26 24 U/L')
  ];
  var heme = [
    opt('n2-wbc', 'White blood cell count', '5.0', 'Thousand/uL', '3.8–10.8',
      'Sits in the optimal window. 5.0 Thousand/uL is mid-range on 3.8–10.8, the functional band for immune reserve without active inflammation.', '05/26 6.6 K/uL, reference 3.8–10.8'),
    opt('n2-rbc', 'Red blood cell count', '5.13', 'Million/uL', '4.33–5.82',
      'Sits in the optimal window. 5.13 Million/uL is mid-range on 4.33–5.82.', '05/26 5.08'),
    row('n2-hgb', 'Hemoglobin', '17.7', 'g/dL', '13.7–17.7', 'normal', 'Upper limit', 'normal', 3,
      '<strong>Hemoglobin.</strong> 17.7 g/dL. 17.7 g/dL is exactly this laboratory’s upper limit and is inside 13.7–17.7. It is not an out-of-range flag. Track it on a future CBC. Scored 3.' + prior('05/26 17.3 g/dL, reference 13.7–17.7')),
    mid('n2-hct', 'Hematocrit', '51.2', '%', '42.5–55.0',
      '51.2% is inside this laboratory’s range 42.5–55.0. It is not an out-of-range flag. Track it on a future CBC.',
      '05/26 50.2%, reference 42.5–55.0'),
    mid('n2-mcv', 'MCV', '99.8', 'fL', '81.4–101.7',
      '99.8 fL is high-normal on 81.4–101.7, near the top of the printed range rather than in the optimal middle. It is not an out-of-range flag. Track it alongside MCH on a future CBC.', '05/26 98.8 fL'),
    out('n2-mch', 'MCH', '34.5', 'pg', '27.0–33.0', 'hi', 'High', 'hi',
      'Laboratory flag: 34.5 pg is above the printed range 27.0–33.0. No urgent or critical result is apparent from this report alone. Discuss a repeat CBC with a clinician to confirm whether it persists. This is not a diagnosis and not a cause or treatment recommendation.' + prior('05/26 34.1 pg, reference 27.0–33.0')),
    opt('n2-mchc', 'MCHC', '34.6', 'g/dL', '31.6–35.4',
      'Sits in the optimal window. 34.6 g/dL is in the upper half of 31.6–35.4, the functional target for cell hemoglobin concentration.', null),
    opt('n2-rdw', 'RDW', '13.1', '%', '11.0–15.0',
      'Sits in the optimal window. 13.1% is in the lower half of 11.0–15.0; a lower RDW means more uniform cell size and is the favorable direction.', '05/26 14.1%'),
    opt('n2-plt', 'Platelet count', '214', 'Thousand/uL', '140–400',
      'Sits in the optimal window. 214 Thousand/uL is mid-range on 140–400.', '05/26 218'),
    opt('n2-mpv', 'MPV', '11.0', 'fL', '7.5–12.5',
      'Sits in the optimal window. 11.0 fL is mid-range on 7.5–12.5.', null),
    opt('n2-neut', 'Absolute neutrophils', '3075', 'cells/uL', '1500–7800',
      'Sits in the optimal window. 3075 cells/uL is in the lower-middle of 1500–7800, the functional band for resting neutrophils.', null),
    opt('n2-lymph', 'Absolute lymphocytes', '1315', 'cells/uL', '850–3900',
      'Sits in the optimal window. 1315 cells/uL is mid-range on 850–3900.', null),
    opt('n2-mono', 'Absolute monocytes', '430', 'cells/uL', '200–950',
      'Sits in the optimal window. 430 cells/uL is mid-range on 200–950.', null),
    opt('n2-eos', 'Absolute eosinophils', '140', 'cells/uL', '15–500',
      'Sits in the optimal window. 140 cells/uL is in the lower half of 15–500, the favorable direction for this marker.', null),
    opt('n2-baso', 'Absolute basophils', '40', 'cells/uL', '0–200',
      'Sits in the optimal window. 40 cells/uL is in the lower half of 0–200, the favorable direction for this marker.', null),
    opt('n2-npct', 'Neutrophils', '61.5', '%', '40–74',
      'Sits in the optimal window. 61.5% is mid-range on 40–74, a standard reference range: this report printed no range for the differential percentages. The absolute neutrophil count is scored separately against the range the laboratory did print.'),
    opt('n2-lpct', 'Lymphocytes', '26.3', '%', '14–46',
      'Sits in the optimal window. 26.3% is mid-range on 14–46, a standard reference range, as this report printed no range for the differential percentages.'),
    opt('n2-mpct', 'Monocytes', '8.6', '%', '4–12',
      'Sits in the optimal window. 8.6% is mid-range on 4–12, a standard reference range, as this report printed no range for the differential percentages.'),
    opt('n2-epct', 'Eosinophils', '2.8', '%', '0–7',
      'Sits in the optimal window. 2.8% is in the lower half of 0–7, a standard reference range, as this report printed no range for the differential percentages.'),
    opt('n2-bpct', 'Basophils', '0.8', '%', '0–3',
      'Sits in the optimal window. 0.8% is in the lower half of 0–3, a standard reference range, as this report printed no range for the differential percentages.')
  ];
  var hormones = [
    opt('n2-tt', 'Testosterone, total', '988', 'ng/dL', '250–1100',
      'Sits in the optimal window. 988 ng/dL is in the upper quartile of 250–1100, the band functional ranges target for total testosterone rather than the middle of the laboratory range. No treatment status is assumed from this number.',
      '09/26 1364 ng/dL on a prior assay with reference 300–890'),
    opt('n2-ft', 'Testosterone, free', '206.7', 'pg/mL', '46.0–224.0',
      'Sits in the optimal window. 206.7 pg/mL is in the upper quartile of 46.0–224.0, the band functional ranges target for free testosterone. No treatment status is assumed from this number.',
      '09/26 329.2 pg/mL on a prior assay with reference 47.0–244.0'),
    opt('n2-bio', 'Testosterone, bioavailable', '434.1', 'ng/dL', '110.0–575.0',
      'Sits in the optimal window. 434.1 ng/dL is in the upper half of 110.0–575.0 and tracks the free and total results on this report. No treatment status is assumed from this number.',
      '05/26 392.5 ng/dL, reference 110–575'),
    opt('n2-shbg', 'Sex hormone binding globulin', '23', 'nmol/L', '10–50',
      'Sits in the optimal window. 23 nmol/L is in the lower-middle of 10–50, the band that leaves more testosterone unbound without running low.', '09/26 29 nmol/L, reference 17–56'),
    opt('n2-psa', 'PSA, total', '2.03', 'ng/mL', '≤4.00',
      'Sits in the optimal window, well under the printed limit of 4.00 ng/mL. The report says a PSA result should not be read as absolute evidence of the presence or absence of disease. No treatment status is assumed.',
      null),
    mid('hx-e2', 'Estradiol', '60.26', 'pg/mL', '5.37–65.90',
      'Drawn before the 11/02/2026 panel; the draw date was not recorded on this page. 60.26 pg/mL is inside 5.37–65.90 but in the upper third of it, and no optimal cutoff was printed, so it is not scored as optimal.'),
    opt('hx-cort', 'Cortisol, morning', '11.8', 'mcg/dL', '4–22',
      'Drawn 05/2026, not on the 11/02/2026 panel. Sits in the optimal window: 11.8 mcg/dL is mid-range on 4–22 for a morning draw. An earlier 01/2025 value of 23.2 is not scored.'),
    opt('hx-dhea', 'DHEA-S', '253', 'mcg/dL', '61–442',
      'Drawn 01/2025, the oldest result in this score and so the furthest from current. Sits in the optimal window: 253 mcg/dL is mid-range on 61–442.'),
    out('hx-igf', 'IGF-1', '289', 'ng/mL', '74–227', 'hi', 'High', 'hi',
      'Drawn 09/2026, not on the 11/02/2026 panel. 289 ng/mL is above the reference range 74–227. On growth-hormone therapy a result above that range is the expected and intended effect rather than a sign of disease, because the reference range describes people who are not being treated. It is a monitoring point: the usual practice is to keep IGF-1 from running far above the range and to recheck it periodically with a clinician. The 4/3/1 rule on this page scores any value outside its reference range as 1, so it scores 1 here even though it is expected. An earlier 03/2026 value of 141 is not scored. This is not a diagnosis and not a treatment recommendation.'),
    opt('hx-gh', 'Growth hormone, random', '<0.1', 'ng/mL', '≤7.1',
      'Drawn 01/2025. Sits in the optimal window: a random draw at or below 7.1 ng/mL is inside the reference range. Growth hormone is released in pulses, so a low or undetectable random value is the normal finding and not a deficiency, and a single random draw cannot establish deficiency or excess on its own.')
  ];
  var thyroid = [
    opt('n2-rt3', 'T3, reverse', '14', 'ng/dL', '8–25',
      'Sits in the optimal window. 14 ng/dL is in the lower half of 8–25; a lower reverse T3 is the favorable direction for thyroid conversion.', null),
    opt('n2-ft3', 'T3, free', '3.4', 'pg/mL', '2.3–4.2',
      'Sits in the optimal window. 3.4 pg/mL is in the upper-middle of 2.3–4.2, the band functional ranges target for free T3.', '09/26 4.42 pg/mL on a prior assay with reference 2.77–5.27'),
    opt('n2-ft4', 'T4, free', '1.0', 'ng/dL', '0.8–1.8',
      'Sits in the optimal window. 1.0 ng/dL is in the lower-middle of 0.8–1.8, the functional band for free T4 alongside an adequate free T3.', '09/26 0.77 ng/dL on a prior assay with reference 0.59–2.19'),
    opt('n2-tsh', 'TSH', '1.81', 'mIU/L', '0.40–4.50',
      'Sits in the optimal window. 1.81 mIU/L is in the band under 2.5 that functional ranges treat as optimal for TSH.', '05/26 3.78 mIU/L, reference 0.40–4.50')
  ];
  var unscored = [
    skip('n2-bunr', 'BUN / creatinine ratio', 'Not reported', '', '6–22',
      'The report says this ratio was not reported because BUN and creatinine are within the reference range. There is no value to score.'),
    skip('n2-alb2', 'Albumin (testosterone panel)', '4.6', 'g/dL', '3.6–5.1',
      '4.6 g/dL, reference 3.6–5.1. This is the same analyte as the metabolic-panel albumin of 4.5 g/dL, which is scored above, so it is not counted a second time.')
  ];
  var inflammation = [
    mid('n2-crp', 'hsCRP', '1.2', 'mg/L', 'optimal <1.0',
      'This report’s categories are optimal under 1.0, average 1.0–3.0, and higher above 3.0. 1.2 mg/L is the average relative cardiovascular-risk category. It is not evidence of an acute illness and not an overall cardiovascular-risk diagnosis.',
      null)
  ];
  var vitamins = [
    opt('hx-d', 'Vitamin D, 25-OH', '69', 'ng/mL', '30–100',
      'Drawn 05/2026, not on the 11/02/2026 panel. Sits in the optimal window: 69 ng/mL is in the upper-middle of 30–100 and inside the band functional ranges target for 25-hydroxy vitamin D.')
  ];

  var groups = [
    ['Metabolic', metabolic],
    ['Lipids', lipids],
    ['Inflammation', inflammation],
    ['Kidney, electrolytes, and liver', kidney],
    ['Hematology', heme],
    ['Hormones', hormones],
    ['Thyroid', thyroid],
    ['Vitamins', vitamins]
  ];
  function tally(list) {
    var pts = 0, n = 0;
    list.forEach(function (r) { if (r.pts != null) { pts += r.pts; n += 1; } });
    return { pts: pts, n: n, score: n ? Math.round(pts / (n * 4) * 100) : null };
  }
  var all = [];
  groups.forEach(function (g) { all = all.concat(g[1]); });
  var total = tally(all);
  var domains = groups.map(function (g) {
    var t = tally(g[1]);
    return { v: String(t.score), n: g[0] };
  });
  var secs = groups.map(function (g) {
    var t = tally(g[1]);
    return { t: g[0] + ' · ' + t.score + '/100 · ' + t.n + ' scored', rows: g[1] };
  });
  secs.push({ t: 'Shown and not scored', rows: unscored });

  window.MP_LABS = {
    sub: 'Quest · collected 11/02/2026 08:49 · reported 11/05/2026 17:14 · fasting · no time zone printed',
    l: 'Custom wellness score',
    score: String(total.score),
    outof: '/100',
    g: 'Strong panel · 94/100 · three out of range, one expected on therapy',
    c: 'Informational only, not a diagnosis. No urgent or critical result is apparent from this report alone. The out-of-range markers are alkaline phosphatase 30 U/L, below 36–130, and MCH 34.5 pg, above 27.0–33.0, both on the 11/02/2026 panel, and IGF-1 289 ng/mL, above 74–227, from the 09/2026 draw. Discuss a repeat ALP and CBC with a clinician to confirm whether those results persist. An IGF-1 above the untreated reference range is the expected effect of growth-hormone therapy rather than a disease finding and is a periodic monitoring point with a clinician, but the 4/3/1 rule still scores it 1. Hemoglobin is 17.7 g/dL, exactly this lab’s upper limit, and hematocrit is 51.2%, inside 42.5–55.0; track both on a future CBC. hsCRP 1.2 mg/L is this lab’s average relative cardiovascular-risk category (optimal under 1.0), not an acute illness and not an overall cardiovascular-risk diagnosis. PSA 2.03 ng/mL is within the printed limit of 4.00. Testosterone results are inside the ranges on this report. Fasting glucose 80 mg/dL and A1c 4.8% are favorable on the printed ranges. ApoB 63, LDL 67, triglycerides 40, and HDL 76 mg/dL are favorable on the printed ranges. Kidney results and thyroid results are inside their printed ranges. AST and ALT are inside their printed ranges.',
    bioAge: {
      /* Age at the 11/02/2026 draw, from the DOB and age printed on the Quest
         report (report prints Age: 45). The DOB itself is not shown on the page. */
      age: 45.45,
      draw: 'Quest panel collected 11/02/2026',
      m: {
        albumin:    { v: 4.5,  u: 'g/dL',  src: 'metabolic panel 11/02/2026' },
        creatinine: { v: 0.97, u: 'mg/dL', src: '11/02/2026' },
        glucose:    { v: 80,   u: 'mg/dL', src: 'fasting, 11/02/2026' },
        crp:        { v: 1.2,  u: 'mg/L',  src: 'hsCRP 11/02/2026' },
        lymph:      { v: 26.3, u: '%',     src: '11/02/2026' },
        mcv:        { v: 99.8, u: 'fL',    src: '11/02/2026' },
        rdw:        { v: 13.1, u: '%',     src: '11/02/2026' },
        alp:        { v: 30,   u: 'U/L',   src: '11/02/2026, flagged low' },
        wbc:        { v: 5.0,  u: 'K/uL',  src: '11/02/2026' }
      }
    },
    domains: domains,
    bannerattr: '',
    banner: 'Custom wellness score, not a validated diagnosis. A marker scores 4 when it meets an optimal or desirable cutoff printed on this report, an optimal cutoff already used on this page, or a functional window inside the reference range. It scores 3 when it is inside the reference range but sits at an edge of it or short of a printed optimal cutoff. It scores 1 when it is outside the reference range. This panel is 54 × 4 + 6 × 3 + 3 × 1 = 237 points. 237 ÷ 252 × 100 = 94.05, rounded to 94. Sixty-three results are scored. The scored set is not one draw: estradiol, morning cortisol, DHEA-S, IGF-1, random growth hormone, vitamin D and the triglyceride / HDL ratio come from draws between 01/2025 and 09/2026, and each names its draw in its own note. The five differential percentages are scored against standard reference ranges because this report printed none. Not scored: the unreported BUN/creatinine ratio and the duplicate albumin from the testosterone panel. Tap a marker for its reference range.',
    secs: secs,
    note: 'Informational only, not a diagnosis or a treatment plan. An isolated low alkaline phosphatase is a recognized reason to repeat the test. Newcastle Hospitals low-ALP guidance, revision 4: <a href="https://laboratories.newcastle-hospitals.nhs.uk/wp-content/uploads/2024/10/Low-ALP-guidance-revision-4.pdf">laboratories.newcastle-hospitals.nhs.uk low-ALP guidance</a>. This page does not set a retest date.'
  };
  if (total.score !== 94 || total.n !== 63 || total.pts !== 237) {
    throw new Error('labs score mismatch ' + total.pts + ' ' + total.n + ' ' + total.score);
  }
})();
