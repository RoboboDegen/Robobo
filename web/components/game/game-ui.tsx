'use client';

import { cn } from "@/lib/utils";
import { RoButton } from "../ro_button";
import { tiny5 } from "@/app/fonts";



export function GameUI() {
    return (
        <div className={cn(
            "absolute inset-0 pointer-events-auto",
            "flex flex-col items-center justify-between p-4",
            "max-w-[720px] mx-auto", // 与游戏最大宽度匹配
        )}>
            <div className="flex h-full flex-col justify-end">
                <RoButton className={cn(tiny5.className, "text-4xl text-white uppercase [text-shadow:_-3px_-3px_0_#9333ea,_3px_-3px_0_#9333ea,_-3px_3px_0_#9333ea,_3px_3px_0_#9333ea]")}>
                    Connect
                </RoButton>
            </div>
        </div>
    );
} 