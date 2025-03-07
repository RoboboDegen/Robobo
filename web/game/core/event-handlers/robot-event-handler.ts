import { BaseEventHandler } from './base-event-handler';
import { RobotEventTypes } from '../event-types';
import { GameTestScene } from '../../scenes';
import { RobotObject } from '../../gameObject/robot';

export class RobotEventHandler extends BaseEventHandler<GameTestScene> {
  constructor(scene: GameTestScene) {
    super(scene);
    this.scene = scene;
  }

  initialize(): void {
    // 添加调试日志
    console.log('RobotEventHandler initialized');

    const unsubscribe = this.eventManager.on('ROBOT', (data) => {
      console.log('Received ROBOT event:', data); // 调试日志

      // 检查机器人是否存在
      if (!this.scene.robot || !this.scene.enemy) {
        console.warn('Robots not initialized yet');
        return;
      }

      // 处理玩家机器人事件
      if (data.robotId === this.scene.robot.getRobotId()) {
        console.log('Playing animation for player robot:', data.type);
        this.handleRobotAnimation(this.scene.robot, data.type);
      }

      // 处理敌方机器人事件
      if (data.robotId === this.scene.enemy.getRobotId()) {
        console.log('Playing animation for enemy robot:', data.type);
        this.handleRobotAnimation(this.scene.enemy, data.type);
      }
    });

    this.addSubscription(unsubscribe);
  }

  private handleRobotAnimation(robot: RobotObject, type: RobotEventTypes) {
    try {
      switch (type) {
        case RobotEventTypes.hit:
          robot.playAnimation('hit');
          break;
        case RobotEventTypes.defence:
          robot.playAnimation('defence');
          break;
        case RobotEventTypes.underattack:
          robot.playAnimation('underattack');
          break;
        case RobotEventTypes.win:
          robot.playAnimation('win');
          break;
        case RobotEventTypes.lose:
          robot.playAnimation('defeated');
          break;
        case RobotEventTypes.chat:
          robot.playAnimation('chat');
          break;
        case RobotEventTypes.idle:
          robot.playAnimation('idle');
          break;
        default:
          console.warn('Unknown animation type:', type);
      }
    } catch (error) {
      console.error('Error playing animation:', error);
    }
  }
} 