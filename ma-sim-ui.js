/* ===========================================================================
   ma-sim-ui.js — the player shell for the interactive arenas.

   Owns only presentation and flow. Every number it shows comes from
   MASims; every grade that counts comes back from the server, which replays
   the same model over the transcript this file posts.

   Flow:  BRIEFING -> (round -> optional checkpoint) x N -> SCORECARD

   The briefing is not skippable furniture. A simulation that drops a student
   straight into sliders teaches nothing, so the rules, the targets and the
   scoring are all stated before the first decision.

   Safari-safe: var, function declarations, string concatenation only.
   =========================================================================== */
(function (global) {
  "use strict";

  var doc = global.document;
  var MAX_GRADED_ATTEMPTS = 2;

  function $(id) { return doc.getElementById(id); }
  function esc(s) {
    return String(s === null || s === undefined ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function n1(x) { return (Math.round(Number(x) * 10) / 10).toFixed(1); }

  function injectStyles() {
    if ($("ma-sim-styles")) { return; }
    var st = doc.createElement("style");
    st.id = "ma-sim-styles";
    st.textContent = [
      ".sim-wrap{max-width:1040px;margin:0 auto;padding:24px 18px 64px;",
      "  font-family:'Inter',system-ui,-apple-system,sans-serif;color:#0f172a;}",
      ".sim-card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;",
      "  padding:24px;box-shadow:0 1px 3px rgba(15,23,42,.06);margin-bottom:18px;}",
      ".sim-h1{font-family:Georgia,serif;font-size:30px;margin:0 0 4px;}",
      ".sim-sub{color:#64748b;font-size:15px;margin-bottom:20px;}",
      ".sim-sec{font-size:12px;font-weight:700;letter-spacing:.08em;",
      "  text-transform:uppercase;color:#64748b;margin:22px 0 8px;}",
      ".sim-body{font-size:15px;line-height:1.65;color:#334155;}",
      ".sim-body li{margin-bottom:8px;}",
      ".sim-btn{border:none;border-radius:9px;background:#0f3d9e;color:#fff;",
      "  font-weight:650;font-size:15px;padding:12px 24px;cursor:pointer;}",
      ".sim-btn:disabled{background:#94a3b8;cursor:not-allowed;}",
      ".sim-btn.ghost{background:transparent;color:#0f3d9e;border:1px solid #cbd5e1;}",
      ".sim-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;}",
      ".sim-stat{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;}",
      ".sim-stat .v{font-size:23px;font-weight:700;font-variant-numeric:tabular-nums;}",
      ".sim-stat .l{font-size:11.5px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;}",
      ".sim-stat.on{border-color:#16a34a;background:#f0fdf4;}",
      ".sim-stat.off{border-color:#dc2626;background:#fef2f2;}",
      ".sim-ctl{margin:18px 0;}",
      ".sim-ctl label{display:flex;justify-content:space-between;align-items:baseline;",
      "  font-size:14px;font-weight:600;margin-bottom:6px;}",
      ".sim-ctl .val{font-variant-numeric:tabular-nums;font-size:19px;color:#0f3d9e;}",
      ".sim-ctl input[type=range]{width:100%;}",
      ".sim-ctl .help{font-size:12.5px;color:#64748b;margin-top:5px;}",
      ".sim-shock{border-left:4px solid #b45309;background:#fffbeb;padding:12px 16px;",
      "  border-radius:0 10px 10px 0;font-size:14.5px;margin-bottom:16px;}",
      ".sim-shock.calm{border-left-color:#94a3b8;background:#f8fafc;color:#475569;}",
      ".sim-prog{font-size:13px;color:#64748b;margin-bottom:6px;}",
      ".sim-opt{display:block;width:100%;text-align:left;border:1px solid #cbd5e1;",
      "  background:#fff;border-radius:10px;padding:13px 16px;margin-bottom:9px;",
      "  font-size:14.5px;cursor:pointer;line-height:1.5;}",
      ".sim-opt:hover{border-color:#0f3d9e;background:#f8fafc;}",
      ".sim-opt.right{border-color:#16a34a;background:#f0fdf4;}",
      ".sim-opt.wrong{border-color:#dc2626;background:#fef2f2;}",
      ".sim-why{font-size:14px;line-height:1.65;color:#334155;background:#f8fafc;",
      "  border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-top:12px;}",
      ".sim-tbl{width:100%;border-collapse:collapse;font-size:13.5px;}",
      ".sim-tbl th,.sim-tbl td{padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:right;}",
      ".sim-tbl th:first-child,.sim-tbl td:first-child{text-align:left;}",
      ".sim-tbl th{font-size:11.5px;text-transform:uppercase;color:#64748b;letter-spacing:.04em;}",
      ".sim-big{font-size:56px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums;}",
      ".sim-note{font-size:13px;color:#64748b;margin-top:10px;}",
      "@media(max-width:560px){.sim-h1{font-size:24px}.sim-big{font-size:44px}}"
    ].join("");
    doc.head.appendChild(st);
  }

  /* ---- a small inline time-series chart; no library ---------------------- */
  function sparkChart(series, w, h) {
    w = w || 680; h = h || 190;
    var pad = { l: 40, r: 14, t: 12, b: 22 };
    var all = [];
    series.forEach(function (s) { s.values.forEach(function (v) { all.push(v); }); });
    if (!all.length) { return ""; }
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
    series.forEach(function (s) {
      if (typeof s.target === "number") { lo = Math.min(lo, s.target); hi = Math.max(hi, s.target); }
    });
    if (hi - lo < 1e-9) { hi = lo + 1; }
    var padY = (hi - lo) * 0.15; lo -= padY; hi += padY;
    var n = Math.max.apply(null, series.map(function (s) { return s.values.length; }));
    function X(i) { return pad.l + (n <= 1 ? 0 : (i / (n - 1)) * (w - pad.l - pad.r)); }
    function Y(v) { return pad.t + (1 - (v - lo) / (hi - lo)) * (h - pad.t - pad.b); }

    var out = '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:auto;" ' +
              'role="img" aria-label="Time path of the tracked variables">';
    out += '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="#fff"/>';
    [0, 0.5, 1].forEach(function (f) {
      var v = lo + f * (hi - lo);
      out += '<line x1="' + pad.l + '" y1="' + Y(v).toFixed(1) + '" x2="' + (w - pad.r) +
             '" y2="' + Y(v).toFixed(1) + '" stroke="#e2e8f0" stroke-width="1"/>' +
             '<text x="' + (pad.l - 6) + '" y="' + (Y(v) + 4).toFixed(1) +
             '" font-size="10" fill="#94a3b8" text-anchor="end">' + n1(v) + '</text>';
    });
    series.forEach(function (s) {
      if (typeof s.target === "number") {
        out += '<line x1="' + pad.l + '" y1="' + Y(s.target).toFixed(1) + '" x2="' + (w - pad.r) +
               '" y2="' + Y(s.target).toFixed(1) + '" stroke="' + s.color +
               '" stroke-width="1" stroke-dasharray="4 4" opacity=".5"/>';
      }
      var d = "";
      s.values.forEach(function (v, i) { d += (i ? " L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); });
      out += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="2.5" ' +
             'stroke-linejoin="round" stroke-linecap="round"/>';
      s.values.forEach(function (v, i) {
        out += '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) +
               '" r="3" fill="' + s.color + '"/>';
      });
    });
    out += "</svg>";
    var legend = '<div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12.5px;color:#475569;margin-top:6px;">';
    series.forEach(function (s) {
      legend += '<span><span style="display:inline-block;width:11px;height:11px;border-radius:3px;' +
                'background:' + s.color + ';margin-right:5px;vertical-align:-1px;"></span>' + esc(s.label) +
                (typeof s.target === "number" ? ' <span style="color:#94a3b8;">(target ' + n1(s.target) + ')</span>' : "") +
                "</span>";
    });
    return out + legend + "</div>";
  }

  /* ======================================================================= */
  function start(cfg) {
    injectStyles();
    var slug = cfg.slug;
    var host = $(cfg.mount || "sim-root");
    if (!host) { return; }
    var S = global.MASims;
    if (!S || !S.has(slug)) {
      host.innerHTML = '<div class="sim-card">This simulation could not be loaded.</div>';
      return;
    }

    var spec = S.spec(slug);
    var seed = (Math.floor(Math.random() * 0xFFFFFFFF) >>> 0) || 1;
    var sim = S.init(slug, seed);
    var rounds = S.ROUNDS(slug);
    var checkpoints = S.checkpoints(slug, seed);

    var state = sim.state;
    var decisions = [];
    var answers = [];
    var history = [JSON.parse(JSON.stringify(sim.state))];
    var round = 0;
    var control = {};
    spec.controls.forEach(function (c) {
      control[c.key] = (typeof c["default"] === "number") ? c["default"] : c.min;
    });

    /* ---------------- briefing ---------------- */
    function briefing() {
      var h = '<div class="sim-card">' +
        '<div class="sim-h1">' + esc(spec.title) + "</div>" +
        '<div class="sim-sub">' + esc(spec.subtitle) + "</div>" +
        '<div class="sim-sec">What you are doing</div>' +
        '<div class="sim-body">' + esc(spec.youAre) + "</div>" +
        '<div class="sim-sec">What counts as success</div>' +
        '<div class="sim-body">' + esc(spec.goal) + "</div>" +
        '<div class="sim-sec">Your controls</div><div class="sim-body"><ul style="padding-left:20px;margin:0;">';
      spec.controls.forEach(function (c) {
        h += "<li><b>" + esc(c.label) + "</b> (" + c.min + " to " + c.max +
             (c.unit ? " " + esc(c.unit) : "") + "). " + esc(c.help) + "</li>";
      });
      h += "</ul></div>" +
        '<div class="sim-sec">How it is graded</div><div class="sim-body"><ul style="padding-left:20px;margin:0;">';
      spec.howScored.forEach(function (x) { h += "<li>" + esc(x) + "</li>"; });
      h += "</ul></div>";
      // The exact penalty the outcome is measured by. "Described below" in the
      // grading text points here; without it the student is scored against a
      // rule they were never shown.
      if (spec.penalty) {
        h += '<div class="sim-sec">What the penalty counts</div>' +
             '<div class="sim-body">' + esc(spec.penalty) + "</div>";
      }
      h +=
        '<div class="sim-sec">Worth knowing before you start</div>' +
        '<div class="sim-body">' + esc(spec.watchFor) + "</div>" +
        '<div class="sim-why" style="margin-top:22px;">' +
          "This run is <b>" + rounds + " rounds</b> and takes about " +
          S.list().filter(function (x) { return x.slug === slug; })[0].minutes +
          " minutes. Your first two graded runs count toward your grade and are " +
          "averaged, so treat this one as real. You cannot go back a round." +
        "</div>" +
        '<div style="margin-top:22px;"><button class="sim-btn" id="simGo">Begin the run</button></div>' +
      "</div>";
      host.innerHTML = h;
      $("simGo").addEventListener("click", function () { renderRound(); });
    }

    function checkpointFor(r) {
      for (var i = 0; i < checkpoints.length; i++) {
        if (checkpoints[i].round === r) { return { cp: checkpoints[i], idx: i }; }
      }
      return null;
    }

    /* ---------------- one round ---------------- */
    function renderRound() {
      var pending = checkpointFor(round);
      if (pending && answers[pending.idx] === undefined) {
        renderCheckpoint(pending);
        return;
      }
      var sh = sim.shocks[round] || { label: "" };
      var h = '<div class="sim-card">' +
        '<div class="sim-prog">Round ' + (round + 1) + " of " + rounds + " · " + esc(spec.title) + "</div>";
      if (sh.label) {
        var hit = (typeof sh.hit === "boolean") ? sh.hit : !!(sh.supply || sh.demand);
        h += '<div class="sim-shock' + (hit ? "" : " calm") + '">' + esc(sh.label) + "</div>";
      }
      if (sh.info) {
        h += '<div class="sim-why" style="margin:0 0 16px;">' + sh.info + "</div>";
      }
      h += '<div class="sim-grid" style="margin-bottom:18px;">';
      spec.readouts.forEach(function (ro) {
        var v = state[ro.key];
        var cls = "";
        if (typeof ro.target === "number" && typeof ro.band === "number" && round > 0) {
          cls = Math.abs(v - ro.target) <= ro.band ? " on" : " off";
        }
        h += '<div class="sim-stat' + cls + '"><div class="v">' + n1(v) +
             (ro.unit && ro.unit !== "index" ? esc(ro.unit) : "") + "</div>" +
             '<div class="l">' + esc(ro.label) + "</div></div>";
      });
      h += "</div>";

      var series = (spec.chart || []).map(function (c) {
        return { label: c.label, color: c.color, target: c.target,
                 values: history.map(function (s) { return Number(s[c.key]); }) };
      });
      if (series.length) { h += '<div style="margin-bottom:8px;">' + sparkChart(series) + "</div>"; }

      spec.controls.forEach(function (c) {
        h += '<div class="sim-ctl"><label for="ctl_' + c.key + '"><span>' + esc(c.label) + "</span>" +
             '<span class="val" id="val_' + c.key + '">' + control[c.key] +
             (c.unit ? " " + esc(c.unit) : "") + "</span></label>" +
             '<input type="range" id="ctl_' + c.key + '" min="' + c.min + '" max="' + c.max +
             '" step="' + c.step + '" value="' + control[c.key] + '">' +
             '<div class="help">' + esc(c.help) + "</div></div>";
      });
      /* A projection of this year BEFORE the shock lands. Without it a student
         has no way to learn what a quarter-point is worth -- the first playtest
         was exactly that failure: directionally right, badly wrong on magnitude,
         with no feedback until the year had already resolved. It deliberately
         EXCLUDES the shock: the type is announced, the size is not, so judging
         how hard to lean is still the thing being tested. */
      h += '<div id="simPreview" class="sim-why" style="margin-top:4px;"></div>';
      h += '<div style="margin-top:20px;"><button class="sim-btn" id="simNext">' +
           (round + 1 === rounds ? "Finish the run" : "Lock in and advance") + "</button></div></div>";
      host.innerHTML = h;
      global.scrollTo(0, 0);

      function paintPreview() {
        var box = $("simPreview");
        if (!box) { return; }
        var html = S.preview(slug, state, control, round, sim.shocks);
        if (html) { box.innerHTML = html; box.style.display = ""; }
        else { box.style.display = "none"; }
      }
      spec.controls.forEach(function (c) {
        var inp = $("ctl_" + c.key);
        inp.addEventListener("input", function () {
          control[c.key] = Number(inp.value);
          $("val_" + c.key).textContent = inp.value + (c.unit ? " " + c.unit : "");
          paintPreview();
        });
      });
      paintPreview();
      $("simNext").addEventListener("click", function () {
        var d = {};
        spec.controls.forEach(function (c) { d[c.key] = control[c.key]; });
        decisions.push(d);
        state = S.step(slug, state, d, round, sim.shocks);
        history.push(JSON.parse(JSON.stringify(state)));
        round++;
        if (round >= rounds) { finish(); } else { renderRound(); }
      });
    }

    /* ---------------- a checkpoint ---------------- */
    function renderCheckpoint(p) {
      var cp = p.cp;
      var h = '<div class="sim-card">' +
        '<div class="sim-prog">Checkpoint · before round ' + (round + 1) + "</div>" +
        '<div style="font-size:17px;line-height:1.6;font-weight:600;margin-bottom:16px;">' +
          esc(cp.prompt) + "</div>";
      cp.options.forEach(function (o, i) {
        h += '<button class="sim-opt" data-cp="' + i + '">' + esc(o) + "</button>";
      });
      h += '<div class="sim-note">This is one of three checkpoints. They are 30% of your ' +
           "score, and you cannot change an answer once given.</div></div>";
      host.innerHTML = h;
      global.scrollTo(0, 0);

      Array.prototype.forEach.call(host.querySelectorAll("[data-cp]"), function (b) {
        b.addEventListener("click", function () {
          var chosen = Number(b.getAttribute("data-cp"));
          answers[p.idx] = chosen;
          Array.prototype.forEach.call(host.querySelectorAll("[data-cp]"), function (x) {
            x.disabled = true;
            var i = Number(x.getAttribute("data-cp"));
            if (i === cp.answer) { x.className = "sim-opt right"; }
            else if (i === chosen) { x.className = "sim-opt wrong"; }
          });
          var why = doc.createElement("div");
          why.className = "sim-why";
          why.innerHTML = "<b>" + (chosen === cp.answer ? "Correct." : "Not quite.") + "</b> " + esc(cp.why);
          host.querySelector(".sim-card").appendChild(why);
          var go = doc.createElement("button");
          go.className = "sim-btn"; go.style.marginTop = "18px";
          go.textContent = "Continue to round " + (round + 1);
          go.addEventListener("click", function () { renderRound(); });
          host.querySelector(".sim-card").appendChild(go);
        });
      });
    }

    /* ---------------- scorecard ---------------- */
    function finish() {
      var local = S.score(slug, seed, decisions, answers);
      host.innerHTML = '<div class="sim-card"><div class="sim-prog">Submitting your run…</div></div>';

      submit(function (server) {
        // server.score is the 0..1 fraction; the full breakdown is server.result.
        var res = (server && server.ok && server.result && typeof server.result.totalPct === "number")
          ? server.result : local;
        var graded = !!(server && server.ok);
        var attemptNo = graded && server.attempt_no ? server.attempt_no : 0;
        var counts = graded && server.graded !== false;
        var h = '<div class="sim-card" style="text-align:center;">' +
          '<div class="sim-prog">' + esc(spec.title) + " · run complete</div>" +
          '<div class="sim-big" style="color:' + (res.totalPct >= 70 ? "#16a34a" : res.totalPct >= 45 ? "#b45309" : "#dc2626") + ';">' +
            n1(res.totalPct) + "%</div>" +
          '<div class="sim-note">' +
            (graded && counts
              ? "Recorded as graded run <b>" + (attemptNo || 1) + " of " + MAX_GRADED_ATTEMPTS +
                "</b>. Your grade uses the average of your first " + MAX_GRADED_ATTEMPTS + " runs."
              : graded
              ? "Practice run " + attemptNo + " — recorded for your own reference. Your grade still " +
                "uses your first " + MAX_GRADED_ATTEMPTS + " runs."
              : "<b>This run was NOT recorded.</b> The server could not be reached, so nothing " +
                "was saved and your grade has not moved. Sign in and play again for it to count.") +
          "</div></div>";

        h += '<div class="sim-card"><div class="sim-sec">Where the score came from</div>' +
          '<div class="sim-grid">' +
            '<div class="sim-stat"><div class="v">' + n1(res.outcomePct) + '%</div>' +
              '<div class="l">Outcome · 70% weight</div></div>' +
            '<div class="sim-stat"><div class="v">' + n1(res.checkpointPct) + '%</div>' +
              '<div class="l">Checkpoints · 30% weight</div></div>' +
            '<div class="sim-stat"><div class="v">' + res.checkpointsRight + "/" + res.checkpointsTotal + '</div>' +
              '<div class="l">Questions right</div></div>' +
          "</div>";
        var expl = S.explain(slug, res);
        if (expl) { h += '<div class="sim-why">' + expl + "</div>"; }
        h += "</div>";

        h += '<div class="sim-card"><div class="sim-sec">The checkpoints</div>';
        res.checkpoints.forEach(function (c, i) {
          h += '<div style="margin-bottom:18px;padding-bottom:16px;' +
               (i < res.checkpoints.length - 1 ? "border-bottom:1px solid #e2e8f0;" : "") + '">' +
               '<div style="font-weight:600;font-size:14.5px;margin-bottom:8px;">' +
               (c.correct ? '<span style="color:#16a34a;">✓</span> ' : '<span style="color:#dc2626;">✗</span> ') +
               esc(c.prompt) + "</div>";
          if (!c.correct) {
            h += '<div style="font-size:13.5px;color:#64748b;margin-bottom:6px;">You chose: ' +
                 (c.given === null ? "<i>no answer</i>" : esc(c.options[c.given])) + "<br>" +
                 "The answer: " + esc(c.options[c.answer]) + "</div>";
          }
          h += '<div class="sim-why" style="margin-top:6px;">' + esc(c.why) + "</div></div>";
        });
        h += "</div>";

        h += '<div class="sim-card"><div class="sim-sec">Your decisions, round by round</div>' +
             '<div style="overflow-x:auto;"><table class="sim-tbl"><thead><tr><th>Round</th>';
        spec.controls.forEach(function (c) { h += "<th>" + esc(c.label) + "</th>"; });
        spec.readouts.forEach(function (r) { h += "<th>" + esc(r.label) + "</th>"; });
        h += "</tr></thead><tbody>";
        res.trace.forEach(function (t) {
          h += "<tr><td>" + t.round + "</td>";
          spec.controls.forEach(function (c) { h += "<td>" + n1(t.decision[c.key]) + "</td>"; });
          spec.readouts.forEach(function (r) { h += "<td>" + n1(t.state[r.key]) + "</td>"; });
          h += "</tr>";
        });
        h += "</tbody></table></div></div>";
        h += '<div style="text-align:center;"><a class="sim-btn ghost" style="text-decoration:none;' +
             'display:inline-block;" href="index.html">← Back to the portal</a></div>';
        host.innerHTML = h;
        global.scrollTo(0, 0);
      });
    }

    function submit(cb) {
      var B = global.MABackend;
      if (!B || !B.isOnline || !B.isOnline() || !B.callFn) { cb(null); return; }
      B.callFn("ma-grade", {
        mode: "sim", arena_slug: slug, seed: seed,
        decisions: decisions, answers: answers
      }, function (res) {
        cb(res && !res.offline && !res.error ? res : null);
      });
    }

    briefing();
  }

  global.MASimUI = { start: start, MAX_GRADED_ATTEMPTS: MAX_GRADED_ATTEMPTS };
  if (typeof module !== "undefined" && module.exports) { module.exports = global.MASimUI; }
})(typeof globalThis !== "undefined" ? globalThis : this);
