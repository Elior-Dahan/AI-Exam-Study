// ============================================================
// games-engine.js — סולברים גנריים + מנוע רמות
// (מחשב תשובות מהנתונים → סבב חדש = רק דאטה חדש, נכונות מובטחת)
// ============================================================
import { el, Scoreboard, winModal, toast, btn, getStars, setStars } from './games-core.js';
import { adjacency } from './games-data.js';

/* ============================================================
   1. סולבר חיפוש
   ============================================================ */
export function searchSteps(graph, algo) {
  const adj = adjacency(graph);
  const start = graph.start, goal = graph.goal, h = graph.h || {};
  let frontier = [{ node: start, g: 0, parent: null }];
  const inFrontier = new Map([[start, 0]]);
  const expanded = [], expandedSet = new Set();
  const steps = [];
  let goalNode = null;

  const value = it => algo === 'UCS' ? it.g : algo === 'Greedy' ? h[it.node] : algo === 'A*' ? it.g + h[it.node] : 0;
  const pick = () => {
    if (algo === 'BFS') return 0;
    if (algo === 'DFS') return frontier.length - 1;
    let bi = 0;
    for (let i = 1; i < frontier.length; i++) {
      const va = value(frontier[i]), vb = value(frontier[bi]);
      if (va < vb || (va === vb && frontier[i].node < frontier[bi].node)) bi = i;
    }
    return bi;
  };

  while (frontier.length) {
    const snap = frontier.map(f => ({ node: f.node, g: f.g, v: value(f) }));
    const idx = pick();
    const cur = frontier[idx];
    steps.push({ frontier: snap, expand: cur.node, g: cur.g });
    frontier.splice(idx, 1); inFrontier.delete(cur.node);
    expanded.push(cur.node); expandedSet.add(cur.node);
    if (cur.node === goal) { goalNode = cur; break; }
    // DFS: מחסנית (LIFO) — דוחפים בסדר הפוך כדי שהאלפביתי-ראשון ייפתח ראשון
    const nbrs = algo === 'DFS' ? [...adj[cur.node]].reverse() : adj[cur.node];
    for (const [nb, w] of nbrs) {
      if (expandedSet.has(nb)) continue;
      const ng = cur.g + w;
      if (algo === 'UCS' || algo === 'A*') {
        if (inFrontier.has(nb) && inFrontier.get(nb) <= ng) continue;
        frontier = frontier.filter(f => f.node !== nb);
        frontier.push({ node: nb, g: ng, parent: cur }); inFrontier.set(nb, ng);
      } else {
        if (inFrontier.has(nb)) continue;
        frontier.push({ node: nb, g: ng, parent: cur }); inFrontier.set(nb, ng);
      }
    }
  }
  let path = [], cost = 0;
  if (goalNode) { let n = goalNode; while (n) { path.unshift(n.node); n = n.parent; } cost = goalNode.g; }
  return { order: expanded, steps, path, cost, found: !!goalNode };
}

// IDS: DFS מוגבל-עומק עם עומק גדל. tree-search (מניעת מעגלים לפי המסלול הנוכחי).
export function idsSteps(graph) {
  const adj = adjacency(graph), start = graph.start, goal = graph.goal;
  const steps = []; let found = false, foundLimit = null;
  for (let limit = 0; limit < 40 && !found; limit++) {
    const stack = [{ node: start, depth: 0, path: [start] }];
    while (stack.length) {
      const snap = stack.map(s => s.node);
      const cur = stack.pop();
      steps.push({ expand: cur.node, limit, depth: cur.depth, frontier: snap, newIter: steps.length === 0 || steps[steps.length - 1].limit !== limit });
      if (cur.node === goal) { found = true; foundLimit = limit; break; }
      if (cur.depth < limit) {
        const nbrs = [...adj[cur.node]].reverse(); // אלפביתי-ראשון בראש המחסנית
        for (const [nb] of nbrs) if (!cur.path.includes(nb)) stack.push({ node: nb, depth: cur.depth + 1, path: [...cur.path, nb] });
      }
    }
    if (found) break;
  }
  return { steps, found, foundLimit };
}

export function shortestToGoal(graph) {
  const adj = adjacency(graph), goal = graph.goal, dist = {};
  for (const n in graph.nodes) dist[n] = Infinity;
  dist[goal] = 0;
  const pq = [[0, goal]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;
    for (const [v, w] of adj[u]) if (d + w < dist[v]) { dist[v] = d + w; pq.push([dist[v], v]); }
  }
  return dist;
}
export function isAdmissible(graph, hTable) {
  const hstar = shortestToGoal(graph), bad = [];
  for (const n in graph.nodes) if ((hTable[n] || 0) > hstar[n] + 1e-9) bad.push(n);
  return { admissible: bad.length === 0, violations: bad, hstar };
}

/* ============================================================
   2. סולבר מינימקס + Alpha-Beta
   ============================================================ */
export function minimaxSolve(tree) {
  const rootMax = tree.root !== 'MIN';
  const leafValues = [];
  (function seq(n) { Array.isArray(n) ? n.forEach(seq) : leafValues.push(n); })(tree.t);

  function mm(node, isMax) {
    if (!Array.isArray(node)) return node;
    const vals = node.map(ch => mm(ch, !isMax));
    return isMax ? Math.max(...vals) : Math.min(...vals);
  }
  let li = 0; const pruned = [];
  function markLeaves(node) { if (!Array.isArray(node)) { pruned.push(li); li++; } else node.forEach(markLeaves); }
  function ab(node, isMax, alpha, beta) {
    if (!Array.isArray(node)) { li++; return node; }
    let best = isMax ? -Infinity : Infinity;
    for (let k = 0; k < node.length; k++) {
      const v = ab(node[k], !isMax, alpha, beta);
      if (isMax) { best = Math.max(best, v); alpha = Math.max(alpha, v); }
      else { best = Math.min(best, v); beta = Math.min(beta, v); }
      if (alpha >= beta) { for (let j = k + 1; j < node.length; j++) markLeaves(node[j]); break; }
    }
    return best;
  }
  const rootValue = mm(tree.t, rootMax);
  li = 0; ab(tree.t, rootMax, -Infinity, Infinity);
  const childVals = tree.t.map(ch => mm(ch, !rootMax));
  const bestChild = rootMax
    ? childVals.indexOf(Math.max(...childVals))
    : childVals.indexOf(Math.min(...childVals));
  return { rootValue, childVals, prunedLeafIndices: pruned, leafValues, bestChild, rootMax };
}

/* ============================================================
   3. סולבר ID3 (אנטרופיה / IG / עץ / סיווג)
   ============================================================ */
function _entropy(rows, target) {
  const n = rows.length; if (!n) return 0;
  const pos = rows.filter(r => r[target] === 1).length, neg = n - pos;
  const t = x => x === 0 ? 0 : -x * Math.log2(x);
  return t(pos / n) + t(neg / n);
}
function _gain(rows, attr, target) {
  const H = _entropy(rows, target), n = rows.length;
  const vals = [...new Set(rows.map(r => r[attr]))];
  let rem = 0;
  for (const v of vals) { const sub = rows.filter(r => r[attr] === v); rem += (sub.length / n) * _entropy(sub, target); }
  return H - rem;
}
export function id3Solve(dataset) {
  const { attrs, target, rows } = dataset;
  const rootGains = {}; attrs.forEach(a => rootGains[a] = _gain(rows, a, target));
  const best = attrs.reduce((b, a) => rootGains[a] > rootGains[b] ? a : b, attrs[0]);
  function build(rs, avail) {
    if (!rs.length) return { leaf: null };
    const pos = rs.filter(r => r[target] === 1).length;
    if (pos === rs.length) return { leaf: 1 };
    if (pos === 0) return { leaf: 0 };
    if (!avail.length) return { leaf: pos >= rs.length - pos ? 1 : 0 };
    let bg = avail[0], bv = -1;
    for (const a of avail) { const g = _gain(rs, a, target); if (g > bv) { bv = g; bg = a; } }
    const vals = [...new Set(rs.map(r => r[bg]))].sort();
    const children = {};
    for (const v of vals) children[v] = build(rs.filter(r => r[bg] === v), avail.filter(x => x !== bg));
    return { attr: bg, children };
  }
  const tree = build(rows, attrs.slice());
  function classify(inst) { let node = tree; while (node.attr !== undefined) { node = node.children[inst[node.attr]] || { leaf: null }; } return node.leaf; }
  return {
    entropy: rs => _entropy(rs, target),
    gain: (rs, a) => _gain(rs, a, target),
    rootGains, best, tree, classify, target, attrs, rows
  };
}

/* ============================================================
   4. סולבר מטריצת תשלומים (נאש/IESDS/Pareto/Maximin/מעורב)
   ============================================================ */
function _iesds(m) {
  let R = m.rows.slice(), C = m.cols.slice();
  const steps = []; let changed = true;
  while (changed && (R.length > 1 || C.length > 1)) {
    changed = false;
    for (const r of R) { for (const r2 of R) { if (r2 === r) continue;
      if (C.every(c => m.pay[r2][c][0] > m.pay[r][c][0])) { steps.push({ player: 1, removed: r, by: r2 }); R = R.filter(x => x !== r); changed = true; break; } } if (changed) break; }
    if (changed) continue;
    for (const c of C) { for (const c2 of C) { if (c2 === c) continue;
      if (R.every(r => m.pay[r][c2][1] > m.pay[r][c][1])) { steps.push({ player: 2, removed: c, by: c2 }); C = C.filter(x => x !== c); changed = true; break; } } if (changed) break; }
  }
  return { steps, finalRows: R, finalCols: C };
}
export function matrixSolve(m) {
  const R = m.rows, C = m.cols;
  const pureNash = [];
  for (const r of R) for (const c of C) {
    const u1 = m.pay[r][c][0], u2 = m.pay[r][c][1];
    const p1best = Math.max(...R.map(rr => m.pay[rr][c][0]));
    const p2best = Math.max(...C.map(cc => m.pay[r][cc][1]));
    if (u1 === p1best && u2 === p2best) pureNash.push([r, c]);
  }
  const cells = [];
  for (const r of R) for (const c of C) cells.push({ r, c, u: m.pay[r][c] });
  const pareto = cells.filter(a => !cells.some(b =>
    b.u[0] >= a.u[0] && b.u[1] >= a.u[1] && (b.u[0] > a.u[0] || b.u[1] > a.u[1]))).map(a => [a.r, a.c]);
  const p1row = R.reduce((bst, r) => { const mn = Math.min(...C.map(c => m.pay[r][c][0])); return mn > bst.v ? { k: r, v: mn } : bst; }, { k: R[0], v: -Infinity });
  const p2col = C.reduce((bst, c) => { const mn = Math.min(...R.map(r => m.pay[r][c][1])); return mn > bst.v ? { k: c, v: mn } : bst; }, { k: C[0], v: -Infinity });
  let mixed = null;
  if (R.length === 2 && C.length === 2) {
    const a = m.pay[R[0]][C[0]][0], b = m.pay[R[0]][C[1]][0], c = m.pay[R[1]][C[0]][0], d = m.pay[R[1]][C[1]][0];
    const dq = a - b - c + d, q = dq !== 0 ? (d - b) / dq : null;
    const a2 = m.pay[R[0]][C[0]][1], b2 = m.pay[R[0]][C[1]][1], c2 = m.pay[R[1]][C[0]][1], d2 = m.pay[R[1]][C[1]][1];
    const dp = a2 - b2 - c2 + d2, p = dp !== 0 ? (d2 - c2) / dp : null;
    mixed = { q, p }; // q = הסתברות עמודה ראשונה ; p = הסתברות שורה ראשונה
  }
  return { pureNash, pareto, maximin: { p1: p1row.k, p1val: p1row.v, p2: p2col.k, p2val: p2col.v }, iesds: _iesds(m), mixed };
}

/* ============================================================
   4b. סולבר רשת נוירונים (forward + backprop, רשת 1 שכבה נסתרת)
   ============================================================ */
// cfg: { x:[...], W1:[[w per input]...hidden], b1:[...], W2:[[w per hidden]...out], b2:[...], target:[...], lr }
export function nnSolve(cfg) {
  const sig = z => 1 / (1 + Math.exp(-z));
  const { x, W1, b1, W2, b2, target: t, lr } = cfg;
  const Ih = b1.map((b, j) => b + W1[j].reduce((s, w, i) => s + w * x[i], 0));
  const Oh = Ih.map(sig);
  const Io = b2.map((b, k) => b + W2[k].reduce((s, w, j) => s + w * Oh[j], 0));
  const Oo = Io.map(sig);
  const Eo = Oo.map((o, k) => o * (1 - o) * (t[k] - o));
  const Eh = Oh.map((o, j) => o * (1 - o) * W2.reduce((s, row, k) => s + Eo[k] * row[j], 0));
  const W2n = W2.map((row, k) => row.map((w, j) => w + lr * Eo[k] * Oh[j]));
  const b2n = b2.map((b, k) => b + lr * Eo[k]);
  const W1n = W1.map((row, j) => row.map((w, i) => w + lr * Eh[j] * x[i]));
  const b1n = b1.map((b, j) => b + lr * Eh[j]);
  return { Ih, Oh, Io, Oo, Eo, Eh, W1n, b1n, W2n, b2n };
}

/* ============================================================
   4c. סולבר Candidate-Elimination (גבולות S ו-G לכל דאטהסט)
   ============================================================ */
// ds: { attrs:[...], domains:{attr:[vals]}, examples:[{vals:[...], label:'+'/'-'}] }
export function candidateElim(ds) {
  const { examples, domains, attrs } = ds, n = attrs.length;
  const clone = a => a.map(h => h.slice());
  const covers = (h, x) => h.every((c, i) => c === '?' || c === x[i]);
  const geq = (a, b) => a.every((c, i) => c === '?' || c === b[i]); // a כללי-יותר-או-שווה ל-b
  const eq = (a, b) => a.every((c, i) => c === b[i]);
  const dedup = arr => { const out = []; for (const h of arr) if (!out.some(o => eq(o, h))) out.push(h); return out; };
  let S = [Array(n).fill('∅')], G = [Array(n).fill('?')];
  const evo = [{ S: clone(S), G: clone(G) }];
  for (const ex of examples) {
    const x = ex.vals;
    if (ex.label === '+') {
      G = G.filter(g => covers(g, x));
      let newS = [];
      for (const s of S) {
        if (s.includes('∅')) { if (G.some(g => geq(g, x))) newS.push(x.slice()); }
        else if (covers(s, x)) newS.push(s);
        else { const h = s.map((c, i) => c === x[i] ? c : '?'); if (G.some(g => geq(g, h))) newS.push(h); }
      }
      S = dedup(newS.filter((h, i) => !newS.some((h2, j) => i !== j && geq(h, h2) && !eq(h, h2))));
    } else {
      S = S.filter(s => !covers(s, x));
      let newG = [];
      for (const g of G) {
        if (!covers(g, x)) { newG.push(g); continue; }
        for (let i = 0; i < n; i++) {
          if (g[i] !== '?') continue;
          for (const v of domains[attrs[i]]) {
            if (v === x[i]) continue;
            const h = g.slice(); h[i] = v;
            if (S.some(s => geq(h, s))) newG.push(h);
          }
        }
      }
      G = dedup(newG.filter((h, i) => !newG.some((h2, j) => i !== j && geq(h2, h) && !eq(h2, h))));
    }
    evo.push({ S: clone(S), G: clone(G) });
  }
  const concept = (S.length === 1 && G.length === 1 && eq(S[0], G[0])) ? S[0] : null;
  return { evolution: evo, concept, attrs };
}

/* ============================================================
   5. מנוע הרמות
   ============================================================ */
export function runLevels(cfg) {
  const mount = cfg.mount || document.getElementById('game-root');

  function totalStars() { return cfg.levels.reduce((s, lv) => s + getStars(cfg.gameId + '_L' + lv.key), 0); }

  function levelSelect() {
    mount.innerHTML = '';
    mount.appendChild(el('p', { class: 'gx-levels-sub', text: '⭐ ' + totalStars() + ' / ' + (cfg.levels.length * 3) + ' כוכבים · בחר רמה:' }));
    const grid = el('div', { class: 'gx-levels' });
    cfg.levels.forEach((lv, i) => {
      const stars = getStars(cfg.gameId + '_L' + lv.key);
      const prev = i === 0 ? 1 : getStars(cfg.gameId + '_L' + cfg.levels[i - 1].key);
      const locked = prev === 0;
      const card = el('div', { class: 'gx-level-card' + (locked ? ' locked' : ''), onclick: locked ? null : () => runLevel(lv) }, [
        el('div', { class: 'gx-level-badge', text: lv.badge }),
        el('h3', { text: lv.name, style: { margin: '6px 0 2px' } }),
        el('p', { text: lv.desc, style: { fontSize: '13px', color: 'var(--muted)', margin: '0 0 8px' } }),
        el('div', { class: 'gx-level-stars', html: locked ? '🔒 השלם את הרמה הקודמת' : ('★'.repeat(stars) + '☆'.repeat(3 - stars)) })
      ]);
      grid.appendChild(card);
    });
    mount.appendChild(grid);
  }

  async function runLevel(lv) {
    mount.innerHTML = '';
    const score = new Scoreboard(cfg.gameId + '_' + lv.key);
    let misses = 0;
    const head = el('div', { class: 'gx-round-head' });
    const host = el('div', { class: 'gx-board' });
    mount.append(
      el('div', { class: 'gx-row', style: { justifyContent: 'flex-start' } }, [btn('← חזרה לרמות', () => levelSelect(), 'gx-btn-ghost')]),
      score.el, head, host
    );
    const N = lv.rounds.length;
    for (let i = 0; i < N; i++) {
      head.innerHTML = '🔹 סבב ' + (i + 1) + ' מתוך ' + N + (lv.rounds[i].title ? ' · ' + lv.rounds[i].title : '');
      host.innerHTML = '';
      await new Promise(res => lv.rounds[i].play(host, {
        score, data: lv.rounds[i].data,
        addMiss: () => { misses++; },
        done: () => res()
      }));
    }
    const stars = misses === 0 ? 3 : misses <= 2 ? 2 : 1;
    setStars(cfg.gameId + '_L' + lv.key, stars);
    winModal({
      title: 'רמה הושלמה — ' + lv.name, stars,
      html: '<p>ניקוד הרמה: <b>' + score.score + '</b></p><p style="color:#5b6478">' + (misses === 0 ? '🌟 ללא טעויות!' : 'טעויות: ' + misses) + '</p>',
      onClose: () => levelSelect()
    });
  }

  levelSelect();
}

/* ============================================================
   בדיקת-עוגן (להרצה מהקונסול): engineSelfTest()
   ============================================================ */
export async function engineSelfTest() {
  const data = await import('./games-data.js');
  const sa = searchSteps(data.SEARCH_GRAPHS[0], 'A*');
  const mm = minimaxSolve(data.MINIMAX_TREES[0]);
  const id3 = id3Solve({ attrs: data.PLAYTENNIS.attrs, target: 'Play', rows: data.PLAYTENNIS.rows });
  const pd = matrixSolve(data.GT_MATRICES.pd);
  const ie = matrixSolve(data.GT_MATRICES.iesds3);
  return {
    search_Astar: { path: sa.path.join(','), cost: sa.cost, steps: sa.steps.length },     // expect cost 6
    search_DFS_g0: searchSteps(data.SEARCH_GRAPHS[0], 'DFS').order.join(','),              // expect S,A,C,G (alphabetical-first)
    ids_g1: idsSteps(data.SEARCH_GRAPHS[1]).steps.map(s => s.expand).join(','),
    ids_found_limit: idsSteps(data.SEARCH_GRAPHS[1]).foundLimit,
    g3_admissible: isAdmissible(data.SEARCH_GRAPHS[3], data.SEARCH_GRAPHS[3].h).admissible, // expect true
    minimax_t0: { root: mm.rootValue, prunedValues: mm.prunedLeafIndices.map(i => mm.leafValues[i]), best: mm.bestChild }, // expect root 4, pruned [7,5]
    minimax_t1: { root: minimaxSolve(data.MINIMAX_TREES[1]).rootValue },
    minimax_t2: { root: minimaxSolve(data.MINIMAX_TREES[2]).rootValue },
    id3: { best: id3.best, gainOutlook: +id3.rootGains.Outlook.toFixed(3) },               // expect Outlook, 0.247
    id3_toy: (() => { const t = id3Solve(data.DTREE_TOY); return { best: t.best }; })(),
    pd_nash: JSON.stringify(pd.pureNash), pd_pareto: JSON.stringify(pd.pareto),            // nash D,D ; pareto excludes D,D
    iesds_final: 'R=' + ie.iesds.finalRows + ' C=' + ie.iesds.finalCols,                  // expect A / X
    chicken_q: matrixSolve(data.GT_MATRICES.chicken).mixed.q,                              // expect 0.9
    chicken2_q: matrixSolve(data.GT_MATRICES.chicken2).mixed.q,                            // expect 0.6
    maximin: (() => { const r = matrixSolve(data.GT_MATRICES.maximin1).maximin; return 'p1=' + r.p1 + ' p2=' + r.p2; })(),
    nn_aima: (() => { const r = nnSolve(data.NN_CONFIGS[0]); return { Oo: +r.Oo[0].toFixed(3), Eo: +r.Eo[0].toFixed(4), w46: +r.W2n[0][0].toFixed(3) }; })(), // O≈0.474, Eo≈0.1311, w46≈-0.261
    ce_a: (() => { const c = candidateElim(data.VSPACE_SETS[2]).concept; return c ? c.join(',') : 'no'; })(),   // expect Eden,?,?,cheap
    ce_b: (() => { const c = candidateElim(data.VSPACE_SETS[1]).concept; return c ? c.join(',') : 'no'; })(),   // expect ?,lunch,?,cheap
    ce_shapes: (() => { const c = candidateElim(data.VSPACE_SETS[0]).concept; return c ? c.join(',') : 'no'; })() // expect circle,?,big
  };
}
