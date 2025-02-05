import * as Phaser from 'phaser';
import { GameManager } from '../core/game-manager';
import { AssetManager } from '../core/asset-manager';
import { Background } from '../gameObject/background';


export class GameTestScene extends Phaser.Scene {
  private background?: Background;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private cameraSpeed: number = 10;
  private gameManager?: GameManager;
  private assetManager?: AssetManager;

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