/* ============================================================================
   ma-generators.js  —  parameterized question generators for the Applied
   Macroeconomics question banks.

   THE CONTRACT (why this file is loaded, identical, by BOTH the browser and the
   grading Edge Function):
     * The browser calls generate(genId, seed, cfg) to BUILD a question instance
       to display (prompt text, options, diagram) from a random seed.
     * The Edge Function calls the SAME generate(genId, seed, cfg) with the SAME
       stored seed to recompute the correct answer and grade the submission.
     Because both sides run identical deterministic code on the same seed, the
     student's displayed question and the server's grading always agree, yet the
     correct answer is NEVER sent to the browser.

   DIFFERENCE FROM THE MICRO BUILD: im-grade-quiz keeps a hand-maintained MIRROR
   of im-generators.js inside the edge function. That mirror drifted — its
   written items lost their prompts and rubrics entirely, so AI grading saw only
   an item id. This file is exported to BOTH window and module.exports so the
   edge function imports the real thing. There is no second copy to drift.

   DETERMINISM: seeded PRNG (mulberry32), never Math.random, so a given seed
   yields the same parameters on every machine and in every runtime.

   Safari-safe: var, function declarations, string concatenation; no template
   literals, arrow functions, optional chaining, or nullish coalescing.

   A generator is an object:
     { id, chapter, kind:'numeric'|'mc'|'short', render:'text'|'graphical',
       difficulty:'easy'|'med'|'hard', concept, points,
       build: function(rng, cfg) -> {
         prompt, options?, diagramSpec?, answer, tolerance?, rationale, rubric?
       } }

   COVERAGE IN THIS FILE: chapters 7-12 (the distinctively macro core).
     7  Measuring National Income
     8  Measuring the Cost of Living
     9  Production & Growth
     10 Saving, Investment & the Financial System
     11 The Monetary System
     12 Money Growth & Inflation
   ============================================================================ */
(function (global) {
  "use strict";

  /* ---- seeded PRNG (mulberry32) ---------------------------------------- */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rng_int(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function rng_pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function round1(x) { return Math.round(x * 10) / 10; }
  function round2(x) { return Math.round(x * 100) / 100; }
  function money(x) { return "$" + x.toLocaleString("en-US"); }

  /* Shuffle options deterministically and track where the correct one lands.
     The caller must guarantee option TEXTS are distinct — two identical texts
     would make a keyed answer ambiguous. (validate() below enforces this.) */
  function shuffleWithAnswer(rng, options, correctIdx) {
    var idx = options.map(function (_, i) { return i; });
    for (var i = idx.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp;
    }
    return { options: idx.map(function (k) { return options[k]; }), correctIndex: idx.indexOf(correctIdx) };
  }

  var GEN = {};

  /* ======================================================================
     CHAPTER 7 — MEASURING NATIONAL INCOME
     ====================================================================== */

  /* Expenditure identity Y = C + I + G + NX. Easy anchor item. */
  GEN["ch7_gdp_expenditure"] = {
    id: "ch7_gdp_expenditure", chapter: 7, kind: "numeric", render: "text",
    difficulty: "easy", concept: "expenditure approach", points: 1,
    build: function (rng) {
      var C = rng_int(rng, 60, 90) * 100;
      var I = rng_int(rng, 10, 25) * 100;
      var G = rng_int(rng, 15, 30) * 100;
      var X = rng_int(rng, 8, 20) * 100;
      var M = rng_int(rng, 10, 25) * 100;
      return {
        prompt: "In a given year an economy records consumption of " + money(C) +
          " billion, investment of " + money(I) + " billion, government purchases of " +
          money(G) + " billion, exports of " + money(X) + " billion, and imports of " +
          money(M) + " billion. What is GDP, in billions of dollars? (Enter the number only.)",
        answer: C + I + G + X - M, tolerance: 0.01,
        rationale: "Y = C + I + G + NX, and NX = X − M = " + money(X - M) +
          " billion. So Y = " + C + " + " + I + " + " + G + " + (" + (X - M) + ") = " + (C + I + G + X - M) + "."
      };
    }
  };

  /* Net exports can be negative — students routinely add imports instead of
     subtracting. Deliberately parameterized so NX < 0 most of the time. */
  GEN["ch7_net_exports"] = {
    id: "ch7_net_exports", chapter: 7, kind: "numeric", render: "text",
    difficulty: "easy", concept: "net exports", points: 1,
    build: function (rng) {
      var X = rng_int(rng, 5, 18) * 100;
      var M = X + rng_int(rng, 2, 12) * 100;
      return {
        prompt: "A country exports " + money(X) + " billion of goods and services and imports " +
          money(M) + " billion. What are its net exports, in billions of dollars? " +
          "(Enter a negative number if appropriate.)",
        answer: X - M, tolerance: 0.01,
        rationale: "NX = exports − imports = " + X + " − " + M + " = " + (X - M) +
          ". A trade deficit makes net exports negative; it does not make them zero."
      };
    }
  };

  GEN["ch7_gdp_deflator"] = {
    id: "ch7_gdp_deflator", chapter: 7, kind: "numeric", render: "text",
    difficulty: "med", concept: "GDP deflator", points: 2,
    build: function (rng) {
      var real = rng_int(rng, 80, 140) * 100;
      var defl = rng_pick(rng, [105, 110, 115, 120, 125, 130]);
      var nominal = Math.round(real * defl / 100);
      return {
        prompt: "In 2026 an economy's nominal GDP is " + money(nominal) +
          " billion and its real GDP (in base-year prices) is " + money(real) +
          " billion. What is the GDP deflator? (Report the index number, not a percentage change.)",
        answer: defl, tolerance: 0.6,
        rationale: "Deflator = 100 × nominal / real = 100 × " + nominal + " / " + real +
          " ≈ " + defl + ". An index of " + defl + " means prices are " + (defl - 100) +
          "% above the base year."
      };
    }
  };

  GEN["ch7_real_gdp_growth"] = {
    id: "ch7_real_gdp_growth", chapter: 7, kind: "numeric", render: "text",
    difficulty: "med", concept: "real growth rate", points: 2,
    build: function (rng) {
      var y0 = rng_int(rng, 100, 200) * 100;
      var g = rng_pick(rng, [2, 2.5, 3, 3.5, 4, -1, -1.5]);
      var y1 = Math.round(y0 * (1 + g / 100) * 100) / 100;
      return {
        prompt: "Real GDP was " + money(y0) + " billion last year and " +
          money(round2(y1)) + " billion this year. What was the growth rate of real GDP, in percent? " +
          "(Enter a number such as 2.5 for 2.5%.)",
        answer: g, tolerance: 0.06,
        rationale: "Growth = 100 × (Y₁ − Y₀)/Y₀ = 100 × (" +
          round2(y1) + " − " + y0 + ")/" + y0 + " ≈ " + g + "%."
      };
    }
  };

  GEN["ch7_gdp_per_capita"] = {
    id: "ch7_gdp_per_capita", chapter: 7, kind: "numeric", render: "text",
    difficulty: "easy", concept: "GDP per capita", points: 1,
    build: function (rng) {
      var pop = rng_int(rng, 20, 60);              /* millions */
      var perCap = rng_int(rng, 20, 65) * 1000;
      var gdp = pop * perCap / 1000;               /* billions */
      return {
        prompt: "A country has real GDP of " + money(round2(gdp)) + " billion and a population of " +
          pop + " million. What is real GDP per person, in dollars?",
        answer: perCap, tolerance: 1,
        rationale: "GDP per person = GDP / population = " + round2(gdp) + " billion / " + pop +
          " million = " + money(perCap) + "."
      };
    }
  };

  /* HARD: value added. The classic trap is adding every firm's sales, which
     double-counts intermediate goods. */
  GEN["ch7_value_added"] = {
    id: "ch7_value_added", chapter: 7, kind: "numeric", render: "text",
    difficulty: "hard", concept: "value added / double counting", points: 3,
    build: function (rng) {
      var a = rng_int(rng, 20, 60);
      var b = a + rng_int(rng, 20, 70);
      var c = b + rng_int(rng, 30, 90);
      var d = c + rng_int(rng, 20, 60);
      return {
        prompt: "A farmer grows wheat and sells it to a miller for " + money(a) +
          ". The miller grinds it into flour and sells it to a baker for " + money(b) +
          ". The baker bakes bread and sells it to a supermarket for " + money(c) +
          ". The supermarket sells the bread to households for " + money(d) +
          ". Assuming the farmer uses no intermediate inputs, how much does this " +
          "production chain contribute to GDP, in dollars?",
        answer: d, tolerance: 0.01,
        rationale: "GDP counts FINAL goods only, so the answer is the " + money(d) +
          " paid by households. Equivalently, sum the value added at each stage: " +
          a + " + " + (b - a) + " + " + (c - b) + " + " + (d - c) + " = " + d +
          ". Adding all four sales prices (" + (a + b + c + d) +
          ") double-counts the wheat, flour and bread as they pass down the chain."
      };
    }
  };

  /* HARD: back out real growth from nominal growth and inflation. Tests that
     students do not simply subtract when asked for the exact figure. */
  GEN["ch7_hard_nominal_vs_real_growth"] = {
    id: "ch7_hard_nominal_vs_real_growth", chapter: 7, kind: "numeric", render: "text",
    difficulty: "hard", concept: "decomposing nominal growth", points: 3,
    build: function (rng) {
      var real0 = rng_int(rng, 100, 160) * 100;
      var defl0 = rng_pick(rng, [100, 105, 110]);
      var gReal = rng_pick(rng, [2, 3, 4]);
      var gDefl = rng_pick(rng, [2, 3, 5]);
      var real1 = real0 * (1 + gReal / 100);
      var defl1 = defl0 * (1 + gDefl / 100);
      var nom0 = real0 * defl0 / 100;
      var nom1 = real1 * defl1 / 100;
      var gNom = 100 * (nom1 - nom0) / nom0;
      return {
        prompt: "Nominal GDP rises from " + money(round2(nom0)) + " billion to " +
          money(round2(nom1)) + " billion, while the GDP deflator rises from " + defl0 +
          " to " + round2(defl1) + ". What is the growth rate of REAL GDP, in percent? " +
          "(Give the exact figure to one decimal place, not the approximation.)",
        answer: gReal, tolerance: 0.12,
        rationale: "Real GDP = 100 × nominal / deflator. Year 0: " + round2(real0) +
          ". Year 1: " + round2(real1) + ". Growth = " + gReal +
          "%. Note nominal growth was " + round1(gNom) + "% and the deflator rose " + gDefl +
          "%; subtracting gives " + round1(gNom - gDefl) +
          "%, close but not exact, because (1+gₙ) = (1+gᵣ)(1+π) is multiplicative."
      };
    }
  };

  GEN["ch7_gdp_include"] = {
    id: "ch7_gdp_include", chapter: 7, kind: "mc", render: "text",
    difficulty: "med", concept: "what counts in GDP", points: 2,
    build: function (rng) {
      var cases = [
        { t: "a Ford assembly plant in Michigan builds a car that is still unsold at year end",
          ans: "Yes — it counts as inventory investment in the year it was produced",
          why: "Unsold output is treated as the firm investing in its own inventories, so it enters GDP when PRODUCED, not when sold." },
        { t: "a household buys a 40-year-old Victorian house",
          ans: "No — only the realtor's commission counts",
          why: "The house was produced decades ago. Only the current-period service (the agent's fee) is new production." },
        { t: "an investor buys $10,000 of Apple shares",
          ans: "No — it is a transfer of ownership, not production",
          why: "Buying an existing financial asset produces nothing; only the broker's fee is a current service." },
        { t: "the government sends a retiree a Social Security payment",
          ans: "No — it is a transfer payment, not a purchase of goods or services",
          why: "G counts government PURCHASES. Transfers move income without the government buying output." },
        { t: "a parent spends the year caring for their own children at home",
          ans: "No — unpaid household production is excluded",
          why: "GDP measures market transactions; valuable non-market work is omitted, a well-known limitation." },
        { t: "a German-owned factory operating in Ohio produces $2 million of machinery",
          ans: "Yes — GDP counts production located inside the country regardless of who owns the firm",
          why: "GDP is geographic. (GNP, by contrast, would attribute this to Germany.)" }
      ];
      var cs = rng_pick(rng, cases);
      var pool = [
        "Yes — it counts as inventory investment in the year it was produced",
        "No — only the realtor's commission counts",
        "No — it is a transfer of ownership, not production",
        "No — it is a transfer payment, not a purchase of goods or services",
        "No — unpaid household production is excluded",
        "Yes — GDP counts production located inside the country regardless of who owns the firm"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "This year, " + cs.t + ". Does this transaction enter this year's U.S. GDP?",
        options: sh.options, answer: sh.correctIndex,
        rationale: cs.why
      };
    }
  };

  /* HARD: the deflator/CPI distinction, with a case where they diverge. */
  GEN["ch7_hard_deflator_vs_cpi"] = {
    id: "ch7_hard_deflator_vs_cpi", chapter: 7, kind: "mc", render: "text",
    difficulty: "hard", concept: "deflator vs CPI", points: 3,
    build: function (rng) {
      var cases = [
        { t: "the price of imported Japanese cars sold to U.S. consumers rises sharply",
          ans: "The CPI rises but the GDP deflator does not",
          why: "The CPI covers goods CONSUMED domestically, including imports. The GDP deflator covers goods PRODUCED domestically, so imported cars are outside it." },
        { t: "the price of the industrial robots that U.S. firms build and buy rises sharply",
          ans: "The GDP deflator rises but the CPI barely moves",
          why: "Robots are domestically produced capital goods: in the deflator, not in the consumer basket." },
        { t: "the price of domestically grown apples bought by U.S. households rises sharply",
          ans: "Both the CPI and the GDP deflator rise",
          why: "Domestically produced AND consumed, so it sits in both baskets." },
        { t: "the price of military aircraft bought by the U.S. government rises sharply",
          ans: "The GDP deflator rises but the CPI barely moves",
          why: "Government purchases of domestic output are in the deflator, not the consumer basket." }
      ];
      var cs = rng_pick(rng, cases);
      var pool = [
        "The CPI rises but the GDP deflator does not",
        "The GDP deflator rises but the CPI barely moves",
        "Both the CPI and the GDP deflator rise",
        "Neither index is affected"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Suppose " + cs.t + ", with all other prices unchanged. What happens to the two price indexes?",
        options: sh.options, answer: sh.correctIndex,
        rationale: cs.why + " The two indexes differ in WHICH basket they price: consumed vs produced."
      };
    }
  };

  /* HARD: an inventory / timing trap on investment. */
  GEN["ch7_hard_inventory_timing"] = {
    id: "ch7_hard_inventory_timing", chapter: 7, kind: "numeric", render: "text",
    difficulty: "hard", concept: "inventories and the timing of GDP", points: 3,
    build: function (rng) {
      var produced = rng_int(rng, 40, 90) * 10;
      var soldFromNew = Math.round(produced * rng_pick(rng, [0.6, 0.7, 0.8]));
      var soldFromOld = rng_int(rng, 5, 20) * 10;
      return {
        prompt: "During 2026 a firm produces " + money(produced) + " thousand of goods. It sells " +
          money(soldFromNew) + " thousand of that new output during 2026, and also sells " +
          money(soldFromOld) + " thousand of goods it produced and held in inventory during 2025. " +
          "How much does this firm contribute to 2026 GDP, in thousands of dollars?",
        answer: produced, tolerance: 0.01,
        rationale: "GDP counts PRODUCTION in the year it occurs, so 2026 GDP gets the full " +
          produced + " the firm produced this year (" + soldFromNew + " sold plus " +
          (produced - soldFromNew) + " added to inventory). The " + soldFromOld +
          " drawn from 2025 inventory counted in 2025 GDP; selling it now shows up as positive " +
          "consumption and an exactly offsetting negative inventory investment, contributing zero."
      };
    }
  };

  /* ======================================================================
     CHAPTER 8 — MEASURING THE COST OF LIVING
     ====================================================================== */

  GEN["ch8_cpi_basket"] = {
    id: "ch8_cpi_basket", chapter: 8, kind: "numeric", render: "text",
    difficulty: "med", concept: "computing the CPI", points: 2,
    build: function (rng) {
      var qA = rng_int(rng, 2, 8), qB = rng_int(rng, 3, 10);
      var pA0 = rng_int(rng, 2, 6), pB0 = rng_int(rng, 1, 5);
      var pA1 = pA0 + rng_int(rng, 1, 4), pB1 = pB0 + rng_int(rng, 0, 3);
      var cost0 = qA * pA0 + qB * pB0;
      var cost1 = qA * pA1 + qB * pB1;
      var cpi = round1(100 * cost1 / cost0);
      return {
        prompt: "A CPI basket is fixed at " + qA + " units of bread and " + qB +
          " units of milk. In the base year bread costs " + money(pA0) + " and milk " + money(pB0) +
          " per unit. This year bread costs " + money(pA1) + " and milk " + money(pB1) +
          ". What is this year's CPI, taking the base year as 100? (One decimal place.)",
        answer: cpi, tolerance: 0.15,
        rationale: "Base-year basket cost = " + qA + "×" + pA0 + " + " + qB + "×" + pB0 +
          " = " + money(cost0) + ". This year the SAME basket costs " + qA + "×" + pA1 +
          " + " + qB + "×" + pB1 + " = " + money(cost1) + ". CPI = 100 × " + cost1 +
          "/" + cost0 + " ≈ " + cpi + "."
      };
    }
  };

  GEN["ch8_inflation_rate"] = {
    id: "ch8_inflation_rate", chapter: 8, kind: "numeric", render: "text",
    difficulty: "easy", concept: "inflation rate from an index", points: 1,
    build: function (rng) {
      var c0 = rng_int(rng, 180, 260);
      var pct = rng_pick(rng, [2, 2.5, 3, 4, 5, 6]);
      var c1 = round2(c0 * (1 + pct / 100));
      return {
        prompt: "The CPI was " + c0 + " last year and " + c1 +
          " this year. What is the inflation rate, in percent? (One decimal place.)",
        answer: pct, tolerance: 0.08,
        rationale: "Inflation = 100 × (CPI₁ − CPI₀)/CPI₀ = 100 × (" +
          c1 + " − " + c0 + ")/" + c0 + " ≈ " + pct + "%."
      };
    }
  };

  GEN["ch8_real_wage"] = {
    id: "ch8_real_wage", chapter: 8, kind: "numeric", render: "text",
    difficulty: "med", concept: "deflating a nominal quantity", points: 2,
    build: function (rng) {
      var cpi = rng_pick(rng, [120, 125, 140, 150, 160, 200]);
      var realWage = rng_int(rng, 15, 40);
      var nominal = round2(realWage * cpi / 100);
      return {
        prompt: "A worker earns a nominal wage of " + money(nominal) +
          " per hour when the CPI is " + cpi +
          " (base year = 100). What is the real wage, measured in base-year dollars per hour?",
        answer: realWage, tolerance: 0.06,
        rationale: "Real wage = 100 × nominal / CPI = 100 × " + nominal + "/" + cpi +
          " = " + money(realWage) + " in base-year dollars. Prices are " + (cpi - 100) +
          "% higher than the base year, so each nominal dollar buys correspondingly less."
      };
    }
  };

  /* HARD: indexation across two arbitrary years — students often divide the
     wrong way round. */
  GEN["ch8_hard_indexation"] = {
    id: "ch8_hard_indexation", chapter: 8, kind: "numeric", render: "text",
    difficulty: "hard", concept: "comparing dollar figures across years", points: 3,
    build: function (rng) {
      var yr0 = rng_int(rng, 1960, 1985);
      var yr1 = rng_int(rng, 2015, 2026);
      var cpi0 = rng_int(rng, 30, 60);
      var mult = rng_pick(rng, [4, 5, 6, 7]);
      var cpi1 = cpi0 * mult;
      var amt = rng_int(rng, 3, 9) * 1000;
      var ans = amt * mult;
      return {
        prompt: "A salary of " + money(amt) + " in " + yr0 + ", when the CPI was " + cpi0 +
          ", is equivalent to how many dollars in " + yr1 + ", when the CPI is " + cpi1 +
          "? (Enter the number of dollars.)",
        answer: ans, tolerance: 1,
        rationale: "Multiply by the ratio of the LATER index to the EARLIER one: " + amt +
          " × (" + cpi1 + "/" + cpi0 + ") = " + amt + " × " + mult + " = " + money(ans) +
          ". Dividing instead (" + money(Math.round(amt / mult)) +
          ") converts today's dollars back to " + yr0 + " dollars — the opposite direction."
      };
    }
  };

  GEN["ch8_real_interest"] = {
    id: "ch8_real_interest", chapter: 8, kind: "numeric", render: "text",
    difficulty: "med", concept: "real vs nominal interest rate", points: 2,
    build: function (rng) {
      var nom = rng_pick(rng, [3, 4, 5, 6, 7, 8]);
      var infl = rng_pick(rng, [1, 2, 3, 5, 6, 9]);
      return {
        prompt: "A savings account pays a nominal interest rate of " + nom +
          "% per year while inflation runs at " + infl +
          "%. What is the approximate real interest rate, in percent? " +
          "(Enter a negative number if appropriate.)",
        answer: nom - infl, tolerance: 0.11,
        rationale: "Real ≈ nominal − inflation = " + nom + " − " + infl + " = " +
          (nom - infl) + "%." + ((nom - infl) < 0 ?
            " A negative real rate means the money in the account buys LESS at the end of the year than at the start, despite the positive nominal return." : "")
      };
    }
  };

  /* HARD: which CPI bias, in a concrete case. */
  GEN["ch8_hard_cpi_bias"] = {
    id: "ch8_hard_cpi_bias", chapter: 8, kind: "mc", render: "text",
    difficulty: "hard", concept: "sources of CPI bias", points: 3,
    build: function (rng) {
      var cases = [
        { t: "when beef prices spike, households buy far more chicken and less beef, but the CPI keeps pricing the old fixed basket",
          ans: "Substitution bias", why: "A fixed basket ignores consumers' ability to switch toward relatively cheaper goods, so it overstates the rise in the true cost of living." },
        { t: "smartphones did not exist when the basket was set, and they entered the index only years after becoming widespread",
          ans: "Introduction-of-new-goods bias", why: "New goods expand the choice set and raise the purchasing power of a dollar, but enter the fixed basket only with a lag." },
        { t: "this year's laptops cost the same as last year's but have twice the memory and a far better screen",
          ans: "Unmeasured quality change", why: "If a price is unchanged while quality rises, the true cost of a constant standard of living has FALLEN; imperfect quality adjustment shows it as flat." },
        { t: "a household switches from a downtown store to a cheaper warehouse club selling the same brands",
          ans: "Outlet substitution bias", why: "Consumers shift to cheaper retail outlets; a survey anchored to traditional outlets misses that saving." }
      ];
      var cs = rng_pick(rng, cases);
      var pool = ["Substitution bias", "Introduction-of-new-goods bias",
        "Unmeasured quality change", "Outlet substitution bias"];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Consider this situation: " + cs.t +
          ". Which source of bias in the consumer price index does it best illustrate?",
        options: sh.options, answer: sh.correctIndex,
        rationale: cs.why + " All four biases push the same way: the CPI OVERSTATES true inflation."
      };
    }
  };

  /* HARD: real wage change when both wage and prices move. The trap is
     comparing the nominal raise to inflation carelessly. */
  GEN["ch8_hard_real_wage_change"] = {
    id: "ch8_hard_real_wage_change", chapter: 8, kind: "mc", render: "text",
    difficulty: "hard", concept: "real vs nominal wage changes", points: 3,
    build: function (rng) {
      var wageGrowth = rng_pick(rng, [2, 3, 4, 5, 6]);
      var infl = rng_pick(rng, [1, 2, 3, 4, 5, 7]);
      var diff = wageGrowth - infl;
      var ans;
      if (diff > 0) { ans = "Better off — the real wage rose by roughly " + diff + "%"; }
      else if (diff < 0) { ans = "Worse off — the real wage fell by roughly " + Math.abs(diff) + "%"; }
      else { ans = "No change — the real wage is roughly unchanged"; }
      var pool = [
        "Better off — the real wage rose by roughly " + Math.abs(diff === 0 ? 1 : diff) + "%",
        "Worse off — the real wage fell by roughly " + Math.abs(diff === 0 ? 1 : diff) + "%",
        "No change — the real wage is roughly unchanged",
        "It cannot be determined without knowing the level of the wage"
      ];
      /* rebuild the pool so the correct string is present exactly once */
      if (diff > 0) { pool[0] = "Better off — the real wage rose by roughly " + diff + "%"; pool[1] = "Worse off — the real wage fell by roughly " + diff + "%"; }
      else if (diff < 0) { pool[0] = "Better off — the real wage rose by roughly " + Math.abs(diff) + "%"; pool[1] = "Worse off — the real wage fell by roughly " + Math.abs(diff) + "%"; }
      var correct = (diff > 0) ? 0 : (diff < 0 ? 1 : 2);
      var sh = shuffleWithAnswer(rng, pool, correct);
      return {
        prompt: "Over one year a worker's nominal wage rises " + wageGrowth +
          "% while the consumer price index rises " + infl +
          "%. In terms of purchasing power, is the worker better off, worse off, or unchanged?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Real wage growth ≈ nominal wage growth − inflation = " + wageGrowth +
          " − " + infl + " = " + diff + "%. " +
          (diff < 0 ? "A raise that trails inflation is a real pay CUT, even though the paycheck is larger." :
           diff > 0 ? "The raise outpaces prices, so purchasing power rises." :
           "The raise exactly matches inflation, leaving purchasing power flat.") +
          " The LEVEL of the wage is irrelevant to the percentage change."
      };
    }
  };

  /* ======================================================================
     CHAPTER 9 — PRODUCTION AND GROWTH
     ====================================================================== */

  GEN["ch9_rule_of_70"] = {
    id: "ch9_rule_of_70", chapter: 9, kind: "numeric", render: "text",
    difficulty: "easy", concept: "rule of 70", points: 1,
    build: function (rng) {
      var g = rng_pick(rng, [1, 2, 3.5, 5, 7, 10]);
      return {
        prompt: "If real GDP per person grows at " + g +
          "% per year, roughly how many years will it take to double? " +
          "(Use the rule of 70; one decimal place.)",
        answer: round1(70 / g), tolerance: 0.3,
        rationale: "Rule of 70: doubling time ≈ 70 / growth rate = 70/" + g + " ≈ " +
          round1(70 / g) + " years. Small differences in growth rates compound into very " +
          "large differences in living standards over a generation."
      };
    }
  };

  /* Valid Solow parameter sets.
     With alpha = 1/2 the steady state is  sA√k = (δ+n)k  →  √k* = sA/(δ+n).
     The saving rate PRINTED to the student must reproduce that ratio exactly —
     deriving s = ratio·(δ+n)/A and then rounding it for display silently breaks
     the correspondence (s = 0.075 shown as 0.08 keys k* = 9 while the printed
     numbers give 10.24). So the combinations are enumerated instead of derived,
     and every one of them yields an s that is exact to two decimals.
     Each entry: [A, delta, n, ratio] where ratio = sA/(δ+n) = √k*. */
  var SOLOW_SETS = [
    [1, 0.05, 0.00, 2], [1, 0.05, 0.00, 3], [1, 0.05, 0.00, 4], [1, 0.05, 0.00, 5],
    [1, 0.05, 0.05, 2], [1, 0.05, 0.05, 3], [1, 0.05, 0.05, 4],
    [1, 0.10, 0.00, 2], [1, 0.10, 0.00, 3], [1, 0.10, 0.00, 4], [1, 0.10, 0.00, 5],
    [1, 0.08, 0.02, 2], [1, 0.08, 0.02, 3], [1, 0.08, 0.02, 4],
    [2, 0.10, 0.00, 2], [2, 0.10, 0.00, 3], [2, 0.10, 0.00, 4], [2, 0.10, 0.00, 5],
    [2, 0.05, 0.05, 2], [2, 0.05, 0.05, 3], [2, 0.05, 0.05, 4],
    [2, 0.08, 0.02, 2], [2, 0.08, 0.02, 3], [2, 0.08, 0.02, 4],
    [2, 0.15, 0.05, 2], [2, 0.15, 0.05, 3]
  ];
  /* s is computed, then asserted to be exact at 2dp by construction of the table. */
  function solowParams(rng) {
    var set = rng_pick(rng, SOLOW_SETS);
    var A = set[0], delta = set[1], n = set[2], ratio = set[3];
    var dn = Math.round((delta + n) * 100) / 100;
    var s = Math.round((ratio * dn / A) * 100) / 100;
    return { A: A, delta: delta, n: n, dn: dn, ratio: ratio, s: s,
             kStar: ratio * ratio, yStar: A * ratio };
  }

  GEN["ch9_solow_steady_k"] = {
    id: "ch9_solow_steady_k", chapter: 9, kind: "numeric", render: "graphical",
    difficulty: "hard", concept: "Solow steady state", points: 3,
    build: function (rng) {
      var p = solowParams(rng);
      var A = p.A, delta = p.delta, n = p.n, dn = p.dn, ratio = p.ratio, s = p.s;
      var kStar = p.kStar;
      return {
        prompt: "An economy has the production function y = " + A +
          "√k (output per worker as a function of capital per worker). " +
          "The saving rate is s = " + s + ", depreciation is δ = " + delta +
          ", and the labour force grows at n = " + n +
          ". What is the steady-state capital per worker, k*?",
        diagramSpec: { type: "solow", A: A, alpha: 0.5, s: s, delta: delta, n: n, hideValues: true },
        answer: kStar, tolerance: 0.12,
        rationale: "Steady state: s·A·√k = (δ+n)k. With A = " + A + ", s = " + s +
          ", δ+n = " + dn + ": √k* = sA/(δ+n) = " + ratio + ", so k* = " +
          ratio + "² = " + kStar + "."
      };
    }
  };

  GEN["ch9_solow_steady_y"] = {
    id: "ch9_solow_steady_y", chapter: 9, kind: "numeric", render: "graphical",
    difficulty: "hard", concept: "Solow steady-state output", points: 3,
    build: function (rng) {
      var p = solowParams(rng);
      var A = p.A, delta = p.delta, n = p.n, dn = p.dn, ratio = p.ratio, s = p.s;
      var kStar = p.kStar;
      var yStar = p.yStar;
      return {
        prompt: "With production function y = " + A + "√k, saving rate s = " + s +
          ", depreciation δ = " + delta + " and population growth n = " + n +
          ", what is steady-state OUTPUT per worker, y*?",
        diagramSpec: { type: "solow", A: A, alpha: 0.5, s: s, delta: delta, n: n, hideValues: true },
        answer: round2(yStar), tolerance: 0.12,
        rationale: "First k*: √k* = sA/(δ+n) = " + ratio + ", so k* = " + kStar +
          ". Then y* = " + A + "√" + kStar + " = " + round2(yStar) +
          ". At the steady state investment s·y* = " + round2(s * yStar) +
          " exactly covers break-even investment (δ+n)k* = " + round2(dn * kStar) + "."
      };
    }
  };

  /* HARD — the single most important conceptual trap in growth theory:
     a higher saving rate raises the LEVEL of income, not the long-run GROWTH RATE. */
  GEN["ch9_hard_saving_level_vs_growth"] = {
    id: "ch9_hard_saving_level_vs_growth", chapter: 9, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "level effects vs growth effects", points: 3,
    build: function (rng) {
      var s1 = rng_pick(rng, [0.2, 0.25, 0.3]);
      var s2 = round2(s1 + rng_pick(rng, [0.1, 0.15]));
      var pool = [
        "Output per worker grows faster for a while, then settles at a permanently HIGHER level with the same long-run growth rate as before",
        "Output per worker grows permanently faster from now on",
        "Output per worker rises immediately to a new level and then stops changing at once",
        "Output per worker is unchanged in both the short run and the long run"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "In the Solow model with no technological progress, a country permanently raises " +
          "its saving rate from " + s1 + " to " + s2 +
          ". What happens to output per worker in the short run and in the long run?",
        diagramSpec: { type: "solow", A: 2, alpha: 0.5, s: s2, delta: 0.1, n: 0.02, hideValues: true },
        options: sh.options, answer: sh.correctIndex,
        rationale: "Higher saving raises the s·f(k) curve, so it now sits above break-even " +
          "investment at the old k: capital accumulates and growth is temporarily faster. But " +
          "diminishing returns to capital mean each extra unit of k adds less output, so the " +
          "economy converges to a new, higher steady state where growth in output per worker " +
          "returns to zero (or to the rate of technological progress). This is a LEVEL effect, " +
          "not a permanent GROWTH effect — only ongoing technological progress raises the " +
          "long-run growth rate."
      };
    }
  };

  /* HARD: catch-up / convergence. */
  GEN["ch9_hard_convergence"] = {
    id: "ch9_hard_convergence", chapter: 9, kind: "mc", render: "text",
    difficulty: "hard", concept: "conditional convergence", points: 3,
    build: function (rng) {
      var poor = rng_int(rng, 2, 6) * 1000;
      var rich = poor * rng_pick(rng, [6, 8, 10]);
      var pool = [
        "The poorer country, because capital is scarce there so the return to each additional unit of capital is high",
        "The richer country, because it already has more capital and better technology",
        "They must grow at exactly the same rate",
        "The poorer country, because it necessarily has a higher saving rate"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Country A has GDP per person of " + money(poor) + " and Country B has " +
          money(rich) + ". Both have the same saving rate, depreciation rate, population growth " +
          "and access to the same technology. According to the Solow model, which country should " +
          "grow FASTER over the next two decades, and why?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Diminishing returns to capital: where k is low, the marginal product of " +
          "capital is high, so a given amount of investment buys a larger proportional increase " +
          "in output. This is the catch-up effect. It is CONDITIONAL convergence — it holds " +
          "only because the two countries share saving rates and institutions. Countries with " +
          "different saving rates or weak property rights converge to different steady states " +
          "and need not catch up at all, which is why poor countries do not converge " +
          "unconditionally in the data."
      };
    }
  };

  /* HARD: distinguishing a level shift in A from capital deepening. */
  GEN["ch9_hard_tfp_vs_capital"] = {
    id: "ch9_hard_tfp_vs_capital", chapter: 9, kind: "mc", render: "text",
    difficulty: "hard", concept: "technology vs capital deepening", points: 3,
    build: function (rng) {
      var cases = [
        { t: "a country that has been investing heavily for 30 years finds each new factory adds less to output than the last",
          ans: "Diminishing returns to capital deepening",
          why: "More k with unchanged A moves the economy ALONG the production function, where the slope falls." },
        { t: "a new manufacturing technique lets firms produce 20% more output from exactly the same capital and labour",
          ans: "An increase in total factor productivity (A)",
          why: "Same inputs, more output: the production function itself shifts up. This is what sustains long-run growth." },
        { t: "a country strengthens contract enforcement and property rights, and measured output per worker rises over the following decade",
          ans: "An increase in total factor productivity (A)",
          why: "Institutions act like technology in the growth accounting: they raise output obtainable from given inputs." },
        { t: "a country doubles its capital stock per worker while technology is unchanged, and output per worker rises by less than double",
          ans: "Diminishing returns to capital deepening",
          why: "With α < 1, doubling k raises y by a factor of 2^α < 2." }
      ];
      var cs = rng_pick(rng, cases);
      var pool = ["Diminishing returns to capital deepening",
        "An increase in total factor productivity (A)",
        "A fall in the depreciation rate",
        "A reduction in the labour force growth rate"];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Which growth mechanism best explains the following? " + cs.t + ".",
        options: sh.options, answer: sh.correctIndex,
        rationale: cs.why + " Growth accounting separates movement ALONG the production " +
          "function (capital deepening, subject to diminishing returns) from shifts OF the " +
          "function (productivity), and only the latter can sustain growth indefinitely."
      };
    }
  };

  /* ======================================================================
     CHAPTER 10 — SAVING, INVESTMENT AND THE FINANCIAL SYSTEM
     ====================================================================== */

  GEN["ch10_national_saving"] = {
    id: "ch10_national_saving", chapter: 10, kind: "numeric", render: "text",
    difficulty: "med", concept: "national saving identity", points: 2,
    build: function (rng) {
      var Y = rng_int(rng, 80, 140) * 100;
      var C = Math.round(Y * rng_pick(rng, [0.6, 0.65, 0.7]));
      var G = Math.round(Y * rng_pick(rng, [0.15, 0.2]));
      return {
        prompt: "In a closed economy, GDP is " + money(Y) + " billion, consumption is " +
          money(C) + " billion, and government purchases are " + money(G) +
          " billion. What is national saving, in billions of dollars?",
        answer: Y - C - G, tolerance: 0.01,
        rationale: "S = Y − C − G = " + Y + " − " + C + " − " + G + " = " +
          (Y - C - G) + " billion. In a closed economy this also equals investment: whatever " +
          "output is not consumed by households or government is available to be invested."
      };
    }
  };

  /* HARD: split national saving into private and public — the deficit case. */
  GEN["ch10_hard_public_private_saving"] = {
    id: "ch10_hard_public_private_saving", chapter: 10, kind: "numeric", render: "text",
    difficulty: "hard", concept: "public vs private saving", points: 3,
    build: function (rng) {
      var Y = rng_int(rng, 90, 140) * 100;
      var T = Math.round(Y * rng_pick(rng, [0.18, 0.2, 0.22]));
      var G = T + rng_int(rng, 2, 12) * 100;     /* deficit */
      var C = Math.round(Y * rng_pick(rng, [0.6, 0.65]));
      var publicSaving = T - G;
      return {
        prompt: "An economy has GDP of " + money(Y) + " billion, consumption of " + money(C) +
          " billion, taxes net of transfers of " + money(T) + " billion, and government purchases of " +
          money(G) + " billion. What is PUBLIC saving, in billions of dollars? " +
          "(Enter a negative number if the government runs a deficit.)",
        answer: publicSaving, tolerance: 0.01,
        rationale: "Public saving = T − G = " + T + " − " + G + " = " + publicSaving +
          " billion, i.e. a budget deficit of " + money(Math.abs(publicSaving)) +
          " billion. Private saving is Y − T − C = " + (Y - T - C) +
          ", and national saving S = (Y−T−C) + (T−G) = " + (Y - C - G) +
          " — the taxes cancel, which is why national saving does not depend on T directly."
      };
    }
  };

  GEN["ch10_lf_equilibrium"] = {
    id: "ch10_lf_equilibrium", chapter: 10, kind: "numeric", render: "graphical",
    difficulty: "med", concept: "loanable funds equilibrium", points: 2,
    build: function (rng) {
      var sB = rng_pick(rng, [1, 2]), dB = rng_pick(rng, [1, 2]);
      var qStar = rng_int(rng, 3, 7);
      var sA = rng_int(rng, 1, 3);
      var rStar = sA + sB * qStar;
      var dA = rStar + dB * qStar;
      var askR = rng() < 0.5;
      return {
        prompt: "In the market for loanable funds, the supply of saving is r = " + sA + " + " +
          sB + "Q and the demand for investment is r = " + dA + " − " + dB +
          "Q, where r is the real interest rate in percent. What is the equilibrium " +
          (askR ? "real interest rate?" : "quantity of loanable funds?"),
        diagramSpec: { type: "loanable_funds", sA: sA, sB: sB, dA: dA, dB: dB,
          xmax: Math.max(10, qStar + 4), ymax: Math.max(12, rStar + 4), hideValues: true },
        answer: askR ? rStar : qStar, tolerance: 0.01,
        rationale: "Set " + sA + " + " + sB + "Q = " + dA + " − " + dB + "Q → Q* = " +
          qStar + ", then r* = " + rStar + "%."
      };
    }
  };

  /* HARD: crowding out, read off the diagram. */
  GEN["ch10_hard_crowding_out"] = {
    id: "ch10_hard_crowding_out", chapter: 10, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "crowding out", points: 3,
    build: function (rng) {
      var sB = rng_pick(rng, [1, 2]), dB = rng_pick(rng, [1, 2]);
      var qStar = rng_int(rng, 4, 7);
      var sA = rng_int(rng, 1, 3);
      var rStar = sA + sB * qStar;
      var dA = rStar + dB * qStar;
      var shift = rng_int(rng, 2, 4);
      var scenarios = [
        "The government moves from a balanced budget to a large deficit, reducing public saving.",
        "The government funds a costly war entirely by borrowing, with no change in taxes.",
        "Congress passes a large tax cut with no corresponding cut in government spending.",
        "An economic downturn causes tax revenue to collapse while spending is held constant, pushing the budget deep into deficit."
      ];
      var scen = rng_pick(rng, scenarios);
      var pool = [
        "The real interest rate rises and investment falls — the deficit crowds out private investment",
        "The real interest rate falls and investment rises",
        "The real interest rate rises and investment rises",
        "Neither the interest rate nor investment changes"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: scen + " In the market for loanable funds shown, what happens to the real " +
          "interest rate and to private investment?",
        diagramSpec: { type: "loanable_funds", sA: sA, sB: sB, dA: dA, dB: dB,
          shift: { curve: "S", by: shift },
          xmax: Math.max(10, qStar + 4), ymax: Math.max(14, rStar + 5), hideValues: true },
        options: sh.options, answer: sh.correctIndex,
        rationale: "A deficit reduces national saving, shifting the SUPPLY of loanable funds " +
          "LEFT. Moving up along the unchanged investment-demand curve, the equilibrium real " +
          "interest rate rises and the quantity of funds borrowed for private investment falls. " +
          "Note that it is the supply curve that moves: government borrowing subtracts from the " +
          "pool of saving rather than adding to investment demand."
      };
    }
  };

  /* HARD: which curve shifts — the classic saving-incentive vs
     investment-incentive discrimination. */
  GEN["ch10_hard_which_curve"] = {
    id: "ch10_hard_which_curve", chapter: 10, kind: "mc", render: "text",
    difficulty: "hard", concept: "identifying the shifting curve", points: 3,
    build: function (rng) {
      var cases = [
        { t: "Congress cuts the tax rate on interest income earned by households",
          ans: "Supply of loanable funds shifts right: the interest rate falls and investment rises",
          why: "A saving incentive raises the after-tax reward to saving at every interest rate, so it moves SUPPLY." },
        { t: "Congress introduces an investment tax credit for firms buying new equipment",
          ans: "Demand for loanable funds shifts right: the interest rate rises and investment rises",
          why: "An investment incentive raises the after-tax return to capital projects, so it moves DEMAND. Both r and Q rise." },
        { t: "the government runs a larger budget deficit",
          ans: "Supply of loanable funds shifts left: the interest rate rises and investment falls",
          why: "Public dissaving subtracts from national saving, moving SUPPLY left — crowding out." },
        { t: "the government pays down debt, moving from deficit to surplus",
          ans: "Supply of loanable funds shifts right: the interest rate falls and investment rises",
          why: "A surplus adds to national saving, moving SUPPLY right." }
      ];
      var cs = rng_pick(rng, cases);
      var pool = [
        "Supply of loanable funds shifts right: the interest rate falls and investment rises",
        "Demand for loanable funds shifts right: the interest rate rises and investment rises",
        "Supply of loanable funds shifts left: the interest rate rises and investment falls",
        "Demand for loanable funds shifts left: the interest rate falls and investment falls"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Suppose " + cs.t +
          ". In the market for loanable funds, which curve shifts and what happens to the real " +
          "interest rate and investment?",
        options: sh.options, answer: sh.correctIndex,
        rationale: cs.why + " The reliable test: ask whether the policy changes the reward to " +
          "SAVING (supply) or the return to INVESTING (demand). Both raise investment, but they " +
          "move the interest rate in OPPOSITE directions — which is how you tell them apart."
      };
    }
  };

  GEN["ch10_present_value"] = {
    id: "ch10_present_value", chapter: 10, kind: "numeric", render: "text",
    difficulty: "hard", concept: "present value", points: 3,
    build: function (rng) {
      var r = rng_pick(rng, [0.05, 0.08, 0.1]);
      var yrs = rng_pick(rng, [2, 3]);
      var fv = rng_int(rng, 5, 20) * 1000;
      var pv = fv / Math.pow(1 + r, yrs);
      return {
        prompt: "You will receive " + money(fv) + " in " + yrs +
          " years. If the interest rate is " + Math.round(r * 100) +
          "% per year, what is the present value of that payment, in dollars? " +
          "(Round to the nearest dollar.)",
        answer: Math.round(pv), tolerance: 2,
        rationale: "PV = FV / (1+r)^n = " + fv + " / (1 + " + r + ")^" + yrs + " = " +
          money(Math.round(pv)) + ". Equivalently, " + money(Math.round(pv)) +
          " invested today at " + Math.round(r * 100) + "% would grow to " + money(fv) +
          " in " + yrs + " years. Dividing by (1 + " + r * yrs +
          ") instead ignores compounding and overstates the present value."
      };
    }
  };

  /* HARD: bond price and yield move inversely. */
  GEN["ch10_hard_bond_price_yield"] = {
    id: "ch10_hard_bond_price_yield", chapter: 10, kind: "mc", render: "text",
    difficulty: "hard", concept: "bond prices and interest rates", points: 3,
    build: function (rng) {
      var coupon = rng_int(rng, 3, 8);
      var newRate = coupon + rng_pick(rng, [2, 3, 4]);
      var pool = [
        "Its price falls, because buyers will only hold an older, lower-coupon bond at a discount that brings its yield into line",
        "Its price rises, because bonds become more attractive when interest rates are high",
        "Its price is unchanged, because the coupon payment is fixed",
        "Its price rises, because the bond's fixed coupon is now worth more"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "You hold a bond paying a fixed coupon of " + coupon +
          "% of face value each year. Newly issued bonds of the same risk and maturity now pay " +
          newRate + "%. What happens to the market price of YOUR bond?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "The coupon is fixed in dollars, so the only way your bond can offer a " +
          "competitive " + newRate + "% return is for its PRICE to fall. Bond prices and " +
          "interest rates always move inversely. This is also why rising rates impose capital " +
          "losses on existing bondholders even though no issuer has defaulted."
      };
    }
  };

  /* ======================================================================
     CHAPTER 11 — THE MONETARY SYSTEM
     ====================================================================== */

  GEN["ch11_money_multiplier"] = {
    id: "ch11_money_multiplier", chapter: 11, kind: "numeric", render: "text",
    difficulty: "med", concept: "money multiplier", points: 2,
    build: function (rng) {
      var rr = rng_pick(rng, [0.05, 0.1, 0.125, 0.2, 0.25]);
      return {
        prompt: "Banks hold reserves equal to " + (rr * 100) +
          "% of deposits and hold no excess reserves. What is the money multiplier?",
        answer: round2(1 / rr), tolerance: 0.06,
        rationale: "Money multiplier = 1 / reserve ratio = 1/" + rr + " = " + round2(1 / rr) +
          ". Each dollar of reserves ultimately supports " + round2(1 / rr) + " dollars of deposits."
      };
    }
  };

  GEN["ch11_deposit_creation"] = {
    id: "ch11_deposit_creation", chapter: 11, kind: "numeric", render: "text",
    difficulty: "hard", concept: "deposit creation", points: 3,
    build: function (rng) {
      var rr = rng_pick(rng, [0.05, 0.1, 0.2, 0.25]);
      var inject = rng_int(rng, 1, 9) * 1000;
      var total = inject / rr;
      return {
        prompt: "The central bank buys " + money(inject) +
          " of government bonds from the public, and the proceeds are deposited in a bank. " +
          "Banks hold reserves of " + (rr * 100) +
          "% of deposits, hold no excess reserves, and the public holds no additional currency. " +
          "By how many dollars does the money supply ultimately increase?",
        answer: total, tolerance: 1,
        rationale: "The injection of " + money(inject) + " in reserves is multiplied by 1/" + rr +
          " = " + round2(1 / rr) + ", giving " + money(total) +
          " of deposits. Note the money supply rises by the FULL " + money(total) +
          ", not by " + money(total - inject) +
          " — the initial deposit is itself part of the money supply."
      };
    }
  };

  /* HARD: excess reserves break the textbook multiplier. This is exactly what
     happened after 2008 and is the most important caveat in the chapter. */
  GEN["ch11_hard_excess_reserves"] = {
    id: "ch11_hard_excess_reserves", chapter: 11, kind: "numeric", render: "text",
    difficulty: "hard", concept: "excess reserves and the multiplier", points: 3,
    build: function (rng) {
      var rr = rng_pick(rng, [0.1, 0.2]);
      var excess = rng_pick(rng, [0.1, 0.2, 0.3]);
      var effective = round2(rr + excess);
      var inject = rng_int(rng, 2, 8) * 1000;
      var total = Math.round(inject / effective);
      return {
        prompt: "Required reserves are " + (rr * 100) +
          "% of deposits, but nervous banks choose to hold an ADDITIONAL " + (excess * 100) +
          "% of deposits as excess reserves. The central bank injects " + money(inject) +
          " of new reserves. By how many dollars does the money supply increase? " +
          "(Round to the nearest dollar.)",
        answer: total, tolerance: 2,
        rationale: "What matters is the TOTAL reserve ratio banks actually hold: " + rr + " + " +
          excess + " = " + effective + ". The effective multiplier is 1/" + effective + " = " +
          round2(1 / effective) + ", so the money supply rises by " + money(inject) + " × " +
          round2(1 / effective) + " ≈ " + money(total) +
          ", far less than the " + money(Math.round(inject / rr)) +
          " the required-reserve multiplier of " + round2(1 / rr) +
          " would predict. This is why massive reserve injections after 2008 produced " +
          "much less deposit growth than the simple multiplier implied: banks sat on the reserves."
      };
    }
  };

  /* HARD: currency drain. */
  GEN["ch11_hard_currency_drain"] = {
    id: "ch11_hard_currency_drain", chapter: 11, kind: "mc", render: "text",
    difficulty: "hard", concept: "currency holdings and the multiplier", points: 3,
    build: function (rng) {
      var rr = rng_pick(rng, [0.1, 0.2]);
      var pool = [
        "The multiplier gets SMALLER, because currency held outside banks cannot be lent out and re-deposited",
        "The multiplier gets LARGER, because currency is part of the money supply",
        "The multiplier is unaffected, because currency and deposits are both money",
        "The multiplier becomes exactly 1"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Reserves are " + (rr * 100) +
          "% of deposits. During a period of financial panic, households decide to hold a much " +
          "larger fraction of their money as currency in hand rather than as bank deposits. " +
          "What happens to the size of the money multiplier?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Only money that sits INSIDE the banking system can be re-lent and re-deposited. " +
          "Every dollar the public holds as cash leaks out of that loop, so the deposit-expansion " +
          "chain is cut short and the multiplier falls. In the Great Depression, a simultaneous " +
          "rise in the currency-deposit ratio and in banks' excess reserves collapsed the money " +
          "multiplier and the money supply, even though the monetary base did not fall."
      };
    }
  };

  GEN["ch11_omo_effect"] = {
    id: "ch11_omo_effect", chapter: 11, kind: "mc", render: "graphical",
    difficulty: "med", concept: "open-market operations", points: 2,
    build: function (rng) {
      var buy = rng() < 0.5;
      var ms = rng_int(rng, 5, 8);
      var mdA = rng_int(rng, 13, 16);
      var by = buy ? rng_int(rng, 2, 3) : -rng_int(rng, 2, 3);
      var pool = [
        "The money supply rises and the nominal interest rate falls",
        "The money supply falls and the nominal interest rate rises",
        "The money supply rises and the nominal interest rate rises",
        "The money supply falls and the nominal interest rate falls"
      ];
      var sh = shuffleWithAnswer(rng, pool, buy ? 0 : 1);
      return {
        prompt: "The central bank " + (buy ? "BUYS" : "SELLS") +
          " government bonds on the open market. Using the money market shown, what happens to " +
          "the money supply and the nominal interest rate?",
        diagramSpec: { type: "money_market", ms: ms, mdA: mdA, mdB: 1,
          shift: { curve: "MS", by: by }, hideValues: true },
        options: sh.options, answer: sh.correctIndex,
        rationale: (buy ?
          "Buying bonds pays sellers with newly created reserves, shifting the vertical money " +
          "supply RIGHT. Along the downward-sloping money-demand curve, the interest rate falls." :
          "Selling bonds absorbs reserves, shifting the vertical money supply LEFT. Along the " +
          "downward-sloping money-demand curve, the interest rate rises.") +
          " The money supply curve is vertical because the central bank sets the quantity " +
          "directly rather than responding to the interest rate."
      };
    }
  };

  /* ======================================================================
     CHAPTER 12 — MONEY GROWTH AND INFLATION
     ====================================================================== */

  GEN["ch12_quantity_theory"] = {
    id: "ch12_quantity_theory", chapter: 12, kind: "numeric", render: "text",
    difficulty: "med", concept: "quantity equation MV = PY", points: 2,
    build: function (rng) {
      var M = rng_int(rng, 4, 12) * 100;
      var V = rng_pick(rng, [2, 4, 5]);
      var Y = rng_int(rng, 10, 30) * 100;
      var Pv = round2(M * V / Y);
      var which = rng_pick(rng, ["P", "V"]);
      if (which === "P") {
        return {
          prompt: "In the quantity equation MV = PY, the money supply is " + M +
            ", velocity is " + V + ", and real output is " + Y +
            ". What is the price level P? (Two decimal places.)",
          answer: Pv, tolerance: 0.02,
          rationale: "P = MV/Y = (" + M + " × " + V + ")/" + Y + " = " + Pv + "."
        };
      }
      var Pfix = rng_pick(rng, [1, 2, 4]);
      var Vans = round2(Pfix * Y / M);
      return {
        prompt: "In the quantity equation MV = PY, the money supply is " + M +
          ", the price level is " + Pfix + ", and real output is " + Y +
          ". What is the velocity of money? (Two decimal places.)",
        answer: Vans, tolerance: 0.02,
        rationale: "V = PY/M = (" + Pfix + " × " + Y + ")/" + M + " = " + Vans +
          ". Velocity is how many times the average dollar changes hands in a year."
      };
    }
  };

  GEN["ch12_money_growth_inflation"] = {
    id: "ch12_money_growth_inflation", chapter: 12, kind: "numeric", render: "text",
    difficulty: "hard", concept: "growth-rate form of the quantity equation", points: 3,
    build: function (rng) {
      var mGrowth = rng_pick(rng, [4, 6, 8, 10, 12]);
      var yGrowth = rng_pick(rng, [1, 2, 3]);
      var vGrowth = rng_pick(rng, [0, 0, 1, -1]);
      return {
        prompt: "The money supply grows at " + mGrowth + "% per year, velocity changes by " +
          vGrowth + "% per year, and real output grows at " + yGrowth +
          "% per year. Using the growth-rate form of the quantity equation, what is the " +
          "inflation rate, in percent?",
        answer: mGrowth + vGrowth - yGrowth, tolerance: 0.11,
        rationale: "In growth rates, %ΔM + %ΔV = %ΔP + %ΔY, so inflation = " +
          mGrowth + " + (" + vGrowth + ") − " + yGrowth + " = " +
          (mGrowth + vGrowth - yGrowth) + "%. Note that real growth ABSORBS money growth: an " +
          "economy whose output grows can expand its money supply at the same rate with no " +
          "inflation at all."
      };
    }
  };

  GEN["ch12_fisher_effect"] = {
    id: "ch12_fisher_effect", chapter: 12, kind: "numeric", render: "text",
    difficulty: "med", concept: "Fisher effect", points: 2,
    build: function (rng) {
      var real = rng_pick(rng, [1, 2, 3]);
      var inflBefore = rng_pick(rng, [2, 3]);
      var inflAfter = inflBefore + rng_pick(rng, [3, 4, 5]);
      return {
        prompt: "The real interest rate is " + real +
          "% and is determined by saving and investment, independently of monetary policy. " +
          "Expected inflation rises from " + inflBefore + "% to " + inflAfter +
          "%. According to the Fisher effect, what is the new NOMINAL interest rate, in percent?",
        answer: real + inflAfter, tolerance: 0.11,
        rationale: "Fisher: i = r + πᵉ = " + real + " + " + inflAfter + " = " +
          (real + inflAfter) + "%. The nominal rate rises one-for-one with expected inflation " +
          "because the real rate is pinned down in the loanable-funds market. Only " +
          "UNEXPECTED inflation changes the real rate after the fact."
      };
    }
  };

  /* HARD: classical dichotomy / monetary neutrality. */
  GEN["ch12_hard_neutrality"] = {
    id: "ch12_hard_neutrality", chapter: 12, kind: "mc", render: "text",
    difficulty: "hard", concept: "monetary neutrality", points: 3,
    build: function (rng) {
      var mult = rng_pick(rng, [2, 3]);
      var pool = [
        "The price level and all nominal wages and prices eventually rise by a factor of " + mult + ", while real GDP, real wages and the real interest rate are unchanged",
        "Real GDP eventually rises by a factor of " + mult + ", with the price level unchanged",
        "Both real GDP and the price level eventually rise by a factor of " + mult,
        "Nothing changes, because money is only a veil"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "In the long run, a central bank permanently multiplies the money supply by " +
          mult + ". Assuming classical monetary neutrality holds, what happens?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "The classical dichotomy separates nominal from real variables. Multiplying M " +
          "by " + mult + " with V and Y fixed multiplies P by " + mult +
          " (from MV = PY). Every nominal magnitude scales; nothing REAL changes, because real " +
          "variables depend on technology, factor supplies and preferences, not on the units " +
          "money is measured in. Note the last option is wrong in an important way: money is " +
          "neutral for REAL variables in the long run, but it very much determines the price " +
          "level, and it is not neutral in the SHORT run."
      };
    }
  };

  /* HARD: inflation tax / seigniorage. */
  GEN["ch12_hard_inflation_tax"] = {
    id: "ch12_hard_inflation_tax", chapter: 12, kind: "mc", render: "text",
    difficulty: "hard", concept: "the inflation tax", points: 3,
    build: function (rng) {
      var rate = rng_pick(rng, [40, 60, 120, 300, 900]);
      var settings = [
        "A government unable to collect enough tax revenue finances a persistent budget deficit by printing money",
        "A government cut off from international credit markets covers its spending by having the central bank buy its debt",
        "A finance ministry facing widespread tax evasion instructs the central bank to fund the deficit directly"
      ];
      var scen = rng_pick(rng, settings);
      var pool = [
        "Holders of currency and of fixed-rate nominal assets, whose real value is eroded",
        "Borrowers with fixed-rate nominal debts, whose real burden rises",
        "The government, which must repay its debts in more valuable dollars",
        "Workers whose wages are fully indexed to the price level"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: scen + ", and annual inflation reaches " + rate +
          "%. Who effectively pays this “inflation tax”?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Printing money transfers real resources to the government by reducing the " +
          "purchasing power of money already held by the public — so the tax falls on holders " +
          "of currency and other fixed nominal claims. The other options are backwards: " +
          "unexpected inflation HELPS nominal borrowers (they repay in cheaper dollars) and " +
          "HELPS a government with nominal debt, while indexed workers are largely protected. " +
          "This is why hyperinflations are almost always fiscal in origin."
      };
    }
  };

  /* HARD: separate the costs of EXPECTED from UNEXPECTED inflation. */
  GEN["ch12_hard_expected_vs_unexpected"] = {
    id: "ch12_hard_expected_vs_unexpected", chapter: 12, kind: "mc", render: "text",
    difficulty: "hard", concept: "costs of inflation", points: 3,
    build: function (rng) {
      var cases = [
        { t: "restaurants must reprint their menus more often",
          ans: "A cost of expected inflation", why: "Menu costs arise from changing posted prices; they occur even when the inflation is fully anticipated." },
        { t: "people make more trips to the ATM to avoid holding cash",
          ans: "A cost of expected inflation", why: "Shoeleather costs come from economizing on money holdings when the anticipated inflation rate is high." },
        { t: "a retiree living on a fixed nominal pension finds their income buys much less than planned after a surprise inflation",
          ans: "A cost of unexpected inflation", why: "Arbitrary redistribution between fixed-nominal-income recipients and payers occurs only when inflation differs from what was expected." },
        { t: "a bank that lent at a fixed nominal rate finds the loans repaid in dollars worth far less than anticipated",
          ans: "A cost of unexpected inflation", why: "The wealth transfer from creditors to debtors happens only to the extent inflation was NOT built into the nominal rate." }
      ];
      var cs = rng_pick(rng, cases);
      var pool = ["A cost of expected inflation", "A cost of unexpected inflation",
        "A benefit of inflation to society as a whole", "Not related to inflation"];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Classify the following: " + cs.t + ".",
        options: sh.options, answer: sh.correctIndex,
        rationale: cs.why + " The distinction matters for policy: steady, well-anticipated " +
          "inflation imposes menu and shoeleather costs and tax distortions, but the large " +
          "arbitrary redistributions of wealth come specifically from inflation that people " +
          "did not see coming."
      };
    }
  };

  /* HARD: a velocity change breaks the naive money-growth-equals-inflation rule. */
  GEN["ch12_hard_velocity_shock"] = {
    id: "ch12_hard_velocity_shock", chapter: 12, kind: "numeric", render: "text",
    difficulty: "hard", concept: "velocity instability", points: 3,
    build: function (rng) {
      var mGrowth = rng_pick(rng, [8, 10, 12, 15]);
      var vDrop = rng_pick(rng, [-4, -5, -6, -8]);
      var yGrowth = rng_pick(rng, [2, 3]);
      var infl = mGrowth + vDrop - yGrowth;
      return {
        prompt: "A central bank expands the money supply by " + mGrowth +
          "% during a financial crisis. Frightened households hoard money, so velocity FALLS by " +
          Math.abs(vDrop) + "%. Real output grows " + yGrowth +
          "%. What is the resulting inflation rate, in percent?",
        answer: infl, tolerance: 0.11,
        rationale: "Inflation = %ΔM + %ΔV − %ΔY = " + mGrowth + " + (" + vDrop +
          ") − " + yGrowth + " = " + infl +
          "%. A naive reading of the quantity theory would have predicted about " +
          (mGrowth - yGrowth) + "% inflation from the money growth alone. The collapse in " +
          "velocity absorbs most of the monetary expansion — which is why large " +
          "post-crisis expansions of the money supply did not produce the inflation many " +
          "forecasters expected. The quantity theory holds as an identity, but only pins down " +
          "inflation when velocity is stable."
      };
    }
  };

  /* ======================================================================
     STATIC ITEMS — fixed conceptual and written questions.
     Written items carry BOTH a prompt and a rubric; the grading function reads
     this same file, so the AI grader sees the real question and real rubric.
     ====================================================================== */
  var STATIC = [
    /* ---------------- chapter 7 ---------------- */
    {
      id: "ch7_gdp_definition", chapter: 7, kind: "mc", render: "text",
      difficulty: "easy", concept: "definition of GDP", points: 1,
      prompt: "Gross domestic product is best defined as:",
      options: [
        "the market value of all final goods and services produced within a country in a given period",
        "the total quantity of goods produced within a country in a given period",
        "the total income earned by a country's citizens, wherever they live",
        "the total value of all transactions that take place in a country in a given period"
      ],
      answer: 0,
      rationale: "Each phrase does work: MARKET VALUE (so we can add unlike goods), FINAL (to avoid double-counting), PRODUCED (not resold), WITHIN A COUNTRY (geography, not citizenship), IN A GIVEN PERIOD (a flow)."
    },
    {
      id: "ch7_income_equals_expenditure", chapter: 7, kind: "mc", render: "text",
      difficulty: "med", concept: "income = expenditure", points: 2,
      prompt: "Why must total income in an economy equal total expenditure?",
      options: [
        "Because every dollar a buyer spends is a dollar of income for some seller",
        "Because the government sets prices so that the two are equal",
        "Because saving always equals zero in the aggregate",
        "Because imports are always equal to exports"
      ],
      answer: 0,
      rationale: "A transaction has two sides. The same flow measured as spending or as receipts must give the same total, which is why the expenditure and income approaches to GDP agree in principle."
    },
    {
      id: "ch7_hard_gdp_wellbeing", chapter: 7, kind: "mc", render: "text",
      difficulty: "hard", concept: "limits of GDP", points: 3,
      prompt: "Two countries have identical real GDP per person. Which difference between them would GDP FAIL to capture, even though it plainly affects well-being?",
      options: [
        "One has far more leisure time, cleaner air, and lower crime than the other",
        "One produces more cars and fewer computers than the other",
        "One has a higher price level than the other",
        "One has a larger population than the other"
      ],
      answer: 0,
      rationale: "GDP omits leisure, environmental quality, non-market household production, and the distribution of income. The other options are all things GDP accounting DOES handle: composition is priced into market value, price levels are removed by using real GDP, and population is handled by dividing per person."
    },
    {
      id: "ch7_written_gdp_limits", chapter: 7, kind: "short", render: "text",
      difficulty: "hard", concept: "GDP as a welfare measure", points: 4,
      prompt: "Senator Robert Kennedy said that GDP “measures everything except that which makes life worthwhile.” In 4–6 sentences, evaluate this claim. Identify at least two specific things GDP genuinely fails to measure, explain one important reason GDP is nevertheless closely correlated with well-being across countries, and state your own judgment about how much weight policymakers should give it.",
      answer: null,
      rubric: "Full credit (4 pts) requires: (1) at least TWO concrete omissions correctly identified — e.g. leisure, non-market/household production, environmental quality, income distribution, informal-sector activity, health or life expectancy directly; (2) a correct statement of why GDP still tracks well-being — higher GDP per person is empirically associated with better nutrition, literacy, life expectancy, infant mortality, because it buys the inputs to those outcomes; (3) a reasoned judgment rather than a restatement of the quote — any defensible position counts if supported. Deduct 1 pt if the answer only lists omissions with no counter-argument. Deduct 1 pt if it treats GDP as simply meaningless, which the cross-country evidence contradicts. Award partial credit element by element.",
      rationale: "Looking for both sides: the genuine omissions AND the empirical correlation with health/education outcomes, plus a defended judgment."
    },

    /* ---------------- chapter 8 ---------------- */
    {
      id: "ch8_cpi_definition", chapter: 8, kind: "mc", render: "text",
      difficulty: "easy", concept: "definition of the CPI", points: 1,
      prompt: "The consumer price index measures:",
      options: [
        "the cost of a fixed basket of goods and services bought by a typical consumer, relative to a base year",
        "the average price of every good produced in the economy",
        "the total amount consumers spend each year",
        "the rate at which wages are rising"
      ],
      answer: 0,
      rationale: "Two features define it: the basket is FIXED (which is the source of substitution bias) and the number is an INDEX relative to a base year, not a dollar amount."
    },
    {
      id: "ch8_hard_who_gains_inflation", chapter: 8, kind: "mc", render: "text",
      difficulty: "hard", concept: "unexpected inflation and debt", points: 3,
      prompt: "A homeowner has a 30-year fixed-rate mortgage at 4%. Inflation over the following decade turns out to be far higher than anyone expected when the loan was signed. Who gains?",
      options: [
        "The borrower, who repays the fixed nominal amount in dollars that are worth less",
        "The lender, because the nominal payments stay the same",
        "Neither party, because the contract is fixed",
        "Both parties equally, because inflation affects everyone the same way"
      ],
      answer: 0,
      rationale: "The nominal payment is fixed, so higher-than-expected inflation lowers its REAL value. Wealth transfers from lender to borrower. Had the inflation been anticipated, the Fisher effect would have built it into the original nominal rate and no transfer would occur — which is precisely why UNEXPECTED inflation is the costly kind."
    },
    {
      id: "ch8_written_cpi_vs_deflator", chapter: 8, kind: "short", render: "text",
      difficulty: "hard", concept: "CPI vs GDP deflator", points: 4,
      prompt: "In 3–5 sentences, explain the two main ways the consumer price index differs from the GDP deflator, and give one concrete example of a price change that would move one index substantially while barely affecting the other. State which index moves in your example and why.",
      answer: null,
      rubric: "Full credit (4 pts) requires: (1) the CPI covers goods CONSUMED (including imports) while the deflator covers goods PRODUCED domestically (including capital and government goods, excluding imports); (2) the CPI uses a FIXED basket (Laspeyres) while the deflator uses the CURRENT year's mix of output, so the deflator automatically reflects substitution; (3) a valid concrete example with the correct direction — e.g. a jump in the price of imported oil or imported cars raises the CPI but not the deflator; a jump in the price of domestically produced military aircraft or industrial machinery raises the deflator but not the CPI. Award 1 pt per element, plus 1 pt for correctly naming which index moves and why. An example with the direction reversed earns no credit for element (3).",
      rationale: "Both structural differences plus a worked example with the correct direction."
    },

    /* ---------------- chapter 9 ---------------- */
    {
      id: "ch9_productivity_determinants", chapter: 9, kind: "mc", render: "text",
      difficulty: "med", concept: "determinants of productivity", points: 2,
      prompt: "Which of the following is NOT one of the standard determinants of a country's productivity?",
      options: [
        "The nominal money supply",
        "Physical capital per worker",
        "Human capital per worker",
        "Technological knowledge"
      ],
      answer: 0,
      rationale: "Productivity depends on physical capital, human capital, natural resources and technological knowledge — all real factors. The money supply is a nominal variable; in the long run it determines the price level, not output per worker."
    },
    {
      id: "ch9_hard_diminishing_returns_policy", chapter: 9, kind: "mc", render: "text",
      difficulty: "hard", concept: "diminishing returns and aid policy", points: 3,
      prompt: "A donor gives an identical amount of capital-investment aid to a very poor country and to a rich one. Diminishing returns to capital imply that:",
      options: [
        "The aid raises output per worker by more in the poor country, but the effect on its growth RATE fades as capital accumulates",
        "The aid raises output per worker by more in the rich country, because it has better infrastructure",
        "The aid permanently raises the growth rate of the poor country",
        "The aid has identical effects in both countries"
      ],
      answer: 0,
      rationale: "Where capital is scarce, the marginal product of capital is high, so the same aid buys a larger output gain — the catch-up effect. But the same diminishing returns mean the boost to the GROWTH RATE is transitional: the economy converges to a higher steady-state LEVEL, and growth then subsides. Confusing the level effect with a permanent growth effect is the most common error in this chapter."
    },
    {
      id: "ch9_written_institutions", chapter: 9, kind: "short", render: "text",
      difficulty: "hard", concept: "institutions and growth", points: 4,
      prompt: "Two countries have similar populations, similar natural resources, and similar climates, yet one has four times the GDP per person of the other. In 4–6 sentences, explain how differences in institutions — property rights, contract enforcement, political stability, and openness to trade — could produce a gap this large. Be specific about the MECHANISM connecting each institution you name to output per worker.",
      answer: null,
      rubric: "Full credit (4 pts) requires naming at least THREE institutions AND giving a causal mechanism for each, not just an assertion. Acceptable mechanisms: property rights → people invest and improve assets only if they expect to keep the returns; contract enforcement → firms transact with strangers, enabling specialization and larger markets; political stability / low expropriation risk → long-horizon investment in physical and human capital becomes rational; openness to trade → access to larger markets, imported capital goods and technology transfer; rule of law / low corruption → resources allocated by productivity rather than connections. Award 1 pt per institution-with-mechanism (max 3), plus 1 pt for connecting the argument explicitly to output per worker or productivity, e.g. via investment in capital or adoption of technology. Merely listing institutions without mechanisms earns at most 1 pt total.",
      rationale: "The mechanism is the point — listing institutions without explaining how they act on investment or technology adoption is not an answer."
    },

    /* ---------------- chapter 10 ---------------- */
    {
      id: "ch10_financial_intermediary", chapter: 10, kind: "mc", render: "text",
      difficulty: "easy", concept: "financial intermediaries", points: 1,
      prompt: "Which of the following is a financial INTERMEDIARY rather than a financial market?",
      options: ["A commercial bank", "The bond market", "The stock market", "An initial public offering"],
      answer: 0,
      rationale: "Intermediaries stand between savers and borrowers, transforming the claims (a bank takes deposits and makes loans). In a market, savers supply funds directly to borrowers."
    },
    {
      id: "ch10_hard_stock_vs_bond", chapter: 10, kind: "mc", render: "text",
      difficulty: "hard", concept: "equity vs debt claims", points: 3,
      prompt: "A firm goes bankrupt with assets insufficient to cover everything it owes. What is the position of its bondholders relative to its shareholders?",
      options: [
        "Bondholders are paid first; shareholders receive only what is left, often nothing",
        "Shareholders are paid first, because they are the owners",
        "Both are paid proportionally to the amount they invested",
        "Neither is paid; the assets go to the government"
      ],
      answer: 0,
      rationale: "A bond is a DEBT claim with legal priority; equity is a RESIDUAL claim. That priority is exactly why bonds offer a lower expected return than equity: shareholders bear the downside first and are compensated with the upside."
    },
    {
      id: "ch10_written_crowding_out", chapter: 10, kind: "short", render: "text",
      difficulty: "hard", concept: "crowding out", points: 4,
      prompt: "In 4–6 sentences, trace the mechanism by which a large increase in the government budget deficit affects the real interest rate and private investment in a closed economy. Use the market for loanable funds explicitly — say which curve shifts and in which direction — and then explain one reason this crowding-out effect might be SMALLER in practice than the simple model suggests.",
      answer: null,
      rubric: "Full credit (4 pts) requires: (1) identifying that a deficit is negative public saving, which reduces NATIONAL saving; (2) stating that the SUPPLY of loanable funds shifts LEFT (not that demand shifts right — this is the key discrimination); (3) concluding that the equilibrium real interest rate RISES and private investment FALLS, moving along the unchanged investment demand curve; (4) one valid mitigating factor — e.g. an open economy can borrow from abroad via capital inflows so the domestic rate rises less; Ricardian equivalence, where households save more in anticipation of future taxes; deficit spending during a recession with idle resources and a flat effective supply; or deficit-financed public investment that raises future productivity. Award 1 pt per element. Saying demand shifts right instead of supply shifting left loses element (2) and usually (3).",
      rationale: "The discriminating detail is SUPPLY shifting left, not demand shifting right; the mitigating factor tests whether they can reason past the base model."
    },

    /* ---------------- chapter 11 ---------------- */
    {
      id: "ch11_money_functions", chapter: 11, kind: "mc", render: "text",
      difficulty: "easy", concept: "functions of money", points: 1,
      prompt: "When a shop lists a jacket at $80, money is serving primarily as:",
      options: ["A unit of account", "A medium of exchange", "A store of value", "A commodity money"],
      answer: 0,
      rationale: "Quoting prices is the unit-of-account function. Handing over the $80 would be the medium-of-exchange function; keeping the $80 in a drawer for next year would be the store-of-value function."
    },
    {
      id: "ch11_m1_m2", chapter: 11, kind: "mc", render: "text",
      difficulty: "med", concept: "measures of the money stock", points: 2,
      prompt: "Which of the following is included in M2 but NOT in M1?",
      options: ["Savings deposits and money market mutual fund shares", "Currency in circulation", "Demand deposits", "Traveler's checks"],
      answer: 0,
      rationale: "M1 is the most liquid: currency, demand deposits and other checkable deposits. M2 adds assets that are close substitutes but require a step to spend — savings deposits, small time deposits, retail money market funds."
    },
    {
      id: "ch11_hard_fed_independence", chapter: 11, kind: "mc", render: "text",
      difficulty: "hard", concept: "central bank independence", points: 3,
      prompt: "What is the strongest economic argument for insulating a central bank from short-run political control?",
      options: [
        "A government facing an election has an incentive to inflate for a temporary output gain, and if the public anticipates this, the economy ends up with higher inflation and no extra output",
        "Politicians do not understand monetary policy",
        "Central bankers can predict the economy more accurately than elected officials",
        "An independent central bank can eliminate the business cycle"
      ],
      answer: 0,
      rationale: "This is the time-inconsistency argument. The temptation to spring surprise inflation is real, but once expectations adjust, the economy settles at higher inflation with unemployment back at its natural rate — an inflation bias with no output gain. Commitment, via independence, removes the temptation. The other options overstate what independence delivers."
    },
    {
      id: "ch11_written_bank_run", chapter: 11, kind: "short", render: "text",
      difficulty: "hard", concept: "fractional reserve banking and bank runs", points: 4,
      prompt: "In 4–6 sentences, explain why a bank that is fundamentally SOLVENT — its assets are worth more than its liabilities — can nonetheless be destroyed by a bank run. Explain what fractional-reserve banking has to do with it, and identify one institutional arrangement that reduces the risk, noting a cost or side effect of that arrangement.",
      answer: null,
      rubric: "Full credit (4 pts) requires: (1) recognizing the MATURITY MISMATCH — deposits are payable on demand while loans are long-term and illiquid, so a solvent bank can still be unable to pay everyone at once; (2) fractional reserves — only a fraction of deposits is held as reserves, the rest having been lent out, so there is no possibility of satisfying all depositors simultaneously; (3) the self-fulfilling / coordination nature of the run — it is rational to withdraw if you expect others to, so belief alone can cause the failure; (4) a named remedy WITH a cost: deposit insurance (cost: moral hazard, banks take more risk), a lender of last resort / discount window (cost: moral hazard, possible bailout expectations), suspension of convertibility or withdrawal limits (cost: depositors lose access), higher capital or liquidity requirements (cost: less lending, lower returns). Award 1 pt per element. A remedy named without any cost or side effect earns half credit for element (4).",
      rationale: "The insight is solvency vs liquidity plus the self-fulfilling coordination problem; naming a remedy without its cost is an incomplete answer."
    },

    /* ---------------- chapter 12 ---------------- */
    {
      id: "ch12_inflation_definition", chapter: 12, kind: "mc", render: "text",
      difficulty: "easy", concept: "inflation vs relative prices", points: 1,
      prompt: "Inflation is best described as:",
      options: [
        "An increase in the overall price level, equivalently a fall in the value of money",
        "An increase in the price of any important good",
        "An increase in the cost of living for poor households only",
        "An increase in the money supply"
      ],
      answer: 0,
      rationale: "Inflation concerns the general price level, not a single relative price. Framing it as a fall in the value of money makes clear why the quantity of money is central to explaining it — but money growth is the CAUSE, not the definition."
    },
    {
      id: "ch12_hard_relative_vs_general", chapter: 12, kind: "mc", render: "text",
      difficulty: "hard", concept: "relative price changes vs inflation", points: 3,
      prompt: "A commentator argues that inflation was caused by oil producers raising prices. What is the strongest economic objection to this as an explanation of SUSTAINED inflation?",
      options: [
        "A rise in one price, with the money supply unchanged, forces other prices down as spending is diverted; only ongoing money growth can raise all prices persistently",
        "Oil is not included in the consumer price index",
        "Oil prices never actually rise",
        "Relative price changes are always offset within the same month"
      ],
      answer: 0,
      rationale: "With a fixed money supply and velocity, nominal spending is fixed; more spent on oil means less spent elsewhere, so a relative price change need not raise the general level for long. Supply shocks CAN raise the price level temporarily and are genuinely painful, but sustained inflation over years is a monetary phenomenon. Note this is about the LONG run — in the short run supply shocks do move measured inflation."
    },
    {
      id: "ch12_written_hyperinflation", chapter: 12, kind: "short", render: "text",
      difficulty: "hard", concept: "hyperinflation", points: 4,
      prompt: "Hyperinflations are almost always preceded by large government budget deficits. In 4–6 sentences, explain the causal chain from a fiscal deficit to hyperinflation, explain why the process tends to ACCELERATE rather than settle at a steady high rate, and state what must change for a hyperinflation to end.",
      answer: null,
      rubric: "Full credit (4 pts) requires: (1) the fiscal link — a government unable to raise enough tax revenue or borrow (no one will lend) finances spending by creating money, i.e. seigniorage / the inflation tax; (2) money growth raises the price level, per the quantity equation; (3) the ACCELERATION mechanism — as inflation rises people economize on money holdings and velocity rises, so the real revenue from any given money growth falls, forcing the government to print faster still; expectations adjust and get built into prices, requiring ever-faster money growth for the same real revenue; (4) the resolution — hyperinflation ends only with FISCAL reform that removes the need to print (credible spending cuts, tax reform, sometimes a new currency and an independent or externally constrained central bank); a monetary announcement alone is not credible while the deficit remains. Award 1 pt per element. Element (3) is the discriminating one — answers that stop at 'printing money causes inflation' earn at most 2 pts.",
      rationale: "The acceleration mechanism (velocity rising, real seigniorage falling) and the fiscal nature of the cure are what separate a strong answer from a memorized one."
    }
  ];

  /* ---- public API ------------------------------------------------------- */

  function generate(genId, seed, cfg) {
    var g = GEN[genId];
    if (g) {
      var rng = mulberry32((seed >>> 0) || 1);
      var built = g.build(rng, cfg || {});
      built.id = genId;
      built.kind = g.kind;
      built.render = g.render;
      built.chapter = g.chapter;
      built.difficulty = g.difficulty;
      built.concept = g.concept;
      built.points = g.points;
      built.seed = (seed >>> 0);
      return built;
    }
    for (var i = 0; i < STATIC.length; i++) {
      if (STATIC[i].id === genId) {
        var s = {};
        for (var k in STATIC[i]) { if (STATIC[i].hasOwnProperty(k)) { s[k] = STATIC[i][k]; } }
        s.seed = null;
        return s;
      }
    }
    return null;
  }

  /* Grade a submission. Returns {correct, points, expected} or {needsAI:true}.
     Numeric submissions are normalized first so formatting never costs a mark:
     "32,000", "$32,000", "32 000", "32000.0" all match 32000. */
  function grade(genId, seed, submitted, cfg) {
    var q = generate(genId, seed, cfg);
    if (!q) { return { error: "unknown item" }; }
    if (q.kind === "short") { return { needsAI: true, points: q.points }; }
    if (q.kind === "mc") {
      var pickIdx = parseInt(submitted, 10);
      var ok = (pickIdx === q.answer);
      return { correct: ok, points: ok ? q.points : 0, expected: q.answer };
    }
    var cleaned = String(submitted == null ? "" : submitted).replace(/[,\s$%]/g, "");
    var val = parseFloat(cleaned);
    var tol = (typeof q.tolerance === "number") ? q.tolerance : 0.01;
    var good = !isNaN(val) && Math.abs(val - q.answer) <= tol;
    return { correct: good, points: good ? q.points : 0, expected: q.answer };
  }

  function listGenerators() {
    var out = [];
    for (var k in GEN) {
      if (GEN.hasOwnProperty(k)) {
        out.push({ id: k, chapter: GEN[k].chapter, kind: GEN[k].kind,
          render: GEN[k].render, difficulty: GEN[k].difficulty });
      }
    }
    STATIC.forEach(function (s) {
      out.push({ id: s.id, chapter: s.chapter, kind: s.kind, render: s.render,
        difficulty: s.difficulty, static: true });
    });
    return out;
  }

  /* Per-chapter banks, used by the quiz engine when no DB bank is loaded. */
  function bankFor(chapter) {
    var out = [];
    listGenerators().forEach(function (it) { if (it.chapter === chapter) { out.push(it.id); } });
    return out;
  }

  /* ---- extension packs --------------------------------------------------
     Chapter banks are split across files (this one carries the engine plus
     chapters 7-12; ma-generators-b.js carries 13-18 and ma-generators-c.js
     carries 1-6). A pack calls MAGenerators.register(genMap, staticArr) and its
     items become indistinguishable from the ones defined here — same generate,
     grade and list. Packs receive the shared helpers through MAGenerators.util
     so every chapter draws numbers from the SAME seeded PRNG implementation.
     Registering an id that already exists is refused rather than silently
     overwriting: a duplicate id would make one of the two items unreachable and
     could regrade old attempts against different math. */
  function register(genMap, staticArr) {
    var conflicts = [];
    if (genMap) {
      for (var k in genMap) {
        if (genMap.hasOwnProperty(k)) {
          if (GEN[k] || findStatic(k)) { conflicts.push(k); } else { GEN[k] = genMap[k]; }
        }
      }
    }
    if (staticArr) {
      for (var i = 0; i < staticArr.length; i++) {
        var it = staticArr[i];
        if (GEN[it.id] || findStatic(it.id)) { conflicts.push(it.id); } else { STATIC.push(it); }
      }
    }
    if (conflicts.length) {
      try { console.error("MAGenerators.register: duplicate item id(s) ignored: " + conflicts.join(", ")); } catch (e) {}
    }
    return { registered: true, conflicts: conflicts };
  }
  function findStatic(id) {
    for (var i = 0; i < STATIC.length; i++) { if (STATIC[i].id === id) { return STATIC[i]; } }
    return null;
  }

  var API = { generate: generate, grade: grade, list: listGenerators, bankFor: bankFor,
    register: register,
    util: { rng_int: rng_int, rng_pick: rng_pick, round1: round1, round2: round2,
            money: money, shuffleWithAnswer: shuffleWithAnswer } };
  global.MAGenerators = API;
  if (typeof module !== "undefined" && module.exports) { module.exports = API; }
})(typeof globalThis !== "undefined" ? globalThis : this);
