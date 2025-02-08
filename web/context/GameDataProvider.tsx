"use client";

import { Message, UserInfo, MirrorConfig } from "@/types";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { mockUserInfo, mockMirrorConfig, mockMessages } from "@/mock";

interface GameDataContextType {
  userInfo: UserInfo | undefined;
  messages: Message[];
  enemy: MirrorConfig | undefined;
  battleRecords: string[];
  getEnemyFromMirrorPool: (id: string) => Promise<void>;
  getUserInfo: (id: string) => Promise<void>;
  getMessage: (id: string) => Promise<void>;
  setBattleRecords: (logs: string[]) => void;
  updateRobotEnergies: (attackerEnergy: number, defenderEnergy: number) => void;
}

const GameDataContext = createContext<GameDataContextType | undefined>(
  undefined
);

export function GameDataProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>();
  const [enemy, setEnemy] = useState<MirrorConfig | undefined>();
  const [battleRecords, setBattleRecords] = useState<string[]>([]);

  const getEnemyFromMirrorPool = useCallback(async (id: string) => {
    setEnemy(mockMirrorConfig);
  }, []);

  const getUserInfo = useCallback(async (id: string) => {
    setUserInfo(mockUserInfo);
  }, []);

  const getMessage = useCallback(async (id: string) => {
    setMessages(mockMessages);
  }, []);

  const updateRobotEnergies = useCallback((attackerEnergy: number, defenderEnergy: number) => {
    setUserInfo(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        robot: {
          ...prev.robot,
          energy: attackerEnergy
        }
      };
    });

    setEnemy(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        energy: defenderEnergy
      };
    });
  }, []);

  return (
    <GameDataContext.Provider
      value={{
        userInfo,
        messages,
        enemy,
        battleRecords,
        getEnemyFromMirrorPool,
        getUserInfo,
        getMessage,
        setBattleRecords,
        updateRobotEnergies,
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