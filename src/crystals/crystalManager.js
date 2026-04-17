// ✨ CrystalManager — Places crystal echoes in the world and handles collection
//
// Design philosophy: crystals should feel *discovered* rather than randomly
// scattered. We place them at semantically meaningful spots — near ancient trees,
// beside still pools, at crossroads — so the player feels the world is whispering
// to them. Collection is rewarded with a soft "pop" animation: the crystal
// expands gently, dissolves into a shimmer of petals, and leaves a faint ring.

import { Crystal } from './crystal.js';

// ─── Soft-pop collection animation ───────────────────────────────────────────
// Each collected crystal spawns one of these. It runs for ~60 frames,
// expanding and fading, then marks itself done so it can be removed.
class CollectAnimation {
  constructor(x, y, color) {
    this.x       = x;
    this.y       = y;
    this.color   = color;

    // Expanding ring state
    this.ring    = { radius: 12, maxRadius: 52, opacity: 0.9 };

    // Petal particles — small colored flecks that drift outward
    this.petals  = Array.from({ length: 10 }, () => ({
      angle:   Math.random() * Math.PI * 2,
      speed:   1.2 + Math.random() * 1.4,
      dist:    0,
      size:    2 + Math.random() * 3,
      opacity: 0.95,
    }));

    this.life    = 60; // frames
    this.maxLife = 60;
    this.done    = false;
  }

  update() {
    if (this.done) return;

    this.life--;
    if (this.life <= 0) { this.done = true; return; }

    const t = 1 - (this.life / this.maxLife); // 0 → 1

    // Ring expands and fades
    this.ring.radius  = 12 + (this.ring.maxRadius - 12) * t;
    this.ring.opacity = 0.9 * (1 - t);

    // Petals drift outward and fade
    for (const p of this.petals) {
      p.dist    += p.speed;
      p.opacity  = 0.95 * (1 - t * t); // ease-in fade
    }
  }

  render(ctx) {
    if (this.done) return;

    const rgba = (hex, a) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${a.toFixed(3)})`;
    };

    // ── Expanding soft ring ──────────────────────────────────────────────────
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.ring.radius, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(this.color, this.ring.opacity);
    ctx.lineWidth   = 3;
    ctx.stroke();
    ctx.restore();

    // Second, slightly delayed ring for depth
    if (this.ring.radius > 24) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.ring.radius * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(this.color, this.ring.opacity * 0.5);
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // ── Petal particles ──────────────────────────────────────────────────────
    for (const p of this.petals) {
      const px = this.x + Math.cos(p.angle) * p.dist;
      const py = this.y + Math.sin(p.angle) * p.dist;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle   = this.color;
      ctx.beginPath();

      // Tiny oval rotated along the travel direction — looks like a drifting petal
      ctx.translate(px, py);
      ctx.rotate(p.angle + Math.PI / 4);
      ctx.scale(1, 0.5);
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

// ─── CrystalManager ──────────────────────────────────────────────────────────
export class CrystalManager {
  constructor() {
    this.crystals   = [];
    this.animations = []; // active CollectAnimations

    // Seed the world with crystals at meaningful locations.
    // Positions are expressed in world-space pixels; your isometric renderer
    // should transform these before passing them to render().
    this._placeCrystals();
  }

  // ─── _placeCrystals ─────────────────────────────────────────────────────────
  // Crystals are grouped into three narrative clusters:
  //   • The Ancient Grove  → memory crystals (past feelings, nostalgia)
  //   • The Windswept Path → wind crystals   (movement, impermanence)
  //   • The Mirror Pond    → reflection crystals (clarity, self-discovery)
  //
  // Placing crystals in clusters makes each zone feel distinct and gives the
  // player a sense of discovery as they explore different areas.
  _placeCrystals() {
    // ── Ancient Grove — memory cluster ──────────────────────────────────────
    const memoryPositions = [
      { x: 320, y: 180 }, // beneath the oldest tree
      { x: 380, y: 220 }, // by the mossy stone
      { x: 290, y: 260 }, // half-hidden in tall grass
      { x: 420, y: 160 }, // glinting on a root
    ];

    // ── Windswept Path — wind cluster ───────────────────────────────────────
    const windPositions = [
      { x: 640, y: 300 }, // at the hilltop crossroads
      { x: 700, y: 260 }, // caught between two boulders
      { x: 660, y: 340 }, // swirling near the cliff edge
    ];

    // ── Mirror Pond — reflection cluster ────────────────────────────────────
    const reflectionPositions = [
      { x: 200, y: 480 }, // just at the water's edge
      { x: 240, y: 510 }, // half-submerged, shimmering
      { x: 170, y: 520 }, // reflected perfectly in still water
      { x: 220, y: 450 }, // on the stepping stone
    ];

    for (const pos of memoryPositions) {
      this.crystals.push(new Crystal(pos.x, pos.y, 'memory'));
    }
    for (const pos of windPositions) {
      this.crystals.push(new Crystal(pos.x, pos.y, 'wind'));
    }
    for (const pos of reflectionPositions) {
      this.crystals.push(new Crystal(pos.x, pos.y, 'reflection'));
    }
  }

  // ─── collect ────────────────────────────────────────────────────────────────
  // Call this when the player reaches a crystal.
  // Marks it collected, spawns a soft-pop animation, and returns the crystal's
  // type so the game can update inventory / trigger dialogue.
  collect(crystal) {
    if (crystal.collected) return null; // already picked up — ignore

    crystal.collected = true;

    // Spawn the pop animation centered on the crystal
    const cx = crystal.x + crystal.size / 2;
    const cy = crystal.y + crystal.size / 2;
    this.animations.push(new CollectAnimation(cx, cy, crystal.glowColor));

    return crystal.type; // let the caller respond to the collection event
  }

  // ─── checkCollection ────────────────────────────────────────────────────────
  // Simple radius-based proximity check. Call each frame with the player's
  // center position. Returns the crystal type if one was just collected,
  // or null if nothing happened.
  checkCollection(playerX, playerY, collectRadius = 32) {
    for (const crystal of this.crystals) {
      if (crystal.collected) continue;

      const cx   = crystal.x + crystal.size / 2;
      const cy   = crystal.y + crystal.size / 2;
      const dist = Math.hypot(playerX - cx, playerY - cy);

      if (dist <= collectRadius) {
        return this.collect(crystal);
      }
    }
    return null;
  }

  // ─── update ─────────────────────────────────────────────────────────────────
  // Advance all crystal and animation states each frame.
  update() {
    for (const crystal of this.crystals) {
      crystal.update();
    }

    for (const anim of this.animations) {
      anim.update();
    }

    // Cull finished animations so they don't accumulate
    this.animations = this.animations.filter(a => !a.done);
  }

  // ─── render ─────────────────────────────────────────────────────────────────
  // Draw all uncollected crystals, then all active pop animations on top.
  // Animations render above crystals so the pop effect reads clearly.
  render(ctx) {
    // Crystals first (background layer)
    for (const crystal of this.crystals) {
      if (!crystal.collected) {
        crystal.render(ctx);
      }
    }

    // Collection animations on top (foreground layer)
    for (const anim of this.animations) {
      anim.render(ctx);
    }
  }

  // ─── getRemainingCount ───────────────────────────────────────────────────────
  // Convenience accessor — useful for progress UI ("3 crystals remaining").
  getRemainingCount() {
    return this.crystals.filter(c => !c.collected).length;
  }

  // ─── getCollectedByType ──────────────────────────────────────────────────────
  // Returns a breakdown of collected crystals by type.
  // Useful for end-of-level summaries or achievement checks.
  getCollectedByType() {
    return this.crystals
      .filter(c => c.collected)
      .reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {});
  }
}
