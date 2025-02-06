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
    console.log(messages);
    const trygetMessage = async () => {
      await getMessage();
    }
    trygetMessage();

    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [scrollRef, getMessage]) //Fixed unnecessary dependency



  return (
    <div className="flex flex-col items-center min-h-screen relative pt-16">
      {/* Back Button */}
      <RoButton 
        variant="chat_back" 
        className="absolute top-2 left-4 flex items-center justify-center" 
        onClick={handleBack}
      >
        <span className="translate-y-[-10px] text-lg">Back</span>
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
        className="flex flex-col relative w-[340px]"
        style={{
          backgroundImage: `url(/gameui/chat/chatbox_panel.png)`,
          backgroundSize: "100% 100%",
          padding: "50px 20px 20px 20px",
          height: "500px",
        }}
      >
        <MessageList messages={messages} />
        <ChatInput onSubmit={handleSubmit} className="mt-[-40px]" />
      </div>
    </div>
  )
}

