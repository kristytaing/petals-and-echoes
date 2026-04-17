// Crystal Echoes - Memory fragments
// Issues: Crystals not visible in current UI mockup

export class Crystal {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'memory', 'wind', 'reflection'
    this.glowColor = '#b8d4ff'; // soft blue glow - barely visible
    this.visible = false; // BUG: crystals hidden by default
    this.size = 8; // BUG: too small, not visible on screen
  }

  render(ctx) {
    if (!this.visible) return; // BUG: needs to always render with glow
    ctx.fillStyle = this.glowColor;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}
