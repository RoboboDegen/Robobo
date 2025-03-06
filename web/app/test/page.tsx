"use client"
import React from 'react';
import { triggerEvent, onEvent } from '../../lib/utils';
import { GameEventManager } from '../../game/core/event-manager';

const TestPage: React.FC = () => {
    // 注册事件监听器
    React.useEffect(() => {
        onEvent('NUMBER_SEQUENCE', (data) => {
            const timestamp = new Date().toISOString();
            console.log('Number Sequence:', data.sequence);
            console.log('Number Sequence processed at:', timestamp);

        });

        onEvent('LETTER_SEQUENCE', (data) => {
            console.log('Letter Sequence:', data.sequence);
            console.log('Letter Sequence processed at:', new Date().toISOString());
        });

        return () => {
            // 清除所有监听器
            // Assuming you have a clear function in utils or directly use eventManager.clear()
        };
    }, []);

    const handleButtonClick = () => {
        // 使用事件池添加事件
        triggerEvent('NUMBER_SEQUENCE', { sequence: [1, 2, 3, 4, 5] });
        triggerEvent('LETTER_SEQUENCE', { sequence: ['a', 'b', 'c', 'd', 'e'] });

        // 处理事件池
        const eventManager = GameEventManager.getInstance();
        eventManager.processEventPool();
    };

    return (
        <div>
            <h1>Event Pool Test Page</h1>
            <button onClick={handleButtonClick}>Trigger Events</button>
        </div>
    );
};

export default TestPage;