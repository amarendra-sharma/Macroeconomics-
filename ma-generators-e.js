/* ============================================================================
   ma-generators-e.js  —  gap-filling question generators for the Applied
   Macroeconomics exam bank.

   WHY THIS FILE EXISTS
   An audit of the bank on 2026-10-24 found the 204 generators in
   ma-generators{,-b,-c,-d}.js unevenly spread:

     * GRAPHICAL items existed for only 11 of the 18 chapters. Chapters 1, 3, 5,
       7, 8, 12 and 18 had none at all, so an exam on the national accounts or
       on fiscal policy could not ask a student to read a diagram.
     * WRITTEN items ran about one per chapter.
     * Of 204 items, 148 were labelled "hard" — a copied default rather than a
       judgment, which made the builder's difficulty filter useless.

   This file is ADDITIVE. It touches none of the four existing files; it calls
   MAGenerators.register(), which refuses to overwrite an existing id, so a
   name collision fails loudly at load instead of silently replacing a
   generator the textbook already relies on.

   THE SAME CONTRACT AS THE OTHER FOUR FILES
     { id, chapter, kind:'numeric'|'mc'|'short', render:'text'|'graphical',
       difficulty:'easy'|'med'|'hard', concept, points,
       build: function (rng, cfg) -> {
         prompt, options?, diagramSpec?, answer, tolerance?, rationale, rubric? } }

   Determinism is the whole design: the browser builds the question from a seed
   and the ma-grade-attempt / ma-grade edge functions rebuild it from the SAME
   seed to grade it, so the correct answer never travels to the browser. That
   only holds while both sides load this file — see DEPLOYMENT at the foot.

   Safari-safe throughout: var, function declarations, string concatenation. No
   template literals, arrow functions, optional chaining or nullish coalescing.
   ============================================================================ */
(function (global) {
  "use strict";

  var MA = global.MAGenerators;
  if (!MA || !MA.register || !MA.util) {
    throw new Error("ma-generators-e.js: load ma-generators.js first");
  }
  var U = MA.util;
  var ri = U.rng_int, pick = U.rng_pick, r1 = U.round1, r2 = U.round2;
  var money = U.money, shuffleWithAnswer = U.shuffleWithAnswer;

  var G = {};

  /* Index path compounding at a constant rate, for the series diagrams. */
  function path(base, rate, years, step) {
    var out = [], v = base;
    for (var t = 0; t <= years; t += (step || 1)) {
      out.push([t, Math.round(v * 10) / 10]);
      v = v * (1 + rate);
    }
    return out;
  }
  function lastY(pts) { return pts[pts.length - 1][1]; }

  /* ======================================================================
     CHAPTER 1 — WHAT ECONOMICS ACTUALLY STUDIES   (PPF: no graphical item
     existed for this chapter, though the PPF is its central diagram)
     ====================================================================== */

  G["ch1_g_ppf_attainable"] = {
    id: "ch1_g_ppf_attainable", chapter: 1, kind: "mc", render: "graphical",
    difficulty: "easy", concept: "production possibilities", points: 1,
    build: function (rng) {
      var xmax = pick(rng, [8, 10, 12]), ymax = pick(rng, [8, 10, 12]), bow = 0.28;
      function fy(x) {
        var t = x / xmax;
        return (1 - t) * ymax + bow * ymax * Math.sin(Math.PI * t) * 0.9;
      }
      var xa = r1(xmax * 0.45), xb = r1(xmax * 0.70), xc = r1(xmax * 0.80);
      var A = { x: xa, y: r1(fy(xa)), label: "A", state: "on" };
      var B = { x: xb, y: r1(fy(xb) * 0.62), label: "B", state: "inside" };
      var Cp = { x: xc, y: r1(Math.min(ymax, fy(xc) + ymax * 0.30)), label: "C", state: "outside" };
      var pool = [
        "C — it lies beyond the frontier, so the economy lacks the resources to produce it",
        "B — it lies inside the frontier, so it wastes resources",
        "A — it lies on the frontier, so it is fully efficient",
        "None of them; every point drawn is attainable"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Three production bundles are marked on this economy's production " +
          "possibilities frontier. Which one is UNATTAINABLE with current resources " +
          "and technology?",
        diagramSpec: { type: "ppf", xmax: xmax, ymax: ymax, bow: bow,
          xlab: "Consumer goods", ylab: "Capital goods",
          points: [A, B, Cp] },
        options: sh.options, answer: sh.correctIndex,
        rationale: "The frontier marks the most of one good obtainable given the amount of the " +
          "other, so every attainable bundle lies on it or inside it. A is efficient — on the " +
          "frontier, no resources idle. B is attainable but inefficient: the economy could have " +
          "more of both goods. C is outside the frontier and so cannot be produced at all until " +
          "resources or technology grow, which is what shifts the frontier outward."
      };
    }
  };

  G["ch1_g_ppf_opp_cost"] = {
    id: "ch1_g_ppf_opp_cost", chapter: 1, kind: "numeric", render: "graphical",
    difficulty: "med", concept: "opportunity cost", points: 2,
    build: function (rng) {
      var xmax = 10, ymax = pick(rng, [10, 20, 40]), bow = 0.28;
      function fy(x) {
        var t = x / xmax;
        return (1 - t) * ymax + bow * ymax * Math.sin(Math.PI * t) * 0.9;
      }
      var x1 = pick(rng, [2, 3, 4]), x2 = x1 + pick(rng, [2, 3]);
      var y1 = fy(x1), y2 = fy(x2);
      var given = r1(y1 - y2);
      return {
        prompt: "Moving along the frontier from point A (" + x1 + " units of consumer goods) " +
          "to point B (" + x2 + " units of consumer goods), how many units of CAPITAL goods " +
          "must this economy give up? Give your answer to one decimal place.",
        diagramSpec: { type: "ppf", xmax: xmax, ymax: ymax, bow: bow,
          xlab: "Consumer goods", ylab: "Capital goods",
          points: [ { x: x1, y: r1(y1), label: "A", state: "on" },
                    { x: x2, y: r1(y2), label: "B", state: "on" } ] },
        answer: given, tolerance: 0.35,
        rationale: "Opportunity cost along a frontier is read off as the vertical drop: the " +
          "economy moves from " + r1(y1) + " units of capital goods to " + r1(y2) + ", so it " +
          "sacrifices " + given + " units. The cost is not a price — nothing is bought or sold " +
          "here. It is the best alternative use of the resources being reallocated."
      };
    }
  };

  G["ch1_g_hard_ppf_bow"] = {
    id: "ch1_g_hard_ppf_bow", chapter: 1, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "increasing opportunity cost", points: 3,
    build: function (rng) {
      var xmax = 10, ymax = pick(rng, [10, 20]);
      var pool = [
        "Resources are not equally suited to both goods, so the units switched over later are " +
          "progressively worse at producing the new good",
        "The economy is becoming less efficient as it moves along the frontier",
        "There are economies of scale in producing the good on the horizontal axis",
        "Consumers' preferences shift as production changes"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "This frontier bows outward from the origin, so the opportunity cost of the " +
          "good on the horizontal axis RISES as more of it is produced. What accounts for that?",
        diagramSpec: { type: "ppf", xmax: xmax, ymax: ymax, bow: 0.34,
          xlab: "Consumer goods", ylab: "Capital goods",
          points: [ { x: 1.5, y: r1(ymax * 0.90), label: "", state: "on" },
                    { x: 8.5, y: r1(ymax * 0.20), label: "", state: "on" } ] },
        options: sh.options, answer: sh.correctIndex,
        rationale: "Specialization of resources is what curves the frontier. The first workers " +
          "and machines moved into consumer goods are the ones least useful in capital goods, so " +
          "little is lost. Push further and the economy has to reassign resources that were " +
          "highly productive in capital goods, so each additional unit of consumer goods costs " +
          "more. Every point on the frontier is efficient throughout — the curvature is about " +
          "the RATE of trade-off, not about waste. A straight frontier would mean resources are " +
          "perfectly substitutable between the two goods."
      };
    }
  };

  /* ======================================================================
     CHAPTER 3 — TRADE AND THE DISTRIBUTIONAL QUESTION
     ====================================================================== */

  G["ch3_g_world_price"] = {
    id: "ch3_g_world_price", chapter: 3, kind: "mc", render: "graphical",
    difficulty: "easy", concept: "gains from trade", points: 1,
    build: function (rng) {
      var qStar = ri(rng, 4, 6), pStar = ri(rng, 5, 8);
      var dB = pick(rng, [1, 2]), sB = pick(rng, [1, 2]);
      var dA = pStar + dB * qStar, sA = pStar - sB * qStar;
      var below = rng() < 0.5;
      var pw = below ? pStar - pick(rng, [2, 3]) : pStar + pick(rng, [2, 3]);
      var pool = [
        "An IMPORTER of the good, because the world price is below its no-trade price",
        "An EXPORTER of the good, because the world price is above its no-trade price",
        "Neither; it would not trade this good at all",
        "It depends on the elasticity of demand, which cannot be read from the diagram"
      ];
      var sh = shuffleWithAnswer(rng, pool, below ? 0 : 1);
      return {
        prompt: "Without trade this market clears at a price of " + money(pStar) +
          ". The country then opens to trade at a world price of " + money(pw) +
          ". Does it become an importer or an exporter of this good?",
        diagramSpec: { type: "supply_demand", dA: dA, dB: -dB, sA: sA, sB: sB,
          xlab: "Quantity", ylab: "Price",
          xmax: Math.max(10, qStar + 5), ymax: Math.max(12, dA + 2) },
        options: sh.options, answer: sh.correctIndex,
        rationale: (below
          ? "At a world price of " + money(pw) + ", below the domestic no-trade price of " +
            money(pStar) + ", domestic buyers want more than domestic sellers will supply at " +
            "that price. The gap is filled by imports."
          : "At a world price of " + money(pw) + ", above the domestic no-trade price of " +
            money(pStar) + ", domestic sellers want to sell more than domestic buyers will take " +
            "at that price. The surplus is exported.") +
          " The rule is simply whether the world price sits below or above the autarky price; " +
          "elasticities govern how LARGE the trade flow is, not its direction."
      };
    }
  };

  G["ch3_g_import_quantity"] = {
    id: "ch3_g_import_quantity", chapter: 3, kind: "numeric", render: "graphical",
    difficulty: "med", concept: "import volume", points: 2,
    build: function (rng) {
      var qStar = ri(rng, 4, 6), pStar = ri(rng, 6, 9);
      var dB = pick(rng, [1, 2]), sB = pick(rng, [1, 2]);
      var dA = pStar + dB * qStar, sA = pStar - sB * qStar;
      var drop = pick(rng, [2, 3, 4]);
      var pw = pStar - drop;
      var qd = (dA - pw) / dB;         /* demand at the world price */
      var qs = (pw - sA) / sB;         /* supply at the world price */
      var imports = r2(qd - qs);
      return {
        prompt: "Domestic demand is P = " + dA + " − " + dB + "Q and domestic supply is P = " +
          sA + " + " + sB + "Q. The country opens to trade at a world price of " + money(pw) +
          ". How many units does it IMPORT? Give your answer to two decimal places.",
        diagramSpec: { type: "supply_demand", dA: dA, dB: -dB, sA: sA, sB: sB,
          xlab: "Quantity", ylab: "Price",
          xmax: Math.max(12, qd + 3), ymax: Math.max(12, dA + 2) },
        answer: imports, tolerance: 0.06,
        rationale: "Imports are the horizontal gap between domestic demand and domestic supply " +
          "at the world price, not at the old equilibrium. Quantity demanded is (" + dA +
          " − " + pw + ") / " + dB + " = " + r2(qd) + "; quantity supplied is (" + pw +
          " − " + sA + ") / " + sB + " = " + r2(qs) + ". Imports = " + r2(qd) + " − " +
          r2(qs) + " = " + imports + " units. Domestic production falls and domestic consumption " +
          "rises; the difference is what crosses the border."
      };
    }
  };

  G["ch3_g_hard_trade_winners"] = {
    id: "ch3_g_hard_trade_winners", chapter: 3, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "distribution of gains", points: 3,
    build: function (rng) {
      var qStar = ri(rng, 4, 6), pStar = ri(rng, 7, 9);
      var dB = pick(rng, [1, 2]), sB = pick(rng, [1, 2]);
      var dA = pStar + dB * qStar, sA = pStar - sB * qStar;
      var pw = pStar - pick(rng, [2, 3]);
      var pool = [
        "Consumers gain more than producers lose, so total surplus rises — but producers are " +
          "genuinely worse off",
        "Both consumers and producers gain, which is why trade is uncontroversial",
        "Producers gain and consumers lose, since the domestic price falls below cost",
        "Total surplus is unchanged; trade only redistributes it"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "This country opens to trade at a world price of " + money(pw) + ", below its " +
          "no-trade price of " + money(pStar) + ". Who gains and who loses, and what happens to " +
          "total surplus?",
        diagramSpec: { type: "supply_demand", dA: dA, dB: -dB, sA: sA, sB: sB,
          xlab: "Quantity", ylab: "Price",
          xmax: Math.max(12, qStar + 5), ymax: Math.max(12, dA + 2) },
        options: sh.options, answer: sh.correctIndex,
        rationale: "The price falls to the world level, so consumer surplus rises and producer " +
          "surplus falls. The consumer gain exceeds the producer loss, leaving a net gain equal " +
          "to the triangle between the two curves over the imported range — that net gain is the " +
          "standard case for trade. The distributional point is the one that drives the politics: " +
          "the gain is spread thinly over many buyers while the loss is concentrated on the " +
          "domestic industry, which is why the losers organize and the winners usually do not. " +
          "A compensation scheme, not a denial of the loss, is the economically coherent answer."
      };
    }
  };

  /* ======================================================================
     CHAPTER 5 — ELASTICITY
     ====================================================================== */

  G["ch5_g_which_elastic"] = {
    id: "ch5_g_which_elastic", chapter: 5, kind: "mc", render: "graphical",
    difficulty: "easy", concept: "reading elasticity from slope", points: 1,
    build: function (rng) {
      var qStar = ri(rng, 4, 6), pStar = ri(rng, 6, 9);
      var steep = rng() < 0.5;
      var dB = steep ? pick(rng, [3, 4]) : 1;
      var sB = pick(rng, [1, 2]);
      var dA = pStar + dB * qStar, sA = pStar - sB * qStar;
      var pool = [
        "Relatively INELASTIC — quantity demanded responds little to a change in price",
        "Relatively ELASTIC — quantity demanded responds a great deal to a change in price",
        "Unit elastic at every price",
        "Perfectly inelastic"
      ];
      var sh = shuffleWithAnswer(rng, pool, steep ? 0 : 1);
      return {
        prompt: "Judging by the demand curve drawn here, demand in this market is best described " +
          "as which of the following?",
        diagramSpec: { type: "supply_demand", dA: dA, dB: -dB, sA: sA, sB: sB,
          xlab: "Quantity", ylab: "Price",
          xmax: Math.max(10, qStar + 5), ymax: Math.max(12, dA + 2) },
        options: sh.options, answer: sh.correctIndex,
        rationale: (steep
          ? "A steep demand curve means a large price change buys only a small quantity response, " +
            "which is inelastic demand — think insulin or petrol in the short run."
          : "A shallow demand curve means a small price change produces a large quantity response, " +
            "which is elastic demand — think one brand of biscuit among many.") +
          " Treat this as a reading skill with a caveat: slope and elasticity are not the same " +
          "thing, because elasticity compares PERCENTAGE changes and so varies along a straight " +
          "line. Comparing two curves drawn on the same axes over the same region is the case " +
          "where the visual shortcut is safe."
      };
    }
  };

  G["ch5_g_revenue_direction"] = {
    id: "ch5_g_revenue_direction", chapter: 5, kind: "mc", render: "graphical",
    difficulty: "med", concept: "elasticity and revenue", points: 2,
    build: function (rng) {
      var qStar = ri(rng, 4, 6), pStar = ri(rng, 6, 9);
      var inelastic = rng() < 0.5;
      var dB = inelastic ? pick(rng, [3, 4]) : 1;
      var sB = pick(rng, [1, 2]);
      var dA = pStar + dB * qStar, sA = pStar - sB * qStar;
      var pool = [
        "Total revenue RISES, because demand is inelastic and quantity falls proportionally less " +
          "than price rises",
        "Total revenue FALLS, because demand is elastic and quantity falls proportionally more " +
          "than price rises",
        "Total revenue is unchanged, because price and quantity always move in offsetting ways",
        "Total revenue falls to zero, since buyers leave the market"
      ];
      var sh = shuffleWithAnswer(rng, pool, inelastic ? 0 : 1);
      return {
        prompt: "Sellers in this market raise the price by a small amount. Using the demand curve " +
          "shown, what happens to their TOTAL REVENUE?",
        diagramSpec: { type: "supply_demand", dA: dA, dB: -dB, sA: sA, sB: sB,
          xlab: "Quantity", ylab: "Price", showRevenueBox: true,
          xmax: Math.max(10, qStar + 5), ymax: Math.max(12, dA + 2) },
        options: sh.options, answer: sh.correctIndex,
        rationale: "Revenue is price times quantity, so a price rise sets a gain on each unit " +
          "still sold against the loss of the units no longer sold. " +
          (inelastic
            ? "Demand here is inelastic: the quantity response is proportionally smaller than the " +
              "price change, so the gain dominates and revenue rises."
            : "Demand here is elastic: the quantity response is proportionally larger than the " +
              "price change, so the loss dominates and revenue falls.") +
          " This is the single most useful consequence of elasticity, and why a tax on a " +
          "price-insensitive good raises money while the same tax on a substitutable good mostly " +
          "drives the activity elsewhere."
      };
    }
  };

  G["ch5_g_hard_incidence"] = {
    id: "ch5_g_hard_incidence", chapter: 5, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "tax incidence and elasticity", points: 3,
    build: function (rng) {
      var qStar = ri(rng, 4, 6), pStar = ri(rng, 7, 10);
      var demandSteep = rng() < 0.5;
      var dB = demandSteep ? 4 : 1;
      var sB = demandSteep ? 1 : 4;
      var dA = pStar + dB * qStar, sA = pStar - sB * qStar;
      var pool = [
        "Mostly by BUYERS, because demand is the less elastic side of this market",
        "Mostly by SELLERS, because supply is the less elastic side of this market",
        "Split exactly in half, because the tax is levied per unit",
        "Entirely by whichever side the government collects the tax from"
      ];
      var sh = shuffleWithAnswer(rng, pool, demandSteep ? 0 : 1);
      return {
        prompt: "A per-unit tax is imposed in the market shown. Who bears the larger share of it?",
        diagramSpec: { type: "supply_demand", dA: dA, dB: -dB, sA: sA, sB: sB,
          xlab: "Quantity", ylab: "Price",
          xmax: Math.max(10, qStar + 5), ymax: Math.max(14, dA + 2) },
        options: sh.options, answer: sh.correctIndex,
        rationale: "Incidence follows relative elasticity, not the statutory point of collection. " +
          "The side that can least easily change its quantity absorbs the tax, because it has the " +
          "weakest alternative to paying. " +
          (demandSteep
            ? "Here demand is steep and supply shallow, so buyers are the stuck side and bear most " +
              "of the tax."
            : "Here supply is steep and demand shallow, so sellers are the stuck side and bear " +
              "most of the tax.") +
          " Who writes the cheque is a matter of administration and is irrelevant to the economics " +
          "— the payroll tax is the standard real-world illustration, with the legally split " +
          "employer and employee halves both landing largely on wages."
      };
    }
  };

  /* ======================================================================
     CHAPTER 7 — MEASURING NATIONAL INCOME
     ====================================================================== */

  G["ch7_g_real_vs_nominal"] = {
    id: "ch7_g_real_vs_nominal", chapter: 7, kind: "mc", render: "graphical",
    difficulty: "easy", concept: "real versus nominal GDP", points: 1,
    build: function (rng) {
      var years = 10;
      var realR = pick(rng, [0.015, 0.02, 0.025]);
      var infl = pick(rng, [0.02, 0.03, 0.035]);
      var realPath = path(100, realR, years);
      var nomPath = path(100, realR + infl, years);
      var pool = [
        "The lower line, because it strips out price changes and so grows more slowly when " +
          "inflation is positive",
        "The upper line, because real values are always larger than nominal ones",
        "The upper line, because it has been adjusted upward for inflation",
        "Neither line can be identified without knowing the base year"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Both series are indexed to 100 in year 0. Which line is REAL GDP?",
        diagramSpec: { type: "series", xlab: "Year", ylab: "Index (year 0 = 100)",
          xmax: years, ymin: 95, ymax: Math.ceil(lastY(nomPath) / 5) * 5 + 5, gridY: true,
          series: [ { points: nomPath, label: "Series 1", color: "supply", markers: true },
                    { points: realPath, label: "Series 2", color: "demand", markers: true } ] },
        options: sh.options, answer: sh.correctIndex,
        rationale: "Nominal GDP rises with both output and prices; real GDP holds prices fixed at " +
          "a base year and so reflects quantities alone. With positive inflation the nominal line " +
          "must therefore sit above the real line, and the gap between them widens over time. " +
          "Here real output grows about " + Math.round(realR * 1000) / 10 + "% a year while the " +
          "nominal series grows about " + Math.round((realR + infl) * 1000) / 10 + "%, the " +
          "difference being inflation. The two coincide only in the base year, where the index is " +
          "100 by construction."
      };
    }
  };

  G["ch7_g_deflator_from_paths"] = {
    id: "ch7_g_deflator_from_paths", chapter: 7, kind: "numeric", render: "graphical",
    difficulty: "med", concept: "GDP deflator", points: 2,
    build: function (rng) {
      var years = 8;
      var realR = pick(rng, [0.02, 0.025]);
      var infl = pick(rng, [0.02, 0.03, 0.04]);
      var realPath = path(100, realR, years);
      var nomPath = path(100, realR + infl, years);
      var yr = pick(rng, [6, 7, 8]);
      var nom = nomPath[yr][1], real = realPath[yr][1];
      var defl = r1(100 * nom / real);
      return {
        prompt: "In year " + yr + ", nominal GDP stands at " + nom + " and real GDP at " + real +
          " on this index. What is the GDP deflator in year " + yr +
          "? Give your answer to one decimal place.",
        diagramSpec: { type: "series", xlab: "Year", ylab: "Index (year 0 = 100)",
          xmax: years, ymin: 95, ymax: Math.ceil(lastY(nomPath) / 5) * 5 + 5, gridY: true,
          series: [ { points: nomPath, label: "Nominal GDP", color: "supply", markers: true },
                    { points: realPath, label: "Real GDP", color: "demand", markers: true } ],
          marks: [ { x: yr, y: nom, label: "" }, { x: yr, y: real, label: "" } ] },
        answer: defl, tolerance: 0.6,
        rationale: "The deflator is 100 × nominal GDP / real GDP = 100 × " + nom +
          " / " + real + " = " + defl + ". It is a price index built from the ratio of the two " +
          "series, so it answers the question “how much of the rise in nominal GDP was just " +
          "prices?”. Note the deflator weights goods by their CURRENT shares in output, which " +
          "is what distinguishes it from the CPI's fixed basket."
      };
    }
  };

  G["ch7_g_hard_growth_gap"] = {
    id: "ch7_g_hard_growth_gap", chapter: 7, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "interpreting growth paths", points: 3,
    build: function (rng) {
      var years = 10;
      var realR = pick(rng, [0.005, 0.01]);
      var infl = pick(rng, [0.05, 0.06, 0.07]);
      var realPath = path(100, realR, years);
      var nomPath = path(100, realR + infl, years);
      var pool = [
        "Living standards barely improved: almost all of the nominal rise was inflation, and real " +
          "output per year grew only about " + Math.round(realR * 1000) / 10 + "%",
        "Living standards roughly " + Math.round(lastY(nomPath) - 100) + "% higher, since nominal " +
          "GDP is what households actually earn and spend",
        "The economy was in recession throughout, because real GDP grew more slowly than prices",
        "Nothing can be said, because an index tells you nothing about levels"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "A minister points at the upper line and claims the economy has grown by roughly " +
          Math.round(lastY(nomPath) - 100) + "% over the decade. What is the right reading of " +
          "these two series?",
        diagramSpec: { type: "series", xlab: "Year", ylab: "Index (year 0 = 100)",
          xmax: years, ymin: 95, ymax: Math.ceil(lastY(nomPath) / 5) * 5 + 5, gridY: true,
          series: [ { points: nomPath, label: "Nominal GDP", color: "supply", markers: true },
                    { points: realPath, label: "Real GDP", color: "demand", markers: true } ] },
        options: sh.options, answer: sh.correctIndex,
        rationale: "Nominal GDP rose about " + Math.round(lastY(nomPath) - 100) +
          "% while real GDP rose only about " + Math.round(lastY(realPath) - 100) +
          "%; the wedge is roughly " + Math.round(infl * 1000) / 10 +
          "% inflation a year. Quoting the nominal figure as growth is the classic rhetorical " +
          "move in a high-inflation economy, and it is exactly why the real series exists. Two " +
          "further cautions even on the real figure: it says nothing about GDP PER PERSON if " +
          "population grew, and nothing about the distribution of the gain."
      };
    }
  };

  /* ======================================================================
     CHAPTER 8 — MEASURING THE COST OF LIVING
     ====================================================================== */

  G["ch8_g_inflation_direction"] = {
    id: "ch8_g_inflation_direction", chapter: 8, kind: "mc", render: "graphical",
    difficulty: "easy", concept: "price level versus inflation rate", points: 1,
    build: function (rng) {
      var years = 8;
      var pts = [[0, 100]];
      var v = 100, rates = [];
      for (var t = 1; t <= years; t++) {
        var rt = pick(rng, [0.045, 0.04, 0.035, 0.03, 0.02, 0.015]);
        if (t > 1 && rt >= rates[rates.length - 1]) { rt = rates[rates.length - 1] - 0.005; }
        if (rt < 0.005) { rt = 0.005; }
        rates.push(rt);
        v = v * (1 + rt);
        pts.push([t, Math.round(v * 10) / 10]);
      }
      var pool = [
        "Prices kept RISING, but at a slowing rate — inflation was positive and falling",
        "Prices FELL over the period — the economy experienced deflation",
        "Prices were stable, because the line never turns downward",
        "Inflation was negative, because the curve flattens"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "This is the consumer price index for an economy, with year 0 = 100. What " +
          "happened to prices and to the inflation RATE over the period?",
        diagramSpec: { type: "series", xlab: "Year", ylab: "CPI (year 0 = 100)",
          xmax: years, ymin: 95, ymax: Math.ceil(pts[years][1] / 5) * 5 + 5, gridY: true,
          series: [ { points: pts, label: "CPI", color: "demand", markers: true } ] },
        options: sh.options, answer: sh.correctIndex,
        rationale: "The level of the index is the price LEVEL; its slope is the inflation RATE. " +
          "The line rises throughout, so prices rose every year and inflation stayed positive. " +
          "But the rise flattens, so the rate of increase fell — disinflation, not deflation. " +
          "Deflation would require the line itself to turn downward. Confusing a falling " +
          "inflation rate with falling prices is one of the most common errors in reading these " +
          "charts, and it matters: disinflation leaves nominal debts untouched, while deflation " +
          "makes them heavier."
      };
    }
  };

  G["ch8_g_inflation_rate_calc"] = {
    id: "ch8_g_inflation_rate_calc", chapter: 8, kind: "numeric", render: "graphical",
    difficulty: "med", concept: "computing an inflation rate", points: 2,
    build: function (rng) {
      var years = 8;
      var rate = pick(rng, [0.02, 0.025, 0.03, 0.04]);
      var pts = path(100, rate, years);
      var y2 = pick(rng, [5, 6, 7, 8]);
      var y1 = y2 - pick(rng, [1, 2]);
      var c1 = pts[y1][1], c2 = pts[y2][1];
      var ans = r2(100 * (c2 - c1) / c1);
      return {
        prompt: "Using this CPI series, what was the total percentage change in the price level " +
          "between year " + y1 + " (CPI = " + c1 + ") and year " + y2 + " (CPI = " + c2 +
          ")? Give your answer in percent to two decimal places.",
        diagramSpec: { type: "series", xlab: "Year", ylab: "CPI (year 0 = 100)",
          xmax: years, ymin: 95, ymax: Math.ceil(pts[years][1] / 5) * 5 + 5, gridY: true,
          series: [ { points: pts, label: "CPI", color: "demand", markers: true } ],
          marks: [ { x: y1, y: c1, label: "" }, { x: y2, y: c2, label: "" } ] },
        answer: ans, tolerance: 0.12,
        rationale: "The percentage change in a price index is (new − old) / old × 100 = (" +
          c2 + " − " + c1 + ") / " + c1 + " × 100 = " + ans + "%. Note that over " +
          (y2 - y1) + " year(s) this is a cumulative figure, not an annual rate: dividing by the " +
          "number of years gives a rough annual average, and compounding gives the exact one. " +
          "Subtracting the index values to get “" + r1(c2 - c1) +
          " percent” is the standard mistake, and it is only correct when the base year " +
          "index is exactly 100."
      };
    }
  };

  G["ch8_g_hard_cpi_vs_deflator"] = {
    id: "ch8_g_hard_cpi_vs_deflator", chapter: 8, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "CPI versus GDP deflator", points: 3,
    build: function (rng) {
      var years = 9;
      var base = pick(rng, [0.02, 0.025]);
      var wedge = pick(rng, [0.008, 0.012]);
      var cpi = path(100, base + wedge, years);
      var defl = path(100, base, years);
      var pool = [
        "Imported goods weigh heavily in the CPI basket but are excluded from the deflator, which " +
          "covers domestic production — so an import price shock lifts the CPI by more",
        "The CPI is calculated by a different agency, so the two are not comparable",
        "The deflator covers only consumer goods, while the CPI covers the whole economy",
        "The gap must be a measurement error, since both measure the same price level"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "The CPI has risen faster than the GDP deflator in this economy for nine years " +
          "running. Which explanation is most consistent with that pattern?",
        diagramSpec: { type: "series", xlab: "Year", ylab: "Index (year 0 = 100)",
          xmax: years, ymin: 95, ymax: Math.ceil(lastY(cpi) / 5) * 5 + 5, gridY: true,
          series: [ { points: cpi, label: "CPI", color: "supply", markers: true },
                    { points: defl, label: "GDP deflator", color: "demand", markers: true } ] },
        options: sh.options, answer: sh.correctIndex,
        rationale: "The two indices differ in three ways, and coverage is the one that produces a " +
          "persistent wedge. The deflator prices domestic OUTPUT, so imports are not in it; the " +
          "CPI prices what households BUY, imports included. A sustained rise in import prices " +
          "(oil being the textbook case) therefore pushes the CPI above the deflator year after " +
          "year. The other two differences are weighting — the CPI holds its basket fixed while " +
          "the deflator reweights each period, which gives the CPI a substitution bias upward — " +
          "and the deflator's inclusion of investment and government purchases. Both indices are " +
          "competently produced; the gap is real, not error."
      };
    }
  };

  /* ======================================================================
     CHAPTER 12 — MONEY GROWTH AND INFLATION
     ====================================================================== */

  G["ch12_g_quantity_theory_line"] = {
    id: "ch12_g_quantity_theory_line", chapter: 12, kind: "mc", render: "graphical",
    difficulty: "easy", concept: "quantity theory of money", points: 1,
    build: function (rng) {
      var growth = pick(rng, [2, 3]);
      var pool = [
        "Roughly one-for-one: over the long run, faster money growth shows up as faster inflation",
        "No relationship: inflation is driven by firms' pricing decisions, not by money",
        "Inversely: faster money growth reduces inflation by raising output",
        "One-for-one in the short run but not the long run"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Each point on this line is a country's average money growth and average " +
          "inflation over three decades. What does the relationship imply?",
        diagramSpec: { type: "curve", a: 0, b: 1, xlab: "Money growth (% per year)",
          ylab: "Inflation (% per year)", xmax: 20, ymax: 20,
          label: "45° line", color: "demand" },
        options: sh.options, answer: sh.correctIndex,
        rationale: "The quantity equation MV = PY, in growth rates, gives %ΔM + %ΔV = " +
          "%ΔP + %ΔY. Over long horizons velocity and real output growth are comparatively " +
          "stable, so the money growth rate and the inflation rate move together nearly " +
          "one-for-one — which is what a slope of about 1 on this scatter shows. This is among " +
          "the most robust regularities in macroeconomics across countries and centuries. It is a " +
          "LONG-run statement: over a few quarters, velocity and output move enough to break the " +
          "link entirely."
      };
    }
  };

  G["ch12_g_fisher_real_rate"] = {
    id: "ch12_g_fisher_real_rate", chapter: 12, kind: "numeric", render: "graphical",
    difficulty: "med", concept: "Fisher effect", points: 2,
    build: function (rng) {
      var years = 9;
      var nomR = ri(rng, 5, 9), inflR = ri(rng, 2, 6);
      if (inflR >= nomR) { inflR = nomR - 2; }
      var nomPts = [], inflPts = [];
      for (var t = 0; t <= years; t++) {
        nomPts.push([t, nomR + (t % 3 === 0 ? 0.4 : -0.3)]);
        inflPts.push([t, inflR + (t % 2 === 0 ? 0.3 : -0.2)]);
      }
      var ans = r1(nomR - inflR);
      return {
        prompt: "The nominal interest rate in this economy averages about " + nomR +
          "% and inflation about " + inflR + "%. What is the approximate REAL interest rate, in " +
          "percent, to one decimal place?",
        diagramSpec: { type: "series", xlab: "Year", ylab: "Percent per year",
          xmax: years, ymax: Math.max(12, nomR + 4), gridY: true,
          series: [ { points: nomPts, label: "Nominal rate", color: "supply", markers: true },
                    { points: inflPts, label: "Inflation", color: "demand", markers: true } ] },
        answer: ans, tolerance: 0.45,
        rationale: "The Fisher equation in its approximate form is real = nominal − inflation = " +
          nomR + " − " + inflR + " = " + ans + "%. The real rate is what a lender actually " +
          "earns in purchasing power, and it is the rate that governs saving and investment " +
          "decisions. The vertical gap between these two lines IS the real rate, which is why an " +
          "unexpected jump in inflation transfers wealth from lenders to borrowers: the nominal " +
          "rate was already fixed in the contract, so the realized real rate falls."
      };
    }
  };

  G["ch12_g_hard_velocity_residual"] = {
    id: "ch12_g_hard_velocity_residual", chapter: 12, kind: "numeric", render: "graphical",
    difficulty: "hard", concept: "quantity equation in growth rates", points: 3,
    build: function (rng) {
      var years = 9;
      var mG = ri(rng, 6, 12), pG = ri(rng, 2, 5), yG = ri(rng, 1, 3);
      var vG = r1(pG + yG - mG);
      var mPts = [], pPts = [];
      for (var t = 0; t <= years; t++) {
        mPts.push([t, mG + (t % 2 === 0 ? 0.5 : -0.4)]);
        pPts.push([t, pG + (t % 3 === 0 ? 0.3 : -0.3)]);
      }
      return {
        prompt: "The money supply grows at " + mG + "% a year, the price level at " + pG +
          "% a year, and real output at " + yG + "% a year. Using the growth-rate form of the " +
          "quantity equation, what is the growth rate of VELOCITY, in percent per year, to one " +
          "decimal place? A fall is a negative number.",
        diagramSpec: { type: "series", xlab: "Year", ylab: "Percent per year",
          xmax: years, ymax: Math.max(14, mG + 4), gridY: true,
          series: [ { points: mPts, label: "Money growth", color: "supply", markers: true },
                    { points: pPts, label: "Inflation", color: "demand", markers: true } ] },
        answer: vG, tolerance: 0.25,
        rationale: "From MV = PY, in growth rates %ΔM + %ΔV = %ΔP + %ΔY, so " +
          "%ΔV = %ΔP + %ΔY − %ΔM = " + pG + " + " + yG + " − " + mG +
          " = " + vG + "% a year. " +
          (vG < 0
            ? "Velocity is FALLING: money is growing faster than nominal output, so each unit of " +
              "money is changing hands less often. Households and banks are holding more money " +
              "relative to their spending — exactly what happened in the United States and Japan " +
              "after 2008, and why rapid base-money growth there did not deliver the inflation a " +
              "naive quantity-theory reading predicted."
            : "Velocity is RISING: nominal output is growing faster than the money stock, so each " +
              "unit of money is working harder. Sustained high inflation typically does this, " +
              "because holding money becomes expensive and people spend it faster.") +
          " The lesson is that the quantity theory is an identity plus an assumption about " +
          "velocity; when velocity moves, the assumption is what fails, not the arithmetic."
      };
    }
  };

  /* ======================================================================
     CHAPTER 18 — FISCAL POLICY
     ====================================================================== */

  G["ch18_g_which_curve_shifts"] = {
    id: "ch18_g_which_curve_shifts", chapter: 18, kind: "mc", render: "graphical",
    difficulty: "easy", concept: "fiscal policy and aggregate demand", points: 1,
    build: function (rng) {
      var yn = ri(rng, 5, 7);
      var adB = pick(rng, [1, 2]), srB = pick(rng, [1, 2]);
      var pStar = ri(rng, 4, 6);
      var adA = pStar + adB * yn, srA = pStar - srB * yn;
      var expand = rng() < 0.5;
      var pool = [
        "Aggregate demand shifts RIGHT, raising both output and the price level in the short run",
        "Aggregate demand shifts LEFT, lowering both output and the price level in the short run",
        "Short-run aggregate supply shifts right, raising output and lowering prices",
        "Long-run aggregate supply shifts right, so output rises with no price effect"
      ];
      var sh = shuffleWithAnswer(rng, pool, expand ? 0 : 1);
      return {
        prompt: (expand
          ? "The government increases its purchases and cuts taxes."
          : "The government cuts its purchases and raises taxes.") +
          " In the AD–AS diagram shown, what happens in the short run?",
        diagramSpec: { type: "ad_as", adA: adA, adB: -adB, srA: srA, srB: srB, yn: yn,
          shift: { curve: "AD", by: expand ? pick(rng, [2, 3]) : -pick(rng, [2, 3]) },
          xlab: "Real GDP", ylab: "Price level",
          xmax: Math.max(12, yn + 5), ymax: Math.max(12, adA + 2) },
        options: sh.options, answer: sh.correctIndex,
        rationale: "Government purchases are a component of aggregate demand, and a tax change " +
          "moves disposable income and so consumption. Either way the AD curve itself moves. " +
          (expand
            ? "An expansion shifts AD right, so in the short run output rises above potential and " +
              "the price level rises with it."
            : "A contraction shifts AD left, so in the short run output falls below potential and " +
              "the price level falls with it.") +
          " Fiscal policy acts on aggregate supply only through its effect on capital, labour " +
          "supply and productivity — a slower channel, and the reason tax-reform arguments are " +
          "made about long-run growth rather than about this quarter's output."
      };
    }
  };

  G["ch18_g_multiplier_output"] = {
    id: "ch18_g_multiplier_output", chapter: 18, kind: "numeric", render: "graphical",
    difficulty: "med", concept: "spending multiplier", points: 2,
    build: function (rng) {
      var mpc = pick(rng, [0.6, 0.65, 0.7, 0.75, 0.8]);
      var spend = pick(rng, [20, 25, 40, 50, 60]);
      var mult = 1 / (1 - mpc);
      var ans = Math.round(spend * mult * 10) / 10;
      var yn = 6, adB = 1, srB = 1, pStar = 5;
      return {
        prompt: "The marginal propensity to consume is " + mpc + ". The government raises its " +
          "purchases by " + money(spend) + " billion. Holding the interest rate and the price " +
          "level fixed, by how many billions does aggregate demand rise in total? Give your " +
          "answer to one decimal place.",
        diagramSpec: { type: "ad_as", adA: pStar + adB * yn, adB: -adB,
          srA: pStar - srB * yn, srB: srB, yn: yn,
          shift: { curve: "AD", by: 2 },
          xlab: "Real GDP", ylab: "Price level", xmax: 12, ymax: 12 },
        answer: ans, tolerance: Math.max(0.3, ans * 0.01),
        rationale: "The spending multiplier is 1 / (1 − MPC) = 1 / (1 − " + mpc +
          ") = " + r2(mult) + ". Total effect = " + money(spend) + "bn × " + r2(mult) +
          " = " + money(ans) + "bn. The logic is a chain: the initial purchase becomes someone's " +
          "income, they spend " + mpc + " of it, that becomes someone else's income, and so on, " +
          "giving a geometric series. Two large caveats, which is why the measured multiplier is " +
          "usually well below this figure: the price level and the interest rate are held fixed " +
          "here, and in practice both rise and offset part of the stimulus, while imports and " +
          "taxes leak spending out of the chain at every round."
      };
    }
  };

  G["ch18_g_hard_crowding_out"] = {
    id: "ch18_g_hard_crowding_out", chapter: 18, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "crowding out", points: 3,
    build: function (rng) {
      var qStar = ri(rng, 4, 6), rStar = ri(rng, 3, 6);
      var dB = pick(rng, [1, 2]), sB = pick(rng, [1, 2]);
      var dA = rStar + dB * qStar, sA = rStar - sB * qStar;
      var pool = [
        "The real interest rate rises and private investment falls, so the net rise in output is " +
          "smaller than the multiplier alone implies",
        "The real interest rate falls, so private investment rises and the stimulus is amplified",
        "Private investment is unaffected, because government borrowing comes out of foreign saving",
        "National saving rises by the full amount borrowed, leaving the interest rate unchanged"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "The government funds a large stimulus by borrowing. In the loanable-funds market " +
          "shown, what follows, and what does it do to the size of the stimulus?",
        /* loanableFunds() negates dB itself (unlike supplyDemand(), which takes
           an already-negative dB), so this one must be passed positive. */
        diagramSpec: { type: "loanable_funds", dA: dA, dB: dB, sA: sA, sB: sB,
          shift: { curve: "D", by: pick(rng, [2, 3]) },
          xlab: "Loanable funds", ylab: "Real interest rate",
          xmax: Math.max(10, qStar + 5), ymax: Math.max(12, dA + 2) },
        options: sh.options, answer: sh.correctIndex,
        rationale: "Deficit-financed spending adds the government to the demand for loanable " +
          "funds, shifting demand right and raising the real interest rate. Higher rates deter " +
          "interest-sensitive private spending — business investment and housing above all — so " +
          "part of the public spending displaces private spending rather than adding to total " +
          "demand. That is crowding out, and it is why the realized multiplier is smaller than " +
          "1 / (1 − MPC). Crowding out is weakest exactly when stimulus is most wanted: in a " +
          "deep slump with idle resources and a central bank holding rates at the floor, there is " +
          "little private investment to displace. It bites hardest at full employment. In an open " +
          "economy part of the borrowing is met by capital inflows, which moderates the rate rise " +
          "but appreciates the currency and crowds out net exports instead."
      };
    }
  };

  /* ======================================================================
     REGISTER
     ====================================================================== */
  var conflicts = MA.register(G, null);
  if (conflicts && conflicts.length) {
    throw new Error("ma-generators-e.js: duplicate generator ids: " + conflicts.join(", "));
  }

  /* ============================================================================
     DEPLOYMENT — READ BEFORE SHIPPING
     This file must be loaded in THREE places or the new items cannot be graded:
       1. ma-portal/index.html                      (the browser builds questions)
       2. supabase/functions/ma-grade-attempt/      (regrades exam answers)
       3. supabase/functions/ma-grade/              (regrades arena/quiz answers)
     Copy the file into folders 2 and 3 and add
         import "./ma-generators-e.js";
     after the other four imports in each index.ts, then redeploy both functions.
     An item whose generator the server cannot find grades as ungraded, by design
     — the server never guesses.
     ============================================================================ */
})(typeof globalThis !== "undefined" ? globalThis : this);
