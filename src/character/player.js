// Player Character - Small Girl
// Issues: Character not visible in UI mockup, needs clear silhouette

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = null; // TODO: assign visible sprite
    this.petalsCollected = [];
    this.crystalsFound = [];
  }

  render(ctx) {
    // TODO: render character with clear soft outline
    // Character needs to stand out against pastel backgrounds
    ctx.fillStyle = '#e8c4a0'; // warm skin tone
    ctx.beginPath();
    ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}
