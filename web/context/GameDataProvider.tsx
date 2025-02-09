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
  isBattleLoading: boolean;
  getUserInfo: (id: string) => Promise<void>;
  getMessage: (id: string) => Promise<void>;
  setMessage: (message: Message) => Promise<void>;
  getBattleRecords: (robot: RobotConfig, mirror: MirrorConfig) => Promise<void>;
}



const GameDataContext = createContext<GameDataContextType | undefined>(
  undefined
);

export function GameDataProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>();
  const [battleRecords, setBattleRecords] = useState<BattleRecord>();
  const [isBattleLoading, setIsBattleLoading] = useState(false);

  const getUserInfo = useCallback(async (id: string) => {
    setUserInfo(mockUserInfo);
  }, []);

  const getMessage = useCallback(async (id: string) => {
    setMessages(mockMessages);
  }, []);

  const setMessage = useCallback(async (message: Message) => {
    setMessages(prevMessages => {
      const newMessages = [...prevMessages, message];
      
      const aiResponse: Message = {
        text: `This is a response to: ${message.text}`,
        sender: "ai",
      };
      
      return [...newMessages, aiResponse];
    });
  }, []);


  const getBattleRecords = useCallback(async (robot: RobotConfig, mirror: MirrorConfig) => {
    try {
      setIsBattleLoading(true);
      const cal_robot = {
        ...robot,
        energy: robot.energy + 128,
        attack: robot.attack + 128,
        defense: robot.defense + 128,
        speed: robot.speed + 128,
        personality: robot.personality + 128,
      }
      const cal_mirror = {
        ...mirror,
        energy: mirror.energy + 128,
        attack: mirror.attack + 128,
        defense: mirror.defense + 128,
        speed: mirror.speed + 128,
        personality: mirror.personality + 128,
      }
      const records = await CalculateBattleRecords({attacker: cal_robot, defender: cal_mirror});
      setBattleRecords(records);


    } finally {
      setIsBattleLoading(false);
    }
  }, []);


  return (
    <GameDataContext.Provider
      value={{
        userInfo,
        messages,
        battleRecords,
        isBattleLoading,
        getUserInfo,
        getMessage,
        setMessage,
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