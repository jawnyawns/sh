// LOCAL STORAGE

const LOCAL_STORAGE_HIGH_SCORE_KEY = "high-score";

// GAME LOOP

const MILLIS_PER_UPDATE = 1000 / 120;

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
const PLAYER_JUMP_COOLDOWN_MS = 500;
const PLAYER_JUMP_FUTURE_BUFFER_MS = 2000;

const ENEMY_WIDTH = 20;
const ENEMY_HEIGHT = 20;
const ENEMY_VARIANTS = [
  { color: "#ff0", velocityX: 2.7 },
  { color: "#f00", velocityX: 3 },
  { color: "#00f", velocityX: 3.3 },
];
const ENEMY_COOLDOWN_MS = 180;
