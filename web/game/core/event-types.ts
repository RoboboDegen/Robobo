import { RobotConfig } from "@/types";
import { MirrorConfig } from "@/types";
import { ImageKey } from "../config/assets";

/**
 * 基础事件数据接口
 * 所有事件数据都会继承这个接口
 */
export interface BaseEventData {
  timestamp?: number;  // 事件发生的时间戳，由事件管理器自动添加
}

/**
 * 游戏核心事件数据
 * 包含场景生命周期相关的事件
 */
export interface CoreEventData {
  /** 场景准备就绪事件 */
  SCENE_READY: BaseEventData & { sceneName: string };
  /** 场景暂停事件 */
  SCENE_PAUSE: BaseEventData & { sceneName: string };
  /** 场景恢复事件 */
  SCENE_RESUME: BaseEventData & { sceneName: string };
}

export enum SceneEventTypes{
  changeBackground = 'changeBackground',
  cameraFocusOn = 'cameraFocusOn',
  cameraReset = 'cameraReset',
  cameraShake = 'cameraShake',
  cameraInventory = 'cameraInventory',
  cameraBattle = 'cameraBattle',
  cameraChat = 'cameraChat',
}

export enum RobotEventTypes{
  idle = 'idle',
  defence = 'defence',
  underattack = 'underattack',
  win = 'win',
  lose = 'lose',
  hit = 'hit',
  chat = 'chat',
}

export enum AudioEventTypes{
  play = 'play',
  playBGM = 'playBGM',
  stopAll = 'stopAll',
}




export interface GameLogicEventData {
  /** 游戏逻辑事件 */
  SCENE: {type:SceneEventTypes,background?:ImageKey,enemy?:MirrorConfig,robot?:RobotConfig};
  ROBOT: {type:RobotEventTypes,robotId?:string};
  AUDIO: {type:AudioEventTypes,audioKey?:string};
}



export interface PlayerEventData {
  /** 玩家移动事件 */

  PLAYER_MOVE: BaseEventData & { x: number; y: number };
  /** 玩家攻击事件 */
  PLAYER_ATTACK: BaseEventData;
}



/**
 * 资源事件数据
 * 包含资源加载相关的事件

 */
export interface AssetEventData {
  /** 资源加载进度事件 */
  ASSET_LOAD_PROGRESS: BaseEventData & { progress: number };
  /** 资源加载完成事件 */
  ASSET_LOAD_COMPLETE: BaseEventData & { total: number };
  /** 资源加载错误事件 */
  ASSET_LOAD_ERROR: BaseEventData & { key: string; error: string };
}

/**
 * 组合所有事件类型
 * 当需要添加新的事件类型时，在这里扩展
 * 
 * @example
 * ```typescript
 * // 添加新的事件类型
 * interface PlayerEventData {
 *   PLAYER_MOVE: BaseEventData & { x: number; y: number };
 * }
 * 
 * export interface GameEventData extends 
 *   CoreEventData,
 *   AssetEventData,
 *   PlayerEventData {
 * }
 * ```
 */
export interface GameEventData extends 
  CoreEventData,
  AssetEventData,
  PlayerEventData,
  GameLogicEventData {
  // 可以继续添加其他事件类型
}





/**
 * 获取所有事件名称的联合类型
 * 用于类型检查和自动完成
 * 
 * @example
 * ```typescript
 * // 类型安全的事件发送
 * eventManager.emit('SCENE_READY', { sceneName: 'MainScene' });
 * 
 * // 错误的事件名称会在编译时报错
 * eventManager.emit('INVALID_EVENT', {}); // Error
 * ```
 */
export type GameEventType = keyof GameEventData;

