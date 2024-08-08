function runGame() {
  // canvas
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // game state
  const gameState = newGameState(ctx);

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
