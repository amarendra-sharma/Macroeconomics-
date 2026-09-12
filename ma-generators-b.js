/* ============================================================================
   ma-generators-b.js  —  Applied Macroeconomics question bank, CHAPTERS 13-18.

   Loads AFTER ma-generators.js and registers into the same engine, so these
   items behave identically to the chapter 7-12 ones for generate/grade/list.

     13 Open-Economy Macroeconomics
     14 Unemployment
     15 Aggregate Demand & Aggregate Supply
     16 The IS-LM Model
     17 Monetary Policy
     18 Fiscal Policy

   Difficulty is deliberately weighted toward 'hard'. The hard items are built
   around specific mistakes students make, not merely heavier arithmetic: the
   distractors are the wrong answers people actually give.

   Safari-safe plain JS. Deterministic: every number comes from the seeded rng
   handed to build(), never Math.random.
   ============================================================================ */
(function (global) {
  "use strict";

  var MA = global.MAGenerators;
  if (!MA || !MA.register) {
    try { console.error("ma-generators-b.js: load ma-generators.js first."); } catch (e) {}
    return;
  }
  var U = MA.util;
  var ri = U.rng_int, pick = U.rng_pick, round1 = U.round1, round2 = U.round2;
  var money = U.money, shuffleWithAnswer = U.shuffleWithAnswer;

  var G = {};

  /* ======================================================================
     CHAPTER 13 — OPEN-ECONOMY MACROECONOMICS
     ====================================================================== */

  G["ch13_trade_balance"] = {
    id: "ch13_trade_balance", chapter: 13, kind: "numeric", render: "text",
    difficulty: "easy", concept: "trade balance", points: 1,
    build: function (rng) {
      var X = ri(rng, 200, 600), M = ri(rng, 200, 700);
      return {
        prompt: "A country exports " + money(X) + " billion and imports " + money(M) +
          " billion of goods and services. What is its trade balance (net exports), in billions? " +
          "(Negative for a deficit.)",
        answer: X - M, tolerance: 0.01,
        rationale: "NX = X − M = " + X + " − " + M + " = " + (X - M) + ". " +
          (X - M < 0 ? "Imports exceed exports, so this is a trade deficit." :
                       "Exports exceed imports, so this is a trade surplus.")
      };
    }
  };

  G["ch13_nominal_exchange"] = {
    id: "ch13_nominal_exchange", chapter: 13, kind: "numeric", render: "text",
    difficulty: "easy", concept: "nominal exchange rate", points: 1,
    build: function (rng) {
      var rate = pick(rng, [90, 100, 110, 120, 125, 140]);
      var dollars = ri(rng, 2, 9) * 100;
      return {
        prompt: "The nominal exchange rate is " + rate +
          " Japanese yen per U.S. dollar. How many yen will " + money(dollars) + " buy?",
        answer: rate * dollars, tolerance: 1,
        rationale: dollars + " dollars × " + rate + " yen per dollar = " +
          (rate * dollars).toLocaleString("en-US") + " yen. Always check the units of the " +
          "quoted rate: the same market can be quoted as yen-per-dollar or dollars-per-yen, " +
          "and they are reciprocals."
      };
    }
  };

  G["ch13_real_exchange_rate"] = {
    id: "ch13_real_exchange_rate", chapter: 13, kind: "numeric", render: "text",
    difficulty: "hard", concept: "real exchange rate", points: 3,
    build: function (rng) {
      var e = pick(rng, [0.8, 1.2, 1.25, 1.5, 2]);       /* foreign currency per dollar */
      var pDom = ri(rng, 10, 40);                         /* dollars, domestic good */
      var pFor = ri(rng, 10, 60);                         /* foreign currency, foreign good */
      var real = round2(e * pDom / pFor);
      return {
        prompt: "A basket of goods costs " + money(pDom) +
          " in the United States and " + pFor + " units of foreign currency abroad. " +
          "The nominal exchange rate is " + e +
          " units of foreign currency per dollar. What is the real exchange rate, expressed as " +
          "foreign baskets per U.S. basket? (Two decimal places.)",
        answer: real, tolerance: 0.02,
        rationale: "Real exchange rate = e × P_domestic / P_foreign = " + e + " × " + pDom +
          " / " + pFor + " = " + real + ". This says one U.S. basket trades for " + real +
          " foreign baskets. A value above 1 means U.S. goods are expensive relative to " +
          "foreign goods, which discourages exports. Note the nominal rate alone cannot tell " +
          "you this — the price levels matter just as much."
      };
    }
  };

  G["ch13_ppp_implied_rate"] = {
    id: "ch13_ppp_implied_rate", chapter: 13, kind: "numeric", render: "text",
    difficulty: "hard", concept: "purchasing power parity", points: 3,
    build: function (rng) {
      var items = ["a identical burger", "a standard basket of groceries", "the same cup of coffee"];
      var it = pick(rng, items);
      var pUS = pick(rng, [4, 5, 6, 8]);
      var mult = pick(rng, [3, 4, 5, 6, 10]);
      var pFor = pUS * mult;
      return {
        prompt: "According to purchasing power parity, " + it + " should cost the same everywhere " +
          "once converted to a common currency. It costs " + money(pUS) +
          " in the United States and " + pFor +
          " units of foreign currency abroad. What exchange rate, in units of foreign currency " +
          "per dollar, does PPP imply?",
        answer: mult, tolerance: 0.02,
        rationale: "PPP implied rate = foreign price / domestic price = " + pFor + "/" + pUS +
          " = " + mult + " units per dollar. If the market rate is ABOVE " + mult +
          ", the foreign currency is undervalued relative to PPP (goods there are cheap for a " +
          "dollar-holder); if BELOW, it is overvalued."
      };
    }
  };

  G["ch13_hard_ppp_over_under"] = {
    id: "ch13_hard_ppp_over_under", chapter: 13, kind: "mc", render: "text",
    difficulty: "hard", concept: "over/undervaluation vs PPP", points: 3,
    build: function (rng) {
      var pUS = pick(rng, [5, 6, 8]);
      var mult = pick(rng, [4, 5, 6]);
      var pFor = pUS * mult;
      var over = rng() < 0.5;
      var market = over ? mult - pick(rng, [1, 2]) : mult + pick(rng, [1, 2]);
      var pool = [
        "The foreign currency is OVERvalued relative to PPP — the identical good costs more than a dollar's worth abroad",
        "The foreign currency is UNDERvalued relative to PPP — the identical good is cheaper for a dollar-holder abroad",
        "The two currencies are exactly at their PPP rate",
        "PPP cannot be assessed without knowing each country's interest rate"
      ];
      var sh = shuffleWithAnswer(rng, pool, over ? 0 : 1);
      return {
        prompt: "An identical good costs " + money(pUS) + " in the United States and " + pFor +
          " units of foreign currency abroad, so PPP implies " + mult +
          " units per dollar. The actual market exchange rate is " + market +
          " units per dollar. What does this say about the foreign currency?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "At the market rate, " + money(pUS) + " converts to " + (pUS * market) +
          " units of foreign currency, while the good costs " + pFor + " units there. " +
          (over ?
            "Your dollars buy FEWER units than PPP implies, so the good costs more abroad — the foreign currency is overvalued." :
            "Your dollars buy MORE units than PPP implies, so the good is cheaper abroad — the foreign currency is undervalued.") +
          " Interest rates are irrelevant to a PPP comparison, which is about goods prices."
      };
    }
  };

  G["ch13_saving_investment_nco"] = {
    id: "ch13_saving_investment_nco", chapter: 13, kind: "numeric", render: "text",
    difficulty: "hard", concept: "S = I + NCO", points: 3,
    build: function (rng) {
      var S = ri(rng, 15, 30) * 100;
      var I = ri(rng, 10, 35) * 100;
      return {
        prompt: "In an open economy, national saving is " + money(S) +
          " billion and domestic investment is " + money(I) +
          " billion. What is net capital outflow, in billions? (Negative if capital flows IN.)",
        answer: S - I, tolerance: 0.01,
        rationale: "S = I + NCO, so NCO = S − I = " + S + " − " + I + " = " + (S - I) +
          " billion. " + (S - I < 0 ?
            "Investment exceeds domestic saving, so the shortfall is financed by a capital INFLOW — and since NCO = NX, this economy also runs a trade deficit." :
            "Saving exceeds domestic investment, so the surplus is lent abroad — and since NCO = NX, this economy also runs a trade surplus.")
      };
    }
  };

  G["ch13_hard_trade_deficit_capital"] = {
    id: "ch13_hard_trade_deficit_capital", chapter: 13, kind: "mc", render: "text",
    difficulty: "hard", concept: "NX = NCO identity", points: 3,
    build: function (rng) {
      var def = ri(rng, 3, 9) * 100;
      var pool = [
        "It must be receiving a net capital INFLOW of the same size — foreigners are acquiring its assets",
        "It must be sending a net capital OUTFLOW of the same size",
        "Its national saving must equal its domestic investment",
        "Its currency must be depreciating"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "A country runs a trade deficit of " + money(def) +
          " billion this year. What must ALSO be true, as a matter of accounting?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "NX = NCO is an identity, not a theory. A trade deficit of " + def +
          " billion means NX = −" + def + ", so NCO = −" + def +
          " billion: foreigners acquire " + money(def) +
          " billion more of this country's assets than it acquires of theirs. The dollars " +
          "foreigners earn selling goods must come back as purchases of assets. Note this says " +
          "nothing on its own about whether the currency appreciates or depreciates — " +
          "the identity holds at any exchange rate."
      };
    }
  };

  G["ch13_fx_shift"] = {
    id: "ch13_fx_shift", chapter: 13, kind: "mc", render: "graphical",
    difficulty: "med", concept: "exchange rate determination", points: 2,
    build: function (rng) {
      var dB = pick(rng, [1, 2]), sB = pick(rng, [1, 2]);
      var qStar = ri(rng, 4, 7), sA = ri(rng, 1, 3);
      var eStar = sA + sB * qStar, dA = eStar + dB * qStar;
      var inflow = rng() < 0.5;
      var by = inflow ? ri(rng, 2, 4) : -ri(rng, 2, 4);
      var pool = [
        "The dollar APPRECIATES — the exchange rate rises",
        "The dollar DEPRECIATES — the exchange rate falls",
        "The exchange rate is unchanged",
        "The effect on the exchange rate cannot be determined"
      ];
      var sh = shuffleWithAnswer(rng, pool, inflow ? 0 : 1);
      return {
        prompt: (inflow ?
          "Foreign investors become more eager to buy U.S. assets, increasing demand for dollars."
          : "Foreign investors pull money out of U.S. assets, reducing demand for dollars.") +
          " In the market for dollars shown, what happens to the exchange rate?",
        diagramSpec: { type: "fx_market", dA: dA, dB: dB, sA: sA, sB: sB,
          shift: { curve: "D", by: by }, currency: "dollars",
          xmax: Math.max(10, qStar + 4), ymax: Math.max(12, eStar + 5), hideValues: true },
        options: sh.options, answer: sh.correctIndex,
        rationale: (inflow ?
          "Greater demand for dollars shifts the demand curve RIGHT; the dollar buys more foreign currency, i.e. it appreciates." :
          "Weaker demand for dollars shifts the demand curve LEFT; the dollar buys less foreign currency, i.e. it depreciates.") +
          " An appreciation makes U.S. exports more expensive abroad and imports cheaper, so it " +
          "tends to reduce net exports."
      };
    }
  };

  G["ch13_hard_capital_flight"] = {
    id: "ch13_hard_capital_flight", chapter: 13, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "capital flight", points: 3,
    build: function (rng) {
      var dB = pick(rng, [1, 2]), sB = pick(rng, [1, 2]);
      var qStar = ri(rng, 4, 7), sA = ri(rng, 1, 3);
      var eStar = sA + sB * qStar, dA = eStar + dB * qStar;
      var pool = [
        "The currency depreciates, the domestic real interest rate rises, and net exports rise",
        "The currency appreciates, the domestic real interest rate falls, and net exports fall",
        "The currency depreciates, the domestic real interest rate falls, and net exports fall",
        "Nothing changes, because capital flight only affects the country receiving the funds"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Political turmoil causes investors worldwide to suddenly dump this country's " +
          "assets — a capital flight. What happens to its currency, its real interest rate, and " +
          "its net exports?",
        diagramSpec: { type: "fx_market", dA: dA, dB: dB, sA: sA, sB: sB,
          shift: { curve: "D", by: -ri(rng, 3, 4) }, currency: "the local currency",
          xmax: Math.max(10, qStar + 4), ymax: Math.max(12, eStar + 5), hideValues: true },
        options: sh.options, answer: sh.correctIndex,
        rationale: "Capital flight raises net capital outflow at every interest rate. In the " +
          "loanable-funds market the supply of funds available domestically falls, so the real " +
          "interest rate RISES. In the currency market, demand for the local currency falls, so " +
          "it DEPRECIATES. The cheaper currency makes exports more competitive, so net exports " +
          "RISE — which is the counterpart of the capital leaving. The painful combination is " +
          "the higher interest rate hitting domestic investment at the same time."
      };
    }
  };

  G["ch13_hard_tariff_nx"] = {
    id: "ch13_hard_tariff_nx", chapter: 13, kind: "mc", render: "text",
    difficulty: "hard", concept: "trade policy and the trade balance", points: 3,
    build: function (rng) {
      var good = pick(rng, ["steel", "automobiles", "textiles", "semiconductors"]);
      var pool = [
        "Net exports are essentially unchanged, because the tariff does not alter national saving or domestic investment",
        "Net exports rise permanently by the value of the imports blocked",
        "Net exports fall, because other countries always retaliate",
        "Net exports rise, because imports fall and exports are unaffected"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "A country imposes a steep tariff on imported " + good +
          ". According to the open-economy macro model, what happens to its overall TRADE BALANCE " +
          "in the long run?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "NX = NCO = S − I. A tariff changes neither national saving nor domestic " +
          "investment, so it cannot change the trade balance. What happens instead: reduced " +
          "import demand raises demand for the currency, the currency appreciates, and exports " +
          "fall by roughly as much as imports did. The COMPOSITION of trade changes — less " +
          good + " imported, fewer exports sold — while the BALANCE does not. This is the most " +
          "counterintuitive result in the chapter and the one most often gotten wrong."
      };
    }
  };

  G["ch13_hard_twin_deficits"] = {
    id: "ch13_hard_twin_deficits", chapter: 13, kind: "mc", render: "text",
    difficulty: "hard", concept: "twin deficits", points: 3,
    build: function (rng) {
      var amt = ri(rng, 2, 8) * 100;
      var pool = [
        "National saving falls, net capital outflow falls, the currency appreciates, and the trade deficit widens",
        "National saving falls, the currency depreciates, and the trade deficit narrows",
        "National saving is unaffected because government borrowing is offset by private borrowing",
        "The trade balance improves, because government spending is domestic"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "A government increases its budget deficit by " + money(amt) +
          " billion, with no change in private saving behaviour. Trace the effect through an " +
          "open economy: what happens to national saving, net capital outflow, the currency, and " +
          "the trade balance?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "The budget deficit is public dissaving, so national saving S falls. From " +
          "S = I + NCO, with the higher real interest rate reducing NCO, net capital outflow " +
          "falls — foreigners buy more domestic assets. That raises demand for the currency, " +
          "which APPRECIATES, making exports dearer and imports cheaper, so NX falls. Budget " +
          "deficit and trade deficit move together: the twin-deficits result. (Option 3 is " +
          "Ricardian equivalence, which is explicitly ruled out by the stated assumption.)"
      };
    }
  };

  /* ======================================================================
     CHAPTER 14 — UNEMPLOYMENT
     ====================================================================== */

  G["ch14_unemployment_rate"] = {
    id: "ch14_unemployment_rate", chapter: 14, kind: "numeric", render: "text",
    difficulty: "easy", concept: "unemployment rate", points: 1,
    build: function (rng) {
      var emp = ri(rng, 120, 160);
      var unemp = ri(rng, 5, 14);
      var rate = round1(100 * unemp / (emp + unemp));
      return {
        prompt: "An economy has " + emp + " million employed and " + unemp +
          " million unemployed. What is the unemployment rate, in percent? (One decimal place.)",
        answer: rate, tolerance: 0.06,
        rationale: "Labour force = employed + unemployed = " + (emp + unemp) +
          " million. Unemployment rate = 100 × " + unemp + "/" + (emp + unemp) + " ≈ " + rate +
          "%. The denominator is the LABOUR FORCE, not the population — people out of the " +
          "labour force are excluded entirely."
      };
    }
  };

  G["ch14_participation_rate"] = {
    id: "ch14_participation_rate", chapter: 14, kind: "numeric", render: "text",
    difficulty: "med", concept: "labour force participation", points: 2,
    build: function (rng) {
      var emp = ri(rng, 120, 160);
      var unemp = ri(rng, 6, 14);
      var nilf = ri(rng, 70, 100);
      var adult = emp + unemp + nilf;
      var lfpr = round1(100 * (emp + unemp) / adult);
      return {
        prompt: "An economy has " + emp + " million employed, " + unemp + " million unemployed, and " +
          nilf + " million adults not in the labour force. What is the labour-force " +
          "participation rate, in percent? (One decimal place.)",
        answer: lfpr, tolerance: 0.06,
        rationale: "Adult population = " + adult + " million; labour force = " + (emp + unemp) +
          " million. LFPR = 100 × " + (emp + unemp) + "/" + adult + " ≈ " + lfpr + "%."
      };
    }
  };

  G["ch14_employment_pop_ratio"] = {
    id: "ch14_employment_pop_ratio", chapter: 14, kind: "numeric", render: "text",
    difficulty: "med", concept: "employment-population ratio", points: 2,
    build: function (rng) {
      var emp = ri(rng, 120, 160);
      var unemp = ri(rng, 6, 14);
      var nilf = ri(rng, 70, 100);
      var adult = emp + unemp + nilf;
      var epr = round1(100 * emp / adult);
      return {
        prompt: "With " + emp + " million employed, " + unemp + " million unemployed and " + nilf +
          " million adults not in the labour force, what is the employment-population ratio, " +
          "in percent? (One decimal place.)",
        answer: epr, tolerance: 0.06,
        rationale: "E/P = 100 × employed / adult population = 100 × " + emp + "/" + adult +
          " ≈ " + epr + "%. This ratio is often more informative than the unemployment rate " +
          "because it does not depend on the sometimes-arbitrary line between 'unemployed' and " +
          "'not in the labour force'."
      };
    }
  };

  /* HARD: the discouraged-worker effect makes the unemployment rate FALL when
     things get worse. This is the single most counterintuitive measurement
     result in the chapter. */
  G["ch14_hard_discouraged_worker"] = {
    id: "ch14_hard_discouraged_worker", chapter: 14, kind: "numeric", render: "text",
    difficulty: "hard", concept: "discouraged workers", points: 3,
    build: function (rng) {
      var emp = ri(rng, 120, 150);
      var unemp = ri(rng, 10, 16);
      var quit = ri(rng, 2, 5);
      var newRate = round1(100 * (unemp - quit) / (emp + unemp - quit));
      return {
        prompt: "An economy starts with " + emp + " million employed and " + unemp +
          " million unemployed. During a deep recession, " + quit +
          " million of the unemployed give up looking for work entirely and are reclassified as " +
          "not in the labour force. Employment does not change. What is the NEW measured " +
          "unemployment rate, in percent? (One decimal place.)",
        answer: newRate, tolerance: 0.06,
        rationale: "The new labour force is " + emp + " + " + (unemp - quit) + " = " +
          (emp + unemp - quit) + " million, with " + (unemp - quit) +
          " million unemployed, so the rate is " + newRate + "% — DOWN from " +
          round1(100 * unemp / (emp + unemp)) +
          "%. The measured unemployment rate fell even though not one additional person found a " +
          "job and conditions got worse. Discouraged workers leave the numerator AND the " +
          "denominator, which is exactly why the employment-population ratio and the " +
          "participation rate are watched alongside it."
      };
    }
  };

  G["ch14_hard_labor_force_math"] = {
    id: "ch14_hard_labor_force_math", chapter: 14, kind: "numeric", render: "text",
    difficulty: "hard", concept: "reverse-engineering the labour force", points: 3,
    build: function (rng) {
      var lf = ri(rng, 100, 180);
      var rate = pick(rng, [4, 5, 6, 8]);
      var unemp = lf * rate / 100;
      return {
        prompt: "A country's labour force is " + lf +
          " million and its unemployment rate is " + rate +
          "%. How many million people are EMPLOYED? (One decimal place.)",
        answer: round1(lf - unemp), tolerance: 0.15,
        rationale: "Unemployed = " + rate + "% of " + lf + " million = " + round1(unemp) +
          " million. Employed = labour force − unemployed = " + lf + " − " + round1(unemp) +
          " = " + round1(lf - unemp) + " million. The unemployment rate is a share of the " +
          "LABOUR FORCE, so the labour force is the base you apply it to."
      };
    }
  };

  G["ch14_hard_classify_unemployment"] = {
    id: "ch14_hard_classify_unemployment", chapter: 14, kind: "mc", render: "text",
    difficulty: "hard", concept: "frictional vs structural vs cyclical", points: 3,
    build: function (rng) {
      var cases = [
        { t: "a software engineer quits one firm and spends six weeks choosing among several offers",
          ans: "Frictional — normal search and matching in a healthy labour market",
          why: "Job search takes time even when there are plenty of suitable vacancies. This kind of unemployment is not only unavoidable but often productive: better matches raise output." },
        { t: "coal miners in a declining region cannot find work because the jobs available nearby require skills they do not have",
          ans: "Structural — a lasting mismatch between workers' skills or location and available jobs",
          why: "The vacancies exist but not for these workers, in this place, with these skills. Retraining and mobility, not more spending, are the relevant remedies." },
        { t: "a general recession causes firms across every industry to lay off workers at once",
          ans: "Cyclical — a shortfall of aggregate demand relative to potential output",
          why: "Cyclical unemployment moves with the business cycle and is the component macroeconomic stabilization policy targets." },
        { t: "a binding minimum wage set above the market-clearing wage leaves more people wanting jobs at that wage than firms want to hire",
          ans: "Structural — the wage is held above the level that would clear the market",
          why: "Wage rigidity — from minimum wages, unions, or efficiency wages — creates a persistent surplus of labour, which is structural rather than cyclical." },
        { t: "a recent graduate spends three months looking for a first job in a strong economy",
          ans: "Frictional — normal search and matching in a healthy labour market",
          why: "Entering the labour force involves search, and search takes time. It is not evidence of weak demand." }
      ];
      var cs = pick(rng, cases);
      var pool = [
        "Frictional — normal search and matching in a healthy labour market",
        "Structural — a lasting mismatch between workers' skills or location and available jobs",
        "Cyclical — a shortfall of aggregate demand relative to potential output",
        "Structural — the wage is held above the level that would clear the market"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Classify the unemployment in this case: " + cs.t + ".",
        options: sh.options, answer: sh.correctIndex,
        rationale: cs.why + " The classification matters because each type calls for a " +
          "different policy — and only the cyclical component disappears when the economy returns " +
          "to potential."
      };
    }
  };

  G["ch14_min_wage_graph"] = {
    id: "ch14_min_wage_graph", chapter: 14, kind: "numeric", render: "graphical",
    difficulty: "hard", concept: "surplus labour from a wage floor", points: 3,
    build: function (rng) {
      var b = pick(rng, [1, 2]), d = pick(rng, [1, 2]);
      var lStar = ri(rng, 4, 7), c = ri(rng, 1, 3);
      var wStar = c + d * lStar, a = wStar + b * lStar;
      var floor = wStar + ri(rng, 1, 3);
      var ld = (a - floor) / b, ls = (floor - c) / d;
      return {
        prompt: "In a labour market, demand is W = " + a + " − " + b +
          "L and supply is W = " + c + " + " + d +
          "L, where L is millions of workers. The government sets a minimum wage of " + floor +
          ". How many million workers are unemployed as a result? (One decimal place.)",
        diagramSpec: { type: "supply_demand", dA: a, dB: -b, sA: c, sB: d,
          xmax: Math.max(10, lStar + 4), ymax: Math.max(12, a + 1),
          xlab: "Labour (millions)", ylab: "Wage", hideValues: true },
        answer: round1(ls - ld), tolerance: 0.12,
        rationale: "At W = " + floor + ": quantity demanded is L = (" + a + " − " + floor +
          ")/" + b + " = " + round2(ld) + " million, quantity supplied is L = (" + floor +
          " − " + c + ")/" + d + " = " + round2(ls) + " million. The surplus of labour is " +
          round2(ls) + " − " + round2(ld) + " = " + round1(ls - ld) +
          " million. Note this counts BOTH workers who lost jobs and workers newly attracted " +
          "into the market by the higher wage."
      };
    }
  };

  G["ch14_hard_wage_rigidity_source"] = {
    id: "ch14_hard_wage_rigidity_source", chapter: 14, kind: "mc", render: "text",
    difficulty: "hard", concept: "sources of wage rigidity", points: 3,
    build: function (rng) {
      var cases = [
        { t: "a firm deliberately pays above the going rate so that workers value the job enough not to shirk, and quit rates fall",
          ans: "Efficiency wages", why: "The firm chooses the high wage because productivity depends on it — no law or union is involved, yet the wage stays above market-clearing." },
        { t: "a collective bargaining agreement fixes wages for three years, and insiders have little incentive to protect outsiders' job prospects",
          ans: "Unions and collective bargaining", why: "Bargaining power raises the negotiated wage above the competitive level; the insider-outsider dynamic keeps it there." },
        { t: "a legal wage floor makes it illegal to hire low-skilled workers below a set hourly rate",
          ans: "Minimum-wage laws", why: "A binding legal floor is the most direct source of rigidity, but it binds mainly for low-skill workers, which is why it explains only a small share of total unemployment." },
        { t: "a firm keeps wages high to reduce costly turnover and to attract a stronger applicant pool",
          ans: "Efficiency wages", why: "Reduced turnover and better applicant quality are two of the standard efficiency-wage mechanisms, alongside effort and health." }
      ];
      var cs = pick(rng, cases);
      var pool = ["Efficiency wages", "Unions and collective bargaining",
        "Minimum-wage laws", "Frictional search costs"];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Which source of wage rigidity does this describe? " + cs.t + ".",
        options: sh.options, answer: sh.correctIndex,
        rationale: cs.why + " All three rigidity stories share a structure: the wage sits ABOVE " +
          "the market-clearing level, so the quantity of labour supplied exceeds the quantity " +
          "demanded and the gap persists. Search costs are a different mechanism — they cause " +
          "frictional unemployment even when wages DO clear the market."
      };
    }
  };

  G["ch14_hard_ui_tradeoff"] = {
    id: "ch14_hard_ui_tradeoff", chapter: 14, kind: "mc", render: "text",
    difficulty: "hard", concept: "unemployment insurance", points: 3,
    build: function (rng) {
      var pool = [
        "It raises measured unemployment by lengthening search, but the longer search can produce better job matches and it insures workers against a risk they cannot diversify",
        "It reduces measured unemployment because recipients must prove they are searching",
        "It has no effect on search behaviour, since benefits are always below the previous wage",
        "It eliminates frictional unemployment entirely"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "What is the most complete economic assessment of unemployment insurance?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "The incentive effect is real: reducing the cost of remaining unemployed " +
          "lengthens search, and studies find exit from unemployment spikes right as benefits " +
          "expire. But an honest assessment does not stop there. Longer search can yield a " +
          "better match — raising later productivity and wages — and UI provides insurance " +
          "against job loss, a risk private markets do not cover well. The policy question is " +
          "the level and duration that balances these, not whether one effect exists."
      };
    }
  };

  /* ======================================================================
     CHAPTER 15 — AGGREGATE DEMAND AND AGGREGATE SUPPLY
     ====================================================================== */

  G["ch15_adas_equilibrium"] = {
    id: "ch15_adas_equilibrium", chapter: 15, kind: "numeric", render: "graphical",
    difficulty: "med", concept: "short-run equilibrium", points: 2,
    build: function (rng) {
      var adB = pick(rng, [1, 2]), srB = pick(rng, [1, 2]);
      var yStar = ri(rng, 4, 8), srA = ri(rng, 1, 3);
      var pStar = srA + srB * yStar, adA = pStar + adB * yStar;
      var askP = rng() < 0.5;
      return {
        prompt: "Aggregate demand is P = " + adA + " − " + adB +
          "Y and short-run aggregate supply is P = " + srA + " + " + srB +
          "Y. What is the short-run equilibrium " + (askP ? "price level?" : "level of output?"),
        diagramSpec: { type: "ad_as", adA: adA, adB: adB, srA: srA, srB: srB,
          yn: yStar, xmax: Math.max(12, yStar + 4), ymax: Math.max(14, pStar + 4),
          hideValues: true },
        answer: askP ? pStar : yStar, tolerance: 0.01,
        rationale: "Set " + adA + " − " + adB + "Y = " + srA + " + " + srB + "Y → Y = " +
          yStar + ", P = " + pStar + "."
      };
    }
  };

  G["ch15_output_gap"] = {
    id: "ch15_output_gap", chapter: 15, kind: "numeric", render: "graphical",
    difficulty: "hard", concept: "output gap", points: 3,
    build: function (rng) {
      var adB = pick(rng, [1, 2]), srB = pick(rng, [1, 2]);
      var yStar = ri(rng, 4, 8), srA = ri(rng, 1, 3);
      var pStar = srA + srB * yStar, adA = pStar + adB * yStar;
      var gap = pick(rng, [-2, -1, 1, 2]);
      var yn = yStar + gap;       /* potential differs from short-run equilibrium */
      return {
        prompt: "Short-run equilibrium output is where AD (P = " + adA + " − " + adB +
          "Y) meets SRAS (P = " + srA + " + " + srB + "Y). Potential output is Y* = " + yn +
          ". What is the output gap (actual minus potential)? (Negative for a recessionary gap.)",
        diagramSpec: { type: "ad_as", adA: adA, adB: adB, srA: srA, srB: srB, yn: yn,
          showGap: true, xmax: Math.max(12, Math.max(yStar, yn) + 4),
          ymax: Math.max(14, pStar + 4), hideValues: true },
        answer: yStar - yn, tolerance: 0.01,
        rationale: "Short-run equilibrium output is Y = " + yStar + ", and potential is " + yn +
          ", so the gap is " + yStar + " − " + yn + " = " + (yStar - yn) + ". " +
          (yStar - yn < 0 ?
            "A negative gap is a RECESSIONARY gap: output below potential, unemployment above its natural rate." :
            "A positive gap is an INFLATIONARY gap: output above potential, unemployment below its natural rate, which puts upward pressure on wages and prices.")
      };
    }
  };

  G["ch15_ad_shift"] = {
    id: "ch15_ad_shift", chapter: 15, kind: "mc", render: "graphical",
    difficulty: "med", concept: "aggregate demand shifts", points: 2,
    build: function (rng) {
      var shocks = [
        { t: "a stock market boom makes households feel wealthier", dir: 1 },
        { t: "the government sharply increases infrastructure spending", dir: 1 },
        { t: "the central bank cuts interest rates", dir: 1 },
        { t: "a collapse in consumer confidence causes households to cut spending", dir: -1 },
        { t: "a major trading partner enters a deep recession, cutting demand for exports", dir: -1 },
        { t: "firms become pessimistic about future profits and cancel investment projects", dir: -1 }
      ];
      var s = pick(rng, shocks);
      var adB = pick(rng, [1, 2]), srB = pick(rng, [1, 2]);
      var yStar = ri(rng, 5, 7), srA = ri(rng, 1, 3);
      var pStar = srA + srB * yStar, adA = pStar + adB * yStar;
      var pool = [
        "AD shifts right: output rises and the price level rises",
        "AD shifts left: output falls and the price level falls",
        "SRAS shifts right: output rises and the price level falls",
        "SRAS shifts left: output falls and the price level rises"
      ];
      var sh = shuffleWithAnswer(rng, pool, s.dir > 0 ? 0 : 1);
      return {
        prompt: "In the short run, " + s.t +
          ". Which curve shifts, and what happens to output and the price level?",
        diagramSpec: { type: "ad_as", adA: adA, adB: adB, srA: srA, srB: srB, yn: yStar,
          shift: { curve: "AD", by: s.dir * ri(rng, 3, 4) },
          xmax: Math.max(12, yStar + 5), ymax: Math.max(16, pStar + 5), hideValues: true },
        options: sh.options, answer: sh.correctIndex,
        rationale: "This is a demand-side shock, so AD moves " + (s.dir > 0 ? "RIGHT" : "LEFT") +
          ". Along an upward-sloping SRAS, output and the price level move in the SAME " +
          "direction — which is the signature of a demand shock and how you tell it from a " +
          "supply shock."
      };
    }
  };

  /* HARD: stagflation — the signature of a supply shock is that P and Y move in
     OPPOSITE directions. */
  G["ch15_hard_supply_shock"] = {
    id: "ch15_hard_supply_shock", chapter: 15, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "adverse supply shock / stagflation", points: 3,
    build: function (rng) {
      var shocks = [
        "an oil cartel sharply restricts output, tripling the price of crude",
        "a severe drought destroys much of the world's grain harvest",
        "a war disrupts global shipping, raising input costs across manufacturing"
      ];
      var s = pick(rng, shocks);
      var adB = pick(rng, [1, 2]), srB = pick(rng, [1, 2]);
      var yStar = ri(rng, 5, 7), srA = ri(rng, 1, 3);
      var pStar = srA + srB * yStar, adA = pStar + adB * yStar;
      var pool = [
        "Output falls while the price level rises — stagflation",
        "Output falls and the price level falls",
        "Output rises and the price level rises",
        "Output rises and the price level falls"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Suppose " + s +
          ". In the short run, what happens to output and the price level?",
        diagramSpec: { type: "ad_as", adA: adA, adB: adB, srA: srA, srB: srB, yn: yStar,
          shift: { curve: "SRAS", by: ri(rng, 3, 4) }, showGap: true,
          xmax: Math.max(12, yStar + 5), ymax: Math.max(18, pStar + 6), hideValues: true },
        options: sh.options, answer: sh.correctIndex,
        rationale: "An adverse supply shock raises production costs at every price level, " +
          "shifting SRAS LEFT (up). Moving along an unchanged, downward-sloping AD, output FALLS " +
          "and the price level RISES simultaneously — stagflation. This opposite-direction " +
          "movement is what distinguishes a supply shock from a demand shock, and it is what " +
          "makes such shocks so awkward for policymakers: fighting the inflation deepens the " +
          "recession, and fighting the recession worsens the inflation."
      };
    }
  };

  G["ch15_hard_self_correction"] = {
    id: "ch15_hard_self_correction", chapter: 15, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "long-run self-correction", points: 3,
    build: function (rng) {
      var recess = rng() < 0.5;
      var adB = pick(rng, [1, 2]), srB = pick(rng, [1, 2]);
      var yStar = ri(rng, 5, 7), srA = ri(rng, 1, 3);
      var pStar = srA + srB * yStar, adA = pStar + adB * yStar;
      var yn = recess ? yStar + 2 : yStar - 2;
      var pool = [
        "Wages and other input prices eventually FALL, shifting SRAS right, until output returns to potential at a lower price level",
        "Wages and other input prices eventually RISE, shifting SRAS left, until output returns to potential at a higher price level",
        "AD shifts back on its own until output returns to potential",
        "Output remains permanently below potential unless the government intervenes"
      ];
      var sh = shuffleWithAnswer(rng, pool, recess ? 0 : 1);
      return {
        prompt: "The economy is currently in a " + (recess ? "RECESSIONARY" : "INFLATIONARY") +
          " gap, with output " + (recess ? "below" : "above") +
          " potential. With no policy response at all, how does the economy return to potential " +
          "output in the long run?",
        diagramSpec: { type: "ad_as", adA: adA, adB: adB, srA: srA, srB: srB, yn: yn,
          showGap: true, xmax: Math.max(12, Math.max(yStar, yn) + 4),
          ymax: Math.max(15, pStar + 4), hideValues: true },
        options: sh.options, answer: sh.correctIndex,
        rationale: (recess ?
          "In a recessionary gap, high unemployment puts DOWNWARD pressure on wages. As nominal wages fall, production costs fall and SRAS shifts RIGHT, raising output and lowering the price level until Y returns to potential." :
          "In an inflationary gap, tight labour markets bid wages UP. Rising costs shift SRAS LEFT, reducing output and raising the price level until Y returns to potential.") +
          " The adjustment runs through INPUT PRICES, not through AD. Note this mechanism is " +
          "why the long-run AS curve is vertical — and the practical debate is about how LONG " +
          "'eventually' takes, not whether it happens."
      };
    }
  };

  G["ch15_hard_ad_slope"] = {
    id: "ch15_hard_ad_slope", chapter: 15, kind: "mc", render: "text",
    difficulty: "hard", concept: "why AD slopes downward", points: 3,
    build: function (rng) {
      var cases = [
        { t: "a lower price level raises the real value of the money households hold, so they feel richer and consume more",
          ans: "The wealth effect (on consumption)" },
        { t: "a lower price level reduces the money households need for transactions, so they lend the surplus, pushing interest rates down and investment up",
          ans: "The interest-rate effect (on investment)" },
        { t: "a lower domestic price level makes domestic goods cheaper relative to foreign goods, raising net exports",
          ans: "The exchange-rate effect (on net exports)" }
      ];
      var cs = pick(rng, cases);
      var pool = ["The wealth effect (on consumption)",
        "The interest-rate effect (on investment)",
        "The exchange-rate effect (on net exports)",
        "The law of demand for an individual good"];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "The aggregate demand curve slopes downward for three distinct reasons. Which one " +
          "is this? " + cs.t + ".",
        options: sh.options, answer: sh.correctIndex,
        rationale: "The three reasons are the wealth effect on C, the interest-rate effect on I, " +
          "and the exchange-rate effect on NX. Critically, AD does NOT slope down for the reason " +
          "an individual demand curve does: there is no substitution toward 'other goods' when " +
          "ALL prices fall together, because there is nothing outside the economy to substitute " +
          "toward. Giving the microeconomic answer here is the standard error."
      };
    }
  };

  G["ch15_multiplier"] = {
    id: "ch15_multiplier", chapter: 15, kind: "numeric", render: "text",
    difficulty: "hard", concept: "the spending multiplier", points: 3,
    build: function (rng) {
      var mpc = pick(rng, [0.5, 0.6, 0.75, 0.8]);
      var spend = ri(rng, 1, 9) * 10;
      var mult = 1 / (1 - mpc);
      return {
        prompt: "The marginal propensity to consume is " + mpc +
          ". The government increases purchases by " + money(spend) +
          " billion. Ignoring crowding out and any price-level response, by how many billions " +
          "does aggregate demand shift?",
        answer: round2(spend * mult), tolerance: 0.06,
        rationale: "Multiplier = 1/(1 − MPC) = 1/(1 − " + mpc + ") = " + round2(mult) +
          ". Shift = " + spend + " × " + round2(mult) + " = " + round2(spend * mult) +
          " billion. The initial " + money(spend) +
          " becomes income for someone, who spends " + mpc + " of it, and so on. Note this is " +
          "the shift in the AD CURVE, not the eventual change in output — crowding out and a " +
          "rising price level both damp the final effect."
      };
    }
  };

  G["ch15_hard_multiplier_leakage"] = {
    id: "ch15_hard_multiplier_leakage", chapter: 15, kind: "mc", render: "text",
    difficulty: "hard", concept: "why the multiplier is smaller in practice", points: 3,
    build: function (rng) {
      var cases = [
        { t: "households save a larger share of any extra income", ans: "A lower marginal propensity to consume" },
        { t: "a large share of extra spending goes on imported goods", ans: "Leakage abroad through imports" },
        { t: "higher income pushes households into higher tax brackets, so less of each extra dollar is available to spend", ans: "Leakage into taxes" },
        { t: "the extra government borrowing pushes up interest rates and reduces private investment", ans: "Crowding out through higher interest rates" }
      ];
      var cs = pick(rng, cases);
      var pool = ["A lower marginal propensity to consume", "Leakage abroad through imports",
        "Leakage into taxes", "Crowding out through higher interest rates"];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "The textbook multiplier 1/(1 − MPC) usually overstates the real-world effect of " +
          "a spending increase. Which mechanism is at work here? " + cs.t + ".",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Every round of the multiplier process loses some spending to saving, taxes " +
          "and imports, and the crowding-out channel works separately by raising the interest " +
          "rate and displacing private investment. Empirical multiplier estimates are therefore " +
          "usually well below the simple formula — and depend heavily on whether the economy has " +
          "slack and on whether monetary policy accommodates."
      };
    }
  };

  /* ======================================================================
     CHAPTER 16 — THE IS-LM MODEL
     ====================================================================== */

  G["ch16_islm_equilibrium"] = {
    id: "ch16_islm_equilibrium", chapter: 16, kind: "numeric", render: "graphical",
    difficulty: "hard", concept: "IS-LM equilibrium", points: 3,
    build: function (rng) {
      var isB = pick(rng, [1, 2]), lmB = pick(rng, [1, 2]);
      var yStar = ri(rng, 3, 7), lmA = ri(rng, 1, 3);
      var rStar = lmA + lmB * yStar, isA = rStar + isB * yStar;
      var askR = rng() < 0.5;
      return {
        prompt: "The IS curve is r = " + isA + " − " + isB + "Y and the LM curve is r = " + lmA +
          " + " + lmB + "Y. What is the equilibrium " +
          (askR ? "interest rate?" : "level of output?"),
        diagramSpec: { type: "is_lm", isA: isA, isB: isB, lmA: lmA, lmB: lmB,
          xmax: Math.max(12, yStar + 4), ymax: Math.max(12, rStar + 4), hideValues: true },
        answer: askR ? rStar : yStar, tolerance: 0.01,
        rationale: "Equilibrium is where BOTH markets clear: " + isA + " − " + isB + "Y = " +
          lmA + " + " + lmB + "Y → Y = " + yStar + ", r = " + rStar +
          "%. The IS curve is goods-market equilibrium; the LM curve is money-market " +
          "equilibrium; only their intersection satisfies both."
      };
    }
  };

  G["ch16_policy_shift"] = {
    id: "ch16_policy_shift", chapter: 16, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "fiscal vs monetary policy in IS-LM", points: 3,
    build: function (rng) {
      var fiscal = rng() < 0.5;
      var isB = pick(rng, [1, 2]), lmB = pick(rng, [1, 2]);
      var yStar = ri(rng, 4, 6), lmA = ri(rng, 1, 3);
      var rStar = lmA + lmB * yStar, isA = rStar + isB * yStar;
      var pool = [
        "Output rises and the interest rate RISES",
        "Output rises and the interest rate FALLS",
        "Output falls and the interest rate rises",
        "Output falls and the interest rate falls"
      ];
      var sh = shuffleWithAnswer(rng, pool, fiscal ? 0 : 1);
      return {
        prompt: (fiscal ?
          "The government increases spending, shifting the IS curve right." :
          "The central bank expands the money supply, shifting the LM curve right (down).") +
          " In the IS-LM diagram, what happens to output and the interest rate?",
        diagramSpec: { type: "is_lm", isA: isA, isB: isB, lmA: lmA, lmB: lmB,
          shift: fiscal ? { curve: "IS", by: ri(rng, 3, 4) } : { curve: "LM", by: -ri(rng, 2, 3) },
          xmax: Math.max(12, yStar + 5), ymax: Math.max(13, rStar + 5), hideValues: true },
        options: sh.options, answer: sh.correctIndex,
        rationale: (fiscal ?
          "Fiscal expansion shifts IS right. Moving UP along the unchanged LM curve, output rises AND the interest rate rises — the rise in r is exactly the crowding-out channel." :
          "Monetary expansion shifts LM right. Moving DOWN along the unchanged IS curve, output rises AND the interest rate falls — the lower r is what stimulates investment.") +
          " Both policies raise output, but they move the interest rate in OPPOSITE directions. " +
          "That is the discriminating fact, and it is why the policy MIX matters for the " +
          "composition of output between consumption and investment."
      };
    }
  };

  G["ch16_hard_crowding_out_math"] = {
    id: "ch16_hard_crowding_out_math", chapter: 16, kind: "numeric", render: "text",
    difficulty: "hard", concept: "measuring crowding out", points: 3,
    build: function (rng) {
      var isB = pick(rng, [1, 2]), lmB = pick(rng, [1, 2]);
      var yStar = ri(rng, 3, 6), lmA = ri(rng, 1, 3);
      var rStar = lmA + lmB * yStar, isA = rStar + isB * yStar;
      var shift = ri(rng, 2, 6);
      /* new IS intercept isA+shift; new Y = (isA+shift-lmA)/(isB+lmB) */
      var yNew = (isA + shift - lmA) / (isB + lmB);
      var actual = yNew - yStar;
      var noLM = shift / isB;    /* if r were held fixed, Y would rise by shift/isB */
      return {
        prompt: "IS is r = " + isA + " − " + isB + "Y and LM is r = " + lmA + " + " + lmB +
          "Y. A fiscal expansion shifts the IS curve UP by " + shift +
          " (its intercept rises from " + isA + " to " + (isA + shift) +
          "). By how much does equilibrium output actually rise? (Two decimal places.)",
        answer: round2(actual), tolerance: 0.03,
        rationale: "New equilibrium: " + (isA + shift) + " − " + isB + "Y = " + lmA + " + " +
          lmB + "Y → Y = " + round2(yNew) + ", up " + round2(actual) + " from " + yStar +
          ". Had the interest rate stayed fixed at " + rStar + " (a horizontal LM), output " +
          "would have risen by " + round2(noLM) + ". The difference, " +
          round2(noLM - actual) + ", is crowded out by the rise in the interest rate as the " +
          "expansion increases money demand."
      };
    }
  };

  G["ch16_hard_liquidity_trap"] = {
    id: "ch16_hard_liquidity_trap", chapter: 16, kind: "mc", render: "text",
    difficulty: "hard", concept: "the liquidity trap", points: 3,
    build: function (rng) {
      var pool = [
        "Monetary policy becomes largely ineffective while fiscal policy becomes MORE effective, because there is no interest-rate rise to crowd out private spending",
        "Both monetary and fiscal policy become ineffective",
        "Monetary policy becomes more effective because rates are already low",
        "Fiscal policy becomes ineffective because the multiplier falls to zero"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "The nominal interest rate has fallen to zero and the LM curve is effectively " +
          "horizontal — a liquidity trap. What does this imply about the relative effectiveness " +
          "of monetary and fiscal policy?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "With a flat LM, shifting LM right does nothing to the interest rate, so the " +
          "usual monetary transmission channel is shut. But that same flatness means a rightward " +
          "IS shift does NOT push rates up, so no private investment is crowded out and the full " +
          "multiplier operates. This is the standard argument for fiscal stimulus at the zero " +
          "lower bound, and why estimated fiscal multipliers are larger in that regime."
      };
    }
  };

  G["ch16_hard_curve_meaning"] = {
    id: "ch16_hard_curve_meaning", chapter: 16, kind: "mc", render: "text",
    difficulty: "hard", concept: "what the IS and LM curves represent", points: 3,
    build: function (rng) {
      var isQ = rng() < 0.5;
      var pool = [
        "Combinations of output and the interest rate at which the GOODS market is in equilibrium; it slopes down because a lower interest rate raises investment and hence output",
        "Combinations of output and the interest rate at which the MONEY market is in equilibrium; it slopes up because higher output raises money demand, and with a fixed money supply the interest rate must rise",
        "Combinations at which the government budget is balanced",
        "Combinations at which the trade balance is zero"
      ];
      var sh = shuffleWithAnswer(rng, pool, isQ ? 0 : 1);
      return {
        prompt: "What does the " + (isQ ? "IS" : "LM") + " curve represent, and why does it slope " +
          (isQ ? "downward" : "upward") + "?",
        options: sh.options, answer: sh.correctIndex,
        rationale: (isQ ?
          "IS = Investment-Saving: the goods market. Lower r → more investment → higher equilibrium output, so the curve slopes down." :
          "LM = Liquidity-Money: the money market. Higher Y → more transactions → higher money demand; with M fixed, r must rise to restore equilibrium, so the curve slopes up.") +
          " Knowing WHICH market each curve clears is what lets you work out which policies shift " +
          "which curve."
      };
    }
  };

  /* ======================================================================
     CHAPTER 17 — MONETARY POLICY
     ====================================================================== */

  G["ch17_taylor_rule"] = {
    id: "ch17_taylor_rule", chapter: 17, kind: "numeric", render: "text",
    difficulty: "hard", concept: "the Taylor rule", points: 3,
    build: function (rng) {
      var infl = pick(rng, [1, 2, 3, 4, 5, 6]);
      var target = 2;
      var gap = pick(rng, [-3, -2, -1, 0, 1, 2]);
      var neutral = 2;
      var i = neutral + infl + 0.5 * (infl - target) + 0.5 * gap;
      return {
        prompt: "A central bank follows the Taylor rule i = 2 + π + 0.5(π − 2) + 0.5·(output gap), " +
          "where π is inflation in percent and the output gap is in percent. Inflation is " + infl +
          "% and the output gap is " + gap +
          "%. What policy rate does the rule prescribe, in percent? (One decimal place.)",
        answer: round1(i), tolerance: 0.06,
        rationale: "i = 2 + " + infl + " + 0.5(" + infl + " − 2) + 0.5(" + gap + ") = 2 + " +
          infl + " + " + round2(0.5 * (infl - target)) + " + " + round2(0.5 * gap) + " = " +
          round1(i) + "%. Note the coefficient on inflation exceeds one in total (1 + 0.5), " +
          "so the rule raises the NOMINAL rate more than one-for-one with inflation — the Taylor " +
          "principle, which is what makes the REAL rate rise and actually restrain demand."
      };
    }
  };

  G["ch17_hard_taylor_principle"] = {
    id: "ch17_hard_taylor_principle", chapter: 17, kind: "mc", render: "text",
    difficulty: "hard", concept: "the Taylor principle", points: 3,
    build: function (rng) {
      var rise = pick(rng, [2, 3, 4]);
      var nomRise = pick(rng, [1, 1.5]);
      var pool = [
        "The REAL interest rate has FALLEN, so policy has actually become more stimulative and inflation is likely to accelerate",
        "The real interest rate has risen, so policy has tightened",
        "The real interest rate is unchanged, so policy is neutral",
        "The real interest rate cannot be inferred without knowing the exchange rate"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Inflation rises by " + rise +
          " percentage points, and the central bank responds by raising the nominal policy rate by " +
          nomRise + " percentage points. What has happened to the stance of policy?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Real rate ≈ nominal − inflation, so it changed by " + nomRise + " − " + rise +
          " = " + round1(nomRise - rise) + " percentage points: it FELL. Raising the nominal " +
          "rate by LESS than the rise in inflation loosens policy in real terms, even though " +
          "the headline move is a hike. To tighten, the nominal rate must rise MORE than " +
          "one-for-one with inflation — the Taylor principle. Failing it is a standard " +
          "explanation for the persistent inflation of the 1970s."
      };
    }
  };

  G["ch17_policy_transmission"] = {
    id: "ch17_policy_transmission", chapter: 17, kind: "mc", render: "graphical",
    difficulty: "med", concept: "monetary transmission", points: 2,
    build: function (rng) {
      var ease = rng() < 0.5;
      var ms = ri(rng, 5, 8), mdA = ri(rng, 13, 16);
      var pool = [
        "Interest rates fall, investment and consumer durables spending rise, and aggregate demand shifts right",
        "Interest rates rise, investment falls, and aggregate demand shifts left",
        "Interest rates fall, but aggregate demand is unaffected",
        "Interest rates rise, and aggregate demand shifts right"
      ];
      var sh = shuffleWithAnswer(rng, pool, ease ? 0 : 1);
      return {
        prompt: "The central bank " + (ease ? "expands" : "contracts") +
          " the money supply. Trace the transmission through to aggregate demand.",
        diagramSpec: { type: "money_market", ms: ms, mdA: mdA, mdB: 1,
          shift: { curve: "MS", by: ease ? ri(rng, 2, 3) : -ri(rng, 2, 3) }, hideValues: true },
        options: sh.options, answer: sh.correctIndex,
        rationale: "The chain is: money supply " + (ease ? "up" : "down") + " → interest rate " +
          (ease ? "down" : "up") + " → investment and interest-sensitive consumption " +
          (ease ? "up" : "down") + " → AD shifts " + (ease ? "right" : "left") +
          ". In an open economy there is a second channel: the interest-rate change moves the " +
          "exchange rate, which moves net exports in the same direction."
      };
    }
  };

  G["ch17_hard_zlb"] = {
    id: "ch17_hard_zlb", chapter: 17, kind: "mc", render: "text",
    difficulty: "hard", concept: "the zero lower bound", points: 3,
    build: function (rng) {
      var pool = [
        "Conventional rate cuts are exhausted, so the bank turns to asset purchases and forward guidance — and RAISING expected inflation becomes a way to lower the real rate",
        "The bank can simply set a large negative nominal rate with no complications",
        "Monetary policy regains full effectiveness because money is cheap",
        "Inflation becomes impossible at the zero lower bound"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "The policy rate is already at zero and the economy is still far below potential. " +
          "What options remain for monetary policy, and what is the logic behind them?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Since r = i − πᵉ and i is stuck at zero, the only way to push the REAL rate " +
          "lower is to raise expected inflation — which is why credible commitments to keep " +
          "policy loose (forward guidance) and large-scale asset purchases (quantitative easing, " +
          "aimed at longer-term rates) become the tools. Deeply negative nominal rates are " +
          "limited by the option to hold physical cash, so they are possible only slightly below " +
          "zero."
      };
    }
  };

  G["ch17_hard_lags"] = {
    id: "ch17_hard_lags", chapter: 17, kind: "mc", render: "text",
    difficulty: "hard", concept: "policy lags", points: 3,
    build: function (rng) {
      var months = pick(rng, [6, 12, 18]);
      var pool = [
        "Policy set today acts on an economy roughly " + months + " months from now, so it must be based on a FORECAST — and reacting to current data risks amplifying the cycle",
        "Lags are irrelevant because financial markets respond immediately",
        "Lags mean monetary policy should always be tightened during a recession",
        "Lags only affect fiscal policy, not monetary policy"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Monetary policy affects output and inflation with a lag of roughly " + months +
          " months. What is the central practical implication?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Because the effect arrives late, policy aimed at TODAY'S data can land when " +
          "conditions have already reversed — stimulus arriving as the recovery is underway is " +
          "pro-cyclical and destabilizing. This is the core of the case for forecast-based, " +
          "rule-guided policy, and one of Friedman's main arguments against fine-tuning. " +
          "Markets repricing instantly is not the same as output and inflation responding."
      };
    }
  };

  /* ======================================================================
     CHAPTER 18 — FISCAL POLICY
     ====================================================================== */

  G["ch18_spending_multiplier"] = {
    id: "ch18_spending_multiplier", chapter: 18, kind: "numeric", render: "text",
    difficulty: "med", concept: "government spending multiplier", points: 2,
    build: function (rng) {
      var mpc = pick(rng, [0.5, 0.6, 0.75, 0.8]);
      return {
        prompt: "The marginal propensity to consume is " + mpc +
          ". What is the government-purchases multiplier? (Two decimal places.)",
        answer: round2(1 / (1 - mpc)), tolerance: 0.02,
        rationale: "1/(1 − MPC) = 1/" + round2(1 - mpc) + " = " + round2(1 / (1 - mpc)) + "."
      };
    }
  };

  G["ch18_hard_tax_multiplier"] = {
    id: "ch18_hard_tax_multiplier", chapter: 18, kind: "numeric", render: "text",
    difficulty: "hard", concept: "tax multiplier", points: 3,
    build: function (rng) {
      var mpc = pick(rng, [0.5, 0.6, 0.75, 0.8]);
      var cut = ri(rng, 1, 9) * 10;
      var taxMult = mpc / (1 - mpc);
      return {
        prompt: "The marginal propensity to consume is " + mpc +
          ". The government cuts taxes by " + money(cut) +
          " billion. By how many billions does aggregate demand shift? (Two decimal places.)",
        answer: round2(cut * taxMult), tolerance: 0.06,
        rationale: "The tax multiplier is MPC/(1 − MPC) = " + mpc + "/" + round2(1 - mpc) +
          " = " + round2(taxMult) + ", so the shift is " + cut + " × " + round2(taxMult) +
          " = " + round2(cut * taxMult) + " billion. It is SMALLER than the spending multiplier (" +
          round2(1 / (1 - mpc)) + ") because the first round leaks: households save " +
          round2(1 - mpc) + " of the tax cut rather than spending all of it, whereas government " +
          "purchases enter spending in full."
      };
    }
  };

  G["ch18_hard_balanced_budget"] = {
    id: "ch18_hard_balanced_budget", chapter: 18, kind: "numeric", render: "text",
    difficulty: "hard", concept: "balanced-budget multiplier", points: 3,
    build: function (rng) {
      var mpc = pick(rng, [0.5, 0.6, 0.75, 0.8]);
      var amt = ri(rng, 2, 9) * 10;
      return {
        prompt: "The marginal propensity to consume is " + mpc +
          ". The government raises spending by " + money(amt) +
          " billion AND raises taxes by " + money(amt) +
          " billion, keeping the budget balanced. By how many billions does aggregate demand " +
          "shift on net?",
        answer: amt, tolerance: 0.06,
        rationale: "Spending effect: +" + amt + " × " + round2(1 / (1 - mpc)) + " = +" +
          round2(amt / (1 - mpc)) + ". Tax effect: −" + amt + " × " + round2(mpc / (1 - mpc)) +
          " = −" + round2(amt * mpc / (1 - mpc)) + ". Net = " + amt +
          " billion. The balanced-budget multiplier equals 1 for ANY value of the MPC, because " +
          "(1 − MPC)/(1 − MPC) = 1. A balanced tax-and-spend package is expansionary, not " +
          "neutral — the intuition being that the government spends the whole amount while " +
          "households would have saved part of it."
      };
    }
  };

  G["ch18_debt_ratio"] = {
    id: "ch18_debt_ratio", chapter: 18, kind: "numeric", render: "text",
    difficulty: "hard", concept: "debt-to-GDP ratio", points: 3,
    build: function (rng) {
      var debt = ri(rng, 15, 30) * 1000;
      var gdp = ri(rng, 18, 28) * 1000;
      var ratio = round1(100 * debt / gdp);
      return {
        prompt: "A government owes " + money(debt) + " billion and the economy's GDP is " +
          money(gdp) + " billion. What is the debt-to-GDP ratio, in percent? (One decimal place.)",
        answer: ratio, tolerance: 0.11,
        rationale: "100 × " + debt + "/" + gdp + " ≈ " + ratio +
          "%. Economists watch the RATIO rather than the dollar level because the ratio compares " +
          "the debt to the resources available to service it. It can fall without any repayment " +
          "at all if nominal GDP grows faster than the debt."
      };
    }
  };

  G["ch18_hard_debt_dynamics"] = {
    id: "ch18_hard_debt_dynamics", chapter: 18, kind: "mc", render: "text",
    difficulty: "hard", concept: "debt sustainability", points: 3,
    build: function (rng) {
      var g = pick(rng, [4, 5, 6]);
      var r = pick(rng, [2, 3]);
      var pool = [
        "The ratio can fall over time even with a modest primary deficit, because nominal GDP is growing faster than the interest accruing on the debt",
        "The ratio must rise, because any deficit adds to the debt",
        "The ratio is unaffected by growth rates",
        "The ratio can only fall if the government runs a budget surplus"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "A country's nominal GDP grows at " + g +
          "% per year while the average nominal interest rate on its government debt is " + r +
          "%. What does this imply for the path of the debt-to-GDP ratio?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "When the growth rate exceeds the interest rate (g > r), the denominator of " +
          "the ratio grows faster than the debt compounds, so the ratio drifts DOWN even with a " +
          "modest primary deficit. This r-versus-g comparison is the heart of debt " +
          "sustainability analysis. It also cuts the other way: if r rises above g, the ratio " +
          "rises automatically and stabilizing it requires a primary SURPLUS."
      };
    }
  };

  G["ch18_hard_automatic_stabilizers"] = {
    id: "ch18_hard_automatic_stabilizers", chapter: 18, kind: "mc", render: "text",
    difficulty: "hard", concept: "automatic stabilizers", points: 3,
    build: function (rng) {
      var cases = [
        { t: "in a recession, income tax receipts fall automatically as incomes fall, cushioning disposable income without any new legislation",
          ans: "An automatic stabilizer" },
        { t: "in a recession, more people become eligible for unemployment benefits and food assistance, so transfers rise without a vote",
          ans: "An automatic stabilizer" },
        { t: "Congress debates for eight months and then passes a one-off infrastructure package",
          ans: "Discretionary fiscal policy" },
        { t: "the central bank cuts its policy rate at a scheduled meeting",
          ans: "Monetary policy, not fiscal policy" }
      ];
      var cs = pick(rng, cases);
      var pool = ["An automatic stabilizer", "Discretionary fiscal policy",
        "Monetary policy, not fiscal policy", "A supply-side policy"];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Classify the following: " + cs.t + ".",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Automatic stabilizers act with NO legislative lag — the tax and transfer " +
          "system responds mechanically to the state of the economy, which is precisely their " +
          "advantage given how long discretionary action takes to legislate and implement. " +
          "They also mean the measured budget deficit worsens in recessions even with no policy " +
          "change at all, which is why the cyclically-adjusted balance is the better gauge of " +
          "the fiscal stance."
      };
    }
  };

  G["ch18_hard_ricardian"] = {
    id: "ch18_hard_ricardian", chapter: 18, kind: "mc", render: "text",
    difficulty: "hard", concept: "Ricardian equivalence", points: 3,
    build: function (rng) {
      var cut = ri(rng, 2, 8) * 100;
      var pool = [
        "Households save the tax cut to pay the higher future taxes it implies, so consumption and aggregate demand barely move",
        "Households spend the entire tax cut immediately, producing the full multiplier effect",
        "The tax cut has no effect on the government's future budget constraint",
        "The tax cut necessarily raises the price level one-for-one"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "The government cuts taxes by " + money(cut) +
          " billion with no change in government spending, financing the gap by borrowing. " +
          "Under STRICT Ricardian equivalence, what happens?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "A deficit-financed tax cut changes the TIMING of taxes, not their present " +
          "value: the borrowing must eventually be repaid. Fully forward-looking households " +
          "with bequest motives therefore save the windfall, leaving consumption unchanged. " +
          "In practice the offset is partial — liquidity-constrained households spend, horizons " +
          "are finite, and people are not perfectly informed — so tax cuts do stimulate, just " +
          "less than a naive multiplier suggests. The exam-relevant point is understanding the " +
          "MECHANISM and why it is only partial."
      };
    }
  };

  G["ch18_hard_fiscal_timing"] = {
    id: "ch18_hard_fiscal_timing", chapter: 18, kind: "mc", render: "text",
    difficulty: "hard", concept: "fiscal policy lags", points: 3,
    build: function (rng) {
      var pool = [
        "Recognition, legislative and implementation lags together can push the stimulus past the recession it was meant to fight, making it pro-cyclical",
        "Fiscal policy acts instantly once announced",
        "Fiscal lags are shorter than monetary lags in every dimension",
        "Lags matter only for tax changes, not for spending"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Why do many economists prefer automatic stabilizers and monetary policy to " +
          "discretionary fiscal stimulus as the main tool for stabilizing the business cycle?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Discretionary fiscal policy carries three lags in sequence: recognizing the " +
          "downturn (data arrive with a delay and get revised), legislating a response, and " +
          "actually spending the money — infrastructure especially is slow to break ground. " +
          "Monetary policy skips the legislative lag entirely, and automatic stabilizers skip " +
          "all three. Note the argument is about STABILIZATION timing, not about whether fiscal " +
          "policy works — at the zero lower bound the case for it is much stronger."
      };
    }
  };

  /* ======================================================================
     STATIC ITEMS — chapters 13-18
     ====================================================================== */
  var STATIC = [
    /* ---- chapter 13 ---- */
    { id: "ch13_nco_definition", chapter: 13, kind: "mc", render: "text",
      difficulty: "easy", concept: "net capital outflow", points: 1,
      prompt: "Net capital outflow is defined as:",
      options: [
        "Domestic residents' purchases of foreign assets minus foreigners' purchases of domestic assets",
        "The value of goods exported minus the value of goods imported",
        "The total amount of foreign aid a country sends abroad",
        "The government's budget deficit"
      ],
      answer: 0,
      rationale: "NCO is about ASSETS, and it always equals net exports: every dollar earned by foreigners selling goods here must ultimately buy something here, whether goods or assets." },

    { id: "ch13_appreciation_effect", chapter: 13, kind: "mc", render: "text",
      difficulty: "med", concept: "effects of appreciation", points: 2,
      prompt: "The U.S. dollar appreciates sharply against other currencies. Other things equal, what happens to U.S. exports and imports?",
      options: [
        "Exports become more expensive abroad and fall; imports become cheaper and rise",
        "Exports become cheaper abroad and rise; imports become more expensive and fall",
        "Both exports and imports rise",
        "Neither is affected, because trade depends only on quality"
      ],
      answer: 0,
      rationale: "A stronger dollar means foreigners need more of their currency to buy a U.S. good, while Americans need fewer dollars to buy a foreign good. Net exports fall — which is why exporters lobby against a strong currency." },

    { id: "ch13_hard_ppp_limits", chapter: 13, kind: "mc", render: "text",
      difficulty: "hard", concept: "limits of PPP", points: 3,
      prompt: "Purchasing power parity often fails badly in practice, especially in the short run. What is the best explanation?",
      options: [
        "Many goods are non-traded (haircuts, housing, restaurant meals), and traded goods face transport costs, tariffs and differentiation, so arbitrage cannot force prices to converge",
        "Exchange rates are set by governments rather than markets",
        "Consumers in different countries have identical preferences",
        "PPP only fails when inflation is zero"
      ],
      answer: 0,
      rationale: "PPP relies on arbitrage, and arbitrage requires that a good can actually be bought cheap and sold dear. You cannot import a Mumbai haircut. Even for traded goods, shipping costs, tariffs and brand differentiation drive wedges. PPP works better as a long-run anchor and for countries with very different inflation rates." },

    { id: "ch13_written_trade_deficit", chapter: 13, kind: "short", render: "text",
      difficulty: "hard", concept: "interpreting a trade deficit", points: 4,
      prompt: "A politician calls the country's persistent trade deficit “proof that we are losing.” In 4–6 sentences, evaluate this claim using the identity NX = NCO = S − I. Explain what a trade deficit necessarily implies about saving and investment, describe one circumstance in which a trade deficit is a sign of strength and one in which it is genuinely worrying, and state what would actually have to change to shrink it.",
      answer: null,
      rubric: "Full credit (4 pts) requires: (1) correct use of the identity — a trade deficit means domestic investment exceeds national saving, financed by a net capital inflow; (2) a circumstance where it signals STRENGTH — e.g. attractive investment opportunities and strong expected returns draw foreign capital in, financing productive investment that raises future output; (3) a circumstance where it is WORRYING — e.g. it is driven by low national saving, particularly large government deficits, or funds consumption rather than investment, building external liabilities without the future output to service them; (4) the correct conclusion that shrinking the deficit requires changing SAVING or INVESTMENT (e.g. reducing the budget deficit, raising private saving) — NOT trade policy, since tariffs change the composition of trade but not the balance. Award 1 pt per element. An answer that proposes tariffs as the remedy loses element (4).",
      rationale: "The discriminating element is recognizing that trade policy cannot change the trade balance; only saving and investment can." },

    { id: "ch13_written_ppp", chapter: 13, kind: "short", render: "text",
      difficulty: "hard", concept: "purchasing power parity", points: 4,
      prompt: "In 4–5 sentences, state the theory of purchasing power parity, explain the arbitrage mechanism that is supposed to enforce it, and give two specific reasons it fails in practice. Then say whether PPP is more useful over months or over decades, and why.",
      answer: null,
      rubric: "Full credit (4 pts): (1) statement of the theory — a unit of currency should buy the same quantity of goods in every country; equivalently the nominal exchange rate equals the ratio of price levels; (2) the ARBITRAGE mechanism — if a good is cheaper in one country, traders buy there and sell where it is dear, raising demand for the cheap country's currency and its goods prices until the gap closes; (3) two valid failure reasons from: non-traded goods, transport costs, tariffs/trade barriers, product differentiation so goods are not identical, sticky prices in the short run; (4) correctly identifying PPP as more reliable over the LONG run / decades, with a reason — arbitrage and price adjustment take time, and PPP performs best where inflation differentials are large enough to dominate other forces. Award 1 pt per element; element (3) needs BOTH reasons for full credit on that point.",
      rationale: "The arbitrage mechanism is the part most often omitted; a good answer says WHY prices would converge, not just that they should." },

    /* ---- chapter 14 ---- */
    { id: "ch14_unemployed_definition", chapter: 14, kind: "mc", render: "text",
      difficulty: "easy", concept: "who counts as unemployed", points: 1,
      prompt: "To be counted as unemployed in the official statistics, a person must be:",
      options: [
        "Without a job, available for work, and actively searching for work",
        "Without a job for any reason",
        "Receiving unemployment insurance benefits",
        "Working fewer hours than they would like"
      ],
      answer: 0,
      rationale: "All three conditions are required. Someone without a job who has stopped searching is 'not in the labour force', not unemployed — which is why the measured rate can fall in a worsening economy." },

    { id: "ch14_hard_underemployment", chapter: 14, kind: "mc", render: "text",
      difficulty: "hard", concept: "limits of the unemployment rate", points: 3,
      prompt: "Which situation would the headline unemployment rate FAIL to reflect, even though it represents real labour-market slack?",
      options: [
        "An engineer working 10 hours a week at a coffee shop because no full-time engineering work is available",
        "A worker laid off last month who is applying to jobs daily",
        "A recent graduate actively interviewing for a first job",
        "A worker who quit and is searching for a better position"
      ],
      answer: 0,
      rationale: "Involuntary part-time and skill-mismatched work counts as EMPLOYED in the headline rate, however underused the worker is. Broader measures (in the U.S., U-6) add these people plus discouraged and marginally attached workers. The other three are all counted as unemployed already." },

    { id: "ch14_hard_hysteresis", chapter: 14, kind: "mc", render: "text",
      difficulty: "hard", concept: "hysteresis", points: 3,
      prompt: "Hysteresis in the labour market refers to the idea that:",
      options: [
        "A long recession can raise the NATURAL rate itself, as skills atrophy and long-term unemployed workers become less attractive to employers",
        "Unemployment always returns quickly to its natural rate after a shock",
        "The natural rate of unemployment is always zero",
        "Cyclical unemployment causes inflation to fall permanently"
      ],
      answer: 0,
      rationale: "Hysteresis breaks the clean separation between cyclical and structural unemployment: a shock that is initially cyclical can become structural if it lasts long enough. If true, it strengthens the case for responding to recessions quickly and forcefully, because the cost of delay is permanent rather than temporary." },

    { id: "ch14_written_natural_rate", chapter: 14, kind: "short", render: "text",
      difficulty: "hard", concept: "the natural rate of unemployment", points: 4,
      prompt: "In 4–6 sentences, explain why economists regard some unemployment as normal and even desirable, distinguish frictional from structural unemployment with an example of each, and identify one policy that would reduce frictional unemployment and one that would reduce structural unemployment.",
      answer: null,
      rubric: "Full credit (4 pts): (1) why some unemployment is normal/desirable — job search takes time, and time spent finding a good match raises productivity; zero unemployment would mean no reallocation in a changing economy; (2) FRICTIONAL defined as short-term search/matching unemployment, with a valid example (new graduate searching, worker between jobs, someone relocating); (3) STRUCTURAL defined as a longer-lasting mismatch of skills or location, or unemployment from a wage held above market-clearing, with a valid example (displaced coal miners, minimum-wage or union wage floors); (4) one plausible policy for each — frictional: better job-matching services, job boards, improved information, relocation assistance; structural: retraining and education programmes, mobility assistance, reconsidering binding wage floors. Award 1 pt per element. Treating all unemployment as simply bad, with no recognition that search has value, loses element (1).",
      rationale: "The insight worth testing is that search unemployment is productive, not merely tolerable." },

    { id: "ch14_written_min_wage", chapter: 14, kind: "short", render: "text",
      difficulty: "hard", concept: "minimum wage debate", points: 4,
      prompt: "In 5–7 sentences, present the strongest case that a higher minimum wage reduces employment among low-skilled workers, then the strongest case that it may not, and explain what feature of the labour market determines which case applies. Conclude with what evidence you would want in order to decide.",
      answer: null,
      rubric: "Full credit (4 pts): (1) the standard competitive case — a binding floor above market-clearing raises quantity supplied and lowers quantity demanded, creating a surplus of labour; the effect is larger the more elastic labour demand is; (2) the counter-case, at least one of: monopsony power (a single or dominant employer already pays below the competitive wage, so a floor can raise BOTH wages and employment), efficiency-wage effects raising productivity, reduced turnover costs, demand effects from higher low-income spending, or empirical studies finding small disemployment effects; (3) the determining feature — the degree of employer market power / the elasticity of labour demand / how far the floor sits above the market-clearing wage; (4) a sensible evidentiary standard — e.g. comparing similar adjacent regions with different minimums, tracking hours as well as headcount, looking at the affected age/skill groups specifically, or attending to how binding the increase is locally. Award 1 pt per element. An answer that presents only one side earns at most 2 pts regardless of quality.",
      rationale: "This one is explicitly testing whether the student can argue both sides and identify what would settle the question — a one-sided answer is capped." },

    /* ---- chapter 15 ---- */
    { id: "ch15_lras_vertical", chapter: 15, kind: "mc", render: "text",
      difficulty: "med", concept: "why LRAS is vertical", points: 2,
      prompt: "Why is the long-run aggregate supply curve vertical?",
      options: [
        "In the long run, output is determined by labour, capital, natural resources and technology — not by the price level",
        "Because prices never change in the long run",
        "Because aggregate demand is vertical in the long run",
        "Because the money supply is fixed"
      ],
      answer: 0,
      rationale: "Doubling every price and every wage leaves real production decisions unchanged — the classical dichotomy. Real output depends on real factors, so LRAS sits at potential output regardless of P. It shifts only when those real factors change." },

    { id: "ch15_hard_sras_theories", chapter: 15, kind: "mc", render: "text",
      difficulty: "hard", concept: "why SRAS slopes upward", points: 3,
      prompt: "Which of the following is NOT one of the standard explanations for an upward-sloping short-run aggregate supply curve?",
      options: [
        "The quantity theory of money",
        "Sticky wages set by contracts that cannot adjust immediately",
        "Sticky prices, because firms face menu costs of changing posted prices",
        "Misperceptions, where suppliers mistake a rise in the general price level for a rise in their own relative price"
      ],
      answer: 0,
      rationale: "Sticky wages, sticky prices and misperceptions are the three standard theories, and all share the same structure: something prevents a full, immediate adjustment to the price level, so a higher P raises real output temporarily. The quantity theory is a LONG-run proposition about money and prices and says nothing about short-run supply." },

    { id: "ch15_written_stagflation", chapter: 15, kind: "short", render: "text",
      difficulty: "hard", concept: "policy response to a supply shock", points: 4,
      prompt: "An adverse supply shock has pushed the economy into stagflation: output below potential and inflation high. In 5–7 sentences, explain the policy dilemma this creates, describe what happens if the central bank fights the inflation and what happens if it fights the recession, explain how the economy would resolve the situation with no intervention at all, and state which course you would recommend and why.",
      answer: null,
      rubric: "Full credit (4 pts): (1) statement of the dilemma — the shock moves output and inflation in OPPOSITE directions, so any single AD instrument must worsen one to improve the other, unlike a demand shock where both move together; (2) fighting inflation (contractionary policy) shifts AD left: inflation falls faster but output falls further and unemployment rises more; (3) fighting the recession (expansionary policy) shifts AD right: output recovers but the price level rises further, and it risks entrenching inflation expectations; (4) no intervention — over time the high unemployment puts downward pressure on wages, SRAS shifts back right, and the economy returns to potential at the original price level, but slowly and painfully; PLUS a defended recommendation. Award 1 pt per element; the recommendation must be supported by a reason (e.g. whether expectations are anchored, whether the shock is temporary, credibility considerations) but ANY defensible position earns the credit.",
      rationale: "The key structural insight is that a supply shock moves P and Y in opposite directions, which is exactly why no single demand-side tool can fix both." },

    /* ---- chapter 16 ---- */
    { id: "ch16_is_definition", chapter: 16, kind: "mc", render: "text",
      difficulty: "med", concept: "the IS curve", points: 2,
      prompt: "A movement ALONG the IS curve to a lower interest rate corresponds to:",
      options: [
        "Higher investment spending and therefore higher equilibrium output in the goods market",
        "A shift in government spending",
        "An increase in the money supply",
        "A change in the price level only"
      ],
      answer: 0,
      rationale: "The IS curve traces goods-market equilibrium as r varies: a lower r raises investment, which raises equilibrium Y through the multiplier. Changes in G or T SHIFT the curve; changes in r move you along it." },

    { id: "ch16_hard_policy_mix", chapter: 16, kind: "mc", render: "text",
      difficulty: "hard", concept: "the policy mix", points: 3,
      prompt: "A government wants to raise output while keeping the interest rate unchanged, so that private investment is not crowded out. Which combination achieves this?",
      options: [
        "Fiscal expansion accompanied by monetary expansion — IS shifts right and LM shifts right together",
        "Fiscal expansion alone",
        "Monetary contraction combined with fiscal expansion",
        "Fiscal contraction combined with monetary expansion"
      ],
      answer: 0,
      rationale: "Fiscal expansion alone raises Y but pushes r up, crowding out investment. Pairing it with monetary expansion, which pushes r down, can leave r unchanged while both forces raise Y — 'accommodative' monetary policy. This is why the composition of output between consumption and investment depends on the policy MIX, not just on whether policy is expansionary overall." },

    { id: "ch16_written_policy_mix", chapter: 16, kind: "short", render: "text",
      difficulty: "hard", concept: "fiscal vs monetary policy in IS-LM", points: 4,
      prompt: "In 5–7 sentences, compare a fiscal expansion and a monetary expansion in the IS-LM model. State which curve each shifts and in which direction, what each does to output and to the interest rate, and — most importantly — explain how the two policies differ in their effect on the COMPOSITION of output between consumption and investment. Then explain why a policymaker might care about that composition.",
      answer: null,
      rubric: "Full credit (4 pts): (1) fiscal expansion shifts IS RIGHT; output rises and the interest rate RISES; (2) monetary expansion shifts LM RIGHT (down); output rises and the interest rate FALLS; (3) the composition difference — fiscal expansion's higher r crowds out interest-sensitive private investment, so output rises with a larger public/consumption share and a smaller investment share; monetary expansion's lower r stimulates investment, so output rises with a larger investment share; (4) why composition matters — investment adds to the future capital stock and hence to future potential output and growth, so two policies that produce the same GDP today can leave very different productive capacity tomorrow. Award 1 pt per element. Getting the direction of the interest-rate movement wrong for either policy loses that element and usually element (3) too.",
      rationale: "The composition point is the one that separates real understanding from memorized curve-shifting; the opposite interest-rate movements are the mechanism behind it." },

    /* ---- chapter 17 ---- */
    { id: "ch17_dual_mandate", chapter: 17, kind: "mc", render: "text",
      difficulty: "easy", concept: "central bank objectives", points: 1,
      prompt: "The Federal Reserve's statutory “dual mandate” refers to:",
      options: [
        "Maximum employment and stable prices",
        "Balancing the federal budget and stabilizing the dollar",
        "Regulating banks and issuing currency",
        "Full employment and free trade"
      ],
      answer: 0,
      rationale: "Maximum employment and stable prices. In normal times these goals point the same way, but after a supply shock they conflict directly — which is what makes stagflation so hard for a dual-mandate central bank." },

    { id: "ch17_hard_time_inconsistency", chapter: 17, kind: "mc", render: "text",
      difficulty: "hard", concept: "time inconsistency and credibility", points: 3,
      prompt: "A central bank announces a low inflation target. Once workers and firms have set wages and prices on the basis of that announcement, the bank is tempted to inflate anyway, to get a short-run boost in output. If the public ANTICIPATES this temptation, what is the outcome?",
      options: [
        "Higher inflation with no gain in output, because expectations already incorporate the expected inflation",
        "Lower inflation and higher output, because the announcement was credible",
        "Lower inflation and lower output",
        "No change in either inflation or output"
      ],
      answer: 0,
      rationale: "This is the inflation-bias result. A rational public builds the expected inflation into wage and price setting, so the surprise never materializes and unemployment stays at the natural rate — leaving only the higher inflation. The way out is COMMITMENT: independence, a legislated target, or a reputation built over time, all of which remove the bank's ability to act on the temptation." },

    { id: "ch17_written_transmission", chapter: 17, kind: "short", render: "text",
      difficulty: "hard", concept: "monetary transmission", points: 4,
      prompt: "The central bank cuts its policy rate by half a percentage point. In 5–7 sentences, trace at least THREE distinct channels through which this could raise aggregate demand, and explain why the full effect takes many months to appear. Name one condition under which the cut might have very little effect at all.",
      answer: null,
      rubric: "Full credit (4 pts): (1) at least three distinct channels correctly described — interest-rate/investment channel (cheaper borrowing raises business investment and interest-sensitive consumer durables and housing); exchange-rate channel (lower domestic rates reduce demand for the currency, it depreciates, net exports rise); wealth/asset-price channel (lower rates raise equity and house prices, raising consumption); credit/bank-lending channel (easier lending standards, improved borrower balance sheets); expectations channel; (2) explicit statement that the channels operate with LAGS — investment projects and construction take time to plan and start, contracts reprice slowly, spending decisions respond gradually; (3) a valid condition for a weak effect — the zero lower bound leaving no room; a liquidity trap or horizontal LM; banks unwilling to lend or firms unwilling to borrow regardless of rates; deeply pessimistic expectations; heavily indebted households repairing balance sheets. Scoring: 2 pts for three correct channels (1 pt if only two), 1 pt for the lag explanation, 1 pt for the weak-effect condition.",
      rationale: "Three channels is the bar — most students name only the investment channel and stop." },

    /* ---- chapter 18 ---- */
    { id: "ch18_deficit_vs_debt", chapter: 18, kind: "mc", render: "text",
      difficulty: "easy", concept: "deficit vs debt", points: 1,
      prompt: "The difference between the budget deficit and the government debt is that:",
      options: [
        "The deficit is a flow measured over a period; the debt is a stock measured at a point in time and equals accumulated past deficits",
        "They are two names for the same quantity",
        "The debt is annual and the deficit is cumulative",
        "The deficit includes interest payments and the debt does not"
      ],
      answer: 0,
      rationale: "A deficit is like the water flowing into a bathtub each year; the debt is the level in the tub. The debt can keep rising even as the deficit shrinks — as long as the deficit is positive, the tub keeps filling, just more slowly." },

    { id: "ch18_hard_cyclically_adjusted", chapter: 18, kind: "mc", render: "text",
      difficulty: "hard", concept: "cyclically adjusted budget balance", points: 3,
      prompt: "During a recession the budget deficit widens sharply even though no new legislation has been passed. Why do economists look at the CYCLICALLY ADJUSTED balance instead of the headline figure?",
      options: [
        "Because the headline deficit moves automatically with the cycle, so it confuses the effect of the economy on the budget with the effect of policy on the economy",
        "Because the headline deficit is usually measured with errors",
        "Because interest payments should never be counted",
        "Because the cyclically adjusted balance is always smaller"
      ],
      answer: 0,
      rationale: "Automatic stabilizers mean tax revenue falls and transfers rise in a downturn with no policy change at all. To judge the fiscal STANCE — what policymakers are actually doing — you have to strip out the part of the balance the cycle produced. Otherwise you would read a recession as fiscal expansion and a boom as austerity." },

    { id: "ch18_written_fiscal_vs_monetary", chapter: 18, kind: "short", render: "text",
      difficulty: "hard", concept: "choosing a stabilization tool", points: 4,
      prompt: "A deep recession has begun and the central bank's policy rate is already near zero. In 5–7 sentences, argue whether fiscal or monetary policy should take the lead. Address the lag problem for each, explain what the zero lower bound does to the relative effectiveness of the two, and identify one serious risk of the course you recommend.",
      answer: null,
      rubric: "Full credit (4 pts): (1) correct treatment of the ZLB — conventional monetary policy has little room left, so its usual channel is impaired, which strengthens the case for fiscal action; credit is also given for noting that unconventional tools (QE, forward guidance) remain but are less reliable; (2) the lag comparison — monetary policy has no legislative lag and acts fast in financial markets but with a long transmission lag to output; fiscal policy has recognition, legislative and implementation lags, though transfers and tax changes act faster than infrastructure; (3) the crowding-out point — at the ZLB a fiscal expansion does not push rates up, so the multiplier is larger than usual, which is the strongest technical argument for fiscal leadership here; (4) a serious, honestly stated risk of the recommended course — e.g. rising debt and future sustainability if r exceeds g, political difficulty of reversing stimulus later, poorly targeted or wasteful spending, inflation if the output gap is smaller than believed, or (for the monetary route) asset-price distortions and financial-stability risk. Award 1 pt per element. A recommendation with no acknowledged risk is capped at 3 pts.",
      rationale: "The larger multiplier at the ZLB is the technically strongest argument; naming a genuine risk of one's own recommendation is what distinguishes an argument from advocacy." }
  ];

  MA.register(G, STATIC);
})(typeof globalThis !== "undefined" ? globalThis : this);
