/* ============================================================================
   ma-generators-h.js  —  graphical top-up and easy conceptual anchors.

   Two jobs, both identified by the 2026-10-24 bank audit:

   1. GRAPHICAL TOP-UP. ma-generators-e.js gave the seven chapters that had no
      diagram at all three items each. This file brings every remaining chapter
      up to at least three, so a diagram-reading question can be set on any
      chapter of the course.

   2. EASY ANCHORS. The bank was badly skewed toward hard items, which left no
      way to open an exam gently or to test whether a student has the basic
      definition before asking them to apply it. These are deliberately
      straightforward single-concept items — three per chapter — and
      they are STATIC, because a definition does not benefit from randomised
      parameters.

   Safari-safe: var, function declarations, string concatenation only.
   ============================================================================ */
(function (global) {
  "use strict";

  var MA = global.MAGenerators;
  if (!MA || !MA.register || !MA.util) {
    throw new Error("ma-generators-h.js: load ma-generators.js first");
  }
  var U = MA.util;
  var ri = U.rng_int, pick = U.rng_pick, r1 = U.round1, r2 = U.round2;
  var money = U.money, shuffleWithAnswer = U.shuffleWithAnswer;

  var G = {};

  /* ======================================================================
     PART 1 — GRAPHICAL TOP-UP
     ====================================================================== */

  /* ---- chapter 2: models and the PPF ---------------------------------- */
  G["ch2_g_ppf_growth"] = {
    id: "ch2_g_ppf_growth", chapter: 2, kind: "mc", render: "graphical",
    difficulty: "easy", concept: "economic growth in the PPF model", points: 1,
    build: function (rng) {
      var ymax = pick(rng, [10, 12]);
      var pool = [
        "The whole frontier shifts outward, so more of both goods becomes attainable",
        "The economy moves to a point further along the existing frontier",
        "The frontier becomes a straight line",
        "The frontier shifts inward, because new technology makes old capital obsolete"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "A general improvement in technology raises productivity in BOTH industries. In " +
          "the production possibilities model shown, how is that represented?",
        diagramSpec: { type: "ppf", xmax: 10, ymax: ymax, bow: 0.28,
          xlab: "Consumer goods", ylab: "Capital goods",
          points: [ { x: 5, y: r1(ymax * 0.55), label: "A", state: "on" } ] },
        options: sh.options, answer: sh.correctIndex,
        rationale: "A movement ALONG the frontier is a change in what the economy chooses to " +
          "produce from fixed resources. Growth is different: more resources or better technology " +
          "make combinations attainable that previously were not, which is an outward shift of the " +
          "whole curve. If the improvement favoured one industry, the frontier would pivot rather " +
          "than shift evenly — which is how the model represents uneven technical progress."
      };
    }
  };

  G["ch2_g_hard_model_reading"] = {
    id: "ch2_g_hard_model_reading", chapter: 2, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "what a model can and cannot tell you", points: 3,
    build: function (rng) {
      var ymax = pick(rng, [10, 12]);
      var pool = [
        "Which point is best — that requires a value judgment the model does not contain",
        "Which points are attainable",
        "Which points are efficient",
        "The opportunity cost of moving between two points on the frontier"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Points A, B and C all lie ON this frontier, so all three are efficient. Which " +
          "question can the model NOT answer?",
        diagramSpec: { type: "ppf", xmax: 10, ymax: ymax, bow: 0.28,
          xlab: "Consumer goods", ylab: "Capital goods",
          points: [ { x: 2, y: r1(ymax * 0.88), label: "A", state: "on" },
                    { x: 5, y: r1(ymax * 0.55), label: "B", state: "on" },
                    { x: 8, y: r1(ymax * 0.22), label: "C", state: "on" } ] },
        options: sh.options, answer: sh.correctIndex,
        rationale: "The model is positive: it says which combinations can be produced, which use " +
          "resources fully, and what each must be given up to obtain. It is silent on which " +
          "efficient point society should choose, because that ranks consumption today against " +
          "capital for tomorrow, and across whoever gains and loses from each — a normative " +
          "question. This is the clearest illustration of the positive–normative boundary in " +
          "the whole course: efficiency narrows the choice to the frontier and then stops."
      };
    }
  };

  /* ---- chapter 4: supply and demand shifts ---------------------------- */
  G["ch4_g_shift_identify"] = {
    id: "ch4_g_shift_identify", chapter: 4, kind: "mc", render: "graphical",
    difficulty: "med", concept: "identifying which curve moved", points: 2,
    build: function (rng) {
      var qStar = ri(rng, 4, 6), pStar = ri(rng, 5, 8);
      var dB = pick(rng, [1, 2]), sB = pick(rng, [1, 2]);
      var dA = pStar + dB * qStar, sA = pStar - sB * qStar;
      var demandShift = rng() < 0.5;
      var pool = [
        "Demand shifted — price and quantity moved in the SAME direction",
        "Supply shifted — price and quantity moved in OPPOSITE directions",
        "Both curves shifted by the same amount",
        "Neither curve shifted; this is a movement along both"
      ];
      var sh = shuffleWithAnswer(rng, pool, demandShift ? 0 : 1);
      return {
        prompt: "In this market, equilibrium price " + (demandShift ? "ROSE" : "ROSE") +
          " and equilibrium quantity " + (demandShift ? "ROSE" : "FELL") +
          ". Which curve must have shifted?",
        diagramSpec: { type: "shift", dA: dA, dB: -dB, sA: sA, sB: sB,
          which: demandShift ? "D" : "S", shiftBy: demandShift ? 2 : -2,
          xlab: "Quantity", ylab: "Price",
          xmax: Math.max(10, qStar + 5), ymax: Math.max(12, dA + 2) },
        options: sh.options, answer: sh.correctIndex,
        rationale: "This is the single most useful diagnostic in the supply-and-demand toolkit. A " +
          "demand shift moves price and quantity in the SAME direction, because buyers are moving " +
          "along a fixed supply curve. A supply shift moves them in OPPOSITE directions, because " +
          "sellers are moving along a fixed demand curve. Observing the two equilibrium changes " +
          "therefore identifies which side of the market the news came from, without needing to " +
          "know what the news was — which is how an economist reads a price series."
      };
    }
  };

  /* ---- chapter 6: taxes and deadweight loss --------------------------- */
  G["ch6_g_dwl_size"] = {
    id: "ch6_g_dwl_size", chapter: 6, kind: "mc", render: "graphical",
    difficulty: "med", concept: "what determines deadweight loss", points: 2,
    build: function (rng) {
      var qStar = ri(rng, 4, 6), pStar = ri(rng, 6, 9);
      var elastic = rng() < 0.5;
      var dB = elastic ? 1 : 4, sB = elastic ? 1 : 4;
      var dA = pStar + dB * qStar, sA = pStar - sB * qStar;
      var pool = [
        "LARGER, because elastic curves mean the tax destroys many trades",
        "SMALLER, because elastic curves mean quantity barely responds",
        "Unchanged, because deadweight loss depends only on the size of the tax",
        "Zero, because the tax is a pure transfer to the government"
      ];
      var sh = shuffleWithAnswer(rng, pool, elastic ? 0 : 1);
      return {
        prompt: "A tax of a given size is imposed in the market shown. Compared with a market " +
          "where both curves are " + (elastic ? "steeper" : "shallower") +
          ", is the deadweight loss larger or smaller here?",
        diagramSpec: { type: "supply_demand", dA: dA, dB: -dB, sA: sA, sB: sB,
          shade: "surplus", xlab: "Quantity", ylab: "Price",
          xmax: Math.max(10, qStar + 5), ymax: Math.max(14, dA + 2) },
        options: sh.options, answer: sh.correctIndex,
        rationale: "Deadweight loss measures the trades that no longer happen, so it grows with " +
          "how much the tax changes the QUANTITY. " +
          (elastic
            ? "Shallow, elastic curves mean quantity is very responsive, so a given tax wedge " +
              "destroys a lot of trade and the loss is large."
            : "Steep, inelastic curves mean quantity barely moves, so few trades are lost and the " +
              "loss is small.") +
          " This is why the efficiency case for taxation points at inelastic bases — land " +
          "most of all, since its quantity cannot respond at any price — and why that case " +
          "sits uncomfortably beside fairness, since inelastic demand often signals a necessity."
      };
    }
  };

  /* ---- chapter 10: loanable funds ------------------------------------- */
  G["ch10_g_saving_shift"] = {
    id: "ch10_g_saving_shift", chapter: 10, kind: "mc", render: "graphical",
    difficulty: "easy", concept: "loanable funds comparative statics", points: 1,
    build: function (rng) {
      var qStar = ri(rng, 4, 6), rStar = ri(rng, 3, 6);
      var dB = pick(rng, [1, 2]), sB = pick(rng, [1, 2]);
      var dA = rStar + dB * qStar, sA = rStar - sB * qStar;
      var saveMore = rng() < 0.5;
      var pool = [
        "The real interest rate FALLS and investment RISES",
        "The real interest rate RISES and investment FALLS",
        "Both the interest rate and investment rise",
        "Neither changes, because saving always equals investment"
      ];
      var sh = shuffleWithAnswer(rng, pool, saveMore ? 0 : 1);
      return {
        prompt: (saveMore
          ? "A tax reform increases the reward to saving, and households save more at every " +
            "interest rate."
          : "Households become more confident and save less at every interest rate.") +
          " In the loanable funds market shown, what happens?",
        diagramSpec: { type: "loanable_funds", dA: dA, dB: dB, sA: sA, sB: sB,
          shift: { curve: "S", by: saveMore ? pick(rng, [2, 3]) : -pick(rng, [2, 3]) },
          xlab: "Loanable funds", ylab: "Real interest rate",
          xmax: Math.max(10, qStar + 5), ymax: Math.max(12, dA + 2) },
        options: sh.options, answer: sh.correctIndex,
        rationale: (saveMore
          ? "More saving at every rate shifts the SUPPLY of loanable funds right. The real " +
            "interest rate falls and the equilibrium quantity of funds borrowed and invested rises."
          : "Less saving at every rate shifts SUPPLY left. The real interest rate rises and the " +
            "quantity of funds borrowed and invested falls.") +
          " Note the last distractor: saving equals investment as an accounting identity in a " +
          "closed economy, but that is exactly what the interest rate MOVES to bring about — " +
          "the identity holding does not mean the quantities are fixed."
      };
    }
  };

  /* ---- chapter 11: the money market ----------------------------------- */
  G["ch11_g_money_market"] = {
    id: "ch11_g_money_market", chapter: 11, kind: "mc", render: "graphical",
    difficulty: "med", concept: "money market equilibrium", points: 2,
    build: function (rng) {
      var ms = ri(rng, 4, 7), mdB = pick(rng, [1, 2]);
      var rStar = ri(rng, 3, 6);
      var mdA = rStar + mdB * ms;
      var expand = rng() < 0.5;
      var pool = [
        "The equilibrium interest rate FALLS",
        "The equilibrium interest rate RISES",
        "The interest rate is unchanged; only the quantity of money changes",
        "Money demand shifts left in response"
      ];
      var sh = shuffleWithAnswer(rng, pool, expand ? 0 : 1);
      return {
        prompt: "The central bank " + (expand ? "INCREASES" : "DECREASES") +
          " the money supply. In the money market shown, what happens to the equilibrium nominal " +
          "interest rate?",
        diagramSpec: { type: "money_market", mdA: mdA, mdB: mdB, ms: ms,
          shift: { by: expand ? pick(rng, [1, 2]) : -pick(rng, [1, 2]) },
          xlab: "Quantity of money", ylab: "Nominal interest rate",
          xmax: Math.max(10, ms + 5), ymax: Math.max(12, mdA + 2) },
        options: sh.options, answer: sh.correctIndex,
        rationale: "The money supply is drawn vertical because the central bank sets the quantity " +
          "independently of the interest rate. Money demand slopes downward because the interest " +
          "rate is the opportunity cost of holding money rather than interest-bearing assets. " +
          (expand
            ? "A rightward shift of the vertical supply line meets the demand curve lower down, so " +
              "the rate falls — people only hold the extra money willingly if the cost of " +
              "holding it has fallen."
            : "A leftward shift meets the demand curve higher up, so the rate rises — money " +
              "has become scarcer and holding it costs more.") +
          " In practice central banks announce the rate and supply whatever quantity achieves it, " +
          "which is the same equilibrium approached from the other axis."
      };
    }
  };

  G["ch11_g_hard_money_demand_shift"] = {
    id: "ch11_g_hard_money_demand_shift", chapter: 11, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "money demand shifts", points: 3,
    build: function (rng) {
      var ms = ri(rng, 4, 7), mdB = pick(rng, [1, 2]);
      var rStar = ri(rng, 4, 7);
      var mdA = rStar + mdB * ms;
      var pool = [
        "The interest rate RISES, unless the central bank expands the money supply to accommodate " +
          "the extra demand",
        "The interest rate FALLS, because more money is being held",
        "Nothing happens, since the money supply is fixed",
        "The money supply curve shifts right automatically"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "A financial panic makes households and firms want to hold far more money at " +
          "every interest rate. With the money supply held fixed, what happens — and what " +
          "must the central bank do to prevent it?",
        diagramSpec: { type: "money_market", mdA: mdA, mdB: mdB, ms: ms,
          xlab: "Quantity of money", ylab: "Nominal interest rate",
          xmax: Math.max(10, ms + 5), ymax: Math.max(14, mdA + 3) },
        options: sh.options, answer: sh.correctIndex,
        rationale: "A rise in money demand shifts the demand curve right. Against a vertical " +
          "supply line, that raises the equilibrium interest rate — the scramble for " +
          "liquidity bids up the price of borrowing at precisely the moment the economy can least " +
          "afford it. This is the mechanism behind a credit crunch, and it is why a central bank " +
          "responds to a panic by supplying reserves on demand rather than holding the quantity " +
          "fixed. Bagehot's rule — lend freely, against good collateral, at a penalty rate " +
          "— is this diagram turned into an operating procedure, and the failure to follow it " +
          "is the standard indictment of the Federal Reserve in the early 1930s."
      };
    }
  };

  /* ---- chapter 13: the foreign exchange market ------------------------ */
  G["ch13_g_supply_shift"] = {
    id: "ch13_g_supply_shift", chapter: 13, kind: "mc", render: "graphical",
    difficulty: "easy", concept: "exchange rate determination", points: 1,
    build: function (rng) {
      var dB = pick(rng, [1, 2]), sB = pick(rng, [1, 2]);
      var qStar = ri(rng, 4, 7), sA = ri(rng, 1, 3);
      var eStar = sA + sB * qStar, dA = eStar + dB * qStar;
      var pool = [
        "The domestic currency DEPRECIATES — more of it is supplied to buy foreign assets",
        "The domestic currency APPRECIATES, because investing abroad shows confidence",
        "The exchange rate is unchanged, since capital flows net out",
        "Demand for the domestic currency rises"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Domestic residents decide to buy substantially more foreign assets, raising net " +
          "capital outflow. In the currency market shown, what happens to the domestic currency?",
        diagramSpec: { type: "fx_market", dA: dA, dB: dB, sA: sA, sB: sB,
          shift: { curve: "S", by: pick(rng, [2, 3]) }, currency: "the domestic currency",
          xmax: Math.max(10, qStar + 4), ymax: Math.max(12, eStar + 5), hideValues: true },
        options: sh.options, answer: sh.correctIndex,
        rationale: "Buying foreign assets requires selling domestic currency to obtain foreign " +
          "currency, so the SUPPLY of domestic currency on the exchange market rises and the " +
          "curve shifts right. A larger supply at every price lowers the price: the currency " +
          "depreciates. The depreciation then makes exports cheaper abroad and imports dearer, " +
          "raising net exports — which is the mechanism behind the identity NCO = NX. The " +
          "capital account and the trade account are two sides of one transaction, not independent " +
          "events that happen to net out."
      };
    }
  };

  /* ---- chapter 14: the labour market ---------------------------------- */
  G["ch14_g_min_wage"] = {
    id: "ch14_g_min_wage", chapter: 14, kind: "mc", render: "graphical",
    difficulty: "med", concept: "wage floors and unemployment", points: 2,
    build: function (rng) {
      var qStar = ri(rng, 4, 6), wStar = ri(rng, 6, 9);
      var dB = pick(rng, [1, 2]), sB = pick(rng, [1, 2]);
      var dA = wStar + dB * qStar, sA = wStar - sB * qStar;
      var pool = [
        "A surplus of labour — more people want to work at that wage than firms wish to hire",
        "A shortage of labour, because firms must compete harder for workers",
        "No effect, because the wage floor is below the market wage",
        "The labour demand curve shifts left"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "A wage floor is set ABOVE the market-clearing wage in the labour market shown. In " +
          "the simple competitive model, what results?",
        diagramSpec: { type: "supply_demand", dA: dA, dB: -dB, sA: sA, sB: sB,
          xlab: "Quantity of labour", ylab: "Wage",
          xmax: Math.max(10, qStar + 5), ymax: Math.max(14, dA + 2) },
        options: sh.options, answer: sh.correctIndex,
        rationale: "Above the clearing wage, the quantity of labour supplied exceeds the quantity " +
          "demanded, and that surplus is unemployment. Note carefully what this model does and " +
          "does not establish. It predicts the direction of the effect in a COMPETITIVE labour " +
          "market; the empirical literature since Card and Krueger has found employment effects of " +
          "moderate minimum wage increases that are much smaller than this diagram implies, which " +
          "is usually explained by employers having some wage-setting power — monopsony " +
          "— in which case a floor can raise employment over a range. The diagram is the " +
          "right starting point and the wrong stopping point."
      };
    }
  };

  G["ch14_g_hard_unemployment_path"] = {
    id: "ch14_g_hard_unemployment_path", chapter: 14, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "cyclical versus structural unemployment", points: 3,
    build: function (rng) {
      var years = 12;
      var natural = ri(rng, 4, 6);
      var pts = [], nat = [];
      for (var t = 0; t <= years; t++) {
        var cyc = t < 3 ? 0.2 : (t < 6 ? 4.5 - (t - 3) * 0.3 : Math.max(0.4, 3.6 - (t - 6) * 0.5));
        pts.push([t, r1(natural + cyc)]);
        nat.push([t, natural + (t > 5 ? 0.8 : 0)]);
      }
      var pool = [
        "The natural rate itself appears to have risen, so part of the increase has become " +
          "structural rather than cyclical",
        "The entire rise is cyclical and will disappear as demand recovers",
        "The data show the natural rate is zero",
        "Unemployment has returned exactly to its pre-recession level"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "The solid line is the unemployment rate; the dashed line is an estimate of the " +
          "natural rate. What does the pattern after the recession suggest?",
        diagramSpec: { type: "series", xlab: "Year", ylab: "Unemployment rate (%)",
          xmax: years, ymin: 0, ymax: Math.max(12, natural + 6), gridY: true,
          series: [ { points: pts, label: "Unemployment", color: "demand", markers: true },
                    { points: nat, label: "Natural rate (est.)", color: "lr", dashed: true } ] },
        options: sh.options, answer: sh.correctIndex,
        rationale: "Unemployment falls back after the recession but settles above where it began, " +
          "and the estimated natural rate has been revised upward to match. That is the signature " +
          "of hysteresis: a shock that began as a demand problem has left a permanent mark, " +
          "because long spells out of work erode skills, employers screen against the long-term " +
          "unemployed, and some workers leave the labour force altogether. Reading this correctly " +
          "matters for policy, because the two diagnoses prescribe opposite treatments. If the " +
          "gap is cyclical, demand stimulus closes it. If it is structural, stimulus produces " +
          "inflation instead — and the real difficulty is that the natural rate is " +
          "unobservable, so the judgment has to be made in real time on contested estimates."
      };
    }
  };

  /* ---- chapter 16: IS-LM --------------------------------------------- */
  G["ch16_g_fiscal_shift"] = {
    id: "ch16_g_fiscal_shift", chapter: 16, kind: "mc", render: "graphical",
    difficulty: "med", concept: "fiscal policy in IS-LM", points: 2,
    build: function (rng) {
      var isA = ri(rng, 10, 14), isB = pick(rng, [1, 2]);
      var lmA = ri(rng, 1, 3), lmB = pick(rng, [1, 2]);
      var expand = rng() < 0.5;
      var pool = [
        "Output RISES and the interest rate RISES",
        "Output FALLS and the interest rate FALLS",
        "Output rises and the interest rate falls",
        "Output is unchanged; only the interest rate moves"
      ];
      var sh = shuffleWithAnswer(rng, pool, expand ? 0 : 1);
      return {
        prompt: "The government " + (expand ? "increases spending" : "cuts spending") +
          ", with the money supply held constant. In the IS–LM diagram shown, what happens to " +
          "output and the interest rate?",
        diagramSpec: { type: "is_lm", isA: isA, isB: -isB, lmA: lmA, lmB: lmB,
          shift: { curve: "IS", by: expand ? pick(rng, [2, 3]) : -pick(rng, [2, 3]) },
          xlab: "Output", ylab: "Interest rate", xmax: 12, ymax: 14 },
        options: sh.options, answer: sh.correctIndex,
        rationale: "A change in government spending shifts the IS curve, because it changes " +
          "planned spending at every interest rate. " +
          (expand
            ? "A rightward IS shift along an upward-sloping LM raises both output and the interest " +
              "rate. The rate rise is crowding out in the diagram: it is why the output increase " +
              "is smaller than the simple multiplier would suggest."
            : "A leftward IS shift along an upward-sloping LM lowers both output and the interest " +
              "rate. The falling rate partially cushions the contraction, which is the mirror " +
              "image of crowding out.") +
          " The steeper the LM curve, the larger the rate movement and the smaller the output " +
          "movement — which is the diagram's way of saying that the monetary response " +
          "determines the fiscal multiplier."
      };
    }
  };

  /* ---- chapter 17: monetary policy ------------------------------------ */
  G["ch17_g_monetary_islm"] = {
    id: "ch17_g_monetary_islm", chapter: 17, kind: "mc", render: "graphical",
    difficulty: "med", concept: "monetary policy in IS-LM", points: 2,
    build: function (rng) {
      var isA = ri(rng, 10, 14), isB = pick(rng, [1, 2]);
      var lmA = ri(rng, 1, 3), lmB = pick(rng, [1, 2]);
      var ease = rng() < 0.5;
      var pool = [
        "Output RISES and the interest rate FALLS",
        "Output FALLS and the interest rate RISES",
        "Both output and the interest rate rise",
        "Only the price level changes; output is unaffected"
      ];
      var sh = shuffleWithAnswer(rng, pool, ease ? 0 : 1);
      return {
        prompt: "The central bank " + (ease ? "expands" : "contracts") +
          " the money supply, with fiscal policy unchanged. In the IS–LM diagram shown, what " +
          "happens?",
        diagramSpec: { type: "is_lm", isA: isA, isB: -isB, lmA: lmA, lmB: lmB,
          shift: { curve: "LM", by: ease ? -pick(rng, [2, 3]) : pick(rng, [2, 3]) },
          xlab: "Output", ylab: "Interest rate", xmax: 12, ymax: 14 },
        options: sh.options, answer: sh.correctIndex,
        rationale: "A monetary change shifts the LM curve, because it changes the interest rate " +
          "required to clear the money market at each level of output. " +
          (ease
            ? "An expansion shifts LM down and right: the interest rate falls, which stimulates " +
              "investment, and output rises as the economy moves down along the IS curve."
            : "A contraction shifts LM up and left: the interest rate rises, investment is " +
              "discouraged, and output falls as the economy moves up along the IS curve.") +
          " Note the contrast with fiscal policy, which moves output and the interest rate in the " +
          "SAME direction. Observing which way the two moved therefore identifies which authority " +
          "acted — the same diagnostic logic as shifts in supply and demand."
      };
    }
  };

  G["ch17_g_hard_policy_mix"] = {
    id: "ch17_g_hard_policy_mix", chapter: 17, kind: "mc", render: "graphical",
    difficulty: "hard", concept: "the monetary-fiscal mix", points: 3,
    build: function (rng) {
      var isA = ri(rng, 11, 14), isB = pick(rng, [1, 2]);
      var lmA = ri(rng, 1, 3), lmB = pick(rng, [1, 2]);
      var pool = [
        "Output can be held roughly constant while the interest rate rises sharply, shifting the " +
          "composition of output away from investment",
        "Output must fall, since a monetary contraction always dominates",
        "Both output and the interest rate are unchanged, because the policies cancel exactly",
        "Output rises and the interest rate falls"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "A government expands fiscal policy while the central bank simultaneously " +
          "tightens money. What does the IS–LM diagram say about the result?",
        diagramSpec: { type: "is_lm", isA: isA, isB: -isB, lmA: lmA, lmB: lmB,
          shift: { curve: "IS", by: pick(rng, [2, 3]) },
          xlab: "Output", ylab: "Interest rate", xmax: 12, ymax: 15 },
        options: sh.options, answer: sh.correctIndex,
        rationale: "The fiscal expansion shifts IS right, raising output and the interest rate. " +
          "The monetary contraction shifts LM left, lowering output and raising the interest rate " +
          "further. The output effects work against each other and can be made to cancel; the " +
          "interest rate effects reinforce. So the economy can end at the same output with a much " +
          "higher interest rate, and the COMPOSITION of that output has changed — less " +
          "investment and housing, more government purchases and consumption. That is not a " +
          "neutral outcome over time, because investment today is the capital stock tomorrow. The " +
          "United States in the early 1980s is the standard case: tight money alongside large " +
          "deficits produced very high real rates, a sharply appreciated dollar and a large trade " +
          "deficit, with the crowding out landing on manufacturing exports."
      };
    }
  };

  /* ======================================================================
     PART 2 — EASY CONCEPTUAL ANCHORS (static, one concept each)
     ====================================================================== */
  function anchor(id, ch, concept, prompt, options, answer, rationale) {
    return { id: id, chapter: ch, kind: "mc", render: "text", difficulty: "easy",
             concept: concept, points: 1, prompt: prompt, options: options,
             answer: answer, rationale: rationale };
  }

  var S = [

  anchor("ch1_a_opp_cost", 1, "opportunity cost",
    "The opportunity cost of an action is:",
    ["The value of the best alternative given up",
     "The total money spent on it",
     "The sum of all alternatives given up",
     "The time it takes to complete"], 0,
    "Opportunity cost is the value of the BEST forgone alternative — not the money outlay, " +
    "which may be zero, and not the sum of every alternative, since only one could have been " +
    "chosen. It is what makes cost a concept about choice rather than about accounting."),

  anchor("ch1_a_rational", 1, "rational choice",
    "In economics, saying someone acts “rationally” means that they:",
    ["Systematically do the best they can to achieve their objectives, given their constraints",
     "Never make mistakes",
     "Care only about money",
     "Always act selfishly"], 0,
    "Rationality in economics is about consistent pursuit of one's own objectives under " +
    "constraints; it says nothing about what those objectives are. A person who gives away their " +
    "income to charity is acting rationally if that is what they value. The assumption is about " +
    "coherence of means and ends, not about selfishness or infallibility."),

  anchor("ch1_a_micro_macro", 1, "scope of the subject",
    "Which question is macroeconomic rather than microeconomic?",
    ["Why did the national unemployment rate rise last year?",
     "Why did the price of coffee rise?",
     "Should this firm build a second factory?",
     "How do rent controls affect the supply of apartments?"], 0,
    "Macroeconomics studies economy-wide aggregates — unemployment, inflation, growth, the " +
    "overall price level. The other three concern individual markets or decisions, which is " +
    "microeconomics. The division is about the level of aggregation, not about importance, and " +
    "modern macro is built substantially on microeconomic foundations."),

  anchor("ch2_a_ceteris", 2, "ceteris paribus",
    "When an economist says “ceteris paribus”, they mean:",
    ["Holding all other relevant factors constant",
     "On average over time",
     "In the long run",
     "Assuming perfect competition"], 0,
    "Ceteris paribus isolates one relationship by holding everything else fixed, which is what " +
    "makes it possible to speak of the effect of price on quantity demanded at all. It is an " +
    "analytical device, and the main source of error in applying economics is forgetting that the " +
    "other things did not in fact stay equal."),

  anchor("ch2_a_theory_test", 2, "testing theories",
    "A theory that can be reconciled with absolutely any observation is:",
    ["Not useful, because it rules nothing out and so cannot be tested",
     "Ideal, because it explains everything",
     "Necessarily true",
     "A positive statement"], 0,
    "A theory earns its keep by forbidding things. If every conceivable observation is consistent " +
    "with it, no observation can count as evidence for or against it, and it does no work. The " +
    "value of a model lies in the predictions it rules out."),

  anchor("ch2_a_normative_marker", 2, "positive versus normative",
    "Which word most reliably signals that a statement is normative?",
    ["Should", "Because", "Increases", "Approximately"], 0,
    "“Should” and “ought” prescribe rather than describe, which is the mark of " +
    "a normative claim. The other three can all appear in purely positive statements. The test is " +
    "not the vocabulary but whether evidence could in principle settle the matter — the " +
    "words are just a useful flag."),

  anchor("ch3_a_absolute_advantage", 3, "absolute advantage",
    "A country has an absolute advantage in producing a good when it:",
    ["Can produce more of it with the same resources than another country can",
     "Has the lower opportunity cost of producing it",
     "Exports more of it than anyone else",
     "Has a larger population"], 0,
    "Absolute advantage is about productivity: more output from the same inputs. Comparative " +
    "advantage — the lower opportunity cost — is a different concept and is the one " +
    "that determines the pattern of beneficial trade. A country can have an absolute advantage in " +
    "everything and still gain by specialising."),

  anchor("ch3_a_gains_source", 3, "source of gains from trade",
    "The gains from trade between two countries arise fundamentally from:",
    ["Differences in opportunity costs, which allow both to specialise",
     "One country being richer than the other",
     "One country having an absolute advantage in everything",
     "Differences in population size"], 0,
    "Whenever opportunity costs differ, there is a range of terms at which both parties gain by " +
    "specialising and trading. That is the whole engine. Equal opportunity costs mean no gains, " +
    "however different the two countries are in size or wealth."),

  anchor("ch3_a_tariff_effect", 3, "effect of a tariff",
    "A tariff on an imported good:",
    ["Raises its domestic price, helping domestic producers and hurting domestic consumers",
     "Lowers its domestic price",
     "Has no effect on domestic prices, only on the quantity imported",
     "Raises producer surplus and consumer surplus together"], 0,
    "A tariff raises the domestic price toward the world price plus the duty. Domestic producers " +
    "gain, the government collects revenue on remaining imports, and consumers lose more than " +
    "those two gains combined — the difference being deadweight loss. Both surpluses cannot " +
    "rise together, since the price moves in opposite directions for the two sides."),

  anchor("ch4_a_law_of_demand", 4, "the law of demand",
    "The law of demand states that, other things equal, a rise in price leads to:",
    ["A fall in the quantity demanded",
     "A fall in demand",
     "A rise in supply",
     "A leftward shift of the demand curve"], 0,
    "A price change moves the economy ALONG the demand curve, changing quantity demanded. It does " +
    "not shift the curve, which is what “a fall in demand” would mean. Keeping the two " +
    "straight is the single most common stumbling block in the subject."),

  anchor("ch4_a_normal_good", 4, "normal and inferior goods",
    "A good is “inferior” when:",
    ["Demand for it falls as consumer income rises",
     "It is of poor quality",
     "Its price is low",
     "It has many substitutes"], 0,
    "Inferior is a technical term about the INCOME elasticity of demand, not about quality. Bus " +
    "travel and supermarket own-brand goods are typical examples: as income rises, people buy " +
    "less of them, substituting toward alternatives they prefer."),

  anchor("ch4_a_surplus", 4, "disequilibrium",
    "If the price in a competitive market is above the equilibrium price, the result is:",
    ["A surplus, which puts downward pressure on the price",
     "A shortage, which puts upward pressure on the price",
     "A surplus, which puts upward pressure on the price",
     "No pressure, since the market is already clearing"], 0,
    "Above equilibrium, quantity supplied exceeds quantity demanded and sellers accumulate unsold " +
    "stock. Competing to clear it, they cut prices, and the price falls toward equilibrium. The " +
    "surplus is both the symptom and the mechanism of correction."),

  anchor("ch5_a_elasticity_def", 5, "definition of price elasticity",
    "The price elasticity of demand measures:",
    ["The percentage change in quantity demanded divided by the percentage change in price",
     "The change in quantity divided by the change in price",
     "The slope of the demand curve",
     "Total revenue divided by quantity"], 0,
    "Elasticity compares PERCENTAGE changes, which makes it independent of the units in which " +
    "price and quantity are measured — the reason it is used rather than the slope. A " +
    "straight-line demand curve has constant slope but varying elasticity along its length."),

  anchor("ch5_a_elastic_threshold", 5, "elastic and inelastic",
    "Demand is described as elastic when the absolute value of the elasticity is:",
    ["Greater than 1", "Less than 1", "Equal to 0", "Negative"], 0,
    "An absolute value above 1 means quantity responds proportionally more than price, which is " +
    "elastic demand; below 1 is inelastic; exactly 1 is unit elastic. Demand elasticities are " +
    "almost always negative by the law of demand, so the convention is to compare absolute values."),

  anchor("ch5_a_time_horizon", 5, "elasticity and time",
    "Demand for a good is generally more elastic:",
    ["Over a longer time horizon, because buyers have more time to find substitutes",
     "Over a shorter time horizon, because the price change is fresher",
     "When the good has no substitutes",
     "When the good is a necessity"], 0,
    "Time is one of the main determinants of elasticity. Given longer, buyers change equipment, " +
    "habits and locations — which is why petrol demand is famously inelastic within a month " +
    "and considerably elastic over five years. It is also why short-run policy evaluations can " +
    "badly mislead."),

  anchor("ch6_a_price_floor", 6, "price floors",
    "A binding price floor in a competitive market produces:",
    ["A persistent surplus", "A persistent shortage", "No change in quantity",
     "A lower price than before"], 0,
    "A binding floor sits ABOVE the equilibrium price, so quantity supplied exceeds quantity " +
    "demanded and the excess persists because the price is not permitted to fall. Agricultural " +
    "price supports and minimum wages are the standard examples."),

  anchor("ch6_a_externality", 6, "externalities",
    "A negative externality in production means the market will tend to produce:",
    ["More than the socially efficient quantity",
     "Less than the socially efficient quantity",
     "Exactly the efficient quantity",
     "Nothing at all"], 0,
    "When part of the cost falls on third parties, the producer's private cost is below the " +
    "social cost, so the market equilibrium quantity exceeds the efficient one. A positive " +
    "externality produces the mirror image — too little — which is the case for " +
    "subsidising vaccination or basic research."),

  anchor("ch6_a_surplus_meaning", 6, "consumer surplus",
    "Consumer surplus is:",
    ["The difference between what buyers are willing to pay and what they actually pay",
     "The total amount buyers spend",
     "The profit earned by sellers",
     "The quantity bought at the equilibrium price"], 0,
    "Consumer surplus measures the value buyers receive over and above what they hand over, and " +
    "it is the area between the demand curve and the price. Together with producer surplus it is " +
    "the standard measure of the gains a market generates, and the thing a deadweight loss " +
    "destroys."),

  anchor("ch7_a_gdp_def", 7, "definition of GDP",
    "Gross domestic product is the market value of all:",
    ["Final goods and services produced within a country in a given period",
     "Goods and services sold within a country, including intermediate goods",
     "Goods produced by a country's citizens, wherever they are",
     "Transactions that take place in a country"], 0,
    "Three parts matter: FINAL goods only, to avoid double counting; produced WITHIN the country, " +
    "which distinguishes GDP from GNP; and in a given PERIOD, making it a flow rather than a " +
    "stock. The last option describes a figure that would count every intermediate sale."),

  anchor("ch7_a_components", 7, "the expenditure identity",
    "In the expenditure approach, GDP equals:",
    ["C + I + G + NX", "C + I + G + M", "C + S + G + NX", "C + I + G + T"], 0,
    "Consumption plus investment plus government purchases plus net exports. Net exports are " +
    "exports MINUS imports, and the subtraction exists so that spending on foreign-produced goods " +
    "does not count toward domestic production. Saving and taxes are not expenditure categories."),

  anchor("ch7_a_transfer", 7, "transfer payments",
    "Government transfer payments such as pensions are excluded from the G in GDP because:",
    ["No good or service is produced in exchange for them",
     "They are too small to matter",
     "They are paid to individuals rather than firms",
     "They are financed by borrowing"], 0,
    "GDP measures production. A transfer moves purchasing power without anything being produced " +
    "in return, so including it would overstate output. It enters GDP later, as consumption, when " +
    "the recipient spends it."),

  anchor("ch8_a_cpi_def", 8, "the consumer price index",
    "The consumer price index measures:",
    ["The cost of a fixed basket of goods bought by a typical household",
     "The cost of everything produced in the economy",
     "The average of all prices in the economy, equally weighted",
     "The change in wages over time"], 0,
    "The CPI prices a fixed, weighted basket representing typical household purchases. The " +
    "weighting matters — an equally weighted average would treat the price of salt as " +
    "mattering as much as the price of housing — and the fixity of the basket is the source " +
    "of substitution bias."),

  anchor("ch8_a_inflation_def", 8, "inflation",
    "The inflation rate is:",
    ["The percentage change in the price level from one period to the next",
     "The price level itself",
     "The difference between the price levels in two periods",
     "The rate at which the money supply grows"], 0,
    "Inflation is a rate of change, not a level, which is why a falling inflation rate still means " +
    "rising prices. Money growth is closely related to inflation over long horizons but is a " +
    "different variable, and the two come apart when velocity moves."),

  anchor("ch8_a_deflation", 8, "deflation",
    "Deflation is dangerous for an indebted economy mainly because:",
    ["It raises the real value of existing nominal debts",
     "It lowers the real value of existing nominal debts",
     "It raises nominal interest rates",
     "It makes exports more expensive"], 0,
    "Debts are fixed in nominal terms, so when prices fall the real burden of repaying them rises. " +
    "Borrowers cut spending to service heavier debts, which weakens demand and pushes prices down " +
    "further — Irving Fisher's debt-deflation spiral, and a central reason central banks " +
    "target positive inflation rather than zero."),

  anchor("ch9_a_productivity", 9, "productivity",
    "A country's standard of living depends overwhelmingly on:",
    ["Its productivity — output per worker",
     "Its money supply",
     "Its population size",
     "Its trade surplus"], 0,
    "Living standards are produced goods and services per person, so output per worker is close to " +
    "the whole story over long horizons. Money affects prices rather than real output in the long " +
    "run, and neither population size nor the trade balance determines productivity."),

  anchor("ch9_a_human_capital", 9, "human capital",
    "Human capital refers to:",
    ["The knowledge and skills workers acquire through education and experience",
     "The number of workers in an economy",
     "The machinery workers use",
     "Spending on healthcare"], 0,
    "Human capital is embodied knowledge and skill, distinct from the raw size of the labour force " +
    "and from physical capital. Like physical capital it is accumulated through investment — " +
    "schooling and training — and it raises output per worker rather than merely the number " +
    "of workers."),

  anchor("ch9_a_diminishing_returns", 9, "diminishing returns",
    "Diminishing returns to capital means that, holding other inputs fixed, each additional unit " +
      "of capital:",
    ["Adds less to output than the one before",
     "Adds more to output than the one before",
     "Adds nothing to output",
     "Reduces total output"], 0,
    "Each extra machine raises output, but by progressively less when labour and technology are " +
    "held constant. This is what makes poor countries grow faster for a given investment rate in " +
    "the Solow model, and what prevents capital accumulation alone from sustaining growth forever."),

  anchor("ch10_a_national_saving", 10, "national saving",
    "National saving in a closed economy equals:",
    ["Private saving plus public saving",
     "Household saving only",
     "Total income minus taxes",
     "Investment minus the government deficit"], 0,
    "National saving is the sum of what households and firms save and what the government saves " +
    "— a budget surplus being positive public saving and a deficit negative. In a closed " +
    "economy national saving equals investment, which is why deficits crowd out investment there."),

  anchor("ch10_a_real_vs_nominal_rate", 10, "the real interest rate",
    "The real interest rate equals approximately:",
    ["The nominal interest rate minus the inflation rate",
     "The nominal interest rate plus the inflation rate",
     "The inflation rate minus the nominal interest rate",
     "The nominal interest rate divided by the price level"], 0,
    "The Fisher approximation: real = nominal − inflation. The real rate is what a lender " +
    "earns in purchasing power and what governs saving and investment decisions, which is why " +
    "unexpectedly high inflation transfers wealth from lenders to borrowers."),

  anchor("ch10_a_bond_vs_stock", 10, "financial instruments",
    "The essential difference between a bond and a share of stock is that a bond represents:",
    ["A loan to the issuer, with a claim to fixed payments",
     "Part ownership of the issuer",
     "A claim on the issuer's profits",
     "A government guarantee"], 0,
    "A bond is debt: the holder is a creditor entitled to specified payments and ranks ahead of " +
    "owners if the issuer fails. A share is equity: the holder owns part of the firm, has a claim " +
    "on residual profits, and is paid last. Risk and return follow from that ordering."),

  anchor("ch11_a_m1", 11, "measuring the money supply",
    "Which is included in the narrowest common measure of the money supply?",
    ["Currency in circulation and demand deposits",
     "Government bonds",
     "Corporate shares",
     "Real estate"], 0,
    "The narrow measure captures what functions directly as a medium of exchange: cash and " +
    "chequable deposits. Bonds, shares and property are stores of value but cannot be used " +
    "directly in transactions, so they lie outside it — broader aggregates add progressively " +
    "less liquid assets."),

  anchor("ch11_a_reserve_ratio", 11, "fractional reserve banking",
    "In a fractional reserve system, banks:",
    ["Hold only a fraction of deposits as reserves and lend out the rest",
     "Hold all deposits as reserves",
     "Are prohibited from lending",
     "Are funded entirely by the central bank"], 0,
    "Holding only a fraction as reserves is what allows banks to extend credit, and it is the " +
    "source of both their economic usefulness and their fragility: the reserves cannot cover " +
    "simultaneous withdrawal by all depositors, which is why runs are possible and why deposit " +
    "insurance exists."),

  anchor("ch11_a_cb_function", 11, "the central bank",
    "Which is NOT a standard function of a central bank?",
    ["Setting the government's tax rates",
     "Conducting monetary policy",
     "Acting as lender of last resort",
     "Supervising the banking system"], 0,
    "Taxation is a fiscal matter decided by the legislature. The other three are core central " +
    "bank functions, and the separation is deliberate — it is the institutional expression of " +
    "central bank independence."),

  anchor("ch12_a_quantity_equation", 12, "the quantity equation",
    "The quantity equation is:",
    ["M × V = P × Y", "M + V = P + Y", "M / V = P / Y", "M × P = V × Y"], 0,
    "Money times velocity equals the price level times real output. It is an identity by the " +
    "definition of velocity, and it becomes a theory only when assumptions are added about V and " +
    "Y — which is exactly where the quantity theory's short-run predictions can fail."),

  anchor("ch12_a_velocity", 12, "velocity",
    "The velocity of money measures:",
    ["How often a unit of money changes hands in a given period",
     "How fast the money supply grows",
     "How quickly prices rise",
     "The speed of electronic payments"], 0,
    "Velocity is nominal output divided by the money stock — the number of times the average " +
    "unit of currency is spent in a period. Its stability is the assumption that turns the " +
    "quantity equation into a prediction, and its collapse after 2008 is why large increases in " +
    "the monetary base did not produce inflation."),

  anchor("ch12_a_long_run_inflation", 12, "the long-run cause of inflation",
    "Over long horizons, sustained inflation is most closely associated with:",
    ["Sustained growth in the money supply in excess of real output growth",
     "Greedy firms raising prices",
     "Trade unions demanding higher wages",
     "Rising oil prices"], 0,
    "Across countries and centuries, sustained inflation tracks money growth relative to output " +
    "growth. One-off shocks to oil prices or wages change the price LEVEL and can start a spiral " +
    "if accommodated, but they cannot by themselves produce decades of continuing inflation " +
    "without monetary growth behind them."),

  anchor("ch13_a_nominal_exchange", 13, "exchange rates",
    "The nominal exchange rate is:",
    ["The rate at which one currency trades for another",
     "The rate at which goods trade between countries",
     "The difference between two countries' interest rates",
     "The ratio of two countries' price levels"], 0,
    "The nominal rate is the currency price. The REAL exchange rate is the rate at which goods " +
    "trade, which adjusts the nominal rate for the two price levels, and it is the real rate that " +
    "governs competitiveness and net exports."),

  anchor("ch13_a_appreciation", 13, "appreciation",
    "If a currency appreciates, then that country's:",
    ["Exports become more expensive abroad and imports cheaper at home",
     "Exports become cheaper abroad and imports more expensive at home",
     "Exports and imports both become more expensive",
     "Trade balance necessarily improves"], 0,
    "A stronger currency buys more foreign currency, so domestic goods cost more to foreigners " +
    "while foreign goods cost less domestically. Export volumes fall and import volumes rise, so " +
    "the trade balance tends to WORSEN — though the J-curve means it may improve briefly " +
    "first, before quantities adjust."),

  anchor("ch13_a_nco_nx", 13, "the open-economy identity",
    "In an open economy, net capital outflow equals:",
    ["Net exports", "Gross domestic product", "National saving", "The government deficit"], 0,
    "NCO = NX is an accounting identity: every dollar a country earns by exporting more than it " +
    "imports must be used to acquire foreign assets. It holds at any exchange rate and under any " +
    "policy, which is why a trade deficit and a capital inflow are two descriptions of one event."),

  anchor("ch14_a_labour_force", 14, "the labour force",
    "The labour force consists of:",
    ["The employed plus the unemployed who are actively seeking work",
     "Everyone of working age",
     "Everyone who is employed",
     "The entire adult population"], 0,
    "A person must be working or actively looking to count. Someone of working age who is neither " +
    "— a student, a carer, a retiree, a discouraged worker — is outside the labour " +
    "force, which is why the unemployment rate can fall simply because people stop searching."),

  anchor("ch14_a_frictional", 14, "frictional unemployment",
    "Frictional unemployment arises because:",
    ["It takes time for workers and suitable jobs to find each other",
     "Wages are set above the market-clearing level",
     "Aggregate demand is too low",
     "Workers lack the skills employers need"], 0,
    "Frictional unemployment is search time in a labour market where workers and jobs are " +
    "heterogeneous, and some of it is efficient — a better match is worth waiting for. " +
    "Structural unemployment is the skills-and-location mismatch; cyclical unemployment is the " +
    "demand shortfall."),

  anchor("ch14_a_u_rate", 14, "computing the unemployment rate",
    "The unemployment rate is calculated as the number of unemployed divided by:",
    ["The labour force", "The adult population", "The number employed", "The total population"], 0,
    "The denominator is the labour force — the employed plus the unemployed. Using the whole " +
    "population would mix in children, students and retirees, and the choice of denominator is " +
    "exactly why movements in participation can move the rate without any change in employment."),

  anchor("ch15_a_ad_slope", 15, "the aggregate demand curve",
    "The aggregate demand curve slopes downward in part because a lower price level:",
    ["Raises the real value of money holdings, so households spend more",
     "Lowers the cost of production for firms",
     "Reduces the quantity of money in circulation",
     "Raises the natural rate of unemployment"], 0,
    "This is the wealth effect: a lower price level makes money holdings worth more in real terms, " +
    "so households feel richer and spend more. The interest-rate effect and the exchange-rate " +
    "effect reinforce it. Note that the reasoning is quite different from the microeconomic demand " +
    "curve, which rests on substitution toward other goods."),

  anchor("ch15_a_lras", 15, "long-run aggregate supply",
    "The long-run aggregate supply curve is vertical because, in the long run, output is " +
      "determined by:",
    ["Resources, technology and institutions, not the price level",
     "The money supply",
     "Aggregate demand",
     "The inflation rate"], 0,
    "In the long run, nominal variables cannot change real output: doubling every price and wage " +
    "leaves the economy producing the same goods with the same resources. Output is set by the " +
    "capital stock, the labour force, technology and institutions, which is why LRAS stands at " +
    "potential output regardless of the price level."),

  anchor("ch15_a_demand_shock", 15, "demand shocks",
    "A fall in aggregate demand in the short run causes:",
    ["Output to fall and the price level to fall",
     "Output to fall and the price level to rise",
     "Output to rise and the price level to fall",
     "Output and the price level both to rise"], 0,
    "Moving down along an upward-sloping short-run aggregate supply curve lowers both output and " +
    "the price level. That the two move TOGETHER is the signature of a demand shock, and it is " +
    "what distinguishes it from a supply shock, which moves them in opposite directions."),

  anchor("ch16_a_is_meaning", 16, "the IS curve",
    "The IS curve shows combinations of the interest rate and output at which:",
    ["The goods market is in equilibrium",
     "The money market is in equilibrium",
     "The labour market is in equilibrium",
     "The government budget is balanced"], 0,
    "IS traces where planned spending equals output — goods market equilibrium. LM traces " +
    "money market equilibrium. Neither alone determines the economy; their intersection gives the " +
    "interest rate and output at which both markets clear."),

  anchor("ch16_a_lm_slope", 16, "the LM curve",
    "The LM curve slopes upward because a higher level of output:",
    ["Raises money demand, which requires a higher interest rate to clear the money market",
     "Lowers money demand",
     "Increases the money supply",
     "Reduces the price level"], 0,
    "More output means more transactions and so greater demand for money. With the money supply " +
    "fixed, equilibrium is restored only if the interest rate rises enough to reduce the quantity " +
    "of money people wish to hold — hence the positive slope."),

  anchor("ch16_a_fiscal_direction", 16, "fiscal policy in IS-LM",
    "An increase in government spending shifts:",
    ["The IS curve to the right",
     "The IS curve to the left",
     "The LM curve to the right",
     "The LM curve to the left"], 0,
    "Government spending is a component of planned expenditure, so more of it raises the output " +
    "consistent with goods-market equilibrium at every interest rate — a rightward shift of " +
    "IS. Only changes in the money supply or money demand move LM."),

  anchor("ch17_a_policy_rate", 17, "the policy instrument",
    "A modern central bank conducting conventional monetary policy primarily sets:",
    ["A short-term nominal interest rate",
     "The quantity of money directly",
     "The inflation rate directly",
     "Long-term interest rates directly"], 0,
    "Central banks announce a short-term policy rate and supply whatever quantity of reserves " +
    "achieves it; the money stock is then an outcome rather than an instrument. Inflation and long " +
    "rates are targets or transmission variables, influenced but not set."),

  anchor("ch17_a_expansionary", 17, "expansionary monetary policy",
    "Expansionary monetary policy is intended to:",
    ["Lower interest rates and raise aggregate demand",
     "Raise interest rates and lower aggregate demand",
     "Lower both interest rates and aggregate demand",
     "Raise the natural rate of unemployment"], 0,
    "Easing lowers borrowing costs, which stimulates investment, housing and consumer durables, " +
    "and tends to depreciate the currency, raising net exports. The aim is higher aggregate demand " +
    "and so higher output in the short run — not a change in the natural rate, which is a " +
    "real, supply-side variable."),

  anchor("ch17_a_lag", 17, "policy lags",
    "The “long and variable lag” in monetary policy refers to the delay between:",
    ["A policy change and its main effect on output and inflation",
     "A shock occurring and the data revealing it",
     "A committee deciding and announcing",
     "A bank raising rates and depositors noticing"], 0,
    "The transmission lag is roughly a year to eighteen months and varies by episode. Its length " +
    "is why policy must be set on forecasts rather than current conditions, and why fine-tuning " +
    "risks being procyclical — arriving to stimulate an economy that has already recovered."),

  anchor("ch18_a_fiscal_tools", 18, "fiscal policy instruments",
    "Fiscal policy consists of changes in:",
    ["Government spending and taxation",
     "Interest rates and the money supply",
     "Exchange rates and tariffs",
     "Bank reserve requirements"], 0,
    "Fiscal policy is the budget: what the government spends and what it raises in tax. The other " +
    "options are monetary, trade and regulatory instruments, decided by different authorities — " +
    "a separation that matters for the time-consistency argument for central bank independence."),

  anchor("ch18_a_deficit_vs_debt", 18, "deficit and debt",
    "The difference between the government deficit and the government debt is that the deficit is:",
    ["A flow — borrowing during one period; the debt is the accumulated stock",
     "A stock, while the debt is a flow",
     "Always larger than the debt",
     "Measured in real terms, while the debt is nominal"], 0,
    "The deficit is this year's shortfall; the debt is the sum of all past deficits less " +
    "surpluses. A country can reduce its deficit while its debt continues to rise — a " +
    "distinction routinely blurred in public argument, and one that matters because sustainability " +
    "depends on the debt path, not the annual figure."),

  anchor("ch18_a_contractionary", 18, "contractionary fiscal policy",
    "Contractionary fiscal policy involves:",
    ["Cutting government spending or raising taxes",
     "Raising government spending or cutting taxes",
     "Raising interest rates",
     "Selling government bonds to the central bank"], 0,
    "Contractionary fiscal policy reduces aggregate demand by withdrawing spending power — " +
    "lower purchases or higher taxes. The second option is expansionary, and the remaining two " +
    "are monetary operations rather than fiscal ones.")

  ];

  var conflicts = MA.register(G, S);
  if (conflicts && conflicts.length) {
    throw new Error("ma-generators-h.js: duplicate ids: " + conflicts.join(", "));
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
