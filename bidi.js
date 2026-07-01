/* ============================================================
   bidi.js — תיקון דו-כיווניות (RTL) אוטומטי לכל האתר
   עוטף כל רצף LTR (אנגלית/ספרות/סימנים כמו A*, f=g+h, S→B→G)
   ב-<bdi dir="ltr"> כך שיבודד ולא "יתהפך" בתוך משפט עברי.
   • מעבר ראשי: כל תוכן העמוד, מדלג על code/math/pseudo/SVG/רכיבי-משחק.
   • מעבר Mermaid: תוויות הדיאגרמות (foreignObject) אחרי הרינדור האסינכרוני.
   ============================================================ */
(function () {
  'use strict';
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, CODE: 1, KBD: 1, SAMP: 1, PRE: 1, TEXTAREA: 1, INPUT: 1, SELECT: 1, OPTION: 1, BDI: 1 };
  var SKIP_CLASS = /(^|\s)(math|math-block|pseudo|mermaid|gx-[\w-]+)(\s|$)/;
  // רצף LTR: (אופציונלית) סוגר-פתיחה, אות/ספרה, כל תו שאינו-עברי, ומסתיים באות/ספרה/*/)/]
  var RUN = /[(\[]?[A-Za-z0-9][^֐-׿]*[A-Za-z0-9*)\]]|[A-Za-z0-9]/g;

  function skip(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentNode) {
      if (n.namespaceURI && n.namespaceURI.indexOf('/svg') > -1) return true;   // SVG וכל צאצאיו
      if (SKIP_TAGS[n.tagName]) return true;
      var cls = (typeof n.className === 'string') ? n.className : (n.getAttribute && n.getAttribute('class')) || '';
      if (cls && SKIP_CLASS.test(cls)) return true;
    }
    return false;
  }
  function wrapNode(node) {
    var text = node.nodeValue; RUN.lastIndex = 0;
    if (!RUN.test(text)) return;
    RUN.lastIndex = 0;
    var frag = document.createDocumentFragment(), last = 0, m;
    while ((m = RUN.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      var b = document.createElement('bdi'); b.dir = 'ltr'; b.textContent = m[0];
      frag.appendChild(b);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
  // useSkip=true במעבר הראשי; false בתוויות Mermaid (שם ה-foreignObject הוא SVG אך התוכן HTML תקין לעיטוף).
  function process(root, useSkip) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), nodes = [], t;
    while ((t = walker.nextNode())) {
      if (!t.nodeValue || !/[A-Za-z0-9]/.test(t.nodeValue)) continue;
      if (t.parentNode && t.parentNode.tagName === 'BDI') continue;      // כבר עטוף
      if (useSkip && skip(t.parentNode)) continue;
      nodes.push(t);
    }
    nodes.forEach(wrapNode);
  }
  function processMermaid() {
    var fos = document.querySelectorAll('.mermaid foreignObject');
    for (var i = 0; i < fos.length; i++) process(fos[i], false);
  }
  var pend = false;
  function scheduleMermaid() { if (pend) return; pend = true; setTimeout(function () { pend = false; try { processMermaid(); } catch (e) { } }, 60); }

  function run() {
    try { process(document.body, true); } catch (e) { }
    // תוויות Mermaid מרונדרות אסינכרונית → צופים בשינויי ה-DOM ומעבדים כשמופיע foreignObject.
    try {
      var obs = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          for (var j = 0; j < muts[i].addedNodes.length; j++) {
            var n = muts[i].addedNodes[j];
            if (n.nodeType === 1 && (n.tagName === 'foreignObject' || (n.querySelector && n.querySelector('foreignObject')))) { scheduleMermaid(); return; }
          }
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(processMermaid, 400);   // גיבוי אם ה-observer פספס
      setTimeout(processMermaid, 1400);
    } catch (e) { }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
