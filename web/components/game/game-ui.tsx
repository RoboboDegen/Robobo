'use client';

import { cn } from "@/lib/utils";
import { Connecting } from "../Connecting";
import { Mint } from "../Mint";
import { Home } from "../Main";
import { Chatting } from "../Chatting";
import { Inventory } from "../Inventory";
import { Fighting } from "../Fighting";
import { GameUIState, useGameStore } from "@/hooks/use-game-store";
import { useEffect, useState } from "react";
import { useGameData } from "@/context/GameDataProvider";
import { Message } from "@/types";


export function GameUI() {
    const { gameState, setUIState } = useGameStore();
    const { getRobot } = useGameData();
    const [isGameReady, setIsGameReady] = useState(false);
    const { messages, getMessage, addMessage } = useGameData();

    
    const handleMint = () => {
        setUIState(GameUIState.MAIN_MENU);
    }

    const handleInventory = () => {
        setUIState(GameUIState.INVENTORY);
    }

    const handleChat = () => {
        setUIState(GameUIState.CHART);
    }

    const handleFight = () => {
        setUIState(GameUIState.FIGHTING);
    }

    const handleBack = () =>{
        setUIState(GameUIState.MAIN_MENU);
    }

    const handleSubmit = (message: string) => {
        const newMessage: Message = {
          id: messages.length + 1,
          text: message,
          sender: "user",
          timestamp: new Date(),
        }
    
        addMessage(newMessage)
      }; 

    useEffect(() => {
        const initGame = async () => {
            try {
                await getRobot();
                await getMessage();
                setIsGameReady(true);
                // 初始化完成后设置为 CONNECTING 状态
                setUIState(GameUIState.CONNECTING);
            } catch (error) {
                console.error('Failed to initialize game:', error);
            }
        };
        
        initGame();
    }, [getRobot, getMessage, setUIState]);

    if (!isGameReady) {
        return null;
    }

    return (
        <div className={cn(
            "absolute inset-0 pointer-events-auto",
            "flex flex-col items-center justify-between p-4",
            "max-w-[720px] mx-auto", // 与游戏最大宽度匹配
        )}>
            {gameState.uiState === GameUIState.CONNECTING && <Connecting setUIState={setUIState} />}
            {gameState.uiState === GameUIState.MINT && <Mint handleMint={handleMint} />}    
            {gameState.uiState === GameUIState.MAIN_MENU && <Home handleChat={handleChat} handleFight={handleFight} handleInventory={handleInventory} />}
            {gameState.uiState === GameUIState.INVENTORY && <Inventory />}
            {gameState.uiState === GameUIState.FIGHTING && <Fighting />}
            {gameState.uiState === GameUIState.CHART && <Chatting handleSubmit={handleSubmit} handleBack={handleBack} />}
        </div>
    );
} 