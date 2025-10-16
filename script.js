const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spin");
const result = document.getElementById("result");

const prizes = ["Gift 1", "Gift 2", "Gift 3", "Gift 4", "Gift 5", "Gift 6"];
let rotation = 0;
let spinning = false;

function drawWheel() {
  const arc = (2 * Math.PI) / prizes.length;
  for (let i = 0; i < prizes.length; i++) {
    const angle = i * arc;
    ctx.beginPath();
    ctx.fillStyle = i % 2 === 0 ? "#ffcc00" : "#ff9900";
    ctx.moveTo(150, 150);
    ctx.arc(150, 150, 150, angle, angle + arc);
    ctx.fill();
    ctx.save();
    ctx.translate(150, 150);
    ctx.rotate(angle + arc / 2);
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText(prizes[i], 70, 5);
    ctx.restore();
  }
}

drawWheel();

spinBtn.addEventListener("click", () => {
  if (spinning) return;
  spinning = true;
  const randomSpin = Math.random() * 360 + 720; // 2 оборота минимум
  const duration = 4000;
  const start = performance.now();

  function animate(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    rotation = randomSpin * easeOut(progress);
    canvas.style.transform = `rotate(${rotation}deg)`;
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      const selected = Math.floor(((360 - (rotation % 360)) / 60)) % prizes.length;
      result.textContent = `🎉 You got: ${prizes[selected]}!`;
    }
  }

  requestAnimationFrame(animate);
});

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}
