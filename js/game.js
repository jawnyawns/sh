// DATA STRUCTURES

function newGameState(ctx) {
  return {
    ctx: ctx,
    prevTime: 0,
    currTime: 0,
    accumulatedMs: 0,
    score: 0,
    player: newPlayer(),
    enemies: [],
    futureJumpTimes: [],
    prevEnemyCreateTime: 0,
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

  while (gameState.accumulatedMs >= MILLIS_PER_UPDATE) {
    update(gameState);
    gameState.accumulatedMs -= MILLIS_PER_UPDATE;
  }

  render(gameState);
  requestAnimationFrame((nextTime) => loop({ ...gameState, currTime: nextTime }));
}

function update(gameState) {
  autoJump(gameState);
  deleteJumpTimes(gameState);
  applyGravity(gameState);
  createEnemies(gameState);
  moveEnemies(gameState);
  increaseScore(gameState);
  resetScore(gameState);
  deleteEnemies(gameState);
}

function autoJump(gameState) {
  if (location.hostname === "localhost" && gameState.futureJumpTimes.length && gameState.futureJumpTimes[0] <= performance.now()) {
    jump(gameState);
  }
}

function deleteJumpTimes(gameState) {
  if (gameState.futureJumpTimes.length && gameState.futureJumpTimes[0] <= performance.now()) {
    gameState.futureJumpTimes.shift();
  }
}

function applyGravity(gameState) {
  if (gameState.player.y + PLAYER_HEIGHT < CANVAS_HEIGHT - GROUND_HEIGHT || gameState.player.velocityY < 0) {
    gameState.player.velocityY += GRAVITY_DELTA_VELOCITY_Y;
    gameState.player.y += gameState.player.velocityY;
  } else {
    gameState.player.y = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT;
    gameState.player.velocityY = 0;
    gameState.player.isJumping = false;
  }
}

function createEnemies(gameState) {
  if (Math.abs(gameState.currTime - gameState.prevEnemyCreateTime) < ENEMY_COOLDOWN_MS) {
    return;
  }
  const fps = 120;
  const jumpDelayMs = 250;
  const launchWindowMs = 40;
  const distanceFromPlayer = CANVAS_MIDDLE_X + ENEMY_WIDTH / 2;
  const enemy = newRandomEnemy();
  const framesUntilHit = distanceFromPlayer / Math.abs(enemy.velocityX);
  const msUntilHit = framesUntilHit / fps * 1000;
  const hitTime = gameState.currTime + msUntilHit;
  for (const jumpTime of gameState.futureJumpTimes) {
    const safeTime = jumpTime + jumpDelayMs;
    const isWithinLaunchWindow = Math.abs(hitTime - safeTime) < launchWindowMs;
    const randomAllow = Math.random() < difficulty(gameState.score, 50, 0.05, 0.2);
    if (isWithinLaunchWindow && randomAllow) {
      gameState.enemies.push(enemy);
      gameState.prevEnemyCreateTime = gameState.currTime;
      return;
    }
  }
}

function newRandomEnemy() {
  const { color, velocityX } = randomChoiceWeighted(ENEMY_VARIANTS, [0.4, 0.4, 0.2]);
  const isFromLeft = randomChoice([true, false]);
  return newEnemy(color, velocityX, isFromLeft);
}

function difficulty(score, maxScore, minValue, maxValue) {
  const progress = Math.min(score, maxScore) / maxScore;
  return minValue + progress * (maxValue - minValue);
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
      }
    }
  }
}

function resetScore(gameState) {
  for (const enemy of gameState.enemies) {
    const collisionDetected = isCollision(gameState.player, enemy);
    if (collisionDetected) {
      gameState.score = 0;
    }
  }
}

function deleteEnemies(gameState) {
  const enemy = gameState.enemies[0];
  if (enemy) {
    const isOffscreen = enemy.x < - ENEMY_WIDTH || enemy.x > CANVAS_WIDTH + ENEMY_WIDTH;
    if (isOffscreen) {
      gameState.enemies.shift();
    }
  }
}

// USER INTERACTION

function jump(gameState) {
  if (!gameState.player.isJumping) {
    gameState.player.velocityY = PLAYER_JUMP_VELOCITY_Y;
    gameState.player.isJumping = true;
  }
}

// TIMER

function scheduleRandomJump(gameState) {
  const prevScheduledJumpTime = gameState.futureJumpTimes[gameState.futureJumpTimes.length - 1] || 0;
  const timeSincePrevScheduledJumpMs = performance.now() + PLAYER_JUMP_FUTURE_BUFFER_MS - prevScheduledJumpTime;
  const cooldownSatisfied = timeSincePrevScheduledJumpMs > PLAYER_JUMP_COOLDOWN_MS;
  const randomAllow = Math.random() < 0.2;

  if (cooldownSatisfied && randomAllow) {
    gameState.futureJumpTimes.push(performance.now() + PLAYER_JUMP_FUTURE_BUFFER_MS);
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
  ctx.fillText(`Score: ${gameState.score}`, 24, 48);
}
