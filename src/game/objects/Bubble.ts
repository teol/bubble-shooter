import Phaser from 'phaser';

export const COLORS = [
  0xff0000, // Red
  0x00ff00, // Green
  0x0000ff, // Blue
  0xffff00, // Yellow
  0xff00ff, // Purple
  0x00ffff, // Cyan
];

export class Bubble extends Phaser.Physics.Arcade.Sprite {
  public color: number;
  public gridRow: number = -1;
  public gridCol: number = -1;
  public isPopping: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
    super(scene, x, y, 'bubble');
    this.color = color;

    // We can generate a texture dynamically if it doesn't exist
    if (!scene.textures.exists('bubble')) {
      const graphics = scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(16, 16, 16);
      graphics.generateTexture('bubble', 32, 32);
    }

    this.setTexture('bubble');
    this.setTint(color);
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
      duration: 150,
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
      (this.body as Phaser.Physics.Arcade.Body).gravity.y = 800;
      this.setCollideWorldBounds(false);
    }
    this.scene.time.delayedCall(1000, () => {
      this.destroy();
    });
  }
}
