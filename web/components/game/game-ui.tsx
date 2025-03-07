'use client';

import { cn, triggerEvent } from "@/lib/utils";
import { Connecting } from "../Connecting";
import { Mint } from "../Mint";
import { Home } from "../Main";
import { Chatting } from "../Chatting";
import { Inventory } from "../Inventory";
import { Fighting } from "../Fighting";
import { TestFighting } from "../TestFighting";
import { GameUIState, useGameStore } from "@/hooks/use-game-store";
import { useGameData } from "@/context/GameDataProvider";
import { mockMirrorConfig,mockRobot } from "@/mock";
import { SceneEventTypes } from "@/game/core/event-types";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useNetworkVariables } from "@/contracts";

export function GameUI() {
    const { gameState, setUIState } = useGameStore();
    const {  userInfo,getBattleRecords,getUserInfo } = useGameData();
    const currentAccount = useCurrentAccount();
    const networkVariables = useNetworkVariables();


    const handleMint = async () => {
        if (!currentAccount) {
            return;
        }
        const userInfoMint = await getUserInfo(currentAccount.address, networkVariables);
        console.log("handleMint", userInfoMint);
        setUIState(GameUIState.MAIN_MENU);
        triggerEvent('SCENE', {
            type: SceneEventTypes.cameraFocusOn,
            robot: userInfoMint?.robot
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
            await getBattleRecords(mockRobot, mockMirrorConfig);
            setUIState(GameUIState.FIGHTING);
            triggerEvent('SCENE', {
                type: SceneEventTypes.cameraBattle,
                enemy: mockMirrorConfig
            });
        }

    }
    const handleTestFight = async () => {
        if (mockRobot) {
            await getBattleRecords(mockRobot, mockMirrorConfig);
            setUIState(GameUIState.TEST_FIGHTING);
            triggerEvent('SCENE', {
                type: SceneEventTypes.cameraBattle,
                enemy: mockMirrorConfig
            });
        }

    }

    const handleBackMint = () => {
        setUIState(GameUIState.MINT);
        triggerEvent('SCENE', {
            type: SceneEventTypes.cameraFocusOn,
        });
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


    return (
        <div className={cn(
            "absolute inset-0 pointer-events-auto",
            "flex flex-col items-center justify-between",
            "max-w-[360px] mx-auto", // 与游戏最大宽度匹配
        )}>
            {gameState.uiState === GameUIState.CONNECTING && <Connecting setUIState={setUIState} />}
            {gameState.uiState === GameUIState.MINT && <Mint handleMint={handleMint} handleTestFight={handleTestFight} />}
            {gameState.uiState === GameUIState.MAIN_MENU && <Home handleChat={handleChat} handleFight={handleFight} handleInventory={handleInventory} />}
            {gameState.uiState === GameUIState.INVENTORY && <Inventory handleInventoryBack={handleBackMain} />}
            {gameState.uiState === GameUIState.FIGHTING && <Fighting handleBackMain={handleBackMain} />}
            {gameState.uiState === GameUIState.CHAT && <Chatting handleBack={handleBackMain} />}
            {gameState.uiState === GameUIState.TEST_FIGHTING && <TestFighting handleBackMint={handleBackMint} />}
        </div>

    );
} 