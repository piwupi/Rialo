// =================== RIALO SPACE SHOOTER ===================

// Elements
const player      = document.getElementById("player");
const gameArea    = document.getElementById("gameArea");
const overlay     = document.getElementById("overlay");
const scoreEl     = document.getElementById("score");
const levelEl     = document.getElementById("level");
const highscoreEl = document.getElementById("highscore");
const timerEl     = document.getElementById("timer");
const timerMirror = document.getElementById("timerMirror");

// State
let bullets = [], enemies = [];
let score = 0, level = 1, timeLeft = 60, playerX = 0, gameRunning = false;
let timer, spawnInterval, gameLoopId;
let highscore = Number(localStorage.getItem("rialoHighscore") || 0);
highscoreEl.textContent = highscore;

// Constants
const speed = { bullet: 15, enemy: 3 };
const STEP = 40;          // langkah gerak player
const BULLET_W = 5;       // lebar peluru (untuk hitung center)

// ---------- Helpers ----------
const maxPlayerX = () => gameArea.clientWidth - player.clientWidth;

function centerPlayer() {
  playerX = (gameArea.clientWidth - player.clientWidth) / 2;
  player.style.left = playerX + "px";
}

function showOverlay(text = "Press <span>Enter</span> to play") {
  overlay.innerHTML = text;
  overlay.style.display = "flex";
}
function hideOverlay() {
  overlay.style.display = "none";
}

// ---------- Controls ----------
document.addEventListener("keydown", (e) => {
  // Enter untuk mulai saat belum running
  if (!gameRunning && (e.code === "Enter" || e.key === "Enter")) {
    e.preventDefault();
    startGame();
    return;
  }
  if (!gameRunning) return;

  if (e.key === "ArrowLeft")  movePlayer(-STEP);
  if (e.key === "ArrowRight") movePlayer(+STEP);

  // Space untuk menembak
  if (e.code === "Space" || e.key === " " || e.key === "Spacebar") {
    e.preventDefault();
    shoot();
  }
});

// Wrap-around movement (kanan tembus kiri & sebaliknya)
function movePlayer(dx) {
  const maxX = maxPlayerX();
  let next = playerX + dx;
  if (next > maxX) next = 0;
  if (next < 0)    next = maxX;
  playerX = next;
  player.style.left = playerX + "px";
}

// ---------- Shooting (pakai TOP agar stabil) ----------
function shoot() {
  const b = document.createElement("div");
  b.className = "bullet";

  // Posisi absolut -> relatif ke gameArea
  const p = player.getBoundingClientRect();
  const g = gameArea.getBoundingClientRect();

  const centerX = (p.left - g.left) + (p.width / 2) - (BULLET_W / 2);
  const topY    = (p.top  - g.top)  - 10; // 10px di atas pesawat

  b.style.left = centerX + "px";
  b.style.top  = topY    + "px";

  gameArea.appendChild(b);
  bullets.push(b);
}

// ---------- Enemy spawn (2 tipe: 1 & 2 poin) ----------
function spawnEnemy() {
  if (!gameRunning) return;
  const e = document.createElement("div");
  e.className = "enemy";

  const type = Math.random() < 0.7 ? 1 : 2;  // 70% tipe-1, 30% tipe-2
  e.dataset.type = type;
  e.style.backgroundImage = `url('Enemy ${type}.png')`;

  e.style.left = (Math.random() * (gameArea.clientWidth - 50)) + "px";
  e.style.top  = "-50px";

  gameArea.appendChild(e);
  enemies.push(e);
}

// ---------- Main Loop ----------
function updateGame() {
  if (!gameRunning) return;

  // Bullets (bergerak ke atas dengan mengurangi top)
  bullets.forEach((b, i) => {
    const y = parseInt(b.style.top);
    if (y < -30) {
      b.remove(); bullets.splice(i, 1);
    } else {
      b.style.top = (y - speed.bullet) + "px";
    }
  });

  // Enemies (jatuh ke bawah)
  enemies.forEach((e, i) => {
    const t = parseInt(e.style.top);
    if (t > gameArea.clientHeight) {
      e.remove(); enemies.splice(i, 1);
    } else {
      e.style.top = (t + speed.enemy) + "px";
    }
  });

  // Bullet vs Enemy (tambah skor sesuai tipe)
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      const br = b.getBoundingClientRect();
      const er = e.getBoundingClientRect();
      if (br.left < er.right && br.right > er.left && br.top < er.bottom && br.bottom > er.top) {
        const points = Number(e.dataset.type) === 2 ? 2 : 1;
        e.remove(); b.remove();
        enemies.splice(ei, 1); bullets.splice(bi, 1);

        score += points; scoreEl.textContent = score;

        // Naik level tiap kelipatan 10 poin
        if (score % 10 === 0) {
          level++; levelEl.textContent = level;
          speed.enemy += 0.7; speed.bullet += 0.3;
        }
      }
    });
  });

  // Enemy hits player -> Game Over
  enemies.forEach((e) => {
    const er = e.getBoundingClientRect();
    const pr = player.getBoundingClientRect();
    if (er.left < pr.right && er.right > pr.left && er.top < pr.bottom && er.bottom > pr.top) {
      endGame(true);
    }
  });

  gameLoopId = requestAnimationFrame(updateGame);
}

// ---------- Start / End ----------
function startGame() {
  if (gameRunning) return;
  gameRunning = true;

  score = 0; level = 1; timeLeft = 60;
  speed.enemy = 3; speed.bullet = 15;

  scoreEl.textContent  = 0;
  levelEl.textContent  = 1;
  timerEl.textContent  = `Time: ${timeLeft}`;
  if (timerMirror) timerMirror.textContent = timeLeft;

  // Reset entitas & posisikan player
  gameArea.querySelectorAll(".bullet,.enemy").forEach(el => el.remove());
  bullets = []; enemies = [];
  centerPlayer();
  hideOverlay();

  spawnInterval = setInterval(spawnEnemy, 900);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}`;
    if (timerMirror) timerMirror.textContent = timeLeft;
    if (timeLeft <= 0) endGame(false);
  }, 1000);

  updateGame();
}

function endGame(hit) {
  gameRunning = false;
  clearInterval(timer); clearInterval(spawnInterval);
  cancelAnimationFrame(gameLoopId);

  const best = Number(localStorage.getItem("rialoHighscore") || 0);
  if (score > best) {
    localStorage.setItem("rialoHighscore", score);
    highscoreEl.textContent = score;
  }

  showOverlay(hit
    ? 'Game Over — Press <span>Enter</span> to play again'
    : 'Time’s up — Press <span>Enter</span> to play again');
}

// Init overlay on load
showOverlay();
window.addEventListener("resize", () => { if (!gameRunning) centerPlayer(); });
