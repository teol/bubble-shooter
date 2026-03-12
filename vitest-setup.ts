import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('phaser', () => {
  return {
    default: {
      Game: class {
        destroy() {}
      },
      Scene: class {},
      Physics: {
        Arcade: {
          Sprite: class {
            constructor() {}
            setCircle() {}
            setBounce() {}
            setCollideWorldBounds() {}
            setTexture() {}
            setTint() {}
            setPosition() {}
            destroy() {}
          },
        },
      },
      Math: {
        Between: (min: number, max: number) => min,
        Distance: { Between: () => 0 },
        Clamp: (v: number) => v,
        Angle: { Between: () => 0 },
      },
      AUTO: 0,
    },
  };
});
