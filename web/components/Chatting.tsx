"use client"

import { useState, useRef, useEffect } from "react"
import { RoButton } from "./ro_button";
import { useGameStore, GameUIState } from "@/hooks/use-game-store";

interface Message {
  id: number
  text: string
  sender: "user" | "ai"
  timestamp: Date
}

export function Chatting() {
  const { setUIState } = useGameStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
      sender: "user",
      timestamp: new Date(),
    },
    {
      id: 2,
      text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
      sender: "user",
      timestamp: new Date(),
    },
    {
      id: 3,
      text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
      sender: "ai",
      timestamp: new Date(),
    },
    {
      id: 4,
      text: "ABCDEFGrgtsgdfthfth123456 S12435536rgrdshththh.",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [scrollRef]) //Fixed unnecessary dependency

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")
  }

  return (
    <div
      className="relative h-screen w-full bg-[#1a1a2e] flex flex-col items-center justify-center"
      style={{
        backgroundImage: `url(/gameui/chat/background_scene.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "402px",
        height: "874px",
      }}
    >
      {/* Back Button */}
      <RoButton variant="chat_back" className="absolute top-4 left-4" onClick={() => setUIState(GameUIState.MAIN_MENU)}>
        Back
      </RoButton>

      {/* Character Frame with Robot */}
      <div className="relative mb-4">
        <img
          src="/gameui/chat/character_frame.png"
          alt="Frame"
          className="w-40 h-40"
        />
        <img
          src="/gameui/mint/robot_test.png"
          alt="Robot"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28"
        />
      </div>

      {/* Chat Panel */}
      <div
        className="relative w-full max-w-md"
        style={{
          backgroundImage: `url(/gameui/chat/chatbox_panel.png)`,
          backgroundSize: "100% 100%",
          padding: "16px",
          height: "550px",
        }}
      >
        {/* Messages Container */}
        <div
          ref={scrollRef}
          className="h-[400px] overflow-y-auto pr-4 scrollbar-custom"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#00ffcc #2a2a3a",
          }}
        >
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-2 mb-4">
              <img
                src={
                  message.sender === "user"
                    ? "/gameui/chat/chatbox_user_icon.png"
                    : "/gameui/chat/chatbox_robot_icon.png"
                }
                alt={message.sender}
                className="w-6 h-6 mt-1"
              />
              <div className="px-3 py-2 rounded-lg max-w-[80%] bg-transparent">
                <p className="text-[#00ffcc] text-sm font-pixel">{message.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="absolute bottom-4 left-4 right-4">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={150}
              className="w-full h-24 bg-transparent border-none outline-none text-[#00ffcc] text-sm resize-none font-pixel"
              placeholder="Type your message..."
            />
            <div className="absolute bottom-2 left-0 text-[#00ffcc] text-xs font-pixel">{input.length}/150</div>
            <RoButton variant="chat_send" className="absolute bottom-2 right-2" onClick={handleSubmit}>
              Send
            </RoButton>
          </div>
        </form>
      </div>
    </div>
  )
}

