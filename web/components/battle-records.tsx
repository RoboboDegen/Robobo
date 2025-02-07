import * as React from "react";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useGameData } from "@/context/GameDataProvider";

export function BattleRecords() {
  const { battleRecords} = useGameData();

  return (
    <ScrollArea className="h-[200px] overflow-auto rounded-md">
      {/* Set height for ScrollArea */}
      <div className="p-2">
        {Array.isArray(battleRecords) && battleRecords.length > 0 ? (
          battleRecords.map((record, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-cyan-400 text-[16px] mb-2"
            >
              <Image
                src="/gameui/pk/info_attack_icon.png"
                alt="Attack Icon"
                width={14}
                height={14}
              />
              <span className="font-tiny5">{record}</span>
            </div>
          ))
        ) : (
          <div>null</div> 
        )}

      </div>
      <ScrollBar
        orientation="vertical"
        scrollbarTrackImage="/gameui/pk/info_scrollbar_track.png"
        scrollbarThumbImage="/gameui/pk/info_scrollbar_thumb.png"
      />
    </ScrollArea>
  );
}
