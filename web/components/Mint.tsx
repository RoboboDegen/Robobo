import { useBetterSignAndExecuteTransactionWithSponsor } from "@/hooks/useBetterTx";
import { RoButton } from "./ro_button";
import { TrashCounter } from "./trash-counter";
import { useGameData } from "@/context/GameDataProvider";
import { create_passport } from "@/contracts/game";
import { network } from "@/contracts";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useToast } from "@/hooks/use-toast";

export interface MintProps {
  handleMint: () => void;
}

export function Mint({ handleMint }: MintProps) {
  const { userInfo } = useGameData();
  const { handleSignAndExecuteTransactionWithSponsor, isLoading: isMintingRobotWithSponsor } = useBetterSignAndExecuteTransactionWithSponsor({
    tx: create_passport
  })
  const currentAccount = useCurrentAccount();
  const {toast} = useToast();

  const handleMintRobot = async () => {
    await handleSignAndExecuteTransactionWithSponsor(
      network,
      currentAccount?.address??'',
      [currentAccount?.address??'',],
      {
        name: "ROBOBO",
      }
    ).onSuccess(async ()=>{
      toast({
        title: "Minted ROBOBO",
        description: "Congratulations! You have successfully minted your ROBOBO.",
      });
      handleMint();
    }).execute();
  };

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
        <RoButton variant="mint_bottom" onClick={handleMintRobot} disabled={isMintingRobotWithSponsor}>
          {isMintingRobotWithSponsor ? "Minting..." : "M I N T"}
        </RoButton>
      </div>
    </div>
  );
}
