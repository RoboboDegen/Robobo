import * as React from "react"
import Image from "next/image"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function BattleRecords() {
  const records = Array(20).fill("battle record 1234567890")

  return (
    <ScrollArea className="h-[200px] overflow-auto rounded-md"> {/* Set height for ScrollArea */}
      <div className="p-2">
        {records.map((record, index) => (
          <div key={index} className="flex items-center gap-2 text-cyan-400 text-[16px] mb-2">
            <Image
              src="/gameui/pk/info_attack_icon.png"
              alt="Attack Icon"
              width={14}
              height={14} 
            />
            <span className="font-tiny5">{record}</span>
          </div>
        ))}
      </div>

      <ScrollBar 
        orientation="vertical" 
        scrollbarTrackImage="/gameui/pk/info_scrollbar_track.png" 
        scrollbarThumbImage="/gameui/pk/info_scrollbar_thumb.png" 
      />
    </ScrollArea>
  )
}
