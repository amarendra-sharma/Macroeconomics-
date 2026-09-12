/* ============================================================================
   ma-diagrams.js  —  parameter-driven SVG macro-diagram renderer for the
   Applied Macroeconomics question banks.

   Same contract as im-diagrams.js: every graphical question supplies a spec
   object, MADiagrams.render(spec) returns an SVG string. Because diagrams are
   drawn from parameters (not stored images), one question template randomizes
   per student: change the numbers, the diagram redraws, and the correct answer
   is recomputed from those numbers.

   Micro types carried over (chapters 4-6 still use supply & demand):
     'supply_demand', 'shift', 'price_control', 'tax', 'curve'

   Macro types added here:
     'ad_as'          — AD / SRAS / LRAS with output gaps and shifts
     'is_lm'          — IS-LM in (Y, r) space with policy shifts
     'phillips'       — short-run Phillips curve + vertical LRPC, expectations
     'solow'          — s*f(k) vs (delta+n)k, steady state k*
     'loanable_funds' — saving / investment in (Q, r) space
     'money_market'   — vertical MS and downward MD in (M, r) space
     'fx_market'      — demand / supply of a currency in (Q, e) space
     'ppf'            — kept for chapters 1-3

   Coordinate convention differs by diagram and is stated per builder. The
   helper maps model coordinates (x, y) into SVG pixels; every builder uses it
   so axes, curves and drop-lines can never disagree about where a point is.

   Safari-safe plain JS: var, function declarations, string concatenation.
   No template literals, arrow functions, optional chaining, or nullish
   coalescing. Pure functions — no DOM needed to BUILD the string.
   ============================================================================ */
(function (global) {
  "use strict";

  var C = {
    axis:    "#334155",
    grid:    "#e2e8f0",
    demand:  "#0f3d9e",   /* navy  — AD, IS, MD, demand */
    supply:  "#b87408",   /* gold  — SRAS, LM, MS, supply */
    alt:     "#7c3aed",   /* violet — the shifted curve */
    lr:      "#166534",   /* green — long-run / potential output */
    surplus: "#16653422",
    surplusStroke: "#166534",
    gap:     "#991b1b22",
    gapStroke: "#991b1b",
    ink:     "#0f172a",
    muted:   "#64748b",
    label:   "#0f172a"
  };

  /* ---- geometry: a plot box inside the svg viewBox --------------------- */
  function makePlot(opts) {
    opts = opts || {};
    var W = opts.w || 440, H = opts.h || 330;
    var m = { l: 52, r: 20, t: 20, b: 44 };
    var xmax = opts.xmax || 10, ymax = opts.ymax || 10;
    var xmin = opts.xmin || 0,  ymin = opts.ymin || 0;
    var x0 = m.l, x1 = W - m.r, y0 = H - m.b, y1 = m.t;
    function X(v) { return x0 + ((v - xmin) / (xmax - xmin)) * (x1 - x0); }
    function Y(v) { return y0 - ((v - ymin) / (ymax - ymin)) * (y0 - y1); }
    return { W: W, H: H, m: m, xmax: xmax, ymax: ymax, xmin: xmin, ymin: ymin,
             X: X, Y: Y, x0: x0, x1: x1, y0: y0, y1: y1 };
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function fmt(n) { return (Math.round(n * 100) / 100).toString(); }

  function line(x1, y1, x2, y2, stroke, width, dash) {
    return "<line x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 +
      "' stroke='" + stroke + "' stroke-width='" + (width || 1) + "'" +
      (dash ? " stroke-dasharray='" + dash + "'" : "") + " />";
  }
  function txt(x, y, s, opts) {
    opts = opts || {};
    return "<text x='" + x + "' y='" + y + "' fill='" + (opts.fill || C.label) +
      "' font-family='Inter, system-ui, sans-serif' font-size='" + (opts.size || 12) +
      "'" + (opts.weight ? " font-weight='" + opts.weight + "'" : "") +
      (opts.anchor ? " text-anchor='" + opts.anchor + "'" : "") + ">" + esc(s) + "</text>";
  }
  function poly(points, fill, stroke) {
    var d = points.map(function (p) { return p[0] + "," + p[1]; }).join(" ");
    return "<polygon points='" + d + "' fill='" + (fill || "none") + "'" +
      (stroke ? " stroke='" + stroke + "' stroke-width='1'" : "") + " />";
  }
  function dot(P, x, y, color, r) {
    return "<circle cx='" + P.X(x) + "' cy='" + P.Y(y) + "' r='" + (r || 3.5) +
      "' fill='" + (color || C.ink) + "'/>";
  }

  function axes(P, xlab, ylab) {
    var s = "";
    s += line(P.x0, P.y0, P.x1, P.y0, C.axis, 1.5);
    s += line(P.x0, P.y0, P.x0, P.y1, C.axis, 1.5);
    s += "<polygon points='" + P.x1 + "," + P.y0 + " " + (P.x1 - 6) + "," + (P.y0 - 4) +
         " " + (P.x1 - 6) + "," + (P.y0 + 4) + "' fill='" + C.axis + "'/>";
    s += "<polygon points='" + P.x0 + "," + P.y1 + " " + (P.x0 - 4) + "," + (P.y1 + 6) +
         " " + (P.x0 + 4) + "," + (P.y1 + 6) + "' fill='" + C.axis + "'/>";
    s += txt(P.x1, P.y0 + 28, xlab || "Output", { anchor: "end", fill: C.muted, size: 12, weight: 600 });
    s += txt(P.x0 - 36, P.y1 + 4, ylab || "Price level", { fill: C.muted, size: 12, weight: 600 });
    return s;
  }

  /* Clip the infinite line y = a + b*x to the plot box, then draw it. Clamping
     y directly would BEND the line and move every intersection — the clip is
     what keeps a drawn crossing at the same place the algebra puts it. */
  function clipLineToBox(P, a, b) {
    var cand = [];
    var yL = a + b * P.xmin;
    if (yL >= P.ymin && yL <= P.ymax) { cand.push({ x: P.xmin, y: yL }); }
    var yR = a + b * P.xmax;
    if (yR >= P.ymin && yR <= P.ymax) { cand.push({ x: P.xmax, y: yR }); }
    if (Math.abs(b) > 1e-9) {
      var xB = (P.ymin - a) / b;
      if (xB >= P.xmin && xB <= P.xmax) { cand.push({ x: xB, y: P.ymin }); }
      var xT = (P.ymax - a) / b;
      if (xT >= P.xmin && xT <= P.xmax) { cand.push({ x: xT, y: P.ymax }); }
    }
    if (cand.length < 2) { return null; }
    var best = null, bd = -1;
    for (var i = 0; i < cand.length; i++) {
      for (var j = i + 1; j < cand.length; j++) {
        var dx = cand[i].x - cand[j].x, dy = cand[i].y - cand[j].y;
        var dist = dx * dx + dy * dy;
        if (dist > bd) { bd = dist; best = [cand[i], cand[j]]; }
      }
    }
    if (!best || bd < 1e-9) { return null; }
    var A = best[0], B = best[1];
    if (A.x > B.x) { var t = A; A = B; B = t; }
    return { x1: A.x, y1: A.y, x2: B.x, y2: B.y };
  }

  function linearCurve(P, a, b, stroke, labelTxt, labelAtX) {
    var p = clipLineToBox(P, a, b);
    if (!p) { return ""; }
    var s = line(P.X(p.x1), P.Y(p.y1), P.X(p.x2), P.Y(p.y2), stroke, 2.5);
    if (labelTxt) {
      var lx = (labelAtX != null) ? labelAtX : (p.x1 + (p.x2 - p.x1) * 0.78);
      if (lx > p.x2) { lx = p.x2; }
      if (lx < p.x1) { lx = p.x1; }
      var ly = a + b * lx;
      var nearRight = P.X(lx) > P.x1 - 42;
      s += txt(P.X(lx) + (nearRight ? -6 : 6), P.Y(ly) - 6, labelTxt,
        { fill: stroke, weight: 700, size: 13, anchor: nearRight ? "end" : "start" });
    }
    return s;
  }

  function markPoint(P, x, y, opts) {
    opts = opts || {};
    var s = "";
    s += line(P.X(x), P.Y(y), P.X(x), P.y0, C.muted, 1, "4 3");
    s += line(P.X(x), P.Y(y), P.x0, P.Y(y), C.muted, 1, "4 3");
    s += dot(P, x, y, opts.color || C.ink);
    if (opts.xlab !== false) {
      s += txt(P.X(x), P.y0 + 15, opts.xlab || fmt(x), { anchor: "middle", size: 11, fill: C.muted });
    }
    if (opts.ylab !== false) {
      s += txt(P.x0 - 6, P.Y(y) + 4, opts.ylab || fmt(y), { anchor: "end", size: 11, fill: C.muted });
    }
    return s;
  }

  function svgWrap(P, inner, title) {
    return "<svg viewBox='0 0 " + P.W + " " + P.H + "' xmlns='http://www.w3.org/2000/svg' " +
      "role='img' aria-label='" + esc(title || "economic diagram") + "' style='max-width:100%;height:auto;'>" +
      "<rect x='0' y='0' width='" + P.W + "' height='" + P.H + "' fill='#ffffff'/>" +
      inner + "</svg>";
  }

  /* ======================= MACRO DIAGRAM BUILDERS ======================= */

  /* ---- AD / AS ---------------------------------------------------------
     Axes: x = real GDP (Y), y = price level (P).
       AD:   P = adA - adB*Y          (downward)
       SRAS: P = srA + srB*Y          (upward)
       LRAS: vertical at yn (potential output)
     spec: { adA, adB, srA, srB, yn, shift:{curve:'AD'|'SRAS', by:<number>},
             showGap:bool, hideValues:bool, xmax, ymax }
     The output gap is shaded between short-run equilibrium Y and potential yn,
     which is what makes recessionary vs inflationary gaps visible at a glance. */
  function adAs(spec) {
    var P = makePlot({ w: spec.w, h: spec.h,
      xmax: spec.xmax || 12, ymax: spec.ymax || 14 });
    var s = axes(P, spec.xlab || "Real GDP (Y)", spec.ylab || "Price level (P)");

    var adA = spec.adA, adB = spec.adB, srA = spec.srA, srB = spec.srB;
    var yn = spec.yn;

    /* short-run equilibrium: adA - adB*Y = srA + srB*Y */
    var y1 = (adA - srA) / (adB + srB);
    var p1 = adA - adB * y1;

    /* optional shift */
    var adA2 = adA, srA2 = srA, y2 = null, p2 = null;
    if (spec.shift && spec.shift.by) {
      if (spec.shift.curve === "AD") { adA2 = adA + spec.shift.by; }
      else { srA2 = srA + spec.shift.by; }
      y2 = (adA2 - srA2) / (adB + srB);
      p2 = adA2 - adB * y2;
    }

    /* output gap shading between equilibrium output and potential */
    if (spec.showGap && yn != null) {
      var gy = (y2 != null) ? y2 : y1;
      var gp = (p2 != null) ? p2 : p1;
      if (Math.abs(gy - yn) > 1e-6) {
        var lo = Math.min(gy, yn), hi = Math.max(gy, yn);
        s += "<rect x='" + P.X(lo) + "' y='" + P.y1 + "' width='" + (P.X(hi) - P.X(lo)) +
          "' height='" + (P.y0 - P.y1) + "' fill='" + C.gap + "'/>";
        var lab = (gy < yn) ? "Recessionary gap" : "Inflationary gap";
        s += txt(P.X((lo + hi) / 2), P.y1 + 16, lab,
          { anchor: "middle", fill: C.gapStroke, weight: 700, size: 11 });
      }
    }

    /* LRAS: vertical at potential output */
    if (yn != null) {
      s += line(P.X(yn), P.y0, P.X(yn), P.y1, C.lr, 2.5);
      s += txt(P.X(yn), P.y1 - 4, "LRAS", { anchor: "middle", fill: C.lr, weight: 700, size: 13 });
    }

    /* original curves — dimmed if this one is the curve that shifts */
    var adStroke = (spec.shift && spec.shift.curve === "AD") ? "#0f3d9e88" : C.demand;
    var srStroke = (spec.shift && spec.shift.curve === "SRAS") ? "#b8740888" : C.supply;
    var adLabel = (spec.shift && spec.shift.curve === "AD") ? "AD\u2081" : "AD";
    var srLabel = (spec.shift && spec.shift.curve === "SRAS") ? "SRAS\u2081" : "SRAS";
    s += linearCurve(P, adA, -adB, adStroke, adLabel);
    s += linearCurve(P, srA, srB, srStroke, srLabel);

    if (spec.shift && spec.shift.by) {
      if (spec.shift.curve === "AD") { s += linearCurve(P, adA2, -adB, C.alt, "AD\u2082"); }
      else { s += linearCurve(P, srA2, srB, C.alt, "SRAS\u2082"); }
    }

    if (spec.hideValues) {
      s += dot(P, y1, p1, C.ink);
      if (y2 != null) { s += dot(P, y2, p2, C.alt); }
    } else {
      s += markPoint(P, y1, p1, {});
      if (y2 != null) { s += markPoint(P, y2, p2, { color: C.alt }); }
    }
    return svgWrap(P, s, "aggregate demand and aggregate supply");
  }

  /* ---- IS-LM -----------------------------------------------------------
     Axes: x = output (Y), y = interest rate (r).
       IS: r = isA - isB*Y   (downward — goods market)
       LM: r = lmA + lmB*Y   (upward   — money market)
     spec: { isA, isB, lmA, lmB, shift:{curve:'IS'|'LM', by}, hideValues } */
  function isLm(spec) {
    var P = makePlot({ w: spec.w, h: spec.h,
      xmax: spec.xmax || 12, ymax: spec.ymax || 12 });
    var s = axes(P, spec.xlab || "Output (Y)", spec.ylab || "Interest rate (r)");

    var isA = spec.isA, isB = spec.isB, lmA = spec.lmA, lmB = spec.lmB;
    var y1 = (isA - lmA) / (isB + lmB);
    var r1 = isA - isB * y1;

    var isA2 = isA, lmA2 = lmA, y2 = null, r2 = null;
    if (spec.shift && spec.shift.by) {
      if (spec.shift.curve === "IS") { isA2 = isA + spec.shift.by; }
      else { lmA2 = lmA + spec.shift.by; }
      y2 = (isA2 - lmA2) / (isB + lmB);
      r2 = isA2 - isB * y2;
    }

    var isStroke = (spec.shift && spec.shift.curve === "IS") ? "#0f3d9e88" : C.demand;
    var lmStroke = (spec.shift && spec.shift.curve === "LM") ? "#b8740888" : C.supply;
    s += linearCurve(P, isA, -isB, isStroke,
      (spec.shift && spec.shift.curve === "IS") ? "IS\u2081" : "IS");
    s += linearCurve(P, lmA, lmB, lmStroke,
      (spec.shift && spec.shift.curve === "LM") ? "LM\u2081" : "LM");
    if (spec.shift && spec.shift.by) {
      if (spec.shift.curve === "IS") { s += linearCurve(P, isA2, -isB, C.alt, "IS\u2082"); }
      else { s += linearCurve(P, lmA2, lmB, C.alt, "LM\u2082"); }
    }

    if (spec.hideValues) {
      s += dot(P, y1, r1, C.ink);
      if (y2 != null) { s += dot(P, y2, r2, C.alt); }
    } else {
      s += markPoint(P, y1, r1, {});
      if (y2 != null) { s += markPoint(P, y2, r2, { color: C.alt }); }
    }
    return svgWrap(P, s, "IS-LM model");
  }

  /* ---- Phillips curve --------------------------------------------------
     Axes: x = unemployment rate (u, %), y = inflation rate (pi, %).
       SRPC: pi = pe + alpha*(un - u)   i.e. pi = (pe + alpha*un) - alpha*u
       LRPC: vertical at un (natural rate)
     spec: { pe, alpha, un, shiftPe:<new expected inflation>, point:{u},
             hideValues } */
  function phillips(spec) {
    var P = makePlot({ w: spec.w, h: spec.h,
      xmax: spec.xmax || 12, ymax: spec.ymax || 12 });
    var s = axes(P, spec.xlab || "Unemployment rate (%)", spec.ylab || "Inflation rate (%)");

    var pe = spec.pe, alpha = spec.alpha, un = spec.un;
    var intercept1 = pe + alpha * un;

    /* LRPC: vertical at the natural rate — the long-run "no tradeoff" result */
    s += line(P.X(un), P.y0, P.X(un), P.y1, C.lr, 2.5);
    s += txt(P.X(un), P.y1 - 4, "LRPC", { anchor: "middle", fill: C.lr, weight: 700, size: 13 });

    var shifted = (spec.shiftPe != null && spec.shiftPe !== pe);
    s += linearCurve(P, intercept1, -alpha, shifted ? "#0f3d9e88" : C.demand,
      shifted ? "SRPC\u2081" : "SRPC", un * 0.45);
    if (shifted) {
      var intercept2 = spec.shiftPe + alpha * un;
      s += linearCurve(P, intercept2, -alpha, C.alt, "SRPC\u2082", un * 0.45);
    }

    /* the long-run equilibrium sits where SRPC crosses LRPC: pi = pe */
    if (!spec.hideValues) {
      s += markPoint(P, un, pe, { xlab: "u*", ylab: fmt(pe) + "%" });
    } else {
      s += dot(P, un, pe, C.ink);
    }
    if (spec.point && spec.point.u != null) {
      var pu = intercept1 - alpha * spec.point.u;
      s += markPoint(P, spec.point.u, pu, { color: C.alt });
    }
    return svgWrap(P, s, "Phillips curve");
  }

  /* ---- Solow growth ----------------------------------------------------
     Axes: x = capital per worker (k), y = output per worker.
       output      y = A * k^alpha
       investment  i = s * A * k^alpha
       break-even  b = (delta + n) * k
     Steady state where s*A*k^alpha = (delta+n)*k, i.e.
       k* = (s*A / (delta+n))^(1/(1-alpha))
     spec: { A, alpha, s, delta, n, showSteady, hideValues } */
  function solow(spec) {
    var A = (spec.A != null) ? spec.A : 1;
    var alpha = (spec.alpha != null) ? spec.alpha : 0.5;
    var sRate = spec.s, delta = spec.delta, n = (spec.n != null) ? spec.n : 0;
    var dn = delta + n;
    var kStar = Math.pow((sRate * A) / dn, 1 / (1 - alpha));
    var xmax = spec.xmax || Math.max(4, Math.ceil(kStar * 1.8));
    var ymax = spec.ymax || Math.max(2, Math.ceil(A * Math.pow(xmax, alpha) * 1.1));

    var P = makePlot({ w: spec.w, h: spec.h, xmax: xmax, ymax: ymax });
    var s = axes(P, spec.xlab || "Capital per worker (k)", spec.ylab || "Output per worker");

    function plotFn(fn, stroke, label) {
      var pts = [], lastX = null, lastV = null;
      var step = xmax / 140;
      for (var x = 0; x <= xmax + 1e-9; x += step) {
        var v = fn(x);
        if (v >= 0 && v <= ymax) { pts.push(P.X(x) + "," + P.Y(v)); lastX = x; lastV = v; }
      }
      if (pts.length < 2) { return ""; }
      var out = "<polyline points='" + pts.join(" ") + "' fill='none' stroke='" + stroke +
        "' stroke-width='2.5' />";
      if (lastX != null) {
        var nearRight = P.X(lastX) > P.x1 - 60;
        out += txt(P.X(lastX) + (nearRight ? -4 : 5), P.Y(lastV) - 4, label,
          { fill: stroke, weight: 700, size: 12, anchor: nearRight ? "end" : "start" });
      }
      return out;
    }

    s += plotFn(function (k) { return A * Math.pow(k, alpha); }, C.demand, "y = Ak^\u03b1");
    s += plotFn(function (k) { return sRate * A * Math.pow(k, alpha); }, C.supply, "s\u00b7y");
    s += plotFn(function (k) { return dn * k; }, C.gapStroke, "(\u03b4+n)k");

    if (spec.showSteady !== false && kStar > 0 && kStar < xmax) {
      var invAt = sRate * A * Math.pow(kStar, alpha);
      s += line(P.X(kStar), P.Y(invAt), P.X(kStar), P.y0, C.muted, 1, "4 3");
      s += dot(P, kStar, invAt, C.ink);
      s += txt(P.X(kStar), P.y0 + 15, spec.hideValues ? "k*" : fmt(kStar),
        { anchor: "middle", fill: C.muted, size: 11 });
    }
    return svgWrap(P, s, "Solow growth model");
  }

  /* ---- Loanable funds --------------------------------------------------
     Axes: x = quantity of loanable funds, y = real interest rate.
       Supply (national saving):  r = sA + sB*Q
       Demand (investment):       r = dA - dB*Q
     spec: { sA, sB, dA, dB, shift:{curve:'S'|'D', by}, hideValues }
     A government deficit is modelled as a LEFTWARD shift of saving (by < 0),
     which is what produces the crowding-out result students must read off. */
  function loanableFunds(spec) {
    var P = makePlot({ w: spec.w, h: spec.h,
      xmax: spec.xmax || 12, ymax: spec.ymax || 12 });
    var s = axes(P, spec.xlab || "Loanable funds", spec.ylab || "Real interest rate (%)");

    var sA = spec.sA, sB = spec.sB, dA = spec.dA, dB = spec.dB;
    var q1 = (dA - sA) / (sB + dB);
    var r1 = sA + sB * q1;

    var sA2 = sA, dA2 = dA, q2 = null, r2 = null;
    if (spec.shift && spec.shift.by) {
      if (spec.shift.curve === "S") { sA2 = sA + spec.shift.by; }
      else { dA2 = dA + spec.shift.by; }
      q2 = (dA2 - sA2) / (sB + dB);
      r2 = sA2 + sB * q2;
    }

    s += linearCurve(P, sA, sB,
      (spec.shift && spec.shift.curve === "S") ? "#b8740888" : C.supply,
      (spec.shift && spec.shift.curve === "S") ? "S\u2081" : "S (saving)");
    s += linearCurve(P, dA, -dB,
      (spec.shift && spec.shift.curve === "D") ? "#0f3d9e88" : C.demand,
      (spec.shift && spec.shift.curve === "D") ? "D\u2081" : "D (investment)");
    if (spec.shift && spec.shift.by) {
      if (spec.shift.curve === "S") { s += linearCurve(P, sA2, sB, C.alt, "S\u2082"); }
      else { s += linearCurve(P, dA2, -dB, C.alt, "D\u2082"); }
    }

    if (spec.hideValues) {
      s += dot(P, q1, r1, C.ink);
      if (q2 != null) { s += dot(P, q2, r2, C.alt); }
    } else {
      s += markPoint(P, q1, r1, {});
      if (q2 != null) { s += markPoint(P, q2, r2, { color: C.alt }); }
    }
    return svgWrap(P, s, "market for loanable funds");
  }

  /* ---- Money market ----------------------------------------------------
     Axes: x = quantity of money, y = nominal interest rate.
       MS: vertical at ms (the central bank sets it)
       MD: r = mdA - mdB*M
     spec: { ms, mdA, mdB, shift:{curve:'MS'|'MD', by}, hideValues } */
  function moneyMarket(spec) {
    var P = makePlot({ w: spec.w, h: spec.h,
      xmax: spec.xmax || 12, ymax: spec.ymax || 12 });
    var s = axes(P, spec.xlab || "Quantity of money", spec.ylab || "Nominal interest rate (%)");

    var ms = spec.ms, mdA = spec.mdA, mdB = spec.mdB;
    var r1 = mdA - mdB * ms;

    var ms2 = ms, mdA2 = mdA, r2 = null;
    if (spec.shift && spec.shift.by) {
      if (spec.shift.curve === "MS") { ms2 = ms + spec.shift.by; }
      else { mdA2 = mdA + spec.shift.by; }
      r2 = mdA2 - mdB * ms2;
    }

    var msStroke = (spec.shift && spec.shift.curve === "MS") ? "#b8740888" : C.supply;
    s += line(P.X(ms), P.y0, P.X(ms), P.y1, msStroke, 2.5);
    s += txt(P.X(ms), P.y1 - 4, (spec.shift && spec.shift.curve === "MS") ? "MS\u2081" : "MS",
      { anchor: "middle", fill: msStroke, weight: 700, size: 13 });
    if (spec.shift && spec.shift.curve === "MS" && spec.shift.by) {
      s += line(P.X(ms2), P.y0, P.X(ms2), P.y1, C.alt, 2.5);
      s += txt(P.X(ms2), P.y1 - 4, "MS\u2082", { anchor: "middle", fill: C.alt, weight: 700, size: 13 });
    }

    s += linearCurve(P, mdA, -mdB,
      (spec.shift && spec.shift.curve === "MD") ? "#0f3d9e88" : C.demand,
      (spec.shift && spec.shift.curve === "MD") ? "MD\u2081" : "MD");
    if (spec.shift && spec.shift.curve === "MD" && spec.shift.by) {
      s += linearCurve(P, mdA2, -mdB, C.alt, "MD\u2082");
    }

    if (spec.hideValues) {
      s += dot(P, ms, r1, C.ink);
      if (r2 != null) { s += dot(P, ms2, r2, C.alt); }
    } else {
      s += markPoint(P, ms, r1, {});
      if (r2 != null) { s += markPoint(P, ms2, r2, { color: C.alt }); }
    }
    return svgWrap(P, s, "money market");
  }

  /* ---- Foreign-exchange market ----------------------------------------
     Axes: x = quantity of the domestic currency, y = exchange rate (foreign
     currency per unit of domestic currency, so "up" = appreciation).
       Demand for domestic currency: e = dA - dB*Q
       Supply of domestic currency:  e = sA + sB*Q
     spec: { dA, dB, sA, sB, currency, shift:{curve:'D'|'S', by}, hideValues } */
  function fxMarket(spec) {
    var P = makePlot({ w: spec.w, h: spec.h,
      xmax: spec.xmax || 12, ymax: spec.ymax || 12 });
    var cur = spec.currency || "dollars";
    var s = axes(P, spec.xlab || ("Quantity of " + cur),
      spec.ylab || "Exchange rate (foreign currency per unit)");

    var dA = spec.dA, dB = spec.dB, sA = spec.sA, sB = spec.sB;
    var q1 = (dA - sA) / (dB + sB);
    var e1 = dA - dB * q1;

    var dA2 = dA, sA2 = sA, q2 = null, e2 = null;
    if (spec.shift && spec.shift.by) {
      if (spec.shift.curve === "D") { dA2 = dA + spec.shift.by; }
      else { sA2 = sA + spec.shift.by; }
      q2 = (dA2 - sA2) / (dB + sB);
      e2 = dA2 - dB * q2;
    }

    s += linearCurve(P, dA, -dB,
      (spec.shift && spec.shift.curve === "D") ? "#0f3d9e88" : C.demand,
      (spec.shift && spec.shift.curve === "D") ? "D\u2081" : "D");
    s += linearCurve(P, sA, sB,
      (spec.shift && spec.shift.curve === "S") ? "#b8740888" : C.supply,
      (spec.shift && spec.shift.curve === "S") ? "S\u2081" : "S");
    if (spec.shift && spec.shift.by) {
      if (spec.shift.curve === "D") { s += linearCurve(P, dA2, -dB, C.alt, "D\u2082"); }
      else { s += linearCurve(P, sA2, sB, C.alt, "S\u2082"); }
    }

    if (spec.hideValues) {
      s += dot(P, q1, e1, C.ink);
      if (q2 != null) { s += dot(P, q2, e2, C.alt); }
    } else {
      s += markPoint(P, q1, e1, {});
      if (q2 != null) { s += markPoint(P, q2, e2, { color: C.alt }); }
    }
    return svgWrap(P, s, "foreign exchange market");
  }

  /* ================= MICRO TYPES CARRIED OVER (ch 1-6) ================== */

  /* linear supply & demand. spec: { dA, dB (P = dA + dB*Q, dB<0), sA, sB,
     xmax, ymax, showEq, shade:'surplus', showRevenueBox, hideValues } */
  function supplyDemand(spec) {
    var P = makePlot({ w: spec.w, h: spec.h,
      xmax: spec.qmax || spec.xmax || 10, ymax: spec.pmax || spec.ymax || 10 });
    var s = axes(P, spec.xlab || "Quantity", spec.ylab || "Price");
    var qe = (spec.sA - spec.dA) / (spec.dB - spec.sB);
    var pe = spec.dA + spec.dB * qe;

    if (spec.shade === "surplus" && qe > 0) {
      s += poly([[P.X(0), P.Y(pe)], [P.X(0), P.Y(spec.dA)], [P.X(qe), P.Y(pe)]],
        C.surplus, C.surplusStroke);
      s += poly([[P.X(0), P.Y(pe)], [P.X(0), P.Y(spec.sA)], [P.X(qe), P.Y(pe)]],
        "#b8740822", C.supply);
      s += txt(P.X(qe * 0.28), P.Y((pe + spec.dA) / 2), "CS",
        { fill: C.surplusStroke, weight: 700, size: 12 });
      s += txt(P.X(qe * 0.28), P.Y((pe + spec.sA) / 2), "PS",
        { fill: C.supply, weight: 700, size: 12 });
    }
    if (spec.showRevenueBox && qe > 0) {
      s += "<rect x='" + P.X(0) + "' y='" + P.Y(pe) + "' width='" + (P.X(qe) - P.X(0)) +
        "' height='" + (P.y0 - P.Y(pe)) + "' fill='#0f3d9e14' stroke='#0f3d9e' stroke-dasharray='3 3'/>";
      s += txt(P.X(qe * 0.4), P.Y(pe / 2), "Revenue", { fill: C.demand, weight: 700, size: 11 });
    }
    s += linearCurve(P, spec.dA, spec.dB, C.demand, spec.dLabel || "D");
    s += linearCurve(P, spec.sA, spec.sB, C.supply, spec.sLabel || "S");
    if (spec.showEq !== false && qe > 0 && qe < P.xmax) {
      s += markPoint(P, qe, pe, {
        xlab: spec.hideValues ? "Q*" : fmt(qe),
        ylab: spec.hideValues ? "P*" : fmt(pe)
      });
    }
    return svgWrap(P, s, "supply and demand");
  }

  function shiftDiagram(spec) {
    var P = makePlot({ w: spec.w, h: spec.h,
      xmax: spec.qmax || spec.xmax || 10, ymax: spec.pmax || spec.ymax || 10 });
    var s = axes(P, spec.xlab || "Quantity", spec.ylab || "Price");
    var dA = spec.dA, dB = spec.dB, sA = spec.sA, sB = spec.sB;
    var qe1 = (sA - dA) / (dB - sB), pe1 = dA + dB * qe1;
    var dA2 = dA, sA2 = sA;
    if (spec.which === "demand") { dA2 = dA + spec.shiftBy; } else { sA2 = sA + spec.shiftBy; }
    var qe2 = (sA2 - dA2) / (dB - sB), pe2 = dA2 + dB * qe2;

    s += linearCurve(P, dA, dB, spec.which === "demand" ? "#0f3d9e88" : C.demand,
      spec.which === "demand" ? "D\u2081" : "D");
    s += linearCurve(P, sA, sB, spec.which === "supply" ? "#b8740888" : C.supply,
      spec.which === "supply" ? "S\u2081" : "S");
    if (spec.which === "demand") { s += linearCurve(P, dA2, dB, C.alt, "D\u2082"); }
    else { s += linearCurve(P, sA2, sB, C.alt, "S\u2082"); }

    if (!spec.hideValues) {
      if (qe1 > 0 && qe1 < P.xmax) { s += markPoint(P, qe1, pe1, {}); }
      if (qe2 > 0 && qe2 < P.xmax) { s += markPoint(P, qe2, pe2, { color: C.alt }); }
    } else {
      if (qe1 > 0) { s += dot(P, qe1, pe1, C.ink, 3); }
      if (qe2 > 0) { s += dot(P, qe2, pe2, C.alt, 3); }
    }
    return svgWrap(P, s, "curve shift");
  }

  /* generic labeled linear curve */
  function curve(spec) {
    var P = makePlot({ w: spec.w, h: spec.h,
      xmax: spec.xmax || 10, ymax: spec.ymax || 10 });
    var s = axes(P, spec.xlab || "Quantity", spec.ylab || "Value");
    s += linearCurve(P, spec.a, spec.b, spec.color || C.supply, spec.label || "");
    return svgWrap(P, s, "curve");
  }

  /* production possibilities frontier (chapters 1-3) */
  function ppf(spec) {
    var xmax = spec.xmax || 10, ymax = spec.ymax || 10;
    var P = makePlot({ w: spec.w, h: spec.h, xmax: xmax, ymax: ymax });
    var s = axes(P, spec.xlab || "Good X", spec.ylab || "Good Y");
    var bow = (spec.bow != null) ? spec.bow : 0.28;
    var pts = [];
    var N = 40;
    for (var i = 0; i <= N; i++) {
      var t = i / N;
      var x = t * xmax;
      var y = (1 - t) * ymax + bow * ymax * Math.sin(Math.PI * t) * 0.9;
      if (y > ymax) { y = ymax; }
      pts.push(P.X(x) + "," + P.Y(y));
    }
    s += "<polyline points='" + pts.join(" ") + "' fill='none' stroke='" + C.demand +
      "' stroke-width='2.5' />";
    s += txt(P.X(xmax * 0.62), P.Y(ymax * 0.62), spec.frontierLabel || "PPF",
      { fill: C.demand, weight: 700, size: 13 });
    if (spec.points) {
      spec.points.forEach(function (pt) {
        var col = pt.state === "outside" ? C.gapStroke : pt.state === "inside" ? C.muted : C.supply;
        s += dot(P, pt.x, pt.y, col, 4);
        if (pt.label) { s += txt(P.X(pt.x) + 7, P.Y(pt.y) - 5, pt.label, { fill: col, weight: 700, size: 12 }); }
      });
    }
    return svgWrap(P, s, "production possibilities frontier");
  }

  function ppfY(spec, x) {
    var xmax = spec.xmax || 10, ymax = spec.ymax || 10;
    var bow = (spec.bow != null) ? spec.bow : 0.28;
    var t = x / xmax;
    var y = (1 - t) * ymax + bow * ymax * Math.sin(Math.PI * t) * 0.9;
    if (y > ymax) { y = ymax; }
    return y;
  }

  /* ---- dispatch --------------------------------------------------------- */
  function renderDiagram(spec) {
    if (!spec || !spec.type) { return ""; }
    switch (spec.type) {
      case "ad_as":          return adAs(spec);
      case "is_lm":          return isLm(spec);
      case "phillips":       return phillips(spec);
      case "solow":          return solow(spec);
      case "loanable_funds": return loanableFunds(spec);
      case "money_market":   return moneyMarket(spec);
      case "fx_market":      return fxMarket(spec);
      case "supply_demand":  return supplyDemand(spec);
      case "shift":          return shiftDiagram(spec);
      case "curve":          return curve(spec);
      case "ppf":            return ppf(spec);
      default: return "";
    }
  }

  var API = { render: renderDiagram, ppfY: ppfY };

  /* Browser global + CommonJS/Deno export, so the grading function and the
     browser load the SAME file rather than two copies that can drift. */
  global.MADiagrams = API;
  if (typeof module !== "undefined" && module.exports) { module.exports = API; }
})(typeof globalThis !== "undefined" ? globalThis : this);
