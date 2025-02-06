import { RoButton } from "./ro_button";
import { useEffect, useState } from "react";
import { AttributeBar } from "./attribute-bar";
import { TrashCounter } from "./trash-counter";
import { useGameData } from "@/context/GameDataProvider";

export interface MintProps {
  handleMint: () => void;
}

interface Attribute {
  name: string;
  value: number | string;
  color: string;
}

export function Mint({ handleMint }: MintProps) {
  const { trash, robot } = useGameData();
  const [attributes, setAttributes] = useState<Attribute[]>([]);



  useEffect(() => {
    console.log(robot)
    const attributes: Attribute[] = [] 
    attributes.push({ name: "Attack", value: robot?.attack || 0, color: "bg-[#ff4444]" })
    attributes.push({ name: "Energy", value: robot?.energy || 0, color: "bg-[#00ffcc]" })
    attributes.push({ name: "Speed", value: robot?.speed || 0, color: "bg-[#ffcc00]" })
    attributes.push({ name: "Personality", value: robot?.personality || 0, color: "bg-[#ff9933]" })
    setAttributes(attributes)
  }, [robot]);



  return (
    <div className="flex flex-col items-center justify-between h-full">

      {/* Main Content Container */}

      {/* Top Trash Counter */}
      <div className="w-full ">
        <TrashCounter value={trash} />
      </div>

      {/* Attribute Bars */}
      <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col gap-2 w-[280px]">
        {attributes?.map((attr) => (
          <AttributeBar
            key={attr.name}
            name={attr.name}
            value={attr.value}
            color={attr.color}
          />
        ))}
      </div>

      {/* Bottom Action Bar */}
      <div className="font-tiny5">
        <RoButton variant="mint_bottom" onClick={handleMint}>
          mint
        </RoButton>
      </div>
      </div>
    </div>
  );
}
