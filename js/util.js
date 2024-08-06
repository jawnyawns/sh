function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function randomWeightedIndex(normalizedWeights) {
  const thresholds = normalizedWeights.map((accumulatedWeight => value => accumulatedWeight += value)(0));
  const randomValue = Math.random();
  const index = thresholds.findIndex(threshold => randomValue < threshold);
  return index !== -1 ? index : normalizedWeights.length - 1;
}
