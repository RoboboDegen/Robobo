import * as React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BattleRound } from "@/types";
import { useEffect, useState } from "react";




export interface BattleRecordProps {
  record: BattleRound[];
  onFinish: () => void;
}

export function BattleRecords({ record, onFinish }: BattleRecordProps) {
  const [battleRecords, setBattleRecords] = useState<BattleRound[]>([]);

  useEffect(() => {
    // Reset records when new record prop comes in
    setBattleRecords([]);
    
    // Create array to store timeouts
    const timeouts: NodeJS.Timeout[] = [];
    
    // Add records with delay
    record.forEach((round, index) => {
      const timeout = setTimeout(() => {
        setBattleRecords(prev => [...prev, round]);
        
        // Call onFinish when the last record is added
        if (index === record.length - 1) {
          onFinish();
        }
      }, index * 500); // 500ms delay between each record
      
      timeouts.push(timeout);
    });

    // Cleanup function to clear all timeouts
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [record]); // Run effect when record changes

  return (
    <ScrollArea className="h-[120px] rounded-md">
      {/* Set height for ScrollArea */}
      <div className="p-2 w-[300px] ">
        {(
          battleRecords?.map((record, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-cyan-400 text-[16px] mb-2"
            >
              {record.action === 1 && <span className="font-tiny5">{record.attacker_id} 攻击 {record.defender_id} 造成 {record.result} 伤害</span>}
              {record.action === 2 && <span className="font-tiny5">{record.attacker_id} 防御 {record.defender_id} 消耗 {record.result} 能量</span>}
              {record.action === 3 && <span className="font-tiny5">{record.attacker_id} 速度 {record.result} 能量</span>}
              {record.action === 4 && <span className="font-tiny5">{record.attacker_id} 能量 {record.result} 能量</span>}
              {record.action === 5 && <span className="font-tiny5">{record.attacker_id} 能量 {record.result} 能量</span>}
              {record.action === 6 && <span className="font-tiny5">{record.attacker_id} 能量 {record.result} 能量</span>}
            </div>
          ))
        )
      }
      </div>
      <ScrollBar
        orientation="vertical"
        scrollbarTrackImage="/gameui/pk/info_scrollbar_track.png"
        scrollbarThumbImage="/gameui/pk/info_scrollbar_thumb.png"
      />
    </ScrollArea>
  );
}
