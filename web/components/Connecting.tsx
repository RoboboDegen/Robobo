"use client";
import Image from "next/image";
import { GameUIState } from "@/hooks/use-game-store";
import { RoButton } from "./ro_button";
import { triggerEvent } from "@/lib/utils";

export interface ConnectingProps {
  setUIState: (state: GameUIState) => void;
}

export function Connecting({ setUIState }: ConnectingProps) {
  const handleConnect = () => {
    triggerEvent('SCENE_READY', { sceneName: 'GameTestScene' });
    setUIState(GameUIState.MAIN_MENU);
  }

  return (
    <div className="flex flex-col items-center justify-between h-full">
      {/* Logo区域 */}

      <div className="flex">
        <Image
          src="/gameui/login/logo_robot_icon.png"
          alt="logo_robot_icon"
          width={280}
          height={140}
          className="object-contain"

        />
      </div>

      {/* bot区域，进一步缩小距离与logo的重叠 */}
      <div className="">
        <Image
          src="/gameui/login/roobot.png"
          alt="roobot"
          width={423}
          height={423}
          className="object-contain"
        />
      </div>

      {/* 按钮区域 - 固定在底部 */}
      <div className="">
        {/* <SuiConnectButton/> */}
        <RoButton variant="mint_bottom" onClick={handleConnect} >
          Connect Wallet
        </RoButton>
      </div>
    </div>

  );
}
