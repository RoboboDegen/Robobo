'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/context/use-game-store';

function PhaserGameContent() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { setGameInstance } = useGameStore();

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const initGame = async () => {
      const [{ default: Phaser }, { gameConfig }] = await Promise.all([
        import('phaser'),
        import('@/game/config'),
      ]);

      const config = {
        ...gameConfig,
        parent: gameContainerRef.current,
        scale: {
          ...gameConfig.scale,
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      };

      const game = new Phaser.Game(config);
      setGameInstance(game);

      return () => {
        game.destroy(true);
      };
    };

    initGame();
  }, [setGameInstance]);

  return (
    <div 
      ref={gameContainerRef} 
      className="absolute inset-0"
    />
  );
}

const PhaserGameView = dynamic(() => Promise.resolve(PhaserGameContent), {
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center">Loading game...</div>
});

export function GameView() {
  return <PhaserGameView />;
}
