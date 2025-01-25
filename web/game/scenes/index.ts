import * as Phaser from 'phaser';
import { GameManager } from '../core/game-manager';
import { AssetManager } from '../core/asset-manager';
import { Background } from '../gameObject/background';
import { SpriteObject } from '../gameObject/sprite';


export class GameTestScene extends Phaser.Scene {
  private background?: Background;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private cameraSpeed: number = 10;
  private gameManager?: GameManager;
  private assetManager?: AssetManager;
  private player_robot?: SpriteObject;
  private enemy_robot?: SpriteObject;

  constructor() {
    super({ key: 'GameTestScene' });
  }

  create() {
    this.initializeManagers();
    this.createGameObjects();
    this.setupInput();
  }

  private initializeManagers() {
    this.gameManager = GameManager.getInstance(this);
    this.assetManager = AssetManager.getInstance(this);
    this.assetManager.playBGM('bgm');
  }

  private createGameObjects() {
    this.background = new Background(this, 'testBackground');
    this.player_robot = new SpriteObject({
      texture: 'player',
      x: 100,
      y: 100,
      scene: this
    });
  }

  private setupInput() {
    this.cursors = this.input.keyboard?.createCursorKeys();
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.assetManager?.playEffect('explosion', pointer.x, pointer.y);
      this.assetManager?.playSound('click');
    });
  }

  update() {
    if (!this.cursors) return;

    const cam = this.cameras.main;
    const bounds = cam.getBounds();
    
    if (this.cursors.left.isDown) {
      cam.scrollX = Math.max(bounds.x, cam.scrollX - this.cameraSpeed);
    }
    if (this.cursors.right.isDown) {
      cam.scrollX = Math.min(bounds.x + bounds.width - cam.width, cam.scrollX + this.cameraSpeed);
    }
    if (this.cursors.up.isDown) {
      cam.scrollY = Math.max(bounds.y, cam.scrollY - this.cameraSpeed);
      
      console.log("上箭头键被按下");
      // 播放动画：跳跃
    if (this.player_robot) {
      this.player_robot.playAnimation('player-jump');
      }
    }
    if (this.cursors.down.isDown) {
      cam.scrollY = Math.min(bounds.y + bounds.height - cam.height, cam.scrollY + this.cameraSpeed);
    }
  }

  shutdown() {
    this.background?.destroy();
    this.cursors = undefined;
    this.gameManager?.audio.stopAll();
  }
}
