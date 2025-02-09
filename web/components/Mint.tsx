import { RoButton } from "./ro_button";
import { TrashCounter } from "./trash-counter";
import { useGameData } from "@/context/GameDataProvider";

export interface MintProps {
  handleMint: () => void;
}

export function Mint({ handleMint }: MintProps) {
  const { userInfo } = useGameData();

  return (
    <div className="flex flex-col items-center justify-between h-full w-[340px] py-5">
      {/* Top Trash Counter */}
      <div className="w-full">
        <TrashCounter value={userInfo?.trash || 0} />
      </div>

      {/* Middle and Bottom Content - Grouped Together */}
      <div className="flex flex-col justify-center items-center h-full gap-y-10">
        <p className="text-white font-tiny5 text-6xl uppercase tracking-widest">
          Mint Your <span className="text-[#00ffcc]">ROBOBO</span> right now!!!
        </p>
        {/* Bottom Action Bar */}
        <RoButton variant="mint_bottom" onClick={handleMint}>
          M I N T
        </RoButton>
      </div>
    </div>
  );
}
