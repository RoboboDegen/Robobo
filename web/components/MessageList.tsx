import { useRef, useEffect } from "react"
import Image from "next/image"

interface Message {
  id: number
  text: string
  sender: "user" | "ai"
  timestamp: Date
}

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [scrollRef])

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto pr-4 scrollbar-custom mb-4 pb-4"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#00ffcc #2a2a3a",
      }}
    >
      {messages.map((message) => (
        <div key={message.id} className="flex items-start gap-2 mb-4">
          <Image
            src={
              message.sender === "user"
                ? "/gameui/chat/chatbox_user_icon.png"
                : "/gameui/chat/chatbox_robot_icon.png"
            }
            alt={message.sender}
            width={24}
            height={24}
            className="w-6 h-6 mt-1"
          />
          <div className="flex-1 px-3 py-2 rounded-lg bg-transparent">
            <p className={`text-sm font-pixel ${
              message.sender === "user" ? "text-white" : "text-[#00ffcc]"
            }`}>
              {message.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
} 