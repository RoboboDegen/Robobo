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
      />
      <span className="absolute inset-0 flex items-center justify-center text-white font-tiny5 text-2xl pr-5">
        Trash: {value}
      </span>
    </div>
  );
} 