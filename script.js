const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
let bullets = [];
let enemies = [];

let playerX = window.innerWidth / 2;
const playerSpeed = 10;

// Gerak kiri / kanan / tembak
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && playerX > 0) playerX -= playerSpeed;
  if (e.key === 'ArrowRight' && playerX < window.innerWidth - 60) playerX += playerSpeed;
  if (e.key === ' ') shoot();
  player.style.left = playerX + 'px';
});

function shoot() {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  bullet.style.left = playerX + 28 + 'px';
  bullet.style.bottom = '70px';
  gameArea.appendChild(bullet);
  bullets.push(bullet);
}

function spawnEnemy() {
  const enemy = document.createElement('div');
  enemy.classList.add('enemy');
  enemy.style.left = Math.random() * (window.innerWidth - 40) + 'px';
  enemy.style.top = '0px';
  gameArea.appendChild(enemy);
  enemies.push(enemy);
}

function gameLoop() {
  // Gerakkan peluru
  bullets.forEach((b, i) => {
    let bottom = parseInt(b.style.bottom);
    if (bottom > window.innerHeight) {
      b.remove();
      bullets.splice(i, 1);
    } else {
      b.style.bottom = bottom + 10 + 'px';
    }
  });

  // Gerakkan musuh
  enemies.forEach((e, i) => {
    let top = parseInt(e.style.top);
    if (top > window.innerHeight) {
      e.remove();
      enemies.splice(i, 1);
    } else {
      e.style.top = top + 2 + 'px';
    }
  });

  // Deteksi tabrakan
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
      }
    });
  });

  requestAnimationFrame(gameLoop);
}

setInterval(spawnEnemy, 1500);
gameLoop();
