/* ============================================================================
   ma-arena.js  —  shared arena engine for Applied Macroeconomics.

   WHY THIS EXISTS
   The micro suite has twelve arenas, each a standalone HTML file with its own
   copy of the shell, scoring, attempt tracking and backend calls. Twelve copies
   of the same logic means a fix has to land twelve times, and in practice they
   drift. Here every arena is a small configuration file over one engine.

   An arena is:
     MAArena.start({
       slug:    'gdp-builder',            // must match ARENA_SLUGS in the portal
       title:   'GDP Builder',
       chapter: 7,
       intro:   '<p>...</p>',             // framing shown before the first case
       cases:   { fromGenerators: [...], count: 8 }   // or an array of custom cases
     });

   GRADING IS SERVER-SIDE. The engine posts {arena_slug, case_index,
   generator_id, seed, submitted} to the ma-grade edge function, which
   regenerates the question from the seed and grades it. The answer key is never
   in the page. When the backend is unreachable the engine falls back to local
   grading and marks the session UNGRADED — it never silently records a score
   that did not reach the server, which is the failure that lost quiz
   submissions in the micro build.

   ATTEMPTS. Only the first MAX_GRADED_ATTEMPTS attempts count toward the grade,
   matching ARENA_MAX_ATTEMPTS in the portal. Later attempts are practice and are
   labelled as such, so a student can keep drilling without fear.

   Safari-safe plain JS: var, function declarations, string concatenation.
   ============================================================================ */
(function (global) {
  "use strict";

  var MAX_GRADED_ATTEMPTS = 2;
  var doc = global.document;

  function el(tag, attrs, html) {
    var e = doc.createElement(tag);
    if (attrs) { for (var k in attrs) { if (attrs.hasOwnProperty(k)) { e.setAttribute(k, attrs[k]); } } }
    if (html != null) { e.innerHTML = html; }
    return e;
  }
  function esc(s) {
    if (s === null || s === undefined) { return ""; }
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function rand32() { return Math.floor(Math.random() * 0xFFFFFFFF) >>> 0; }
  function $(id) { return doc.getElementById(id); }

  /* ---- styles: one injected sheet, so an arena file carries no CSS ------- */
  function injectStyles() {
    if ($("ma-arena-styles")) { return; }
    var css =
      ":root{--ar-navy:#0f3d9e;--ar-gold:#b87408;--ar-green:#166534;--ar-red:#991b1b;" +
      "--ar-ink:#0f172a;--ar-muted:#64748b;--ar-line:#e2e8f0;--ar-bg:#f8fafc}" +
      ".ar-wrap{font:15px/1.6 Inter,system-ui,-apple-system,sans-serif;color:var(--ar-ink);" +
      "background:var(--ar-bg);min-height:100vh;margin:0;padding:24px 18px}" +
      ".ar-inner{max-width:820px;margin:0 auto}" +
      ".ar-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;margin-bottom:6px}" +
      ".ar-title{font-size:24px;font-weight:800;margin:0;color:var(--ar-navy)}" +
      ".ar-sub{color:var(--ar-muted);font-size:13.5px;margin:2px 0 0}" +
      ".ar-back{font-size:13px;color:var(--ar-navy);text-decoration:none;white-space:nowrap}" +
      ".ar-card{background:#fff;border:1px solid var(--ar-line);border-radius:12px;padding:20px;margin:14px 0}" +
      ".ar-meta{display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:11.5px;margin-bottom:10px}" +
      ".ar-b{padding:2px 9px;border-radius:10px;font-weight:600}" +
      ".ar-b.hard{background:#991b1b18;color:var(--ar-red)}.ar-b.med{background:#b8740818;color:var(--ar-gold)}" +
      ".ar-b.easy{background:#16653418;color:var(--ar-green)}.ar-b.dim{background:#0f3d9e14;color:var(--ar-navy)}" +
      ".ar-prompt{font-size:15.5px;line-height:1.65;margin-bottom:14px}" +
      ".ar-diagram{max-width:440px;margin:0 auto 16px}" +
      ".ar-opt{display:flex;align-items:flex-start;gap:10px;padding:11px 13px;border:1px solid #cbd5e1;" +
      "border-radius:8px;margin-bottom:8px;cursor:pointer;background:#fff;transition:border-color .12s}" +
      ".ar-opt:hover{border-color:var(--ar-navy)}" +
      ".ar-opt.sel{border-color:var(--ar-navy);background:#eff4ff}" +
      ".ar-opt.right{border-color:var(--ar-green);background:#f0fdf4}" +
      ".ar-opt.wrong{border-color:var(--ar-red);background:#fef2f2}" +
      ".ar-opt input{margin-top:3px;flex-shrink:0}" +
      ".ar-num{width:200px;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:15px}" +
      ".ar-btn{padding:10px 20px;border:none;border-radius:8px;background:var(--ar-navy);color:#fff;" +
      "font-weight:600;font-size:14.5px;cursor:pointer}" +
      ".ar-btn[disabled]{opacity:.5;cursor:not-allowed}" +
      ".ar-btn.ghost{background:#fff;color:var(--ar-navy);border:1.5px solid var(--ar-navy)}" +
      ".ar-fb{margin-top:14px;padding:12px 14px;border-radius:8px;font-size:14px;line-height:1.6}" +
      ".ar-fb.ok{background:#f0fdf4;border-left:3px solid var(--ar-green)}" +
      ".ar-fb.no{background:#fef2f2;border-left:3px solid var(--ar-red)}" +
      ".ar-fb.warn{background:#fffbeb;border-left:3px solid var(--ar-gold)}" +
      ".ar-bar{height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;margin:10px 0 0}" +
      ".ar-bar>div{height:100%;background:var(--ar-navy);transition:width .25s}" +
      ".ar-score{font-variant-numeric:tabular-nums;font-weight:700;color:var(--ar-navy)}" +
      ".ar-final{text-align:center;padding:30px 20px}" +
      ".ar-final h2{font-size:26px;margin:0 0 8px;color:var(--ar-navy)}" +
      ".ar-pct{font-size:46px;font-weight:800;color:var(--ar-navy);line-height:1;margin:8px 0}" +
      ".ar-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:18px}" +
      "@media(max-width:520px){.ar-wrap{padding:16px 12px}.ar-title{font-size:20px}}";
    var st = doc.createElement("style");
    st.id = "ma-arena-styles";
    st.textContent = css;
    doc.head.appendChild(st);
  }

  /* ---- case construction ------------------------------------------------ */
  /* fromGenerators draws real bank items; every case carries the generator id
     and seed so the SERVER can regenerate and grade it. */
  function buildCases(cfg) {
    if (Object.prototype.toString.call(cfg.cases) === "[object Array]") {
      return cfg.cases.map(function (c, i) {
        c._custom = true; c._idx = i; return c;
      });
    }
    var spec = cfg.cases || {};
    var ids = spec.fromGenerators || [];
    var G = global.MAGenerators;
    if (!ids.length && G && cfg.chapter) { ids = G.bankFor(cfg.chapter); }
    if (!G) { return []; }

    /* An arena gives immediate per-case feedback, so it can only use items that
       grade deterministically. A written item would be recorded as pending and
       the student would be told nothing — worse than not asking it. Those belong
       in quizzes and exams, where an instructor reviews them. */
    var meta = {};
    G.list().forEach(function (m) { meta[m.id] = m; });
    var usable = ids.filter(function (id) {
      var m = meta[id];
      return m && m.kind !== "short";
    });

    /* Arenas are the "apply it" surface, so weight the draw toward the harder
       and the graphical items rather than sampling the chapter uniformly.
       Sampling is still random within a tier, so two students rarely see the
       same set and a re-run is not a repeat. */
    function tier(id) {
      var m = meta[id];
      var t = 0;
      if (m.difficulty === "hard") { t += 2; }
      else if (m.difficulty === "med") { t += 1; }
      if (m.render === "graphical") { t += 2; }
      return t;
    }
    var buckets = {};
    usable.forEach(function (id) {
      var t = tier(id);
      if (!buckets[t]) { buckets[t] = []; }
      buckets[t].push(id);
    });
    var tiers = Object.keys(buckets).map(Number).sort(function (a, b) { return b - a; });
    var ordered = [];
    tiers.forEach(function (t) {
      var b = buckets[t].slice();
      for (var i = b.length - 1; i > 0; i--) {      /* shuffle within the tier */
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = b[i]; b[i] = b[j]; b[j] = tmp;
      }
      ordered = ordered.concat(b);
    });

    var want = spec.count || Math.min(8, ordered.length);
    var out = [];
    for (var k = 0; k < ordered.length && out.length < want; k++) {
      var seed = rand32();
      var q = G.generate(ordered[k], seed);
      if (!q || q.kind === "short") { continue; }
      q._genId = ordered[k]; q._seed = seed; q._idx = out.length;
      out.push(q);
    }
    return out;
  }

  /* ---- server grading --------------------------------------------------- */
  function gradeOnServer(slug, c, submitted, attemptNo, cb) {
    var B = global.MABackend;
    if (!B || !B.isOnline || !B.isOnline() || !B.gradeCase) {
      cb({ offline: true });
      return;
    }
    B.gradeCase(slug, c._idx, submitted, function (res) {
      cb(res || { offline: true });
    }, attemptNo, {
      prompt_text: c.prompt,
      labels: c.options || null,
      generator_id: c._genId || null,
      seed: c._seed || null
    });
  }

  /* Local grading is a FALLBACK for preview only. A session graded this way is
     marked ungraded so nothing is recorded as if it had reached the server. */
  function gradeLocally(c, submitted) {
    if (c._custom) {
      if (typeof c.check === "function") {
        return { correct: !!c.check(submitted), expected: c.expected };
      }
      return { correct: String(submitted) === String(c.answer), expected: c.answer };
    }
    if (!global.MAGenerators) { return { correct: false }; }
    var r = global.MAGenerators.grade(c._genId, c._seed, submitted);
    return { correct: !!r.correct, expected: r.expected, needsAI: r.needsAI };
  }

  /* ---- the engine ------------------------------------------------------- */
  function start(cfg) {
    injectStyles();
    var slug = cfg.slug;
    var host = cfg.mount ? cfg.mount : (function () {
      var d = el("div", { "class": "ar-wrap" });
      doc.body.appendChild(d);
      return d;
    })();

    var S = {
      cases: [], idx: 0, correct: 0, answered: 0,
      attemptNo: 1, graded: true, serverFailures: 0, started: false
    };

    function shell(inner) {
      host.innerHTML =
        '<div class="ar-inner">' +
          '<div class="ar-head">' +
            "<div><h1 class=\"ar-title\">" + esc(cfg.title) + "</h1>" +
            '<p class="ar-sub">Chapter ' + esc(cfg.chapter) + " &middot; " +
              esc(cfg.tagline || "Applied Macroeconomics arena") + "</p></div>" +
            '<a class="ar-back" href="index.html">&larr; Back to the portal</a>' +
          "</div>" + inner +
        "</div>";
    }

    function intro() {
      var attemptNote = S.attemptNo > MAX_GRADED_ATTEMPTS
        ? '<div class="ar-fb warn" style="margin-top:14px;">You have used your ' +
          MAX_GRADED_ATTEMPTS + " graded attempts. You can keep practising here as much as you " +
          "like &mdash; this run will <b>not</b> change your grade.</div>"
        : '<div class="ar-fb ok" style="margin-top:14px;">This is graded attempt <b>' +
          S.attemptNo + " of " + MAX_GRADED_ATTEMPTS +
          "</b>. Your arena grade uses the average of your graded attempts.</div>";
      shell('<div class="ar-card">' + (cfg.intro || "") + attemptNote +
        '<div style="margin-top:18px;"><button class="ar-btn" id="arStart">Begin</button></div></div>');
      $("arStart").addEventListener("click", function () {
        S.cases = buildCases(cfg);
        if (!S.cases.length) {
          shell('<div class="ar-card"><p>This arena has no cases configured yet.</p></div>');
          return;
        }
        S.started = true;
        draw();
      });
    }

    function draw() {
      var c = S.cases[S.idx];
      if (!c) { finish(); return; }
      var pct = Math.round(100 * S.idx / S.cases.length);
      var diag = "";
      if (c.diagramSpec && global.MADiagrams) {
        diag = '<div class="ar-diagram">' + global.MADiagrams.render(c.diagramSpec) + "</div>";
      }
      var input = "";
      if (c.kind === "mc" || (c._custom && c.options)) {
        var opts = c.options || [];
        for (var i = 0; i < opts.length; i++) {
          input += '<label class="ar-opt" data-opt="' + i + '">' +
            '<input type="radio" name="arOpt" value="' + i + '">' +
            "<span>" + esc(opts[i]) + "</span></label>";
        }
      } else if (c.kind === "numeric" || (c._custom && c.numeric)) {
        input = '<input class="ar-num" id="arNum" type="text" inputmode="decimal" ' +
          'placeholder="Your answer" autocomplete="off">';
      } else {
        input = '<textarea id="arText" rows="5" style="width:100%;padding:10px 12px;' +
          'border:1px solid #cbd5e1;border-radius:8px;font:inherit;box-sizing:border-box;" ' +
          'placeholder="Write your answer…"></textarea>';
      }

      var diffCls = c.difficulty === "hard" ? "hard" : (c.difficulty === "easy" ? "easy" : "med");
      shell(
        '<div class="ar-card">' +
          '<div class="ar-meta">' +
            '<span class="ar-b dim">Case ' + (S.idx + 1) + " of " + S.cases.length + "</span>" +
            (c.difficulty ? '<span class="ar-b ' + diffCls + '">' + esc(c.difficulty) + "</span>" : "") +
            (c.points ? '<span class="ar-b dim">' + c.points + " pt" + (c.points > 1 ? "s" : "") + "</span>" : "") +
            '<span style="margin-left:auto;" class="ar-score">Score ' + S.correct + " / " + S.answered + "</span>" +
          "</div>" +
          '<div class="ar-bar"><div style="width:' + pct + '%"></div></div>' +
          '<div class="ar-prompt" style="margin-top:14px;">' + esc(c.prompt) + "</div>" +
          diag + input +
          '<div style="margin-top:14px;"><button class="ar-btn" id="arSubmit">Submit answer</button></div>' +
          '<div id="arFb"></div>' +
        "</div>");

      var labels = host.querySelectorAll(".ar-opt");
      Array.prototype.forEach.call(labels, function (lab) {
        lab.addEventListener("click", function () {
          Array.prototype.forEach.call(labels, function (l) { l.className = "ar-opt"; });
          lab.className = "ar-opt sel";
          var r = lab.querySelector("input"); if (r) { r.checked = true; }
        });
      });
      $("arSubmit").addEventListener("click", function () { submit(c); });
    }

    function readAnswer(c) {
      if (c.kind === "mc" || (c._custom && c.options)) {
        var sel = host.querySelector('input[name="arOpt"]:checked');
        return sel ? sel.value : null;
      }
      if (c.kind === "numeric" || (c._custom && c.numeric)) {
        var n = $("arNum");
        return (n && n.value.trim() !== "") ? n.value.trim() : null;
      }
      var t = $("arText");
      return (t && t.value.trim() !== "") ? t.value.trim() : null;
    }

    function submit(c) {
      var v = readAnswer(c);
      var fb = $("arFb");
      if (v === null) {
        fb.innerHTML = '<div class="ar-fb no">Choose or enter an answer first.</div>';
        return;
      }
      var btn = $("arSubmit");
      btn.disabled = true; btn.textContent = "Checking…";

      gradeOnServer(slug, c, v, S.attemptNo, function (res) {
        var offline = !!(res && (res.offline || res.needEnroll));
        var local = gradeLocally(c, v);
        var correct = offline ? local.correct : !!res.correct;
        if (offline) { S.serverFailures++; S.graded = false; }

        S.answered++;
        if (correct) { S.correct++; }
        showFeedback(c, v, correct, offline, local, res);
      });
    }

    function showFeedback(c, submitted, correct, offline, local, res) {
      var fb = $("arFb");
      var labels = host.querySelectorAll(".ar-opt");
      if (labels.length) {
        var keyed = (res && typeof res.correctCode !== "undefined" && res.correctCode !== null)
          ? res.correctCode : local.expected;
        Array.prototype.forEach.call(labels, function (lab, i) {
          var isPicked = String(i) === String(submitted);
          if (keyed !== undefined && keyed !== null && String(i) === String(keyed)) {
            lab.className = "ar-opt right";
          } else if (isPicked) {
            lab.className = "ar-opt wrong";
          }
        });
      }

      var head = correct
        ? '<b style="color:var(--ar-green);">Correct.</b> '
        : '<b style="color:var(--ar-red);">Not quite.</b> ';
      var why = c.rationale || c.explain || "";
      var expectedLine = "";
      if (!correct && (c.kind === "numeric" || (c._custom && c.numeric))) {
        var exp = (res && typeof res.correctCode !== "undefined" && res.correctCode !== null)
          ? res.correctCode : local.expected;
        if (exp !== undefined && exp !== null) {
          expectedLine = '<div style="margin-top:6px;color:var(--ar-muted);">Correct answer: <b>' +
            esc(String(exp)) + "</b></div>";
        }
      }
      var warn = offline
        ? '<div class="ar-fb warn" style="margin-top:10px;">This answer was checked on your ' +
          "device but <b>did not reach the server</b>, so it is not being recorded. Check your " +
          "connection &mdash; nothing in this run counts until the connection is back.</div>"
        : "";

      fb.innerHTML = '<div class="ar-fb ' + (correct ? "ok" : "no") + '">' + head +
        esc(why) + expectedLine + "</div>" + warn +
        '<div style="margin-top:14px;"><button class="ar-btn" id="arNext">' +
        (S.idx + 1 >= S.cases.length ? "See results" : "Next case") + " →</button></div>";
      $("arNext").addEventListener("click", function () { S.idx++; draw(); });
    }

    function finish() {
      var pct = S.answered ? Math.round(100 * S.correct / S.answered) : 0;
      var gradedNote;
      if (!S.graded) {
        gradedNote = '<div class="ar-fb warn" style="text-align:left;">' +
          S.serverFailures + " of your answers did not reach the server, so <b>this run was not " +
          "recorded</b>. Your grade is unchanged. Check your connection and run the arena again.</div>";
      } else if (S.attemptNo > MAX_GRADED_ATTEMPTS) {
        gradedNote = '<div class="ar-fb ok" style="text-align:left;">Practice run &mdash; recorded ' +
          "for your own reference, but your grade still uses your first " + MAX_GRADED_ATTEMPTS +
          " attempts.</div>";
      } else {
        gradedNote = '<div class="ar-fb ok" style="text-align:left;">Recorded as graded attempt <b>' +
          S.attemptNo + " of " + MAX_GRADED_ATTEMPTS + "</b>.</div>";
      }

      shell('<div class="ar-card ar-final">' +
        "<h2>" + esc(cfg.title) + " complete</h2>" +
        '<div class="ar-pct">' + pct + "%</div>" +
        '<div style="color:var(--ar-muted);">' + S.correct + " of " + S.answered + " cases correct</div>" +
        gradedNote +
        '<div class="ar-row">' +
          '<button class="ar-btn ghost" id="arAgain">Run it again</button>' +
          '<a class="ar-btn" style="text-decoration:none;display:inline-block;" href="index.html">Back to the portal</a>' +
        "</div></div>");
      $("arAgain").addEventListener("click", function () {
        S.attemptNo++;
        S.idx = 0; S.correct = 0; S.answered = 0; S.graded = true; S.serverFailures = 0;
        intro();
      });
      if (cfg.onFinish) { cfg.onFinish({ pct: pct, correct: S.correct, answered: S.answered, graded: S.graded }); }
    }

    /* How many graded attempts has this student already used? Ask the backend;
       if it cannot say, assume this is attempt 1 and let the server be the
       authority when the results are posted. */
    function resolveAttempt(done) {
      var B = global.MABackend;
      if (!B || !B._sb || !B.isOnline || !B.isOnline()) { done(1); return; }
      var sb = B._sb();
      if (!sb) { done(1); return; }
      B.getSession(function (sess) {
        if (!sess || !sess.user) { done(1); return; }
        sb.from("ma_attempt").select("attempt_no")
          .eq("user_id", sess.user.id).eq("arena_slug", slug)
          .order("attempt_no", { ascending: false }).limit(1)
          .then(function (r) {
            var rows = (r && r.data) ? r.data : [];
            done(rows.length ? (Number(rows[0].attempt_no) + 1) : 1);
          }, function () { done(1); });
      });
    }

    resolveAttempt(function (n) { S.attemptNo = n; intro(); });
  }

  global.MAArena = { start: start, MAX_GRADED_ATTEMPTS: MAX_GRADED_ATTEMPTS };
  if (typeof module !== "undefined" && module.exports) { module.exports = global.MAArena; }
})(typeof globalThis !== "undefined" ? globalThis : this);
