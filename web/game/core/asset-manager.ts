import { GAME_ASSETS_DATA } from '../config/assets';
import { GameManager } from './game-manager';

type ImageKeys = (typeof GAME_ASSETS_DATA.images)[number]['key'];
type SpriteKeys = (typeof GAME_ASSETS_DATA.aseprites)[number]['key'];
type AnimationKeys = (typeof GAME_ASSETS_DATA.animations)[number]['key'];
type AudioKeys = (typeof GAME_ASSETS_DATA.audio)[number]['key'];
type EffectKeys = (typeof GAME_ASSETS_DATA.effects)[number]['key'];


export class AssetManager {
  private scene: Phaser.Scene;
  private static instance: AssetManager;

  private constructor(scene: Phaser.Scene) {
    if (!scene) {
      throw new Error('Scene is required for AssetManager');
    }
    this.scene = scene;
  }

  public static getInstance(scene: Phaser.Scene): AssetManager {
    if (!AssetManager.instance || AssetManager.instance.scene !== scene) {
      AssetManager.instance = new AssetManager(scene);
    }
    return AssetManager.instance;
  }

  public getImage(key: ImageKeys) {
    if (!this.scene || !this.scene.add) {
      throw new Error('Scene not properly initialized');
    }
    
    // 检查资源是否已加载
    if (!this.scene.textures.exists(key)) {
      console.error(`Image ${key} not found in cache`);
      return undefined;
    }

    return this.scene.add.image(0, 0, key);
  }

  public getSprite(key: SpriteKeys) {
    if (!this.scene || !this.scene.add) {
      throw new Error('Scene not properly initialized');
    }

    if (!this.scene.textures.exists(key)) {
      console.error(`Sprite ${key} not found in cache`);
      return undefined;
    }

    const sprite = this.scene.add.sprite(0, 0, key);
    sprite.setAlpha(1);
    return sprite;
  }

  public playAnimation(sprite: Phaser.GameObjects.Sprite, key: AnimationKeys) {
    if (!sprite || !this.scene.anims.exists(key)) {
      console.error(`Animation ${key} not found`);
      return;
    }
    sprite.play(key);
  }

  public playEffect(key: EffectKeys, x: number, y: number) {
    if (!this.scene) return;
    GameManager.getInstance(this.scene).effect.playEffect(key, x, y);
  }

  public playSound(key: AudioKeys) {
    if (!this.scene) return;
    GameManager.getInstance(this.scene).audio.playSound(key);
  }

  public playBGM(key: AudioKeys) {
    if (!this.scene) return;
    GameManager.getInstance(this.scene).audio.playBGM(key);
  }

  public stopSound() {
    if (!this.scene) return;
    GameManager.getInstance(this.scene).audio.stopAll();
  }



  // 检查资源是否已加载

  public isAssetLoaded(key: string): boolean {
    return this.scene?.textures.exists(key) || false;
  }

  // 检查场景状态
  public isSceneReady(): boolean {
    return !!(this.scene && this.scene.add);
  }
} 