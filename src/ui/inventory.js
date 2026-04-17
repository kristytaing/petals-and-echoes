/**
 * inventory.js — Petals & Echoes Petal Inventory
 * ────────────────────────────────────────────────
 * Manages the state of the five petal slots shown in the HUD bar.
 * Each slot softly illuminates when a petal is collected, then settles
 * into a gentle resting glow — like a firefly landing on a leaf.
 *
 * Design notes:
 *   • Slots are pure data here; all Canvas drawing is handled by HUD._drawPetalSlot()
 *     so the two concerns stay cleanly separated.
 *   • Animation is driven by elapsed-time easing, never setInterval/setTimeout,
 *     so it stays in sync with the game loop and never leaks memory.
 *   • Each slot carries its own glowAlpha (0–1) so they can illuminate
 *     and fade independently — collecting two petals in quick succession
 *     looks naturally staggered, not mechanical.
 *
 * Usage:
 *   const inv = new PetalInventory();
 *   inv.collectPetal(2, '#E8849A');   // slot 2 glows rose
 *   inv.update(dt);                   // call each frame
 *   // hud.js reads inv.slots to know what to render
 */

import { COLORS, ANIM } from './theme.js';

// ─── Slot state shape ────────────────────────────────────────────────────────
//
//   {
//     hasPetal:   boolean   — whether a petal currently occupies this slot
//     petalColor: string    — CSS colour of the stored petal (or null)
//     glowAlpha:  number    — 0..1 glow intensity, driven by animation phases
//     _phase:     string    — 'idle' | 'illuminating' | 'fading'
//     _phaseT:    number    — ms elapsed in current phase
//   }

// ─── PetalInventory ──────────────────────────────────────────────────────────

export class PetalInventory {

  /**
   * @param {number} [slotCount=5]  Number of petal slots (default matches HUD bar)
   */
  constructor(slotCount = 5) {
    /** @type {Array<SlotState>} */
    this.slots = Array.from({ length: slotCount }, () => _makeSlot());
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Mark a slot as holding a petal and trigger its illuminate animation.
   *
   * @param {number} index       0-based slot index
   * @param {string} [color]     CSS colour of the petal being collected
   */
  collectPetal(index, color = COLORS.petalRose) {
    if (index < 0 || index >= this.slots.length) return;

    const slot       = this.slots[index];
    slot.hasPetal    = true;
    slot.petalColor  = color;

    // Kick off the illuminate → fade animation cycle
    _startIlluminate(slot);
  }

  /**
   * Remove a petal from a slot (e.g. when the player uses it).
   * The slot fades out gracefully rather than snapping to empty.
   *
   * @param {number} index  0-based slot index
   */
  usePetal(index) {
    if (index < 0 || index >= this.slots.length) return;

    const slot    = this.slots[index];
    slot.hasPetal = false;
    // Keep colour briefly so the fade looks like the petal dissolved
    _startFade(slot, () => { slot.petalColor = null; });
  }

  /**
   * Clear all slots instantly (e.g. on scene reset).
   */
  reset() {
    this.slots.forEach(slot => {
      slot.hasPetal   = false;
      slot.petalColor = null;
      slot.glowAlpha  = 0;
      slot._phase     = 'idle';
      slot._phaseT    = 0;
      slot._onFadeDone = null;
    });
  }

  /**
   * Drive slot animations. Call once per game-loop frame.
   * @param {number} dt  Delta-time in milliseconds
   */
  update(dt) {
    this.slots.forEach(slot => _tickSlot(slot, dt));
  }

  // ─── Convenience getters ────────────────────────────────────────────────────

  /** Returns how many slots currently hold a petal. */
  get filledCount() {
    return this.slots.filter(s => s.hasPetal).length;
  }

  /** Returns the index of the first empty slot, or -1 if all are filled. */
  get nextEmptyIndex() {
    return this.slots.findIndex(s => !s.hasPetal);
  }

  /**
   * Collect a petal into the next available empty slot automatically.
   * Returns the slot index used, or -1 if inventory is full.
   *
   * @param {string} [color]
   */
  autoCollect(color = COLORS.petalRose) {
    const i = this.nextEmptyIndex;
    if (i === -1) return -1;
    this.collectPetal(i, color);
    return i;
  }
}


// ─── Internal helpers ────────────────────────────────────────────────────────

/** Create a blank, empty slot state object. */
function _makeSlot() {
  return {
    hasPetal:    false,
    petalColor:  null,
    glowAlpha:   0,
    _phase:      'idle',   // 'idle' | 'illuminating' | 'holding' | 'fading'
    _phaseT:     0,        // ms elapsed in current phase
    _onFadeDone: null,     // optional callback when fade completes
  };
}

/**
 * Begin the illuminate phase for a slot.
 * Phase timeline:
 *   illuminating (ANIM.slotIlluminate ms) → holding (800 ms) → fading (ANIM.slotFade ms)
 */
function _startIlluminate(slot) {
  slot._phase  = 'illuminating';
  slot._phaseT = 0;
}

/** Begin just the fade phase (used by usePetal). */
function _startFade(slot, onDone = null) {
  slot._phase      = 'fading';
  slot._phaseT     = 0;
  slot._onFadeDone = onDone;
}

/**
 * Advance a single slot's animation by dt milliseconds.
 * Updates slot.glowAlpha based on current phase.
 */
function _tickSlot(slot, dt) {
  if (slot._phase === 'idle') {
    // Idle resting glow — a very gentle ambient pulse so empty slots
    // still feel alive. Maximum alpha is low (0.25) so it doesn't distract.
    // We use a sine wave baked from the slot's own _phaseT so each slot
    // pulses at a slightly offset rhythm (they start out-of-phase naturally).
    slot._phaseT  += dt;
    const t        = (slot._phaseT % ANIM.glowPulsePeriod) / ANIM.glowPulsePeriod;
    slot.glowAlpha = slot.hasPetal
      ? 0.45 + 0.20 * Math.sin(t * Math.PI * 2)   // filled slots breathe more
      : 0.10 + 0.08 * Math.sin(t * Math.PI * 2);  // empty slots barely whisper
    return;
  }

  slot._phaseT += dt;

  if (slot._phase === 'illuminating') {
    // Ease in from 0 → 1 over slotIlluminate ms using smoothstep
    const progress = Math.min(slot._phaseT / ANIM.slotIlluminate, 1);
    slot.glowAlpha = _smoothStep(progress);

    if (progress >= 1) {
      // Transition to hold — stay bright for a beat
      slot._phase  = 'holding';
      slot._phaseT = 0;
    }
    return;
  }

  if (slot._phase === 'holding') {
    // Hold at full glow for 800 ms so the player can appreciate it
    slot.glowAlpha = 1.0;
    if (slot._phaseT >= 800) {
      slot._phase  = 'fading';
      slot._phaseT = 0;
    }
    return;
  }

  if (slot._phase === 'fading') {
    // Ease out from 1 → idle resting level over slotFade ms
    const progress   = Math.min(slot._phaseT / ANIM.slotFade, 1);
    const restingGlow = slot.hasPetal ? 0.45 : 0.10;
    slot.glowAlpha   = 1.0 - (1.0 - restingGlow) * _smoothStep(progress);

    if (progress >= 1) {
      if (slot._onFadeDone) {
        slot._onFadeDone();
        slot._onFadeDone = null;
      }
      slot._phase  = 'idle';
      slot._phaseT = 0;
    }
    return;
  }
}

/**
 * Classic smoothstep easing: 3t² – 2t³
 * Gives animations a soft start and end — never mechanical.
 * @param {number} t  0..1
 * @returns {number}  0..1 eased
 */
function _smoothStep(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}
