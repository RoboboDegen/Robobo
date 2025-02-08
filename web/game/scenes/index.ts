import * as Phaser from 'phaser';
import { GameManager } from '../core/game-manager';
import { AssetManager } from '../core/asset-manager';
import { Background } from '../gameObject/background';
import { GameEventManager } from '../core/event-manager';
import { RobotObject } from '../gameObject/robot';
import { CameraController } from '../core/camera-controller';
import { AudioEventTypes, RobotEventTypes, SceneEventTypes } from '../core/event-types';


export class GameTestScene extends Phaser.Scene {
  private background?: Background;
  private gameManager?: GameManager;
  private assetManager?: AssetManager;
  private eventManager?: GameEventManager;
  private robot?: RobotObject;
  private cameraController?: CameraController;


  constructor() {
    super({ key: 'GameTestScene' });
  }


  create() {
    this.cameraController = new CameraController(this);
    this.initializeManagers();
    this.createGameObjects();
    this.initializeEventListeners();
    // 创建调试面板
    //this.debugPanel = new DebugPanel(this, this.cameraController!, this.robot);
  }



  private initializeManagers() {
    this.eventManager = GameEventManager.getInstance();
    this.gameManager = GameManager.getInstance(this);
    this.assetManager = AssetManager.getInstance(this);

  }

  private initializeEventListeners() {
    // 场景准备事件
    this.eventManager?.on('SCENE_READY', () => {
      this.assetManager?.playBGM('bgm');
    });
    // 背景切换事件
    this.eventManager?.on('SCENE', (data) => {
      switch (data.type) {
        case SceneEventTypes.changeBackground:
          if (data.background) {
            this.background?.setBackground(data.background);
          }
          break;
        case SceneEventTypes.cameraFocusOn:
          if (this.robot) {
            this.cameraController?.focusOn(this.robot.sprite, 5);
          }
          break;
        case SceneEventTypes.cameraReset:
          this.cameraController?.reset();
          break;
        case SceneEventTypes.cameraShake:
          this.cameraController?.shake(0.05, 250);
          break;

      }
    });
    this.eventManager?.on('ROBOT', (data) => {
      if (data.robotId === this.robot?.getRobotId()) {
        switch (data.type) {
          case RobotEventTypes.hit:
            if (this.robot) {

              this.robot.playAnimation('hit');
            }
            break;
          case RobotEventTypes.defence:
            if (this.robot) {
              this.robot.playAnimation('defence');
            }
            break;
          case RobotEventTypes.idle:
            if (this.robot) {
              this.robot.playAnimation('idle');
            }
            break;
          case RobotEventTypes.underattack:
            if (this.robot) {
              this.robot.playAnimation('underattack');
            }
            break;
          case RobotEventTypes.win:
            if (this.robot) {
              this.robot.playAnimation('win');
            }
            break;
          case RobotEventTypes.lose:
            if (this.robot) {
              this.robot.playAnimation('defeated');
            }
            break;

        }
      }

    });
    this.eventManager?.on('AUDIO', (data) => {
      switch (data.type) {
        case AudioEventTypes.playBGM:
          if (data.audioKey) {
            this.assetManager?.playBGM(data.audioKey);
          }
          break;
        case AudioEventTypes.play:
          if (data.audioKey) {
            this.assetManager?.playSound(data.audioKey);
          }
          break;
        case AudioEventTypes.stopAll:
          this.assetManager?.stopSound();
          break;
      }
    });


  }




  private createGameObjects() {

    this.background = new Background(this, 'loginBackground');
    this.robot = new RobotObject({
      scene: this,
      x: this.cameras.main.width / 2,
      y: this.cameras.main.height / 2,
    }, {
      id: '1',
      name: 'Robobo',
      attack: 10,
      defense: 10,
      speed: 10,
      image: 'baseRobot',
      energy: 100,
      personality: 1,
      equippedElement: [{
        id: '1',
        name: 'fire',
        description: 'fire',
        value: 10,
        image: 'fire',
      }]
    });
    this.robot.playAnimation('idle');


  }

  update() {

  }

  shutdown() {
    this.eventManager?.clear();
    this.background?.destroy();
    this.gameManager?.audio.stopAll();
  }

}