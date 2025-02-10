import { useState } from "react"
import { RoButton } from "./ro_button"
import { Textarea } from "./ui/textarea"

export interface ChatInputProps {
  onSubmit: (message: string) => void
}

export function ChatInput({ onSubmit }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isGenerating) return

    try {
      setIsGenerating(true)
      await onSubmit(message)
      setMessage("")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex gap-2 items-center justify-center">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="bg-[#2a2a3a] text-white rounded-lg px-3 font-tiny5 text-sm"
        placeholder={isGenerating ? "Generating response..." : "Type your message..."}
        disabled={isGenerating}
      />
      <div className="pt-4">
        <RoButton 
          type="submit" 
          variant="chat_send" 
          onClick={handleSubmit}
          disabled={isGenerating}
        >
          <span className="translate-y-[-10px]">
            {isGenerating ? "Sending..." : "Send"}
          </span>
        </RoButton>
      </div>
    </div>
  )
} 