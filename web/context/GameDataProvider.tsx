'use client';

import { RobotConfig ,Message} from '@/types';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface GameDataContextType {
  trash: number;
  robot: RobotConfig | undefined;
  messages: Message[];
  leftHealth: number;
  rightHealth: number;
  maxHealth: number;
  updateTrash: (value: number) => void;
  getRobot: () => Promise<void>;
  getMessage: () => Promise<void>;
  addMessage: (message: Message) => void;
  updateHealth: (left: number, right: number) => void;
}

const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

export function GameDataProvider({ children }: { children: ReactNode }) {
  const [trash, setTrash] = useState(0);
  const [robot, setRobot] = useState<RobotConfig | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [leftHealth, setLeftHealth] = useState(40);
  const [rightHealth, setRightHealth] = useState(60);
  const maxHealth = 100;

  const updateTrash = (value: number) => setTrash(value);

  const getRobot = useCallback(async() => {
    const robot: RobotConfig = {
        id: "1",
        name: "Robot 1",
        attack: 20,
        defense: 11,
        speed: 45,
        energy: 60,
        personality: 70,
    }
    setRobot(robot);
  }, []);

  const getMessage = useCallback(async () => {
    const messages: Message[] = [
      {
        id: 1,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "user",
        timestamp: new Date(),
      },
      {
        id: 2,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "user",
        timestamp: new Date(),
      },
      {
        id: 3,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "ai",
        timestamp: new Date(),
      },
      {
        id: 4,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "ai",
        timestamp: new Date(),
      },
    ];
    setMessages(messages);
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);

  const updateHealth = useCallback((left: number, right: number) => {
    setLeftHealth(left);
    setRightHealth(right);
  }, []);

  return (
    <GameDataContext.Provider value={{ 
      trash, 
      robot,
      messages,
      leftHealth,
      rightHealth,
      maxHealth,
      updateTrash, 
      getRobot,
      getMessage,
      addMessage,
      updateHealth
    }}>
      {children}
    </GameDataContext.Provider>
  );
}

export function useGameData() {
  const context = useContext(GameDataContext);
  if (context === undefined) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  return context;
}
