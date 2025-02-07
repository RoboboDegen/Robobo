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
    <div className={`flex gap-2 ${className || ''}`}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 bg-[#2a2a3a] text-white rounded-lg px-3 py-2 font-tiny5 text-sm translate-y-[-15px]"
        placeholder="Type your message..."
      />
      <RoButton type="submit" variant="chat_send" onClick={handleSubmit}>
      <span className="translate-y-[-10px] text-lg">Send</span>
      </RoButton>
    </div>
  )
} 