"use client"

import { useEffect, useState } from "react"
import { RoButton } from "./ro_button";
import { useGameData } from "@/context/GameDataProvider";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList"
import { SceneEventTypes } from "@/game/core/event-types";
import { triggerEvent } from "@/lib/utils";



export interface ChattingProps {
  handleBack: () => void;
}


export function Chatting({ handleBack }: ChattingProps) {
  const { setMessage, messages, getMessage } = useGameData();

  useEffect(() => {
    getMessage("1");
  }, []);


  const handleSubmit = (message: string) => {
    const newMessage = {
      id: 0,
      text: message,
      sender: "user" as "user" | "ai",
    };
    setMessage(newMessage);

  };

  return (
    <div className="flex flex-col w-full items-center justify-between h-full relative py-5">

      {/* Back Button */}
      <div className="flex items-center justify-start w-full">
        <RoButton variant="chat_back" onClick={handleBack}>
          <span className="text-[24px]">Back</span>
        </RoButton>
      </div>
      {/* Chat Panel */}
      <div className="flex flex-col justify-between w-full">
        <div
          className="pt-16 px-5 w-full flex flex-col bg-[url('/gameui/chat/chatbox_panel.png')] bg-contain bg-center bg-no-repeat items-center justify-center"
        >
          <div className="flex items-start justify-center w-full">
            <MessageList displayMessage={messages} />
          </div>
          <div className="mb-10">
            <ChatInput onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  )
}