/* Joe Labs, standard portal score-card data.
   9 of 25 markers are scored with the BioLinked 4/3/1 educational rubric.
   Sum 27 / 9 = 3; 3 / 4 * 100 = 75. Domain scores use the same flat formula
   on that domain's scored markers only. Laboratory intervals were not supplied. */
window.JOE_LABS = {
  sub: 'Review Nov 7, 2026 · collection date not provided · 25 markers · 9 scored',
  l: 'Overall Panel Score',
  score: '75',
  outof: '/100',
  g: 'Educational rubric · 9 of 25 scored',
  c: 'ApoB and total cholesterol are the strongest scored points; uric acid at the saturation line is the scored pull-down, while creatinine and estradiol stay unscored.',
  domains: [
    {v: '75', n: 'Hormones · 1/5'},
    {v: '75', n: 'Liver / Kidney / Thyroid · 1/6'},
    {v: '75', n: 'Metabolic + Lipids · 6/12'},
    {v: '75', n: 'Iron + Vitamins · 1/2'}
  ],
  bannerattr: '',
  banner: 'Each marker scores 4 if optimal, 3 if in-range (within the lab reference range but not optimal), 1 if out-of-range. Average the scores flat across all markers, then scale to /100 (average ÷ 4 × 100, rounded). Lab intervals were not on the screenshots, so 16 markers stay unscored. This is a BioLinked educational rubric, not a validated health or heart-risk score.',
  secs: [
    {t: 'Hormone Panel · 75/100 · 1 of 5 scored', rows: [
      {id: 'jd-tt', n: 'Total testosterone', vc: 'normal', v: '868', u: 'ng/dL', ref: 'Not provided', pc: 'normal', p: 'In-range', tip: '<strong>Total testosterone.</strong> 868 ng/dL is not low next to published adult male deficiency thresholds. It is not proof of optimal therapy, and timing was not shown, so it is scored in-range rather than optimal.'},
      {id: 'jd-ft', n: 'Free testosterone', vc: 'normal', v: '198.93', u: 'pg/mL', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>Free testosterone.</strong> 198.93 pg/mL. The assay method and collection time were not shown, so this is not graded and not scored.'},
      {id: 'jd-shbg', n: 'SHBG', vc: 'normal', v: '33.6', u: 'nmol/L', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>SHBG.</strong> 33.6 nmol/L. The laboratory interval was not provided, so this binding-protein result is not scored.'},
      {id: 'jd-e2', n: 'Estradiol', vc: 'normal', v: '44.6', u: 'pg/mL', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>Estradiol.</strong> 44.6 pg/mL. The source app marked it out of range, but the assay was not shown, so that badge is not used as a score. A clinician should review symptoms, timing, and method. No medication or peptide change from this number.'},
      {id: 'jd-cort', n: 'Cortisol', vc: 'normal', v: '13.2', u: 'ug/dL', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>Cortisol.</strong> 13.2 ug/dL. No collection time was shown, so this is not graded and not scored. The source-app optimal badge is only the app’s label.'}
    ]},
    {t: 'Liver / Kidney / Thyroid · 75/100 · 1 of 6 scored', rows: [
      {id: 'jd-tsh', n: 'TSH', vc: 'normal', v: '1.27', u: 'uIU/mL', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>TSH.</strong> 1.27 uIU/mL. The laboratory interval was not provided, so the source-app optimal badge is not used as a score.'},
      {id: 'jd-cr', n: 'Creatinine', vc: 'normal', v: '1.24', u: 'mg/dL', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>Creatinine.</strong> 1.24 mg/dL. The source app marked it out of range. The laboratory interval was not provided, so it is not scored as a verified flag. Repeat it with eGFR and a urine ACR.'},
      {id: 'jd-egfr', n: 'eGFR', vc: 'normal', v: '69.52', u: 'mL/min/1.73m2', ref: 'Not provided', pc: 'normal', p: 'In-range', tip: '<strong>eGFR.</strong> 69.52 is KDIGO category G2, mildly decreased (60–89). G2 without kidney damage is not CKD. It is not the normal-or-high G1 band, so it is scored in-range rather than optimal.'},
      {id: 'jd-alp', n: 'ALP', vc: 'normal', v: '42.4', u: 'U/L', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>ALP.</strong> 42.4 U/L. The laboratory interval was not provided, and AST and ALT were not shown, so this is not scored.'},
      {id: 'jd-ggt', n: 'GGT', vc: 'normal', v: '24.9', u: 'U/L', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>GGT.</strong> 24.9 U/L. The laboratory interval was not provided, so the source-app optimal badge is not used as a score.'},
      {id: 'jd-alb', n: 'Albumin', vc: 'normal', v: '4.36', u: 'g/dL', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>Albumin.</strong> 4.36 g/dL. The source-app flag was not readable and the laboratory interval was not provided, so this is not scored.'}
    ]},
    {t: 'Metabolic + Lipids · 75/100 · 6 of 12 scored', rows: [
      {id: 'jd-apob', n: 'ApoB', vc: 'ok', v: '61.9', u: 'mg/dL', ref: 'Not provided', pc: 'ok', p: 'Optimal', tip: '<strong>ApoB.</strong> 61.9 mg/dL is below the 2019 ESC/EAS secondary goals of 65, 80, and 100 mg/dL. Risk category was not supplied, so this is not a heart-risk calculation.'},
      {id: 'jd-ldl', n: 'LDL', vc: 'normal', v: '70.2', u: 'mg/dL', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>LDL.</strong> 70.2 mg/dL looks relatively low, but a personal goal depends on overall risk, which was not supplied, so it is not scored. The assay method was not shown.'},
      {id: 'jd-hdl', n: 'HDL', vc: 'normal', v: '47.0', u: 'mg/dL', ref: 'Not provided', pc: 'normal', p: 'In-range', tip: '<strong>HDL.</strong> 47.0 mg/dL is above the traditional low line for men, below 40 mg/dL. It is not scored as optimal, and this is not the laboratory’s interval.'},
      {id: 'jd-tc', n: 'Total cholesterol', vc: 'ok', v: '145', u: 'mg/dL', ref: 'Not provided', pc: 'ok', p: 'Optimal', tip: '<strong>Total cholesterol.</strong> 145 mg/dL is in the published desirable band under 200 mg/dL. This is not the laboratory’s interval, and it does not calculate overall risk.'},
      {id: 'jd-tg', n: 'Triglycerides', vc: 'normal', v: '139', u: 'mg/dL', ref: 'Not provided', pc: 'normal', p: 'In-range', tip: '<strong>Triglycerides.</strong> 139 mg/dL is under the published 150 mg/dL line associated with lower risk. Fasting was not shown, and there is no treatment goal, so this is scored in-range rather than optimal.'},
      {id: 'jd-rem', n: 'Remnant cholesterol', vc: 'normal', v: '27.79', u: 'mg/dL', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>Remnant cholesterol.</strong> 27.79 mg/dL matches 145 − 47 − 70.2 = 27.8, so it is consistent with calculation. The method was not shown. With these numbers it also matches triglycerides/5, so it is not scored as a separate result.'},
      {id: 'jd-tghdl', n: 'Triglyceride / HDL ratio', vc: 'normal', v: '2.95', u: 'ratio', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>Triglyceride / HDL ratio.</strong> This is a ratio, not a percent. 139/47 rounds to 2.96; the source shows 2.95, approximately consistent. It is not scored.'},
      {id: 'jd-tchdl', n: 'Total cholesterol / HDL ratio', vc: 'normal', v: '3.08', u: 'ratio', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>Total cholesterol / HDL ratio.</strong> This is a ratio, not a percent. 145/47 rounds to 3.09; the source shows 3.08, approximately consistent. It is not scored.'},
      {id: 'jd-ldlapob', n: 'LDL / ApoB ratio', vc: 'normal', v: '1.13', u: 'ratio', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>LDL / ApoB ratio.</strong> 1.13 matches 70.2/61.9. It is not a particle-size test and not a treatment target, so it is not scored.'},
      {id: 'jd-crp', n: 'hsCRP', vc: 'normal', v: '1.21', u: 'mg/L', ref: 'Not provided', pc: 'normal', p: 'In-range', tip: '<strong>hsCRP.</strong> 1.21 mg/L sits in the CDC/AHA average band of about 1 to 3 mg/L, not under 1 and not above 3. One value is not an infection diagnosis.'},
      {id: 'jd-ua', n: 'Uric acid', vc: 'hi', v: '6.87', u: 'mg/dL', ref: 'Not provided', pc: 'hi', p: 'Out-of-range High', tip: '<strong>Uric acid.</strong> 6.87 mg/dL is at the about 6.8 mg/dL saturation point used to define hyperuricemia. That is not a gout diagnosis. Scored out of range high on that published line, not on a laboratory interval.'},
      {id: 'jd-fru', n: 'Fructosamine', vc: 'normal', v: '230', u: 'umol/L', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>Fructosamine.</strong> 230 umol/L reflects roughly the prior 2–3 weeks. The laboratory interval was not provided, and it does not replace fasting glucose or A1c, so it is not scored.'}
    ]},
    {t: 'Iron + Vitamins · 75/100 · 1 of 2 scored', rows: [
      {id: 'jd-vd', n: 'Vitamin D', vc: 'normal', v: '47.0', u: 'ng/mL', ref: 'Not provided', pc: 'normal', p: 'In-range', tip: '<strong>Vitamin D.</strong> 47.0 ng/mL is above the NIH adequacy line of 20 ng/mL and below the above-50 caution zone. An optimal level is not established, so this is scored in-range, not optimal.'},
      {id: 'jd-fer', n: 'Ferritin', vc: 'normal', v: '180', u: 'ng/mL', ref: 'Not provided', pc: 'normal', p: 'Unscored', tip: '<strong>Ferritin.</strong> 180 ng/mL does not look like a low iron store and is not, by itself, an iron-overload diagnosis. The laboratory interval was not provided, so it is not scored.'}
    ]}
  ],
  note: 'Follow-ups: repeat creatinine and eGFR and add a urine ACR — this screenshot is not a CKD label. Have a clinician review estradiol 44.6 pg/mL with symptoms, timing, and the assay. The original report, with the collection date, fasting status, reference intervals, and assay names, is what would let the unscored rows be classified. Do not change a medication or peptide from this panel.'
};
