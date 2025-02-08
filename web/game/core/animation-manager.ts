import * as Phaser from 'phaser';
import { AnimationConfig } from '../config/assets';

export class AnimationManager {
  private scene: Phaser.Scene;
  private animations: Map<string, Phaser.Animations.Animation>;
  private animationConfigs: Map<string, AnimationConfig>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.animations = new Map();
    this.animationConfigs = new Map();
  }

  public loadAnimations(animations: AnimationConfig[]) {
    // 保存动画配置
    animations.forEach(config => {
      this.animationConfigs.set(config.key, config);
    });

    // 获取所有的 aseprite 动画
    const createdAnims = this.scene.anims.createFromAseprite(animations[0].frames.key);
    
    // 将创建的动画保存到 Map 中，并应用配置
    createdAnims.forEach(anim => {
      const config = this.animationConfigs.get(anim.key);
      if (config) {
        // 更新动画配置
        anim.repeat = config.repeat ?? 0;
        if (config.frameRate) {
          anim.frameRate = config.frameRate;
        }
      }
      this.animations.set(anim.key, anim);
    });
  }

  public play(sprite: Phaser.GameObjects.Sprite, key: string) {
    const animation = this.animations.get(key);
    if (!animation) {
      console.warn(`Animation ${key} not found`);
      return;
    }

    sprite.play({
      key,
      repeat: animation.repeat,
      frameRate: animation.frameRate,
    });
  }

  public destroy() {
    this.animations.clear();
    this.animationConfigs.clear();
  }
} 