"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  CANVAS_W, CANVAS_H, GRAVITY, PLAYER_SPEED, JUMP_FORCE, COIN_SIZE,
  SKY_GRADIENT_TOP, SKY_GRADIENT_BOTTOM, PLATFORM_COLOR, PLATFORM_TOP,
  PLAYER_COLOR, PLAYER_EYE, COIN_COLOR, COIN_SHINE, ENEMY_COLOR, ENEMY_EYE,
  FLAG_POLE, FLAG_COLOR, STAR_COLOR, BG_MOUNTAIN_1, BG_MOUNTAIN_2,
  createLevels, createStars, createPlayer, rectOverlap,
  type Vec2, type Player, type Particle, type GameStatus, type Level, type Star,
} from "./game-logic";

// ── Main Component ─────────────────────────────────────────
export default function PlatformerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>(0);
  const playerRef = useRef<Player>(createPlayer({ x: 64, y: 300 }));
  const cameraRef = useRef<Vec2>({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>(createStars(80));
  const levelIndexRef = useRef(0);
  const levelsRef = useRef<Level[]>(createLevels());
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const statusRef = useRef<GameStatus>("playing");
  const tickRef = useRef(0);
  const deathTimerRef = useRef(0);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [status, setStatus] = useState<GameStatus>("playing");

  function currentLevel(): Level {
    return levelsRef.current[levelIndexRef.current];
  }

  // ── Particle helpers ───────────────────────────────────
  function spawnParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  // ── Update ─────────────────────────────────────────────
  function update() {
    if (statusRef.current !== "playing") {
      if (statusRef.current === "dead") {
        deathTimerRef.current--;
        if (deathTimerRef.current <= 0) {
          if (livesRef.current > 0) {
            respawnPlayer();
          } else {
            statusRef.current = "gameover";
            setStatus("gameover");
          }
        }
      }
      updateParticles();
      return;
    }

    tickRef.current++;
    const keys = keysRef.current;
    const p = playerRef.current;
    const lv = currentLevel();

    // Horizontal movement
    p.vx = 0;
    if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) {
      p.vx = -PLAYER_SPEED;
      p.facing = -1;
    }
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) {
      p.vx = PLAYER_SPEED;
      p.facing = 1;
    }

    // Jump
    if (
      (keys.has("ArrowUp") || keys.has("w") || keys.has("W") || keys.has(" ")) &&
      p.onGround
    ) {
      p.vy = JUMP_FORCE;
      p.onGround = false;
      spawnParticles(p.x + p.w / 2, p.y + p.h, "#cccccc", 5);
    }

    // Gravity
    p.vy += GRAVITY;
    if (p.vy > 15) p.vy = 15;

    // Move X
    p.x += p.vx;
    if (p.x < 0) p.x = 0;
    if (p.x + p.w > lv.width) p.x = lv.width - p.w;

    // Collide X
    for (const plat of lv.platforms) {
      if (rectOverlap(p.x, p.y, p.w, p.h, plat.x, plat.y, plat.w, plat.h)) {
        if (p.vx > 0) p.x = plat.x - p.w;
        else if (p.vx < 0) p.x = plat.x + plat.w;
      }
    }

    // Move Y
    p.y += p.vy;
    p.onGround = false;

    // Collide Y
    for (const plat of lv.platforms) {
      if (rectOverlap(p.x, p.y, p.w, p.h, plat.x, plat.y, plat.w, plat.h)) {
        if (p.vy > 0) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.onGround = true;
        } else if (p.vy < 0) {
          p.y = plat.y + plat.h;
          p.vy = 0;
        }
      }
    }

    // Animation
    if (Math.abs(p.vx) > 0 && p.onGround) {
      p.frameTimer++;
      if (p.frameTimer > 6) {
        p.frame = (p.frame + 1) % 4;
        p.frameTimer = 0;
      }
    } else if (!p.onGround) {
      p.frame = 1;
    } else {
      p.frame = 0;
      p.frameTimer = 0;
    }

    // Fall into pit
    if (p.y > CANVAS_H + 50) {
      killPlayer();
      return;
    }

    // Coins
    for (const coin of lv.coins) {
      if (coin.collected) continue;
      if (
        rectOverlap(
          p.x, p.y, p.w, p.h,
          coin.x - COIN_SIZE / 2, coin.y - COIN_SIZE / 2, COIN_SIZE, COIN_SIZE
        )
      ) {
        coin.collected = true;
        scoreRef.current += 100;
        setScore(scoreRef.current);
        spawnParticles(coin.x, coin.y, COIN_COLOR, 8);
      }
    }

    // Enemies
    for (const e of lv.enemies) {
      if (!e.alive) continue;

      // Patrol
      e.x += e.vx;
      if (e.x <= e.patrolLeft) {
        e.x = e.patrolLeft;
        e.vx = Math.abs(e.vx);
      }
      if (e.x + e.w >= e.patrolRight) {
        e.x = e.patrolRight - e.w;
        e.vx = -Math.abs(e.vx);
      }

      // Animation
      e.frameTimer++;
      if (e.frameTimer > 8) {
        e.frame = (e.frame + 1) % 2;
        e.frameTimer = 0;
      }

      // Collision with player
      if (rectOverlap(p.x, p.y, p.w, p.h, e.x, e.y, e.w, e.h)) {
        // Stomp from above
        if (p.vy > 0 && p.y + p.h - e.y < 16) {
          e.alive = false;
          p.vy = JUMP_FORCE * 0.6;
          scoreRef.current += 200;
          setScore(scoreRef.current);
          spawnParticles(e.x + e.w / 2, e.y + e.h / 2, ENEMY_COLOR, 10);
        } else {
          killPlayer();
          return;
        }
      }
    }

    // Flag / level end
    if (
      rectOverlap(p.x, p.y, p.w, p.h, lv.flag.x - 8, lv.flag.y, 16, CANVAS_H - lv.flag.y)
    ) {
      scoreRef.current += 500;
      setScore(scoreRef.current);
      if (levelIndexRef.current < levelsRef.current.length - 1) {
        levelIndexRef.current++;
        setLevel(levelIndexRef.current + 1);
        const next = currentLevel();
        playerRef.current = createPlayer(next.playerStart);
        cameraRef.current = { x: 0, y: 0 };
      } else {
        statusRef.current = "won";
        setStatus("won");
        spawnParticles(p.x + p.w / 2, p.y, COIN_COLOR, 30);
      }
    }

    // Camera
    const targetX = p.x - CANVAS_W / 2 + p.w / 2;
    cameraRef.current.x += (targetX - cameraRef.current.x) * 0.1;
    if (cameraRef.current.x < 0) cameraRef.current.x = 0;
    if (cameraRef.current.x > lv.width - CANVAS_W)
      cameraRef.current.x = lv.width - CANVAS_W;

    updateParticles();
  }

  function killPlayer() {
    const p = playerRef.current;
    livesRef.current--;
    setLives(livesRef.current);
    statusRef.current = "dead";
    setStatus("dead");
    deathTimerRef.current = 60;
    spawnParticles(p.x + p.w / 2, p.y + p.h / 2, PLAYER_COLOR, 15);
  }

  function respawnPlayer() {
    // Reset only the current level's enemies / coins
    const freshLevels = createLevels();
    levelsRef.current[levelIndexRef.current] = freshLevels[levelIndexRef.current];
    const lv = currentLevel();
    playerRef.current = createPlayer(lv.playerStart);
    cameraRef.current = { x: 0, y: 0 };
    statusRef.current = "playing";
    setStatus("playing");
  }

  function updateParticles() {
    const ps = particlesRef.current;
    for (let i = ps.length - 1; i >= 0; i--) {
      const pt = ps[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.1;
      pt.life--;
      if (pt.life <= 0) ps.splice(i, 1);
    }
  }

  // ── Draw ───────────────────────────────────────────────
  function draw(ctx: CanvasRenderingContext2D) {
    const cam = cameraRef.current;
    const lv = currentLevel();
    const tick = tickRef.current;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, SKY_GRADIENT_TOP);
    grad.addColorStop(1, SKY_GRADIENT_BOTTOM);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Stars
    for (const s of starsRef.current) {
      const alpha = 0.4 + 0.6 * Math.abs(Math.sin(tick * 0.02 + s.twinkle));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = STAR_COLOR;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Parallax mountains
    drawMountains(ctx, cam.x);

    ctx.save();
    ctx.translate(-cam.x, 0);

    // Platforms
    for (const plat of lv.platforms) {
      // Main body
      ctx.fillStyle = PLATFORM_COLOR;
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      // Grass top
      ctx.fillStyle = PLATFORM_TOP;
      ctx.fillRect(plat.x, plat.y, plat.w, 6);
      // Texture lines
      ctx.strokeStyle = "#3d6324";
      ctx.lineWidth = 1;
      for (let tx = plat.x + 8; tx < plat.x + plat.w; tx += 16) {
        ctx.beginPath();
        ctx.moveTo(tx, plat.y + 10);
        ctx.lineTo(tx, plat.y + plat.h - 4);
        ctx.stroke();
      }
    }

    // Flag
    const flagX = lv.flag.x;
    const flagY = lv.flag.y;
    ctx.fillStyle = FLAG_POLE;
    ctx.fillRect(flagX - 2, flagY, 4, CANVAS_H - flagY);
    // Flag triangle
    ctx.fillStyle = FLAG_COLOR;
    ctx.beginPath();
    ctx.moveTo(flagX + 2, flagY);
    ctx.lineTo(flagX + 30, flagY + 15);
    ctx.lineTo(flagX + 2, flagY + 30);
    ctx.closePath();
    ctx.fill();

    // Coins
    for (const coin of lv.coins) {
      if (coin.collected) continue;
      const bob = Math.sin(tick * 0.05 + coin.bobOffset) * 4;
      const cy = coin.y + bob;
      // Outer glow
      ctx.fillStyle = COIN_COLOR + "33";
      ctx.beginPath();
      ctx.arc(coin.x, cy, COIN_SIZE * 0.8, 0, Math.PI * 2);
      ctx.fill();
      // Main coin
      ctx.fillStyle = COIN_COLOR;
      ctx.beginPath();
      ctx.arc(coin.x, cy, COIN_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      // Shine
      ctx.fillStyle = COIN_SHINE;
      ctx.beginPath();
      ctx.arc(coin.x - 2, cy - 2, COIN_SIZE / 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Enemies
    for (const e of lv.enemies) {
      if (!e.alive) continue;
      const dir = e.vx > 0 ? 1 : -1;
      // Body
      ctx.fillStyle = ENEMY_COLOR;
      const squish = e.frame === 0 ? 0 : 2;
      ctx.fillRect(e.x, e.y + squish, e.w, e.h - squish);
      // Spikes on top
      ctx.fillStyle = "#8e44ad";
      for (let s = 0; s < 3; s++) {
        const sx = e.x + 4 + s * 10;
        ctx.beginPath();
        ctx.moveTo(sx, e.y + squish);
        ctx.lineTo(sx + 5, e.y - 6 + squish);
        ctx.lineTo(sx + 10, e.y + squish);
        ctx.closePath();
        ctx.fill();
      }
      // Eyes
      ctx.fillStyle = ENEMY_EYE;
      const eyeX = dir > 0 ? e.x + e.w - 10 : e.x + 4;
      ctx.fillRect(eyeX, e.y + 8 + squish, 6, 6);
      ctx.fillStyle = "#000";
      ctx.fillRect(eyeX + (dir > 0 ? 3 : 1), e.y + 10 + squish, 2, 3);
    }

    // Player
    if (statusRef.current !== "dead" && statusRef.current !== "gameover") {
      drawPlayer(ctx, playerRef.current, tick);
    }

    // Particles
    for (const pt of particlesRef.current) {
      ctx.globalAlpha = pt.life / pt.maxLife;
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    // HUD
    drawHUD(ctx);

    // Overlays
    if (statusRef.current === "dead") {
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    if (statusRef.current === "won") {
      drawOverlay(ctx, "🎉 You Win!", `Final Score: ${scoreRef.current}`, "Press R to restart");
    }
    if (statusRef.current === "gameover") {
      drawOverlay(ctx, "💀 Game Over", `Score: ${scoreRef.current}`, "Press R to restart");
    }
  }

  function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, tick: number) {
    const dir = p.facing;
    const legOffset = p.onGround && Math.abs(p.vx) > 0 ? Math.sin(tick * 0.3) * 4 : 0;

    // Body
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fillRect(p.x + 2, p.y + 4, p.w - 4, p.h - 12);

    // Head
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fillRect(p.x + 4, p.y, p.w - 8, 10);

    // Eyes
    ctx.fillStyle = PLAYER_EYE;
    const eyeX = dir > 0 ? p.x + p.w - 10 : p.x + 4;
    ctx.fillRect(eyeX, p.y + 2, 5, 5);
    ctx.fillStyle = "#000";
    ctx.fillRect(eyeX + (dir > 0 ? 2 : 1), p.y + 3, 2, 3);

    // Legs
    ctx.fillStyle = "#c0392b";
    ctx.fillRect(p.x + 4, p.y + p.h - 8 + legOffset, 6, 8);
    ctx.fillRect(p.x + p.w - 10, p.y + p.h - 8 - legOffset, 6, 8);

    // Feet
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(p.x + 3, p.y + p.h - 2 + legOffset, 8, 3);
    ctx.fillRect(p.x + p.w - 11, p.y + p.h - 2 - legOffset, 8, 3);
  }

  function drawMountains(ctx: CanvasRenderingContext2D, camX: number) {
    // Far mountains
    ctx.fillStyle = BG_MOUNTAIN_2;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_H);
    for (let x = 0; x <= CANVAS_W; x += 60) {
      const worldX = x + camX * 0.1;
      const h = 120 + Math.sin(worldX * 0.005) * 60 + Math.sin(worldX * 0.012) * 30;
      ctx.lineTo(x, CANVAS_H - h);
    }
    ctx.lineTo(CANVAS_W, CANVAS_H);
    ctx.closePath();
    ctx.fill();

    // Near mountains
    ctx.fillStyle = BG_MOUNTAIN_1;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_H);
    for (let x = 0; x <= CANVAS_W; x += 40) {
      const worldX = x + camX * 0.3;
      const h = 80 + Math.sin(worldX * 0.008) * 50 + Math.sin(worldX * 0.02) * 25;
      ctx.lineTo(x, CANVAS_H - h);
    }
    ctx.lineTo(CANVAS_W, CANVAS_H);
    ctx.closePath();
    ctx.fill();
  }

  function drawHUD(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(8, 8, 200, 36);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`⭐ ${scoreRef.current}`, 16, 30);
    ctx.fillText(`❤️ ${livesRef.current}`, 110, 30);
    ctx.fillText(`LV ${levelIndexRef.current + 1}`, 160, 30);
  }

  function drawOverlay(ctx: CanvasRenderingContext2D, title: string, subtitle: string, hint: string) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 30);
    ctx.font = "24px sans-serif";
    ctx.fillText(subtitle, CANVAS_W / 2, CANVAS_H / 2 + 20);
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#aaaaaa";
    ctx.fillText(hint, CANVAS_W / 2, CANVAS_H / 2 + 60);
    ctx.textAlign = "start";
  }

  // ── Restart ────────────────────────────────────────────
  const restartGame = useCallback(() => {
    levelsRef.current = createLevels();
    levelIndexRef.current = 0;
    scoreRef.current = 0;
    livesRef.current = 3;
    statusRef.current = "playing";
    playerRef.current = createPlayer(levelsRef.current[0].playerStart);
    cameraRef.current = { x: 0, y: 0 };
    particlesRef.current = [];
    tickRef.current = 0;
    setScore(0);
    setLives(3);
    setLevel(1);
    setStatus("playing");
  }, []);

  // ── Game loop ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function loop() {
      update();
      draw(ctx);
      gameLoopRef.current = requestAnimationFrame(loop);
    }
    gameLoopRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(gameLoopRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Keyboard ───────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Prevent scrolling for game keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current.add(e.key);
      if (e.key === "r" || e.key === "R") {
        if (statusRef.current === "won" || statusRef.current === "gameover") {
          restartGame();
        }
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.key);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [restartGame]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="border border-zinc-700 rounded-lg shadow-2xl bg-black"
        tabIndex={0}
      />
      <div className="flex gap-8 text-sm text-zinc-400">
        <span>⬅️➡️ Move</span>
        <span>⬆️ / Space — Jump</span>
        <span>⭐ {score}</span>
        <span>❤️ {lives}</span>
        <span>Level {level}</span>
      </div>
      {(status === "won" || status === "gameover") && (
        <button
          onClick={restartGame}
          className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
        >
          Play Again
        </button>
      )}
    </div>
  );
}
