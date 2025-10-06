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

// 💨 Base speed values
const speed = { bullet: 15, enemy: 3 }; // enemy slower initially
let playerSpeed = 40; // ⬅️ doubled from 20 → 40

// 🎮 Movement controls
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  if (e.key === "ArrowLeft" && playerX > 0) playerX -= playerSpeed;
  if (e.key === "ArrowRight" && playerX < 340) playerX += playerSpeed;
  if (e.key === " ") shoot();
  player.style.left = playerX + "px";
});

// 🔫 Shooting
function shoot() {
  const bullet = document.createElement("div");
  bullet.classList.add("bullet");
  bullet.style.left = playerX + 28 + "px";
  bullet.style.bottom = "80px";
  gameArea.appendChild(bullet);
  bullets.push(bullet);
}

// 👾 Spawn enemies
function spawnEnemy() {
  if (!gameRunning) return;
  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  enemy.style.left = Math.random() * 360 + "px";
  enemy.style.top = "-40px";
  gameArea.appendChild(enemy);
  enemies.push(enemy);
}

// 🔁 Game loop
function updateGame() {
  if (!gameRunning) return;

  // move bullets
  bullets.forEach((b, i) => {
    let bottom = parseInt(b.style.bottom);
    if (bottom > 700) {
      b.remove();
      bullets.splice(i, 1);
    } else b.style.bottom = bottom + speed.bullet + "px";
  });

  // move enemies
  enemies.forEach((e, i) => {
    let top = parseInt(e.style.top);
    if (top > 700) {
      e.remove();
      enemies.splice(i, 1);
    } else e.style.top = top + speed.enemy + "px";
  });

  // detect collision
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

        // 🧠 level up system: increase enemy speed every 10 points
        if (score % 10 === 0) {
          level++;
          levelEl.textContent = level;

          // slowly ramp up difficulty
          speed.enemy += 0.7;
          speed.bullet += 0.3;
        }
      }
    });
  });

  gameLoopId = requestAnimationFrame(updateGame);
}

// ▶️ Start game
function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  level = 1;
  timeLeft = 60;
  speed.enemy = 3;
  speed.bullet = 15;
  playerSpeed = 40;
  scoreEl.textContent = 0;
  levelEl.textContent = 1;
  timerEl.textContent = `Time: ${timeLeft}`;
  startBtn.disabled = true;
  pauseBtn.disabled = false;

  // clean up previous
  gameArea.querySelectorAll(".bullet, .enemy").forEach((el) => el.remove());
  bullets = [];
  enemies = [];

  // spawn enemies + timer
  spawnInterval = setInterval(spawnEnemy, 900);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}`;
    if (timeLeft <= 0) endGame();
  }, 1000);

  updateGame();
}

// ⏸ Pause game
function pauseGame() {
  gameRunning = false;
  clearInterval(timer);
  clearInterval(spawnInterval);
  cancelAnimationFrame(gameLoopId);
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

// ⏹ End game
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

// 🧹 Reset best
resetBtn.addEventListener("click", () => {
  localStorage.removeItem("rialoHighscore");
  highscoreEl.textContent = 0;
});

// 🎬 Buttons
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
