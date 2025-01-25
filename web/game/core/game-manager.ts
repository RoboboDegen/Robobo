import { AnimationManager } from './animation-manager';
import { AudioManager } from './audio-manager';
import { EffectManager } from './effect-manager';
import { CoroutineManager } from './coroutine-manager';
import { GAME_ASSETS_DATA } from '../config/assets';

export class GameManager {
  private static instance: GameManager;
  
  public readonly animation: AnimationManager;
  public readonly audio: AudioManager;
  public readonly effect: EffectManager;
  public readonly coroutine: CoroutineManager;

  private constructor(scene: Phaser.Scene) {
    this.animation = new AnimationManager(scene);
    this.audio = new AudioManager(scene);
    this.effect = new EffectManager(scene);
    this.coroutine = new CoroutineManager();

    // Load all assets from config
    this.animation.loadAnimations(GAME_ASSETS_DATA.animations);
    this.audio.loadSounds(GAME_ASSETS_DATA.audio);
    this.effect.loadEffects(GAME_ASSETS_DATA.effects);
  }

  public static getInstance(scene: Phaser.Scene): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager(scene);
    }
    return GameManager.instance;
  }

  public destroy() {
    this.animation.destroy();
    this.audio.destroy();
    this.effect.destroy();
    this.coroutine.stopAll();
  }
} 