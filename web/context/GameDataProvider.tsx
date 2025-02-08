"use client";

import { Message, UserInfo, BattleRecord, MirrorConfig, RobotConfig } from "@/types";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { mockUserInfo, mockMessages} from "@/mock";
import CalculateBattleRecords from "@/mock/battleRecords";


interface GameDataContextType {
  userInfo: UserInfo | undefined;
  messages: Message[];
  battleRecords: BattleRecord | undefined;
  getUserInfo: (id: string) => Promise<void>;
  getMessage: (id: string) => Promise<void>;
  getBattleRecords: (robot: RobotConfig, mirror: MirrorConfig) => Promise<void>;
}


const GameDataContext = createContext<GameDataContextType | undefined>(
  undefined
);

export function GameDataProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>();
  const [battleRecords, setBattleRecords] = useState<BattleRecord>();

  const getUserInfo = useCallback(async (id: string) => {
    setUserInfo(mockUserInfo);
  }, []);

  const getMessage = useCallback(async (id: string) => {
    setMessages(mockMessages);
  }, []);

  const getBattleRecords = useCallback(async (robot: RobotConfig, mirror: MirrorConfig) => {
    setBattleRecords(await CalculateBattleRecords({attacker:robot,defender:mirror}));
  }, []);
  





  return (
    <GameDataContext.Provider
      value={{
        userInfo,
        messages,
        battleRecords,
        getUserInfo,
        getMessage,
        getBattleRecords,
      }}


    >
      {children}
    </GameDataContext.Provider>
  );
}
export function useGameData() {
  const context = useContext(GameDataContext);
  if (context === undefined) {
    throw new Error("useGameData must be used within a GameDataProvider");
  }
  return context;
} 