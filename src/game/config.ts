import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const getGameConfig = (parent: HTMLElement): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  backgroundColor: '#2c3e50',
  scene: [MainScene],
});

export const initGame = (parent: HTMLElement) => {
  return new Phaser.Game(getGameConfig(parent));
};
