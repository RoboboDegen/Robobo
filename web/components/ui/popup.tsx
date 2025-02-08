"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"
import { RoButton } from "../ro_button"

interface PopupProps {
  isOpen: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function Popup({ isOpen, message, onConfirm, onCancel }: PopupProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div
        className="relative flex flex-col items-center justify-center p-4 pt-10"
        style={{
          backgroundImage: `url(/gameui/popup/popup_confirmation_default.png)`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          width: "320px",
          height: "200px",
        }}
      >
        <p className="text-center text-white mb-6 font-tiny5">{message}</p>
        <RoButton
            onClick={onConfirm}
            variant="chat_send"
          >
            <p className="pb-3">Yes</p>
          </RoButton>
      </div>


    </div>,

    document.body,
  )
}

