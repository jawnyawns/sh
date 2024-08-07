// DATA STRUCTURES

function newGameState(ctx) {
  return {
    ctx: ctx,
    prevTime: 0,
    currTime: 0,
    accumulatedMs: 0,
    score: 0,
    shurikens: [],
    prevShurikenLaunchTime: 0,
    futureJumpTimes: [],
    player: newPlayer(),
  }
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

function newShuriken(color, velocityX, isFromLeft) {
  return {
    fillColor: color,
    width: SHURIKEN_WIDTH,
    height: SHURIKEN_HEIGHT,
    x: isFromLeft ? -SHURIKEN_WIDTH : CANVAS_WIDTH + SHURIKEN_WIDTH,
    y: CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT + SHURIKEN_HEIGHT / 2,
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
  requestAnimationFrame((nextTime) => loop({...gameState, currTime: nextTime}));
}

function update(gameState) {
  autoJump(gameState);
  applyGravity(gameState);
  launchShurikens(gameState);
  moveShurikens(gameState);
  scoreShurikens(gameState);
  resetScore(gameState);
  deleteShurikens(gameState);
}

function autoJump(gameState) {
  if (gameState.futureJumpTimes.length && gameState.futureJumpTimes[0] <= performance.now()) {
    jump(gameState);
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

function launchShurikens(gameState) {
  if (Math.abs(gameState.currTime - gameState.prevShurikenLaunchTime) < SHURIKEN_COOLDOWN_MS) {
    return;
  }
  const fps = 120;
  const jumpDelayMs = 250;
  const launchWindowMs = 40;
  const distanceFromPlayer = CANVAS_MIDDLE_X + SHURIKEN_WIDTH / 2;
  const shuriken = randomShuriken();
  const framesUntilHit = distanceFromPlayer / Math.abs(shuriken.velocityX);
  const msUntilHit = framesUntilHit / fps * 1000;
  const hitTime = gameState.currTime + msUntilHit;
  for (const jumpTime of gameState.futureJumpTimes) {
    const safeTime = jumpTime + jumpDelayMs;
    const isWithinLaunchWindow = Math.abs(hitTime - safeTime) < launchWindowMs;
    const randomAllow = Math.random() < difficulty(gameState.score, 50, 0.05, 0.2);
    if (isWithinLaunchWindow && randomAllow) {
      gameState.shurikens.push(shuriken);
      gameState.prevShurikenLaunchTime = gameState.currTime;
      return;
    } 
  }
}

function randomShuriken() {
  const { color, velocityX } = randomChoiceWeighted(SHURIKEN_VARIANTS, [0.4, 0.4, 0.2]);
  const isFromLeft = randomChoice([true, false]);
  return newShuriken(color, velocityX, isFromLeft);
}

function difficulty(score, maxScore, minValue, maxValue) {
  const progress = Math.min(score, maxScore) / maxScore;
  return minValue + progress * (maxValue - minValue);
}

function moveShurikens(gameState) {
  for (const shuriken of gameState.shurikens) {
    shuriken.x += shuriken.velocityX;
  }
}

function scoreShurikens(gameState) {
  for (const shuriken of gameState.shurikens) {
    if (!shuriken.isScored) {
      const { x, _ } = getCenter(shuriken);
      const passedMiddleFromLeft = shuriken.isFromLeft && x > CANVAS_MIDDLE_X;
      const passedMiddleFromRight = !shuriken.isFromLeft && x < CANVAS_MIDDLE_X;
      if (passedMiddleFromLeft || passedMiddleFromRight) {
        gameState.score += 1;
        shuriken.isScored = true;
      }
    }
  }
}

function resetScore(gameState) {
  for (const shuriken of gameState.shurikens) {
    const collisionDetected = isCollision(gameState.player, shuriken);
    if (collisionDetected) {
      gameState.score = 0;
    }
  }
}

function deleteShurikens(gameState) {
  const shuriken = gameState.shurikens[0];
  if (shuriken) {
    const isOffscreen = shuriken.x < - SHURIKEN_WIDTH || shuriken.x > CANVAS_WIDTH + SHURIKEN_WIDTH;
    if (isOffscreen) {
      gameState.shurikens.shift();
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
  const cooldownSatisfied = timeSincePrevScheduledJumpMs > PLAYER_COOLDOWN_DURATION_MS;
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

  // draw shurikens
  for (const shuriken of gameState.shurikens) {
    ctx.fillStyle = shuriken.fillColor;
    ctx.fillRect(shuriken.x, shuriken.y, SHURIKEN_WIDTH, SHURIKEN_HEIGHT);
  }

  // draw score
  ctx.font = "24px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(`Score: ${gameState.score}`, 24, 48);
}
