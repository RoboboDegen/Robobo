'use client'

import { useState } from 'react'

interface Agent {
  id: string;
  name: string;
  modelProvider: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [newAgentName, setNewAgentName] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState<ChatMessage[]>([])

  // 获取所有agents
  const fetchAgents = async () => {
    const response = await fetch('/api/agent/agents')
    const data = await response.json()
    setAgents(data)
  }

  // 创建新agent
  const createAgent = async () => {
    if (!newAgentName) return

    const response = await fetch('/api/agent/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newAgentName,
        modelProvider: 'openai',
      }),
    })

    if (response.ok) {
      await fetchAgents()
      setNewAgentName('')
    }
  }

  // 发送消息
  const sendMessage = async () => {
    if (!selectedAgent || !message) return

    // 添加用户消息到聊天记录
    setChat([...chat, { role: 'user', content: message }])

    const response = await fetch(`/api/agent/agents/${selectedAgent}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId: 'user',
        roomId: 'default',
      }),
    })

    const data = await response.json()

    if (data.success) {
      // 添加agent回复到聊天记录
      setChat([...chat, { role: 'assistant', content: data.response }])
    }

    setMessage('')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Agent Manager Demo</h1>
        
        {/* 创建新agent */}
        <div className="mb-8">
          <input
            type="text"
            value={newAgentName}
            onChange={(e) => setNewAgentName(e.target.value)}
            placeholder="Enter agent name"
            className="mr-4 p-2 border rounded"
          />
          <button
            onClick={createAgent}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create Agent
          </button>
        </div>

        {/* Agent列表 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Agents</h2>
          <div className="flex flex-wrap gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`p-4 border rounded cursor-pointer ${
                  selectedAgent === agent.id ? 'bg-blue-100' : ''
                }`}
              >
                {agent.name}
              </div>
            ))}
          </div>
        </div>

        {/* 聊天界面 */}
        {selectedAgent && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Chat</h2>
            <div className="border rounded p-4 mb-4 h-[400px] overflow-y-auto">
              {chat.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    msg.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <span
                    className={`inline-block p-2 rounded ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {msg.content}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-l"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded-r"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
