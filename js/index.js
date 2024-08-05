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

//
// GAME LOOP
//

// TODO: Consider time-based game loop or fixed frame rate. Try to keep the gamedeterministic if possible.

function update() {
  applyGravity();
  autoJump();
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
    console.log("schedule jump", Date.now(), jumpSchedule)
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
