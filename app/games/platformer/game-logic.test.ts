import { describe, it, expect } from "vitest";
import {
  createPlayer,
  createLevels,
  createStars,
  rectOverlap,
  CANVAS_W,
  CANVAS_H,
} from "./game-logic";

describe("createPlayer", () => {
  it("creates a player at the given start position", () => {
    const p = createPlayer({ x: 100, y: 200 });
    expect(p.x).toBe(100);
    expect(p.y).toBe(200);
    expect(p.w).toBe(24);
    expect(p.h).toBe(32);
  });

  it("initializes velocity to zero", () => {
    const p = createPlayer({ x: 0, y: 0 });
    expect(p.vx).toBe(0);
    expect(p.vy).toBe(0);
    expect(p.onGround).toBe(false);
  });

  it("defaults to facing right", () => {
    const p = createPlayer({ x: 0, y: 0 });
    expect(p.facing).toBe(1);
  });
});

describe("rectOverlap", () => {
  it("detects overlapping rectangles", () => {
    expect(rectOverlap(0, 0, 10, 10, 5, 5, 10, 10)).toBe(true);
  });

  it("returns false for non-overlapping rectangles", () => {
    expect(rectOverlap(0, 0, 10, 10, 20, 20, 10, 10)).toBe(false);
  });

  it("returns false for edge-touching rectangles (no overlap)", () => {
    expect(rectOverlap(0, 0, 10, 10, 10, 0, 10, 10)).toBe(false);
  });

  it("detects contained rectangle", () => {
    expect(rectOverlap(0, 0, 100, 100, 10, 10, 5, 5)).toBe(true);
  });

  it("returns false for horizontally separated", () => {
    expect(rectOverlap(0, 0, 10, 10, 15, 0, 10, 10)).toBe(false);
  });

  it("returns false for vertically separated", () => {
    expect(rectOverlap(0, 0, 10, 10, 0, 15, 10, 10)).toBe(false);
  });
});

describe("createLevels", () => {
  it("returns exactly 3 levels", () => {
    const levels = createLevels();
    expect(levels).toHaveLength(3);
  });

  it("each level has required fields", () => {
    const levels = createLevels();
    for (const lv of levels) {
      expect(lv.platforms.length).toBeGreaterThan(0);
      expect(lv.coins.length).toBeGreaterThan(0);
      expect(lv.enemies.length).toBeGreaterThan(0);
      expect(lv.playerStart).toBeDefined();
      expect(lv.flag).toBeDefined();
      expect(lv.width).toBeGreaterThan(0);
    }
  });

  it("levels increase in width", () => {
    const levels = createLevels();
    expect(levels[1].width).toBeGreaterThan(levels[0].width);
    expect(levels[2].width).toBeGreaterThan(levels[1].width);
  });

  it("all coins start uncollected", () => {
    const levels = createLevels();
    for (const lv of levels) {
      for (const coin of lv.coins) {
        expect(coin.collected).toBe(false);
      }
    }
  });

  it("all enemies start alive", () => {
    const levels = createLevels();
    for (const lv of levels) {
      for (const enemy of lv.enemies) {
        expect(enemy.alive).toBe(true);
      }
    }
  });

  it("enemy patrol bounds contain their starting position", () => {
    const levels = createLevels();
    for (const lv of levels) {
      for (const e of lv.enemies) {
        expect(e.x).toBeGreaterThanOrEqual(e.patrolLeft);
        expect(e.x + e.w).toBeLessThanOrEqual(e.patrolRight);
      }
    }
  });

  it("returns independent copies (mutation does not leak)", () => {
    const a = createLevels();
    const b = createLevels();
    a[0].coins[0].collected = true;
    expect(b[0].coins[0].collected).toBe(false);
  });

  it("flag is positioned within level width", () => {
    const levels = createLevels();
    for (const lv of levels) {
      expect(lv.flag.x).toBeGreaterThan(0);
      expect(lv.flag.x).toBeLessThanOrEqual(lv.width);
    }
  });
});

describe("createStars", () => {
  it("creates the requested number of stars", () => {
    const stars = createStars(50);
    expect(stars).toHaveLength(50);
  });

  it("stars are within canvas bounds", () => {
    const stars = createStars(100);
    for (const s of stars) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThanOrEqual(CANVAS_W);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeLessThanOrEqual(CANVAS_H * 0.6);
    }
  });

  it("returns empty array for count 0", () => {
    expect(createStars(0)).toHaveLength(0);
  });
});
