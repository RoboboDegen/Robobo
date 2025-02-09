"use client";
import Image from "next/image";
import { GameUIState } from "@/hooks/use-game-store";
import { RoButton } from "./ro_button";
import { triggerEvent } from "@/lib/utils";
import { SceneEventTypes } from "@/game/core/event-types";
import { ConnectModal, useCurrentWallet } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";


export interface ConnectingProps {
  setUIState: (state: GameUIState) => void;
}

export function Connecting({ setUIState }: ConnectingProps) {
  const [open, setOpen] = useState(false)
  const { connectionStatus } = useCurrentWallet()



  const handleConnected = () => {
    triggerEvent('SCENE_READY', { sceneName: 'GameTestScene' });
    triggerEvent('SCENE', {
      type: SceneEventTypes.cameraFocusOn,
    });
    setUIState(GameUIState.MINT);
  }

  useEffect(() => {
    if (connectionStatus === "connected") {
      handleConnected()
    }
  }, [connectionStatus])
  // const onConnected = useCallback(async () => {
  //   if (currentAccount?.address && connectionStatus === "connected") { 
  //     const address = currentAccount.address
  //   }
  //   if (connectionStatus === "disconnected") {
  //   }
  // }, [currentAccount?.address, connectionStatus, networkVariables])

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
