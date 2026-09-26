/* bl-tools.js - shared behaviour for the hamburger nav and the Nutrition,
   Bloodwork and Calculator tabs. Extracted from mpauldino. Every block
   guards on its own DOM, so this file is a no-op on a page that does not
   carry that tab. Needs cheat-sheet-data.js loaded first for the
   calculator compound list. */

/* ============================ HAMBURGER NAV ========================== */
function toggleMenu(){ document.body.classList.contains('menu-open') ? closeMenu() : openMenu(); }
function openMenu(){
  var p=document.getElementById('mp-menu-panel'), sc=document.getElementById('mp-menu-scrim'),
      b=document.getElementById('mp-menu-btn');
  if(!p) return;
  sc.hidden=false;
  void sc.offsetWidth;                 // force a reflow so the slide has a start frame
  p.classList.add('open'); sc.classList.add('open');
  p.setAttribute('aria-hidden','false'); b.setAttribute('aria-expanded','true'); b.setAttribute('aria-label','Close menu');
  document.body.classList.add('menu-open');
  var first=p.querySelector('.menu-item.active')||p.querySelector('.menu-item');
  if(first) setTimeout(function(){ first.focus(); },120);
}
function closeMenu(){
  var p=document.getElementById('mp-menu-panel'), sc=document.getElementById('mp-menu-scrim'),
      b=document.getElementById('mp-menu-btn');
  if(!p) return;
  p.classList.remove('open'); sc.classList.remove('open');
  p.setAttribute('aria-hidden','true'); b.setAttribute('aria-expanded','false'); b.setAttribute('aria-label','Open menu');
  document.body.classList.remove('menu-open');
  setTimeout(function(){ if(!p.classList.contains('open')) sc.hidden=true; },240);
}
document.addEventListener('keydown',function(e){
  if(e.key==='Escape' && document.body.classList.contains('menu-open')){
    closeMenu(); var b=document.getElementById('mp-menu-btn'); if(b) b.focus();
  }
});

/* ============================ NUTRITION ============================== */
/* Left at top level on purpose: the nutrition panel wires its buttons with
   inline onclick (nutCreatePlan, nutSavePlan, nutSaveTargets, nutClearSaved),
   so these have to stay global. */
/* ===================== NUTRITION TAB =====================================
   Macro calculator + meal-plan generator. Everything client-side, no APIs.
   Tunables live in NUT_CFG; the food library is NUT_FOODS.
   ---------------------------------------------------------------------- */
var NUT_CFG = {
  /* goal adjustment applied to TDEE -> daily calorie target */
  GOALS: { lose: -0.20, maintain: 0.00, gain: +0.10 },
  ACTIVITY: { sedentary:1.2, light:1.375, moderate:1.55, very:1.725, extra:1.9 },

  /* Diet styles that OVERRIDE the macro split. Carbs are set from carbPct
     (keto also hard-capped by maxCarbG), protein stays the user's g/lb target,
     and fat takes the remaining calories - which lands on fatPctAbout. Tune
     these numbers to re-rate a diet; fatPctAbout is documentation only.
     Styles not listed here use Balanced logic: protein target + fat slider
     + carbs as the remainder.                                              */
  DIET_MACROS: {
    keto:     { carbPct:5,  maxCarbG:30, fatPctAbout:70 },
    lowcarb:  { carbPct:20,              fatPctAbout:50 },
    highcarb: { carbPct:58,              fatPctAbout:20 }
  },
  MIN_FAT_PCT: 12,          /* never let fat fall below this share of calories */

  /* Diet styles that FILTER the food library. A food is eligible when its
     d[] contains the key. Styles absent here use the whole library.        */
  DIET_FILTERS: ['vegan','vegetarian','paleo','medit','keto'],
  DIET_LABELS: { balanced:'Balanced', keto:'Keto', lowcarb:'Low Carb', highcarb:'High Carb',
                 paleo:'Paleo', medit:'Mediterranean', vegetarian:'Vegetarian', vegan:'Vegan' },

  /* Eating windows. start/end are 24h decimal hours; maxMeals is the most
     meals that fit sensibly in the window. Meal times are spread evenly from
     start to end. 16:8 allows 4 so a 12:00 / 2:40 / 5:20 / 8:00 day works.   */
  WINDOWS: {
    none:   { label:'None',   start:8,  end:20, maxMeals:6 },
    '16:8': { label:'16:8',   start:12, end:20, maxMeals:4 },
    '18:6': { label:'18:6',   start:13, end:19, maxMeals:3 },
    '20:4': { label:'20:4',   start:14, end:18, maxMeals:2 },
    omad:   { label:'OMAD',   start:17, end:18, maxMeals:1 },
    custom: { label:'Custom', start:12, end:20, maxMeals:6 }
  },

  /* Goal aggressiveness - replaces the old flat -20% / +10% */
  AGGRESSION: {
    lose: { mild:-0.10, moderate:-0.20, aggressive:-0.25 },
    gain: { mild:+0.05, moderate:+0.10, aggressive:+0.15 }
  },

  ALLERGENS: ['gluten','dairy','nuts','shellfish','soy','eggs'],
  ALLERGEN_LABELS: { gluten:'Gluten', dairy:'Dairy', nuts:'Nuts',
                     shellfish:'Shellfish', soy:'Soy', eggs:'Eggs' },

  /* GLP-1 / reduced appetite: protein first, smaller physical volume.
     PROTEIN_W raises the protein term in the meal solver; ANCHOR_MAX caps the
     vegetable portion; DENSITY_W rewards calorie-dense (less bulky) foods.   */
  GLP1: { PROTEIN_W:9, ANCHOR_MAX:1.2, DENSITY_W:90, MIN_DENSITY:60 },

  MIN_CAL: 1200,            /* never prescribe below this */
  PORTION_STEP: 5,          /* round food portions to 5 g */
  MIN_PORTION: 15,
  MIN_PORTION_FAT: 5,       /* oils/nuts are usable in small amounts */
  MAX_PORTION: 400,
  MAX_PORTION_CARB: 500,    /* a 3-meal 3,000 kcal day needs big starch servings */
  STORE_PLAN: 'bl-nutrition-plan-v1',
  STORE_TARGETS: 'bl-nutrition-targets-v1'
};

/* Food library - per 100 g. hh = household measure for that 100 g.
   cat: pro | carb | fat | veg | fruit
   d[] = diet styles the food is allowed in:
         vegan, vegetarian, paleo, medit (Mediterranean), keto
   (Balanced / Low Carb / High Carb do not filter, so every food qualifies.)  */
var NUT_FOODS = [
  /* ---- animal proteins ---- */
  {n:'Chicken breast, grilled', cat:'pro', kcal:165, p:31,  c:0,   f:3.6, hh:'3.5 oz',   d:['paleo','medit','keto']},
  {n:'Turkey breast',           cat:'pro', kcal:135, p:30,  c:0,   f:1,   hh:'3.5 oz',   d:['paleo','medit','keto']},
  {n:'Lean sirloin steak',      cat:'pro', kcal:180, p:27,  c:0,   f:8,   hh:'3.5 oz',   d:['paleo','keto']},
  {n:'Ground beef 93/7',        cat:'pro', kcal:172, p:26,  c:0,   f:8,   hh:'3.5 oz',   d:['paleo','keto']},
  {n:'Ground turkey 93/7',      cat:'pro', kcal:176, p:27,  c:0,   f:7,   hh:'3.5 oz',   d:['paleo','keto']},
  {n:'Pork tenderloin',         cat:'pro', kcal:143, p:26,  c:0,   f:3.5, hh:'3.5 oz',   d:['paleo','keto']},
  {n:'Salmon fillet',           cat:'pro', kcal:208, p:20,  c:0,   f:13,  hh:'3.5 oz',   d:['paleo','medit','keto']},
  {n:'Cod fillet',              cat:'pro', kcal:105, p:23,  c:0,   f:0.9, hh:'3.5 oz',   d:['paleo','medit','keto']},
  {n:'Tilapia',                 cat:'pro', kcal:129, p:26,  c:0,   f:2.7, hh:'3.5 oz',   d:['paleo','medit','keto']},
  {n:'Shrimp',                  cat:'pro', kcal:99,  p:24,  c:0.2, f:0.3, hh:'3.5 oz',   d:['paleo','medit','keto'], allerg:['shellfish']},
  {n:'Tuna, canned in water',   cat:'pro', kcal:116, p:26,  c:0,   f:0.8, hh:'1 can',    d:['paleo','medit','keto']},
  {n:'Sardines, canned',        cat:'pro', kcal:208, p:25,  c:0,   f:11,  hh:'1 tin',    d:['paleo','medit','keto']},
  {n:'Ribeye steak',            cat:'pro', kcal:291, p:24,  c:0,   f:21,  hh:'3.5 oz',   d:['paleo','keto']},
  {n:'Ground beef 80/20',       cat:'pro', kcal:254, p:26,  c:0,   f:17,  hh:'3.5 oz',   d:['paleo','keto']},
  {n:'Chicken thigh, skin-on',  cat:'pro', kcal:229, p:25,  c:0,   f:14,  hh:'3.5 oz',   d:['paleo','keto']},
  {n:'Bacon',                   cat:'pro', kcal:541, p:37,  c:1.4, f:42,  hh:'4 slices', d:['paleo','keto']},
  /* ---- vegetarian proteins ---- */
  {n:'Egg whites',              cat:'pro', kcal:52,  p:11,  c:0.7, f:0.2, hh:'3 whites', d:['vegetarian','paleo','medit','keto'], allerg:['eggs']},
  {n:'Whole eggs',              cat:'pro', kcal:143, p:13,  c:0.7, f:9.5, hh:'2 large',  d:['vegetarian','paleo','medit','keto'], allerg:['eggs']},
  {n:'Greek yogurt, 0%',        cat:'pro', kcal:59,  p:10,  c:3.6, f:0.4, hh:'1/2 cup',  d:['vegetarian','medit','keto'], allerg:['dairy']},
  {n:'Cottage cheese, 2%',      cat:'pro', kcal:84,  p:11,  c:4.3, f:2.3, hh:'1/2 cup',  d:['vegetarian','medit','keto'], allerg:['dairy']},
  {n:'Whey protein powder',     cat:'pro', kcal:400, p:80,  c:8,   f:5,   hh:'3 scoops', d:['vegetarian','keto'], allerg:['dairy']},
  /* ---- vegan proteins ---- */
  {n:'Firm tofu',               cat:'pro', kcal:144, p:17,  c:3,   f:9,   hh:'3.5 oz',   d:['vegan','vegetarian','keto'], allerg:['soy']},
  {n:'Tempeh',                  cat:'pro', kcal:192, p:20,  c:8,   f:11,  hh:'3.5 oz',   d:['vegan','vegetarian','keto'], allerg:['soy']},
  {n:'Seitan',                  cat:'pro', kcal:370, p:75,  c:14,  f:1.9, hh:'3.5 oz',   d:['vegan','vegetarian'], allerg:['gluten']},
  {n:'Edamame, shelled',        cat:'pro', kcal:122, p:11,  c:10,  f:5,   hh:'2/3 cup',  d:['vegan','vegetarian','medit'], allerg:['soy']},
  {n:'Pea protein powder',      cat:'pro', kcal:400, p:80,  c:7,   f:6,   hh:'3 scoops', d:['vegan','vegetarian','keto']},
  {n:'Nutritional yeast',       cat:'pro', kcal:385, p:50,  c:36,  f:5,   hh:'1.5 cups', d:['vegan','vegetarian']},
  /* ---- carbs ---- */
  {n:'White rice, cooked',      cat:'carb',kcal:130, p:2.7, c:28,  f:0.3, hh:'1/2 cup',  d:['vegan','vegetarian']},
  {n:'Brown rice, cooked',      cat:'carb',kcal:123, p:2.7, c:26,  f:1,   hh:'1/2 cup',  d:['vegan','vegetarian','medit']},
  {n:'Jasmine rice, cooked',    cat:'carb',kcal:129, p:2.7, c:28,  f:0.3, hh:'1/2 cup',  d:['vegan','vegetarian']},
  {n:'Quinoa, cooked',          cat:'carb',kcal:120, p:4.4, c:21,  f:1.9, hh:'1/2 cup',  d:['vegan','vegetarian','medit']},
  {n:'Sweet potato, baked',     cat:'carb',kcal:90,  p:2,   c:21,  f:0.2, hh:'1 small',  d:['vegan','vegetarian','paleo','medit']},
  {n:'White potato, baked',     cat:'carb',kcal:93,  p:2.5, c:21,  f:0.1, hh:'1 small',  d:['vegan','vegetarian','paleo']},
  {n:'Butternut squash',        cat:'carb',kcal:45,  p:1,   c:12,  f:0.1, hh:'1 cup',    d:['vegan','vegetarian','paleo','medit']},
  {n:'Plantain, cooked',        cat:'carb',kcal:122, p:1.3, c:32,  f:0.4, hh:'1 medium', d:['vegan','vegetarian','paleo']},
  {n:'Beets, cooked',           cat:'carb',kcal:43,  p:1.6, c:10,  f:0.2, hh:'1 cup',    d:['vegan','vegetarian','paleo','medit']},
  {n:'Oats, dry',               cat:'carb',kcal:389, p:17,  c:66,  f:7,   hh:'1 cup',    d:['vegan','vegetarian','medit']},
  {n:'Whole-wheat pasta, cooked',cat:'carb',kcal:124,p:5,   c:26,  f:0.5, hh:'1/2 cup',  d:['vegan','vegetarian','medit'], allerg:['gluten']},
  {n:'Pasta, cooked',           cat:'carb',kcal:131, p:5,   c:25,  f:1.1, hh:'1/2 cup',  d:['vegan','vegetarian'], allerg:['gluten']},
  {n:'Whole-grain bread',       cat:'carb',kcal:250, p:13,  c:41,  f:3.5, hh:'2 slices', d:['vegan','vegetarian','medit'], allerg:['gluten']},
  {n:'Black beans, cooked',     cat:'carb',kcal:132, p:8.9, c:24,  f:0.5, hh:'1/2 cup',  d:['vegan','vegetarian','medit']},
  {n:'Lentils, cooked',         cat:'carb',kcal:116, p:9,   c:20,  f:0.4, hh:'1/2 cup',  d:['vegan','vegetarian','medit']},
  {n:'Chickpeas, cooked',       cat:'carb',kcal:164, p:8.9, c:27,  f:2.6, hh:'1/2 cup',  d:['vegan','vegetarian','medit']},
  {n:'Corn tortillas',          cat:'carb',kcal:218, p:5.7, c:45,  f:2.9, hh:'2 tortillas',d:['vegan','vegetarian']},
  {n:'Rice cakes',              cat:'carb',kcal:387, p:8,   c:81,  f:2.8, hh:'4 cakes',  d:['vegan','vegetarian']},
  /* ---- fats ---- */
  {n:'Olive oil',               cat:'fat', kcal:884, p:0,   c:0,   f:100, hh:'7 tbsp',   d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Avocado',                 cat:'fat', kcal:160, p:2,   c:9,   f:15,  hh:'1/2 medium',d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Almonds',                 cat:'fat', kcal:579, p:21,  c:22,  f:50,  hh:'3/4 cup',  d:['vegan','vegetarian','paleo','medit','keto'], allerg:['nuts']},
  {n:'Almond butter',           cat:'fat', kcal:614, p:21,  c:19,  f:56,  hh:'6 tbsp',   d:['vegan','vegetarian','paleo','keto'], allerg:['nuts']},
  {n:'Peanut butter',           cat:'fat', kcal:588, p:25,  c:20,  f:50,  hh:'6 tbsp',   d:['vegan','vegetarian','keto'], allerg:['nuts']},
  {n:'Walnuts',                 cat:'fat', kcal:654, p:15,  c:14,  f:65,  hh:'1 cup',    d:['vegan','vegetarian','paleo','medit','keto'], allerg:['nuts']},
  {n:'Cashews',                 cat:'fat', kcal:553, p:18,  c:30,  f:44,  hh:'3/4 cup',  d:['vegan','vegetarian','paleo','keto'], allerg:['nuts']},
  {n:'Pumpkin seeds',           cat:'fat', kcal:559, p:30,  c:11,  f:49,  hh:'3/4 cup',  d:['vegan','vegetarian','paleo','keto']},
  {n:'Hemp seeds',              cat:'fat', kcal:553, p:32,  c:9,   f:49,  hh:'2/3 cup',  d:['vegan','vegetarian','paleo','keto']},
  {n:'Chia seeds',              cat:'fat', kcal:486, p:17,  c:42,  f:31,  hh:'1/2 cup',  d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Tahini',                  cat:'fat', kcal:595, p:17,  c:21,  f:54,  hh:'6 tbsp',   d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Coconut oil',             cat:'fat', kcal:862, p:0,   c:0,   f:100, hh:'7 tbsp',   d:['vegan','vegetarian','paleo','keto']},
  {n:'Cheddar cheese',          cat:'fat', kcal:403, p:25,  c:1.3, f:33,  hh:'3.5 oz',   d:['vegetarian','medit','keto'], allerg:['dairy']},
  {n:'Macadamia nuts',          cat:'fat', kcal:718, p:8,   c:14,  f:76,  hh:'3/4 cup',  d:['vegan','vegetarian','paleo','keto'], allerg:['nuts']},
  {n:'Heavy cream',             cat:'fat', kcal:340, p:2.8, c:2.8, f:36,  hh:'1/3 cup',  d:['vegetarian','keto'], allerg:['dairy']},
  {n:'Butter',                  cat:'fat', kcal:717, p:0.9, c:0.1, f:81,  hh:'7 tbsp',   d:['vegetarian','keto'], allerg:['dairy']},
  /* ---- vegetables ---- */
  {n:'Broccoli',                cat:'veg', kcal:35,  p:2.4, c:7,   f:0.4, hh:'1 cup',    d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Spinach',                 cat:'veg', kcal:23,  p:2.9, c:3.6, f:0.4, hh:'3 cups',   d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Asparagus',               cat:'veg', kcal:22,  p:2.4, c:4,   f:0.2, hh:'1 cup',    d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Green beans',             cat:'veg', kcal:35,  p:1.8, c:8,   f:0.1, hh:'1 cup',    d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Bell peppers',            cat:'veg', kcal:31,  p:1,   c:6,   f:0.3, hh:'1 cup',    d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Zucchini',                cat:'veg', kcal:17,  p:1.2, c:3.1, f:0.3, hh:'1 cup',    d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Mixed salad greens',      cat:'veg', kcal:17,  p:1.4, c:2.9, f:0.2, hh:'3 cups',   d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Brussels sprouts',        cat:'veg', kcal:43,  p:3.4, c:9,   f:0.3, hh:'1 cup',    d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Cauliflower',             cat:'veg', kcal:25,  p:1.9, c:5,   f:0.3, hh:'1 cup',    d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Mushrooms',               cat:'veg', kcal:22,  p:3.1, c:3.3, f:0.3, hh:'1.5 cups', d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Kale',                    cat:'veg', kcal:49,  p:4.3, c:9,   f:0.9, hh:'2 cups',   d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Cabbage',                 cat:'veg', kcal:25,  p:1.3, c:6,   f:0.1, hh:'1.5 cups', d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Cucumber',                cat:'veg', kcal:15,  p:0.7, c:3.6, f:0.1, hh:'1 cup',    d:['vegan','vegetarian','paleo','medit','keto']},
  {n:'Carrots',                 cat:'veg', kcal:41,  p:0.9, c:10,  f:0.2, hh:'1 cup',    d:['vegan','vegetarian','paleo','medit']},
  /* ---- fruit (none tagged keto - berries aside, fruit blows a 30 g carb cap) ---- */
  {n:'Banana',                  cat:'fruit',kcal:89, p:1.1, c:23,  f:0.3, hh:'1 medium', d:['vegan','vegetarian','paleo','medit']},
  {n:'Apple',                   cat:'fruit',kcal:52, p:0.3, c:14,  f:0.2, hh:'1 small',  d:['vegan','vegetarian','paleo','medit']},
  {n:'Blueberries',             cat:'fruit',kcal:57, p:0.7, c:14,  f:0.3, hh:'2/3 cup',  d:['vegan','vegetarian','paleo','medit']},
  {n:'Strawberries',            cat:'fruit',kcal:32, p:0.7, c:7.7, f:0.3, hh:'2/3 cup',  d:['vegan','vegetarian','paleo','medit']},
  {n:'Raspberries',             cat:'fruit',kcal:52, p:1.2, c:12,  f:0.7, hh:'2/3 cup',  d:['vegan','vegetarian','paleo','medit']},
  {n:'Orange',                  cat:'fruit',kcal:47, p:0.9, c:12,  f:0.1, hh:'1 medium', d:['vegan','vegetarian','paleo','medit']},
  {n:'Pineapple',               cat:'fruit',kcal:50, p:0.5, c:13,  f:0.1, hh:'2/3 cup',  d:['vegan','vegetarian','paleo']},
  {n:'Grapes',                  cat:'fruit',kcal:69, p:0.7, c:18,  f:0.2, hh:'2/3 cup',  d:['vegan','vegetarian','paleo','medit']}
];
/* ===================== MEAL LIBRARY =====================================
   Named dishes rather than loose ingredients. Each one lists its components
   as [food name, grams for a reference serving], pointing at NUT_FOODS so
   the macros come from the same table the calculator uses - a dish can never
   drift from the food data. The generator scales the components to the
   person's per-meal targets, so the reference serving is a starting shape,
   not a fixed portion.
     slot - when the dish reads as a meal (breakfast / lunch / dinner / snack)
     d    - the diet styles it suits; styles that do not filter (balanced,
            low carb, high carb) draw from the whole library
   ---------------------------------------------------------------------- */
var NUT_RECIPES = [

  /* ---------------- keto ---------------- */
  {n:'Steak and Eggs with Avocado', slot:['breakfast','lunch','dinner'], d:['keto','paleo'],
   note:'Seared ribeye, eggs over easy, sliced avocado and wilted spinach',
   c:[['Ribeye steak',140],['Whole eggs',100],['Avocado',70],['Spinach',60]]},

  {n:'Butter-Basted Salmon with Asparagus', slot:['lunch','dinner'], d:['keto'],
   note:'Salmon basted in browned butter with blistered asparagus',
   c:[['Salmon fillet',170],['Butter',18],['Asparagus',150]]},

  {n:'Bacon-Wrapped Chicken with Cauliflower Mash', slot:['dinner'], d:['keto'],
   note:'Thigh wrapped in bacon over cauliflower whipped with cream',
   c:[['Chicken thigh, skin-on',150],['Bacon',25],['Cauliflower',180],['Heavy cream',40]]},

  {n:'Cobb Salad', slot:['lunch','dinner'], d:['keto'],
   note:'Chicken, egg, bacon, avocado and cheddar over chopped greens',
   c:[['Chicken breast, grilled',120],['Whole eggs',55],['Bacon',20],['Avocado',60],['Cheddar cheese',25],['Mixed salad greens',85]]},

  {n:'Ribeye with Garlic Butter Greens', slot:['dinner'], d:['keto','paleo'],
   note:'Ribeye rested in garlic butter, kale wilted in the pan drippings',
   c:[['Ribeye steak',160],['Butter',15],['Kale',110],['Olive oil',8]]},

  {n:'Cheesy Scrambled Eggs with Bacon', slot:['breakfast'], d:['keto'],
   note:'Soft-scrambled eggs folded with cheddar, bacon and mushrooms',
   c:[['Whole eggs',150],['Cheddar cheese',30],['Bacon',25],['Mushrooms',70],['Butter',10]]},

  {n:'Ground Beef and Zucchini Skillet', slot:['lunch','dinner'], d:['keto'],
   note:'80/20 beef browned with zucchini and melted cheddar',
   c:[['Ground beef 80/20',150],['Zucchini',160],['Cheddar cheese',25],['Olive oil',8]]},

  {n:'Tuna Avocado Boats', slot:['lunch','snack'], d:['keto'],
   note:'Tuna folded with olive oil, piled into avocado halves',
   c:[['Tuna, canned in water',110],['Avocado',100],['Olive oil',10],['Cucumber',80]]},

  {n:'Shrimp Scampi with Zoodles', slot:['lunch','dinner'], d:['keto'],
   note:'Garlic butter shrimp over zucchini noodles',
   c:[['Shrimp',150],['Butter',20],['Zucchini',180],['Olive oil',8]]},

  {n:'Sardine and Egg Breakfast Plate', slot:['breakfast','lunch'], d:['keto'],
   note:'Tinned sardines, jammy eggs, avocado and leaves',
   c:[['Sardines, canned',90],['Whole eggs',100],['Avocado',60],['Mixed salad greens',60]]},

  {n:'Macadamia and Cheese Plate', slot:['snack'], d:['keto'],
   note:'Macadamias, sharp cheddar and cucumber spears',
   c:[['Macadamia nuts',30],['Cheddar cheese',35],['Cucumber',90]]},

  {n:'Pork and Brussels Sprout Hash', slot:['breakfast','dinner'], d:['keto','paleo'],
   note:'Pork tenderloin crisped with shredded sprouts and bacon',
   c:[['Pork tenderloin',150],['Bacon',20],['Brussels sprouts',150],['Olive oil',10]]},

  {n:'Egg Roll in a Bowl', slot:['lunch','dinner'], d:['keto'],
   note:'Ground beef and cabbage finished with cream',
   c:[['Ground beef 80/20',140],['Cabbage',170],['Heavy cream',35],['Olive oil',8]]},

  {n:'Turkey and Avocado Roll-Ups', slot:['snack','lunch'], d:['keto','paleo'],
   note:'Turkey slices rolled around avocado with a leafy side',
   c:[['Turkey breast',120],['Avocado',70],['Mixed salad greens',50],['Olive oil',8]]},

  {n:'Hard-Boiled Eggs with Almonds', slot:['snack'], d:['keto','paleo'],
   note:'Jammy eggs, salted almonds and cucumber',
   c:[['Whole eggs',110],['Almonds',25],['Cucumber',80]]},

  {n:'Blackened Cod with Buttered Greens', slot:['lunch','dinner'], d:['keto'],
   note:'Spice-crusted cod with green beans finished in butter',
   c:[['Cod fillet',190],['Butter',22],['Green beans',150],['Olive oil',8]]},

  {n:'Beef Lettuce Wraps', slot:['lunch','dinner'], d:['keto','paleo'],
   note:'Seasoned beef spooned into lettuce cups with avocado',
   c:[['Ground beef 93/7',160],['Mixed salad greens',90],['Avocado',60],['Olive oil',10]]},

  /* ---------------- vegan ---------------- */
  {n:'Tofu Scramble Burrito', slot:['breakfast','lunch'], d:['vegan','vegetarian'],
   note:'Turmeric tofu scramble with peppers and avocado in corn tortillas',
   c:[['Firm tofu',170],['Corn tortillas',60],['Bell peppers',90],['Avocado',55],['Nutritional yeast',8]]},

  {n:'Lentil Curry with Rice', slot:['lunch','dinner'], d:['vegan','vegetarian'],
   note:'Coconut lentil curry over brown rice with wilted spinach',
   c:[['Lentils, cooked',200],['Brown rice, cooked',150],['Coconut oil',12],['Spinach',80]]},

  {n:'Chickpea Buddha Bowl', slot:['lunch','dinner'], d:['vegan','vegetarian'],
   note:'Roasted chickpeas and quinoa with kale, carrot and tahini drizzle',
   c:[['Chickpeas, cooked',180],['Quinoa, cooked',150],['Kale',80],['Carrots',70],['Tahini',18]]},

  {n:'Black Bean Tacos', slot:['lunch','dinner'], d:['vegan','vegetarian'],
   note:'Smoky black beans in corn tortillas with cabbage slaw and avocado',
   c:[['Black beans, cooked',180],['Corn tortillas',70],['Cabbage',80],['Avocado',60],['Bell peppers',60]]},

  {n:'Peanut Tempeh Stir-Fry', slot:['lunch','dinner'], d:['vegan','vegetarian'],
   note:'Tempeh and broccoli in peanut sauce over jasmine rice',
   c:[['Tempeh',140],['Peanut butter',25],['Broccoli',150],['Jasmine rice, cooked',160]]},

  {n:'Overnight Oats with Berries and Chia', slot:['breakfast','snack'], d:['vegan','vegetarian'],
   note:'Oats soaked with chia, blueberries and a spoon of almond butter',
   c:[['Oats, dry',70],['Chia seeds',15],['Blueberries',80],['Almond butter',18]]},

  {n:'Edamame and Brown Rice Bowl', slot:['lunch','snack'], d:['vegan','vegetarian'],
   note:'Sesame edamame over brown rice with carrot ribbons and hemp',
   c:[['Edamame, shelled',150],['Brown rice, cooked',160],['Carrots',70],['Hemp seeds',15]]},

  {n:'Seitan Fajita Bowl', slot:['lunch','dinner'], d:['vegan','vegetarian'],
   note:'Charred seitan strips and peppers over rice',
   c:[['Seitan',110],['Bell peppers',120],['Jasmine rice, cooked',160],['Olive oil',12]]},

  {n:'Green Protein Smoothie', slot:['breakfast','snack'], d:['vegan','vegetarian'],
   note:'Pea protein blended with banana, spinach and almond butter',
   c:[['Pea protein powder',35],['Banana',110],['Spinach',50],['Almond butter',16]]},

  {n:'Sweet Potato and Black Bean Hash', slot:['breakfast','lunch'], d:['vegan','vegetarian'],
   note:'Crisped sweet potato with black beans and kale',
   c:[['Sweet potato, baked',200],['Black beans, cooked',150],['Kale',80],['Olive oil',12]]},

  {n:'Tofu Poke Bowl', slot:['lunch','dinner'], d:['vegan','vegetarian'],
   note:'Marinated tofu over rice with cucumber, edamame and avocado',
   c:[['Firm tofu',160],['Jasmine rice, cooked',150],['Cucumber',80],['Edamame, shelled',70],['Avocado',50]]},

  {n:'Apple with Almond Butter', slot:['snack'], d:['vegan','vegetarian','paleo'],
   note:'Sliced apple with a spoon of almond butter',
   c:[['Apple',150],['Almond butter',24]]},

  {n:'Tempeh Taco Bowl', slot:['lunch','dinner'], d:['vegan','vegetarian'],
   note:'Crumbled tempeh and black beans with cabbage slaw and avocado',
   c:[['Tempeh',140],['Black beans, cooked',140],['Cabbage',90],['Avocado',55],['Corn tortillas',50]]},

  {n:'Seitan and Broccoli Stir-Fry', slot:['lunch','dinner'], d:['vegan','vegetarian'],
   note:'Seitan and broccoli in ginger soy over brown rice',
   c:[['Seitan',110],['Broccoli',160],['Brown rice, cooked',160],['Olive oil',12]]},

  {n:'Tofu Curry with Quinoa', slot:['lunch','dinner'], d:['vegan','vegetarian'],
   note:'Coconut tofu curry with spinach over quinoa',
   c:[['Firm tofu',170],['Quinoa, cooked',160],['Spinach',90],['Coconut oil',12]]},

  {n:'Protein Oats with Berries', slot:['breakfast','snack'], d:['vegan','vegetarian'],
   note:'Oats stirred with pea protein, raspberries and almond butter',
   c:[['Oats, dry',65],['Pea protein powder',30],['Raspberries',100],['Almond butter',18]]},

  {n:'Edamame and Tofu Salad Bowl', slot:['lunch','snack'], d:['vegan','vegetarian'],
   note:'Chilled tofu and edamame over greens with hemp and sesame oil',
   c:[['Firm tofu',150],['Edamame, shelled',120],['Mixed salad greens',80],['Hemp seeds',18],['Olive oil',10]]},

  {n:'Tempeh Breakfast Hash', slot:['breakfast'], d:['vegan','vegetarian'],
   note:'Tempeh crumbles crisped with sweet potato and peppers',
   c:[['Tempeh',140],['Sweet potato, baked',170],['Bell peppers',90],['Olive oil',12]]},

  /* ---------------- vegetarian (dairy / eggs) ---------------- */
  {n:'Greek Yogurt Parfait with Berries and Granola', slot:['breakfast','snack'], d:['vegetarian','medit'],
   note:'Layered yogurt, toasted oats, almonds and berries',
   c:[['Greek yogurt, 0%',220],['Oats, dry',35],['Almonds',20],['Blueberries',80]]},

  {n:'Three-Egg Veggie Omelette', slot:['breakfast','lunch'], d:['vegetarian','medit'],
   note:'Folded omelette with mushrooms, spinach and cheddar',
   c:[['Whole eggs',165],['Cheddar cheese',25],['Mushrooms',70],['Spinach',60],['Butter',8]]},

  {n:'Cottage Cheese and Pineapple Bowl', slot:['snack','breakfast'], d:['vegetarian','medit'],
   note:'Cottage cheese with pineapple and toasted almonds',
   c:[['Cottage cheese, 2%',200],['Pineapple',120],['Almonds',18]]},

  {n:'Egg and Avocado Toast', slot:['breakfast','lunch'], d:['vegetarian'],
   note:'Smashed avocado on grain toast with soft eggs and greens',
   c:[['Whole eggs',110],['Whole-grain bread',70],['Avocado',70],['Mixed salad greens',50]]},

  {n:'Seared Cheese and Chickpea Salad', slot:['lunch'], d:['vegetarian','medit'],
   note:'Pan-seared cheddar, chickpeas, cucumber and olive oil over leaves',
   c:[['Cheddar cheese',55],['Chickpeas, cooked',150],['Cucumber',90],['Mixed salad greens',70],['Olive oil',12]]},

  /* ---------------- mediterranean ---------------- */
  {n:'Grilled Chicken Gyro Bowl', slot:['lunch','dinner'], d:['medit'],
   note:'Oregano chicken over quinoa with cucumber and yogurt sauce',
   c:[['Chicken breast, grilled',160],['Quinoa, cooked',160],['Cucumber',90],['Greek yogurt, 0%',70],['Olive oil',12]]},

  {n:'Salmon Poke Bowl', slot:['lunch','dinner'], d:['medit'],
   note:'Salmon over brown rice with cucumber, edamame and avocado',
   c:[['Salmon fillet',150],['Brown rice, cooked',160],['Cucumber',70],['Edamame, shelled',60],['Avocado',50]]},

  {n:'Shrimp and Quinoa Tabbouleh', slot:['lunch','dinner'], d:['medit'],
   note:'Lemon shrimp tossed through herby quinoa and chopped salad',
   c:[['Shrimp',160],['Quinoa, cooked',160],['Cucumber',80],['Bell peppers',70],['Olive oil',14]]},

  {n:'Lemon Cod with Roasted Vegetables', slot:['dinner'], d:['medit'],
   note:'Baked cod with roasted squash and broccoli',
   c:[['Cod fillet',180],['Butternut squash',180],['Broccoli',120],['Olive oil',14]]},

  {n:'Tuna and Chickpea Salad', slot:['lunch'], d:['medit'],
   note:'Tuna, chickpeas and leaves dressed in lemon and olive oil',
   c:[['Tuna, canned in water',120],['Chickpeas, cooked',160],['Mixed salad greens',80],['Olive oil',14]]},

  {n:'Hummus Plate with Warm Bread', slot:['snack','lunch'], d:['medit','vegetarian'],
   note:'Chickpeas whipped with tahini, cucumber and grain bread',
   c:[['Chickpeas, cooked',170],['Tahini',22],['Cucumber',90],['Whole-grain bread',55]]},

  /* ---------------- paleo ---------------- */
  {n:'Sweet Potato Hash with Eggs', slot:['breakfast'], d:['paleo'],
   note:'Crisped sweet potato and peppers under fried eggs',
   c:[['Sweet potato, baked',190],['Whole eggs',120],['Bell peppers',80],['Olive oil',12]]},

  {n:'Grilled Chicken with Roasted Vegetables', slot:['lunch','dinner'], d:['paleo','medit'],
   note:'Chicken breast with roasted squash and broccoli',
   c:[['Chicken breast, grilled',170],['Butternut squash',180],['Broccoli',130],['Olive oil',14]]},

  {n:'Beef and Broccoli', slot:['lunch','dinner'], d:['paleo'],
   note:'Sirloin and broccoli seared in coconut oil with carrot',
   c:[['Lean sirloin steak',160],['Broccoli',160],['Coconut oil',12],['Carrots',70]]},

  {n:'Salmon with Sweet Potato and Greens', slot:['dinner'], d:['paleo','medit'],
   note:'Roast salmon, sweet potato wedges and garlicky kale',
   c:[['Salmon fillet',160],['Sweet potato, baked',180],['Kale',90],['Olive oil',12]]},

  {n:'Chicken Salad Plate with Walnuts', slot:['lunch','snack'], d:['paleo'],
   note:'Shredded chicken, avocado and walnuts over leaves',
   c:[['Chicken breast, grilled',150],['Avocado',70],['Walnuts',20],['Mixed salad greens',80]]},

  {n:'Eggs and Avocado Breakfast Plate', slot:['breakfast'], d:['paleo','keto'],
   note:'Fried eggs, avocado and sauteed spinach',
   c:[['Whole eggs',150],['Avocado',80],['Spinach',80],['Olive oil',10]]},

  {n:'Plantain and Beef Bowl', slot:['lunch','dinner'], d:['paleo'],
   note:'Caramelised plantain with seasoned beef and peppers',
   c:[['Ground beef 93/7',160],['Plantain, cooked',200],['Bell peppers',90],['Coconut oil',14]]},

  {n:'Banana Nut Breakfast Bowl', slot:['breakfast','snack'], d:['paleo'],
   note:'Banana, walnuts, almond butter and blueberries',
   c:[['Banana',140],['Walnuts',25],['Almond butter',20],['Blueberries',90]]},

  {n:'Chicken with Plantain and Greens', slot:['lunch','dinner'], d:['paleo'],
   note:'Grilled chicken, fried plantain and garlicky kale',
   c:[['Chicken breast, grilled',170],['Plantain, cooked',190],['Kale',90],['Olive oil',14]]},

  {n:'Steak with Roasted Roots', slot:['dinner'], d:['paleo'],
   note:'Sirloin with sweet potato, beets and carrots',
   c:[['Lean sirloin steak',165],['Sweet potato, baked',180],['Beets, cooked',110],['Carrots',90],['Olive oil',16]]},

  /* ---------------- balanced / everyday ---------------- */
  {n:'Turkey Chili', slot:['lunch','dinner'], d:[],
   note:'Ground turkey simmered with black beans and peppers over rice',
   c:[['Ground turkey 93/7',150],['Black beans, cooked',150],['Bell peppers',90],['Brown rice, cooked',140]]},

  {n:'Chicken Burrito Bowl', slot:['lunch','dinner'], d:[],
   note:'Grilled chicken, rice, black beans, peppers and avocado',
   c:[['Chicken breast, grilled',160],['Jasmine rice, cooked',170],['Black beans, cooked',120],['Avocado',55],['Bell peppers',70]]},

  {n:'Beef and Broccoli with Rice', slot:['dinner'], d:[],
   note:'Sirloin and broccoli stir-fried, served over jasmine rice',
   c:[['Lean sirloin steak',150],['Broccoli',150],['Jasmine rice, cooked',170],['Olive oil',12]]},

  {n:'Protein Oats with Banana and Peanut Butter', slot:['breakfast'], d:[],
   note:'Oats cooked with whey, topped with banana and peanut butter',
   c:[['Oats, dry',70],['Whey protein powder',30],['Banana',110],['Peanut butter',18]]},

  {n:'Chicken Caesar Quinoa Salad', slot:['lunch'], d:[],
   note:'Sliced chicken over quinoa, greens and shaved cheese',
   c:[['Chicken breast, grilled',150],['Quinoa, cooked',150],['Mixed salad greens',80],['Cheddar cheese',20],['Olive oil',12]]},

  {n:'Turkey and Sweet Potato Bowl', slot:['dinner'], d:[],
   note:'Ground turkey with roasted sweet potato and green beans',
   c:[['Ground turkey 93/7',160],['Sweet potato, baked',190],['Green beans',140],['Olive oil',12]]},

  {n:'Tuna Pasta Salad', slot:['lunch'], d:[],
   note:'Tuna tossed through pasta with leaves and olive oil',
   c:[['Tuna, canned in water',120],['Pasta, cooked',180],['Mixed salad greens',70],['Olive oil',14]]},

  {n:'Steak Fajita Bowl', slot:['dinner'], d:[],
   note:'Seared sirloin and charred peppers over rice with avocado',
   c:[['Lean sirloin steak',150],['Bell peppers',120],['Jasmine rice, cooked',160],['Avocado',55]]},

  {n:'Greek Yogurt Protein Bowl', slot:['snack','breakfast'], d:[],
   note:'Greek yogurt whipped with whey, strawberries and almonds',
   c:[['Greek yogurt, 0%',200],['Whey protein powder',20],['Strawberries',110],['Almonds',18]]},

  {n:'Cottage Cheese and Rice Cakes', slot:['snack'], d:[],
   note:'Rice cakes topped with cottage cheese and raspberries',
   c:[['Cottage cheese, 2%',180],['Rice cakes',30],['Raspberries',80]]},

  {n:'Shrimp Fried Rice', slot:['lunch','dinner'], d:[],
   note:'Shrimp and egg through fried rice with peppers',
   c:[['Shrimp',150],['White rice, cooked',170],['Whole eggs',55],['Bell peppers',80],['Olive oil',10]]},

  {n:'Turkey and Avocado Sandwich', slot:['lunch','snack'], d:[],
   note:'Turkey breast and smashed avocado on grain bread',
   c:[['Turkey breast',130],['Whole-grain bread',80],['Avocado',60],['Mixed salad greens',50]]},

  {n:'Chicken Thigh Traybake with Potatoes', slot:['dinner'], d:[],
   note:'Roast thighs with potato and green beans',
   c:[['Chicken thigh, skin-on',160],['White potato, baked',190],['Green beans',140],['Olive oil',10]]},

  {n:'Chicken and Rice Bowl', slot:['lunch','dinner'], d:[],
   note:'Grilled chicken over jasmine rice with steamed broccoli',
   c:[['Chicken breast, grilled',180],['Jasmine rice, cooked',220],['Broccoli',140]]},

  {n:'Shrimp and Rice Plate', slot:['lunch','dinner'], d:[],
   note:'Lemon shrimp with rice and green beans',
   c:[['Shrimp',170],['White rice, cooked',220],['Green beans',140]]},

  {n:'Oatmeal with Banana and Egg Whites', slot:['breakfast'], d:[],
   note:'Oats cooked through with egg whites, topped with banana',
   c:[['Oats, dry',80],['Egg whites',200],['Banana',120]]},

  {n:'Turkey and Potato Plate', slot:['lunch','dinner'], d:[],
   note:'Sliced turkey with roasted potato and carrots',
   c:[['Turkey breast',170],['White potato, baked',250],['Carrots',100]]},

  {n:'Chicken with Sweet Potato and Plantain', slot:['lunch','dinner'], d:['paleo'],
   note:'Grilled chicken with roasted sweet potato and plantain',
   c:[['Chicken breast, grilled',170],['Sweet potato, baked',200],['Plantain, cooked',150],['Bell peppers',80]]},

  {n:'Whey and Berry Shake', slot:['snack'], d:[],
   note:'Whey blended with raspberries and a spoon of almond butter',
   c:[['Whey protein powder',35],['Raspberries',100],['Almond butter',16]]}
];



/* ---------- state ---------- */
var nutState = { sex:'male', age:30, units:'imperial', weightLb:180, heightIn:70,
                 activity:'moderate', goal:'maintain', aggr:'moderate', diet:'balanced',
                 window:'none', winStart:12, winEnd:20, glp1:false,
                 excl:[], exclText:'', protPerLb:1.0, fatPct:25, meals:4, seed:1 };
var nutPlan = null;

/* ---------- helpers ---------- */
function nRound(x){ return Math.round(x); }
function nClamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function lbToKg(lb){ return lb/2.20462262; }
function inToCm(i){ return i*2.54; }
function gToOz(g){ return g/28.3495; }
/* localStorage is shared by every page on this domain, so the cache key has to
   carry the slug the way the Supabase row does. Without it, opening two
   protocol pages on one device leaves the second showing the first one's
   numbers until it saves. */
function nKey(k){ return k+':'+nutSlug(); }
function nStore(k,v){ try{ localStorage.setItem(nKey(k),JSON.stringify(v)); return true; }catch(e){ return false; } }
function nLoad(k){ try{ var r=localStorage.getItem(nKey(k)); return r?JSON.parse(r):null; }catch(e){ return null; } }
function nDrop(k){ try{ localStorage.removeItem(nKey(k)); }catch(e){} }

/* deterministic PRNG so a given seed always yields the same plan */
function nutRng(seed){ var s=seed>>>0||1; return function(){ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }

/* ---------- goal / window helpers ---------- */
function nutGoalAdj(st){
  var tbl=NUT_CFG.AGGRESSION[st.goal];
  if(!tbl) return 0;                               /* maintain */
  var v=tbl[st.aggr];
  return (v===undefined ? tbl.moderate : v);
}
function nutWindow(st){
  var w=NUT_CFG.WINDOWS[st.window]||NUT_CFG.WINDOWS.none;
  if(st.window==='custom'){
    var a=nClamp(parseFloat(st.winStart),0,23.75), b=nClamp(parseFloat(st.winEnd),0,23.75);
    if(!(b>a)) b=Math.min(23.75,a+1);
    return { label:'Custom', start:a, end:b, maxMeals:w.maxMeals };
  }
  return w;
}
function nutMaxMeals(st){ return nutWindow(st).maxMeals; }
/* meal times spread evenly across the window; one meal sits at its midpoint */
function nutMealTimes(st, n){
  var w=nutWindow(st), out=[];
  if(n<=1) return [ (w.start+w.end)/2 ];
  for(var i=0;i<n;i++) out.push(w.start + (w.end-w.start)*i/(n-1));
  return out;
}
function nutFmtTime(h){
  h=((h%24)+24)%24;
  var hr=Math.floor(h), mn=Math.round((h-hr)*60);
  if(mn===60){ mn=0; hr=(hr+1)%24; }
  var ap=hr<12?'AM':'PM', h12=hr%12; if(h12===0) h12=12;
  return h12+':'+(mn<10?'0':'')+mn+' '+ap;
}

/* ---------- core math ---------- */
function nutCompute(st){
  var kg = lbToKg(st.weightLb), cm = inToCm(st.heightIn);
  /* Mifflin-St Jeor */
  var bmr = 10*kg + 6.25*cm - 5*st.age + (st.sex==='male' ? 5 : -161);
  var tdee = bmr * (NUT_CFG.ACTIVITY[st.activity] || 1.55);
  var adj = nutGoalAdj(st);
  var cal = Math.max(NUT_CFG.MIN_CAL, tdee * (1 + adj));
  cal = nRound(cal);
  var pG = nRound(st.protPerLb * st.weightLb);
  var fG, cG;
  var dm = NUT_CFG.DIET_MACROS[st.diet];
  if(dm){
    /* diet drives the split: carbs from carbPct (capped for keto), protein from
       the user's g/lb target, fat takes whatever calories are left */
    cG = cal * (dm.carbPct/100) / 4;
    if(dm.maxCarbG) cG = Math.min(cG, dm.maxCarbG);
    cG = Math.max(0, nRound(cG));
    fG = nRound((cal - pG*4 - cG*4) / 9);
    var minF = nRound(cal * (NUT_CFG.MIN_FAT_PCT/100) / 9);
    if(fG < minF){ fG = minF; cG = Math.max(0, nRound((cal - pG*4 - fG*9) / 4)); }
  } else {
    fG = nRound(cal * (st.fatPct/100) / 9);
    cG = Math.max(0, nRound((cal - pG*4 - fG*9) / 4));
  }
  var pC=pG*4, fC=fG*9, cC=cG*4, tot=pC+fC+cC||1;
  return { bmr:nRound(bmr), tdee:nRound(tdee), cal:cal, adj:adj, dietOverrides:!!dm,
           p:pG, f:fG, c:cG, pC:pC, fC:fC, cC:cC,
           pPct:pC/tot*100, fPct:fC/tot*100, cPct:cC/tot*100 };
}

/* ---------- meal plan generator ----------
   For each meal we lock a vegetable (or fruit) at a fixed portion, then solve
   the remaining three foods - protein / carb / fat source - as a 3x3 linear
   system so their combined protein, carb and fat land on the meal's targets:

       [ p_pro p_carb p_fat ] [x_pro ]   [ P_target - P_veg ]
       [ c_pro c_carb c_fat ] [x_carb] = [ C_target - C_veg ]
       [ f_pro f_carb f_fat ] [x_fat ]   [ F_target - F_veg ]

   Solved by Cramer's rule, then portions are clamped to an edible range and
   rounded to 5 g. Clamping/rounding breaks exactness, so a short coordinate
   descent re-tunes the portions against a weighted error (protein weighted
   hardest, then calories). Foods are chosen so the system is well conditioned:
   the protein source is matched to the meal's fat-per-protein ratio, which
   keeps the solution positive. Deterministic for a given seed, and it always
   returns a full plan - if the solve degenerates it falls back to a
   sequential fill.                                                          */
function nutSolve3(m, b){
  /* Cramer's rule on a 3x3; returns null if near-singular */
  function det3(a){
    return a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])
         - a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])
         + a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]);
  }
  var D=det3(m);
  if(Math.abs(D)<1e-6) return null;
  var out=[];
  for(var col=0;col<3;col++){
    var mc=[[],[],[]];
    for(var r=0;r<3;r++) for(var c=0;c<3;c++) mc[r][c]= (c===col? b[r] : m[r][c]);
    out.push(det3(mc)/D);
  }
  return out;
}

function nutSolve2(m, b){
  /* exact 2x2 - used when a diet has no carb slot (keto): the two unknowns are
     the protein and fat foods, solved against the protein and fat targets */
  var D=m[0][0]*m[1][1]-m[0][1]*m[1][0];
  if(Math.abs(D)<1e-6) return null;
  return [ (b[0]*m[1][1]-m[0][1]*b[1])/D, (m[0][0]*b[1]-b[0]*m[1][0])/D ];
}

/* ===================== MENU BUILDER ====================================
   Builds a day from NUT_RECIPES - named dishes - and scales each one to that
   meal's targets. The older ingredient builder below stays as the safety net:
   heavy exclusions can empty the recipe pool, and a plan of loose foods is
   better than no plan.
   ---------------------------------------------------------------------- */
var nutFoodMap=null;
function nutFood(n){
  if(!nutFoodMap){ nutFoodMap={}; NUT_FOODS.forEach(function(f){ nutFoodMap[f.n]=f; }); }
  return nutFoodMap[n];
}

/* dish names from the last few plans, so Regenerate rotates the menu instead
   of re-rolling the same handful of dishes. nutMenuLast is the plan just
   served: those dishes are held back outright whenever the slot has real
   alternatives, which is what makes two regenerates read differently even on
   a diet where only a few dishes can carry the protein target. */
var nutMenuHistory=[];
var nutMenuLast=[];

/* A day is not four identical meals: dinner carries more than a mid-morning
   snack. Weights are normalised across however many meals there are, which is
   also what makes a snack-sized dish a sane choice for a snack slot. */
var NUT_SLOT_W = { breakfast:1.00, lunch:1.15, dinner:1.25, snack:0.60 };
var NUT_SLOT_OF = { 'Breakfast':'breakfast', 'Mid-Morning':'snack', 'Lunch':'lunch',
                    'Afternoon':'snack', 'Dinner':'dinner', 'Evening':'snack', 'Meal':'dinner' };

function nutRecipePool(st){
  var filt = NUT_CFG.DIET_FILTERS.indexOf(st.diet)>-1 ? st.diet : null;
  var excl = (st.excl||[]);
  var banned = String(st.exclText||'').toLowerCase().split(',')
                 .map(function(x){ return x.trim(); }).filter(Boolean);
  return NUT_RECIPES.filter(function(r){
    if(filt && r.d.indexOf(filt)<0) return false;
    return r.c.every(function(ci){
      var f=nutFood(ci[0]);
      if(!f) return false;
      if(f.allerg && excl.some(function(a){ return f.allerg.indexOf(a)>-1; })) return false;
      var ln=f.n.toLowerCase();
      return !banned.some(function(b){ return ln.indexOf(b)>-1; });
    });
  });
}

/* A meal scoring under this is close enough to its targets that swapping in a
   fresher dish is free. Above it, accuracy wins and a recent dish can return. */
var NUT_FIT_OK = 0.25;

function nutFitErr(a, per, glp1){
  return (glp1?NUT_CFG.GLP1.PROTEIN_W:9)*Math.pow((a.p-per.p)/Math.max(per.p,1),2)
       + 1.5*Math.pow((a.c-per.c)/Math.max(per.c,1),2)
       + 2.5*Math.pow((a.f-per.f)/Math.max(per.f,1),2)
       + 4*Math.pow((a.kcal-per.cal)/Math.max(per.cal,1),2);
}

/* Scale a dish to one meal's targets. Components are grouped by what they are
   for - protein, carb, fat, vegetable - and each group gets one multiplier, so
   the dish keeps its shape: more steak and more butter, not a fourth food
   appearing from nowhere. */
function nutScaleRecipe(r, per, glp1){
  var groups={}, order=[];
  r.c.forEach(function(ci){
    var f=nutFood(ci[0]); if(!f) return;
    var role=(f.cat==='veg'||f.cat==='fruit') ? 'veg' : f.cat;
    if(!groups[role]){ groups[role]={items:[],p:0,c:0,f:0,kcal:0}; order.push(role); }
    var g=groups[role], k=ci[1]/100;
    g.items.push({f:f,g:ci[1]});
    g.p+=f.p*k; g.c+=f.c*k; g.f+=f.f*k; g.kcal+=f.kcal*k;
  });
  if(!order.length) return null;
  /* Headroom scales with how big the meal is. A reference serving is written
     for a normal plate, so a 900-calorie dinner needs to stretch further than
     a 400-calorie one - without letting a snack inflate to a dinner. */
  var room=nClamp(per.cal/550, 1, 2.2);
  /* Floors matter as much as ceilings: a dish that solves avocado down to 10g
     is not the dish it is named after. Every component stays recognisable. */
  var LIM={ pro:[0.5,4.0*room], carb:[0.3,3.5*room], fat:[0.45,3.2*room], veg:[0.6,2.4] };
  /* and a hard ceiling on what any one component can grow to, so a dish never
     solves its way to a kilo of squash - a dish that cannot reach the target
     inside these portions simply scores badly and another one gets picked */
  var MAXG={ pro:400, carb:550, fat:150, veg:600 };
  order.forEach(function(role){
    var big=groups[role].items.reduce(function(a,it){ return Math.max(a,it.g); },1);
    var cap=(MAXG[role]||500)/big;
    LIM[role]=[Math.min(LIM[role][0],cap), Math.max(LIM[role][0], Math.min(LIM[role][1], cap))];
  });
  function tot(x){
    var a={p:0,c:0,f:0,kcal:0};
    order.forEach(function(role,i){
      var g=groups[role];
      a.p+=g.p*x[i]; a.c+=g.c*x[i]; a.f+=g.f*x[i]; a.kcal+=g.kcal*x[i];
    });
    return a;
  }
  function err(x){ return nutFitErr(tot(x), per, glp1); }
  var x=order.map(function(){ return 1; });
  for(var pass=0; pass<120; pass++){
    var improved=false;
    for(var k=0;k<x.length;k++){
      for(var d=-1;d<=1;d+=2){
        var lim=LIM[order[k]]||[0.3,3], t=x.slice();
        t[k]=nClamp(+(t[k]+d*0.04).toFixed(4), lim[0], lim[1]);
        if(err(t)<err(x)-1e-9){ x=t; improved=true; }
      }
    }
    if(!improved) break;
  }
  var items=[], acc={kcal:0,p:0,c:0,f:0};
  order.forEach(function(role,i){
    groups[role].items.forEach(function(it){
      var g=Math.max(5, Math.round(it.g*x[i]/5)*5), k=g/100;
      items.push({ n:it.f.n, g:g, hh:it.f.hh, kcal:nRound(it.f.kcal*k),
                   p:+(it.f.p*k).toFixed(1), c:+(it.f.c*k).toFixed(1), f:+(it.f.f*k).toFixed(1) });
      acc.kcal+=it.f.kcal*k; acc.p+=it.f.p*k; acc.c+=it.f.c*k; acc.f+=it.f.f*k;
    });
  });
  return { items:items, acc:acc, err:nutFitErr(acc, per, glp1) };
}

function nutShuffled(list, rnd){
  var a=list.slice();
  for(var i=a.length-1;i>0;i--){ var j=Math.floor(rnd()*(i+1))%(i+1); var t=a[i]; a[i]=a[j]; a[j]=t; }
  return a;
}

/* Pick a dish for this slot. Candidates are scored on how close they land to
   the meal's targets once scaled, and the choice is random among the best few
   - accurate, but not the same optimum every single time. */
function nutChooseDish(pool, slot, rnd, usedToday, per, glp1){
  var chain=[slot].concat(['lunch','dinner','breakfast','snack'].filter(function(s){ return s!==slot; }));
  var lastResort=null;
  for(var i=0;i<chain.length;i++){
    var cand=pool.filter(function(r){ return r.slot.indexOf(chain[i])>-1; });
    if(!cand.length) continue;
    var open=cand.filter(function(r){ return !usedToday[r.n]; });
    if(!open.length){ lastResort=lastResort||cand; continue; }
    /* When the slot has real alternatives, dishes from the plan just served
       are held back outright so a regenerate actually reads differently.
       When it does not - vegan at a high protein target, where only two or
       three dishes can carry the meal - they come back in, merely pushed
       down, because a repeated dish beats a day that misses its target. */
    function rank(list){
      return nutShuffled(list,rnd).slice(0,18).map(function(r){
        var s=nutScaleRecipe(r,per,glp1);
        if(!s) return null;
        return {r:r,s:s,rank:(nutMenuHistory.indexOf(r.n)<0 ? s.err : s.err*2.5+0.15)};
      }).filter(Boolean).sort(function(a,b){ return a.rank-b.rank; });
    }
    var novel=open.filter(function(r){ return nutMenuLast.indexOf(r.n)<0 && nutMenuHistory.indexOf(r.n)<0; });
    var scored=[];
    /* Try the dishes not served recently first, and keep them only if one of
       them actually lands near the meal's targets. Variety is the goal right
       up to the point where it would cost the day its numbers. */
    if(novel.length>=2){
      scored=rank(novel);
      if(scored.length && scored[0].s.err>NUT_FIT_OK) scored=[];
    }
    if(!scored.length) scored=rank(open);
    if(!scored.length) continue;
    var top=scored.slice(0, Math.min(3, scored.length));
    return top[Math.floor(rnd()*top.length)%top.length];
  }
  /* every dish is already on today's menu - repeat the best fit rather than fail */
  if(lastResort && lastResort.length){
    var again=lastResort.map(function(r){
      var s=nutScaleRecipe(r,per,glp1); return s?{r:r,s:s}:null;
    }).filter(Boolean).sort(function(a,b){ return a.s.err-b.s.err; });
    if(again.length) return again[0];
  }
  return null;
}

function nutBuildMenu(st, m){
  var pool=nutRecipePool(st);
  if(pool.length<2) return null;                 /* fall back to loose foods */
  var rnd=nutRng(st.seed*7919 + st.meals*13 + 1);
  var times=nutMealTimes(st, st.meals);
  var names = st.meals===1 ? ['Meal']
            : st.meals>=6 ? ['Breakfast','Mid-Morning','Lunch','Afternoon','Dinner','Evening']
            : st.meals===5 ? ['Breakfast','Mid-Morning','Lunch','Afternoon','Dinner']
            : st.meals===4 ? ['Breakfast','Lunch','Afternoon','Dinner']
            : ['Breakfast','Lunch','Dinner'];
  var slots=[], wsum=0;
  for(var i=0;i<st.meals;i++){
    var nm=names[i]||('Meal '+(i+1)), sl=NUT_SLOT_OF[nm]||'lunch';
    slots.push({name:nm, slot:sl, w:NUT_SLOT_W[sl]||1});
    wsum+=NUT_SLOT_W[sl]||1;
  }
  var usedToday={}, meals=[], served=[];
  /* Each meal is targeted at what is LEFT of the day, not at a fixed share of
     it. A breakfast that lands light on protein raises the bar for lunch, so
     the day still totals out instead of drifting four meals in a row. */
  var rem={ cal:m.cal, p:m.p, c:m.c, f:m.f }, wleft=wsum;
  for(var j=0;j<slots.length;j++){
    var sh=slots[j].w/wleft;
    var per={ cal:Math.max(80,rem.cal*sh), p:Math.max(5,rem.p*sh),
              c:Math.max(2,rem.c*sh),      f:Math.max(3,rem.f*sh) };
    var pick=nutChooseDish(pool, slots[j].slot, rnd, usedToday, per, !!st.glp1);
    if(!pick) return null;
    usedToday[pick.r.n]=1; served.push(pick.r.n);
    meals.push({ name:slots[j].name, at:nutFmtTime(times[j]), dish:pick.r.n, note:pick.r.note||'',
                 items:pick.s.items, kcal:nRound(pick.s.acc.kcal), p:nRound(pick.s.acc.p),
                 c:nRound(pick.s.acc.c), f:nRound(pick.s.acc.f) });
    rem.cal-=pick.s.acc.kcal; rem.p-=pick.s.acc.p; rem.c-=pick.s.acc.c; rem.f-=pick.s.acc.f;
    wleft-=slots[j].w;
  }
  /* remember what was just served, but never so much that the pool starves */
  nutMenuLast = served.slice();
  nutMenuHistory = served.concat(nutMenuHistory).slice(0, Math.max(0, Math.min(3*st.meals, pool.length-1)));

  var tot=meals.reduce(function(a,x){ a.kcal+=x.kcal; a.p+=x.p; a.c+=x.c; a.f+=x.f; return a; },
                       {kcal:0,p:0,c:0,f:0});
  return { meals:meals, total:tot, target:{cal:m.cal,p:m.p,c:m.c,f:m.f},
           per:{cal:m.cal/st.meals,p:m.p/st.meals,c:m.c/st.meals,f:m.f/st.meals},
           window:nutWindow(st).label, glp1:!!st.glp1, thin:[], menu:true, poolSize:pool.length,
           poolNote: pool.length < st.meals
             ? 'Only '+pool.length+' dish'+(pool.length>1?'es':'')+' clear these exclusions, so the day repeats one.'
             : '',
           madeAt:new Date().toISOString(), seed:st.seed };
}

function nutBuildPlan(st, m){
  var rnd = nutRng(st.seed*7919 + st.meals*13 + 1);
  /* filter the library: diet style first, then allergens and named exclusions */
  var filt = NUT_CFG.DIET_FILTERS.indexOf(st.diet)>-1 ? st.diet : null;
  var excl = (st.excl||[]);
  var banned = String(st.exclText||'').toLowerCase().split(',')
                 .map(function(x){ return x.trim(); }).filter(Boolean);
  function dietOk(f){ return !filt || (f.d && f.d.indexOf(filt)>-1); }
  function exclOk(f){
    if(f.allerg && excl.some(function(a){ return f.allerg.indexOf(a)>-1; })) return false;
    var ln=f.n.toLowerCase();
    return !banned.some(function(b){ return ln.indexOf(b)>-1; });
  }
  var byCat={}, thin=[];
  ['pro','carb','fat','veg','fruit'].forEach(function(k){
    var all=NUT_FOODS.filter(function(f){ return f.cat===k; });
    var pool=all.filter(function(f){ return dietOk(f) && exclOk(f); });
    /* Guardrail: exclusions must never empty a slot the solver depends on, so
       fall back to diet-only and flag that the plan is squeezed. Fruit is the
       exception - it is an optional garnish, and relaxing it would smuggle
       fruit into keto, so an empty fruit pool just stays empty.              */
    if(!pool.length && k!=='fruit'){ pool=all.filter(dietOk); if(pool.length) thin.push(k); }
    if(!pool.length && k!=='fruit'){ pool=all; if(thin.indexOf(k)<0) thin.push(k); }
    else if(pool.length && pool.length<=2 && thin.indexOf(k)<0 && (excl.length||banned.length)) thin.push(k);
    byCat[k]=pool;
  });
  var glp1=!!st.glp1;
  /* keto has no carb sources by design - its carbs come from the vegetable */
  var noCarbSlot = (filt==='keto');
  /* keto also has no eligible fruit, so the anchor is always a vegetable */
  var hasFruit = byCat.fruit.length>0;
  var times = nutMealTimes(st, st.meals);
  var names = st.meals===1 ? ['Meal']
            : st.meals>=6 ? ['Breakfast','Mid-Morning','Lunch','Afternoon','Dinner','Evening']
            : st.meals===5 ? ['Breakfast','Mid-Morning','Lunch','Afternoon','Dinner']
            : st.meals===4 ? ['Breakfast','Lunch','Afternoon','Dinner']
            : ['Breakfast','Lunch','Dinner'];

  var per = { cal:m.cal/st.meals, p:m.p/st.meals, c:m.c/st.meals, f:m.f/st.meals };
  /* keep the day varied - a food used recently is pushed to the back of the
     candidate list rather than banned, so a plan is still always buildable */
  var used={};
  function fresh(list){
    var a=list.filter(function(f){ return !used[f.n]; });
    return a.length ? a : list;
  }
  /* how much fat the meal wants per gram of protein - used to pick a protein
     source that does not blow the fat budget on its own */
  var fpr = per.p>0 ? per.f/per.p : 0.5;

  var MINU=NUT_CFG.MIN_PORTION/100, MAXU=NUT_CFG.MAX_PORTION/100, STEP=NUT_CFG.PORTION_STEP/100;
  /* Portion headroom scales with how few meals carry the day: OMAD has to fit
     a whole day's food into one sitting, so its caps are ~4x a 4-meal plan.
     Paleo also gets extra room because its only starches are roots and squash,
     which are mostly water.                                                  */
  var mealScale = nClamp(4/Math.max(1,st.meals), 1, 4);
  var densest=byCat.carb.reduce(function(a,f){ return Math.max(a,f.c); },0);
  var carbCap=Math.min(2000,(densest<35?700:NUT_CFG.MAX_PORTION_CARB)*mealScale);
  var otherCap=Math.min(1200, NUT_CFG.MAX_PORTION*mealScale);
  function maxFor(food){ return (food.cat==='carb'?carbCap:otherCap)/100; }
  function snap(u,food){ return Math.round(nClamp(u,0,food?maxFor(food):MAXU)/STEP)*STEP; }

  var meals=[];
  for(var i=0;i<st.meals;i++){
    /* --- 1. fixed vegetable / fruit anchor --- */
    var anchorList = (st.meals>3 && i===1 && hasFruit) ? byCat.fruit : byCat.veg;
    var aList=fresh(anchorList);
    var anchor = aList[(Math.floor(rnd()*aList.length)+i)%aList.length];
    var anchorU = glp1 ? 0.9 : 1.2;      /* GLP-1: less bulk on the plate */

    /* --- 2. choose the three solvable foods --- */
    var needP=Math.max(per.p-anchor.p*anchorU,5);
    /* variety is a preference here, not a rule: on a short pool like vegan the
       dense sources have to be reusable or the protein target is unreachable */
    var pros=byCat.pro.slice().sort(function(a,b){
      function score(f){
        var s=Math.abs(f.f/Math.max(f.p,1)-fpr);
        if(noCarbSlot) s+=(f.c/Math.max(f.p,1))*3;
        /* penalise a source that would need an inedible portion - matters most
           on vegan, where the lean options are dilute */
        var g=f.p>0 ? needP/(f.p/100) : 1e9;
        if(g>340*mealScale) s+=(g-340*mealScale)/120;
        if(used[f.n]) s+=0.55;                 /* soft variety preference */
        /* GLP-1: favour dense, protein-rich sources over bulky dilute ones */
        if(glp1) s += Math.max(0,(340-g))*0 + (g/200);
        return s;
      }
      return score(a)-score(b);
    });
    var pf = pros[Math.floor(rnd()*Math.min(3,pros.length))];          /* near-best fit */
    /* prefer a carb/fat source whose required portion lands in a comfortable
       range - a 3,000 kcal day needs denser carbs than rice to stay under the
       400 g per-item cap */
    function fitBy(list, need, key){
      var scored=list.map(function(f){
        var g = f[key]>0 ? need/(f[key]/100) : 1e9;         /* grams required */
        var hi = 320*mealScale, lo = 40*mealScale;
        var pen = g>hi ? (g-hi) : (g<lo ? (lo-g)*1.5 : 0);   /* distance from comfy */
        /* on a no-carb-slot diet, a fat source that drags carbs in costs us the
           whole carb budget - prefer the purer fats (oil, butter, avocado) */
        if(noCarbSlot && key==='f' && f.f>0) pen += (f.c/f.f)*260;
        /* GLP-1: reward calorie density so the portion is physically smaller */
        if(glp1 && f.kcal<NUT_CFG.GLP1.MIN_DENSITY) pen += NUT_CFG.GLP1.DENSITY_W;
        return {f:f,pen:pen};
      }).sort(function(a,b){ return a.pen-b.pen; });
      return scored.slice(0,Math.max(3,Math.min(6,scored.length)));
    }
    var cCand=fitBy(fresh(byCat.carb), Math.max(per.c-anchor.c*anchorU,10), 'c');
    var fCand=fitBy(fresh(byCat.fat),  Math.max(per.f-anchor.f*anchorU,5),  'f');
    var cf = cCand[Math.floor(rnd()*cCand.length)].f;
    var ff = fCand[Math.floor(rnd()*fCand.length)].f;

    var foods = noCarbSlot ? [pf,ff] : [pf,cf,ff];
    var rhs=[ per.p-anchor.p*anchorU, per.c-anchor.c*anchorU, per.f-anchor.f*anchorU ];
    var x;
    if(noCarbSlot){
      /* two unknowns, two binding targets (protein and fat); carbs ride along
         on the vegetable, which is the whole point of keto. Solved exactly so
         the protein source's own fat is credited against the fat target. */
      x=nutSolve2([[pf.p,ff.p],[pf.f,ff.f]],[rhs[0],rhs[2]]);
      if(!x || x.some(function(v){ return !isFinite(v)||v<0; })){
        x=[ pf.p>0?(rhs[0]/pf.p):0.8, ff.f>0?(rhs[2]/ff.f):0.2 ];
      }
    } else {
      var mat=[[pf.p,cf.p,ff.p],[pf.c,cf.c,ff.c],[pf.f,cf.f,ff.f]];
      x=nutSolve3(mat,rhs);
      if(!x || x.some(function(v){ return !isFinite(v); })){
        /* fallback: sequential fill, still always yields a plan */
        x=[ pf.p>0?(rhs[0]/pf.p):0.8, cf.c>0?(rhs[1]/cf.c):0.8, ff.f>0?(rhs[2]/ff.f):0.2 ];
      }
    }
    x=x.map(function(v,k){ return snap(v,foods[k]); });

    /* --- 3. coordinate descent to recover what clamping/rounding cost --- */
    var NF=foods.length;
    function err(v){
      var av=(v.length>NF?v[NF]:anchorU);
      var P=anchor.p*av, C=anchor.c*av, F=anchor.f*av;
      for(var k=0;k<NF;k++){ P+=foods[k].p*v[k]; C+=foods[k].c*v[k]; F+=foods[k].f*v[k]; }
      var kc=P*4+C*4+F*9;
      /* on a no-carb-slot diet the carb target is a floor set by the vegetable,
         not something the solver can chase - penalise it only when it runs over */
      var cErr = noCarbSlot ? Math.pow(Math.max(0,C-per.c)/Math.max(per.c,1),2)*0.4
                            : Math.pow((C-per.c)/Math.max(per.c,1),2)*1.5;
      return (glp1?NUT_CFG.GLP1.PROTEIN_W:5)*Math.pow((P-per.p)/Math.max(per.p,1),2)
           + cErr
           + 3*Math.pow((F-per.f)/Math.max(per.f,1),2)
           + 3*Math.pow((kc-per.cal)/Math.max(per.cal,1),2);
    }
    x.push(anchorU);                       /* last lever: the veg/fruit portion */
    var lim=foods.map(maxFor);
    lim.push(glp1 ? NUT_CFG.GLP1.ANCHOR_MAX : (noCarbSlot?4.0:2.5)*mealScale);  /* keto leans on veg */
    for(var pass=0;pass<60;pass++){
      var improved=false;
      for(var k=0;k<=NF;k++){
        for(var d=-1;d<=1;d+=2){
          var trial=x.slice();
          trial[k]=nClamp(+(trial[k]+d*STEP).toFixed(4), k===NF?0.8:0, lim[k]);
          if(err(trial)<err(x)-1e-9){ x=trial; improved=true; }
        }
      }
      if(!improved) break;
    }
    anchorU=x[NF];

    /* --- 4. assemble, dropping any food that solved to a trivial amount --- */
    var items=[], acc={kcal:0,p:0,c:0,f:0};
    function push(food,u){
      var minu=(food.cat==='fat'?NUT_CFG.MIN_PORTION_FAT:NUT_CFG.MIN_PORTION)/100;
      if(u<minu) return;                       /* skip rather than force a token portion */
      var g=Math.round(u*100), k=g/100;
      items.push({ n:food.n, g:g, hh:food.hh, kcal:nRound(food.kcal*k),
                   p:+(food.p*k).toFixed(1), c:+(food.c*k).toFixed(1), f:+(food.f*k).toFixed(1) });
      acc.kcal+=food.kcal*k; acc.p+=food.p*k; acc.c+=food.c*k; acc.f+=food.f*k;
    }
    push(anchor,anchorU);
    foods.forEach(function(f,k){ push(f,x[k]); });
    [anchor].concat(foods).forEach(function(f){ used[f.n]=1; });

    meals.push({ name:names[i]||('Meal '+(i+1)), at:nutFmtTime(times[i]), items:items,
                 kcal:nRound(acc.kcal), p:nRound(acc.p), c:nRound(acc.c), f:nRound(acc.f) });
  }
  var tot=meals.reduce(function(a,x2){ a.kcal+=x2.kcal; a.p+=x2.p; a.c+=x2.c; a.f+=x2.f; return a; },
                       {kcal:0,p:0,c:0,f:0});
  return { meals:meals, total:tot, target:{cal:m.cal,p:m.p,c:m.c,f:m.f}, per:per,
           window:nutWindow(st).label, glp1:glp1, thin:thin,
           madeAt:new Date().toISOString(), seed:st.seed };
}

/* ===================== UI ============================================== */
function nutEl(id){ return document.getElementById(id); }
function nutFmt(n){ return Number(n).toLocaleString(); }

/* imperial <-> metric display conversion (state is always stored imperial) */
function nutSyncUnitFields(){
  var st=nutState;
  if(st.units==='imperial'){
    nutEl('nut-w').value = Math.round(st.weightLb);
    nutEl('nut-ft').value = Math.floor(st.heightIn/12);
    nutEl('nut-in').value = Math.round(st.heightIn%12);
    nutEl('nut-w-unit').textContent='lb';
    nutEl('nut-h-imp').hidden=false; nutEl('nut-h-met').hidden=true;
  } else {
    nutEl('nut-w').value = Math.round(lbToKg(st.weightLb));
    nutEl('nut-cm').value = Math.round(inToCm(st.heightIn));
    nutEl('nut-w-unit').textContent='kg';
    nutEl('nut-h-imp').hidden=true; nutEl('nut-h-met').hidden=false;
  }
}
function nutReadFields(){
  var st=nutState;
  st.age = nClamp(parseInt(nutEl('nut-age').value,10)||30, 14, 99);
  var w = parseFloat(nutEl('nut-w').value)||0;
  if(st.units==='imperial'){
    st.weightLb = nClamp(w, 70, 600);
    var ft=parseInt(nutEl('nut-ft').value,10)||0, inch=parseInt(nutEl('nut-in').value,10)||0;
    st.heightIn = nClamp(ft*12+inch, 48, 90);
  } else {
    st.weightLb = nClamp(w*2.20462262, 70, 600);
    var cm=parseFloat(nutEl('nut-cm').value)||0;
    st.heightIn = nClamp(cm/2.54, 48, 90);
  }
  st.fatPct = nClamp(parseInt(nutEl('nut-fat').value,10)||25, 15, 40);
  st.exclText = (nutEl('nut-excl-text').value||'').slice(0,200);
  if(st.window==='custom'){
    st.winStart = nutHm(nutEl('nut-win-start').value, 12);
    st.winEnd   = nutHm(nutEl('nut-win-end').value, 20);
  }
  /* the eating window caps meals/day */
  var mx=nutMaxMeals(st);
  if(st.meals>mx) st.meals=mx;
}
function nutHm(v, dflt){
  var m=/^(\d{1,2}):(\d{2})$/.exec(String(v||''));
  if(!m) return dflt;
  return nClamp(parseInt(m[1],10)+parseInt(m[2],10)/60, 0, 23.75);
}
function nutToHm(h){
  var hr=Math.floor(h), mn=Math.round((h-hr)*60);
  if(mn===60){ mn=0; hr++; }
  return (hr<10?'0':'')+hr+':'+(mn<10?'0':'')+mn;
}

/* segmented button groups: data-grp / data-val */
/* Set the moment anyone touches a control. The saved profile arrives on its
   own schedule, and on a phone that can land a second or two after the tab is
   already usable - long enough to have picked a diet first. Without this flag
   that late response overwrote the live selection, so choosing Keto and then
   generating quietly produced the stored diet's plan instead. */
var nutTouched=false;
function nutMarkTouched(){ nutTouched=true; }

function nutBindSegs(){
  document.querySelectorAll('#tab-nutrition .nut-seg-btn').forEach(function(b){
    b.addEventListener('click', function(){
      nutMarkTouched();
      var grp=b.getAttribute('data-grp'), val=b.getAttribute('data-val');
      document.querySelectorAll('#tab-nutrition .nut-seg-btn[data-grp="'+grp+'"]').forEach(function(o){
        o.classList.toggle('on', o===b); o.setAttribute('aria-pressed', o===b?'true':'false');
      });
      if(grp==='units'){ nutReadFields(); nutState.units=val; nutSyncUnitFields(); }
      else if(grp==='protPerLb'){ nutState[grp]=parseFloat(val); }
      else if(grp==='meals'){ nutState[grp]=parseInt(val,10); }
      else if(grp==='glp1'){ nutState.glp1=(val==='on'); }
      else { nutState[grp]=val; }
      if(grp==='diet'){ nutMenuHistory=[]; nutMenuLast=[]; }
      if(grp==='window'){
        var w=NUT_CFG.WINDOWS[val]||NUT_CFG.WINDOWS.none;
        if(val!=='custom'){ nutState.winStart=w.start; nutState.winEnd=w.end; }
        /* Custom seeds from wherever you were, but coming off OMAD that is a
           one-hour window - fall back to the default rather than inherit it */
        else if(nutState.winEnd-nutState.winStart < 4){
          nutState.winStart=w.start; nutState.winEnd=w.end;
        }
        nutEl('nut-win-start').value=nutToHm(nutState.winStart);
        nutEl('nut-win-end').value=nutToHm(nutState.winEnd);
        if(nutState.meals>w.maxMeals) nutState.meals=w.maxMeals;
      }
      nutRender();
    });
  });
}

function nutBindChips(){
  document.querySelectorAll('#tab-nutrition .nut-chip').forEach(function(b){
    b.addEventListener('click',function(){
      nutMarkTouched();
      var k=b.getAttribute('data-excl'), i=nutState.excl.indexOf(k);
      if(i>-1) nutState.excl.splice(i,1); else nutState.excl.push(k);
      b.classList.toggle('on', i<0); b.setAttribute('aria-pressed', i<0?'true':'false');
      nutRender();
    });
  });
}

function nutDonut(m){
  var segs=[{v:m.pPct,c:'var(--accent)'},{v:m.cPct,c:'var(--green)'},{v:m.fPct,c:'var(--amber)'}];
  var R=54, C=2*Math.PI*R, off=0, out='';
  segs.forEach(function(s){
    var len=C*(s.v/100);
    out+='<circle cx="70" cy="70" r="'+R+'" fill="none" stroke="'+s.c+'" stroke-width="22" '+
         'stroke-dasharray="'+len.toFixed(2)+' '+(C-len).toFixed(2)+'" '+
         'stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 70 70)"></circle>';
    off+=len;
  });
  return '<svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="Macro split">'+out+
         '<text x="70" y="66" text-anchor="middle" class="nut-donut-n">'+nutFmt(m.cal)+'</text>'+
         '<text x="70" y="82" text-anchor="middle" class="nut-donut-l">CALORIES</text></svg>';
}

/* Five of the nine controls (diet style, protein target, meals, window, GLP-1)
   legitimately never move Daily Calories - they only move the macro split or
   the per-meal numbers. With one giant calorie figure as the headline, that
   reads as "nothing happened". This briefly highlights whichever figures did
   change so every selection visibly does something. */
var NUT_WATCH=['nut-cal','nut-p-g','nut-c-g','nut-f-g','nut-p-pct','nut-c-pct','nut-f-pct',
               'nut-pm-cal','nut-pm-p','nut-pm-c','nut-pm-f','nut-pm-times'];
var nutPrev={};
function nutFlashChanged(){
  NUT_WATCH.forEach(function(id){
    var el=nutEl(id); if(!el) return;
    var v=el.textContent;
    if(nutPrev[id]!==undefined && nutPrev[id]!==v){
      el.classList.remove('nut-changed');
      void el.offsetWidth;            /* restart the animation */
      el.classList.add('nut-changed');
    }
    nutPrev[id]=v;
  });
}

function nutRender(){
  nutReadFields();
  var st=nutState, m=nutCompute(st);
  /* a diet that drives the split owns the fat number - park the slider */
  var fatRow=nutEl('nut-fat-row'), note=nutEl('nut-diet-note'), slider=nutEl('nut-fat');
  if(m.dietOverrides){
    slider.disabled=true; fatRow.classList.add('is-off');
    note.hidden=false;
    note.textContent=(NUT_CFG.DIET_LABELS[st.diet]||st.diet)+' sets the macro split \u2014 '+
      Math.round(m.cPct)+'% carbs, '+Math.round(m.fPct)+'% fat.';
    nutEl('nut-fat-val').textContent=Math.round(m.fPct)+'%';
  } else {
    slider.disabled=false; fatRow.classList.remove('is-off');
    note.hidden=true;
    nutEl('nut-fat-val').textContent=st.fatPct+'%';
  }
  /* goal aggressiveness only applies to lose / gain */
  var aggrRow=nutEl('nut-aggr-row');
  /* Keep the row in the flow and just fade it out. Hiding it outright used to
     reflow every control below by ~50px the instant a goal was picked, so the
     next tap landed on a different button than the one aimed at. */
  aggrRow.classList.toggle('is-muted', st.goal==='maintain');
  /* eating window: cap meals and grey out the ones that no longer fit */
  var mx=nutMaxMeals(st);
  document.querySelectorAll('#tab-nutrition .nut-seg-btn[data-grp="meals"]').forEach(function(b){
    var v=parseInt(b.getAttribute('data-val'),10);
    b.disabled = v>mx;
    b.classList.toggle('is-off', v>mx);
    b.classList.toggle('on', v===st.meals);
    b.setAttribute('aria-pressed', v===st.meals?'true':'false');
    /* a disabled button that says nothing reads as a broken page */
    b.title = v>mx ? (nutWindow(st).label+' leaves room for '+mx+' meal'+(mx>1?'s':'')+' a day') : '';
  });
  var mealsCap=nutEl('nut-meals-cap');
  if(mealsCap){
    var capped = mx < 6;
    mealsCap.hidden = !capped;
    if(capped) mealsCap.textContent = nutWindow(st).label+' caps this at '+mx+' meal'+(mx>1?'s':'')+' a day \u2014 widen the eating window for more.';
  }
  nutEl('nut-win-custom').hidden = (st.window!=='custom');
  var wn=nutWindow(st);
  nutEl('nut-win-note').textContent = st.window==='none'
    ? 'No fasting window \u2014 meals spread across the day.'
    : wn.label+' \u2014 eat between '+nutFmtTime(wn.start)+' and '+nutFmtTime(wn.end)+
      ' \u00b7 up to '+wn.maxMeals+' meal'+(wn.maxMeals>1?'s':'')+'.';
  nutEl('nut-cal').textContent=nutFmt(m.cal);
  nutEl('nut-cal-sub').textContent='BMR '+nutFmt(m.bmr)+'  |  TDEE '+nutFmt(m.tdee)+
    (m.adj===0?'':'  |  '+(m.adj>0?'+':'')+Math.round(m.adj*100)+'% '+st.aggr);
  [['p',m.p,m.pPct],['c',m.c,m.cPct],['f',m.f,m.fPct]].forEach(function(x){
    nutEl('nut-'+x[0]+'-g').textContent=Math.round(x[1])+'g';
    nutEl('nut-'+x[0]+'-pct').textContent=Math.round(x[2])+'%';
    nutEl('nut-'+x[0]+'-bar').style.width=x[2].toFixed(1)+'%';
  });
  nutEl('nut-donut').innerHTML=nutDonut(m);
  nutEl('nut-meals-n').textContent=st.meals;
  nutEl('nut-pm-times').textContent = nutMealTimes(st,st.meals).map(nutFmtTime).join('  \u00b7  ');
  nutEl('nut-glp1-note').hidden = !st.glp1;
  nutFlashChanged();
  nutEl('nut-pm-cal').textContent=nutFmt(Math.round(m.cal/st.meals));
  nutEl('nut-pm-p').textContent=Math.round(m.p/st.meals)+'g';
  nutEl('nut-pm-c').textContent=Math.round(m.c/st.meals)+'g';
  nutEl('nut-pm-f').textContent=Math.round(m.f/st.meals)+'g';
  return m;
}

function nutRenderPlan(plan, mountId){
  if(!plan){ nutEl(mountId).innerHTML=''; return; }
  var h='';
  plan.meals.forEach(function(ml){
    h+='<div class="nut-meal"><div class="nut-meal-head">'+
       '<span class="nut-meal-name">'+ml.name+(ml.at?'<em class="nut-meal-at">'+ml.at+'</em>':'')+'</span>'+
       '<span class="nut-meal-kcal">'+nutFmt(ml.kcal)+' cal</span></div>';
    if(ml.dish) h+='<div class="nut-meal-dish">'+ml.dish+'</div>';
    if(ml.note) h+='<div class="nut-meal-note">'+ml.note+'</div>';
    h+='<div class="nut-meal-items">';
    ml.items.forEach(function(it){
      h+='<div class="nut-item"><span class="nut-item-n">'+it.n+'</span>'+
         '<span class="nut-item-q">'+it.g+' g <em>&middot; '+it.hh.replace(/^([\d.\/]+)/,function(x){
             var mult=it.g/100; var num=parseFloat(x); return isFinite(num)?(+(num*mult).toFixed(2)+''):x; })+'</em></span></div>';
    });
    h+='</div><div class="nut-meal-macros"><span>P '+ml.p+'g</span><span>C '+ml.c+'g</span><span>F '+ml.f+'g</span></div></div>';
  });
  var pre='';
  if(plan.glp1) pre+='<div class="nut-note">Protein-forward, smaller portions for reduced appetite.</div>';
  if(plan.thin && plan.thin.length){
    var names={pro:'protein',carb:'carb',fat:'fat',veg:'vegetable',fruit:'fruit'};
    pre+='<div class="nut-note warn">Limited '+plan.thin.map(function(k){return names[k]||k;}).join(' and ')+
         ' sources with these exclusions \u2014 plan may run under target.</div>';
  }
  h=pre+h;
  var t=plan.total, g=plan.target;
  function dev(a,b){ return b? Math.round((a-b)/b*100) : 0; }
  h+='<div class="nut-plan-total"><div class="nut-plan-total-head">Plan total vs target</div>'+
     '<div class="nut-plan-total-row"><span>Calories</span><b>'+nutFmt(t.kcal)+'</b><em>target '+nutFmt(g.cal)+' ('+(dev(t.kcal,g.cal)>=0?'+':'')+dev(t.kcal,g.cal)+'%)</em></div>'+
     '<div class="nut-plan-total-row"><span>Protein</span><b>'+t.p+'g</b><em>target '+g.p+'g ('+(dev(t.p,g.p)>=0?'+':'')+dev(t.p,g.p)+'%)</em></div>'+
     '<div class="nut-plan-total-row"><span>Carbs</span><b>'+t.c+'g</b><em>target '+g.c+'g ('+(dev(t.c,g.c)>=0?'+':'')+dev(t.c,g.c)+'%)</em></div>'+
     '<div class="nut-plan-total-row"><span>Fat</span><b>'+t.f+'g</b><em>target '+g.f+'g ('+(dev(t.f,g.f)>=0?'+':'')+dev(t.f,g.f)+'%)</em></div></div>';
  nutEl(mountId).innerHTML=h;
}

/* The screen is the source of truth at generate time: read the segmented
   controls straight off the DOM so a plan can never be built for a diet other
   than the one actually showing. */
function nutSyncFromSegs(){
  document.querySelectorAll('#tab-nutrition .nut-seg-btn[aria-pressed="true"]').forEach(function(b){
    var grp=b.getAttribute('data-grp'), val=b.getAttribute('data-val');
    if(!grp || grp==='units') return;
    if(grp==='protPerLb')   nutState[grp]=parseFloat(val);
    else if(grp==='meals')  nutState[grp]=parseInt(val,10);
    else if(grp==='glp1')   nutState.glp1=(val==='on');
    else                    nutState[grp]=val;
  });
}

function nutCreatePlan(reshuffle){
  nutSyncFromSegs();
  var m=nutRender();
  if(reshuffle) nutState.seed=(nutState.seed%9999)+1;
  nutPlan=nutBuildMenu(nutState,m) || nutBuildPlan(nutState,m);
  nutRenderPlan(nutPlan,'nut-plan');
  nutEl('nut-plan-wrap').hidden=false;
  nutEl('nut-plan-wrap').scrollIntoView({block:'nearest',behavior:'smooth'});
}

/* ============================================================================
   CROSS-DEVICE SAVE  -  Supabase `nutrition_profiles`, keyed by page slug
   ----------------------------------------------------------------------------
   localStorage stays the instant cache so the tab paints immediately; Supabase
   is the source of truth and wins whenever it answers. The slug comes from the
   URL path, so this same block saves under whichever slug it is served from -
   every page keeps its own row and nothing here is page-specific.
   If the table is missing or the network is down every call fails soft and the
   tab keeps working exactly as it did on localStorage alone.
   ========================================================================== */
/* Supabase anon key - the same public key the other tools on this site use.
   It is a publishable key by design; what protects the data is the RLS
   policy on the table, not the secrecy of this string. */
window.BL_SUPABASE_ANON = window.BL_SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmanlkemVhbGVldGhoY3BkZnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MjM1NTMsImV4cCI6MjA5MTA5OTU1M30.dPVJ8X7PQkq4UbG218JVoX-C96ezno5Z4lQECXxcbgQ';
var NUT_SB = {
  url : 'https://bfjydzealeethhcpdfxl.supabase.co',
  key : (window.BL_SUPABASE_ANON || document.documentElement.getAttribute('data-sb-anon') || ''),
  table: 'nutrition_profiles'
};
function nutSlug(){
  var m = (location.pathname||'').replace(/\/+$/,'').split('/').filter(Boolean);
  return (m.length ? m[m.length-1] : 'default').replace(/\.html?$/,'');
}
function nutSbReady(){ return !!(NUT_SB.key && NUT_SB.url); }
function nutSbHeaders(extra){
  var h = {'apikey':NUT_SB.key,'Authorization':'Bearer '+NUT_SB.key,'Content-Type':'application/json'};
  if(extra) Object.keys(extra).forEach(function(k){ h[k]=extra[k]; });
  return h;
}
/* upsert on the unique page_slug */
function nutSbSave(payload){
  if(!nutSbReady()) return Promise.resolve({ok:false,reason:'no-key'});
  return fetch(NUT_SB.url+'/rest/v1/'+NUT_SB.table+'?on_conflict=page_slug', {
    method:'POST',
    headers: nutSbHeaders({'Prefer':'resolution=merge-duplicates,return=representation'}),
    body: JSON.stringify([{ page_slug: nutSlug(), data: payload, updated_at: new Date().toISOString() }])
  }).then(function(r){ return r.ok ? {ok:true} : r.text().then(function(t){ return {ok:false,reason:r.status+' '+t.slice(0,120)}; }); })
    .catch(function(e){ return {ok:false,reason:String(e).slice(0,120)}; });
}
function nutSbLoad(){
  if(!nutSbReady()) return Promise.resolve(null);
  return fetch(NUT_SB.url+'/rest/v1/'+NUT_SB.table+'?page_slug=eq.'+encodeURIComponent(nutSlug())+'&select=data,updated_at&limit=1',
    { headers: nutSbHeaders() })
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(rows){ return (rows && rows[0]) ? rows[0] : null; })
    .catch(function(){ return null; });
}

function nutSavePlan(){
  if(!nutPlan){ nutCreatePlan(false); }
  var payload={state:nutState,plan:nutPlan,targets:nutCompute(nutState)};
  nStore(NUT_CFG.STORE_PLAN,{state:nutState,plan:nutPlan});
  nStore(NUT_CFG.STORE_TARGETS,{state:nutState,targets:payload.targets});
  nutShowSaved();
  nutSaveBtnState('saving');
  nutSbSave(payload).then(function(r){
    if(r.ok){ nutSaveBtnState('saved'); nutToast('Saved \u2014 syncs to your other devices'); }
    else   { nutSaveBtnState('local');  nutToast('Saved on this device only'); }
  });
}
/* Save / Saved feedback on the button itself */
function nutSaveBtnState(mode){
  var b=document.querySelector('#tab-nutrition .nut-btn[onclick*="nutSavePlan"]');
  if(!b) return;
  if(!b.getAttribute('data-label')) b.setAttribute('data-label', b.textContent.trim());
  var base=b.getAttribute('data-label');
  b.classList.remove('is-saved','is-local');
  if(mode==='saving'){ b.textContent='Saving\u2026'; b.disabled=true; }
  else if(mode==='saved'){ b.textContent='Saved \u2713'; b.disabled=false; b.classList.add('is-saved');
    setTimeout(function(){ b.textContent=base; b.classList.remove('is-saved'); },2600); }
  else { b.textContent='Saved on device'; b.disabled=false; b.classList.add('is-local');
    setTimeout(function(){ b.textContent=base; b.classList.remove('is-local'); },2600); }
}
function nutSaveTargets(){
  var payload={state:nutState,targets:nutCompute(nutState),plan:nutPlan||null};
  nStore(NUT_CFG.STORE_TARGETS,{state:nutState,targets:payload.targets});
  nutSbSave(payload).then(function(r){
    nutToast(r.ok?'Targets saved \u2014 syncs to your other devices':'Targets saved on this device');
  });
}
function nutClearSaved(){
  nDrop(NUT_CFG.STORE_PLAN); nDrop(NUT_CFG.STORE_TARGETS);
  nutEl('nut-saved').hidden=true;
  var b=nutEl('nut-synced'); if(b) b.hidden=true;
  nutToast('Saved plan cleared on this device');
}
function nutToast(msg){
  var t=nutEl('nut-toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(nutToast._t); nutToast._t=setTimeout(function(){ t.classList.remove('show'); },2200);
}
function nutShowSaved(){
  var saved=nLoad(NUT_CFG.STORE_PLAN);
  if(!saved||!saved.plan){ nutEl('nut-saved').hidden=true; return; }
  nutEl('nut-saved').hidden=false;
  var d=new Date(saved.plan.madeAt);
  var dl=(saved.state&&NUT_CFG.DIET_LABELS[saved.state.diet])||'Balanced';
  nutEl('nut-saved-meta').textContent=
    dl+'  |  '+nutFmt(saved.plan.target.cal)+' cal  |  P '+saved.plan.target.p+'g  C '+saved.plan.target.c+
    'g  F '+saved.plan.target.f+'g  |  saved '+(isNaN(d)?'':d.toLocaleDateString());
  nutRenderPlan(saved.plan,'nut-saved-plan');
}

function nutInit(){
  if(!document.getElementById('nut-age')) return;   /* no Nutrition tab on this page */
  var saved=nLoad(NUT_CFG.STORE_TARGETS)||nLoad(NUT_CFG.STORE_PLAN);
  if(saved&&saved.state){ Object.keys(nutState).forEach(function(k){
      if(saved.state[k]!==undefined) nutState[k]=saved.state[k]; }); }
  /* reflect state into the controls */
  nutEl('nut-age').value=nutState.age;
  nutEl('nut-fat').value=nutState.fatPct;
  nutEl('nut-excl-text').value=nutState.exclText||'';
  nutEl('nut-win-start').value=nutToHm(nutState.winStart);
  nutEl('nut-win-end').value=nutToHm(nutState.winEnd);
  if(!Array.isArray(nutState.excl)) nutState.excl=[];
  document.querySelectorAll('#tab-nutrition .nut-chip').forEach(function(b){
    var on=nutState.excl.indexOf(b.getAttribute('data-excl'))>-1;
    b.classList.toggle('on',on); b.setAttribute('aria-pressed',on?'true':'false');
  });
  nutSyncUnitFields();
  [['sex',nutState.sex],['units',nutState.units],['activity',nutState.activity],['goal',nutState.goal],
   ['diet',nutState.diet],['window',nutState.window],['aggr',nutState.aggr],
   ['glp1',nutState.glp1?'on':'off'],['protPerLb',String(nutState.protPerLb)],
   ['meals',String(nutState.meals)]].forEach(function(pair){
    document.querySelectorAll('#tab-nutrition .nut-seg-btn[data-grp="'+pair[0]+'"]').forEach(function(b){
      var on=b.getAttribute('data-val')===pair[1];
      b.classList.toggle('on',on); b.setAttribute('aria-pressed',on?'true':'false');
    });
  });
  nutBindSegs(); nutBindChips();
  ['nut-age','nut-w','nut-ft','nut-in','nut-cm','nut-fat','nut-excl-text',
   'nut-win-start','nut-win-end'].forEach(function(id){
    var el=nutEl(id); if(el) el.addEventListener('input',function(){ nutMarkTouched(); nutRender(); });
  });
  nutRender(); nutShowSaved();

  /* Supabase is the source of truth: the tab has already painted from the
     localStorage cache, so this quietly upgrades it when the row comes back. */
  nutSbLoad().then(function(row){
    if(!row || !row.data || !row.data.state) return;
    /* The row came back after the user had already started choosing. Their
       screen wins - say a saved plan exists rather than silently rewriting
       the selections they just made. */
    if(nutTouched){
      var t=nutEl('nut-synced');
      if(t){ t.hidden=false;
             t.textContent='\u21bb You have a saved plan \u2014 reload to load it, or keep these choices and save again.'; }
      return;
    }
    Object.keys(nutState).forEach(function(k){
      if(row.data.state[k]!==undefined) nutState[k]=row.data.state[k];
    });
    if(row.data.plan){ nutPlan=row.data.plan; nStore(NUT_CFG.STORE_PLAN,{state:nutState,plan:nutPlan}); }
    nStore(NUT_CFG.STORE_TARGETS,{state:nutState,targets:row.data.targets||nutCompute(nutState)});
    nutReflectState(); nutRender(); nutShowSaved();
    var b=nutEl('nut-synced');
    if(b){
      var d=new Date(row.updated_at);
      b.hidden=false;
      b.textContent='\u21bb Loaded your saved plan'+(isNaN(d)?'':' from '+d.toLocaleDateString());
    }
  });
}

/* push nutState back into every control - used after a Supabase load */
function nutReflectState(){
  nutEl('nut-age').value=nutState.age;
  nutEl('nut-fat').value=nutState.fatPct;
  nutEl('nut-excl-text').value=nutState.exclText||'';
  nutEl('nut-win-start').value=nutToHm(nutState.winStart);
  nutEl('nut-win-end').value=nutToHm(nutState.winEnd);
  if(!Array.isArray(nutState.excl)) nutState.excl=[];
  document.querySelectorAll('#tab-nutrition .nut-chip').forEach(function(b){
    var on=nutState.excl.indexOf(b.getAttribute('data-excl'))>-1;
    b.classList.toggle('on',on); b.setAttribute('aria-pressed',on?'true':'false');
  });
  nutSyncUnitFields();
  [['sex',nutState.sex],['units',nutState.units],['activity',nutState.activity],['goal',nutState.goal],
   ['diet',nutState.diet],['window',nutState.window],['aggr',nutState.aggr],
   ['glp1',nutState.glp1?'on':'off'],['protPerLb',String(nutState.protPerLb)],
   ['meals',String(nutState.meals)]].forEach(function(pair){
    document.querySelectorAll('#tab-nutrition .nut-seg-btn[data-grp="'+pair[0]+'"]').forEach(function(b){
      var on=b.getAttribute('data-val')===pair[1];
      b.classList.toggle('on',on); b.setAttribute('aria-pressed',on?'true':'false');
    });
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',nutInit);
else nutInit();

/* ============================ BLOODWORK ============================= */
/* ===================== MARKER DETAIL PANEL ==============================
   Reads each lab row's own markup when it is opened, so the table stays the
   single source of truth for every value, range and explanation.
   ====================================================================== */
(function(){
  var tab = document.getElementById('tab-bloodwork');
  if(!tab) return;
  var scrim = document.getElementById('mkScrim'),
      panel = document.getElementById('mkPanel'),
      titleEl = document.getElementById('mkTitle'),
      eyebrowEl = document.getElementById('mkPanelEyebrow'),
      bodyEl = document.getElementById('mkBody'),
      xBtn  = document.getElementById('mkX');
  if(!scrim || !panel) return;

  var lastFocus = null, current = null, range = 'all';

  function num(t){ var m = String(t).match(/-?[\d.]+/); return m ? parseFloat(m[0]) : null; }
  function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  /* ---------- pull one row apart ---------- */
  function read(row){
    var nameEl = row.querySelector('.lab-name'),
        valEl  = row.querySelector('.lab-val'),
        refEl  = row.querySelector('.lab-ref'),
        stEl   = row.querySelector('.lab-status'),
        tipEl  = row.querySelector('.info-tip-text');

    var name = '';
    if(nameEl){
      var c = nameEl.cloneNode(true);
      var t = c.querySelector('.info-tip'); if(t) t.remove();
      name = c.textContent.trim();
    }
    var unit = '', valTxt = '';
    if(valEl){
      var v = valEl.cloneNode(true);
      var em = v.querySelector('em');
      if(em){ unit = em.textContent.trim(); em.remove(); }
      valTxt = v.textContent.trim();
    }
    var tipHTML = tipEl ? tipEl.innerHTML : '';
    var trendRaw = '', whatHTML = tipHTML;
    var ti = tipHTML.search(/<strong>\s*Trend:\s*<\/strong>/i);
    if(ti > -1){
      trendRaw = tipHTML.slice(ti).replace(/<strong>\s*Trend:\s*<\/strong>/i,'');
      whatHTML = tipHTML.slice(0, ti).replace(/(<br\s*\/?>\s*)+$/i,'');
    }
    var sec = row.closest('.lab-section');
    var secName = sec ? (sec.querySelector('.lab-section-title')||{}).textContent : '';

    return { name:name, valTxt:valTxt, val:num(valTxt), unit:unit,
             refTxt:(refEl?refEl.textContent.trim():''),
             stCls:(stEl?(stEl.className.match(/lab-status\s+(\w+)/)||[])[1]||'normal':'normal'),
             stTxt:(stEl?stEl.textContent.trim():''),
             whatHTML:whatHTML, trend:parseTrend(trendRaw),
             section:(secName||'').trim() };
  }

  /* ---------- "01/25 328 -> 06/25 345 -> ..." ---------- */
  function parseTrend(raw){
    if(!raw) return [];
    var txt = raw.replace(/<[^>]*>/g,' ').replace(/&rarr;|&gt;|→/g,'|').replace(/&nbsp;/g,' ');
    var out = [];
    txt.split('|').forEach(function(chunk){
      var m = chunk.trim().match(/^(\d{1,2})\/(\d{2})\s+(-?[\d.]+)/);
      if(!m) return;
      var mo = parseInt(m[1],10), yr = 2000 + parseInt(m[2],10);
      out.push({ mo:mo, yr:yr, t:yr*12+mo, label:m[1]+'/'+m[2], v:parseFloat(m[3]) });
    });
    return out;
  }

  /* ---------- "ref 250-1100" / "ref <200" / "ref >40" ---------- */
  function parseRef(raw){
    var t = String(raw).replace(/^ref\s*/i,'').trim();
    var m = t.match(/(-?[\d.]+)\s*(?:[–—-])\s*(-?[\d.]+)/);
    if(m) return {kind:'range', lo:parseFloat(m[1]), hi:parseFloat(m[2])};
    m = t.match(/^[≤<]\s*(-?[\d.]+)/);
    if(m) return {kind:'max', hi:parseFloat(m[1])};
    m = t.match(/^[≥>]\s*(-?[\d.]+)/);
    if(m) return {kind:'min', lo:parseFloat(m[1])};
    return {kind:'none'};
  }

  /* ---------- where the value sits, computed - never asserted ---------- */
  function placement(v, ref){
    if(v === null || ref.kind === 'none') return '';
    if(ref.kind === 'range'){
      var span = ref.hi - ref.lo;
      if(v > ref.hi) return 'above the reference range';
      if(v < ref.lo) return 'below the reference range';
      var p = span > 0 ? (v - ref.lo)/span : 0.5;
      if(p >= 0.85) return 'at the top of the range';
      if(p >= 0.65) return 'in the upper third';
      if(p >= 0.35) return 'mid-range';
      if(p >= 0.15) return 'in the lower third';
      return 'at the bottom of the range';
    }
    if(ref.kind === 'max'){
      if(v > ref.hi) return 'over the limit';
      var p = ref.hi ? v/ref.hi : 0;
      if(p >= 0.85) return 'close to the limit';
      if(p >= 0.5)  return 'comfortably under the limit';
      return 'well under the limit';
    }
    if(v < ref.lo) return 'under the minimum';
    var q = ref.lo ? v/ref.lo : 0;
    if(q >= 1.5) return 'well above the minimum';
    if(q >= 1.15) return 'comfortably above the minimum';
    return 'just above the minimum';
  }

  var HUE = {ok:'#2f7a4a', normal:'#3a6b8e', hi:'#b97a1f', lo:'#b85555'};

  /* ---------- range bar ---------- */
  function barHTML(d, ref){
    if(ref.kind === 'none' || d.val === null) return '';
    var lo, hi, bandA, bandB, mid = null, thresh = null, pad;
    if(ref.kind === 'range'){
      pad = (ref.hi - ref.lo) * 0.14 || 1;
      lo = Math.min(ref.lo - pad, d.val - pad*0.6);
      hi = Math.max(ref.hi + pad, d.val + pad*0.6);
      bandA = ref.lo; bandB = ref.hi;
      mid = [ref.lo + (ref.hi-ref.lo)*0.25, ref.lo + (ref.hi-ref.lo)*0.75];
    } else if(ref.kind === 'max'){
      hi = Math.max(ref.hi * 1.55, d.val * 1.2); lo = 0;
      bandA = 0; bandB = ref.hi; thresh = ref.hi;
    } else {
      hi = Math.max(ref.lo * 2.1, d.val * 1.25); lo = 0;
      bandA = ref.lo; bandB = hi; thresh = ref.lo;
    }
    var w = hi - lo || 1;
    var pc = function(x){ return Math.max(0, Math.min(100, (x - lo)/w*100)); };
    var hue = HUE[d.stCls] || HUE.normal;
    var h = '<div class="mk-bar-wrap"><div class="mk-bar">'
      + '<div class="mk-band" style="left:' + pc(bandA) + '%;width:' + (pc(bandB)-pc(bandA)) + '%;'
      + '--_b:' + hue + '2e"></div>';
    if(mid) h += '<div class="mk-band mid" style="left:' + pc(mid[0]) + '%;width:'
      + (pc(mid[1])-pc(mid[0])) + '%;--_b2:' + hue + '55"></div>';
    if(thresh !== null) h += '<div class="mk-thresh" style="left:' + pc(thresh) + '%"></div>';
    h += '<div class="mk-dot" style="left:' + pc(d.val) + '%;--_d:' + hue + '"></div></div>'
      + '<div class="mk-bar-ends"><span>' + (ref.kind==='range' ? fmt(ref.lo) : fmt(lo))
      + '</span><span>' + (ref.kind==='range' ? fmt(ref.hi) : fmt(hi)) + '</span></div>'
      + '<div class="mk-legend">'
      + (ref.kind === 'range'
          ? 'Shaded is the reference range; the brighter middle marks the central half of it.'
          : 'Shaded is the acceptable side of the ' + d.refTxt.replace(/^ref\s*/i,'') + ' threshold, marked by the line.')
      + '</div></div>';
    return h;
  }

  function fmt(n){
    if(n === null || n === undefined || isNaN(n)) return '';
    /* Round to two places before printing. Subtracting two floats gives
       things like 0.5999999999999979, and that was reaching the change
       column and the chart axis verbatim. */
    return String(Math.round(n * 100) / 100);
  }

  /* ---------- trend chart ---------- */
  function chartHTML(pts, ref, d){
    if(pts.length < 2) return '';
    var W = 560, H = 190, P = {t:14, r:14, b:30, l:52};
    var xs = pts.map(function(p,i){ return i; });
    var vals = pts.map(function(p){ return p.v; });
    var vMin = Math.min.apply(null, vals), vMax = Math.max.apply(null, vals);
    if(ref.kind === 'range'){ vMin = Math.min(vMin, ref.lo); vMax = Math.max(vMax, ref.hi); }
    else if(ref.kind === 'max'){ vMax = Math.max(vMax, ref.hi); vMin = Math.min(vMin, 0); }
    else if(ref.kind === 'min'){ vMin = Math.min(vMin, ref.lo); }
    var span = (vMax - vMin) || 1;
    var floorAtZero = vMin >= 0;          /* no marker here goes negative */
    vMin -= span*0.12; vMax += span*0.12;
    if(floorAtZero && vMin < 0) vMin = 0;
    span = vMax - vMin;
    var X = function(i){ return P.l + (pts.length===1 ? 0 : i/(pts.length-1))*(W-P.l-P.r); };
    var Y = function(v){ return P.t + (1 - (v - vMin)/span)*(H-P.t-P.b); };
    var hue = HUE[d.stCls] || HUE.normal;

    var s = '<svg class="mk-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Trend chart">';
    if(ref.kind === 'range'){
      s += '<rect x="' + P.l + '" y="' + Y(ref.hi) + '" width="' + (W-P.l-P.r)
        + '" height="' + Math.max(1, Y(ref.lo)-Y(ref.hi)) + '" fill="' + hue + '18"></rect>';
    } else if(ref.kind !== 'none'){
      var ty = Y(ref.kind==='max' ? ref.hi : ref.lo);
      s += '<line x1="' + P.l + '" y1="' + ty + '" x2="' + (W-P.r) + '" y2="' + ty
        + '" stroke="' + hue + '" stroke-width="1.5" stroke-dasharray="5 4" opacity=".65"></line>';
    }
    s += '<line x1="' + P.l + '" y1="' + (H-P.b) + '" x2="' + (W-P.r) + '" y2="' + (H-P.b)
      + '" stroke="rgba(0,0,0,.16)" stroke-width="1"></line>';
    var d2 = pts.map(function(p,i){ return (i?'L':'M') + X(i).toFixed(1) + ' ' + Y(p.v).toFixed(1); }).join(' ');
    s += '<path d="' + d2 + '" fill="none" stroke="' + hue + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"></path>';
    pts.forEach(function(p,i){
      var last = (i === pts.length-1);
      s += '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(p.v).toFixed(1) + '" r="' + (last?6:4)
        + '" fill="' + (last?hue:'#fff') + '" stroke="' + hue + '" stroke-width="2.5"></circle>';
    });
    s += '<text x="' + (P.l-8) + '" y="' + (Y(vMax)+12) + '" text-anchor="end" font-size="12" fill="#6a6a62">' + fmt(vMax) + '</text>';
    s += '<text x="' + (P.l-8) + '" y="' + (Y(vMin)-3) + '" text-anchor="end" font-size="12" fill="#6a6a62">' + fmt(vMin) + '</text>';
    var every = pts.length > 5 ? 2 : 1;
    pts.forEach(function(p,i){
      if(i % every && i !== pts.length-1) return;
      s += '<text x="' + X(i).toFixed(1) + '" y="' + (H-P.b+18) + '" text-anchor="middle" font-size="12" fill="#6a6a62">' + p.label + '</text>';
    });
    s += '</svg>';

    var first = pts[0], last = pts[pts.length-1];
    var delta = last.v - first.v;
    var pctS = first.v ? (delta/Math.abs(first.v)*100) : 0;
    s += '<div class="mk-chart-note">' + pts.length + ' draws, ' + first.label + ' to ' + last.label
      + ' &middot; ' + (delta>=0?'up ':'down ') + fmt(Math.abs(delta)) + ' ' + esc(d.unit)
      + (first.v ? ' (' + (pctS>=0?'+':'') + Math.round(pctS) + '%)' : '') + ' across the window.</div>';
    return s;
  }

  /* ---------- per-draw table ---------- */
  function tableHTML(pts, d){
    if(!pts.length) return '';
    var h = '<table class="mk-tbl"><thead><tr><th>Draw</th><th class="r">Value</th>'
          + '<th class="r">Change</th></tr></thead><tbody>';
    pts.forEach(function(p,i){
      var prev = i ? pts[i-1].v : null, cell = '&mdash;';
      if(prev !== null){
        var dv = p.v - prev;
        var cls = Math.abs(dv) < 1e-9 ? 'mk-flat' : (dv > 0 ? 'mk-up' : 'mk-dn');
        cell = '<span class="' + cls + '">' + (dv>0?'+':'') + fmt(dv) + '</span>';
      }
      h += '<tr' + (i===pts.length-1?' class="now"':'') + '><td>' + p.label + '</td><td class="r">'
        + fmt(p.v) + '</td><td class="r">' + cell + '</td></tr>';
    });
    return h + '</tbody></table>';
  }

  function filterPts(pts, r){
    if(r === 'all' || !pts.length) return pts;
    var months = (r === '6m') ? 6 : 12;
    var cut = pts[pts.length-1].t - months;
    var out = pts.filter(function(p){ return p.t >= cut; });
    return out.length >= 2 ? out : pts;
  }

  /* ---------- build ---------- */
  function paint(){
    var d = current; if(!d) return;
    var ref = parseRef(d.refTxt);
    var pts = filterPts(d.trend, range);
    var where = placement(d.val, ref);

    var h = '<div class="mk-value-row"><span class="mk-big">' + esc(d.valTxt) + '</span>'
      + (d.unit ? '<span class="mk-unit">' + esc(d.unit) + '</span>' : '')
      + '<span class="mk-pill ' + d.stCls + '">' + esc(d.stTxt) + '</span></div>';
    if(where) h += '<div class="mk-where">Sitting <b>' + where + '</b> &middot; ' + esc(d.refTxt) + '</div>';
    h += barHTML(d, ref);

    if(d.trend.length > 1){
      h += '<div class="mk-sec"><div class="mk-sec-h">Trend<span>' + d.trend.length + ' draws on record</span></div>'
        + '<div class="mk-seg" role="group" aria-label="Time range">'
        + ['all','12m','6m'].map(function(r){
            return '<button type="button" data-r="' + r + '" aria-pressed="' + (r===range) + '">'
              + (r==='all'?'All':(r==='12m'?'12 Months':'6 Months')) + '</button>'; }).join('')
        + '</div>' + chartHTML(pts, ref, d) + '</div>'
        + '<div class="mk-sec"><div class="mk-sec-h">Every Draw</div>' + tableHTML(pts, d) + '</div>';
    } else if(d.trend.length === 1){
      h += '<div class="mk-sec"><div class="mk-sec-h">Trend</div>'
        + '<div class="mk-chart-note">Only one draw on record for this marker, so there is nothing to chart yet. '
        + 'The next panel will give it a line.</div></div>';
    }

    if(d.whatHTML) h += '<div class="mk-sec"><div class="mk-sec-h">What It Means</div>'
      + '<div class="mk-what">' + d.whatHTML + '</div></div>';

    h += '<div class="mk-foot">Reference <b>' + esc(d.refTxt.replace(/^ref\s*/i,'')) + '</b>'
      + (d.unit ? ' ' + esc(d.unit) : '')
      + (d.section ? ' &middot; ' + esc(d.section) + ' panel' : '')
      + ' &middot; latest draw <b>05/06/2026</b>. Values and ranges come straight from the table on this tab.</div>';

    bodyEl.innerHTML = h;
    [].forEach.call(bodyEl.querySelectorAll('.mk-seg button'), function(b){
      b.addEventListener('click', function(){
        range = b.getAttribute('data-r');
        paint();
        var sec = bodyEl.querySelector('.mk-sec'); if(sec) sec.scrollIntoView({block:'nearest'});
      });
    });
  }

  /* show the panel with whatever content is handed to it - the marker rows
     use it through open(), and the timeline reuses it for compound notes so
     there is one modal and one set of close mechanics on the page */
  function show(eyebrow, title, html){
    current = null;
    eyebrowEl.textContent = eyebrow;
    titleEl.textContent = title;
    bodyEl.innerHTML = html;
    lastFocus = document.activeElement;
    scrim.hidden = false; panel.hidden = false;
    document.body.classList.add('mk-open');
    void panel.offsetWidth;
    scrim.classList.add('open'); panel.classList.add('open');
    bodyEl.scrollTop = 0;
    xBtn.focus();
  }
  window.BLPanel = { show: show };

  function open(row){
    current = read(row); range = 'all';
    titleEl.textContent = current.name;
    eyebrowEl.textContent = current.section || 'Marker';
    paint();
    lastFocus = document.activeElement;
    scrim.hidden = false; panel.hidden = false;
    document.body.classList.add('mk-open');
    void panel.offsetWidth;
    scrim.classList.add('open'); panel.classList.add('open');
    bodyEl.scrollTop = 0;
    xBtn.focus();
  }

  function close(){
    scrim.classList.remove('open'); panel.classList.remove('open');
    document.body.classList.remove('mk-open');
    setTimeout(function(){
      scrim.hidden = true; panel.hidden = true; bodyEl.innerHTML = ''; current = null;
    }, 190);
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }

  [].forEach.call(tab.querySelectorAll('.lab-row'), function(row){
    row.setAttribute('role','button');
    row.setAttribute('tabindex','0');
    var nm = row.querySelector('.lab-name');
    row.setAttribute('aria-label', (nm ? nm.textContent.trim() : 'Marker') + ' — open details');
    row.addEventListener('click', function(){ open(row); });
    row.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(row); }
    });
  });

  xBtn.addEventListener('click', close);
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && !panel.hidden) close();
  });
})();

/* ============================ CALCULATOR ============================ */
/* ===================== PEPTIDE CALCULATOR =================================
   concentration = vial_mg / bac_mL
   draw_mL       = dose_mg / concentration
   units         = draw_mL * 100          (U-100 scale)
   doses/vial    = floor(vial_mg / dose_mg)
   The syringe bar and the dose field are two-way bound; dragging sets units
   and back-solves mg, typing a dose fills the bar.
   ------------------------------------------------------------------------ */
(function(){
  var el = function(id){ return document.getElementById(id); };
  var nameEl, vialEl, bacEl, doseEl, syrEl, bar, svg, fill, plunger, ticksG;
  var cmpEl, nameField, unitSeg, srcNote, addBtn, searchEl, listEl, savedHead, countEl, emptyEl;
  var LIB = [], curUnit = 'mg';      /* dose unit - what the MG/MCG/IU toggle sets */
  var vialUnit = 'mg';               /* vial's own unit - fixed, never follows the toggle */
  var X0 = 6, X1 = 294, TOP = 16, H = 34;     // barrel geometry in viewBox units
  var maxU = 100, curU = 14, dragging = false;

  function num(v, dflt){ var n = parseFloat(v); return (isFinite(n) && n >= 0) ? n : dflt; }
  function conc(){ var v = num(vialEl.value, 0), b = num(bacEl.value, 0); return b > 0 ? v / b : 0; }
  /* concentration is always vialUnit per mL, so the dose has to be expressed in
     vialUnit before it can be divided by it. mcg->mg is the only real conversion;
     IU never crosses over, which is why the toggle only offers IU on IU vials. */
  function toVial(d){
    if(curUnit === vialUnit) return d;
    if(vialUnit === 'mg'  && curUnit === 'mcg') return d / 1000;
    if(vialUnit === 'mcg' && curUnit === 'mg')  return d * 1000;
    return d;                         /* iu<->mass: not convertible, leave alone */
  }
  function fromVial(d){
    if(curUnit === vialUnit) return d;
    if(vialUnit === 'mg'  && curUnit === 'mcg') return d * 1000;
    if(vialUnit === 'mcg' && curUnit === 'mg')  return d / 1000;
    return d;
  }
  function vialLabelUnit(){ return vialUnit === 'iu' ? 'IU' : vialUnit; }
  function doseLabelUnit(){ return curUnit === 'iu' ? 'IU' : curUnit; }
  /* IU is only meaningful when the vial itself is IU-based. */
  function syncUnitButtons(){
    if(!unitSeg) return;
    [].forEach.call(unitSeg.querySelectorAll('button'), function(b){
      var u = b.getAttribute('data-u');
      var allowed = (vialUnit === 'iu') ? (u === 'iu') : (u !== 'iu');
      b.disabled = !allowed;
      b.hidden = !allowed;
      b.classList.toggle('on', u === curUnit);
    });
  }
  function setVialUnit(u){
    vialUnit = (u === 'iu') ? 'iu' : 'mg';
    [].forEach.call(document.querySelectorAll('[data-unitslot="vial"]'), function(s){
      s.textContent = vialLabelUnit();
    });
    if(vialUnit === 'iu' && curUnit !== 'iu') curUnit = 'iu';
    if(vialUnit !== 'iu' && curUnit === 'iu') curUnit = 'mg';
    [].forEach.call(document.querySelectorAll('[data-unitslot="dose"]'), function(s){
      s.textContent = doseLabelUnit();
    });
    syncUnitButtons();
  }
  function fmt(n, dp){
    if(!isFinite(n)) return '—';
    var s = n.toFixed(dp);
    return s.replace(/\.?0+$/, '') || '0';
  }

  function drawTicks(){
    var step = maxU <= 30 ? 5 : (maxU <= 50 ? 5 : 10);
    var minor = maxU <= 30 ? 1 : (maxU <= 50 ? 1 : 2);
    var out = '';
    for(var u = 0; u <= maxU; u += minor){
      var x = X0 + (X1 - X0) * (u / maxU);
      var major = (u % step === 0);
      var len = major ? 11 : 6;
      out += '<line class="pc-tick' + (major ? ' major' : '') + '" x1="' + x.toFixed(2) + '" y1="' + TOP +
             '" x2="' + x.toFixed(2) + '" y2="' + (TOP + len) + '"/>';
      if(major) out += '<text class="pc-ticknum" x="' + x.toFixed(2) + '" y="' + (TOP + H + 12) + '">' + u + '</text>';
    }
    ticksG.innerHTML = out;
  }

  function paint(){
    var c = conc();
    var frac = maxU > 0 ? Math.min(curU / maxU, 1) : 0;
    var w = (X1 - X0) * frac;
    fill.setAttribute('width', Math.max(0, w).toFixed(2));
    var px = X0 + w;
    plunger.setAttribute('x', (px - 4).toFixed(2));
    bar.setAttribute('aria-valuenow', String(Math.round(curU * 10) / 10));
    bar.setAttribute('aria-valuemax', String(maxU));

    var mL = curU / 100, inVial = mL * c, shownDose = fromVial(inVial);
    var label = (nameEl.value || '').trim();
    el('pc-syr-read').textContent = fmt(curU, 1) + ' u';
    var vu = vialLabelUnit(), du = doseLabelUnit();
    el('pc-conc').innerHTML  = (c > 0 ? fmt(c, 2) : '—') + '<em>' + vu + '/mL</em>';
    el('pc-vol').innerHTML   = fmt(mL, 3) + '<em>mL</em>';
    el('pc-units').innerHTML = fmt(curU, 1) + '<em>u</em>';

    var vial = num(vialEl.value, 0), doseV = toVial(num(doseEl.value, 0));
    el('pc-doses').textContent = (vial > 0 && doseV > 0) ? String(Math.floor(vial / doseV)) : '—';

    el('pc-headline').innerHTML = 'Draw <b>' + fmt(curU, 1) + ' units</b> for <b>' + fmt(shownDose, 3) + ' ' + du + '</b>' +
      (label ? ' <span style="font-size:.62em;color:var(--muted);">of ' + label.replace(/[<>&]/g, '') + '</span>' : '');
    el('pc-headline-sub').textContent = fmt(mL, 3) + ' mL at ' + (c > 0 ? fmt(c, 2) : '—') + ' ' + vu + '/mL';

    var msgs = [];
    if(!(num(bacEl.value, 0) > 0)) msgs.push('Enter a BAC water volume to get a concentration.');
    if(curU >= maxU - 0.01 && doseV > 0 && c > 0 && (doseV / c) * 100 > maxU)
      msgs.push('That dose needs ' + fmt((doseV / c) * 100, 1) + ' units &mdash; more than this syringe holds. Use a larger syringe or more BAC water.');
    var wEl = el('pc-warn');
    if(msgs.length){ wEl.innerHTML = msgs.join('<br>'); wEl.hidden = false; } else { wEl.hidden = true; }
  }

  /* dose typed -> fill the bar */
  function fromDose(){
    var c = conc(), dose = toVial(num(doseEl.value, 0));
    curU = (c > 0) ? Math.min((dose / c) * 100, maxU) : 0;
    paint();
  }
  /* bar dragged -> back-solve mg */
  function fromUnits(){
    var c = conc(), inVial = (curU / 100) * c;
    var shown = fromVial(inVial);
    doseEl.value = (c > 0) ? (Math.round(shown * 1000) / 1000) : '';
    paint();
  }

  function unitsAtClientX(clientX){
    var r = bar.getBoundingClientRect();
    if(r.width <= 0) return curU;
    var pad0 = r.width * (X0 / 300), pad1 = r.width * (X1 / 300);
    var t = (clientX - r.left - pad0) / (pad1 - pad0);
    t = Math.max(0, Math.min(1, t));
    var u = t * maxU;
    var snap = maxU <= 50 ? 0.5 : 1;          // half-unit on small barrels
    return Math.round(u / snap) * snap;
  }

  function onDown(e){
    dragging = true; bar.classList.add('dragging');
    if(bar.setPointerCapture && e.pointerId !== undefined){ try{ bar.setPointerCapture(e.pointerId); }catch(_){} }
    curU = unitsAtClientX(e.clientX); fromUnits();
    e.preventDefault();
  }
  function onMove(e){
    if(!dragging) return;
    curU = unitsAtClientX(e.clientX); fromUnits();
    e.preventDefault();
  }
  function onUp(){ dragging = false; bar.classList.remove('dragging'); }

  function onKey(e){
    var step = (e.shiftKey ? 5 : 1) * (maxU <= 50 ? 0.5 : 1);
    if(e.key === 'ArrowRight' || e.key === 'ArrowUp'){ curU = Math.min(curU + step, maxU); fromUnits(); e.preventDefault(); }
    else if(e.key === 'ArrowLeft' || e.key === 'ArrowDown'){ curU = Math.max(curU - step, 0); fromUnits(); e.preventDefault(); }
    else if(e.key === 'Home'){ curU = 0; fromUnits(); e.preventDefault(); }
    else if(e.key === 'End'){ curU = maxU; fromUnits(); e.preventDefault(); }
  }


  /* ---------- compound library, parsed out of CHEAT_SHEET_DATA ---------- */
  var CATS = {fatloss:'Fat Loss',gh:'Growth Hormone',healing:'Healing & Repair',muscle:'Muscle',
              longevity:'Longevity',energy:'Energy',cognition:'Cognition',sleep:'Sleep',
              immunity:'Immunity',sexual:'Sexual Health',hormones:'Hormones',skin:'Skin & Hair',
              blend:'Blends',bioregulator:'Bioregulators'};

  /* "10 mg" -> {n:10,u:'mg'} | "0.5–1 mg" -> low end | "5,000 IU" -> 5000 | junk -> null */
  function parseAmt(str){
    if(!str) return null;
    var s = String(str).replace(/,/g,'').replace(/[–—]/g,'-');
    var m = s.match(/(\d*\.?\d+)\s*(mcg|mg|iu|ml)?/i);
    if(!m) return null;
    var n = parseFloat(m[1]);
    if(!isFinite(n)) return null;
    var u = (m[2]||'').toLowerCase();
    return {n:n, u:(u==='ml') ? '' : u};
  }

  /* vial figure for the dropdown label — the number we actually fill from,
     shown in the unit the Index states it in (not the normalised one) */
  function vialLabel(raw){
    if(!raw) return '';
    var t = String(raw).trim();
    if(/\/\s*m[lL]/.test(t)) return '';                 /* "600 mg/ml" is a concentration, not a vial mass */
    var bl = t.match(/^\s*(\d*\.?\d+)\s*(mg|mcg|iu)?\s*\/\s*(\d*\.?\d+)\s*(mg|mcg|iu)/i);
    if(bl) return (bl[1] + (bl[2]||bl[4]) + '/' + bl[3] + bl[4]).toLowerCase().replace(/iu/g,' IU');
    var m = t.replace(/,/g,'').match(/^\s*(\d*\.?\d+)\s*(mg|mcg|iu)\b/i);
    if(!m) return '';
    var u = m[2].toLowerCase();
    return m[1] + (u === 'iu' ? ' IU' : u);
  }

  function buildLib(){
    var raw = (window.CHEAT_SHEET_DATA||[]);
    return raw.map(function(d){
      var v = parseAmt(d.vial), b = parseAmt(d.bac), o = parseAmt(d.dose);
      var unit = (o && o.u) || (v && v.u) || 'mg';
      if(unit === 'ml') unit = 'mg';
      /* vial and dose are often stored in different units (10 mg vial, 500 mcg
         dose). Normalise the vial into the dose's unit or the concentration,
         and every draw off it, comes out wrong by 1000x. */
      var vialN = v ? v.n : null;
      if(v && v.u && v.u !== unit && v.u !== 'ml'){
        if(v.u === 'mg'  && unit === 'mcg') vialN = v.n * 1000;
        else if(v.u === 'mcg' && unit === 'mg') vialN = v.n / 1000;
        else if(v.u !== unit) unit = v.u;        /* IU vs mass — trust the vial */
      }
      return {name:d.name, cat:d.cat||'', purpose:d.purpose||'', label:vialLabel(d.vial),
              vial:vialN, vialU:(v?v.u:''), bac:(b?b.n:null),
              dose:(o?o.n:null), unit:unit,
              rawVial:d.vial, rawBac:d.bac, rawDose:d.dose, rawUnits:d.units};
    });
  }

  function optText(c){
    var n = c.name.replace(/[<>&]/g,'');
    return c.label ? (n + ' \u2014 ' + c.label) : n;
  }
  function fillCompoundSelect(){
    var lib = LIB, byCat = {};
    lib.forEach(function(c,i){ (byCat[c.cat] = byCat[c.cat] || []).push(i); });
    var html = '<option value="__custom__">Custom &mdash; enter my own</option>';
    Object.keys(CATS).forEach(function(k){
      if(!byCat[k]) return;
      html += '<optgroup label="' + CATS[k] + '">';
      byCat[k].sort(function(a,b){ return lib[a].name.localeCompare(lib[b].name); })
        .forEach(function(i){ html += '<option value="' + i + '">' + optText(lib[i]) + '</option>'; });
      html += '</optgroup>';
    });
    Object.keys(byCat).forEach(function(k){
      if(CATS[k]) return;
      html += '<optgroup label="Other">';
      byCat[k].forEach(function(i){ html += '<option value="' + i + '">' + optText(lib[i]) + '</option>'; });
      html += '</optgroup>';
    });
    cmpEl.innerHTML = html;
  }

  /* ---------- unit handling: vial + dose always share a unit ---------- */
  var FACT = {mg:1, mcg:0.001, iu:1};           // iu has no mg equivalence — it rides as its own scale
  /* The toggle sets the DOSE unit only. Vial Size keeps its own unit and its own
     label, so picking mcg no longer relabels a 10 mg vial as 10000 mcg. */
  function setUnit(u, convert){
    if(u === curUnit) return;
    if(vialUnit === 'iu' && u !== 'iu') return;      /* IU vial: dose stays IU */
    if(vialUnit !== 'iu' && u === 'iu') return;      /* mass vial: IU is not offered */
    if(convert && (curUnit !== 'iu' && u !== 'iu')){
      var k = FACT[curUnit] / FACT[u];               // mg->mcg = 1000, mcg->mg = 0.001
      var n = parseFloat(doseEl.value);              // dose only - the vial does not move
      if(isFinite(n)) doseEl.value = String(Math.round(n * k * 1e6) / 1e6);
    }
    curUnit = u;
    [].forEach.call(document.querySelectorAll('[data-unitslot="dose"]'), function(s){
      s.textContent = doseLabelUnit();
    });
    syncUnitButtons();
    fromDose();
  }

  function applyCompound(){
    var v = cmpEl.value;
    if(v === '__custom__'){
      nameField.hidden = false; srcNote.hidden = true;
      return paint();
    }
    var c = LIB[+v]; if(!c) return;
    nameField.hidden = true;
    nameEl.value = c.name;
    if(c.vial != null) vialEl.value = String(c.vial);
    if(c.bac  != null) bacEl.value  = String(c.bac);
    if(c.dose != null) doseEl.value = String(c.dose);
    setVialUnit(c.unit === 'iu' ? 'iu' : 'mg');
    curUnit = (c.unit === 'iu') ? 'iu' : (c.doseUnit || c.unit || 'mg');
    if(vialUnit !== 'iu' && curUnit === 'iu') curUnit = 'mg';
    [].forEach.call(document.querySelectorAll('[data-unitslot="dose"]'), function(s){
      s.textContent = doseLabelUnit();
    });
    syncUnitButtons();
    var gaps = [];
    if(c.vial == null) gaps.push('vial size');
    if(c.bac  == null) gaps.push('BAC water');
    if(c.dose == null) gaps.push('dose');
    if(gaps.length){
      srcNote.innerHTML = 'No ' + gaps.join(' or ') + ' on file for ' + c.name.replace(/[<>&]/g,'') +
        ' &mdash; enter it manually.' + (c.rawDose ? ' Index lists: ' + String(c.rawDose).replace(/[<>&]/g,'') + '.' : '');
      srcNote.hidden = false;
    } else if(/[-–]/.test(String(c.rawDose||''))){
      srcNote.innerHTML = 'Index lists a range (' + String(c.rawDose).replace(/[<>&]/g,'') + ') &mdash; filled at the low end.';
      srcNote.hidden = false;
    } else { srcNote.hidden = true; }
    fromDose();
  }

  /* ---------- saved list, localStorage keyed by page slug ---------- */
  function pcSlug(){
    var m = (location.pathname||'').replace(/\/+$/,'').split('/').filter(Boolean);
    return (m.length ? m[m.length-1] : 'default').replace(/\.html?$/,'');
  }
  var LSKEY = 'bl-calc-list-v1:' + pcSlug();
  var saved = [];
  function load(){ try{ saved = JSON.parse(localStorage.getItem(LSKEY)||'[]')||[]; }catch(_){ saved = []; } }
  function store(){ try{ localStorage.setItem(LSKEY, JSON.stringify(saved)); }catch(_){} }


  /* ===================== CROSS-DEVICE SAVE ==================================
     Supabase `calc_lists`, keyed by page slug, mirroring the nutrition tab.
     localStorage stays the instant cache so the list paints before the network
     answers; Supabase is the source of truth and wins when it replies. Every
     call fails soft - if the table does not exist yet, or the device is
     offline, the tab keeps working on localStorage exactly as before.
     ------------------------------------------------------------------------ */
  var CALC_SB = {
    url  : 'https://bfjydzealeethhcpdfxl.supabase.co',
    key  : (window.BL_SUPABASE_ANON || document.documentElement.getAttribute('data-sb-anon') || ''),
    table: 'calc_lists'
  };
  var calcTouched = false;      /* user edited before the remote answered - do not clobber */
  var syncEl = null;

  function sbHeaders(extra){
    var h = {'apikey':CALC_SB.key,'Authorization':'Bearer '+CALC_SB.key,'Content-Type':'application/json'};
    if(extra) Object.keys(extra).forEach(function(k){ h[k]=extra[k]; });
    return h;
  }
  function sbReady(){ return !!(CALC_SB.key && CALC_SB.url); }

  function sbLoad(){
    if(!sbReady()) return Promise.resolve(null);
    return fetch(CALC_SB.url+'/rest/v1/'+CALC_SB.table+'?page_slug=eq.'+encodeURIComponent(pcSlug())+'&select=data,updated_at&limit=1',
      { headers: sbHeaders() })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(rows){ return (rows && rows[0]) ? rows[0] : null; })
      .catch(function(){ return null; });
  }
  function sbSave(list){
    if(!sbReady()) return Promise.resolve({ok:false,reason:'no-key'});
    return fetch(CALC_SB.url+'/rest/v1/'+CALC_SB.table+'?on_conflict=page_slug', {
      method:'POST',
      headers: sbHeaders({'Prefer':'resolution=merge-duplicates,return=representation'}),
      body: JSON.stringify([{ page_slug: pcSlug(), data: {items:list}, updated_at: new Date().toISOString() }])
    }).then(function(r){ return r.ok ? {ok:true} : r.text().then(function(t){ return {ok:false,reason:r.status+' '+t.slice(0,90)}; }); })
      .catch(function(e){ return {ok:false,reason:String(e).slice(0,90)}; });
  }

  function setSync(state, detail){
    if(!syncEl) return;
    var map = {saving:'Saving…', saved:'Synced', local:'Saved on this device only', off:''};
    syncEl.textContent = map[state] || '';
    syncEl.title = detail || '';
    syncEl.hidden = !syncEl.textContent;
  }

  /* every mutation: localStorage first (instant, offline-safe), then push up */
  function persist(){
    calcTouched = true;
    store();
    renderList();
    if(!sbReady()) return;
    setSync('saving');
    sbSave(saved).then(function(res){
      setSync(res.ok ? 'saved' : 'local', res.ok ? '' : ('Cross-device sync unavailable: ' + (res.reason||'')));
    });
  }

  /* first paint from cache, then let the remote win if the user has not typed */
  function hydrate(){
    load(); renderList();
    if(!sbReady()) return;
    sbLoad().then(function(row){
      if(!row || calcTouched) return;                 /* never clobber a live edit */
      var items = (row.data && row.data.items) || [];
      if(!Array.isArray(items)) return;
      saved = items; store(); renderList();
      setSync('saved','Loaded from your account');
    });
  }

  function esc(s){ return String(s==null?'':s).replace(/[<>&"]/g, function(c){
    return ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c]; }); }

  function renderList(){
    var q = (searchEl.value||'').trim().toLowerCase();
    var rows = saved.map(function(it,i){ return {it:it,i:i}; })
                    .filter(function(r){ return !q || (r.it.name||'').toLowerCase().indexOf(q) !== -1; });
    savedHead.hidden = saved.length === 0;
    searchEl.hidden  = saved.length === 0;
    countEl.textContent = saved.length + (saved.length === 1 ? ' saved' : ' saved');
    emptyEl.hidden = !(saved.length > 0 && rows.length === 0);
    listEl.innerHTML = rows.map(function(r){
      var it = r.it, pct = Math.max(0, Math.min(100, (it.units / it.max) * 100));
      var uu = it.unit === 'iu' ? 'IU' : it.unit;
      return '<div class="pc-item">' +
        '<div class="pc-item-top"><div><div class="pc-item-name">' + esc(it.name) + '</div>' +
        '<div class="pc-item-sub">' + esc(it.vial) + ' ' + esc(uu) + ' in ' + esc(it.bac) + ' mL &middot; ' + esc(it.max) + 'u syringe</div></div>' +
        '<div class="pc-item-acts">' +
        '<button class="pc-ico" type="button" data-edit="' + r.i + '" aria-label="Edit ' + esc(it.name) + '">&#9998;</button>' +
        '<button class="pc-ico del" type="button" data-del="' + r.i + '" aria-label="Remove ' + esc(it.name) + '">&times;</button>' +
        '</div></div>' +
        '<div class="pc-mini"><div class="pc-mini-fill" style="width:' + pct.toFixed(1) + '%"></div></div>' +
        '<div class="pc-item-stats">' +
        '<span class="pc-chip">' + esc(it.units) + ' u</span>' +
        '<span class="pc-chip">' + esc(it.dose) + ' ' + esc(uu) + '</span>' +
        '<span class="pc-chip">' + esc(it.volume) + ' mL</span>' +
        '<span class="pc-chip">' + esc(it.doses) + ' doses/vial</span>' +
        '</div></div>';
    }).join('');
  }

  function addCurrent(){
    var c = conc(), vial = num(vialEl.value,0), bac = num(bacEl.value,0), dose = num(doseEl.value,0);
    if(!(vial > 0 && bac > 0 && dose > 0)) return;
    var nm = (nameEl.value||'').trim() || 'Untitled';
    saved.unshift({name:nm, vial:vial, bac:bac, dose:dose, unit:curUnit, max:maxU,
                   units:Math.round(curU*10)/10, volume:Math.round((curU/100)*1000)/1000,
                   doses:Math.floor(vial/dose), conc:Math.round(c*100)/100});
    persist();
  }

  function editItem(i){
    var it = saved[i]; if(!it) return;
    cmpEl.value = '__custom__'; nameField.hidden = false; srcNote.hidden = true;
    nameEl.value = it.name; vialEl.value = it.vial; bacEl.value = it.bac; doseEl.value = it.dose;
    curUnit = it.unit;
    [].forEach.call(unitSeg.querySelectorAll('button'), function(b){
      b.classList.toggle('on', b.getAttribute('data-u') === it.unit); });
    syrEl.value = String(it.max); maxU = it.max; drawTicks();
    saved.splice(i,1); persist(); fromDose();
    document.getElementById('pc-compound').scrollIntoView({block:'center', behavior:'smooth'});
  }

  function init(){
    nameEl = el('pc-name'); vialEl = el('pc-vial'); bacEl = el('pc-bac');
    doseEl = el('pc-dose'); syrEl = el('pc-syringe');
    bar = el('pc-syr'); svg = el('pc-svg'); fill = el('pc-fill');
    plunger = el('pc-plunger'); ticksG = el('pc-ticks');
    if(!bar) return;
    cmpEl = el('pc-compound'); nameField = el('pc-name-field'); unitSeg = el('pc-unitseg');
    srcNote = el('pc-srcnote'); addBtn = el('pc-addbtn'); searchEl = el('pc-search');
    listEl = el('pc-list'); savedHead = el('pc-saved-head'); countEl = el('pc-saved-count'); emptyEl = el('pc-empty');
    LIB = buildLib(); fillCompoundSelect();
    cmpEl.addEventListener('change', applyCompound);
    [].forEach.call(unitSeg.querySelectorAll('button'), function(b){
      b.addEventListener('click', function(){ setUnit(b.getAttribute('data-u'), true); });
    });
    addBtn.addEventListener('click', addCurrent);
    searchEl.addEventListener('input', renderList);
    listEl.addEventListener('click', function(e){
      var d = e.target.closest('[data-del]'), ed = e.target.closest('[data-edit]');
      if(d){ saved.splice(+d.getAttribute('data-del'),1); persist(); }
      else if(ed){ editItem(+ed.getAttribute('data-edit')); }
    });
    load(); renderList();

    maxU = parseFloat(syrEl.value) || 100;
    drawTicks();

    [vialEl, bacEl].forEach(function(x){ x.addEventListener('input', fromDose); });
    doseEl.addEventListener('input', fromDose);
    nameEl.addEventListener('input', paint);
    syrEl.addEventListener('change', function(){
      maxU = parseFloat(syrEl.value) || 100;
      drawTicks(); fromDose();
    });

    if(window.PointerEvent){
      bar.addEventListener('pointerdown', onDown);
      bar.addEventListener('pointermove', onMove);
      bar.addEventListener('pointerup', onUp);
      bar.addEventListener('pointercancel', onUp);
    } else {
      bar.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      bar.addEventListener('touchstart', function(e){ onDown(e.touches[0]); }, {passive:false});
      bar.addEventListener('touchmove',  function(e){ onMove(e.touches[0]); }, {passive:false});
      bar.addEventListener('touchend', onUp);
    }
    bar.addEventListener('keydown', onKey);

    syncEl = el('pc-sync');
    hydrate();
    fromDose();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
