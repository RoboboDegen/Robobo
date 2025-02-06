"use client";
import Image from "next/image";
import { GameUIState } from "@/hooks/use-game-store";
import { RoButton } from "./ro_button";

export interface ConnectingProps {
  setUIState: (state: GameUIState) => void;
}


export function Connecting({ setUIState }: ConnectingProps) {
  return (
    <div className="flex flex-col items-center justify-between h-full">
      {/* Logo区域 */}
      <div className="">
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
        <RoButton variant="home_bottom" onClick={() => setUIState(GameUIState.MINT)}>
          Connect Wallet
        </RoButton>
      </div>
    </div>
  );
}
