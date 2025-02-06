'use client'

import { GameView } from '@/components/game/phaser-game-view'
import { GameUI } from '@/components/game/game-ui'
import { ResponsiveContainer } from '@/components/game/responsive-container'
import { GameUIState, useGameStore } from '@/hooks/use-game-store';



export default function Home() {
  const { gameState } = useGameStore();

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <ResponsiveContainer>
        <GameView />
        {gameState.uiState === GameUIState.CONNECTING && <GameUI />}
      </ResponsiveContainer>
    </div>
  );
} 