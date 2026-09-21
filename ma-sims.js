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

  /* =======================================================================
     CHECKPOINT SHUFFLE
     Every checkpoint is AUTHORED with the correct option first, because that
     is the readable way to write one. It must never be SHOWN that way: the two
     exemplars shipped with the answer in position A on every one of 1,200
     checkpoints, so clicking the first option earned the full 30%. The order
     is shuffled from the seed, so the browser and the server -- which replays
     the run -- always agree on which position is correct.
     ======================================================================= */
  function shuffleCheckpoint(cp, seed, idx) {
    var rng = mulberry32(((seed || 1) ^ (0x9E3779B1 * (idx + 1))) >>> 0);
    var order = [], i;
    for (i = 0; i < cp.options.length; i++) { order.push(i); }
    for (i = order.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = order[i]; order[i] = order[j]; order[j] = t;
    }
    var opts = [], answer = 0;
    for (i = 0; i < order.length; i++) {
      opts.push(cp.options[order[i]]);
      if (order[i] === cp.answer) { answer = i; }
    }
    return { round: cp.round, prompt: cp.prompt, options: opts,
             answer: answer, why: cp.why };
  }
  function shuffledCheckpoints(sim, seed) {
    var raw = sim.checkpoints(seed), out = [];
    for (var i = 0; i < raw.length; i++) { out.push(shuffleCheckpoint(raw[i], seed, i)); }
    return out;
  }

  /* =======================================================================
     THE STANDARD SCORING CURVE for any simulation measured by a loss.
       100%  matched the best the model allows
        50%  no better and no worse than the "do nothing" policy
         0%  twice the damage of doing nothing
     Pinning the midpoint to inaction is what made the Stabilization Lab
     readable; every loss-based arena uses the same curve, so a 65 means the
     same thing everywhere in the course.
     ======================================================================= */
  function midpointScore(loss, naive, best) {
    if (!(naive > best)) { return loss <= naive ? 1 : 0; }
    if (loss <= best) { return 1; }
    if (loss <= naive) { return 0.5 + 0.5 * (naive - loss) / (naive - best); }
    return Math.max(0, 0.5 * (1 - (loss - naive) / naive));
  }

  /* =======================================================================
     lossSim(def) -- builds a complete simulation from a declarative def.

     A def supplies the economics: initial state, the shock path, one step of
     the model, the per-round loss, the "do nothing" policy, the briefing, the
     checkpoints. This supplies everything that must be identical across
     arenas and was fragile to hand-write each time: replay, evaluation,
     benchmarks, the scoring curve.

     The BEST benchmark is found by coordinate descent over the whole decision
     path, starting from the do-nothing path. That matters: a per-round
     (myopic) search is not a valid benchmark once the model has any memory,
     and in the Stabilization Lab it scored below doing nothing on some seeds,
     which inverted the scale. Searching whole paths prices the carry-over.
     ======================================================================= */
  function gridFor(ctrl) {
    var pts = [], span = ctrl.max - ctrl.min;
    var step = Math.max(ctrl.step, span / 24);         // keep the search bounded
    for (var v = ctrl.min; v <= ctrl.max + 1e-9; v += step) {
      // snap to the control's own step: a grid point a student cannot select
      // would let the benchmark sit off the slider (Labor Lab's b = 73.33)
      var sv = r2(ctrl.min + Math.round((v - ctrl.min) / ctrl.step) * ctrl.step);
      if (!pts.length || pts[pts.length - 1] !== sv) { pts.push(sv); }
    }
    if (pts[pts.length - 1] < ctrl.max - 1e-9) { pts.push(ctrl.max); }
    return pts;
  }
  function combos(controls) {
    var out = [{}];
    controls.forEach(function (c) {
      var g = gridFor(c), next = [];
      out.forEach(function (o) {
        g.forEach(function (v) {
          var n = {}; for (var k in o) { n[k] = o[k]; } n[c.key] = v; next.push(n);
        });
      });
      out = next;
    });
    return out;
  }
  /* Every decision is clamped to the control's range AND snapped to its step.
     The slider can only ever produce stepped values; the server must accept
     nothing else, or a hand-built transcript with off-grid values could beat
     both the benchmark and every honest student. */
  function clampDecision(controls, d) {
    var out = {};
    controls.forEach(function (c) {
      var v = Number(d && d[c.key]);
      if (isNaN(v)) { v = c["default"]; }
      v = clamp(v, c.min, c.max);
      v = c.min + Math.round((v - c.min) / c.step) * c.step;
      out[c.key] = r2(clamp(v, c.min, c.max));
    });
    return out;
  }

  function lossSim(def) {
    var spec = def.spec;
    var self = {
      slug: def.slug, title: spec.title, chapter: def.chapter,
      rounds: def.rounds, minutes: def.minutes,

      spec: function () { return spec; },

      init: function (seed) {
        var rng = mulberry32(((seed || 1) + def.salt) >>> 0);
        var shocks = def.shocks(rng);
        return { state: def.initState(rng, shocks), shocks: shocks };
      },

      step: function (state, decision, round, shocks) {
        var d = clampDecision(spec.controls, decision);
        return def.step(state, d, round, shocks[round] || def.noShock, shocks);
      },

      naiveDecision: function (state, round, shocks) {
        return clampDecision(spec.controls,
          typeof def.naive === "function" ? def.naive(state, round, shocks) : def.naive);
      },

      /* Total loss of a decision path. Missing rounds (an abandoned run) are
         filled with the do-nothing policy so the economy still runs to the end;
         score() then pro-rates the outcome for the rounds actually played. */
      totalLoss: function (seed, decisions) {
        var init = self.init(seed), st = init.state, L = 0;
        for (var t = 0; t < def.rounds; t++) {
          var d = decisions[t] ? decisions[t] : self.naiveDecision(st, t, init.shocks);
          st = self.step(st, d, t, init.shocks);
          L += def.roundLoss(st, clampDecision(spec.controls, d), t, init.shocks[t] || def.noShock);
        }
        if (def.terminalLoss) { L += def.terminalLoss(st); }
        return L;
      },

      evaluate: function (seed, decisions) { return -self.totalLoss(seed, decisions); },

      benchmarks: function (seed) {
        var init = self.init(seed), t;
        var naivePath = [], st = init.state;
        for (t = 0; t < def.rounds; t++) {
          var nd = self.naiveDecision(st, t, init.shocks);
          naivePath.push(nd);
          st = self.step(st, nd, t, init.shocks);
        }
        var naive = self.totalLoss(seed, naivePath);
        var grid = combos(spec.controls);

        /* A greedy forward path: each round, the decision that minimises THAT
           round's loss given everything already decided. Worthless as a
           benchmark on its own (it ignores the future), but a far better place
           to START a search on problems whose rounds compound. Starting only
           from do-nothing left CPI Lab's search stuck: it tuned round 0 against
           six later rounds still at zero and never climbed out. */
        var greedy = [], gs = init.state;
        for (t = 0; t < def.rounds; t++) {
          var bestD = grid[0], bestV = Infinity;
          for (var gi0 = 0; gi0 < grid.length; gi0++) {
            var ns = self.step(gs, grid[gi0], t, init.shocks);
            var v0 = def.roundLoss(ns, grid[gi0], t, init.shocks[t] || def.noShock);
            if (v0 < bestV) { bestV = v0; bestD = grid[gi0]; }
          }
          greedy.push(bestD);
          gs = self.step(gs, bestD, t, init.shocks);
        }

        function descend(path) {
          var best = self.totalLoss(seed, path);
          for (var pass = 0; pass < 3; pass++) {
            var improved = false;
            for (t = 0; t < def.rounds; t++) {
              var keep = path[t];
              for (var gi = 0; gi < grid.length; gi++) {
                path[t] = grid[gi];
                var L = self.totalLoss(seed, path);
                if (L < best - 1e-9) { best = L; keep = grid[gi]; improved = true; }
              }
              path[t] = keep;
            }
            if (!improved) { break; }
          }
          /* Refine at the control's REAL step: the coarse grid alone left the
             benchmark beatable by a student on a finer slider. */
          for (var pass2 = 0; pass2 < 4; pass2++) {
            var improved2 = false;
            for (t = 0; t < def.rounds; t++) {
              spec.controls.forEach(function (c) {
                var reach = Math.ceil(Math.max(c.step, (c.max - c.min) / 24) / c.step) + 1;
                var base = path[t][c.key], keepV = base;
                for (var k2 = -reach; k2 <= reach; k2++) {
                  if (!k2) { continue; }
                  var v = r2(clamp(base + k2 * c.step, c.min, c.max));
                  var trial = {}; for (var kk in path[t]) { trial[kk] = path[t][kk]; }
                  trial[c.key] = v;
                  var saved = path[t]; path[t] = trial;
                  var L2 = self.totalLoss(seed, path);
                  path[t] = saved;
                  if (L2 < best - 1e-9) { best = L2; keepV = v; improved2 = true; }
                }
                if (keepV !== base) {
                  var np = {}; for (var k3 in path[t]) { np[k3] = path[t][k3]; }
                  np[c.key] = keepV; path[t] = np;
                }
              });
            }
            if (!improved2) { break; }
          }
          /* Joint moves for two-instrument arenas: on a constraint ridge (Policy
             Lab's revenue target) one-at-a-time moves step off it both ways. */
          if (spec.controls.length === 2) {
            var cA = spec.controls[0], cB = spec.controls[1];
            for (var pass3 = 0; pass3 < 4; pass3++) {
              var improved3 = false;
              for (t = 0; t < def.rounds; t++) {
                var bA = path[t][cA.key], bB = path[t][cB.key], kA2 = bA, kB2 = bB;
                for (var da = -6; da <= 6; da++) {
                  for (var db = -6; db <= 6; db++) {
                    if (!da && !db) { continue; }
                    var trial2 = {};
                    trial2[cA.key] = r2(clamp(bA + da * cA.step, cA.min, cA.max));
                    trial2[cB.key] = r2(clamp(bB + db * cB.step, cB.min, cB.max));
                    var sv = path[t]; path[t] = trial2;
                    var L3 = self.totalLoss(seed, path);
                    path[t] = sv;
                    if (L3 < best - 1e-9) { best = L3; kA2 = trial2[cA.key]; kB2 = trial2[cB.key]; improved3 = true; }
                  }
                }
                if (kA2 !== bA || kB2 !== bB) {
                  var np2 = {}; np2[cA.key] = kA2; np2[cB.key] = kB2; path[t] = np2;
                }
              }
              if (!improved3) { break; }
            }
          }
          /* Transfers between rounds. When a total is fixed across the whole run
             (Loanable Funds must borrow exactly 56bn), moving one year's value
             alone breaks the total and is penalised in both directions, so the
             search could not shift borrowing OUT of a boom and INTO a glut --
             the very move the arena teaches. Moving the same amount between two
             rounds walks along the constraint. */
          for (var pass4 = 0; pass4 < 4; pass4++) {
            var improved4 = false;
            spec.controls.forEach(function (c) {
              for (var i4 = 0; i4 < def.rounds; i4++) {
                for (var j4 = 0; j4 < def.rounds; j4++) {
                  if (i4 === j4) { continue; }
                  for (var k4 = 1; k4 <= 8; k4++) {
                    var vi = r2(path[i4][c.key] + k4 * c.step), vj = r2(path[j4][c.key] - k4 * c.step);
                    if (vi > c.max + 1e-9 || vj < c.min - 1e-9) { break; }
                    var si = path[i4], sj = path[j4];
                    var ni = {}, nj = {}, q;
                    for (q in si) { ni[q] = si[q]; } for (q in sj) { nj[q] = sj[q]; }
                    ni[c.key] = vi; nj[c.key] = vj;
                    path[i4] = ni; path[j4] = nj;
                    var L4 = self.totalLoss(seed, path);
                    if (L4 < best - 1e-9) { best = L4; improved4 = true; }
                    else { path[i4] = si; path[j4] = sj; }
                  }
                }
              }
            });
            if (!improved4) { break; }
          }
          return { loss: best, path: path };
        }

        var a = descend(naivePath.slice());
        var b = descend(greedy.slice());
        var win = b.loss < a.loss ? b : a;
        return { naive: r2(naive), bestLoss: r2(win.loss),
                 best: r2(-win.loss), worst: r2(-2 * naive), bestPath: win.path };
      },

      scoreFrom: function (got, bm) { return midpointScore(-got, bm.naive, bm.bestLoss); },

      /* ACCURACY SCALE, for arenas whose task is to get a NUMBER right (GDP
         Builder, CPI Lab). A relative scale anchored on do-nothing fails there:
         the do-nothing answer is so wrong that any vaguely sensible guess crowds
         toward the top -- a flat 2% pension rise scored 91%, typing 0 for GDP
         scored 59%. Instead each round earns full credit for an exact answer,
         falling linearly to zero at a tolerance stated in the briefing. A missed
         round (abandoned run) earns zero. */
      outcome: def.accuracy ? function (seed, decisions) {
        var init = self.init(seed), st = init.state, sum = 0;
        for (var t = 0; t < def.rounds; t++) {
          if (!decisions[t]) { break; }
          st = self.step(st, decisions[t], t, init.shocks);
          /* Half a slider step of slack: a student who computes 2.314 can only
             enter 2.3, and a correct calculation must not lose marks to that. */
          var dev = Math.max(0, Math.abs(def.accuracy.dev(st)) - (def.accuracy.slack || 0));
          sum += Math.max(0, 1 - dev / def.accuracy.tol);
        }
        return sum / def.rounds;
      } : null,
      scale: def.accuracy ? "accuracy" : "midpoint",

      checkpoints: function (seed) {
        var rng = mulberry32(((seed || 1) + def.salt + 7717) >>> 0);
        return def.checkpoints(rng, self.init(seed), seed);
      },

      /* Project this round WITHOUT its hidden shock. The round's shock object is
         kept and only the fields named in noShock are overwritten: some arenas
         carry announced structure in it (Policy Lab's revenue need and
         elasticities), and projecting with noShock alone crashed on them. */
      preview: def.preview ? function (state, decision, round, shocks) {
        function calmOf(sh) {
          var o = {}, k;
          if (sh) { for (k in sh) { if (Object.prototype.hasOwnProperty.call(sh, k)) { o[k] = sh[k]; } } }
          for (k in def.noShock) { if (Object.prototype.hasOwnProperty.call(def.noShock, k)) { o[k] = def.noShock[k]; } }
          return o;
        }
        var calm = [];
        for (var z = 0; z < def.rounds; z++) { calm.push(calmOf(shocks[z])); }
        var d = clampDecision(spec.controls, decision);
        var proj = def.step(state, d, round, calm[round], calm);
        return def.preview(proj, state, d, round, shocks[round] || def.noShock);
      } : null,

      explain: def.explain || null
    };
    return self;
  }


  /* ---- shared helpers for the arenas ------------------------------------ */
  /* Spread one-off impulses forward so a shock is something you live with for
     a couple of rounds rather than a single bad afternoon. */
  function decay(impulses, keys, rate, span) {
    var out = [], i, k, d;
    for (i = 0; i < impulses.length; i++) {
      var o = { hit: impulses[i].hit, label: impulses[i].label, info: impulses[i].info };
      keys.forEach(function (key) { o[key] = 0; });
      out.push(o);
    }
    for (i = 0; i < impulses.length; i++) {
      for (d = 0; d < span && i + d < impulses.length; d++) {
        var w = Math.pow(rate, d);
        for (k = 0; k < keys.length; k++) { out[i + d][keys[k]] += (impulses[i][keys[k]] || 0) * w; }
      }
    }
    for (i = 0; i < out.length; i++) {
      for (k = 0; k < keys.length; k++) { out[i][keys[k]] = r2(out[i][keys[k]]); }
      if (!impulses[i].hit) {
        var lingering = keys.some(function (key) { return Math.abs(out[i][key]) > 0.05; });
        if (lingering && !out[i].label) {
          out[i].label = "No new shock — but the last one is still working through.";
        }
      }
      if (!out[i].label) { out[i].label = "A quiet period."; }
    }
    return out;
  }
  function shuffleInPlace(rng, a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function f1(x) { return r1(x).toFixed(1); }
  function standardExplain(res, what) {
    var b = res.benchmarks;
    var hindsight = " (That best was found knowing every shock in advance, which you could not.)";
    return "Your total " + what + " was <b>" + f1(-res.objective) + "</b>. The do-nothing policy " +
           "would have scored <b>" + f1(b.naive) + "</b> — that is the 50% mark. The best " +
           "found for this exact run is <b>" + f1(b.bestLoss) + "</b>, which is 100%." + hindsight +
           (res.outcomePct < 49.5 ? " You are below 50: this run did more harm than doing nothing would have."
             : (res.outcomePct > 50.5 ? " You beat doing nothing." : ""));
  }
  /* Accuracy arenas are graded absolutely, not against do-nothing, so the
     midpoint wording of standardExplain would misdescribe them. */
  function accuracyExplain(res, dev, tol, unit) {
    var tr = res.trace || [], sum = 0, worst = 0, exact = 0;
    tr.forEach(function (x) {
      var e = Math.abs(dev(x.state)); sum += e; worst = Math.max(worst, e);
      if (e <= 0.06) { exact++; }
    });
    var n = Math.max(1, tr.length);
    return "Your average miss was <b>" + (sum / n).toFixed(2) + "</b> " + unit + ", and your worst was <b>" +
           worst.toFixed(2) + "</b>. " + exact + " of " + tr.length + " rounds were on target. A round " +
           "scores zero at " + tol + " off, so accuracy, not direction, is what counts here.";
  }
  var HOW_SCORED_LOSS = [
    "70% OUTCOME. Each round adds a penalty, described below. The scale is anchored so " +
      "you can read it: 50% means you did no better and no worse than the do-nothing " +
      "policy; 0% means you did twice as much damage as doing nothing; 100% means you " +
      "matched the best possible play for your exact run \u2014 play that KNEW every shock " +
      "in advance. You will not know them, so strong play usually lands between 75% and " +
      "95%, and that is a very good result.",
    "30% CHECKPOINTS. Three times, before a round resolves, you are asked what is about " +
      "to happen or why. These test the mechanism. Reaching a good outcome by trial and " +
      "error will not earn them."
  ];

  /* =========================================================================
     STABILIZATION LAB  (chapter 15 — AD-AS)          -- migrated to lossSim.
     Equations unchanged from the verified build:
       y  = rho*y_prev - a(r - r*) + g + demandShock
       pi = piE + b*y + supplyShock
       piE' = piE + theta(pi - piE)
     ========================================================================= */
  var ADAS = { a: 0.6, b: 0.5, theta: 0.5, c: 0.5, rStar: 2.0, uStar: 5.0,
               rounds: 7, rho: 0.55, decay: 0.5 };
  SIMS["adas-lab"] = lossSim({
    slug: "adas-lab", chapter: 15, rounds: 7, minutes: 10, salt: 0,
    noShock: { supply: 0, demand: 0, hit: false, label: "" },
    spec: {
      title: "Stabilization Lab",
      subtitle: "Seven years at the policy desk.",
      youAre: "You set monetary and fiscal policy for a small economy. Each year you choose " +
              "a real policy rate and a fiscal impulse, then the year plays out and a shock may land.",
      goal: "Keep inflation near 2% and the output gap near 0. Both matter, and they will pull " +
            "against each other.",
      penalty: "Each year's penalty is (inflation − 2)² + (output gap)², so one " +
               "disastrous year costs more than several mediocre ones. Do-nothing means holding " +
               "the real rate at its 2% neutral level with no fiscal impulse.",
      howScored: HOW_SCORED_LOSS,
      controls: [
        { key: "r", label: "Real policy rate", unit: "%", min: -1, max: 8, step: 0.25, "default": 2,
          help: "The neutral rate is 2%. Above neutral cools demand, below it heats demand." },
        { key: "g", label: "Fiscal impulse", unit: "% of GDP", min: -2, max: 2, step: 0.25, "default": 0,
          help: "Positive is a deficit-financed boost; negative is consolidation." }
      ],
      readouts: [
        { key: "pi", label: "Inflation", unit: "%", target: 2, band: 0.5 },
        { key: "y", label: "Output gap", unit: "%", target: 0, band: 0.5 },
        { key: "u", label: "Unemployment", unit: "%" },
        { key: "piE", label: "Expected inflation", unit: "%" }
      ],
      chart: [
        { key: "pi", label: "Inflation", color: "#b45309", target: 2 },
        { key: "y", label: "Output gap", color: "#0f3d9e", target: 0 }
      ],
      watchFor: "Two things compound against you. Expected inflation moves toward whatever " +
                "you actually deliver, so tolerating high inflation makes every later year " +
                "harder. And the output gap carries over — roughly half of this year's gap " +
                "is still there next year whatever you do, so a shock you fail to offset is " +
                "not over when the year ends."
    },
    shocks: function (rng) {
      var slots = shuffleInPlace(rng, [1, 2, 3, 4, 5, 6]);
      var imp = [], k;
      for (k = 0; k < ADAS.rounds; k++) {
        var s = { supply: 0, demand: 0, hit: false, label: "No major shock this year." };
        if (k === slots[0] || k === slots[1]) {
          s.supply = r1(1.5 + rng() * 2.0); s.hit = true; s.kind = "supply";
          s.label = "Adverse supply shock: energy and shipping costs jump.";
        } else if (k === slots[2] || k === slots[3]) {
          s.demand = r1(-(1.0 + rng() * 2.0)); s.hit = true; s.kind = "demand";
          s.label = "Demand slump: private investment pulls back sharply.";
        }
        imp.push(s);
      }
      var out = decay(imp, ["supply", "demand"], ADAS.decay, 3);
      for (k = 0; k < out.length; k++) { out[k].kind = imp[k].kind; }
      return out;
    },
    initState: function () { return { pi: 2, piE: 2, y: 0, u: ADAS.uStar }; },
    step: function (st, d, t, sh) {
      var y = ADAS.rho * st.y - ADAS.a * (d.r - ADAS.rStar) + d.g + sh.demand;
      var pi = st.piE + ADAS.b * y + sh.supply;
      return { pi: r2(pi), piE: r2(st.piE + ADAS.theta * (pi - st.piE)), y: r2(y),
               u: r2(ADAS.uStar - ADAS.c * y) };
    },
    roundLoss: function (st) { return Math.pow(st.pi - 2, 2) + Math.pow(st.y, 2); },
    naive: { r: 2, g: 0 },
    preview: function (proj, st, d, round, sh) {
      var warn = "";
      if (sh.kind === "supply") { warn = " The supply shock will push inflation <b>above</b> this, by an amount you are not told."; }
      else if (sh.kind === "demand") { warn = " The demand slump will push output <b>below</b> this, by an amount you are not told."; }
      else if (sh.supply > 0.05) { warn = " Last year's supply shock is still adding to inflation."; }
      else if (sh.demand < -0.05) { warn = " Last year's slump is still dragging on output."; }
      return "<b>Shock aside,</b> these settings project inflation <b>" + f1(proj.pi) +
             "%</b> and an output gap of <b>" + f1(proj.y) + "%</b>." + warn;
    },
    explain: function (res) { return standardExplain(res, "penalty"); },
    checkpoints: function (rng, init) {
      var sup = -1, dem = -1, k;
      for (k = 0; k < init.shocks.length; k++) {
        if (init.shocks[k].kind === "supply" && sup < 0) { sup = k; }
        if (init.shocks[k].kind === "demand" && dem < 0) { dem = k; }
      }
      var late = 5 + Math.floor(rng() * 2);
      if (late === sup || late === dem) { late = [4, 5, 6].filter(function (x) { return x !== sup && x !== dem; })[0]; }
      return [
        { round: sup,
          prompt: "An adverse supply shock is about to hit. If you leave the real rate at neutral and run no fiscal impulse, what happens this year?",
          options: ["Inflation rises and the output gap falls — they move in opposite directions.",
                    "Inflation rises and the output gap rises — both move up together.",
                    "Inflation falls and the output gap rises.",
                    "Neither moves; a supply shock only affects the price level next year."],
          answer: 0,
          why: "A supply shock enters the Phillips curve directly, raising inflation at any level of output. " +
               "Any demand-side move that brings inflation back down also pushes output further down, so you " +
               "are forced to trade one target against the other. That opposite-direction bind is exactly what " +
               "makes supply shocks hard and demand shocks easy." },
        { round: dem,
          prompt: "A demand slump is about to hit. Which single move does the MOST to offset it for BOTH targets at once?",
          options: ["Cut the real rate below neutral, or run a positive fiscal impulse — either raises demand.",
                    "Raise the real rate to anchor inflation expectations first.",
                    "Nothing: a demand shock is self-correcting within the year.",
                    "Cut the rate AND consolidate fiscally, so the two offset."],
          answer: 0,
          why: "A demand shock moves inflation and output the SAME way, so one expansionary move pushes both " +
               "back toward target. There is no trade-off to manage — which is precisely the contrast with " +
               "the supply shock." },
        { round: late,
          prompt: "Expected inflation here adjusts toward whatever inflation you actually delivered. What does that imply for a policymaker who lets inflation run above target for two years?",
          options: ["Expectations drift up, so hitting 2% later needs a deeper output cost than it would have.",
                    "Nothing — expectations are anchored at 2% by assumption in this model.",
                    "Expectations drift up, which makes future inflation easier to control.",
                    "Expectations fall, because the public anticipates a correction."],
          answer: 0,
          why: "Adaptive expectations make today's inflation tomorrow's starting point. Disinflation then needs a " +
               "negative output gap to pull inflation back below expectations — the sacrifice ratio. Letting " +
               "inflation run is borrowing from your own future room to manoeuvre." }
      ];
    }
  });

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
          { key: "s", label: "Savings rate", unit: "%", min: 5, max: 70, step: 1, "default": 20,
            help: "Capital's share of output (alpha) is 35%. That number matters." }
        ],
        readouts: [
          { key: "k", label: "Capital per effective worker" },
          { key: "y", label: "Output per effective worker" },
          { key: "cPerWorker", label: "Consumption per worker", unit: "index" },
          { key: "cumC", label: "Cumulative consumption", unit: "index" }
        ],
        chart: [
          { key: "k", label: "Capital per effective worker", color: "#0f3d9e" },
          { key: "cPerWorker", label: "Consumption per worker", color: "#16a34a" }
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

    preview: function (state, decision) {
      var proj = SIMS["growth-lab"].step(state, decision, 0, []);
      return "<b>This decade:</b> consumption per worker <b>" + r1(proj.cPerWorker).toFixed(1) +
             "</b>, leaving capital at <b>" + r1(proj.k).toFixed(1) + "</b> to work with next decade.";
    },

    explain: function (res) {
      var b = res.benchmarks;
      return "Your total consumption per worker, counting the decades that follow at your " +
             "final savings rate, was <b>" + r1(res.objective).toFixed(1) + "</b>. The best any " +
             "constant savings rate could have managed on this run is <b>" + r1(b.best).toFixed(1) +
             "</b>, at a rate of <b>" + b.bestConstantS + "%</b>. Capital's share of output is 35%.";
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

  /* =========================================================================
     MARKET SANDBOX  (chapter 4 — supply and demand)            FREE PREVIEW
     You set the price in a market each week. Shifts in demand and supply are
     announced by cause and rough size, never by number, so the skill is
     reading a shift and knowing which way and how far price must move.
       Qd = A - 2P      Qs = B + 3P      (base A = 100, B = -10, P* = 22)
     ========================================================================= */
  SIMS["market-sandbox"] = lossSim({
    slug: "market-sandbox", chapter: 4, rounds: 7, minutes: 8, salt: 4101,
    noShock: { dA: 0, dB: 0, hit: false, label: "" },
    spec: {
      title: "Market Sandbox",
      subtitle: "Seven weeks setting the price.",
      youAre: "You run the only wholesale stall for a perishable good. Each week you post one price. " +
              "Buyers and sellers respond, and whatever does not match is waste: unsold stock if " +
              "you price too high, turned-away customers if you price too low.",
      goal: "Post the price that clears the market each week — quantity demanded equal to " +
            "quantity supplied.",
      penalty: "Each week's penalty is the square of the mismatch between quantity demanded and " +
               "supplied, measured in tens of units (a mismatch of 30 costs 9). Do-nothing means leaving the price at $22, the " +
               "starting equilibrium.",
      howScored: HOW_SCORED_LOSS,
      controls: [
        { key: "P", label: "Posted price", unit: "$", min: 5, max: 45, step: 0.5, "default": 22,
          help: "Each $1 you add removes 2 units of demand and brings 3 more units of supply." }
      ],
      readouts: [
        { key: "P", label: "Price", unit: "$" },
        { key: "Qd", label: "Quantity demanded" },
        { key: "Qs", label: "Quantity supplied" },
        { key: "gap", label: "Shortage (+) / surplus (−)", target: 0, band: 2 }
      ],
      chart: [
        { key: "P", label: "Price", color: "#0f3d9e" },
        { key: "gap", label: "Shortage (+) / surplus (−)", color: "#b45309", target: 0 }
      ],
      watchFor: "A shift does not vanish the week after it lands; it fades by about half each " +
                "week. And when demand and supply shift in the same week, work out each one's " +
                "effect on price separately before you combine them."
    },
    shocks: function (rng) {
      var events = [
        { dA: 1, label: "A heat wave: buyers want far more of the good.", kind: "D+" },
        { dA: -1, label: "A local employer closes; buyers cut back.", kind: "D-" },
        { dB: -1, label: "Frost destroys part of the growers' crop.", kind: "S-" },
        { dB: 1, label: "A cheaper refrigerated truck service opens for growers.", kind: "S+" },
        { dA: 1, dB: 1, label: "A festival draws buyers AND a bumper harvest arrives the same week.", kind: "both" }
      ];
      var slots = shuffleInPlace(rng, [1, 2, 3, 4, 5, 6]).slice(0, 4);
      var pickOrder = shuffleInPlace(rng, [0, 1, 2, 3, 4]).slice(0, 4);
      if (pickOrder.indexOf(4) < 0) { pickOrder[3] = 4; }       // always one two-sided week
      var imp = [], k;
      for (k = 0; k < 7; k++) { imp.push({ dA: 0, dB: 0, hit: false, label: "" }); }
      for (k = 0; k < 4; k++) {
        var e = events[pickOrder[k]];
        var big = rng() < 0.5;
        var mag = big ? 20 + Math.floor(rng() * 6) : 10 + Math.floor(rng() * 5);
        var word = big ? "Strong: " : "Mild: ";
        imp[slots[k]] = { dA: (e.dA || 0) * mag, dB: (e.dB || 0) * mag, hit: true,
                          label: word + e.label, kind: e.kind, size: big ? "strong" : "mild" };
      }
      var out = decay(imp, ["dA", "dB"], 0.5, 3);
      for (k = 0; k < 7; k++) { out[k].kind = imp[k].kind; out[k].size = imp[k].size; }
      return out;
    },
    initState: function () { return { P: 22, Qd: 56, Qs: 56, gap: 0 }; },
    step: function (st, d, t, sh) {
      var Qd = 100 + sh.dA - 2 * d.P, Qs = -10 + sh.dB + 3 * d.P;
      return { P: d.P, Qd: r1(Math.max(0, Qd)), Qs: r1(Math.max(0, Qs)), gap: r1(Qd - Qs) };
    },
    roundLoss: function (st) { return Math.pow(st.gap / 10, 2); },
    naive: { P: 22 },
    preview: function (proj, st, d, round, sh) {
      var tail = sh.hit ? " This week's shift is <b>not</b> in these figures." : "";
      return "<b>On the old curves,</b> at $" + f1(d.P) + " buyers want <b>" + f1(proj.Qd) +
             "</b> and sellers bring <b>" + f1(proj.Qs) + "</b>." + tail;
    },
    explain: function (res) { return standardExplain(res, "mismatch penalty"); },
    checkpoints: function (rng, init) {
      var both = -1, shiftR = -1, k;
      for (k = 0; k < 7; k++) {
        if (init.shocks[k].kind === "both") { both = k; }
        else if (init.shocks[k].hit && shiftR < 0) { shiftR = k; }
      }
      var third = [0, 1, 2, 3, 4, 5, 6].filter(function (x) { return x !== both && x !== shiftR; });
      var r3 = third[Math.floor(rng() * third.length)];
      return [
        { round: both,
          prompt: "This week buyers want more AND sellers can supply more. Before you set a price: what can you say for certain?",
          options: ["The quantity traded rises; the price could go either way depending on which shift is larger.",
                    "Price must rise, because demand went up.",
                    "Price must fall, because supply went up.",
                    "Nothing changes, because the two shifts cancel exactly."],
          answer: 0,
          why: "Higher demand pushes price up and quantity up. Higher supply pushes price down and quantity up. " +
               "Quantity rises under both, so that is certain. Price is pulled in opposite directions, so its " +
               "direction depends on which shift is bigger — which is why you have to size each one." },
        { round: shiftR,
          prompt: "A shift is announced. What is the difference between a SHIFT of the demand curve and a MOVEMENT ALONG it?",
          options: ["A shift is caused by something other than the good's own price; a movement along is caused by its price changing.",
                    "They are the same thing described two ways.",
                    "A shift is a large price change; a movement along is a small one.",
                    "A movement along the curve happens only when supply shifts."],
          answer: 0,
          why: "The demand curve already shows how buyers respond to the good's own price, so a price change " +
               "moves you along it. Anything else that changes what buyers want at every price — weather, " +
               "income, the price of substitutes — moves the whole curve. Your own price changes each week " +
               "are movements along both curves." },
        { round: r3,
          prompt: "Suppose a regulator capped the price at $15, below where the market clears. What happens?",
          options: ["A persistent shortage: buyers want more than sellers will bring at that price.",
                    "A surplus, because the low price discourages buyers.",
                    "Nothing, as long as the cap is announced in advance.",
                    "The market clears at $15 because sellers accept the lower price."],
          answer: 0,
          why: "At $15 buyers want 100 − 30 = 70 units but sellers bring only −10 + 45 = 35. A ceiling " +
               "below equilibrium holds the price where demand exceeds supply, so the shortage does not " +
               "close — queues and rationing take the place of price." }
      ];
    }
  });

  /* =========================================================================
     ELASTICITY EXPLORER  (chapter 5 — price elasticity and revenue)
     Each week a different product. You are told its current price, its sales
     and its price elasticity AT that price. Revenue is maximised where demand
     is unit elastic; with linear demand the best price change is
         (1/e - 1) / 2   of the current price.
     Two products have a production cap, which moves the best price up.
     No live preview: the student must reason from elasticity, not scan.
     ========================================================================= */
  var PRODUCTS = [
    ["artisanal coffee", "cups"], ["concert tickets", "tickets"], ["bus passes", "passes"],
    ["phone cases", "cases"], ["gym memberships", "memberships"], ["textbooks", "copies"],
    ["streaming plans", "subscriptions"], ["bakery bread", "loaves"], ["museum entry", "visits"],
    ["bike repairs", "repairs"]
  ];
  SIMS["elasticity-explorer"] = lossSim({
    slug: "elasticity-explorer", chapter: 5, rounds: 7, minutes: 9, salt: 5101,
    noShock: { hit: false, label: "" },
    spec: {
      title: "Elasticity Explorer",
      subtitle: "Seven products, one question: raise the price or cut it?",
      youAre: "You price a different product each week. For each one you are told its current " +
              "price, how many it sells, and its price elasticity of demand at that price. You " +
              "set a price change and the week plays out.",
      goal: "Earn as much revenue as possible on each product.",
      penalty: "Each week's penalty is the percentage of the product's maximum possible revenue " +
               "you left on the table. Do-nothing means keeping the current price.",
      howScored: HOW_SCORED_LOSS,
      controls: [
        { key: "dp", label: "Price change", unit: "%", min: -60, max: 100, step: 1, "default": 0,
          help: "Relative to the product's current price. There is no preview: reason from the elasticity." }
      ],
      readouts: [
        { key: "capture", label: "Share of max revenue", unit: "%", target: 100, band: 3 },
        { key: "cumCapture", label: "Average so far", unit: "%" }
      ],
      chart: [{ key: "capture", label: "Share of max revenue captured", color: "#16a34a", target: 100 }],
      watchFor: "Elasticity is not a fixed property of a product. On a straight-line demand curve it " +
                "changes as you move along it, so the elasticity you are told applies at the CURRENT " +
                "price only. And read each week's note: sometimes you cannot make as many as buyers want."
    },
    shocks: function (rng) {
      var order = shuffleInPlace(rng, PRODUCTS.slice()).slice(0, 7);
      var capRounds = shuffleInPlace(rng, [2, 3, 4, 5, 6]).slice(0, 2);
      var out = [];
      for (var k = 0; k < 7; k++) {
        var e = r2(0.4 + rng() * 2.6);
        var P0 = r2(2 + rng() * 48), Q0 = Math.round(200 + rng() * 1800);
        var b = e * Q0 / P0, a = Q0 + b * P0;
        var cap = null;
        if (capRounds.indexOf(k) >= 0) {
          var Pstar = a / (2 * b);
          cap = Math.round((a - b * Pstar) * (0.55 + rng() * 0.2));   // binds well below the unconstrained optimum
        }
        var info = "<b>" + order[k][0].charAt(0).toUpperCase() + order[k][0].slice(1) + ".</b> Current price <b>$" +
                   P0.toFixed(2) + "</b>, selling <b>" + Q0.toLocaleString("en-US") + " " + order[k][1] +
                   "</b> a week. Price elasticity of demand at this price: <b>" + e.toFixed(2) + "</b>." +
                   (cap ? " <b>Capacity limit:</b> you can make at most <b>" + cap.toLocaleString("en-US") +
                          " " + order[k][1] + "</b> this week." : "");
        out.push({ hit: true, label: "New product this week.", info: info,
                   a: a, b: b, P0: P0, Q0: Q0, e: e, cap: cap });
      }
      return out;
    },
    initState: function () { return { capture: 0, cumCapture: 0, n: 0, sum: 0 }; },
    step: function (st, d, t, sh) {
      if (!sh.a) { return st; }
      var P = sh.P0 * (1 + d.dp / 100);
      var q = Math.max(0, sh.a - sh.b * P);
      if (sh.cap !== null && sh.cap !== undefined) { q = Math.min(q, sh.cap); }
      var R = P * q;
      var Pbest = sh.a / (2 * sh.b);
      if (sh.cap !== null && sh.cap !== undefined) { Pbest = Math.max(Pbest, (sh.a - sh.cap) / sh.b); }
      var qb = Math.max(0, sh.a - sh.b * Pbest);
      if (sh.cap !== null && sh.cap !== undefined) { qb = Math.min(qb, sh.cap); }
      var Rmax = Pbest * qb;
      var cap = Rmax > 0 ? 100 * R / Rmax : 0;
      var n = st.n + 1, sum = st.sum + cap;
      return { capture: r1(cap), cumCapture: r1(sum / n), n: n, sum: sum };
    },
    roundLoss: function (st) { return Math.max(0, 100 - st.capture) / 10; },
    naive: { dp: 0 },
    explain: function (res) {
      return standardExplain(res, "revenue penalty") +
             " With straight-line demand the revenue-maximising change is (1/e − 1)/2 of the current " +
             "price: cut when e > 1, raise when e < 1. Where capacity binds, raise the price until " +
             "buyers want exactly what you can make.";
    },
    checkpoints: function (rng, init) {
      var capR = -1, hiE = -1, loE = -1, k;
      for (k = 0; k < 7; k++) {
        if (init.shocks[k].cap && capR < 0) { capR = k; }
      }
      for (k = 0; k < 7; k++) {
        if (k === capR) { continue; }
        if (init.shocks[k].e > 1.2 && hiE < 0) { hiE = k; }
        else if (init.shocks[k].e < 0.9 && loE < 0) { loE = k; }
      }
      var used = [capR, hiE, loE];
      function free() { for (var x = 0; x < 7; x++) { if (used.indexOf(x) < 0) { used.push(x); return x; } } return 6; }
      if (hiE < 0) { hiE = free(); used[1] = hiE; }
      var roundLow = loE >= 0 ? loE : free();
      return [
        { round: hiE,
          prompt: "Demand for this product is elastic at its current price (elasticity above 1). What does a small price CUT do to revenue?",
          options: ["Raises it: quantity rises by a larger percentage than price falls.",
                    "Lowers it: any price cut reduces revenue.",
                    "Leaves it unchanged, because the two effects offset exactly.",
                    "Raises it only if the good is a necessity."],
          answer: 0,
          why: "Revenue is price times quantity. With elasticity above 1, a 1% price cut raises quantity by more " +
               "than 1%, so the quantity effect wins and revenue rises. That is why a seller facing elastic " +
               "demand should cut price, and keep cutting until demand is unit elastic." },
        { round: roundLow,
          prompt: "You raise the price of a good with INELASTIC demand. Beyond revenue, what else is true on a straight-line demand curve?",
          options: ["Demand becomes more elastic as price rises, so revenue gains shrink and eventually reverse.",
                    "Demand stays equally inelastic at every price, so you should raise the price without limit.",
                    "Demand becomes less elastic as price rises.",
                    "Elasticity is undefined above the current price."],
          answer: 0,
          why: "On a linear demand curve the slope is constant but elasticity is not: it equals slope times P/Q, " +
               "and P/Q rises as you move up the curve. So raising the price of an inelastic good helps at first, " +
               "but the good gets more elastic as you go, and revenue peaks where elasticity reaches exactly 1." },
        { round: capR,
          prompt: "This week you can make fewer units than buyers want even at the revenue-maximising price. How should that change your price?",
          options: ["Raise it until buyers want exactly your capacity — anything lower just turns away customers you cannot serve.",
                    "Ignore the limit and price for unit elasticity as usual.",
                    "Cut the price, to sell the limited stock faster.",
                    "Keep the current price, since capacity does not affect demand."],
          answer: 0,
          why: "Below that price you sell only your capacity anyway, so a lower price just gives revenue away on " +
               "the same units. Raising the price costs nothing until demand falls to exactly what you can make — " +
               "that is the new revenue-maximising price." }
      ];
    }
  });

  /* =========================================================================
     POLICY LAB  (chapter 6 — taxes, deadweight loss, the Ramsey rule)
     Two goods, seven budget years. Each year you must raise a revenue target
     with per-unit taxes on the two goods. For each good, every $1 of tax cuts
     sales by k units, so
        revenue_i = t_i (Q_i - k_i t_i)        deadweight loss_i = k_i t_i^2 / 2
     Taxing the LESS responsive good harder raises the same money with less
     deadweight loss (the Ramsey rule). The base also erodes: heavy taxation
     this year shrinks next year's sales, faster for the responsive good, which
     is the long-run-elasticity lesson.
     ========================================================================= */
  var TAX_PAIRS = [
    [["gasoline", 4, 0.6], ["restaurant meals", 16, 1.8]],
    [["cigarettes", 3, 0.5], ["concert tickets", 14, 1.6]],
    [["electricity", 3, 0.4], ["airline tickets", 17, 2.0]],
    [["insulin", 2, 0.3], ["streaming subscriptions", 15, 1.7]]
  ];
  SIMS["policy-lab"] = lossSim({
    slug: "policy-lab", chapter: 6, rounds: 7, minutes: 10, salt: 6101,
    noShock: { hit: false, label: "" },
    spec: {
      title: "Policy Lab",
      subtitle: "Seven budgets. Two taxes. One revenue target a year.",
      youAre: "You are the tax office. Each year the legislature sets a revenue target, and you " +
              "raise it with a per-unit tax on each of two goods. Taxes raise money, but they also " +
              "stop some trades that would have happened — that lost value is deadweight loss.",
      goal: "Hit each year's revenue target while destroying as little value as possible.",
      penalty: "Each year's penalty is the deadweight loss you caused, plus a heavy charge for " +
               "any shortfall against the target. Do-nothing means taxing both goods at the " +
               "same rate, set just high enough to hit the target — the obvious, \"fair-looking\" policy.",
      howScored: HOW_SCORED_LOSS,
      controls: [
        { key: "tA", label: "Tax on the first good", unit: "$/unit", min: 0, max: 12, step: 0.1, "default": 0,
          help: "Per-unit tax. The preview shows the revenue it raises, not the damage it does." },
        { key: "tB", label: "Tax on the second good", unit: "$/unit", min: 0, max: 12, step: 0.1, "default": 0,
          help: "Per-unit tax on the other good." }
      ],
      readouts: [
        { key: "R", label: "Revenue raised" },
        { key: "target", label: "Target" },
        { key: "dwl", label: "Deadweight loss" },
        { key: "QA", label: "First good's sales" }
      ],
      chart: [
        { key: "dwl", label: "Deadweight loss", color: "#b45309" },
        { key: "short", label: "Revenue shortfall", color: "#dc2626", target: 0 }
      ],
      watchFor: "Deadweight loss grows with the SQUARE of a tax, so one high tax does far more " +
                "damage than two moderate ones raising the same money. And sales do not recover " +
                "when a tax is cut — people who switched to alternatives mostly stay switched."
    },
    shocks: function (rng) {
      var pair = TAX_PAIRS[Math.floor(rng() * TAX_PAIRS.length)];
      var needs = [
        ["A normal budget year.", 1.0], ["An infrastructure bill passes.", 1.35],
        ["A recession cuts other revenue; you must make up the gap.", 1.5],
        ["A one-off surplus elsewhere lets you ease off.", 0.7],
        ["Emergency spending after a flood.", 1.45], ["A normal budget year.", 1.0],
        ["Debt service rises.", 1.2]
      ];
      shuffleInPlace(rng, needs);
      var base = 160 + Math.floor(rng() * 60);
      var out = [];
      for (var k = 0; k < 7; k++) {
        out.push({ hit: needs[k][1] !== 1.0, label: needs[k][0],
                   R: Math.round(base * needs[k][1]),
                   A: pair[0], B: pair[1] });
      }
      return out;
    },
    initState: function (rng, shocks) {
      var p = shocks[0];
      return { QA: 100, QB: 100, R: 0, target: shocks[0].R, dwl: 0, short: 0,
               nameA: p.A[0], nameB: p.B[0] };
    },
    step: function (st, d, t, sh) {
      var kA = sh.A[1], kB = sh.B[1];
      var qA = Math.max(0, st.QA - kA * d.tA), qB = Math.max(0, st.QB - kB * d.tB);
      var R = d.tA * qA + d.tB * qB;
      var dwl = 0.5 * kA * d.tA * d.tA + 0.5 * kB * d.tB * d.tB;
      var short = Math.max(0, sh.R - R);
      // long-run erosion of each base, faster for the responsive good
      var QA2 = Math.max(20, st.QA - sh.A[2] * d.tA);
      var QB2 = Math.max(20, st.QB - sh.B[2] * d.tB);
      return { QA: r1(QA2), QB: r1(QB2), R: r1(R), target: sh.R, dwl: r1(dwl),
               short: r1(short), nameA: st.nameA, nameB: st.nameB };
    },
    roundLoss: function (st) {
      return st.dwl / 10 + 40 * Math.pow(st.short / Math.max(1, st.target), 2);
    },
    naive: function (st, t, shocks) {
      var sh = shocks[t], kA = sh.A[1], kB = sh.B[1];
      var a = kA + kB, b = st.QA + st.QB, disc = b * b - 4 * a * sh.R;
      var tt = disc >= 0 ? (b - Math.sqrt(disc)) / (2 * a) : b / (2 * a);
      return { tA: tt, tB: tt };
    },
    preview: function (proj, st, d, round, sh) {
      return "These taxes raise <b>" + f1(proj.R) + "</b> against a target of <b>" + sh.R + "</b>" +
             (proj.R + 0.05 < sh.R ? " — <b>" + f1(sh.R - proj.R) + " short</b>." : " — target met.") +
             " The deadweight loss is not shown until the year ends.";
    },
    explain: function (res) {
      return standardExplain(res, "penalty") + " The Ramsey rule: to raise a given sum with the least " +
             "damage, tax each good in inverse proportion to how strongly its sales respond.";
    },
    checkpoints: function (rng, init) {
      var r = shuffleInPlace(rng, [0, 1, 2, 3, 4, 5, 6]).slice(0, 3).sort(function (a, b) { return a - b; });
      var A = init.shocks[0].A, B = init.shocks[0].B;
      return [
        { round: r[0],
          prompt: "Every $1 of tax cuts " + A[0] + " sales by " + A[1] + " units but " + B[0] + " sales by " + B[1] +
                  ". To raise a fixed sum with the least deadweight loss, how should the two taxes compare?",
          options: ["Tax " + A[0] + " more heavily — its sales barely respond, so the tax distorts less.",
                    "Tax both at the same rate, since equal treatment minimises distortion.",
                    "Tax " + B[0] + " more heavily, because its buyers can afford it.",
                    "Tax only " + B[0] + ", so that " + A[0] + " buyers are protected."],
          answer: 0,
          why: "Deadweight loss comes from trades the tax prevents. A good whose sales barely respond loses few " +
               "trades to a tax, so it raises money cheaply. The Ramsey rule follows: tax each good in inverse " +
               "proportion to its responsiveness. Whether that is FAIR is a separate question — inelastic goods " +
               "are often necessities, which is exactly the efficiency-equity tension." },
        { round: r[1],
          prompt: "You double a per-unit tax on one good. Roughly what happens to the deadweight loss on that good?",
          options: ["It roughly quadruples — deadweight loss grows with the square of the tax.",
                    "It doubles, in proportion to the tax.",
                    "It stays the same; only revenue changes.",
                    "It halves, because fewer units are sold."],
          answer: 0,
          why: "The deadweight-loss triangle has a base equal to the tax and a height equal to the trades it " +
               "prevents, and both scale with the tax. Double the tax and the area is four times as large. " +
               "That is why spreading a revenue need across several moderate taxes beats one steep one." },
        { round: r[2],
          prompt: "A heavy tax is kept on a good for several years. Why does it raise less each year even at the same rate?",
          options: ["Demand is more elastic in the long run — buyers find substitutes, so the taxed base shrinks.",
                    "Inflation erodes the per-unit tax automatically.",
                    "The tax rate falls over time by law.",
                    "Sellers absorb more of the tax each year, so revenue falls."],
          answer: 0,
          why: "In the short run buyers are stuck with their habits and equipment. Given time they switch — " +
               "a more efficient car, cooking at home — so long-run elasticity exceeds short-run elasticity. " +
               "The base erodes, revenue falls at an unchanged rate, and the deadweight loss of the tax grows." }
      ];
    }
  });

  /* =========================================================================
     TRADE ARENA  (chapter 3 — gains from trade, retaliation)
     You and a partner country start in a trade war. Each round you set your
     tariff; your partner sets theirs NEXT round mostly in response to yours.
        your loss = a t^2 - b t + c p + b^2/(4a)
     A small positive tariff helps you on its own (terms of trade), which is
     why trade wars start -- but your partner copies you, and their tariff
     costs you more than yours gains you. The winning play is to de-escalate.
     ========================================================================= */
  /* c > b is what makes this a genuine prisoner's dilemma. With c < b (the first
     build had 1.5 vs 2.0) the partner's tariff hurt less than yours helped, so
     the cooperative optimum was a small POSITIVE tariff and a mechanism check
     showed the static 2% narrowly beating free trade -- contradicting the
     checkpoint that says both countries lose when both give in. */
  var TRADE = { a: 0.5, b: 2.0, c: 2.5, follow: 0.7, start: 12 };
  SIMS["trade-arena"] = lossSim({
    slug: "trade-arena", chapter: 3, rounds: 7, minutes: 8, salt: 3101,
    noShock: { hit: false, label: "", dp: 0 },
    spec: {
      title: "Trade Arena",
      subtitle: "Seven rounds of a trade war you did not start.",
      youAre: "Your country and a trading partner are locked in a tariff war: both charge " +
              TRADE.start + "% on each other's goods. Each round you set your tariff. Your partner " +
              "sets theirs the following round, mostly by matching what you did.",
      goal: "Maximise your country's economic welfare across all seven rounds.",
      penalty: "Each round's penalty is the welfare your country loses relative to the best case, " +
               "counting both the harm your own tariff does at home and the harm your partner's " +
               "tariff does to your exporters. Do-nothing means holding your tariff at " + TRADE.start + "%.",
      howScored: HOW_SCORED_LOSS,
      controls: [
        { key: "t", label: "Your tariff", unit: "%", min: 0, max: 30, step: 0.5, "default": TRADE.start,
          help: "Your partner will respond next round. The preview shows only this round's effect." }
      ],
      readouts: [
        { key: "t", label: "Your tariff", unit: "%" },
        { key: "p", label: "Partner's tariff", unit: "%" },
        { key: "loss", label: "Welfare lost this round", target: 0, band: 1 }
      ],
      chart: [
        { key: "t", label: "Your tariff", color: "#0f3d9e" },
        { key: "p", label: "Partner's tariff", color: "#b45309" }
      ],
      watchFor: "A small tariff genuinely helps you in the round you impose it, and the preview " +
                "will show that. The preview cannot show your partner's response, which arrives " +
                "next round and costs you more."
    },
    shocks: function (rng) {
      var ev = [
        { dp: 4, label: "A hawkish government takes office in the partner country." },
        { dp: -4, label: "The partner signals it wants a deal." },
        { dp: 3, label: "A partner industry lobbies hard for protection." }
      ];
      var slots = shuffleInPlace(rng, [1, 2, 3, 4, 5, 6]).slice(0, 2);
      var out = [];
      for (var k = 0; k < 7; k++) {
        out.push({ hit: false, label: "Talks continue; no major development.", dp: 0 });
      }
      out[slots[0]] = { hit: true, label: ev[0].label, dp: ev[0].dp };
      out[slots[1]] = { hit: true, label: ev[rng() < 0.5 ? 1 : 2].label,
                        dp: 0 };
      out[slots[1]].dp = out[slots[1]].label === ev[1].label ? ev[1].dp : ev[2].dp;
      return out;
    },
    initState: function () { return { t: TRADE.start, p: TRADE.start, loss: 0 }; },
    step: function (st, d, t, sh) {
      var tt = d.t, p = st.p;
      var loss = TRADE.a * tt * tt - TRADE.b * tt + TRADE.c * p + TRADE.b * TRADE.b / (4 * TRADE.a);
      var pNext = clamp(TRADE.follow * tt + (1 - TRADE.follow) * p + sh.dp, 0, 30);
      return { t: tt, p: r1(pNext), loss: r1(loss / 10), pNow: p };
    },
    roundLoss: function (st) { return st.loss; },
    naive: { t: TRADE.start },
    preview: function (proj, st, d) {
      return "This round, against a partner tariff of <b>" + f1(st.p) + "%</b>, your country loses <b>" +
             f1(proj.loss) + "</b> in welfare. Your partner's next move is not included.";
    },
    explain: function (res) {
      return standardExplain(res, "welfare loss") + " A small tariff wins the round you impose it; " +
             "reciprocity makes it lose the game.";
    },
    checkpoints: function (rng, init) {
      var r = shuffleInPlace(rng, [0, 1, 2, 3, 4, 5, 6]).slice(0, 3).sort(function (a, b) { return a - b; });
      return [
        { round: r[0],
          prompt: "Your partner matches your tariff with a one-round lag. If you cut your tariff sharply now, what happens?",
          options: ["You lose a little this round, then gain much more as your partner's tariff comes down after you.",
                    "You lose every round, because cutting a tariff only helps foreigners.",
                    "Nothing changes: your partner's tariff is independent of yours.",
                    "You gain this round, and your partner raises its tariff in response."],
          answer: 0,
          why: "Unilateral liberalisation costs a little in the round you do it — you give up a small terms-of-" +
               "trade gain. But your partner's tariff hurts your exporters more than yours helps you, and it " +
               "follows yours down. Trading a small loss now for a large stream of gains later is the whole " +
               "logic of reciprocal trade agreements." },
        { round: r[1],
          prompt: "Cutting your tariff helps the country overall. Who inside your country is still likely to lose?",
          options: ["Workers and owners in import-competing industries, who now face cheaper foreign goods.",
                    "Consumers of the imported good, who now pay more.",
                    "Exporters, who lose access to the partner's market.",
                    "Nobody — if the country gains, everyone in it gains."],
          answer: 0,
          why: "Gains from trade are real but not evenly spread. Consumers and exporters gain; import-competing " +
               "producers lose. Because the gains exceed the losses, the winners COULD compensate the losers — " +
               "whether they actually do, through adjustment assistance, is the distributional question the " +
               "chapter is named for." },
        { round: r[2],
          prompt: "Why do trade wars start, if both countries end up worse off?",
          options: ["Each country gains from a tariff when the other holds still, so each has a reason to impose one.",
                    "Tariffs always raise national welfare, so both countries are acting rationally.",
                    "Governments do not know that tariffs reduce trade.",
                    "A trade war only happens when one country miscalculates its own tariff."],
          answer: 0,
          why: "It is a prisoner's dilemma. A small tariff helps you if your partner does nothing, so each side " +
               "is tempted. When both give in, both lose. Repeated interaction is what lets reciprocity — " +
               "matching the other side's moves — sustain low tariffs instead." }
      ];
    }
  });

  /* =========================================================================
     GDP BUILDER  (chapter 7 — nominal vs real, what counts)
     Seven quarters as the statistical office's nowcaster. Each quarter the
     data arrives in a different form and you report real GDP growth. The
     do-nothing policy is the classic error: report NOMINAL growth as if it
     were real. No preview -- the number you report IS the answer.
     ========================================================================= */
  function gdpQuarter(rng, kind) {
    var nom, defl, real, info, cpi;
    if (kind === "basic" || kind === "deflation" || kind === "cpi-trap") {
      defl = kind === "deflation" ? -(0.5 + rng() * 1.5) : (1.5 + rng() * 4);
      real = kind === "deflation" ? (0.5 + rng() * 2.5) : (-1 + rng() * 5);
      nom = ((1 + real / 100) * (1 + defl / 100) - 1) * 100;
      nom = r1(nom); defl = r1(defl);
      real = ((1 + nom / 100) / (1 + defl / 100) - 1) * 100;
      info = "Nominal GDP grew <b>" + nom.toFixed(1) + "%</b> this quarter. The GDP deflator " +
             (defl < 0 ? "<b>fell " + (-defl).toFixed(1) + "%</b>" : "rose <b>" + defl.toFixed(1) + "%</b>") + ".";
      if (kind === "cpi-trap") {
        cpi = r1(defl + 1.5 + rng() * 2);
        info = "Nominal GDP grew <b>" + nom.toFixed(1) + "%</b>. Consumer prices (CPI) rose <b>" + cpi.toFixed(1) +
               "%</b>; the GDP deflator rose <b>" + defl.toFixed(1) + "%</b>. Imported goods drove most of the CPI rise.";
      }
      return { nom: nom, real: real, info: info, kind: kind };
    }
    // "basket": two goods, base-year prices, two years of quantities
    var pA = 2 + Math.round(rng() * 6), pB = 10 + Math.round(rng() * 20);
    var qA0 = 100 + Math.round(rng() * 100), qB0 = 20 + Math.round(rng() * 30);
    /* growth kept to -5%..+12% per good so real growth always lands inside the
       slider's range: a correct answer the student cannot enter is a lost mark
       they did nothing to deserve. */
    var gA = -0.05 + rng() * 0.17, gB = -0.05 + rng() * 0.17;
    var qA1 = Math.round(qA0 * (1 + gA)), qB1 = Math.round(qB0 * (1 + gB));
    var pA1 = r2(pA * (1 + 0.02 + rng() * 0.1)), pB1 = r2(pB * (1 + 0.02 + rng() * 0.1));
    var realG = ((pA * qA1 + pB * qB1) / (pA * qA0 + pB * qB0) - 1) * 100;
    var nomG = ((pA1 * qA1 + pB1 * qB1) / (pA * qA0 + pB * qB0) - 1) * 100;
    info = "A two-good economy. Last year: <b>" + qA0 + "</b> apples at <b>$" + pA.toFixed(2) + "</b>, <b>" + qB0 +
           "</b> bikes at <b>$" + pB.toFixed(2) + "</b>. This year: <b>" + qA1 + "</b> apples at <b>$" + pA1.toFixed(2) +
           "</b>, <b>" + qB1 + "</b> bikes at <b>$" + pB1.toFixed(2) + "</b>. Last year is the base year.";
    return { nom: r2(nomG), real: realG, info: info, kind: "basket" };
  }
  SIMS["gdp-builder"] = lossSim({
    slug: "gdp-builder", chapter: 7, rounds: 7, minutes: 10, salt: 7101,
    noShock: { hit: false, label: "", nom: 0, real: 0 },
    spec: {
      title: "GDP Builder",
      subtitle: "Seven quarters as the statistical office's nowcaster.",
      youAre: "Each quarter the raw data lands on your desk in a different form. You report one " +
              "number: real GDP growth. Markets move on it, so errors are costly.",
      goal: "Report real GDP growth as accurately as you can, every quarter.",
      howScored: [
        "70% ACCURACY. Each quarter earns full credit if your estimate is within 0.05 points of true " +
          "real growth, falling in a straight line to zero at 1.5 points off. Reporting nominal growth " +
          "as if it were real — the most common mistake in the chapter — scores poorly.",
        "30% CHECKPOINTS. Three times, before you report, you are asked why the numbers behave the way " +
          "they do. Getting the arithmetic right by trial and error will not earn them."
      ],
      controls: [
        { key: "g", label: "Your real GDP growth estimate", unit: "%", min: -8, max: 16, step: 0.1, "default": 0,
          help: "Report real growth. There is no preview: the number you enter is your answer." }
      ],
      readouts: [
        { key: "err", label: "Last quarter's error", unit: "pp", target: 0, band: 0.2 },
        { key: "mae", label: "Average error so far", unit: "pp" }
      ],
      chart: [
        { key: "g", label: "Your estimate", color: "#0f3d9e" },
        { key: "truth", label: "True real growth", color: "#16a34a" }
      ],
      watchFor: "Not every price index is the right one for GDP, and a falling price level is " +
                "not an error in the data. When you get quantities and prices directly, fix prices " +
                "at the base year and let only quantities change."
    },
    shocks: function (rng) {
      var kinds = shuffleInPlace(rng, ["basic", "basic", "deflation", "cpi-trap", "basket", "basket", "basic"]);
      var out = [];
      for (var k = 0; k < 7; k++) {
        var q = gdpQuarter(rng, kinds[k]);
        out.push({ hit: true, label: "Quarter " + (k + 1) + " data is in.", info: q.info,
                   nom: q.nom, real: q.real, kind: q.kind });
      }
      return out;
    },
    initState: function () { return { g: 0, truth: 0, err: 0, mae: 0, n: 0, sumAbs: 0 }; },
    accuracy: { tol: 1.5, slack: 0.05, dev: function (st) { return st.err; } },
    step: function (st, d, t, sh) {
      var err = d.g - sh.real, n = st.n + 1, sa = st.sumAbs + Math.abs(err);
      return { g: d.g, truth: r2(sh.real), err: r2(err), mae: r2(sa / n), n: n, sumAbs: sa };
    },
    roundLoss: function (st) { return st.err * st.err; },
    naive: function (st, t, shocks) { return { g: shocks[t].nom }; },
    explain: function (res) {
      return accuracyExplain(res, function (st) { return st.err; }, 1.5, "points of real growth") +
             " Real growth is nominal growth with the price " +
             "change taken out: (1 + nominal)/(1 + deflator) − 1, or holding prices at the base year.";
    },
    checkpoints: function (rng, init) {
      var trap = -1, basket = -1, defl = -1, k;
      for (k = 0; k < 7; k++) {
        var kd = init.shocks[k].kind;
        if (kd === "cpi-trap") { trap = k; }
        if (kd === "basket" && basket < 0) { basket = k; }
        if (kd === "deflation") { defl = k; }
      }
      return [
        { round: trap,
          prompt: "You are given both the CPI and the GDP deflator. Which one converts nominal GDP to real GDP, and why?",
          options: ["The GDP deflator — it covers everything produced domestically, while the CPI includes imports and leaves out investment goods.",
                    "The CPI — it is the official measure of inflation.",
                    "Either; they always move together.",
                    "Average the two, since each has a bias."],
          answer: 0,
          why: "GDP measures domestic production, so its price index must cover the same thing. The deflator does. " +
               "The CPI tracks what consumers buy, including imports (not domestic production) and excluding " +
               "machinery and government purchases. When imported goods drive prices, the two diverge sharply." },
        { round: basket,
          prompt: "You have quantities and prices for two years. What does real GDP growth hold constant?",
          options: ["Prices, at their base-year values — so only quantities can change the total.",
                    "Quantities, at their base-year values — so only prices change the total.",
                    "Both, so that real GDP never changes.",
                    "Neither: real GDP uses this year's prices and quantities."],
          answer: 0,
          why: "Real GDP values this year's output at base-year prices. Freezing prices strips out inflation, " +
               "so any change in the total must come from producing more or less. Using this year's prices " +
               "gives nominal GDP instead, which mixes the two." },
        { round: defl,
          prompt: "The GDP deflator fell this quarter. Compared with nominal growth, real growth is:",
          options: ["Higher — the same nominal spending buys more output when prices fall.",
                    "Lower, because falling prices signal a weak economy.",
                    "Equal, because a falling deflator is a measurement error.",
                    "Undefined until prices start rising again."],
          answer: 0,
          why: "Real growth ≈ nominal growth minus the change in the deflator. Subtracting a negative number " +
               "adds to it, so with deflation real growth exceeds nominal growth. Whether deflation is healthy is " +
               "a separate question — the arithmetic is not." }
      ];
    }
  });

  /* =========================================================================
     CPI LAB  (chapter 8 — the cost of living and substitution bias)
     You set a pensioner's cost-of-living adjustment each year. The goal is to
     keep their REAL income -- what it actually buys -- where it started.
     Consumers substitute away from goods that got relatively dearer, so the
     true cost of living rises less than a fixed-basket CPI. Real income
     compounds, so under-indexing one year is still costing them next year.
       CPI          = sum p1 q0 / sum p0 q0
       true COL     = prod (p1/p0)^share0            (Cobb-Douglas)
     ========================================================================= */
  var BASKETS = [
    ["rent", "groceries", "fuel"], ["housing", "food", "transport"],
    ["rent", "medical care", "energy"], ["housing", "groceries", "public transit"]
  ];
  SIMS["cpi-lab"] = lossSim({
    slug: "cpi-lab", chapter: 8, rounds: 7, minutes: 9, salt: 8101,
    noShock: { hit: false, label: "", cpi: 0, col: 0 },
    spec: {
      title: "CPI Lab",
      subtitle: "Seven years protecting a pension from inflation.",
      youAre: "You administer a public pension. Each year you see what happened to the prices of " +
              "the three things pensioners spend on, and you set that year's cost-of-living " +
              "adjustment (COLA).",
      goal: "Keep the pension's real value — what it actually buys — at 100, where it started.",
      howScored: [
        "70% ACCURACY. Each year earns full credit if the pension's real value ends the year at " +
          "exactly 100, falling in a straight line to zero at 2 points off. Real value compounds, " +
          "so a shortfall you leave in place costs you again every following year until you fix it.",
        "30% CHECKPOINTS. Three times, you are asked why the index behaves the way it does."
      ],
      controls: [
        { key: "cola", label: "Cost-of-living adjustment", unit: "%", min: -3, max: 15, step: 0.1, "default": 0,
          help: "Applied to the pension this year. There is no preview." }
      ],
      readouts: [
        { key: "real", label: "Real pension (start = 100)", target: 100, band: 0.5 },
        { key: "nominal", label: "Nominal pension" },
        { key: "priceLevel", label: "True cost of living (start = 100)" }
      ],
      chart: [{ key: "real", label: "Real pension", color: "#16a34a", target: 100 }],
      watchFor: "The CPI prices a FIXED basket. Pensioners do not keep buying a fixed basket: when " +
                "one thing gets relatively expensive they buy less of it. And real income carries " +
                "over — if they fell behind last year, matching this year's inflation leaves them behind."
    },
    shocks: function (rng) {
      var names = BASKETS[Math.floor(rng() * BASKETS.length)];
      var shares = [0.45, 0.35, 0.20];
      var p = [100, 100, 100], out = [];
      var events = ["An energy price spike.", "A housing squeeze.", "A normal year.", "Food prices jump.",
                    "A normal year.", "Energy prices collapse.", "A normal year."];
      shuffleInPlace(rng, events);
      for (var k = 0; k < 7; k++) {
        var g = [1 + rng() * 3, 1 + rng() * 3, 1 + rng() * 3];
        /* (rounded to one decimal below, BEFORE use: the student computes from
            the one-decimal figures on screen, so those must be the figures the
            model uses, or a correct calculation scores as slightly wrong) */
        var ev = events[k];
        if (ev.indexOf("energy price spike") >= 0) { g[2] = 14 + rng() * 12; }
        if (ev.indexOf("collapse") >= 0) { g[2] = -(10 + rng() * 8); }
        if (ev.indexOf("housing") >= 0) { g[0] = 7 + rng() * 5; }
        if (ev.indexOf("Food") >= 0) { g[1] = 8 + rng() * 6; }
        g = g.map(function (x) { return r1(x); });
        var p1 = p.map(function (x, i) { return x * (1 + g[i] / 100); });
        // base quantities chosen so that base-period expenditure shares equal `shares`
        var q0 = shares.map(function (sh, i) { return sh * 100 / p[i]; });
        var cpi = (q0[0] * p1[0] + q0[1] * p1[1] + q0[2] * p1[2]) / (q0[0] * p[0] + q0[1] * p[1] + q0[2] * p[2]) - 1;
        var col = Math.pow(p1[0] / p[0], shares[0]) * Math.pow(p1[1] / p[1], shares[1]) * Math.pow(p1[2] / p[2], shares[2]) - 1;
        var info = "<b>Prices this year vs last</b> (pensioners spend 45% on " + names[0] + ", 35% on " + names[1] +
                   ", 20% on " + names[2] + "): " + names[0] + " <b>" + (g[0] >= 0 ? "+" : "") + g[0].toFixed(1) + "%</b>, " +
                   names[1] + " <b>" + (g[1] >= 0 ? "+" : "") + g[1].toFixed(1) + "%</b>, " +
                   names[2] + " <b>" + (g[2] >= 0 ? "+" : "") + g[2].toFixed(1) + "%</b>.";
        out.push({ hit: ev !== "A normal year.", label: ev, info: info,
                   cpi: cpi * 100, col: col * 100, g: g, names: names });
        p = p1;
      }
      return out;
    },
    initState: function () { return { real: 100, nominal: 100, priceLevel: 100 }; },
    accuracy: { tol: 2, slack: 0.06, dev: function (st) { return st.real - 100; } },
    step: function (st, d, t, sh) {
      var nominal = st.nominal * (1 + d.cola / 100);
      var pl = st.priceLevel * (1 + sh.col / 100);
      return { real: r2(100 * nominal / pl), nominal: r2(nominal), priceLevel: r2(pl) };
    },
    roundLoss: function (st) { return Math.pow(st.real - 100, 2); },
    naive: { cola: 0 },
    explain: function (res) {
      return accuracyExplain(res, function (st) { return st.real - 100; }, 2, "points of real value") +
             " A weighted-average of the price changes is the CPI; " +
             "the true cost-of-living change is a little lower, because people substitute away from what " +
             "got dearer. Indexing to the CPI therefore over-compensates slightly — and any shortfall " +
             "you leave carries into the next year.";
    },
    checkpoints: function (rng, init) {
      var spike = -1, k, r = [];
      for (k = 0; k < 7; k++) { if (init.shocks[k].hit && spike < 0) { spike = k; } }
      var others = shuffleInPlace(rng, [0, 1, 2, 3, 4, 5, 6].filter(function (x) { return x !== spike; }));
      r = [spike, others[0], others[1]];
      return [
        { round: r[0],
          prompt: "One item's price has jumped much more than the others. Why does a fixed-basket CPI overstate how much more it costs pensioners to live?",
          options: ["Pensioners buy less of what got relatively dearer, but the CPI keeps weighting it at last year's quantity.",
                    "The CPI ignores the item whose price rose most.",
                    "It does not overstate it; a fixed basket is exactly the cost of living.",
                    "The CPI understates it, because it uses last year's prices."],
          answer: 0,
          why: "The CPI asks what LAST year's basket costs at this year's prices. Real people substitute — less " +
               "of the item that got expensive, more of the alternatives — so they can keep the same standard " +
               "of living for less than the fixed basket would cost. That gap is substitution bias." },
        { round: r[1],
          prompt: "Last year you under-indexed, and real income fell to 98. This year's cost of living rises 3%. What COLA puts real income back at 100?",
          options: ["About 5% — the 3% inflation plus the 2% you still owe from last year.",
                    "3% — match this year's inflation.",
                    "2% — make up last year's gap only.",
                    "0% — real income will recover on its own."],
          answer: 0,
          why: "A real shortfall does not reset. Matching this year's 3% only holds real income at 98. To return " +
               "to 100 you need the 3% plus roughly the 2% gap: 1.03 × 100/98 ≈ 1.051, so about 5.1%." },
        { round: r[2],
          prompt: "Why do statisticians say the CPI is biased UPWARD as a measure of the cost of living?",
          options: ["Substitution, new goods, and unmeasured quality improvements all make the fixed basket overstate what living costs.",
                    "Because it is designed to raise pension payments.",
                    "Because it includes imports.",
                    "It is biased downward, because it leaves out housing."],
          answer: 0,
          why: "Three effects all push the same way. Substitution: people shift away from pricier goods. New goods: " +
               "a new product widens choice, lowering the cost of a given standard of living, but enters the basket " +
               "late. Quality: a better product at the same price is a real price cut the index may miss." }
      ];
    }
  });

  /* =========================================================================
     LOANABLE FUNDS LAB  (chapter 10 — saving, investment, crowding out)
     The Treasury must borrow a fixed program over seven years. Every bond it
     sells displaces private investment, and the damage depends on WHAT is
     displaced:
         damage = w * D^2 / 20
     w is high in an investment boom (firms have their best projects) and low
     in a savings glut or a slump (funds are plentiful, few good projects are
     lost). D^2 because each extra bond bids the rate up on all the rest.

     The first build charged interest cost instead. Most of that is
     unavoidable -- 56bn at roughly 3% whatever you do -- so timing moved the
     total by under 1% and good and bad play both scored about 50. Charging
     the crowding-out damage itself makes the part the student controls the
     part that is scored, and it is the chapter's actual lesson.
     ========================================================================= */
  var LF = { need: 56, r0: 3, slope: 0.25 };
  SIMS["loanable-funds-lab"] = lossSim({
    slug: "loanable-funds-lab", chapter: 10, rounds: 7, minutes: 9, salt: 10101,
    noShock: { hit: false, label: "", dw: 0, dr: 0 },
    spec: {
      title: "Loanable Funds Lab",
      subtitle: "Seven years to borrow for one program.",
      youAre: "You run the Treasury's borrowing. A public program needs " + LF.need + "bn over seven " +
              "years, all borrowed in the market for loanable funds. You choose how much to borrow " +
              "each year. Every bond you sell competes with private firms for the same pool of saving.",
      goal: "Fund the whole program while destroying as little valuable private investment as possible.",
      penalty: "Each year's penalty is the private investment your borrowing crowds out, weighted by " +
               "how valuable it was: crowding out a boom destroys far more than crowding out a slump. " +
               "Borrowing twice as much in a year does about four times the damage, because each bond " +
               "pushes the rate up on the rest. Ending over or under " + LF.need + "bn is charged heavily. " +
               "Do-nothing means borrowing an even 8bn a year.",
      howScored: HOW_SCORED_LOSS,
      controls: [
        { key: "D", label: "Borrowing this year", unit: "bn", min: 0, max: 20, step: 0.5, "default": LF.need / 7,
          help: "Every 4bn you borrow adds about 1 point to this year's interest rate." }
      ],
      readouts: [
        { key: "borrowed", label: "Borrowed so far", unit: "bn" },
        { key: "left", label: "Still to borrow", unit: "bn", target: 0 },
        { key: "r", label: "Interest rate", unit: "%" },
        { key: "damage", label: "Investment lost this year" }
      ],
      chart: [
        { key: "D", label: "Your borrowing", color: "#0f3d9e" },
        { key: "damage", label: "Investment lost", color: "#b45309" }
      ],
      watchFor: "Conditions fade over a couple of years rather than vanishing. And the total is " +
                "fixed: whatever you do not borrow now, you must borrow later, so dodging a boom " +
                "means borrowing more in some other year."
    },
    shocks: function (rng) {
      var ev = [
        { dw: -0.6, dr: -1.5, label: "A savings glut: households are saving heavily and funds are plentiful." },
        { dw: 2.0, dr: 2.0, label: "An investment boom: firms have strong projects and compete hard for funds." },
        { dw: -0.5, dr: -1.0, label: "Business investment slumps; few firms have projects worth funding." },
        { dw: 1.5, dr: 1.5, label: "Households draw down savings, and firms are expanding." }
      ];
      shuffleInPlace(rng, ev);
      var slots = shuffleInPlace(rng, [0, 1, 2, 3, 4, 5]).slice(0, 3);
      var imp = [], k;
      for (k = 0; k < 7; k++) { imp.push({ dw: 0, dr: 0, hit: false, label: "Normal credit conditions." }); }
      for (k = 0; k < 3; k++) { imp[slots[k]] = { dw: ev[k].dw, dr: ev[k].dr, hit: true, label: ev[k].label,
                                                  up: ev[k].dw > 0 }; }
      var out = decay(imp, ["dw", "dr"], 0.5, 3);
      for (k = 0; k < 7; k++) { out[k].up = imp[k].up; }
      return out;
    },
    initState: function () { return { borrowed: 0, left: LF.need, r: LF.r0, damage: 0, D: 0 }; },
    step: function (st, d, t, sh) {
      var w = Math.max(0.25, 1 + sh.dw);
      var r = LF.r0 + sh.dr + LF.slope * d.D;
      var damage = w * d.D * d.D / 20;
      return { borrowed: r1(st.borrowed + d.D), left: r1(LF.need - st.borrowed - d.D),
               r: r2(r), damage: r2(damage), D: d.D, w: r2(w) };
    },
    roundLoss: function (st) { return st.damage; },
    terminalLoss: function (st) { return 0.5 * Math.pow(st.borrowed - LF.need, 2); },
    naive: { D: LF.need / 7 },
    preview: function (proj, st, d, round, sh) {
      var extra = Math.abs(sh.dw) > 0.05
        ? " This year's conditions make crowding out " + (sh.dw > 0 ? "<b>more</b>" : "<b>less</b>") +
          " damaging than that, by an amount you are not told."
        : "";
      return "<b>In normal conditions,</b> borrowing " + f1(d.D) + "bn pushes the rate to <b>" + f1(proj.r) +
             "%</b> and destroys <b>" + f1(proj.damage) + "</b> of private investment." + extra +
             " You will have <b>" + f1(proj.left) + "bn</b> left to borrow.";
    },
    explain: function (res) {
      return standardExplain(res, "crowding-out damage") + " Borrow more when funds are plentiful and " +
             "private projects are weak, less in a boom, and still finish exactly on the total.";
    },
    checkpoints: function (rng, init) {
      var glut = -1, k;
      for (k = 0; k < 7; k++) { if (init.shocks[k].hit && init.shocks[k].dw < 0 && glut < 0) { glut = k; } }
      if (glut < 0) { glut = 1; }
      var rest = shuffleInPlace(rng, [0, 1, 2, 3, 4, 5, 6].filter(function (x) { return x !== glut; }));
      return [
        { round: rest[0],
          prompt: "You borrow more this year to fund the program. In the market for loanable funds, what happens?",
          options: ["The interest rate rises and private investment falls — your borrowing crowds it out.",
                    "The interest rate falls, because the government is a safe borrower.",
                    "Private investment rises, because government spending creates demand.",
                    "Nothing changes; government borrowing uses a separate pool of funds."],
          answer: 0,
          why: "Government borrowing reduces national saving — the supply of loanable funds left for private " +
               "use — so the equilibrium rate rises. At the higher rate firms undertake less investment. That " +
               "fall in private investment caused by a deficit is crowding out." },
        { round: glut,
          prompt: "Households are saving heavily this year. Why is this a good year to borrow MORE of the program?",
          options: ["More saving shifts the supply of loanable funds right, lowering the rate, so each bond is cheaper.",
                    "Because saving is bad for the economy, borrowing offsets it.",
                    "It is not; the total cost is the same whenever you borrow.",
                    "Because high saving raises the interest rate you earn on the program."],
          answer: 0,
          why: "A rise in saving increases the supply of loanable funds, pushing the equilibrium rate down. Since " +
               "the total program is fixed, shifting borrowing into cheap years and out of expensive ones " +
               "lowers the overall cost — and crowds out less investment, because funds are plentiful then." },
        { round: rest[1],
          prompt: "Why does borrowing 16bn in one year cost MORE than borrowing 8bn in each of two ordinary years?",
          options: ["Each extra bond pushes the rate up on all the borrowing that year, so the cost rises faster than the amount.",
                    "It does not; interest cost is proportional to the amount borrowed.",
                    "Because lenders charge a penalty for large single loans.",
                    "Because the program is paid for in advance."],
          answer: 0,
          why: "Cost is rate times amount, and the rate itself rises with the amount. Doubling the borrowing in " +
               "one year roughly doubles the rate premium too, so the cost more than doubles. Convex cost is " +
               "why smoothing beats bunching — unless conditions differ between years." }
      ];
    }
  });

  /* =========================================================================
     BANK LAB  (chapter 11 — the money multiplier)
         M = mm x MB          mm = (1 + c) / (rr + e + c)
     You hit a money-supply target with open-market operations (the monetary
     base) and the reserve requirement. Panics raise the currency ratio c and
     frightened banks hoard excess reserves e; both shrink the multiplier, which
     is how a banking panic contracts the money supply without anyone deciding to.
     Changing the reserve requirement works but is disruptive, and is charged.
     ========================================================================= */
  var BANK = { c: 0.30, e: 0.05, rr: 10, MB: 100, growth: 0.03 };
  function mmult(c, e, rrPct) { return (1 + c) / (rrPct / 100 + e + c); }
  SIMS["bank-lab"] = lossSim({
    slug: "bank-lab", chapter: 11, rounds: 7, minutes: 9, salt: 11101,
    noShock: { hit: false, label: "", dc: 0, de: 0 },
    spec: {
      title: "Bank Lab",
      subtitle: "Seven quarters steering the money supply.",
      youAre: "You run the central bank's money desk. The money supply is the monetary base times a " +
              "multiplier, and the multiplier depends on choices you do not control: how much cash " +
              "people hold, and how many spare reserves banks keep.",
      goal: "Keep the money supply on its target path, growing 3% a quarter.",
      penalty: "Each quarter's penalty is the square of your percentage miss from the target, plus a " +
               "charge for changing the reserve requirement, which disrupts banks. Do-nothing means " +
               "leaving both the base and the reserve requirement alone.",
      howScored: HOW_SCORED_LOSS,
      controls: [
        { key: "omo", label: "Open-market operation", unit: "bn", min: -40, max: 60, step: 1, "default": 0,
          help: "Buying bonds adds to the monetary base; selling removes from it. Changes are permanent." },
        { key: "rr", label: "Reserve requirement", unit: "%", min: 3, max: 25, step: 0.5, "default": BANK.rr,
          help: "Lower lets banks lend more of each deposit. Changing it is disruptive and is charged." }
      ],
      readouts: [
        { key: "M", label: "Money supply", unit: "bn" },
        { key: "target", label: "Target", unit: "bn" },
        { key: "mm", label: "Money multiplier" },
        { key: "MB", label: "Monetary base", unit: "bn" }
      ],
      chart: [
        { key: "M", label: "Money supply", color: "#0f3d9e" },
        { key: "target", label: "Target", color: "#94a3b8" }
      ],
      watchFor: "When people pull cash out of banks, or banks sit on spare reserves, the multiplier " +
                "falls and the money supply shrinks even though you did nothing. The base is the tool " +
                "you control cleanly; the reserve requirement is a blunt one."
    },
    shocks: function (rng) {
      var ev = [
        { dc: 0.15, de: 0, label: "A bank-run scare: households pull cash out of deposits." },
        { dc: 0, de: 0.08, label: "Banks grow cautious and hoard spare reserves." },
        { dc: -0.08, de: 0, label: "Confidence returns; cash flows back into banks." },
        { dc: 0.10, de: 0.05, label: "A full-blown banking panic: cash withdrawals AND hoarding." }
      ];
      shuffleInPlace(rng, ev);
      var slots = shuffleInPlace(rng, [0, 1, 2, 3, 4, 5]).slice(0, 3);
      var imp = [], k;
      for (k = 0; k < 7; k++) { imp.push({ dc: 0, de: 0, hit: false, label: "A quiet quarter for the banking system." }); }
      for (k = 0; k < 3; k++) { imp[slots[k]] = { dc: ev[k].dc, de: ev[k].de, hit: true, label: ev[k].label }; }
      // these shift the LEVEL of c and e, which then drift back slowly
      return decay(imp, ["dc", "de"], 0.6, 7);
    },
    initState: function () {
      var mm = mmult(BANK.c, BANK.e, BANK.rr);
      return { MB: BANK.MB, rr: BANK.rr, c: BANK.c, e: BANK.e, mm: r2(mm),
               M: r1(mm * BANK.MB), target: r1(mm * BANK.MB) };
    },
    step: function (st, d, t, sh) {
      var c = BANK.c + sh.dc, e = BANK.e + sh.de;
      var MB = Math.max(20, st.MB + d.omo);
      var mm = mmult(c, e, d.rr);
      var M = mm * MB;
      var target = mmult(BANK.c, BANK.e, BANK.rr) * BANK.MB * Math.pow(1 + BANK.growth, t + 1);
      return { MB: r1(MB), rr: d.rr, c: r2(c), e: r2(e), mm: r2(mm), M: r1(M), target: r1(target),
               miss: 100 * (M - target) / target, drr: d.rr - st.rr };
    },
    roundLoss: function (st) { return st.miss * st.miss / 10 + 0.8 * st.drr * st.drr; },
    naive: function (st) { return { omo: 0, rr: st.rr }; },
    preview: function (proj, st, d, round, sh) {
      var warn = sh.hit ? " This quarter's development is <b>not</b> in these figures." : "";
      return "<b>At last quarter's cash and reserve habits,</b> these settings give a money supply of <b>" +
             f1(proj.M) + "bn</b> against a target of <b>" + f1(proj.target) + "bn</b> (multiplier " +
             proj.mm.toFixed(2) + ")." + warn;
    },
    explain: function (res) {
      return standardExplain(res, "penalty") + " Panics and hoarding shrink the multiplier; the clean " +
             "offset is to add to the base with open-market purchases, leaving the reserve requirement alone.";
    },
    checkpoints: function (rng, init) {
      var run = -1, k;
      for (k = 0; k < 7; k++) { if (init.shocks[k].hit && init.shocks[k].dc > 0.05 && run < 0) { run = k; } }
      if (run < 0) { run = 2; }
      var rest = shuffleInPlace(rng, [0, 1, 2, 3, 4, 5, 6].filter(function (x) { return x !== run; }));
      return [
        { round: run,
          prompt: "Households start pulling cash out of their bank deposits. If you do nothing, what happens to the money supply?",
          options: ["It falls — cash held outside banks cannot be lent and re-deposited, so the multiplier shrinks.",
                    "It is unchanged, because cash is part of the money supply either way.",
                    "It rises, because more cash is circulating.",
                    "It rises, because banks lend more to replace the lost deposits."],
          answer: 0,
          why: "A dollar held as a deposit supports several dollars of money through repeated lending and " +
               "re-depositing. A dollar pulled out as cash supports only itself. A rise in the currency ratio " +
               "lowers the multiplier, and the money supply contracts with no decision by the central bank — " +
               "the mechanism behind the collapse of money in the early 1930s." },
        { round: rest[0],
          prompt: "Required reserves are 10%, and banks hold no spare reserves and people hold no cash. What is the multiplier?",
          options: ["10 — one divided by the reserve ratio.",
                    "0.1, the reserve ratio itself.",
                    "1.1, one plus the reserve ratio.",
                    "90, since banks lend 90% of each deposit."],
          answer: 0,
          why: "With no cash leakage and no excess reserves, each deposit supports lending of 90%, which is " +
               "re-deposited and 90% of it lent again. The series sums to 1/rr = 1/0.10 = 10. Real multipliers " +
               "are far smaller, because cash and spare reserves leak out at every round." },
        { round: rest[1],
          prompt: "Both open-market operations and the reserve requirement can offset a fall in the multiplier. Why do central banks prefer open-market operations?",
          options: ["They are precise and reversible; changing the reserve requirement jolts every bank's balance sheet at once.",
                    "Only open-market operations affect the money supply.",
                    "Changing the reserve requirement is illegal.",
                    "Open-market operations do not change the monetary base."],
          answer: 0,
          why: "An open-market purchase can be sized to the dollar and undone next week. A change in the reserve " +
               "requirement forces every bank to restructure its reserves simultaneously, which is disruptive " +
               "and hard to fine-tune — so it is used rarely, if at all." }
      ];
    }
  });

  /* =========================================================================
     INFLATION LAB  (chapter 12 — money growth, the inflation tax, hyperinflation)
     The government must raise revenue by printing money (seigniorage):
         revenue = money growth x real money balances
         real balances = 100 * exp(-4 * expected inflation)     (Cagan demand)
         inflation     = money growth - 2  (+ velocity shocks)
     People hold less money when they expect inflation, so printing more
     eventually raises LESS revenue -- the inflation-tax Laffer curve -- and a
     government that keeps chasing a revenue target drives expectations up
     until it is on the wrong side of the peak. That spiral is hyperinflation.
     ========================================================================= */
  var INF = { kappa: 4, g: 2, theta: 0.5, base: 4.5, mult: [1, 1, 1, 1, 2.6, 2.3, 1.8] };
  SIMS["inflation-lab"] = lossSim({
    slug: "inflation-lab", chapter: 12, rounds: 7, minutes: 9, salt: 12101,
    noShock: { hit: false, label: "", v: 0 },
    spec: {
      title: "Inflation Lab",
      subtitle: "Seven years financing a government with the printing press.",
      youAre: "The government cannot borrow and will not tax enough, so it asks you, the central " +
              "bank, to finance part of its budget by creating money. Each year you set the growth " +
              "rate of the money supply. New money buys the government real resources — but only " +
              "as much as people are willing to hold.",
      goal: "Raise as much of the revenue the government needs as you can without letting inflation run away. In a war year you will not cover it all — decide how much to print.",
      penalty: "Each year's penalty is (inflation − 2)² ÷ 10, plus 20 × (share of the revenue need " +
               "left unmet)². Covering all but a tenth of the need costs 0.2; missing half of it costs 5. " +
               "Do-nothing means holding money growth at 4% every year.",
      howScored: HOW_SCORED_LOSS,
      controls: [
        { key: "mu", label: "Money growth", unit: "%", min: 0, max: 60, step: 0.5, "default": 4,
          help: "Inflation is roughly money growth minus 2%. Revenue is money growth times the real money people hold." }
      ],
      readouts: [
        { key: "pi", label: "Inflation", unit: "%", target: 2, band: 1 },
        { key: "rev", label: "Revenue raised" },
        { key: "need", label: "Revenue needed" },
        { key: "m", label: "Real money held (start 100)" }
      ],
      chart: [
        { key: "pi", label: "Inflation", color: "#b45309", target: 2 },
        { key: "m", label: "Real money held", color: "#0f3d9e" }
      ],
      watchFor: "People decide how much money to hold based on the inflation they EXPECT, and they " +
                "expect roughly what they recently got. Print hard for a year or two and they start " +
                "holding less money — so the same money growth raises less revenue than it did."
    },
    shocks: function (rng) {
      var base = INF.base + rng() * 1.0;
      var needs = INF.mult.slice();
      shuffleInPlace(rng, needs);
      var out = [];
      for (var k = 0; k < 7; k++) {
        var need = r2(base * needs[k]);
        var lbl = needs[k] >= 2 ? "War spending: the government's revenue need more than doubles."
                : (needs[k] > 1.2 ? "A costly emergency program raises the revenue need."
                : "An ordinary year's revenue need.");
        out.push({ hit: needs[k] > 1.2, label: lbl, need: need, v: 0,
                   info: "The government needs <b>" + need.toFixed(2) + "</b> in seigniorage this year." });
      }
      return out;
    },
    initState: function () { return { pi: 2, piE: 2, m: 100, rev: 0, need: 0 }; },
    step: function (st, d, t, sh) {
      var m = 100 * Math.exp(-INF.kappa * st.piE / 100);
      var pi = d.mu - INF.g + sh.v;
      var rev = d.mu / 100 * m;
      return { pi: r2(pi), piE: r2(st.piE + INF.theta * (pi - st.piE)), m: r1(m),
               rev: r2(rev), need: sh.need, short: Math.max(0, sh.need - rev) };
    },
    roundLoss: function (st) {
      return Math.pow(st.pi - 2, 2) / 10 + 20 * Math.pow(st.short / Math.max(0.1, st.need), 2);
    },
    naive: { mu: 4 },
    preview: function (proj, st, d, round, sh) {
      return "At " + f1(d.mu) + "% money growth, inflation runs about <b>" + f1(proj.pi) + "%</b> and you raise <b>" +
             proj.rev.toFixed(2) + "</b> against a need of <b>" + sh.need.toFixed(2) + "</b>, with people holding real " +
             "money of <b>" + f1(proj.m) + "</b>. Next year they will hold less if inflation stays high.";
    },
    explain: function (res) {
      return standardExplain(res, "penalty") + " Revenue is money growth times the real money people " +
             "hold, and they hold less when they expect inflation. Past a point, printing faster raises less.";
    },
    checkpoints: function (rng, init) {
      var war = -1, k;
      for (k = 0; k < 7; k++) { if (init.shocks[k].hit && war < 0) { war = k; } }
      var rest = shuffleInPlace(rng, [0, 1, 2, 3, 4, 5, 6].filter(function (x) { return x !== war; }));
      return [
        { round: war,
          prompt: "The government's revenue need doubles. Why can't you simply double money growth every year until it is met?",
          options: ["Higher inflation makes people hold less money, so each extra point of money growth raises less — and past a peak, less in total.",
                    "Doubling money growth doubles revenue exactly, so you can.",
                    "Printing money raises no revenue at all.",
                    "The law caps money growth at the inflation rate."],
          answer: 0,
          why: "Seigniorage is a tax on holding money: revenue = money growth × real balances. Raise money growth " +
               "and inflation rises, people economise on cash, and the tax base shrinks. Revenue first rises, then " +
               "peaks, then falls — a Laffer curve for the inflation tax." },
        { round: rest[0],
          prompt: "In the quantity equation MV = PY, with velocity and real output steady, what determines the inflation rate in the long run?",
          options: ["The growth rate of the money supply.",
                    "The level of the money supply.",
                    "The interest rate set by the central bank.",
                    "The government's budget deficit alone."],
          answer: 0,
          why: "With V and Y growing at steady rates, the growth of P must match the growth of M less real growth. " +
               "That is the quantity theory's central claim: sustained inflation is the result of sustained money " +
               "growth. Deficits cause inflation when — as here — they are financed by printing money." },
        { round: rest[1],
          prompt: "What turns high inflation into HYPERinflation?",
          options: ["A government keeps printing to hit a revenue target as money demand collapses, so it must print ever faster.",
                    "A single large increase in the money supply.",
                    "Rapid growth in real output.",
                    "A fall in the velocity of money."],
          answer: 0,
          why: "As expected inflation rises, people hold less money, so a fixed revenue need requires faster money " +
               "growth, which raises inflation and expectations further. The spiral feeds itself until the " +
               "currency is abandoned — the pattern of Weimar Germany, Zimbabwe and Venezuela." }
      ];
    }
  });

  /* =========================================================================
     FX ARENA  (chapter 13 — capital flows, reserves, and a fixed exchange rate)
     You defend a currency peg for seven quarters. Speculators move money out
     when they fear devaluation. You can raise interest rates to pay them to
     stay, or spend foreign reserves to buy your own currency.
         outflow  = max(0, pressure - 2 x rate premium)
         reserves = reserves - outflow
     Rate premiums cost output (a squared cost); reserves are free but finite.
     Run reserves below zero and the peg breaks: a large one-off crisis cost
     and a smaller cost every quarter after.
     ========================================================================= */
  var FX = { R0: 34, k: 2, c: 0.3, crisis: 40, after: 3 };
  SIMS["fx-arena"] = lossSim({
    slug: "fx-arena", chapter: 13, rounds: 7, minutes: 9, salt: 13101,
    noShock: { hit: false, label: "", P: 0 },
    spec: {
      title: "FX Arena",
      subtitle: "Seven quarters defending a currency peg.",
      youAre: "Your country fixes its exchange rate to the dollar. When investors fear a devaluation " +
              "they move money out, and to hold the peg you must either pay them to stay — a higher " +
              "interest rate — or buy your own currency with your foreign reserves.",
      goal: "Hold the peg for all seven quarters at the lowest cost to the economy.",
      penalty: "A rate premium slows the economy, charged at 0.3 × premium² each quarter. Reserves are " +
               "free to spend but you start with " + FX.R0 + " and cannot get more. If they run out the " +
               "peg breaks: a crisis costing " + FX.crisis + " at once and " + FX.after + " every quarter " +
               "after. Do-nothing means no rate premium at all.",
      howScored: HOW_SCORED_LOSS,
      controls: [
        { key: "i", label: "Interest-rate premium", unit: "pts", min: 0, max: 15, step: 0.25, "default": 0,
          help: "Each point of premium keeps about 2 of outflow in the country." }
      ],
      readouts: [
        { key: "Rv", label: "Reserves left", target: 0 },
        { key: "outflow", label: "Outflow this quarter" },
        { key: "y", label: "Output cost of rates" },
        { key: "pegged", label: "Peg holding (1 = yes)" }
      ],
      chart: [
        { key: "Rv", label: "Reserves", color: "#0f3d9e" },
        { key: "i", label: "Rate premium", color: "#b45309" }
      ],
      watchFor: "Reserves are a buffer, and a buffer is for using: spending them on mild pressure is " +
                "cheaper than raising rates. But pressure builds, and a quarter you spend reserves " +
                "freely is a quarter you cannot spend them later. The peg breaks the moment they run out."
    },
    shocks: function (rng) {
      var pats = [
        [0, 6, 10, 16, 8, 4, 0], [4, 8, 0, 12, 18, 10, 2], [8, 12, 16, 6, 0, 10, 4], [0, 10, 18, 10, 6, 12, 0]
      ];
      var p = pats[Math.floor(rng() * pats.length)].map(function (x) { return Math.max(0, r1(x * (0.85 + rng() * 0.3))); });
      var out = [];
      for (var k = 0; k < 7; k++) {
        var lbl = p[k] < 2 ? "Markets are calm."
                : p[k] < 9 ? "Moderate pressure: some investors hedge against devaluation."
                : p[k] < 14 ? "Heavy pressure: rumours of devaluation spread."
                : "A speculative attack: hedge funds bet openly against the peg.";
        out.push({ hit: p[k] >= 2, label: lbl, P: p[k],
                   size: p[k] < 2 ? "calm" : (p[k] < 9 ? "moderate" : (p[k] < 14 ? "heavy" : "attack")) });
      }
      return out;
    },
    initState: function () { return { Rv: FX.R0, outflow: 0, y: 0, pegged: 1, i: 0 }; },
    step: function (st, d, t, sh) {
      if (!st.pegged) {
        return { Rv: st.Rv, outflow: 0, y: r2(FX.c * d.i * d.i), pegged: 0, i: d.i, broke: 0 };
      }
      var outflow = Math.max(0, sh.P - FX.k * d.i);
      var Rv = st.Rv - outflow;
      var broke = Rv < 0 ? 1 : 0;
      return { Rv: r1(Math.max(0, Rv)), outflow: r1(outflow), y: r2(FX.c * d.i * d.i),
               pegged: broke ? 0 : 1, i: d.i, broke: broke };
    },
    roundLoss: function (st) {
      return st.y + (st.broke ? FX.crisis : 0) + (!st.pegged && !st.broke ? FX.after : 0);
    },
    naive: { i: 0 },
    preview: function (proj, st, d, round, sh) {
      if (!st.pegged) { return "The peg has broken. Rate premiums now only cost output."; }
      return "Against <b>" + sh.size + "</b> pressure this quarter, a " + f1(d.i) + "-point premium keeps about <b>" +
             f1(FX.k * d.i) + "</b> of outflow at home and costs <b>" + f1(proj.y) + "</b> in output. You have <b>" +
             f1(st.Rv) + "</b> in reserves. The exact size of the outflow is not shown.";
    },
    explain: function (res) {
      return standardExplain(res, "cost") + " The cheap defence spends reserves on mild pressure and " +
             "raises rates only when reserves would otherwise run out.";
    },
    checkpoints: function (rng, init) {
      var atk = -1, k;
      for (k = 0; k < 7; k++) { if (init.shocks[k].size === "attack" || init.shocks[k].size === "heavy") { atk = k; break; } }
      if (atk < 0) { atk = 3; }
      var rest = shuffleInPlace(rng, [0, 1, 2, 3, 4, 5, 6].filter(function (x) { return x !== atk; }));
      return [
        { round: atk,
          prompt: "Heavy pressure is building. Why does raising the interest rate slow the outflow?",
          options: ["A higher return on your currency compensates investors for the risk of devaluation, so fewer leave.",
                    "Higher rates make it illegal to move money abroad.",
                    "Higher rates raise the value of foreign reserves.",
                    "It does not; interest rates do not affect capital flows."],
          answer: 0,
          why: "With free capital movement, investors compare the return at home with the return abroad plus any " +
               "expected change in the exchange rate. If they fear devaluation, only a higher domestic rate keeps " +
               "the comparison even. That is interest parity, and it is why pegs are defended with rate rises." },
        { round: rest[0],
          prompt: "Why can't a country keep a fixed exchange rate, free capital movement AND an independent monetary policy all at once?",
          options: ["With free capital flows, holding the peg forces interest rates to follow the anchor's, leaving no room to set them for the home economy.",
                    "It can; the three are independent.",
                    "Fixed exchange rates are illegal under free capital movement.",
                    "Because foreign reserves always run out eventually."],
          answer: 0,
          why: "This is the impossible trinity. Free capital flows make investors arbitrage any interest gap, so a " +
               "peg can only survive if domestic rates track the anchor country's. Pick any two of the three; the " +
               "third is the price. Every rate premium you set in this arena is monetary policy spent on the peg." },
        { round: rest[1],
          prompt: "The pressure this quarter is only moderate and you have plenty of reserves. What is usually the cheaper defence?",
          options: ["Spend reserves and leave rates alone — reserves cost the economy nothing while they last.",
                    "Raise rates sharply to signal resolve, keeping reserves untouched.",
                    "Abandon the peg now to avoid a crisis later.",
                    "Do nothing; moderate outflows never threaten a peg."],
          answer: 0,
          why: "Reserves exist to absorb pressure. Rate premiums slow the economy, and their cost rises with the " +
               "square of the premium, so using them for mild pressure wastes output. The skill is judging how much " +
               "reserve to keep in hand for the heavy quarters still to come." }
      ];
    }
  });

  /* =========================================================================
     LABOR MARKET LAB  (chapter 14 — unemployment and the natural rate)
     Unemployment moves with job separations s and job finding f:
         u' = u + s(1 - u) - f u        natural rate u* = s / (s + f)
     Unemployment insurance protects the jobless from hardship but lowers the
     job-finding rate (people search longer); job-search assistance raises it
     at a cost. Recessions raise separations, and that is when insurance
     matters most. The best policy is interior and changes with the cycle.
     ========================================================================= */
  var LAB = { s0: 0.02, f0: 0.40, uiDrag: 0.25, aid: 0.03, ustar: 4.0, H: 60, aidCost: 0.4, slumpF: 0.2, slumpDrag: 0.6, gapW: 0.5 };
  SIMS["labor-market-lab"] = lossSim({
    slug: "labor-market-lab", chapter: 14, rounds: 7, minutes: 9, salt: 14101,
    noShock: { hit: false, label: "", ds: 0 },
    spec: {
      title: "Labor Market Lab",
      subtitle: "Seven quarters of labor-market policy through a business cycle.",
      youAre: "You set two labor-market policies each quarter: how generous unemployment insurance " +
              "is, and how much to spend helping the unemployed find work. A recession arrives at " +
              "some point, raising the rate at which people lose their jobs.",
      goal: "Keep unemployment low AND protect the people who are unemployed, at a sensible cost.",
      penalty: "Each quarter's penalty adds three things: ½ × (unemployment − 4)² when unemployment " +
               "is above 4%; the hardship of the unemployed, which grows with how many are jobless and " +
               "with the square of the wage share insurance does NOT replace; and the cost of job-search " +
               "programs, 0.4 × spending². Unemployment left above 4% at the end is charged once more. " +
               "Do-nothing means leaving insurance at 40% of lost wages and spending nothing on job search.",
      howScored: HOW_SCORED_LOSS,
      controls: [
        { key: "b", label: "Unemployment insurance", unit: "% of wage", min: 0, max: 80, step: 1, "default": 40,
          help: "Protects the jobless, but people search a little longer when it is generous." },
        { key: "a", label: "Job-search assistance", unit: "bn", min: 0, max: 5, step: 0.25, "default": 0,
          help: "Helps the unemployed find work faster. Each extra billion costs more than the last." }
      ],
      readouts: [
        { key: "u", label: "Unemployment", unit: "%", target: 4, band: 0.75 },
        { key: "ustar", label: "Natural rate at these settings", unit: "%" },
        { key: "f", label: "Job-finding rate", unit: "%" },
        { key: "s", label: "Job-loss rate", unit: "%" }
      ],
      chart: [
        { key: "u", label: "Unemployment", color: "#b45309", target: 4 },
        { key: "ustar", label: "Natural rate", color: "#94a3b8" }
      ],
      watchFor: "Unemployment moves toward its natural rate gradually, not instantly, so policy works " +
                "with a lag. And the right generosity of insurance is not fixed: when job losses spike, " +
                "far more people need it."
    },
    shocks: function (rng) {
      var start = 1 + Math.floor(rng() * 3);
      var depth = 0.015 + rng() * 0.01;
      var imp = [], k;
      for (k = 0; k < 7; k++) { imp.push({ ds: 0, hit: false, label: "A normal quarter for the labor market." }); }
      imp[start] = { ds: depth, hit: true, label: "A recession begins: layoffs surge across industries." };
      var out = decay(imp, ["ds"], 0.7, 5);
      for (k = 0; k < 7; k++) { if (k > start && out[k].ds > 0.003 && !imp[k].hit) { out[k].label = "The recession continues; layoffs remain elevated."; } }
      return out;
    },
    initState: function () {
      var f = LAB.f0 * (1 - LAB.uiDrag * 0.40);
      var u = LAB.s0 / (LAB.s0 + f);
      return { u: r2(100 * u), ustar: r2(100 * u), f: r2(100 * f), s: r2(100 * LAB.s0) };
    },
    step: function (st, d, t, sh) {
      var s = LAB.s0 + sh.ds;
      // In a slump vacancies dry up: fewer offers arrive (f0 falls) and there is
      // less to be gained from searching harder, so insurance slows job-finding
      // LESS. That is why the right generosity rises with layoffs.
      var slump = Math.min(1, sh.ds / 0.025);
      var f = LAB.f0 * (1 - LAB.slumpF * slump) * (1 - LAB.uiDrag * (1 - LAB.slumpDrag * slump) * d.b / 100) + LAB.aid * d.a;
      var u = st.u / 100;
      var u2 = u + s * (1 - u) - f * u;
      return { u: r2(100 * u2), ustar: r2(100 * s / (s + f)), f: r2(100 * f), s: r2(100 * s),
               hard: LAB.H * u2 * Math.pow(1 - d.b / 100, 2), cost: LAB.aidCost * d.a * d.a };
    },
    roundLoss: function (st) {
      return LAB.gapW * Math.pow(Math.max(0, st.u - LAB.ustar), 2) + st.hard + st.cost;
    },
    // Unemployment you leave behind does not vanish when the game ends: the
    // last quarter's excess is charged once more, so
    // maxing out insurance in the final round is not a free exit.
    terminalLoss: function (st) {
      return LAB.gapW * Math.pow(Math.max(0, st.u - LAB.ustar), 2);
    },
    naive: { b: 40, a: 0 },
    preview: function (proj, st, d, round, sh) {
      var w = sh.ds > 0.003 ? " The recession's extra layoffs are <b>not</b> in these figures." : "";
      return "Without a recession, these settings move unemployment to <b>" + f1(proj.u) + "%</b> this quarter, " +
             "heading toward a natural rate of <b>" + f1(proj.ustar) + "%</b>." + w;
    },
    explain: function (res) {
      return standardExplain(res, "penalty") + " Insurance protects the jobless but lengthens search; " +
             "job-search help shortens it. The balance should shift toward more insurance when layoffs surge.";
    },
    checkpoints: function (rng, init) {
      var rec = -1, k;
      for (k = 0; k < 7; k++) { if (init.shocks[k].hit && rec < 0) { rec = k; } }
      var rest = shuffleInPlace(rng, [0, 1, 2, 3, 4, 5, 6].filter(function (x) { return x !== rec; }));
      return [
        { round: rec,
          prompt: "A recession raises the job-loss rate. With other things equal, what happens to the natural rate of unemployment, s/(s+f)?",
          options: ["It rises — more separations mean more people unemployed at any job-finding rate.",
                    "It falls, because more people are looking for work.",
                    "It is unchanged; the natural rate never moves.",
                    "It rises only if insurance is cut."],
          answer: 0,
          why: "In steady state, inflows s(1−u) equal outflows f·u, which gives u* = s/(s+f). A higher s " +
               "raises the numerator more than the denominator, so the rate at which unemployment settles rises. " +
               "The economy moves toward it gradually, which is why unemployment keeps climbing after layoffs peak." },
        { round: rest[0],
          prompt: "Why does more generous unemployment insurance tend to raise measured unemployment?",
          options: ["It lowers the cost of searching longer, so the unemployed take more time to accept an offer.",
                    "It causes employers to lay off more workers.",
                    "It is paid only to people who are not looking for work.",
                    "It does not; insurance has no effect on unemployment."],
          answer: 0,
          why: "Insurance reduces the hardship of being unemployed, so people can afford to wait for a better " +
               "match. That lowers the job-finding rate f and raises u* = s/(s+f). The better matches are a real " +
               "benefit too — the trade-off is between protection and a longer search, not a free lunch either way." },
        { round: rest[1],
          prompt: "Which kind of unemployment does job-search assistance mainly target?",
          options: ["Frictional — the time it takes workers and jobs to find each other.",
                    "Cyclical — unemployment caused by a recession.",
                    "Unemployment caused by minimum-wage laws.",
                    "Discouraged workers who have left the labor force."],
          answer: 0,
          why: "Frictional unemployment comes from the time it takes to match workers to vacancies. Job-search " +
               "help — listings, counselling, training for available jobs — speeds up matching, raising f and " +
               "lowering the natural rate. It does little for cyclical unemployment, which needs demand to recover." }
      ];
    }
  });

  /* =========================================================================
     IS-LM LAB  (chapter 16 — the IS-LM model)
     Output gap y and interest rate r solve IS and LM together each quarter:
         IS:  y = eIS + mu*G - b(r - r*)
         LM:  m + eLM = k*y - h(r - r*)          (m = money supply shift)
     so  y = (eIS + mu*G + (b/h)(m + eLM)) / (1 + b*k/h)
         r = r* + (k*y - m - eLM) / h
     Two targets (output AND the interest rate, which drives investment) and
     two instruments. An IS shock is best met with fiscal policy, an LM
     (money-demand) shock with the money supply. Using the wrong tool fixes
     output but drags the interest rate away -- crowding out, or its mirror.
     ========================================================================= */
  var ISLM = { b: 1, h: 1, k: 0.5, mu: 1.5, rStar: 3, gCost: 0.15, mCost: 0.05, decay: 0.6 };
  function islmSolve(G, m, eIS, eLM) {
    var y = (eIS + ISLM.mu * G + (ISLM.b / ISLM.h) * (m + eLM)) / (1 + ISLM.b * ISLM.k / ISLM.h);
    var r = ISLM.rStar + (ISLM.k * y - m - eLM) / ISLM.h;
    return { y: y, r: r };
  }
  SIMS["islm-lab"] = lossSim({
    slug: "islm-lab", chapter: 16, rounds: 7, minutes: 10, salt: 16101,
    noShock: { hit: false, label: "", eIS: 0, eLM: 0 },
    spec: {
      title: "IS-LM Lab",
      subtitle: "Seven quarters steering output and interest rates with two tools.",
      youAre: "You coordinate fiscal and monetary policy. Each quarter you choose government " +
              "spending and the money supply. Output and the interest rate are set where the IS " +
              "curve (goods market) meets the LM curve (money market).",
      goal: "Keep the output gap near 0 AND the interest rate near its normal 3%, so investment " +
            "is neither crowded out nor overheated.",
      penalty: "Each quarter's penalty is (output gap)² + ½(interest rate − 3)², plus a small charge " +
               "for using each tool (0.15 × spending² and 0.05 × money²). Do-nothing means leaving " +
               "both at 0.",
      howScored: HOW_SCORED_LOSS,
      controls: [
        { key: "G", label: "Government spending", unit: "change", min: -4, max: 4, step: 0.25, "default": 0,
          help: "Shifts the IS curve. More spending raises output and the interest rate." },
        { key: "m", label: "Money supply", unit: "change", min: -4, max: 4, step: 0.25, "default": 0,
          help: "Shifts the LM curve. More money raises output and lowers the interest rate." }
      ],
      readouts: [
        { key: "y", label: "Output gap", unit: "%", target: 0, band: 0.5 },
        { key: "r", label: "Interest rate", unit: "%", target: 3, band: 0.5 }
      ],
      chart: [
        { key: "y", label: "Output gap", color: "#0f3d9e", target: 0 },
        { key: "r", label: "Interest rate", color: "#b45309", target: 3 }
      ],
      watchFor: "Ask which curve the shock moved. A goods-market shock (spending, confidence, exports) " +
                "shifts IS; a money-market shock (people wanting to hold more or less money) shifts LM. " +
                "Shocks fade over the following quarters, so the right dose shrinks as they do."
    },
    shocks: function (rng) {
      var slots = shuffleInPlace(rng, [0, 1, 2, 3, 4, 5]);
      var imp = [], k;
      for (k = 0; k < 7; k++) { imp.push({ hit: false, label: "No new shock this quarter.", eIS: 0, eLM: 0 }); }
      var third = rng() < 0.5 ? "IS+" : "LM-";
      var kinds = shuffleInPlace(rng, ["IS-", "LM+", third]);
      for (k = 0; k < 3; k++) {
        var s = imp[slots[k]], sz = r1(1.5 + rng() * 1.5);
        s.hit = true; s.kind = kinds[k];
        if (kinds[k] === "IS-") { s.eIS = -sz; s.label = "Business confidence collapses: firms cancel investment plans."; }
        if (kinds[k] === "IS+") { s.eIS = sz; s.label = "An export boom: foreign orders surge."; }
        if (kinds[k] === "LM+") { s.eLM = -sz; s.label = "A flight to cash: households and banks want to hold far more money."; }
        if (kinds[k] === "LM-") { s.eLM = sz; s.label = "Payments innovation: people need to hold much less money."; }
      }
      var out = decay(imp, ["eIS", "eLM"], ISLM.decay, 4);
      for (k = 0; k < 7; k++) { out[k].kind = imp[k].kind; }
      return out;
    },
    initState: function () { return { y: 0, r: ISLM.rStar }; },
    step: function (st, d, t, sh) {
      var o = islmSolve(d.G, d.m, sh.eIS, sh.eLM);
      return { y: r2(o.y), r: r2(o.r), G: d.G, m: d.m };
    },
    roundLoss: function (st, d) {
      return st.y * st.y + 0.5 * Math.pow(st.r - ISLM.rStar, 2) + ISLM.gCost * d.G * d.G + ISLM.mCost * d.m * d.m;
    },
    naive: { G: 0, m: 0 },
    preview: function (proj, st, d, round, sh) {
      var w = "";
      if (sh.kind === "IS-") { w = " This quarter's collapse in confidence will shift IS <b>left</b>, by an amount you are not told."; }
      else if (sh.kind === "IS+") { w = " This quarter's export boom will shift IS <b>right</b>, by an amount you are not told."; }
      else if (sh.kind === "LM+") { w = " This quarter's flight to cash will shift LM <b>left</b> (up), by an amount you are not told."; }
      else if (sh.kind === "LM-") { w = " Lower money demand will shift LM <b>right</b> (down), by an amount you are not told."; }
      else if (Math.abs(sh.eIS) > 0.05 || Math.abs(sh.eLM) > 0.05) { w = " An earlier shock is still fading and is not in these figures."; }
      return "<b>Shocks aside,</b> these settings give an output gap of <b>" + f1(proj.y) + "%</b> and an interest " +
             "rate of <b>" + f1(proj.r) + "%</b>." + w;
    },
    explain: function (res) {
      return standardExplain(res, "penalty") + " Match the tool to the curve that moved: fiscal policy for " +
             "IS shocks, the money supply for LM shocks. The wrong tool can fix output only by moving the interest rate.";
    },
    checkpoints: function (rng, init) {
      var isr = -1, lmr = -1, k;
      for (k = 0; k < 7; k++) {
        var kd = init.shocks[k].kind;
        if (kd && kd.charAt(0) === "I" && isr < 0) { isr = k; }
        if (kd && kd.charAt(0) === "L" && lmr < 0) { lmr = k; }
      }
      var rest = shuffleInPlace(rng, [0, 1, 2, 3, 4, 5, 6].filter(function (x) { return x !== isr && x !== lmr; }));
      return [
        { round: isr,
          prompt: "A goods-market shock is shifting the IS curve. Which response restores output WITHOUT moving the interest rate?",
          options: ["Change government spending to shift IS back, leaving the money supply alone.",
                    "Change the money supply to shift LM, leaving spending alone.",
                    "Change both in the same direction by equal amounts.",
                    "Nothing can: output and the interest rate always move together."],
          answer: 0,
          why: "The shock moved IS, so moving IS back returns the economy to the original intersection — same output, " +
               "same interest rate. Offsetting it with money instead slides along the shifted IS curve: output recovers " +
               "only because the interest rate moves away from normal." },
        { round: lmr,
          prompt: "People suddenly want to hold much more money. With the money supply unchanged, what happens?",
          options: ["The interest rate rises and output falls — LM shifts up.",
                    "The interest rate falls and output rises.",
                    "Output falls but the interest rate is unchanged.",
                    "Nothing; money demand does not affect the real economy."],
          answer: 0,
          why: "Higher money demand at the same supply means people sell bonds to get cash, pushing bond prices down " +
               "and interest rates up. Higher rates cut investment, so output falls. The clean fix is to supply the extra " +
               "money people want, which shifts LM back." },
        { round: rest[0],
          prompt: "Why does a rise in government spending raise output by LESS in IS-LM than the simple Keynesian multiplier predicts?",
          options: ["Higher output raises money demand and the interest rate, which crowds out private investment.",
                    "Government spending is always wasted.",
                    "Taxes rise automatically by the same amount.",
                    "The money supply falls whenever spending rises."],
          answer: 0,
          why: "The Keynesian cross holds the interest rate fixed. In IS-LM, higher income raises the demand for money; " +
               "with the money supply unchanged, the interest rate must rise, and that reduces investment. The size of " +
               "this crowding out depends on how steep LM is." }
      ];
    }
  });

  /* =========================================================================
     POLICY MIX ARENA  (chapter 17 — monetary policy, the Taylor principle and
     the zero lower bound)
         y  = rho*y_prev - a(i - piE - r*) + 0.6*q + d
         pi = piE + b*y + s
         piE' = piE + theta(pi - piE)
     You set the NOMINAL rate i (floored at 0) and quantitative easing q. Raise
     i less than one-for-one with inflation and the real rate FALLS, feeding the
     fire. A deep slump pushes the rate you need below zero -- there only QE,
     which carries a balance-sheet cost, can add stimulus.
     ========================================================================= */
  var PMX = { a: 0.6, b: 0.4, theta: 0.5, anchor: 0.3, rStar: 1, rho: 0.5, qEff: 0.6, qCost: 0.25, decay: 0.55 };
  SIMS["policy-mix-arena"] = lossSim({
    slug: "policy-mix-arena", chapter: 17, rounds: 8, minutes: 11, salt: 17101,
    noShock: { hit: false, label: "", dem: 0, sup: 0 },
    spec: {
      title: "Policy Mix Arena",
      subtitle: "Eight quarters at the central bank, with a floor under your main tool.",
      youAre: "You run the central bank. Each quarter you set the nominal policy rate and decide how " +
              "many bonds to buy (quantitative easing). The rate cannot go below zero.",
      goal: "Keep inflation near 2% and the output gap near 0.",
      penalty: "Each quarter's penalty is (inflation − 2)² + (output gap)², plus 0.25 × QE² for the " +
               "risk you take on the balance sheet. Do-nothing means keeping the REAL rate at its 1% " +
               "neutral level — nominal rate = 1 + expected inflation, moved one-for-one — with no QE.",
      howScored: HOW_SCORED_LOSS,
      controls: [
        { key: "i", label: "Nominal policy rate", unit: "%", min: 0, max: 10, step: 0.25, "default": 3,
          help: "What matters for demand is the REAL rate: this minus expected inflation. The neutral real rate is 1%." },
        { key: "q", label: "Quantitative easing", unit: "bond purchases", min: 0, max: 4, step: 0.25, "default": 0,
          help: "Buys long bonds to push down long rates. Adds demand even at a zero policy rate, at a cost." }
      ],
      readouts: [
        { key: "pi", label: "Inflation", unit: "%", target: 2, band: 0.5 },
        { key: "y", label: "Output gap", unit: "%", target: 0, band: 0.5 },
        { key: "real", label: "Real rate you set", unit: "%" },
        { key: "piE", label: "Expected inflation", unit: "%" }
      ],
      chart: [
        { key: "pi", label: "Inflation", color: "#b45309", target: 2 },
        { key: "y", label: "Output gap", color: "#0f3d9e", target: 0 },
        { key: "i", label: "Policy rate", color: "#64748b" }
      ],
      watchFor: "Watch the real rate, not the nominal one. When expected inflation rises, holding the " +
                "nominal rate still is an EASING. And when a slump is deep enough, even a zero rate is " +
                "not low enough."
    },
    shocks: function (rng) {
      var imp = [], k;
      for (k = 0; k < 8; k++) { imp.push({ hit: false, label: "No new shock this quarter.", dem: 0, sup: 0 }); }
      var slump = 1 + Math.floor(rng() * 2);                 // quarter 2 or 3
      var infl = 5 + Math.floor(rng() * 2);                  // quarter 6 or 7
      imp[slump] = { hit: true, kind: "slump", dem: -r1(4.5 + rng() * 1.0), sup: 0,
                     label: "A financial crisis: credit freezes and demand collapses." };
      if (rng() < 0.5) {
        imp[infl] = { hit: true, kind: "boom", dem: r1(2.0 + rng() * 1.0), sup: 0,
                      label: "A spending boom: households release pent-up savings." };
      } else {
        imp[infl] = { hit: true, kind: "cost", dem: 0, sup: r1(1.5 + rng() * 1.0),
                      label: "A cost-push shock: energy prices jump." };
      }
      var out = decay(imp, ["dem", "sup"], PMX.decay, 4);
      for (k = 0; k < 8; k++) { out[k].kind = imp[k].kind; }
      return out;
    },
    initState: function () { return { pi: 2, piE: 2, y: 0, i: 3, real: 1 }; },
    step: function (st, d, t, sh) {
      var real = d.i - st.piE;
      var y = PMX.rho * st.y - PMX.a * (real - PMX.rStar) + PMX.qEff * d.q + sh.dem;
      var pi = st.piE + PMX.b * y + sh.sup;
      // expectations adapt toward what you deliver, but are partly anchored on
      // the 2% target -- the payoff from years of credibility
      var adapt = st.piE + PMX.theta * (pi - st.piE);
      var piE = 2 + (1 - PMX.anchor) * (adapt - 2);
      return { pi: r2(pi), piE: r2(piE), y: r2(y), i: d.i, q: d.q, real: r2(real) };
    },
    roundLoss: function (st, d) { return Math.pow(st.pi - 2, 2) + st.y * st.y + PMX.qCost * d.q * d.q; },
    // Do-nothing = keep the REAL rate at neutral: nominal = 1 + expected
    // inflation, one-for-one, no QE. A frozen nominal rate would be a far worse
    // baseline (it spirals), which would make every half-sensible run look superb.
    naive: function (st) { return { i: Math.max(0, Math.round((PMX.rStar + st.piE) * 4) / 4), q: 0 }; },
    preview: function (proj, st, d, round, sh) {
      var w = "";
      if (sh.kind === "slump") { w = " The crisis will push output far <b>below</b> this, by an amount you are not told."; }
      else if (sh.kind === "boom") { w = " The boom will push output <b>above</b> this, by an amount you are not told."; }
      else if (sh.kind === "cost") { w = " The energy shock will push inflation <b>above</b> this, by an amount you are not told."; }
      else if (Math.abs(sh.dem) > 0.05 || Math.abs(sh.sup) > 0.05) { w = " An earlier shock is still fading and is not in these figures."; }
      return "<b>Shocks aside,</b> a " + f1(d.i) + "% rate is a real rate of <b>" + f1(proj.real) + "%</b>, projecting " +
             "inflation <b>" + f1(proj.pi) + "%</b> and an output gap of <b>" + f1(proj.y) + "%</b>." + w;
    },
    explain: function (res) {
      return standardExplain(res, "penalty") + " Move the nominal rate more than one-for-one with expected " +
             "inflation, and when the rate hits zero, QE is the remaining lever.";
    },
    checkpoints: function (rng, init) {
      var sl = -1, inf = -1, k;
      for (k = 0; k < 8; k++) {
        if (init.shocks[k].kind === "slump") { sl = k; }
        if (init.shocks[k].kind === "boom" || init.shocks[k].kind === "cost") { inf = k; }
      }
      var mid = sl + 2;
      return [
        { round: sl,
          prompt: "Offsetting this crisis would take a real rate well below −2%. With expected inflation at 2%, why can't you get there with the policy rate alone?",
          options: ["The nominal rate cannot go below zero, so the lowest real rate available is about −2%.",
                    "Cutting rates has no effect during a financial crisis.",
                    "A −4% real rate would require a nominal rate of +2%, which you can already set.",
                    "Real rates are set by the government, not the central bank."],
          answer: 0,
          why: "Real rate = nominal rate − expected inflation. At the zero lower bound the lowest real rate is minus " +
               "expected inflation, here −2%. Any stimulus needed beyond that must come from other tools, such as " +
               "quantitative easing or fiscal policy." },
        { round: mid,
          prompt: "Expected inflation has fallen after the crisis. With the nominal rate stuck at zero, what happens to the real rate?",
          options: ["It rises, tightening policy just when you want it loose.",
                    "It falls, easing policy automatically.",
                    "It stays the same, since the nominal rate did not move.",
                    "It becomes negative infinity."],
          answer: 0,
          why: "With i fixed at 0, the real rate is −π^e. Falling expectations raise the real rate, which depresses " +
               "demand further and lowers inflation again. This is the deflation trap that makes the zero lower " +
               "bound dangerous, and why central banks try to keep expectations anchored." },
        { round: inf,
          prompt: "Inflation is rising. By the Taylor principle, how should the nominal rate respond to a 1-point rise in inflation?",
          options: ["By MORE than 1 point, so the real rate rises and cools demand.",
                    "By exactly 1 point, leaving the real rate unchanged.",
                    "By less than 1 point, to avoid a recession.",
                    "It should be cut, to offset the fall in real incomes."],
          answer: 0,
          why: "Only a rising real rate restrains demand. Moving the nominal rate less than one-for-one lets the real " +
               "rate fall as inflation rises, which adds fuel to the fire — the mistake widely blamed for the 1970s." }
      ];
    }
  });

  /* =========================================================================
     FISCAL POLICY LAB  (chapter 18 — deficits, debt and the multiplier)
         y  = rho*y_prev - mult*(pb - pb_prev) + e        (austerity drags output;
                                                          mult is larger in a slump)
         g  = 3 + (y - y_prev)                             nominal growth, %
         r  = 3 + rs + 0.1*max(0, d - 100)                 rate: global + risk premium
         d' = d*(1 + (r - g)/100) - pb                     debt, % of GDP
     You set the primary balance. Bringing debt down means running surpluses,
     but cutting in a recession is self-defeating: the output loss lowers growth
     and can RAISE the debt ratio.
     ========================================================================= */
  var FIS = { d0: 95, target: 85, rho: 0.5, multN: 0.5, multR: 1.4, prem: 0.1, dW: 0.06 };
  SIMS["fiscal-lab"] = lossSim({
    slug: "fiscal-lab", chapter: 18, rounds: 8, minutes: 10, salt: 18101,
    noShock: { hit: false, label: "", e: 0, rs: 0 },
    spec: {
      title: "Fiscal Policy Lab",
      subtitle: "Eight years bringing public debt down without wrecking the economy.",
      youAre: "You are the finance minister. Debt is " + FIS.d0 + "% of GDP and you have promised to bring it " +
              "down toward " + FIS.target + "%. Each year you set the primary balance: taxes minus spending " +
              "before interest. A positive primary balance is a surplus that pays debt down.",
      goal: "End the eight years with debt near " + FIS.target + "% of GDP while keeping the output gap near 0.",
      penalty: "Each year's penalty is the output gap squared. At the end, debt above " + FIS.target + "% is " +
               "charged 0.06 × (debt − " + FIS.target + ")² — being below target costs nothing. Do-nothing " +
               "means a primary balance of 0 every year.",
      howScored: HOW_SCORED_LOSS,
      controls: [
        { key: "pb", label: "Primary balance", unit: "% of GDP", min: -4, max: 5, step: 0.25, "default": 0,
          help: "Raising it (tightening) slows the economy this year. The drag is much larger in a recession." }
      ],
      readouts: [
        { key: "d", label: "Debt", unit: "% GDP", target: FIS.target, band: 2 },
        { key: "y", label: "Output gap", unit: "%", target: 0, band: 0.5 },
        { key: "r", label: "Interest rate on debt", unit: "%" },
        { key: "g", label: "Nominal growth", unit: "%" }
      ],
      chart: [
        { key: "d", label: "Debt (% GDP)", color: "#0f3d9e", target: FIS.target },
        { key: "y", label: "Output gap", color: "#b45309", target: 0 }
      ],
      watchFor: "Debt falls when you run a surplus AND when growth beats the interest rate. Tightening " +
                "hurts growth this year, and in a recession it hurts it so much that the debt ratio can " +
                "rise. Above 100% of GDP, lenders start charging a risk premium."
    },
    shocks: function (rng) {
      var imp = [], k;
      for (k = 0; k < 8; k++) { imp.push({ hit: false, label: "A normal year.", e: 0, rs: 0 }); }
      var rec = 1 + Math.floor(rng() * 3);                              // year 2-4
      imp[rec] = { hit: true, kind: "recession", e: -r1(2.5 + rng() * 1.0), rs: 0,
                   label: "A global recession hits: exports and investment fall." };
      var later = shuffleInPlace(rng, [0, 1, 2, 3, 4, 5, 6, 7].filter(function (x) { return x > rec + 1; }));
      var kinds = shuffleInPlace(rng, ["boom", "rates"]);
      imp[later[0]] = kinds[0] === "boom"
        ? { hit: true, kind: "boom", e: r1(1.5 + rng() * 1.0), rs: 0, label: "A strong recovery: business investment surges." }
        : { hit: true, kind: "rates", e: 0, rs: r1(1.0 + rng() * 1.0), label: "Global interest rates jump: your borrowing costs rise." };
      var out = decay(imp, ["e", "rs"], 0.5, 3);
      for (k = 0; k < 8; k++) {
        out[k].kind = imp[k].kind;
        // the multiplier stays high while output is depressed by the recession
        out[k].slump = out[k].e < -0.6 ? 1 : 0;
      }
      return out;
    },
    initState: function () { return { d: FIS.d0, y: 0, pb: 0, r: 3, g: 3 }; },
    step: function (st, d, t, sh) {
      var mult = sh.slump ? FIS.multR : FIS.multN;
      var y = FIS.rho * st.y - mult * (d.pb - st.pb) + sh.e;
      var g = 3 + (y - st.y);
      var r = 3 + sh.rs + FIS.prem * Math.max(0, st.d - 100);
      var dn = st.d * (1 + (r - g) / 100) - d.pb;
      return { d: r2(dn), y: r2(y), pb: d.pb, r: r2(r), g: r2(g) };
    },
    roundLoss: function (st) { return st.y * st.y; },
    terminalLoss: function (st) { return FIS.dW * Math.pow(Math.max(0, st.d - FIS.target), 2); },
    naive: { pb: 0 },
    preview: function (proj, st, d, round, sh) {
      var w = "";
      if (sh.kind === "recession") { w = " The recession will push output well <b>below</b> this — and while it lasts, tightening costs far more output."; }
      else if (sh.kind === "boom") { w = " The recovery will push output <b>above</b> this."; }
      else if (sh.kind === "rates") { w = " Higher global rates will raise your interest bill above this."; }
      else if (sh.slump) { w = " The recession is still depressing output; tightening now remains expensive."; }
      return "<b>Shocks aside,</b> a primary balance of " + f1(d.pb) + "% takes debt to <b>" + f1(proj.d) +
             "%</b> of GDP with an output gap of <b>" + f1(proj.y) + "%</b>." + w;
    },
    explain: function (res) {
      return standardExplain(res, "penalty") + " Consolidate in good years, not in the recession: " +
             "the multiplier is highest in a slump, so cutting then costs the most output and saves the least debt.";
    },
    checkpoints: function (rng, init) {
      var rec = -1, k, oth = -1;
      for (k = 0; k < 8; k++) {
        if (init.shocks[k].kind === "recession") { rec = k; }
        if (init.shocks[k].kind === "boom" || init.shocks[k].kind === "rates") { oth = k; }
      }
      var early = rec === 0 ? 1 : 0;
      if (early === oth) { early = [0, 1, 2, 3, 4, 5, 6, 7].filter(function (x) { return x !== rec && x !== oth; })[0]; }
      return [
        { round: rec,
          prompt: "A recession is starting. Why can sharp austerity now fail to lower the debt-to-GDP ratio?",
          options: ["The multiplier is large in a slump, so cuts shrink GDP — the denominator — almost as fast as they cut debt.",
                    "Austerity always raises the interest rate on government debt.",
                    "Primary surpluses do not reduce debt.",
                    "Debt ratios cannot change during a recession."],
          answer: 0,
          why: "The debt ratio is debt divided by GDP. In a slump, with spare capacity and little offset from monetary " +
               "policy, each point of tightening removes more than a point of output. Slower nominal growth raises the " +
               "ratio even as the numerator falls. That is why the timing of consolidation matters." },
        { round: early,
          prompt: "The interest rate on debt equals nominal growth and the primary balance is zero. What happens to the debt ratio?",
          options: ["It stays roughly constant.",
                    "It rises by the interest rate each year.",
                    "It falls to zero over time.",
                    "It doubles every decade."],
          answer: 0,
          why: "The debt ratio moves by (r − g) × debt − primary balance. With r = g and no primary surplus, interest " +
               "adds to debt exactly as fast as growth adds to GDP, so the ratio holds still. Reducing it requires a " +
               "surplus or growth above the interest rate." },
        { round: oth,
          prompt: "Debt is high and the interest rate on it rises above growth. Without a primary surplus, what happens?",
          options: ["Debt grows faster than GDP, so the ratio climbs — and a risk premium can make it climb faster.",
                    "Nothing, as long as the deficit is unchanged.",
                    "The ratio falls because higher rates attract savers.",
                    "Inflation automatically brings the ratio down."],
          answer: 0,
          why: "With r above g, interest compounds debt faster than the economy grows, so a zero primary balance lets " +
               "the ratio rise every year. If lenders then demand a premium on high debt, r rises further — the " +
               "feedback loop behind sovereign debt crises." }
      ];
    }
  });

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
    var outcome;
    if (typeof sim.outcome === "function") {
      outcome = sim.outcome(seed, decisions);          // already counts missed rounds as 0
    } else if (typeof sim.scoreFrom === "function") {
      outcome = sim.scoreFrom(got, bm);
    } else {
      var span = bm.best - bm.worst;
      outcome = span > 0 ? (got - bm.worst) / span : 0;
    }
    outcome = clamp(outcome, 0, 1);

    /* An abandoned run must not score as though it finished. */
    if (!complete && sim.rounds > 0 && typeof sim.outcome !== "function") {
      outcome = outcome * (roundsPlayed / sim.rounds);
    }

    var cps = shuffledCheckpoints(sim, seed);
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
      return SIMS[slug] ? shuffledCheckpoints(SIMS[slug], seed) : [];
    },
    preview: function (slug, state, decision, round, shocks) {
      var sm = SIMS[slug];
      return (sm && sm.preview) ? sm.preview(state, decision, round, shocks) : null;
    },
    explain: function (slug, res) {
      var sm = SIMS[slug];
      return (sm && sm.explain) ? sm.explain(res) : null;
    },
    benchmarks: function (slug, seed) {
      return SIMS[slug] ? SIMS[slug].benchmarks(seed) : null;
    },
    evaluate: function (slug, seed, decisions) {
      return SIMS[slug] ? SIMS[slug].evaluate(seed, decisions) : null;
    },
    score: score,
    _scale: function (slug) { return SIMS[slug] && SIMS[slug].scale ? SIMS[slug].scale : "midpoint"; },
    _naive: function (slug, state, round, shocks) {
      var sm = SIMS[slug];
      return (sm && sm.naiveDecision) ? sm.naiveDecision(state, round, shocks) : null;
    },
    ROUNDS: function (slug) { return SIMS[slug] ? SIMS[slug].rounds : 0; }
  };

  global.MASims = API;
  if (typeof module !== "undefined" && module.exports) { module.exports = API; }
})(typeof globalThis !== "undefined" ? globalThis : this);
