'use client'

import { GameView } from '@/components/game/phaser-game-view'
import { GameUI } from '@/components/game/game-ui'
import { ResponsiveContainer } from '@/components/game/responsive-container'
import { GameUIState, useGameStore } from '@/hooks/use-game-store';
import DebugPanel from '@/components/debug-panel';



export default function Home() {
  const { gameState } = useGameStore();

  return (
    <div className="w-full flex items-center justify-center">
      <ResponsiveContainer>
        <GameView />
        {gameState.uiState !== GameUIState.LOADING && <GameUI />}
      </ResponsiveContainer>
      <div className='absolute bottom-50 right-10 bg-black/50 rounded-t-lg p-2'>
        <DebugPanel />
      </div>
    </div>


  );
} 