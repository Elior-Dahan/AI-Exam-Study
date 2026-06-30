// ============================================================
// games-data.js — כל הנתונים של המשחקים (מתוך עמודי הנושאים)
// ============================================================

// ---------- חיפוש: הגרף (זהה לעמודי 01/02) ----------
export const SEARCH_GRAPH = {
  nodes: {
    S: { x: 280, y: 45,  start: true },
    A: { x: 150, y: 140 },
    B: { x: 410, y: 140 },
    C: { x: 90,  y: 245 },
    D: { x: 280, y: 245 },
    G: { x: 235, y: 330, goal: true }
  },
  // קשתות לא-מכוונות עם עלות
  edges: [
    ['S', 'A', 1], ['S', 'B', 4],
    ['A', 'C', 2], ['A', 'D', 5],
    ['B', 'D', 1],
    ['C', 'G', 3], ['D', 'G', 1]
  ],
  h: { S: 5, A: 4, B: 2, C: 2, D: 1, G: 0 },
  start: 'S',
  goal: 'G'
};

// רשימת שכנים ממוינת אלפביתית (נגזר מהקשתות)
export function adjacency(graph) {
  const adj = {};
  for (const n in graph.nodes) adj[n] = [];
  for (const [u, v, w] of graph.edges) {
    adj[u].push([v, w]);
    adj[v].push([u, w]);
  }
  for (const n in adj) adj[n].sort((a, b) => a[0].localeCompare(b[0]));
  return adj;
}

// ---------- מינימקס: העץ (זהה לעמוד 03 / מבחן הדוגמה) ----------
export const MINIMAX_TREE = {
  // שלוש קבוצות עלים תחת שלושה צמתי MIN, משמאל לימין
  groups: [[3, 7, 8], [10, 8, 4], [2, 7, 5]]
  // ערכי MIN = 3,4,2 ; שורש MAX = 4 ; גיזום: העלים 7,5 (תחת MIN3)
};

// ---------- תורת המשחקים ----------
// תשלום [שורה][עמודה] = [u1, u2]
export const PD_MATRIX = {
  title: 'דילמת האסיר',
  rows: ['C', 'D'], cols: ['C', 'D'],
  rowName: { C: 'שתף פעולה', D: 'בגוד' },
  pay: { C: { C: [3, 3], D: [0, 5] }, D: { C: [5, 0], D: [1, 1] } },
  nash: [['D', 'D']]
};
export const IESDS = {
  title: 'מחיקת אסטרטגיות נשלטות',
  rows: ['A', 'B', 'C'], cols: ['X', 'Y', 'Z'],
  pay: {
    A: { X: [4, 3], Y: [5, 1], Z: [6, 2] },
    B: { X: [2, 1], Y: [8, 4], Z: [3, 6] },
    C: { X: [3, 0], Y: [9, 6], Z: [2, 8] }
  },
  nash: [['A', 'X']]
};

// ---------- Version Space: דוגמת הקלפים (עמוד 05) ----------
// ערך: 7..10 = N (מספר), A/J/Q/K = F (לא-מספר). צורה: ♥♦ = R, ♣♠ = B.
export const VERSION_SPACE = {
  examples: [
    { card: '7♦', val: '7', suit: '♦', label: '+' },
    { card: 'A♣', val: 'A', suit: '♣', label: '-' },
    { card: 'Q♥', val: 'Q', suit: '♥', label: '-' },
    { card: '9♥', val: '9', suit: '♥', label: '+' },
    { card: '8♣', val: '8', suit: '♣', label: '-' }
  ],
  // S ו-G אחרי כל דוגמה (לאימות)
  evolution: [
    { S: ['[7,D]'], G: ['[?,?]'] },
    { S: ['[7,D]'], G: ['[N,?]', '[?,R]'] },
    { S: ['[7,D]'], G: ['[N,?]', '[?,D]'] },
    { S: ['[N,R]'], G: ['[N,?]'] },
    { S: ['[N,R]'], G: ['[N,R]'] }
  ],
  concept: '[N,R]'
};

// ---------- רשת נוירונים (עמוד 06) ----------
export const NN_CONFIG = {
  // קלט→נסתר
  w: { w11: 0.5, w21: 0.1, w12: 0.3, w22: 0.8 },
  // נסתר→פלט
  v: { v1: 0.2, v2: 0.9 },
  x: { x1: 1, x2: 0 },
  t: 1,
  eta: 0.3
};

// ---------- עצי החלטה: דאטה פטריות (עמוד 07) ----------
export const MUSHROOM = {
  attrs: ['NotHeavy', 'Smelly', 'Spotted', 'Smooth'],
  rows: [
    { id: 'A', NotHeavy: 1, Smelly: 0, Spotted: 0, Smooth: 0, Edible: 1 },
    { id: 'B', NotHeavy: 1, Smelly: 0, Spotted: 1, Smooth: 0, Edible: 1 },
    { id: 'C', NotHeavy: 0, Smelly: 1, Spotted: 0, Smooth: 1, Edible: 1 },
    { id: 'D', NotHeavy: 0, Smelly: 0, Spotted: 0, Smooth: 1, Edible: 0 },
    { id: 'E', NotHeavy: 1, Smelly: 1, Spotted: 1, Smooth: 0, Edible: 0 },
    { id: 'F', NotHeavy: 1, Smelly: 0, Spotted: 1, Smooth: 1, Edible: 0 },
    { id: 'G', NotHeavy: 1, Smelly: 0, Spotted: 0, Smooth: 1, Edible: 0 },
    { id: 'H', NotHeavy: 0, Smelly: 1, Spotted: 0, Smooth: 0, Edible: 0 }
  ],
  test: [
    { id: 'U', NotHeavy: 0, Smelly: 1, Spotted: 1, Smooth: 1, Edible: 1 },
    { id: 'V', NotHeavy: 1, Smelly: 1, Spotted: 0, Smooth: 1, Edible: 1 },
    { id: 'W', NotHeavy: 1, Smelly: 1, Spotted: 0, Smooth: 0, Edible: 0 }
  ]
};

// ---------- אלגוריתם גנטי (עמוד 08) ----------
export const GA_CONFIG = {
  bits: 5,            // x ב-[0,31]
  fitness: x => x * x, // f(x) = x^2
  optimum: 31,
  seedPopulation: ['01101', '11000', '01000', '10011']
};
