/* ============================================================================
   ma-textbook-deeplink.js — make macronations-textbook.html respond to a
   #chN fragment.

   WHY: the portal opens the book with
        window.open('macronations-textbook.html#ch' + n, '_blank')
   but the textbook never reads location.hash. Its chapters are switched by
   showChapter('ch7') and the pages are <div id="page-ch7">, so there is no
   native anchor for the browser to jump to either. Without this file every
   "Read chapter N" button lands the student on whatever chapter saveState()
   last restored — silently, with nothing to indicate the link was ignored.

   This is additive: one script tag at the end of the textbook. It calls the
   book's own showChapter(), so it inherits the book's lazy chart loading and
   progress tracking. Remove the tag to revert.
   ============================================================================ */
(function () {
  "use strict";

  function chapterFromHash() {
    var m = String(window.location.hash || "").match(/^#(ch\d+)$/i);
    return m ? m[1].toLowerCase() : null;
  }

  function go() {
    var ch = chapterFromHash();
    if (!ch) { return; }
    // Only navigate if that chapter actually exists in this build of the book,
    // so a link to an unpublished chapter leaves the reader where they were
    // rather than blanking the page.
    if (!document.getElementById("page-" + ch)) {
      try { console.warn("textbook deep-link: no page for " + ch); } catch (e) {}
      return;
    }
    if (typeof window.showChapter !== "function") {
      try { console.warn("textbook deep-link: showChapter() not available"); } catch (e) {}
      return;
    }
    window.showChapter(ch);
  }

  /* Run AFTER the book's own init, so the hash wins over the restored state. */
  function arm() { setTimeout(go, 0); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arm);
  } else {
    arm();
  }
  /* Following a second link to the same tab changes only the hash. */
  window.addEventListener("hashchange", go);
})();
