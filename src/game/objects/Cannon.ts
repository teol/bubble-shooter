import Phaser from 'phaser';

const CANNON_ANGLE_OFFSET = 0.2;

export class Cannon {
  private scene: Phaser.Scene;
  public x: number;
  public y: number;
  private barrelGraphics: Phaser.GameObjects.Graphics;
  private baseGraphics: Phaser.GameObjects.Graphics;
  private charGraphics: Phaser.GameObjects.Graphics;
  private time: number = 0;
  private currentAngle: number = -Math.PI / 2;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    // Layer for animated characters (behind base)
    this.charGraphics = this.scene.add.graphics();
    this.charGraphics.setPosition(x, y);

    // Layer for rotating barrel (behind base)
    this.barrelGraphics = this.scene.add.graphics();
    this.barrelGraphics.setPosition(x, y);
    this.drawBarrel();
    this.barrelGraphics.setRotation(-Math.PI / 2);

    // Layer for static base (front)
    this.baseGraphics = this.scene.add.graphics();
    this.drawBase();

    // Attach to scene update loop to animate breathing characters
    this.scene.events.on('update', this.update, this);
  }

  private update(time: number, delta: number) {
    this.time += delta;
    this.drawCharacters();
  }

  private drawBase() {
    this.baseGraphics.clear();

    // Outer mechanical rim
    this.baseGraphics.fillStyle(0x34495e, 1);
    this.baseGraphics.fillCircle(this.x, this.y, 30);
    this.baseGraphics.lineStyle(4, 0x2c3e50);
    this.baseGraphics.strokeCircle(this.x, this.y, 30);

    // Inner metallic plate
    this.baseGraphics.fillStyle(0x7f8c8d, 1);
    this.baseGraphics.fillCircle(this.x, this.y, 20);

    // Pivot
    this.baseGraphics.fillStyle(0xf1c40f, 1);
    this.baseGraphics.fillCircle(this.x, this.y, 8);
    this.baseGraphics.fillStyle(0xe67e22, 1);
    this.baseGraphics.fillCircle(this.x, this.y, 3);
  }

  private drawBarrel() {
    this.barrelGraphics.clear();

    // Thinner, longer, more realistic barrel
    // Shadow / outline
    this.barrelGraphics.fillStyle(0x2c3e50, 1);
    this.barrelGraphics.fillRect(0, -10, 80, 20);

    // Metallic gradients using stripes
    this.barrelGraphics.fillStyle(0x95a5a6, 1);
    this.barrelGraphics.fillRect(5, -8, 75, 4);

    this.barrelGraphics.fillStyle(0xbdc3c7, 1);
    this.barrelGraphics.fillRect(5, -4, 75, 4);

    this.barrelGraphics.fillStyle(0x7f8c8d, 1);
    this.barrelGraphics.fillRect(5, 0, 75, 8);

    // Detailed Nozzle tip
    this.barrelGraphics.fillStyle(0x34495e, 1);
    this.barrelGraphics.fillRect(80, -15, 15, 30);

    this.barrelGraphics.fillStyle(0xbdc3c7, 1);
    this.barrelGraphics.fillRect(82, -13, 11, 26);

    // Inner dark hole
    this.barrelGraphics.fillStyle(0x111111, 1);
    this.barrelGraphics.fillRect(90, -10, 5, 20);

    // Aiming guiding line (laser style)
    this.barrelGraphics.fillStyle(0xe74c3c, 0.5);
    this.barrelGraphics.fillRect(95, -1, 300, 2);
  }

  private drawCharacters() {
    this.charGraphics.clear();

    // Subtle breathing animation
    const breath = Math.sin(this.time * 0.005) * 2;
    const crankAngle = this.currentAngle * 5; // Crank rotates based on cannon angle

    // Character 1 (Green Dino turning crank) on the right
    this.charGraphics.fillStyle(0x2ecc71, 1); // Body color
    this.charGraphics.fillRoundedRect(35, 10 - breath, 25, 30, 8); // Body
    this.charGraphics.fillCircle(45, 5 - breath, 12); // Head

    // Eye
    this.charGraphics.fillStyle(0xffffff, 1);
    this.charGraphics.fillCircle(42, 2 - breath, 4);
    this.charGraphics.fillStyle(0x000000, 1);
    this.charGraphics.fillCircle(41, 2 - breath, 1.5);

    // Crank base
    const cx = 35;
    const cy = 20;
    const handX = cx + Math.cos(crankAngle) * 10;
    const handY = cy + Math.sin(crankAngle) * 10;

    this.charGraphics.lineStyle(3, 0x7f8c8d);
    this.charGraphics.lineBetween(cx, cy, handX, handY);
    this.charGraphics.fillStyle(0xe74c3c, 1);
    this.charGraphics.fillCircle(handX, handY, 4); // Handle

    // Dino Arm
    this.charGraphics.lineStyle(4, 0x27ae60);
    this.charGraphics.lineBetween(40, 15 - breath, handX, handY);

    // Character 2 (Blue Dino holding next bubble bag) on the left
    this.charGraphics.fillStyle(0x3498db, 1); // Body color
    this.charGraphics.fillRoundedRect(-60, 15 - breath, 25, 25, 8); // Body
    this.charGraphics.fillCircle(-45, 10 - breath, 12); // Head

    // Eye
    this.charGraphics.fillStyle(0xffffff, 1);
    this.charGraphics.fillCircle(-42, 7 - breath, 4);
    this.charGraphics.fillStyle(0x000000, 1);
    this.charGraphics.fillCircle(-41, 7 - breath, 1.5);

    // Bag for next bubble
    this.charGraphics.fillStyle(0x8e44ad, 1);
    this.charGraphics.fillRoundedRect(-80, 10, 40, 30, 8);
    // Bag opening
    this.charGraphics.fillStyle(0x732d91, 1);
    this.charGraphics.fillEllipse(-60, 10, 30, 10);

    // Hand holding bag
    this.charGraphics.lineStyle(4, 0x2980b9);
    this.charGraphics.lineBetween(-50, 20 - breath, -65, 18);
  }

  public updateAngle(pointerX: number, pointerY: number): number {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, pointerX, pointerY);
    // Clamp angle to point mostly up
    const clampedAngle = Phaser.Math.Clamp(angle, -Math.PI, 0);

    // further limit the angle to not shoot completely horizontal
    const minAngle = -Math.PI + CANNON_ANGLE_OFFSET;
    const maxAngle = -CANNON_ANGLE_OFFSET;
    const finalAngle = Phaser.Math.Clamp(clampedAngle, minAngle, maxAngle);

    this.currentAngle = finalAngle;
    this.barrelGraphics.setRotation(finalAngle);
    return finalAngle;
  }
}
