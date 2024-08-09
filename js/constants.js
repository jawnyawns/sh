// LOCAL STORAGE

const LOCAL_STORAGE_HIGH_SCORE_KEY = "high-score";

// GAME LOOP

const TIME_STEP_MS = 1000 / 120; // TODO: Update this to 60 fps?

// CANVAS

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const CANVAS_MIDDLE_X = Math.floor(CANVAS_WIDTH / 2);
const CANVAS_MIDDLE_Y = Math.floor(CANVAS_HEIGHT / 2);

// PHYSICS

const GRAVITY_DELTA_VELOCITY_Y = 0.4;

// ENTITIES

const GROUND_COLOR = "#222";
const GROUND_HEIGHT = 0.3 * CANVAS_HEIGHT;

const PLAYER_COLOR = "#fff";
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const PLAYER_JUMP_VELOCITY_Y = -11;
const PLAYER_JUMP_AIR_TIME_MS = Math.floor(
  2 * Math.abs(PLAYER_JUMP_VELOCITY_Y) / GRAVITY_DELTA_VELOCITY_Y * TIME_STEP_MS);

const ENEMY_WIDTH = 20;
const ENEMY_HEIGHT = 20;
const ENEMY_VARIANTS = [
  { color: "#ff0", velocityX: 2.7 },
  { color: "#f00", velocityX: 3 },
  { color: "#00f", velocityX: 3.3 },
];
const ENEMY_VELOCITY_X_SLOWEST = ENEMY_VARIANTS.reduce(
  (slowest, variant) => Math.min(slowest, variant.velocityX), ENEMY_VARIANTS[0].velocityX);
const ENEMY_MIN_SPACING = 8; // TODO: Unused...

// DIFFICULTY

const CREATE_ENEMY_SCORE_CAP = 80;
const CREATE_ENEMY_MIN_PROBABILITY = 0.05;
const CREATE_ENEMY_MAX_PROBABILITY = 0.2;
const FUTURE_JUMP_PROBABILITY = 0.025;
const MIN_ENEMIES_PER_JUMP = 0;
const MAX_ENEMIES_PER_JUMP = 4;
const REACTION_TIME_MS = 250; // TODO: Unused
