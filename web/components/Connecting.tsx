"use client";
import Image from "next/image";
import { GameUIState } from "@/hooks/use-game-store";
import { RoButton } from "./ro_button";
import { triggerEvent } from "@/lib/utils";
import { SceneEventTypes } from "@/game/core/event-types";
import { ConnectModal, useCurrentWallet, useCurrentAccount } from "@mysten/dapp-kit";
import { useCallback, useEffect, useState } from "react";
import { useNetworkVariables } from "@/contracts";
import { useGameData } from "@/context/GameDataProvider"; 

export interface ConnectingProps {
  setUIState: (state: GameUIState) => void;
}

export function Connecting({ setUIState }: ConnectingProps) {
  const [open, setOpen] = useState(false)
  const { connectionStatus } = useCurrentWallet()
  const currentAccount = useCurrentAccount();
  const networkVariables = useNetworkVariables();
  const { getUserInfo } = useGameData();

  const handleConnected = useCallback(async () =>  {
    if (currentAccount) {
      const userInfoResult = await getUserInfo(currentAccount.address, networkVariables);
      
      if(!userInfoResult?.robot){
        triggerEvent('SCENE_READY', { sceneName: 'GameTestScene' });
        triggerEvent('SCENE', {
          type: SceneEventTypes.cameraFocusOn,
        });
        setUIState(GameUIState.MINT);
      } else {
        triggerEvent('SCENE_READY', { sceneName: 'GameTestScene' });
        triggerEvent('SCENE', {
          type: SceneEventTypes.cameraFocusOn,
        });
        triggerEvent('SCENE', {
          type: SceneEventTypes.cameraFocusOn,
          robot: userInfoResult?.robot
        });  
        setUIState(GameUIState.MAIN_MENU);
      }
    }
  }, [currentAccount, getUserInfo, networkVariables, setUIState]);

  useEffect(() => {
    if (connectionStatus === "connected") {
      handleConnected()
    }
  }, [connectionStatus, handleConnected])

  return (
    <div className="flex flex-col items-center justify-between h-full py-5">
      {/* Logo区域 */}
      <Image
        src="/gameui/login/logo_robot_icon.png"
        alt="logo_robot_icon"
        width={280}
        height={140}
        className="object-contain max-w-xs w-auto h-auto"
        priority
      />
      {/* bot区域，进一步缩小距离与logo的重叠 */}

      <Image
        src="/gameui/login/roobot.png"
        alt="roobot"
        width={423}
        height={423}
        className="object-contain"
        priority
      />

      {/* 按钮区域 - 固定在底部 */}

      <div className="">
        {/* <SuiConnectButton/> */}
        <ConnectModal
          open={open}
          onOpenChange={setOpen}
          trigger={
            <RoButton variant="mint_bottom">
              Connect Wallet
            </RoButton>
          }

        />
      </div>
    </div>

  );
}
