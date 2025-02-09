import Image from "next/image"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Message } from "@/types"
import { useEffect, useRef } from "react";


interface MessageListProps {
  displayMessage: Message[];
}

export function MessageList({ displayMessage }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayMessage]);

  return (
    <ScrollArea className="h-[320px] w-full rounded-md">
      <div className="flex flex-col w-full pl-4">
        {displayMessage.map((message, index) => (
          <div key={index} className="flex justify-start items-start gap-1">
            <Image
              src={
                message.sender === "user"
                  ? "/gameui/chat/chatbox_user_icon.png"
                  : "/gameui/chat/chatbox_robot_icon.png"
              }
              alt={message.sender}
              width={24}
              height={24}
              className="mt-1 w-auto h-auto"
            />

            <div className="px-1 py-3">
              <p className={`font-tiny5 text-lg break-words max-w-[200px] ${message.sender === "user" ? "text-white" : "text-[#00ffcc]"
                }`}>
                {message.sender === "user" ? "You" : "AI"}: {message.text}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <ScrollBar
        orientation="vertical"
        scrollbarTrackImage="/gameui/pk/info_scrollbar_track.png"
        scrollbarThumbImage="/gameui/pk/info_scrollbar_thumb.png"
      />
    </ScrollArea>
  )
} 