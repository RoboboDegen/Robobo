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
    <div className="">
    <div className="w-full h-full font-tiny5 flex flex-col items-center justify-center">
      {/* Back Button */}
      <div className="flex items-center justify-start w-full mr-4 ">   
      <RoButton 
        variant="chat_back" onClick={handleBack}
      >
        Back
      </RoButton>
      </div>
   
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
      <div className="flex justify-center w-full">
      <div
        className="flex-1 w-[350px] relative"
        style={{
          backgroundImage: `url(/gameui/chat/chatbox_panel.png)`,
          backgroundSize: "100% 100%",
          padding: "50px 30px 40px 20px",
          height: "480px",
        
        }}
      >
        <MessageList messages={messages} />

        
        <div className="w-full h-[10px] bg-[#00FFCC] my-2"/>

        <div className="absolute bottom-6 left-4 right-4">
        <ChatInput onSubmit={handleSubmit} className="w-full" />
      </div>

      </div>
      </div>

    </div>
    </div>
  )
}

