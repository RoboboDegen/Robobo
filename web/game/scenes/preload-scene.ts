import * as Phaser from 'phaser';
import { GAME_ASSETS_DATA } from '../config/assets';
import { GameManager } from '../core/game-manager';
import { GameEventManager } from '../core/event-manager';

export class PreloadScene extends Phaser.Scene {
  private eventManager: GameEventManager;

  constructor() {
    super({ key: 'PreloadScene' });
    this.eventManager = GameEventManager.getInstance();
  }

  preload() {
    // 通知UI层开始加载
    this.eventManager.emit('ASSET_LOAD_PROGRESS', { progress: 0 });

    // 加载所有资源
    GAME_ASSETS_DATA.images.forEach(img => {
      this.load.image(img.key, img.path);
    });

    GAME_ASSETS_DATA.spritesheets.forEach(sprite => {
      if(sprite.key && sprite.path && sprite.frameConfig){
        this.load.spritesheet(sprite.key, sprite.path, sprite.frameConfig);
      }
    });

    GAME_ASSETS_DATA.audio.forEach(audio => {
      if (audio.key && audio.path) {
        this.load.audio(audio.key, audio.path);
      }
    });

    // 监听加载进度
    this.load.on('progress', (value: number) => {
      this.eventManager.emit('ASSET_LOAD_PROGRESS', { progress: value });
    });

    // 监听加载完成
    this.load.on('complete', () => {
      this.loadComplete();
    });
  }

  private loadComplete() {
    // 初始化游戏管理器
    GameManager.getInstance(this);
    
    // 通知UI层加载完成
    this.eventManager.emit('ASSET_LOAD_COMPLETE', { 
      total: this.load.totalComplete
    });

    // 延迟一小段时间后切换场景，给UI层时间展示完成动画
    this.time.delayedCall(500, () => {
      this.scene.start('GameTestScene');
    });
  }
} 