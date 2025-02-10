'use client';

import { cn, triggerEvent } from "@/lib/utils";
import { Connecting } from "../Connecting";
import { Mint } from "../Mint";
import { Home } from "../Main";
import { Chatting } from "../Chatting";
import { Inventory } from "../Inventory";
import { Fighting } from "../Fighting";
import { GameUIState, useGameStore } from "@/hooks/use-game-store";
import { useEffect } from "react";
import { useGameData } from "@/context/GameDataProvider";
import { mockMirrorConfig } from "@/mock";
import { SceneEventTypes } from "@/game/core/event-types";
import { useCurrentAccount } from "@mysten/dapp-kit";



export function GameUI() {
    const { gameState, setUIState } = useGameStore();
    const {  getUserInfo,userInfo,getBattleRecords } = useGameData();
    const currentAccount = useCurrentAccount();



    const handleMint = () => {
        if (!currentAccount) {
            return;
        }
        getUserInfo(currentAccount.address);
        setUIState(GameUIState.MAIN_MENU);
        triggerEvent('SCENE', {
            type: SceneEventTypes.cameraFocusOn,
            robot: userInfo?.robot
        });        
    }

    const handleChat = () => {
        setUIState(GameUIState.CHAT);
        triggerEvent('SCENE', {
            type: SceneEventTypes.cameraChat,
        });
    }

    const handleFight = async () => {
        if (userInfo?.robot) {
            await getBattleRecords(userInfo.robot, mockMirrorConfig);
            setUIState(GameUIState.FIGHTING);
            triggerEvent('SCENE', {
                type: SceneEventTypes.cameraBattle,
                enemy: mockMirrorConfig
            });
        }

    }



    const handleInventory = () => {
        setUIState(GameUIState.INVENTORY);
        triggerEvent('SCENE', {
            type: SceneEventTypes.cameraInventory,
        });
    }
    const handleBackMain = () => {
        setUIState(GameUIState.MAIN_MENU);
        triggerEvent('SCENE', {
            type: SceneEventTypes.cameraFocusOn,
        });
    }



    useEffect(() => {
        getUserInfo("0x1234567890123456789012345678901234567890");
    }, [getUserInfo]);


    return (
        <div className={cn(
            "absolute inset-0 pointer-events-auto",
            "flex flex-col items-center justify-between",
            "max-w-[360px] mx-auto", // 与游戏最大宽度匹配
        )}>
            {gameState.uiState === GameUIState.CONNECTING && <Connecting setUIState={setUIState} />}
            {gameState.uiState === GameUIState.MINT && <Mint handleMint={handleMint} />}
            {gameState.uiState === GameUIState.MAIN_MENU && <Home handleChat={handleChat} handleFight={handleFight} handleInventory={handleInventory} />}
            {gameState.uiState === GameUIState.INVENTORY && <Inventory handleInventoryBack={handleBackMain} />}
            {gameState.uiState === GameUIState.FIGHTING && <Fighting handleBackMain={handleBackMain} />}
            {gameState.uiState === GameUIState.CHAT && <Chatting handleBack={handleBackMain} />}
        </div>

    );
} 