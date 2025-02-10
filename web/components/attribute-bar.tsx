'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface AttributeBarProps {
  name: string;
  value: number; // 输入值
  color: string;
  width?: number; // 添加 width 属性
  height?: number; // 添加 height 属性

}

const maxValues: { [key: string]: number } = {
  Energy: 60,
  Attack: 25,
  Defense: 25,
  Speed: 10,
  Personality: 100,
};

export function AttributeBar({
  name,
  value,
  color,
  width = 280,
  height = 24,
}: AttributeBarProps) {
  // 将值转换为数字并减去128，计算真实值
  const [maxValue, setMaxValue] = useState(maxValues[name] || 1);

  useEffect(() => {
    setMaxValue(maxValues[name] || 1);
  }, [name]);

  // 计算图标尺寸，设置为高度的0.9倍
  const iconSize = Math.round(height * 0.9);
  // 增加偏移系数从0.8到1.2，使图标位置更靠上
  const iconOffset = Math.round(height * 1.2);


  return (
    <div className={`relative my-5 w-${width}`}>
      {/* Attribute Name above the bar */}
      <div className="absolute top-[-18px] left-7 w-full flex " >
        <span className="text-white font-tiny5 text-[14px]">
          {name}: {value} {/* 显示真实值 */}
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
              width: `${value / maxValue * 100}%`, // 设置为百分比
              height,  
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-2 w-4 h-4 rounded-full flex items-center justify-center text-lg font-bold font-tiny5 text-white">
              {Math.round(value / maxValue * 100)+'%'} {/* 显示百分比 */}
            </div>
          </div>


        </div>

      </div>

      <div className="absolute left-0 w-full h-full flex items-center px-1" 
           style={{ top: `-${iconOffset}px` }}>
        <Image
          src={`/gameui/mint/attribute_${name.toLowerCase()}_icon.png`}
          alt={name}
          width={24}    // 设置一个固定的基准尺寸
          height={24}   // 确保width和height比例正确
          style={{      // 使用style动态设置实际尺寸
            width: iconSize,
            height: iconSize
          }}
        />
      </div>
    </div>
  );
}
