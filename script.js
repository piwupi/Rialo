// Elements
const player = document.getElementById("player");
const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const highscoreEl = document.getElementById("highscore");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const timerEl = document.getElementById("timer");
const timerMirror = document.getElementById("timerMirror");
const resetBtn = document.getElementById("resetBtn");

// State
let bullets = [], enemies = [];
let score = 0, level = 1, timeLeft = 60, playerX = 160, gameRunning = false;
let timer, spawnInterval, gameLoopId;
let highscore = localStorage.getItem("rialoHighscore") || 0;
highscoreEl.textContent = highscore;

// Speeds
const speed = { bullet: 15, enemy: 3 };
let playerSpeed = 40; // 2x faster

// Controls
document.addEventListener("keydown", e => {
  if (!gameRunning) return;
  if (e.key === "ArrowLeft"  && playerX > 0)   playerX -= playerSpeed;
  if (e.key === "ArrowRight" && playerX < 320) playerX += playerSpeed;
  if (e.key === " ") { e.preventDefault(); shoot(); } // prevent page scroll
  player.style.left = playerX + "px";
});

// Shoot from the exact center of the logo
function shoot() {
  const bullet = document.createElement("div");
  bullet.classList.add("bullet");

  const playerRect = player.getBoundingClientRect();
  const gameRect   = gameArea.getBoundingClientRect();
  const bulletX = playerRect.left - gameRect.left + playerRect.width / 2 - 2.5; // 2.5 = half bullet width

  bullet.style.left = bulletX + "px";
  bullet.style.bottom = "120px";
  gameArea.appendChild(bullet);
  bullets.push(bullet);
}

// Enemies
function spawnEnemy() {
  if (!gameRunning) return;
  const e = document.createElement("div");
  e.className = "enemy";
  e.style.left = (Math.random() * 360) + "px";
  e.style.top  = "-40px";
  gameArea.appendChild(e);
  enemies.push(e);
}

// Loop
function updateGame() {
  if (!gameRunning) return;

  // bullets
  bullets.forEach((b, i) => {
    const y = parseInt(b.style.bottom);
    if (y > 700) { b.remove(); bullets.splice(i, 1); }
    else b.style.bottom = (y + speed.bullet) + "px";
  });

  // enemies
  enemies.forEach((e, i) => {
    const t = parseInt(e.style.top);
    if (t > 700) { e.remove(); enemies.splice(i, 1); }
    else e.style.top = (t + speed.enemy) + "px";
  });

  // bullet vs enemy
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      const br = b.getBoundingClientRect(), er = e.getBoundingClientRect();
      if (br.left < er.right && br.right > er.left && br.top < er.bottom && br.bottom > er.top) {
        e.remove(); b.remove(); enemies.splice(ei, 1); bullets.splice(bi, 1);
        score++; scoreEl.textContent = score;

        // ramp difficulty every 10 points
        if (score % 10 === 0) {
          level++; levelEl.textContent = level;
          speed.enemy += 0.7; speed.bullet += 0.3;
        }
      }
    });
  });

  // enemy hits player -> game over
  enemies.forEach(e => {
    const er = e.getBoundingClientRect(), pr = player.getBoundingClientRect();
    if (er.left < pr.right && er.right > pr.left && er.top < pr.bottom && er.bottom > pr.top) {
      endGame(true);
    }
  });

  gameLoopId = requestAnimationFrame(updateGame);
}

// Start / Pause / End
function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0; level = 1; timeLeft = 60;
  speed.enemy = 3; speed.bullet = 15; playerSpeed = 40;
  scoreEl.textContent = 0; levelEl.textContent = 1;
  timerEl.textContent = `Time: ${timeLeft}`; timerMirror.textContent = timeLeft;
  startBtn.disabled = true; pauseBtn.disabled = false;

  // reset entities & set initial player pos
  gameArea.querySelectorAll(".bullet,.enemy").forEach(el => el.remove());
  bullets = []; enemies = [];
  player.style.left = playerX + "px";

  spawnInterval = setInterval(spawnEnemy, 900);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}`;
    timerMirror.textContent = timeLeft;
    if (timeLeft <= 0) endGame(false);
  }, 1000);

  updateGame();
}
function pauseGame() {
  gameRunning = false;
  clearInterval(timer); clearInterval(spawnInterval);
  cancelAnimationFrame(gameLoopId);
  startBtn.disabled = false; pauseBtn.disabled = true;
}
function endGame(hit) {
  gameRunning = false;
  clearInterval(timer); clearInterval(spawnInterval);
  cancelAnimationFrame(gameLoopId);
  alert(hit ? "You got hit! Game over!" : `Time’s up! Final Score: ${score}`);
  if (score > highscore) { localStorage.setItem("rialoHighscore", score); highscoreEl.textContent = score; }
  startBtn.disabled = false; pauseBtn.disabled = true;
}

// Buttons
resetBtn.addEventListener("click", () => { localStorage.removeItem("rialoHighscore"); highscoreEl.textContent = 0; });
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
