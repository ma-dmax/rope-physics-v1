const CONFIG = {
  points: 5,
  size: 15,
  color: "#ff7a18",
  max_pull: 50
}

const MAX_LEN = 45;   // максимальная длина сегмента (px)
const ITER = 4;        // сколько раз за кадр “подтягивать” цепь

const points = [];
function dot_create(config){
  for(let i = 0; i < config.points; i++){
    const el = document.createElement("div");
    el.className = "point" + " p"+(i);

    el.style.width = config.size +"px";
    el.style.height = config.size+ "px";
    el.style.background = config.color;

    el.style.setProperty('--x', i*50+"px");
    el.style.setProperty('--y', i*50+"px");

    document.body.appendChild(el);
    points.push(el);

  };
}
dot_create(CONFIG);

const canvas = document.getElementById('rope');
const ctx = canvas.getContext('2d');
function resize() {
  canvas.width  = innerWidth;
  canvas.height = innerHeight;
}
addEventListener('resize', resize);
resize();

function getPos(el){
  const cs = getComputedStyle(el);
  return {
    x: parseFloat(cs.getPropertyValue('--x')) || 0,
    y: parseFloat(cs.getPropertyValue('--y')) || 0
  };
}
function setPos(el, x, y){
  el.style.setProperty('--x', x + 'px');
  el.style.setProperty('--y', y + 'px');
}

let activePoint = null;
points.forEach(p => {
  p.addEventListener('mousedown', (e) => {
    activePoint = p;
    e.preventDefault();
  });
});
document.addEventListener('mousemove', (e) => {
  if (!activePoint) return;
  setPos(activePoint, e.clientX, e.clientY);
});
document.addEventListener('mouseup', () => {
  activePoint = null;
});
/*
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (points.length >= 2) {
    ctx.beginPath();
    const p0 = getPos(points[0]);
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < points.length; i++) {
      const p = getPos(points[i]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = '#ff7a18';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  requestAnimationFrame(draw);
}*/


// === Настройки констрейнта ===
       // сколько раз за кадр “подтягивать” цепь

// Узнать индекс активной точки
function getActiveIndex() {
  return activePoint ? points.indexOf(activePoint) : -1;
}

// Сдвиг точки на dx, dy (читает текущие CSS-переменные)
function nudge(el, dx, dy) {
  const p = getPos(el);
  setPos(el, p.x + dx, p.y + dy);
}

// Укорачиваем одно ребро (i, j) до MAX_LEN
function relaxEdge(i, j, activeIdx) {
  const A = points[i];
  const B = points[j];

  const pa = getPos(A);
  const pb = getPos(B);

  const dx = pb.x - pa.x;
  const dy = pb.y - pa.y;
  const dist = Math.hypot(dx, dy);

  if (!dist || dist <= MAX_LEN) return;

  const over = dist - MAX_LEN;
  const ux = dx / dist;     // единичный вектор
  const uy = dy / dist;

  // Сколько “сдвига” надо внести
  const sx = over * ux;
  const sy = over * uy;

  // Кого двигаем?
  if (activeIdx === i) {
    // тянем левую (A) → двигаем только правую (B) к A
    nudge(B, -sx, -sy);
  } else if (activeIdx === j) {
    // тянем правую (B) → двигаем только левую (A) от B
    nudge(A, sx, sy);
  } else {
    // никто не активен → делим поровну
    nudge(A,  sx * 0.5, sy * 0.5);
    nudge(B, -sx * 0.5, -sy * 0.5);
  }
}

// Один полный проход “от активной точки вправо и влево”
function relaxFrom(activeIdx) {
  if (points.length < 2) return;

  // Вправо: (k,k+1), (k+1,k+2), ...
  for (let i = activeIdx; i < points.length - 1; i++) {
    relaxEdge(i, i + 1, activeIdx);
  }
  // Влево: (...,k-2,k-1), (k-1,k)
  for (let i = activeIdx - 1; i >= 0; i--) {
    relaxEdge(i, i + 1, activeIdx);
  }
}

// Обновляем позицию активной точки мышью + подтягиваем цепь
document.addEventListener('mousemove', (e) => {
  if (!activePoint) return;
  setPos(activePoint, e.clientX, e.clientY);

  const k = getActiveIndex();
  // Несколько итераций, чтобы ошибка “прокатилась” до концов
  for (let t = 0; t < ITER; t++) {
    relaxFrom(k);
  }
});

// Можно также слегка “подтягивать” и без драга (необязательно)
function enforceAll() {
  const k = getActiveIndex();
  const center = k >= 0 ? k : Math.floor(points.length / 2);
  for (let t = 0; t < 2; t++) relaxFrom(center);
}

// Отрисовка как у тебя, но добавим легкую подтяжку без драга
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Без драга слегка держим верёвку “в тонусе”
  if (!activePoint) enforceAll();

  if (points.length >= 2) {
    ctx.beginPath();
    const p0 = getPos(points[0]);
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < points.length; i++) {
      const p = getPos(points[i]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = '#ff7a18';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  requestAnimationFrame(draw);
}

draw();
