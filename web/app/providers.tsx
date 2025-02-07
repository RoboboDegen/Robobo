"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit"
import { networkConfig, network } from "@/contracts"
import "@mysten/dapp-kit/dist/index.css"
import { GameDataProvider } from "@/context/GameDataProvider"
import { PopupProvider } from "@/context/PopupProvider"
import { Popup } from "@/components/ui/popup"
import { usePopup } from "@/context/PopupProvider"
import type React from "react" // Added import for React

const queryClient = new QueryClient()

function PopupContainer() {
  const { isOpen, message, onConfirm, onCancel } = usePopup()
  return <Popup isOpen={isOpen} message={message} onConfirm={onConfirm} onCancel={onCancel} />
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={network}>
        <WalletProvider>
          <GameDataProvider>
            <PopupProvider>
              {children}
              <PopupContainer />
            </PopupProvider>
          </GameDataProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}

