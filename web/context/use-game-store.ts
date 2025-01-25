import { create } from 'zustand';

interface GameState {
  score: number;
  isPaused: boolean;
  isGameOver: boolean;
}

interface GameStore {
  // 游戏实例
  gameInstance: Phaser.Game | null;
  setGameInstance: (game: Phaser.Game | null) => void;
  
  // 游戏状态
  gameState: GameState;
  setScore: (score: number) => void;
  setPaused: (isPaused: boolean) => void;
  setGameOver: (isGameOver: boolean) => void;
  
  // 重置游戏状态
  resetGameState: () => void;
}

const initialGameState: GameState = {
  score: 0,
  isPaused: false,
  isGameOver: false,
};

export const useGameStore = create<GameStore>((set) => ({
  gameInstance: null,
  setGameInstance: (game) => set({ gameInstance: game }),
  
  gameState: initialGameState,
  setScore: (score) => set((state) => ({
    gameState: { ...state.gameState, score }
  })),
  setPaused: (isPaused) => set((state) => ({
    gameState: { ...state.gameState, isPaused }
  })),
  setGameOver: (isGameOver) => set((state) => ({
    gameState: { ...state.gameState, isGameOver }
  })),
  
  resetGameState: () => set(() => ({
    gameState: initialGameState
  })),
}));
