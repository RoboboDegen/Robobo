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
    
  }

  private setupInput() {
    this.cursors = this.input.keyboard?.createCursorKeys();
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.assetManager?.playEffect('explosion', pointer.x, pointer.y);
      this.assetManager?.playSound('click');
    });
  }

  update() {
    
  }

  shutdown() {
    this.background?.destroy();
    this.cursors = undefined;
    this.gameManager?.audio.stopAll();
  }
}