import { Scene } from 'phaser';
import { GameEventManager } from '../event-manager';
import { GameEventData } from '../event-types';

export interface IEventHandler {
  initialize(): void;
  cleanup(): void;
}

export abstract class BaseEventHandler<TScene extends Scene = Scene> implements IEventHandler {
  protected scene: TScene;
  protected eventManager: GameEventManager;
  protected subscriptions: Array<() => void> = [];

  constructor(scene: TScene) {
    this.scene = scene;
    this.eventManager = GameEventManager.getInstance();
  }

  abstract initialize(): void;
  
  cleanup(): void {
    // 清理所有订阅
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
  }

  protected addSubscription(unsubscribe: () => void): void {
    this.subscriptions.push(unsubscribe);
  }

  protected subscribe<Channel extends keyof GameEventData>(
    channel: Channel,
    handler: (data: GameEventData[Channel]) => void
  ): void {
    const unsubscribe = this.eventManager.on(channel, handler);
    this.addSubscription(unsubscribe);
  }
} 