'use client';

import Image from 'next/image';

interface AttributeBarProps {
  name: string;
  value: number | string;
  color: string;
  width?: number; // 添加 width 属性
  height?: number; // 添加 height 属性
}

// const colorMap: Record<string, string> = {
//   'bg-[#ff4444]': '#ff4444',
//   'bg-[#00ffcc]': '#00ffcc',
//   'bg-[#ffcc00]': '#ffcc00',
//   'bg-[#ff9933]': '#ff9933',
//   'bg-red-500': '#ef4444',
//   'bg-cyan-400': '#22d3ee',
//   'bg-yellow-400': '#facc15',
//   'bg-orange-400': '#fb923c',
// };

export function AttributeBar({
  name,
  value,
  color,
  width = 280,
  height = 24,
}: AttributeBarProps) {
  // 计算图标尺寸，设置为高度的0.9倍
  const iconSize = Math.round(height * 0.9);
  // 增加偏移系数从0.8到1.2，使图标位置更靠上
  const iconOffset = Math.round(height * 1.2);


  return (
    <div className="relative my-4" style={{ width }}>
      {/* Attribute Name above the bar */}
      <div className="absolute top-[-18px] left-7 w-full flex">
        <span className="text-white font-tiny5 text-[14px]">
          {name}: {value}
        </span>
      </div>

      <div className="relative" style={{ width, height }}>
        <Image
          src="/gameui/mint/attribute_bar_bg.png"
          alt={`${name} Bar Background`}
          width={width}
          height={height}
          className="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-out transform origin-left rounded-full ${color}`}
            style={{
              width: `${value}%`,
              height,
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-sm font-tiny5 text-white">
              {value}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-0 w-full h-full flex items-center px-1" 
           style={{ top: `-${iconOffset}px` }}>
        <Image
          src={`/gameui/mint/attribute_${name.toLowerCase()}_icon.png`}
          alt={name}
          width={iconSize}
          height={iconSize}
          className="mr-2"
        />
      </div>
    </div>
  );
}
