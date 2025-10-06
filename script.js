const player = document.getElementById("player");
const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const highscoreEl = document.getElementById("highscore");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const timerEl = document.getElementById("timer");
const resetBtn = document.getElementById("resetBtn");

let bullets = [];
let enemies = [];
let score = 0;
let level = 1;
let timeLeft = 60;
let playerX = 170;
let gameRunning = false;
let timer, spawnInterval, gameLoopId;
let highscore = localStorage.getItem("rialoHighscore") || 0;
highscoreEl.textContent = highscore;

const speed = { bullet: 15, enemy: 5 };

// Movement
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  if (e.key === "ArrowLeft" && playerX > 0) playerX -= 20;
  if (e.key === "ArrowRight" && playerX < 340) playerX += 20;
  if (e.key === " ") shoot();
  player.style.left = playerX + "px";
});

function shoot() {
  const bullet = document.createElement("div");
  bullet.classList.add("bullet");
  bullet.style.left = playerX + 28 + "px";
  bullet.style.bottom = "80px";
  gameArea.appendChild(bullet);
  bullets.push(bullet);
}

function spawnEnemy() {
  if (!gameRunning) return;
  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  enemy.style.left = Math.random() * 360 + "px";
  enemy.style.top = "-40px";
  gameArea.appendChild(enemy);
  enemies.push(enemy);
}

// Updated game loop
function updateGame() {
  if (!gameRunning) return;

  bullets.forEach((b, i) => {
    let bottom = parseInt(b.style.bottom);
    if (bottom > 700) {
      b.remove();
      bullets.splice(i, 1);
    } else b.style.bottom = bottom + speed.bullet + "px";
  });

  enemies.forEach((e, i) => {
    let top = parseInt(e.style.top);
    if (top > 700) {
      e.remove();
      enemies.splice(i, 1);
    } else e.style.top = top + speed.enemy + "px";
  });

  // Collision
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      const bRect = b.getBoundingClientRect();
      const eRect = e.getBoundingClientRect();
      if (
        bRect.left < eRect.right &&
        bRect.right > eRect.left &&
        bRect.top < eRect.bottom &&
        bRect.bottom > eRect.top
      ) {
        e.remove();
        b.remove();
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        score++;
        scoreEl.textContent = score;

        // Level up
        if (score % 10 === 0) {
          level++;
          levelEl.textContent = level;
          speed.enemy += 1;
          speed.bullet += 0.5;
        }
      }
    });
  });

  gameLoopId = requestAnimationFrame(updateGame);
}

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  level = 1;
  timeLeft = 60;
  speed.enemy = 5;
  speed.bullet = 15;
  scoreEl.textContent = 0;
  levelEl.textContent = 1;
  timerEl.textContent = `Time: ${timeLeft}`;
  startBtn.disabled = true;
  pauseBtn.disabled = false;

  // Clear previous elements
  gameArea.querySelectorAll(".bullet, .enemy").forEach((el) => el.remove());
  bullets = [];
  enemies = [];

  // Start loops
  spawnInterval = setInterval(spawnEnemy, 800);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}`;
    if (timeLeft <= 0) endGame();
  }, 1000);

  updateGame();
}

function pauseGame() {
  gameRunning = false;
  clearInterval(timer);
  clearInterval(spawnInterval);
  cancelAnimationFrame(gameLoopId);
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function endGame() {
  gameRunning = false;
  clearInterval(timer);
  clearInterval(spawnInterval);
  cancelAnimationFrame(gameLoopId);

  alert(`Time’s up! Final Score: ${score}`);
  if (score > highscore) {
    localStorage.setItem("rialoHighscore", score);
    highscoreEl.textContent = score;
  }
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

resetBtn.addEventListener("click", () => {
  localStorage.removeItem("rialoHighscore");
  highscoreEl.textContent = 0;
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
