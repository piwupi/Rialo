// ===== Elements =====
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

// ===== State =====
let bullets = [], enemies = [];
let score = 0, level = 1, timeLeft = 60, playerX = 0, gameRunning = false;
let timer, spawnInterval, gameLoopId;
let highscore = Number(localStorage.getItem("rialoHighscore") || 0);
highscoreEl.textContent = highscore;

// ===== Constants =====
const speed = { bullet: 15, enemy: 3 }; // enemy bertahap makin cepat
const STEP = 40;                         // langkah gerak pesawat (cepat)
const BULLET_W = 5;                      // lebar peluru (untuk center)

// ===== Helpers =====
const maxPlayerX = () => gameArea.clientWidth - player.clientWidth;
function centerPlayer(){
  playerX = (gameArea.clientWidth - player.clientWidth) / 2;
  player.style.left = playerX + "px";
}

// Wrap-around movement
function movePlayer(dx){
  const maxX = maxPlayerX();
  let next = playerX + dx;
  if (next > maxX) next = 0;     // kanan ke kiri
  if (next < 0)    next = maxX;  // kiri ke kanan
  playerX = next;
  player.style.left = playerX + "px";
}

// ===== Controls =====
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;

  if (e.key === "ArrowLeft")  movePlayer(-STEP);
  if (e.key === "ArrowRight") movePlayer(+STEP);

  // deteksi Space yang konsisten di semua browser
  if (e.code === "Space" || e.key === " " || e.key === "Spacebar") {
    e.preventDefault();
    shoot();
  }
});

// ===== Shoot (center of ship) =====
function shoot() {
  const b = document.createElement("div");
  b.className = "bullet";

  // X tepat di tengah pesawat (pakai state playerX, bukan offsetLeft)
  const centerX = playerX + player.clientWidth / 2 - BULLET_W / 2;

  // Y: pakai nilai bottom si player (bukan offsetTop)
  const playerBottom = parseInt(getComputedStyle(player).bottom, 10); // contoh: 40px
  const bulletBottom = playerBottom + player.clientHeight - 5;        // muncul tepat di atas pesawat

  b.style.left   = centerX + "px";
  b.style.bottom = bulletBottom + "px";

  gameArea.appendChild(b);
  bullets.push(b);
}

// ===== Enemies (two types, different points) =====
function spawnEnemy(){
  if (!gameRunning) return;
  const e = document.createElement("div");
  e.className = "enemy";

  // 70% Enemy 1 (1 point), 30% Enemy 2 (2 points)
  const type = Math.random() < 0.7 ? 1 : 2;
  e.dataset.type = type;
  e.style.backgroundImage = `url('Enemy ${type}.png')`;

  e.style.left = (Math.random() * (gameArea.clientWidth - 50)) + "px";
  e.style.top  = "-50px";

  gameArea.appendChild(e);
  enemies.push(e);
}

// ===== Loop =====
function updateGame(){
  if (!gameRunning) return;

  // bullets
  bullets.forEach((b,i)=>{
    const y = parseInt(b.style.bottom);
    if (y > gameArea.clientHeight){ b.remove(); bullets.splice(i,1); }
    else b.style.bottom = (y + speed.bullet) + "px";
  });

  // enemies
  enemies.forEach((e,i)=>{
    const t = parseInt(e.style.top);
    if (t > gameArea.clientHeight){ e.remove(); enemies.splice(i,1); }
    else e.style.top = (t + speed.enemy) + "px";
  });

  // bullet vs enemy (type-based score)
  bullets.forEach((b,bi)=>{
    enemies.forEach((e,ei)=>{
      const br=b.getBoundingClientRect(), er=e.getBoundingClientRect();
      if (br.left<er.right && br.right>er.left && br.top<er.bottom && br.bottom>er.top){
        const points = Number(e.dataset.type) === 2 ? 2 : 1;
        e.remove(); b.remove(); enemies.splice(ei,1); bullets.splice(bi,1);
        score += points; scoreEl.textContent = score;

        if (score % 10 === 0){
          level++; levelEl.textContent = level;
          speed.enemy += 0.7; speed.bullet += 0.3;
        }
      }
    });
  });

  // enemy hits player → game over
  enemies.forEach(e=>{
    const er=e.getBoundingClientRect(), pr=player.getBoundingClientRect();
    if (er.left<pr.right && er.right>pr.left && er.top<pr.bottom && er.bottom>pr.top){
      endGame(true);
    }
  });

  gameLoopId = requestAnimationFrame(updateGame);
}

// ===== Start / Pause / End =====
function startGame(){
  if (gameRunning) return;
  gameRunning = true;

  score=0; level=1; timeLeft=60;
  speed.enemy=3; speed.bullet=15;
  scoreEl.textContent=0; levelEl.textContent=1;
  timerEl.textContent = `Time: ${timeLeft}`;
  if (timerMirror) timerMirror.textContent = timeLeft;

  startBtn.disabled = true; pauseBtn.disabled = false;

  // reset & center ship
  gameArea.querySelectorAll(".bullet,.enemy").forEach(el=>el.remove());
  bullets=[]; enemies=[];
  centerPlayer();

  spawnInterval = setInterval(spawnEnemy, 900);
  timer = setInterval(()=>{
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}`;
    if (timerMirror) timerMirror.textContent = timeLeft;
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
resetBtn?.addEventListener("click", ()=>{
  localStorage.removeItem("rialoHighscore");
  highscoreEl.textContent = 0;
});
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
window.addEventListener("resize", ()=>{ if(!gameRunning) centerPlayer(); });
