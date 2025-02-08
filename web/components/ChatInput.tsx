import { useState } from "react"
import { RoButton } from "./ro_button"

export interface ChatInputProps {
  onSubmit: (message: string) => void
  className?: string
}

export function ChatInput({ onSubmit, className }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSubmit(message)
      setMessage("")
    }
  }

  return (
    <div className="flex gap-2 items-center justify-center">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 bg-[#2a2a3a] text-white rounded-lg px-3 font-tiny5 text-sm"
        placeholder="Type your message..."
      />
      <div className="pt-4">
      <RoButton type="submit" variant="chat_send" onClick={handleSubmit}>
        <span className="translate-y-[-10px]">Send</span>
      </RoButton>
      </div>
      
    </div>
  )
} 