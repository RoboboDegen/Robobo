import * as React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BattleRound } from "@/types";
import { useRef } from "react";
import { useEffect } from "react";

export interface BattleRecordProps {
  record: BattleRound[];
  onFinish: () => void;
}

export function BattleRecords({ record }: BattleRecordProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [record]);

  
/*
1: Special Attack
2: Special Recovery 
3: Light Attack
4: Heavy Attack
5: Recovery
6: Desperate Attack
7: Desperate Recovery
*/
  return (
    <ScrollArea className="h-[160px] rounded-md">
      <div className="p-2 w-[300px]">
        {record.map((round, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-cyan-400 text-[16px] mb-2"
          >
            {round.action === 1 && (
              <span className="font-tiny5">
                {round.name} used Special Attack and dealt{" "}
                <span className="text-red-400">{round.result}</span> damage
              </span>
            )}
            {round.action === 2 && (
              <span className="font-tiny5">
                {round.name} used Special Recovery and restored{" "}
                <span className="text-green-400">{round.result}</span> energy
              </span>
            )}

            {round.action === 3 && (
              <span className="font-tiny5">
                {round.name} used Light Attack and dealt{" "}
                <span className="text-red-400">{round.result}</span> damage
              </span>
            )}

            {round.action === 4 && (
              <span className="font-tiny5">
                {round.name} used Heavy Attack and dealt{" "}
                <span className="text-red-400">{round.result}</span> damage
              </span>
            )}
            {round.action === 5 && (
              <span className="font-tiny5">
                {round.name} used Recovery and restored{" "}
                <span className="text-green-400">{round.result}</span> energy
              </span>
            )}

            {round.action === 6 && (
              <span className="font-tiny5">
                {round.name} used Desperate Attack and dealt{" "}
                <span className="text-red-400">{round.result}</span> damage
              </span>
            )}

            {round.action === 7 && (
              <span className="font-tiny5">
                {round.name} used Desperate Recovery and restored{" "}
                <span className="text-green-400">{round.result}</span> energy
              </span>
            )}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <ScrollBar
        orientation="vertical"
        scrollbarTrackImage="/gameui/pk/info_scrollbar_track.png"
        scrollbarThumbImage="/gameui/pk/info_scrollbar_thumb.png"
      />
    </ScrollArea>
  );
}
