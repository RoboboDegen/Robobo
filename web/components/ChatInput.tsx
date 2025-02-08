import { useState } from "react"
import { RoButton } from "./ro_button"
import { Textarea } from "./ui/textarea"

export interface ChatInputProps {
  onSubmit: (message: string) => void
}

export function ChatInput({ onSubmit}: ChatInputProps) {
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
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="bg-[#2a2a3a] text-white rounded-lg px-3 font-tiny5 text-sm"
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