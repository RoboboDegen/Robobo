import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { getContractConfig } from "./config";

type NetworkVariables = ReturnType<typeof useNetworkVariables>;

function getNetworkVariables(network: Network) {
    return networkConfig[network].variables;
}

function createBetterTxFactory<T extends Record<string, unknown>>(
    fn: (tx: Transaction, networkVariables: NetworkVariables, params: T) => Transaction
) {
    return (params: T) => {
        const tx = new Transaction();
        const networkVariables = getNetworkVariables(network);
        return fn(tx, networkVariables, params);
    };
}

type Network = "mainnet" | "testnet"

const network = (process.env.NEXT_PUBLIC_NETWORK as Network) || "testnet";

const { networkConfig, useNetworkVariables } = createNetworkConfig({
    testnet: {
        url: getFullnodeUrl("testnet"),
        variables: {
            GameConfig: "0xb7c3a0692b9b590980ef4f48a767b3f0a4ebdf4d7cdfca13169b3a0e985b40d8",
            GameState: "0x138e84e29ccdae8271f5ef8cecac0fae161d546f7a3bf40c24de3e8bae57c34e",
            TrashTokenCap: "0x199e672f7630e61ed73ce7c8c8f81cd94a5b6ae32805d9fa6405c83d19b50fb5",
            Robot_Pool: "0x712d4e79b31694e0142bec51dac74a2fbdd632a97605c81848a359de128f3dc9",
            TokenPolicy: "0x805c1c22632f5f943ff8531f812b4e9ac4021707e2d188174c19486bdc5e2b20",
            AdminCap: "0xe7231bdd3aa0156d214c4341c9cf95f9670ca731cceac0f4f5d38305b865fdbd",
            Package: "0xfb0637cb83689c3a95ebaf9590207c4efd6369c0c462a9780a499cc3eecded7d"
        }
    },
    mainnet: {
        url: getFullnodeUrl("mainnet"),
        variables: getContractConfig("mainnet"),
    }
});

// 创建全局 SuiClient 实例
const suiClient = new SuiClient({ url: networkConfig[network].url });

export { getNetworkVariables, networkConfig, network, suiClient, createBetterTxFactory, useNetworkVariables };
export type { NetworkVariables };

