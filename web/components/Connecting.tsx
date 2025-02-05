"use client";
import { SuiConnectButton } from "./SuiConnectButton";
import Image from "next/image";
import { useGameStore, GameUIState } from "@/hooks/use-game-store";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect } from "react";

export function Connecting() {
  const { setUIState } = useGameStore();
  const account = useCurrentAccount();
  
  // 使用 useEffect 来监听 account 的变化
  useEffect(() => {
    if (account) {
      connectWallet();
    }
  }, [account]); // 当 account 变化时触发

  const connectWallet = async () => {
    try {
      console.log("Current Account:", account);
      // 这里添加检测NFT的逻辑
      const hasNFT = false; // 测试时默认为false，之后替换为实际的NFT检测逻辑
      
      if (hasNFT) {
        setUIState(GameUIState.MAIN_MENU);
        console.log("Has NFT, redirecting to Main Menu");
      } else {
        setUIState(GameUIState.MINT);
        console.log("No NFT found, redirecting to Mint page");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }
  

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center">
      {/* 背景图片 */}
      <Image
        src="/gameui/login/background_scene.png"
        alt="背景场景"
        width={402}
        height={874}
        priority
        className="object-cover"
      />

      {/* Logo区域 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-full flex justify-center">
        <Image
          src="/gameui/login/logo_robot_icon.png"
          alt="Robobo标志"
          width={280}
          height={140}
          className="object-contain"
        />
      </div>

      {/* bot区域，进一步缩小距离与logo的重叠 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[-30%] w-full flex justify-center">
        <Image
          src="/gameui/login/roobot.png"
          alt="Robobo标志"
          width={423}
          height={423}
          className="object-contain"
        />
      </div>

      {/* 按钮区域 - 固定在底部 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 font-tiny5 text-[20px]">
        <SuiConnectButton/>
      </div>
      
    </div>
  );
}
