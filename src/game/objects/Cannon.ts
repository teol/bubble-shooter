import Phaser from 'phaser';

const CANNON_ANGLE_OFFSET = 0.2;

export class Cannon {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private cannonGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.cannonGraphics = this.scene.add.graphics();
    this.drawCannon(-Math.PI / 2); // Point straight up initially
  }

  public updateAngle(pointerX: number, pointerY: number): number {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, pointerX, pointerY);
    // Clamp angle to point mostly up
    const clampedAngle = Phaser.Math.Clamp(angle, -Math.PI, 0); // Only allow upper half

    // further limit the angle to not shoot completely horizontal
    const minAngle = -Math.PI + CANNON_ANGLE_OFFSET;
    const maxAngle = -CANNON_ANGLE_OFFSET;
    const finalAngle = Phaser.Math.Clamp(clampedAngle, minAngle, maxAngle);

    this.drawCannon(finalAngle);
    return finalAngle;
  }

  private drawCannon(angle: number) {
    this.cannonGraphics.clear();
    this.cannonGraphics.lineStyle(4, 0xaaaaaa);
    this.cannonGraphics.fillStyle(0x555555, 1);

    // Draw base
    this.cannonGraphics.fillCircle(this.x, this.y, 25);
    this.cannonGraphics.strokeCircle(this.x, this.y, 25);

    // Draw barrel
    const length = 50;
    const endX = this.x + Math.cos(angle) * length;
    const endY = this.y + Math.sin(angle) * length;

    this.cannonGraphics.lineBetween(this.x, this.y, endX, endY);
  }
}
