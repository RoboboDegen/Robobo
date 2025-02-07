'use client';

import { Message, UserInfo, MirrorConfig } from '@/types';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { mockUserInfo, mockMirrorConfig, mockMessages } from '@/mock';


interface GameDataContextType {
  userInfo: UserInfo | undefined;
  messages: Message[]
  enemy: MirrorConfig | undefined;
  getEnemyFromMirrorPool: (id: string) => Promise<void>;
  getUserInfo: (id: string) => Promise<void>;
  getMessage: (id: string) => Promise<void>;
}


const GameDataContext = createContext<GameDataContextType | undefined>(undefined);

export function GameDataProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>();
  const [enemy, setEnemy] = useState<MirrorConfig | undefined>();


  const getEnemyFromMirrorPool = useCallback(async (id: string) => {
    setEnemy(mockMirrorConfig);
  }, []);


  const getUserInfo = useCallback(async (id: string) => {
    setUserInfo(mockUserInfo);
  }, []);

  const getBattleRecords = useCallback(async (id: string) => {

  }, []);

  const getMessage = useCallback(async (id: string) => {
    setMessages(mockMessages);
  }, []);



  return (
    <GameDataContext.Provider value={{
      userInfo,
      messages,
      enemy,
      getEnemyFromMirrorPool,
      getUserInfo,
      getMessage,
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