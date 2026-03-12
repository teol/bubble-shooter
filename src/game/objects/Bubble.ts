import Phaser from 'phaser';

export const COLORS = [
  0xff0000, // Red
  0x00ff00, // Green
  0x0000ff, // Blue
  0xffff00, // Yellow
  0xff00ff, // Purple
  0x00ffff, // Cyan
];

const DROP_GRAVITY = 800;
const DESTROY_DELAY_MS = 1000;
const POP_DURATION_MS = 150;

export class Bubble extends Phaser.Physics.Arcade.Sprite {
  public color: number;
  public gridRow: number = -1;
  public gridCol: number = -1;
  public isPopping: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
    const textureKey = `bubble_${color}`;
    super(scene, x, y, textureKey);
    this.color = color;

    // Generate a beautiful glassy texture dynamically for each color
    if (!scene.textures.exists(textureKey)) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      const r = 16;

      const rColor = (color >> 16) & 255;
      const gColor = (color >> 8) & 255;
      const bColor = color & 255;
      const colorStr = `rgb(${rColor},${gColor},${bColor})`;
      const darkColorStr = `rgb(${Math.floor(rColor * 0.5)},${Math.floor(gColor * 0.5)},${Math.floor(bColor * 0.5)})`;

      // Main colored bubble with radial gradient
      const grad = ctx.createRadialGradient(12, 12, 2, 16, 16, 16);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, colorStr);
      grad.addColorStop(0.8, colorStr);
      grad.addColorStop(1, darkColorStr);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(r, r, r, 0, Math.PI * 2);
      ctx.fill();

      // Bright glassy reflection on top left
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(10, 8, 6, 3, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Secondary reflection bottom right
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.ellipse(22, 24, 4, 2, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas(textureKey, canvas);
    }

    this.setTexture(textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCircle(16);
    this.setBounce(1, 1);
    this.setCollideWorldBounds(true);
  }

  pop() {
    this.isPopping = true;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: POP_DURATION_MS,
      onComplete: () => {
        this.destroy();
      },
    });
  }

  drop() {
    this.isPopping = true;
    // Remove from physics but let it fall
    if (this.body) {
      this.body.reset(this.x, this.y);
      (this.body as Phaser.Physics.Arcade.Body).gravity.y = DROP_GRAVITY;
      this.setCollideWorldBounds(false);
    }
    this.scene.time.delayedCall(DESTROY_DELAY_MS, () => {
      this.destroy();
    });
  }
}
