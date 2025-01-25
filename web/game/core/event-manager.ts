import { Scene } from 'phaser';
import { GameEventType, GameEventData } from './event-types';

/**
 * 事件回调函数类型
 * @template T 事件类型
 */
type EventCallback<T extends GameEventType> = (data: GameEventData[T]) => void;

/**
 * 游戏事件管理器
 * 用于处理游戏内的事件通信，包括游戏内部事件和与UI层的通信
 * 
 * 使用示例:
 * ```typescript
 * // 获取实例
 * const eventManager = GameEventManager.getInstance();
 * 
 * // 监听事件
 * eventManager.on('SCENE_READY', (data) => {
 *   console.log(`Scene ${data.sceneName} is ready`);
 * });
 * 
 * // 发送事件
 * eventManager.emit('SCENE_READY', { sceneName: 'MainScene' });
 * 
 * // 一次性事件监听
 * eventManager.once('ASSET_LOAD_COMPLETE', (data) => {
 *   console.log(`Loaded ${data.total} assets`);
 * });
 * ```
 */
export class GameEventManager {
    private static instance: GameEventManager;
    private scene?: Scene;
    private listeners: Map<GameEventType, Set<EventCallback<GameEventType>>>;

    private constructor() {
        this.listeners = new Map();
    }
    /**
     * 获取事件管理器实例
     * @returns GameEventManager 单例实例
     */
    public static getInstance(): GameEventManager {
        if (!GameEventManager.instance) {
            GameEventManager.instance = new GameEventManager();
        }
        return GameEventManager.instance;
    }

    /**
     * 设置当前 Phaser 场景
     * @param scene Phaser 场景实例
     */
    public setScene(scene: Scene): void {
        this.scene = scene;
    }

    /**
     * 注册事件监听器
     * @template T 事件类型
     * @param event 事件名称
     * @param callback 回调函数
     * @returns 取消监听的函数
     */
    public on<T extends GameEventType>(
        event: T,
        callback: EventCallback<T>
    ): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.add(callback as EventCallback<GameEventType>);
        }

        // 如果是游戏事件，同时注册到 Phaser 的事件系统
        if (this.scene && event.startsWith('game:')) {
            this.scene.events.on(event, callback as EventCallback<GameEventType>);
        }

        return () => this.off(event, callback);
    }

    /**
     * 注册一次性事件监听器
     * @template T 事件类型
     * @param event 事件名称
     * @param callback 回调函数
     */
    public once<T extends GameEventType>(
        event: T,
        callback: EventCallback<T>
    ): void {
        const wrappedCallback: EventCallback<T> = ((data: GameEventData[T]) => {
            callback(data);
            this.off(event, wrappedCallback);
        }) as EventCallback<T>;

        this.on(event, wrappedCallback);
    }

    /**
     * 移除事件监听器
     * @template T 事件类型
     * @param event 事件名称
     * @param callback 要移除的回调函数
     */
    public off<T extends GameEventType>(
        event: T,
        callback: EventCallback<T>
    ): void {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.delete(callback as EventCallback<GameEventType>);
        }
        if (this.scene && event.startsWith('game:')) {
            this.scene.events.off(event, callback as EventCallback<GameEventType>);
        }
    }

    /**
     * 触发事件
     * @template T 事件类型
     * @param event 事件名称
     * @param data 事件数据
     */
    public emit<T extends GameEventType>(
        event: T,
        data: GameEventData[T]
    ): void {
        const eventData = { ...data, timestamp: Date.now() };

        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.forEach((callback: EventCallback<GameEventType>) => {
                (callback as EventCallback<T>)(eventData);
            });
        }

        // 如果是游戏事件，同时触发 Phaser 的事件系统
        if (this.scene && event.startsWith('game:')) {
            this.scene.events.emit(event, eventData);
        }
    }

    /**
     * 清除所有事件监听器
     */
    public clear(): void {
        this.listeners.clear();
        if (this.scene) {
            this.scene.events.removeAllListeners();
        }
    }

    /**
     * 输出当前事件监听器的调试信息
     */
    public debug(): void {
        console.log('Current event listeners:',
            Array.from(this.listeners.entries()).map(([event, callbacks]) => ({
                event,
                listenerCount: callbacks.size
            }))
        );
    }
}