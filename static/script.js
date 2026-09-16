let canvas;
let context;
 
let fpsInterval = 1000 / 30;
let now;
let then = Date.now();
let request;
let music_start = false
 
let tilesPerRow = 6;
let tileSize = 16;
let backgroundImage = new Image();
let background = [
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,32,33,34,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,32,33,34,-1,-1],
  [-1,-1,-1,45,-1,-1,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,2,2,-1,-1,45,-1,-1,-1],
  [-1,-1,-1,45,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,45,-1,-1,-1],
  [-1,-1,-1,50,-1,-1,-1,-1,-1,-1,18,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,50,-1,-1,-1],
  [-1,-1,-1,51,-1,31,-1,-1,-1,-1,24,-1,-1,-1,-1,-1,-1,-1,-1,-1,52,-1,-1,-1,43,-1,-1,-1,51,-1,-1,-1],
  [58,58,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,58,58],
  [64,64,10,10,5,10,10,10,10,5,10,10,10,10,10,10,10,5,5,10,10,10,10,10,5,10,10,10,10,10,64,64]
];
 
let player = {
  x: 50,
  y: 0,
  width: 32,
  height: 32,
  frameX: 0,
  xChange: 0,
  yChange: 0,
  in_air: false,
  prevState: "",
  isDead: false
}
 
let spriteSheet = new Image();
let animations = {
  idle: { row: 0, frames: 4, speed: 0.15 }, 
  run: { row: 3, frames: 8, speed: 0.15 }
};
let direction = "right";
let platforms = [];
let moveLeft = false;
let moveRight = false;
let moveUp = false;
 
// Angry Sun
let sunImage = new Image();
let sun = {
  x : 220,
  y: 20,
  width: 48,
  height: 48,
  baseY: 20,
  state: "patrol",
  patrolTimer: 0,
  patrolDelay: 150,
  speed: 15,
  targetX: 0,
  targetY: 0
};
 
// Coins
let coinImage = new Image();
let coins = [];
let coinScore = 0;
let coinTimer = 0; 
let coinFrame = 0; 
 
// using static audio because server was affecting the audio from playing originally
let background_music = new Audio(STATIC_AUDIO + "game.wav");
let coinSound = new Audio(STATIC_AUDIO + "coin.wav");
let deathSound = new Audio(STATIC_AUDIO + "death.wav");
 
document.addEventListener("DOMContentLoaded", init, false);
 
function init() {
  canvas = document.querySelector("canvas");
  context = canvas.getContext("2d");
  let floor = canvas.height - 27;
 
  document.querySelector("#restart").addEventListener("click", restartGame);
 
  platforms = [
    { x: 50, y: floor, w: 410, h: 27 }, 
    { x: 105, y: 230, w: 30, h: 16 },
    { x: 380, y: 230, w: 30, h: 16 },
    { x: 202, y: 196, w: 105, h: 16 },
    { x: 120, y: 181, w: 1, h: 16 },
    { x: 390, y: 181, w: 1, h: 16 }
  ];
 
  player.y = floor - player.height;
 
  window.addEventListener("keydown", activate, false);
  window.addEventListener("keyup", deactivate, false);
  window.addEventListener("keydown", function() {
    if (!music_start) {
      background_music.currentTime = 0;
      background_music.loop = true;
      background_music.volume = 0.5;
      background_music.play();
      music_start = true;
    }
  }, false);
 
  load_assets([
    {"var": spriteSheet,     "url": STATIC_IMAGES + "knight.png"}, // had to use static images because content was not loading on server
    {"var": backgroundImage, "url": STATIC_IMAGES + "world_tileset.png"},
    {"var": coinImage,       "url": STATIC_IMAGES + "coin.png"},
    {"var": sunImage,        "url": STATIC_IMAGES + "angry_sun.png"}
  ], draw);
}
 
// updating sun physics and mechanics
function updateSun() {
  if (sun.state === "patrol") {
    sun.x += Math.sin(sun.patrolTimer * 0.03) * 3; // google gemini was used for this to calculate the patrol
    sun.patrolTimer++;
 
    if (sun.patrolTimer >= sun.patrolDelay) {
      sun.state = "swoop";
      sun.targetX = player.x;
      sun.targetY = player.y;
      sun.patrolTimer = 0;
    }
  } else if (sun.state === "swoop") { // google gemini was used to calculate the swoop speed and mechanics
    let dx = sun.targetX - sun.x;
    let dy = sun.targetY - sun.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
 
    if (dist < sun.speed) {
      sun.state = "return";
    } else {
      sun.x += (dx / dist) * sun.speed
      sun.y += (dy / dist) * sun.speed;
    }
  } else if (sun.state === "return") {
    let dy = sun.baseY - sun.y;
    sun.y += dy * 0.08;
 
    if (Math.abs(dy) < 1) { // used google gemini here to calculate the return mechanic back to patroling mode
      sun.y = sun.baseY;
      sun.state = "patrol";
      sun.patrolDelay = 100 + Math.floor(Math.random() * 100);
    }
  }
 
  let sunPadding = 14
  if (!player.isDead &&
      player.x < (sun.x + sun.width) - sunPadding &&
      player.x + player.width > sun.x + sunPadding&&
      player.y < (sun.y + sun.height) - sunPadding &&
      player.y + player.height > sun.y + sunPadding) {
      player.isDead = true;
      stop("GAME OVER!")
    }
 
    // sun spinning
    context.save()
    context.translate(sun.x + sun.width / 2, sun.y + sun.height / 2);
    if (sun.state === "swoop") {
      sun.spinAngle = (sun.spinAngle || 0) + 0.15;
      context.rotate(sun.spinAngle);
    } else {
      sun.spinAngle = 0;
    }
    context.drawImage(sunImage, -sun.width / 2, -sun.height / 2, sun.width, sun.height);
    context.restore();
}
 
function spawnCoin() {
    let x = 60 + Math.random() * 380; 
    let y = 150 + Math.random() * 100
    coins.push({ x: x, y: y, width: 28, height: 28 });
}
 
function draw() {
  request = window.requestAnimationFrame(draw);
  let now = Date.now();
  let elapsed = now - then;
  if (elapsed <= fpsInterval) return;
  then = now - (elapsed % fpsInterval);
 
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#87cefa";
  context.fillRect(0, 0, canvas.width, canvas.height);
 
  // Draw Background
  for (let r = 0; r < 20; r++) {
    for (let c = 0; c < 32; c++) {
      let tile = background[r][c];
      if (tile > 0) {
        let tileRow = Math.floor(tile / tilesPerRow);
        let tileCol = Math.floor(tile % tilesPerRow);
        context.drawImage(backgroundImage,
          tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
          c * tileSize, r * tileSize, tileSize, tileSize);
      }
    }
  }
 
  if (coins.length === 0) {
      coinTimer++;
      if (coinTimer > 60) {
          spawnCoin();
          coinTimer = 0;
      }
  }
 
  coinFrame = (coinFrame + 0.2) % 12; 
  for (let i = 0; i < coins.length; i++) {
      let c = coins[i];
      context.drawImage(coinImage,
          Math.floor(coinFrame) * 16, 0, 16, 16, 
          c.x, c.y, c.width, c.height 
      );
 
      let coinPadding = 14;
      if (!player.isDead &&
          player.x < (c.x + c.width) - coinPadding &&
          player.x + player.width > c.x + coinPadding &&
          player.y < (c.y + c.height) - coinPadding &&
          player.y + player.height > c.y + coinPadding) {
          coins.splice(i, 1);
          coinScore++;
          i--;
          coinSound.currentTime = 0;
          coinSound.play()
          document.getElementById("score").innerHTML = "Coins: " + coinScore;
      }
  }
 
  updateSun();
 
  // physics
  if (!player.isDead) {
    if (moveLeft) { player.xChange -= 0.5; direction = "left"; }
    if (moveRight) { player.xChange += 0.5; direction = "right"; }
    if (moveUp && !player.in_air) {
      player.yChange -= 20; 
      player.in_air = true;
    }
 
    player.x += player.xChange;
    player.y += player.yChange;
    player.yChange += 1.5; 
    player.xChange *= 0.9;
    player.yChange *= 0.9;
 
    player.in_air = true;
    for (let p of platforms) {
      if (player.y + player.height >= p.y && player.y + player.height <= p.y + 10 &&
          player.x + player.width > p.x && player.x < p.x + p.w && player.yChange >= 0) {
          player.y = p.y - player.height;
          player.yChange = 0;
          player.in_air = false;
      }
    }
 
    if (player.x + player.width < 64 && player.y > canvas.height - 50) {
      player.isDead = true;
      stop("GAME OVER!");
    }
    
    if (player.x > 448 && player.y > canvas.height - 50) {
      player.isDead = true;
      stop("GAME OVER!");
    }
  }
 
  // handles run and idle animation states
  let state = (player.in_air || moveLeft || moveRight) ? "run" : "idle";
  if (state !== player.prevState) player.frameX = 0;
  player.prevState = state;
 
  let anim = animations[state];
  player.frameX = (player.frameX + anim.speed) % anim.frames;
  let frame = Math.floor(player.frameX);
 
  if (!player.isDead) {
      context.save();
      if (direction === "left") {
        context.scale(-1, 1);
        context.drawImage(spriteSheet, frame * 32, anim.row * 32, 32, 32,
            -(player.x + player.width), player.y, player.width, player.height);
      } else {
        context.drawImage(spriteSheet, frame * 32, anim.row * 32, 32, 32,
            player.x, player.y, player.width, player.height);
      }
      context.restore();
  }
}
 
// from lectures
function stop(outcome) {
  window.cancelAnimationFrame(request);
  window.removeEventListener("keydown", activate);
  window.removeEventListener("keyup", deactivate);
  deathSound.play()
  background_music.pause()
  background_music.currentTime = 0
  let outcome_element = document.querySelector("#outcome");
  outcome_element.innerHTML = outcome;
 
  let data = new FormData();
  data.append("score", coinScore);
 
  let xhttp = new XMLHttpRequest();
 
  xhttp.addEventListener("readystatechange", handle_response, false);
  xhttp.open("POST", "/store_score", true)
  xhttp.send(data);
}
 
function handle_response(event) {
    let xhttp = event.target
    if ( xhttp.readyState === 4 ) {
        if ( xhttp.status === 200 ) {
            if (xhttp.responseText === "success") {
                console.log("Yes");
            }
            else {
                console.log("No");
            }
        }
    }
}
 
function restartGame() {
  deathSound.pause()
  deathSound.currentTime = 0
  player.x = 50;
  player.y = 265;
  player.xChange = 0;
  player.yChange = 0;
  player.isDead = false;
  player.in_air = false;
  sun.x = 220;
  sun.y = 20;
  sun.state = "patrol"
  sun.patrolTimer = 0;
  coinScore = 0;
  coins = [];
  music_start = false;
  document.getElementById("score").innerHTML = "Coins: 0"
  document.getElementById("outcome").innerHTML = "";
  window.addEventListener("keydown", activate, false);
  window.addEventListener("keyup", deactivate, false);
  draw();
}
 
function activate(event) {
   let key = event.key
    if (event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown") {
            event.preventDefault();
  }
  
  if (player.isDead) return;
 
  if (key === "ArrowLeft") {
      moveLeft = true;
  } else if (key === "ArrowUp") {
      moveUp = true;
  } else if (key === "ArrowRight") {
      moveRight = true;
  } 
}
 
function deactivate(event) {
    let key = event.key;
    if (key === "ArrowLeft") {
        moveLeft = false;
    } else if (key === "ArrowUp") {
        moveUp = false;
    } else if (key === "ArrowRight") {
        moveRight = false;
    }
}
 
function load_assets(assets, callback) {
  let num_assets = assets.length;
  let loaded = function() {
    num_assets--;
    if (num_assets === 0) callback();
  };
  for (let asset of assets) {
    asset.var.addEventListener("load", loaded, false);
    asset.var.src = asset.url;
  }
}