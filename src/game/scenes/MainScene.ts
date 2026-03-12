import Phaser from 'phaser';
import { Bubble, COLORS } from '../objects/Bubble';
import { Cannon } from '../objects/Cannon';
import { GridManager } from '../logic/GridManager';
import { updateScore, setGameStatus, gameState, gameEvents } from '../../store/gameState';
import { get } from 'svelte/store';

const GRID_ROWS = 12;
const GRID_COLS = 10;
const BUBBLE_DIAMETER = 32;
const BUBBLE_RADIUS = 16;
const CANNON_OFFSET_Y = 40;
const SHOOT_SPEED = 800;
const SCORE_MATCH = 10;
const SCORE_FLOAT = 20;
const ITEM_FLOAT_DELAY = 200;

export class MainScene extends Phaser.Scene {
  private gridManager!: GridManager;
  private cannon!: Cannon;
  private currentBubble?: Bubble;
  private isShooting: boolean = false;
  private bubblesGroup!: Phaser.Physics.Arcade.Group;
  private unsubscribeGameState?: () => void;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#2c3e50');

    this.gridManager = new GridManager(
      GRID_ROWS,
      GRID_COLS,
      BUBBLE_DIAMETER,
      this.cameras.main.width / 2 - (GRID_COLS * BUBBLE_DIAMETER) / 2 + BUBBLE_RADIUS,
      BUBBLE_DIAMETER
    );
    this.bubblesGroup = this.physics.add.group();

    this.cannon = new Cannon(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height - CANNON_OFFSET_Y
    );

    this.generateInitialGrid();
    this.prepareNextBubble();

    // Use built-in physics engine for robust collision detection
    this.physics.add.collider(
      this.bubblesGroup,
      this.bubblesGroup,
      this.onBubbleCollision,
      (b1, b2) => {
        const moving = b1 as Bubble;
        const staticB = b2 as Bubble;
        // Prevent collision with itself or other moving bubbles
        return (
          (moving.body!.velocity.length() > 0 && staticB.body!.velocity.length() === 0) ||
          (staticB.body!.velocity.length() > 0 && moving.body!.velocity.length() === 0)
        );
      },
      this
    );

    this.input.on('pointerdown', this.shootBubble, this);

    // Listen to game status
    this.unsubscribeGameState = gameState.subscribe((state) => {
      if (state.status === 'playing' && this.scene.isPaused()) {
        this.scene.resume();
      } else if (state.status === 'gameover') {
        this.scene.pause();
      } else if (state.status === 'start') {
        this.scene.pause();
        this.resetGame();
        gameEvents.emit('scene-ready');
      }
    });

    this.events.on('shutdown', this.shutdown, this);

    if (get(gameState).status !== 'playing') {
      this.scene.pause();
    }
  }

  shutdown() {
    if (this.unsubscribeGameState) {
      this.unsubscribeGameState();
    }
  }

  private onBubbleCollision(b1: any, b2: any) {
    const bubble1 = b1 as Bubble;
    const bubble2 = b2 as Bubble;
    const movingBubble = bubble1.body!.velocity.length() > 0 ? bubble1 : bubble2;
    this.snapBubble(movingBubble);
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
      if (this.currentBubble.y <= this.gridManager.startY - BUBBLE_RADIUS) {
        this.snapBubble(this.currentBubble);
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
      this.cameras.main.height - CANNON_OFFSET_Y,
      nextColor
    );
    this.bubblesGroup.add(this.currentBubble);
    this.isShooting = false;
  }

  private shootBubble() {
    if (this.isShooting || !this.currentBubble || get(gameState).status !== 'playing') return;

    this.isShooting = true;
    const angle = this.cannon.updateAngle(this.input.activePointer.x, this.input.activePointer.y);

    const bx = this.cameras.main.width / 2;
    const by = this.cameras.main.height - CANNON_OFFSET_Y;
    this.currentBubble.setPosition(bx, by);

    this.physics.velocityFromRotation(angle, SHOOT_SPEED, this.currentBubble.body?.velocity);
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
      const neighbors = this.gridManager.getNeighbors(loc.row, loc.col);
      let minDistance = Infinity;
      let closestNeighbor: { row: number; col: number } | null = null;

      for (const n of neighbors) {
        if (this.gridManager.getBubble(n.row, n.col) === null) {
          const worldPos = this.gridManager.getBubbleWorldPosition(n.row, n.col);
          const dist = Phaser.Math.Distance.Between(bubble.x, bubble.y, worldPos.x, worldPos.y);
          if (dist < minDistance) {
            minDistance = dist;
            closestNeighbor = n;
          }
        }
      }

      if (closestNeighbor) {
        finalRow = closestNeighbor.row;
        finalCol = closestNeighbor.col;
      } else {
        let bestFallback: { row: number; col: number } | null = null;
        let minFallbackDist = Infinity;
        let nextRow = loc.row + 1;

        if (nextRow < this.gridManager.rows) {
          const colsInRow = nextRow % 2 === 0 ? this.gridManager.cols : this.gridManager.cols - 1;
          for (let c = 0; c < colsInRow; c++) {
            if (this.gridManager.getBubble(nextRow, c) === null) {
              const worldPos = this.gridManager.getBubbleWorldPosition(nextRow, c);
              const dist = Phaser.Math.Distance.Between(bubble.x, bubble.y, worldPos.x, worldPos.y);
              if (dist < minFallbackDist) {
                minFallbackDist = dist;
                bestFallback = { row: nextRow, col: c };
              }
            }
          }
        }

        if (bestFallback) {
          finalRow = bestFallback.row;
          finalCol = bestFallback.col;
        } else {
          finalRow++;
        }
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
    const matched = this.gridManager.getMatchingCluster(row, col, color);

    if (matched.length >= 3) {
      matched.forEach((b) => {
        this.gridManager.removeBubble(b.gridRow, b.gridCol);
        b.pop();
      });
      updateScore(matched.length * SCORE_MATCH);

      this.time.delayedCall(ITEM_FLOAT_DELAY, () => {
        const floating = this.gridManager.getFloatingBubbles();
        floating.forEach((b) => {
          this.gridManager.removeBubble(b.gridRow, b.gridCol);
          b.drop();
        });
        if (floating.length > 0) {
          updateScore(floating.length * SCORE_FLOAT);
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
      GRID_ROWS,
      GRID_COLS,
      BUBBLE_DIAMETER,
      this.cameras.main.width / 2 - (GRID_COLS * BUBBLE_DIAMETER) / 2 + BUBBLE_RADIUS,
      BUBBLE_DIAMETER
    );
    this.generateInitialGrid();
    this.prepareNextBubble();
  }
}
