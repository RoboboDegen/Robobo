"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import { RoButton } from "./ro_button";
import { useGameData } from "@/context/GameDataProvider";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList"

export interface ChattingProps {
  handleSubmit: (message: string) => void;
  handleBack: () => void;
}

export function Chatting({ handleSubmit, handleBack }: ChattingProps) {
  const { messages, getMessage } = useGameData();
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { 
    getMessage("0x1234567890123456789012345678901234567890");
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [scrollRef, getMessage]) //Fixed unnecessary dependency



  return (
    <div className="flex flex-col items-center min-h-screen relative pt-16 w-[400px]">
      {/* Back Button */}
      <RoButton 
        variant="chat_back" 
        className="absolute top-2 left-1 flex items-center justify-center" 
        onClick={handleBack}
      >
        <span className="translate-y-[-4.5px] translate-x-[-10px] text-[24px]">Back</span>
      </RoButton>

      {/* Character Frame with Robot */}
      <div className="flex justify-center mb-4">
        <Image
          src="/gameui/chat/character_frame.png"
          alt="Frame"
          width={160}
          height={160}
          className="w-40 h-40"
        />
      </div>

      {/* Chat Panel */}
      <div
        className="flex flex-col relative w-[355px]"
        style={{
          backgroundImage: `url(/gameui/chat/chatbox_panel.png)`,
          backgroundSize: "100% 100%",
          padding: "50px 30px 40px 20px",
          height: "550px",
        }}
      >
        <MessageList messages={messages} />
        
        <ChatInput onSubmit={handleSubmit} className="" />
      </div>
    </div>
  )
}

