export declare function normalizeBlueBubblesPrivateNetworkAliases<T extends object | undefined>(config: T): T;
export declare function normalizeBlueBubblesAccountsMap<T extends object | undefined>(accounts: Record<string, T> | undefined): Record<string, T> | undefined;
export declare function resolveBlueBubblesPrivateNetworkConfigValue(config: object | null | undefined): boolean | undefined;
export declare function resolveBlueBubblesEffectiveAllowPrivateNetworkFromConfig(params: {
    baseUrl?: string;
    config?: object | null;
}): boolean;
