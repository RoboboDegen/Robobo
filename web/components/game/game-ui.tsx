'use client';

import { cn } from "@/lib/utils";
import { Connecting } from "../Connecting";
import { Mint } from "../mint";
import { Home } from "../Main";
import { Chatting } from "../Chatting";
import { Inventory } from "../Inventory";
import { Fighting } from "../Fighting";
import { GameUIState, useGameStore } from "@/hooks/use-game-store";
import { useEffect } from "react";


export function GameUI() {
    const { gameState,setUIState } = useGameStore();

    useEffect(() => {
        setUIState(GameUIState.CONNECTING);
    }, [setUIState]);

    return (
        <div className={cn(
            "absolute inset-0 pointer-events-auto",
            "flex flex-col items-center justify-between p-4",
            "max-w-[720px] mx-auto", // 与游戏最大宽度匹配
        )}>
            <div className="flex h-full flex-col justify-end">
                {gameState.uiState === GameUIState.CONNECTING && <Connecting />}
                {gameState.uiState === GameUIState.MINT && <Mint />} 
                {gameState.uiState === GameUIState.MAIN_MENU && <Home />}
                {gameState.uiState === GameUIState.INVENTORY && <Inventory />}
                {gameState.uiState === GameUIState.FIGHTING && <Fighting />}
                {gameState.uiState === GameUIState.CHART && <Chatting />}
            </div>
        </div>
    );
} 