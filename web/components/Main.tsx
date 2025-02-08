"use client"

import { RoButton } from "./ro_button"
import { TrashCounter } from "./trash-counter";
import { useGameData } from "@/context/GameDataProvider";
import AttributeBars from "./AttributeBars";

export interface MainProps {
  handleInventory: () => void;
  handleChat: () => void;
  handleFight: () => void;
}

export function Home({ handleInventory, handleChat, handleFight }: MainProps) {
  const { userInfo } = useGameData();

  return (
    <div className="flex flex-col items-center justify-between h-full w-full py-5">
      {/* Top Trash Counter */}
      <div className="w-full">
        <TrashCounter value={userInfo?.trash || 0} />


      </div>

      {/* Middle and Bottom Content - Grouped Together */}
      <div className="flex flex-col items-center gap-4">
        {/* Attribute Bars */}
        <AttributeBars attack={userInfo?.robot?.attack || 0} energy={userInfo?.robot?.energy || 0} speed={userInfo?.robot?.speed || 0} personality={userInfo?.robot?.personality || 0} />
        

        {/* Bottom Buttons */}
        <div className="flex">
          <RoButton variant="inventory" onClick={handleInventory}>
            Inventory
          </RoButton>

          <RoButton variant="fight" onClick={handleFight}>
            Fight
          </RoButton>
          <RoButton variant="chat" onClick={handleChat}>
            Chat
          </RoButton>
        </div>
      </div>
    </div>
  );
}

