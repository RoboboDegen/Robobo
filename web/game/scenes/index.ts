import * as Phaser from 'phaser';
import { GameManager } from '../core/game-manager';
import { AssetManager } from '../core/asset-manager';
import { Background } from '../gameObject/background';
import { WaitForSeconds, WaitForEndOfFrame } from '../core/coroutine';
import { CoroutineExecutionAt } from '../core/coroutine-manager';

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
    this.doTest();
  }


  private initializeManagers() {
    this.gameManager = GameManager.getInstance(this);
    this.assetManager = AssetManager.getInstance(this);
    this.assetManager.playBGM('bgm');
  }

  private createGameObjects() {
    this.background = new Background(this, 'testBackground');
  }

  private doTest(): void {
    this.gameManager?.coroutine.start(this.test());
}

  public *test() {
    const loop = this.game.loop;
    console.log(`Hello! at time ${loop.time} / frame ${loop.frame}`);
    yield new WaitForSeconds(1);
    console.log(`Tolking! at time ${loop.time} / frame ${loop.frame}`);
    yield new WaitForEndOfFrame();
    console.log(`Goodbye! at time ${loop.time} / frame ${loop.frame}`);
  }
  
  private setupInput() {
    this.cursors = this.input.keyboard?.createCursorKeys();
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.assetManager?.playEffect('explosion', pointer.x, pointer.y);
      this.assetManager?.playSound('click');
    });
  }

  public override update(time: number, delta: number) {

    
    this.gameManager?.coroutine.tick(delta / 1000, CoroutineExecutionAt.Update);
    this.gameManager?.coroutine.tick(delta / 1000, CoroutineExecutionAt.PostUpdate);

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
