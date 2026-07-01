// ============================================================
// games-player.js — נגני-פתרון אינטראקטיביים (שלב-אחר-שלב)
// לשימוש בעמוד "פתרונות תרגילים". ללא ניקוד — צפייה מודרכת.
// ============================================================
import { el, svg, segmented } from './games-core.js';
import { searchTreeSteps, minimaxSolve, id3Solve } from './games-engine.js';

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
        const isGoal = step.expand === graph.goal;
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
