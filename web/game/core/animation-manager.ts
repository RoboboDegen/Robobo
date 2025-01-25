import * as Phaser from 'phaser';
import { AnimationConfig } from '../config/assets';

export class AnimationManager {
  private scene: Phaser.Scene;
  private animations: Map<string, Phaser.Animations.Animation>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.animations = new Map();
  }

  public loadAnimations(animations: AnimationConfig[]) {
    animations.forEach(data => {
      if (!this.animations.has(data.key)) {
        const config: Phaser.Types.Animations.Animation = {
          key: data.key,
          frames: this.scene.anims.generateFrameNumbers(data.spritesheet, {
            frames: data.frames.map(Number)
          }),
          frameRate: data.frameRate || 24,
          repeat: data.repeat ?? -1
        };
        
        this.scene.anims.create(config);
        this.animations.set(data.key, this.scene.anims.get(data.key));
      }
    });
  }

  public play(sprite: Phaser.GameObjects.Sprite, key: string) {
    if (this.animations.has(key)) {
      sprite.play(key);
    }
  }

  public destroy() {
    this.animations.clear();
  }
} 