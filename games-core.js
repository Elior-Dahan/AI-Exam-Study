// ============================================================
// games-core.js — מנוע משותף למשחקי הלמידה
// (בלי תלות חיצונית, RTL, מעל style.css + games.css)
// ============================================================

// ---------- עוזרי DOM / SVG ----------
export function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined && v !== false) e.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c === null || c === undefined || c === false) continue;
    e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  return e;
}

const SVGNS = 'http://www.w3.org/2000/svg';
export function svg(tag, attrs = {}, children = []) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (k === 'text') e.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined && v !== false) e.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c === null || c === undefined || c === false) continue;
    e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  return e;
}

export const $ = (sel, root = document) => root.querySelector(sel);

// ---------- התמדה (localStorage) ----------
const KEY = id => 'aigame_' + id;
export function getStars(id) { return +(localStorage.getItem(KEY(id) + '_stars') || 0); }
export function setStars(id, stars) {
  const cur = getStars(id);
  if (stars > cur) localStorage.setItem(KEY(id) + '_stars', stars);
}
export function getBest(id) { return +(localStorage.getItem(KEY(id) + '_best') || 0); }
function setBest(id, v) { localStorage.setItem(KEY(id) + '_best', v); }

// ---------- לוח ניקוד ----------
export class Scoreboard {
  constructor(gameId) {
    this.id = gameId;
    this.score = 0;
    this.streak = 0;
    this.best = getBest(gameId);
    this.el = el('div', { class: 'gx-score' });
    this._render();
  }
  _stat(num, lbl, cls = '') {
    return el('div', { class: 'gx-stat ' + cls }, [
      el('span', { class: 'gx-num', text: num }),
      el('span', { class: 'gx-lbl', text: lbl })
    ]);
  }
  _render() {
    this.el.innerHTML = '';
    this.el.append(
      this._stat(this.score, 'ניקוד', 'gx-s-score'),
      this._stat('🔥 ' + this.streak, 'רצף', 'gx-s-streak'),
      this._stat('⭐ ' + this.best, 'שיא', 'gx-s-best')
    );
  }
  add(points = 10) {
    this.score += points;
    this.streak += 1;
    if (this.score > this.best) { this.best = this.score; setBest(this.id, this.best); }
    this._render();
    this._pulse('gx-s-score');
    return this.streak;
  }
  miss() { this.streak = 0; this._render(); }
  reset() { this.score = 0; this.streak = 0; this._render(); }
  _pulse(cls) {
    const n = this.el.querySelector('.' + cls);
    if (!n) return;
    n.classList.remove('gx-pulse'); void n.offsetWidth; n.classList.add('gx-pulse');
  }
}

// ---------- toast פידבק ----------
let _toastTimer;
export function toast(msg, type = 'info') {
  let t = document.querySelector('.gx-toast');
  if (!t) { t = el('div', { class: 'gx-toast' }); document.body.appendChild(t); }
  t.className = 'gx-toast gx-' + type;
  t.innerHTML = msg;
  void t.offsetWidth;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ---------- קונפטי ----------
export function confetti(n = 90) {
  const colors = ['#27408b', '#3a5bd9', '#b8860b', '#1b7f5a', '#b23b3b', '#6a4bb0'];
  for (let i = 0; i < n; i++) {
    const c = el('div', { class: 'gx-confetti' });
    c.style.left = (Math.random() * 100) + 'vw';
    c.style.background = colors[i % colors.length];
    c.style.animationDelay = (Math.random() * 0.5).toFixed(2) + 's';
    c.style.transform = 'rotate(' + Math.floor(Math.random() * 360) + 'deg)';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2800);
  }
}

// ---------- מודאל ניצחון ----------
export function winModal({ title, html, stars = 0, gameId, onClose }) {
  if (gameId && stars) setStars(gameId, stars);
  const starsRow = stars
    ? '<div class="gx-stars">' + '★'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars)) + '</div>'
    : '';
  const overlay = el('div', { class: 'gx-modal-bg' });
  const box = el('div', { class: 'gx-modal' }, [
    el('div', { class: 'gx-modal-emoji', text: '🎉' }),
    el('h2', { text: title, style: { margin: '6px 0 4px', color: 'var(--primary)' } }),
    el('div', { html: starsRow }),
    el('div', { class: 'gx-modal-body', html: html }),
    el('button', {
      class: 'gx-btn gx-btn-primary', text: 'מעולה! 🚀',
      onclick: () => { overlay.remove(); if (onClose) onClose(); }
    })
  ]);
  overlay.appendChild(box);
  overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); if (onClose) onClose(); } });
  document.body.appendChild(overlay);
  confetti();
}

// ---------- כפתור עזר ----------
export function btn(label, onClick, kind = '') {
  return el('button', { class: 'gx-btn ' + kind, text: label, onclick: onClick });
}

// ---------- בקרת בחירה (segmented) ----------
export function segmented(options, onPick, initial) {
  const wrap = el('div', { class: 'gx-seg' });
  let current = initial != null ? initial : options[0].value;
  const buttons = {};
  options.forEach(o => {
    const b = el('button', {
      class: 'gx-seg-btn' + (o.value === current ? ' active' : ''),
      text: o.label,
      onclick: () => {
        current = o.value;
        Object.values(buttons).forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        onPick(o.value);
      }
    });
    buttons[o.value] = b;
    wrap.appendChild(b);
  });
  wrap.setValue = v => { if (buttons[v]) buttons[v].click(); };
  return wrap;
}

// ---------- ניעור אלמנט (פידבק שגיאה) ----------
export function shake(node) {
  node.classList.remove('gx-shake'); void node.offsetWidth; node.classList.add('gx-shake');
}
