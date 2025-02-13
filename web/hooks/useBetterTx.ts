'use client'

import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useSignTransaction } from '@mysten/dapp-kit'
import { SuiSignAndExecuteTransactionOutput } from '@mysten/wallet-standard'
import { useState } from 'react'
import { suiClient } from '@/contracts'
import { fromBase64, toBase64 } from '@mysten/sui/utils'
import { CreateSponsoredTransactionApiResponse, SponsorTxRequestBody } from '@/types/sponsorTx'

export type BetterSignAndExecuteTransactionProps<TArgs extends unknown[] = unknown[]> = {
    tx: (...args: TArgs) => Transaction
    waitForTx?: boolean
}

interface TransactionChain {
    beforeExecute: (callback: () => Promise<void>) => TransactionChain
    onSuccess: (callback: (result: SuiSignAndExecuteTransactionOutput | CreateSponsoredTransactionApiResponse | undefined) => void | Promise<void>) => TransactionChain
    onError: (callback: (error: Error) => void) => TransactionChain
    onSettled: (callback: (result: SuiSignAndExecuteTransactionOutput | CreateSponsoredTransactionApiResponse | undefined) => void | Promise<void>) => TransactionChain
    execute: () => Promise<void | CreateSponsoredTransactionApiResponse>
}

export function useBetterSignAndExecuteTransaction<TArgs extends unknown[] = unknown[]>(props: BetterSignAndExecuteTransactionProps<TArgs>) {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
    const [isLoading, setIsLoading] = useState(false)

    const handleSignAndExecuteTransaction = (...args: TArgs): TransactionChain => {
        const tx = props.tx(...args)
        let successCallback: ((result: SuiSignAndExecuteTransactionOutput | undefined ) => void | Promise<void>) | undefined
        let errorCallback: ((error: Error) => void) | undefined
        let settledCallback: ((result: SuiSignAndExecuteTransactionOutput | undefined) => void | Promise<void>) | undefined
        let beforeExecuteCallback: (() => Promise<void>) | undefined
        const chain: TransactionChain = {
            beforeExecute: (callback) => {
                beforeExecuteCallback = callback
                return chain
            },
            onSuccess: (callback) => {
                successCallback = callback
                return chain
            },
            onError: (callback) => {
                errorCallback = callback
                return chain
            },
            onSettled: (callback) => {
                settledCallback = callback
                return chain
            },
            execute: async () => {
                try {
                    if(isLoading) return;
                    setIsLoading(true)
                    await beforeExecuteCallback?.()
                    await signAndExecuteTransaction({ transaction: tx }, {
                    onSuccess: async (result) => {
                        if (props.waitForTx !== false) {
                            await suiClient.waitForTransaction({ digest: result.digest })
                        }
                        await successCallback?.(result)
                    },
                    onError: (error) => {
                        errorCallback?.(error)
                    },
                    onSettled: async (result) => {                       
                        await settledCallback?.(result)
                            setIsLoading(false)
                        }
                    })
                } catch (error) {
                    errorCallback?.(error as Error)
                    setIsLoading(false)
                }
            }
        }

        return chain
    }

    return { handleSignAndExecuteTransaction, isLoading }
}

export type BetterSignAndExecuteTransactionWithSponsorProps<TArgs extends unknown[] = unknown[]> = {
    tx: (...args: TArgs) => Transaction
}

export function useBetterSignAndExecuteTransactionWithSponsor<TArgs extends unknown[] = unknown[]>(props: BetterSignAndExecuteTransactionWithSponsorProps<TArgs>) {
    const { mutateAsync: signTransactionBlock } = useSignTransaction()
    const [isLoading, setIsLoading] = useState(false)

    const handleSignAndExecuteTransactionWithSponsor = (
        network: "mainnet" | "testnet",
        sender: string,
        allowedAddresses?: string[],
        ...args: TArgs
    ): TransactionChain => {
        let successCallback: ((result: CreateSponsoredTransactionApiResponse) => void | Promise<void>) | undefined
        let errorCallback: ((error: Error) => void) | undefined
        let settledCallback: ((result: CreateSponsoredTransactionApiResponse | undefined) => void | Promise<void>) | undefined
        let beforeExecuteCallback: (() => Promise<void>) | undefined

        const chain: TransactionChain = {
            beforeExecute: (callback) => {
                beforeExecuteCallback = callback
                return chain
            },
            onSuccess: (callback) => {
                successCallback = callback
                return chain
            },
            onError: (callback) => {
                errorCallback = callback
                return chain
            },
            onSettled: (callback) => {
                settledCallback = callback
                return chain
            },
            execute: async () => {
                setIsLoading(true)
                try {
                    await beforeExecuteCallback?.()
                    const txInput = props.tx(...args)
                    const txBytesPromise = await txInput.build({
                        client: suiClient,
                        onlyTransactionKind: true,
                    })
                    const txBytes = await toBase64(txBytesPromise)

                    const sponsorTxBody: SponsorTxRequestBody = {
                        network,
                        txBytes,
                        sender,
                        allowedAddresses,
                    }
                    const sponsorResponse = await fetch("/api/sponsored", {
                        method: "POST",
                        body: JSON.stringify(sponsorTxBody),
                    }).then(res => res.json()) as CreateSponsoredTransactionApiResponse

                    const { bytes, digest: sponsorDigest } = sponsorResponse

                    const { signature } = await signTransactionBlock({
                        transaction: Transaction.from(fromBase64(bytes)),
                        chain: `sui:${network}`,
                    })

                    const executeSponsoredTxBody = {
                        digest: sponsorDigest,
                        signature,
                    }

                    const executeSponsoredTxResponse = await fetch("/api/execute", {
                        method: "POST",
                        body: JSON.stringify(executeSponsoredTxBody),
                    }).then(res => res.json()) as CreateSponsoredTransactionApiResponse
                    await suiClient.waitForTransaction({ digest: executeSponsoredTxResponse.digest })
                    await successCallback?.(executeSponsoredTxResponse)
                    await settledCallback?.(executeSponsoredTxResponse)
                    return executeSponsoredTxResponse
                } catch (error) {
                    const typedError = error instanceof Error ? error : new Error(String(error))
                    errorCallback?.(typedError)
                    await settledCallback?.(undefined)
                } finally {
                    setIsLoading(false)
                }
            }
        }

        return chain
    }

    return { handleSignAndExecuteTransactionWithSponsor, isLoading }
}