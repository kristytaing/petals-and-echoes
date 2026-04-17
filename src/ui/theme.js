/**
 * theme.js — Petals & Echoes Central UI Theme
 * ─────────────────────────────────────────────
 * All cozy color constants, glow values, borders, and radii live here.
 * Every UI module imports from this file so the entire game stays
 * visually consistent — like a single watercolour palette held by
 * one gentle, steady hand.
 *
 * Design philosophy:
 *   • Warm neutrals for backgrounds — never stark white or flat grey
 *   • Rose-gold accents to echo the petal motif
 *   • Soft glows instead of hard outlines
 *   • All radii are generous — nothing feels corner-sharp
 */

// ─── Base Palette ───────────────────────────────────────────────────────────

export const COLORS = {

  // --- Creams & Parchments (panel backgrounds) ---
  creamPale:       '#FDF6EC',   // lightest parchment — almost white
  creamWarm:       '#FAF0DC',   // warm cream — main panel fill
  creamDeep:       '#F5E6C8',   // deeper cream — slot backgrounds
  parchment:       '#EDD9A3',   // aged parchment — subtle dividers

  // --- Rose & Petal Tones ---
  petalBlush:      '#F4B8C1',   // soft blush — default petal slot tint
  petalRose:       '#E8849A',   // mid rose — active / collected petal
  petalDeep:       '#C75B7A',   // deep rose — pressed / selected state
  petalGlow:       '#FFDDE5',   // near-white rose — glow bloom colour

  // --- Rose-Gold (borders & accents) ---
  roseGold:        '#C9956C',   // primary rose-gold border
  roseGoldLight:   '#E8B89A',   // lighter — hover / shimmer highlight
  roseGoldDeep:    '#A0634A',   // deeper — shadow edge of borders
  goldShimmer:     '#F5D0A9',   // warm shimmer overlay

  // --- Crystal & Glow Blues ---
  crystalSky:      '#B8D8F0',   // pale sky blue — crystal fill
  crystalGlow:     '#D6ECFF',   // bloom around crystal counter
  crystalDeep:     '#6AAED6',   // deeper crystal — text / icon
  crystalSpark:    '#EAF6FF',   // near-white spark highlight

  // --- Greens & Moss (nature / compass) ---
  mossDeep:        '#6B8C6E',   // twig / compass arm colour
  mossLight:       '#A8C5A0',   // lighter moss — leaf accents
  fernSoft:        '#C8DFC4',   // very soft fern — background flora

  // --- Neutral Darks (text only — never for backgrounds) ---
  inkSoft:         '#5C4A3A',   // warm dark brown — primary text
  inkFaint:        '#9C8474',   // muted brown — secondary / label text
  inkGhost:        '#C4B0A0',   // ghosted — placeholder text

  // --- Transparent Fills (used with ctx.globalAlpha or rgba) ---
  frostedWhite:    'rgba(253, 246, 236, 0.88)',   // frosted cream panel
  frostedRose:     'rgba(244, 184, 193, 0.30)',   // rose blush overlay
  shadowDrop:      'rgba(140, 90, 70,  0.18)',    // gentle drop shadow

};


// ─── Opacity Constants ───────────────────────────────────────────────────────

export const OPACITY = {
  panel:       0.92,   // main HUD panels — raised from 0.4; comfortable and readable
  slotResting: 0.72,   // petal slots when empty
  slotFilled:  0.95,   // petal slots when holding a petal
  glow:        0.55,   // ambient glow bloom
  shadowDrop:  0.18,   // drop-shadow beneath panels
};


// ─── Border & Corner Radii ───────────────────────────────────────────────────

export const RADIUS = {
  panel:       16,    // main panels — frosted glass cards
  slot:        20,    // petal slots — soft ovals (used with scaleX)
  badge:        12,    // crystal counter badge
  portrait:    14,    // character portrait frame
  compass:     50,    // compass backing — fully circular
  button:      10,    // any interactive button
};


// ─── Border Widths ───────────────────────────────────────────────────────────

export const BORDER = {
  panel:       1.5,   // subtle panel outline
  slot:        2.0,   // petal slot rose-gold ring
  badge:       1.5,   // crystal badge ring
  portrait:    2.5,   // portrait frame — slightly heavier for warmth
  compass:     1.5,   // compass outer ring
};


// ─── Glow / Shadow Styles ────────────────────────────────────────────────────
// These are pre-built ctx.shadowColor / shadowBlur / shadowOffsetY combos
// consumed by the draw helpers in hud.js and inventory.js.

export const GLOW = {

  panel: {
    color:  COLORS.shadowDrop,
    blur:   12,
    offsetX: 0,
    offsetY: 4,
  },

  slot: {
    color:  COLORS.petalGlow,
    blur:   10,
    offsetX: 0,
    offsetY: 0,
  },

  slotActive: {
    color:  COLORS.petalRose,
    blur:   18,
    offsetX: 0,
    offsetY: 0,
  },

  crystal: {
    color:  COLORS.crystalGlow,
    blur:   14,
    offsetX: 0,
    offsetY: 0,
  },

  compass: {
    color:  COLORS.mossLight,
    blur:    8,
    offsetX: 0,
    offsetY: 0,
  },

  portrait: {
    color:  COLORS.roseGoldLight,
    blur:   10,
    offsetX: 0,
    offsetY: 2,
  },
};


// ─── Typography ──────────────────────────────────────────────────────────────

export const FONT = {
  // All sizes in px; all weights chosen to feel hand-lettered, not corporate.
  labelSmall:  '11px "Georgia", serif',
  label:       '13px "Georgia", serif',
  counter:     'bold 15px "Georgia", serif',
  heading:     'bold 14px "Georgia", serif',
  badge:       'bold 12px "Georgia", serif',
};


// ─── Layout Grid ─────────────────────────────────────────────────────────────
// Soft spacing units — multiples of 8 keep things consistent without
// feeling engineered. Think "gentle rhythm", not "strict grid".

export const SPACING = {
  xs:   4,
  sm:   8,
  md:  16,
  lg:  24,
  xl:  40,
};


// ─── Animation Timings ───────────────────────────────────────────────────────

export const ANIM = {
  glowPulsePeriod: 2400,    // ms — how long one full glow breathe takes
  slotIlluminate:   320,    // ms — slot lights up when petal collected
  slotFade:         600,    // ms — slot fades back to resting glow
  compassSway:     3800,    // ms — gentle compass needle sway period
};
