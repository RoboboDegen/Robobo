import { create } from 'zustand';

interface GameState {
  uiState: GameUIState;
}


export enum GameUIState {
  LOADING,
  CONNECTING,
  MINT,
  MAIN_MENU,
  INVENTORY,
  FIGHTING,
  CHAT
}

interface GameStore {
  // 游戏实例
  gameInstance: Phaser.Game | null;
  setGameInstance: (game: Phaser.Game | null) => void;
  
  // 游戏状态
  gameState: GameState;
  setUIState: (uiState: GameUIState) => void;
  
  // 重置游戏状态
  resetGameState: () => void;
}

const initialGameState: GameState = {
  uiState: GameUIState.MAIN_MENU,
};

export const useGameStore = create<GameStore>((set) => ({
  gameInstance: null,
  setGameInstance: (game) => set({ gameInstance: game }),
  
  gameState: initialGameState,
  setUIState: (uiState) => {
    set((state) => ({
    gameState: { ...state.gameState, uiState }
  }));
},
  resetGameState: () => set(() => ({
    gameState: initialGameState
  })),
}));
