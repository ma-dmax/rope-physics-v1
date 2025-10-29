// canvas setup
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

const points = Array.from(document.querySelectorAll('.point'));

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
}
draw();
