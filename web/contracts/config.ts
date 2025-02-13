interface ContractConfig {
    [key: string]: string
}

const testnetConfig: ContractConfig = {
    GameConfig: "0x2fedffa28f31717dce50532e1c2c9636265188be5fb558d28f8b907b02dfd7d8",
    GameState: "0x82ad2133159f89e3010800cdae9680dd59353635abeaa73769b81f0c7bff7a2b",
    TrashTokenCap: "0x8b3500d96b356ed9c58a75fcd8f3c185ef141a4abf9749f915b5a1e4efa2cda3",
    Robot_Pool:"0xb76ab8e32b63077ced83f70b46c7090715b892def588b1c6ec0d7d13497fe8aa",
    TokenPolicy:"0xe895e1a406d10b30233b364c8de96d1575b33886ea96e24c45168758fc71a7f7",
    AdminCap:"0xfbfbc17fdec9f49d0d43bd716d31446155e17db47b9da4c0f6e16959e142ef70",
    Package:"0x5571ac5dcc0dbcd3299d59a51a52beb64d775066430b6ea83a3221474a76054c"
}

const mainnetConfig: ContractConfig = {
    GameConfig: "0x2fedffa28f31717dce50532e1c2c9636265188be5fb558d28f8b907b02dfd7d8",
    GameState: "0x82ad2133159f89e3010800cdae9680dd59353635abeaa73769b81f0c7bff7a2b",
    TrashTokenCap: "0x8b3500d96b356ed9c58a75fcd8f3c185ef141a4abf9749f915b5a1e4efa2cda3",
    Robot_Pool:"0xb76ab8e32b63077ced83f70b46c7090715b892def588b1c6ec0d7d13497fe8aa",
    TokenPolicy:"0xe895e1a406d10b30233b364c8de96d1575b33886ea96e24c45168758fc71a7f7",
    AdminCap:"0xfbfbc17fdec9f49d0d43bd716d31446155e17db47b9da4c0f6e16959e142ef70",
    Package:"0x5571ac5dcc0dbcd3299d59a51a52beb64d775066430b6ea83a3221474a76054c"
}

export function getContractConfig(network: 'testnet' | 'mainnet'): ContractConfig {
    try {
        // Try to load requested network config first
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return network === 'mainnet' ? mainnetConfig : testnetConfig
    } catch (error) {
        // If mainnet config fails, try testnet as fallback
        if (network === 'mainnet') {
            try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                return testnetConfig

            } catch (testnetError) {
                // Return empty object if both configs fail to load
                console.error('Failed to load both mainnet and testnet configs', { cause: testnetError })
                return {}
            }
        }
        // Return empty object if testnet config fails to load
        console.error('Failed to load testnet config', { cause: error })
        return {}
    }
}

