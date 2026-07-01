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
    if (!graph.directed) adj[v].push([u, w]); // גרף מכוון → רק u→v
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

// ============================================================
// בנקי מופעים — לרמות וריבוי סבבים (משחקי הליבה)
// ============================================================

// ---------- חיפוש: מספר גרפים (לכל גרף coords לרינדור) ----------
export const SEARCH_GRAPHS = [
  // גרף 0 — הגרף הקנוני (זהה ל-SEARCH_GRAPH)
  {
    id: 'g0', name: 'הגרף הבסיסי',
    nodes: { S:{x:280,y:45,start:true}, A:{x:150,y:140}, B:{x:410,y:140}, C:{x:90,y:245}, D:{x:280,y:245}, G:{x:235,y:330,goal:true} },
    edges: [['S','A',1],['S','B',4],['A','C',2],['A','D',5],['B','D',1],['C','G',3],['D','G',1]],
    h: { S:5,A:4,B:2,C:2,D:1,G:0 }, start:'S', goal:'G'
  },
  // גרף 1 — קטן (5 צמתים)
  {
    id: 'g1', name: 'גרף יהלום',
    nodes: { S:{x:240,y:40,start:true}, A:{x:120,y:150}, B:{x:360,y:150}, C:{x:240,y:250}, G:{x:240,y:330,goal:true} },
    edges: [['S','A',2],['S','B',1],['A','C',2],['B','C',2],['B','G',5],['C','G',3]],
    h: { S:4,A:3,B:3,C:2,G:0 }, start:'S', goal:'G'
  },
  // גרף 2 — גדול יותר (7 צמתים)
  {
    id: 'g2', name: 'גרף מורחב',
    nodes: { S:{x:260,y:40,start:true}, A:{x:130,y:130}, B:{x:390,y:130}, C:{x:70,y:245}, D:{x:260,y:215}, E:{x:430,y:245}, G:{x:250,y:335,goal:true} },
    edges: [['S','A',2],['S','B',3],['A','C',4],['A','D',2],['B','D',1],['B','E',5],['C','G',3],['D','G',4],['E','G',2]],
    h: { S:5,A:4,B:3,C:2,D:4,E:2,G:0 }, start:'S', goal:'G'
  },
  // גרף 3 — עמוק (8 צמתים, 4 שכבות)
  {
    id: 'g3', name: 'גרף עמוק',
    nodes: { S:{x:260,y:35,start:true}, A:{x:150,y:110}, B:{x:380,y:110}, C:{x:80,y:195}, D:{x:260,y:190}, E:{x:440,y:195}, F:{x:175,y:290}, G:{x:365,y:295,goal:true} },
    edges: [['S','A',2],['S','B',1],['A','C',2],['A','D',3],['B','D',2],['B','E',4],['C','F',1],['D','F',2],['D','G',5],['E','G',2],['F','G',3]],
    h: { S:6,A:5,B:4,C:3,D:4,E:2,F:2,G:0 }, start:'S', goal:'G'
  }
];

// ---------- מינימקס: מספר עצים (root + nested leaves) ----------
// node: number = leaf ; array = inner node. שכבות מתחלפות MAX/MIN מהשורש.
export const MINIMAX_TREES = [
  { id:'t0', name:'עץ בסיסי (עומק 2)',  root:'MAX', t:[[3,7,8],[10,8,4],[2,7,5]] },   // עוגן: שורש=4, נגזם {7,5}
  { id:'t1', name:'עץ רחב (עומק 2)',    root:'MAX', t:[[8,5,6],[2,9,4],[7,3,10]] },
  { id:'t2', name:'עץ עמוק (עומק 3)',   root:'MAX', t:[[[3,12],[8,2]],[[14,5],[6,9]]] }
];

// ---------- תורת המשחקים: בנק מטריצות (התשובות מחושבות ע"י matrixSolve) ----------
export const GT_MATRICES = {
  pd:      { id:'pd', title:'דילמת האסיר', rows:['C','D'], cols:['C','D'],
             rowName:{C:'שתף פעולה',D:'בגוד'}, colName:{C:'שתף פעולה',D:'בגוד'},
             pay:{ C:{C:[3,3],D:[0,5]}, D:{C:[5,0],D:[1,1]} } },
  coord:   { id:'coord', title:'משחק תיאום', rows:['A','B'], cols:['A','B'],
             pay:{ A:{A:[2,2],B:[0,0]}, B:{A:[0,0],B:[1,1]} } },
  iesds3:  { id:'iesds3', title:'מחיקת נשלטות 3×3', rows:['A','B','C'], cols:['X','Y','Z'],
             pay:{ A:{X:[4,3],Y:[5,1],Z:[6,2]}, B:{X:[2,1],Y:[8,4],Z:[3,6]}, C:{X:[3,0],Y:[9,6],Z:[2,8]} } },
  iesds2:  { id:'iesds2', title:'מחיקת נשלטות 2×2', rows:['U','D'], cols:['L','R'],
             pay:{ U:{L:[3,2],R:[2,1]}, D:{L:[1,3],R:[0,0]} } },
  chicken: { id:'chicken', title:'תרנגול (Chicken)', rows:['S','T'], cols:['S','T'],
             rowName:{S:'סטה',T:'ישר'}, colName:{S:'סטה',T:'ישר'},
             pay:{ S:{S:[0,0],T:[-1,1]}, T:{S:[1,-1],T:[-10,-10]} } },   // עוגן: q=0.9
  chicken2:{ id:'chicken2', title:'תרנגול — וריאנט', rows:['S','T'], cols:['S','T'],
             rowName:{S:'סטה',T:'ישר'}, colName:{S:'סטה',T:'ישר'},
             pay:{ S:{S:[0,0],T:[-1,2]}, T:{S:[2,-1],T:[-4,-4]} } },     // q=0.6
  maximin1:{ id:'maximin1', title:'משחק ביטחון', rows:['U','D'], cols:['L','R'],
             pay:{ U:{L:[3,1],R:[0,4]}, D:{L:[2,2],R:[1,0]} } }
};

// ---------- משחק "2/3 מהממוצע" ----------
export const GUESS23 = {
  factor: 2 / 3,
  // כל בוט "חושב" k צעדים: ניחוש = 50·factor^k (חשיבה איטרטיבית)
  bots: [
    { name:'דני הנאיבי',   depth:0 },
    { name:'רותי המחושבת', depth:1 },
    { name:'מוטי המתוחכם', depth:2 }
  ]
};

// ---------- עצי החלטה: מספר סטים ----------
export const DTREE_TOY = {
  id:'study', name:'ללמוד למבחן?', target:'Study',
  attrs:['Rested','Exam','Coffee'],
  rows:[
    { id:'r1', Rested:1, Exam:1, Coffee:1, Study:1 },
    { id:'r2', Rested:1, Exam:1, Coffee:0, Study:1 },
    { id:'r3', Rested:1, Exam:0, Coffee:1, Study:0 },
    { id:'r4', Rested:0, Exam:1, Coffee:1, Study:1 },
    { id:'r5', Rested:0, Exam:1, Coffee:0, Study:0 },
    { id:'r6', Rested:0, Exam:0, Coffee:1, Study:0 },
    { id:'r7', Rested:1, Exam:0, Coffee:0, Study:0 },
    { id:'r8', Rested:0, Exam:0, Coffee:0, Study:0 }
  ]
};

// ---------- רשתות נוירונים: מספר קונפיגים (forward+backprop ע"י nnSolve) ----------
// W1[j][i]=משקל קלט i→נסתר j ; W2[k][j]=משקל נסתר j→פלט k
export const NN_CONFIGS = [
  { id: 'aima', name: 'רשת AIMA · 3→2→1', inLabels: ['x₁=1', 'x₂=0', 'x₃=1'], hidLabels: ['4', '5'], outLabels: ['6'],
    x: [1, 0, 1], W1: [[0.2, 0.4, -0.5], [-0.3, 0.1, 0.2]], b1: [-0.4, 0.2], W2: [[-0.3, -0.2]], b2: [0.1], target: [1], lr: 0.9 },
  { id: 'small', name: 'רשת קטנה · 2→2→1', inLabels: ['x₁=1', 'x₂=1'], hidLabels: ['h₁', 'h₂'], outLabels: ['o'],
    x: [1, 1], W1: [[0.5, -0.2], [0.3, 0.4]], b1: [0.1, -0.1], W2: [[0.6, -0.3]], b2: [0.2], target: [0], lr: 0.5 }
];

// ---------- מרחב גרסאות: מספר דאטהסטים (S/G ע"י candidateElim) ----------
const REST_DOM = { Restaurant: ['Eden', 'Dupu', 'Karnaf'], Meal: ['breakfast', 'lunch', 'dinner'], Day: ['Fri', 'Sat', 'Sun', 'Mon'], Cost: ['cheap', 'expensive'] };
export const VSPACE_SETS = [
  { id: 'shapes', name: 'צורות', attrs: ['Shape', 'Color', 'Size'],
    domains: { Shape: ['circle', 'square', 'triangle'], Color: ['red', 'blue', 'green'], Size: ['small', 'big'] },
    examples: [{ vals: ['circle', 'red', 'big'], label: '+' }, { vals: ['square', 'red', 'big'], label: '-' }, { vals: ['circle', 'blue', 'big'], label: '+' }, { vals: ['circle', 'red', 'small'], label: '-' }] }, // → circle,?,big
  { id: 'rest_b', name: 'ארוחת צהריים זולה', attrs: ['Restaurant', 'Meal', 'Day', 'Cost'], domains: REST_DOM,
    examples: [{ vals: ['Dupu', 'lunch', 'Mon', 'cheap'], label: '+' }, { vals: ['Eden', 'lunch', 'Fri', 'expensive'], label: '-' }, { vals: ['Karnaf', 'lunch', 'Sun', 'cheap'], label: '+' }, { vals: ['Eden', 'breakfast', 'Mon', 'cheap'], label: '-' }, { vals: ['Dupu', 'dinner', 'Sun', 'expensive'], label: '-' }] }, // → ?,lunch,?,cheap
  { id: 'rest_a', name: 'תגובה אלרגית (מסעדות)', attrs: ['Restaurant', 'Meal', 'Day', 'Cost'], domains: REST_DOM,
    examples: [{ vals: ['Eden', 'breakfast', 'Fri', 'cheap'], label: '+' }, { vals: ['Dupu', 'lunch', 'Fri', 'expensive'], label: '-' }, { vals: ['Eden', 'lunch', 'Sat', 'cheap'], label: '+' }, { vals: ['Karnaf', 'breakfast', 'Sun', 'cheap'], label: '-' }, { vals: ['Eden', 'breakfast', 'Sun', 'expensive'], label: '-' }] } // → Eden,?,?,cheap
];

// ---------- אלגוריתם גנטי: דוגמאות לחישובי-ביניים ----------
export const GA_BITS = [
  { range: [-2, 2], prec: 0.01 },   // → 9 ביט
  { range: [0, 100], prec: 1 },     // → 7 ביט
  { range: [0, 1], prec: 0.001 }    // → 10 ביט
];

// ============================================================
// דאטה לנגני-הפתרון האינטראקטיביים (עמוד פתרונות תרגילים)
// ============================================================

// תרגיל 1, שאלה 3 — A* על הגרף (לא-מכוון) → S,B,E,F,G עלות 18
export const EX_ASTAR = {
  id: 'exastar', name: 'תרגיל 1 ש3 — A*',
  nodes: {
    S: { x: 265, y: 32, start: true }, A: { x: 110, y: 108 }, B: { x: 265, y: 108 }, C: { x: 420, y: 108 },
    D: { x: 180, y: 195 }, E: { x: 360, y: 195 }, F: { x: 275, y: 272 }, G: { x: 275, y: 338, goal: true }
  },
  edges: [['S', 'A', 6], ['S', 'B', 5], ['S', 'C', 10], ['A', 'E', 6], ['B', 'E', 6], ['B', 'D', 7], ['C', 'D', 6], ['E', 'F', 4], ['D', 'F', 6], ['F', 'G', 3]],
  h: { S: 17, A: 10, B: 13, C: 4, D: 2, E: 4, F: 1, G: 0 }, start: 'S', goal: 'G'
};

// תרגיל 2, שאלה 1 — השוואת אלגוריתמים (מכוון). A*→S,B,D,G(7) · BFS→S,G(9)
export const EX_COMPARE = {
  id: 'excompare', name: 'תרגיל 2 ש1 — השוואת אלגוריתמים', directed: true,
  nodes: {
    S: { x: 265, y: 32, start: true }, A: { x: 140, y: 120 }, B: { x: 390, y: 120 },
    C: { x: 90, y: 215 }, D: { x: 265, y: 210 }, E: { x: 440, y: 215 }, G: { x: 265, y: 338, goal: true }
  },
  edges: [['S', 'A', 2], ['S', 'B', 1], ['S', 'G', 9], ['A', 'C', 2], ['A', 'D', 3], ['B', 'D', 2], ['B', 'E', 4], ['C', 'G', 4], ['D', 'G', 4]],
  h: { S: 6, A: 0, B: 6, C: 4, D: 1, E: 10, G: 0 }, start: 'S', goal: 'G'
};

// תרגיל 2, שאלה 2 — עץ מינימקס עומק 3 (MAX→MIN→MAX→עלים, 3 בכל קבוצה). שורש MAX = 9 (ענף ימני).
// MIN של כל שלישיית-MAX: min(7,4,3)=3 · min(9,7,6)=6 · min(9,9,9)=9 → max=9.
// גיזום: שמאל→ימין כמעט ולא גוזם (הערכים הטובים באים מאוחר); ימין→שמאל גוזם 12 עלים.
export const EX_MINIMAX = {
  id: 'exmm', name: 'תרגיל 2 ש2 — מינימקס (עומק 3)', root: 'MAX',
  t: [
    [[4, 4, 7], [1, 1, 4], [3, 3, 3]],
    [[7, 1, 9], [4, 1, 7], [4, 6, 1]],
    [[9, 1, 8], [1, 1, 9], [0, 4, 9]]
  ]
};

// מבחן דוגמה שאלה 1 — עץ מינימקס עומק 2 (root MAX) → שורש 4, נגזמים 7,5 (שמאל→ימין)
export const SAMPLE_MINIMAX = { id: 'smm', name: 'מבחן דוגמה ש1 — מינימקס', root: 'MAX', t: [[3, 7, 8], [10, 8, 4], [2, 7, 5]] };

// שאלה 1 — חיפוש בגרף מכוון עם 3 מטרות (G1,G2,G3). h = הערכה למטרה הקרובה. h לא-קביל (למשל h(B)=9 אך B→E→G2=3).
// מסלולים אופטימליים: G1: S→A→D→G1=6 · G2: S→A→B→E→G2=5 · G3: S→A→B→G3=10. המטרה הקרובה: G2 (עלות 5).
export const EX_SEARCH_MULTI = {
  id: 'exsearch3', name: 'שאלה 1 — חיפוש (3 מטרות)', directed: true,
  nodes: {
    S: { x: 250, y: 38, start: true }, G3: { x: 495, y: 46, goal: true },
    A: { x: 138, y: 126 }, B: { x: 372, y: 120 },
    C: { x: 66, y: 216 }, D: { x: 256, y: 210 }, E: { x: 452, y: 202 },
    G1: { x: 168, y: 336, goal: true }, G2: { x: 372, y: 340, goal: true }
  },
  edges: [
    ['S', 'A', 1], ['S', 'B', 3], ['A', 'B', 1], ['A', 'C', 3], ['A', 'D', 2],
    ['B', 'G3', 8], ['B', 'D', 7], ['B', 'E', 1], ['C', 'D', 5], ['C', 'S', 4],
    ['D', 'E', 5], ['D', 'G1', 3], ['D', 'G2', 6], ['E', 'G2', 2], ['G1', 'G2', 7]
  ],
  h: { S: 2, A: 5, B: 9, C: 7, D: 3, E: 1, G1: 0, G2: 0, G3: 0 },
  start: 'S', goals: ['G1', 'G2', 'G3']
};

// תרגיל עץ החלטה — פטריות (Smooth שורש IG≈0.049, ואז Smelly בכל ענף — הפוך)
export const EX_ID3 = {
  id: 'mush', name: 'פטריות (אכיל/רעיל)', target: 'Edible', attrs: ['NotHeavy', 'Smelly', 'Spotted', 'Smooth'],
  rows: [
    { id: 'A', NotHeavy: 1, Smelly: 0, Spotted: 0, Smooth: 0, Edible: 1 },
    { id: 'B', NotHeavy: 1, Smelly: 0, Spotted: 1, Smooth: 0, Edible: 1 },
    { id: 'C', NotHeavy: 0, Smelly: 1, Spotted: 0, Smooth: 1, Edible: 1 },
    { id: 'D', NotHeavy: 0, Smelly: 0, Spotted: 0, Smooth: 1, Edible: 0 },
    { id: 'E', NotHeavy: 1, Smelly: 1, Spotted: 1, Smooth: 0, Edible: 0 },
    { id: 'F', NotHeavy: 1, Smelly: 0, Spotted: 1, Smooth: 1, Edible: 0 },
    { id: 'G', NotHeavy: 1, Smelly: 0, Spotted: 0, Smooth: 1, Edible: 0 },
    { id: 'H', NotHeavy: 0, Smelly: 1, Spotted: 0, Smooth: 0, Edible: 0 }
  ]
};

// תרגיל 1, שאלה 1 — האיכר, שועל, אווז, חיטה. מצב=[Farmer,Fox,Goose,Wheat] (L/R)
export const EX_RIVER = {
  name: 'האיכר, שועל, אווז וחיטה', labels: ['איכר', 'שועל', 'אווז', 'חיטה'], icons: ['🧑‍🌾', '🦊', '🦆', '🌾'],
  states: [
    { s: ['L', 'L', 'L', 'L'], action: 'מצב התחלה — כולם בגדה השמאלית' },
    { s: ['R', 'L', 'R', 'L'], action: 'האיכר לוקח את האווז ימינה' },
    { s: ['L', 'L', 'R', 'L'], action: 'האיכר חוזר לבד שמאלה' },
    { s: ['R', 'R', 'R', 'L'], action: 'האיכר לוקח את השועל ימינה' },
    { s: ['L', 'R', 'L', 'L'], action: 'האיכר מחזיר את האווז שמאלה' },
    { s: ['R', 'R', 'L', 'R'], action: 'האיכר לוקח את החיטה ימינה' },
    { s: ['L', 'R', 'L', 'R'], action: 'האיכר חוזר לבד שמאלה' },
    { s: ['R', 'R', 'R', 'R'], action: 'האיכר לוקח את האווז ימינה — יעד! ✓' }
  ]
};
