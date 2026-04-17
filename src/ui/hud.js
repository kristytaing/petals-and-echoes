/**
 * hud.js — Petals & Echoes Heads-Up Display
 * ──────────────────────────────────────────
 * The HUD is the player's quiet companion — it should feel like a
 * hand-painted page tucked into a storybook, never like a dashboard.
 *
 * Changes from original (fix/ui-softness):
 *   • opacity raised to 0.92   — was 0.4, far too ghostly to read
 *   • crystalDisplay = true    — was disabled; crystals now shown
 *   • characterPortrait slot   — added warm framed portrait top-left
 *   • frosted-glass panels     — soft cream fill + rose-gold border
 *   • all corners radius 16 px — nothing feels angular or harsh
 *   • petal inventory bar      — 5 oval slots, cream fill, rose-gold ring
 *   • crystal counter badge    — soft sky-blue glow, hand-lettered count
 *   • wind compass             — organic twig arms, mossy palette
 *
 * All drawing helpers follow the same three-step rhythm:
 *   1. Apply shadow / glow    → warmth, depth
 *   2. Fill the shape         → frosted panel or solid badge
 *   3. Stroke the border      → rose-gold or moss, never stark black
 */

import { COLORS, OPACITY, RADIUS, BORDER, GLOW, FONT, SPACING, ANIM }
  from './theme.js';
import { PetalInventory } from './inventory.js';

// ─── HUD ────────────────────────────────────────────────────────────────────

export class HUD {

  /**
   * @param {object} [options]
   * @param {number} [options.canvasWidth=800]
   * @param {number} [options.canvasHeight=600]
   */
  constructor(options = {}) {
    this.canvasWidth  = options.canvasWidth  ?? 800;
    this.canvasHeight = options.canvasHeight ?? 600;

    // ── Core state (all bugs fixed) ──────────────────────────────────────
    this.opacity        = OPACITY.panel;   // 0.92 — was 0.4
    this.crystalDisplay = true;            // was false
    this.crystalCount   = 0;

    // Character portrait: holds an ImageBitmap or null while loading
    this.characterPortrait  = null;
    this.portraitLabel      = 'Lyra';      // shown below portrait

    // ── Sub-modules ──────────────────────────────────────────────────────
    this.inventory = new PetalInventory();

    // ── Animation clock (updated each frame via update()) ────────────────
    this._elapsed = 0;           // ms since HUD created
    this._lastTimestamp = null;

    // Compass needle target angle (radians); drifts gently with wind
    this._compassAngle = Math.PI * 0.25;   // NE default
    this._compassTarget = this._compassAngle;
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Call each game-loop frame. dt = delta-time in ms. */
  update(dt = 16) {
    this._elapsed += dt;

    // Gently sway the compass needle toward its target
    const diff = this._compassTarget - this._compassAngle;
    this._compassAngle += diff * 0.04;   // ease, not snap

    // Update petal inventory animations
    this.inventory.update(dt);
  }

  /** Set the wind direction for the compass (angle in radians, 0 = North). */
  setWindDirection(angle) {
    this._compassTarget = angle;
  }

  /** Inform the HUD that a petal was collected in the given slot (0–4). */
  collectPetal(slotIndex, petalColor = COLORS.petalRose) {
    this.inventory.collectPetal(slotIndex, petalColor);
  }

  /** Update the crystal counter. */
  setCrystalCount(n) {
    this.crystalCount = n;
  }

  /**
   * Load a portrait image from a URL or ImageBitmap.
   * @param {string|ImageBitmap} src
   */
  async loadPortrait(src) {
    if (typeof src === 'string') {
      const res = await fetch(src);
      const blob = await res.blob();
      this.characterPortrait = await createImageBitmap(blob);
    } else {
      this.characterPortrait = src;
    }
  }

  /**
   * Main render entry-point — call once per frame after clearing the canvas.
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    // Save state so we never pollute downstream draws
    ctx.save();

    // All HUD elements paint at the theme opacity
    ctx.globalAlpha = this.opacity;

    this._drawPortraitPanel(ctx);
    this._drawPetalBar(ctx);

    if (this.crystalDisplay) {
      this._drawCrystalCounter(ctx);
    }

    this._drawWindCompass(ctx);

    ctx.restore();
  }

  // ─── Private draw helpers ─────────────────────────────────────────────────

  /**
   * Character portrait — top-left corner.
   * A warm frosted-glass card with a rounded image crop and a soft name label.
   *
   *  ┌──────────┐
   *  │  [img]   │
   *  │  Lyra    │
   *  └──────────┘
   */
  _drawPortraitPanel(ctx) {
    const x = SPACING.lg;
    const y = SPACING.lg;
    const w = 80;
    const h = 96;
    const r = RADIUS.panel;

    ctx.save();

    // 1. Drop shadow
    _applyShadow(ctx, GLOW.portrait);

    // 2. Frosted panel fill
    ctx.beginPath();
    _roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = COLORS.frostedWhite;
    ctx.fill();

    // 3. Rose-gold border
    _clearShadow(ctx);
    ctx.strokeStyle = COLORS.roseGold;
    ctx.lineWidth   = BORDER.portrait;
    ctx.stroke();

    // 4. Portrait image (clipped to inner rounded rect)
    if (this.characterPortrait) {
      const pad = 6;
      ctx.save();
      ctx.beginPath();
      _roundRect(ctx, x + pad, y + pad, w - pad * 2, h - 28, RADIUS.portrait - 2);
      ctx.clip();
      ctx.drawImage(
        this.characterPortrait,
        x + pad, y + pad,
        w - pad * 2, h - 28
      );
      ctx.restore();
    } else {
      // Placeholder silhouette — a soft oval in blush
      ctx.save();
      ctx.fillStyle = COLORS.petalBlush;
      ctx.globalAlpha *= 0.5;
      ctx.beginPath();
      const cx = x + w / 2;
      const cy = y + (h - 28) / 2 + 4;
      ctx.ellipse(cx, cy, 22, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Soft warm gradient overlay (hand-painted vignette feel)
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, 'rgba(253,246,236,0.0)');
    grad.addColorStop(1, 'rgba(253,246,236,0.55)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    _roundRect(ctx, x, y, w, h, r);
    ctx.fill();

    // 6. Name label at bottom of card
    ctx.fillStyle  = COLORS.inkSoft;
    ctx.font       = FONT.label;
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.portraitLabel, x + w / 2, y + h - 12);

    ctx.restore();
  }

  /**
   * Petal inventory bar — bottom-centre of the screen.
   * Five soft oval slots, each with a cream fill and rose-gold ring.
   * Delegates slot state to PetalInventory.
   *
   *  ╭─────────────────────────────────────╮
   *  │  ○  ○  ○  ○  ○                     │
   *  ╰─────────────────────────────────────╯
   */
  _drawPetalBar(ctx) {
    const slotW    = 38;
    const slotH    = 26;
    const gap      = SPACING.sm;
    const padding  = SPACING.md;
    const count    = this.inventory.slots.length;

    const barW = count * slotW + (count - 1) * gap + padding * 2;
    const barH = slotH + padding * 2;
    const barX = (this.canvasWidth - barW) / 2;
    const barY = this.canvasHeight - barH - SPACING.xl;

    ctx.save();

    // Panel backing
    _applyShadow(ctx, GLOW.panel);
    ctx.beginPath();
    _roundRect(ctx, barX, barY, barW, barH, RADIUS.panel);
    ctx.fillStyle = COLORS.frostedWhite;
    ctx.fill();

    _clearShadow(ctx);
    ctx.strokeStyle = COLORS.roseGold;
    ctx.lineWidth   = BORDER.panel;
    ctx.stroke();

    // Render each slot via inventory (handles glow animation internally)
    this.inventory.slots.forEach((slot, i) => {
      const sx = barX + padding + i * (slotW + gap);
      const sy = barY + padding;
      this._drawPetalSlot(ctx, sx, sy, slotW, slotH, slot);
    });

    // Tiny "Petals" label on the left side of the bar
    ctx.fillStyle    = COLORS.inkFaint;
    ctx.font         = FONT.labelSmall;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Petals', barX + SPACING.sm, barY + barH / 2);

    ctx.restore();
  }

  /**
   * Draw a single oval petal slot.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x   top-left x
   * @param {number} y   top-left y
   * @param {number} w   slot width
   * @param {number} h   slot height
   * @param {object} slot  from PetalInventory
   */
  _drawPetalSlot(ctx, x, y, w, h, slot) {
    ctx.save();

    const cx = x + w / 2;
    const cy = y + h / 2;

    // Glow bloom when active or during illuminate animation
    if (slot.glowAlpha > 0) {
      const glowStyle = slot.hasPetal ? GLOW.slotActive : GLOW.slot;
      ctx.shadowColor   = glowStyle.color;
      ctx.shadowBlur    = glowStyle.blur * slot.glowAlpha;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Oval fill
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);

    if (slot.hasPetal) {
      // Warm filled — show the petal's colour, softened with cream
      const grad = ctx.createRadialGradient(cx - 4, cy - 3, 2, cx, cy, w / 2);
      grad.addColorStop(0, COLORS.petalGlow);
      grad.addColorStop(0.6, slot.petalColor ?? COLORS.petalRose);
      grad.addColorStop(1, COLORS.petalDeep);
      ctx.fillStyle = grad;
    } else {
      // Empty — soft cream with faint blush
      ctx.fillStyle = COLORS.creamDeep;
      ctx.globalAlpha *= OPACITY.slotResting;
    }

    ctx.fill();

    // Rose-gold border ring
    _clearShadow(ctx);
    ctx.strokeStyle = slot.hasPetal ? COLORS.roseGold : COLORS.roseGoldLight;
    ctx.lineWidth   = BORDER.slot;
    ctx.stroke();

    // Soft inner highlight (hand-painted shimmer)
    ctx.beginPath();
    ctx.ellipse(cx, cy - h * 0.12, w * 0.35, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fill();

    ctx.restore();
  }

  /**
   * Crystal counter badge — top-right corner.
   * A soft sky-blue rounded badge with a glow and a numeric count.
   *
   *  ╭──────────╮
   *  │  ✦  12  │
   *  ╰──────────╯
   */
  _drawCrystalCounter(ctx) {
    const badgeW = 80;
    const badgeH = 34;
    const x = this.canvasWidth - badgeW - SPACING.lg;
    const y = SPACING.lg;

    // Gentle breathing pulse using elapsed time
    const pulse = 0.5 + 0.5 * Math.sin((this._elapsed / ANIM.glowPulsePeriod) * Math.PI * 2);

    ctx.save();

    // Glow
    ctx.shadowColor   = COLORS.crystalGlow;
    ctx.shadowBlur    = 10 + pulse * 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Badge fill
    ctx.beginPath();
    _roundRect(ctx, x, y, badgeW, badgeH, RADIUS.badge);
    const grad = ctx.createLinearGradient(x, y, x, y + badgeH);
    grad.addColorStop(0, COLORS.crystalSpark);
    grad.addColorStop(1, COLORS.crystalSky);
    ctx.fillStyle = grad;
    ctx.fill();

    // Border
    _clearShadow(ctx);
    ctx.strokeStyle = COLORS.crystalDeep;
    ctx.lineWidth   = BORDER.badge;
    ctx.stroke();

    // Crystal spark icon (✦) + count
    ctx.fillStyle    = COLORS.crystalDeep;
    ctx.font         = FONT.badge;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`✦  ${this.crystalCount}`, x + badgeW / 2, y + badgeH / 2);

    // Tiny "crystals" label below
    ctx.fillStyle    = COLORS.inkFaint;
    ctx.font         = FONT.labelSmall;
    ctx.textAlign    = 'center';
    ctx.fillText('crystals', x + badgeW / 2, y + badgeH + 10);

    ctx.restore();
  }

  /**
   * Wind compass — bottom-right corner.
   * An organic circle with twig-like N/S/E/W arms in mossy brown-green.
   * The needle sways gently each frame using _compassAngle.
   *
   *        N
   *     ╱     ╲
   *   W    ·    E
   *     ╲     ╱
   *        S
   */
  _drawWindCompass(ctx) {
    const r  = 28;     // outer circle radius
    const cx = this.canvasWidth  - r - SPACING.xl;
    const cy = this.canvasHeight - r - SPACING.xl - 10;

    // Gentle breathing pulse
    const pulse = 0.5 + 0.5 * Math.sin((this._elapsed / ANIM.compassSway) * Math.PI * 2);

    ctx.save();

    // Backing circle — frosted mossy panel
    _applyShadow(ctx, GLOW.compass);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.frostedWhite;
    ctx.fill();

    _clearShadow(ctx);
    ctx.strokeStyle = COLORS.mossDeep;
    ctx.lineWidth   = BORDER.compass;
    ctx.stroke();

    // Cardinal twig arms (N, S, E, W) — hand-drawn feel via variable widths
    const arms = [
      { angle: -Math.PI / 2, label: 'N', major: true  },
      { angle:  Math.PI / 2, label: 'S', major: false },
      { angle:  0,           label: 'E', major: false },
      { angle:  Math.PI,     label: 'W', major: false },
    ];

    arms.forEach(({ angle, major }) => {
      const len    = major ? r * 0.72 : r * 0.55;
      const ex     = cx + Math.cos(angle) * len;
      const ey     = cy + Math.sin(angle) * len;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = major ? COLORS.mossDeep : COLORS.mossLight;
      ctx.lineWidth   = major ? 2.0 : 1.2;
      // Slightly rounded line caps for organic feel
      ctx.lineCap = 'round';
      ctx.stroke();

      // Small leaf nub at tip of each arm
      ctx.beginPath();
      ctx.arc(ex, ey, major ? 2.5 : 1.8, 0, Math.PI * 2);
      ctx.fillStyle = major ? COLORS.mossDeep : COLORS.mossLight;
      ctx.fill();
    });

    // Animated wind needle — rose-gold, sways toward _compassAngle
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this._compassAngle);

    // Needle shaft
    ctx.beginPath();
    ctx.moveTo(0, r * 0.65);    // tail
    ctx.lineTo(0, -r * 0.72);   // head (pointing toward wind)
    ctx.strokeStyle = COLORS.roseGold;
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';

    // Subtle glow on needle
    ctx.shadowColor = COLORS.roseGoldLight;
    ctx.shadowBlur  = 4 + pulse * 4;
    ctx.stroke();
    _clearShadow(ctx);

    // Arrowhead — tiny warm triangle
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.72);
    ctx.lineTo(-4, -r * 0.55);
    ctx.lineTo( 4, -r * 0.55);
    ctx.closePath();
    ctx.fillStyle = COLORS.roseGold;
    ctx.fill();

    ctx.restore();

    // Centre dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.roseGoldDeep;
    ctx.fill();

    // Cardinal labels
    ctx.font         = FONT.labelSmall;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = COLORS.inkSoft;

    const labelOffset = r + 11;
    ctx.fillText('N', cx, cy - labelOffset);
    ctx.fillText('S', cx, cy + labelOffset);
    ctx.fillText('E', cx + labelOffset, cy);
    ctx.fillText('W', cx - labelOffset, cy);

    ctx.restore();
  }
}


// ─── Internal geometry helpers ───────────────────────────────────────────────
// These are module-private (not exported) so they don't pollute consumers.

/**
 * Draw a rounded rectangle path on ctx.
 * Canvas 2D spec includes roundRect() in modern browsers; this helper
 * falls back gracefully for older runtime environments in the game engine.
 */
function _roundRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  // Manual arc fallback
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

/** Apply a GLOW config as Canvas shadow. */
function _applyShadow(ctx, glow) {
  ctx.shadowColor   = glow.color;
  ctx.shadowBlur    = glow.blur;
  ctx.shadowOffsetX = glow.offsetX;
  ctx.shadowOffsetY = glow.offsetY;
}

/** Remove all shadow/glow from ctx. */
function _clearShadow(ctx) {
  ctx.shadowColor   = 'transparent';
  ctx.shadowBlur    = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}
