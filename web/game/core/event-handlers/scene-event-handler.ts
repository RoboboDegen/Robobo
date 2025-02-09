import { BaseEventHandler } from './base-event-handler';
import { SceneEventTypes, GameLogicEventData } from '../event-types';
import { GameTestScene } from '../../scenes';
import { RobotObject } from '@/game/gameObject/robot';

export class SceneEventHandler extends BaseEventHandler<GameTestScene> {
    initialize(): void {
        this.subscribe('SCENE', (data: GameLogicEventData['SCENE']) => {
            switch (data.type) {
                case SceneEventTypes.changeBackground:
                    if (data.background) {
                        this.scene.background?.setBackground(data.background);
                    }
                    break;
                case SceneEventTypes.cameraChat:                    
                    if (this.scene.robot) {
                        this.scene.cameraController?.focusOnChat(this.scene.robot.sprite, 5);
                    }
                    break;
                case SceneEventTypes.cameraFocusOn:
                    if (this.scene.robot) {
                        this.scene.cameraController?.focusOn(this.scene.robot.sprite, 5);
                    } else {
                        if (data.robot) {
                            this.scene.robot = new RobotObject({
                                scene: this.scene,
                                x: this.scene.cameras.main.width / 2,
                                y: this.scene.cameras.main.height / 2,
                            },
                                data.robot

                            );
                            this.scene.robot.playAnimation('idle');
                            this.scene.cameraController?.focusOn(this.scene.robot.sprite, 5);
                        }                        
                    }
                    break;
                case SceneEventTypes.cameraShake:
                    this.scene.cameraController?.shake();
                    break;
                case SceneEventTypes.cameraReset:
                    this.scene.cameraController?.reset();
                    break;
                case SceneEventTypes.cameraBattle:
                    this.scene.cameraController?.focusOnBattle();
                    if (data.enemy) {
                        this.scene.cameraController?.focusOnBattle();
                        console.log("create enemy");
                        this.scene.enemy = new RobotObject(
                            {
                                scene: this.scene,

                                x: this.scene.cameras.main.width / 2 + 40,
                                y: this.scene.cameras.main.height / 2 - 55,

                            },
                            data.enemy
                        )
                        this.scene.enemy.setFlipX(true);
                        this.scene.enemy.playAnimation('idle');
                        this.scene.robot?.setPosition(this.scene.cameras.main.width / 2 - 40, this.scene.cameras.main.height / 2 - 55);
                        this.scene.robot?.setPosition(this.scene.cameras.main.width / 2 - 40, this.scene.cameras.main.height / 2 - 55);
                    }
                    break;
                case SceneEventTypes.cameraInventory:
                    this.scene.cameraController?.focusOnInventory();
                    break;
            }
        });
    }
} 