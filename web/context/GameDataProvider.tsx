'use client';

import { RobotConfig ,Message} from '@/types';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface GameDataContextType {
  trash: number;
  robot: RobotConfig | undefined;
  enemy: RobotConfig | undefined;
  messages: Message[]
  updateTrash: (value: number) => void;
  getRobot: () => Promise<void>;
  getMessage: () => Promise<void>;
  addMessage: (message: Message) => void;
  getEnemy: () => Promise<void>;
}

const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

export function GameDataProvider({ children }: { children: ReactNode }) {
  const [trash, setTrash] = useState(0);
  const [robot, setRobot] = useState<RobotConfig | undefined>();
  const [enemy, setEnemy] = useState<RobotConfig | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
 

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

  const getEnemy = useCallback(async () => {
    const enemy: RobotConfig = {
        id: "2",
        name: "Robot 2",
        attack: 20,
        defense: 11,
        speed: 45,
        energy: 60,
        personality: 70,
    }
    setEnemy(enemy);
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
        sender: "user",
        timestamp: new Date(),
      },
      {
        id: 5,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "ai",
        timestamp: new Date(),
      },
      {
        id: 6,
        text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
        sender: "user",
        timestamp: new Date(),
      },
    ];
    setMessages(messages);
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);

  return (
    <GameDataContext.Provider value={{ 
      trash, 
      robot,
      messages,
      enemy,
      updateTrash, 
      getRobot,
      getEnemy,
      getMessage,
      addMessage,
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
