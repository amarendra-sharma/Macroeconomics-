/* ============================================================================
   ma-generators-c.js  —  Applied Macroeconomics question bank, CHAPTERS 1-6.

   Loads AFTER ma-generators.js and registers into the same engine.

     1 What Economics Actually Studies
     2 How Economists Argue
     3 Trade & the Distributional Question
     4 Markets: Supply and Demand
     5 Elasticity
     6 Government & Markets

   These chapters overlap with Intro Micro, but the treatment here follows the
   macro textbook, which puts the DISTRIBUTIONAL question at the centre of the
   trade chapter rather than treating gains from trade as the whole story.
   Chapter 3's hard items therefore test who loses as well as who gains.

   Safari-safe plain JS. Deterministic: all numbers from the seeded rng.
   ============================================================================ */
(function (global) {
  "use strict";

  var MA = global.MAGenerators;
  if (!MA || !MA.register) {
    try { console.error("ma-generators-c.js: load ma-generators.js first."); } catch (e) {}
    return;
  }
  var U = MA.util;
  var ri = U.rng_int, pick = U.rng_pick, round1 = U.round1, round2 = U.round2;
  var money = U.money, shuffleWithAnswer = U.shuffleWithAnswer;

  var G = {};

  /* ======================================================================
     CHAPTER 1 — WHAT ECONOMICS ACTUALLY STUDIES
     ====================================================================== */

  G["ch1_opportunity_cost"] = {
    id: "ch1_opportunity_cost", chapter: 1, kind: "numeric", render: "text",
    difficulty: "med", concept: "opportunity cost", points: 2,
    build: function (rng) {
      var wage = ri(rng, 14, 30);
      var hours = ri(rng, 3, 6);
      var ticket = ri(rng, 25, 90);
      return {
        prompt: "You go to a concert instead of working. The ticket costs " + money(ticket) +
          " and the concert takes " + hours + " hours, during which you could have earned " +
          money(wage) + " per hour. What is the opportunity cost of attending, in dollars?",
        answer: ticket + wage * hours, tolerance: 0.01,
        rationale: "Opportunity cost = explicit cost + implicit cost = " + ticket + " + (" +
          wage + " × " + hours + ") = " + money(ticket + wage * hours) +
          ". The forgone wages are just as real a cost as the ticket price, even though no one " +
          "sends you a bill for them."
      };
    }
  };

  /* HARD: the classic sunk-cost + opportunity-cost combination. */
  G["ch1_hard_sunk_cost"] = {
    id: "ch1_hard_sunk_cost", chapter: 1, kind: "mc", render: "text",
    difficulty: "hard", concept: "sunk costs", points: 3,
    build: function (rng) {
      var spent = ri(rng, 3, 9) * 100;
      var finish = ri(rng, 2, 6) * 100;
      var value = finish + ri(rng, 1, 4) * 100;
      var pool = [
        "Finish it — the remaining " + money(finish) + " cost is less than the " + money(value) +
          " it will be worth, and the " + money(spent) + " already spent is irrelevant to the decision",
        "Abandon it — the total cost of " + money(spent + finish) + " exceeds the " + money(value) + " value",
        "Finish it, because abandoning it would waste the " + money(spent) + " already spent",
        "It cannot be decided without knowing how long the project has taken"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "A firm has already spent " + money(spent) +
          " on a project that cannot be recovered. Completing it will cost another " +
          money(finish) + ", and the finished project will be worth " + money(value) +
          ". What should the firm do, and why?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "The " + money(spent) + " is SUNK: it is gone whatever the firm decides, so " +
          "it should play no part in the choice. The relevant comparison is the forward-looking " +
          "one: spend " + money(finish) + " more to get " + money(value) + ", a gain of " +
          money(value - finish) +
          ". Note that option 3 reaches the right ACTION for the wrong reason — 'don't waste " +
          "what we've spent' is the sunk-cost fallacy, and it would lead you astray whenever the " +
          "forward-looking numbers went the other way."
      };
    }
  };

  G["ch1_hard_marginal_thinking"] = {
    id: "ch1_hard_marginal_thinking", chapter: 1, kind: "mc", render: "text",
    difficulty: "hard", concept: "thinking at the margin", points: 3,
    build: function (rng) {
      var seats = ri(rng, 8, 20);
      var avgCost = ri(rng, 300, 600);
      var marginal = ri(rng, 20, 60);
      var offer = marginal + ri(rng, 30, 120);
      var pool = [
        "Accept — the marginal cost of carrying one more passenger is only " + money(marginal) +
          ", well below the " + money(offer) + " offered, so the flight's profit rises",
        "Refuse — " + money(offer) + " is below the average cost per seat of " + money(avgCost),
        "Refuse — selling below average cost is never profitable",
        "Accept only if the offer exceeds " + money(avgCost)
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "A plane about to depart has " + seats +
          " empty seats. The average cost per seat on this flight is " + money(avgCost) +
          ", but the extra cost of carrying one more passenger — fuel, a meal, paperwork — is " +
          money(marginal) + ". A standby passenger offers " + money(offer) +
          ". Should the airline accept?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "The plane is flying regardless, so almost all of the " + money(avgCost) +
          " average cost is already committed. The decision is at the MARGIN: does one more " +
          "passenger add more revenue (" + money(offer) + ") than cost (" + money(marginal) +
          ")? It adds " + money(offer - marginal) +
          " to profit. Comparing the offer to AVERAGE cost is the standard error — average cost " +
          "answers a different question, namely whether to run the flight at all."
      };
    }
  };

  G["ch1_hard_incentives"] = {
    id: "ch1_hard_incentives", chapter: 1, kind: "mc", render: "text",
    difficulty: "hard", concept: "unintended consequences of incentives", points: 3,
    build: function (rng) {
      var cases = [
        { t: "a law requires cars to have seat belts and airbags",
          ans: "Drivers feel safer and drive somewhat more aggressively, so accidents per mile rise even as deaths per accident fall",
          why: "Peltzman's result: safety mandates change behaviour, partially offsetting the direct benefit. Pedestrians, who get no added protection, may fare worse." },
        { t: "a city caps rents well below market levels",
          ans: "The quantity of rental housing supplied falls over time and non-price rationing takes over — queues, connections, and reduced maintenance",
          why: "Landlords respond to a lower return by supplying and maintaining less; the shortage is allocated by something other than price." },
        { t: "a government pays a bounty for every venomous snake turned in, to reduce the snake population",
          ans: "People begin breeding the animals to collect the bounty, and the population ends up larger than before",
          why: "The famous 'cobra effect': the reward was attached to turning snakes IN, not to there being fewer snakes." },
        { t: "a school district rewards teachers based purely on their students' standardized test scores",
          ans: "Teaching narrows toward the tested material, and in some cases outright cheating appears",
          why: "When a measure becomes a target it stops measuring what it did — Goodhart's law. The incentive was attached to the proxy rather than to learning." }
      ];
      var cs = pick(rng, cases);
      var pool = [
        "Drivers feel safer and drive somewhat more aggressively, so accidents per mile rise even as deaths per accident fall",
        "The quantity of rental housing supplied falls over time and non-price rationing takes over — queues, connections, and reduced maintenance",
        "People begin breeding the animals to collect the bounty, and the population ends up larger than before",
        "Teaching narrows toward the tested material, and in some cases outright cheating appears"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Suppose " + cs.t +
          ". Which unintended consequence does economic reasoning predict?",
        options: sh.options, answer: sh.correctIndex,
        rationale: cs.why + " The general lesson: people respond to incentives, so a policy's " +
          "effect is rarely just its direct effect. Ask what behaviour the rule REWARDS, not " +
          "what outcome it names."
      };
    }
  };

  G["ch1_hard_efficiency_equity"] = {
    id: "ch1_hard_efficiency_equity", chapter: 1, kind: "mc", render: "text",
    difficulty: "hard", concept: "efficiency vs equity", points: 3,
    build: function (rng) {
      var pool = [
        "It may improve equity while reducing efficiency, because the taxes and transfers that redistribute income also blunt the incentive to work and invest",
        "It improves both efficiency and equity, since redistribution always raises total output",
        "It improves efficiency but reduces equity",
        "It has no effect on either, because transfers only move money around"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "A government expands a programme that taxes high earners to fund transfers to " +
          "low-income households. In terms of the efficiency-equity trade-off, what is the most " +
          "accurate assessment?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Redistribution can make the distribution fairer while shrinking the pie: " +
          "higher marginal tax rates reduce the reward to additional work and investment, and " +
          "benefits that phase out with income act as an implicit tax on earning more. " +
          "Recognizing this is not an argument against redistribution — it is the statement that " +
          "there is a genuine trade-off whose terms are an empirical question, and reasonable " +
          "people weigh the two goals differently."
      };
    }
  };

  /* ======================================================================
     CHAPTER 2 — HOW ECONOMISTS ARGUE
     ====================================================================== */

  G["ch2_positive_normative"] = {
    id: "ch2_positive_normative", chapter: 2, kind: "mc", render: "text",
    difficulty: "med", concept: "positive vs normative", points: 2,
    build: function (rng) {
      var cases = [
        { t: "raising the minimum wage to $15 would reduce teenage employment by about 3%", kind: "positive" },
        { t: "the government ought to guarantee health care to every citizen", kind: "normative" },
        { t: "a carbon tax of $50 per tonne would cut emissions by roughly 10% within a decade", kind: "positive" },
        { t: "reducing inequality is more important than raising average income", kind: "normative" },
        { t: "an increase in the money supply raises the price level in the long run", kind: "positive" },
        { t: "the wealthy should pay a larger share of their income in tax", kind: "normative" },
        { t: "trade with low-wage countries has lowered the price of manufactured goods in the United States", kind: "positive" }
      ];
      var cs = pick(rng, cases);
      var pool = [
        "A positive statement — a claim about what IS, which evidence could in principle confirm or refute",
        "A normative statement — a claim about what OUGHT to be, which evidence alone cannot settle"
      ];
      var sh = shuffleWithAnswer(rng, pool, cs.kind === "positive" ? 0 : 1);
      return {
        prompt: "Classify this statement: “" + cs.t + ".”",
        options: sh.options, answer: sh.correctIndex,
        rationale: cs.kind === "positive" ?
          "This is a factual claim about the world. You might doubt the magnitude, but the question is settled by evidence, not by values." :
          "This asserts what SHOULD happen. Evidence can inform it — by telling us the consequences of each option — but cannot by itself decide it, because it rests on a value judgment. Watch for 'should', 'ought', 'better', 'fair'."
      };
    }
  };

  G["ch2_hard_ceteris_paribus"] = {
    id: "ch2_hard_ceteris_paribus", chapter: 2, kind: "mc", render: "text",
    difficulty: "hard", concept: "ceteris paribus and confounding", points: 3,
    build: function (rng) {
      var cases = [
        { t: "Ice cream sales and drowning deaths rise together every summer.",
          ans: "A third factor — hot weather — drives both, so the correlation is not evidence that one causes the other" },
        { t: "Cities that hire more police officers tend to have higher crime rates.",
          ans: "Causation may run backwards: high-crime cities hire more police, rather than police causing crime" },
        { t: "People who take vitamin supplements tend to be healthier than those who do not.",
          ans: "Those who take supplements may differ systematically in other ways — income, diet, exercise — that also affect health" },
        { t: "Countries with more mobile phones per person have higher GDP per person.",
          ans: "Causation may run backwards: high-GDP countries can afford more phones, rather than phones causing growth" }
      ];
      var cs = pick(rng, cases);
      var pool = [
        "A third factor — hot weather — drives both, so the correlation is not evidence that one causes the other",
        "Causation may run backwards: high-crime cities hire more police, rather than police causing crime",
        "Those who take supplements may differ systematically in other ways — income, diet, exercise — that also affect health",
        "Causation may run backwards: high-GDP countries can afford more phones, rather than phones causing growth"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "“" + cs.t + "” What is the problem with reading this correlation as causation?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Economists cannot usually run controlled experiments, so 'other things equal' " +
          "has to be imposed statistically rather than in a laboratory. The two standard threats " +
          "are OMITTED VARIABLES (a third factor drives both) and REVERSE CAUSALITY (the effect " +
          "drives the cause). Both are why credible empirical work leans on natural experiments, " +
          "instruments, or randomized designs rather than raw correlations."
      };
    }
  };

  G["ch2_ppf_opportunity_cost"] = {
    id: "ch2_ppf_opportunity_cost", chapter: 2, kind: "numeric", render: "graphical",
    difficulty: "hard", concept: "opportunity cost along a PPF", points: 3,
    build: function (rng) {
      var k = pick(rng, [1, 2, 3]);
      var xmax = ri(rng, 6, 10);
      var ymax = k * xmax;
      var x1 = ri(rng, 1, 2);
      var x2 = x1 + ri(rng, 2, 3);
      var y1 = ymax - k * x1, y2 = ymax - k * x2;
      return {
        prompt: "An economy's production possibilities frontier is the straight line running from " +
          ymax + " units of good Y (producing no X) to " + xmax +
          " units of good X (producing no Y). If it moves from producing " + x1 +
          " units of X to " + x2 +
          " units of X, how many units of Y must it give up?",
        diagramSpec: { type: "ppf", xmax: xmax, ymax: ymax, bow: 0,
          xlab: "Good X", ylab: "Good Y",
          points: [{ x: x1, y: y1, label: "A", state: "on" }, { x: x2, y: y2, label: "B", state: "on" }] },
        answer: y1 - y2, tolerance: 0.01,
        rationale: "The frontier's slope is −" + ymax + "/" + xmax + " = −" + k +
          ", so each unit of X costs " + k + " units of Y. Moving from X = " + x1 + " to X = " +
          x2 + " gains " + (x2 - x1) + " units of X at a cost of " + (x2 - x1) + " × " + k +
          " = " + (y1 - y2) + " units of Y. A STRAIGHT frontier means constant opportunity cost; " +
          "a bowed-out frontier would mean the cost rises as you specialize."
      };
    }
  };

  G["ch2_hard_ppf_shape"] = {
    id: "ch2_hard_ppf_shape", chapter: 2, kind: "mc", render: "text",
    difficulty: "hard", concept: "why the PPF is bowed out", points: 3,
    build: function (rng) {
      var pool = [
        "Resources are not equally suited to both goods, so as more of one is produced, progressively less suitable resources must be shifted into it — raising its opportunity cost",
        "Because technology improves as more is produced",
        "Because consumers prefer a balanced mix of the two goods",
        "Because the economy always operates inside the frontier"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Most production possibilities frontiers are drawn bowed outward from the origin " +
          "rather than as straight lines. What does that curvature represent?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "The bow reflects INCREASING opportunity cost. Land and workers best suited to " +
          "farming are moved into manufacturing first only reluctantly; push far enough and you " +
          "are converting prime farmland into factories, giving up a great deal of food per extra " +
          "car. A straight line would mean all resources are perfectly interchangeable. Note the " +
          "curvature says nothing about preferences — the PPF is about production possibilities, " +
          "not about which point is chosen."
      };
    }
  };

  /* ======================================================================
     CHAPTER 3 — TRADE AND THE DISTRIBUTIONAL QUESTION
     ====================================================================== */

  G["ch3_comparative_advantage"] = {
    id: "ch3_comparative_advantage", chapter: 3, kind: "numeric", render: "text",
    difficulty: "hard", concept: "opportunity cost and comparative advantage", points: 3,
    build: function (rng) {
      var goods = pick(rng, [["wheat", "cloth"], ["computers", "shirts"], ["wine", "cheese"]]);
      var a1 = ri(rng, 4, 12), a2 = ri(rng, 4, 12);
      return {
        prompt: "Using all its resources, Country A can produce either " + a1 + " units of " +
          goods[0] + " or " + a2 + " units of " + goods[1] +
          ". What is Country A's opportunity cost of producing ONE unit of " + goods[0] +
          ", measured in units of " + goods[1] + "? (Two decimal places.)",
        answer: round2(a2 / a1), tolerance: 0.02,
        rationale: "Producing all " + a1 + " units of " + goods[0] + " means giving up all " +
          a2 + " units of " + goods[1] + ", so one unit of " + goods[0] + " costs " + a2 +
          "/" + a1 + " = " + round2(a2 / a1) + " units of " + goods[1] +
          ". Opportunity cost is always a RATIO of what you give up to what you get — and " +
          "comparative advantage is decided by comparing these ratios across countries, never " +
          "by comparing output levels."
      };
    }
  };

  G["ch3_hard_ca_absolute_trap"] = {
    id: "ch3_hard_ca_absolute_trap", chapter: 3, kind: "mc", render: "text",
    difficulty: "hard", concept: "absolute vs comparative advantage", points: 3,
    build: function (rng) {
      /* A is absolutely better at BOTH goods, but B has comparative advantage in one */
      var a1 = ri(rng, 8, 12), a2 = ri(rng, 8, 12);
      var b1 = ri(rng, 2, 5), b2 = ri(rng, 2, 5);
      /* ensure A dominates absolutely and the opportunity costs differ */
      var ocA = a2 / a1, ocB = b2 / b1;
      var guard = 0;
      while (Math.abs(ocA - ocB) < 0.15 && guard < 30) { b2 = ri(rng, 2, 5); ocB = b2 / b1; guard++; }
      var aCheaper = ocA < ocB;
      var pool = [
        "Country A should specialize in wheat and Country B in cloth — comparative advantage, not absolute advantage, determines the pattern of trade",
        "Country B should specialize in wheat and Country A in cloth — comparative advantage, not absolute advantage, determines the pattern of trade",
        "Country A should produce both goods, since it is more productive at both",
        "Neither country gains from trade, because A is better at everything"
      ];
      var sh = shuffleWithAnswer(rng, pool, aCheaper ? 0 : 1);
      return {
        prompt: "Country A can produce " + a1 + " units of wheat or " + a2 +
          " units of cloth with its resources. Country B can produce only " + b1 +
          " units of wheat or " + b2 +
          " units of cloth — less of BOTH goods. Should the two countries trade, and if so, who " +
          "should produce what?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "A's opportunity cost of wheat is " + round2(ocA) + " cloth; B's is " +
          round2(ocB) + " cloth. " + (aCheaper ? "A" : "B") +
          " gives up less cloth per unit of wheat, so " + (aCheaper ? "A" : "B") +
          " has the comparative advantage in wheat and the other country in cloth. Being " +
          "absolutely worse at everything, as B is here, does NOT preclude gains from trade: " +
          "what matters is the ratio of costs within each country. This is the result students " +
          "most often reject on first encounter, and it is the single most important idea in the " +
          "chapter."
      };
    }
  };

  G["ch3_hard_terms_of_trade"] = {
    id: "ch3_hard_terms_of_trade", chapter: 3, kind: "mc", render: "text",
    difficulty: "hard", concept: "the range of mutually beneficial terms", points: 3,
    build: function (rng) {
      var lo = pick(rng, [1, 2]);
      var hi = lo + pick(rng, [1, 2]);
      var inside = round1((lo + hi) / 2);
      var pool = [
        "Between " + lo + " and " + hi + " units of cloth per unit of wheat — any rate strictly inside that range makes both better off",
        "Exactly " + lo + " units of cloth per unit of wheat",
        "Exactly " + hi + " units of cloth per unit of wheat",
        "Any rate at all, since trade always benefits both parties"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "Country A's opportunity cost of one unit of wheat is " + lo +
          " units of cloth; Country B's is " + hi +
          " units of cloth. Over what range of terms of trade will BOTH countries gain from " +
          "specializing and trading?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "A will export wheat only if it receives MORE than " + lo +
          " cloth per wheat — otherwise it may as well make cloth itself. B will import wheat " +
          "only if it pays LESS than " + hi + " cloth per wheat, for the same reason. So any rate " +
          "strictly between " + lo + " and " + hi + " — say " + inside +
          " — benefits both. At exactly the boundary one country is indifferent and captures no " +
          "gain. Where inside the range the price settles determines HOW the gains are divided, " +
          "which is a distributional question the model alone does not answer."
      };
    }
  };

  /* HARD — the distinctive macro-textbook angle: trade raises total surplus but
     creates identifiable losers. */
  G["ch3_hard_winners_losers"] = {
    id: "ch3_hard_winners_losers", chapter: 3, kind: "mc", render: "text",
    difficulty: "hard", concept: "distributional consequences of trade", points: 3,
    build: function (rng) {
      var sector = pick(rng, ["furniture", "steel", "textiles", "consumer electronics"]);
      var pool = [
        "Total gains exceed total losses, so the country gains on net — but the losses are concentrated on " + sector +
          " workers and communities while the gains are spread thinly across all consumers",
        "Everyone in the country is made better off by the opening to trade",
        "The country loses on net, because domestic production falls",
        "The gains and losses exactly cancel, leaving the country no better or worse off"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "A country opens to imports of " + sector +
          " from a lower-cost producer. Which statement best describes the welfare consequences?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "The standard analysis is right that consumer gains exceed producer losses, " +
          "so total surplus rises. But the DISTRIBUTION matters politically and morally: a " +
          "consumer saving a few dollars barely notices, while a " + sector +
          " worker in a company town may lose a career and see local house prices and tax " +
          "revenue fall with it. Empirical work on the China shock found displaced workers' " +
          "earnings losses persisted for many years and that adjustment was far slower than the " +
          "textbook 'workers move to other sectors' story assumes. That is an argument about " +
          "COMPENSATION and adjustment policy, not an argument that the net gain is illusory."
      };
    }
  };

  G["ch3_hard_compensation"] = {
    id: "ch3_hard_compensation", chapter: 3, kind: "mc", render: "text",
    difficulty: "hard", concept: "the compensation principle", points: 3,
    build: function (rng) {
      var gain = ri(rng, 8, 20) * 100;
      var loss = gain - ri(rng, 2, 6) * 100;
      var pool = [
        "The winners COULD compensate the losers and still come out ahead, so the change is a potential improvement — but whether they actually do is a separate political choice",
        "Because winners could compensate losers, the losers have in effect been compensated",
        "Since some people lose, the policy cannot raise total welfare",
        "Compensation is irrelevant to economic analysis"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "A trade agreement generates " + money(gain) + " million in gains to consumers and " +
          money(loss) +
          " million in losses to workers in an import-competing industry. Economists call this a " +
          "“potential Pareto improvement.” What exactly does that mean?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "The gains exceed the losses by " + money(gain - loss) +
          " million, so a transfer could in principle leave everyone at least as well off as " +
          "before. The word doing the work is POTENTIAL: the compensation is hypothetical unless " +
          "a policy actually delivers it, and in practice trade adjustment assistance has " +
          "typically been small relative to the losses. Treating the hypothetical transfer as " +
          "though it had occurred — option 2 — is the most common misuse of the criterion."
      };
    }
  };

  /* ======================================================================
     CHAPTER 4 — MARKETS: SUPPLY AND DEMAND
     ====================================================================== */

  G["ch4_equilibrium"] = {
    id: "ch4_equilibrium", chapter: 4, kind: "numeric", render: "graphical",
    difficulty: "med", concept: "market equilibrium", points: 2,
    build: function (rng) {
      var b = pick(rng, [1, 2]), d = pick(rng, [1, 2]);
      var qStar = ri(rng, 3, 8), c = ri(rng, 1, 4);
      var pStar = c + d * qStar, a = pStar + b * qStar;
      var askP = rng() < 0.5;
      return {
        prompt: "Demand is P = " + a + " − " + b + "Q and supply is P = " + c + " + " + d +
          "Q. What is the equilibrium " + (askP ? "price?" : "quantity?"),
        diagramSpec: { type: "supply_demand", dA: a, dB: -b, sA: c, sB: d,
          xmax: Math.max(10, qStar + 3), ymax: Math.max(12, pStar + 3), hideValues: true },
        answer: askP ? pStar : qStar, tolerance: 0.01,
        rationale: "Set " + a + " − " + b + "Q = " + c + " + " + d + "Q → Q* = " + qStar +
          ", P* = " + pStar + "."
      };
    }
  };

  G["ch4_shortage_surplus"] = {
    id: "ch4_shortage_surplus", chapter: 4, kind: "numeric", render: "text",
    difficulty: "hard", concept: "disequilibrium quantities", points: 3,
    build: function (rng) {
      var b = pick(rng, [1, 2]), d = pick(rng, [1, 2]);
      var qStar = ri(rng, 4, 8), c = ri(rng, 1, 4);
      var pStar = c + d * qStar, a = pStar + b * qStar;
      var above = rng() < 0.5;
      var setP = above ? pStar + ri(rng, 1, 3) : pStar - ri(rng, 1, 3);
      var qd = (a - setP) / b, qs = (setP - c) / d;
      var gap = Math.abs(qs - qd);
      return {
        prompt: "Demand is P = " + a + " − " + b + "Q and supply is P = " + c + " + " + d +
          "Q. The price is stuck at " + setP + ". What is the size of the resulting " +
          (above ? "SURPLUS" : "SHORTAGE") + "? (Two decimal places.)",
        answer: round2(gap), tolerance: 0.02,
        rationale: "At P = " + setP + ": Qd = (" + a + " − " + setP + ")/" + b + " = " +
          round2(qd) + " and Qs = (" + setP + " − " + c + ")/" + d + " = " + round2(qs) +
          ". The gap is " + round2(gap) + ". " + (above ?
            "Above equilibrium, sellers want to sell more than buyers want to buy — a surplus, which pushes the price down." :
            "Below equilibrium, buyers want more than sellers offer — a shortage, which pushes the price up.")
      };
    }
  };

  G["ch4_hard_shift_vs_movement"] = {
    id: "ch4_hard_shift_vs_movement", chapter: 4, kind: "mc", render: "text",
    difficulty: "hard", concept: "shift vs movement along", points: 3,
    build: function (rng) {
      var cases = [
        { t: "a frost destroys much of the coffee crop, and the price of coffee then rises, causing people to buy less coffee",
          ans: "Supply shifted left; the fall in quantity demanded is a MOVEMENT ALONG the demand curve",
          why: "The frost hit supply. Demand did not change — buyers simply moved up along their unchanged curve as the price rose." },
        { t: "a medical study reports that coffee is good for you, and coffee sales rise even though nothing about production has changed",
          ans: "Demand shifted right; supply is unchanged, so quantity supplied rises as a MOVEMENT ALONG the supply curve",
          why: "The news changed tastes, shifting demand. Producers responded by moving up along their unchanged supply curve." },
        { t: "the wage of coffee-shop workers rises, and coffee shops raise prices and sell less",
          ans: "Supply shifted left; the fall in quantity demanded is a MOVEMENT ALONG the demand curve",
          why: "An input cost is a supply determinant. Demand is unchanged; buyers move along it." },
        { t: "incomes rise across the economy and people buy more coffee at every price",
          ans: "Demand shifted right; supply is unchanged, so quantity supplied rises as a MOVEMENT ALONG the supply curve",
          why: "Income is a demand determinant. 'At every price' is the giveaway that the curve itself moved." }
      ];
      var cs = pick(rng, cases);
      var pool = [
        "Supply shifted left; the fall in quantity demanded is a MOVEMENT ALONG the demand curve",
        "Demand shifted right; supply is unchanged, so quantity supplied rises as a MOVEMENT ALONG the supply curve",
        "Both curves shifted simultaneously",
        "Neither curve shifted; only the price changed"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "Analyse this sequence carefully: " + cs.t + ". What happened?",
        options: sh.options, answer: sh.correctIndex,
        rationale: cs.why + " The test: a change in the good's OWN PRICE moves you along a " +
          "curve; a change in anything else — inputs, income, tastes, expectations, related " +
          "goods, the number of buyers or sellers — shifts a curve. Saying 'demand fell' when " +
          "the price rose after a supply shock is the classic error."
      };
    }
  };

  G["ch4_hard_double_shift"] = {
    id: "ch4_hard_double_shift", chapter: 4, kind: "mc", render: "text",
    difficulty: "hard", concept: "simultaneous shifts", points: 3,
    build: function (rng) {
      var cases = [
        { t: "demand rises AND supply rises", detVar: "quantity", detDir: "rises", ambVar: "price" },
        { t: "demand falls AND supply falls", detVar: "quantity", detDir: "falls", ambVar: "price" },
        { t: "demand rises AND supply falls", detVar: "price", detDir: "rises", ambVar: "quantity" },
        { t: "demand falls AND supply rises", detVar: "price", detDir: "falls", ambVar: "quantity" }
      ];
      var cs = pick(rng, cases);
      var correct = "Equilibrium " + cs.detVar + " definitely " + cs.detDir +
        ", but the effect on " + cs.ambVar + " is ambiguous — it depends on the relative sizes of the two shifts";
      var pool = [
        correct,
        "Both price and quantity change in determinate directions",
        "Both price and quantity are ambiguous",
        "Neither price nor quantity changes, because the two shifts cancel"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "In a market, " + cs.t + " at the same time. What can be said with certainty?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Draw it twice — once with a large demand shift and a small supply shift, once " +
          "the other way round. " + cs.detVar.charAt(0).toUpperCase() + cs.detVar.slice(1) +
          " moves the same way both times, so it is determinate; " + cs.ambVar +
          " moves differently, so its direction depends on which shift dominates. With two " +
          "simultaneous shifts, exactly one variable is always determinate and the other always " +
          "ambiguous."
      };
    }
  };

  /* ======================================================================
     CHAPTER 5 — ELASTICITY
     ====================================================================== */

  G["ch5_midpoint_elasticity"] = {
    id: "ch5_midpoint_elasticity", chapter: 5, kind: "numeric", render: "text",
    difficulty: "hard", concept: "midpoint elasticity", points: 3,
    build: function (rng) {
      var p1 = ri(rng, 4, 9), p2 = p1 + ri(rng, 2, 5);
      var q1 = ri(rng, 40, 70), q2 = q1 - ri(rng, 8, 25);
      var pctQ = (q2 - q1) / ((q1 + q2) / 2);
      var pctP = (p2 - p1) / ((p1 + p2) / 2);
      return {
        prompt: "When the price rises from " + money(p1) + " to " + money(p2) +
          ", quantity demanded falls from " + q1 + " to " + q2 +
          " units. Using the midpoint method, what is the price elasticity of demand? " +
          "(Report the absolute value, two decimal places.)",
        answer: round2(Math.abs(pctQ / pctP)), tolerance: 0.03,
        rationale: "%ΔQ = (" + q2 + " − " + q1 + ")/((" + q1 + "+" + q2 + ")/2) = " +
          round2(pctQ * 100) + "%. %ΔP = (" + p2 + " − " + p1 + ")/((" + p1 + "+" + p2 +
          ")/2) = " + round2(pctP * 100) + "%. Elasticity = " +
          round2(Math.abs(pctQ / pctP)) + ". The midpoint method uses the AVERAGE of the two " +
          "values as the base, so you get the same answer whether the price rose or fell — " +
          "which the simple percentage-change formula does not."
      };
    }
  };

  G["ch5_hard_revenue_test"] = {
    id: "ch5_hard_revenue_test", chapter: 5, kind: "mc", render: "text",
    difficulty: "hard", concept: "elasticity and total revenue", points: 3,
    build: function (rng) {
      var elastic = rng() < 0.5;
      var e = elastic ? pick(rng, [1.4, 1.8, 2.5]) : pick(rng, [0.3, 0.5, 0.7]);
      var raise = rng() < 0.5;
      var revUp = raise ? !elastic : elastic;
      var pool = [
        "Total revenue RISES",
        "Total revenue FALLS",
        "Total revenue is unchanged",
        "The effect on revenue cannot be determined from the elasticity alone"
      ];
      var sh = shuffleWithAnswer(rng, pool, revUp ? 0 : 1);
      return {
        prompt: "A firm faces a price elasticity of demand of " + e + " and decides to " +
          (raise ? "RAISE" : "CUT") + " its price by a small amount. What happens to total revenue?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "With elasticity " + e + ", demand is " +
          (elastic ? "ELASTIC (>1): quantity responds proportionally MORE than price" :
                     "INELASTIC (<1): quantity responds proportionally LESS than price") + ". " +
          (raise ?
            (elastic ? "Raising price loses proportionally more quantity than it gains in price, so revenue falls."
                     : "Raising price loses proportionally less quantity than it gains in price, so revenue rises.") :
            (elastic ? "Cutting price gains proportionally more quantity than it loses in price, so revenue rises."
                     : "Cutting price gains proportionally less quantity than it loses in price, so revenue falls.")) +
          " The rule: price and revenue move TOGETHER when demand is inelastic and in OPPOSITE " +
          "directions when it is elastic."
      };
    }
  };

  G["ch5_hard_determinants"] = {
    id: "ch5_hard_determinants", chapter: 5, kind: "mc", render: "text",
    difficulty: "hard", concept: "determinants of elasticity", points: 3,
    build: function (rng) {
      var cases = [
        { t: "insulin for a diabetic patient, over one month", ans: "Very inelastic — no close substitutes and it is a necessity, over a short horizon" },
        { t: "one particular brand of bottled water among a dozen on the shelf", ans: "Very elastic — many close substitutes are immediately available" },
        { t: "gasoline over one week", ans: "Very inelastic — no close substitutes and it is a necessity, over a short horizon" },
        { t: "gasoline over ten years, as households can change vehicles and where they live", ans: "More elastic — a longer horizon allows substitution that is impossible in the short run" },
        { t: "restaurant meals, a discretionary category with many alternatives", ans: "Very elastic — many close substitutes are immediately available" }
      ];
      var cs = pick(rng, cases);
      var pool = [
        "Very inelastic — no close substitutes and it is a necessity, over a short horizon",
        "Very elastic — many close substitutes are immediately available",
        "More elastic — a longer horizon allows substitution that is impossible in the short run",
        "Unit elastic — revenue is unaffected by a price change"
      ];
      var sh = shuffleWithAnswer(rng, pool, pool.indexOf(cs.ans));
      return {
        prompt: "How elastic is demand likely to be for " + cs.t + "?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "Elasticity is driven by the availability of SUBSTITUTES, whether the good is " +
          "a necessity or a luxury, how narrowly the market is defined, and the TIME HORIZON. " +
          "Note how gasoline appears twice with different answers: the same good is inelastic " +
          "over a week and considerably more elastic over a decade, because time is what makes " +
          "substitution possible."
      };
    }
  };

  /* ======================================================================
     CHAPTER 6 — GOVERNMENT AND MARKETS
     ====================================================================== */

  G["ch6_price_ceiling"] = {
    id: "ch6_price_ceiling", chapter: 6, kind: "numeric", render: "graphical",
    difficulty: "hard", concept: "binding price ceiling", points: 3,
    build: function (rng) {
      var b = pick(rng, [1, 2]), d = pick(rng, [1, 2]);
      var qStar = ri(rng, 5, 8), c = ri(rng, 1, 3);
      var pStar = c + d * qStar, a = pStar + b * qStar;
      var maxDrop = Math.max(1, Math.floor(pStar - c - 1));
      var ceil = pStar - ri(rng, 1, maxDrop);
      var qd = (a - ceil) / b, qs = (ceil - c) / d;
      return {
        prompt: "Demand is P = " + a + " − " + b + "Q and supply is P = " + c + " + " + d +
          "Q. The government imposes a price ceiling of " + ceil +
          ". What is the size of the resulting shortage? (Two decimal places.)",
        diagramSpec: { type: "supply_demand", dA: a, dB: -b, sA: c, sB: d,
          xmax: Math.max(10, qStar + 3), ymax: Math.max(12, pStar + 3), hideValues: true },
        answer: round2(qd - qs), tolerance: 0.02,
        rationale: "At P = " + ceil + ": Qd = " + round2(qd) + ", Qs = " + round2(qs) +
          ", so the shortage is " + round2(qd - qs) +
          ". A ceiling binds only when it is set BELOW the equilibrium price of " + pStar +
          ". The goods that do get sold are rationed by something other than price — queues, " +
          "waiting lists, or connections — and quality often degrades too."
      };
    }
  };

  G["ch6_tax_incidence_calc"] = {
    id: "ch6_tax_incidence_calc", chapter: 6, kind: "numeric", render: "text",
    difficulty: "hard", concept: "tax incidence", points: 3,
    build: function (rng) {
      var b = pick(rng, [1, 2]), d = pick(rng, [1, 2]);
      var qStar = ri(rng, 5, 8), c = ri(rng, 1, 3);
      var pStar = c + d * qStar, a = pStar + b * qStar;
      var tax = ri(rng, 2, 5);
      var qt = (a - c - tax) / (b + d);
      var pb = a - b * qt;
      var buyerShare = pb - pStar;
      return {
        prompt: "Demand is P = " + a + " − " + b + "Q and supply is P = " + c + " + " + d +
          "Q. A tax of " + money(tax) +
          " per unit is imposed on sellers. By how much does the price BUYERS pay rise above the " +
          "original equilibrium price? (Two decimal places.)",
        answer: round2(buyerShare), tolerance: 0.03,
        rationale: "Original equilibrium: Q* = " + qStar + ", P* = " + pStar +
          ". With the tax, Q falls to " + round2(qt) + " and buyers pay " + round2(pb) +
          ", so their share of the " + tax + " tax is " + round2(buyerShare) +
          " and sellers bear " + round2(tax - buyerShare) +
          ". Note the burden split depends only on the relative SLOPES (elasticities) — it " +
          "would be identical had the tax been levied on buyers instead."
      };
    }
  };

  G["ch6_hard_incidence_elasticity"] = {
    id: "ch6_hard_incidence_elasticity", chapter: 6, kind: "mc", render: "text",
    difficulty: "hard", concept: "who bears a tax", points: 3,
    build: function (rng) {
      var demandInelastic = rng() < 0.5;
      var good = demandInelastic ? pick(rng, ["insulin", "gasoline", "cigarettes"]) :
                                   pick(rng, ["restaurant meals", "luxury handbags", "cruise holidays"]);
      var pool = [
        "Mostly BUYERS, because demand is inelastic relative to supply — buyers have few alternatives, so they absorb most of the price rise",
        "Mostly SELLERS, because demand is elastic relative to supply — buyers walk away rather than pay more, so sellers absorb most of the tax",
        "Exactly half each, because the tax is split evenly by law",
        "Whichever side the tax is legally collected from"
      ];
      var sh = shuffleWithAnswer(rng, pool, demandInelastic ? 0 : 1);
      return {
        prompt: "A per-unit tax is imposed on " + good +
          ", a market where supply is relatively elastic. Who bears most of the burden?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "The burden falls on the side that is LESS able to escape — the more inelastic " +
          "side. " + (demandInelastic ?
            "Buyers of " + good + " have few substitutes, so they keep buying even as the price rises and absorb most of the tax." :
            "Buyers of " + good + " can readily do without, so they cut back sharply; sellers must absorb most of the tax to keep selling.") +
          " Critically, the LEGAL incidence — who writes the cheque to the government — has no " +
          "effect whatsoever on the ECONOMIC incidence."
      };
    }
  };

  G["ch6_hard_dwl"] = {
    id: "ch6_hard_dwl", chapter: 6, kind: "numeric", render: "text",
    difficulty: "hard", concept: "deadweight loss of a tax", points: 3,
    build: function (rng) {
      var b = pick(rng, [1, 2]), d = pick(rng, [1, 2]);
      var qStar = ri(rng, 5, 8), c = ri(rng, 1, 3);
      var pStar = c + d * qStar, a = pStar + b * qStar;
      var tax = ri(rng, 2, 5);
      var qt = (a - c - tax) / (b + d);
      var dwl = 0.5 * tax * (qStar - qt);
      return {
        prompt: "Demand is P = " + a + " − " + b + "Q and supply is P = " + c + " + " + d +
          "Q. A tax of " + money(tax) +
          " per unit is imposed. What is the deadweight loss? (Two decimal places.)",
        answer: round2(dwl), tolerance: 0.04,
        rationale: "Quantity falls from " + qStar + " to " + round2(qt) + ", a reduction of " +
          round2(qStar - qt) + ". DWL = ½ × tax × ΔQ = ½ × " + tax + " × " +
          round2(qStar - qt) + " = " + round2(dwl) +
          ". The tax REVENUE of " + round2(tax * qt) +
          " is a transfer, not a loss — the deadweight loss is the value of the trades that no " +
          "longer happen at all, trades where the buyer valued the good above the seller's cost."
      };
    }
  };

  G["ch6_hard_laffer"] = {
    id: "ch6_hard_laffer", chapter: 6, kind: "mc", render: "text",
    difficulty: "hard", concept: "tax rates and tax revenue", points: 3,
    build: function (rng) {
      var pool = [
        "Revenue first rises then falls as the rate increases, because a higher rate shrinks the taxed base — so a rate cut raises revenue only if the economy is on the downward-sloping side",
        "Revenue always rises with the tax rate",
        "Revenue always falls when the tax rate rises",
        "Revenue is independent of the tax rate"
      ];
      var sh = shuffleWithAnswer(rng, pool, 0);
      return {
        prompt: "How does tax revenue respond as a tax rate is raised from zero all the way to " +
          "100%, and what does this imply about the claim that cutting tax rates raises revenue?",
        options: sh.options, answer: sh.correctIndex,
        rationale: "At a 0% rate revenue is zero; at 100% the activity stops and revenue is again " +
          "zero, so revenue must rise and then fall — the Laffer curve. The economically " +
          "uncontroversial part is the SHAPE. The contested empirical question is WHERE a given " +
          "economy sits: a rate cut raises revenue only on the downward-sloping side, and most " +
          "estimates put typical income-tax rates on the upward-sloping side, where cuts reduce " +
          "revenue. The deadweight loss, meanwhile, grows with the SQUARE of the tax rate, so it " +
          "rises steeply even where revenue is still increasing."
      };
    }
  };

  /* ======================================================================
     STATIC ITEMS — chapters 1-6
     ====================================================================== */
  var STATIC = [
    { id: "ch1_scarcity", chapter: 1, kind: "mc", render: "text",
      difficulty: "easy", concept: "scarcity", points: 1,
      prompt: "Economics is fundamentally the study of how society manages:",
      options: ["Its scarce resources", "Its money supply", "Its businesses", "Its government budget"],
      answer: 0,
      rationale: "Scarcity — the fact that resources are limited relative to wants — is what makes choice necessary and trade-offs unavoidable. Everything else in the subject follows from it." },

    { id: "ch1_written_opportunity_cost", chapter: 1, kind: "short", render: "text",
      difficulty: "hard", concept: "opportunity cost in practice", points: 4,
      prompt: "A student is deciding whether to spend a fourth year at university or take a job. In 4–6 sentences, list the components of the true opportunity cost of the extra year, explain which of them a naive calculation typically misses, and explain why the cost of room and board should usually NOT be counted in full.",
      answer: null,
      rubric: "Full credit (4 pts): (1) explicit costs correctly identified — tuition, fees, books, required materials; (2) the IMPLICIT cost of forgone earnings identified as the largest and most commonly overlooked component, with recognition that for most students it exceeds tuition; (3) correct reasoning on room and board — the student must eat and live somewhere in either scenario, so only the DIFFERENCE in living costs between the two options is an opportunity cost, not the full amount; (4) a coherent framing of the decision as comparing the total cost against the expected benefit (higher lifetime earnings, credential, option value) rather than against zero. Award 1 pt per element. Element (3) is the discriminating one — most answers include the full room and board figure.",
      rationale: "Forgone earnings and the room-and-board subtlety are the two things a naive calculation gets wrong." },

    { id: "ch2_model_purpose", chapter: 2, kind: "mc", render: "text",
      difficulty: "med", concept: "the role of models", points: 2,
      prompt: "Economic models make assumptions known to be false — perfect information, identical firms, two goods. Why is this defensible?",
      options: [
        "A model's purpose is to isolate the mechanism under study; a map that showed every detail would be useless for navigating",
        "Because the assumptions are actually true in most markets",
        "Because economics is not concerned with the real world",
        "Because false assumptions make the mathematics easier and that is the primary goal"
      ],
      answer: 0,
      rationale: "Simplification is what makes a model informative: it strips away detail so one mechanism can be seen clearly. The right question about an assumption is never 'is it literally true' but 'does relaxing it change the conclusion I am drawing'. That is also the honest test of when a model should be discarded." },

    { id: "ch2_hard_disagreement", chapter: 2, kind: "mc", render: "text",
      difficulty: "hard", concept: "why economists disagree", points: 3,
      prompt: "Economists frequently disagree about policy. What are the two main sources of such disagreement?",
      options: [
        "Different positive judgments about how the world works empirically, and different normative values about what society should prioritize",
        "One group understands the theory and the other does not",
        "Political affiliation alone",
        "Disagreement about the basic principles of supply and demand"
      ],
      answer: 0,
      rationale: "Two economists can agree entirely on the mechanism and still differ on the magnitude of an elasticity — a positive dispute settled, in principle, by evidence. Or they can agree on every number and still differ on how to weigh a gain to one group against a loss to another — a normative dispute that evidence cannot settle. Distinguishing which kind of disagreement is in front of you is essential, because only one of them is resolvable by more data." },

    { id: "ch3_gains_from_trade", chapter: 3, kind: "mc", render: "text",
      difficulty: "med", concept: "source of gains from trade", points: 2,
      prompt: "The gains from trade between two countries arise fundamentally because:",
      options: [
        "They have different opportunity costs, so each can obtain goods more cheaply through trade than by producing them itself",
        "One country is more productive than the other at everything",
        "One country has more natural resources",
        "Trade always transfers wealth from the poorer to the richer country"
      ],
      answer: 0,
      rationale: "Differences in opportunity cost are the source. If two countries had identical opportunity costs there would be nothing to gain from specializing, however different their absolute productivity levels." },

    { id: "ch3_written_trade_distribution", chapter: 3, kind: "short", render: "text",
      difficulty: "hard", concept: "gains and losses from trade", points: 5,
      prompt: "“Free trade makes the country better off, so opposition to it is simply economic illiteracy.” In 6–8 sentences, evaluate this claim. Explain precisely what the standard analysis does and does not establish, identify who gains and who loses when a country opens to imports in a sector, explain why the losses tend to be concentrated while the gains are diffuse, and say what follows for policy.",
      answer: null,
      rubric: "Full credit (5 pts): (1) precise statement of what the analysis establishes — total surplus rises, i.e. the gains to winners EXCEED the losses to losers, which is a claim about the SUM and not about every individual; (2) correct identification of winners and losers — consumers of the imported good and exporting sectors gain; import-competing firms, their workers, and their communities lose; (3) the concentration/diffusion asymmetry — gains are spread thinly over many consumers who barely notice, while losses fall heavily on identifiable workers and regions, which explains both the political economy of protectionism AND why the human cost is real rather than imagined; (4) recognition that adjustment is slower and costlier than the simple model assumes — displaced workers often do not move smoothly to other sectors, and earnings losses can persist for years (the China-shock evidence); (5) a defensible policy conclusion — e.g. compensate and assist adjustment rather than restrict trade, or targeted transition support, or an argued case for some protection, with reasoning. Award 1 pt per element; ANY defensible position earns element (5) if supported. An answer that simply asserts trade is good and critics are wrong earns at most 2 pts, since it fails elements (3) and (4).",
      rationale: "This is the chapter's central question. The answer must hold two things at once: the net gain is real, and the concentrated losses are also real. Answers that dismiss either half are incomplete." },

    { id: "ch4_law_of_demand", chapter: 4, kind: "mc", render: "text",
      difficulty: "easy", concept: "law of demand", points: 1,
      prompt: "The law of demand states that, other things equal, when the price of a good rises:",
      options: [
        "The quantity demanded of that good falls",
        "The demand for that good falls",
        "The supply of that good falls",
        "Consumers' incomes fall"
      ],
      answer: 0,
      rationale: "Quantity demanded — a movement along the curve — not demand, which is the whole curve. The vocabulary distinction is not pedantry: it is what keeps shifts and movements straight in every later application." },

    { id: "ch4_hard_demand_determinants", chapter: 4, kind: "mc", render: "text",
      difficulty: "hard", concept: "demand shifters", points: 3,
      prompt: "The price of coffee is expected to rise sharply next month. What happens to the demand for coffee TODAY?",
      options: [
        "Demand rises today, as buyers stock up ahead of the expected increase",
        "Demand falls today, because coffee is becoming more expensive",
        "Demand is unchanged, because the price has not actually risen yet",
        "Quantity demanded falls today as a movement along the curve"
      ],
      answer: 0,
      rationale: "Expectations are a determinant of demand, so the whole curve shifts right today even though today's price has not changed. This is one of the cleanest cases where a curve shifts with no movement in the good's current price — and it shows why 'the price hasn't changed yet' is not an argument for 'nothing happens'." },

    { id: "ch5_elasticity_definition", chapter: 5, kind: "mc", render: "text",
      difficulty: "easy", concept: "definition of elasticity", points: 1,
      prompt: "The price elasticity of demand measures:",
      options: [
        "The percentage change in quantity demanded divided by the percentage change in price",
        "The change in quantity demanded divided by the change in price",
        "The slope of the demand curve",
        "The total revenue a firm earns"
      ],
      answer: 0,
      rationale: "Elasticity uses PERCENTAGE changes, which is what makes it unit-free and comparable across goods measured in litres, tonnes or dozens. Slope is not the same thing: along a straight-line demand curve the slope is constant while elasticity varies from infinite at the top to zero at the bottom." },

    { id: "ch5_written_elasticity_pricing", chapter: 5, kind: "short", render: "text",
      difficulty: "hard", concept: "applying elasticity to a pricing decision", points: 4,
      prompt: "A city transit authority is losing money and is considering raising fares by 20%. In 4–6 sentences, explain what it needs to know about elasticity to predict the effect on revenue, explain how the answer differs between the short run and the long run, and identify one important consideration beyond revenue that should enter the decision.",
      answer: null,
      rubric: "Full credit (4 pts): (1) the decision rule — if demand is inelastic (|e| < 1) a fare rise raises revenue; if elastic (|e| > 1) it lowers revenue; the authority needs an estimate of the fare elasticity for its riders; (2) the short-run/long-run distinction with the correct direction — demand is more inelastic in the short run (riders cannot immediately buy a car, move, or change jobs) and more elastic in the long run, so revenue may rise initially and then erode; (3) a valid non-revenue consideration — equity effects on low-income riders who have fewest alternatives; congestion and pollution externalities from riders switching to cars; network effects where falling ridership justifies service cuts that drive further ridership loss; the system's public-service mandate; (4) a coherent recommendation or framing that actually uses elements 1-3 rather than restating them. Award 1 pt per element. Getting the short-run/long-run direction backwards loses element (2).",
      rationale: "The long-run-more-elastic point and at least one externality or equity consideration are what lift this above a formula application." },

    { id: "ch6_price_control_concept", chapter: 6, kind: "mc", render: "text",
      difficulty: "med", concept: "binding vs non-binding controls", points: 2,
      prompt: "A price ceiling set ABOVE the equilibrium price:",
      options: [
        "Has no effect on the market outcome — it is non-binding",
        "Creates a shortage",
        "Creates a surplus",
        "Causes the equilibrium price to rise to the ceiling"
      ],
      answer: 0,
      rationale: "A ceiling is a maximum. If the market already clears below it, the constraint never binds and nothing changes. Ceilings bite only BELOW equilibrium (creating shortages); floors bite only ABOVE it (creating surpluses). Getting this backwards is the most common error in the chapter." },

    { id: "ch6_written_rent_control", chapter: 6, kind: "short", render: "text",
      difficulty: "hard", concept: "rent control", points: 5,
      prompt: "In 6–8 sentences, analyse rent control as an economist. Explain its short-run and long-run effects on the quantity and quality of rental housing, explain why the long-run effects are larger, identify who gains and who loses, and explain why many economists prefer housing vouchers or supply-side reform while acknowledging the strongest argument in rent control's favour.",
      answer: null,
      rubric: "Full credit (5 pts): (1) SHORT run — supply and demand are both relatively inelastic (the building stock is fixed, tenants cannot move quickly), so the shortage is modest and rents for controlled units fall; (2) LONG run — supply is far more elastic: construction of new rental units falls, existing units convert to condominiums or other uses, and the shortage grows substantially larger over time; (3) QUALITY degradation — with excess demand, landlords have no competitive pressure to maintain units and reduced incentive to invest in them, so the effective price falls less than the nominal rent suggests; (4) winners and losers — incumbent tenants who hold a controlled unit gain substantially; landlords lose; the losers who are usually invisible are prospective future tenants, newcomers and young households who cannot find a unit at all, plus those rationed out by queues or connections; (5) the policy comparison WITH the honest counter-argument — vouchers or zoning/supply reform address affordability without suppressing supply; the strongest argument for rent control is protection against sudden displacement and the disruption to community and employment that rapid rent spikes cause for existing residents. Award 1 pt per element. An answer with no acknowledgement of any argument in rent control's favour is capped at 4 pts.",
      rationale: "The short-run/long-run elasticity contrast and the invisibility of the excluded losers are the analytical core; requiring the counter-argument prevents a one-sided answer." },

    { id: "ch6_hard_subsidy_incidence", chapter: 6, kind: "mc", render: "text",
      difficulty: "hard", concept: "who captures a subsidy", points: 3,
      prompt: "A government introduces a large per-student subsidy for university tuition. Supply of university places is highly inelastic in the short run because institutions cannot expand quickly. Who captures most of the benefit?",
      options: [
        "Mostly the universities, in the form of higher tuition — because with supply fixed, the subsidy mainly bids up the price",
        "Entirely the students, since the cheque is written on their behalf",
        "Neither party; the subsidy is simply wasted",
        "It is split exactly evenly by construction"
      ],
      answer: 0,
      rationale: "Subsidy incidence follows the same logic as tax incidence: the benefit accrues mainly to the more INELASTIC side. With the number of places nearly fixed, demand rises against a vertical supply and the price absorbs most of the subsidy, so universities capture it. This is the core of the 'Bennett hypothesis' argument about tuition inflation — and it implies the policy works far better when paired with measures that let supply expand." }
  ];

  MA.register(G, STATIC);
})(typeof globalThis !== "undefined" ? globalThis : this);
