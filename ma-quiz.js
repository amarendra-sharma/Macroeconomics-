/* ============================================================================
   ma-quiz.js  —  student practice & graded-quiz engine for Intro Micro.

   Depends on (must be loaded first):
     * ma-diagrams.js   -> global MADiagrams.render(spec)
     * ma-generators.js -> global MAGenerators.generate/grade/list
     * ma-backend.js    -> global MABackend (auth, supabase client) [graded mode]

   TWO MODES
     practice(chapter, mountEl)      ungraded drilling. Generates random items
                                     from the chapter bank, shows immediate
                                     feedback + rationale, logs to ma_practice_log.
     quiz(examId, mountEl)           graded, soft-proctored chapter quiz. Draws a
                                     fixed set of items (with per-student seeds),
                                     collects answers, submits to the grading
                                     Edge Function. No answers revealed until
                                     after submit (per policy).

   Answers are NEVER shipped for graded quizzes: the client only holds the seed
   and the generated PROMPT; grading happens server-side by regenerating from
   the seed. For PRACTICE, immediate feedback is fine, so we grade locally with
   MAGenerators.grade (practice is ungraded, so no integrity concern).

   Safari-safe plain JS.
   ============================================================================ */
(function (global) {
  "use strict";

  var doc = global.document;

  function el(tag, attrs, html) {
    var e = doc.createElement(tag);
    if (attrs) { for (var k in attrs) { if (attrs.hasOwnProperty(k)) { e.setAttribute(k, attrs[k]); } } }
    if (html != null) { e.innerHTML = html; }
    return e;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function rand32() { return Math.floor(Math.random() * 0xFFFFFFFF) >>> 0; }

  /* which generators + static items belong to each chapter's bank.
     In production this comes from ma_bank_items; we keep a local fallback map
     so practice works even before the DB bank is populated. */
  /* Chapter banks come from the live generator registry rather than a hardcoded
     map. The micro build listed every generator id per chapter inline here, so
     adding a question meant editing two files and the two could disagree.
     MAGenerators.bankFor(n) reads whatever is actually registered across all
     four bank packs, so this can never drift out of date.
     CH_BANK stays as an override slot: setBank(ch, ids) still works for a
     course that wants a custom subset. */
  var CH_BANK = {};
  function bankFor(chapter) {
    if (CH_BANK[chapter] && CH_BANK[chapter].length) { return CH_BANK[chapter]; }
    if (global.MAGenerators && global.MAGenerators.bankFor) {
      return global.MAGenerators.bankFor(chapter) || [];
    }
    return [];
  }

  /* ---- render a single question into a container -------------------------
     q = generated instance from MAGenerators.generate.
     onAnswer(value) called when the student commits an answer (practice). */
  /* Deterministic per-question permutation of MC option positions, so the
     correct answer isn't always in the same slot. Stable across re-renders
     (derived from the question content), and the radio VALUE stays the original
     index so server grading is unaffected. */
  function imqHash(str) {
    var h = 2166136261, i;
    for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h >>> 0;
  }
  function imqOptionOrder(q) {
    var n = q.options.length, a = [], i;
    for (i = 0; i < n; i++) { a.push(i); }
    var base = (typeof q.seed === "number" && isFinite(q.seed)) ? (q.seed >>> 0) : 0;
    var s = (base ^ imqHash(String(q.id || "") + "|" + String(q.prompt || "") + "|" + q.options.join("~"))) >>> 0;
    if (s === 0) { s = 1; }
    for (var k = n - 1; k > 0; k--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      var j = s % (k + 1);
      var t = a[k]; a[k] = a[j]; a[j] = t;
    }
    return a;
  }

  function renderQuestion(q, container, opts) {
    opts = opts || {};
    container.innerHTML = "";
    var card = el("div", { "class": "imq-card", "style":
      "background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:16px;" });

    /* difficulty + type badges */
    var meta = el("div", { "style": "display:flex;gap:8px;margin-bottom:10px;font-size:11px;" });
    var diffColor = q.difficulty === "hard" ? "#991b1b" : q.difficulty === "med" ? "#b87408" : "#166534";
    meta.appendChild(el("span", { "style":
      "padding:2px 8px;border-radius:10px;background:" + diffColor + "18;color:" + diffColor + ";font-weight:600;" },
      esc(q.difficulty || "med")));
    meta.appendChild(el("span", { "style":
      "padding:2px 8px;border-radius:10px;background:#0f3d9e14;color:#0f3d9e;font-weight:600;" },
      esc(q.kind === "mc" ? "Multiple choice" : q.kind === "numeric" ? "Numerical" : "Written")));
    if (q.concept) {
      meta.appendChild(el("span", { "style": "padding:2px 8px;color:#64748b;" }, esc(q.concept)));
    }
    card.appendChild(meta);

    /* prompt */
    card.appendChild(el("div", { "style": "font-size:15px;line-height:1.6;color:#0f172a;margin-bottom:14px;" },
      esc(q.prompt)));

    /* diagram (graphical items) */
    if (q.diagramSpec && global.MADiagrams) {
      var dwrap = el("div", { "style": "max-width:440px;margin:0 auto 16px;" });
      dwrap.innerHTML = global.MADiagrams.render(q.diagramSpec);
      card.appendChild(dwrap);
    }

    /* answer input area */
    var ansWrap = el("div", { "class": "imq-ans" });
    var getValue = null;

    if (q.kind === "mc") {
      var name = "imq_" + Math.random().toString(36).slice(2);
      var order = imqOptionOrder(q);
      order.forEach(function (origIdx) {
        var optText = q.options[origIdx];
        var row = el("label", { "style":
          "display:flex;align-items:flex-start;gap:10px;padding:11px 13px;border:1px solid #cbd5e1;border-radius:8px;margin-bottom:8px;cursor:pointer;font-size:14px;color:#0f172a;background:#ffffff;" });
        var radio = el("input", { "type": "radio", "name": name, "value": String(origIdx), "style": "margin-top:2px;flex-shrink:0;" });
        var txt = el("span", { "style": "color:#0f172a;line-height:1.5;" }, esc(optText));
        row.appendChild(radio);
        row.appendChild(txt);
        ansWrap.appendChild(row);
      });
      getValue = function () {
        var checked = ansWrap.querySelector("input:checked");
        return checked ? checked.value : null;
      };
    } else if (q.kind === "numeric") {
      var inp = el("input", { "type": "text", "inputmode": "decimal", "placeholder": "Your answer",
        "style": "width:180px;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:15px;" });
      ansWrap.appendChild(inp);
      getValue = function () { return inp.value.trim() === "" ? null : inp.value.trim(); };
    } else { /* short / written */
      var ta = el("textarea", { "rows": "5", "placeholder": "Write your answer\u2026",
        "style": "width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;font-family:inherit;box-sizing:border-box;" });
      ansWrap.appendChild(ta);
      getValue = function () { return ta.value.trim() === "" ? null : ta.value.trim(); };
    }
    card.appendChild(ansWrap);

    /* action button + feedback slot */
    var fb = el("div", { "style": "margin-top:12px;min-height:1.2em;font-size:14px;" });
    var btn = el("button", { "style":
      "margin-top:12px;padding:9px 18px;border:none;border-radius:8px;background:#0f3d9e;color:#fff;font-weight:600;font-size:14px;cursor:pointer;" },
      opts.buttonLabel || "Check answer");
    btn.addEventListener("click", function () {
      var v = getValue();
      if (v == null) { fb.innerHTML = "<span style='color:#991b1b;'>Please answer first.</span>"; return; }
      if (opts.onAnswer) { opts.onAnswer(v, fb, btn); }
    });
    card.appendChild(btn);
    card.appendChild(fb);
    container.appendChild(card);
    return { getValue: getValue, feedback: fb, button: btn };
  }

  /* ---- PRACTICE MODE ------------------------------------------------------ */
  function practice(chapter, mountEl, cfg) {
    cfg = cfg || {};
    var bank = bankFor(chapter);
    if (!bank.length) { mountEl.innerHTML = "<p>No practice questions for this chapter yet.</p>"; return; }
    var G = global.MAGenerators;

    var state = { idx: 0, correct: 0, answered: 0, seen: 0 };
    var total = bank.length;

    /* Draw generators by cycling through a shuffled order so the student sees
       every question in the chapter exactly once. When all have been shown,
       we display a "practice complete" screen instead of looping. */
    var deck = [];
    function shuffleDeck() {
      deck = bank.slice();
      for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = deck[i]; deck[i] = deck[j]; deck[j] = t;
      }
    }
    shuffleDeck();
    function nextGenId() {
      return deck.shift();
    }

    function showComplete() {
      var pct = state.answered > 0 ? Math.round((state.correct / state.answered) * 100) : null;
      var nextCh = chapter + 1;
      var hasNext = bankFor(nextCh).length > 0;
      var html = "<div style='background:#f0fdf4;border:1px solid #166534;border-radius:12px;padding:22px;text-align:center;'>" +
        "<div style='font-size:20px;font-weight:800;color:#166534;margin-bottom:8px;'>\u2713 Practice complete</div>" +
        "<div style='color:#334155;font-size:15px;margin-bottom:6px;'>You've worked through all " + total +
        " practice questions for Chapter " + chapter + ".</div>";
      if (pct != null) {
        html += "<div style='color:#64748b;font-size:14px;margin-bottom:16px;'>Your score on graded items: " +
          state.correct + " / " + state.answered + " (" + pct + "%).</div>";
      }
      html += "<div style='display:flex;gap:10px;justify-content:center;flex-wrap:wrap;'>";
      html += "<button id='imqRestart' style='padding:9px 18px;border:1px solid #0f3d9e;border-radius:8px;background:#fff;color:#0f3d9e;font-weight:600;cursor:pointer;'>Practice this chapter again</button>";
      if (hasNext) {
        html += "<button id='imqNextCh' style='padding:9px 18px;border:none;border-radius:8px;background:#166534;color:#fff;font-weight:700;cursor:pointer;'>Go to Chapter " + nextCh + " \u2192</button>";
      }
      html += "</div></div>";
      mountEl.innerHTML = html;
      var rb = mountEl.querySelector("#imqRestart");
      if (rb) { rb.addEventListener("click", function () {
        state.correct = 0; state.answered = 0; state.seen = 0; shuffleDeck(); draw();
      }); }
      var nb = mountEl.querySelector("#imqNextCh");
      if (nb) { nb.addEventListener("click", function () {
        if (cfg.onNextChapter) { cfg.onNextChapter(nextCh); }
        else { practice(nextCh, mountEl, cfg); }
      }); }
    }

    function draw() {
      if (!deck.length) { showComplete(); return; }
      var genId = nextGenId();
      var seed = rand32();
      var q = G.generate(genId, seed);
      if (!q) { return; }
      state.seen++;

      var head = "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;'>" +
        "<div style='font-weight:700;color:#0f3d9e;font-size:16px;'>Chapter " + chapter + " \u00b7 Practice</div>" +
        "<div style='color:#64748b;font-size:13px;'>Question " + state.seen + " of " + total +
        " \u00b7 Score: " + state.correct + " / " + state.answered + "</div></div>";
      mountEl.innerHTML = head;
      var qbox = el("div"); mountEl.appendChild(qbox);

      renderQuestion(q, qbox, {
        buttonLabel: "Check answer",
        onAnswer: function (value, fb, btn) {
          btn.disabled = true; btn.style.opacity = "0.5";
          if (q.kind === "short") {
            /* written: no auto-grade in practice; show the rubric as self-check */
            fb.innerHTML = "<div style='background:#f5f0e8;border-radius:8px;padding:12px;color:#0f172a;'>" +
              "<b>Self-check.</b> " + esc(q.rubric || q.rationale || "Compare your answer to the key ideas.") + "</div>";
          } else {
            var res = G.grade(q.id, q.seed, value);
            state.answered++;
            if (res.correct) { state.correct++; }
            var color = res.correct ? "#166534" : "#991b1b";
            var label = res.correct ? "Correct" : "Not quite";
            fb.innerHTML = "<div style='color:" + color + ";font-weight:700;margin-bottom:6px;'>" + label + "</div>" +
              "<div style='color:#334155;'>" + esc(q.rationale || "") + "</div>" +
              (res.correct ? "" : "<div style='color:#64748b;margin-top:4px;'>Correct answer: " + esc(String(res.expected)) + "</div>");
            /* best-effort practice log (ungraded) */
            logPractice(chapter, q, res.correct);
          }
          var moreLeft = deck.length > 0;
          var next = el("button", { "style":
            "margin-top:14px;margin-left:10px;padding:9px 18px;border:1px solid #0f3d9e;border-radius:8px;background:#fff;color:#0f3d9e;font-weight:600;cursor:pointer;" },
            moreLeft ? "Next question \u2192" : "See results \u2192");
          next.addEventListener("click", draw);
          fb.parentNode.appendChild(next);
        }
      });
    }
    draw();
  }

  function logPractice(chapter, q, wasCorrect) {
    /* DISABLED 2026-09 to cut disk-IO writes: this ungraded practice-analytics
       insert was the #2 write source (~4.3k rows) and nothing in the app reads
       it. Re-enable with sampling (e.g. add: if (Math.random() >= 0.1) return;)
       if practice analytics are wanted later. */
    return;
    if (!global.MABackend || !global.MABackend.isOnline || !global.MABackend.isOnline()) { return; }
    try {
      var sb = global.MABackend._sb ? global.MABackend._sb() : null;
      if (!sb) { return; }
      global.MABackend.getSession(function (sess) {
        if (!sess || !sess.user) { return; }
        sb.from("ma_practice_log").insert({
          student_id: sess.user.id, chapter: chapter,
          generator_id: q.id, seed: q.seed, was_correct: !!wasCorrect
        }).then(function () {}, function () {});
      });
    } catch (e) { /* practice logging is best-effort */ }
  }

  /* ---- GRADED QUIZ MODE (soft-proctored) ---------------------------------
     Builds a fixed list of items with per-student seeds, collects all answers,
     submits once to the grading Edge Function. Answers are not revealed inline. */
  function quiz(spec, mountEl, cfg) {
    /* spec supports two shapes:
       (a) chapter quiz:  { chapter, items:[genId, ...], count }
           -> draws count generator ids at random, each with a random seed.
       (b) assembled exam: { title, items:[{generatorId, seed}, ...],
                             timeLimitMinutes, shuffle, proctored }
           -> uses the given items and their FIXED seeds verbatim (so the exam is
              reproducible and every student is graded on what they saw). */
    cfg = cfg || {};
    var G = global.MAGenerators;
    var chapter = spec.chapter;
    var isExam = !!(spec.items && spec.items.length && typeof spec.items[0] === "object");

    var pick = [];
    if (isExam) {
      /* pre-assembled: keep given order unless shuffle requested */
      for (var e = 0; e < spec.items.length; e++) {
        pick.push({ genId: spec.items[e].generatorId, seed: spec.items[e].seed });
      }
      if (spec.shuffle !== false) {
        for (var s = pick.length - 1; s > 0; s--) {
          var sj = Math.floor(Math.random() * (s + 1));
          var st = pick[s]; pick[s] = pick[sj]; pick[sj] = st;
        }
      }
    } else {
      var bank = spec.items || bankFor(chapter);
      var count = spec.count || Math.min(5, bank.length);
      var pool = bank.slice();
      for (var i = 0; i < count && pool.length; i++) {
        var j = Math.floor(Math.random() * pool.length);
        pick.push({ genId: pool[j], seed: rand32() });
        pool.splice(j, 1);
      }
    }

    var instances = pick.map(function (p) {
      var q = G.generate(p.genId, p.seed);
      q._genId = p.genId; q._seed = p.seed;
      return q;
    });

    var titleText = isExam ? (spec.title || "Exam") : ("Chapter " + chapter + " Quiz");
    var subText = instances.length + " questions \u00b7 answers are graded after you submit.";
    mountEl.innerHTML = "<div style='font-weight:700;color:#0f3d9e;font-size:18px;margin-bottom:6px;'>" +
      esc(titleText) + "</div><div style='color:#64748b;font-size:13px;margin-bottom:6px;'>" + subText + "</div>";

    /* optional exam timer */
    var timerBox = null, deadline = null, timerId = null;
    if (isExam && spec.timeLimitMinutes) {
      timerBox = el("div", { "style": "display:inline-block;margin-bottom:12px;padding:5px 12px;border-radius:8px;background:#eff4ff;color:#0f3d9e;font-weight:700;font-size:14px;font-variant-numeric:tabular-nums;" });
      mountEl.appendChild(timerBox);
      deadline = Date.now() + spec.timeLimitMinutes * 60000;
    }
    var list = el("div"); mountEl.appendChild(list);

    var inputs = [];
    var qboxes = [];
    instances.forEach(function (q, i) {
      var qbox = el("div"); list.appendChild(qbox);
      /* question number + points on every graded item (quiz and exam) */
      var meta = el("div", { "style": "font-size:12px;color:#94a3b8;font-weight:600;margin-bottom:2px;" },
        "Question " + (i + 1) + " of " + instances.length + (q.points ? "  \u00b7  " + q.points + " pt" + (q.points > 1 ? "s" : "") : ""));
      qbox.appendChild(meta);
      var ctrl = renderQuestion(q, qbox, { buttonLabel: null, onAnswer: null });
      if (ctrl.button) { ctrl.button.style.display = "none"; }
      if (i !== 0) { qbox.style.display = "none"; }
      qboxes.push(qbox);
      inputs.push({ q: q, ctrl: ctrl });
    });

    /* One question at a time, like practice: Back / Next, Submit on the last. */
    var navBtnStyle = "padding:9px 18px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#0f172a;font-weight:600;font-size:14px;cursor:pointer;";
    var cur = 0;
    var nav = el("div", { "style": "display:flex;align-items:center;gap:12px;margin-top:8px;flex-wrap:wrap;" });
    var prevBtn = el("button", { "style": navBtnStyle }, "\u2190 Back");
    var progress = el("div", { "style": "font-size:13px;color:#64748b;font-weight:600;" }, "");
    var nextBtn = el("button", { "style": navBtnStyle }, "Next \u2192");
    var submit = el("button", { "style":
      "padding:11px 26px;border:none;border-radius:8px;background:#166534;color:#fff;font-weight:700;font-size:15px;cursor:pointer;" },
      isExam ? "Submit exam" : "Submit quiz");
    var out = el("div", { "style": "margin-top:16px;" });
    function showCur() {
      var k;
      for (k = 0; k < qboxes.length; k++) { qboxes[k].style.display = (k === cur ? "" : "none"); }
      progress.textContent = "Question " + (cur + 1) + " of " + instances.length;
      prevBtn.style.visibility = (cur === 0 ? "hidden" : "visible");
      nextBtn.style.display = (cur >= instances.length - 1 ? "none" : "");
      submit.style.display = (cur >= instances.length - 1 ? "" : "none");
    }
    prevBtn.addEventListener("click", function () { if (cur > 0) { cur--; showCur(); if (global.scrollTo) { global.scrollTo(0, 0); } } });
    nextBtn.addEventListener("click", function () { if (cur < instances.length - 1) { cur++; showCur(); if (global.scrollTo) { global.scrollTo(0, 0); } } });
    nav.appendChild(prevBtn); nav.appendChild(progress); nav.appendChild(nextBtn);

    function doSubmit() {
      if (submit.disabled) { return; }
      var payload = inputs.map(function (row) {
        return { generator_id: row.q._genId, seed: row.q._seed, submitted: row.ctrl.getValue() };
      });
      submit.disabled = true; submit.style.opacity = "0.5"; submit.textContent = "Grading\u2026";
      if (timerId) { clearInterval(timerId); }
      var gradeFn = cfg.gradeExam || gradeQuiz;
      gradeFn(isExam ? (spec.examId || spec.title) : chapter, payload, function (result) {
        var label = isExam ? "Exam" : "Quiz";
        if (result && result.ok && !result.offline) {
          var scoreLine = (typeof result.score !== "undefined" && result.score !== null && typeof result.total !== "undefined" && result.total !== null)
            ? ("Score: " + result.score + " / " + result.total + (result.pending ? " (" + result.pending + " written answer(s) pending review)" : ""))
            : "Your answers were recorded \u2014 see My Grades for your score.";
          out.innerHTML = "<div style='background:#f0fdf4;border:1px solid #166534;border-radius:10px;padding:16px;'>" +
            "<div style='font-weight:700;color:#166534;font-size:16px;'>" + label + " submitted \u2713</div>" +
            "<div style='color:#334155;margin-top:6px;'>" + scoreLine + "</div></div>";
          submit.style.display = "none";
        } else if (result && result.offline) {
          out.innerHTML = "<div style='background:#fef2f2;border:1px solid #991b1b;border-radius:10px;padding:16px;'>" +
            "<div style='font-weight:700;color:#991b1b;font-size:16px;'>Not saved \u2014 you appear to be offline</div>" +
            "<div style='color:#334155;margin-top:6px;'>Your answers were graded on this device but <b>were not recorded</b>. Check your internet connection and click <b>Submit</b> again. Nothing counts until you see the green \u201C" + label + " submitted\u201D confirmation.</div></div>";
          submit.disabled = false; submit.style.opacity = "1"; submit.textContent = "Submit " + label.toLowerCase();
        } else {
          out.innerHTML = "<div style='background:#fef2f2;border:1px solid #991b1b;border-radius:10px;padding:16px;'>" +
            "<div style='font-weight:700;color:#991b1b;font-size:15px;'>Not submitted</div>" +
            "<div style='color:#334155;margin-top:6px;'>" + (result && result.error ? esc(result.error) : "Could not submit \u2014 check your connection and try again.") +
            " Your answers are <b>not saved</b> until you see the green confirmation.</div></div>";
          submit.disabled = false; submit.style.opacity = "1"; submit.textContent = "Submit " + label.toLowerCase();
        }
        if (cfg.onSubmit) { cfg.onSubmit(result); }
      });
    }
    submit.addEventListener("click", doSubmit);

    /* run the timer */
    if (deadline) {
      timerId = setInterval(function () {
        var left = Math.max(0, deadline - Date.now());
        var mm = Math.floor(left / 60000), ss = Math.floor((left % 60000) / 1000);
        timerBox.textContent = "\u23f1 " + mm + ":" + (ss < 10 ? "0" : "") + ss + " remaining";
        if (left <= 0) { clearInterval(timerId); timerBox.textContent = "\u23f1 Time's up \u2014 submitting\u2026"; doSubmit(); }
      }, 1000);
    }
    mountEl.appendChild(nav);
    mountEl.appendChild(submit);
    mountEl.appendChild(out);
    showCur();
  }

  /* submit graded answers to the Edge Function (server regenerates + grades) */
  function gradeQuiz(chapter, payload, cb) {
    if (!global.MABackend || !global.MABackend.isOnline || !global.MABackend.isOnline()) {
      /* OFFLINE fallback: grade locally so the UI still works in dev/preview.
         (Not used in production — real grading is server-side.) */
      var G = global.MAGenerators, score = 0, total = 0, pending = 0;
      payload.forEach(function (p) {
        var r = G.grade(p.generator_id, p.seed, p.submitted);
        if (r.needsAI) { pending++; total += r.points || 0; }
        else { total += (G.generate(p.generator_id, p.seed).points || 1); if (r.correct) { score += r.points; } }
      });
      cb({ ok: true, score: score, total: total, pending: pending, offline: true });
      return;
    }
    global.MABackend.gradeQuiz
      ? global.MABackend.gradeQuiz(chapter, payload, cb)
      : cb({ ok: false, error: "Grading endpoint not wired yet." });
  }

  global.MAQuiz = { practice: practice, quiz: quiz, renderQuestion: renderQuestion, setBank: function (ch, ids) { CH_BANK[ch] = ids; } };
})(this);
