import { AttributeBar } from "./attribute-bar"
import { HealthBar } from "./health-bar"
import { BattleRecords } from "./battle-records"
import { useState } from "react"
import { useGameData } from "@/context/GameDataProvider";

interface Attribute {
    name: string;
    value: number | string;
    color: string;
  }



export function Fighting() {
    const { robot, leftHealth, rightHealth, maxHealth } = useGameData();
    const [leftAttributes, setLeftAttributes] = useState<Attribute[]>([
    { name: "Attack",value: robot?.attack || 0, color: "bg-red-500" },
    { name: "Energy", value: robot?.energy || 0, color: "bg-cyan-400" },
    { name: "Speed", value: robot?.speed || 0, color: "bg-yellow-400" },
    { name: "Personality", value: robot?.personality || 0, color: "bg-orange-400" }
  ]);

  const [rightAttributes, setRightAttributes] = useState<Attribute[]>([
    { name: "Attack", value: robot?.attack || 0, color: "bg-red-500" },
    { name: "Energy", value: robot?.energy || 0, color: "bg-cyan-400" },
    { name: "Speed", value: robot?.speed || 0, color: "bg-yellow-400" },
    { name: "Personality", value: robot?.personality || 0, color: "bg-orange-400" }
  ]);

  return (
    <div className="flex flex-col items-start justify-between h-full pr-5">
      <div className="w-[280px] flex flex-col gap-4 pl-2">
        {/* Health Bars */}
        <div className="flex justify-between items-center">
          <div className="w-20">
            <HealthBar value={leftHealth} maxValue={maxHealth} />
          </div>
          <img
            src="/gameui/pk/pk_label.png"
            alt="VS"
            className="w-16 h-16"
          />
          <div className="w-20">
            <HealthBar value={rightHealth} maxValue={maxHealth} />
          </div>
        </div>

        {/* Battle Arena */}
        <div className="relative aspect-video bg-[#2a2a4e] rounded-lg border border-gray-700">
          {/* Add your robot sprites here */}
        </div>

        {/* Stats - Made smaller */}
        <div className="flex justify-start gap-20">
          <div className="w-16 scale-90 origin-left">
            {leftAttributes.map((attr) => (
              <AttributeBar
                key={attr.name}
                name={attr.name}
                value={attr.value}
                color={attr.color}
                width={150}
                height={15}
              />
            ))}
          </div>
          <div className="w-16 scale-90 origin-right">
            {rightAttributes.map((attr) => (
              <AttributeBar
                key={attr.name}
                name={attr.name}
                value={attr.value}
                color={attr.color}
                width={150}
                height={15}
              />
            ))}
          </div>
        </div>

        {/* Battle Records */}
        <div>
          <BattleRecords />
        </div>
      </div>
    </div>
  )
}

