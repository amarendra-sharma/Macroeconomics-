/* ===========================================================================
   ma-sims.js — the SIMULATION MODELS for the interactive arenas.

   Pure economics and scoring. No DOM, no network, no randomness that is not
   seeded. The browser uses this to play; the ma-grade edge function loads the
   SAME FILE and replays the student's decision log to compute the authoritative
   score.

   WHY THE SERVER REPLAYS
   The older performance mode trusted a score the browser posted, which a
   student could set to 100 from the console. Here the client posts only the
   seed, the decisions it made, and the checkpoint answers; the server re-runs
   the model over them. A forged transcript has to be a transcript that actually
   earns the marks, which is just playing well.

   PUBLIC SURFACE
     MASims.list()                        -> [{slug,title,chapter,...}]
     MASims.spec(slug)                    -> briefing, controls, targets
     MASims.init(slug, seed)              -> {state, shocks}
     MASims.step(slug, state, decision, round, shocks) -> next state
     MASims.checkpoints(slug, seed)       -> [{round, prompt, options, answer}]
     MASims.score(slug, seed, decisions, answers) -> full breakdown
     MASims.benchmarks(slug, seed)        -> {naive, best} reference runs

   Safari-safe on purpose: var, function declarations, string concatenation.
   No arrow functions, template literals, optional chaining or ?? anywhere.
   =========================================================================== */
(function (global) {
  "use strict";

  /* ---- seeded PRNG: identical in browser and Deno ------------------------ */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function r2(x) { return Math.round(x * 100) / 100; }
  function clamp(x, lo, hi) { return x < lo ? lo : (x > hi ? hi : x); }

  var SIMS = {};

  /* =========================================================================
     1. STABILIZATION LAB  (chapter 15 — AD-AS)

     The student is the policy authority for 7 years. Each year they set a real
     policy rate and a fiscal impulse, then a shock lands and the economy moves.

       AD          y  = -a(r - r*) + g + demandShock
       Phillips    pi = piE + b*y + supplyShock
       Expectations piE' = piE + theta(pi - piE)        (adaptive)
       Okun        u  = u* - c*y

     The teaching point is the SUPPLY SHOCK: it pushes inflation and output in
     opposite directions, so no single instrument fixes both and the student has
     to choose which target to miss. A demand shock has no such tension.
     ========================================================================= */
  var ADAS = {
    a: 0.6, b: 0.5, theta: 0.5, c: 0.5, rStar: 2.0, uStar: 5.0,
    piTarget: 2.0, rounds: 7
  };

  SIMS["adas-lab"] = {
    slug: "adas-lab",
    title: "Stabilization Lab",
    chapter: 15,
    rounds: ADAS.rounds,
    minutes: 10,

    spec: function () {
      return {
        title: "Stabilization Lab",
        subtitle: "Seven years at the policy desk.",
        youAre: "You set monetary and fiscal policy for a small economy. Each " +
                "year you choose a real policy rate and a fiscal impulse, then " +
                "the year plays out and a shock may land.",
        goal: "Keep inflation near 2% and the output gap near 0. Both matter, " +
              "and they will pull against each other.",
        howScored: [
          "70% OUTCOME. Every year adds a penalty equal to (inflation - 2)² + " +
            "(output gap)². Lower is better. Your penalty is compared against " +
            "two reference runs: doing nothing at all, and the best the model " +
            "allows. You score the share of that distance you close.",
          "30% CHECKPOINTS. Three times, before a year resolves, you are asked " +
            "what the shock will do. These are about the mechanism, not the " +
            "arithmetic — getting the economy to a good place by luck will not " +
            "earn them."
        ],
        controls: [
          { key: "r", label: "Real policy rate", unit: "%", min: -1, max: 8, step: 0.25,
            help: "The neutral rate is 2%. Above neutral cools demand, below it heats demand." },
          { key: "g", label: "Fiscal impulse", unit: "% of GDP", min: -2, max: 2, step: 0.25,
            help: "Positive is a deficit-financed boost; negative is consolidation." }
        ],
        readouts: [
          { key: "pi", label: "Inflation", unit: "%", target: 2, band: 0.5 },
          { key: "y",  label: "Output gap", unit: "%", target: 0, band: 0.5 },
          { key: "u",  label: "Unemployment", unit: "%" },
          { key: "piE", label: "Expected inflation", unit: "%" }
        ],
        watchFor: "Expected inflation moves toward whatever you actually deliver. " +
                  "Tolerate high inflation for a couple of years and expectations " +
                  "drift up, which makes every later year harder."
      };
    },

    init: function (seed) {
      var rng = mulberry32(seed || 1);
      var shocks = [];
      // A fixed shape -- two supply shocks and two demand shocks in a varied
      // order -- so every student meets the same TYPES of problem and the run
      // stays comparable, while the timing and size differ by seed.
      var slots = [1, 2, 3, 4, 5, 6];
      for (var i = slots.length - 1; i > 0; i--) {
        var j = Math.floor(rng() * (i + 1));
        var t = slots[i]; slots[i] = slots[j]; slots[j] = t;
      }
      var supplyAt = [slots[0], slots[1]];
      var demandAt = [slots[2], slots[3]];
      for (var k = 0; k < ADAS.rounds; k++) {
        var s = { supply: 0, demand: 0, label: "" };
        if (supplyAt.indexOf(k) >= 0) {
          s.supply = r1(1.5 + rng() * 2.0);
          s.label = "Adverse supply shock: energy and shipping costs jump.";
        } else if (demandAt.indexOf(k) >= 0) {
          s.demand = r1(-(1.0 + rng() * 2.0));
          s.label = "Demand slump: private investment pulls back sharply.";
        } else {
          s.label = "No major shock this year.";
        }
        shocks.push(s);
      }
      return {
        state: { pi: 2.0, piE: 2.0, y: 0.0, u: ADAS.uStar, year: 1 },
        shocks: shocks
      };
    },

    step: function (state, decision, round, shocks) {
      var sh = shocks[round] || { supply: 0, demand: 0 };
      var r = clamp(Number(decision.r), -1, 8);
      var g = clamp(Number(decision.g), -2, 2);
      var y = -ADAS.a * (r - ADAS.rStar) + g + sh.demand;
      var pi = state.piE + ADAS.b * y + sh.supply;
      var u = ADAS.uStar - ADAS.c * y;
      var piE = state.piE + ADAS.theta * (pi - state.piE);
      return { pi: r2(pi), piE: r2(piE), y: r2(y), u: r2(u), year: state.year + 1 };
    },

    /* Per-year penalty. Squared so that one catastrophic year is worse than
       several mediocre ones -- which is the point of stabilization policy. */
    penalty: function (s) {
      return Math.pow(s.pi - ADAS.piTarget, 2) + Math.pow(s.y, 2);
    },

    /* The two reference runs the student's loss is measured against. */
    /* Higher is better everywhere, so the loss is returned negated. Keeps one
       scoring path for both simulations instead of a per-slug special case. */
    evaluate: function (seed, decisions) {
      var self = SIMS["adas-lab"];
      var init = self.init(seed);
      var st = init.state, loss = 0;
      for (var t = 0; t < ADAS.rounds; t++) {
        var d = decisions[t];
        if (!d) { break; }
        st = self.step(st, d, t, init.shocks);
        loss += self.penalty(st);
      }
      return -loss;
    },

    benchmarks: function (seed) {
      var init = SIMS["adas-lab"].init(seed);
      var self = SIMS["adas-lab"];

      function run(chooser) {
        var st = { pi: init.state.pi, piE: init.state.piE, y: init.state.y,
                   u: init.state.u, year: 1 };
        var loss = 0;
        for (var t = 0; t < ADAS.rounds; t++) {
          var d = chooser(st, t, init.shocks);
          st = self.step(st, d, t, init.shocks);
          loss += self.penalty(st);
        }
        return loss;
      }

      // Doing nothing: leave the rate at neutral and run no fiscal impulse.
      var naive = run(function () { return { r: ADAS.rStar, g: 0 }; });

      // Best available: at each step search the instrument grid for the pair
      // that minimises THIS year's penalty. Myopic, but with adaptive
      // expectations it is very close to optimal and, more importantly, it is
      // a target a student can actually reach.
      var best = run(function (st, t, shocks) {
        var bd = { r: ADAS.rStar, g: 0 }, bp = Infinity;
        for (var r = -1; r <= 8.0001; r += 0.25) {
          for (var g = -2; g <= 2.0001; g += 0.25) {
            var nx = self.step(st, { r: r, g: g }, t, shocks);
            var p = self.penalty(nx);
            if (p < bp) { bp = p; bd = { r: r, g: g }; }
          }
        }
        return bd;
      });
      return { worst: r2(-naive), best: r2(-best), naive: r2(naive), bestLoss: r2(best) };
    },

    checkpoints: function (seed) {
      var init = SIMS["adas-lab"].init(seed);
      var out = [], i;
      var supplyRounds = [], demandRounds = [];
      for (i = 0; i < init.shocks.length; i++) {
        if (init.shocks[i].supply > 0) { supplyRounds.push(i); }
        if (init.shocks[i].demand < 0) { demandRounds.push(i); }
      }
      var rng = mulberry32((seed || 1) + 7717);

      if (supplyRounds.length) {
        out.push({
          round: supplyRounds[0],
          prompt: "An adverse supply shock is about to hit. If you leave the real " +
                  "rate at neutral and run no fiscal impulse, what happens this year?",
          options: [
            "Inflation rises and the output gap falls — they move in opposite directions.",
            "Inflation rises and the output gap rises — both move up together.",
            "Inflation falls and the output gap rises.",
            "Neither moves; a supply shock only affects the price level next year."
          ],
          answer: 0,
          why: "A supply shock enters the Phillips curve directly, so inflation rises " +
               "at any level of output. Holding policy fixed, the higher inflation " +
               "raises expectations next year; output is pushed down by nothing this " +
               "year but the shock leaves you trading one target against the other. " +
               "That opposite-direction movement is exactly what makes supply shocks " +
               "hard and demand shocks easy."
        });
      }
      if (demandRounds.length) {
        out.push({
          round: demandRounds[0],
          prompt: "A demand slump is about to hit. Which single move does the MOST " +
                  "to offset it for BOTH targets at once?",
          options: [
            "Cut the real rate below neutral, or run a positive fiscal impulse — either raises demand.",
            "Raise the real rate to anchor inflation expectations first.",
            "Nothing: a demand shock is self-correcting within the year.",
            "Cut the rate AND consolidate fiscally, so the two offset."
          ],
          answer: 0,
          why: "A demand shock moves inflation and output the SAME way, so one " +
               "expansionary move pushes both back toward target. There is no " +
               "trade-off to manage — which is precisely the contrast with the " +
               "supply shock."
        });
      }
      var lateRound = 5 + Math.floor(rng() * 2);
      out.push({
        round: Math.min(lateRound, ADAS.rounds - 1),
        prompt: "Expected inflation in this model adjusts toward whatever inflation " +
                "you actually delivered. What does that imply for a policymaker who " +
                "lets inflation run above target for two years?",
        options: [
          "Expectations drift up, so hitting 2% later needs a deeper output cost than it would have.",
          "Nothing — expectations are anchored at 2% by assumption in this model.",
          "Expectations drift up, which makes future inflation easier to control.",
          "Expectations fall, because the public anticipates a correction."
        ],
        answer: 0,
        why: "Adaptive expectations mean today's inflation becomes tomorrow's " +
             "starting point. Disinflation then requires a negative output gap to " +
             "pull inflation back below expectations — the sacrifice ratio. Letting " +
             "inflation run is borrowing from your own future room to manoeuvre."
      });
      return out;
    }
  };

  /* =========================================================================
     2. GROWTH LAB  (chapter 9 — Solow)

     Eight periods. The student sets the savings rate each period and lives with
     the consumption consequences. The teaching point is the golden rule: more
     saving raises steady-state OUTPUT but consumption is maximised at s = alpha,
     and pushing s higher makes the country poorer in the only sense that counts.

       y      = k^alpha                (per effective worker)
       k'     = (s*y + (1-delta)k) / ((1+n)(1+gA))
       c      = (1-s) * y * A          (per worker, in levels)
     ========================================================================= */
  /* TAIL matters more than it looks. Over only 8 decades with nothing counted
     afterwards, cumulative consumption is maximised by saving as LITTLE as
     possible -- the payoff from capital arrives after the scoring stops. That
     would have made the arena reward the exact opposite of the chapter's
     lesson. So the student makes 8 decisions and the economy then runs on for
     TAIL more decades at whatever savings rate they left it at. Undiscounted,
     because the golden rule is an undiscounted steady-state result; adding
     impatience pushes the optimum below alpha (the modified golden rule),
     which is true but is not what chapter 9 teaches. */
  var SOLOW = { alpha: 0.35, delta: 0.08, n: 0.01, gA: 0.02, rounds: 8, tail: 30 };

  SIMS["growth-lab"] = {
    slug: "growth-lab",
    title: "Growth Lab",
    chapter: 9,
    rounds: SOLOW.rounds,
    minutes: 9,

    spec: function () {
      return {
        title: "Growth Lab",
        subtitle: "Eight decades of capital accumulation.",
        youAre: "You choose what share of output this economy saves, decade by " +
                "decade. Everything not saved is consumed now; everything saved " +
                "becomes capital that raises output later.",
        goal: "Maximise total consumption per worker over the eight decades — not " +
              "output, and not the capital stock.",
        howScored: [
          "70% OUTCOME. Your cumulative consumption per worker is compared against " +
            "the best any constant savings rate could have achieved on this seed, " +
            "and against the worst. You score the share of that range you capture.",
          "30% CHECKPOINTS. Three questions about WHY the model behaves as it does. " +
            "A student who finds the right savings rate by sliding the control " +
            "until the number goes up will not score these."
        ],
        controls: [
          { key: "s", label: "Savings rate", unit: "%", min: 5, max: 70, step: 1,
            help: "Capital's share of output (alpha) is 35%. That number matters." }
        ],
        readouts: [
          { key: "k", label: "Capital per effective worker" },
          { key: "y", label: "Output per effective worker" },
          { key: "cPerWorker", label: "Consumption per worker", unit: "index" },
          { key: "cumC", label: "Cumulative consumption", unit: "index" }
        ],
        watchFor: "Saving more always raises output. It does not always raise " +
                  "consumption, and consumption is what people actually live on."
      };
    },

    init: function (seed) {
      var rng = mulberry32((seed || 1) + 991);
      // Start below steady state so accumulation has somewhere to go, at a
      // level that varies by seed without changing what the right answer is.
      var k0 = r2(0.8 + rng() * 1.2);
      return {
        state: { k: k0, A: 1.0, y: r2(Math.pow(k0, SOLOW.alpha)),
                 cPerWorker: 0, cumC: 0, year: 1 },
        shocks: []
      };
    },

    step: function (state, decision, round, shocks) {
      var s = clamp(Number(decision.s) / 100, 0.05, 0.70);
      var y = Math.pow(state.k, SOLOW.alpha);
      var A = state.A * (1 + SOLOW.gA);
      var cPerWorker = (1 - s) * y * state.A;
      var kNext = (s * y + (1 - SOLOW.delta) * state.k) /
                  ((1 + SOLOW.n) * (1 + SOLOW.gA));
      return {
        k: r2(kNext), A: r2(A), y: r2(y),
        cPerWorker: r2(cPerWorker),
        cumC: r2(state.cumC + cPerWorker),
        year: state.year + 1
      };
    },

    /* Total consumption per worker over the 8 decisions PLUS the continuation
       decades at the final savings rate. Higher is better. */
    evaluate: function (seed, decisions) {
      var self = SIMS["growth-lab"];
      var st = self.init(seed).state;
      var total = 0, t, lastS = 20;
      for (t = 0; t < SOLOW.rounds; t++) {
        var d = decisions[t];
        if (!d) { break; }
        lastS = Number(d.s);
        st = self.step(st, d, t, []);
        total += st.cPerWorker;
      }
      for (t = 0; t < SOLOW.tail; t++) {
        st = self.step(st, { s: lastS }, 0, []);
        total += st.cPerWorker;
      }
      return total;
    },

    benchmarks: function (seed) {
      var self = SIMS["growth-lab"];
      function constant(sPct) {
        var ds = [], i;
        for (i = 0; i < SOLOW.rounds; i++) { ds.push({ s: sPct }); }
        return self.evaluate(seed, ds);
      }
      var best = -Infinity, worst = Infinity, bestS = 0;
      for (var sp = 5; sp <= 70; sp++) {
        var v = constant(sp);
        if (v > best) { best = v; bestS = sp; }
        if (v < worst) { worst = v; }
      }
      return { worst: r2(worst), best: r2(best), bestConstantS: bestS,
               naive: r2(worst) };
    },

    checkpoints: function (seed) {
      var rng = mulberry32((seed || 1) + 3313);
      var mid = 2 + Math.floor(rng() * 2);
      var late = 5 + Math.floor(rng() * 2);
      return [
        {
          round: 1,
          prompt: "You permanently raise the savings rate. In the LONG RUN, what " +
                  "happens to the GROWTH RATE of output per worker?",
          options: [
            "It is unchanged — only the LEVEL of the path shifts up.",
            "It rises permanently, in proportion to the higher savings rate.",
            "It rises, then falls below its old value, then recovers.",
            "It falls, because capital runs into diminishing returns."
          ],
          answer: 0,
          why: "This is the central result of the Solow model. Long-run growth in " +
               "output per worker is set by technological progress (gA), not by " +
               "the savings rate. A higher s raises the steady-state LEVEL of " +
               "capital and output per effective worker, and growth is faster " +
               "while the economy transitions — but once it arrives, growth is " +
               "back to gA. Saving more makes you richer; it does not make you " +
               "grow faster forever."
        },
        {
          round: mid,
          prompt: "Capital's share of output in this economy is α = 0.35. Steady-" +
                  "state CONSUMPTION per worker is maximised at which savings rate?",
          options: [
            "s = 35% — the golden rule sets s equal to α.",
            "The highest rate available, 70% — more capital is always better.",
            "s = 65%, the complement of α.",
            "It depends on the depreciation rate alone, not on α."
          ],
          answer: 0,
          why: "The golden-rule savings rate equals capital's share of output. " +
               "Below it, extra saving buys more steady-state consumption than it " +
               "costs. Above it, the extra capital does not pay for its own " +
               "depreciation in consumption terms — the economy is dynamically " +
               "inefficient, saving so much that it consumes less forever."
        },
        {
          round: late,
          prompt: "Two countries are identical except that one starts with less " +
                  "capital per worker. With the same savings rate, what does the " +
                  "model predict?",
          options: [
            "The poorer one grows FASTER until they converge — diminishing returns make early capital more productive.",
            "The richer one grows faster, because it can save more in absolute terms.",
            "Both grow at the same rate; the gap never closes.",
            "The poorer one grows faster forever and eventually overtakes."
          ],
          answer: 0,
          why: "Conditional convergence. Because the production function has " +
               "diminishing returns to capital, a unit of investment adds more " +
               "output where capital is scarce. Same parameters means the same " +
               "steady state, so the country further below it grows faster on the " +
               "way — and the growth advantage disappears exactly when the gap does."
        }
      ];
    }
  };

  /* =======================================================================
     SCORING — one definition, used by the browser for the scorecard and by
     the edge function for the grade that counts.
     ======================================================================= */
  function score(slug, seed, decisions, answers) {
    var sim = SIMS[slug];
    if (!sim) { return { error: "unknown simulation: " + slug }; }
    decisions = decisions || [];
    answers = answers || [];

    /* Replay for the visible trace. */
    var init = sim.init(seed);
    var st = init.state, trace = [], t;
    for (t = 0; t < sim.rounds; t++) {
      var d = decisions[t];
      if (!d) { break; }
      st = sim.step(st, d, t, init.shocks);
      trace.push({ round: t + 1, decision: d, state: st });
    }
    var roundsPlayed = trace.length;
    var complete = roundsPlayed === sim.rounds;

    /* One scoring path for every simulation: evaluate() returns a number where
       higher is better, and the benchmarks are in the same units. The student
       scores the share of the worst-to-best range they captured. */
    var bm = sim.benchmarks(seed);
    var got = sim.evaluate(seed, decisions);
    var span = bm.best - bm.worst;
    var outcome = span > 0 ? (got - bm.worst) / span : 0;
    outcome = clamp(outcome, 0, 1);

    /* An abandoned run must not score as though it finished. */
    if (!complete && sim.rounds > 0) { outcome = outcome * (roundsPlayed / sim.rounds); }

    var cps = sim.checkpoints(seed);
    var cpDetail = [], cpRight = 0;
    for (t = 0; t < cps.length; t++) {
      var given = answers[t];
      var ok = (given !== null && given !== undefined && Number(given) === cps[t].answer);
      if (ok) { cpRight++; }
      cpDetail.push({
        round: cps[t].round + 1, prompt: cps[t].prompt,
        options: cps[t].options,
        given: (given === null || given === undefined) ? null : Number(given),
        answer: cps[t].answer, correct: ok, why: cps[t].why
      });
    }
    var cpScore = cps.length ? (cpRight / cps.length) : 0;

    var total = 0.70 * outcome + 0.30 * cpScore;
    return {
      slug: slug, seed: seed,
      roundsPlayed: roundsPlayed, roundsTotal: sim.rounds, complete: complete,
      outcomePct: Math.round(outcome * 1000) / 10,
      checkpointPct: Math.round(cpScore * 1000) / 10,
      checkpointsRight: cpRight, checkpointsTotal: cps.length,
      totalPct: Math.round(total * 1000) / 10,
      objective: r2(got), benchmarks: bm,
      checkpoints: cpDetail, trace: trace, finalState: st
    };
  }

  var API = {
    list: function () {
      var out = [];
      for (var k in SIMS) {
        if (Object.prototype.hasOwnProperty.call(SIMS, k)) {
          out.push({ slug: SIMS[k].slug, title: SIMS[k].title,
                     chapter: SIMS[k].chapter, rounds: SIMS[k].rounds,
                     minutes: SIMS[k].minutes });
        }
      }
      return out;
    },
    has: function (slug) { return !!SIMS[slug]; },
    spec: function (slug) { return SIMS[slug] ? SIMS[slug].spec() : null; },
    init: function (slug, seed) { return SIMS[slug] ? SIMS[slug].init(seed) : null; },
    step: function (slug, state, decision, round, shocks) {
      return SIMS[slug] ? SIMS[slug].step(state, decision, round, shocks) : null;
    },
    checkpoints: function (slug, seed) {
      return SIMS[slug] ? SIMS[slug].checkpoints(seed) : [];
    },
    benchmarks: function (slug, seed) {
      return SIMS[slug] ? SIMS[slug].benchmarks(seed) : null;
    },
    evaluate: function (slug, seed, decisions) {
      return SIMS[slug] ? SIMS[slug].evaluate(seed, decisions) : null;
    },
    score: score,
    ROUNDS: function (slug) { return SIMS[slug] ? SIMS[slug].rounds : 0; }
  };

  global.MASims = API;
  if (typeof module !== "undefined" && module.exports) { module.exports = API; }
})(typeof globalThis !== "undefined" ? globalThis : this);
