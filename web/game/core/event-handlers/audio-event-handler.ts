import { BaseEventHandler } from './base-event-handler';
import { AudioEventTypes, GameLogicEventData } from '../event-types';
import { GameTestScene } from '../../scenes';

export class AudioEventHandler extends BaseEventHandler<GameTestScene> {
  initialize(): void {
    this.subscribe('AUDIO', (data: GameLogicEventData['AUDIO']) => {
      switch (data.type) {
        case AudioEventTypes.playBGM:
          if (data.audioKey) {
            this.scene.assetManager?.playBGM(data.audioKey);
          }
          break;
        case AudioEventTypes.stopAll:
          this.scene.assetManager?.stopSound()

          break;
      }
    });
  }
} 