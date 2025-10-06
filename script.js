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
let playerX = 160;
let gameRunning = false;
let timer, spawnInterval, gameLoopId;
let highscore = localStorage.getItem("rialoHighscore") || 0;
highscoreEl.textContent = highscore;

// ⚙️ base speeds
const speed = { bullet: 15, enemy: 3 };
let playerSpeed = 40;

// 🎮 movement
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  if (e.key === "ArrowLeft" && playerX > 0) playerX -= playerSpeed;
  if (e.key === "ArrowRight" && playerX < 320) playerX += playerSpeed;
  if (e.key === " ") shoot();
  player.style.left = playerX + "px";
});

// 🔫 shoot
function shoot() {
  const bullet = document.createElement("div");
  bullet.classList.add("bullet");
  bullet.style.left = playerX + 45 + "px"; // adjusted for larger logo
  bullet.style.bottom = "120px";
  gameArea.appendChild(bullet);
  bullets.push(bullet);
}

// 👾 spawn enemies
function spawnEnemy() {
  if (!gameRunning) return;
  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  enemy.style.left = Math.random() * 360 + "px";
  enemy.style.top = "-40px";
  gameArea.appendChild(enemy);
  enemies.push(enemy);
}

// 🔁 main loop
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

  // bullet hits enemy
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

        // speed up gradually
        if (score % 10 === 0) {
          level++;
          levelEl.textContent = level;
          speed.enemy += 0.7;
          speed.bullet += 0.3;
        }
      }
    });
  });

  // enemy hits player → game over
  enemies.forEach((e) => {
    const eRect = e.getBoundingClientRect();
    const pRect = player.getBoundingClientRect();
    if (
      eRect.left < pRect.right &&
      eRect.right > pRect.left &&
      eRect.top < pRect.bottom &&
      eRect.bottom > pRect.top
    ) {
      endGame(true); // true = hit by enemy
    }
  });

  gameLoopId = requestAnimationFrame(updateGame);
}

// ▶️ start
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

  // reset elements
  gameArea.querySelectorAll(".bullet, .enemy").forEach((el) => el.remove());
  bullets = [];
  enemies = [];

  spawnInterval = setInterval(spawnEnemy, 900);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}`;
    if (timeLeft <= 0) endGame(false);
  }, 1000);

  updateGame();
}

// ⏸ pause
function pauseGame() {
  gameRunning = false;
  clearInterval(timer);
  clearInterval(spawnInterval);
  cancelAnimationFrame(gameLoopId);
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

// 🧨 game over
function endGame(hitByEnemy = false) {
  gameRunning = false;
  clearInterval(timer);
  clearInterval(spawnInterval);
  cancelAnimationFrame(gameLoopId);

  if (hitByEnemy) {
    alert("You got hit! Game over!");
  } else {
    alert(`Time’s up! Final Score: ${score}`);
  }

  if (score > highscore) {
    localStorage.setItem("rialoHighscore", score);
    highscoreEl.textContent = score;
  }
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

// 🧹 reset best
resetBtn.addEventListener("click", () => {
  localStorage.removeItem("rialoHighscore");
  highscoreEl.textContent = 0;
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
