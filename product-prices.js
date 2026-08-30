/*
 * BioLinked — PRODUCT PRICE / CATALOG master data.
 *
 * Single source of truth for every sell price on the site. Extracted from the
 * hand-maintained markup that used to live inline in /product-line/index.html;
 * both /product-line/ (full listing) and / (the peptide catalog) now read from
 * here, so a price is edited in exactly one place.
 *
 * Schema per product:
 *   { name, sec, cat, sku, size, price, variants[], stock, forLine, desc, keywords }
 *   - price     : single-SKU sell price, e.g. '$50'. null when the product is
 *                 sold in sizes — then variants carries them (cheapest first).
 *   - variants  : [{ sku, size, price }] for multi-size products.
 *   - stock     : false = currently out of stock (hidden on /product-line/,
 *                 shown on the catalog with an "Out of stock" tag).
 *
 * PRODUCT_PRICE_ALIASES maps a /cheat-sheet-data.js entry name to the product
 * name it is sold as. Only exact, same-compound matches are listed — anything
 * BioLinked does not currently stock is deliberately absent so the catalog
 * renders a blank price rather than an invented one.
 *
 * priceFor(name) is what the catalog calls: cheat-sheet name in, price record
 * (or null) out.
 */

window.PRODUCT_SECTIONS = {
  'weight': 'GLP-1 & Weight Management',
  'healing': 'Healing & Recovery',
  'hormone': 'Growth Hormone & Hormone Regulation',
  'neuro': 'Cognitive & Neuroprotection',
  'energy': 'Energy, NAD & Metabolic',
  'sexual': 'Sexual Health',
  'cosmetic': 'Skin & Hair',
  'supplies': 'Supplies & Accessories'
};

window.PRODUCT_PRICES = [
  {name:'Tirzepatide',sec:'weight',cat:'weight',sku:null,size:null,price:null,variants:[{sku:'TR10',size:'10mg vial',price:'$60'},{sku:'TR20',size:'20mg vial',price:'$90'},{sku:'TR30',size:'30mg vial',price:'$130'}],stock:false,
   forLine:'Strong, well-studied weight loss via the Mounjaro-class GLP-1/GIP mechanism.',
   desc:'Dual GIP/GLP-1 agonist delivering 15–22% body weight reduction. FDA-approved for T2D, obesity, and sleep apnea. Once-weekly injection.',
   keywords:'tirzepatide glp1 gip weight loss mounjaro'},
  {name:'Retatrutide',sec:'weight',cat:'weight',sku:null,size:null,price:null,variants:[{sku:'RT20',size:'20mg vial',price:'$60'},{sku:'RT30',size:'30mg vial',price:'$80'},{sku:'RT40',size:'40mg vial',price:'$100'},{sku:'RT60',size:'60mg vial',price:'$120'}],stock:true,
   forLine:'Serious weight loss when Ozempic or Mounjaro isn’t getting you there. The strongest GLP-1-class compound on the market.',
   desc:'Next-gen triple agonist (GLP-1 + GIP + Glucagon). Up to 24% weight loss in trials — the most powerful fat loss peptide in development.',
   keywords:'retatrutide triple agonist glp1 fat loss'},
  {name:'Cagrilintide',sec:'weight',cat:'weight',sku:'CGL10',size:'10mg vial',price:'$50',variants:[],stock:true,
   forLine:'Crushing hunger and food noise. Best stacked alongside a GLP-1 like Reta or Sema.',
   desc:'Long-acting amylin + calcitonin dual agonist. Once-weekly dosing for powerful, durable appetite suppression. Stacks synergistically with GLP-1 agents.',
   keywords:'cagrilintide amylin appetite suppression'},
  {name:'AOD-9604',sec:'weight',cat:'weight',sku:'5AD',size:'5mg vial',price:'$45',variants:[],stock:false,
   forLine:'Burns stubborn fat without affecting blood sugar or growth hormone. The pure fat-loss fragment.',
   desc:'hGH fragment (177–191) that selectively amplifies lipolysis without affecting blood sugar or IGF-1. Targets stubborn visceral and subcutaneous fat.',
   keywords:'aod9604 aod 9604 lipolysis fat loss fragment hgh'},
  {name:'Semaglutide',sec:'weight',cat:'weight',sku:'SEM3',size:'3mg vial',price:'$65',variants:[],stock:false,
   forLine:'Steady, predictable weight loss via the well-known Ozempic / Wegovy mechanism.',
   desc:'GLP-1 receptor agonist (Ozempic/Wegovy equivalent). Once-weekly injection for sustained appetite suppression and metabolic health. 15% average body weight loss.',
   keywords:'semaglutide glp1 ozempic wegovy appetite'},
  {name:'Tesamorelin',sec:'weight',cat:'weight',sku:null,size:null,price:null,variants:[{sku:'TSM10',size:'10mg vial',price:'$55'},{sku:'TSM20',size:'20mg vial',price:'$100'}],stock:true,
   forLine:'Stubborn belly (visceral) fat that diet and training won\'t budge — the only FDA-approved peptide for it.',
   desc:'FDA-approved modified GHRH analog. Clinically proven for visceral fat reduction and lean mass preservation. Also studied for cognitive enhancement.',
   keywords:'tesamorelin ghrh visceral fat fda approved'},
  {name:'BPC-157',sec:'healing',cat:'healing',sku:null,size:null,price:null,variants:[{sku:'BC10',size:'10mg vial',price:'$35'}],stock:true,
   forLine:'Faster healing from injuries, gut issues, tendons, ligaments, joints. The most-used healing peptide.',
   desc:'The gold standard regenerative peptide. Accelerates healing of muscle, tendon, ligament, gut, and nerve tissue via VEGF-driven angiogenesis.',
   keywords:'bpc-157 bpc 157 regenerative tissue repair gut tendon ligament'},
  {name:'TB-500',sec:'healing',cat:'healing',sku:'BT5',size:'5mg vial',price:'$23',variants:[],stock:false,
   forLine:'Soft-tissue and tendon healing — especially old injuries that won\'t fully resolve on their own.',
   desc:'Synthetic Thymosin Beta-4. Drives cell migration, angiogenesis, and collagen synthesis. Reduces fibrotic scarring across muscle, tendon, cardiac, and neural tissue.',
   keywords:'tb500 tb-500 thymosin beta 4 collagen angiogenesis'},
  {name:'Wolverine Stack (BPC + TB)',sec:'healing',cat:'healing',sku:'BB10',size:'5mg + 5mg · 10mg total',price:'$40',variants:[],stock:true,
   forLine:'All-around injury recovery. The classic two-peptide healing stack in one vial.',
   desc:'Pre-blended BPC-157 (5mg) + TB-500 (5mg) — 10mg total per vial. The classic recovery stack in a single vial — synergistic tissue repair from every angle.',
   keywords:'wolverine bpc tb500 combo blend recovery stack'},
  {name:'GLOW Blend',sec:'healing',cat:'healing',sku:'BBG70',size:'70mg vial',price:'$60',variants:[],stock:true,
   forLine:'Skin recovery, wound healing, and that lit-from-within glow. Best for visible skin + tissue repair.',
   desc:'TB-500 (10mg) + BPC-157 (10mg) + GHK-Cu (50mg). Triple-action regenerative blend for wound healing, skin renewal, and deep tissue recovery.',
   keywords:'glow tb500 bpc ghk-cu blend skin healing wound'},
  {name:'KLOW Blend',sec:'healing',cat:'healing',sku:'KLOW',size:'80 units/vial',price:'$80',variants:[],stock:true,
   forLine:'Full immune + healing reset when you\'re run-down, sick, or burning the candle at both ends.',
   desc:'TB-500 (10mg) + BPC-157 (10mg) + GHK-Cu (50mg) + KPV (10mg). Quad-peptide powerhouse adding targeted immune modulation and cytokine suppression.',
   keywords:'klow tb bpc ghk kpv blend immune cytokine inflammation'},
  {name:'SS-31',sec:'healing',cat:'healing energy',sku:'2S50',size:'50mg vial',price:'$100',variants:[],stock:true,
   forLine:'Keeping energy high during dieting, training, or aging. Protects the cells that produce your energy.',
   desc:'Elamipretide — targets the inner mitochondrial membrane to stabilize cardiolipin, scavenge ROS, and restore ATP synthesis.',
   keywords:'ss31 ss-31 elamipretide mitochondrial cardiolipin atp'},
  {name:'Thymosin Alpha-1',sec:'healing',cat:'healing',sku:'TA110',size:'10mg vial',price:'$65',variants:[],stock:true,
   forLine:'Chronic infections, autoimmune flares, or rebuilding the immune system after a long illness.',
   desc:'Immune modulator that enhances T-cell function and natural killer cell activity. Used clinically for chronic infections, autoimmune conditions, and cancer adjunct therapy.',
   keywords:'thymosin alpha-1 ta1 immune modulation t-cell nk cell'},
  {name:'Adamax',sec:'healing',cat:'healing',sku:null,size:null,price:null,variants:[{sku:'ADX5',size:'5mg vial',price:'$40'},{sku:'ADX10',size:'10mg vial',price:'$60'}],stock:true,
   forLine:'Cardiovascular health — heart muscle, blood pressure, circulation. Russian longevity research staple.',
   desc:'Khavinson peptide bioregulator targeting vascular tone and smooth-muscle function. Supports microcirculation, cardiac muscle integrity, and is used in longevity stacks alongside other tissue-specific bioregulators.',
   keywords:'adamax khavinson bioregulator cardiovascular vascular smooth muscle tetrapeptide'},
  {name:'Cartalax',sec:'healing',cat:'healing',sku:'CTL20',size:'20mg vial',price:'$35',variants:[],stock:true,
   forLine:'Joint pain — knees, shoulders, hips. Pair with BPC-157 for full joint repair.',
   desc:'Khavinson tetrapeptide targeting chondrocyte function. Supports cartilage regeneration and connective tissue integrity — paired with BPC-157 in joint-focused recovery protocols.',
   keywords:'cartalax khavinson cartilage joint chondrocyte connective tissue bioregulator tetrapeptide'},
  {name:'Cortagen',sec:'healing',cat:'healing',sku:'CTG20',size:'20mg vial',price:'$60',variants:[],stock:true,
   forLine:'Immune support when chronic inflammation or autoimmune flares are the issue.',
   desc:'Khavinson immunomodulating peptide bioregulator. Supports immune function and tissue repair under inflammatory load — used in age-related immune decline and post-illness recovery.',
   keywords:'cortagen khavinson immune cortex bioregulator inflammation immunomodulating tetrapeptide'},
  {name:'Vesugen',sec:'healing',cat:'healing',sku:'VSG20',size:'20mg vial',price:'$60',variants:[],stock:true,
   forLine:'Circulation, vein health, vascular elasticity. Targets the vascular system specifically.',
   desc:'Khavinson tripeptide for vascular endothelium. Supports microcirculation, capillary integrity, and vascular elasticity — a core piece of the bioregulator longevity stack.',
   keywords:'vesugen khavinson vascular endothelium microcirculation capillary bioregulator tripeptide'},
  {name:'VIP (Vasoactive Intestinal Peptide)',sec:'healing',cat:'healing hormone',sku:'VIP10',size:'10mg vial',price:'$60',variants:[],stock:true,
   forLine:'Chronic inflammation, long COVID, autoimmune dysregulation. Powerful anti-inflammatory.',
   desc:'Powerful anti-inflammatory neuropeptide with immunomodulatory and circadian-regulating effects. Studied for long COVID, autoimmune dysregulation, and chronic inflammatory states.',
   keywords:'vip vasoactive intestinal peptide anti-inflammatory immune modulation circadian autoimmune long covid'},
  {name:'HGH (Somatropin)',sec:'hormone',cat:'hormone',sku:null,size:null,price:null,variants:[{sku:'H10',size:'10 IU vial',price:'$150'},{sku:'H15',size:'15 IU vial',price:'$200'}],stock:false,
   forLine:'Anti-aging body composition — muscle, fat loss, sleep, skin. The real-deal GH replacement.',
   desc:'Bioidentical recombinant human growth hormone. Gold standard for GH replacement — drives protein synthesis, fat burning, and tissue repair.',
   keywords:'hgh somatropin growth hormone iu anti-aging body composition'},
  {name:'CJC-1295 (No DAC)',sec:'hormone',cat:'hormone',sku:null,size:null,price:null,variants:[{sku:'CND5',size:'5mg vial',price:'$45'},{sku:'CND10',size:'10mg vial',price:'$90'}],stock:false,
   forLine:'Boost natural GH pulses without long-acting buildup. Pairs with Ipamorelin.',
   desc:'Short-acting GHRH analog producing sharp, physiologic GH pulses. Preserves natural pituitary feedback. Best paired with Ipamorelin.',
   keywords:'cjc1295 cjc 1295 no dac ghrh growth hormone pulse pituitary'},
  {name:'CJC-1295 (with DAC)',sec:'hormone',cat:'hormone',sku:'CD5',size:'5mg vial',price:'$50',variants:[],stock:false,
   forLine:'Extended GH elevation for longer pulsatile cycles. Convenient less-frequent dosing.',
   desc:'Long-acting CJC-1295 with Drug Affinity Complex. Extended half-life for sustained GH elevation — ideal for longer pulsatile cycles.',
   keywords:'cjc1295 with dac long acting extended half life sustained'},
  {name:'CJC + Ipamorelin',sec:'hormone',cat:'hormone',sku:'CP10',size:'5mg + 5mg',price:'$45',variants:[],stock:true,
   forLine:'Lean muscle, deeper sleep, body recomposition. The classic GH stack — most popular for a reason.',
   desc:'Pre-blended CJC-1295 No DAC (5mg) + Ipamorelin (5mg). The most popular GH stack — dual-pathway stimulation for amplified, natural GH pulses.',
   keywords:'cjc ipamorelin combo stack blend pre-mixed popular gh'},
  {name:'Sermorelin',sec:'hormone',cat:'hormone',sku:'SMO10',size:'10mg vial',price:'$80',variants:[],stock:false,
   forLine:'Restore your own GH production naturally. Cornerstone of anti-aging hormone protocols.',
   desc:'GHRH 1-29 analog that restores youthful pulsatile GH secretion within natural feedback loops. Cornerstone of anti-aging and hormone restoration protocols.',
   keywords:'sermorelin ghrh anti-aging hormone restoration pituitary youthful'},
  {name:'IGF-1 LR3',sec:'hormone',cat:'hormone healing',sku:'IG1',size:'1mg vial',price:'$50',variants:[],stock:true,
   forLine:'Aggressive muscle growth or post-injury recovery. The most powerful muscle-building peptide here.',
   desc:'Modified IGF-1 with 20–30 hour half-life. Activates mTOR/PI3K for profound muscle hypertrophy, connective tissue repair, and visceral fat loss.',
   keywords:'igf-1 lr3 igf1 insulin growth factor muscle hypertrophy mtor'},
  {name:'HCG',sec:'hormone',cat:'hormone sexual',sku:'GK5',size:'5,000 IU vial',price:'$65',variants:[],stock:true,
   forLine:'Restarting natural testosterone, supporting fertility, or coming off TRT (PCT).',
   desc:'LH analog that stimulates natural testosterone production and preserves fertility. Essential for PCT, TRT maintenance, and ovulation induction.',
   keywords:'hcg human chorionic gonadotropin testosterone lh fertility pct trt'},
  {name:'Hexarelin Acetate',sec:'hormone',cat:'hormone',sku:'HX5',size:'5mg vial',price:'$40',variants:[],stock:false,
   forLine:'Strong GH pulse plus heart-protective effects. For experienced GH users.',
   desc:'Potent GHRP that strongly stimulates GH release and exhibits cardioprotective properties. One of the most powerful GH secretagogues available.',
   keywords:'hexarelin ghrp cardioprotective potent growth hormone secretagogue'},
  {name:'Testosterone (TRT)',sec:'hormone',cat:'hormone sexual',sku:null,size:null,price:null,variants:[{sku:'TC200',size:'Cypionate 200mg/mL · 10mL',price:'$85'},{sku:'TE200',size:'Enanthate 200mg/mL · 10mL',price:'$85'},{sku:'TP100',size:'Propionate 100mg/mL · 10mL',price:'$75'}],stock:true,
   forLine:'Replace declining testosterone — energy, muscle, libido, drive. The foundation of TRT.',
   desc:'Bioidentical testosterone esters for replacement therapy. Restores physiological testosterone levels, muscle mass, libido, mood, and metabolic function.',
   keywords:'testosterone trt cypionate enanthate propionate replacement therapy libido muscle'},
  {name:'Kisspeptin-10',sec:'hormone',cat:'hormone',sku:'KP510',size:'5mg vial',price:'$55',variants:[],stock:true,
   forLine:'Wake up your own testosterone production (men) or restore mood + libido (women) without replacing hormones.',
   desc:'Activates the HPG axis upstream of GnRH to stimulate pulsatile LH and FSH. Restores natural testosterone production and fertility function.',
   keywords:'kisspeptin lh fsh testosterone fertility hpg axis gnrh'},
  {name:'Epitalon',sec:'hormone',cat:'hormone',sku:'EP50',size:'50mg vial',price:'$100',variants:[],stock:true,
   forLine:'Deeper sleep + cellular anti-aging. Reset the body clock and protect your telomeres.',
   desc:'Pineal bioregulator that activates telomerase, extends telomere length, and regulates melatonin. Studied for longevity, circadian rhythm, and cancer prevention.',
   keywords:'epitalon epithalon pineal longevity telomere anti-aging melatonin'},
  {name:'Oxytocin',sec:'hormone',cat:'hormone neuro',sku:'OXY10',size:'10mg vial',price:'$60',variants:[],stock:true,
   forLine:'Emotional connection, social calm, anxiety relief. The bonding hormone — also helps post-partum.',
   desc:'Neuropeptide hormone supporting social bonding, trust, stress reduction, and intimacy. Anxiolytic and pro-social effects through hypothalamic-pituitary regulation.',
   keywords:'oxytocin bonding social trust anxiolytic stress lactation pituitary love hormone'},
  {name:'Semax',sec:'neuro',cat:'neuro',sku:'XA10',size:'10mg vial',price:'$45',variants:[],stock:true,
   forLine:'Focus and motivation without stimulants. The cleanest mental-drive nootropic.',
   desc:'ACTH-derived nootropic. Boosts BDNF/NGF, enhances cerebral blood flow, and modulates dopamine/serotonin for focus and neuroprotection.',
   keywords:'semax bdnf cognitive nootropic cerebral blood flow dopamine serotonin'},
  {name:'Selank',sec:'neuro',cat:'neuro',sku:'SK10',size:'10mg vial',price:'$45',variants:[],stock:true,
   forLine:'Anxiety without sedation. Calm + focused — works in 15-30 min, no dependency.',
   desc:'Synthetic tuftsin analog — anxiolytic and nootropic with no sedation or dependency risk. Elevates BDNF, reduces anxiety, and sharpens cognitive performance.',
   keywords:'selank anxiety nootropic bdnf gaba anxiolytic stress calm focus'},
  {name:'DSIP',sec:'neuro',cat:'neuro',sku:'DS5',size:'5mg vial',price:'$45',variants:[],stock:true,
   forLine:'Deep restorative sleep. Falling asleep fine but waking up tired? Start here.',
   desc:'Delta Sleep-Inducing Peptide. Promotes deep delta-wave sleep, normalizes nighttime cortisol, and attenuates HPA axis hyperactivity from chronic stress.',
   keywords:'dsip delta sleep inducing peptide cortisol hpa circadian deep sleep'},
  {name:'Dihexa',sec:'neuro',cat:'neuro',sku:'DH5',size:'5mg vial',price:'$75',variants:[],stock:true,
   forLine:'Heavy-duty cognitive enhancement — memory, learning, neurodegenerative risk reduction.',
   desc:'Exceptionally potent nootropic — reportedly millions of times more potent than BDNF. Promotes synaptogenesis and is studied for neurodegeneration and cognitive enhancement.',
   keywords:'dihexa nootropic bdnf cognitive alzheimers memory synaptogenesis'},
  {name:'Cerebrolysin',sec:'neuro',cat:'neuro',sku:'CBL60',size:'60mg vial',price:'$60',variants:[],stock:true,
   forLine:'Brain recovery from injury, stroke, concussion, or chronic mental fatigue.',
   desc:'Porcine brain-derived neuropeptide complex that mimics BDNF/NGF/GDNF action. Neuroprotective and cognition-enhancing — clinically used in stroke recovery, TBI, and age-related cognitive decline.',
   keywords:'cerebrolysin neurotrophic porcine brain bdnf ngf gdnf neuroprotection cognitive stroke'},
  {name:'Cortexin',sec:'neuro',cat:'neuro',sku:'CTX10',size:'10mg vial',price:'$60',variants:[],stock:true,
   forLine:'Brain fog, post-illness cognitive recovery, age-related cognitive decline.',
   desc:'Cortical polypeptide complex with neuroprotective and cognitive-enhancing properties. Supports memory, learning, and cerebral recovery from injury, illness, or chronic fatigue.',
   keywords:'cortexin cortical polypeptide memory learning neuroprotective cerebral recovery cognition'},
  {name:'P21 (Peptide 021)',sec:'neuro',cat:'neuro',sku:'P215',size:'5mg vial',price:'$35',variants:[],stock:true,
   forLine:'Growing new brain cells (neurogenesis). Long-term cognitive resilience and memory protection.',
   desc:'Ac-DGGLAG-NH2 — synthetic neurogenic peptide. BDNF / CNTF mimetic that promotes hippocampal neurogenesis, cognitive function, and protection against neurodegenerative decline.',
   keywords:'p21 ac-dggla bdnf cntf neurogenic cognitive memory hippocampus neuroprotection'},
  {name:'PE-22-28',sec:'neuro',cat:'neuro',sku:'PE2210',size:'10mg vial',price:'$45',variants:[],stock:true,
   forLine:'Rapid mood lift. Fast-acting antidepressant without the weeks-long SSRI ramp-up.',
   desc:'Spadin-derived peptide and selective TREK-1 channel blocker. Rapid-acting antidepressant effects in early studies — without the latency or side-effect profile of SSRIs.',
   keywords:'pe-22-28 pe2228 spadin trek-1 antidepressant depression fast acting mood'},
  {name:'Pinealon',sec:'neuro',cat:'neuro',sku:'PIN10',size:'10mg vial',price:'$45',variants:[],stock:true,
   forLine:'Mental clarity and focus. The peptide for brain fog and sluggish thinking.',
   desc:'Khavinson tripeptide targeting pineal-gland function. Supports mental clarity, focus, and circadian rhythm regulation — paired with Epitalon as the pineal-axis longevity duo.',
   keywords:'pinealon khavinson pineal nootropic mental clarity circadian melatonin tripeptide longevity'},
  {name:'NAD+',sec:'energy',cat:'energy',sku:'NJ500',size:'500mg vial',price:'$65',variants:[],stock:true,
   forLine:'Cellular energy reset. Anti-aging at the mitochondrial level — fixes the \'tired all the time\' problem.',
   desc:'The universal coenzyme of cellular energy and DNA repair. Injectable NAD+ restores mitochondrial function, activates sirtuins, and reverses metabolic aging.',
   keywords:'nad+ nicotinamide adenine dinucleotide anti-aging sirtuin mitochondrial coenzyme'},
  {name:'Glutathione',sec:'energy',cat:'energy',sku:null,size:null,price:null,variants:[{sku:'GTT1500',size:'1,500mg vial',price:'$40'}],stock:true,
   forLine:'Liver detox + skin glow + immune support. The body\'s master antioxidant in injectable form.',
   desc:'The body\'s master antioxidant. Essential for liver detoxification, immune defense, mitochondrial integrity, and skin brightening. Injectable for maximum bioavailability.',
   keywords:'glutathione gsh antioxidant liver detox skin brightening master immune'},
  {name:'MOTS-C',sec:'energy',cat:'energy',sku:null,size:null,price:null,variants:[{sku:'MS10',size:'10mg vial',price:'$35'},{sku:'MS20',size:'20mg vial',price:'$60'},{sku:'MS40',size:'40mg vial',price:'$100'}],stock:true,
   forLine:'Tricking your metabolism into \'workout mode\' even when you can\'t train. Improves insulin + fat-burning.',
   desc:'Mitochondrial-encoded peptide that activates AMPK for insulin-independent glucose uptake and fat oxidation. A true exercise mimetic for metabolic resilience.',
   keywords:'mots-c motsc mitochondrial ampk exercise mimetic metabolic insulin resistance'},
  {name:'5-Amino-1MQ',sec:'energy',cat:'energy weight',sku:'5AM',size:'5mg vial',price:'$25',variants:[],stock:true,
   forLine:'Fat burning paired with weight loss protocols. Activates muscle stem cells too.',
   desc:'NNMT inhibitor that preserves nicotinamide for NAD+ synthesis. Boosts mitochondrial energy, fat oxidation, and activates muscle stem cells.',
   keywords:'5-amino-1mq 5amino nnmt inhibitor nad fat energy stem cells mitochondria'},
  {name:'SLU-PP-332',sec:'energy',cat:'energy',sku:'33210',size:'5mg vial',price:'$60',variants:[],stock:true,
   forLine:'Endurance and metabolic boost. Exercise in a vial — for when training isn\'t enough or isn\'t possible.',
   desc:'Experimental exercise mimetic that stimulates mitochondrial biogenesis and shifts muscle toward oxidative fibers. Raises metabolic rate and endurance capacity.',
   keywords:'slu-pp-332 slupp exercise mimetic endurance mitochondrial biogenesis oxidative fibers'},
  {name:'FOX04-DRI',sec:'energy',cat:'energy',sku:'FX10',size:'10mg vial',price:'$60',variants:[],stock:true,
   forLine:'Direct anti-aging. Clears out the \'zombie\' cells that drive aging and inflammation.',
   desc:'Senolytic peptide that selectively clears senescent (zombie) cells from tissue. Reverses markers of cellular aging and is one of the most direct anti-aging tools in research today.',
   keywords:'fox04 foxo4 dri senolytic anti-aging senescent cell clearance longevity'},
  {name:'Humanin',sec:'energy',cat:'energy',sku:'HMN10',size:'10mg vial',price:'$60',variants:[],stock:true,
   forLine:'Longevity and metabolic resilience. Protects cells from age-related decline at the mitochondrial level.',
   desc:'Mitochondrial-derived peptide with cytoprotective and metabolic effects. Linked to longevity, insulin sensitivity, and resistance to age-related disease — a foundational MDP for longevity stacks.',
   keywords:'humanin mitochondrial derived peptide longevity cytoprotective insulin sensitivity mdp'},
  {name:'PT-141',sec:'sexual',cat:'sexual',sku:'P41',size:'10mg vial',price:'$55',variants:[],stock:true,
   forLine:'Libido — for women AND men. Works at the brain level, not blood flow like Cialis.',
   desc:'Bremelanotide — FDA-approved for HSDD. Acts centrally via MC3R/MC4R to increase sexual desire and arousal in both men and women. Bypasses vascular pathways.',
   keywords:'pt-141 pt141 bremelanotide libido sexual desire fda approved hsdd arousal'},
  {name:'Melanotan II',sec:'sexual',cat:'sexual',sku:'MT210',size:'10mg vial',price:'$45',variants:[],stock:false,
   forLine:'Tanning + libido + appetite suppression. The 3-in-1 melanocortin peptide.',
   desc:'Melanocortin agonist providing tanning, libido enhancement, and appetite suppression. Acts via MC1R (pigmentation), MC3R/MC4R (sexual function and appetite).',
   keywords:'melanotan 2 melanocortin tanning libido mt2 pigmentation appetite'},
  {name:'GHK-Cu',sec:'cosmetic',cat:'cosmetic healing',sku:null,size:null,price:null,variants:[{sku:'CU50',size:'50mg vial',price:'$55'}],stock:true,
   forLine:'Glowing skin, hair regrowth, collagen, wound healing. The premier anti-aging cosmetic peptide.',
   desc:'The gold standard copper peptide. Activates hundreds of repair genes, stimulates collagen/elastin synthesis, promotes hair follicle health, and neutralizes oxidative damage.',
   keywords:'ghk-cu ghk copper peptide skin hair collagen elastin follicle anti-aging repair'},
  {name:'Melanotan I',sec:'cosmetic',cat:'cosmetic sexual',sku:'MT110',size:'10mg vial',price:'$40',variants:[],stock:true,
   forLine:'Get tan safely — no UV exposure, no sunburn risk. Cleaner than Melanotan II since it skips the libido/appetite effects.',
   desc:'Selective alpha-MSH analog. Activates MC1R to stimulate melanin production for tanning and photoprotection — fewer off-target side effects than Melanotan II since it doesn\'t hit MC3R/MC4R.',
   keywords:'melanotan 1 mt-1 melanotan i alpha-msh mc1r tanning pigmentation photoprotection'}
];

window.PRODUCT_SUPPLIES = [
  {name:'Bacteriostatic Water (BAC)',detail:'Sterile water with benzyl alcohol preservative for peptide reconstitution',size:'3mL',price:'$4',link:'https://ebac-water.com/',linkText:'eBAC Water →',stock:false,keywords:'bacteriostatic water bac reconstitution sterile small'},
  {name:'Bacteriostatic Water (BAC)',detail:'Sterile water with benzyl alcohol preservative for peptide reconstitution',size:'10mL',price:'$6',link:'https://ebac-water.com/',linkText:'eBAC Water →',stock:false,keywords:'bacteriostatic water bac reconstitution sterile large 10ml'},
  {name:'Insulin Syringes',detail:'29–31 gauge, 1 mL — sterile single-use subcutaneous injection syringes',size:'100-pack',price:'$18',link:'https://a.co/d/04JCzBqF',linkText:'Amazon →',stock:false,keywords:'insulin syringes needles 29 31 gauge subcutaneous injection'},
  {name:'Sharps Container',detail:'FDA-cleared puncture-proof disposal container for used syringes',size:'1 Quart',price:'$8',link:'https://a.co/d/0jhnMLPg',linkText:'Amazon →',stock:false,keywords:'sharps container disposal needles fda safe'},
  {name:'Alcohol Prep Pads',detail:'70% isopropyl — sterile pre-injection skin prep and vial stopper wipe',size:'200-pack',price:'$7',link:'https://a.co/d/0fnbd8VV',linkText:'Amazon →',stock:false,keywords:'alcohol prep pads isopropyl sterile swabs skin prep'},
  {name:'Peptide Organizer / Cold Storage',detail:'Multi-vial organizer for the fridge — keeps reconstituted vials labeled, light-protected, and at stable temperature',size:'Holds 6+',price:'$0',link:'https://www.amazon.com/dp/B0FH62NMF8',linkText:'Amazon →',stock:false,keywords:'peptide organizer cold storage fridge refrigerated multi vial'}
];
/* ---------------------------------------------------------------------------
   Cheat-sheet name  ->  product-line name.
   Only same-compound, same-product matches. Compounds BioLinked does not
   currently sell are intentionally absent: the catalog then shows no price
   rather than a made-up one.
   Deliberately NOT aliased:
     'HGH Fragment 176-191'      — same molecule as AOD-9604 but a separate
                                   cheat-sheet entry; not conflated.
     'Semaglutide 5mg (Bronze 1)'— 5 mg pack; the product line stocks 3 mg only.
     'Ipamorelin'                — only sold inside the CJC + Ipamorelin combo.
   --------------------------------------------------------------------------- */
window.PRODUCT_PRICE_ALIASES = {
  'Ipamorelin / CJC-1295 No DAC'            : 'CJC + Ipamorelin',
  'CJC-1295 No DAC'                         : 'CJC-1295 (No DAC)',
  'BPC-157 / TB-500 5mg/5mg Blend'          : 'Wolverine Stack (BPC + TB)',
  'GLOW Blend (GHK-Cu, BPC-157, TB-500)'    : 'GLOW Blend',
  'KLOW Blend (GHK-Cu, BPC-157, TB-500, KPV)': 'KLOW Blend',
  'Somatropin (HGH)'                        : 'HGH (Somatropin)',
  'Hexarelin'                               : 'Hexarelin Acetate',
  'Semax or NA Semax Amidate'               : 'Semax',
  'Selank or NA Selank Amidate'             : 'Selank',
  'P21'                                     : 'P21 (Peptide 021)',
  'FOXO4-DRI'                               : 'FOX04-DRI',
  'VIP'                                     : 'VIP (Vasoactive Intestinal Peptide)',
  'Melanotan 1'                             : 'Melanotan I',
  'Melanotan 2'                             : 'Melanotan II',
  'Kisspeptin'                              : 'Kisspeptin-10'
};

/* Look a price record up by cheat-sheet name. Returns the PRODUCT_PRICES entry
   or null. `from` is true when the price is the cheapest of several sizes. */
window.priceFor = function (name) {
  if (!name) return null;
  var list = window.PRODUCT_PRICES || [];
  var target = (window.PRODUCT_PRICE_ALIASES || {})[name] || name;
  var norm = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]/g, ''); };
  var key = norm(target);
  for (var i = 0; i < list.length; i++) {
    if (norm(list[i].name) === key) return list[i];
  }
  return null;
};

/* Display price for a record: single price, or "from $X" across sizes. */
window.priceLabel = function (rec) {
  if (!rec) return null;
  if (rec.price) return rec.price;
  if (rec.variants && rec.variants.length) {
    var nums = rec.variants.map(function (v) { return parseFloat(String(v.price).replace(/[^0-9.]/g, '')); });
    var min = Math.min.apply(null, nums.filter(function (n) { return !isNaN(n); }));
    if (isFinite(min)) return 'from $' + min;
  }
  return null;
};
