// Car Racing - simple canvas game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const speedEl = document.getElementById('speed');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Game state
let running = false;
let paused = false;
let score = 0;
let speed = 1;
let highScore = 0;
let spawnTimer = 0;
let spawnInterval = 90; // frames
let frameCount = 0;

// Player car
const player = {
  x: WIDTH / 2 - 30,
  y: HEIGHT - 140,
  w: 60,
  h: 120,
  lane: 1,
  color: '#00E676',
  moveSpeed: 10
};

const lanes = [WIDTH * 0.15, WIDTH * 0.5 - player.w/2, WIDTH * 0.85 - player.w]; // three lanes

// Obstacles (other cars)
let obstacles = [];

// Resize helper for responsiveness: scale drawing but keep logical canvas size
function clear() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function drawRoad() {
  // road background
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // grass sides
  ctx.fillStyle = '#163425';
  ctx.fillRect(0, 0, WIDTH * 0.12, HEIGHT);
  ctx.fillRect(WIDTH * 0.88, 0, WIDTH * 0.12, HEIGHT);

  // road stripes
  ctx.fillStyle = '#111';
  ctx.fillRect(WIDTH * 0.12, 0, WIDTH * 0.76, HEIGHT);

  // lane divider dashed lines
  ctx.strokeStyle = '#fff6';
  ctx.lineWidth = 6;
  ctx.setLineDash([30, 30]);
  ctx.beginPath();
  ctx.moveTo(WIDTH * 0.12 + WIDTH * 0.76 / 6, 0);
  ctx.lineTo(WIDTH * 0.12 + WIDTH * 0.76 / 6, HEIGHT);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(WIDTH * 0.12 + 2 * (WIDTH * 0.76 / 6), 0);
  ctx.lineTo(WIDTH * 0.12 + 2 * (WIDTH * 0.76 / 6), HEIGHT);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(WIDTH * 0.12 + 3 * (WIDTH * 0.76 / 6), 0);
  ctx.lineTo(WIDTH * 0.12 + 3 * (WIDTH * 0.76 / 6), HEIGHT);
  ctx.stroke();

  ctx.setLineDash([]);
}

function drawPlayer() {
  // car body
  roundRect(ctx, player.x, player.y, player.w, player.h, 8, player.color);
  // windows
  ctx.fillStyle = '#a7e0ff';
  ctx.fillRect(player.x + 10, player.y + 18, player.w - 20, 28);
  // wheels
  ctx.fillStyle = '#111';
  ctx.fillRect(player.x + 6, player.y + player.h - 8, 18, 8);
  ctx.fillRect(player.x + player.w - 24, player.y + player.h - 8, 18, 8);
}

function roundRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

// obstacle factory
function spawnObstacle() {
  const laneIndex = Math.floor(Math.random() * lanes.length);
  const w = 60 + Math.random() * 30;
  const h = 110 + Math.random() * 30;
  const x = lanes[laneIndex];
  const y = -h - 20;
  const color = ['#FF5252', '#FFB300', '#448AFF', '#9C27B0'][Math.floor(Math.random() * 4)];
  obstacles.push({x, y, w, h, color, lane: laneIndex});
}

function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const ob = obstacles[i];
    ob.y += 4 * speed;
    // off screen
    if (ob.y > HEIGHT + 100) {
      obstacles.splice(i, 1);
      score += 10;
      scoreEl.textContent = score;
    }
  }
}

function drawObstacles() {
  obstacles.forEach(ob => {
    roundRect(ctx, ob.x, ob.y, ob.w, ob.h, 8, ob.color);
    // wheels
    ctx.fillStyle = '#111';
    ctx.fillRect(ob.x + 6, ob.y + ob.h - 8, 18, 8);
    ctx.fillRect(ob.x + ob.w - 24, ob.y + ob.h - 8, 18, 8);
  });
}

function checkCollision() {
  for (const ob of obstacles) {
    if (rectIntersect(player.x, player.y, player.w, player.h, ob.x, ob.y, ob.w, ob.h)) {
      return true;
    }
  }
  return false;
}

function rectIntersect(x1,y1,w1,h1, x2,y2,w2,h2) {
  return !(x2 > x1 + w1 || x2 + w2 < x1 || y2 > y1 + h1 || y2 + h2 < y1);
}

function updatePlayer() {
  // keep within road bounds (approx)
  const leftBound = lanes[0] - 10;
  const rightBound = lanes[lanes.length-1] + player.w + 10;
  if (player.x < leftBound) player.x = leftBound;
  if (player.x + player.w > rightBound) player.x = rightBound - player.w;
}

let keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

function handleInput() {
  if (keys['arrowleft'] || keys['a']) {
    player.x -= player.moveSpeed + speed;
  }
  if (keys['arrowright'] || keys['d']) {
    player.x += player.moveSpeed + speed;
  }
  // snap to nearest lane if pressing up/down (optional)
  if (keys['arrowup'] || keys['w']) {
    // small boost forward (visual)
    player.y -= 6;
  } else {
    if (player.y < HEIGHT - 140) player.y += 6; // settle back down
  }
}

// game loop
function loop() {
  if (!running || paused) return;
  frameCount++;
  clear();
  drawRoad();
  handleInput();
  updatePlayer();

  // spawn obstacles periodically
  spawnTimer++;
  if (spawnTimer > spawnInterval) {
    spawnObstacle();
    spawnTimer = 0;
    // gradually shorten spawn interval as speed increases
    spawnInterval = Math.max(40, Math.floor(90 - speed * 8));
  }

  updateObstacles();
  drawObstacles();

  drawPlayer();

  // increase speed slowly
  if (frameCount % 600 === 0) {
    speed += 0.5;
    speedEl.textContent = speed.toFixed(1);
  }

  // check collisions
  if (checkCollision()) {
    gameOver();
    return;
  }

  requestAnimationFrame(loop);
}

function startGame() {
  if (running) return;
  running = true;
  paused = false;
  score = 0;
  speed = 1;
  spawnInterval = 90;
  spawnTimer = 0;
  frameCount = 0;
  obstacles = [];
  player.x = lanes[1];
  player.y = HEIGHT - 140;
  scoreEl.textContent = score;
  speedEl.textContent = speed.toFixed(1);
  loop();
}

function pauseGame() {
  paused = !paused;
  if (!paused) {
    loop();
  }
}

function restartGame() {
  running = false;
  paused = false;
  startGame();
}

function gameOver() {
  running = false;
  paused = false;
  highScore = Math.max(highScore, score);
  setTimeout(() => {
    const again = confirm(`Game Over! Score: ${score}\nHigh Score: ${highScore}\nPlay again?`);
    if (again) restartGame();
  }, 50);
}

// UI buttons
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);

// initial draw
drawRoad();
drawPlayer();
drawObstacles();
