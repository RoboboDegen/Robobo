import * as Phaser from 'phaser';
import { GameManager } from '../core/game-manager';
import { AssetManager } from '../core/asset-manager';
import { Background } from '../gameObject/background';
import { GameEventManager } from '../core/event-manager';
import { RobotObject } from '../gameObject/robot';
import { CameraController } from '../core/camera-controller';
import { AudioEventTypes, RobotEventTypes, SceneEventTypes } from '../core/event-types';
import { SceneEventHandler, RobotEventHandler, AudioEventHandler, IEventHandler } from '../core/event-handlers';


export class GameTestScene extends Phaser.Scene {
  public background?: Background;
  public gameManager?: GameManager;
  public assetManager?: AssetManager;
  public eventManager?: GameEventManager;
  public robot?: RobotObject;
  public enemy?: RobotObject;
  public cameraController?: CameraController;
  private eventHandler?: IEventHandler[] = [];



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
    this.eventHandler = [
      new SceneEventHandler(this),
      new RobotEventHandler(this),
      new AudioEventHandler(this),
    ]
    // 场景准备事件
    this.eventManager?.on('SCENE_READY', () => {
      this.assetManager?.playBGM('bgm');
    });


    this.eventHandler?.forEach(handler => {
      handler.initialize();
    });
    // 背景切换事件
    // this.eventManager?.on('SCENE', (data) => {
    //   switch (data.type) {
    //     case SceneEventTypes.changeBackground:
    //       if (data.background) {
    //         this.background?.setBackground(data.background);

    //       }
    //       break;
    //     case SceneEventTypes.cameraFocusOn:
    //       if (this.robot) {
    //         this.cameraController?.focusOn(this.robot.sprite, 5);
    //       }
    //       break;
    //     case SceneEventTypes.cameraReset:
    //       this.cameraController?.reset();
    //       break;
    //     case SceneEventTypes.cameraShake:
    //       this.cameraController?.shake(0.002, 250);
    //       break;
    //     case SceneEventTypes.cameraInventory:
    //       this.cameraController?.focusOnInventory();
    //       break;
    //     case SceneEventTypes.cameraBattle:
    //       if (data.enemy) {
    //         this.cameraController?.focusOnBattle();
    //         this.enemy = new RobotObject(
    //           {
    //             scene: this,
    //             x: this.cameras.main.width / 2 + 40,
    //             y: this.cameras.main.height / 2 - 55,
    //           },
    //           data.enemy
    //         )
    //         this.enemy.setFlipX(true);
    //         this.enemy.playAnimation('idle');
    //         this.robot?.setPosition(this.cameras.main.width / 2 - 40, this.cameras.main.height / 2 - 55);
    //       }
    //       break;



    //     case SceneEventTypes.cameraChat:


    //       if (this.robot) {
    //         this.cameraController?.focusOnChat(this.robot.sprite, 5);
    //       }
    //       break;
    //   }
    // });
    // this.eventManager?.on('ROBOT', (data) => {
    //   console.log('ROBOT', data);
    //   if (data.robotId === this.robot?.getRobotId()) {
    //     switch (data.type) {
    //       case RobotEventTypes.hit:
    //         if (this.robot) {
    //           this.robot.playAnimation('hit');
    //         }
    //         break;
    //       case RobotEventTypes.defence:
    //         if (this.robot) {
    //           this.robot.playAnimation('defence');
    //         }
    //         break;
    //       case RobotEventTypes.idle:
    //         if (this.robot) {
    //           this.robot.playAnimation('idle');
    //         }
    //         break;
    //       case RobotEventTypes.underattack:
    //         if (this.robot) {
    //           this.robot.playAnimation('underattack');
    //         }
    //         break;
    //       case RobotEventTypes.win:
    //         if (this.robot) {
    //           this.robot.playAnimation('win');
    //         }
    //         break;
    //       case RobotEventTypes.lose:
    //         if (this.robot) {
    //           this.robot.playAnimation('defeated');
    //         }
    //         break;
    //       case RobotEventTypes.chat:
    //         if (this.robot) {
    //           this.robot.playAnimation('chat');
    //         }
    //         break;
    //     }
    //   }
    // });
    // this.eventManager?.on('AUDIO', (data) => {
    //   switch (data.type) {
    //     case AudioEventTypes.playBGM:
    //       if (data.audioKey) {
    //         this.assetManager?.playBGM(data.audioKey);
    //       }
    //       break;
    //     case AudioEventTypes.play:
    //       if (data.audioKey) {
    //         this.assetManager?.playSound(data.audioKey);
    //       }
    //       break;
    //     case AudioEventTypes.stopAll:
    //       this.assetManager?.stopSound();
    //       break;
    //   }
    // });


  }




  private createGameObjects() {
    this.background = new Background(this, 'loginBackground');
    
    // 创建主角机器人
    this.robot = new RobotObject(
        {
            scene: this,
            x: this.cameras.main.width / 2 - 80,
            y: this.cameras.main.height / 2 - 150,
        },
        {
          id: "1",
          name: "Callum",
          attack: 18,  // Example value for attack
          defense: 19,  // Example value for defense
          speed: 9,    // Example value for speed
          energy: 50,   // Example value for energy
          personality: 72,  // Example value for personality      
        }
    );
    
    // 创建敌方机器人
    this.enemy = new RobotObject(
        {
            scene: this,
            x: this.cameras.main.width / 2 + 80,
            y: this.cameras.main.height / 2 -150,
        },
        {
          id: "2",
          name: "Cal",
          attack: 19,  // Example value for attack
          defense: 20,  // Example value for defense
          speed: 8,    // Example value for speed
          energy: 49,   // Example value for energy
          personality: 67,  // Example value for personality
          }
    );
    
    // 设置敌方机器人朝向
    this.enemy.setFlipX(true);
    
    // 设置初始动画
    this.robot.playAnimation('idle');
    this.enemy.playAnimation('idle');
  }

  update() {

  }

  shutdown() {
    this.eventManager?.clear();
    this.background?.destroy();
    this.gameManager?.audio.stopAll();
    this.eventHandler?.forEach(handler => {
      handler.cleanup();
    });
  }

  preload() {
    // 加载机器人精灵图和动画
    this.load.spritesheet('baseRobot', '/gameui/robot/base_robot.png', {
        frameWidth: 100,
        frameHeight: 100
    });
    
    // 加载背景
    this.load.image('loginBackground', '/gameui/background/login_background.png');
  }

}