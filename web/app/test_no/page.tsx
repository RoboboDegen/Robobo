"use client"
import React from 'react';
import { onEvent } from '../../lib/utils';
import { GameEventManager } from '../../game/core/event-manager';

const TestPageWithoutEventPool: React.FC = () => {
    const eventManager = GameEventManager.getInstance();

    // 注册事件监听器
    React.useEffect(() => {
        onEvent('NUMBER_SEQUENCE', (data) => {
            console.log('Number Sequence:', data.sequence);
        });

        onEvent('LETTER_SEQUENCE', (data) => {
            console.log('Letter Sequence:', data.sequence);
        });

        return () => {
            eventManager.clear(); // 清除所有监听器
        };
    }, [eventManager]);

    const handleButtonClick = () => {
        // 直接使用 emit 方法触发事件，不使用事件池
        eventManager.emit('NUMBER_SEQUENCE', { sequence: [1, 2, 3, 4, 5] });
        eventManager.emit('LETTER_SEQUENCE', { sequence: ['a', 'b', 'c', 'd', 'e'] });

    };

    return (
        <div>
            <h1>Event Test Page Without Event Pool</h1>
            <button onClick={handleButtonClick}>Trigger Events</button>
        </div>
    );
};

export default TestPageWithoutEventPool;