import { useState } from "react";
import Image from "next/image";

interface HealthBarProps {
  value: number;
  maxValue: number;
}

export function HealthBar({ value, maxValue }: HealthBarProps) {
  // 根据血量比例进行转换，血量最大时血条满，最小时血条为空
  const adjustedValue = Math.max(value - 128, 0); // 将128视为0
  const percentage = (adjustedValue / (maxValue - 128)) * 100; // 计算血量的百分比

  return (
    <div className="relative w-32 h-4 -ml-4">
      <Image
        src="/gameui/pk/pk_health_bar_bg.png"
        alt="Health Bar Background"
        className="absolute inset-0 w-full h-full"
        width={100}
        height={20}
      />
      <Image
        src="/gameui/pk/pk_health_bar_fill.png"
        alt="Health Bar Fill"
        className="absolute inset-0 h-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
        width={100}
        height={20}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[18px] text-white font-pixel font-tiny5">{adjustedValue}</span>
    </div>
  );
}

