"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface PopupContextType {
  isOpen: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
  showPopup: (message: string, onConfirm: () => void, onCancel: () => void) => void
  hidePopup: () => void
}

const PopupContext = createContext<PopupContextType | undefined>(undefined)

export function PopupProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [confirmCallback, setConfirmCallback] = useState<() => void>(() => {})

  const showPopup = (message: string, onConfirm: () => void) => {
    setMessage(message)
    setConfirmCallback(() => onConfirm)
    setIsOpen(true)
  }

  const hidePopup = () => {
    confirmCallback()
    setIsOpen(false)
    setMessage("")
  }

  const handleConfirm = () => {
    hidePopup()
  }

  const value = {
    isOpen,
    message,
    onConfirm: handleConfirm,
    onCancel: hidePopup,
    showPopup,
    hidePopup,
  }

  return <PopupContext.Provider value={value}>{children}</PopupContext.Provider>
}

export const usePopup = () => {
  const context = useContext(PopupContext)
  if (context === undefined) {
    throw new Error("usePopup must be used within a PopupProvider")
  }
  return context
}

