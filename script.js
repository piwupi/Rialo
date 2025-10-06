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
let score = 0, level = 1, timeLeft = 60, playerX = 0, gameRunning = false;
let timer, spawnInterval, gameLoopId;
let highscore = localStorage.getItem("rialoHighscore") || 0;
highscoreEl.textContent = highscore;

// Speeds & constants
const speed = { bullet: 15, enemy: 3 }; // enemy starts slow, scales with score
const STEP = 40;                         // player step (fast)
const BULLET_W = 5;

// Helpers
function centerPlayer(){
  const areaW = gameArea.clientWidth;
  const shipW = player.clientWidth;
  playerX = (areaW - shipW) / 2;
  player.style.left = playerX + "px";
}
function maxPlayerX(){ return gameArea.clientWidth - player.clientWidth; }

// Controls
document.addEventListener("keydown", e => {
  if (!gameRunning) return;
  if (e.key === "ArrowLeft")  playerX = Math.max(0, playerX - STEP);
  if (e.key === "ArrowRight") playerX = Math.min(maxPlayerX(), playerX + STEP);
  if (e.key === " ") { e.preventDefault(); shoot(); }
  player.style.left = playerX + "px";
});

// Shoot from the exact center of the logo
function shoot(){
  const b = document.createElement("div");
  b.className = "bullet";

  const centerX = player.offsetLeft + player.clientWidth/2 - BULLET_W/2;
  const bottom  = gameArea.clientHeight - (player.offsetTop + player.clientHeight);

  b.style.left   = centerX + "px";
  b.style.bottom = bottom + "px";

  gameArea.appendChild(b);
  bullets.push(b);
}

// Enemies
function spawnEnemy(){
  if (!gameRunning) return;
  const e = document.createElement("div");
  e.className = "enemy";
  e.style.left = (Math.random() * (gameArea.clientWidth - 40)) + "px";
  e.style.top  = "-40px";
  gameArea.appendChild(e);
  enemies.push(e);
}

// Loop
function updateGame(){
  if (!gameRunning) return;

  // bullets
  bullets.forEach((b, i) => {
    const y = parseInt(b.style.bottom);
    if (y > gameArea.clientHeight) { b.remove(); bullets.splice(i, 1); }
    else b.style.bottom = (y + speed.bullet) + "px";
  });

  // enemies
  enemies.forEach((e, i) => {
    const t = parseInt(e.style.top);
    if (t > gameArea.clientHeight) { e.remove(); enemies.splice(i, 1); }
    else e.style.top = (t + speed.enemy) + "px";
  });

  // bullet vs enemy
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      const br = b.getBoundingClientRect(), er = e.getBoundingClientRect();
      if (br.left < er.right && br.right > er.left && br.top < er.bottom && br.bottom > er.top) {
        e.remove(); b.remove(); enemies.splice(ei, 1); bullets.splice(bi, 1);
        score++; scoreEl.textContent = score;

        if (score % 10 === 0) { // ramp difficulty
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
function startGame(){
  if (gameRunning) return;
  gameRunning = true;

  score = 0; level = 1; timeLeft = 60;
  speed.enemy = 3; speed.bullet = 15;
  scoreEl.textContent = 0; levelEl.textContent = 1;
  timerEl.textContent = `Time: ${timeLeft}`; timerMirror.textContent = timeLeft;

  startBtn.disabled = true; pauseBtn.disabled = false;

  // reset entities & center ship
  gameArea.querySelectorAll(".bullet,.enemy").forEach(el => el.remove());
  bullets = []; enemies = [];
  centerPlayer();

  spawnInterval = setInterval(spawnEnemy, 900);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}`;
    timerMirror.textContent = timeLeft;
    if (timeLeft <= 0) endGame(false);
  }, 1000);

  updateGame();
}
function pauseGame(){
  gameRunning = false;
  clearInterval(timer); clearInterval(spawnInterval);
  cancelAnimationFrame(gameLoopId);
  startBtn.disabled = false; pauseBtn.disabled = true;
}
function endGame(hit){
  gameRunning = false;
  clearInterval(timer); clearInterval(spawnInterval);
  cancelAnimationFrame(gameLoopId);
  alert(hit ? "You got hit! Game over!" : `Time’s up! Final Score: ${score}`);
  const best = Number(localStorage.getItem("rialoHighscore") || 0);
  if (score > best){ localStorage.setItem("rialoHighscore", score); highscoreEl.textContent = score; }
  startBtn.disabled = false; pauseBtn.disabled = true;
}

// Buttons & resize
resetBtn.addEventListener("click", () => { localStorage.removeItem("rialoHighscore"); highscoreEl.textContent = 0; });
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
window.addEventListener("resize", () => { if (!gameRunning) centerPlayer(); });
