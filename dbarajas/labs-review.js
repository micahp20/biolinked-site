window.LABS = {
  "sub": "AI clinical decision-support review · November 10, 2026 · 2:19 p.m. · Fasting status unknown",
  "l": "Overall clinical priority",
  "score": "P2",
  "outof": "",
  "g": "Prompt primary care review",
  "c": "Daytime exhaustion that interferes with your usual activities deserves assessment. The blood draw shows mild blood sugar elevation but does not establish the cause of the exhaustion.",
  "domains": [
    {
      "v": "P2",
      "n": "Fatigue"
    },
    {
      "v": "P3",
      "n": "Blood sugar"
    },
    {
      "v": "P4",
      "n": "Blood counts"
    },
    {
      "v": "P4",
      "n": "Kidney function"
    }
  ],
  "banner": "Overall priority is P2 because daytime exhaustion is affecting your daily activities. Your A1c of 5.8% is in the prediabetes range, and the meaning of your glucose of 102 mg/dL depends on whether you had eaten. Your hemoglobin and thyroid screening result were within the lab’s ranges. Contact primary care this week to review sleep quality, possible breathing pauses during sleep, and follow-up blood sugar testing.",
  "secs": [
    {
      "t": "Ranked findings",
      "rows": [
        {
          "id": "priority-0",
          "n": "Daytime exhaustion",
          "v": "P2",
          "ref": "Daytime exhaustion, 6 hours of sleep, sleep quality 2/5 (intake).",
          "tip": "Short sleep may contribute. At 295 lb and 5 ft 11 in, ask about snoring and breathing pauses to assess possible sleep apnea. Confidence in the cause is low. Contact primary care this week to arrange an appointment. If you are dozing while driving, avoid driving and contact your clinician today."
        },
        {
          "id": "priority-1",
          "n": "Blood sugar",
          "v": "P3",
          "ref": "A1c 5.8% (lab 4.8–5.6%). Glucose 102 mg/dL (70–99).",
          "tip": "A1c falls within the adult prediabetes screening range of 5.7–6.4%. The afternoon glucose depends on whether you had fasted. Neither value establishes why you feel exhausted. At the scheduled visit, review prior glucose tests and timing of previous tirzepatide use. Ask whether to repeat A1c or obtain fasting plasma glucose."
        },
        {
          "id": "priority-2",
          "n": "Hemoglobin and thyroid",
          "v": "P4",
          "ref": "Hemoglobin 16.5 g/dL (13.0–17.7). TSH 3.46 µIU/mL (0.450–4.500).",
          "tip": "No anemia by hemoglobin or abnormal TSH on this draw. The uploaded report does not show a free T4 result. Review alongside sleep symptoms at the same visit."
        },
        {
          "id": "priority-3",
          "n": "Kidney function",
          "v": "P4",
          "ref": "Creatinine 1.09 mg/dL (0.76–1.27); eGFR 88 mL/min/1.73 m² (lab &gt;59).",
          "tip": "Both meet the reporting lab’s interval. The visible electrolytes are also within range. Routine review alongside prior results if available."
        },
        {
          "id": "priority-4",
          "n": "Missing results",
          "v": "Unrated",
          "ref": "Testosterone and CRP unavailable. Alkaline phosphatase heading visible; result cropped.",
          "tip": "A hormone assessment, complete liver panel review and biological-age calculation are unavailable from these images. Bring any additional results to the next visit."
        }
      ]
    },
    {
      "t": "Blood sugar",
      "rows": [
        {
          "n": "A1c",
          "v": "5.8",
          "u": "%",
          "ref": "4.8–5.6%",
          "p": "High",
          "tip": "In the prediabetes range. Ask your clinician about confirming this result.",
          "id": "draw-0",
          "pc": "watch",
          "vc": "watch"
        },
        {
          "n": "Glucose",
          "v": "102",
          "u": "mg/dL",
          "ref": "70–99",
          "p": "High",
          "tip": "Flagged against the printed interval. Fasting status was not recorded, so this cannot establish impaired fasting glucose.",
          "id": "draw-1",
          "pc": "watch",
          "vc": "watch"
        }
      ]
    },
    {
      "t": "Blood counts",
      "rows": [
        {
          "n": "WBC",
          "v": "10.3",
          "u": "× 10³/µL",
          "ref": "3.4–10.8",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-3",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "RBC",
          "v": "5.25",
          "u": "× 10⁶/µL",
          "ref": "4.14–5.80",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-4",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Hemoglobin",
          "v": "16.5",
          "u": "g/dL",
          "ref": "13.0–17.7",
          "p": "In range",
          "tip": "Within range. Anemia is not evident on this draw.",
          "id": "draw-5",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Hematocrit",
          "v": "47.2",
          "u": "%",
          "ref": "37.5–51.0",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-6",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "MCV",
          "v": "90",
          "u": "fL",
          "ref": "79–97",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-7",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "MCH",
          "v": "31.4",
          "u": "pg",
          "ref": "26.6–33.0",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-8",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "MCHC",
          "v": "35",
          "u": "g/dL",
          "ref": "31.5–35.7",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-9",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "RDW",
          "v": "11.9",
          "u": "%",
          "ref": "11.6–15.4",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-10",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Platelets",
          "v": "280",
          "u": "× 10³/µL",
          "ref": "150–450",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-11",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Neutrophils (absolute)",
          "v": "6.3",
          "u": "× 10³/µL",
          "ref": "1.4–7.0",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-25",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Neutrophils (%)",
          "v": "61%",
          "u": "",
          "ref": "No interval supplied",
          "p": "No lab interval",
          "tip": "The absolute count is scored separately.",
          "id": "draw-26",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Lymphocytes (absolute)",
          "v": "2.8",
          "u": "× 10³/µL",
          "ref": "0.7–3.1",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-27",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Lymphocytes (%)",
          "v": "27%",
          "u": "",
          "ref": "No interval supplied",
          "p": "No lab interval",
          "tip": "The absolute count is scored separately.",
          "id": "draw-28",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Monocytes (absolute)",
          "v": "0.8",
          "u": "× 10³/µL",
          "ref": "0.1–0.9",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-29",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Monocytes (%)",
          "v": "8%",
          "u": "",
          "ref": "No interval supplied",
          "p": "No lab interval",
          "tip": "The absolute count is scored separately.",
          "id": "draw-30",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Eosinophils (absolute)",
          "v": "0.4",
          "u": "× 10³/µL",
          "ref": "0.0–0.4",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-31",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Eosinophils (%)",
          "v": "4%",
          "u": "",
          "ref": "No interval supplied",
          "p": "No lab interval",
          "tip": "The absolute count is scored separately.",
          "id": "draw-32",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Basophils (absolute)",
          "v": "0.0",
          "u": "× 10³/µL",
          "ref": "0.0–0.2",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-33",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Basophils (%)",
          "v": "0%",
          "u": "",
          "ref": "No interval supplied",
          "p": "No lab interval",
          "tip": "The absolute count is scored separately.",
          "id": "draw-34",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Immature granulocytes (absolute)",
          "v": "0.0",
          "u": "× 10³/µL",
          "ref": "0.0–0.1",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-35",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Immature granulocytes (%)",
          "v": "0%",
          "u": "",
          "ref": "No interval supplied",
          "p": "No lab interval",
          "tip": "The absolute count is scored separately.",
          "id": "draw-36",
          "pc": "normal",
          "vc": "normal"
        }
      ]
    },
    {
      "t": "Kidney, liver and thyroid",
      "rows": [
        {
          "n": "TSH",
          "v": "3.46",
          "u": "µIU/mL",
          "ref": "0.450–4.500",
          "p": "In range",
          "tip": "Within the printed thyroid screening range. No free T4 result is visible.",
          "id": "draw-2",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "BUN",
          "v": "11",
          "u": "mg/dL",
          "ref": "6–24",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-12",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Creatinine",
          "v": "1.09",
          "u": "mg/dL",
          "ref": "0.76–1.27",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-13",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "eGFR",
          "v": "88",
          "u": "mL/min/1.73 m²",
          "ref": ">59",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-14",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "BUN/creatinine ratio",
          "v": "10",
          "u": "",
          "ref": "9–20",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-15",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Sodium",
          "v": "140",
          "u": "mmol/L",
          "ref": "134–144",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-16",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Potassium",
          "v": "4.6",
          "u": "mmol/L",
          "ref": "3.5–5.2",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-17",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Chloride",
          "v": "103",
          "u": "mmol/L",
          "ref": "96–106",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-18",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Carbon dioxide",
          "v": "22",
          "u": "mmol/L",
          "ref": "17–26",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-19",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Calcium",
          "v": "9.2",
          "u": "mg/dL",
          "ref": "8.7–10.2",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-20",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Total protein",
          "v": "6.9",
          "u": "g/dL",
          "ref": "6.0–8.5",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-21",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Albumin",
          "v": "4.4",
          "u": "g/dL",
          "ref": "4.1–5.1",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-22",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Globulin",
          "v": "2.5",
          "u": "g/dL",
          "ref": "1.5–4.5",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-23",
          "pc": "normal",
          "vc": "normal"
        },
        {
          "n": "Total bilirubin",
          "v": "0.6",
          "u": "mg/dL",
          "ref": "0.0–1.2",
          "p": "In range",
          "tip": "Within the laboratory interval.",
          "id": "draw-24",
          "pc": "normal",
          "vc": "normal"
        }
      ]
    },
    {
      "t": "HRT and follow-up",
      "rows": [
        {
          "id": "hrt-review",
          "n": "HRT-specific interpretation",
          "v": "Unrated",
          "tip": "No HRT regimen was reported. Neither total nor free testosterone appears in the images. This afternoon draw cannot establish testosterone deficiency. If symptoms such as low libido persist, the clinician can assess whether separate morning fasting total testosterone measurements are indicated."
        },
        {
          "id": "review-questions",
          "n": "Questions for your visit",
          "v": "",
          "tip": "<ol><li>Do you snore loudly, wake up gasping, or has anyone noticed pauses in your breathing?</li><li>Have you nodded off while driving or during activities where falling asleep could be dangerous?</li><li>Had you gone at least eight hours without calories before the blood draw?</li></ol>"
        }
      ]
    }
  ],
  "note": "Single draw; trend unavailable. <a href=\"https://www.niddk.nih.gov/health-information/diabetes/overview/tests-diagnosis\">NIDDK diabetes tests</a> · <a href=\"https://www.nhlbi.nih.gov/health/sleep-apnea/symptoms\">NHLBI sleep apnea symptoms</a> · <a href=\"https://www.endocrine.org/clinical-practice-guidelines/testosterone-therapy\">Endocrine Society testosterone guideline</a>."
};
window.renderLabs();
if (new URLSearchParams(location.search).get("tab") === "labs") window.go("labs");
