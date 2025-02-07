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
  const { userInfo } = useGameData();
  const [attributes, setAttributes] = useState<Attribute[]>([]);




  useEffect(() => {
    console.log(userInfo)
    const attributes: Attribute[] = [] 
    attributes.push({ name: "Attack", value: userInfo?.robot?.attack || 0, color: "bg-[#ff4444]" })
    attributes.push({ name: "Energy", value: userInfo?.robot?.energy || 0, color: "bg-[#00ffcc]" })

    attributes.push({ name: "Speed", value: userInfo?.robot?.speed || 0, color: "bg-[#ffcc00]" })
    attributes.push({ name: "Personality", value: userInfo?.robot?.personality || 0, color: "bg-[#ff9933]" })
    setAttributes(attributes)

  }, [userInfo]);



  return (
    <div className="flex flex-col items-center justify-between h-full w-[340px]">

      {/* Main Content Container */}

      {/* Top Trash Counter */}
      <div className="w-full">
        <TrashCounter value={userInfo?.trash || 0} />
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
