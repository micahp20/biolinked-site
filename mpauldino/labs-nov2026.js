/* Quest panel for this portal only.
   Collected 11/02/2026 08:49, reported 11/05/2026 17:14. No time zone was printed.
   Custom wellness score, not a diagnosis: 4 optimal, 3 inside the laboratory
   range without a separate optimal cutoff, 1 outside the laboratory range.
   10×4 + 38×3 + 2×1 = 156. 156 / (50×4) × 100 = 78.
   Not scored: unreported BUN/creatinine ratio, the second albumin, both eAG
   values, and five differential percentages with no printed range. */
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
      '<strong>' + name + '.</strong> ' + value + ' ' + unit + '. ' + why + ' Scored 3. No separate optimal cutoff is applied.' + (earlier ? prior(earlier) : ''));
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
      '05/26 4.6%')
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
      '03/26 67 mg/dL')
  ];
  var kidney = [
    mid('n2-bun', 'Urea nitrogen (BUN)', '16', 'mg/dL', '7–25',
      'Inside the printed range 7–25 mg/dL.', '03/26 12 mg/dL, reference 7–25'),
    mid('n2-cr', 'Creatinine', '0.97', 'mg/dL', '0.60–1.29',
      'Inside the printed range 0.60–1.29 mg/dL.', '03/26 1.07 mg/dL'),
    opt('n2-egfr', 'eGFR', '98', 'mL/min/1.73m2', '≥60',
      'Printed reference is at or above 60. This page already called above 90 excellent. 98 meets that existing threshold. Not a kidney diagnosis.',
      '03/26 88'),
    mid('n2-na', 'Sodium', '140', 'mmol/L', '135–146',
      'Inside the printed range 135–146 mmol/L.', '03/26 138 mmol/L'),
    mid('n2-k', 'Potassium', '4.7', 'mmol/L', '3.5–5.3',
      'Inside the printed range 3.5–5.3 mmol/L.', '03/26 4.2 mmol/L'),
    mid('n2-cl', 'Chloride', '105', 'mmol/L', '98–110',
      'Inside the printed range 98–110 mmol/L.', null),
    mid('n2-co2', 'Carbon dioxide', '30', 'mmol/L', '18–30',
      '30 mmol/L is the top number of the printed range 18–30 and is still inside it. Not one of the two laboratory flags.', null),
    mid('n2-ca', 'Calcium', '9.1', 'mg/dL', '8.6–10.3',
      'Inside the printed range 8.6–10.3 mg/dL.', null),
    mid('n2-tp', 'Protein, total', '6.7', 'g/dL', '6.1–8.1',
      'Inside the printed range 6.1–8.1 g/dL.', null),
    mid('n2-alb', 'Albumin', '4.5', 'g/dL', '3.6–5.1',
      'Metabolic-panel albumin, inside 3.6–5.1 g/dL. The testosterone panel also reported albumin 4.6 g/dL; that duplicate is shown below and is not scored.',
      '05/26 4.6 g/dL'),
    mid('n2-glob', 'Globulin', '2.2', 'g/dL', '1.9–3.7',
      'Calculated result, inside the printed range 1.9–3.7 g/dL.', null),
    mid('n2-ag', 'Albumin / globulin ratio', '2.0', '', '1.0–2.5',
      'Calculated result, inside the printed range 1.0–2.5.', null),
    mid('n2-bili', 'Bilirubin, total', '1.0', 'mg/dL', '0.2–1.2',
      'Inside the printed range 0.2–1.2 mg/dL.', '03/26 0.7 mg/dL'),
    out('n2-alp', 'Alkaline phosphatase', '30', 'U/L', '36–130', 'lo', 'Low', 'lo',
      'Laboratory flag: 30 U/L is below the printed range 36–130. AST and ALT on this report are inside their ranges, so this is not a statement that every liver marker is normal. No urgent or critical result is apparent from this report alone. Discuss a repeat ALP with a clinician to confirm whether it persists. An isolated low ALP is a recognized reason to repeat the test; see the Newcastle Hospitals low-ALP guidance linked under the panel. This is not a diagnosis and not a treatment recommendation.' + prior('03/26 32 U/L, reference 36–130; 01/25 36 U/L')),
    mid('n2-ast', 'AST', '25', 'U/L', '10–40',
      'Inside the printed range 10–40 U/L. Normal on this report.', '03/26 26 U/L'),
    mid('n2-alt', 'ALT', '23', 'U/L', '9–46',
      'Inside the printed range 9–46 U/L. Normal on this report.', '03/26 24 U/L')
  ];
  var heme = [
    mid('n2-wbc', 'White blood cell count', '5.0', 'Thousand/uL', '3.8–10.8',
      'Inside the printed range 3.8–10.8 Thousand/uL.', '05/26 6.6 K/uL, reference 3.8–10.8'),
    mid('n2-rbc', 'Red blood cell count', '5.13', 'Million/uL', '4.33–5.82',
      'Inside the printed range 4.33–5.82 Million/uL.', '05/26 5.08'),
    row('n2-hgb', 'Hemoglobin', '17.7', 'g/dL', '13.7–17.7', 'normal', 'Upper limit', 'normal', 3,
      '<strong>Hemoglobin.</strong> 17.7 g/dL. 17.7 g/dL is exactly this laboratory’s upper limit and is inside 13.7–17.7. It is not an out-of-range flag. Track it on a future CBC. Scored 3. No separate optimal cutoff is applied.' + prior('05/26 17.3 g/dL, reference 13.7–17.7')),
    mid('n2-hct', 'Hematocrit', '51.2', '%', '42.5–55.0',
      '51.2% is inside this laboratory’s range 42.5–55.0. It is not an out-of-range flag. Track it on a future CBC.',
      '05/26 50.2%, reference 42.5–55.0'),
    mid('n2-mcv', 'MCV', '99.8', 'fL', '81.4–101.7',
      'Inside the printed range 81.4–101.7 fL.', '05/26 98.8 fL'),
    out('n2-mch', 'MCH', '34.5', 'pg', '27.0–33.0', 'hi', 'High', 'hi',
      'Laboratory flag: 34.5 pg is above the printed range 27.0–33.0. No urgent or critical result is apparent from this report alone. Discuss a repeat CBC with a clinician to confirm whether it persists. This is not a diagnosis and not a cause or treatment recommendation.' + prior('05/26 34.1 pg, reference 27.0–33.0')),
    mid('n2-mchc', 'MCHC', '34.6', 'g/dL', '31.6–35.4',
      'Inside the printed range 31.6–35.4 g/dL.', null),
    mid('n2-rdw', 'RDW', '13.1', '%', '11.0–15.0',
      'Inside the printed range 11.0–15.0%.', '05/26 14.1%'),
    mid('n2-plt', 'Platelet count', '214', 'Thousand/uL', '140–400',
      'Inside the printed range 140–400 Thousand/uL.', '05/26 218'),
    mid('n2-mpv', 'MPV', '11.0', 'fL', '7.5–12.5',
      'Inside the printed range 7.5–12.5 fL.', null),
    mid('n2-neut', 'Absolute neutrophils', '3075', 'cells/uL', '1500–7800',
      'Inside the printed range 1500–7800 cells/uL.', null),
    mid('n2-lymph', 'Absolute lymphocytes', '1315', 'cells/uL', '850–3900',
      'Inside the printed range 850–3900 cells/uL.', null),
    mid('n2-mono', 'Absolute monocytes', '430', 'cells/uL', '200–950',
      'Inside the printed range 200–950 cells/uL.', null),
    mid('n2-eos', 'Absolute eosinophils', '140', 'cells/uL', '15–500',
      'Inside the printed range 15–500 cells/uL.', null),
    mid('n2-baso', 'Absolute basophils', '40', 'cells/uL', '0–200',
      'Inside the printed range 0–200 cells/uL.', null)
  ];
  var hormones = [
    mid('n2-tt', 'Testosterone, total', '988', 'ng/dL', '250–1100',
      'Inside the printed range 250–1100 ng/dL. It sits toward the high end of that range. A high-normal result is not labeled optimal. No treatment status is assumed from this number.',
      '09/26 1364 ng/dL on a prior assay with reference 300–890'),
    mid('n2-ft', 'Testosterone, free', '206.7', 'pg/mL', '46.0–224.0',
      'Inside the printed range 46.0–224.0 pg/mL, near the top of that range. A high-normal result is not labeled optimal. No treatment status is assumed from this number.',
      '09/26 329.2 pg/mL on a prior assay with reference 47.0–244.0'),
    mid('n2-bio', 'Testosterone, bioavailable', '434.1', 'ng/dL', '110.0–575.0',
      'Inside the printed range 110.0–575.0 ng/dL. This report does not print a tighter optimal band, so the result is not labeled optimal.',
      '05/26 392.5 ng/dL, reference 110–575'),
    mid('n2-shbg', 'Sex hormone binding globulin', '23', 'nmol/L', '10–50',
      'Inside the printed range 10–50 nmol/L.', '09/26 29 nmol/L, reference 17–56'),
    mid('n2-psa', 'PSA, total', '2.03', 'ng/mL', '≤4.00',
      'Inside the printed limit of 4.00 ng/mL or below. The report says a PSA result should not be read as absolute evidence of the presence or absence of disease. No treatment status is assumed.',
      null)
  ];
  var thyroid = [
    mid('n2-rt3', 'T3, reverse', '14', 'ng/dL', '8–25',
      'Inside the printed range 8–25 ng/dL.', null),
    mid('n2-ft3', 'T3, free', '3.4', 'pg/mL', '2.3–4.2',
      'Inside the printed range 2.3–4.2 pg/mL.', '09/26 4.42 pg/mL on a prior assay with reference 2.77–5.27'),
    mid('n2-ft4', 'T4, free', '1.0', 'ng/dL', '0.8–1.8',
      'Inside the printed range 0.8–1.8 ng/dL.', '09/26 0.77 ng/dL on a prior assay with reference 0.59–2.19'),
    mid('n2-tsh', 'TSH', '1.81', 'mIU/L', '0.40–4.50',
      'Inside the printed range 0.40–4.50 mIU/L.', '05/26 3.78 mIU/L, reference 0.40–4.50')
  ];
  var unscored = [
    skip('n2-bunr', 'BUN / creatinine ratio', 'Not reported', '', '6–22',
      'The report says this ratio was not reported because BUN and creatinine are within the reference range. It is shown and not scored.'),
    skip('n2-alb2', 'Albumin (testosterone panel)', '4.6', 'g/dL', '3.6–5.1',
      '4.6 g/dL, reference 3.6–5.1. This is the same analyte as the metabolic-panel albumin of 4.5 g/dL. It is shown and not scored a second time.'),
    skip('n2-eag', 'eAG', '91', 'mg/dL', 'calculated from A1c',
      '91 mg/dL, calculated from hemoglobin A1c. Also reported as 5.0 mmol/L. Shown and not scored.'),
    skip('n2-npct', 'Neutrophils', '61.5', '%', 'no range printed',
      '61.5%. No reference range was printed for this percentage. Shown and not scored.'),
    skip('n2-lpct', 'Lymphocytes', '26.3', '%', 'no range printed',
      '26.3%. No reference range was printed for this percentage. Shown and not scored.'),
    skip('n2-mpct', 'Monocytes', '8.6', '%', 'no range printed',
      '8.6%. No reference range was printed for this percentage. Shown and not scored.'),
    skip('n2-epct', 'Eosinophils', '2.8', '%', 'no range printed',
      '2.8%. No reference range was printed for this percentage. Shown and not scored.'),
    skip('n2-bpct', 'Basophils', '0.8', '%', 'no range printed',
      '0.8%. No reference range was printed for this percentage. Shown and not scored.')
  ];
  var inflammation = [
    mid('n2-crp', 'hsCRP', '1.2', 'mg/L', 'optimal <1.0',
      'This report’s categories are optimal under 1.0, average 1.0–3.0, and higher above 3.0. 1.2 mg/L is the average relative cardiovascular-risk category. It is not evidence of an acute illness and not an overall cardiovascular-risk diagnosis.',
      null)
  ];
  var earlier = [
    row('hx-e2', 'Estradiol', '60.26', 'pg/mL', '5.37–65.90', 'normal', 'Earlier', 'normal', null,
      '<strong>Estradiol.</strong> Earlier displayed result 60.26 pg/mL, reference 5.37–65.90. The stored date list on this page was incomplete, so it is not repeated. Not part of the Nov 2026 score.'),
    row('hx-cort', 'Cortisol, morning', '11.8', 'mcg/dL', '4–22', 'normal', 'Earlier', 'normal', null,
      '<strong>Cortisol.</strong> Earlier stored values: 01/25 23.2; 05/26 11.8 mcg/dL, reference 4–22. Not part of the Nov 2026 score and not a trend.'),
    row('hx-dhea', 'DHEA-S', '253', 'mcg/dL', '61–442', 'normal', 'Earlier', 'normal', null,
      '<strong>DHEA-S.</strong> Earlier stored value: 01/25 253 mcg/dL, reference 61–442. Not part of the Nov 2026 score.'),
    row('hx-igf', 'IGF-1', '289', 'ng/mL', '74–227', 'normal', 'Earlier', 'normal', null,
      '<strong>IGF-1.</strong> Earlier stored values: 03/26 141; 09/26 289 ng/mL, reference 74–227. Not part of the Nov 2026 score and not a trend.'),
    row('hx-gh', 'Growth hormone, random', '<0.1', 'ng/mL', '≤7.1', 'normal', 'Earlier', 'normal', null,
      '<strong>Growth hormone.</strong> Earlier stored value: 01/25 less than 0.1 ng/mL, reference at or below 7.1. Not part of the Nov 2026 score.'),
    row('hx-d', 'Vitamin D, 25-OH', '69', 'ng/mL', '30–100', 'normal', 'Earlier', 'normal', null,
      '<strong>Vitamin D.</strong> Earlier stored value: 05/26 69 ng/mL, reference 30–100. Not part of the Nov 2026 score.'),
    row('hx-tgh', 'Triglyceride / HDL ratio', '1.0', '', '<2 on the prior page', 'normal', 'Earlier', 'normal', null,
      '<strong>Triglyceride / HDL ratio.</strong> Earlier stored value: 03/26 1.0. This ratio was not printed on the Nov 2026 report, so it is not recalculated or scored.')
  ];

  var groups = [
    ['Metabolic', metabolic],
    ['Lipids', lipids],
    ['Inflammation', inflammation],
    ['Kidney, electrolytes, and liver', kidney],
    ['Hematology', heme],
    ['Hormones', hormones],
    ['Thyroid', thyroid]
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
  secs.push({ t: 'Earlier results already on this page', rows: earlier });

  window.MP_LABS = {
    sub: 'Quest · collected 11/02/2026 08:49 · reported 11/05/2026 17:14 · fasting · no time zone printed',
    l: 'Custom wellness score',
    score: String(total.score),
    outof: '/100',
    g: 'Two laboratory flags',
    c: 'Informational only, not a diagnosis. No urgent or critical result is apparent from this report alone. The laboratory flags are alkaline phosphatase 30 U/L, below 36–130, and MCH 34.5 pg, above 27.0–33.0. Discuss a repeat ALP and CBC with a clinician to confirm whether those results persist. Hemoglobin is 17.7 g/dL, exactly this lab’s upper limit, and hematocrit is 51.2%, inside 42.5–55.0; track both on a future CBC. hsCRP 1.2 mg/L is this lab’s average relative cardiovascular-risk category (optimal under 1.0), not an acute illness and not an overall cardiovascular-risk diagnosis. PSA 2.03 ng/mL is within the printed limit of 4.00. Testosterone results are inside the ranges on this report. Fasting glucose 80 mg/dL and A1c 4.8% are favorable on the printed ranges. ApoB 63, LDL 67, triglycerides 40, and HDL 76 mg/dL are favorable on the printed ranges. Kidney results and thyroid results are inside their printed ranges. AST and ALT are inside their printed ranges.',
    domains: domains,
    bannerattr: '',
    banner: 'Custom wellness score, not a validated diagnosis. A marker scores 4 when it meets an optimal or desirable cutoff printed on this report, or an optimal cutoff already used on this page. It scores 3 when it is inside the laboratory range and that cutoff is not met or was not printed. It scores 1 when it is outside the laboratory range. This panel is 10 × 4 + 38 × 3 + 2 × 1 = 156 points. 156 ÷ 200 × 100 = 78. Fifty results are scored. Not scored: the unreported BUN/creatinine ratio, the second albumin, both calculated eAG values, and five differential percentages with no printed range. Tap a marker for the printed range.',
    secs: secs,
    note: 'Informational only, not a diagnosis or a treatment plan. An isolated low alkaline phosphatase is a recognized reason to repeat the test. Newcastle Hospitals low-ALP guidance, revision 4: <a href="https://laboratories.newcastle-hospitals.nhs.uk/wp-content/uploads/2024/10/Low-ALP-guidance-revision-4.pdf">laboratories.newcastle-hospitals.nhs.uk low-ALP guidance</a>. This page does not set a retest date.'
  };
  if (total.score !== 78 || total.n !== 50 || total.pts !== 156) {
    throw new Error('labs score mismatch ' + total.pts + ' ' + total.n + ' ' + total.score);
  }
})();
