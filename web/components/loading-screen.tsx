'use client';

import { useEffect, useState } from 'react';
import { GameEventManager } from '@/game/core/event-manager';
import { motion, AnimatePresence } from 'framer-motion';

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const eventManager = GameEventManager.getInstance();

    // 监听加载进度
    const unsubscribeProgress = eventManager.on('ASSET_LOAD_PROGRESS', (data) => {
      setProgress(Math.round(data.progress * 100));
      setIsVisible(true);
    });

    // 监听加载完成
    const unsubscribeComplete = eventManager.on('ASSET_LOAD_COMPLETE', () => {
      setProgress(100);
      // 加载完成后延迟消失
      setTimeout(() => {
        setIsVisible(false);
      }, 500);
    });

    return () => {
      unsubscribeProgress();
      unsubscribeComplete();
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-64 space-y-4">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
            <div className="text-white text-center">
              {progress === 100 ? 'Ready!' : `Loading... ${progress}%`}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 