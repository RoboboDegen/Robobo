import { RoButton } from "./ro_button";
import  AttributeBars from "./AttributeBars";
import { TrashCounter } from "./trash-counter";
import { useGameData } from "@/context/GameDataProvider";

export interface MintProps {
  handleMint: () => void;
}

export function Mint({ handleMint }: MintProps) {
  const { userInfo } = useGameData();

  return (
    <div className="flex flex-col items-center justify-between h-full w-[340px]">
      {/* Top Trash Counter */}
      <div className="w-full">
        <TrashCounter value={userInfo?.trash || 0} />
      </div>

      {/* Middle and Bottom Content - Grouped Together */}
      <div className="flex flex-col items-center gap-4">
        {/* Attribute Bars */}
        <AttributeBars attack={userInfo?.robot?.attack || 0} energy={userInfo?.robot?.energy || 0} speed={userInfo?.robot?.speed || 0} personality={userInfo?.robot?.personality || 0} />


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
