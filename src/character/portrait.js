/**
 * Character Portrait — HUD corner element
 * Shows a soft circular portrait of the girl in the bottom-left HUD
 */
export class Portrait {
  constructor(x, y, radius = 28) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  render(ctx, player) {
    const { x, y, radius: r } = this;

    // Soft glow ring
    const glow = ctx.createRadialGradient(x, y, r * 0.6, x, y, r + 6);
    glow.addColorStop(0, 'rgba(255, 200, 210, 0.4)');
    glow.addColorStop(1, 'rgba(255, 200, 210, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r + 6, 0, Math.PI * 2);
    ctx.fill();

    // Portrait circle clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();

    // Soft background inside portrait
    ctx.fillStyle = '#fde8f0';
    ctx.fillRect(x - r, y - r, r * 2, r * 2);

    // Draw scaled-down player character centered in portrait
    ctx.translate(x - player.x * 0.5, y - player.y * 0.5 + 4);
    ctx.scale(0.85, 0.85);
    player.render(ctx);

    ctx.restore();

    // Rose-gold border ring
    ctx.strokeStyle = '#d4899a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    // Tiny petal decoration at top of portrait
    ctx.fillStyle = '#f7b8c8';
    for (let i = 0; i < 3; i++) {
      const angle = (-0.3 + i * 0.3);
      const px = x + Math.cos(angle - Math.PI / 2) * (r - 1);
      const py = y + Math.sin(angle - Math.PI / 2) * (r - 1);
      ctx.beginPath();
      ctx.ellipse(px, py, 4, 2.5, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
