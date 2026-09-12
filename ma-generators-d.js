/* ============================================================================
   ma-generators-d.js  —  Applied Macroeconomics question bank, DEPTH PACK.

   Loads after ma-generators.js (and may load in any order relative to packs
   b and c). This pack exists because a chapter bank of six items is too thin
   to draw a five-question quiz from without a student seeing almost the whole
   bank in one sitting, and it leaves the exam builder nothing to draw that a
   student has not already practised.

   It adds depth to the chapters the earlier packs left light:
     chapters 1-6   (the shared micro foundations)
     chapters 15-18 (short-run fluctuations and stabilization policy)

   Same conventions: Safari-safe plain JS, all randomness from the seeded rng,
   difficulty weighted toward hard, distractors drawn from the errors students
   actually make.
   ============================================================================ */
(function (global) {
  "use strict";

  var MA = global.MAGenerators;
  if (!MA || !MA.register) {
    try { console.error("ma-generators-d.js: load ma-generators.js first."); } catch (e) {}
    return;
  }
  var U = MA.util;
  var ri = U.rng_int, pick = U.rng_pick, round1 = U.round1, round2 = U.round2;
  var money = U.money, shuffleWithAnswer = U.shuffleWithAnswer;

  var G = {};

  /* ======================================================================
     CHAPTER 1 — depth
     ====================================================================== */

  G["ch1_hard_comparative_decision"] = {
    id: "ch1_hard_comparative_decision", chapter: 1, kind: "numeric", render: "text",
    difficulty: "hard", concept: "opportunity cost of capital", points: 3,
    build: function (rng) {
      var savings = ri(rng, 40, 90) * 1000;
      var rate = pick(rng, [3, 4, 5, 6]);
      var revenue = ri(rng, 90, 160) * 1000;
      var explicit = ri(rng, 50, 80) * 1000;
      var forgoneWage = ri(rng, 40, 70) * 1000;
      var econProfit = revenue - explicit - forgoneWage - savings * rate / 100;
      return {
        prompt: "You quit a job paying " + money(forgoneWage) +
          " a year and invest " + money(savings) + " of your own savings (which had been earning " +
          rate + "% interest) to open a business. It brings in " + money(revenue) +
          " of revenue and incurs " + money(explicit) +
          " of explicit costs. What is your ECONOMIC profit for the year, in dollars? " +
          "(Negative if it is a loss.)",
        answer: econProfit, tolerance: 1,
        rationale: "Accounting profit = " + revenue + " − " + explicit + " = " +
          money(revenue - explicit) + ". Economic profit subtracts the IMPLICIT costs too: the " +
          money(forgoneWage) + " salary you gave up and the " + money(savings * rate / 100) +
          " of interest your capital would have earned. Economic profit = " + money(econProfit) +
          ". " + (econProfit < 0 ?
            "A negative economic profit with a positive accounting profit means the business is earning less than your resources could earn elsewhere." :
            "A positive economic profit means the venture beats the next-best use of both your time and your capital.")
      };
    }
  };

  G["ch1_hard_tradeoff_identify"] = {
    id: "ch1_hard_tradeoff_identify", chapter: 1, kind: "mc", render: "text",
    difficulty: "hard", concept: "identifying the real trade-off", points: 3,
    build: function (rng) {
      var cases = [
        { t: "a government must decide whether to spend more on environmental regulation",
          ans: "Cleaner air and water against the higher production costs that reduce firms' output and workers' incomes" },
        { t: "a central bank is deciding how aggressively to fight inflation",
          ans: "Lower inflation against higher unemployment in the short run" },
        { t: "a society is deciding how progressive to make its tax system",
          ans: "A more equal distribution of income against the weaker incentives to work and invest that redistribution creates" },
        { t: "a country is deciding how much of its output to devote to investment rather than consumption",
          ans: "Enjoying more goods today against having a larger capital stock and higher output in the future" }
      ];
      var cs = pick(rng, cases);
      var pool = [
        "Cleaner air and water against the higher production costs that reduce firms' output and workers' incomes",
        "Lower inflation against higher unemployment in the short run",
        "A more equal distribution of income against the weaker incentives to work and invest that redistribution creates",
        "Enjoying more goods today against having a larger capital stock and higher output in the future"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Suppose " + cs.t + ". What is the central trade-off it faces?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Naming the trade-off precisely is the first move in any policy analysis: it " +
          "forces you to say what is given up, not just what is gained. Notice that recognizing " +
          "a trade-off exists does not tell you which side to choose — that requires weighing " +
          "the magnitudes and applying values."
      };
    }
  };

  /* ======================================================================
     CHAPTER 2 — depth
     ====================================================================== */

  G["ch2_circular_flow"] = {
    id: "ch2_circular_flow", chapter: 2, kind: "mc", render: "text",
    difficulty: "med", concept: "the circular-flow diagram", points: 2,
    build: function (rng) {
      var cases = [
        { t: "a household buying groceries", ans: "Households spending in the market for goods and services; the money flows to firms as revenue" },
        { t: "a firm paying wages to its employees", ans: "Firms paying households in the market for factors of production; the money flows to households as income" },
        { t: "a worker supplying labour to a factory", ans: "Households supplying inputs in the market for factors of production" },
        { t: "a bakery selling bread to a customer", ans: "Firms supplying output in the market for goods and services" }
      ];
      var cs = pick(rng, cases);
      var pool = [
        "Households spending in the market for goods and services; the money flows to firms as revenue",
        "Firms paying households in the market for factors of production; the money flows to households as income",
        "Households supplying inputs in the market for factors of production",
        "Firms supplying output in the market for goods and services"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "In the circular-flow diagram, where does " + cs.t + " belong?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "The circular flow has two markets and two directions. Households sell inputs " +
          "and buy output; firms buy inputs and sell output. Money flows one way round the loop " +
          "and goods and services flow the other. It is also the simplest picture of why total " +
          "income must equal total expenditure."
      };
    }
  };

  G["ch2_hard_micro_macro"] = {
    id: "ch2_hard_micro_macro", chapter: 2, kind: "mc", render: "text",
    difficulty: "hard", concept: "fallacy of composition", points: 3,
    build: function (rng) {
      var cases = [
        { t: "If one household saves more of its income, it ends up with more wealth. Therefore if every household saves more at the same time, the country ends up richer.",
          ans: "It commits the fallacy of composition — what is true for one agent need not hold when everyone does it at once",
          why: "One household's saving does not reduce anyone's income. But everyone's spending is someone else's income, so a simultaneous surge in saving can reduce aggregate income and leave saving no higher — the paradox of thrift." },
        { t: "If one farmer has a bumper harvest, that farmer's income rises. Therefore if every farmer has a bumper harvest, farm incomes rise.",
          ans: "It commits the fallacy of composition — what is true for one agent need not hold when everyone does it at once",
          why: "One farmer sells more at an unchanged price. A universal bumper crop pushes the price down, and with inelastic demand for food, total farm revenue can FALL." },
        { t: "If one person stands up at a concert, they see better. Therefore if everyone stands up, everyone sees better.",
          ans: "It commits the fallacy of composition — what is true for one agent need not hold when everyone does it at once",
          why: "The individual gain comes entirely from the relative position, which vanishes when everyone does it — leaving everyone standing and no one better off." }
      ];
      var cs = pick(rng, cases);
      var pool = [
        "It commits the fallacy of composition — what is true for one agent need not hold when everyone does it at once",
        "It is a valid inference, because macroeconomics is just microeconomics aggregated",
        "It confuses positive and normative statements",
        "It relies on an untested assumption about preferences"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "What is wrong with this reasoning? “" + cs.t + "”",
        options: sh.options, answer: sh.correctIndex,
        rationale: cs.why + " This is the deepest reason macroeconomics is a separate subject " +
          "rather than microeconomics summed up: at the aggregate level, prices and incomes that " +
          "an individual takes as given all move together."
      };
    }
  };

  /* ======================================================================
     CHAPTER 3 — depth
     ====================================================================== */

  G["ch3_gains_calculation"] = {
    id: "ch3_gains_calculation", chapter: 3, kind: "numeric", render: "text",
    difficulty: "hard", concept: "quantifying the gains from trade", points: 3,
    build: function (rng) {
      /* A: a1 wheat OR a2 cloth ; B: b1 wheat OR b2 cloth. Trade at a rate
         between the two opportunity costs. Ask how much A gains. */
      var a1 = ri(rng, 8, 12), a2 = a1 * pick(rng, [1, 2]);
      var rate = round1(a2 / a1 + 0.5);          /* terms of trade: cloth per wheat */
      var send = ri(rng, 2, 4);                  /* units of wheat A exports */
      var homeCost = round2(send * (a2 / a1));   /* cloth A would have given up producing at home */
      var received = round2(send * rate);
      return {
        prompt: "Country A can produce " + a1 + " units of wheat or " + a2 +
          " units of cloth with all its resources. It trades " + send +
          " units of wheat abroad at a rate of " + rate +
          " units of cloth per unit of wheat. How many MORE units of cloth does A end up with, " +
          "compared with producing that cloth itself? (Two decimal places.)",
        answer: round2(received - homeCost), tolerance: 0.03,
        rationale: "A's own opportunity cost is " + a2 + "/" + a1 + " = " + round2(a2 / a1) +
          " cloth per wheat, so producing at home, giving up " + send + " wheat would yield " +
          homeCost + " cloth. Trading yields " + send + " × " + rate + " = " + received +
          " cloth. The gain is " + round2(received - homeCost) +
          " units. A gains because the terms of trade (" + rate +
          ") exceed its own opportunity cost (" + round2(a2 / a1) + ")."
      };
    }
  };

  G["ch3_hard_trade_arguments"] = {
    id: "ch3_hard_trade_arguments", chapter: 3, kind: "mc", render: "text",
    difficulty: "hard", concept: "evaluating arguments for protection", points: 3,
    build: function (rng) {
      var cases = [
        { t: "“We must protect this industry because it is vital to national security.”",
          ans: "A recognized exception with real force, but easily abused — almost every industry can claim a security link, so the argument needs a demanding standard of proof" },
        { t: "“Our firms cannot compete against countries where wages are a fraction of ours.”",
          ans: "Confuses low wages with low COSTS — wages track productivity, and comparative advantage depends on relative opportunity costs, not on wage levels" },
        { t: "“This new industry needs temporary protection until it grows large enough to compete.”",
          ans: "The infant-industry argument: coherent in principle, but it requires picking winners in advance and the 'temporary' protection rarely ends" },
        { t: "“We should threaten tariffs to force our trading partners to lower theirs.”",
          ans: "The bargaining-chip argument: it can work, but it risks a trade war in which the threatened tariffs must actually be imposed, harming both sides" }
      ];
      var cs = pick(rng, cases);
      var pool = [
        "A recognized exception with real force, but easily abused — almost every industry can claim a security link, so the argument needs a demanding standard of proof",
        "Confuses low wages with low COSTS — wages track productivity, and comparative advantage depends on relative opportunity costs, not on wage levels",
        "The infant-industry argument: coherent in principle, but it requires picking winners in advance and the 'temporary' protection rarely ends",
        "The bargaining-chip argument: it can work, but it risks a trade war in which the threatened tariffs must actually be imposed, harming both sides"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "How should an economist assess this argument for trade restrictions? " + cs.t,
        options: sh.options, answer: sh.correctIndex,
        rationale: "Note that none of these is simply dismissed. Each has a real kernel; what " +
          "distinguishes them is how well the kernel survives scrutiny. The cheap-foreign-labour " +
          "argument is the weakest, because a country with low wages usually has low productivity " +
          "to match — and a country can have a comparative advantage in something even if it is " +
          "absolutely less productive at everything."
      };
    }
  };

  /* ======================================================================
     CHAPTER 4 — depth
     ====================================================================== */

  G["ch4_qd_at_price"] = {
    id: "ch4_qd_at_price", chapter: 4, kind: "numeric", render: "text",
    difficulty: "easy", concept: "reading a demand schedule", points: 1,
    build: function (rng) {
      var a = ri(rng, 12, 24), b = pick(rng, [1, 2]);
      var q = ri(rng, 2, 8), p = a - b * q;
      return {
        prompt: "The demand curve is P = " + a + " − " + b + "Q. At a price of " + p +
          ", what is the quantity demanded?",
        answer: q, tolerance: 0.01,
        rationale: "Solve " + p + " = " + a + " − " + b + "Q for Q: Q = (" + a + " − " + p +
          ")/" + b + " = " + q + "."
      };
    }
  };

  G["ch4_hard_shift_direction"] = {
    id: "ch4_hard_shift_direction", chapter: 4, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "predicting equilibrium changes", points: 3,
    build: function (rng) {
      var shocks = [
        { t: "a new technology sharply lowers production costs", curve: "supply", dir: 1 },
        { t: "the price of a key input rises steeply", curve: "supply", dir: -1 },
        { t: "consumer incomes rise and the good is a normal good", curve: "demand", dir: 1 },
        { t: "the price of a close SUBSTITUTE falls", curve: "demand", dir: -1 },
        { t: "the price of a COMPLEMENT falls", curve: "demand", dir: 1 },
        { t: "many new firms enter the industry", curve: "supply", dir: 1 }
      ];
      var s = pick(rng, shocks);
      var b = pick(rng, [1, 2]), d = pick(rng, [1, 2]);
      var qStar = ri(rng, 4, 6), c = ri(rng, 1, 3);
      var pStar = c + d * qStar, a = pStar + b * qStar;
      /* demand right: P up Q up ; demand left: P down Q down
         supply right: P down Q up ; supply left: P up Q down */
      var pUp, qUp;
      if (s.curve === "demand") { pUp = s.dir > 0; qUp = s.dir > 0; }
      else { pUp = s.dir < 0; qUp = s.dir > 0; }
      var pool = [
        "Equilibrium price rises and quantity rises",
        "Equilibrium price rises and quantity falls",
        "Equilibrium price falls and quantity rises",
        "Equilibrium price falls and quantity falls"
      ];
      var correct = (pUp && qUp) ? 0 : (pUp && !qUp) ? 1 : (!pUp && qUp) ? 2 : 3;
      var sh = shuffleWithAnswer(rng, pool, correct);
      return {
        prompt: "In a competitive market, " + s.t +
          ". What happens to the equilibrium price and quantity?",
        diagramSpec: { type: "shift", dA: a, dB: -b, sA: c, sB: d,
          which: s.curve, shiftBy: s.dir * (s.curve === "demand" ? 3 : -3),
          xmax: Math.max(10, qStar + 4), ymax: Math.max(14, a + 1), hideValues: true },
        options: sh.options, answer: sh.correctIndex,
        rationale: "This shifts " + s.curve.toUpperCase() + " " +
          (s.dir > 0 ? "RIGHT" : "LEFT") + ". " +
          (s.curve === "demand" ?
            "A demand shift moves price and quantity in the SAME direction." :
            "A supply shift moves price and quantity in OPPOSITE directions.") +
          " That same-vs-opposite rule is the fastest way to check your answer, and it is what " +
          "lets you infer which curve moved from observed data."
      };
    }
  };

  G["ch4_hard_complement_substitute"] = {
    id: "ch4_hard_complement_substitute", chapter: 4, kind: "mc", render: "text",
    difficulty: "hard", concept: "substitutes and complements", points: 3,
    build: function (rng) {
      var cases = [
        { t: "the price of coffee rises sharply. What happens to the demand for cream?",
          ans: "Demand falls — they are COMPLEMENTS, consumed together" },
        { t: "the price of coffee rises sharply. What happens to the demand for tea?",
          ans: "Demand rises — they are SUBSTITUTES, so buyers switch toward the now relatively cheaper good" },
        { t: "the price of petrol falls sharply. What happens to the demand for large SUVs?",
          ans: "Demand rises — they are COMPLEMENTS, and a cheaper complement raises demand" },
        { t: "the price of cinema tickets falls. What happens to the demand for streaming subscriptions?",
          ans: "Demand falls — they are SUBSTITUTES, so buyers switch toward the now relatively cheaper good" }
      ];
      var cs = pick(rng, cases);
      var pool = [
        "Demand falls — they are COMPLEMENTS, consumed together",
        "Demand rises — they are SUBSTITUTES, so buyers switch toward the now relatively cheaper good",
        "Demand rises — they are COMPLEMENTS, and a cheaper complement raises demand",
        "Demand falls — they are SUBSTITUTES, so buyers switch toward the now relatively cheaper good"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Suppose " + cs.t,
        options: sh.options, answer: sh.correctIndex,
        rationale: "Substitutes move demand in the SAME direction as the other good's price " +
          "(coffee dearer → more tea). Complements move demand in the OPPOSITE direction " +
          "(coffee dearer → less cream). Note all four options are stated as plausible-sounding " +
          "combinations, so naming the relationship correctly is not enough — you must also get " +
          "the direction right."
      };
    }
  };

  /* ======================================================================
     CHAPTER 5 — depth
     ====================================================================== */

  G["ch5_classify_elasticity"] = {
    id: "ch5_classify_elasticity", chapter: 5, kind: "mc", render: "text",
    difficulty: "med", concept: "classifying elasticity", points: 2,
    build: function (rng) {
      var e = pick(rng, [0.2, 0.45, 0.7, 1, 1.3, 1.9, 2.6]);
      var ans = e > 1 ? "Elastic" : (e < 1 ? "Inelastic" : "Unit elastic");
      var pool = ["Elastic", "Inelastic", "Unit elastic", "Perfectly inelastic"];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(ans));
      return {
        prompt: "The price elasticity of demand for a good is " + e +
          " (absolute value). How is this demand classified?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "The cut-off is 1. Above 1 is elastic (quantity responds proportionally more " +
          "than price), below 1 is inelastic, exactly 1 is unit elastic. Perfectly inelastic " +
          "means an elasticity of exactly 0 — quantity does not respond at all."
      };
    }
  };

  G["ch5_cross_price"] = {
    id: "ch5_cross_price", chapter: 5, kind: "numeric", render: "text",
    difficulty: "hard", concept: "cross-price elasticity", points: 3,
    build: function (rng) {
      var subs = rng() < 0.5;
      var pctP = pick(rng, [10, 20, 25]);
      var pctQ = (subs ? 1 : -1) * pick(rng, [5, 8, 15, 30]);
      return {
        prompt: "The price of good X rises by " + pctP +
          "%, and as a result the quantity demanded of good Y " +
          (pctQ > 0 ? "rises" : "falls") + " by " + Math.abs(pctQ) +
          "%. What is the cross-price elasticity of demand between them? " +
          "(Two decimal places, signed.)",
        answer: round2(pctQ / pctP), tolerance: 0.02,
        rationale: "Cross-price elasticity = %ΔQ_Y / %ΔP_X = " + pctQ + "/" + pctP + " = " +
          round2(pctQ / pctP) + ". The SIGN carries the economics: positive means " +
          "SUBSTITUTES (X dearer, buyers switch to Y), negative means COMPLEMENTS (X dearer, " +
          "less of both consumed). Dropping the sign loses the whole point of the measure."
      };
    }
  };

  G["ch5_income_elasticity"] = {
    id: "ch5_income_elasticity", chapter: 5, kind: "mc", render: "text",
    difficulty: "hard", concept: "income elasticity", points: 3,
    build: function (rng) {
      var e = pick(rng, [-1.4, -0.6, 0.3, 0.8, 1.5, 2.2]);
      var ans;
      if (e < 0) { ans = "An INFERIOR good — demand falls as income rises"; }
      else if (e > 1) { ans = "A LUXURY (income-elastic normal good) — demand rises proportionally more than income"; }
      else { ans = "A NECESSITY (income-inelastic normal good) — demand rises, but proportionally less than income"; }
      var pool = [
        "An INFERIOR good — demand falls as income rises",
        "A LUXURY (income-elastic normal good) — demand rises proportionally more than income",
        "A NECESSITY (income-inelastic normal good) — demand rises, but proportionally less than income",
        "A Giffen good — demand rises when its own price rises"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(ans));
      return {
        prompt: "A good has an income elasticity of demand of " + e +
          ". How would you classify it?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Income elasticity below 0 means inferior; between 0 and 1 means a normal " +
          "necessity; above 1 means a normal luxury. A Giffen good is a different concept " +
          "entirely — it concerns the good's OWN price, not income, and it is a theoretical " +
          "curiosity rather than a category most goods fall into."
      };
    }
  };

  G["ch5_hard_elasticity_along_curve"] = {
    id: "ch5_hard_elasticity_along_curve", chapter: 5, kind: "mc", render: "text",
    difficulty: "hard", concept: "elasticity varies along a linear demand curve", points: 3,
    build: function (rng) {
      var a = ri(rng, 12, 24), b = pick(rng, [1, 2]);
      var pool = [
        "Elasticity is HIGH near the top (high price, low quantity) and falls toward zero at the bottom, even though the slope is constant throughout",
        "Elasticity is constant along the whole curve, because the slope is constant",
        "Elasticity is low at the top and rises toward the bottom",
        "Elasticity has no meaning on a linear demand curve"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Consider the straight-line demand curve P = " + a + " − " + b +
          "Q. How does the price elasticity of demand vary as you move down along it?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Elasticity is (ΔQ/ΔP)·(P/Q). The first term is fixed by the constant slope, " +
          "but P/Q falls continuously as you move down the curve — from infinite where Q " +
          "approaches 0 to zero where P approaches 0. So the same straight line is elastic at the " +
          "top, unit elastic exactly at the midpoint, and inelastic at the bottom. This is " +
          "precisely why slope and elasticity must not be treated as the same thing, and it also " +
          "explains why total revenue peaks at the midpoint."
      };
    }
  };

  /* ======================================================================
     CHAPTER 6 — depth
     ====================================================================== */

  G["ch6_price_floor"] = {
    id: "ch6_price_floor", chapter: 6, kind: "numeric", render: "graphical",
    difficulty: "hard", concept: "binding price floor", points: 3,
    build: function (rng) {
      var b = pick(rng, [1, 2]), d = pick(rng, [1, 2]);
      var qStar = ri(rng, 5, 8), c = ri(rng, 1, 3);
      var pStar = c + d * qStar, a = pStar + b * qStar;
      var floor = pStar + ri(rng, 1, 3);
      var qd = (a - floor) / b, qs = (floor - c) / d;
      return {
        prompt: "Demand is P = " + a + " − " + b + "Q and supply is P = " + c + " + " + d +
          "Q. The government sets a price FLOOR of " + floor +
          ". What is the size of the resulting surplus? (Two decimal places.)",
        diagramSpec: { type: "supply_demand", dA: a, dB: -b, sA: c, sB: d,
          xmax: Math.max(10, qStar + 3), ymax: Math.max(14, a + 1), hideValues: true },
        answer: round2(qs - qd), tolerance: 0.02,
        rationale: "At P = " + floor + ": Qs = " + round2(qs) + " and Qd = " + round2(qd) +
          ", a surplus of " + round2(qs - qd) + ". The floor binds because " + floor +
          " is ABOVE the equilibrium price of " + pStar +
          ". Note the surplus counts both the extra quantity sellers now want to sell and the " +
          "quantity buyers no longer wish to buy."
      };
    }
  };

  G["ch6_hard_control_effects"] = {
    id: "ch6_hard_control_effects", chapter: 6, kind: "mc", render: "text",
    difficulty: "hard", concept: "consequences of price controls", points: 3,
    build: function (rng) {
      var cases = [
        { t: "a binding price ceiling on petrol during a supply disruption",
          ans: "A shortage, with rationing by queues and waiting rather than by price" },
        { t: "a binding minimum wage in a low-skill labour market",
          ans: "A surplus of labour — more people want to work at that wage than firms wish to hire" },
        { t: "a binding price floor on an agricultural commodity",
          ans: "A persistent surplus that the government must buy up, store, or dispose of" },
        { t: "a binding rent ceiling maintained for many years",
          ans: "A shortage that grows over time as supply becomes more elastic, along with deteriorating quality" }
      ];
      var cs = pick(rng, cases);
      var pool = [
        "A shortage, with rationing by queues and waiting rather than by price",
        "A surplus of labour — more people want to work at that wage than firms wish to hire",
        "A persistent surplus that the government must buy up, store, or dispose of",
        "A shortage that grows over time as supply becomes more elastic, along with deteriorating quality"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "What is the predictable consequence of " + cs.t + "?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Ceilings bind below equilibrium and cause SHORTAGES; floors bind above and " +
          "cause SURPLUSES. When price is prevented from rationing, something else does the " +
          "rationing instead — queues, connections, quality reduction, or in the labour-market " +
          "case, simply not being hired. The size of the effect grows with the time horizon, " +
          "because both supply and demand become more elastic."
      };
    }
  };

  G["ch6_hard_tax_revenue_vs_dwl"] = {
    id: "ch6_hard_tax_revenue_vs_dwl", chapter: 6, kind: "numeric", render: "text",
    difficulty: "hard", concept: "tax revenue versus deadweight loss", points: 3,
    build: function (rng) {
      var b = pick(rng, [1, 2]), d = pick(rng, [1, 2]);
      var qStar = ri(rng, 6, 9), c = ri(rng, 1, 3);
      var pStar = c + d * qStar, a = pStar + b * qStar;
      var tax = ri(rng, 2, 5);
      var qt = (a - c - tax) / (b + d);
      var rev = tax * qt;
      return {
        prompt: "Demand is P = " + a + " − " + b + "Q and supply is P = " + c + " + " + d +
          "Q. A per-unit tax of " + money(tax) +
          " is imposed. How much TAX REVENUE does the government collect? (Two decimal places.)",
        answer: round2(rev), tolerance: 0.04,
        rationale: "The after-tax quantity is Q = (" + a + " − " + c + " − " + tax + ")/(" +
          b + " + " + d + ") = " + round2(qt) + ". Revenue = tax × quantity = " + tax + " × " +
          round2(qt) + " = " + round2(rev) +
          ". Revenue is a rectangle and is a TRANSFER from buyers and sellers to the government; " +
          "the deadweight loss (" + round2(0.5 * tax * (qStar - qt)) +
          " here) is a separate triangle representing value destroyed rather than moved. As the " +
          "tax rises, the rectangle eventually shrinks while the triangle keeps growing."
      };
    }
  };

  /* ======================================================================
     CHAPTER 15 — depth
     ====================================================================== */

  G["ch15_hard_shock_identify"] = {
    id: "ch15_hard_shock_identify", chapter: 15, kind: "mc", render: "text",
    difficulty: "hard", concept: "inferring the shock from the data", points: 3,
    build: function (rng) {
      var demandShock = rng() < 0.5;
      var up = rng() < 0.5;
      var desc, ans;
      if (demandShock) {
        desc = up ? "output ROSE and the price level ROSE" : "output FELL and the price level FELL";
        ans = "A DEMAND shock — output and prices moved in the same direction";
      } else {
        desc = up ? "output FELL and the price level ROSE" : "output ROSE and the price level FELL";
        ans = "A SUPPLY shock — output and prices moved in opposite directions";
      }
      var pool = [
        "A DEMAND shock — output and prices moved in the same direction",
        "A SUPPLY shock — output and prices moved in opposite directions",
        "Both curves must have shifted by equal amounts",
        "Neither curve shifted; only expectations changed"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(ans));
      return {
        prompt: "An economist observes that over the past year " + desc +
          ". With no other information, what kind of shock most likely hit the economy?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "This is the diagnostic rule read backwards. Along an upward-sloping SRAS, an " +
          "AD shift moves P and Y the SAME way. Along a downward-sloping AD, an SRAS shift moves " +
          "them in OPPOSITE ways. So the co-movement of output and prices identifies which curve " +
          "moved — which is how economists infer the nature of a shock from aggregate data alone."
      };
    }
  };

  G["ch15_hard_policy_response"] = {
    id: "ch15_hard_policy_response", chapter: 15, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "stabilization policy", points: 3,
    build: function (rng) {
      var recess = rng() < 0.5;
      var adB = pick(rng, [1, 2]), srB = pick(rng, [1, 2]);
      var yStar = ri(rng, 5, 7), srA = ri(rng, 1, 3);
      var pStar = srA + srB * yStar, adA = pStar + adB * yStar;
      var yn = recess ? yStar + 2 : yStar - 2;
      var pool = [
        "Expansionary policy — cut interest rates or raise government spending, shifting AD right; output rises toward potential but the price level rises too",
        "Contractionary policy — raise interest rates or cut spending, shifting AD left; output falls toward potential and the price level falls",
        "Supply-side policy alone, since AD cannot affect output",
        "No policy is possible; only the long run can close a gap"
      ];
      var sh = shuffleWithAnswer(rng, pool, recess ? 0 : 1);
      return {
        prompt: "The economy is in a " + (recess ? "recessionary" : "inflationary") +
          " gap. What does standard stabilization policy prescribe, and what is the cost of the " +
          "prescription?",
        diagramSpec: { type: "ad_as", adA: adA, adB: adB, srA: srA, srB: srB, yn: yn,
          showGap: true, shift: { curve: "AD", by: recess ? 3 : -3 },
          xmax: Math.max(12, Math.max(yStar, yn) + 4), ymax: Math.max(16, pStar + 5),
          hideValues: true },
        options: sh.options, answer: sh.correctIndex,
        rationale: (recess ?
          "Shifting AD right closes the gap faster than waiting for wages to fall, but it does so at a HIGHER price level than self-correction would have produced." :
          "Shifting AD left closes the gap and lowers the price level, but at the cost of a period of weaker output and higher unemployment.") +
          " Every AD-based remedy trades off output against prices; that trade-off is the " +
          "permanent difficulty of stabilization policy, and it is why the lags discussed later " +
          "matter so much."
      };
    }
  };

  G["ch15_lras_shift"] = {
    id: "ch15_lras_shift", chapter: 15, kind: "mc", render: "text",
    difficulty: "hard", concept: "what shifts long-run aggregate supply", points: 3,
    build: function (rng) {
      var cases = [
        { t: "a wave of immigration substantially enlarges the labour force", ans: "LRAS shifts right — potential output itself has risen" },
        { t: "decades of investment raise the capital stock per worker", ans: "LRAS shifts right — potential output itself has risen" },
        { t: "the central bank doubles the money supply", ans: "Only AD shifts; LRAS is unaffected because real capacity has not changed" },
        { t: "the government sends every household a one-time cash transfer", ans: "Only AD shifts; LRAS is unaffected because real capacity has not changed" },
        { t: "a major technological breakthrough raises productivity across industries", ans: "LRAS shifts right — potential output itself has risen" }
      ];
      var cs = pick(rng, cases);
      var pool = [
        "LRAS shifts right — potential output itself has risen",
        "Only AD shifts; LRAS is unaffected because real capacity has not changed",
        "LRAS shifts left",
        "Neither curve shifts"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Suppose " + cs.t + ". What happens to long-run aggregate supply?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "LRAS sits at potential output, which depends on REAL factors: labour, " +
          "capital, natural resources and technology. Nominal changes — the money supply, a cash " +
          "transfer — move AD and hence the price level, but leave productive capacity untouched. " +
          "Confusing a policy that raises SPENDING with one that raises CAPACITY is the central " +
          "error this item tests."
      };
    }
  };

  /* ======================================================================
     CHAPTER 16 — depth
     ====================================================================== */

  G["ch16_hard_shift_identify"] = {
    id: "ch16_hard_shift_identify", chapter: 16, kind: "mc", render: "text",
    difficulty: "hard", concept: "what shifts IS vs LM", points: 3,
    build: function (rng) {
      var cases = [
        { t: "the government raises spending", ans: "IS shifts RIGHT" },
        { t: "the government raises taxes", ans: "IS shifts LEFT" },
        { t: "the central bank buys bonds, expanding the money supply", ans: "LM shifts RIGHT (down)" },
        { t: "the price level rises, reducing the real money supply", ans: "LM shifts LEFT (up)" },
        { t: "firms become more optimistic and invest more at every interest rate", ans: "IS shifts RIGHT" },
        { t: "households decide to hold more money at every level of income", ans: "LM shifts LEFT (up)" }
      ];
      var cs = pick(rng, cases);
      var pool = ["IS shifts RIGHT", "IS shifts LEFT", "LM shifts RIGHT (down)", "LM shifts LEFT (up)"];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "In the IS-LM model, what happens when " + cs.t + "?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "The test is which MARKET the change acts on. Anything that changes planned " +
          "spending at a given interest rate — G, T, investor confidence, consumer confidence, " +
          "net exports — moves IS. Anything that changes the money market at a given level of " +
          "income — the nominal money supply, the price level (and hence the real money supply), " +
          "or money demand itself — moves LM."
      };
    }
  };

  G["ch16_hard_price_level_link"] = {
    id: "ch16_hard_price_level_link", chapter: 16, kind: "mc", render: "text",
    difficulty: "hard", concept: "deriving AD from IS-LM", points: 3,
    build: function (rng) {
      var pool = [
        "A higher price level reduces the REAL money supply, shifting LM left, raising the interest rate and lowering output — which traces out a downward-sloping AD curve",
        "A higher price level shifts IS left directly, which traces out the AD curve",
        "The price level has no effect in the IS-LM model",
        "A higher price level shifts LM right, raising output"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "How does the aggregate demand curve emerge from the IS-LM model?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "IS-LM is drawn for a GIVEN price level. Raise P, and the real money supply " +
          "M/P falls, shifting LM left; the interest rate rises and equilibrium output falls. " +
          "Plotting each price level against the output it produces gives the downward-sloping " +
          "AD curve. This is the bridge between the two models, and it explains why anything " +
          "that shifts IS or LM at a given P also shifts AD."
      };
    }
  };

  /* ======================================================================
     CHAPTER 17 — depth
     ====================================================================== */

  G["ch17_real_rate_calc"] = {
    id: "ch17_real_rate_calc", chapter: 17, kind: "numeric", render: "text",
    difficulty: "med", concept: "computing the real policy rate", points: 2,
    build: function (rng) {
      var nom = pick(rng, [0, 0.25, 1, 2, 3, 5]);
      var infl = pick(rng, [1, 2, 4, 6, 8]);
      return {
        prompt: "The central bank's policy rate is " + nom + "% and inflation is " + infl +
          "%. What is the approximate REAL policy rate, in percent? " +
          "(Enter a negative number if appropriate.)",
        answer: round2(nom - infl), tolerance: 0.03,
        rationale: "Real ≈ nominal − inflation = " + nom + " − " + infl + " = " +
          round2(nom - infl) + "%. " + ((nom - infl) < 0 ?
            "A negative real policy rate means borrowing is cheap in real terms even though the nominal rate is positive — which is why the nominal rate alone never tells you the stance of policy." :
            "A positive real rate means borrowing carries a genuine real cost.")
      };
    }
  };

  G["ch17_hard_tool_match"] = {
    id: "ch17_hard_tool_match", chapter: 17, kind: "mc", render: "text",
    difficulty: "hard", concept: "central bank tools", points: 3,
    build: function (rng) {
      var cases = [
        { t: "buying long-dated government and mortgage bonds in large volume to push down long-term rates once short rates are at zero",
          ans: "Quantitative easing" },
        { t: "announcing that the policy rate will be held near zero until inflation has been above target for some time",
          ans: "Forward guidance" },
        { t: "buying or selling short-term government securities to move the overnight rate to its target",
          ans: "Conventional open-market operations" },
        { t: "changing the rate paid to banks on the reserves they hold at the central bank",
          ans: "Interest on reserves" }
      ];
      var cs = pick(rng, cases);
      var pool = ["Quantitative easing", "Forward guidance",
        "Conventional open-market operations", "Interest on reserves"];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Which monetary policy tool is this? " + cs.t + ".",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Conventional operations and interest on reserves target the SHORT rate. " +
          "Quantitative easing and forward guidance were developed for the zero lower bound, " +
          "where the short rate can go no lower: QE works on longer-term yields directly, while " +
          "forward guidance works on EXPECTATIONS of future short rates — and, if credible, on " +
          "expected inflation, which lowers the real rate without moving the nominal one."
      };
    }
  };

  /* ======================================================================
     CHAPTER 18 — depth
     ====================================================================== */

  G["ch18_primary_balance"] = {
    id: "ch18_primary_balance", chapter: 18, kind: "numeric", render: "text",
    difficulty: "hard", concept: "primary vs overall balance", points: 3,
    build: function (rng) {
      var revenue = ri(rng, 30, 50) * 100;
      var nonInterest = revenue + ri(rng, 1, 8) * 100;
      var interest = ri(rng, 2, 9) * 100;
      var primary = revenue - nonInterest;
      return {
        prompt: "A government collects " + money(revenue) + " billion in revenue, spends " +
          money(nonInterest) + " billion on programmes, and pays " + money(interest) +
          " billion in interest on existing debt. What is the PRIMARY balance, in billions? " +
          "(Negative for a deficit.)",
        answer: primary, tolerance: 0.01,
        rationale: "The primary balance excludes interest: " + revenue + " − " + nonInterest +
          " = " + primary + " billion. The OVERALL balance includes it: " + revenue + " − " +
          nonInterest + " − " + interest + " = " + (primary - interest) +
          " billion. Economists watch the primary balance because interest on past debt is " +
          "inherited rather than a current policy choice — it measures what today's decisions " +
          "are contributing to the debt."
      };
    }
  };

  G["ch18_hard_multiplier_conditions"] = {
    id: "ch18_hard_multiplier_conditions", chapter: 18, kind: "mc", render: "text",
    difficulty: "hard", concept: "when fiscal multipliers are large", points: 3,
    build: function (rng) {
      var cases = [
        { t: "the economy is at full employment and the central bank is raising rates to contain inflation",
          ans: "SMALL — with no spare capacity and monetary policy leaning against it, the stimulus mostly raises prices and crowds out private spending" },
        { t: "the economy has substantial idle capacity and the policy rate is stuck at zero",
          ans: "LARGE — idle resources mean output can actually expand, and with rates pinned at zero there is no interest-rate rise to crowd out private spending" },
        { t: "the country is small and very open, so much of any extra spending goes on imports",
          ans: "SMALL — spending leaks abroad rather than circulating as domestic income" },
        { t: "households are liquidity-constrained and spend nearly all of any additional income",
          ans: "LARGE — a high marginal propensity to consume means each round of the multiplier passes on most of the spending" }
      ];
      var cs = pick(rng, cases);
      var pool = [
        "SMALL — with no spare capacity and monetary policy leaning against it, the stimulus mostly raises prices and crowds out private spending",
        "LARGE — idle resources mean output can actually expand, and with rates pinned at zero there is no interest-rate rise to crowd out private spending",
        "SMALL — spending leaks abroad rather than circulating as domestic income",
        "LARGE — a high marginal propensity to consume means each round of the multiplier passes on most of the spending"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Would the fiscal multiplier be large or small in this situation, and why? " +
          cs.t + ".",
        options: sh.options, answer: sh.correctIndex,
        rationale: "There is no single fiscal multiplier — its size depends on the state of the " +
          "economy. It is largest with idle capacity, accommodative or constrained monetary " +
          "policy, a closed economy, and credit-constrained households; smallest at full " +
          "employment, with an offsetting central bank, high import propensity, and forward-" +
          "looking unconstrained households. This is why empirical estimates range so widely and " +
          "why quoting one number is misleading."
      };
    }
  };

  /* ======================================================================
     STATIC DEPTH ITEMS
     ====================================================================== */
  var STATIC = [
    { id: "ch1_incentives_definition", chapter: 1, kind: "mc", render: "text",
      difficulty: "easy", concept: "incentives", points: 1,
      prompt: "“People respond to incentives” implies that when the cost of an activity rises, people will generally:",
      options: ["Do less of it", "Do more of it", "Be unaffected", "Stop doing it entirely"],
      answer: 0,
      rationale: "Less, not none — responses are usually at the margin rather than all-or-nothing. How MUCH less is precisely what elasticity measures." },

    { id: "ch1_hard_rational_actor", chapter: 1, kind: "mc", render: "text",
      difficulty: "hard", concept: "the rationality assumption", points: 3,
      prompt: "Economists assume people are “rational”. What does this assumption actually claim, and what does it NOT claim?",
      options: [
        "It claims people systematically pursue their objectives given their constraints and information; it does NOT claim they are selfish, never err, or compute perfectly",
        "It claims people always make the objectively best decision with full information",
        "It claims people care only about money",
        "It claims people never change their preferences"
      ],
      answer: 0,
      rationale: "Rationality is about consistent goal-directed behaviour, not omniscience or selfishness. Someone donating a kidney is behaving rationally if it serves their objectives. The assumption is best understood as a modelling device that predicts behaviour well on average — behavioural economics documents its systematic failures without discarding it." },

    { id: "ch2_written_positive_normative", chapter: 2, kind: "short", render: "text",
      difficulty: "hard", concept: "positive vs normative reasoning", points: 4,
      prompt: "“Economists should stick to facts and stay out of policy debates.” In 4–6 sentences, evaluate this using the positive/normative distinction. Explain what economists can contribute to a policy debate that non-economists cannot, explain where their professional expertise runs out, and give an example of a policy question where the positive and normative components can be clearly separated.",
      answer: null,
      rubric: "Full credit (4 pts): (1) correct distinction — positive claims describe what IS and are settled by evidence; normative claims assert what OUGHT to be and rest on values; (2) the professional contribution — economists can estimate the CONSEQUENCES of policies (magnitudes, who gains and loses, unintended effects, trade-offs) and identify which claims are empirically testable; (3) where expertise ends — economics cannot determine how to weigh one group's gain against another's loss, or how much efficiency to trade for equity; those are value judgments on which an economist's view carries no special authority; (4) a worked example separating the two components, e.g. a carbon tax: 'a $50/tonne tax would cut emissions by X% and cost low-income households Y% of income' is positive, while 'we should accept that cost for that benefit' is normative. Award 1 pt per element. An answer that concludes economists should simply avoid policy loses elements (2) and (4).",
      rationale: "The point is that the two components are separable within a single policy question — which is what makes the 'stay out of it' framing wrong." },

    { id: "ch3_hard_specialization_limits", chapter: 3, kind: "mc", render: "text",
      difficulty: "hard", concept: "limits of specialization", points: 3,
      prompt: "The gains from specialization and trade are real. What is the strongest reason a country might still choose NOT to specialize completely in its comparative-advantage good?",
      options: [
        "Complete specialization concentrates risk — a shock to the single sector, or to a trading partner's willingness to supply, becomes a national shock with no domestic fallback",
        "Specialization always reduces total output",
        "Comparative advantage does not exist in practice",
        "Specialization is prohibited by international law"
      ],
      answer: 0,
      rationale: "The efficiency case for specialization is sound and the resilience concern is a genuine counterweight, not a rejection of it: diversification costs output but buys insurance. Recent supply-chain disruptions moved this argument from a textbook footnote to an active policy debate. Note the honest version concedes there is a real cost to holding that insurance." },

    { id: "ch4_written_market_adjustment", chapter: 4, kind: "short", render: "text",
      difficulty: "hard", concept: "how markets reach equilibrium", points: 4,
      prompt: "In 4–6 sentences, explain the process by which a competitive market moves back to equilibrium after the price has been pushed ABOVE the equilibrium level. Describe what buyers and sellers each observe and do, and explain why the process stops exactly at equilibrium rather than overshooting indefinitely.",
      answer: null,
      rubric: "Full credit (4 pts): (1) at the above-equilibrium price, quantity supplied EXCEEDS quantity demanded — a surplus; (2) what agents observe and do — sellers find unsold inventory piling up or goods unsold, and cut prices to move stock; some sellers exit or reduce output; (3) as the price falls, quantity demanded RISES (movement along demand) and quantity supplied FALLS (movement along supply) — both adjustments narrow the gap; (4) the process stops at equilibrium because that is the only price at which the surplus is exactly zero, so no seller has unsold goods creating pressure to cut further — the force driving the change disappears precisely when the gap closes. Award 1 pt per element. Element (4) is the discriminating one: many answers describe the direction of adjustment without explaining what makes it stop.",
      rationale: "Most students can say the price falls; far fewer can say why it stops falling exactly where it does." },

    { id: "ch5_slope_vs_elasticity", chapter: 5, kind: "mc", render: "text",
      difficulty: "hard", concept: "slope is not elasticity", points: 3,
      prompt: "Two demand curves for different goods have exactly the same slope when drawn on the same axes. What can you conclude about their elasticities at a given price?",
      options: [
        "Nothing without knowing the price and quantity, since elasticity depends on P/Q as well as on the slope",
        "They must have identical elasticities, because elasticity is the slope",
        "The flatter curve is always inelastic",
        "Elasticity cannot be compared across different goods"
      ],
      answer: 0,
      rationale: "Elasticity = (ΔQ/ΔP) × (P/Q). The first factor is the reciprocal of the slope, but the second depends on WHERE you are on the curve. Two identically sloped curves sitting at different price-quantity points have different elasticities — which is also why elasticity, being unit-free, can be compared across goods while slope cannot." },

    { id: "ch6_hard_efficiency_of_market", chapter: 6, kind: "mc", render: "text",
      difficulty: "hard", concept: "why intervention causes deadweight loss", points: 3,
      prompt: "A tax, a price ceiling and a price floor all create deadweight loss. What do all three have in common that causes it?",
      options: [
        "Each prevents trades that both the buyer and the seller would have willingly made — trades where the buyer's value exceeds the seller's cost",
        "Each takes money away from the private sector",
        "Each raises the price consumers pay",
        "Each reduces government revenue"
      ],
      answer: 0,
      rationale: "Deadweight loss is about FOREGONE MUTUALLY BENEFICIAL TRADES, not about money changing hands. Tax revenue is a transfer, not a loss. And the mechanisms differ in direction — a ceiling lowers the price while a tax raises what buyers pay — yet all three shrink quantity below the efficient level and destroy the surplus those missing trades would have created. Note this analysis assumes no externalities; where one exists, the 'efficient' quantity is different and a tax can INCREASE total surplus." },

    { id: "ch15_written_ad_slope", chapter: 15, kind: "short", render: "text",
      difficulty: "hard", concept: "why AD slopes downward", points: 4,
      prompt: "In 4–6 sentences, explain the three reasons the aggregate demand curve slopes downward, naming the component of GDP each one operates on. Then explain why the familiar microeconomic reason for a downward-sloping demand curve — substitution toward other goods — does NOT apply to aggregate demand.",
      answer: null,
      rubric: "Full credit (4 pts): (1) the WEALTH effect on CONSUMPTION — a lower price level raises the real value of money holdings, so households feel wealthier and consume more; (2) the INTEREST-RATE effect on INVESTMENT — a lower price level reduces money needed for transactions, households lend the surplus, interest rates fall and investment rises; (3) the EXCHANGE-RATE effect on NET EXPORTS — lower domestic interest rates cause the currency to depreciate, making domestic goods cheaper relative to foreign ones and raising NX; (4) why the micro reason fails — an individual demand curve slopes down largely because consumers substitute toward OTHER goods whose prices have not changed, but along AD ALL prices move together, so there is no cheaper alternative within the economy to substitute toward. Award 1 pt per element; element (1)-(3) each require BOTH the effect and the correct GDP component.",
      rationale: "Requiring the GDP component with each effect prevents the vague 'things get cheaper so people buy more' answer, which is exactly the micro reasoning element (4) rules out." },

    { id: "ch17_written_independence", chapter: 17, kind: "short", render: "text",
      difficulty: "hard", concept: "central bank independence", points: 4,
      prompt: "In 5–7 sentences, make the economic case for central bank independence and then state the strongest DEMOCRATIC objection to it. Explain the time-inconsistency problem specifically, and describe one institutional arrangement that tries to reconcile independence with accountability.",
      answer: null,
      rubric: "Full credit (4 pts): (1) the TIME-INCONSISTENCY mechanism stated correctly — a government or bank has a short-run incentive to inflate for an output gain after expectations are set; a rational public anticipates this, builds it into wages and prices, and the economy ends with higher inflation and NO extra output (inflation bias); (2) the resulting case for independence — insulation from electoral pressure removes the temptation, making a low-inflation commitment credible; empirical support from the association between independence and lower average inflation is a plus but not required; (3) the DEMOCRATIC objection stated seriously — unelected officials make decisions with large distributional consequences (who bears unemployment, who gains from asset-price effects) and are difficult to remove or hold to account; monetary policy is not purely technical; (4) an institutional reconciliation — a legislated mandate or numeric target set by elected officials with operational independence in HOW to hit it, plus required testimony, published minutes and forecasts, and fixed removable terms. Award 1 pt per element. An answer that treats the democratic objection dismissively rather than stating it at its strongest loses element (3).",
      rationale: "The requirement to state the objection at its strongest is deliberate — this is a question where the easy answer is one-sided advocacy." },

    { id: "ch18_written_debt_burden", chapter: 18, kind: "short", render: "text",
      difficulty: "hard", concept: "is government debt a burden?", points: 5,
      prompt: "“Government debt means we are stealing from our grandchildren.” In 6–8 sentences, evaluate this claim carefully. Explain in what sense debt does and does not transfer a burden across generations, explain why the identity of the creditor matters, explain the role of what the borrowing FINANCED, and state the condition under which debt genuinely does become a serious problem.",
      answer: null,
      rubric: "Full credit (5 pts): (1) the sense in which the claim is WEAK — for debt held domestically, future taxpayers pay future bondholders, who are also future citizens; it is a transfer WITHIN the future generation rather than a resource extraction from it; (2) the sense in which it has FORCE — debt held by foreigners does require future real resources to be sent abroad; and servicing any debt requires distortionary taxes with their own deadweight loss; (3) the role of WHAT WAS FINANCED — borrowing that funds productive investment (infrastructure, education, research) leaves future generations with assets as well as liabilities and may raise their income by more than the debt service, whereas borrowing to fund current consumption does not; (4) crowding out — deficits that reduce national saving and displace private investment leave a smaller capital stock, which is a genuine intergenerational cost operating through capacity rather than through the debt itself; (5) the condition for genuine trouble — when the interest rate exceeds the growth rate (r > g) the ratio rises automatically and stabilizing it requires primary surpluses; also acceptable: loss of market confidence, debt in a foreign currency, or the absence of monetary sovereignty. Award 1 pt per element. An answer that either dismisses the concern entirely or accepts it uncritically is capped at 3 pts.",
      rationale: "This is the chapter's set-piece question. A strong answer holds several partly-conflicting truths at once rather than picking a side; the r-versus-g condition is what turns a rhetorical debate into an analytical one." }
  ];

  MA.register(G, STATIC);
})(typeof globalThis !== "undefined" ? globalThis : this);
