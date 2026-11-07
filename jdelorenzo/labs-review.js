/* Educational walkthrough of one screenshot panel for this portal only.
   Values and source-app badges are transcribed. This is not a diagnosis,
   not a score, and not a protocol change. */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var REFS = [
    { href: 'https://www.thyroid.org/thyroid-function-tests/', label: 'American Thyroid Association, Thyroid Function Tests' },
    { href: 'https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf', label: 'KDIGO 2024 CKD Guideline' },
    { href: 'https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline-Top-10-Takeaways-for-PCPs-Evaluation.pdf', label: 'KDIGO 2024 CKD Guideline, evaluation takeaways for primary care' },
    { href: 'https://www.kidney.org/kidney-topics/creatinine', label: 'National Kidney Foundation, Creatinine' },
    { href: 'https://www.niddk.nih.gov/research-funding/research-programs/kidney-clinical-research-epidemiology/laboratory/factors-affecting-egfr-accuracy/clinical-measurements', label: 'NIDDK, Clinical Measurements and eGFR Accuracy' },
    { href: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/', label: 'NIH Office of Dietary Supplements, Vitamin D fact sheet' },
    { href: 'https://myadlm.org/advocacy-and-outreach/optimal-testing-guide-to-lab-test-utilization/a-f/estradiol-testing-in-men', label: 'ADLM, Estradiol Testing in Men' }
  ];

  window.JOE_LABS = {
    kind: 'qualitative',
    sub: '25 markers · review Nov 7, 2026 · collection date not provided',
    reviewed: 'November 7, 2026',
    disclaimer: 'Educational walkthrough of numbers shared from screenshots, compared with public references. Not a medical diagnosis, not a substitute for a clinician or the original laboratory report, and not a reason to start, stop, or change any medication, peptide, or dose.',
    summary: [
      'Collection date was not on the screenshots. November 7, 2026 is the review date, not the collection date. Fasting status, assay method, laboratory name, and the lab reference intervals were not shown. Percent changes have no comparison date.',
      'Read one at a time, several results look relatively favorable: ApoB 61.9 mg/dL, LDL cholesterol 70.2 mg/dL, total cholesterol 145 mg/dL, and HDL 47.0 mg/dL. Total testosterone 868 ng/dL is not low. It is not proof of optimal therapy, because timing and context were not supplied. SHBG 33.6 nmol/L, TSH 1.27 uIU/mL, vitamin D 47.0 ng/mL, ferritin 180 ng/mL, fructosamine 230 umol/L, GGT 24.9 U/L, and albumin 4.36 g/dL also look unremarkable on a typical adult reading. That is not a full clearance, and it is not a complete panel.',
      'Review the kidney pair first. Creatinine is 1.24 mg/dL and the source app marked it out of range. eGFR is 69.52. KDIGO calls GFR 60–89 category G2, mildly decreased, and G2 without kidney damage is not CKD. Repeat creatinine and eGFR and add a urine albumin-to-creatinine ratio. Muscle mass, creatine, a large serving of cooked meat, hard training, and hydration can raise creatinine and make a creatinine-based eGFR look lower. The undated creatinine rise and eGFR drop are a reason to repeat the tests, not a diagnosis.',
      'Estradiol is 44.6 pg/mL and the source app marked it out of range. A clinician should review symptoms, timing, and the assay. ADLM recommends a sensitive mass-spectrometry method for men, because standard immunoassays can overestimate estradiol in the male range. Do not change any medication, peptide, or dose from this number.',
      'The source app labeled three ratios with the unit pct. That is a display error. Triglyceride/HDL 2.95, LDL/ApoB 1.13, and total cholesterol/HDL 3.08 are ratios, not percentages. 139/47 equals 2.957, which rounds to 2.96. 145/47 equals 3.085, which rounds to 3.09. The displayed 2.95 and 3.08 are approximately consistent with those inputs, possibly from hidden decimals, not exact rounding. Remnant cholesterol 27.79 mg/dL matches 145 − 47 − 70.2 = 27.8 and is consistent with calculation. Method unconfirmed: this is not proof of a separate assay and not proof the value was only calculated. LDL/ApoB is not a particle-size diagnosis. Derived non-HDL cholesterol, which the app did not print, is 145 − 47 = 98 mg/dL. hsCRP 1.21 mg/L sits in the usual average band. Uric acid 6.87 mg/dL sits at the about 6.8 mg/dL saturation line and is not a gout diagnosis. Free testosterone and the untimed cortisol are not graded.'
    ],
    ranks: [
      'Repeat creatinine and eGFR, and add a urine albumin-to-creatinine ratio (ACR). Creatinine is 1.24 mg/dL (source app: out of range) and eGFR is 69.52 (KDIGO category G2, mildly decreased). G2 without kidney damage is not a CKD diagnosis. Review muscle mass, creatine, cooked meat, hard training, and hydration. The undated creatinine increase and eGFR drop are a reason to repeat the tests.',
      'Estradiol is 44.6 pg/mL (source app: out of range). A clinician should review symptoms, timing, and the assay. ADLM recommends a sensitive mass-spectrometry method for men. Do not change any medication, peptide, or dose from this number.'
    ],
    next: [
      'Triglycerides 139 mg/dL, remnant cholesterol 27.79 mg/dL, and the triglyceride/HDL ratio 2.95. Fasting status is unknown. Discuss them with derived non-HDL cholesterol (98 mg/dL), LDL cholesterol, and ApoB. They are not separate diagnoses.',
      'hsCRP 1.21 mg/L is in the usual average band, with an undated 115% change. One value does not show infection or high cardiovascular risk.',
      'Uric acid 6.87 mg/dL is essentially at the about 6.8 mg/dL saturation line. That is not a gout diagnosis.'
    ],
    reassure: 'On the numbers that were shown, ApoB 61.9, LDL cholesterol 70.2, total cholesterol 145, and the total cholesterol/HDL ratio 3.08 look relatively favorable. Total testosterone 868 is not low. SHBG, TSH, vitamin D, ferritin, fructosamine, GGT, and albumin look unremarkable. Heart risk still cannot be calculated, and this is not a full clearance.',
    notTargets: [
      'LDL/ApoB 1.13 is a ratio, not a percentage, and not a particle-size diagnosis or a treatment target.',
      'Cortisol 13.2 ug/dL has no collection time, so it is not graded and does not show stress.',
      'Free testosterone 198.93 pg/mL has no assay method, so it is not graded and nothing should be adjusted from it.'
    ],
    gaps: [
      'The original report: collection date, fasting status, reference intervals, and assay names.',
      'A repeat creatinine and eGFR, plus urine ACR.',
      'Cystatin C, or a combined creatinine–cystatin C eGFR, only if creatinine is hard to interpret.',
      'A clinician’s read of estradiol symptoms, timing, and assay.',
      'A blood count, including hematocrit, if testosterone therapy is already part of care.',
      'Fasting glucose and HbA1c. Fructosamine does not replace them.',
      'AST and ALT.',
      'Electrolytes.',
      'Free T4 only if a clinician indicates further thyroid testing.',
      'Lipoprotein(a) is an example of a lipid test that was not on these screenshots.'
    ],
    sections: [
      {
        id: 'thyroid',
        title: 'Thyroid',
        rows: [
          {
            id: 'tsh',
            name: 'TSH',
            value: '1.27',
            unit: 'uIU/mL',
            source: 'OPTIMAL',
            sourceClass: 'opt',
            read: 'Favorable',
            readClass: 'fav',
            change: 'down 21%',
            gist: 'Inside the TSH window many adult labs use. Only TSH was shown.',
            lines: [
              'The American Thyroid Association describes TSH as the best initial thyroid test. In most healthy people, a normal TSH means the thyroid is functioning properly. 1.27 uIU/mL sits inside windows often near 0.4–4.0 mIU/L. This laboratory’s interval was not supplied.',
              'Only TSH was on the screenshots. Further thyroid tests are examples a clinician might add only if indicated. The displayed 21% change has no comparison date.'
            ],
            refs: [0]
          }
        ]
      },
      {
        id: 'kidney',
        title: 'Kidney / liver',
        rows: [
          {
            id: 'creatinine',
            name: 'Creatinine',
            value: '1.24',
            unit: 'mg/dL',
            source: 'OUT OF RANGE',
            sourceClass: 'oor',
            read: 'Needs clinician follow-up',
            readClass: 'fu',
            change: 'up 32%',
            gist: 'Read with eGFR. Not a kidney diagnosis by itself.',
            lines: [
              'The National Kidney Foundation notes that a high creatinine is not, by itself, proof of kidney disease, and a normal creatinine does not rule it out. NIDDK notes that creatinine-based eGFR is less reliable at extremes of muscle mass or diet. Higher muscle mass, creatine, cooked meat, hard training, and dehydration can raise creatinine.',
              'The source-app flag is plausible because many adult male intervals top out near 1.2–1.3 mg/dL, but this lab’s interval was not supplied. The undated 32% rise is a reason to confirm the result. See the eGFR card for the repeat-and-ACR priority.'
            ],
            refs: [3, 4]
          },
          {
            id: 'alp',
            name: 'ALP',
            value: '42.4',
            unit: 'U/L',
            source: 'AVERAGE',
            sourceClass: 'avg',
            read: 'Intermediate',
            readClass: 'mid',
            change: 'down 13%',
            gist: 'Often low-normal. Not a liver clearance without AST and ALT.',
            lines: [
              'Alkaline phosphatase comes from liver and bone. 42.4 U/L often sits near the low end of adult intervals. This laboratory’s interval was not supplied, and AST and ALT were not shown, so this single result does not clear or diagnose liver disease.'
            ]
          },
          {
            id: 'egfr',
            name: 'eGFR',
            value: '69.52',
            unit: 'mL/min/1.73m2',
            source: 'AVERAGE',
            sourceClass: 'avg',
            read: 'Needs clinician follow-up',
            readClass: 'fu',
            change: 'down 28%',
            gist: 'KDIGO G2, mildly decreased. Not a CKD diagnosis from this screenshot.',
            lines: [
              'KDIGO 2024 calls GFR 60–89 category G2, mildly decreased. G2 without evidence of kidney damage does not meet the definition of CKD. CKD means an abnormality of kidney structure or function for more than 3 months. Urine ACR is the usual companion test.',
              'A shift beyond about ±20% is more likely to be real than noise when the two results are comparable and dated. This down 28% has no comparison date, and creatinine can move for reasons other than filtration. If creatinine is a doubtful marker, cystatin C or a combined estimate is an option to discuss. This is not a CKD label.'
            ],
            refs: [1, 2, 4]
          },
          {
            id: 'ggt',
            name: 'GGT',
            value: '24.9',
            unit: 'U/L',
            source: 'OPTIMAL',
            sourceClass: 'opt',
            read: 'Favorable',
            readClass: 'fav',
            change: 'down 30%',
            gist: 'Typical of a usual adult interval. Not a full liver panel.',
            lines: [
              '24.9 U/L is typically well inside common adult intervals, which fits the source-app label. GGT does not replace AST and ALT. The 30% change has no comparison date.'
            ]
          }
        ]
      },
      {
        id: 'metabolic',
        title: 'Metabolic',
        rows: [
          {
            id: 'tghdl',
            name: 'Triglyceride / HDL ratio',
            value: '2.95',
            unit: 'ratio',
            source: 'OUT OF RANGE',
            sourceClass: 'oor',
            read: 'Intermediate',
            readClass: 'mid',
            change: 'up 76%',
            gist: 'This is a ratio, not a percentage. Displayed 2.95 is approximately consistent with 139/47, not exact rounding.',
            lines: [
              'The source app showed the unit pct. That label is wrong. 139/47 equals 2.957, which rounds to 2.96. The app shows 2.95. The two figures are approximately consistent, possibly from hidden decimals, not exact rounding.',
              'Fasting status is unknown. This page does not use the ratio as a treatment target. The undated 76% change should not be over-read.'
            ]
          },
          {
            id: 'uric',
            name: 'Uric acid',
            value: '6.87',
            unit: 'mg/dL',
            source: 'AVERAGE',
            sourceClass: 'avg',
            read: 'Intermediate',
            readClass: 'mid',
            change: 'up 20%',
            gist: 'Sits at the about 6.8 mg/dL saturation line. Not a gout diagnosis.',
            lines: [
              'Serum urate saturates near 6.8 mg/dL. 6.87 mg/dL is essentially on that line. Gout is a clinical diagnosis, not a number alone. The undated 20% rise is context for a clinician.'
            ]
          },
          {
            id: 'tg',
            name: 'Triglycerides',
            value: '139',
            unit: 'mg/dL',
            source: 'AVERAGE',
            sourceClass: 'avg',
            read: 'Intermediate',
            readClass: 'mid',
            change: 'up 48%',
            gist: 'Just under 150 mg/dL. Fasting status was not shown.',
            lines: [
              '139 mg/dL is just under the 150 mg/dL line often used when triglycerides are called elevated. Fasting status is unknown, so this is a discussion point, not a diagnosis. The undated 48% rise is sizable. Read it with remnant cholesterol and the triglyceride/HDL ratio.'
            ]
          },
          {
            id: 'vitd',
            name: 'Vitamin D',
            value: '47.0',
            unit: 'ng/mL',
            source: 'AVERAGE',
            sourceClass: 'avg',
            read: 'Favorable',
            readClass: 'fav',
            change: 'down 8%',
            gist: 'Above the NIH adequacy line and under the above-50 caution zone. Not a reason to megadose.',
            lines: [
              'The NIH Office of Dietary Supplements, citing the National Academies, treats 25(OH)D at or above 20 ng/mL as generally adequate for most people, and notes that levels above 50 ng/mL can be linked to potential adverse effects. 47.0 ng/mL is between those points. It is not a reason for high-dose megadosing. The 8% change has no comparison date.'
            ],
            refs: [5]
          },
          {
            id: 'fructosamine',
            name: 'Fructosamine',
            value: '230',
            unit: 'umol/L',
            source: 'OPTIMAL',
            sourceClass: 'opt',
            read: 'Favorable',
            readClass: 'fav',
            change: 'up 9%',
            gist: 'A roughly 2–3 week glycemia marker. Not a substitute for A1c or fasting glucose.',
            lines: [
              'Fructosamine reflects glycated serum proteins, mainly albumin, over about the previous 2–3 weeks. 230 umol/L is unremarkable on many adult intervals. This lab’s interval was not supplied. Fasting glucose and HbA1c were not shown.'
            ]
          },
          {
            id: 'albumin',
            name: 'Albumin',
            value: '4.36',
            unit: 'g/dL',
            source: 'Not readable',
            sourceClass: 'miss',
            read: 'Favorable',
            readClass: 'fav',
            change: 'down 4%',
            gist: 'Looks typical. The source-app flag was cropped, so none is invented here.',
            lines: [
              '4.36 g/dL sits in the about 3.5–5.0 g/dL span many adult panels use. The source-app badge was cut off on the screenshot and is not filled in. The 4% change is small and undated.'
            ]
          },
          {
            id: 'ferritin',
            name: 'Ferritin',
            value: '180',
            unit: 'ng/mL',
            source: 'OPTIMAL',
            sourceClass: 'opt',
            read: 'Favorable',
            readClass: 'fav',
            change: '0%',
            gist: 'Not a low iron store on this information. Not an iron-overload diagnosis by itself.',
            lines: [
              '180 ng/mL does not look like iron deficiency, and a single ferritin in this range is not a hemochromatosis diagnosis. Ferritin also rises with inflammation. Transferrin saturation was not shown. Displayed change 0%.'
            ]
          }
        ]
      },
      {
        id: 'heart',
        title: 'Heart',
        note: 'Derived, not a transcribed result: non-HDL cholesterol = 145 − 47 = 98 mg/dL.',
        rows: [
          {
            id: 'ldlapob',
            name: 'LDL / ApoB ratio',
            value: '1.13',
            unit: 'ratio',
            source: 'OUT OF RANGE',
            sourceClass: 'oor',
            read: 'Not a clinical target',
            readClass: 'na',
            change: 'down 11%',
            gist: 'This is a ratio, not a percentage, and not a particle-size diagnosis.',
            lines: [
              '70.2/61.9 rounds to the displayed 1.13. The source app showed the unit pct, which is incorrect. The ratio is not a direct particle-size measurement and is not a treatment target. ApoB, LDL cholesterol, non-HDL cholesterol, and triglycerides are the useful companions.'
            ]
          },
          {
            id: 'remnant',
            name: 'Remnant cholesterol',
            value: '27.79',
            unit: 'mg/dL',
            source: 'OUT OF RANGE',
            sourceClass: 'oor',
            read: 'Intermediate',
            readClass: 'mid',
            change: 'up 48%',
            gist: 'Consistent with 145 − 47 − 70.2 = 27.8. Method unconfirmed.',
            lines: [
              'The displayed 27.79 mg/dL matches calculated 27.8 from total cholesterol, HDL, and LDL. That is consistent with calculation. The assay or calculation method was not shown, so this is not proof of an independent remnant measurement and not proof the value was only calculated.',
              'With these round numbers, triglycerides/5 is also 27.8, the same figure Friedewald-style arithmetic uses for VLDL. Fasting status is unknown. Read it with triglycerides, derived non-HDL cholesterol (98 mg/dL), and ApoB. The source-app out-of-range badge is an app cutoff, not a named laboratory interval.'
            ]
          },
          {
            id: 'hdl',
            name: 'HDL',
            value: '47.0',
            unit: 'mg/dL',
            source: 'AVERAGE',
            sourceClass: 'avg',
            read: 'Intermediate',
            readClass: 'mid',
            change: 'down 16%',
            gist: 'Above the line often called low for men. Not a treatment target by itself.',
            lines: [
              'A line often used for low HDL in men is below 40 mg/dL. 47.0 mg/dL is above that line. HDL is not a treatment target in isolation. The 16% change has no comparison date.'
            ]
          },
          {
            id: 'tc',
            name: 'Total cholesterol',
            value: '145',
            unit: 'mg/dL',
            source: 'AVERAGE',
            sourceClass: 'avg',
            read: 'Favorable',
            readClass: 'fav',
            change: 'down 16%',
            gist: 'Not a high total. It still mixes several cholesterol fractions.',
            lines: [
              '145 mg/dL is not a high total cholesterol. The number mixes HDL, LDL, and triglyceride-rich fractions, so ApoB and LDL cholesterol are more specific. The average badge is the source app’s conservative label. Overall heart risk cannot be calculated from this panel.'
            ]
          },
          {
            id: 'hscrp',
            name: 'hsCRP',
            value: '1.21',
            unit: 'mg/L',
            source: 'AVERAGE',
            sourceClass: 'avg',
            read: 'Intermediate',
            readClass: 'mid',
            change: 'up 115%',
            gist: 'In the usual average band. Not an infection diagnosis and not a high-risk label.',
            lines: [
              'Long-used relative-risk bands put hsCRP under 1.0 mg/L in a lower band, about 1 to 3 mg/L in an average band, and above 3.0 mg/L in a higher band. Values above 10 mg/L are usually set aside to look for acute illness before a heart-risk discussion. 1.21 mg/L is in the average band.',
              'The undated 115% change is a large relative swing from an earlier unread result. hsCRP also moves with illness and hard training. One value does not diagnose infection or high cardiovascular risk.'
            ]
          },
          {
            id: 'ldl',
            name: 'LDL',
            value: '70.2',
            unit: 'mg/dL',
            source: 'AVERAGE',
            sourceClass: 'avg',
            read: 'Favorable',
            readClass: 'fav',
            change: 'down 28%',
            gist: 'Looks relatively low. Not labeled at goal, because overall risk is unknown.',
            lines: [
              '70.2 mg/dL looks relatively low next to many published thresholds. Personal goals depend on overall risk, and this panel does not include the inputs for that calculation, so the result is not called at goal or not at goal.',
              'Using the displayed round numbers, triglycerides/5 = 27.8 and 145 − 47 − 27.8 = 70.2. The figure is consistent with Friedewald-style arithmetic. The assay method was not shown, so this is not proof of a calculated LDL versus a direct LDL.'
            ]
          },
          {
            id: 'tchdl',
            name: 'Total cholesterol / HDL ratio',
            value: '3.08',
            unit: 'ratio',
            source: 'AVERAGE',
            sourceClass: 'avg',
            read: 'Favorable',
            readClass: 'fav',
            change: '0%',
            gist: 'This is a ratio, not a percentage. Displayed 3.08 is approximately consistent with 145/47, not exact rounding.',
            lines: [
              '145/47 equals 3.085, which rounds to 3.09. The source app shows 3.08 and labeled the unit pct. The figures are approximately consistent, possibly from hidden decimals, not exact rounding. The ratio is context, not a standalone treatment target. Displayed change 0%.'
            ]
          },
          {
            id: 'apob',
            name: 'ApoB',
            value: '61.9',
            unit: 'mg/dL',
            source: 'OPTIMAL',
            sourceClass: 'opt',
            read: 'Favorable',
            readClass: 'fav',
            change: 'down 18%',
            gist: 'Relatively low on commonly cited goals. Heart risk is still unknown.',
            lines: [
              'ApoB counts atherogenic particles. 61.9 mg/dL looks relatively low next to commonly cited goals. A favorable ApoB does not calculate 10-year risk. Blood pressure, smoking, diabetes status, and lipoprotein(a) were not on this panel. The 18% change has no comparison date.'
            ]
          }
        ]
      },
      {
        id: 'hormones',
        title: 'Hormones',
        rows: [
          {
            id: 'e2',
            name: 'Estradiol',
            value: '44.6',
            unit: 'pg/mL',
            source: 'OUT OF RANGE',
            sourceClass: 'oor',
            read: 'Needs clinician follow-up',
            readClass: 'fu',
            change: 'up 38%',
            gist: 'Needs symptoms, timing, and the assay. No protocol change from this number.',
            lines: [
              'ADLM recommends measuring estradiol in men with a sensitive LC-MS/MS assay. Immunoassays tend to overestimate at male-range concentrations and are generally considered more appropriate above about 50 pg/mL. 44.6 pg/mL is in the zone where the method can change the reading.',
              'The result alone is not a specific diagnosis. Symptoms, collection timing, and the assay name were not on the screenshot. Do not change any medication, peptide, or dose from this number.'
            ],
            refs: [6]
          },
          {
            id: 'freet',
            name: 'Free testosterone',
            value: '198.93',
            unit: 'pg/mL',
            source: 'AVERAGE',
            sourceClass: 'avg',
            read: 'Insufficient context',
            readClass: 'ins',
            change: 'down 37%',
            gist: 'Not graded. The assay method was not shown.',
            lines: [
              '198.93 pg/mL is about 19.9 ng/dL if those units are preferred (divide by 10). That conversion is unit math only. The assay method and collection time were not shown, so this result is not graded as normal or abnormal.',
              'The source-app average badge is the app’s label, not an educational grade. The undated 37% change should not drive any adjustment. Total testosterone and SHBG are listed on their own cards.'
            ]
          },
          {
            id: 'cortisol',
            name: 'Cortisol',
            value: '13.2',
            unit: 'ug/dL',
            source: 'OPTIMAL',
            sourceClass: 'opt',
            read: 'Insufficient context',
            readClass: 'ins',
            change: 'down 7%',
            gist: 'Not graded. No collection time was shown.',
            lines: [
              'Serum cortisol depends on the time of day. This screenshot has no collection time, so 13.2 ug/dL is not graded and does not show high stress, adrenal excess, or adrenal insufficiency. The source-app optimal label is only the app’s badge.'
            ]
          },
          {
            id: 'shbg',
            name: 'SHBG',
            value: '33.6',
            unit: 'nmol/L',
            source: 'OPTIMAL',
            sourceClass: 'opt',
            read: 'Favorable',
            readClass: 'fav',
            change: 'up 19%',
            gist: 'Mid-range binding-protein context on many adult male intervals.',
            lines: [
              '33.6 nmol/L is typically mid-range on many adult male intervals. This laboratory’s interval was not supplied. It is context for reading total testosterone, not a performance or fertility diagnosis. The 19% change has no comparison date.'
            ]
          },
          {
            id: 'totalt',
            name: 'Total testosterone',
            value: '868',
            unit: 'ng/dL',
            source: 'OPTIMAL',
            sourceClass: 'opt',
            read: 'Not low — review timing',
            readClass: 'time',
            change: 'down 28%',
            gist: 'Not low. Not proof of optimal therapy. Timing and context were not supplied.',
            lines: [
              '868 ng/dL is not low next to common adult male lower limits, which often sit near the mid-200s to about 300 ng/dL and vary by assay. It is not proof of optimal therapy. Collection time was not supplied. A deficiency workup uses symptoms plus repeated morning results, which this screenshot does not provide.',
              'If testosterone therapy is already part of care, a blood count that includes hematocrit is a usual monitoring item, and it was not on this panel. The undated 28% change still leaves the current result not low. Do not change a dose from this screenshot.'
            ]
          }
        ]
      }
    ]
  };

  function refsHtml(idxs) {
    if (!idxs || !idxs.length) return '';
    var bits = idxs.map(function (i) {
      var r = REFS[i];
      if (!r) return '';
      return '<a href="' + esc(r.href) + '" target="_blank" rel="noopener noreferrer">' + esc(r.label) + '</a>';
    }).filter(Boolean);
    if (!bits.length) return '';
    return '<p class="qsrc-links"><span>Sources.</span> ' + bits.join(' · ') + '</p>';
  }

  function card(row) {
    var lines = (row.lines || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    return '<article class="qcard" id="lab-' + esc(row.id) + '" data-marker="' + esc(row.id) + '">' +
      '<div class="qtop"><h3 class="qname">' + esc(row.name) + '</h3>' +
      '<div class="qval"><span class="qnum">' + esc(row.value) + '</span> <em>' + esc(row.unit) + '</em></div></div>' +
      '<div class="qfields">' +
        '<div class="qfield"><span class="k">Source app</span><span class="qsrc ' + esc(row.sourceClass) + '">' + esc(row.source) + '</span></div>' +
        '<div class="qfield"><span class="k">Our read</span><span class="qread ' + esc(row.readClass) + '">' + esc(row.read) + '</span></div>' +
      '</div>' +
      '<p class="qchg">Source app change: ' + esc(row.change) + '. Comparison date not provided.</p>' +
      '<p class="qgist">' + esc(row.gist) + '</p>' +
      '<details class="qdetail"><summary>Marker detail</summary><div class="qmore">' + lines + refsHtml(row.refs) + '</div></details>' +
      '</article>';
  }

  window.renderQualLabs = function (host, L) {
    var o = [];
    o.push('<h1 class="scrn">Labs</h1>');
    o.push('<p class="sub">' + esc(L.sub) + '</p>');
    o.push('<div class="qlabs-disc" role="note"><strong>Not medical advice.</strong> ' + esc(L.disclaimer) + '</div>');
    o.push('<div class="qlabs-meta"><p><b>Collection date:</b> not provided.</p><p><b>Review date:</b> ' + esc(L.reviewed) + '. This is when the walkthrough was written, not a draw date.</p><p>Fasting, assay method, laboratory name, and reference intervals were not on the screenshots.</p></div>');
    o.push('<section class="qlabs-read" aria-label="Overall read"><p class="qlabs-kicker">Overall read</p><h2>No score on this panel</h2>');
    (L.summary || []).forEach(function (p) { o.push('<p>' + esc(p) + '</p>'); });
    o.push('</section>');
    o.push('<section class="qpri" id="q-priorities"><h2>Follow-up priorities</h2><p class="qpri-lead">Discussion items for a clinician. Not a scored problem list and not treatment orders.</p><h3>Higher priority</h3><ol class="qtop-ranks">');
    (L.ranks || []).forEach(function (item) { o.push('<li>' + esc(item) + '</li>'); });
    o.push('</ol><h3>Next to discuss</h3><ul>');
    (L.next || []).forEach(function (item) { o.push('<li>' + esc(item) + '</li>'); });
    o.push('</ul><h3>Reassuring pieces, not a full clearance</h3><p>' + esc(L.reassure) + '</p><h3>Do not rank as targets</h3><ul>');
    (L.notTargets || []).forEach(function (item) { o.push('<li>' + esc(item) + '</li>'); });
    o.push('</ul></section>');
    o.push('<p class="qlegend"><b>Source app</b> is the badge from the screenshot app. <b>Our read</b> is a separate educational note. Neither one is the laboratory reference interval, and the page does not combine them into a single rank.</p>');
    var n = 0;
    (L.sections || []).forEach(function (sec) {
      o.push('<div class="seclbl" id="lab-sec-' + esc(sec.id) + '">' + esc(sec.title) + '</div>');
      if (sec.note) o.push('<p class="qsec-note">' + esc(sec.note) + '</p>');
      sec.rows.forEach(function (row) { n += 1; o.push(card(row)); });
    });
    o.push('<section class="qpri qgaps"><h2>Not on these screenshots</h2><p>Examples of what this panel does not settle. Not an order to run every test.</p><ul>');
    (L.gaps || []).forEach(function (item) { o.push('<li>' + esc(item) + '</li>'); });
    o.push('</ul></section>');
    o.push('<section class="qpri qrefs"><h2>References</h2><ul>');
    REFS.forEach(function (r) {
      o.push('<li><a href="' + esc(r.href) + '" target="_blank" rel="noopener noreferrer">' + esc(r.label) + '</a></li>');
    });
    o.push('</ul></section>');
    o.push('<p class="note">For research and education. Not medical advice, and not a certification of the result.</p>');
    host.innerHTML = o.join('\n');
    host.setAttribute('data-marker-count', String(n));
  };
})();
