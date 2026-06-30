// ============================================================
// games-data.js — כל הנתונים של המשחקים (מיושר לדוגמאות המרצה מהמצגות)
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

// ---------- Version Space: דוגמת המרצה (Restaurant) ----------
// תכונות: Restaurant / Meal / Day / Cost. השערה = רביעייה עם '?' (כל ערך) או '∅' (כלום).
// דוגמה זו שונה מהדוגמה שבעמוד 05 (Eden,?,?,cheap) — כאן מתכנסים ל-[?, lunch, ?, cheap].
export const VERSION_SPACE = {
  attrs: ['Restaurant', 'Meal', 'Day', 'Cost'],
  short: { Restaurant: 'מסעדה', Meal: 'ארוחה', Day: 'יום', Cost: 'מחיר' },
  examples: [
    { vals: ['Dupu',   'lunch',     'Mon', 'cheap'],     label: '+' },
    { vals: ['Eden',   'lunch',     'Fri', 'expensive'], label: '-' },
    { vals: ['Karnaf', 'lunch',     'Sun', 'cheap'],     label: '+' },
    { vals: ['Eden',   'breakfast', 'Mon', 'cheap'],     label: '-' },
    { vals: ['Dupu',   'dinner',    'Sun', 'expensive'], label: '-' }
  ],
  // S ו-G אחרי כל דוגמה (לאימות והנפשה). אינדקס 0 = אתחול.
  evolution: [
    { S: [['∅', '∅', '∅', '∅']], G: [['?', '?', '?', '?']] },
    { S: [['Dupu', 'lunch', 'Mon', 'cheap']], G: [['?', '?', '?', '?']] },
    { S: [['Dupu', 'lunch', 'Mon', 'cheap']], G: [['Dupu', '?', '?', '?'], ['?', '?', 'Mon', '?'], ['?', '?', '?', 'cheap']] },
    { S: [['?', 'lunch', '?', 'cheap']], G: [['?', '?', '?', 'cheap']] },
    { S: [['?', 'lunch', '?', 'cheap']], G: [['?', 'lunch', '?', 'cheap']] },
    { S: [['?', 'lunch', '?', 'cheap']], G: [['?', 'lunch', '?', 'cheap']] }
  ],
  concept: ['?', 'lunch', '?', 'cheap']  // "כל ארוחת צהריים זולה"
};

// ---------- רשת נוירונים: הדוגמה הקנונית של AIMA (עמוד 06) ----------
// צמתים: קלט 1,2,3 → נסתר 4,5 → פלט 6. סיגמואיד. כולל הטיות (bias) ו-LR.
export const NN_CONFIG = {
  x: { x1: 1, x2: 0, x3: 1 },
  w: { w14: 0.2, w15: -0.3, w24: 0.4, w25: 0.1, w34: -0.5, w35: 0.2, w46: -0.3, w56: -0.2 },
  bias: { b4: -0.4, b5: 0.2, b6: 0.1 },
  target: 1,
  lr: 0.9
  // Forward: I4=-0.7→O4=0.332, I5=0.1→O5=0.525, I6=-0.105→O6=0.474
  // Backprop: Err6=0.1311, Err4=-0.0087, Err5=-0.0065
};

// ---------- עצי החלטה: דאטה PlayTennis הקנוני (עמוד 07) ----------
export const PLAYTENNIS = {
  attrs: ['Outlook', 'Temperature', 'Humidity', 'Wind'],
  rows: [
    { id: 'D1',  Outlook: 'Sunny',    Temperature: 'Hot',  Humidity: 'High',   Wind: 'Weak',   Play: 0 },
    { id: 'D2',  Outlook: 'Sunny',    Temperature: 'Hot',  Humidity: 'High',   Wind: 'Strong', Play: 0 },
    { id: 'D3',  Outlook: 'Overcast', Temperature: 'Hot',  Humidity: 'High',   Wind: 'Weak',   Play: 1 },
    { id: 'D4',  Outlook: 'Rain',     Temperature: 'Mild', Humidity: 'High',   Wind: 'Weak',   Play: 1 },
    { id: 'D5',  Outlook: 'Rain',     Temperature: 'Cool', Humidity: 'Normal', Wind: 'Weak',   Play: 1 },
    { id: 'D6',  Outlook: 'Rain',     Temperature: 'Cool', Humidity: 'Normal', Wind: 'Strong', Play: 0 },
    { id: 'D7',  Outlook: 'Overcast', Temperature: 'Cool', Humidity: 'Normal', Wind: 'Strong', Play: 1 },
    { id: 'D8',  Outlook: 'Sunny',    Temperature: 'Mild', Humidity: 'High',   Wind: 'Weak',   Play: 0 },
    { id: 'D9',  Outlook: 'Sunny',    Temperature: 'Cool', Humidity: 'Normal', Wind: 'Weak',   Play: 1 },
    { id: 'D10', Outlook: 'Rain',     Temperature: 'Mild', Humidity: 'Normal', Wind: 'Weak',   Play: 1 },
    { id: 'D11', Outlook: 'Sunny',    Temperature: 'Mild', Humidity: 'Normal', Wind: 'Strong', Play: 1 },
    { id: 'D12', Outlook: 'Overcast', Temperature: 'Mild', Humidity: 'High',   Wind: 'Strong', Play: 1 },
    { id: 'D13', Outlook: 'Overcast', Temperature: 'Hot',  Humidity: 'Normal', Wind: 'Weak',   Play: 1 },
    { id: 'D14', Outlook: 'Rain',     Temperature: 'Mild', Humidity: 'High',   Wind: 'Strong', Play: 0 }
  ],
  entropyS: 0.94,            // E(S): 9 כן, 5 לא
  rootGain: { Outlook: 0.247, Humidity: 0.151, Wind: 0.048, Temperature: 0.029 },
  branchBest: { Sunny: 'Humidity', Rain: 'Wind' }, // overcast טהור (כולם כן)
  // ערכי IG בתוך ענף Sunny (3 לא, 2 כן) ו-Rain (3 כן, 2 לא) — לחשיפה במשחק
  sunnyGain: { Humidity: 0.971, Temperature: 0.571, Wind: 0.020 },
  rainGain:  { Wind: 0.971, Temperature: 0.020, Humidity: 0.020 },
  test: [
    { id: 'X1', Outlook: 'Sunny',    Humidity: 'High',   Wind: 'Weak',   Play: 0 },
    { id: 'X2', Outlook: 'Overcast', Humidity: 'High',   Wind: 'Strong', Play: 1 },
    { id: 'X3', Outlook: 'Rain',     Humidity: 'Normal', Wind: 'Strong', Play: 0 },
    { id: 'X4', Outlook: 'Sunny',    Humidity: 'Normal', Wind: 'Strong', Play: 1 }
  ]
};

// ---------- אלגוריתם גנטי (עמוד 08) ----------
export const GA_CONFIG = {
  bits: 5,            // x ב-[0,31]
  fitness: x => x * x, // f(x) = x^2
  optimum: 31,
  seedPopulation: ['01101', '11000', '01000', '10011']
};
