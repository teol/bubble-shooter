import { describe, it, expect, beforeEach } from 'vitest';
import { GridManager } from './GridManager';
import { Bubble } from '../objects/Bubble';

// Mock Bubble class minimally for testing logic without Phaser context
class MockBubble {
  color: number;
  gridRow: number = -1;
  gridCol: number = -1;
  isPopping: boolean = false;
  x: number = 0;
  y: number = 0;
  body: any = null;

  constructor(color: number) {
    this.color = color;
  }

  setPosition(x: number, y: number) {}
}

describe('GridManager', () => {
  let grid: GridManager;

  beforeEach(() => {
    grid = new GridManager(12, 10, 32, 0, 0);
  });

  it('initializes correct dimensions', () => {
    expect(grid.rows).toBe(12);
    expect(grid.cols).toBe(10);
  });

  it('adds and retrieves a bubble correctly', () => {
    const bubble = new MockBubble(0xff0000) as unknown as Bubble;
    const added = grid.addBubble(bubble, 0, 0);

    expect(added).toBe(true);
    expect(grid.getBubble(0, 0)).toBe(bubble);
  });

  it('rejects adding bubbles out of bounds', () => {
    const bubble = new MockBubble(0xff0000) as unknown as Bubble;
    const added = grid.addBubble(bubble, 20, 20);
    expect(added).toBe(false);
  });

  it('finds matching clusters correctly', () => {
    const color = 0xff0000;
    // Add 3 bubbles of same color
    const b1 = new MockBubble(color) as unknown as Bubble;
    const b2 = new MockBubble(color) as unknown as Bubble;
    const b3 = new MockBubble(color) as unknown as Bubble;

    grid.addBubble(b1, 0, 0); // (0,0)
    grid.addBubble(b2, 0, 1); // (0,1)
    grid.addBubble(b3, 1, 0); // (1,0)

    // Different color
    const b4 = new MockBubble(0x00ff00) as unknown as Bubble;
    grid.addBubble(b4, 1, 1);

    const match = grid.getMatchingCluster(0, 0, color);

    expect(match.length).toBe(3);
    expect(match).toContain(b1);
    expect(match).toContain(b2);
    expect(match).toContain(b3);
    expect(match).not.toContain(b4);
  });

  it('identifies floating bubbles', () => {
    const root = new MockBubble(0xff0000) as unknown as Bubble;
    const connected = new MockBubble(0x00ff00) as unknown as Bubble;
    const floating1 = new MockBubble(0x0000ff) as unknown as Bubble;
    const floating2 = new MockBubble(0xffff00) as unknown as Bubble;

    // Attach to ceiling
    grid.addBubble(root, 0, 5);
    // Attach to root
    grid.addBubble(connected, 1, 5);

    // Disconnected from top
    grid.addBubble(floating1, 5, 5);
    grid.addBubble(floating2, 6, 5);

    const floatingBubbles = grid.getFloatingBubbles();

    expect(floatingBubbles.length).toBe(2);
    expect(floatingBubbles).toContain(floating1);
    expect(floatingBubbles).toContain(floating2);
    expect(floatingBubbles).not.toContain(root);
    expect(floatingBubbles).not.toContain(connected);
  });
});
