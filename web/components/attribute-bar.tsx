'use client';

import Image from 'next/image';

interface AttributeBarProps {
  name: string;
  value: number | string;
  color: string;
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

export function AttributeBar({ name, value, color }: AttributeBarProps) {
  //const hexColor = colorMap[color] || color.match(/#[0-9a-fA-F]{6}/)?.[0] || '#000000';

  return (
    <div className="relative my-4">
      {/* Attribute Name above the bar */}
      <div className="absolute top-[-20px] left-8 w-full flex">
        <span className="text-white font-tiny5 text-sm">
          {name}: {value}
        </span>
      </div>

      <div className="relative w-[280px] h-[24px]">
        <Image
          src="/gameui/mint/attribute_bar_bg.png"
          alt={`${name} Bar Background`}
          width={280}
          height={24}
          className="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-out transform origin-left rounded-full ${color}`}
            style={{
              width: `${value}%`,
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-2xl font-tiny5 text-white">
              {value}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-[-30px] left-0 w-full h-full flex items-center px-3">
        <Image
          src={`/gameui/mint/attribute_${name.toLowerCase()}_icon.png`}
          alt={name}
          width={16}
          height={16}
          className="mr-2"
        />
      </div>
    </div>
  );
} 