// Надёжная реализация: стрелка над кнопкой (указывает вверх), победитель — сектор НАД стрелкой (внизу колеса).
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin');
const resultBox = document.getElementById('result');

const SEGMENTS = 8;
const NUMBERS = [1,2,3,4,5,6,7,8];
const COLORS = new Array(SEGMENTS).fill('#dcdcdc'); // фон секторов (можешь менять)

// размеры
const W = canvas.width;
const H = canvas.height;
const R = W/2;
const CENTER = { x: R, y: R };
const ARC = (2 * Math.PI) / SEGMENTS;

// текущее вращение колеса (в радианах). Увеличивается при прокрутке.
let currentRotation = 0; // radians
let spinning = false;
let highlightedIndex = -1;

function drawWheel() {
  ctx.clearRect(0,0,W,H);

  // рисуем каждый сектор
  for (let i=0;i<SEGMENTS;i++){
    // стартовый и конечный угол сектора (с учётом currentRotation)
    const start = currentRotation + i*ARC;
    const end = start + ARC;

    ctx.beginPath();
    ctx.moveTo(CENTER.x, CENTER.y);
    ctx.arc(CENTER.x, CENTER.y, R - 6, start, end, false);
    ctx.closePath();

    ctx.fillStyle = COLORS[i];
    ctx.fill();

    // обводка
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // если этот сектор — победный, подчёркиваем (толстая белая рамка)
    if (i === highlightedIndex) {
      ctx.beginPath();
      ctx.moveTo(CENTER.x, CENTER.y);
      ctx.arc(CENTER.x, CENTER.y, R - 6, start, end, false);
      ctx.closePath();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    }

    // центр текста сектора
    const mid = start + ARC/2;
    const tx = CENTER.x + Math.cos(mid) * (R * 0.55);
    const ty = CENTER.y + Math.sin(mid) * (R * 0.55);

    ctx.save();
    ctx.translate(tx, ty);
    // не обязательно вращать текст — оставим читаемым сверху
    ctx.rotate(0);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(NUMBERS[i]), 0, 0);
    ctx.restore();
  }

  // внешняя обводка
  ctx.beginPath();
  ctx.arc(CENTER.x, CENTER.y, R-2, 0, Math.PI*2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#1e90ff';
  ctx.stroke();
}

// --- определение сектора, который находится ПОД стрелкой ---
// Стрелка у нас фиксирована и указывает ВВЕРХ на экран (на нижний сектор колеса).
// В canvas направление "вверх" равно -PI/2 (или 3PI/2).
// Мы вычисляем для каждого сектора его центральный угол (с учётом rotation)
// и ищем сектор, чей центральный угол наиболее близок к направлению стрелки.
function getSectorIndexUnderPointer() {
  const pointerAngle = -Math.PI/2; // направление вверх на экране
  // нормализуем pointerAngle и currentRotation в [0,2π)
  const norm = angle => ((angle % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
  const p = norm(pointerAngle);

  // пройдем по всем секторам и найдём ближайший по углу
  let bestIdx = 0;
  let bestDiff = Infinity;
  for (let i=0;i<SEGMENTS;i++){
    // центральный угол сектора i в мировых координатах:
    const centerAngle = norm(currentRotation + i*ARC + ARC/2);
    // разница (малый модуль угла)
    let diff = Math.abs(centerAngle - p);
    if (diff > Math.PI) diff = 2*Math.PI - diff;
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }

  return bestIdx;
}

// Анимация прокрутки — 3 секунды, easeOut
function spinOnce() {
  if (spinning) return;
  spinning = true;
  highlightedIndex = -1;
  resultBox.textContent = '';

  const duration = 3000; // ms
  const startRotation = currentRotation;

  // хотим остановиться на случайном угле: минимум 3 оборота + random [0,360)
  const extraDeg = Math.random() * 360;
  const totalDeg = 1080 + extraDeg;
  const targetRotation = startRotation + (totalDeg * Math.PI / 180);

  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    // easeOutCubic
    const ease = 1 - Math.pow(1 - t, 3);
    currentRotation = startRotation + (targetRotation - startRotation) * ease;

    drawWheel();

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      // остановка: определяем сектор под стрелкой
      const winnerIdx = getSectorIndexUnderPointer();
      highlightedIndex = winnerIdx;
      drawWheel();

      const winnerNumber = NUMBERS[winnerIdx];

      // показываем результат под кнопкой
      resultBox.textContent = `🎉 You got: ${winnerNumber}!`;

      spinning = false;
    }
  }

  requestAnimationFrame(frame);
}

// инициализация
drawWheel();
spinBtn.addEventListener('click', spinOnce);
