'use client';

import { cn } from "@/lib/utils";
import { Connecting } from "../Connecting";
import { Mint } from "../Mint";
import { Home } from "../Main";
import { Chatting } from "../Chatting";
import { Inventory } from "../Inventory";
import { Fighting } from "../Fighting";
import { GameUIState, useGameStore } from "@/hooks/use-game-store";
import { useEffect } from "react";
import { useGameData } from "@/context/GameDataProvider";



export function GameUI() {
    const { gameState, setUIState } = useGameStore();
    const { getUserInfo } = useGameData();

    

    const handleMint = () => {
        setUIState(GameUIState.MAIN_MENU);
    }
    const handleChat = () => {
        setUIState(GameUIState.CHAT);
    }
    const handleFight = () => {
        setUIState(GameUIState.FIGHTING);
    }

    const handleInventory = () => {
        setUIState(GameUIState.INVENTORY);
    }
    
    const handleChatSubmit = (message: string) => {
        console.log(message);
    }
    const handleBackMain = () => {
        setUIState(GameUIState.MAIN_MENU);
    }

    useEffect(() => {
        getUserInfo("0x1234567890123456789012345678901234567890");
    }, [getUserInfo]);


    return (
        <div className={cn(
            "absolute inset-0 pointer-events-auto",
            "flex flex-col items-center justify-between p-4",
            "max-w-[360px] mx-auto", // 与游戏最大宽度匹配
        )}>
            {gameState.uiState === GameUIState.CONNECTING && <Connecting setUIState={setUIState} />}
            {gameState.uiState === GameUIState.MINT && <Mint handleMint={handleMint} />}
            {gameState.uiState === GameUIState.MAIN_MENU && <Home handleChat={handleChat} handleFight={handleFight} handleInventory={handleInventory} />}
            {gameState.uiState === GameUIState.INVENTORY && <Inventory  handleInventoryBack={handleBackMain}/>}
            {gameState.uiState === GameUIState.FIGHTING && <Fighting handleBackMain={handleBackMain}/>}
            {gameState.uiState === GameUIState.CHAT && <Chatting handleSubmit={handleChatSubmit} handleBack={handleBackMain} />}
        </div>
    );
} 