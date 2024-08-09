// DATA STRUCTURES

function newGameState(ctx, sfx, highScore) {
  return {
    ctx: ctx,
    sfx: sfx,
    prevTime: 0,
    currTime: 0,
    accumulatedMs: 0,
    score: 0,
    highScore: highScore,
    player: newPlayer(),
    enemies: [],
    futureEnemies: [],
    prevRecommendedJumpTime: 0,
    autoJumpTimes: [],
  };
}

function newPlayer() {
  return {
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    x: CANVAS_MIDDLE_X - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT,
    velocityY: 0,
    isJumping: false,
  };
}

function newEnemy(color, velocityX, isFromLeft) {
  return {
    createTime: 0,
    fillColor: color,
    width: ENEMY_WIDTH,
    height: ENEMY_HEIGHT,
    x: isFromLeft ? -ENEMY_WIDTH : CANVAS_WIDTH + ENEMY_WIDTH,
    y: CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT + ENEMY_HEIGHT / 2,
    velocityX: isFromLeft ? velocityX : -velocityX,
    isFromLeft: isFromLeft,
    isScored: false,
  };
}

// GAME LOOP

function loop(gameState) {
  const deltaMs = gameState.currTime - gameState.prevTime;
  gameState.prevTime = gameState.currTime;
  gameState.accumulatedMs += deltaMs;

  while (gameState.accumulatedMs >= TIME_STEP_MS) {
    update(gameState);
    gameState.accumulatedMs -= TIME_STEP_MS;
  }

  render(gameState);
  requestAnimationFrame((nextTime) => loop({ ...gameState, currTime: nextTime }));
}

function update(gameState) {
  autoJump(gameState);
  applyGravity(gameState);
  createEnemies(gameState);
  moveEnemies(gameState);
  increaseScore(gameState);
  handleGameOver(gameState);
  deleteEnemies(gameState);
  createFutureEnemies(gameState);
}

function autoJump(gameState) {
  const isLocalhost = location.hostname === "localhost";
  const shouldJump = gameState.autoJumpTimes.length > 0 && gameState.autoJumpTimes[0] <= gameState.currTime;
  if (isLocalhost && shouldJump) {
    jump(gameState);
    gameState.autoJumpTimes.shift();
  }
}

function applyGravity(gameState) {
  const isInAir = gameState.player.y + PLAYER_HEIGHT < CANVAS_HEIGHT - GROUND_HEIGHT;
  const isMovingUpwards = gameState.player.velocityY < 0;
  if (isInAir || isMovingUpwards) {
    gameState.player.velocityY += GRAVITY_DELTA_VELOCITY_Y;
    gameState.player.y += gameState.player.velocityY;
  } else {
    gameState.player.y = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT;
    gameState.player.velocityY = 0;
    gameState.player.isJumping = false;
  }
}

function createEnemies(gameState) {
  const enemies = gameState.futureEnemies.filter((enemy) => enemy.createTime <= gameState.currTime);
  gameState.futureEnemies = gameState.futureEnemies.filter((enemy) => enemy.createTime > gameState.currTime);
  gameState.enemies.push(...enemies);
  if (enemies.length > 0) {
    gameState.sfx.shoot.play();
  }
}

function newRandomEnemy() {
  const { color, velocityX } = randomChoiceWeighted(ENEMY_VARIANTS, [0.4, 0.4, 0.2]);
  const isFromLeft = randomChoice([true, false]);
  return newEnemy(color, velocityX, isFromLeft);
}

function moveEnemies(gameState) {
  for (const enemy of gameState.enemies) {
    enemy.x += enemy.velocityX;
  }
}

function increaseScore(gameState) {
  for (const enemy of gameState.enemies) {
    if (!enemy.isScored) {
      const { x, _ } = getCenter(enemy);
      const passedMiddleFromLeft = enemy.isFromLeft && x > CANVAS_MIDDLE_X;
      const passedMiddleFromRight = !enemy.isFromLeft && x < CANVAS_MIDDLE_X;
      if (passedMiddleFromLeft || passedMiddleFromRight) {
        gameState.score += 1;
        enemy.isScored = true;
        gameState.sfx.score.play();
      }
    }
  }
}

function handleGameOver(gameState) {
  if (isGameOver(gameState)) {
    updateHighScore(gameState);
    gameState.score = 0;
    gameState.sfx.die.play();
  }
}

function isGameOver(gameState) {
  for (const enemy of gameState.enemies) {
    if (isCollision(gameState.player, enemy)) {
      return true;
    }
  }
  return false;
}

function updateHighScore(gameState) {
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    localStorage.setItem(LOCAL_STORAGE_HIGH_SCORE_KEY, gameState.score);
  }
}

function deleteEnemies(gameState) {
  gameState.enemies = gameState.enemies.filter(isWithinCanvasX);
}

function createFutureEnemies(gameState) {
  const distanceFromPlayer = CANVAS_MIDDLE_X + ENEMY_WIDTH / 2;
  const futureBufferMs = ENEMY_VELOCITY_X_SLOWEST * distanceFromPlayer;
  const jumpTime = gameState.currTime + futureBufferMs;
  const cooldownSatisfied = jumpTime - gameState.prevRecommendedJumpTime > PLAYER_JUMP_AIR_TIME_MS;

  if (cooldownSatisfied && withProbability(FUTURE_JUMP_PROBABILITY)) {
    gameState.prevRecommendedJumpTime = jumpTime;
    gameState.autoJumpTimes.push(jumpTime);

    const enemyProbability = mapRangeClamped(
      gameState.score, 0, CREATE_ENEMY_SCORE_CAP, CREATE_ENEMY_MIN_PROBABILITY, CREATE_ENEMY_MAX_PROBABILITY);

    for (let i = MIN_ENEMIES_PER_JUMP; i < MAX_ENEMIES_PER_JUMP; i++) {
      if (withProbability(enemyProbability)) {
        const enemy = newRandomEnemy();
        const delayMs = 250; // TODO: This should vary per enemy variant
        const msUntilHit = distanceFromPlayer / Math.abs(enemy.velocityX) * TIME_STEP_MS;
        enemy.createTime = jumpTime + delayMs - msUntilHit;
        gameState.futureEnemies.push(enemy);
      }
    }
  }
}

// USER INTERACTION

function jump(gameState) {
  if (!gameState.player.isJumping) {
    gameState.player.velocityY = PLAYER_JUMP_VELOCITY_Y;
    gameState.player.isJumping = true;
    gameState.sfx.jump.play();
  }
}

// RENDER

function render(gameState) {
  const ctx = gameState.ctx;

  // reset canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // draw ground
  ctx.fillStyle = GROUND_COLOR;
  ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

  // draw rectangle
  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(gameState.player.x, gameState.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);

  // draw enemies
  for (const enemy of gameState.enemies) {
    ctx.fillStyle = enemy.fillColor;
    ctx.fillRect(enemy.x, enemy.y, ENEMY_WIDTH, ENEMY_HEIGHT);
  }

  // draw score
  ctx.font = "24px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(`Score: ${gameState.score} | High score: ${gameState.highScore}`, 24, 48);
}
