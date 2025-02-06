'use client';

import { RobotConfig } from '@/types';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface GameDataContextType {
  trash: number;
  robot: RobotConfig | undefined;
  updateTrash: (value: number) => void;
  getRobot: () => Promise<void>;
}



const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

export function GameDataProvider({ children }: { children: ReactNode }) {
  const [trash, setTrash] = useState(0);
  const [robot, setRobot] = useState<RobotConfig | undefined>();



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



  return (
    <GameDataContext.Provider value={{ 
      trash, 
      robot,
      updateTrash, 
      getRobot
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
