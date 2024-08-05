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

function createShuriken() {
  const shuriken = {
    width: SHURIKEN_WIDTH,
    height: SHURIKEN_HEIGHT,
    velocityX: SHURIKEN_VELOCITY_X,
  };
  shuriken.x = -shuriken.width;
  shuriken.y = canvas.height - ground.height - player.height + shuriken.height / 2;
  return shuriken;
}

//
// GAME LOOP
//

// TODO: Consider time-based game loop or fixed frame rate. Try to keep the gamedeterministic if possible.

function update() {
  applyGravity();
  autoJump();
  launchShurikens();
  moveShurikens();
  render();
  requestAnimationFrame(update);
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

function launchShurikens() {
  const fps = 120;
  const jumpDelayMs = 250;
  const launchWindowMs = 80;
  const distanceFromPlayer = canvas.width / 2 + SHURIKEN_WIDTH / 2;
  const framesUntilHit = distanceFromPlayer / SHURIKEN_VELOCITY_X;
  const msUntilHit = framesUntilHit / fps * 1000;
  for (const jumpTime of jumpSchedule) {
    const hitTime = Date.now() + msUntilHit;
    const safeTime = jumpTime + jumpDelayMs;
    const isWithinLaunchWindow = Math.abs(hitTime - safeTime) < launchWindowMs;
    const randomAllow = Math.random() < 0.1;
    if (isWithinLaunchWindow && randomAllow) {
      const shuriken = createShuriken();
      shurikens.push(shuriken);
    } 
  }
}

function moveShurikens() {
  for (const shuriken of shurikens) {
    shuriken.x += shuriken.velocityX;
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
  ctx.fillStyle = SHURIKEN_COLOR;
  for (const shuriken of shurikens) {
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

update();

// Event listeners

document.addEventListener("pointerdown", jump);

// Timers

setInterval(scheduleRandomJump, 100);
