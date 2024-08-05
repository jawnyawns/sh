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
  height: 0.28 * canvas.height,
};

// Player data

const player = {
  width: 50,
  height: 50,
  velocityY: 0,
  isJumping: false,
};

player.x = canvas.width / 2 - player.width / 2;
player.y = canvas.height - ground.height - player.height;

//
// GAME LOOP
//

function update() {
  applyGravity();
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

// Jump logic

function jump() {
  if (!player.isJumping) {
    player.velocityY = PLAYER_JUMP_VELOCITY_Y;
    player.isJumping = true;
  }
}

//
// MAIN
//

// Start the game loop

update();

// Event listeners

document.addEventListener("pointerdown", jump);
