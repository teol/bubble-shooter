import { Bubble } from '../objects/Bubble';

export interface GridLocation {
  row: number;
  col: number;
}

export class GridManager {
  private grid: (Bubble | null)[][] = [];
  public readonly rows: number;
  public readonly cols: number;
  public readonly bubbleSize: number;
  public readonly startX: number;
  public readonly startY: number;

  constructor(rows: number, cols: number, bubbleSize: number, startX: number, startY: number) {
    this.rows = rows;
    this.cols = cols;
    this.bubbleSize = bubbleSize;
    this.startX = startX;
    this.startY = startY;

    for (let r = 0; r < rows; r++) {
      this.grid[r] = [];
      const colsInRow = r % 2 === 0 ? cols : cols - 1;
      for (let c = 0; c < colsInRow; c++) {
        this.grid[r][c] = null;
      }
    }
  }

  getGridPosition(x: number, y: number): GridLocation {
    const rowY = Math.max(0, y - this.startY);
    const row = Math.round(rowY / (this.bubbleSize * 0.866)); // 0.866 is approx Math.sqrt(3)/2 for hex grid

    const isOddRow = Math.max(0, row) % 2 !== 0;
    const rowStartX = this.startX + (isOddRow ? this.bubbleSize / 2 : 0);

    const colX = x - rowStartX;
    const col = Math.round(colX / this.bubbleSize);

    return { row: Math.max(0, row), col: Math.max(0, col) };
  }

  getBubbleWorldPosition(row: number, col: number): { x: number; y: number } {
    const isOddRow = row % 2 !== 0;
    const x = this.startX + col * this.bubbleSize + (isOddRow ? this.bubbleSize / 2 : 0);
    const y = this.startY + row * (this.bubbleSize * 0.866);
    return { x, y };
  }

  addBubble(bubble: Bubble, row: number, col: number) {
    if (this.isValidPosition(row, col)) {
      this.grid[row][col] = bubble;
      bubble.gridRow = row;
      bubble.gridCol = col;
      const { x, y } = this.getBubbleWorldPosition(row, col);
      bubble.setPosition(x, y);
      if (bubble.body) {
        bubble.body.stop();
      }
      return true;
    }
    return false;
  }

  removeBubble(row: number, col: number) {
    if (this.isValidPosition(row, col)) {
      this.grid[row][col] = null;
    }
  }

  getBubble(row: number, col: number): Bubble | null {
    if (this.isValidPosition(row, col)) {
      return this.grid[row][col];
    }
    return null;
  }

  isValidPosition(row: number, col: number): boolean {
    if (row < 0 || row >= this.rows) return false;
    const colsInRow = row % 2 === 0 ? this.cols : this.cols - 1;
    return col >= 0 && col < colsInRow;
  }

  getNeighbors(row: number, col: number): { row: number; col: number }[] {
    const neighbors: { row: number; col: number }[] = [];
    const isOddRow = row % 2 !== 0;

    const offsetsEven = [
      [0, -1],
      [0, 1],
      [-1, -1],
      [-1, 0],
      [1, -1],
      [1, 0],
    ];
    const offsetsOdd = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [-1, 1],
      [1, 0],
      [1, 1],
    ];

    const offsets = isOddRow ? offsetsOdd : offsetsEven;

    for (const [rOff, cOff] of offsets) {
      const nRow = row + rOff;
      const nCol = col + cOff;
      if (this.isValidPosition(nRow, nCol)) {
        neighbors.push({ row: nRow, col: nCol });
      }
    }

    return neighbors;
  }

  getMatchingCluster(startRow: number, startCol: number, color: number): Bubble[] {
    const cluster: Bubble[] = [];
    const queue: { row: number; col: number }[] = [{ row: startRow, col: startCol }];
    const visited = new Set<string>();

    visited.add(`${startRow},${startCol}`);

    let head = 0;
    while (head < queue.length) {
      const { row, col } = queue[head++];
      const bubble = this.getBubble(row, col);

      if (bubble && bubble.color === color && !bubble.isPopping) {
        cluster.push(bubble);

        const neighbors = this.getNeighbors(row, col);
        for (const n of neighbors) {
          const key = `${n.row},${n.col}`;
          if (!visited.has(key)) {
            visited.add(key);
            queue.push(n);
          }
        }
      }
    }

    return cluster;
  }

  getFloatingBubbles(): Bubble[] {
    const connected = new Set<string>();
    const queue: { row: number; col: number }[] = [];

    // Start from the top row
    for (let c = 0; c < this.cols; c++) {
      const bubble = this.getBubble(0, c);
      if (bubble && !bubble.isPopping) {
        queue.push({ row: 0, col: c });
        connected.add(`0,${c}`);
      }
    }

    // BFS to find all connected bubbles
    // BFS to find all connected bubbles
    let head = 0;
    while (head < queue.length) {
      const { row, col } = queue[head++];
      const neighbors = this.getNeighbors(row, col);
      for (const n of neighbors) {
        const key = `${n.row},${n.col}`;
        const bubble = this.getBubble(n.row, n.col);
        if (bubble && !bubble.isPopping && !connected.has(key)) {
          connected.add(key);
          queue.push(n);
        }
      }
    }

    const floating: Bubble[] = [];
    for (let r = 1; r < this.rows; r++) {
      const colsInRow = r % 2 === 0 ? this.cols : this.cols - 1;
      for (let c = 0; c < colsInRow; c++) {
        const bubble = this.getBubble(r, c);
        if (bubble && !bubble.isPopping && !connected.has(`${r},${c}`)) {
          floating.push(bubble);
        }
      }
    }

    return floating;
  }

  getAllBubbles(): Bubble[] {
    const bubbles: Bubble[] = [];
    for (let r = 0; r < this.rows; r++) {
      const colsInRow = r % 2 === 0 ? this.cols : this.cols - 1;
      for (let c = 0; c < colsInRow; c++) {
        const b = this.grid[r][c];
        if (b) bubbles.push(b);
      }
    }
    return bubbles;
  }
}
