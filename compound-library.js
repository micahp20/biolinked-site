/* ======================================================================
   BioLinked shared compound library — the SINGLE source of compound prose.
   ----------------------------------------------------------------------
   Three fields per compound feed the Index detail screens:
     sub   -> "What it is"        one-line plain definition / class
     mech  -> "How it works"      mechanism, receptor target, pathway
     goal  -> "Why people use it" what it is run for   (+ notes below)
     notes -> practical context, stacking, availability

   Extracted verbatim from the vetted copy that already shipped in the
   public Peptide Index, so nothing here is newly generated science.
   Edit a compound HERE and both the public Index and every protocol
   page's Index detail pick it up - that is the point of this file.

   Research and educational reference only. Not medical advice.
   ====================================================================== */
var BL_LIB = {
 "5-Amino-1MQ": {
  "goal": "Metabolic enhancement, fat storage reduction, NAD+ optimization",
  "mech": "Inhibits NNMT (nicotinamide N-methyltransferase), an enzyme that converts NAD+ to a methylated form, reducing fat cell formation and boosting cellular energy metabolism. Reduces fat storage at the cellular level while preserving NAD+ availability.",
  "notes": "Available as 5AM at Bio Linked. Works synergistically with NAD+ protocols and GLP-1 therapy. Oral delivery makes it convenient. Excellent for clients who want metabolic optimization without injectable peptides.",
  "sub": "NNMT Enzyme Inhibitor"
 },
 "AHK-Cu": {
  "goal": "Hair growth stimulation, follicle health, scalp improvement",
  "mech": "Copper peptide complex (Ala-His-Lys-Cu) researched for hair follicle health and growth stimulation. Activates follicle stem cells, improves scalp blood circulation, and stimulates follicle-supporting growth factors.",
  "notes": "Popular in hair loss prevention protocols. Pairs with Pal-AHK for comprehensive follicle support.",
  "sub": "Copper Peptide for Hair"
 },
 "AICAR": {
  "goal": "Fat oxidation, metabolic adaptation, exercise-mimetic effects",
  "mech": "AMP-kinase (AMPK) activator that mimics low-energy cellular states, promoting fat oxidation, mitochondrial biogenesis, and glucose uptake without exercise. Researched as an exercise mimetic for metabolic adaptation.",
  "notes": "One of the original exercise mimetics. Pairs well with MOTS-c and SLU-PP-332 for comprehensive metabolic activation. More established research than SLU-PP-332. Increases endurance capacity in research models.",
  "sub": "AMPK Activator / Exercise Mimetic"
 },
 "AOD-9604": {
  "goal": "Targeted fat loss, lipolysis, body composition",
  "mech": "Modified fragment of HGH containing the fat-burning region without growth-promoting effects. Directly activates fat cell lipolysis through beta-3 adrenergic receptor stimulation. No effect on blood glucose or IGF-1.",
  "notes": "Available as 5AD at Bio Linked. Excellent add-on to GLP-1 protocols for enhanced targeted fat burning. No blood sugar effects unlike full HGH. Specifically targets visceral and subcutaneous fat.",
  "sub": "HGH Fragment 176-191 Modified"
 },
 "ARA-290": {
  "goal": "Neuropathic pain relief, tissue repair, nerve protection",
  "mech": "Derived from the non-hematopoietic region of erythropoietin (EPO). Activates innate repair receptor without blood-stimulating effects of EPO. Promotes tissue repair, reduces neuroinflammation, and provides neuropathic pain relief through anti-apoptotic mechanisms.",
  "notes": "Particularly valuable for diabetic neuropathy, small fiber neuropathy, and chronic pain research. Does not raise red blood cell count like EPO. Emerging research for sarcoidosis-related neuropathy.",
  "sub": "Erythropoietin-Derived Peptide"
 },
 "Adamax": {
  "goal": "Enhanced cognitive effects vs Semax",
  "mech": "Enhanced variant of Semax with modifications for improved potency and/or duration. Developed for cognitive enhancement research with similar BDNF-upregulating and neuroprotective properties to Semax.",
  "notes": "Consider as an upgrade from standard Semax for clients who have plateaued. Limited comparative data.",
  "sub": "Enhanced Semax Variant"
 },
 "Adipotide": {
  "goal": "Targeted fat cell elimination, visceral fat reduction",
  "mech": "Proapoptotic peptide that selectively targets and induces programmed cell death (apoptosis) in fat cell vasculature, reducing blood supply to adipose tissue. Unique mechanism: eliminates fat cells rather than just shrinking them.",
  "notes": "Highly experimental. Shows dramatic visceral fat reduction in primate studies. Kidney function monitoring recommended. Represents a fundamentally different approach to fat loss \u2014 ablation vs. suppression. Not widely available.",
  "sub": "Proapoptotic Peptide / Fat Cell Targeting"
 },
 "Argireline": {
  "goal": "Expression wrinkle reduction, muscle relaxation",
  "mech": "Cosmetic peptide mimicking the N-terminal end of SNAP-25 \u2014 inhibits neuromuscular junction signaling to reduce muscle contractions that cause expression lines.",
  "notes": "Most popular topical anti-wrinkle peptide. Pairs with Syn-Ake for enhanced NMJ inhibition.",
  "sub": "Acetyl Hexapeptide-3 \u2014 Topical Botox-Like"
 },
 "BPC-157": {
  "goal": "Tissue healing, gut repair, tendon & ligament recovery",
  "mech": "Activates VEGFR2 signaling for angiogenesis; upregulates growth hormone receptors in injured tissue; modulates nitric oxide and FAK-paxillin pathways for accelerated cell migration and repair. Heals gut lining, tendons, ligaments, and muscle.",
  "notes": "#1 most researched healing peptide. Can be taken orally for gut-specific benefits (swallowed in BAC water). Often stacked with TB-500 as 'The Wolverine Stack'. Available as premix BB10 at Bio Linked.",
  "sub": "Body Protection Compound-157"
 },
 "Bronchogen": {
  "goal": "Bronchial tissue support, respiratory function, COPD research",
  "mech": "Khavinson tetrapeptide functioning as a DNA-stabilizing agent with bronchodilating and anti-inflammatory properties specific to respiratory tissue. Modulates airway epithelial gene expression, reduces inflammation in bronchial tissue.",
  "notes": "Primary lung/respiratory bioregulator. Research applications include COPD, bronchial asthma, and post-infection respiratory recovery. Pairs with Chonluten for comprehensive respiratory protocol.",
  "sub": "Lung & Respiratory Cytogen"
 },
 "CJC-1295": {
  "goal": "Optimize natural GH output, lean mass, recovery, sleep",
  "mech": "GHRH (growth hormone-releasing hormone) analog that extends the duration of natural GH pulses from the pituitary. No DAC version has shorter half-life creating more physiologic pulsatile release. Synergizes powerfully with GHRPs like Ipamorelin.",
  "notes": "Available as CND5/10 and as premix CP10 (with Ipamorelin) at Bio Linked. Most widely used GH peptide globally. No cortisol or prolactin spike. Stack with Ipamorelin for dual-pathway GH amplification.",
  "sub": "GHRH Analog (No DAC)"
 },
 "Cagrilintide": {
  "goal": "Appetite regulation, weight management, complementary GLP-1 stack",
  "mech": "Long-acting amylin receptor agonist mimicking the satiety hormone amylin. Works through a complementary pathway to GLP-1 \u2014 enhances satiety signaling from the brainstem and reduces gastric motility through a different receptor than GLP-1.",
  "notes": "Particularly powerful when stacked with semaglutide (CagriSema combination showed 25%+ weight loss in early trials). Complementary mechanism to GLP-1 agonists makes it ideal for combination therapy research.",
  "sub": "Long-Acting Amylin Analog"
 },
 "Cardiogen": {
  "goal": "Cardiac tissue support, myocardial health, cardiovascular function",
  "mech": "Khavinson tetrapeptide targeting cardiac muscle cells (cardiomyocytes). Supports myocardial gene expression, contractile protein synthesis, and cardiac cell function. Researched for age-related cardiac decline and cardiac tissue maintenance.",
  "notes": "Cardiac bioregulator. Pairs with Vesugen (vascular) for comprehensive cardiovascular support stack.",
  "sub": "Cardiac Tissue Cytogen"
 },
 "Cartalax": {
  "goal": "Cartilage regeneration, joint health, bone metabolism",
  "mech": "Khavinson tetrapeptide (Ala-Glu-Asp) targeting chondrocytes and osteoblasts. Normalizes gene expression for collagen type II and proteoglycan production. Reduces MMP-9 degradation enzymes, inhibits caspase-3 apoptosis in cartilage cells, upregulates Ki-67 proliferation markers by 20\u201330%.",
  "notes": "Available at Bio Linked. The cartilage and bone bioregulator. Pairs excellently with BPC-157/TB-500 for comprehensive joint recovery. Russian clinical data shows joint comfort improvements 2\u20134 weeks post-course.",
  "sub": "Cartilage & Bone Cytogen"
 },
 "Cerebrolysin": {
  "goal": "Cognitive recovery, neuroprotection, brain repair",
  "mech": "Mixture of neuropeptides and amino acids derived from pig brain tissue. Provides neurotrophic support similar to BDNF and NGF. Widely used in Eastern Europe/Asia for stroke recovery, TBI, and age-related cognitive decline. Extensive clinical trial data.",
  "notes": "Has the most robust clinical data of any nootropic peptide \u2014 used in hospitals in Europe and Asia. Particularly strong for post-stroke and TBI recovery. Requires injection or IV. Confirm availability.",
  "sub": "Neuropeptide Mixture \u2014 Brain Recovery"
 },
 "Chonluten": {
  "goal": "Respiratory epithelial regeneration, lung tissue, GI mucosal health",
  "mech": "Khavinson bioregulator targeting respiratory epithelial cells and GI mucosa. Modulates respiratory gene expression, oxidative response, and cytokine balance.",
  "notes": "Dual respiratory/GI bioregulator. Pairs with Bronchogen for lung health stack. Synergistic with KPV for GI inflammatory conditions.",
  "sub": "Lung & GI Epithelial Cytogen"
 },
 "Cortagen": {
  "goal": "Brain cortex support, neuroprotection, cognitive aging",
  "mech": "Khavinson tetrapeptide targeting cerebral cortex cells. Modulates chromatin accessibility and transcriptional activation in CNS tissue. Influences gene expression patterns associated with cellular stress responses and oxidative balance in neural cells.",
  "notes": "CNS bioregulator for brain aging. Pairs with Semax/Selank for comprehensive cognitive protocol. Stack with Pinealon for brain aging.",
  "sub": "Cerebral Cortex & CNS Cytogen"
 },
 "DSIP": {
  "goal": "Sleep quality improvement, stress recovery, relaxation",
  "mech": "Neuropeptide that promotes delta (slow-wave) sleep stages and modulates stress response via CRH pathways. Reduces cortisol during stress and promotes deeper, more restorative sleep architecture.",
  "notes": "Interesting option for sleep-focused protocols. Pairs well with CJC-1295/Ipamorelin for comprehensive sleep optimization. Non-habit forming unlike pharmaceutical sleep aids.",
  "sub": "Delta Sleep-Inducing Peptide"
 },
 "Decapeptide-12": {
  "goal": "Hyperpigmentation reduction, dark spot treatment, brightening",
  "mech": "Synthetic skin-lightening peptide inhibiting tyrosinase activity \u2014 the key enzyme in melanin biosynthesis.",
  "notes": "Combines with Nonapeptide-1 for multi-mechanism brightening.",
  "sub": "Tyrosinase Inhibitor \u2014 Brightening"
 },
 "Dermorphin": {
  "goal": "Analgesic research, pain relief studies",
  "mech": "Naturally occurring opioid peptide isolated from South American frog skin. Activates mu-opioid receptors with high potency and selectivity \u2014 30\u201340\u00d7 more potent than morphine in preclinical models while maintaining selectivity.",
  "notes": "Research compound \u2014 not for human use. Interesting for pain research due to selective opioid receptor activity. Limited practical application outside specific research contexts.",
  "sub": "Natural Opioid Peptide"
 },
 "Dihexa": {
  "goal": "Synaptogenesis, memory enhancement, executive function",
  "mech": "Derived from angiotensin IV \u2014 potentiates HGF/c-Met signaling pathway to promote synapse formation (synaptogenesis). Reportedly 7 orders of magnitude more potent than BDNF in crossing the blood-brain barrier. Promotes long-term cognitive improvement.",
  "notes": "Most potent nootropic peptide known. Start at 10 mg and do not exceed 15 mg weekly. Effects accumulate \u2014 results continue building weeks after dosing. Confirm stock. Stack with Semax/Selank for comprehensive cognitive protocol.",
  "sub": "Angiotensin IV Derivative \u2014 Potent Nootropic"
 },
 "Dulaglutide": {
  "goal": "Blood sugar regulation, cardiovascular risk reduction",
  "mech": "Once-weekly GLP-1 receptor agonist (Trulicity) with strong cardiovascular outcomes data. Primarily used for T2D management. Auto-injector delivery makes compliance easier.",
  "notes": "Primarily a diabetes medication but used in metabolic health protocols. Less weight loss than semaglutide or tirzepatide. Strong cardiovascular safety data. Convenient auto-injector format.",
  "sub": "Once-Weekly GLP-1 Agonist"
 },
 "Eloralintide": {
  "goal": "Weight management via amylin pathway",
  "mech": "Novel amylin receptor agonist (LY3841136) in development by Eli Lilly. Acts through amylin satiety pathway complementary to GLP-1. Being studied in combination with GLP-1 agonists for additive weight loss.",
  "notes": "Very early stage. Phase 1/2 data promising. Designed to stack with GLP-1 agonists for enhanced weight loss. The amylin+GLP-1 combination (like cagrilintide+sema) is becoming a major research focus.",
  "sub": "Investigational Amylin Receptor Agonist"
 },
 "Enclomiphene": {
  "goal": "Testosterone restoration, fertility support",
  "mech": "SERM (selective estrogen receptor modulator) that blocks estrogen feedback to hypothalamus, increasing LH and FSH release, which drives natural testosterone production. Restores testosterone without suppressing sperm production.",
  "notes": "Alternative to TRT for men wanting testosterone restoration while maintaining fertility. Increases endogenous T production rather than replacing it. Growing use in men's health clinics.",
  "sub": "Selective Estrogen Receptor Modulator"
 },
 "Epithalon": {
  "goal": "Telomere support, cellular anti-aging, circadian regulation",
  "mech": "Synthetic tetrapeptide from pineal gland research by Khavinson. Activates telomerase enzyme \u2014 promotes telomere elongation in somatic cells. Regulates pineal melatonin production and circadian rhythms. Human studies show increased lifespan and improved immune function.",
  "notes": "Available at Bio Linked \u2014 confirm stock. Most evidence-backed anti-aging peptide. The quarterly 10-day protocol is standard. Stack with GHK-Cu and NAD+ for comprehensive longevity protocol. Human longevity data from Russian 40-year studies.",
  "sub": "Pineal Gland Tetrapeptide"
 },
 "FOXO4-DRI": {
  "goal": "Senescent cell clearance, cellular renewal, anti-aging",
  "mech": "Designed to interrupt FOXO4-p53 interaction in senescent cells, triggering apoptosis selectively in 'zombie cells' that accumulate with age and promote inflammation and tissue dysfunction. Does not harm healthy cells.",
  "notes": "Experimental senolytic \u2014 eliminates senescent cells that contribute to aging. Emerging research area. Shows restoration of fitness, fur density, and kidney function in aged mouse models. Confirm availability.",
  "sub": "Senolytic Peptide"
 },
 "Follistatin 315": {
  "goal": "Localized muscle support, lean mass preservation",
  "mech": "Tissue-bound isoform of follistatin with more localized myostatin-blocking activity compared to the systemic Follistatin 344. Targets muscle tissue more specifically with less systemic distribution.",
  "notes": "Preferred over Follistatin 344 when localized effect is desired. Less systemic activity means potentially fewer off-target effects. Emerging research compound \u2014 confirm stock.",
  "sub": "Myostatin Inhibitor \u2014 Localized Form"
 },
 "Follistatin 344": {
  "goal": "Maximum muscle growth, myostatin suppression",
  "mech": "Naturally occurring glycoprotein that binds and inhibits myostatin (the protein that limits muscle growth) and activin. Follistatin 344 is the circulating form with systemic effects throughout the body.",
  "notes": "Very potent muscle growth research compound. Short cycles recommended. Widely discussed in bodybuilding research. Combines well with IGF-1 protocols. Not widely available \u2014 confirm stock.",
  "sub": "Myostatin Inhibitor \u2014 Circulating Form"
 },
 "GHK-Cu": {
  "goal": "Skin rejuvenation, collagen production, wound healing",
  "mech": "Copper-binding tripeptide upregulates collagen I/III synthesis, glycosaminoglycans, and antioxidant enzymes. Stimulates VEGF and fibroblast growth factors. Reduces MMP-9 enzyme activity that degrades extracellular matrix during aging.",
  "notes": "Available as GLOW Formula (BBG70) at Bio Linked. Clinical studies show 35% reduction in fine lines. Pairs with BPC-157 for comprehensive skin + tissue healing. Also shows hair follicle stimulation properties.",
  "sub": "Copper Peptide Gly-His-Lys"
 },
 "GHRP-2": {
  "goal": "Potent GH release, muscle, recovery",
  "mech": "One of the most potent synthetic GHRPs \u2014 stimulates strong GH release from pituitary via ghrelin receptor. More potent than Ipamorelin but also stimulates cortisol and prolactin at higher doses. Also increases appetite.",
  "notes": "More powerful but less 'clean' than Ipamorelin. Cortisol increase is dose-dependent \u2014 keep doses moderate. Best for clients wanting maximum GH output who can tolerate appetite stimulation. Stack with CJC-1295.",
  "sub": "Growth Hormone Releasing Peptide-2"
 },
 "GHRP-6": {
  "goal": "GH release, appetite stimulation, muscle building",
  "mech": "Potent GHRP that stimulates strong GH release while also significantly increasing appetite through ghrelin receptor activation. Can increase food intake by 30\u201340% in research models \u2014 useful for clients who need to eat more.",
  "notes": "Primarily useful when appetite stimulation is desired (underweight, muscle-building, post-illness). Not ideal for weight loss clients due to hunger effect. Very affordable. Stack with CJC-1295.",
  "sub": "Growth Hormone Releasing Peptide-6"
 },
 "Glutathione": {
  "goal": "Detoxification, antioxidant protection, skin brightening",
  "mech": "The body's primary antioxidant \u2014 tripeptide (Glu-Cys-Gly) neutralizing free radicals, supporting liver detoxification pathways, and protecting cells from oxidative damage. Injectable GSH bypasses oral degradation for superior systemic delivery.",
  "notes": "Available as GTT600/GTT1500 at Bio Linked. Skin brightening effect at higher doses. Pairs with NAD+ for comprehensive cellular health protocol. Pairs with Vitamin C IM for enhanced antioxidant effect.",
  "sub": "Master Antioxidant Tripeptide"
 },
 "Gonadorelin": {
  "goal": "LH/FSH stimulation, testosterone support, TRT adjunct",
  "mech": "Synthetic form of gonadotropin-releasing hormone (GnRH) that stimulates pituitary release of LH and FSH. Maintains the HPG axis function \u2014 prevents pituitary desensitization from TRT. Supports natural testosterone production and testicular function.",
  "notes": "Increasingly preferred over HCG for maintaining testicular function during TRT as HCG shortages increase. Supports natural testosterone production pathway. Prevents testicular atrophy during exogenous testosterone use.",
  "sub": "Synthetic GnRH"
 },
 "HCG": {
  "goal": "Testosterone support, testicular function during TRT",
  "mech": "Mimics LH at Leydig cells in the testes \u2014 maintains testosterone production and testicular volume during TRT-induced LH suppression. Prevents testicular atrophy, maintains fertility signals, and supports intratesticular testosterone.",
  "notes": "Available as GK5/G10K at Bio Linked. Standard adjunct for TRT protocols. Note: FDA has restricted compounded HCG, making Gonadorelin an alternative worth considering.",
  "sub": "Human Chorionic Gonadotropin"
 },
 "HGH Fragment 176-191": {
  "goal": "Fat loss, lipolysis, body composition",
  "mech": "Fragment of HGH containing the fat-burning region (amino acids 176\u2013191) without growth-promoting properties. Activates beta-3 adrenergic receptor in fat cells.",
  "notes": "Alternative to AOD-9604. Best results with fasted dosing. No effect on blood glucose or IGF-1 \u2014 safe for diabetics.",
  "sub": "Fat-Burning HGH Fragment"
 },
 "Hexarelin": {
  "goal": "Maximum GH output, muscle, cardioprotection",
  "mech": "Considered the most potent GHRP available \u2014 produces the strongest GH secretion of any GHRP. Unlike other GHRPs, maintains potency even after repeated administration. Also shows unique cardioprotective properties through GHS-R1b receptors.",
  "notes": "Reserve for maximum GH output protocols. Cardioprotective data makes it interesting for cardiovascular health applications. Cortisol/prolactin elevation similar to GHRP-2. Stack with GHRH analog.",
  "sub": "Most Potent GHRP"
 },
 "Humanin": {
  "goal": "Neuroprotection, mitochondrial support, anti-aging",
  "mech": "Mitochondria-derived peptide (MDP) discovered in 2001. Protects neurons from amyloid-beta toxicity and other apoptotic stimuli. Supports mitochondrial function and has anti-inflammatory, cytoprotective effects throughout the body.",
  "notes": "Interesting for neurodegenerative disease research and longevity. Declines with age in humans \u2014 making supplementation theoretically beneficial. Synergistic with MOTS-c (both are mitochondria-derived).",
  "sub": "Mitochondria-Derived Peptide"
 },
 "IGF-1 DES": {
  "goal": "Enhanced local muscle growth, hyperplasia",
  "mech": "Truncated IGF-1 lacking first 3 amino acids, making it 5\u201310\u00d7 more potent than standard IGF-1 due to minimal binding protein affinity. Effects are more localized \u2014 injected near target muscle for site-specific hypertrophy research.",
  "notes": "Used for localized muscle growth research. More potent than LR3 but shorter half-life (30 min) so effects are site-specific. Best for bodybuilding research protocols targeting specific lagging muscle groups.",
  "sub": "Truncated IGF-1 \u2014 High Potency"
 },
 "IGF-1 LR3": {
  "goal": "Muscle growth, cellular proliferation, recovery",
  "mech": "Modified IGF-1 with reduced binding protein affinity \u2014 ~20-hour half-life vs 20 minutes for native IGF-1. Primary downstream mediator of GH: promotes muscle hypertrophy, fat oxidation, cellular repair, and protein synthesis throughout body.",
  "notes": "Available as IG1 at Bio Linked. Pairs powerfully with HGH. Only one injection needed daily due to long half-life. Monitor blood glucose \u2014 can cause hypoglycemia. Use DES variant for more localized muscle effects.",
  "sub": "Extended Half-Life IGF-1"
 },
 "Ipamorelin": {
  "goal": "Clean GH pulse amplification, anti-aging, recovery",
  "mech": "Selective GHRP (growth hormone-releasing peptide) that amplifies the amplitude of GH pulses without significantly affecting cortisol, prolactin, or appetite. Most selective and cleanest GHRP available \u2014 ideal first GH secretagogue.",
  "notes": "Available as IP10 and as premix CP10 (with CJC-1295) at Bio Linked. The gold standard pairing: CJC-1295 extends pulse duration, Ipamorelin amplifies pulse amplitude. No hunger or cortisol side effects.",
  "sub": "Selective GHRP"
 },
 "KPV": {
  "goal": "Anti-inflammatory, gut healing, IBS/IBD support",
  "mech": "Tripeptide fragment of alpha-MSH that directly inhibits NF-\u03baB signaling and pro-inflammatory cytokine cascade. Reduces intestinal inflammation at the mucosal level. Calms immune overactivation in gut and skin tissue.",
  "notes": "Key component of Bio Linked's KLOW blend. Especially effective for IBS, Crohn's, leaky gut, and inflammatory skin conditions. Can be swallowed in BAC water for direct GI anti-inflammatory effect.",
  "sub": "Alpha-MSH Tripeptide Fragment"
 },
 "Kisspeptin-10": {
  "goal": "Libido, hormone axis stimulation, reproductive function",
  "mech": "Neuropeptide that activates GPR54 receptor \u2014 the master regulator of reproductive hormone cascade. Stimulates GnRH release, triggering LH and FSH, which then drive testosterone/estrogen production. Addresses libido at the hormonal root.",
  "notes": "Particularly interesting for low libido linked to low LH/testosterone. Different mechanism from PT-141 \u2014 hormonal vs. CNS. Emerging use in fertility protocols and hypogonadism research.",
  "sub": "Reproductive Hormone Axis Activator"
 },
 "LL-37": {
  "goal": "Wound healing, antimicrobial defense, immune modulation",
  "mech": "Naturally occurring cathelicidin peptide with broad-spectrum antimicrobial activity. Promotes wound healing through keratinocyte migration, angiogenesis, and re-epithelialization. Modulates innate immune response without overstimulation.",
  "notes": "Excellent addition to healing protocols where infection risk is present or wound healing is impaired. Synergistic with BPC-157 for chronic wound or post-surgical recovery. Emerging use in antibiotic-resistant infection research.",
  "sub": "Human Cathelicidin Antimicrobial Peptide"
 },
 "Liraglutide": {
  "goal": "Weight management, blood sugar regulation",
  "mech": "First-generation GLP-1 receptor agonist (Victoza/Saxenda). Daily dosing due to shorter half-life than semaglutide. Suppresses appetite, improves glycemic control, and has cardiovascular risk reduction data.",
  "notes": "The original daily GLP-1. Generally replaced by once-weekly options (semaglutide, tirzepatide) for convenience but some clients prefer daily dosing for more consistent effect. FDA-approved for both diabetes and weight loss.",
  "sub": "First-Generation GLP-1 Agonist"
 },
 "Livagen": {
  "goal": "Liver tissue support, hepatocyte function, chromatin remodeling",
  "mech": "Khavinson tetrapeptide (Lys-Glu-Asp-Ala) targeting hepatic cells. Promotes chromatin decondensation in hepatocytes, potentially restoring gene expression patterns altered by aging or damage.",
  "notes": "Liver bioregulator. Pairs with Ovagen (GI/liver) for comprehensive hepatic support.",
  "sub": "Liver Tissue Cytogen"
 },
 "MGF": {
  "goal": "Local muscle repair, satellite cell activation",
  "mech": "Splice variant of IGF-1 produced in response to muscle stretching and damage. Activates muscle satellite (stem) cells for repair and growth. Short half-life (minutes) means effects are highly localized to injection site.",
  "notes": "Pairs well with PEG-MGF (extended half-life version) or IGF-1 LR3. Rapidly clears so must inject immediately post-workout. Research use for muscle recovery and hypertrophy.",
  "sub": "Mechano Growth Factor"
 },
 "MK-677": {
  "goal": "GH/IGF-1 elevation, sleep quality, convenience",
  "mech": "Oral ghrelin mimetic activating GHS-R1a receptor \u2014 stimulates GH and IGF-1 release without injection. Raises IGF-1 by 60\u201370%. The only oral GH secretagogue available. Also improves deep sleep (REM and slow-wave).",
  "notes": "Best for clients who won't inject. Significantly increases appetite \u2014 take with dinner to buffer. Excellent for sleep improvement, recovery, and anti-aging in older clients. Water retention common at higher doses.",
  "sub": "Ibutamoren \u2014 Oral GH Secretagogue"
 },
 "MOTS-c": {
  "goal": "Mitochondrial restoration, metabolic reset, exercise mimetic",
  "mech": "Mitochondria-derived peptide that activates AMPK pathway, improving insulin sensitivity, mitochondrial biogenesis, and metabolic flexibility. Mimics exercise effects at cellular level. Reduces neuroinflammation and supports longevity pathways.",
  "notes": "Available as MS10/MS40 at Bio Linked. Foundation of mitochondrial and metabolic protocols. Pairs with NAD+ and SS-31 for complete cellular energy optimization.",
  "sub": "Mitochondrial Peptide \u2014 Exercise Mimetic"
 },
 "Matrixyl": {
  "goal": "Collagen synthesis, ECM production, wrinkle reduction",
  "mech": "Lipopeptide that stimulates fibroblasts to produce collagen, fibronectin, and hyaluronic acid. Mimics collagen breakdown fragments to trigger repair response.",
  "notes": "Foundational topical anti-aging peptide. Pairs with Rigin in premium anti-aging formulations.",
  "sub": "Palmitoyl Pentapeptide-4 \u2014 Collagen Stimulator"
 },
 "Mazdutide": {
  "goal": "Weight loss, metabolic enhancement",
  "mech": "Dual GLP-1 and glucagon receptor co-agonist developed in China with strong Phase 2 weight loss data. Glucagon component increases energy expenditure and liver fat oxidation on top of GLP-1-mediated appetite suppression.",
  "notes": "Emerging compound with impressive Phase 2 trial results. Represents next generation of dual-mechanism metabolic peptides. Less widely studied than Tirzepatide in Western research but gaining attention rapidly.",
  "sub": "GLP-1/Glucagon Dual Agonist"
 },
 "Melanotan I": {
  "goal": "Tanning, melanin production, skin protection research",
  "mech": "Melanocortin peptide with more selective MC1R targeting compared to Melanotan II \u2014 less libido effect. Primarily stimulates melanogenesis for UV-protective tanning.",
  "notes": "Cleaner tanning effect vs MT2 with less libido side effect. More selective MC1R activation.",
  "sub": "Melanocortin \u2014 Selective Tanning"
 },
 "Melanotan II": {
  "goal": "Skin tanning, melanin production, libido enhancement",
  "mech": "Synthetic melanocortin peptide activating MC1R (tanning), MC3R, and MC4R (libido). Stimulates melanogenesis for UV-independent tanning. Also activates desire pathway (shares receptor with PT-141).",
  "notes": "Nausea and facial flushing common with first doses \u2014 start at 0.25 mg and titrate. Unwanted erections in men possible (shared MC4R with PT-141). Reduces UV exposure needed for tanning.",
  "sub": "Melanocortin Tanning Peptide"
 },
 "NAD+": {
  "goal": "Cellular energy, DNA repair, recovery, longevity",
  "mech": "Essential coenzyme for every energy-producing reaction in the body. Powers sirtuin (SIRT1/3) longevity pathways, supports mitochondrial function, and activates DNA repair mechanisms. Declines 50%+ with age. Injectable NAD+ provides superior bioavailability vs oral precursors.",
  "notes": "Available as NJ500 at Bio Linked. Backbone of longevity protocols. Reduces cravings, improves mood stability, supports dopamine receptor repair. Mild flushing normal \u2014 slow injection resolves it.",
  "sub": "Nicotinamide Adenine Dinucleotide"
 },
 "Nonapeptide-1": {
  "goal": "Skin brightening, melanin inhibition, pigmentation control",
  "mech": "Synthetic peptide blocking alpha-MSH binding to MC1R receptors \u2014 inhibits melanin synthesis for skin brightening.",
  "notes": "Effective brightening peptide. Pairs with injectable Glutathione for comprehensive brightening protocol.",
  "sub": "MSH Inhibitor \u2014 Skin Brightening"
 },
 "Orforglipron": {
  "goal": "Weight loss via oral GLP-1 activation (no injections)",
  "mech": "Small molecule non-peptide GLP-1 receptor agonist that can be taken orally \u2014 no injection required. Activates same pathway as semaglutide/tirzepatide but in pill form. Phase 3 trials ongoing (Eli Lilly).",
  "notes": "The future of GLP-1 therapy \u2014 if trials succeed, this eliminates the injection barrier entirely. Currently in Phase 3. Watch for FDA approval timeline. Game-changer for patient compliance.",
  "sub": "Oral Non-Peptide GLP-1 Agonist"
 },
 "Ovagen": {
  "goal": "Liver and GI support, hepatic function, mucosal health",
  "mech": "Khavinson bioregulator tripeptide targeting liver and gastrointestinal mucosal tissue. Supports hepatic cell function and GI mucosal health.",
  "notes": "GI/liver bioregulator. Pairs with Livagen and BPC-157 for comprehensive gut-liver health stack.",
  "sub": "Liver & GI Tract Cytogen"
 },
 "Oxytocin": {
  "goal": "Social bonding, stress reduction, reproductive function",
  "mech": "Naturally occurring neuropeptide involved in social bonding, trust, empathy, and reproductive behavior. Reduces cortisol and anxiety during social situations. Used in sexual health protocols for emotional intimacy enhancement and postpartum support.",
  "notes": "Available via prescription. Growing use in relationship therapy and sexual health. Pairs with PT-141 for comprehensive intimacy protocol. Anti-anxiety effects can help performance anxiety.",
  "sub": "Bonding Hormone"
 },
 "P21": {
  "goal": "Cognitive enhancement, neurogenesis, memory",
  "mech": "Synthetic peptide designed to mimic BDNF (Brain-Derived Neurotrophic Factor) effects. Activates TrkB receptors promoting neurogenesis, synaptic plasticity, and memory formation without systemic BDNF side effects.",
  "notes": "Safer than direct BDNF administration. Research shows improved spatial memory and learning in preclinical models. Good stack companion with Semax for comprehensive BDNF-pathway cognitive enhancement.",
  "sub": "BDNF Mimetic Nootropic"
 },
 "PE-22-28": {
  "goal": "Antidepressant effects, mood support, cognitive enhancement",
  "mech": "Synthetic peptide analog of Spadin (a natural antidepressant peptide). Blocks TREK-1 potassium channels \u2014 same target as many antidepressants. Shows rapid antidepressant-like effects with potential cognitive enhancement properties.",
  "notes": "Interesting alternative for clients seeking antidepressant support through peptide mechanisms rather than pharmaceutical SSRIs. Emerging compound \u2014 limited human data but promising preclinical results.",
  "sub": "Spadin Analog \u2014 Antidepressant Nootropic"
 },
 "PEG-MGF": {
  "goal": "Systemic muscle repair, extended satellite cell activation",
  "mech": "Pegylated version of MGF \u2014 polyethylene glycol (PEG) attachment extends half-life from minutes to days. Allows once or twice weekly dosing while maintaining systemic satellite cell activation for muscle repair.",
  "notes": "More practical than native MGF due to extended half-life. Better for systemic muscle support vs localized repair. Can be dosed anywhere due to improved stability.",
  "sub": "Pegylated Mechano Growth Factor"
 },
 "PGPIPN": {
  "goal": "Anti-inflammation, tissue repair, immunomodulation",
  "mech": "Therapeutic hexapeptide (Pro-Gly-Pro-Ile-Pro-Asn) that modulates inflammatory cytokine cascades. Inhibits pro-inflammatory signaling while supporting tissue repair mechanisms. Researched for chronic inflammatory conditions.",
  "notes": "Emerging research compound. Shows promise in chronic inflammatory conditions and autoimmune-adjacent applications. Can be stacked with KPV for comprehensive anti-inflammatory protocols.",
  "sub": "Anti-Inflammatory Hexapeptide"
 },
 "PNC-27": {
  "goal": "Selective abnormal cell targeting research",
  "mech": "Experimental peptide designed with an HDM-2 binding domain and a transmembrane-penetrating domain. Researched for selective effects on abnormal cells while potentially sparing healthy cells. Mechanism involves membrane disruption in target cells.",
  "notes": "Highly experimental with limited human data. Pre-clinical research only. Confirm stock and research context before considering. Not for general wellness protocols \u2014 specialized research application.",
  "sub": "Experimental Anti-Cancer Research Peptide"
 },
 "PT-141": {
  "goal": "Sexual arousal, libido enhancement",
  "mech": "Melanocortin receptor agonist activating MC3R and MC4R in the brain \u2014 stimulates desire through CNS rather than vascular mechanism. Works for both men and women. FDA-approved (Vyleesi) for premenopausal women with HSDD.",
  "notes": "Available as P41 at Bio Linked. Unlike Viagra/Cialis which work on blood flow mechanics, PT-141 works on desire. Nausea most common side effect \u2014 start at 0.5 mg. Effective for both men and women.",
  "sub": "Bremelanotide \u2014 Central Desire Peptide"
 },
 "Pal-AHK": {
  "goal": "Hair follicle stimulation, scalp health, hair thickness",
  "mech": "Lipopeptide combining palmitoyl group with AHK copper-binding sequence. Promotes hair follicle stem cell activity.",
  "notes": "Pairs with AHK-Cu for comprehensive topical hair protocol.",
  "sub": "Palmitoyl Tripeptide-3 \u2014 Hair Follicle"
 },
 "Pal-GHK": {
  "goal": "Enhanced collagen synthesis, skin repair, anti-aging",
  "mech": "Lipopeptide form of GHK with palmitoyl group improving skin penetration. Stimulates collagen production and skin repair.",
  "notes": "Topical version of GHK for clients not using injectable GHK-Cu. Pairs with Rigin.",
  "sub": "Palmitoyl Tripeptide-1 \u2014 Enhanced GHK"
 },
 "Palmitoyl Dipeptide-6": {
  "goal": "Skin cell renewal, anti-aging, retinol alternative",
  "mech": "Lipopeptide mimicking retinol-like effects by stimulating skin renewal pathways without retinoid irritation.",
  "notes": "Excellent retinol alternative for sensitive skin. Pairs with collagen stimulators.",
  "sub": "Retinol-Like Renewal Peptide"
 },
 "Pancragen": {
  "goal": "Pancreatic tissue support, beta-cell function, glucose metabolism",
  "mech": "Khavinson tetrapeptide targeting pancreatic tissue, specifically beta-cells. Researched for restoration of insulin-producing cell function and glucose regulation mechanisms.",
  "notes": "Pancreatic bioregulator. Pairs with GLP-1 protocols for comprehensive metabolic support.",
  "sub": "Pancreatic & Beta-Cell Cytogen"
 },
 "Pentapeptide-18": {
  "goal": "Expression wrinkle reduction, synergistic NMJ inhibition",
  "mech": "Cosmetic peptide with opioid receptor modulation that reduces enkephalin release, indirectly reducing muscle contraction signals.",
  "notes": "Best used with Argireline for synergy. Standard in premium eye cream formulations.",
  "sub": "Leuphasyl \u2014 Expression Line Reducer"
 },
 "Pinealon": {
  "goal": "Brain aging, pineal function, cognitive support",
  "mech": "Khavinson tripeptide developed for brain aging and pineal gland function. Researched for neuroprotective activity in age-related cognitive decline, circadian rhythm support, and brain cell maintenance.",
  "notes": "Brain bioregulator. Pairs with Cortagen for CNS aging protocol. Synergistic with Epithalon which also works on pineal regulation.",
  "sub": "Pineal Gland & Brain Cytogen"
 },
 "Prostamax": {
  "goal": "Prostate health, urological function, anti-aging",
  "mech": "Khavinson bioregulator peptide targeting prostate tissue. Researched for prostate health maintenance, urological function support, and anti-aging effects on prostate cells.",
  "notes": "Prostate bioregulator. Stack with Testagen for comprehensive male hormonal health bioregulator protocol.",
  "sub": "Prostate Cytogen"
 },
 "Retatrutide": {
  "goal": "Aggressive fat loss, metabolic optimization",
  "mech": "Triple agonist activating GIP, GLP-1, and glucagon receptors simultaneously. Phase 2 trials showed up to 24% weight loss \u2014 most powerful in class. Glucagon activation adds thermogenic fat burning on top of GLP-1/GIP appetite suppression.",
  "notes": "Most cutting-edge weight loss compound in research. Titrate very slowly \u2014 1 mg for 4 weeks before increasing. Available as RT10/20/30. GI side effects more pronounced than Tirzepatide \u2014 slower titration critical.",
  "sub": "Triple GIP/GLP-1/Glucagon Agonist"
 },
 "Rigin": {
  "goal": "Anti-inflammatory skin aging, IL-6 suppression",
  "mech": "Lipopeptide reducing inflammation-driven skin aging by inhibiting IL-6 secretion from skin cells.",
  "notes": "Pairs with Pal-GHK in premium anti-aging formulations. Addresses the inflammation side of aging skin.",
  "sub": "Palmitoyl Tetrapeptide-7 \u2014 Anti-Inflammaging"
 },
 "SLU-PP-332": {
  "goal": "Exercise-mimetic effects, endurance, metabolic activation",
  "mech": "Activates estrogen-related receptor alpha (ERR\u03b1) \u2014 upregulates mitochondrial gene expression mimicking exercise adaptations. Preclinical data shows increased running endurance by 70%+ in sedentary mice without training.",
  "notes": "Available as 33210 at Bio Linked. Cutting-edge exercise mimetic. Pairs with MOTS-c and AICAR for triple metabolic activation. Very new \u2014 mostly preclinical data but highly promising.",
  "sub": "ERR\u03b1 Agonist \u2014 Exercise Mimetic"
 },
 "SNAP-8": {
  "goal": "Expression wrinkle reduction, advanced NMJ inhibition",
  "mech": "Enhanced version of Argireline (8 amino acids vs 6). Inhibits SNARE complex formation at neuromuscular junctions.",
  "notes": "More potent than Argireline. Often combined with Argireline for synergistic NMJ inhibition.",
  "sub": "Acetyl Octapeptide-3 \u2014 Enhanced Botox-Like"
 },
 "SS-31": {
  "goal": "Mitochondrial membrane repair, oxidative stress reduction",
  "mech": "Concentrates in inner mitochondrial membrane binding to cardiolipin \u2014 reduces reactive oxygen species (ROS), restores electron transport chain function, and improves ATP production. Cardioprotective, neuroprotective, and muscle-preserving effects in research.",
  "notes": "Available as 2S10 at Bio Linked. Most targeted mitochondrial repair peptide available. Pairs with MOTS-c for dual mitochondrial stack. Phase 2 clinical trials for heart failure ongoing.",
  "sub": "Elamipretide \u2014 Mitochondrial Membrane Repair"
 },
 "Selank": {
  "goal": "Anxiety reduction, stress resilience, GABA modulation",
  "mech": "Synthetic analog of tuftsin modulating GABAergic system, serotonin, and dopamine. Produces anxiety relief without sedation or dependency. Increases enkephalin levels. No withdrawal effects unlike benzodiazepines.",
  "notes": "Available as SK10 at Bio Linked. Non-habit forming \u2014 no dependency risk. Often described as 'calm clarity'. Intranasal popular. Perfect pair with Semax for cognitive + anxiety protocols.",
  "sub": "Anxiolytic Peptide / Tuftsin Analog"
 },
 "Semaglutide": {
  "goal": "Weight loss, blood sugar regulation, cardiovascular protection",
  "mech": "GLP-1 receptor agonist that suppresses appetite, slows gastric emptying, and improves glycemic control. Originally developed for T2D (Ozempic), now widely used for weight management (Wegovy). Shows cardiovascular risk reduction in trials.",
  "notes": "The peptide that started the GLP-1 revolution. Slower titration than Tirzepatide. Strong cardiovascular data. Can be compounded. Slightly less weight loss vs Tirzepatide in head-to-head data.",
  "sub": "GLP-1 Receptor Agonist"
 },
 "Semax": {
  "goal": "Cognitive enhancement, BDNF upregulation, neuroprotection",
  "mech": "Synthetic peptide based on ACTH fragment. Dramatically increases BDNF, VEGF, and NGF \u2014 key neurotrophic factors for neuroplasticity and memory. Enhances dopaminergic and serotonergic transmission. Developed in Russia for stroke recovery and cognitive enhancement.",
  "notes": "Available as XA10 at Bio Linked. Pairs perfectly with Selank (Semax sharpens, Selank steadies). Intranasal delivery is popular. Strong research base from Russian clinical use. Key compound in cognitive recovery protocols.",
  "sub": "ACTH Fragment Analog"
 },
 "Sermorelin": {
  "goal": "Gentle GH stimulation, anti-aging, sleep improvement",
  "mech": "The original FDA-approved GHRH analog \u2014 shorter half-life than CJC-1295 creates more physiologically natural GH release. Gentler stimulation preferred for older adults or those new to GH peptides.",
  "notes": "Available as SMO10 at Bio Linked. Best entry-level GH peptide for clients over 50. Most well-studied GHRH analog with decades of safety data. Pairs well with Ipamorelin.",
  "sub": "Original GHRH Analog"
 },
 "Somatropin (HGH)": {
  "goal": "Direct GH supplementation, muscle growth, fat metabolism",
  "mech": "Recombinant human GH identical to endogenous GH. Provides direct, reliable GH elevation without relying on pituitary response. Promotes protein synthesis, fat lipolysis, IGF-1 production, and tissue repair throughout the body.",
  "notes": "Available as H10/H15 at Bio Linked. Most powerful GH option but also most expensive. Stack with IGF-1 LR3 for synergistic muscle-building effect. Requires monitoring for glucose and IGF-1 levels.",
  "sub": "Recombinant Human Growth Hormone"
 },
 "Survodutide": {
  "goal": "Weight loss, liver health, metabolic disease research",
  "mech": "Dual GLP-1 and glucagon receptor agonist. GLP-1 activation suppresses appetite while glucagon activation increases liver fat burning and thermogenesis. Phase 2 data shows significant weight loss with potential benefit for NASH/metabolic liver disease.",
  "notes": "Particularly promising for individuals with liver health concerns alongside weight management goals. Strong NASH (non-alcoholic steatohepatitis) data emerging. Next-generation after Tirzepatide.",
  "sub": "Dual GLP-1/Glucagon Agonist"
 },
 "Syn-Ake": {
  "goal": "Wrinkle smoothing, muscle relaxation, anti-aging",
  "mech": "Synthetic tripeptide mimicking the paralytic mechanism of Waglerin-1 \u2014 inhibits acetylcholine binding at neuromuscular junctions. Non-toxic synthetic version.",
  "notes": "Effective for dynamic wrinkles. Pairs with Argireline for enhanced NMJ inhibition.",
  "sub": "Snake Venom-Inspired Topical Relaxant"
 },
 "Syn-Coll": {
  "goal": "Collagen stimulation, wrinkle depth reduction, elasticity",
  "mech": "Cosmetic peptide mimicking thrombospondin-1 signaling \u2014 activates TGF-\u03b2 pathway to stimulate collagen production.",
  "notes": "Strong collagen stimulator. Pairs with Matrixyl for comprehensive collagen support.",
  "sub": "Palmitoyl Tripeptide-5"
 },
 "TB-500": {
  "goal": "Systemic tissue repair, inflammation reduction, flexibility",
  "mech": "Thymosin Beta-4 fragment promotes actin polymerization, cell migration, and anti-inflammatory responses. Enhances systemic healing of cardiac muscle, skeletal muscle, and connective tissue throughout the body.",
  "notes": "Pairs perfectly with BPC-157 for the Wolverine Stack (premix BB10). TB-500 handles systemic healing while BPC-157 addresses local tissue. Reduces inflammation and speeds recovery from injuries, surgery, and overtraining.",
  "sub": "Thymosin Beta-4 Fragment"
 },
 "Tesamorelin": {
  "goal": "Visceral fat reduction, GH optimization",
  "mech": "FDA-studied GHRH analog with the strongest clinical data for visceral fat reduction (15\u201320% reduction in trials). Specifically researched for HIV-associated lipodystrophy but widely applied for general visceral fat and body recomposition.",
  "notes": "Available as TSM10 at Bio Linked. Best GH peptide specifically for belly/visceral fat. Stack with Ipamorelin for enhanced effect. Has the most robust clinical trial data of any GHRH analog.",
  "sub": "GHRH Analog \u2014 Visceral Fat Specific"
 },
 "Tesofensine": {
  "goal": "Significant weight loss, appetite suppression",
  "mech": "Triple reuptake inhibitor blocking norepinephrine, dopamine, and serotonin reuptake \u2014 originally developed for neurological conditions. Significantly suppresses appetite through central nervous system pathways. Phase 2 data showed up to 10% weight loss in 24 weeks.",
  "notes": "Powerful appetite suppressant through CNS mechanism rather than GI/hormonal pathway. Different mechanism from GLP-1 agonists \u2014 can be complementary or standalone. Watch for cardiovascular effects (heart rate increase) at higher doses.",
  "sub": "Triple Monoamine Reuptake Inhibitor"
 },
 "Testagen": {
  "goal": "Testosterone support, testicular function, male anti-aging",
  "mech": "Khavinson synthetic peptide bioregulator researched for testicular function and testosterone support. Supports Leydig cell function and steroidogenesis pathways.",
  "notes": "Male hormonal bioregulator. Pairs with Prostamax for comprehensive male health protocol.",
  "sub": "Testicular Cytogen"
 },
 "Thymagen": {
  "goal": "Thymus support, T-cell function, immune aging",
  "mech": "Khavinson bioregulator dipeptide (Glu-Trp) specifically targeting thymic function and age-related immune decline (immunosenescence). Promotes T-cell differentiation and restores thymic peptide production in aging models.",
  "notes": "Synthesized Cytogen version of thymus bioregulator. More specific than Thymalin. Part of comprehensive immune anti-aging stacks. Pairs with Epithalon for Russian longevity protocol.",
  "sub": "Dipeptide Thymus Bioregulator"
 },
 "Thymalin": {
  "goal": "Thymus regeneration, immune anti-aging, longevity",
  "mech": "Peptide extract from thymus tissue that supports thymic regeneration and function. The thymus shrinks with age (thymic involution) reducing T-cell production. Thymalin research shows potential to restore thymic activity and immune competence in aging.",
  "notes": "Part of the Khavinson bioregulator family. Used in Russian longevity protocols alongside Epithalon. The thymus-pineal connection makes Thymalin + Epithalon a classic Russian anti-aging combination.",
  "sub": "Thymus Tissue Peptide Extract"
 },
 "Thymosin Alpha-1": {
  "goal": "Immune modulation, T-cell support, chronic infection recovery",
  "mech": "Thymic peptide that enhances T-cell maturation, NK cell activity, and innate immune signaling. Used clinically (Zadaxin) for hepatitis B, hepatitis C, and cancer support. Modulates both innate and adaptive immunity without overstimulation.",
  "notes": "Strongest immune-modulating peptide available. Used in hospitals globally for chronic viral infections. Pairs well with BPC-157 for gut-immune axis support. Excellent for post-illness recovery, long COVID, and mold/Lyme protocols.",
  "sub": "Thymic Immune Modulator"
 },
 "Tirzepatide": {
  "goal": "Significant weight loss, appetite suppression, blood sugar regulation",
  "mech": "Dual agonist activating both GLP-1 and GIP receptors simultaneously. Slows gastric emptying, reduces appetite via hypothalamic signaling, improves insulin sensitivity, and promotes fat oxidation. Phase 3 trials showed 20-22% average body weight reduction.",
  "notes": "Most clinically validated weight loss peptide available. Titrate slowly (every 4 weeks) to manage nausea. Available as TR10/20/30 at Bio Linked. Best entry point for GLP-1 therapy.",
  "sub": "Dual GLP-1/GIP Agonist"
 },
 "Tripeptide-29": {
  "goal": "Collagen synthesis, skin structure, wrinkle reduction",
  "mech": "Gly-Pro-Hyp sequence identical to the most common repeating unit in type I collagen. Signals fibroblasts to produce collagen.",
  "notes": "Works synergistically with Matrixyl and Syn-Coll for multi-pathway collagen stimulation.",
  "sub": "Collagen Tripeptide Signal"
 },
 "Triptorelin": {
  "goal": "Hormonal reset, GnRH axis stimulation",
  "mech": "Synthetic GnRH agonist \u2014 when used in a single injection, stimulates a strong testosterone surge ('hormonal reset'). In clinical use for prostate cancer when used continuously (paradoxically suppresses T). Single-dose reset protocol emerging in TRT recovery.",
  "notes": "Primarily known as prostate cancer treatment but gaining attention for 'hormonal reset' in TRT recovery protocols. Single low dose can stimulate significant LH surge. Consult healthcare provider \u2014 prescription only.",
  "sub": "GnRH Agonist"
 },
 "VIP": {
  "goal": "Gut function, neuroprotection, immune modulation",
  "mech": "Naturally occurring neuropeptide with wide-ranging effects \u2014 relaxes smooth muscle in gut (IBS benefit), promotes anti-inflammatory immune response, supports lung function, and has neuroprotective properties.",
  "notes": "Emerging use in MCAS, CIRS (mold illness), and long COVID protocols. Shows particular promise for post-COVID autonomic dysfunction. Also researched for pulmonary hypertension and inflammatory bowel conditions.",
  "sub": "Vasoactive Intestinal Peptide"
 },
 "Vesilute": {
  "goal": "Vascular tissue support, blood vessel function",
  "mech": "Khavinson bioregulator targeting vascular tissue and blood vessel wall function.",
  "notes": "Similar to Vesugen but slightly different target profile. Can be used interchangeably or stacked.",
  "sub": "Vascular Tissue Cytogen"
 },
 "Vesugen": {
  "goal": "Vascular health, endothelial support, cardiovascular tissue maintenance",
  "mech": "Khavinson tripeptide (Lys-Glu-Asp) targeting vascular endothelial cells. Supports blood vessel wall integrity, endothelial gene expression, and vascular function.",
  "notes": "Vascular bioregulator. Pairs with Cardiogen for comprehensive cardiovascular bioregulator stack.",
  "sub": "Vascular Endothelial Cytogen"
 },
 "Vialox": {
  "goal": "Muscle relaxation, expression wrinkle reduction",
  "mech": "Synthetic cosmetic peptide competitively inhibiting acetylcholine binding at NMJ via a different binding site than Argireline/SNAP-8.",
  "notes": "Triple-combination of Argireline + SNAP-8 + Vialox represents maximum topical NMJ inhibition.",
  "sub": "Pentapeptide-3 \u2014 Competitive NMJ Inhibitor"
 },
 "Vilon": {
  "goal": "Thymus support, immune aging, longevity",
  "mech": "Synthetic dipeptide bioregulator researched for thymus function and immune aging. Researched for longevity effects through immune system restoration.",
  "notes": "Part of the Khavinson immune aging protocol alongside Thymalin and Thymagen.",
  "sub": "Dipeptide Thymus/Immune Bioregulator"
 }
};

/* IX and the public Index spell a few compounds differently. */
var BL_ALIAS = {
 "Epitalon": "Epithalon",
 "MOTS-C": "MOTS-c",
 "Semaglutide (Oral)": "Semaglutide",
 "Tesofine": "Tesofensine"
};

/* Normalised lookup: punctuation and case insensitive, alias-aware. */
function blLib(name){
  if(!name) return null;
  var norm=function(x){return String(x).toLowerCase().replace(/[^a-z0-9]/g,"");};
  var want=norm(BL_ALIAS[name]||name);
  for(var k in BL_LIB){ if(norm(k)===want) return BL_LIB[k]; }
  for(var k2 in BL_LIB){ var n2=norm(k2); if(n2&&(n2.indexOf(want)===0||want.indexOf(n2)===0)) return BL_LIB[k2]; }
  return null;
}
if(typeof module!=="undefined"&&module.exports){module.exports={BL_LIB:BL_LIB,BL_ALIAS:BL_ALIAS,blLib:blLib};}
