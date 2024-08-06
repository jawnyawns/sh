const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

//
// SETUP CANVAS
//

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

//
// GAME DATA
//

// Ground data

const ground = {
  height: 0.3 * canvas.height,
};

// Player data

const player = {
  width: 40,
  height: 40,
  velocityY: 0,
  isJumping: false,
};

player.x = canvas.width / 2 - player.width / 2;
player.y = canvas.height - ground.height - player.height;

// Shuriken data

const jumpSchedule = [];
const shurikens = [];

function createShuriken(fillColor, velocityX, isFromLeft) {
  const shuriken = {
    fillColor: fillColor,
    width: SHURIKEN_WIDTH,
    height: SHURIKEN_HEIGHT,
    velocityX: isFromLeft ? velocityX : -velocityX,
  };
  shuriken.x = isFromLeft ? -shuriken.width : canvas.width + shuriken.width;
  shuriken.y = canvas.height - ground.height - player.height + shuriken.height / 2;
  return shuriken;
}

//
// GAME LOOP
//

let prevTime = 0;
let accumulatedMs = 0;
const stepMs = 1000 / 120;

function loop(currTime) {
  const deltaMs = currTime - prevTime;
  prevTime = currTime;
  accumulatedMs += deltaMs;

  while (accumulatedMs >= stepMs) {
    update();
    accumulatedMs -= stepMs;
  }

  render();
  requestAnimationFrame(loop);
}

function update() {
  applyGravity();
  // autoJump();
  launchShurikens();
  moveShurikens();
  deleteShurikens();
}

// Gravity logic

function applyGravity() {
  if (player.y + player.height < canvas.height - ground.height || player.velocityY < 0) {
    player.velocityY += GRAVITY_DELTA_VELOCITY_Y;
    player.y += player.velocityY;
  } else {
    player.y = canvas.height - ground.height - player.height;
    player.velocityY = 0;
    player.isJumping = false;
  }
}

// Auto-jump logic

function autoJump() {
  if (jumpSchedule.length && jumpSchedule[0] <= Date.now()) {
    jump();
    jumpSchedule.shift();
  }
}

// Shuriken logic

let prevShurikenLaunchTime = 0;

function launchShurikens() {
  const currTime = Date.now();
  if (Math.abs(currTime - prevShurikenLaunchTime) < PLAYER_COOLDOWN_DURATION_MS) {
    return;
  }
  const [ randomColor, randomVelocityX ] = [
    [SHURIKEN_SLOW_COLOR, SHURIKEN_SLOW_VELOCITY_X],
    [SHURIKEN_MED_COLOR, SHURIKEN_MED_VELOCITY_X],
    [SHURIKEN_FAST_COLOR, SHURIKEN_FAST_VELOCITY_X]
  ][Math.floor(Math.random() * 3)];
  const fps = 120;
  const jumpDelayMs = 250;
  const launchWindowMs = 80;
  const distanceFromPlayer = canvas.width / 2 + SHURIKEN_WIDTH / 2;
  const framesUntilHit = distanceFromPlayer / randomVelocityX;
  const msUntilHit = framesUntilHit / fps * 1000;
  const randomizedJumpSchedule = shuffle(jumpSchedule);
  for (const jumpTime of randomizedJumpSchedule) {
    const hitTime = Date.now() + msUntilHit;
    const safeTime = jumpTime + jumpDelayMs;
    const isWithinLaunchWindow = Math.abs(hitTime - safeTime) < launchWindowMs;
    const randomAllow = Math.random() < 0.1;
    if (isWithinLaunchWindow && randomAllow) {
      const shuriken = createShuriken(randomColor, randomVelocityX, Math.random() < 0.5);
      shurikens.push(shuriken);
      prevShurikenLaunchTime = currTime;
      return;
    } 
  }
}

function moveShurikens() {
  for (const shuriken of shurikens) {
    shuriken.x += shuriken.velocityX;
  }
}

function deleteShurikens() {
  const shuriken = shurikens[0];
  if (shuriken) {
    const isOffscreen = shuriken.x < - shuriken.width || shuriken.x > canvas.width + shuriken.width;
    if (isOffscreen) {
      shurikens.shift();
    }
  }
}

// Render to canvas

function render() {
  // Reset canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ground
  ctx.fillStyle = GROUND_COLOR;
  ctx.fillRect(0, canvas.height - ground.height, canvas.width, ground.height);

  // Draw rectangle
  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw shurikens
  for (const shuriken of shurikens) {
    ctx.fillStyle = shuriken.fillColor;
    ctx.fillRect(shuriken.x, shuriken.y, shuriken.width, shuriken.height);
  }
}

//
// EVENT HANDLERS
//

// Jump logic

function jump() {
  if (!player.isJumping) {
    player.velocityY = PLAYER_JUMP_VELOCITY_Y;
    player.isJumping = true;
  }
}

// Random jump logic

function scheduleRandomJump() {
  const prevScheduledJumpTime = jumpSchedule[jumpSchedule.length - 1] || 0;
  const timeSincePrevScheduledJumpMs = Date.now() + PLAYER_JUMP_FUTURE_BUFFER_MS - prevScheduledJumpTime;
  const cooldownSatisfied = timeSincePrevScheduledJumpMs > PLAYER_COOLDOWN_DURATION_MS;
  const randomAllow = Math.random() < 0.2;
  
  if (cooldownSatisfied && randomAllow) {
    jumpSchedule.push(Date.now() + PLAYER_JUMP_FUTURE_BUFFER_MS);
  }
}

//
// MAIN
//

// Start the game loop

requestAnimationFrame(loop);

// Event listeners

document.addEventListener("pointerdown", jump);

// Timers

setInterval(scheduleRandomJump, 100);
