const player=document.getElementById("player");
const gameArea=document.getElementById("gameArea");
const scoreEl=document.getElementById("score");
const levelEl=document.getElementById("level");
const highscoreEl=document.getElementById("highscore");
const startBtn=document.getElementById("startBtn");
const pauseBtn=document.getElementById("pauseBtn");
const timerEl=document.getElementById("timer");
const timerMirror=document.getElementById("timerMirror"); // mirror
const resetBtn=document.getElementById("resetBtn");

let bullets=[],enemies=[],score=0,level=1,timeLeft=60,playerX=160,gameRunning=false;
let timer,spawnInterval,gameLoopId;
let highscore=localStorage.getItem("rialoHighscore")||0; highscoreEl.textContent=highscore;

const speed={bullet:15,enemy:3}; let playerSpeed=40;

document.addEventListener("keydown",e=>{
  if(!gameRunning) return;
  if(e.key==="ArrowLeft" && playerX>0) playerX-=playerSpeed;
  if(e.key==="ArrowRight" && playerX<320) playerX+=playerSpeed;
  if(e.key===" ") shoot();
  player.style.left=playerX+"px";
});

function shoot() {
  const bullet = document.createElement("div");
  bullet.classList.add("bullet");

  // Ambil posisi tengah player secara dinamis
  const playerRect = player.getBoundingClientRect();
  const gameRect = gameArea.getBoundingClientRect();
  const bulletX = playerRect.left - gameRect.left + playerRect.width / 2 - 2.5; // -2.5 biar peluru di tengah (karena width bullet 5px)

  bullet.style.left = bulletX + "px";
  bullet.style.bottom = "120px";

  gameArea.appendChild(bullet);
  bullets.push(bullet);
}

function spawnEnemy(){
  if(!gameRunning) return;
  const e=document.createElement("div");
  e.className="enemy";
  e.style.left=(Math.random()*360)+"px";
  e.style.top="-40px";
  gameArea.appendChild(e); enemies.push(e);
}

function updateGame(){
  if(!gameRunning) return;

  bullets.forEach((b,i)=>{
    const y=parseInt(b.style.bottom);
    if(y>700){ b.remove(); bullets.splice(i,1); }
    else b.style.bottom=(y+speed.bullet)+"px";
  });

  enemies.forEach((e,i)=>{
    const t=parseInt(e.style.top);
    if(t>700){ e.remove(); enemies.splice(i,1); }
    else e.style.top=(t+speed.enemy)+"px";
  });

  // bullet vs enemy
  bullets.forEach((b,bi)=>{
    enemies.forEach((e,ei)=>{
      const br=b.getBoundingClientRect(), er=e.getBoundingClientRect();
      if(br.left<er.right && br.right>er.left && br.top<er.bottom && br.bottom>er.top){
        e.remove(); b.remove(); enemies.splice(ei,1); bullets.splice(bi,1);
        score++; scoreEl.textContent=score;
        if(score%10===0){ level++; levelEl.textContent=level; speed.enemy+=0.7; speed.bullet+=0.3; }
      }
    });
  });

  // enemy hits player => game over
  enemies.forEach(e=>{
    const er=e.getBoundingClientRect(), pr=player.getBoundingClientRect();
    if(er.left<pr.right && er.right>pr.left && er.top<pr.bottom && er.bottom>pr.top){
      endGame(true);
    }
  });

  gameLoopId=requestAnimationFrame(updateGame);
}

function startGame(){
  if(gameRunning) return;
  gameRunning=true; score=0; level=1; timeLeft=60;
  speed.enemy=3; speed.bullet=15; playerSpeed=40;
  scoreEl.textContent=0; levelEl.textContent=1;
  timerEl.textContent=`Time: ${timeLeft}`; timerMirror.textContent=timeLeft;
  startBtn.disabled=true; pauseBtn.disabled=false;

  gameArea.querySelectorAll(".bullet,.enemy").forEach(el=>el.remove());
  bullets=[]; enemies=[];

  spawnInterval=setInterval(spawnEnemy,900);
  timer=setInterval(()=>{
    timeLeft--;
    timerEl.textContent=`Time: ${timeLeft}`;
    timerMirror.textContent=timeLeft; // sinkron panel kanan
    if(timeLeft<=0) endGame(false);
  },1000);

  updateGame();
}

function pauseGame(){
  gameRunning=false;
  clearInterval(timer); clearInterval(spawnInterval);
  cancelAnimationFrame(gameLoopId);
  startBtn.disabled=false; pauseBtn.disabled=true;
}

function endGame(hit){
  gameRunning=false;
  clearInterval(timer); clearInterval(spawnInterval);
  cancelAnimationFrame(gameLoopId);
  alert(hit ? "You got hit! Game over!" : `Time’s up! Final Score: ${score}`);
  if(score>highscore){ localStorage.setItem("rialoHighscore",score); highscoreEl.textContent=score; }
  startBtn.disabled=false; pauseBtn.disabled=true;
}

resetBtn?.addEventListener("click",()=>{
  localStorage.removeItem("rialoHighscore"); highscoreEl.textContent=0;
});
startBtn.addEventListener("click",startGame);
pauseBtn.addEventListener("click",pauseGame);

