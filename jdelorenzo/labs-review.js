/* Provisional source-app rating score.
   8 optimal × 4 = 32, 11 average × 3 = 33, 5 out of range × 1 = 5.
   70 points / 24 markers. 70 ÷ 96 × 100 = 72.9167, rounded 73.
   Albumin is shown and unscored. Domain scores use the same flat formula. */
window.JOE_LABS = {
  sub: 'Review Nov 7, 2026 · collection date not provided · source-app rating · 24 of 25 scored',
  l: 'Source-app rating score',
  score: '73',
  outof: '/100',
  g: 'Provisional · Kidney and Hormone Follow-up',
  c: 'Source-app ratings are strongest for ApoB, ferritin, and the testosterone group; creatinine and estradiol are the follow-ups. This tally is not a clinical health or risk score.',
  domains: [
    {v: '80', n: 'Hormones · 5/5'},
    {v: '75', n: 'Liver / Kidney / Thyroid · 5/6'},
    {v: '67', n: 'Metabolic + Lipids · 12/12'},
    {v: '88', n: 'Iron + Vitamins · 2/2'}
  ],
  bannerattr: '',
  banner: 'Each marker scores 4 if optimal, 3 if in-range (within the lab reference range but not optimal), 1 if out-of-range. Average the scores flat across all markers, then scale to /100 (average ÷ 4 × 100, rounded). This 73 is a provisional source-app tally for 24 of 25 (Optimal 4, Average 3, Out of range 1; 70 ÷ 96 × 100 = 73). Average is the app’s middle badge, not a verified laboratory in-range result. Reference intervals were not shown, so this is not a completed lab-reference ranking.',
  secs: [
    {t: 'Hormone Panel · 80/100 · 5 of 5 scored', rows: [
      {id: 'jd-e2', n: 'Estradiol', vc: 'normal', v: '44.6', u: 'pg/mL', ref: 'Not shown in supplied screenshots', pc: 'oor', p: 'Out-of-range', pts: 1, app: 'out', tip: '<strong>Estradiol.</strong> 44.6 pg/mL. The source app marked this out of range. That badge does not show whether it is high or low, because no laboratory limit was on the screenshot. Worth a clinician’s look with symptoms, timing, and the assay. No medication or peptide change from this number.'},
      {id: 'jd-ft', n: 'Free testosterone', vc: 'normal', v: '198.93', u: 'pg/mL', ref: 'Not shown in supplied screenshots', pc: 'normal', p: 'Average', pts: 3, app: 'average', tip: '<strong>Free testosterone.</strong> 198.93 pg/mL. The source app marked this average, scored 3 on that provisional badge. The assay and collection time were not shown, so this is not a verified laboratory in-range result.'},
      {id: 'jd-cort', n: 'Cortisol', vc: 'ok', v: '13.2', u: 'ug/dL', ref: 'Not shown in supplied screenshots', pc: 'ok', p: 'Optimal', pts: 4, app: 'optimal', tip: '<strong>Cortisol.</strong> 13.2 ug/dL. The source app marked this optimal, scored 4 on that provisional badge. No collection time was shown, so the badge is not a verified time-of-day reading.'},
      {id: 'jd-shbg', n: 'SHBG', vc: 'ok', v: '33.6', u: 'nmol/L', ref: 'Not shown in supplied screenshots', pc: 'ok', p: 'Optimal', pts: 4, app: 'optimal', tip: '<strong>SHBG.</strong> 33.6 nmol/L. The source app marked this optimal, scored 4 on that provisional badge. The laboratory interval was not shown.'},
      {id: 'jd-tt', n: 'Total testosterone', vc: 'ok', v: '868', u: 'ng/dL', ref: 'Not shown in supplied screenshots', pc: 'ok', p: 'Optimal', pts: 4, app: 'optimal', tip: '<strong>Total testosterone.</strong> 868 ng/dL. The source app marked this optimal, scored 4 on that provisional badge. Timing was not shown, and the badge is not proof of optimal therapy.'}
    ]},
    {t: 'Liver / Kidney / Thyroid · 75/100 · 5 of 6 scored', rows: [
      {id: 'jd-tsh', n: 'TSH', vc: 'ok', v: '1.27', u: 'uIU/mL', ref: 'Not shown in supplied screenshots', pc: 'ok', p: 'Optimal', pts: 4, app: 'optimal', tip: '<strong>TSH.</strong> 1.27 uIU/mL. The source app marked this optimal, scored 4 on that provisional badge. The laboratory interval was not shown.'},
      {id: 'jd-cr', n: 'Creatinine', vc: 'normal', v: '1.24', u: 'mg/dL', ref: 'Not shown in supplied screenshots', pc: 'oor', p: 'Out-of-range', pts: 1, app: 'out', tip: '<strong>Creatinine.</strong> 1.24 mg/dL. The source app marked this out of range, scored 1. The badge does not show high versus low, because no laboratory limit was on the screenshot. Read it with the eGFR of 69.52.'},
      {id: 'jd-alp', n: 'ALP', vc: 'normal', v: '42.4', u: 'U/L', ref: 'Not shown in supplied screenshots', pc: 'normal', p: 'Average', pts: 3, app: 'average', tip: '<strong>ALP.</strong> 42.4 U/L. The source app marked this average, scored 3 on that provisional badge, not as a verified laboratory in-range result.'},
      {id: 'jd-egfr', n: 'eGFR', vc: 'normal', v: '69.52', u: 'mL/min/1.73m2', ref: 'Not shown in supplied screenshots', pc: 'normal', p: 'Average', pts: 3, app: 'average', tip: '<strong>eGFR.</strong> 69.52. The source app marked this average, scored 3 on that provisional badge. Read it with creatinine. This screenshot alone is not a kidney diagnosis.'},
      {id: 'jd-ggt', n: 'GGT', vc: 'ok', v: '24.9', u: 'U/L', ref: 'Not shown in supplied screenshots', pc: 'ok', p: 'Optimal', pts: 4, app: 'optimal', tip: '<strong>GGT.</strong> 24.9 U/L. The source app marked this optimal, scored 4 on that provisional badge. The laboratory interval was not shown.'},
      {id: 'jd-alb', n: 'Albumin', vc: 'normal', v: '4.36', u: 'g/dL', ref: 'Not shown in supplied screenshots', pc: 'normal', p: 'Unscored', pts: null, app: 'cropped', tip: '<strong>Albumin.</strong> 4.36 g/dL. The source-app badge was cropped, so this marker is shown and left unscored.'}
    ]},
    {t: 'Metabolic + Lipids · 67/100 · 12 of 12 scored', rows: [
      {id: 'jd-tghdl', n: 'Triglyceride / HDL ratio', vc: 'normal', v: '2.95', u: 'ratio', ref: 'Not shown in supplied screenshots', pc: 'oor', p: 'Out-of-range', pts: 1, app: 'out', tip: '<strong>Triglyceride / HDL ratio.</strong> 2.95. The source app marked this out of range and labeled it pct; it is a ratio, not a percent. 139/47 rounds to 2.96, approximately consistent with 2.95. Scored 1 from the app badge only.'},
      {id: 'jd-ua', n: 'Uric acid', vc: 'normal', v: '6.87', u: 'mg/dL', ref: 'Not shown in supplied screenshots', pc: 'normal', p: 'Average', pts: 3, app: 'average', tip: '<strong>Uric acid.</strong> 6.87 mg/dL. The source app marked this average, scored 3 on that provisional badge, not as a verified laboratory in-range result.'},
      {id: 'jd-tg', n: 'Triglycerides', vc: 'normal', v: '139', u: 'mg/dL', ref: 'Not shown in supplied screenshots', pc: 'normal', p: 'Average', pts: 3, app: 'average', tip: '<strong>Triglycerides.</strong> 139 mg/dL. The source app marked this average, scored 3 on that provisional badge. Fasting was not shown.'},
      {id: 'jd-fru', n: 'Fructosamine', vc: 'ok', v: '230', u: 'umol/L', ref: 'Not shown in supplied screenshots', pc: 'ok', p: 'Optimal', pts: 4, app: 'optimal', tip: '<strong>Fructosamine.</strong> 230 umol/L. The source app marked this optimal, scored 4 on that provisional badge. The laboratory interval was not shown.'},
      {id: 'jd-ldlapob', n: 'LDL / ApoB ratio', vc: 'normal', v: '1.13', u: 'ratio', ref: 'Not shown in supplied screenshots', pc: 'oor', p: 'Out-of-range', pts: 1, app: 'out', tip: '<strong>LDL / ApoB ratio.</strong> 1.13 matches 70.2/61.9. The source app marked it out of range. That flag is not a validated particle-size diagnosis or a treatment target. Scored 1 only as the app badge.'},
      {id: 'jd-rem', n: 'Remnant cholesterol', vc: 'normal', v: '27.79', u: 'mg/dL', ref: 'Not shown in supplied screenshots', pc: 'oor', p: 'Out-of-range', pts: 1, app: 'out', tip: '<strong>Remnant cholesterol.</strong> 27.79 mg/dL matches 145 − 47 − 70.2 = 27.8, so it is consistent with calculation, and with these numbers it also matches triglycerides/5. The source app marked it out of range. Method was not shown. Scored 1 from the app badge only.'},
      {id: 'jd-hdl', n: 'HDL', vc: 'normal', v: '47.0', u: 'mg/dL', ref: 'Not shown in supplied screenshots', pc: 'normal', p: 'Average', pts: 3, app: 'average', tip: '<strong>HDL.</strong> 47.0 mg/dL. The source app marked this average, scored 3 on that provisional badge, not as a verified laboratory in-range result.'},
      {id: 'jd-tc', n: 'Total cholesterol', vc: 'normal', v: '145', u: 'mg/dL', ref: 'Not shown in supplied screenshots', pc: 'normal', p: 'Average', pts: 3, app: 'average', tip: '<strong>Total cholesterol.</strong> 145 mg/dL. The source app marked this average, scored 3 on that provisional badge, not as a verified laboratory in-range result.'},
      {id: 'jd-crp', n: 'hsCRP', vc: 'normal', v: '1.21', u: 'mg/L', ref: 'Not shown in supplied screenshots', pc: 'normal', p: 'Average', pts: 3, app: 'average', tip: '<strong>hsCRP.</strong> 1.21 mg/L. The source app marked this average, scored 3 on that provisional badge, not as a verified laboratory in-range result.'},
      {id: 'jd-ldl', n: 'LDL', vc: 'normal', v: '70.2', u: 'mg/dL', ref: 'Not shown in supplied screenshots', pc: 'normal', p: 'Average', pts: 3, app: 'average', tip: '<strong>LDL.</strong> 70.2 mg/dL. The source app marked this average, scored 3 on that provisional badge, not as a verified laboratory in-range result.'},
      {id: 'jd-tchdl', n: 'Total cholesterol / HDL ratio', vc: 'normal', v: '3.08', u: 'ratio', ref: 'Not shown in supplied screenshots', pc: 'normal', p: 'Average', pts: 3, app: 'average', tip: '<strong>Total cholesterol / HDL ratio.</strong> 3.08. This is a ratio, not a percent. 145/47 rounds to 3.09, approximately consistent with 3.08. The source app marked it average, scored 3 on that provisional badge.'},
      {id: 'jd-apob', n: 'ApoB', vc: 'ok', v: '61.9', u: 'mg/dL', ref: 'Not shown in supplied screenshots', pc: 'ok', p: 'Optimal', pts: 4, app: 'optimal', tip: '<strong>ApoB.</strong> 61.9 mg/dL. The source app marked this optimal, scored 4 on that provisional badge. The laboratory interval was not shown, and the badge is not a heart-risk calculation.'}
    ]},
    {t: 'Iron + Vitamins · 88/100 · 2 of 2 scored', rows: [
      {id: 'jd-vd', n: 'Vitamin D', vc: 'normal', v: '47.0', u: 'ng/mL', ref: 'Not shown in supplied screenshots', pc: 'normal', p: 'Average', pts: 3, app: 'average', tip: '<strong>Vitamin D.</strong> 47.0 ng/mL. The source app marked this average, scored 3 on that provisional badge, not as a verified laboratory in-range result.'},
      {id: 'jd-fer', n: 'Ferritin', vc: 'ok', v: '180', u: 'ng/mL', ref: 'Not shown in supplied screenshots', pc: 'ok', p: 'Optimal', pts: 4, app: 'optimal', tip: '<strong>Ferritin.</strong> 180 ng/mL. The source app marked this optimal, scored 4 on that provisional badge. The laboratory interval was not shown.'}
    ]}
  ],
  note: 'Kidney and hormone follow-up: the source app flagged creatinine 1.24, beside eGFR 69.52, and estradiol 44.6. No medication or peptide change from this panel.'
};
