import * as Phaser from 'phaser';
import { GameTestScene } from '@/game/scenes';
import { PreloadScene } from '../scenes/preload-scene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 340,
  height: 640,
  scene: [PreloadScene, GameTestScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 340,
    height: 640,
    min: {
      width: 340,
      height: 640,
    },
    max: {
      width: 720,
      height: 1280,
    },
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
};
