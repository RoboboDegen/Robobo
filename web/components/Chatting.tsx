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
    <div className="flex flex-col items-center justify-between min-h-screen relative py-5">
      {/* Back Button */}
      <div className="flex items-center justify-start w-full">
        <RoButton

          variant="chat_back"
          onClick={handleBack}
        >
          <span className="translate-y-[-13px] translate-x-[-1px] text-[24px]">Back</span>
        </RoButton>
      </div>

      {/* Chat Panel */}
      <div className="flex flex-col justify-between w-full pb-10">
        <div
          className="w-full py-16 px-5 flex flex-col bg-[url('/gameui/chat/chatbox_panel.png')] bg-contain bg-no-repeat items-center justify-center"
        >

          <div>
            <MessageList messages={messages} />
          </div>
          <div className="w-full h-1 bg-[#00FFCC]" />
          <ChatInput onSubmit={handleSubmit} className="w-full self-end" />
        </div>
      </div>

    </div>
  )
}