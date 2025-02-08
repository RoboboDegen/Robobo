import { GameEventManager } from "@/game/core/event-manager"
import { GameEventData } from "@/game/core/event-types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const eventManager = GameEventManager.getInstance();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function triggerEvent(event: keyof GameEventData, data?: any) {
  eventManager.emit(event, data);
}

export function onEvent(event: keyof GameEventData, callback: (data: any) => void) {
  eventManager.on(event, callback);
}
