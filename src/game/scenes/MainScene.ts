import Phaser from 'phaser';
import { Bubble, COLORS } from '../objects/Bubble';
import { Cannon } from '../objects/Cannon';
import { GridManager } from '../logic/GridManager';
import { updateScore, setGameStatus, gameState } from '../../store/gameState';
import { get } from 'svelte/store';

export class MainScene extends Phaser.Scene {
  private gridManager!: GridManager;
  private cannon!: Cannon;
  private currentBubble?: Bubble;
  private isShooting: boolean = false;
  private bubblesGroup!: Phaser.Physics.Arcade.Group;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#2c3e50');

    this.gridManager = new GridManager(
      12,
      10,
      32,
      this.cameras.main.width / 2 - (10 * 32) / 2 + 16,
      32
    );
    this.bubblesGroup = this.physics.add.group();

    this.cannon = new Cannon(this, this.cameras.main.width / 2, this.cameras.main.height - 40);

    this.generateInitialGrid();
    this.prepareNextBubble();

    this.input.on('pointerdown', this.shootBubble, this);

    // Listen to game status
    gameState.subscribe((state) => {
      if (state.status === 'playing' && this.scene.isPaused()) {
        this.scene.resume();
        this.resetGame();
      } else if (state.status === 'gameover' || state.status === 'start') {
        this.scene.pause();
      }
    });

    if (get(gameState).status !== 'playing') {
      this.scene.pause();
    }
  }

  update() {
    if (get(gameState).status !== 'playing') return;

    if (!this.isShooting && this.currentBubble) {
      this.cannon.updateAngle(this.input.activePointer.x, this.input.activePointer.y);
    }

    if (
      this.currentBubble &&
      this.currentBubble.body &&
      this.currentBubble.body.velocity.length() > 0
    ) {
      // Update physics collision with top border
      if (this.currentBubble.y <= this.gridManager.startY - 16) {
        this.snapBubble(this.currentBubble);
      } else {
        // Check collision with other bubbles
        const activeBubbles = this.gridManager.getAllBubbles();
        for (const b of activeBubbles) {
          // Approximate collision distance
          const dist = Phaser.Math.Distance.Between(
            this.currentBubble.x,
            this.currentBubble.y,
            b.x,
            b.y
          );
          if (dist <= 30 && b.y <= this.currentBubble.y) {
            this.snapBubble(this.currentBubble);
            break;
          }
        }
      }
    }
  }

  private generateInitialGrid() {
    for (let r = 0; r < 5; r++) {
      const colsInRow = r % 2 === 0 ? this.gridManager.cols : this.gridManager.cols - 1;
      for (let c = 0; c < colsInRow; c++) {
        const color = COLORS[Phaser.Math.Between(0, COLORS.length - 1)];
        const bubble = new Bubble(this, 0, 0, color);
        this.gridManager.addBubble(bubble, r, c);
        this.bubblesGroup.add(bubble);
      }
    }
  }

  private prepareNextBubble() {
    const nextColor = COLORS[Phaser.Math.Between(0, COLORS.length - 1)];
    this.currentBubble = new Bubble(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height - 40,
      nextColor
    );
    this.bubblesGroup.add(this.currentBubble);
    this.isShooting = false;
  }

  private shootBubble() {
    if (this.isShooting || !this.currentBubble || get(gameState).status !== 'playing') return;

    this.isShooting = true;
    const angle = this.cannon.updateAngle(this.input.activePointer.x, this.input.activePointer.y);
    const speed = 800;

    const bx = this.cameras.main.width / 2;
    const by = this.cameras.main.height - 40;
    this.currentBubble.setPosition(bx, by);

    this.physics.velocityFromRotation(angle, speed, this.currentBubble.body?.velocity);
  }

  private snapBubble(bubble: Bubble) {
    if (bubble.body) {
      bubble.body.stop();
    }

    // Determine target location. Since we simply stop, we can just use current position.
    let loc = this.gridManager.getGridPosition(bubble.x, bubble.y);

    // Find nearest empty slot if occupied
    let finalRow = loc.row;
    let finalCol = loc.col;
    if (this.gridManager.getBubble(loc.row, loc.col) !== null) {
      finalRow++;
      if (!this.gridManager.isValidPosition(finalRow, finalCol)) {
        finalRow--;
        finalCol++;
      }
    }

    if (finalRow >= this.gridManager.rows - 2) {
      // game over
      setGameStatus('gameover');
      bubble.destroy();
      return;
    }

    if (this.gridManager.addBubble(bubble, finalRow, finalCol)) {
      this.handleMatches(finalRow, finalCol, bubble.color);
    } else {
      bubble.destroy();
    }

    this.prepareNextBubble();
  }

  private handleMatches(row: number, col: number, color: number) {
    const toExplore = [{ row, col }];
    const matched: Bubble[] = [];
    const visited = new Set<string>();
    visited.add(`${row},${col}`);

    while (toExplore.length > 0) {
      const curr = toExplore.pop()!;
      const b = this.gridManager.getBubble(curr.row, curr.col);
      if (b && b.color === color) {
        matched.push(b);
        const neighbors = this.gridManager.getNeighbors(curr.row, curr.col);
        for (const n of neighbors) {
          const key = `${n.row},${n.col}`;
          if (!visited.has(key)) {
            visited.add(key);
            toExplore.push(n);
          }
        }
      }
    }

    if (matched.length >= 3) {
      matched.forEach((b) => {
        this.gridManager.removeBubble(b.gridRow, b.gridCol);
        b.pop();
      });
      updateScore(matched.length * 10);

      this.time.delayedCall(200, () => {
        const floating = this.gridManager.getFloatingBubbles();
        floating.forEach((b) => {
          this.gridManager.removeBubble(b.gridRow, b.gridCol);
          b.drop();
        });
        if (floating.length > 0) {
          updateScore(floating.length * 20);
        }
      });
    }
  }

  private resetGame() {
    const bubbles = this.gridManager.getAllBubbles();
    bubbles.forEach((b) => b.destroy());
    if (this.currentBubble) {
      this.currentBubble.destroy();
    }

    this.gridManager = new GridManager(
      12,
      10,
      32,
      this.cameras.main.width / 2 - (10 * 32) / 2 + 16,
      32
    );
    this.generateInitialGrid();
    this.prepareNextBubble();
  }
}
