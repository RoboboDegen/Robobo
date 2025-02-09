import { BaseEventHandler } from './base-event-handler';
import { RobotEventTypes, GameLogicEventData } from '../event-types';
import { GameTestScene } from '../../scenes';

export class RobotEventHandler extends BaseEventHandler<GameTestScene> {
  constructor(scene: GameTestScene) {
    super(scene);
    this.scene = scene;
  }

  initialize(): void {
    const unsubscribe = this.eventManager.on('ROBOT', (data) => {
      if (data.robotId === this.scene.robot?.getRobotId()) {
        switch (data.type) {
          case RobotEventTypes.hit:
            this.scene.robot?.playAnimation('hit');
            break;
          case RobotEventTypes.defence:
            this.scene.robot?.playAnimation('defence');
            break;
          case RobotEventTypes.underattack:

            this.scene.robot?.playAnimation('underattack');
            break;
          case RobotEventTypes.win:
            this.scene.robot?.playAnimation('win');
            break;
          case RobotEventTypes.lose:
            this.scene.robot?.playAnimation('defeated');
            break;
          case RobotEventTypes.chat:
            this.scene.robot?.playAnimation('chat');
            break;
          case RobotEventTypes.idle:
            this.scene.robot?.playAnimation('idle');
            break;
        }
      }
      if (data.robotId === this.scene.enemy?.getRobotId()) {
        switch (data.type) {
          case RobotEventTypes.idle:
            this.scene.enemy?.playAnimation('idle');
            break;
          case RobotEventTypes.defence:
            this.scene.enemy?.playAnimation('defence');
            break;
          case RobotEventTypes.underattack:
            this.scene.enemy?.playAnimation('underattack');
            break;
          case RobotEventTypes.win:
            this.scene.enemy?.playAnimation('win');
            break;
          case RobotEventTypes.lose:
            this.scene.enemy?.playAnimation('defeated');
            break;
          case RobotEventTypes.chat:
            this.scene.enemy?.playAnimation('chat');
            break;
          case RobotEventTypes.idle:
            this.scene.enemy?.playAnimation('idle');
            break;
        }
      }
    });



    this.addSubscription(unsubscribe);
  }
} 