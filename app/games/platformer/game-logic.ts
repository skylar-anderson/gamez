// ── Constants ──────────────────────────────────────────────
export const CANVAS_W = 800;
export const CANVAS_H = 500;
export const GRAVITY = 0.6;
export const PLAYER_SPEED = 4;
export const JUMP_FORCE = -12;
export const TILE = 32;
export const COIN_SIZE = 16;
export const ENEMY_SPEED = 1.5;

// ── Colors ─────────────────────────────────────────────────
export const SKY_GRADIENT_TOP = "#1a1a2e";
export const SKY_GRADIENT_BOTTOM = "#16213e";
export const PLATFORM_COLOR = "#4a752c";
export const PLATFORM_TOP = "#5a9a32";
export const PLAYER_COLOR = "#e94560";
export const PLAYER_EYE = "#ffffff";
export const COIN_COLOR = "#ffd700";
export const COIN_SHINE = "#fff8dc";
export const ENEMY_COLOR = "#9b59b6";
export const ENEMY_EYE = "#ffffff";
export const FLAG_POLE = "#cccccc";
export const FLAG_COLOR = "#e94560";
export const STAR_COLOR = "#ffffff";
export const BG_MOUNTAIN_1 = "#0f3460";
export const BG_MOUNTAIN_2 = "#1a1a4e";

// ── Types ──────────────────────────────────────────────────
export interface Vec2 {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  frame: number;
  frameTimer: number;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Coin {
  x: number;
  y: number;
  collected: boolean;
  bobOffset: number;
}

export interface Enemy {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  patrolLeft: number;
  patrolRight: number;
  alive: boolean;
  frame: number;
  frameTimer: number;
}

export interface Flag {
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  twinkle: number;
}

export interface Level {
  platforms: Platform[];
  coins: Coin[];
  enemies: Enemy[];
  playerStart: Vec2;
  flag: Flag;
  width: number;
}

export type GameStatus = "playing" | "won" | "dead" | "gameover";

// ── Pure functions ─────────────────────────────────────────

export function createPlayer(start: Vec2): Player {
  return {
    x: start.x,
    y: start.y,
    w: 24,
    h: 32,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
    frame: 0,
    frameTimer: 0,
  };
}

export function rectOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function createStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * CANVAS_W,
      y: Math.random() * (CANVAS_H * 0.6),
      size: Math.random() * 2 + 0.5,
      twinkle: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}

export function createLevels(): Level[] {
  return [
    // Level 1 — Gentle Introduction
    {
      width: 3200,
      playerStart: { x: 64, y: 300 },
      flag: { x: 3050, y: 240 },
      platforms: [
        { x: 0, y: 468, w: 600, h: TILE },
        { x: 700, y: 468, w: 400, h: TILE },
        { x: 1200, y: 468, w: 500, h: TILE },
        { x: 1800, y: 468, w: 600, h: TILE },
        { x: 2500, y: 468, w: 700, h: TILE },
        { x: 300, y: 360, w: 128, h: TILE },
        { x: 550, y: 300, w: 96, h: TILE },
        { x: 750, y: 340, w: 128, h: TILE },
        { x: 1000, y: 280, w: 96, h: TILE },
        { x: 1250, y: 350, w: 128, h: TILE },
        { x: 1500, y: 300, w: 96, h: TILE },
        { x: 1700, y: 250, w: 128, h: TILE },
        { x: 1950, y: 350, w: 128, h: TILE },
        { x: 2200, y: 300, w: 96, h: TILE },
        { x: 2450, y: 350, w: 128, h: TILE },
        { x: 2700, y: 280, w: 160, h: TILE },
        { x: 2950, y: 270, w: 160, h: TILE },
      ],
      coins: [
        { x: 350, y: 330, collected: false, bobOffset: 0 },
        { x: 580, y: 270, collected: false, bobOffset: 1 },
        { x: 800, y: 310, collected: false, bobOffset: 2 },
        { x: 1050, y: 250, collected: false, bobOffset: 0.5 },
        { x: 1300, y: 320, collected: false, bobOffset: 1.5 },
        { x: 1550, y: 270, collected: false, bobOffset: 0.3 },
        { x: 1750, y: 220, collected: false, bobOffset: 1.8 },
        { x: 2000, y: 320, collected: false, bobOffset: 0.7 },
        { x: 2250, y: 270, collected: false, bobOffset: 1.2 },
        { x: 2750, y: 250, collected: false, bobOffset: 0.9 },
      ],
      enemies: [
        { x: 800, y: 436, w: 28, h: 32, vx: ENEMY_SPEED, patrolLeft: 700, patrolRight: 1050, alive: true, frame: 0, frameTimer: 0 },
        { x: 1400, y: 436, w: 28, h: 32, vx: -ENEMY_SPEED, patrolLeft: 1200, patrolRight: 1650, alive: true, frame: 0, frameTimer: 0 },
        { x: 2000, y: 436, w: 28, h: 32, vx: ENEMY_SPEED, patrolLeft: 1800, patrolRight: 2350, alive: true, frame: 0, frameTimer: 0 },
      ],
    },
    // Level 2 — More Challenging
    {
      width: 4000,
      playerStart: { x: 64, y: 300 },
      flag: { x: 3850, y: 208 },
      platforms: [
        { x: 0, y: 468, w: 400, h: TILE },
        { x: 550, y: 468, w: 300, h: TILE },
        { x: 1000, y: 468, w: 200, h: TILE },
        { x: 1400, y: 468, w: 400, h: TILE },
        { x: 2000, y: 468, w: 300, h: TILE },
        { x: 2500, y: 468, w: 200, h: TILE },
        { x: 2900, y: 468, w: 300, h: TILE },
        { x: 3400, y: 468, w: 600, h: TILE },
        { x: 420, y: 380, w: 80, h: TILE },
        { x: 870, y: 350, w: 80, h: TILE },
        { x: 1220, y: 380, w: 80, h: TILE },
        { x: 1350, y: 300, w: 96, h: TILE },
        { x: 200, y: 280, w: 128, h: TILE },
        { x: 500, y: 230, w: 96, h: TILE },
        { x: 750, y: 260, w: 128, h: TILE },
        { x: 1050, y: 220, w: 96, h: TILE },
        { x: 1500, y: 280, w: 128, h: TILE },
        { x: 1750, y: 230, w: 96, h: TILE },
        { x: 1850, y: 350, w: 96, h: TILE },
        { x: 2100, y: 300, w: 128, h: TILE },
        { x: 2350, y: 250, w: 96, h: TILE },
        { x: 2600, y: 320, w: 96, h: TILE },
        { x: 2750, y: 250, w: 128, h: TILE },
        { x: 3000, y: 300, w: 128, h: TILE },
        { x: 3250, y: 250, w: 96, h: TILE },
        { x: 3500, y: 280, w: 128, h: TILE },
        { x: 3750, y: 240, w: 160, h: TILE },
      ],
      coins: [
        { x: 250, y: 250, collected: false, bobOffset: 0 },
        { x: 530, y: 200, collected: false, bobOffset: 1 },
        { x: 800, y: 230, collected: false, bobOffset: 2 },
        { x: 1080, y: 190, collected: false, bobOffset: 0.5 },
        { x: 1400, y: 270, collected: false, bobOffset: 1.5 },
        { x: 1550, y: 250, collected: false, bobOffset: 0.3 },
        { x: 1780, y: 200, collected: false, bobOffset: 1.8 },
        { x: 2150, y: 270, collected: false, bobOffset: 0.7 },
        { x: 2400, y: 220, collected: false, bobOffset: 1.2 },
        { x: 2800, y: 220, collected: false, bobOffset: 0.9 },
        { x: 3050, y: 270, collected: false, bobOffset: 0.4 },
        { x: 3300, y: 220, collected: false, bobOffset: 1.6 },
        { x: 3550, y: 250, collected: false, bobOffset: 0.1 },
      ],
      enemies: [
        { x: 600, y: 436, w: 28, h: 32, vx: ENEMY_SPEED, patrolLeft: 550, patrolRight: 820, alive: true, frame: 0, frameTimer: 0 },
        { x: 1100, y: 436, w: 28, h: 32, vx: -ENEMY_SPEED, patrolLeft: 1000, patrolRight: 1180, alive: true, frame: 0, frameTimer: 0 },
        { x: 1600, y: 436, w: 28, h: 32, vx: ENEMY_SPEED, patrolLeft: 1400, patrolRight: 1780, alive: true, frame: 0, frameTimer: 0 },
        { x: 2100, y: 436, w: 28, h: 32, vx: -ENEMY_SPEED, patrolLeft: 2000, patrolRight: 2280, alive: true, frame: 0, frameTimer: 0 },
        { x: 3000, y: 436, w: 28, h: 32, vx: ENEMY_SPEED, patrolLeft: 2900, patrolRight: 3180, alive: true, frame: 0, frameTimer: 0 },
      ],
    },
    // Level 3 — Expert
    {
      width: 4800,
      playerStart: { x: 64, y: 300 },
      flag: { x: 4650, y: 176 },
      platforms: [
        { x: 0, y: 468, w: 300, h: TILE },
        { x: 500, y: 468, w: 200, h: TILE },
        { x: 900, y: 468, w: 200, h: TILE },
        { x: 1300, y: 468, w: 300, h: TILE },
        { x: 1900, y: 468, w: 200, h: TILE },
        { x: 2400, y: 468, w: 300, h: TILE },
        { x: 3000, y: 468, w: 200, h: TILE },
        { x: 3500, y: 468, w: 200, h: TILE },
        { x: 4000, y: 468, w: 300, h: TILE },
        { x: 4500, y: 468, w: 300, h: TILE },
        { x: 320, y: 390, w: 64, h: TILE },
        { x: 430, y: 320, w: 64, h: TILE },
        { x: 720, y: 370, w: 64, h: TILE },
        { x: 820, y: 290, w: 64, h: TILE },
        { x: 1120, y: 350, w: 64, h: TILE },
        { x: 1220, y: 270, w: 80, h: TILE },
        { x: 1650, y: 380, w: 64, h: TILE },
        { x: 1750, y: 300, w: 80, h: TILE },
        { x: 1850, y: 230, w: 64, h: TILE },
        { x: 2150, y: 350, w: 80, h: TILE },
        { x: 2300, y: 280, w: 64, h: TILE },
        { x: 2750, y: 370, w: 64, h: TILE },
        { x: 2880, y: 290, w: 80, h: TILE },
        { x: 3250, y: 350, w: 64, h: TILE },
        { x: 3400, y: 270, w: 80, h: TILE },
        { x: 3750, y: 380, w: 64, h: TILE },
        { x: 3880, y: 300, w: 80, h: TILE },
        { x: 4200, y: 350, w: 80, h: TILE },
        { x: 4350, y: 270, w: 96, h: TILE },
        { x: 4550, y: 208, w: 160, h: TILE },
      ],
      coins: [
        { x: 350, y: 360, collected: false, bobOffset: 0 },
        { x: 460, y: 290, collected: false, bobOffset: 1 },
        { x: 750, y: 340, collected: false, bobOffset: 2 },
        { x: 850, y: 260, collected: false, bobOffset: 0.5 },
        { x: 1150, y: 320, collected: false, bobOffset: 1.5 },
        { x: 1250, y: 240, collected: false, bobOffset: 0.3 },
        { x: 1680, y: 350, collected: false, bobOffset: 1.8 },
        { x: 1780, y: 270, collected: false, bobOffset: 0.7 },
        { x: 1880, y: 200, collected: false, bobOffset: 1.2 },
        { x: 2180, y: 320, collected: false, bobOffset: 0.9 },
        { x: 2330, y: 250, collected: false, bobOffset: 0.4 },
        { x: 2780, y: 340, collected: false, bobOffset: 1.6 },
        { x: 2910, y: 260, collected: false, bobOffset: 0.1 },
        { x: 3280, y: 320, collected: false, bobOffset: 0.8 },
        { x: 3430, y: 240, collected: false, bobOffset: 1.3 },
        { x: 4230, y: 320, collected: false, bobOffset: 0.6 },
        { x: 4400, y: 240, collected: false, bobOffset: 1.1 },
      ],
      enemies: [
        { x: 550, y: 436, w: 28, h: 32, vx: ENEMY_SPEED, patrolLeft: 500, patrolRight: 680, alive: true, frame: 0, frameTimer: 0 },
        { x: 960, y: 436, w: 28, h: 32, vx: -ENEMY_SPEED, patrolLeft: 900, patrolRight: 1080, alive: true, frame: 0, frameTimer: 0 },
        { x: 1400, y: 436, w: 28, h: 32, vx: ENEMY_SPEED, patrolLeft: 1300, patrolRight: 1580, alive: true, frame: 0, frameTimer: 0 },
        { x: 1950, y: 436, w: 28, h: 32, vx: -ENEMY_SPEED, patrolLeft: 1900, patrolRight: 2080, alive: true, frame: 0, frameTimer: 0 },
        { x: 2500, y: 436, w: 28, h: 32, vx: ENEMY_SPEED, patrolLeft: 2400, patrolRight: 2680, alive: true, frame: 0, frameTimer: 0 },
        { x: 3050, y: 436, w: 28, h: 32, vx: -ENEMY_SPEED, patrolLeft: 3000, patrolRight: 3180, alive: true, frame: 0, frameTimer: 0 },
        { x: 4050, y: 436, w: 28, h: 32, vx: ENEMY_SPEED, patrolLeft: 4000, patrolRight: 4280, alive: true, frame: 0, frameTimer: 0 },
      ],
    },
  ];
}
