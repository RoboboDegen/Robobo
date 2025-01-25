import * as Phaser from 'phaser';
import { EffectConfig } from '../config/assets';

export class EffectManager {
  private scene: Phaser.Scene;
  private effects: Map<string, Phaser.Animations.Animation | Phaser.GameObjects.Particles.ParticleEmitter>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.effects = new Map();
  }

  public loadEffects(effects: EffectConfig[]) {
    effects.forEach(config => {
      if (!this.effects.has(config.key)) {
        if (config.frames && config.spritesheet) {
          // Sprite-based effect
          const animation = this.scene.anims.create({
            key: config.key,
            frames: this.scene.anims.generateFrameNumbers(config.spritesheet, {
              frames: config.frames.map(Number)
            }),
            hideOnComplete: true
          });
          if (animation) {
            this.effects.set(config.key, animation);
          }
        } else if (config.particleConfig) {
          // Particle-based effect
          const emitter = this.scene.add.particles(0, 0, config.key, config.particleConfig);
          emitter.stop();
          this.effects.set(config.key, emitter);
        }
      }
    });
  }

  public playEffect(key: string, x: number, y: number) {
    const effect = this.effects.get(key);
    if (effect instanceof Phaser.Animations.Animation) {
      const sprite = this.scene.add.sprite(x, y, key);
      sprite.play(key);
      sprite.once('animationcomplete', () => {
        sprite.destroy();
      });
    } else if (effect instanceof Phaser.GameObjects.Particles.ParticleEmitter) {
      effect.setPosition(x, y);
      effect.explode();
    }
  }

  public destroy() {
    this.effects.forEach(effect => {
      if (effect instanceof Phaser.GameObjects.Particles.ParticleEmitter) {
        effect.destroy();
      }
    });
    this.effects.clear();
  }
} 