'use client'
import { Connecting } from "../components/Connecting"
import { GameView } from '@/components/game/phaser-game-view'
import { GameUI } from '@/components/game/game-ui'
import { ResponsiveContainer } from '@/components/game/responsive-container'
import { LoadingScreen } from '@/components/loading-screen';

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      {/* test */}
      <Connecting />
      
      <ResponsiveContainer>
        <GameView />
        <GameUI />
        <LoadingScreen />
      </ResponsiveContainer>
    </div>
  );
} 