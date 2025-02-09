'use client';

import Image from 'next/image';

interface TrashCounterProps {
  value: number;
}

export function TrashCounter({ value }: TrashCounterProps) {
  return (
    <div className="relative">
      <Image 
        src="/gameui/mint/top_value_display.png"
        alt="Trash Counter Background" 
        width={210} 
        height={60} 
        className="object-contain w-auto h-auto max-w-xs"
      />
      <span className="absolute inset-0 items-center justify-center text-white font-tiny5 text-2xl pt-3 pl-16">
        Trash: {value}
      </span>
    </div>
  );
} 