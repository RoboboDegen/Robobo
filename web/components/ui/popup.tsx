"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"

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
        className="relative flex flex-col items-center justify-center p-6"
        style={{
          backgroundImage: `url(/gameui/popup/popup_confirmation_default.png)`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          width: "320px",
          height: "200px",
        }}
      >
        <p className="text-center text-white mb-6 font-tiny5">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onConfirm}
            className="w-24 h-10 flex items-center justify-center"
            style={{
              backgroundImage: `url(/gameui/popup/popup_confirmation_yes_btn.png)`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
          >
            <span className="text-black font-tiny5" style={{ marginLeft: "-32px" }}>Yes</span>

          </button>
          <button
            onClick={onCancel}
            className="w-24 h-10 flex items-center justify-center"
            style={{
              backgroundImage: `url(/gameui/popup/popup_confirmation_cancel_btn.png)`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
          >
            <span className="text-black font-tiny5" style={{ marginLeft: "-32px" }}>Cancel</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

