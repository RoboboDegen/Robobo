"use client";
import { RoButton } from "./ro_button";
import Image from "next/image";

export function Connecting() {
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6">
        <RoButton variant="connect" className="w-full max-w-[366px]">
          Connect Wallet
        </RoButton>
      </div>
    </div>
  );
}
