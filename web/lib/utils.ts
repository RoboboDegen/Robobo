import { GameEventManager } from "@/game/core/event-manager"
import { GameEventData } from "@/game/core/event-types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const eventManager = GameEventManager.getInstance();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 触发事件，可以选择立即触发或添加到事件池
 * @param event 事件名称
 * @param data 事件数据
 * @param useEventPool 是否使用事件池
 */
export function triggerEvent(
  event: keyof GameEventData,
  data?: any,
) {
    eventManager.addToEventPool(event, data);
 
}

/**
 * 注册事件监听器
 * @param event 事件名称
 * @param callback 回调函数
 */
export function onEvent(
  event: keyof GameEventData,
  callback: (data: any) => void
) {
  eventManager.on(event, callback);
}
