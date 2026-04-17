// ✨ Crystal Echoes — Memory fragments left behind by the world's gentle magic
// Each crystal type carries its own soft personality, expressed through color and light.
//
// Design philosophy: crystals should feel *alive* — quietly glowing, breathing
// with a slow pulse, and sparkling just enough to catch the player's eye without
// overwhelming the cozy atmosphere of Petals & Echoes.

// ─── Crystal type palettes ────────────────────────────────────────────────────
// Each type gets a distinct pastel identity so players can learn to recognize
// them at a glance, even before reading any UI text.
const CRYSTAL_COLORS = {
  memory:     '#c9b8ff', // soft lavender  — feels nostalgic, dreamlike
  wind:       '#b8ffd4', // mint green     — light and breezy, full of movement
  reflection: '#b8e4ff', // sky blue       — clear, mirror-like, contemplative
};

// Inner core is a brighter tint of the same hue for the "gem" feel
const CRYSTAL_CORE_COLORS = {
  memory:     '#e8deff',
  wind:       '#deffed',
  reflection: '#dff4ff',
};

export class Crystal {
  constructor(x, y, type = 'memory') {
    this.x = x;
    this.y = y;

    // Validate type — default gracefully so nothing breaks during level design
    this.type = CRYSTAL_COLORS[type] ? type : 'memory';

    // ── FIXED: was false, crystals were permanently hidden ────────────────────
    this.visible = true;

    // ── FIXED: was 8px, far too small to notice in an isometric scene ─────────
    // 28px gives a satisfying presence without dominating the tile
    this.size = 28;

    // Resolved colors for this crystal type
    this.glowColor = CRYSTAL_COLORS[this.type];
    this.coreColor = CRYSTAL_CORE_COLORS[this.type];

    // ── Pulse animation state ─────────────────────────────────────────────────
    // Each crystal starts at a random phase so a field of crystals breathes
    // organically rather than all pulsing in sync (which would feel mechanical).
    this.pulsePhase  = Math.random() * Math.PI * 2;
    this.pulseSpeed  = 0.018 + Math.random() * 0.008; // subtle variation per crystal

    // ── Sparkle state ────────────────────────────────────────────────────────
    // Small glints that appear and fade independently of the main pulse.
    this._sparkles   = [];
    this._sparkleTimer = 0;
    this._sparkleInterval = 40 + Math.floor(Math.random() * 30); // frames between new sparkles

    // Collection state — toggled by CrystalManager when the player reaches the crystal
    this.collected   = false;
    this._collectAnim = null; // populated by CrystalManager.collect()
  }

  // ─── update ─────────────────────────────────────────────────────────────────
  // Advance animation timers each frame. Call before render().
  update() {
    // Advance the breathing pulse
    this.pulsePhase += this.pulseSpeed;

    // Spawn sparkles on an irregular timer so they feel organic
    this._sparkleTimer++;
    if (this._sparkleTimer >= this._sparkleInterval) {
      this._sparkleTimer = 0;
      this._sparkleInterval = 40 + Math.floor(Math.random() * 30);
      this._spawnSparkle();
    }

    // Age and cull sparkles
    this._sparkles = this._sparkles
      .map(s => ({ ...s, life: s.life - 1 }))
      .filter(s => s.life > 0);
  }

  // ─── render ─────────────────────────────────────────────────────────────────
  // ── FIXED: visibility gate removed — crystals always render with a glow ────
  // The old `if (!this.visible) return` meant crystals never appeared at all.
  // Now `this.visible` is used only as a soft fade flag (e.g. during a fade-in
  // sequence) but rendering always proceeds so the glow is always present.
  render(ctx) {
    if (this.collected) return; // already popped away by CrystalManager

    const cx = this.x + this.size / 2; // center x
    const cy = this.y + this.size / 2; // center y

    // Current pulse value: oscillates 0 → 1 → 0
    const pulse = (Math.sin(this.pulsePhase) + 1) / 2; // 0..1

    // ── Layer 1: wide outer glow (softest, most transparent) ─────────────────
    // Three layered radial gradients create the "luminous gem" look without
    // any hard edges. Each ring is slightly smaller and more opaque.
    this._drawGlowRing(ctx, cx, cy, this.size * 1.8, pulse, 0.18);

    // ── Layer 2: mid glow ────────────────────────────────────────────────────
    this._drawGlowRing(ctx, cx, cy, this.size * 1.2, pulse, 0.35);

    // ── Layer 3: inner glow (brightest) ─────────────────────────────────────
    this._drawGlowRing(ctx, cx, cy, this.size * 0.75, pulse, 0.60);

    // ── Crystal body: a soft rounded diamond shape ───────────────────────────
    this._drawCrystalBody(ctx, cx, cy, pulse);

    // ── Sparkle glints ───────────────────────────────────────────────────────
    this._renderSparkles(ctx);
  }

  // ─── _drawGlowRing ───────────────────────────────────────────────────────────
  // Draws a single radial-gradient halo centered on (cx, cy).
  // `basePulse` modulates opacity so the whole halo breathes.
  _drawGlowRing(ctx, cx, cy, radius, pulse, baseOpacity) {
    const opacity = baseOpacity * (0.7 + pulse * 0.3); // breathes between 70–100 %
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);

    // Convert hex color to rgba helper (inline so no external dep needed)
    const rgba = (hex, a) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${a})`;
    };

    gradient.addColorStop(0,   rgba(this.glowColor, opacity));
    gradient.addColorStop(0.6, rgba(this.glowColor, opacity * 0.4));
    gradient.addColorStop(1,   rgba(this.glowColor, 0));

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();
  }

  // ─── _drawCrystalBody ────────────────────────────────────────────────────────
  // Draws the main gem shape — a classic four-pointed diamond outline.
  // The pulse subtly scales it so it feels like it's breathing.
  _drawCrystalBody(ctx, cx, cy, pulse) {
    const scale = 1 + pulse * 0.06; // gentle 6 % size breath
    const half  = (this.size / 2) * scale;

    ctx.save();
    ctx.translate(cx, cy);

    // Diamond path (4-pointed)
    ctx.beginPath();
    ctx.moveTo(0, -half);          // top
    ctx.lineTo(half * 0.55, 0);    // right  (slightly narrower for elegance)
    ctx.lineTo(0, half);           // bottom
    ctx.lineTo(-half * 0.55, 0);   // left
    ctx.closePath();

    // Fill with a subtle radial gradient — brighter core, softer edge
    const bodyGrad = ctx.createRadialGradient(0, -half * 0.2, 0, 0, 0, half);
    bodyGrad.addColorStop(0,   this.coreColor);
    bodyGrad.addColorStop(0.5, this.glowColor);
    bodyGrad.addColorStop(1,   this.glowColor + 'aa'); // semi-transparent edge

    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Thin luminous outline so the gem reads clearly against any background
    ctx.strokeStyle = this.coreColor;
    ctx.lineWidth   = 1.2;
    ctx.globalAlpha = 0.7 + pulse * 0.3;
    ctx.stroke();

    ctx.restore();
  }

  // ─── _spawnSparkle ───────────────────────────────────────────────────────────
  // Creates a tiny glint near the crystal's surface. Sparkles are short-lived
  // (30–50 frames) so they feel like fleeting moments of magic.
  _spawnSparkle() {
    const angle  = Math.random() * Math.PI * 2;
    const dist   = this.size * 0.3 + Math.random() * this.size * 0.5;
    this._sparkles.push({
      x:       this.x + this.size / 2 + Math.cos(angle) * dist,
      y:       this.y + this.size / 2 + Math.sin(angle) * dist,
      maxLife: 30 + Math.floor(Math.random() * 20),
      life:    30 + Math.floor(Math.random() * 20),
      size:    1.5 + Math.random() * 2,
    });
  }

  // ─── _renderSparkles ─────────────────────────────────────────────────────────
  // Draws each active sparkle as a tiny 4-pointed star that fades out.
  _renderSparkles(ctx) {
    for (const s of this._sparkles) {
      const progress = s.life / s.maxLife;           // 1 → 0
      const alpha    = progress * progress;           // ease-out fade
      const sz       = s.size * (0.5 + progress * 0.5);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(s.x, s.y);

      // Tiny 4-point star cross
      ctx.strokeStyle = this.coreColor;
      ctx.lineWidth   = sz * 0.5;
      ctx.lineCap     = 'round';

      ctx.beginPath();
      ctx.moveTo(-sz, 0); ctx.lineTo(sz, 0);  // horizontal bar
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -sz); ctx.lineTo(0, sz);  // vertical bar
      ctx.stroke();

      ctx.restore();
    }
  }
}
