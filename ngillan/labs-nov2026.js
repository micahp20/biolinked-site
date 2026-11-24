/* Nic Gillan Function Health panel, collected Nov 12, 2026.
   Custom wellness score, not a diagnosis.
   4 if optimal (this report in range, and inside a BioLinked functional
   window when one is already documented on scored pages), 3 if in this
   report’s range but short of a documented BioLinked optimal window,
   1 if this report marked the marker above or below range.
   Numeric laboratory limits were not printed on the Function Health Data
   export, so in-range vs out-of-range follows that report’s own flags.
   84 × 4 + 1 × 3 + 12 × 1 = 351. 351 / (97 × 4) × 100 = 90.46, rounded to 90.
   Not scored: ABO group, Rh factor, routine urinalysis, and duplicate
   listings of the same result (hs-CRP, electrolytes, DHEA sulfate,
   calcium, magnesium, Omega-3 total). */
(function () {
  function row(id, name, value, unit, ref, pc, pill, vc, pts, tip) {
    return { id: id, n: name, v: value, u: unit, ref: ref, pc: pc, p: pill, vc: vc, pts: pts, plain: true, tip: tip };
  }

  var secs = [
    {t: 'Autoimmunity · 100/100 · 2 of 2 scored', rows: [
    row('ng-ana', 'ANA screen', 'Negative', '', 'In range · Negative', 'ok', 'Optimal', 'ok', 4,
      '<strong>ANA screen.</strong> Negative. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-rf', 'Rheumatoid factor', '<10', 'IU/mL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Rheumatoid factor.</strong> <10 IU/mL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.')
    ]},
    {t: 'Blood · 75/100 · 9 of 9 scored', rows: [
    row('ng-hct', 'Hematocrit', '52.1', '%', 'Flagged out of range on this report', 'high', 'Above range', 'oor', 1,
      '<strong>Hematocrit.</strong> 52.1 %. This Function Health report marked this above range. Numeric laboratory limits were not printed on the Data export. Scored 1.'),
    row('ng-hgb', 'Hemoglobin', '17.5', 'g/dL', 'Flagged out of range on this report', 'high', 'Above range', 'oor', 1,
      '<strong>Hemoglobin.</strong> 17.5 g/dL. This Function Health report marked this above range. Numeric laboratory limits were not printed on the Data export. Scored 1.'),
    row('ng-mch', 'MCH', '33.1', 'pg', 'Flagged out of range on this report', 'high', 'Above range', 'oor', 1,
      '<strong>MCH.</strong> 33.1 pg. This Function Health report marked this above range. Numeric laboratory limits were not printed on the Data export. Scored 1.'),
    row('ng-mchc', 'MCHC', '33.6', 'g/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>MCHC.</strong> 33.6 g/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-mcv', 'MCV', '98.5', 'fL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>MCV.</strong> 98.5 fL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-mpv', 'MPV', '9.7', 'fL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>MPV.</strong> 9.7 fL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-plt', 'Platelet count', '286', 'Thousand/uL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Platelet count.</strong> 286 Thousand/uL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-rbc', 'Red blood cell count', '5.29', 'Million/uL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Red blood cell count.</strong> 5.29 Million/uL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-rdw', 'RDW', '12.9', '%', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>RDW.</strong> 12.9 %. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.')
    ]},
    {t: 'Electrolytes · 100/100 · 6 of 6 scored', rows: [
    row('ng-ca', 'Calcium', '9.4', 'mg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Calcium.</strong> 9.4 mg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-co2', 'Carbon dioxide', '24', 'mmol/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Carbon dioxide.</strong> 24 mmol/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-cl', 'Chloride', '102', 'mmol/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Chloride.</strong> 102 mmol/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-mgrbc', 'Magnesium, RBC', '5.0', 'mg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Magnesium, RBC.</strong> 5.0 mg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-k', 'Potassium', '4.5', 'mmol/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Potassium.</strong> 4.5 mmol/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-na', 'Sodium', '136', 'mmol/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Sodium.</strong> 136 mmol/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.')
    ]},
    {t: 'Environmental toxins · 100/100 · 2 of 2 scored', rows: [
    row('ng-pb', 'Lead', '1.1', 'mcg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Lead.</strong> 1.1 mcg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-hg', 'Mercury', '8', 'mcg/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Mercury.</strong> 8 mcg/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.')
    ]},
    {t: 'Heart / lipids · 58/100 · 15 of 15 scored', rows: [
    row('ng-apob', 'Apolipoprotein B', '97', 'mg/dL', 'Flagged out of range on this report', 'high', 'Above range', 'oor', 1,
      '<strong>Apolipoprotein B.</strong> 97 mg/dL. This Function Health report marked this above range. Numeric laboratory limits were not printed on the Data export. BioLinked scored pages already treat under 90 mg/dL as the optimal cutoff, so 97 also sits above that documented window. Scored 1.'),
    row('ng-hdll', 'HDL large', '6476', 'nmol/L', 'Flagged out of range on this report', 'low', 'Below range', 'oor', 1,
      '<strong>HDL large.</strong> 6476 nmol/L. This Function Health report marked this below range. Numeric laboratory limits were not printed on the Data export. Scored 1.'),
    row('ng-ldlm', 'LDL medium', '369', 'nmol/L', 'Flagged out of range on this report', 'high', 'Above range', 'oor', 1,
      '<strong>LDL medium.</strong> 369 nmol/L. This Function Health report marked this above range. Numeric laboratory limits were not printed on the Data export. Scored 1.'),
    row('ng-ldlp', 'LDL particle number', '1790', 'nmol/L', 'Flagged out of range on this report', 'high', 'Above range', 'oor', 1,
      '<strong>LDL particle number.</strong> 1790 nmol/L. This Function Health report marked this above range. Numeric laboratory limits were not printed on the Data export. Scored 1.'),
    row('ng-ldlpk', 'LDL peak size', '218.1', 'Angstrom', 'Flagged out of range on this report', 'low', 'Below range', 'oor', 1,
      '<strong>LDL peak size.</strong> 218.1 Angstrom. This Function Health report marked this below range. Numeric laboratory limits were not printed on the Data export. Scored 1.'),
    row('ng-ldls', 'LDL small', '304', 'nmol/L', 'Flagged out of range on this report', 'high', 'Above range', 'oor', 1,
      '<strong>LDL small.</strong> 304 nmol/L. This Function Health report marked this above range. Numeric laboratory limits were not printed on the Data export. Scored 1.'),
    row('ng-ldlc', 'LDL-cholesterol', '105', 'mg/dL', 'Flagged out of range on this report', 'high', 'Above range', 'oor', 1,
      '<strong>LDL-cholesterol.</strong> 105 mg/dL. This Function Health report marked this above range. Numeric laboratory limits were not printed on the Data export. BioLinked scored pages already treat under 100 mg/dL as both the printed reference and the optimal window. Scored 1.'),
    row('ng-lpa', 'Lipoprotein (a)', '208', 'nmol/L', 'Flagged out of range on this report', 'high', 'Above range', 'oor', 1,
      '<strong>Lipoprotein (a).</strong> 208 nmol/L. This Function Health report marked this above range. Numeric laboratory limits were not printed on the Data export. Scored 1.'),
    row('ng-hdl', 'HDL-cholesterol', '58', 'mg/dL', 'In range on this report', 'normal', 'In range', 'normal', 3,
      '<strong>HDL-cholesterol.</strong> 58 mg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. BioLinked scored pages already use above 60 mg/dL as the optimal band, with a common laboratory floor of at least 40. 58 is inside this report’s range but short of that optimal band. Scored 3.'),
    row('ng-hscrp', 'hs-CRP', '0.8', 'mg/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>hs-CRP.</strong> 0.8 mg/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. BioLinked scored pages already treat under 1.0 mg/L as the optimal window. 0.8 meets that. Scored 4.'),
    row('ng-ldlpat', 'LDL pattern', 'A', '', 'In range · A', 'ok', 'Optimal', 'ok', 4,
      '<strong>LDL pattern.</strong> A. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-nonhdl', 'Non-HDL cholesterol', '119', 'mg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Non-HDL cholesterol.</strong> 119 mg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. BioLinked scored pages already treat under 130 mg/dL as the printed reference and optimal window. 119 meets that. Scored 4.'),
    row('ng-tc', 'Total cholesterol', '177', 'mg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Total cholesterol.</strong> 177 mg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. BioLinked scored pages already treat under 200 mg/dL as optimal. 177 meets that. Scored 4.'),
    row('ng-tcratio', 'Total cholesterol / HDL ratio', '3.1', '', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Total cholesterol / HDL ratio.</strong> 3.1. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. BioLinked scored pages already use under 3.5 as the optimal band (printed laboratory limit often under 5.0). 3.1 meets that. Scored 4.'),
    row('ng-tg', 'Triglycerides', '56', 'mg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Triglycerides.</strong> 56 mg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. BioLinked scored pages already treat under 150 mg/dL as optimal. 56 meets that. Scored 4.')
    ]},
    {t: 'Immune regulation · 100/100 · 11 of 11 scored', rows: [
    row('ng-baso', 'Basophils', '29', 'cells/uL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Basophils.</strong> 29 cells/uL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-eos', 'Eosinophils', '51', 'cells/uL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Eosinophils.</strong> 51 cells/uL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-lymph', 'Lymphocytes', '1351', 'cells/uL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Lymphocytes.</strong> 1351 cells/uL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-mono', 'Monocytes', '382', 'cells/uL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Monocytes.</strong> 382 cells/uL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-neut', 'Neutrophils', '3887', 'cells/uL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Neutrophils.</strong> 3887 cells/uL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-wbc', 'White blood cell count', '5.7', 'Thousand/uL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>White blood cell count.</strong> 5.7 Thousand/uL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-basop', 'Basophils %', '0.5', '%', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Basophils %.</strong> 0.5 %. No in-range flag was printed beside the percentage. BioLinked scored pages already use a 0–3% window for this marker; 0.5 sits inside it. Scored 4.'),
    row('ng-eosp', 'Eosinophils %', '0.9', '%', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Eosinophils %.</strong> 0.9 %. No in-range flag was printed beside the percentage. BioLinked scored pages already use a 0–7% window; 0.9 sits inside it. Scored 4.'),
    row('ng-lymphp', 'Lymphocytes %', '23.7', '%', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Lymphocytes %.</strong> 23.7 %. No in-range flag was printed beside the percentage. BioLinked scored pages already use a 14–46% window; 23.7 sits inside it. Scored 4.'),
    row('ng-monop', 'Monocytes %', '6.7', '%', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Monocytes %.</strong> 6.7 %. No in-range flag was printed beside the percentage. BioLinked scored pages already use a 4–12% window; 6.7 sits inside it. Scored 4.'),
    row('ng-neutp', 'Neutrophils %', '68.2', '%', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Neutrophils %.</strong> 68.2 %. No in-range flag was printed beside the percentage. BioLinked scored pages already use a 40–74% window; 68.2 sits inside it. Scored 4.')
    ]},
    {t: 'Kidney · 100/100 · 3 of 3 scored', rows: [
    row('ng-bun', 'Blood urea nitrogen', '19', 'mg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Blood urea nitrogen.</strong> 19 mg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-cr', 'Creatinine', '1.17', 'mg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Creatinine.</strong> 1.17 mg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-egfr', 'eGFR', '79', 'mL/min/1.73m2', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>eGFR.</strong> 79 mL/min/1.73m2. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.')
    ]},
    {t: 'Liver · 100/100 · 9 of 9 scored', rows: [
    row('ng-alt', 'ALT', '26', 'U/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>ALT.</strong> 26 U/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-alb', 'Albumin', '4.7', 'g/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Albumin.</strong> 4.7 g/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-ag', 'Albumin / globulin ratio', '2.0', '', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Albumin / globulin ratio.</strong> 2.0. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-alp', 'Alkaline phosphatase', '76', 'U/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Alkaline phosphatase.</strong> 76 U/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-ast', 'AST', '19', 'U/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>AST.</strong> 19 U/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-ggt', 'GGT', '20', 'U/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>GGT.</strong> 20 U/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-glob', 'Globulin', '2.3', 'g/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Globulin.</strong> 2.3 g/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-tbili', 'Total bilirubin', '0.7', 'mg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Total bilirubin.</strong> 0.7 mg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-tp', 'Total protein', '7.0', 'g/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Total protein.</strong> 7.0 g/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.')
    ]},
    {t: 'Male health · 100/100 · 11 of 11 scored', rows: [
    row('ng-psaf', 'PSA, free', '0.2', 'ng/mL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>PSA, free.</strong> 0.2 ng/mL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-dhea', 'DHEA sulfate', '123', 'mcg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>DHEA sulfate.</strong> 123 mcg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-e2', 'Estradiol', '<30', 'pg/mL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Estradiol.</strong> <30 pg/mL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-fsh', 'FSH', '4.5', 'mIU/mL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>FSH.</strong> 4.5 mIU/mL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-lh', 'LH', '2.5', 'mIU/mL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>LH.</strong> 2.5 mIU/mL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-prl', 'Prolactin', '5.8', 'ng/mL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Prolactin.</strong> 5.8 ng/mL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-psapct', 'PSA %, free', '33', '%', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>PSA %, free.</strong> 33 %. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-psat', 'PSA, total', '0.6', 'ng/mL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>PSA, total.</strong> 0.6 ng/mL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-shbg', 'SHBG', '40', 'nmol/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>SHBG.</strong> 40 nmol/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-ft', 'Testosterone, free', '96.2', 'pg/mL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Testosterone, free.</strong> 96.2 pg/mL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-tt', 'Testosterone, total', '658', 'ng/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Testosterone, total.</strong> 658 ng/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.')
    ]},
    {t: 'Metabolic · 100/100 · 5 of 5 scored', rows: [
    row('ng-glu', 'Glucose', '82', 'mg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Glucose.</strong> 82 mg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. BioLinked scored pages already treat a fasting result inside 65–99 mg/dL, and below 100, as optimal. 82 meets that. Scored 4.'),
    row('ng-a1c', 'Hemoglobin A1c', '5.1', '%', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Hemoglobin A1c.</strong> 5.1 %. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. BioLinked scored pages already treat a result under 5.7% as optimal. 5.1 meets that. Scored 4.'),
    row('ng-ins', 'Insulin', '7.8', 'uIU/mL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Insulin.</strong> 7.8 uIU/mL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-lep', 'Leptin', '1.8', 'ng/mL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Leptin.</strong> 1.8 ng/mL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-ua', 'Uric acid', '5.2', 'mg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Uric acid.</strong> 5.2 mg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.')
    ]},
    {t: 'Nutrients · 100/100 · 16 of 16 scored', rows: [
    row('ng-aaepa', 'Arachidonic acid / EPA ratio', '10.4', '', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Arachidonic acid / EPA ratio.</strong> 10.4. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-fer', 'Ferritin', '274', 'ng/mL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Ferritin.</strong> 274 ng/mL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-hcy', 'Homocysteine', '12.3', 'umol/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Homocysteine.</strong> 12.3 umol/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-iron', 'Iron', '140', 'mcg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Iron.</strong> 140 mcg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-isat', 'Iron % saturation', '44', '%', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Iron % saturation.</strong> 44 %. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-tibc', 'Iron binding capacity', '320', 'mcg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Iron binding capacity.</strong> 320 mcg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-mma', 'Methylmalonic acid', '73', 'nmol/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Methylmalonic acid.</strong> 73 nmol/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-o63', 'Omega 6 / 3 ratio', '5.2', '', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Omega 6 / 3 ratio.</strong> 5.2. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-o3', 'Omega-3 total / OmegaCheck', '6.1', '% by wt', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Omega-3 total / OmegaCheck.</strong> 6.1 % by wt. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-dha', 'Omega-3: DHA', '3.7', '% by wt', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Omega-3: DHA.</strong> 3.7 % by wt. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-dpa', 'Omega-3: DPA', '1.5', '% by wt', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Omega-3: DPA.</strong> 1.5 % by wt. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-epa', 'Omega-3: EPA', '0.9', '% by wt', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Omega-3: EPA.</strong> 0.9 % by wt. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-aa', 'Omega-6: arachidonic acid', '9.7', '% by wt', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Omega-6: arachidonic acid.</strong> 9.7 % by wt. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-la', 'Omega-6: linoleic acid', '19.5', '% by wt', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Omega-6: linoleic acid.</strong> 19.5 % by wt. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-vitd', 'Vitamin D', '64', 'ng/mL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Vitamin D.</strong> 64 ng/mL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. BioLinked scored pages already treat 30–100 ng/mL as the window, and a mid-to-upper result in that band as optimal. 64 sits in that window. Scored 4.'),
    row('ng-zn', 'Zinc', '71', 'mcg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Zinc.</strong> 71 mcg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.')
    ]},
    {t: 'Pancreas · 100/100 · 2 of 2 scored', rows: [
    row('ng-amy', 'Amylase', '68', 'U/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Amylase.</strong> 68 U/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-lip', 'Lipase', '35', 'U/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Lipase.</strong> 35 U/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.')
    ]},
    {t: 'Stress & aging · 100/100 · 1 of 1 scored', rows: [
    row('ng-cort', 'Cortisol', '10.8', 'mcg/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Cortisol.</strong> 10.8 mcg/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.')
    ]},
    {t: 'Thyroid · 85/100 · 5 of 5 scored', rows: [
    row('ng-tpo', 'Thyroid peroxidase antibodies', '23', 'IU/mL', 'Flagged out of range on this report', 'high', 'Above range', 'oor', 1,
      '<strong>Thyroid peroxidase antibodies.</strong> 23 IU/mL. This Function Health report marked this above range. Numeric laboratory limits were not printed on the Data export. Scored 1.'),
    row('ng-tgab', 'Thyroglobulin antibodies', '<2', 'IU/mL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Thyroglobulin antibodies.</strong> <2 IU/mL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-tsh', 'TSH', '2.93', 'mIU/L', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>TSH.</strong> 2.93 mIU/L. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-ft4', 'Free T4', '1.4', 'ng/dL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Free T4.</strong> 1.4 ng/dL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.'),
    row('ng-ft3', 'Free T3', '3.8', 'pg/mL', 'In range on this report', 'ok', 'Optimal', 'ok', 4,
      '<strong>Free T3.</strong> 3.8 pg/mL. This Function Health report marked this in range. Numeric laboratory limits were not printed on the Data export. Scored 4.')
    ]}
  ];

  window.NG_LABS = {
    sub: 'Function Health · collected Nov 12, 2026 · 97 markers scored',
    l: 'Overall Panel Score',
    score: '90',
    outof: '/100',
    g: 'Strong panel · 90/100 · lipid and blood-count follow-up',
    c: 'Informational only, not a diagnosis. Hormones, metabolic, liver, kidney, nutrient, and immune markers are in range on this report, and several metabolic and lipid ratios sit in BioLinked optimal windows. The score is pulled down by the lipid particle pattern — lipoprotein (a) 208 nmol/L, ApoB 97 mg/dL, LDL-cholesterol 105 mg/dL, LDL particle number 1790 nmol/L, higher small and medium LDL, a smaller LDL peak size, and lower HDL large particles — plus hematocrit 52.1%, hemoglobin 17.5 g/dL, MCH 33.1 pg, and thyroid peroxidase antibodies 23 IU/mL. HDL-cholesterol 58 mg/dL is in range on this report but short of the documented BioLinked optimal band above 60.',
    domains: [
      {v: '100', n: 'Hormones / Male Health · 12/12'},
      {v: '100', n: 'Metabolic · 5/5'},
      {v: '100', n: 'Liver / Kidney / Electrolytes · 18/18'},
      {v: '100', n: 'Nutrients · 16/16'},
      {v: '85', n: 'Thyroid · 4/5'},
      {v: '75', n: 'Blood · 6/9'},
      {v: '58', n: 'Lipids / Heart · 7/15'}
    ],
    bannerattr: '',
    banner: 'Each marker scores 4 if optimal, 3 if in-range (this report’s range, but short of a documented BioLinked functional window), 1 if out-of-range on this report. Average the scores flat, then scale to /100 (average ÷ 4 × 100, rounded). This 90 is 84 optimal, 1 in-range, and 12 out-of-range (351 ÷ 388 × 100 = 90). Function Health did not print numeric limits on this Data export, so in-range vs out-of-range follows the report’s own In Range / Above Range / Below Range flags. ABO group, Rh factor, routine urinalysis, and duplicate listings were not scored.',
    secs: secs
  };
})();
