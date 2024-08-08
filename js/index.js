function runGame() {
  // canvas
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // game state
  const highScore = localStorage.getItem(LOCAL_STORAGE_HIGH_SCORE_KEY) ?? 0;
  const gameState = newGameState(ctx, highScore);

  // game loop
  requestAnimationFrame((initialTime) => loop({ ...gameState, currTime: initialTime }));

  // event listeners
  document.addEventListener("pointerdown", () => jump(gameState));
  document.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      jump(gameState);
    }
  });

  // timers
  setInterval(() => scheduleRandomJump(gameState), 100);
}

runGame();
