// HUD - Heads Up Display
// Issues: UI elements too small, character obscured, crystals missing

export class HUD {
  constructor() {
    this.petalSlots = 5;
    this.crystalDisplay = false; // BUG: crystal display disabled
    this.characterPortrait = null; // BUG: no character portrait
    this.opacity = 0.4; // BUG: too transparent, hard to see
  }

  render(ctx) {
    ctx.globalAlpha = this.opacity;
    // petal slots render...
    ctx.globalAlpha = 1.0;
  }
}
