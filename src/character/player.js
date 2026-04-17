/**
 * Player Character — The Girl
 * Cozy design: warm silhouette, clear outline, soft drop shadow
 * Visible against all pastel backgrounds
 */
export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.petalsCollected = [];
    this.crystalsFound = [];
    this.animFrame = 0;
    this.hairColor    = '#7a4a2a'; // warm chestnut brown
    this.skinColor    = '#f5c9a0'; // soft peach skin
    this.dressColor   = '#f2a7b8'; // rose-pink dress
    this.dressAccent  = '#fde8ee'; // cream dress trim
    this.outlineColor = '#c47a8a'; // soft rose outline (not black!)
  }

  render(ctx) {
    const x = this.x, y = this.y;

    // 1. Soft drop shadow (offset, low opacity)
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#a07080';
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 22, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Soft outline pass (draw slightly larger shapes in outline color first)
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';

    // Dress outline
    ctx.beginPath();
    ctx.moveTo(x - 9, y + 6);
    ctx.quadraticCurveTo(x - 12, y + 20, x - 7, y + 26);
    ctx.lineTo(x + 7, y + 26);
    ctx.quadraticCurveTo(x + 12, y + 20, x + 9, y + 6);
    ctx.closePath();
    ctx.stroke();

    // Head outline
    ctx.beginPath();
    ctx.arc(x, y - 4, 9.5, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Dress fill
    ctx.fillStyle = this.dressColor;
    ctx.beginPath();
    ctx.moveTo(x - 9, y + 6);
    ctx.quadraticCurveTo(x - 12, y + 20, x - 7, y + 26);
    ctx.lineTo(x + 7, y + 26);
    ctx.quadraticCurveTo(x + 12, y + 20, x + 9, y + 6);
    ctx.closePath();
    ctx.fill();

    // Dress trim (cream collar)
    ctx.fillStyle = this.dressAccent;
    ctx.beginPath();
    ctx.ellipse(x, y + 6, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Head / face
    ctx.fillStyle = this.skinColor;
    ctx.beginPath();
    ctx.arc(x, y - 4, 9, 0, Math.PI * 2);
    ctx.fill();

    // 5. Hair (warm brown, flows slightly)
    ctx.fillStyle = this.hairColor;
    ctx.beginPath();
    ctx.arc(x, y - 6, 9, Math.PI, 0); // top arc
    ctx.quadraticCurveTo(x + 11, y - 2, x + 8, y + 4);  // right flow
    ctx.quadraticCurveTo(x - 8, y + 4, x - 11, y - 2);  // left flow
    ctx.closePath();
    ctx.fill();

    // Hair highlight
    ctx.fillStyle = '#a06840';
    ctx.beginPath();
    ctx.ellipse(x - 2, y - 10, 4, 2.5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // 6. Rosy cheeks
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#f0a0a0';
    ctx.beginPath();
    ctx.ellipse(x - 5, y - 2, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 5, y - 2, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 7. Eyes (small, soft dots)
    ctx.fillStyle = '#5a3a2a';
    ctx.beginPath();
    ctx.arc(x - 3, y - 4, 1.5, 0, Math.PI * 2);
    ctx.arc(x + 3, y - 4, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
