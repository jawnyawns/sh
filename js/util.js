// RANDOM

function randomChoice(choices) {
  return choices[Math.floor(Math.random() * choices.length)];
}

function randomChoiceWeighted(choices, weights) {
  const totalWeight = weights.reduce((total, weight) => total + weight, 0);
  const randomValue = Math.random() * totalWeight;
  let threshold = 0;
  for (let i = 0; i < weights.length; i++) {
    threshold += weights[i];
    if (randomValue < threshold) {
      return choices[i];
    }
  }
  return choices[choices.length - 1];
}

// POSITION

function getCenter(rect) {
  return {
    x: rect.x + 0.5 * rect.width,
    y: rect.y + 0.5 * rect.height,
  }
}

function isCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}
