// ============================================================
// games-player.js — נגני-פתרון אינטראקטיביים (שלב-אחר-שלב)
// לשימוש בעמוד "פתרונות תרגילים". ללא ניקוד — צפייה מודרכת.
// ============================================================
import { el, svg, segmented } from './games-core.js';
import { searchTreeSteps, minimaxSolve, id3Solve, matrixSolve, hierarchyVS } from './games-engine.js';

/* ---------- עוזרי עץ (מינימקס) ---------- */
function layoutTreeP(tree) {
  let leafCount = 0; (function c(n) { Array.isArray(n) ? n.forEach(c) : leafCount++; })(tree.t);
  let maxDepth = 0; (function d(n, dep) { maxDepth = Math.max(maxDepth, dep); if (Array.isArray(n)) n.forEach(ch => d(ch, dep + 1)); })(tree.t, 0);
  const W = Math.max(360, leafCount * 48), xStep = leafCount > 1 ? (W - 80) / (leafCount - 1) : 0, yStep = 84;
  const nodes = [], edges = []; let leafX = 0, idc = 0;
  const val = (node, isMax) => !Array.isArray(node) ? node : (isMax ? Math.max : Math.min)(...node.map(ch => val(ch, !isMax)));
  function rec(node, depth, isMax) {
    const id = idc++;
    if (!Array.isArray(node)) { const nd = { id, x: 40 + leafX * xStep, y: 40 + maxDepth * yStep, isLeaf: true, value: node, depth }; leafX++; nodes.push(nd); return nd; }
    const children = node.map(ch => rec(ch, depth + 1, !isMax));
    const nd = { id, x: children.reduce((s, c) => s + c.x, 0) / children.length, y: 40 + depth * yStep, isLeaf: false, type: isMax ? 'MAX' : 'MIN', depth, children, value: val(node, isMax) };
    nodes.push(nd); children.forEach(c => edges.push([nd, c])); return nd;
  }
  rec(tree.t, 0, tree.root !== 'MIN');
  return { nodes, edges, W };
}
function drawTreeP(host, nodes, edges, W, state) {
  const maxY = Math.max(...nodes.map(n => n.y)) + 44;
  // עצים רחבים (עומק 3, 27 עלים) — רוחב טבעי + גלילה אופקית; עצים צרים — מתאימים לרוחב הזמין.
  // (svg() לא תומך ב-style כאובייקט — לכן width/height כמאפיינים + מחלקת-CSS.)
  const wide = W > 680;
  const s = svg('svg', { class: 'gx-tree gx-tree-p' + (wide ? ' wide' : ''), viewBox: '0 0 ' + (W + 20) + ' ' + maxY, width: W + 20, height: maxY });
  edges.forEach(([p, c]) => s.appendChild(svg('line', { x1: p.x, y1: p.y, x2: c.x, y2: c.y, class: 't-edge' })));
  nodes.forEach(n => {
    if (n.isLeaf) {
      const pr = state.markPruned && state.markPruned.has(n);
      s.appendChild(svg('rect', { x: n.x - 18, y: n.y - 16, width: 36, height: 32, rx: 6, fill: pr ? 'var(--warn-soft)' : '#eef2ff', stroke: pr ? 'var(--warn)' : '#27408b', 'stroke-width': 2 }));
      s.appendChild(svg('text', { x: n.x, y: n.y + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: pr ? '#b23b3b' : '#27408b' }, pr ? '✂' : n.value));
    } else {
      const isMax = n.type === 'MAX', hl = state.highlight === n.id;
      s.appendChild(svg('circle', { cx: n.x, cy: n.y, r: 21, fill: hl ? 'var(--accent-soft)' : (isMax ? '#e8f7ef' : '#fdecec'), stroke: hl ? 'var(--accent)' : (isMax ? '#1b7f5a' : '#b23b3b'), 'stroke-width': hl ? 4 : 2 }));
      s.appendChild(svg('text', { x: n.x, y: n.y - 3, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: isMax ? '#1b7f5a' : '#b23b3b' }, n.type));
      s.appendChild(svg('text', { x: n.x, y: n.y + 12, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: '#1f2533' }, state.filled && state.filled.has(n.id) ? state.filled.get(n.id) : '?'));
    }
  });
  host.appendChild(s);
}
function igBars(gains, winner) {
  const wrap = el('div', { style: { maxWidth: '430px', margin: '6px auto 0' } });
  const mx = Math.max(...Object.values(gains));
  Object.keys(gains).forEach(a => wrap.appendChild(el('div', { class: 'gx-ig-bar' + (a === winner ? ' win' : '') }, [
    el('span', { class: 'name', text: a }),
    el('div', { class: 'track' }, [el('div', { class: 'fill', style: { width: (mx ? Math.round(gains[a] / mx * 100) : 0) + '%' } })]),
    el('span', { class: 'val', text: 'IG=' + gains[a].toFixed(3) })])));
  return wrap;
}

/* ---------- בקר-צעדים גנרי ---------- */
export function stepController(host, { title, total, renderStep }) {
  host.innerHTML = '';
  let i = 0, timer = null;
  const head = el('div', { class: 'gx-player-head', text: title || '' });
  const viz = el('div', { class: 'gx-player-viz' });
  const explain = el('div', { class: 'gx-player-explain' });
  const counter = el('span', { class: 'gx-player-count' });
  const btnFirst = el('button', { class: 'gx-btn gx-btn-ghost', html: '⏮', onclick: () => go(0) });
  const btnPrev = el('button', { class: 'gx-btn', html: '◀ הקודם', onclick: () => go(i - 1) });
  const btnNext = el('button', { class: 'gx-btn gx-btn-primary', html: 'הבא ▶', onclick: () => go(i + 1) });
  const btnAuto = el('button', { class: 'gx-btn gx-btn-ok', html: '▶▶ אוטו', onclick: toggleAuto });
  const ctrls = el('div', { class: 'gx-player-ctrls' }, [btnFirst, btnPrev, counter, btnNext, btnAuto]);
  host.append(head, viz, explain, ctrls);
  function go(n) {
    i = Math.max(0, Math.min(total - 1, n));
    counter.textContent = 'צעד ' + (i + 1) + ' / ' + total;
    btnPrev.disabled = i === 0; btnNext.disabled = i === total - 1;
    renderStep(i, viz, explain);
    if (timer && i === total - 1) toggleAuto();
  }
  function toggleAuto() {
    if (timer) { clearInterval(timer); timer = null; btnAuto.innerHTML = '▶▶ אוטו'; btnAuto.classList.remove('on'); }
    else { btnAuto.innerHTML = '⏸ עצור'; btnAuto.classList.add('on'); timer = setInterval(() => { i < total - 1 ? go(i + 1) : toggleAuto(); }, 1150); }
  }
  go(0);
}

/* ---------- ציור גרף (כולל חצים לגרף מכוון) ---------- */
function drawGraphP(host, graph, state) {
  const s = svg('svg', { viewBox: '0 0 530 372', style: { maxWidth: '530px', width: '100%', display: 'block', margin: '0 auto' } });
  if (graph.directed) {
    const defs = svg('defs', {}, [svg('marker', { id: 'arp', markerWidth: 9, markerHeight: 9, refX: 8, refY: 3, orient: 'auto' }, [svg('path', { d: 'M0,0 L9,3 L0,6 Z', fill: '#9aa6c0' })])]);
    s.appendChild(defs);
  }
  graph.edges.forEach(([u, v, w]) => {
    const a = graph.nodes[u], b = graph.nodes[v];
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
    const x1 = a.x + ux * 23, y1 = a.y + uy * 23, x2 = b.x - ux * 23, y2 = b.y - uy * 23;
    const onPath = state.pathEdges && (state.pathEdges.has(u + '-' + v) || (!graph.directed && state.pathEdges.has(v + '-' + u)));
    s.appendChild(svg('line', { x1, y1, x2, y2, stroke: onPath ? 'var(--accent)' : '#c2c9da', 'stroke-width': onPath ? 3.5 : 2, 'marker-end': graph.directed ? 'url(#arp)' : null }));
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    s.appendChild(svg('circle', { cx: mx, cy: my, r: 11, fill: '#fff', stroke: onPath ? 'var(--accent)' : '#c2c9da' }));
    s.appendChild(svg('text', { x: mx, y: my + 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#5b6478' }, w));
  });
  for (const n in graph.nodes) {
    const nd = graph.nodes[n];
    let fill = '#fff', stroke = '#9aa6c0';
    if (state.expanded && state.expanded.has(n)) { fill = 'var(--ok-soft)'; stroke = 'var(--ok)'; }
    if (state.frontier && state.frontier.has(n)) { fill = 'var(--accent-soft)'; stroke = 'var(--accent)'; }
    if (state.pathNodes && state.pathNodes.has(n)) stroke = 'var(--accent)';
    if (nd.goal && !(state.expanded && state.expanded.has(n))) stroke = 'var(--warn)';
    const isCur = state.current === n;
    const g = svg('g', {});
    g.appendChild(svg('circle', { cx: nd.x, cy: nd.y, r: 22, fill, stroke, 'stroke-width': isCur ? 4.5 : (nd.goal ? 3 : 2) }));
    g.appendChild(svg('text', { x: nd.x, y: nd.y + (graph.h ? -3 : 5), 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#1f2533' }, n + (nd.start ? '▶' : '') + (nd.goal ? '◎' : '')));
    if (graph.h) g.appendChild(svg('text', { x: nd.x, y: nd.y + 13, 'text-anchor': 'middle', 'font-size': 10, fill: '#5b6478' }, 'h=' + graph.h[n]));
    s.appendChild(g);
  }
  host.appendChild(s);
}

/* ---------- נגן חיפוש (מבוסס-מסלולים) ---------- */
export function searchTreePlayer(host, graph, algos) {
  host.innerHTML = '';
  let algo = algos[0];
  const selHost = el('div', { style: { textAlign: 'center', marginBottom: '8px' } });
  const playerHost = el('div', {});
  host.append(selHost, playerHost);
  if (algos.length > 1) selHost.appendChild(segmented(algos.map(a => ({ label: a, value: a })), a => { algo = a; renderPlayer(); }, algo));
  renderPlayer();
  function renderPlayer() {
    const sol = searchTreeSteps(graph, algo);
    stepController(playerHost, {
      title: graph.name + ' · ' + algo + (sol.found ? ' → ' + sol.path.join('→') + ' (עלות ' + sol.cost + ')' : ''),
      total: sol.steps.length,
      renderStep: (i, viz, explain) => {
        viz.innerHTML = ''; explain.innerHTML = '';
        const step = sol.steps[i];
        const expanded = new Set(sol.steps.slice(0, i).map(s => s.expand));
        const frontierNodes = new Set(step.frontier.map(fr => fr.node));
        const pathNodes = new Set(step.path);
        const pathEdges = new Set(); for (let k = 1; k < step.path.length; k++) pathEdges.add(step.path[k - 1] + '-' + step.path[k]);
        drawGraphP(viz, graph, { expanded, frontier: frontierNodes, pathNodes, pathEdges, current: step.expand });
        const showVal = fr => algo === 'A*' ? fr.f : algo === 'Greedy' ? graph.h[fr.node] : fr.g;
        const valName = algo === 'A*' ? 'f' : algo === 'Greedy' ? 'h' : algo === 'UCS' ? 'g' : 'עומק';
        const chosen = step.path.join('→');
        const isGoal = (graph.goals || [graph.goal]).includes(step.expand);
        explain.appendChild(el('p', { class: 'gx-prompt', html: isGoal
          ? '🎯 מוציאים את <b style="direction:ltr;unicode-bidi:isolate;display:inline-block">' + chosen + '</b> — <b>זהו היעד!</b> עלות סופית ' + step.g + '.'
          : 'מוציאים את המסלול ' + (algo === 'BFS' || algo === 'DFS' ? '(' + (algo === 'BFS' ? 'הראשון בתור' : 'האחרון שנכנס') + ')' : 'בעל ' + valName + ' המינימלי') + ': <b style="direction:ltr;unicode-bidi:isolate;display:inline-block">' + chosen + '</b> → מרחיבים את <b>' + step.expand + '</b> ומוסיפים את שכניו.' }));
        const list = el('div', { class: 'gx-path-list' });
        const ordered = step.frontier.map((fr, idx) => ({ fr, idx }));
        if (algo !== 'BFS' && algo !== 'DFS') ordered.sort((x, y) => (showVal(x.fr) - showVal(y.fr)) || (x.fr.node < y.fr.node ? -1 : 1));
        ordered.forEach(({ fr, idx }) => list.appendChild(el('span', {
          class: 'gx-path-chip' + (idx === step.pick ? ' chosen' : ''),
          html: fr.path.join('→') + ' : <b>' + showVal(fr) + '</b>'
        })));
        explain.appendChild(list);
      }
    });
  }
}

/* ---------- נגן מינימקס (מלמטה-למעלה + Alpha-Beta) ---------- */
export function minimaxPlayer(host, tree) {
  const { nodes, edges, W } = layoutTreeP(tree), sol = minimaxSolve(tree);
  const leaves = nodes.filter(n => n.isLeaf);
  const prunedLTR = new Set(sol.prunedLeafIndices.map(i => leaves[i]));
  const prunedRTL = new Set((sol.prunedLeafIndicesRTL || sol.prunedLeafIndices).map(i => leaves[i]));
  const internal = nodes.filter(n => !n.isLeaf).sort((a, b) => b.depth - a.depth || a.x - b.x);
  const allFilled = new Map(); internal.forEach(n => allFilled.set(n.id, n.value));
  stepController(host, {
    title: 'עץ מינימקס · שורש ' + (sol.rootMax ? 'MAX' : 'MIN') + ' = ' + sol.rootValue,
    total: internal.length + 2,
    renderStep: (i, viz, explain) => {
      viz.innerHTML = ''; explain.innerHTML = '';
      const pruneStep = i - internal.length; // <0 = חשיפת ערכים · 0 = גיזום שמאל→ימין · 1 = ימין→שמאל
      if (pruneStep < 0) {
        const filled = new Map();
        internal.slice(0, i).forEach(n => filled.set(n.id, n.value));
        drawTreeP(viz, nodes, edges, W, { filled, highlight: internal[i].id, markPruned: new Set() });
        const cur = internal[i], cv = cur.children.map(c => c.value);
        explain.appendChild(el('p', { class: 'gx-prompt', html: 'צומת <b style="color:' + (cur.type === 'MAX' ? '#1b7f5a' : '#b23b3b') + '">' + cur.type + '</b>: ' + (cur.type === 'MAX' ? 'max' : 'min') + '(' + cv.join(', ') + ') = <b>' + cur.value + '</b>' }));
      } else {
        const rtl = pruneStep === 1, pset = rtl ? prunedRTL : prunedLTR;
        drawTreeP(viz, nodes, edges, W, { filled: allFilled, highlight: null, markPruned: pset });
        explain.appendChild(el('p', { class: 'gx-prompt', html: '✂ <b>גיזום Alpha-Beta — ' + (rtl ? 'מימין לשמאל (סעיף 2)' : 'משמאל לימין (סעיף 1)') + '</b>: נגזמים <b>' + pset.size + '</b> עלים. ערך השורש = <b>' + sol.rootValue + '</b> · המהלך הנבחר: <b>ענף ' + (sol.bestChild + 1) + '</b> — <b>זהה</b> בשני הכיוונים; רק כמות הגיזום משתנה.' }));
      }
    }
  });
}

/* ---------- נגן ID3 (אנטרופיה → IG → פיצול) ---------- */
function id3Reveal(id3, ds) {
  const steps = [];
  (function walk(node, rows, path) {
    if (node.attr !== undefined) {
      const gains = {}; ds.attrs.forEach(a => gains[a] = id3.gain(rows, a));
      steps.push({ kind: 'attr', attr: node.attr, path, gains, rows: rows.length });
      Object.keys(node.children).forEach(v => walk(node.children[v], rows.filter(r => r[node.attr] == v), [...path, { attr: node.attr, val: v }]));
    } else steps.push({ kind: 'leaf', value: node.leaf, path, rows: rows.length });
  })(id3.tree, ds.rows, []);
  return steps;
}
export function id3Player(host, ds) {
  const id3 = id3Solve(ds), steps = id3Reveal(id3, ds);
  const H0 = id3.entropy(ds.rows);
  stepController(host, {
    title: 'ID3 · ' + ds.name + ' · H(S)=' + H0.toFixed(2),
    total: steps.length,
    renderStep: (i, viz, explain) => {
      viz.innerHTML = ''; explain.innerHTML = '';
      // מתאר-עץ שגדל
      const outline = el('div', {});
      steps.slice(0, i + 1).forEach(s => {
        const ind = s.path.length;
        const br = s.path.length ? '<span style="color:var(--muted);font-size:13px">' + s.path[s.path.length - 1].attr + '=' + s.path[s.path.length - 1].val + ' → </span>' : 'שורש: ';
        const body = s.kind === 'attr' ? '<b style="color:var(--primary)">' + s.attr + '?</b>' : (s.value ? '<b style="color:var(--ok)">אכיל ✓</b>' : '<b style="color:var(--warn)">רעיל ✗</b>');
        outline.appendChild(el('div', { style: { paddingRight: (ind * 22 + 4) + 'px', margin: '3px 0', borderRight: ind ? '2px solid var(--line)' : 'none' }, html: br + body }));
      });
      viz.appendChild(el('div', { class: 'gx-board', style: { textAlign: 'right' } }, [outline]));
      const st = steps[i];
      if (st.kind === 'attr') {
        explain.appendChild(el('p', { class: 'gx-prompt', html: (st.path.length ? 'בענף [' + st.path.map(p => p.attr + '=' + p.val).join(', ') + '] — ' : 'בשורש — ') + 'בוחרים <b>' + st.attr + '</b> (IG הגבוה ביותר, ' + st.rows + ' דוגמאות):' }));
        explain.appendChild(igBars(st.gains, st.attr));
      } else explain.appendChild(el('p', { class: 'gx-prompt', html: '🍄 עלה: <b>' + (st.value ? 'אכיל ✓' : 'רעיל ✗') + '</b> (' + st.rows + ' דוגמאות, קבוצה טהורה)' }));
    }
  });
}

/* ---------- נגן חצייה (רצף מצבים + גדות) ---------- */
function drawBanks(host, data, state) {
  const bank = (title, cls) => { const b = el('div', { class: 'gx-bank' + cls }); b.appendChild(el('div', { class: 'gx-bank-title', text: title })); const it = el('div', { class: 'gx-bank-items' }); b.appendChild(it); return { b, it }; };
  const L = bank('גדה שמאלית', ''), R = bank('גדה ימנית', ' right');
  state.forEach((side, k) => (side === 'L' ? L.it : R.it).appendChild(el('span', { title: data.labels[k], text: data.icons[k] })));
  const water = el('div', { class: 'gx-water' });
  const boat = el('span', { class: 'gx-boat', text: '⛵' }); boat.style.top = state[0] === 'L' ? '62%' : '18%';
  water.appendChild(boat);
  host.appendChild(el('div', { class: 'gx-river' }, [R.b, water, L.b]));
}
export function riverPlayer(host, data) {
  stepController(host, {
    title: data.name,
    total: data.states.length,
    renderStep: (i, viz, explain) => {
      viz.innerHTML = ''; explain.innerHTML = '';
      drawBanks(viz, data, data.states[i].s);
      explain.appendChild(el('p', { class: 'gx-prompt', html: (i === 0 ? '' : 'חצייה ' + i + ': ') + data.states[i].action }));
    }
  });
}

/* ---------- נגן נאש (טהור + מעורב) ---------- */
function matrixTableP(m, nashSet, paretoSet) {
  const cell = u => '<span style="color:#b23b3b">' + u[0] + '</span>, <span style="color:#1b7f5a">' + u[1] + '</span>';
  const t = el('table', { class: 'gx-matrix' });
  t.appendChild(el('tr', {}, [el('th', { text: '' }), ...m.cols.map(c => el('th', { html: (m.colName ? m.colName[c] + '<br>' : '') + '(' + c + ')' }))]));
  m.rows.forEach(r => t.appendChild(el('tr', {}, [el('th', { html: (m.rowName ? m.rowName[r] + '<br>' : '') + '(' + r + ')' }),
    ...m.cols.map(c => el('td', { class: (nashSet && nashSet.has(r + c) ? 'nash' : '') + (paretoSet && paretoSet.has(r + c) ? ' pareto' : ''), html: cell(m.pay[r][c]) }))])));
  return t;
}
export function nashPlayer(host, m) {
  const sol = matrixSolve(m), is2x2 = m.rows.length === 2 && m.cols.length === 2;
  const total = is2x2 && sol.mixed && sol.mixed.q != null ? 3 : 1;
  stepController(host, {
    title: m.title + ' · נאש',
    total,
    renderStep: (i, viz, explain) => {
      viz.innerHTML = ''; explain.innerHTML = '';
      viz.appendChild(matrixTableP(m, new Set(sol.pureNash.map(([r, c]) => r + c))));
      if (i === 0) {
        explain.appendChild(el('p', { class: 'gx-prompt', html: '<b>נאש טהורים</b> (מסומנים ירוק — best-response לשני השחקנים): ' + (sol.pureNash.length ? sol.pureNash.map(([r, c]) => '(' + r + ',' + c + ')').join(' · ') : 'אין') }));
      } else {
        const r0 = m.rows[0], r1 = m.rows[1], c0 = m.cols[0], c1 = m.cols[1];
        const a = m.pay[r0][c0][0], b = m.pay[r0][c1][0], c = m.pay[r1][c0][0], d = m.pay[r1][c1][0];
        explain.appendChild(el('div', { class: 'gx-calc' }, [
          el('div', { class: 'lead', text: 'שיווי משקל מעורב — שיטת האדישות (q = הסתברות שהיריב משחק ' + c0 + '):' }),
          el('div', { class: 'expr', html: 'E[' + r0 + '] = q·(' + a + ') + (1−q)·(' + b + ')' }),
          el('div', { class: 'expr', html: 'E[' + r1 + '] = q·(' + c + ') + (1−q)·(' + d + ')' }),
          i >= 2 ? el('div', { class: 'expr', html: 'משווים → <b>q = ' + sol.mixed.q + '</b> (כל שחקן משחק ' + c0 + ' בהסתברות ' + sol.mixed.q + ')' }) : el('div', { class: 'expr', style: { color: 'var(--muted)' }, text: 'משווים E[' + r0 + '] = E[' + r1 + '] ופותרים ל-q…' })
        ]));
      }
    }
  });
}

/* ---------- נגן למידת-מושג (Version Space מבוסס-היררכיה) ---------- */
function hierLayout(tree) {
  let leafN = 0; (function c(n) { (n.children && n.children.length) ? n.children.forEach(c) : leafN++; })(tree);
  let maxD = 0; (function d(n, dep) { maxD = Math.max(maxD, dep); (n.children || []).forEach(ch => d(ch, dep + 1)); })(tree, 0);
  const xGap = 66, yGap = 62, padX = 42, padTop = 20;
  const nodes = {}, edges = []; let lx = 0;
  (function rec(n, dep) {
    let x;
    if (!(n.children && n.children.length)) { x = padX + lx * xGap; lx++; }
    else { const cs = n.children.map(ch => rec(ch, dep + 1)); x = cs.reduce((s, c) => s + c.x, 0) / cs.length; n.children.forEach(ch => edges.push([n.name, ch.name])); }
    nodes[n.name] = { name: n.name, x, y: padTop + dep * yGap, depth: dep, isLeaf: !(n.children && n.children.length) };
    return nodes[n.name];
  })(tree, 0);
  return { nodes, edges, W: padX * 2 + Math.max(0, leafN - 1) * xGap, H: padTop + maxD * yGap + 22 };
}
function hierAnc(tree) { const parent = {}; (function w(n, p) { parent[n.name] = p; (n.children || []).forEach(c => w(c, n.name)); })(tree, null); return name => { const a = []; let x = name; while (x != null) { a.push(x); x = parent[x]; } return a; }; }
function drawHier(dimName, tree, hi) {
  const L = hierLayout(tree);
  const s = svg('svg', { class: 'gx-hier', viewBox: '0 0 ' + L.W + ' ' + L.H, width: L.W, height: L.H, preserveAspectRatio: 'xMidYMid meet' });
  L.edges.forEach(([p, c]) => { const a = L.nodes[p], b = L.nodes[c]; s.appendChild(svg('line', { x1: a.x, y1: a.y + 11, x2: b.x, y2: b.y - 11, stroke: '#c2c9da', 'stroke-width': 1.6 })); });
  Object.values(L.nodes).forEach(nd => {
    const isS = hi.sSet.has(nd.name), isG = hi.gSet.has(nd.name), inBand = hi.bandSet.has(nd.name);
    let fill = '#fff', stroke = '#cfd6e6', sw = 1.5, tcol = '#9aa3b4';
    if (inBand) { fill = '#eef3ff'; stroke = '#c3d0f0'; tcol = '#3a4a6b'; }
    if (isG) { stroke = 'var(--primary)'; sw = 2.6; fill = isS ? 'var(--ok-soft)' : '#e9efff'; tcol = '#1f2a44'; }
    if (isS && !isG) { fill = 'var(--ok-soft)'; stroke = 'var(--ok)'; sw = 2.6; tcol = '#14603f'; }
    if (isS && isG) { stroke = 'var(--ok)'; sw = 3.2; fill = 'var(--ok-soft)'; tcol = '#14603f'; }
    const w = Math.max(30, nd.name.length * 7.4 + 14);
    s.appendChild(svg('rect', { x: nd.x - w / 2, y: nd.y - 12, width: w, height: 24, rx: 7, fill, stroke, 'stroke-width': sw }));
    s.appendChild(svg('text', { x: nd.x, y: nd.y + 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: tcol }, nd.name));
    if (isS || isG) s.appendChild(svg('text', { x: nd.x - w / 2 - 4, y: nd.y + 4, 'text-anchor': 'end', 'font-size': 10.5, 'font-weight': 800, fill: isS ? 'var(--ok)' : 'var(--primary)' }, isS && isG ? 'S=G' : isS ? 'S' : 'G'));
    if (hi.instLeaf && hi.instLeaf === nd.name) {
      const col = hi.pos ? 'var(--ok)' : 'var(--warn)';
      s.appendChild(svg('circle', { cx: nd.x + w / 2 + 1, cy: nd.y - 12, r: 8, fill: col, stroke: '#fff', 'stroke-width': 1.5 }));
      s.appendChild(svg('text', { x: nd.x + w / 2 + 1, y: nd.y - 8, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 900, fill: '#fff' }, hi.pos ? '+' : '−'));
    }
  });
  return el('div', { class: 'gx-hier-wrap' }, [el('div', { class: 'gx-hier-dim', text: dimName }), s]);
}
export function vspacePlayer(host, problem) {
  const sol = hierarchyVS(problem);
  const ancs = problem.dims.map(d => hierAnc(d.tree));
  const fmtC = c => '[' + c.join(', ') + ']';
  const shortAct = a => a.includes('הכללת S') ? a.replace('הכללת S: ', 'S↑ ') : a.includes('צמצום G') ? a.replace('צמצום G: ', 'G↓ ') : a.includes('אתחול S') ? 'אתחול S' : a.includes('הסרנו מ-G') ? 'סינון G' : a.includes('הסרנו מ-S') ? 'סינון S' : a.includes('התחלה') ? 'התחלה' : a;
  const colorAct = a => a.replace(/הכללת S/g, '<b style="color:var(--ok)">הכללת S</b>').replace(/צמצום G/g, '<b style="color:var(--primary)">צמצום G</b>');
  stepController(host, {
    title: problem.name + ' · Version Space (S↑ ירוק / G↓ כחול)',
    total: sol.steps.length,
    renderStep: (i, viz, explain) => {
      viz.innerHTML = ''; explain.innerHTML = '';
      const step = sol.steps[i];
      const head = el('div', { class: 'gx-vs-ex' });
      if (step.inst) { head.append(el('span', { class: 'gx-vs-chip ' + (step.pos ? 'pos' : 'neg'), html: step.pos ? '➕ חיובית' : '➖ שלילית' }), el('span', { class: 'gx-vs-inst', text: step.inst.join(' , ') })); }
      else head.appendChild(el('span', { class: 'gx-vs-chip start', text: 'מצב התחלה' }));
      viz.appendChild(head);
      const panels = el('div', { class: 'gx-hier-panels' });
      problem.dims.forEach((d, di) => {
        const sSet = new Set(step.S.map(c => c[di])), gSet = new Set(step.G.map(c => c[di])), anc = ancs[di], bandSet = new Set();
        (function all(n) { const anN = anc(n.name); if ([...gSet].some(g => anN.includes(g)) && [...sSet].some(sv => anc(sv).includes(n.name))) bandSet.add(n.name); (n.children || []).forEach(all); })(d.tree);
        panels.appendChild(drawHier(d.name, d.tree, { sSet, gSet, bandSet, instLeaf: step.inst ? step.inst[di] : null, pos: step.pos }));
      });
      viz.appendChild(panels);
      const actWrap = el('div', {});
      step.actions.forEach(a => actWrap.appendChild(el('div', { class: 'gx-vs-act', html: colorAct(a) })));
      explain.appendChild(actWrap);
      explain.appendChild(el('div', { class: 'gx-vs-bounds' }, [
        el('div', { class: 'sb', html: '<b>S</b> (ספציפי · ירוק): ' + (step.S.length ? step.S.map(fmtC).join('  ·  ') : '∅') }),
        el('div', { class: 'gb', html: '<b>G</b> (כללי · כחול): ' + (step.G.length ? step.G.map(fmtC).join('  ·  ') : '∅') })
      ]));
      if (sol.converged && i === sol.steps.length - 1) explain.appendChild(el('div', { class: 'gx-vs-done', html: '🎯 גבולות S ו-G התלכדו — <b>המושג הנלמד: ' + fmtC(sol.concept) + '</b>' }));
      const hist = el('div', { class: 'gx-vs-hist' }, [el('div', { class: 'gx-vs-hist-title', text: '🕘 היסטוריית צעדים (הכללה/צמצום)' })]);
      sol.steps.forEach((st, k) => {
        if (k > i) return;
        const badge = st.inst ? (st.pos ? '➕' : '➖') : '•', label = st.inst ? st.inst.join(',') : 'התחלה';
        hist.appendChild(el('div', { class: 'gx-vs-hrow' + (k === i ? ' cur' : '') + (st.inst ? (st.pos ? ' pos' : ' neg') : ''), html: '<span class="b">' + badge + '</span> <b>' + label + '</b> <span class="a">' + (st.actions.length ? st.actions.map(shortAct).join(' · ') : '—') + '</span><span class="sg">S=' + (st.S.length ? st.S.map(fmtC).join('/') : '∅') + ' · G=' + (st.G.length ? st.G.map(fmtC).join('/') : '∅') + '</span>' }));
      });
      explain.appendChild(hist);
    }
  });
}
