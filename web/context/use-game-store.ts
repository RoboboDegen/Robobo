import { create } from 'zustand';

interface GameStore {
  gameInstance: Phaser.Game | null;
  setGameInstance: (game: Phaser.Game) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameInstance: null,
  setGameInstance: (game) => set({ gameInstance: game }),
}));
