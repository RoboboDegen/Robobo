"use client";

import { Message, UserInfo, BattleRecord, MirrorConfig, RobotConfig, ChatResponse, ChatHistoryResponse } from "@/types";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import CalculateBattleRecords from "@/mock/battleRecords";
import { NetworkVariables } from "@/contracts";
import { getUserInfo as getUserInfoFromContract } from "@/contracts/query";
import { mockMirrorConfig, mockRobot } from "@/mock";

interface GameDataContextType {
  mockUserInfo: UserInfo | undefined;
  mockBattleRecords: BattleRecord | undefined;
  userInfo: UserInfo | undefined;
  messages: Message[];
  battleRecords: BattleRecord | undefined;
  isBattleLoading: boolean;
  isGenerating: boolean;
  isUserInfoLoading: boolean;
  getMockBattleRecords: () => Promise<void>;
  getUserInfo: (id: string, networkVariables: NetworkVariables) => Promise<UserInfo>;
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUserInfoLoading, setIsUserInfoLoading] = useState(false);
  const [mockUserInfo, setMockUserInfo] = useState<UserInfo | undefined>();
  const [mockBattleRecords, setMockBattleRecords] = useState<BattleRecord>();


  const getMockUserInfo = useCallback(async () => {
    const mockUserInfo = {
      address: "0x1234567890",
      name: "Mock User",
      robot: mockRobot,
    }
    setMockUserInfo(mockUserInfo);
  }, []);

  const getUserInfo = useCallback(async (id: string, networkVariables: NetworkVariables) => {
    setIsUserInfoLoading(true);
    const userInfo = await getUserInfoFromContract(id, networkVariables);
    console.log("getUserInfo", userInfo);
    setUserInfo(userInfo);
    setIsUserInfoLoading(false);
    return userInfo;
  }, []);

  const getMessage = useCallback(async (id: string) => {
    const chatResponse = await fetch(`/api/game/chat/history?robot_uid=${'robot-003'}`);
    const chatData = await chatResponse.json() as ChatHistoryResponse;
    setMessages(chatData.history.flatMap(entry => [
      {
        text: entry.message,
        sender: "user",
        timestamp: new Date(entry.timestamp)
      },
      {
        text: entry.reply,
        sender: "ai", 
        timestamp: new Date(entry.timestamp)
      }
    ]));
  }, []);




  const setMessage = useCallback(async (message: Message) => {
    if (!message.text.trim()) return;

    try {
      setIsGenerating(true);
      
      // Add user message immediately
      setMessages(prev => [...prev, {
        text: message.text,
        sender: "user",
      }]);

      // Send message to API
      const response = await fetch('/api/game/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robot_uid: "robot-003", // Replace with actual robot ID
          message: message.text,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Cannot read response');

      let streamedReply = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6)) as ChatResponse;
              
              if (parsed.error) throw new Error(parsed.error);

              if (parsed.reply) {
                streamedReply += parsed.reply;
                
                // Update AI response in real-time
                setMessages(prev => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage.sender === "ai") {
                    return [...prev.slice(0, -1), {
                      ...lastMessage,
                      text: streamedReply,
                    }];
                  } else {
                    return [...prev, {
                      text: streamedReply,
                      sender: "ai",
                    }];
                  }

                });
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      setMessages(prev => [...prev, {
        text: 'Sorry, an error occurred. Please try again later.',
        sender: "ai",
      }]);
    } finally {
      setIsGenerating(false);
    }

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
      setMockBattleRecords(records);
    } finally {
      setIsBattleLoading(false);
    }
  }, []);


  const getMockBattleRecords = useCallback(async () => {
    try {
      setIsBattleLoading(true);
      const cal_robot = {
        ...mockRobot,
        energy: mockRobot.energy + 128,
        attack: mockRobot.attack + 128,
        defense: mockRobot.defense + 128,
        speed: mockRobot.speed + 128,
        personality: mockRobot.personality + 128,
      }
      const cal_mirror = {
        ...mockMirrorConfig,
        energy: mockMirrorConfig.energy + 128,
        attack: mockMirrorConfig.attack + 128,
        defense: mockMirrorConfig.defense + 128,
        speed: mockMirrorConfig.speed + 128,
        personality: mockMirrorConfig.personality + 128,
      }
      const records = await CalculateBattleRecords({attacker: cal_robot, defender: cal_mirror});
      setMockBattleRecords(records);

    } finally {
      setIsBattleLoading(false);
    }
  }, []);


  return (
    <GameDataContext.Provider
      value={{
        mockUserInfo,
        mockBattleRecords,
        userInfo,
        messages,
        battleRecords,
        isBattleLoading,
        isGenerating,
        isUserInfoLoading,
        getMockBattleRecords,
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