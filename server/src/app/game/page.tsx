'use client';

import { useState, useEffect } from 'react';
import { RobotData, ElementData, ChatData, RewardData, ChatResponse } from '@/types';
import useSWR from 'swr';

// 添加自定义动画样式
const fadeInKeyframes = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const slideInKeyframes = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

// 创建style元素并添加到head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = fadeInKeyframes + slideInKeyframes;
  document.head.appendChild(style);
}

// 创建获取数据的fetcher函数
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('请求失败');
  }
  return res.json();
};

// 初始化游戏数据
const initializeGame = async () => {
  const isInitialized = localStorage.getItem('game_initialized');
  if (!isInitialized) {
    console.log('首次初始化游戏数据...');
    const initResponse = await fetch('/api/game/init', { method: 'POST' });
    if (initResponse.ok) {
      localStorage.setItem('game_initialized', 'true');
    } else {
      throw new Error('初始化失败');
    }
  }
  return true;
};

export default function GamePage() {
  const [robots, setRobots] = useState<RobotData[]>([]);
  const [selectedRobot, setSelectedRobot] = useState<RobotData | null>(null);
  const [robotElements, setRobotElements] = useState<ElementData[]>([]);
  const [messages, setMessages] = useState<ChatData[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState<{[key: string]: boolean}>({});
  const [isClearing, setIsClearing] = useState(false);
  const [showCreateRobot, setShowCreateRobot] = useState(false);
  const [newRobot, setNewRobot] = useState({
    name: '',
    description: '',
    avatar: '🤖',
    personality: 128
  });
  const [isCreatingRobot, setIsCreatingRobot] = useState(false);

  // 使用 SWR 获取初始化状态
  const { data: isInitialized, error: initError } = useSWR(
    'game-init',
    initializeGame,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // 使用 SWR 获取机器人列表
  const { data: robotsData, error: robotsError } = useSWR(
    isInitialized ? '/api/game/robots' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // 每30秒自动刷新一次
    }
  );

  // 处理错误状态
  if (initError) {
    console.error('初始化失败:', initError);
  }
  if (robotsError) {
    console.error('获取机器人列表失败:', robotsError);
  }

  // 更新robots状态
  useEffect(() => {
    if (robotsData?.robots) {
      console.log('获取到的机器人列表:', robotsData.robots);
      setRobots(robotsData.robots);
    }
  }, [robotsData]);

  // 选择机器人时获取零件和聊天记录
  useEffect(() => {
    if (selectedRobot) {
      const fetchData = async () => {
        try {
          // 获取零件
          const elementsResponse = await fetch(`/api/game/robots/${selectedRobot.id}/elements`);
          if (!elementsResponse.ok) {
            console.error('获取零件列表失败:', await elementsResponse.text());
            return;
          }
          const elementsData = await elementsResponse.json();
          console.log('获取到的零件列表:', elementsData.elements);
          setRobotElements(elementsData.elements);
          
          // 获取聊天记录
          const chatResponse = await fetch(`/api/game/chat/history?robot_uid=${selectedRobot.id}`);
          if (!chatResponse.ok) {
            console.error('获取聊天记录失败:', await chatResponse.text());
            return;
          }
          const chatData = await chatResponse.json();
          console.log('获取到的聊天记录:', chatData.history);
          setMessages(chatData.history);
        } catch (error) {
          console.error('获取机器人数据时出错:', error);
        }
      };
      fetchData();
    }
  }, [selectedRobot]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedRobot || isGenerating) return;

    const tempMessageId = Date.now().toString();
    console.log('发送新消息, ID:', tempMessageId);
    try {
      setIsGenerating(true);
      // 添加用户消息
      const newMessage = {
        id: tempMessageId,
        robotId: selectedRobot.id,
        message: inputMessage,
        reply: '',
        personalityChange: null,
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');

      // 创建 fetch 连接
      console.log('开始发送消息到服务器...');
      const response = await fetch('/api/game/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          robot_uid: selectedRobot.id,
          message: inputMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应');
      }

      let streamedReply = '';
      let rewardsReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        console.log('收到的原始数据块:', chunk);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              console.log('尝试解析的JSON数据:', data);
              const parsed = JSON.parse(data) as ChatResponse;
              
              if (parsed.error) {
                throw new Error(parsed.error);
              }

              // 处理rewards数据
              const rewards = parsed.rewards || [];
              if (rewards.length > 0) {
                console.log('收到奖励数据:', rewards);
                rewardsReceived = true;
                
                // 立即更新消息，包含完整的回复和奖励
                setMessages(prev => prev.map(msg => 
                  msg.id === tempMessageId ? {
                    ...msg,
                    reply: streamedReply,
                    rewards: rewards.map((reward): RewardData => ({
                      id: Date.now().toString(),
                      type: reward.type,
                      amount: reward.amount ?? null,
                      elementId: reward.uid ?? null,
                      claimed: false,
                      robotId: selectedRobot.id
                    }))
                  } : msg
                ));
              }
              
              // 处理personality变化
              const personality = parsed.attribute_changes?.personality;
              if (personality !== undefined) {
                console.log('收到性格值变化:', personality);
                setMessages(prev => prev.map(msg => 
                  msg.id === tempMessageId ? {
                    ...msg,
                    reply: streamedReply,
                    personalityChange: personality
                  } : msg
                ));
              }

              // 处理回复内容
              if (parsed.reply) {
                // 更新流式回复内容
                streamedReply += parsed.reply;
                
                // 立即更新消息列表中的回复
                setMessages(prev => prev.map(msg => 
                  msg.id === tempMessageId ? {
                    ...msg,
                    reply: streamedReply
                  } : msg
                ));
                
                console.log('更新流式消息:', streamedReply);
              }
            } catch (e) {
              console.error('解析SSE数据失败:', e);
            }
          }
        }
      }

      if (!rewardsReceived) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessageId ? {
            ...msg,
            reply: streamedReply
          } : msg
        ));
      }

    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessageId ? {
          ...msg,
          reply: '对不起，发生了错误，请稍后重试。'
        } : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  // 添加清空聊天记录的处理函数
  const handleClearChat = async () => {
    if (!selectedRobot || isClearing) return;
    
    if (!confirm('确定要清空所有聊天记录吗？此操作不可恢复。')) {
      return;
    }

    try {
      setIsClearing(true);
      const response = await fetch(`/api/game/chat/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          robot_uid: selectedRobot.id,
        }),
      });

      if (!response.ok) {
        throw new Error('清空聊天记录失败');
      }

      // 清空本地聊天记录
      setMessages([]);
    } catch (error) {
      console.error('清空聊天记录失败:', error);
      alert('清空聊天记录失败，请稍后重试');
    } finally {
      setIsClearing(false);
    }
  };

  // 添加创建机器人的处理函数
  const handleCreateRobot = async () => {
    if (isCreatingRobot || !newRobot.name || !newRobot.description) return;
    
    try {
      setIsCreatingRobot(true);
      const response = await fetch('/api/game/robots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRobot.name,
          description: newRobot.description,
          avatar: newRobot.avatar,
          personality: newRobot.personality
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '创建机器人失败');
      }

      const data = await response.json();
      if (data.success && data.robot) {
        setRobots(prev => [...prev, data.robot]);
        setShowCreateRobot(false);
        setNewRobot({
          name: '',
          description: '',
          avatar: '🤖',
          personality: 128
        });
      } else {
        throw new Error(data.error || '创建机器人失败');
      }
    } catch (error) {
      console.error('创建机器人失败:', error);
      alert(error instanceof Error ? error.message : '创建机器人失败，请稍后重试');
    } finally {
      setIsCreatingRobot(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex h-screen gap-4">
        {/* 左侧机器人列表 */}
        <div className="w-1/3 border-r pr-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">我的机器人</h1>
            <button
              onClick={() => setShowCreateRobot(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
          <div className="space-y-4">
            {robots.map((robot) => (
              <div
                key={robot.id}
                className={`border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedRobot?.id === robot.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedRobot(robot)}
              >
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">{robot.avatar}</div>
                  <div>
                    <h2 className="text-xl font-semibold">{robot.name}</h2>
                    <p className="text-gray-600">性格值: {robot.personality}</p>
                  </div>
                </div>
              </div>
            ))}
            {/* 添加新机器人卡片 */}
            <div
              className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow hover:border-blue-500 hover:bg-blue-50"
              onClick={() => setShowCreateRobot(true)}
            >
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="text-4xl mb-2">➕</div>
                  <p className="text-gray-600">添加新机器人</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧聊天区域 */}
        {selectedRobot ? (
          <div className="flex-1 flex flex-col">
            {/* 机器人信息 */}
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-4xl mr-4">{selectedRobot.avatar}</div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedRobot.name}</h2>
                    <p className="text-gray-600">{selectedRobot.description}</p>
                  </div>
                </div>
                <button
                  onClick={handleClearChat}
                  disabled={isClearing}
                  className={`px-4 py-2 rounded-lg ${
                    isClearing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white transition-colors`}
                >
                  {isClearing ? '清空中...' : '清空聊天记录'}
                </button>
              </div>
              {/* 零件信息 */}
              <div className="mt-4">
                <h3 className="font-medium mb-2">装配零件:</h3>
                <div className="flex flex-wrap gap-2">
                  {robotElements.map((element) => (
                    <div
                      key={element.id}
                      className="bg-white p-2 rounded shadow-sm"
                    >
                      <div className="font-medium">{element.name}</div>
                      <div className="text-sm text-gray-600">{element.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 聊天记录 */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => {
                console.log('渲染消息:', message);
                // 检查回复中是否包含think标签
                const hasThink = message.reply.includes('<think>') && message.reply.includes('</think>');
                let displayReply = message.reply;
                let thoughtContent = '';
                
                if (hasThink) {
                  const thinkMatch = message.reply.match(/<think>([^]*?)<\/think>/);
                  if (thinkMatch) {
                    thoughtContent = thinkMatch[1].trim();
                    displayReply = message.reply.replace(/<think>[^]*?<\/think>/, '').trim();
                  }
                }

                return (
                  <div key={message.id} className="space-y-2">
                    {/* 用户消息 */}
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white rounded-lg p-3 max-w-[70%]">
                        {message.message}
                      </div>
                    </div>
                    {/* 机器人回复 */}
                    <div className="flex justify-start">
                      <div className="bg-gray-200 rounded-lg p-3 max-w-[70%]">
                        <p>
                          {displayReply}
                          {message.id === messages[messages.length - 1]?.id && isGenerating && (
                            <span className="animate-pulse">▊</span>
                          )}
                        </p>
                        
                        {/* 思考内容折叠部分 */}
                        {hasThink && (
                          <div className="mt-2">
                            <button
                              onClick={() => setExpandedThoughts(prev => ({
                                ...prev,
                                [message.id]: !prev[message.id]
                              }))}
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              {expandedThoughts[message.id] ? (
                                <>
                                  <span>收起思考过程</span>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </>
                              ) : (
                                <>
                                  <span>展开思考过程</span>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </>
                              )}
                            </button>
                            {expandedThoughts[message.id] && (
                              <div className="mt-2 p-3 bg-gray-100 rounded-lg text-sm text-gray-700 border-l-4 border-blue-500 animate-[fadeIn_0.3s_ease-in-out]">
                                {thoughtContent}
                              </div>
                            )}
                          </div>
                        )}

                        {message.rewards && message.rewards.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.rewards.map((reward) => (
                              <div 
                                key={reward.id}
                                className={`
                                  flex items-center p-2 rounded-lg
                                  ${reward.type === 'token' 
                                    ? 'bg-yellow-100 border border-yellow-300' 
                                    : 'bg-blue-100 border border-blue-300'}
                                  transform hover:scale-105 transition-transform
                                  animate-[fadeIn_0.5s_ease-in-out]
                                `}
                              >
                                <span className="text-xl mr-2">
                                  {reward.type === 'token' ? '🪙' : '⚙️'}
                                </span>
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {reward.type === 'token' 
                                      ? `获得 ${reward.amount} 代币` 
                                      : '获得新零件'}
                                  </div>
                                  {!reward.claimed && (
                                    <div className="text-sm text-gray-600">
                                      {reward.type === 'token' 
                                        ? '高质量对话奖励' 
                                        : '稀有零件奖励'}
                                    </div>
                                  )}
                                </div>
                                {!reward.claimed && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white animate-pulse">
                                    新奖励
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {message.personalityChange && (
                          <div className="mt-2 flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 p-2 rounded-lg animate-[slideIn_0.5s_ease-in-out]">
                            <span className="text-xl">
                              {message.personalityChange > 0 ? '📈' : '📉'}
                            </span>
                            <span className="font-medium">
                              性格值变化：
                              <span className={message.personalityChange > 0 ? 'text-green-600' : 'text-red-600'}>
                                {message.personalityChange > 0 ? '+' : ''}
                                {message.personalityChange}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 输入框 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isGenerating && handleSendMessage()}
                className="flex-1 border rounded-lg px-4 py-2"
                placeholder={isGenerating ? "正在生成回复..." : "输入消息..."}
                disabled={isGenerating}
              />
              <button
                onClick={handleSendMessage}
                className={`px-6 py-2 rounded-lg ${
                  isGenerating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
                disabled={isGenerating}
              >
                {isGenerating ? '生成中...' : '发送'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            👈 请选择一个机器人开始聊天
          </div>
        )}

        {/* 创建机器人的浮动窗口 */}
        {showCreateRobot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 animate-[fadeIn_0.3s_ease-in-out]">
              <h2 className="text-2xl font-bold mb-4">创建新机器人</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名称
                  </label>
                  <input
                    type="text"
                    value={newRobot.name}
                    onChange={(e) => setNewRobot(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="给你的机器人起个名字"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    value={newRobot.description}
                    onChange={(e) => setNewRobot(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="描述一下你的机器人"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    头像
                  </label>
                  <div className="flex gap-2">
                    {['🤖', '🦾', '🤔', '🎮', '🎯', '🎲'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewRobot(prev => ({ ...prev, avatar: emoji }))}
                        className={`w-10 h-10 text-xl flex items-center justify-center rounded ${
                          newRobot.avatar === emoji ? 'bg-blue-100 border-2 border-blue-500' : 'border'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    初始性格值 ({newRobot.personality})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={newRobot.personality}
                    onChange={(e) => setNewRobot(prev => ({ ...prev, personality: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setShowCreateRobot(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleCreateRobot}
                    disabled={isCreatingRobot || !newRobot.name || !newRobot.description}
                    className={`flex-1 px-4 py-2 rounded-lg text-white ${
                      isCreatingRobot || !newRobot.name || !newRobot.description
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } transition-colors`}
                  >
                    {isCreatingRobot ? '创建中...' : '创建'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 