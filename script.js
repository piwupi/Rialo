const logo = document.getElementById("logo");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const highscoreEl = document.getElementById("highscore");
const resetScore = document.getElementById("resetScore");
const timerEl = document.getElementById("timer");
const gameArea = document.getElementById("gameArea");

let score = 0;
let level = 1;
let timeLeft = 30;
let timer;
let gameRunning = false;
let moveInterval;
let highscore = localStorage.getItem("rialoHighscore") || 0;
highscoreEl.textContent = highscore;

function randomPosition() {
  const maxX = gameArea.clientWidth - logo.clientWidth;
  const maxY = gameArea.clientHeight - logo.clientHeight;
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  logo.style.left = x + "px";
  logo.style.top = y + "px";
}

function startGame() {
  if (gameRunning) return;
  score = 0;
  level = 1;
  timeLeft = 30;
  scoreEl.textContent = score;
  levelEl.textContent = level;
  timerEl.textContent = "Time: " + timeLeft;
  gameRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;

  moveLogo();
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = "Time: " + timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function moveLogo() {
  clearInterval(moveInterval);
  moveInterval = setInterval(randomPosition, Math.max(300 - level * 20, 80));
}

function pauseGame() {
  gameRunning = false;
  clearInterval(timer);
  clearInterval(moveInterval);
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function endGame() {
  clearInterval(timer);
  clearInterval(moveInterval);
  gameRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  alert("Time’s up! You scored " + score + " points.");
  if (score > highscore) {
    localStorage.setItem("rialoHighscore", score);
    highscoreEl.textContent = score;
  }
}

logo.addEventListener("click", () => {
  if (!gameRunning) return;
  score++;
  scoreEl.textContent = score;

  if (score % 10 === 0) {
    level++;
    levelEl.textContent = level;
    moveLogo();
  }
  randomPosition();
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
resetScore.addEventListener("click", () => {
  localStorage.removeItem("rialoHighscore");
  highscoreEl.textContent = 0;
});
